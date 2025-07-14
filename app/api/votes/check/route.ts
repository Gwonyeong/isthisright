import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId } = body;

    if (!contentId) {
      return NextResponse.json(
        { error: "콘텐츠 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // IP 주소 가져오기
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(/, /)[0]
      : request.ip || request.headers.get("x-real-ip") || "127.0.0.1";

    // 사용자의 투표 확인
    const userVote = await prisma.votes.findUnique({
      where: {
        content_id_ip_address: {
          content_id: parseInt(contentId),
          ip_address: ip,
        },
      },
    });

    // 전체 투표 통계
    const votes = await prisma.votes.findMany({
      where: {
        content_id: parseInt(contentId),
      },
    });

    const agreeVotes = votes.filter((v) => v.vote_type === "AGREE").length;
    const disagreeVotes = votes.filter(
      (v) => v.vote_type === "DISAGREE"
    ).length;
    const totalVotes = agreeVotes + disagreeVotes;
    const agreePercentage =
      totalVotes > 0 ? Math.round((agreeVotes / totalVotes) * 100) : 0;

    return NextResponse.json({
      userVote: userVote?.vote_type || null,
      votes: {
        agree: agreeVotes,
        disagree: disagreeVotes,
        total: totalVotes,
        agreePercentage,
      },
    });
  } catch (error) {
    console.error("Vote check error:", error);
    return NextResponse.json(
      { error: "투표 정보를 확인하는데 실패했습니다." },
      { status: 500 }
    );
  }
}
