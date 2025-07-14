// 기본 타입 정의
export type VoteType = "AGREE" | "DISAGREE";
export type UserVoteType = VoteType | null; // 사용자 투표 상태 (투표하지 않은 경우 null)
export type ContentStatus = "DRAFT" | "PUBLISHED";
export type CommentStatus = "ACTIVE" | "FLAGGED" | "DELETED";

// 투표 정보
export interface VoteInfo {
  agree: number;
  disagree: number;
  total: number;
  agreePercentage: number;
}

// 콘텐츠 목록용 타입
export interface ContentSummary {
  id: number;
  title: string;
  description: string | null;
  youtube_video_id: string;
  thumbnail_url: string | null;
  is_shorts: boolean;
  views: number;
  votes: VoteInfo;
  comments: number;
  created_at: string;
  updated_at: string;
}

// 댓글 정보
export interface Comment {
  id: number;
  authorName: string;
  content: string;
  userVote: VoteType;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
}

// 대댓글 정보
export interface Reply {
  id: number;
  authorName: string;
  content: string;
  userVote: VoteType;
  createdAt: string;
  updatedAt: string;
}

// 콘텐츠 상세 정보
export interface ContentDetail {
  id: number;
  title: string;
  description: string | null;
  youtubeUrl: string;
  youtubeVideoId: string;
  thumbnailUrl: string | null;
  isShorts: boolean;
  views: number;
  votes: VoteInfo;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

// 투표 응답
export interface VoteResponse {
  success: boolean;
  userVote: VoteType;
  votes: VoteInfo;
}

// 댓글 작성 응답
export interface CommentResponse {
  success: boolean;
  comment: Comment;
}

// 대댓글 작성 응답
export interface ReplyResponse {
  success: boolean;
  reply: Reply;
}

// 댓글 추천 응답
export interface LikeResponse {
  success: boolean;
  action: "liked" | "unliked";
  likesCount: number;
  isLiked: boolean;
}

// 투표 확인 응답
export interface VoteCheckResponse {
  userVote: UserVoteType;
  votes: VoteInfo;
}

// 관리자 대시보드 통계
export interface AdminDashboardStats {
  totalContents: number;
  publishedContents: number;
  draftContents: number;
  totalVotes: number;
  totalComments: number;
  totalViews: number;
}

// 관리자 콘텐츠 정보
export interface AdminContentInfo {
  id: number;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_video_id: string;
  thumbnail_url: string | null;
  is_shorts: boolean;
  status: ContentStatus;
  views: number;
  votes: VoteInfo;
  comments: number;
  created_at: string;
  updated_at: string;
}

// 관리자 댓글 정보
export interface AdminCommentInfo {
  id: number;
  contentId: number;
  contentTitle: string;
  authorName: string;
  content: string;
  userVote: VoteType;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  type: "comment" | "reply";
  status: CommentStatus;
  parentId?: number;
}
