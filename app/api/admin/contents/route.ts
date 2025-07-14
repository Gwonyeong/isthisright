import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractYouTubeVideoId, isYouTubeShorts } from "@/lib/admin-auth";

// 관리자 콘텐츠 목록 조회
export async function GET() {
  try {
    const contents = await prisma.contents.findMany({
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
        youtube_url: content.youtube_url,
        youtube_video_id: content.youtube_video_id,
        thumbnail_url: content.thumbnail_url,
        is_shorts: content.is_shorts,
        status: content.status,
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
    console.error("Admin contents fetch error:", error);
    return NextResponse.json(
      { error: "콘텐츠를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 새 콘텐츠 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, youtubeUrl, status = "DRAFT" } = body;

    // 요청 검증
    if (!title || !description || !youtubeUrl) {
      return NextResponse.json(
        { error: "제목, 설명, YouTube URL이 필요합니다." },
        { status: 400 }
      );
    }

    if (title.trim().length > 200) {
      return NextResponse.json(
        { error: "제목은 200자 이내로 입력해주세요." },
        { status: 400 }
      );
    }

    if (description.trim().length > 1000) {
      return NextResponse.json(
        { error: "설명은 1000자 이내로 입력해주세요." },
        { status: 400 }
      );
    }

    // YouTube URL 처리
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "올바른 YouTube URL을 입력해주세요." },
        { status: 400 }
      );
    }

    const isShorts = isYouTubeShorts(youtubeUrl);

    // 썸네일 URL 생성
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // 콘텐츠 생성
    const content = await prisma.contents.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        youtube_url: youtubeUrl,
        youtube_video_id: videoId,
        thumbnail_url: thumbnailUrl,
        is_shorts: isShorts,
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      },
    });

    return NextResponse.json({
      success: true,
      content: {
        id: content.id,
        title: content.title,
        description: content.description,
        youtube_url: content.youtube_url,
        youtube_video_id: content.youtube_video_id,
        thumbnail_url: content.thumbnail_url,
        is_shorts: content.is_shorts,
        status: content.status,
        views: content.views,
        created_at: content.created_at,
        updated_at: content.updated_at,
      },
    });
  } catch (error) {
    console.error("Content creation error:", error);
    return NextResponse.json(
      { error: "콘텐츠 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
