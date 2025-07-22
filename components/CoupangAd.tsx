"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface CoupangAdProps {
  variant?: "card" | "banner";
  className?: string;
  showDisclaimer?: boolean;
}

export default function CoupangAd({
  variant = "card",
  className = "",
  showDisclaimer = false,
}: CoupangAdProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isAdBlocked, setIsAdBlocked] = useState(false);

  // 개발 환경 체크 및 광고 활성화 여부
  const isDevelopment =
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" && window.location.hostname === "localhost");
  const adsEnabled = process.env.NEXT_PUBLIC_ENABLE_COUPANG_ADS === "true";

  useEffect(() => {
    let adInstance: unknown = null;

    const checkAdBlocker = async () => {
      try {
        const testAd = document.createElement("div");
        testAd.innerHTML = "&nbsp;";
        testAd.className = "adsbox";
        testAd.style.height = "1px";
        document.body.appendChild(testAd);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const isBlocked = testAd.offsetHeight === 0;
        document.body.removeChild(testAd);

        if (isBlocked) {
          setIsAdBlocked(true);
          setIsLoading(false);
          return true;
        }
      } catch (e) {
        console.error("Ad blocker check failed:", e);
      }
      return false;
    };

    const loadCoupangScript = async () => {
      // 개발 환경이거나 광고가 비활성화된 경우 목업 표시
      if (isDevelopment || !adsEnabled) {
        console.info(
          "쿠팡파트너스: 개발 환경 또는 광고 비활성화 상태입니다. 목업이 표시됩니다."
        );
        setIsLoading(false);
        return;
      }

      // 광고 차단기 확인
      const blocked = await checkAdBlocker();
      if (blocked) return;

      try {
        // 스크립트가 이미 로드되었는지 확인
        if ("PartnersCoupang" in window && window.PartnersCoupang) {
          initializeAd();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://ads-partners.coupang.com/g.js";
        script.async = true;

        script.onload = () => {
          initializeAd();
        };

        script.onerror = () => {
          console.error("Failed to load Coupang Partners script");
          setHasError(true);
          setIsLoading(false);
        };

        document.body.appendChild(script);
      } catch (error) {
        console.error("Error loading Coupang ad:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    const initializeAd = () => {
      if (
        "PartnersCoupang" in window &&
        window.PartnersCoupang &&
        adContainerRef.current &&
        !adInstance
      ) {
        try {
          const PartnersCoupang = (window as any).PartnersCoupang;
          adInstance = new PartnersCoupang.G({
            id: 892801,
            template: "carousel",
            trackingCode: "AF4808659",
            width: variant === "banner" ? "680" : "300",
            height: variant === "banner" ? "140" : "250",
            tsource: "",
            container: adContainerRef.current,
          });
          setIsLoading(false);
        } catch (error) {
          console.error("Error initializing Coupang ad:", error);
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    if (typeof window !== "undefined") {
      loadCoupangScript();
    }

    // cleanup 함수를 위한 ref 복사
    const currentAdContainer = adContainerRef.current;

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (currentAdContainer) {
        currentAdContainer.innerHTML = "";
      }
      adInstance = null;
    };
  }, [variant, isDevelopment, adsEnabled]);

  // 개발 환경이거나 광고가 비활성화된 경우 목업 표시
  if ((isDevelopment || !adsEnabled) && !isLoading) {
    return (
      <div className={`w-full ${className}`}>
        {showDisclaimer && (
          <p className="text-center text-xs text-gray-400 mb-2">
            이 포스팅은 쿠팡 파트너스 활동의 일환으로 이에 따른 일정액의
            수수료를 제공받습니다.
          </p>
        )}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-3">
              쿠팡 파트너스 광고 (개발 모드)
            </p>
            <div
              className={`bg-gradient-to-r from-red-600 to-orange-500 rounded-lg text-white ${
                variant === "banner"
                  ? "h-[140px] max-w-[680px] mx-auto flex items-center justify-center"
                  : "h-[250px] max-w-[300px] mx-auto flex flex-col items-center justify-center"
              }`}
            >
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🛒</div>
                <h3 className="text-lg font-bold mb-1">쿠팡 파트너스</h3>
                <p className="text-sm opacity-90">
                  {variant === "banner"
                    ? "배너 광고 (680x140)"
                    : "카드 광고 (300x250)"}
                </p>
                <p className="text-xs mt-2 opacity-75">
                  프로덕션 환경에서 실제 광고가 표시됩니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 광고 차단기가 감지된 경우
  if (isAdBlocked) {
    return (
      <div className={`w-full ${className}`}>
        {showDisclaimer && (
          <p className="text-center text-xs text-gray-400 mb-2">
            이 포스팅은 쿠팡 파트너스 활동의 일환으로 이에 따른 일정액의
            수수료를 제공받습니다.
          </p>
        )}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-3">광고</p>
            <div className="bg-gray-700 rounded-lg p-6">
              <p className="text-sm text-gray-300 mb-2">
                광고 차단기가 감지되었습니다
              </p>
              <p className="text-xs text-gray-400">
                이 사이트는 광고 수익으로 운영됩니다. 광고 차단을 해제해 주시면
                감사하겠습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러가 발생한 경우
  if (hasError) {
    return (
      <div className={`w-full ${className}`}>
        {showDisclaimer && (
          <p className="text-center text-xs text-gray-400 mb-2">
            이 포스팅은 쿠팡 파트너스 활동의 일환으로 이에 따른 일정액의
            수수료를 제공받습니다.
          </p>
        )}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-3">광고</p>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400">광고를 불러올 수 없습니다</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {showDisclaimer && (
        <p className="text-center text-xs text-gray-400 mb-2">
          이 포스팅은 쿠팡 파트너스 활동의 일환으로 이에 따른 일정액의 수수료를
          제공받습니다.
        </p>
      )}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-3">쿠팡 파트너스 광고</p>

          {/* 반응형 컨테이너 */}
          <div className="relative overflow-hidden">
            {/* 로딩 상태 */}
            {isLoading && (
              <div
                className={`flex items-center justify-center bg-gray-700 rounded-lg ${
                  variant === "banner" ? "h-[140px]" : "h-[250px]"
                }`}
              >
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}

            {/* 광고 컨테이너 */}
            <div
              ref={adContainerRef}
              className={`${isLoading ? "hidden" : ""} ${
                variant === "banner"
                  ? "max-w-[680px] mx-auto"
                  : "max-w-[300px] mx-auto"
              }`}
              style={{
                minHeight: variant === "banner" ? "140px" : "250px",
              }}
            />
          </div>

          {/* 모바일 대응 메시지 */}
          {variant === "banner" && (
            <p className="text-xs text-gray-500 mt-2 sm:hidden">
              모바일에서는 광고가 축소되어 표시될 수 있습니다
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
