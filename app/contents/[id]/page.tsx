import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientContentPage from "@/components/ClientContentPage";
import { ContentDetail } from "@/lib/types";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

type Props = {
  params: { id: string };
};

// 서버에서 콘텐츠 데이터 가져오기
async function getContentData(id: number): Promise<ContentDetail | null> {
  try {
    // 조회수 증가
    await prisma.contents.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // 콘텐츠와 관련 데이터 조회
    const content = await prisma.contents.findUnique({
      where: {
        id,
        status: "PUBLISHED",
      },
      include: {
        votes: true,
        comments: {
          where: {
            status: "ACTIVE",
          },
          include: {
            replies: {
              where: {
                status: "ACTIVE",
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
      return null;
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
      createdAt: comment.created_at.toISOString(),
      updatedAt: comment.updated_at.toISOString(),
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        authorName: reply.author_name,
        content: reply.content,
        userVote: reply.user_vote,
        createdAt: reply.created_at.toISOString(),
        updatedAt: reply.updated_at.toISOString(),
      })),
    }));

    return {
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
      createdAt: content.created_at.toISOString(),
      updatedAt: content.updated_at.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching content:", error);
    return null;
  }
}

// 동적 메타 태그 생성
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const contentId = parseInt(params.id);

  if (isNaN(contentId)) {
    return {
      title: "콘텐츠를 찾을 수 없습니다",
    };
  }

  const content = await getContentData(contentId);

  if (!content) {
    return {
      title: "콘텐츠를 찾을 수 없습니다",
    };
  }

  const title = `${content.title}`;
  const description = content.description
    ? `${content.description.substring(0, 150)}${
        content.description.length > 150 ? "..." : ""
      }`
    : `"${content.title}"에 대한 여러분의 의견을 들려주세요. 찬성 ${content.votes.agree}표, 반대 ${content.votes.disagree}표`;

  return {
    title,
    description,
    keywords: [
      "토론",
      "영상",
      content.title,
      "찬반",
      "의견",
      content.isShorts ? "쇼츠" : "영상",
      "넷플릭스",
      "유튜브",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: `/contents/${content.id}`,
      images: [
        {
          url:
            content.thumbnailUrl ||
            `https://img.youtube.com/vi/${content.youtubeVideoId}/maxresdefault.jpg`,
          width: 1280,
          height: 720,
          alt: content.title,
        },
      ],
      publishedTime: content.createdAt,
      modifiedTime: content.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        content.thumbnailUrl ||
          `https://img.youtube.com/vi/${content.youtubeVideoId}/maxresdefault.jpg`,
      ],
    },
    alternates: {
      canonical: `/contents/${content.id}`,
    },
  };
}

export default async function ContentDetailPage({ params }: Props) {
  const contentId = parseInt(params.id);

  if (isNaN(contentId)) {
    notFound();
  }

  const content = await getContentData(contentId);

  if (!content) {
    notFound();
  }

  // 구조화된 데이터 생성
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "@id": `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/contents/${content.id}`,
    headline: content.title,
    description: content.description,
    url: `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/contents/${content.id}`,
    datePublished: content.createdAt,
    dateModified: content.updatedAt,
    author: {
      "@type": "Organization",
      name: "이게 맞아? 팀",
      url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    },
    publisher: {
      "@type": "Organization",
      name: "이게 맞아?",
      url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    },
    mainEntity: {
      "@type": "VideoObject",
      name: content.title,
      description: content.description,
      thumbnailUrl: content.thumbnailUrl,
      embedUrl: `https://www.youtube.com/embed/${content.youtubeVideoId}`,
      uploadDate: content.createdAt,
      duration: "PT0M0S", // 실제 영상 길이를 알 수 없으므로 기본값
      contentUrl: `https://www.youtube.com/watch?v=${content.youtubeVideoId}`,
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/VoteAction",
        userInteractionCount: content.votes.total,
        description: `찬성 ${content.votes.agree}표, 반대 ${content.votes.disagree}표`,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: content.comments.length,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: content.views,
      },
    ],
    comment: content.comments
      .map((comment) => ({
        "@type": "Comment",
        text: comment.content,
        author: {
          "@type": "Person",
          name: comment.authorName,
        },
        dateCreated: comment.createdAt,
        interactionStatistic: {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: comment.likesCount,
        },
      }))
      .slice(0, 10), // 최대 10개 댓글만 포함
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

        {/* 서버에서 렌더링된 기본 콘텐츠 정보 */}
        <section className="py-8 bg-gray-900">
          <div className="container max-w-4xl px-4">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {content.title}
              </h1>
              {content.description && (
                <p className="text-gray-300 leading-relaxed">
                  {content.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                <span>👀 {content.views.toLocaleString()} 조회수</span>
                <span>🗳️ {content.votes.total} 투표</span>
                <span>💬 {content.comments.length} 댓글</span>
                <span>{content.isShorts ? "📱 쇼츠" : "🎬 영상"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 클라이언트 사이드 인터랙티브 컴포넌트 */}
        <ClientContentPage initialContent={content} />

        <Footer />
      </div>
    </>
  );
}
