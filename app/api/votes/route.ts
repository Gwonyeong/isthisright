import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, voteType } = body;

    // 요청 검증
    if (!contentId || !voteType) {
      return NextResponse.json(
        { error: "콘텐츠 ID와 투표 타입이 필요합니다." },
        { status: 400 }
      );
    }

    if (voteType !== "AGREE" && voteType !== "DISAGREE") {
      return NextResponse.json(
        { error: "올바르지 않은 투표 타입입니다." },
        { status: 400 }
      );
    }

    // IP 주소 가져오기
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(/, /)[0]
      : request.ip || request.headers.get("x-real-ip") || "127.0.0.1";

    // 콘텐츠 존재 확인
    const content = await prisma.contents.findUnique({
      where: {
        id: parseInt(contentId),
        status: "PUBLISHED",
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "콘텐츠를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기존 투표 확인
    const existingVote = await prisma.votes.findUnique({
      where: {
        content_id_ip_address: {
          content_id: parseInt(contentId),
          ip_address: ip,
        },
      },
    });

    let vote;

    if (existingVote) {
      // 기존 투표가 있으면 업데이트
      vote = await prisma.votes.update({
        where: {
          id: existingVote.id,
        },
        data: {
          vote_type: voteType,
        },
      });
    } else {
      // 새로운 투표 생성
      vote = await prisma.votes.create({
        data: {
          content_id: parseInt(contentId),
          vote_type: voteType,
          ip_address: ip,
        },
      });
    }

    // 투표 결과 통계 조회
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
      success: true,
      userVote: vote.vote_type,
      votes: {
        agree: agreeVotes,
        disagree: disagreeVotes,
        total: totalVotes,
        agreePercentage,
      },
    });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "투표 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
