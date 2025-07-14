import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    template: "%s | 이게 맞아?",
    default: "이게 맞아? - 영상 속 상황 토론 플랫폼",
  },
  description:
    "넷플릭스, 유튜브, 드라마 속 상황들에 대해 찬반 의견을 나누는 토론 플랫폼입니다. 영상의 특정 장면을 보고 여러분의 의견을 들려주세요.",
  keywords: [
    "토론",
    "영상",
    "넷플릭스",
    "유튜브",
    "드라마",
    "영화",
    "찬반",
    "의견",
    "토론 플랫폼",
  ],
  authors: [{ name: "이게 맞아? 팀" }],
  creator: "이게 맞아? 팀",
  publisher: "이게 맞아?",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "이게 맞아?",
    title: "이게 맞아? - 영상 속 상황 토론 플랫폼",
    description:
      "넷플릭스, 유튜브, 드라마 속 상황들에 대해 찬반 의견을 나누는 토론 플랫폼입니다.",
    url: "/",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "이게 맞아? - 영상 속 상황 토론 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "이게 맞아? - 영상 속 상황 토론 플랫폼",
    description:
      "넷플릭스, 유튜브, 드라마 속 상황들에 대해 찬반 의견을 나누는 토론 플랫폼입니다.",
    images: ["/og-image.jpg"],
    creator: "@isgettingright",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      "naver-site-verification": process.env.NAVER_SITE_VERIFICATION || "",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1f2937" />
        <meta name="color-scheme" content="dark" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
