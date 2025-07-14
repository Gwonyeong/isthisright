import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = parseInt(params.id);

    if (isNaN(contentId)) {
      return NextResponse.json(
        { error: "유효하지 않은 콘텐츠 ID입니다." },
        { status: 400 }
      );
    }

    // 조회수 증가
    await prisma.contents.update({
      where: { id: contentId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // 콘텐츠와 관련 데이터 조회
    const content = await prisma.contents.findUnique({
      where: {
        id: contentId,
        status: "PUBLISHED", // 게시된 콘텐츠만
      },
      include: {
        votes: true,
        comments: {
          where: {
            status: "ACTIVE", // 정상 댓글만
          },
          include: {
            replies: {
              where: {
                status: "ACTIVE", // 정상 대댓글만
              },
            },
            likes: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "콘텐츠를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 투표 통계 계산
    const agreeVotes = content.votes.filter(
      (vote) => vote.vote_type === "AGREE"
    ).length;
    const disagreeVotes = content.votes.filter(
      (vote) => vote.vote_type === "DISAGREE"
    ).length;
    const totalVotes = agreeVotes + disagreeVotes;
    const agreePercentage =
      totalVotes > 0 ? Math.round((agreeVotes / totalVotes) * 100) : 0;

    // 댓글 데이터 가공
    const commentsWithStats = content.comments.map((comment) => ({
      id: comment.id,
      authorName: comment.author_name,
      content: comment.content,
      userVote: comment.user_vote,
      likesCount: comment.likes.length,
      repliesCount: comment.replies.length,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        authorName: reply.author_name,
        content: reply.content,
        userVote: reply.user_vote,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at,
      })),
    }));

    const responseData = {
      id: content.id,
      title: content.title,
      description: content.description,
      youtubeUrl: content.youtube_url,
      youtubeVideoId: content.youtube_video_id,
      thumbnailUrl: content.thumbnail_url,
      isShorts: content.is_shorts,
      views: content.views,
      votes: {
        agree: agreeVotes,
        disagree: disagreeVotes,
        total: totalVotes,
        agreePercentage,
      },
      comments: commentsWithStats,
      createdAt: content.created_at,
      updatedAt: content.updated_at,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Content fetch error:", error);
    return NextResponse.json(
      { error: "콘텐츠를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
