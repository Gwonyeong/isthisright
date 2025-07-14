"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import {
  validateAdminPassword,
  setAdminSession,
  getAdminSession,
} from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 이미 로그인되어 있다면 대시보드로 리다이렉트
  useEffect(() => {
    if (getAdminSession()) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("비밀번호를 입력하세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // 약간의 딜레이로 실제 인증 과정을 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (validateAdminPassword(password)) {
        setAdminSession();
        router.push("/admin/dashboard");
      } else {
        setError("잘못된 비밀번호입니다.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">관리자 로그인</h1>
          <p className="text-gray-400">이게 맞아? 관리자 페이지</p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  관리자 비밀번호
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/50 border border-red-700 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600"
              >
                {isSubmitting ? "로그인 중..." : "로그인"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-300">
                <h4 className="font-medium mb-2">보안 정보</h4>
                <div className="space-y-1 text-gray-400">
                  <p>• 관리자 비밀번호는 환경 변수로 안전하게 관리됩니다</p>
                  <p>• 세션 유지: 24시간</p>
                  <p>• 비밀번호는 서버 관리자에게 문의하세요</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white"
          >
            ← 메인 페이지로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
