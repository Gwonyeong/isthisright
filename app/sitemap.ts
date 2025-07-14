import { MetadataRoute } from "next";
import { ContentSummary } from "@/lib/types";

async function getContents(): Promise<ContentSummary[]> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/contents`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    return await response.json();
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
