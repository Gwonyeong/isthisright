import {
  ContentDetail,
  VoteResponse,
  VoteCheckResponse,
  CommentResponse,
  ReplyResponse,
  LikeResponse,
  VoteType,
  AdminDashboardStats,
  AdminContentInfo,
  AdminCommentInfo,
} from "./types";

const API_BASE_URL = 
  typeof window !== "undefined" 
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");

// 공통 fetch 함수
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// 콘텐츠 상세 정보 가져오기
export async function getContentDetail(id: number): Promise<ContentDetail> {
  return apiFetch<ContentDetail>(`/api/contents/${id}`);
}

// 투표 상태 확인
export async function checkVote(contentId: number): Promise<VoteCheckResponse> {
  return apiFetch<VoteCheckResponse>("/api/votes/check", {
    method: "POST",
    body: JSON.stringify({ contentId }),
  });
}

// 투표하기
export async function submitVote(
  contentId: number,
  voteType: VoteType
): Promise<VoteResponse> {
  return apiFetch<VoteResponse>("/api/votes", {
    method: "POST",
    body: JSON.stringify({ contentId, voteType }),
  });
}

// 댓글 작성
export async function createComment(
  contentId: number,
  authorName: string,
  content: string,
  userVote: VoteType
): Promise<CommentResponse> {
  return apiFetch<CommentResponse>("/api/comments", {
    method: "POST",
    body: JSON.stringify({
      contentId,
      authorName,
      content,
      userVote,
    }),
  });
}

// 대댓글 작성
export async function createReply(
  commentId: number,
  authorName: string,
  content: string,
  userVote: VoteType
): Promise<ReplyResponse> {
  return apiFetch<ReplyResponse>(`/api/comments/${commentId}/replies`, {
    method: "POST",
    body: JSON.stringify({
      authorName,
      content,
      userVote,
    }),
  });
}

// 댓글 추천
export async function toggleCommentLike(
  commentId: number
): Promise<LikeResponse> {
  return apiFetch<LikeResponse>(`/api/comments/${commentId}/likes`, {
    method: "POST",
  });
}

// 에러 처리 유틸리티
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
}

// 관리자 API 함수들
export async function getAdminDashboard(): Promise<{
  stats: AdminDashboardStats;
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
}> {
  return apiFetch<{
    stats: AdminDashboardStats;
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
  }>("/api/admin/dashboard");
}

// 관리자 콘텐츠 목록 조회
export async function getAdminContents(): Promise<AdminContentInfo[]> {
  return apiFetch<AdminContentInfo[]>("/api/admin/contents");
}

// 관리자 콘텐츠 생성
export async function createAdminContent(data: {
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  status?: "DRAFT" | "PUBLISHED";
}): Promise<{
  success: boolean;
  content: AdminContentInfo;
}> {
  return apiFetch<{
    success: boolean;
    content: AdminContentInfo;
  }>("/api/admin/contents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 관리자 댓글 목록 조회
export async function getAdminComments(): Promise<AdminCommentInfo[]> {
  return apiFetch<AdminCommentInfo[]>("/api/admin/comments");
}

// 관리자 특정 콘텐츠 조회
export async function getAdminContent(id: number): Promise<AdminContentInfo> {
  return apiFetch<AdminContentInfo>(`/api/admin/contents/${id}`);
}

// 관리자 콘텐츠 수정
export async function updateAdminContent(
  id: number,
  data: {
    title: string;
    description: string;
    youtubeUrl: string;
    thumbnailUrl?: string;
    status?: "DRAFT" | "PUBLISHED";
  }
): Promise<{
  success: boolean;
  content: AdminContentInfo;
}> {
  return apiFetch<{
    success: boolean;
    content: AdminContentInfo;
  }>(`/api/admin/contents/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// 관리자 콘텐츠 삭제
export async function deleteAdminContent(id: number): Promise<{
  success: boolean;
  message: string;
}> {
  return apiFetch<{
    success: boolean;
    message: string;
  }>(`/api/admin/contents/${id}`, {
    method: "DELETE",
  });
}

// YouTube 임베드 검증
export async function validateYouTubeEmbed(youtubeUrl: string): Promise<{
  isEmbeddable: boolean;
  error?: string;
  reason?: string;
  videoInfo?: {
    title: string;
    author: string;
    thumbnailUrl: string;
    width: number;
    height: number;
  };
}> {
  return apiFetch<{
    isEmbeddable: boolean;
    error?: string;
    reason?: string;
    videoInfo?: {
      title: string;
      author: string;
      thumbnailUrl: string;
      width: number;
      height: number;
    };
  }>("/api/admin/youtube/validate", {
    method: "POST",
    body: JSON.stringify({ youtubeUrl }),
  });
}
