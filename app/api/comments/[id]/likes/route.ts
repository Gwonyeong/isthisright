import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = parseInt(params.id);

    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: "유효하지 않은 댓글 ID입니다." },
        { status: 400 }
      );
    }

    // IP 주소 가져오기
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(/, /)[0]
      : request.ip || request.headers.get("x-real-ip") || "127.0.0.1";

    // 댓글 존재 확인
    const comment = await prisma.comments.findUnique({
      where: {
        id: commentId,
        status: "ACTIVE",
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기존 추천 확인
    const existingLike = await prisma.likes.findUnique({
      where: {
        comment_id_ip_address: {
          comment_id: commentId,
          ip_address: ip,
        },
      },
    });

    let action: "liked" | "unliked";

    if (existingLike) {
      // 추천 취소
      await prisma.likes.delete({
        where: {
          id: existingLike.id,
        },
      });
      action = "unliked";
    } else {
      // 새로운 추천
      await prisma.likes.create({
        data: {
          comment_id: commentId,
          ip_address: ip,
        },
      });
      action = "liked";
    }

    // 업데이트된 추천 수 조회
    const likesCount = await prisma.likes.count({
      where: {
        comment_id: commentId,
      },
    });

    return NextResponse.json({
      success: true,
      action,
      likesCount,
      isLiked: action === "liked",
    });
  } catch (error) {
    console.error("Comment like error:", error);
    return NextResponse.json(
      { error: "추천 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
