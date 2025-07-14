"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Filter,
  Trash2,
  Eye,
  Calendar,
  MessageSquare,
  ExternalLink,
  ThumbsUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getAdminSession } from "@/lib/admin-auth";
import { getVoteIcon } from "@/lib/vote-utils";
import { getAdminComments, handleApiError } from "@/lib/api";
import { AdminCommentInfo, CommentStatus } from "@/lib/types";

export default function AdminCommentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<AdminCommentInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const router = useRouter();

  // 인증 확인 및 데이터 로드
  useEffect(() => {
    const loadComments = async () => {
      try {
        if (!getAdminSession()) {
          router.push("/admin");
          return;
        }

        setIsLoading(true);
        setError(null);

        const data = await getAdminComments();
        setComments(data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [router]);

  const handleDelete = (commentId: number) => {
    const comment = comments.find((c) => c.id === commentId);
    if (confirm(`"${comment?.authorName}"의 댓글을 삭제하시겠습니까?`)) {
      setComments(comments.filter((c) => c.id !== commentId));
      // TODO: API 호출로 실제 삭제 구현
    }
  };

  const handleStatusChange = (commentId: number, newStatus: CommentStatus) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, status: newStatus } : comment
      )
    );
    // TODO: API 호출로 상태 변경 구현
  };

  // 필터링된 댓글
  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.contentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || comment.status === statusFilter;
    const matchesType = typeFilter === "all" || comment.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalComments = comments.filter((c) => c.type === "comment").length;
  const totalReplies = comments.filter((c) => c.type === "reply").length;
  const flaggedComments = comments.filter((c) => c.status === "FLAGGED").length;

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">댓글 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">오류 발생</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">댓글 관리</h1>
              <p className="text-sm text-gray-400">
                사용자 댓글 모니터링 및 관리
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* 검색 및 필터 */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="댓글 내용, 작성자, 콘텐츠 제목으로 검색..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">모든 상태</option>
                  <option value="ACTIVE">활성</option>
                  <option value="FLAGGED">신고됨</option>
                  <option value="DELETED">삭제됨</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">모든 타입</option>
                  <option value="comment">댓글</option>
                  <option value="reply">대댓글</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 통계 정보 */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">총 댓글</p>
                  <p className="text-2xl font-bold text-white">
                    {totalComments}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">총 대댓글</p>
                  <p className="text-2xl font-bold text-white">
                    {totalReplies}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">신고된 댓글</p>
                  <p className="text-2xl font-bold text-white">
                    {flaggedComments}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 댓글 목록 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              댓글 목록 ({filteredComments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredComments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComments.map((comment) => {
                  const voteIcon = getVoteIcon(comment.userVote);
                  return (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-lg border ${
                        comment.status === "FLAGGED"
                          ? "bg-red-900/20 border-red-700"
                          : "bg-gray-700 border-gray-600"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="secondary"
                              className="bg-gray-600 text-gray-300"
                            >
                              #{comment.id}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                comment.type === "comment"
                                  ? "border-blue-600 text-blue-400"
                                  : "border-purple-600 text-purple-400"
                              }`}
                            >
                              {comment.type === "comment" ? "댓글" : "대댓글"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                comment.status === "ACTIVE"
                                  ? "border-green-600 text-green-400"
                                  : comment.status === "FLAGGED"
                                  ? "border-red-600 text-red-400"
                                  : "border-gray-600 text-gray-400"
                              }`}
                            >
                              {comment.status === "ACTIVE"
                                ? "활성"
                                : comment.status === "FLAGGED"
                                ? "신고됨"
                                : "삭제됨"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-medium">
                              {comment.authorName}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${voteIcon.color}`}
                            >
                              {voteIcon.icon} {voteIcon.label}
                            </Badge>
                          </div>

                          <p className="text-gray-300 mb-3 leading-relaxed">
                            {comment.content}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(comment.createdAt).toLocaleDateString(
                                  "ko-KR",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{comment.likesCount} 추천</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{comment.repliesCount} 답글</span>
                            </div>
                            <Link
                              href={`/contents/${comment.contentId}`}
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span className="line-clamp-1">
                                {comment.contentTitle}
                              </span>
                            </Link>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {comment.status === "FLAGGED" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(comment.id, "ACTIVE")
                              }
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {comment.status === "ACTIVE" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusChange(comment.id, "FLAGGED")
                              }
                              className="border-yellow-600 text-yellow-400 hover:text-yellow-300"
                            >
                              신고 처리
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(comment.id)}
                            className="border-red-600 text-red-400 hover:text-red-300 hover:border-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
