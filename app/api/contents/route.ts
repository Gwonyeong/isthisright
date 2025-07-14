import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contents = await prisma.contents.findMany({
      where: {
        status: "PUBLISHED", // 게시된 콘텐츠만 조회
      },
      include: {
        votes: true,
        comments: {
          include: {
            replies: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // 각 콘텐츠의 통계 계산
    const contentsWithStats = contents.map((content) => {
      const agreeVotes = content.votes.filter(
        (vote) => vote.vote_type === "AGREE"
      ).length;
      const disagreeVotes = content.votes.filter(
        (vote) => vote.vote_type === "DISAGREE"
      ).length;
      const totalVotes = agreeVotes + disagreeVotes;
      const agreePercentage =
        totalVotes > 0 ? Math.round((agreeVotes / totalVotes) * 100) : 0;

      const totalComments =
        content.comments.length +
        content.comments.reduce(
          (sum, comment) => sum + comment.replies.length,
          0
        );

      return {
        id: content.id,
        title: content.title,
        description: content.description,
        youtube_video_id: content.youtube_video_id,
        thumbnail_url: content.thumbnail_url,
        is_shorts: content.is_shorts,
        views: content.views,
        votes: {
          agree: agreeVotes,
          disagree: disagreeVotes,
          total: totalVotes,
          agreePercentage,
        },
        comments: totalComments,
        created_at: content.created_at,
        updated_at: content.updated_at,
      };
    });

    return NextResponse.json(contentsWithStats);
  } catch (error) {
    console.error("Contents fetch error:", error);
    return NextResponse.json(
      { error: "콘텐츠를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
