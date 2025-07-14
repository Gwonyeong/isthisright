// 간단한 관리자 인증 (실제 환경에서는 더 강력한 인증 시스템 사용)
const ADMIN_PASSWORD = "admin123"; // 실제로는 환경변수 사용

export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function setAdminSession(): void {
  if (typeof window === "undefined") return;

  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24); // 24시간 후 만료

  document.cookie = `admin_session=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
}

export function getAdminSession(): boolean {
  if (typeof window === "undefined") return false;

  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "admin_session" && value === "true") {
      return true;
    }
  }

  return false;
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;

  document.cookie =
    "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// YouTube URL에서 비디오 ID 추출
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// YouTube URL이 쇼츠인지 확인
export function isYouTubeShorts(url: string): boolean {
  return url.includes("/shorts/");
}
