import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, authorName, content, userVote } = body;

    // 요청 검증
    if (!contentId || !authorName || !content || !userVote) {
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

    if (content.trim().length < 10 || content.trim().length > 500) {
      return NextResponse.json(
        { error: "댓글은 10-500자 사이로 입력해주세요." },
        { status: 400 }
      );
    }

    // IP 주소 가져오기
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(/, /)[0]
      : request.ip || request.headers.get("x-real-ip") || "127.0.0.1";

    // 콘텐츠 존재 확인
    const contentExists = await prisma.contents.findUnique({
      where: {
        id: parseInt(contentId),
        status: "PUBLISHED",
      },
    });

    if (!contentExists) {
      return NextResponse.json(
        { error: "콘텐츠를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 사용자의 투표 확인 (투표한 사용자만 댓글 작성 가능)
    const userVoteRecord = await prisma.votes.findUnique({
      where: {
        content_id_ip_address: {
          content_id: parseInt(contentId),
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

    // 댓글 생성
    const comment = await prisma.comments.create({
      data: {
        content_id: parseInt(contentId),
        author_name: authorName.trim(),
        content: content.trim(),
        user_vote: userVote,
        ip_address: ip,
      },
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        authorName: comment.author_name,
        content: comment.content,
        userVote: comment.user_vote,
        likesCount: 0,
        repliesCount: 0,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        replies: [],
      },
    });
  } catch (error) {
    console.error("Comment creation error:", error);
    return NextResponse.json(
      { error: "댓글 작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
