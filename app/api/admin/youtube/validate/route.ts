import { NextRequest, NextResponse } from "next/server";
import { extractYouTubeVideoId } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeUrl } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "YouTube URL이 필요합니다." },
        { status: 400 }
      );
    }

    // YouTube 비디오 ID 추출
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "올바른 YouTube URL이 아닙니다." },
        { status: 400 }
      );
    }

    // YouTube oEmbed API를 사용하여 임베드 가능 여부 확인
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    try {
      const oembedResponse = await fetch(oembedUrl);

      if (oembedResponse.status === 401) {
        return NextResponse.json({
          isEmbeddable: false,
          error: "이 영상은 임베드가 허용되지 않습니다.",
          reason: "EMBED_DISABLED",
        });
      }

      if (oembedResponse.status === 404) {
        return NextResponse.json({
          isEmbeddable: false,
          error: "영상을 찾을 수 없습니다.",
          reason: "VIDEO_NOT_FOUND",
        });
      }

      if (!oembedResponse.ok) {
        return NextResponse.json({
          isEmbeddable: false,
          error: "영상 정보를 확인할 수 없습니다.",
          reason: "UNKNOWN_ERROR",
        });
      }

      const oembedData = await oembedResponse.json();

      return NextResponse.json({
        isEmbeddable: true,
        videoInfo: {
          title: oembedData.title,
          author: oembedData.author_name,
          thumbnailUrl: oembedData.thumbnail_url,
          width: oembedData.width,
          height: oembedData.height,
        },
      });
    } catch (fetchError) {
      console.error("oEmbed fetch error:", fetchError);

      // oEmbed API 실패 시 대안 방법: iframe 시도
      try {
        const iframeTestUrl = `https://www.youtube.com/embed/${videoId}`;
        const headResponse = await fetch(iframeTestUrl, {
          method: "HEAD",
        });

        if (headResponse.ok) {
          return NextResponse.json({
            isEmbeddable: true,
            videoInfo: {
              title: "영상 제목을 확인할 수 없음",
              author: "알 수 없음",
              thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              width: 560,
              height: 315,
            },
          });
        } else {
          return NextResponse.json({
            isEmbeddable: false,
            error: "이 영상은 임베드가 허용되지 않습니다.",
            reason: "EMBED_DISABLED",
          });
        }
      } catch (iframeError) {
        console.error("Iframe test error:", iframeError);
        return NextResponse.json({
          isEmbeddable: false,
          error: "영상의 임베드 허용 여부를 확인할 수 없습니다.",
          reason: "VALIDATION_FAILED",
        });
      }
    }
  } catch (error) {
    console.error("YouTube validation error:", error);
    return NextResponse.json(
      { error: "YouTube 영상 검증 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
