"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname(); // 현재 경로에 따라 탭 하이라이트 처리를 위해 사용
  const [userId, setUserId] = useState<string | null>("");

  useEffect(() => {
    // 로컬 스토리지에서 유저 아이디 가져오기
    setUserId(localStorage.getItem("user_id"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* 로고 & 네비게이션 메뉴 */}
          <div className="flex items-center gap-8">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              <span className="text-xl font-extrabold text-slate-800">
                🛡️ Security Scanner
              </span>
            </div>
            <nav className="hidden md:flex space-x-2">
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  pathname.includes("/dashboard")
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                대시보드
              </Link>
              <Link
                href="/scan"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  pathname.includes("/scan")
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                스캔 및 관리
              </Link>
            </nav>
          </div>

          {/* 유저 프로필 & 로그아웃 버튼 */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 font-medium">
              <span className="text-blue-600 font-bold">{userId}</span> 님
            </div>
            <div className="h-4 w-px bg-slate-300"></div> {/* 구분선 */}
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-medium rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
