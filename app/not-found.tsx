import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 (404)",
  description:
    "요청하신 페이지를 찾을 수 없습니다. 홈페이지로 돌아가서 다른 토론 주제를 찾아보세요.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "페이지를 찾을 수 없습니다",
    description: "요청하신 페이지를 찾을 수 없습니다.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/404`,
    isPartOf: {
      "@type": "WebSite",
      name: "이게 맞아?",
      url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />

        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-2xl">
            {/* 에러 아이콘 */}
            <div className="mb-8">
              <div className="text-8xl mb-4">🤔</div>
              <h1 className="text-6xl font-bold text-white mb-4">404</h1>
              <h2 className="text-2xl font-semibold text-gray-300 mb-4">
                이게 맞아? 페이지를 찾을 수 없어요
              </h2>
            </div>

            {/* 설명 */}
            <div className="mb-8 space-y-4">
              <p className="text-lg text-gray-300">
                요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
              </p>
              <p className="text-gray-400">
                URL을 다시 확인하시거나, 아래 버튼을 통해 홈페이지로 돌아가
                주세요.
              </p>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                  <Home className="h-5 w-5 mr-2" />
                  홈페이지로 돌아가기
                </Button>
              </Link>

              <BackButton />
            </div>

            {/* 추천 링크 */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                💡 이런 페이지는 어떠세요?
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <Search className="h-4 w-4 mr-2" />
                  최신 토론 주제
                </Link>
              </div>
            </div>

            {/* SEO를 위한 추가 정보 */}
            <div className="mt-8 text-sm text-gray-500">
              <p>
                문제가 지속되면 페이지가 삭제되었거나 URL이 변경되었을 수
                있습니다.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
