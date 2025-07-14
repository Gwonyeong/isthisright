"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  Video,
  Smartphone,
  Search,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getAdminContents,
  updateAdminContent,
  deleteAdminContent,
  handleApiError,
} from "@/lib/api";
import { AdminContentInfo } from "@/lib/types";

export default function AdminContentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contents, setContents] = useState<AdminContentInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  // 인증 확인 및 데이터 로드
  useEffect(() => {
    const loadContents = async () => {
      try {
        if (!getAdminSession()) {
          router.push("/admin");
          return;
        }

        setIsLoading(true);
        setError(null);

        const data = await getAdminContents();
        setContents(data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadContents();
  }, [router]);

  const handleDelete = async (contentId: number) => {
    const content = contents.find((c) => c.id === contentId);
    if (!content) return;

    if (
      confirm(
        `"${content.title}" 콘텐츠를 정말로 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없으며, 관련된 모든 댓글과 투표도 함께 삭제됩니다.`
      )
    ) {
      try {
        await deleteAdminContent(contentId);
        setContents(contents.filter((content) => content.id !== contentId));
        alert("콘텐츠가 성공적으로 삭제되었습니다.");
      } catch (error) {
        console.error("Content deletion error:", error);
        alert(handleApiError(error));
      }
    }
  };

  const handleStatusToggle = async (contentId: number) => {
    const content = contents.find((c) => c.id === contentId);
    if (!content) return;

    const newStatus = content.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const action = newStatus === "PUBLISHED" ? "게시" : "비공개";

    if (confirm(`"${content.title}" 콘텐츠를 ${action}하시겠습니까?`)) {
      try {
        await updateAdminContent(contentId, {
          title: content.title,
          description: content.description || "",
          youtubeUrl: content.youtube_url,
          status: newStatus,
        });

        setContents(
          contents.map((content) =>
            content.id === contentId
              ? { ...content, status: newStatus }
              : content
          )
        );

        alert(`콘텐츠가 성공적으로 ${action}되었습니다.`);
      } catch (error) {
        console.error("Content status update error:", error);
        alert(handleApiError(error));
      }
    }
  };

  // 필터링된 콘텐츠
  const filteredContents = contents.filter((content) => {
    const matchesSearch =
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (content.description &&
        content.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || content.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">콘텐츠 목록을 불러오는 중...</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  콘텐츠 관리
                </h1>
                <p className="text-sm text-gray-400">토론 주제 관리 및 편집</p>
              </div>
            </div>
            <Link href="/admin/contents/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />새 콘텐츠 추가
              </Button>
            </Link>
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
                  placeholder="제목 또는 설명으로 검색..."
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
                  <option value="all">전체 상태</option>
                  <option value="PUBLISHED">게시됨</option>
                  <option value="DRAFT">임시저장</option>
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
                  <p className="text-sm text-gray-400">전체 콘텐츠</p>
                  <p className="text-2xl font-bold text-white">
                    {contents.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Video className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">게시된 콘텐츠</p>
                  <p className="text-2xl font-bold text-white">
                    {contents.filter((c) => c.status === "PUBLISHED").length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">임시저장</p>
                  <p className="text-2xl font-bold text-white">
                    {contents.filter((c) => c.status === "DRAFT").length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                  <Edit className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 콘텐츠 목록 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              콘텐츠 목록 ({filteredContents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredContents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContents.map((content) => (
                  <div
                    key={content.id}
                    className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="secondary"
                            className="bg-gray-600 text-gray-300"
                          >
                            #{content.id}
                          </Badge>
                          <Badge
                            variant={
                              content.status === "PUBLISHED"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              content.status === "PUBLISHED"
                                ? "bg-green-900 text-green-300"
                                : "bg-yellow-900 text-yellow-300"
                            }
                          >
                            {content.status === "PUBLISHED"
                              ? "게시됨"
                              : "임시저장"}
                          </Badge>
                          {content.is_shorts && (
                            <Badge className="bg-red-900 text-red-300">
                              <Smartphone className="h-3 w-3 mr-1" />
                              쇼츠
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2">
                          {content.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {content.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1 text-blue-400">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{content.votes.agree}</span>
                            </div>
                            <div className="flex items-center gap-1 text-red-400">
                              <ThumbsDown className="h-3 w-3" />
                              <span>{content.votes.disagree}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <MessageSquare className="h-3 w-3" />
                            <span>{content.comments}개</span>
                          </div>

                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Eye className="h-3 w-3" />
                            <span>{content.views.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(content.created_at).toLocaleDateString(
                                "ko-KR"
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Video className="h-3 w-3" />
                            <span>{content.youtube_video_id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusToggle(content.id)}
                          className="border-gray-600 text-gray-300 hover:text-white"
                        >
                          {content.status === "PUBLISHED" ? "비공개" : "게시"}
                        </Button>
                        <Link href={`/admin/contents/${content.id}/edit`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(content.id)}
                          className="border-red-600 text-red-400 hover:text-red-300 hover:border-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
