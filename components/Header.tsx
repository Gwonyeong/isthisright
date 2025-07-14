"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-4 flex items-center space-x-2 lg:mr-6" href="/">
            <div className="hidden font-bold text-2xl text-white sm:inline-block">
              이게 맞아?
            </div>
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link className="flex items-center space-x-2 md:hidden" href="/">
              <span className="font-bold text-xl text-white">이게 맞아?</span>
            </Link>
          </div>
        </div>

        {/* 우측 액션 */}
        <div className="flex items-center space-x-4">
          {/* 모바일 메뉴 버튼 */}
          <button 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => console.log("Mobile menu clicked")}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
