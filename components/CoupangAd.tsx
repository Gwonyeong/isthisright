"use client";

import { useEffect } from "react";

interface CoupangAdProps {
  variant?: "card" | "banner";
  className?: string;
}

export default function CoupangAd({ variant = "card", className = "" }: CoupangAdProps) {
  useEffect(() => {
    // 쿠팡 파트너스 스크립트를 동적으로 로드
    if (typeof window !== "undefined" && !(window as any).coupang) {
      const script = document.createElement("script");
      script.src = "https://ads-partners.coupang.com/g.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (variant === "banner") {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-3">광고</p>
            <div 
              className="coupang-ad-banner"
              data-size="728x90"
              data-tracking="true"
            >
              {/* 실제 쿠팡 배너 광고 코드가 들어갈 자리 */}
              <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg p-6 text-white text-center">
                <h3 className="text-lg font-bold mb-2">🛒 쿠팡 파트너스</h3>
                <p className="text-sm opacity-90">여기에 실제 광고가 표시됩니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 h-full">
        <div className="text-center h-full flex flex-col justify-center">
          <p className="text-xs text-gray-400 mb-3">광고</p>
          <div 
            className="coupang-ad-card"
            data-size="300x250"
            data-tracking="true"
          >
            {/* 실제 쿠팡 카드형 광고 코드가 들어갈 자리 */}
            <div className="bg-gradient-to-br from-red-600 to-orange-500 rounded-lg p-4 text-white text-center min-h-[200px] flex flex-col justify-center">
              <div className="text-3xl mb-2">🛒</div>
              <h3 className="text-base font-bold mb-1">쿠팡 파트너스</h3>
              <p className="text-xs opacity-90">광고 영역</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}