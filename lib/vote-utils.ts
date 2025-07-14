import { UserVoteType } from "./types";

// 쿠키에서 특정 콘텐츠의 투표 정보 가져오기
export function getVoteFromCookie(contentId: number): UserVoteType {
  if (typeof window === "undefined") return null;

  const cookieName = `vote_${contentId}`;
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === cookieName) {
      return value as UserVoteType;
    }
  }

  return null;
}

// 쿠키에 투표 정보 저장
export function saveVoteToCookie(
  contentId: number,
  voteType: UserVoteType
): void {
  if (typeof window === "undefined") return;

  const cookieName = `vote_${contentId}`;
  const cookieValue = voteType || "";
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1년 후 만료

  if (voteType === null) {
    // 투표 취소 시 쿠키 삭제
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } else {
    // 투표 정보 저장
    document.cookie = `${cookieName}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  }
}

// 사용자가 투표했는지 확인
export function hasUserVoted(contentId: number): boolean {
  return getVoteFromCookie(contentId) !== null;
}

// 투표 아이콘 가져오기
export function getVoteIcon(voteType: UserVoteType): {
  icon: string;
  color: string;
  label: string;
} {
  switch (voteType) {
    case "AGREE":
      return { icon: "👍", color: "text-blue-400", label: "찬성" };
    case "DISAGREE":
      return { icon: "👎", color: "text-red-400", label: "반대" };
    default:
      return { icon: "❓", color: "text-gray-400", label: "미투표" };
  }
}
