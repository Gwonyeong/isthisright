import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET() {
  try {
    // 모든 댓글과 대댓글을 하나의 리스트로 가져오기
    const [comments, replies] = await Promise.all([
      prisma.comments.findMany({
        include: {
          content_ref: {
            select: {
              id: true,
              title: true,
            },
          },
          likes: true,
          replies: true,
        },
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.replies.findMany({
        include: {
          comment: {
            include: {
              content_ref: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      }),
    ]);

    // 댓글 데이터 가공
    const commentsData = comments.map((comment) => ({
      id: comment.id,
      contentId: comment.content_id,
      contentTitle: comment.content_ref.title,
      authorName: comment.author_name,
      content: comment.content,
      userVote: comment.user_vote,
      likesCount: comment.likes.length,
      repliesCount: comment.replies.length,
      createdAt: comment.created_at,
      type: "comment",
      status: comment.status,
    }));

    // 대댓글 데이터 가공
    const repliesData = replies.map((reply) => ({
      id: reply.id,
      contentId: reply.comment.content_id,
      contentTitle: reply.comment.content_ref.title,
      authorName: reply.author_name,
      content: reply.content,
      userVote: reply.user_vote,
      likesCount: 0, // 대댓글은 추천 없음
      repliesCount: 0,
      createdAt: reply.created_at,
      type: "reply",
      status: reply.status,
      parentId: reply.comment_id,
    }));

    // 댓글과 대댓글을 합치고 시간순 정렬
    const allComments = [...commentsData, ...repliesData].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(allComments);
  } catch (error) {
    console.error("Admin comments fetch error:", error);
    return NextResponse.json(
      { error: "댓글을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status, type } = await request.json();

    if (type === "comment") {
      await prisma.comments.update({
        where: { id: parseInt(id) },
        data: { status },
      });
    } else if (type === "reply") {
      await prisma.replies.update({
        where: { id: parseInt(id) },
        data: { status },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update comment status error:", error);
    return NextResponse.json(
      { error: "상태 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, type } = await request.json();

    if (type === "comment") {
      await prisma.comments.delete({
        where: { id: parseInt(id) },
      });
    } else if (type === "reply") {
      await prisma.replies.delete({
        where: { id: parseInt(id) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
