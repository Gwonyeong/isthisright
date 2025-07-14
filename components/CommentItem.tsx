"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Calendar } from "lucide-react";
import { VoteType } from "@/lib/types";
import { getVoteIcon } from "@/lib/vote-utils";

interface Reply {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
  userVote?: VoteType | null; // 대댓글 작성자의 투표 상태
}

interface Comment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
  likesCount: number;
  replies: Reply[];
  userVote?: VoteType | null; // 댓글 작성자의 투표 상태
}

interface CommentItemProps {
  comment: Comment;
  onLike?: (commentId: number) => void;
  onReply?: (
    commentId: number,
    reply: { authorName: string; content: string; userVote: VoteType }
  ) => void;
  currentUserVote?: VoteType; // 현재 사용자의 투표 상태 (대댓글 작성용)
}

export default function CommentItem({
  comment,
  onLike,
  onReply,
  currentUserVote,
}: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(comment.id);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyAuthor.trim() || !replyContent.trim()) return;
    if (isSubmittingReply || !currentUserVote) return;

    setIsSubmittingReply(true);

    try {
      const newReply = {
        authorName: replyAuthor.trim(),
        content: replyContent.trim(),
        userVote: currentUserVote,
      };

      onReply?.(comment.id, newReply);

      // 폼 초기화
      setReplyAuthor("");
      setReplyContent("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("대댓글 작성 중 오류:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const commentVoteInfo = getVoteIcon(comment.userVote || null);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        {/* 댓글 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {comment.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">
                    {comment.authorName}
                  </span>
                  {comment.userVote && (
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        comment.userVote === "AGREE"
                          ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                          : "bg-red-900/50 text-red-300 border border-red-700"
                      }`}
                    >
                      <span>{commentVoteInfo.icon}</span>
                      <span>{commentVoteInfo.label}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(comment.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 댓글 내용 */}
        <div className="text-gray-200 mb-4 leading-relaxed">
          {comment.content}
        </div>

        {/* 댓글 액션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`text-gray-400 hover:text-white ${
                isLiked ? "text-red-400 hover:text-red-300" : ""
              }`}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
              />
              {comment.likesCount + (isLiked ? 1 : 0)}
            </Button>

            {/* 투표한 사용자만 대댓글 작성 가능 */}
            {currentUserVote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-gray-400 hover:text-white"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                답글
              </Button>
            )}
          </div>

          {comment.replies.length > 0 && (
            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
              답글 {comment.replies.length}개
            </Badge>
          )}
        </div>

        {/* 대댓글 작성 폼 */}
        {showReplyForm && currentUserVote && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-300">답글 작성</span>
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                  currentUserVote === "AGREE"
                    ? "bg-blue-900/50 text-blue-300"
                    : "bg-red-900/50 text-red-300"
                }`}
              >
                <span>{getVoteIcon(currentUserVote).icon}</span>
                <span>{getVoteIcon(currentUserVote).label} 입장</span>
              </div>
            </div>
            <form onSubmit={handleReplySubmit} className="space-y-3">
              <input
                type="text"
                value={replyAuthor}
                onChange={(e) => setReplyAuthor(e.target.value)}
                placeholder="닉네임"
                maxLength={20}
                className="w-full px-3 py-2 text-sm bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글을 작성하세요..."
                maxLength={300}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  {replyContent.length}/300
                </div>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      !replyAuthor.trim() ||
                      !replyContent.trim() ||
                      isSubmittingReply
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600"
                  >
                    {isSubmittingReply ? "작성 중..." : "답글 작성"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* 대댓글 목록 */}
        {comment.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {comment.replies.map((reply) => {
              const replyVoteInfo = getVoteIcon(reply.userVote || null);
              return (
                <div key={reply.id} className="ml-8 p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {reply.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {reply.authorName}
                          </span>
                          {reply.userVote && (
                            <div
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                reply.userVote === "AGREE"
                                  ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                                  : "bg-red-900/50 text-red-300 border border-red-700"
                              }`}
                            >
                              <span>{replyVoteInfo.icon}</span>
                              <span>{replyVoteInfo.label}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-gray-400 text-xs">
                          {new Date(reply.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-200 text-sm ml-8">
                    {reply.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
