"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Eye,
  AlertCircle,
  CheckCircle,
  Link as LinkIcon,
  Video,
  Smartphone,
  Loader2,
  Shield,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  getAdminSession,
  extractYouTubeVideoId,
  isYouTubeShorts,
} from "@/lib/admin-auth";
import YouTubePlayer from "@/components/YouTubePlayer";
import {
  getAdminContent,
  updateAdminContent,
  validateYouTubeEmbed,
  handleApiError,
} from "@/lib/api";
import { AdminContentInfo } from "@/lib/types";

export default function AdminEditContentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();
  const params = useParams();
  const contentId = parseInt(params.id as string);

  const [originalContent, setOriginalContent] =
    useState<AdminContentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    thumbnailUrl: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
  });

  // YouTube 처리 상태
  const [youtubeData, setYoutubeData] = useState({
    videoId: "",
    isShorts: false,
    isValid: false,
  });

  // YouTube 임베드 검증 상태
  const [embedValidation, setEmbedValidation] = useState<{
    checked: boolean;
    isEmbeddable: boolean;
    error?: string;
    videoInfo?: {
      title: string;
      author: string;
      thumbnailUrl: string;
    };
  }>({
    checked: false,
    isEmbeddable: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // 인증 확인 및 기존 데이터 로드
  useEffect(() => {
    const loadContentData = async () => {
      try {
        if (!getAdminSession()) {
          router.push("/admin");
          return;
        }

        if (isNaN(contentId)) {
          setError("잘못된 콘텐츠 ID입니다.");
          return;
        }

        setIsLoading(true);
        setError(null);

        const content = await getAdminContent(contentId);
        setOriginalContent(content);

        // 폼 데이터 초기화
        setFormData({
          title: content.title,
          description: content.description || "",
          youtubeUrl: content.youtube_url,
          thumbnailUrl: content.thumbnail_url || "",
          status: content.status,
        });

        // YouTube 데이터 초기화
        setYoutubeData({
          videoId: content.youtube_video_id,
          isShorts: content.is_shorts,
          isValid: true,
        });

        // 기존 영상의 임베드 검증
        await validateExistingVideo(content.youtube_url);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadContentData();
  }, [router, contentId]);

  // 기존 영상 임베드 검증
  const validateExistingVideo = async (url: string) => {
    try {
      setIsValidating(true);
      const validation = await validateYouTubeEmbed(url);
      setEmbedValidation({
        checked: true,
        isEmbeddable: validation.isEmbeddable,
        error: validation.error,
        videoInfo: validation.videoInfo,
      });
    } catch (err) {
      console.error("Embed validation error:", err);
      setEmbedValidation({
        checked: true,
        isEmbeddable: false,
        error: "검증 중 오류가 발생했습니다.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // YouTube URL 변경 시 처리
  useEffect(() => {
    if (
      formData.youtubeUrl &&
      formData.youtubeUrl !== originalContent?.youtube_url
    ) {
      const videoId = extractYouTubeVideoId(formData.youtubeUrl);
      const shorts = isYouTubeShorts(formData.youtubeUrl);

      if (videoId) {
        setYoutubeData({
          videoId,
          isShorts: shorts,
          isValid: true,
        });
        setErrors((prev) => ({ ...prev, youtubeUrl: "" }));

        // URL이 변경되면 임베드 검증 초기화
        setEmbedValidation({
          checked: false,
          isEmbeddable: false,
        });
      } else {
        setYoutubeData({
          videoId: "",
          isShorts: false,
          isValid: false,
        });
        setEmbedValidation({
          checked: false,
          isEmbeddable: false,
        });
        if (formData.youtubeUrl.trim()) {
          setErrors((prev) => ({
            ...prev,
            youtubeUrl: "올바른 YouTube URL을 입력해주세요.",
          }));
        }
      }
    }
  }, [formData.youtubeUrl, originalContent?.youtube_url]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    } else if (formData.title.length > 200) {
      newErrors.title = "제목은 200자 이내로 입력해주세요.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "설명을 입력해주세요.";
    } else if (formData.description.length > 1000) {
      newErrors.description = "설명은 1000자 이내로 입력해주세요.";
    }

    if (!formData.youtubeUrl.trim()) {
      newErrors.youtubeUrl = "YouTube URL을 입력해주세요.";
    } else if (!youtubeData.isValid) {
      newErrors.youtubeUrl = "올바른 YouTube URL을 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmbedValidation = async () => {
    if (!youtubeData.isValid) return;

    try {
      setIsValidating(true);
      const validation = await validateYouTubeEmbed(formData.youtubeUrl);
      setEmbedValidation({
        checked: true,
        isEmbeddable: validation.isEmbeddable,
        error: validation.error,
        videoInfo: validation.videoInfo,
      });
    } catch (err) {
      console.error("Embed validation error:", err);
      setEmbedValidation({
        checked: true,
        isEmbeddable: false,
        error: "검증 중 오류가 발생했습니다.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // URL이 변경되었는데 임베드 검증을 하지 않은 경우
    if (
      formData.youtubeUrl !== originalContent?.youtube_url &&
      !embedValidation.checked
    ) {
      alert("YouTube 영상의 임베드 허용 여부를 먼저 확인해주세요.");
      return;
    }

    // 임베드가 허용되지 않는 경우
    if (embedValidation.checked && !embedValidation.isEmbeddable) {
      if (
        !confirm(
          "이 영상은 임베드가 허용되지 않습니다. 그래도 저장하시겠습니까?"
        )
      ) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await updateAdminContent(contentId, {
        title: formData.title,
        description: formData.description,
        youtubeUrl: formData.youtubeUrl,
        thumbnailUrl: formData.thumbnailUrl,
        status: formData.status,
      });

      alert("콘텐츠가 성공적으로 수정되었습니다!");
      router.push("/admin/contents");
    } catch (error) {
      console.error("Content update error:", error);
      alert(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">콘텐츠를 불러오는 중...</p>
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
          <Link href="/admin/contents">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              콘텐츠 목록으로 돌아가기
            </Button>
          </Link>
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
                href="/admin/contents"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  콘텐츠 수정
                </h1>
                <p className="text-sm text-gray-400">
                  #{contentId} - {originalContent?.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                disabled={!youtubeData.isValid}
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "편집 모드" : "미리보기"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  제목 <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="토론 주제의 제목을 입력하세요"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.title && (
                    <span className="text-red-400 text-sm">{errors.title}</span>
                  )}
                  <span className="text-gray-400 text-sm ml-auto">
                    {formData.title.length}/200
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  설명 <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="토론 주제에 대한 상세 설명을 입력하세요"
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <span className="text-red-400 text-sm">
                      {errors.description}
                    </span>
                  )}
                  <span className="text-gray-400 text-sm ml-auto">
                    {formData.description.length}/1000
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  게시 상태
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DRAFT">임시저장</option>
                  <option value="PUBLISHED">게시</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="thumbnailUrl"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  썸네일 URL
                </label>
                <input
                  id="thumbnailUrl"
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => handleInputChange("thumbnailUrl", e.target.value)}
                  placeholder="썸네일 이미지 URL을 입력하세요 (선택사항)"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  비어있으면 YouTube 기본 썸네일을 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* YouTube 영상 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                YouTube 영상
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label
                  htmlFor="youtubeUrl"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  YouTube URL <span className="text-red-400">*</span>
                </label>
                <input
                  id="youtubeUrl"
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) =>
                    handleInputChange("youtubeUrl", e.target.value)
                  }
                  placeholder="https://www.youtube.com/watch?v=... 또는 https://youtube.com/shorts/..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.youtubeUrl && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.youtubeUrl}</span>
                  </div>
                )}
                {youtubeData.isValid && (
                  <div className="flex items-center gap-2 mt-2 text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>유효한 YouTube URL입니다</span>
                    <Badge
                      className={`text-xs ${
                        youtubeData.isShorts
                          ? "bg-red-900 text-red-300"
                          : "bg-blue-900 text-blue-300"
                      }`}
                    >
                      {youtubeData.isShorts ? (
                        <>
                          <Smartphone className="h-3 w-3 mr-1" />
                          쇼츠
                        </>
                      ) : (
                        <>
                          <Video className="h-3 w-3 mr-1" />
                          일반 영상
                        </>
                      )}
                    </Badge>
                  </div>
                )}
              </div>

              {/* 임베드 검증 */}
              {youtubeData.isValid && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      임베드 허용 여부 검증
                    </h4>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleEmbedValidation}
                      disabled={isValidating || embedValidation.checked}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          검증 중...
                        </>
                      ) : embedValidation.checked ? (
                        "검증 완료"
                      ) : (
                        "검증하기"
                      )}
                    </Button>
                  </div>

                  {embedValidation.checked && (
                    <div
                      className={`p-3 rounded-md ${
                        embedValidation.isEmbeddable
                          ? "bg-green-900/50 border border-green-700"
                          : "bg-red-900/50 border border-red-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {embedValidation.isEmbeddable ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <X className="h-4 w-4 text-red-400" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            embedValidation.isEmbeddable
                              ? "text-green-300"
                              : "text-red-300"
                          }`}
                        >
                          {embedValidation.isEmbeddable
                            ? "임베드 허용됨"
                            : "임베드 제한됨"}
                        </span>
                      </div>
                      {embedValidation.error && (
                        <p className="text-sm text-gray-300 mb-2">
                          {embedValidation.error}
                        </p>
                      )}
                      {embedValidation.videoInfo && (
                        <div className="text-xs text-gray-400">
                          <p>제목: {embedValidation.videoInfo.title}</p>
                          <p>채널: {embedValidation.videoInfo.author}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 미리보기 */}
              {showPreview && youtubeData.isValid && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    미리보기
                  </h4>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <YouTubePlayer
                      videoId={youtubeData.videoId}
                      title={formData.title || "미리보기"}
                      isShorts={youtubeData.isShorts}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/contents">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                취소
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {formData.status === "PUBLISHED"
                    ? "수정 및 게시"
                    : "수정 및 임시저장"}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
