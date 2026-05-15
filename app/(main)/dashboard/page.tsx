"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // 간단한 인증 체크 (토큰 없으면 로그인으로 튕겨냄)
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/");
    }
  }, [router]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">대시보드 개요</h1>
      <p className="text-slate-500">
        여기에 통계 차트와 최근 스캔 목록이 들어갈 예정입니다.
      </p>
    </div>
  );
}
