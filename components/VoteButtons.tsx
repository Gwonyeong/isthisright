"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import {
  VoteType,
  getVoteFromCookie,
  saveVoteToCookie,
} from "@/lib/vote-utils";

interface VoteButtonsProps {
  contentId: number;
  initialAgreeCount: number;
  initialDisagreeCount: number;
  onVoteChange?: (
    agreeCount: number,
    disagreeCount: number,
    userVote: VoteType
  ) => void;
}

export default function VoteButtons({
  contentId,
  initialAgreeCount,
  initialDisagreeCount,
  onVoteChange,
}: VoteButtonsProps) {
  const [currentVote, setCurrentVote] = useState<VoteType>(null);
  const [agreeCount, setAgreeCount] = useState(initialAgreeCount);
  const [disagreeCount, setDisagreeCount] = useState(initialDisagreeCount);
  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트 마운트 시 쿠키에서 투표 정보 불러오기
  useEffect(() => {
    const savedVote = getVoteFromCookie(contentId);
    setCurrentVote(savedVote);
  }, [contentId]);

  const handleVote = async (voteType: VoteType) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // TODO: API 호출 구현
      // const response = await fetch(`/api/contents/${contentId}/votes`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ voteType })
      // });

      // 임시로 로컬 상태만 업데이트
      let newAgreeCount = agreeCount;
      let newDisagreeCount = disagreeCount;

      // 기존 투표 취소
      if (currentVote === "AGREE") {
        newAgreeCount--;
      } else if (currentVote === "DISAGREE") {
        newDisagreeCount--;
      }

      // 새 투표 추가
      if (voteType === "AGREE") {
        newAgreeCount++;
      } else if (voteType === "DISAGREE") {
        newDisagreeCount++;
      }

      // 상태 업데이트
      setCurrentVote(voteType);
      setAgreeCount(newAgreeCount);
      setDisagreeCount(newDisagreeCount);

      // 쿠키에 투표 정보 저장
      saveVoteToCookie(contentId, voteType);

      // 부모 컴포넌트에 변경사항 알림
      onVoteChange?.(newAgreeCount, newDisagreeCount, voteType);
    } catch (error) {
      console.error("투표 처리 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4 py-8">
        <Button
          onClick={() => handleVote(currentVote === "AGREE" ? null : "AGREE")}
          disabled={isLoading}
          size="lg"
          className={`flex items-center gap-2 px-8 py-4 text-lg transition-all duration-200 ${
            currentVote === "AGREE"
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
              : "bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white"
          }`}
        >
          <ThumbsUp className="h-5 w-5" />
          찬성 ({agreeCount})
        </Button>

        <div className="text-gray-400 text-sm">vs</div>

        <Button
          onClick={() =>
            handleVote(currentVote === "DISAGREE" ? null : "DISAGREE")
          }
          disabled={isLoading}
          size="lg"
          className={`flex items-center gap-2 px-8 py-4 text-lg transition-all duration-200 ${
            currentVote === "DISAGREE"
              ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
              : "bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white"
          }`}
        >
          <ThumbsDown className="h-5 w-5" />
          반대 ({disagreeCount})
        </Button>
      </div>

      {/* 투표 상태 표시 */}
      {currentVote && (
        <div className="text-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              currentVote === "AGREE"
                ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                : "bg-red-900/50 text-red-300 border border-red-700"
            }`}
          >
            {currentVote === "AGREE" ? "👍" : "👎"}
            <span>
              당신은{" "}
              <strong>{currentVote === "AGREE" ? "찬성" : "반대"}</strong>{" "}
              입장입니다
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
