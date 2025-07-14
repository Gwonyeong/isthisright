"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Vote } from "lucide-react";
import { VoteType, getVoteIcon } from "@/lib/vote-utils";

interface CommentFormProps {
  contentId: number;
  userVote: VoteType;
  onCommentSubmit?: (comment: {
    authorName: string;
    content: string;
    userVote: VoteType;
  }) => void;
}

export default function CommentForm({
  contentId, // eslint-disable-line @typescript-eslint/no-unused-vars
  userVote,
  onCommentSubmit,
}: CommentFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName.trim() || !content.trim()) return;
    if (isSubmitting || !userVote) return;

    setIsSubmitting(true);

    try {
      // TODO: API 호출 구현
      // const response = await fetch(`/api/contents/${contentId}/comments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     authorName: authorName.trim(),
      //     content: content.trim(),
      //     userVote: userVote
      //   })
      // });

      const newComment = {
        authorName: authorName.trim(),
        content: content.trim(),
        userVote: userVote,
      };

      onCommentSubmit?.(newComment);

      // 폼 초기화
      setAuthorName("");
      setContent("");
    } catch (error) {
      console.error("댓글 작성 중 오류:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 투표하지 않은 사용자에게 표시할 메시지
  if (!userVote) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Vote className="h-6 w-6" />
              <h3 className="text-lg font-semibold">댓글 작성 권한</h3>
            </div>
            <div className="space-y-2">
              <p className="text-gray-300">
                댓글을 작성하려면 먼저 <strong>찬성</strong> 또는{" "}
                <strong>반대</strong> 버튼을 클릭해주세요.
              </p>
              <p className="text-sm text-gray-400">
                투표 참여자만 토론에 참여할 수 있습니다.
              </p>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700 text-gray-300 text-sm">
                🗳️ 위의 투표 버튼을 먼저 클릭해주세요
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const voteInfo = getVoteIcon(userVote);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">댓글 작성</h3>
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${voteInfo.color} bg-gray-700`}
          >
            <span>{voteInfo.icon}</span>
            <span>{voteInfo.label} 입장</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="authorName"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              작성자명
            </label>
            <input
              id="authorName"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="닉네임을 입력하세요"
              maxLength={20}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              댓글 내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="의견을 나누어보세요..."
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {content.length}/500
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!authorName.trim() || !content.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "작성 중..." : "댓글 작성"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
