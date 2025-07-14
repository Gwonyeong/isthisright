import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { authorName, content, userVote } = body;
    const commentId = parseInt(params.id);

    // 요청 검증
    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: "유효하지 않은 댓글 ID입니다." },
        { status: 400 }
      );
    }

    if (!authorName || !content || !userVote) {
      return NextResponse.json(
        { error: "모든 필드가 필요합니다." },
        { status: 400 }
      );
    }

    if (userVote !== "AGREE" && userVote !== "DISAGREE") {
      return NextResponse.json(
        { error: "올바르지 않은 투표 타입입니다." },
        { status: 400 }
      );
    }

    if (authorName.trim().length < 2 || authorName.trim().length > 20) {
      return NextResponse.json(
        { error: "닉네임은 2-20자 사이로 입력해주세요." },
        { status: 400 }
      );
    }

    if (content.trim().length < 5 || content.trim().length > 300) {
      return NextResponse.json(
        { error: "대댓글은 5-300자 사이로 입력해주세요." },
        { status: 400 }
      );
    }

    // IP 주소 가져오기
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(/, /)[0]
      : request.ip || request.headers.get("x-real-ip") || "127.0.0.1";

    // 댓글 존재 확인
    const parentComment = await prisma.comments.findUnique({
      where: {
        id: commentId,
        status: "ACTIVE",
      },
      include: {
        content_ref: true,
      },
    });

    if (!parentComment) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 사용자의 투표 확인 (투표한 사용자만 댓글 작성 가능)
    const userVoteRecord = await prisma.votes.findUnique({
      where: {
        content_id_ip_address: {
          content_id: parentComment.content_id,
          ip_address: ip,
        },
      },
    });

    if (!userVoteRecord) {
      return NextResponse.json(
        { error: "투표를 먼저 해주세요." },
        { status: 403 }
      );
    }

    // 대댓글 생성
    const reply = await prisma.replies.create({
      data: {
        comment_id: commentId,
        author_name: authorName.trim(),
        content: content.trim(),
        user_vote: userVote,
        ip_address: ip,
      },
    });

    return NextResponse.json({
      success: true,
      reply: {
        id: reply.id,
        authorName: reply.author_name,
        content: reply.content,
        userVote: reply.user_vote,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at,
      },
    });
  } catch (error) {
    console.error("Reply creation error:", error);
    return NextResponse.json(
      { error: "대댓글 작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
