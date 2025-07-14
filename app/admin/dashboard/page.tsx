"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  FileText,
  MessageSquare,
  Users,
  TrendingUp,
  Plus,
  Settings,
  LogOut,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getAdminSession, clearAdminSession } from "@/lib/admin-auth";
import { getAdminDashboard, handleApiError } from "@/lib/api";

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<{
    stats: {
      totalContents: number;
      publishedContents: number;
      draftContents: number;
      totalVotes: number;
      totalComments: number;
      totalViews: number;
    };
    recentContents: Array<{
      id: number;
      title: string;
      votes: {
        agree: number;
        disagree: number;
        total: number;
        agreePercentage: number;
      };
      comments: number;
      views: number;
      created_at: string;
    }>;
    systemInfo: {
      version: string;
      serverStatus: string;
      databaseStatus: string;
      lastBackup: string;
    };
  } | null>(null);
  const router = useRouter();

  // 인증 확인 및 데이터 로드
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!getAdminSession()) {
          router.push("/admin");
          return;
        }

        setIsLoading(true);
        setError(null);

        const data = await getAdminDashboard();
        setDashboardData(data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  const handleLogout = () => {
    clearAdminSession();
    router.push("/admin");
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">대시보드 데이터를 불러오는 중...</p>
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

  // 데이터가 없는 경우
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">데이터 없음</h2>
          <p className="text-gray-300">대시보드 데이터를 불러올 수 없습니다.</p>
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
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  관리자 대시보드
                </h1>
                <p className="text-sm text-gray-400">이게 맞아? 관리 시스템</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-white"
              >
                사이트 보기
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* 통계 카드 */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">총 콘텐츠</p>
                  <p className="text-2xl font-bold text-white">
                    {dashboardData.stats.totalContents}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">총 투표수</p>
                  <p className="text-2xl font-bold text-white">
                    {dashboardData.stats.totalVotes.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">총 댓글수</p>
                  <p className="text-2xl font-bold text-white">
                    {dashboardData.stats.totalComments}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">총 조회수</p>
                  <p className="text-2xl font-bold text-white">
                    {dashboardData.stats.totalViews.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* 최근 콘텐츠 */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">최근 콘텐츠</CardTitle>
                <Link href="/admin/contents">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    전체 보기
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentContents.map((content) => (
                    <div
                      key={content.id}
                      className="p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-medium line-clamp-2 flex-1 mr-4">
                          {content.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="bg-gray-600 text-gray-300"
                        >
                          #{content.id}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1 text-blue-400">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{content.votes.agree}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-400">
                            <ThumbsDown className="h-3 w-3" />
                            <span>{content.votes.disagree}</span>
                          </div>
                          <span className="text-gray-400">
                            ({content.votes.agreePercentage}%)
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <MessageSquare className="h-3 w-3" />
                          <span>{content.comments}개</span>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Eye className="h-3 w-3" />
                          <span>{content.views.toLocaleString()}</span>
                        </div>

                        <div className="text-sm text-gray-400">
                          {new Date(content.created_at).toLocaleDateString(
                            "ko-KR"
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 빠른 액션 */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">빠른 액션</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/contents/new" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-start">
                    <Plus className="h-4 w-4 mr-2" />새 콘텐츠 추가
                  </Button>
                </Link>

                <Link href="/admin/contents" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:text-white justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    콘텐츠 관리
                  </Button>
                </Link>

                <Link href="/admin/comments" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:text-white justify-start"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    댓글 관리
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:text-white justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  시스템 설정
                </Button>
              </CardContent>
            </Card>

            {/* 시스템 정보 */}
            <Card className="bg-gray-800 border-gray-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white">시스템 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">버전</span>
                    <span className="text-white">
                      {dashboardData.systemInfo.version}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">서버 상태</span>
                    <Badge className="bg-green-900 text-green-300">
                      {dashboardData.systemInfo.serverStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">데이터베이스</span>
                    <Badge className="bg-green-900 text-green-300">
                      {dashboardData.systemInfo.databaseStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">마지막 백업</span>
                    <span className="text-white">
                      {new Date(
                        dashboardData.systemInfo.lastBackup
                      ).toLocaleString("ko-KR")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
