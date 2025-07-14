"use client";

import { useState, useEffect } from "react";
import YouTubePlayer from "@/components/YouTubePlayer";
import VoteButtons from "@/components/VoteButtons";
import VoteChart from "@/components/VoteChart";
import CommentForm from "@/components/CommentForm";
import CommentItem from "@/components/CommentItem";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Video,
  Smartphone,
  Lock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContentDetail, Comment, VoteType, UserVoteType } from "@/lib/types";
import {
  checkVote,
  submitVote,
  createComment,
  createReply,
  toggleCommentLike,
  handleApiError,
} from "@/lib/api";

interface ClientContentPageProps {
  initialContent: ContentDetail;
}

export default function ClientContentPage({
  initialContent,
}: ClientContentPageProps) {
  // 상태 관리
  const [content, setContent] = useState<ContentDetail>(initialContent);
  const [loading, setLoading] = useState(false);
  const [userVote, setUserVote] = useState<UserVoteType>(null);
  const [comments, setComments] = useState<Comment[]>(initialContent.comments);
  const [isShowingShorts, setIsShowingShorts] = useState(
    initialContent.isShorts
  );

  // 투표 상태 확인
  useEffect(() => {
    const loadVoteStatus = async () => {
      try {
        setLoading(true);
        const voteData = await checkVote(content.id);
        setUserVote(voteData.userVote);
      } catch (err) {
        console.error("투표 상태 확인 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadVoteStatus();
  }, [content.id]);

  // 투표 처리
  const handleVoteChange = async (
    agreeCount: number,
    disagreeCount: number,
    newUserVote: VoteType
  ) => {
    try {
      const response = await submitVote(content.id, newUserVote);
      setUserVote(response.userVote);

      // 콘텐츠 투표 데이터 업데이트
      setContent({
        ...content,
        votes: response.votes,
      });
    } catch (err) {
      console.error("투표 처리 실패:", err);
      alert(handleApiError(err));
    }
  };

  // 댓글 작성 처리
  const handleCommentSubmit = async (newComment: {
    authorName: string;
    content: string;
    userVote: VoteType;
  }) => {
    try {
      const response = await createComment(
        content.id,
        newComment.authorName,
        newComment.content,
        newComment.userVote
      );

      // 댓글 목록 업데이트
      setComments([response.comment, ...comments]);
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      alert(handleApiError(err));
    }
  };

  // 대댓글 작성 처리
  const handleReply = async (
    commentId: number,
    newReply: { authorName: string; content: string; userVote: VoteType }
  ) => {
    try {
      const response = await createReply(
        commentId,
        newReply.authorName,
        newReply.content,
        newReply.userVote
      );

      // 댓글 목록 업데이트
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, response.reply] }
            : comment
        )
      );
    } catch (err) {
      console.error("대댓글 작성 실패:", err);
      alert(handleApiError(err));
    }
  };

  // 댓글 추천 처리
  const handleCommentLike = async (commentId: number) => {
    try {
      const response = await toggleCommentLike(commentId);

      // 댓글 추천 수 업데이트
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, likesCount: response.likesCount }
            : comment
        )
      );
    } catch (err) {
      console.error("댓글 추천 실패:", err);
      alert(handleApiError(err));
    }
  };

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          토론 목록으로 돌아가기
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-6 text-gray-400 text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(content.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{content.views.toLocaleString()}회 조회</span>
          </div>
        </div>
      </div>

      {/* 영상 타입 전환 버튼 (쇼츠 콘텐츠가 있을 때만 표시) */}
      {content.isShorts && (
        <div className="mb-4 flex justify-center">
          <div className="inline-flex rounded-lg bg-gray-800 p-1">
            <Button
              onClick={() => setIsShowingShorts(false)}
              variant={!isShowingShorts ? "default" : "ghost"}
              size="sm"
              className={`flex items-center gap-2 ${
                !isShowingShorts
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              <Video className="h-4 w-4" />
              일반 영상
            </Button>
            <Button
              onClick={() => setIsShowingShorts(true)}
              variant={isShowingShorts ? "default" : "ghost"}
              size="sm"
              className={`flex items-center gap-2 ${
                isShowingShorts
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              쇼츠 영상
            </Button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <YouTubePlayer
          videoId={content.youtubeVideoId}
          title={content.title}
          isShorts={isShowingShorts}
        />
      </div>

      <div className="mb-8">
        <VoteButtons
          contentId={content.id}
          initialAgreeCount={content.votes.agree}
          initialDisagreeCount={content.votes.disagree}
          onVoteChange={handleVoteChange}
        />
      </div>

      <div className="mb-8">
        <VoteChart
          agreeCount={content.votes.agree}
          disagreeCount={content.votes.disagree}
        />
      </div>

      {/* 댓글 섹션 - 투표한 사용자만 볼 수 있음 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            댓글 ({comments.length})
          </h2>
          {!userVote && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Lock className="h-4 w-4" />
              <span>투표 후 이용 가능</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400 mx-auto mb-2" />
            <p className="text-gray-300">투표 상태를 확인하는 중...</p>
          </div>
        ) : userVote ? (
          <>
            <CommentForm
              contentId={content.id}
              userVote={userVote}
              onCommentSubmit={handleCommentSubmit}
            />

            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserVote={userVote}
                  onLike={() => handleCommentLike(comment.id)}
                  onReply={handleReply}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Lock className="h-12 w-12 text-gray-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  댓글을 보려면 투표하세요
                </h3>
                <p className="text-gray-300 mb-4">
                  찬성 또는 반대 버튼을 클릭하면{" "}
                  <strong>{comments.length}개의 댓글</strong>을 볼 수 있습니다.
                </p>
                <p className="text-sm text-gray-400">
                  투표는 언제든지 변경할 수 있으며, 투표 참여자만 토론에 참여할
                  수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
