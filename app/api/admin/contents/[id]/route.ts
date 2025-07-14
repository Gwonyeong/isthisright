import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractYouTubeVideoId, isYouTubeShorts } from "@/lib/admin-auth";

export const runtime = 'nodejs';

// 특정 콘텐츠 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = parseInt(params.id);

    if (isNaN(contentId)) {
      return NextResponse.json(
        { error: "잘못된 콘텐츠 ID입니다." },
        { status: 400 }
      );
    }

    const content = await prisma.contents.findUnique({
      where: { id: contentId },
      include: {
        votes: true,
        comments: {
          include: {
            replies: true,
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

    const totalComments =
      content.comments.length +
      content.comments.reduce(
        (sum, comment) => sum + comment.replies.length,
        0
      );

    const contentData = {
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

    return NextResponse.json(contentData);
  } catch (error) {
    console.error("Content fetch error:", error);
    return NextResponse.json(
      { error: "콘텐츠를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 콘텐츠 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = parseInt(params.id);

    if (isNaN(contentId)) {
      return NextResponse.json(
        { error: "잘못된 콘텐츠 ID입니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, youtubeUrl, status } = body;

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

    // 콘텐츠 존재 확인
    const existingContent = await prisma.contents.findUnique({
      where: { id: contentId },
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: "콘텐츠를 찾을 수 없습니다." },
        { status: 404 }
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

    // 콘텐츠 업데이트
    const updatedContent = await prisma.contents.update({
      where: { id: contentId },
      data: {
        title: title.trim(),
        description: description.trim(),
        youtube_url: youtubeUrl,
        youtube_video_id: videoId,
        thumbnail_url: thumbnailUrl,
        is_shorts: isShorts,
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      content: {
        id: updatedContent.id,
        title: updatedContent.title,
        description: updatedContent.description,
        youtube_url: updatedContent.youtube_url,
        youtube_video_id: updatedContent.youtube_video_id,
        thumbnail_url: updatedContent.thumbnail_url,
        is_shorts: updatedContent.is_shorts,
        status: updatedContent.status,
        views: updatedContent.views,
        created_at: updatedContent.created_at,
        updated_at: updatedContent.updated_at,
      },
    });
  } catch (error) {
    console.error("Content update error:", error);
    return NextResponse.json(
      { error: "콘텐츠 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 콘텐츠 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = parseInt(params.id);

    if (isNaN(contentId)) {
      return NextResponse.json(
        { error: "잘못된 콘텐츠 ID입니다." },
        { status: 400 }
      );
    }

    // 콘텐츠 존재 확인
    const existingContent = await prisma.contents.findUnique({
      where: { id: contentId },
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: "콘텐츠를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 관련 데이터부터 삭제 (외래키 제약 조건 때문)
    await prisma.$transaction(async (tx) => {
      // 대댓글 삭제
      await tx.replies.deleteMany({
        where: {
          comment: {
            content_id: contentId,
          },
        },
      });

      // 댓글 추천 삭제
      await tx.likes.deleteMany({
        where: {
          comment: {
            content_id: contentId,
          },
        },
      });

      // 댓글 삭제
      await tx.comments.deleteMany({
        where: { content_id: contentId },
      });

      // 투표 삭제
      await tx.votes.deleteMany({
        where: { content_id: contentId },
      });

      // 콘텐츠 삭제
      await tx.contents.delete({
        where: { id: contentId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "콘텐츠가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Content deletion error:", error);
    return NextResponse.json(
      { error: "콘텐츠 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
