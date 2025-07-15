import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ContentCard from "@/components/ContentCard";
import CoupangAd from "@/components/CoupangAd";
import { ContentSummary } from "@/lib/types";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "영상 속 상황 토론 플랫폼",
  description:
    "넷플릭스, 유튜브, 드라마 속 다양한 상황들에 대해 찬반 의견을 나누는 토론 플랫폼입니다. 여러분의 의견을 들려주세요!",
  keywords: [
    "토론",
    "영상",
    "넷플릭스",
    "유튜브",
    "드라마",
    "영화",
    "찬반",
    "의견",
    "토론 플랫폼",
    "오징어 게임",
    "킹덤",
  ],
  openGraph: {
    title: "이게 맞아? - 영상 속 상황 토론 플랫폼",
    description:
      "넷플릭스, 유튜브, 드라마 속 다양한 상황들에 대해 찬반 의견을 나누는 토론 플랫폼입니다.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "이게 맞아? - 영상 속 상황 토론 플랫폼",
    description:
      "넷플릭스, 유튜브, 드라마 속 다양한 상황들에 대해 찬반 의견을 나누는 토론 플랫폼입니다.",
  },
  alternates: {
    canonical: "/",
  },
};

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
    console.error("Error fetching contents:", error);
    return [];
  }
}

export default async function Home() {
  const contents = await getContents();

  // 구조화된 데이터 생성
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "이게 맞아?",
    description:
      "넷플릭스, 유튜브, 드라마 속 상황들에 대해 찬반 의견을 나누는 토론 플랫폼",
    url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: contents.length,
      itemListElement: contents.map((content, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "DiscussionForumPosting",
          "@id": `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/contents/${content.id}`,
          name: content.title,
          description: content.description,
          url: `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/contents/${content.id}`,
          datePublished: content.created_at,
          interactionStatistic: [
            {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/VoteAction",
              userInteractionCount: content.votes.total,
            },
            {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/CommentAction",
              userInteractionCount: content.comments,
            },
            {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/ViewAction",
              userInteractionCount: content.views,
            },
          ],
          mainEntity: {
            "@type": "VideoObject",
            name: content.title,
            description: content.description,
            thumbnailUrl: content.thumbnail_url,
            embedUrl: `https://www.youtube.com/embed/${content.youtube_video_id}`,
            uploadDate: content.created_at,
          },
        },
      })),
    },
  };

  return (
    <>
      {/* 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="min-h-screen bg-gray-900">
        <Header />
        <HeroSection />

        {/* Content List Section */}
        <section className="py-16 bg-gray-900">
          <div className="container max-w-screen-2xl px-4">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-4">토론 주제</h1>
              <p className="text-gray-300">
                다양한 영상 콘텐츠 속 상황들에 대해 의견을 나누어보세요
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700">
                  🎬 일반 영상
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-700">
                  📱 쇼츠 영상
                </span>
              </div>
            </div>

            {contents.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {contents.map((content, index) => {
                  const items = [];
                  
                  items.push(
                    <ContentCard
                      key={content.id}
                      id={content.id}
                      title={content.title}
                      description={content.description || ""}
                      thumbnailUrl={
                        content.thumbnail_url ||
                        `https://img.youtube.com/vi/${content.youtube_video_id}/hqdefault.jpg`
                      }
                      agreeCount={content.votes.agree}
                      disagreeCount={content.votes.disagree}
                      commentCount={content.comments}
                      createdAt={content.created_at}
                      isShorts={content.is_shorts}
                    />
                  );

                  // 4개마다 광고 삽입 (5번째, 9번째, 13번째...)
                  if ((index + 1) % 4 === 0 && index < contents.length - 1) {
                    items.push(
                      <CoupangAd
                        key={`ad-${index}`}
                        variant="card"
                        className="w-full"
                      />
                    );
                  }

                  return items;
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  🔍 아직 토론 주제가 없습니다
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  관리자가 새로운 콘텐츠를 추가하면 여기에 표시됩니다
                </p>
              </div>
            )}

            {/* 통계 정보 */}
            {contents.length > 0 && (
              <div className="mt-12 flex justify-center">
                <div className="bg-gray-800 rounded-lg p-6 max-w-md">
                  <h2 className="text-white font-semibold mb-4 text-center">
                    📊 현재 통계
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {contents.length}
                      </div>
                      <div className="text-gray-400">토론 주제</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {contents.reduce((sum, c) => sum + c.votes.total, 0)}
                      </div>
                      <div className="text-gray-400">총 투표</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {contents.reduce((sum, c) => sum + c.comments, 0)}
                      </div>
                      <div className="text-gray-400">총 댓글</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {contents
                          .reduce((sum, c) => sum + c.views, 0)
                          .toLocaleString()}
                      </div>
                      <div className="text-gray-400">총 조회수</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 하단 배너 광고 */}
        <section className="py-8 bg-gray-900">
          <div className="container max-w-screen-xl px-4">
            <CoupangAd variant="banner" className="w-full" />
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
