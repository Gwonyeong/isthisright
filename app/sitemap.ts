import { MetadataRoute } from "next";
import { ContentSummary } from "@/lib/types";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

async function getContents(): Promise<ContentSummary[]> {
  try {
    const contents = await prisma.contents.findMany({
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
        created_at: content.created_at.toISOString(),
        updated_at: content.updated_at.toISOString(),
      };
    });

    return contentsWithStats;
  } catch (error) {
    console.error("Error fetching contents for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // 정적 페이지들
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
  ];

  // 동적 콘텐츠 페이지들
  const contents = await getContents();
  const contentPages = contents.map((content: ContentSummary) => ({
    url: `${baseUrl}/contents/${content.id}`,
    lastModified: new Date(content.updated_at || content.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...contentPages];
}
