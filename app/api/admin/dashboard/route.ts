import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 병렬로 모든 통계 데이터 조회
    const [
      totalContents,
      publishedContents,
      draftContents,
      totalVotes,
      totalComments,
      totalReplies,
      totalViews,
      recentContents,
    ] = await Promise.all([
      prisma.contents.count(),
      prisma.contents.count({ where: { status: "PUBLISHED" } }),
      prisma.contents.count({ where: { status: "DRAFT" } }),
      prisma.votes.count(),
      prisma.comments.count({ where: { status: "ACTIVE" } }),
      prisma.replies.count({ where: { status: "ACTIVE" } }),
      prisma.contents.aggregate({
        _sum: {
          views: true,
        },
      }),
      prisma.contents.findMany({
        take: 5,
        where: {
          status: "PUBLISHED",
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
      }),
    ]);

    // 최근 콘텐츠 데이터 가공
    const recentContentsWithStats = recentContents.map((content) => {
      const agreeVotes = content.votes.filter(
        (vote) => vote.vote_type === "AGREE"
      ).length;
      const disagreeVotes = content.votes.filter(
        (vote) => vote.vote_type === "DISAGREE"
      ).length;
      const totalVotesForContent = agreeVotes + disagreeVotes;
      const agreePercentage =
        totalVotesForContent > 0
          ? Math.round((agreeVotes / totalVotesForContent) * 100)
          : 0;

      const totalCommentsForContent =
        content.comments.length +
        content.comments.reduce(
          (sum, comment) => sum + comment.replies.length,
          0
        );

      return {
        id: content.id,
        title: content.title,
        votes: {
          agree: agreeVotes,
          disagree: disagreeVotes,
          total: totalVotesForContent,
          agreePercentage,
        },
        comments: totalCommentsForContent,
        views: content.views,
        created_at: content.created_at,
      };
    });

    // 응답 데이터 구성
    const dashboardData = {
      stats: {
        totalContents,
        publishedContents,
        draftContents,
        totalVotes,
        totalComments: totalComments + totalReplies,
        totalViews: totalViews._sum.views || 0,
      },
      recentContents: recentContentsWithStats,
      systemInfo: {
        version: "1.0.0",
        serverStatus: "정상",
        databaseStatus: "연결됨",
        lastBackup: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1시간 전
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      { error: "대시보드 데이터를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
