"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ShieldCheck,
  AlertTriangle,
  History,
  TrendingDown,
  ChevronRight,
  Info,
  Activity,
} from "lucide-react";

// 심각도 테마 컬러 파레트
const SEVERITY_COLORS = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#3b82f6",
  INFO: "#94a3b8",
};

export default function DashboardPage() {
  const router = useRouter();

  // Mock 데이터 세팅 (실제 배포 및 시연 시 백엔드와 연동하기 딱 좋은 통계 포맷)
  const stats = {
    totalScans: 1248,
    healthScore: 92,
    activeThreats: 34,
    mttrDays: 3.2,
  };

  const severityData = [
    { name: "CRITICAL", value: 125 },
    { name: "HIGH", value: 312 },
    { name: "MEDIUM", value: 499 },
    { name: "LOW", value: 250 },
    { name: "INFO", value: 62 },
  ];

  const mttrTrendData = [
    { month: "1월", mttr: 5.2 },
    { month: "2월", mttr: 4.8 },
    { month: "3월", mttr: 4.1 },
    { month: "4월", mttr: 3.2 },
    { month: "5월", mttr: 3.0 },
  ];

  const recentScans = [
    {
      id: "SCN-2026-001",
      target: "auth-service / main",
      status: "COMPLETED",
      date: "2026-05-19 10:15",
      issues: "12 Critical, 4 High",
    },
    {
      id: "SCN-2026-002",
      target: "payment-gateway / dev",
      status: "IN_PROGRESS",
      date: "2026-05-19 11:30",
      issues: "분석 중...",
    },
    {
      id: "SCN-2026-003",
      target: "admin-portal / v2.1",
      status: "COMPLETED",
      date: "2026-05-18 16:45",
      issues: "3 Medium, 21 Low",
    },
    {
      id: "SCN-2026-004",
      target: "user-profile-api",
      status: "FAILED",
      date: "2026-05-18 14:20",
      issues: "인증 오류",
    },
    {
      id: "SCN-2026-005",
      target: "core-engine / stable",
      status: "COMPLETED",
      date: "2026-05-17 09:00",
      issues: "0 Critical, 2 Low",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          종합 보안 관제 대시보드
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          시스템 내 탐지된 보안 결함, 공급망 오픈소스 취약점 및 AI 시큐어 코드
          연동 로그를 종합 모니터링합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              누적 총 스캔 횟수
            </span>
            <p className="text-2xl font-black font-mono text-slate-800">
              {stats.totalScans.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
            <History className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              플랫폼 보안 점수
            </span>
            <p className="text-2xl font-black font-mono text-emerald-600">
              {stats.healthScore} / 100
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
              현재 탐지된 위협
            </span>
            <p className="text-2xl font-black font-mono text-red-600">
              {stats.activeThreats}{" "}
              <span className="text-xs font-medium text-slate-400">건</span>
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              평균 결함 조치 시간 (MTTR)
            </span>
            <p className="text-2xl font-black font-mono text-slate-800">
              {stats.mttrDays}{" "}
              <span className="text-xs font-medium text-slate-400">일</span>
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-purple-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[360px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-slate-500" /> 등급별 보안 결함
            분포 현황
          </h3>
          <div className="flex-1 flex items-center justify-center relative mt-2">
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          SEVERITY_COLORS[
                            entry.name as keyof typeof SEVERITY_COLORS
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                  />
                  <Legend
                    iconSize={7}
                    wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[360px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-purple-500" /> 월별 결함 조치
            시간 (MTTR) 추이 분석
          </h3>
          <div className="flex-1 w-full h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mttrTrendData}
                margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMttr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: "bold" }}
                  stroke="#e2e8f0"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: "bold" }}
                  stroke="#e2e8f0"
                />
                <Tooltip
                  contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                />
                <Area
                  type="monotone"
                  dataKey="mttr"
                  name="평균 조치일"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMttr)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-2 bg-slate-50 p-2 rounded-lg border">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            AI 패치 권고 코드 연동 스크린 적용 이후 조치 속도가 지난 분기 대비
            평균 42% 상향 단축되었습니다.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            최근 보안 스캔 이력 운영 로그
          </h3>
          <button
            onClick={() => router.push("/scans")}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            전체 리스트 열기 <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-medium">
            <thead>
              <tr className="bg-slate-100/70 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider">
                <th className="px-6 py-3.5">Scan ID</th>
                <th className="px-6 py-3.5">대상 프로젝트 / 파일</th>
                <th className="px-6 py-3.5">진행 상태</th>
                <th className="px-6 py-3.5">진단 완료 일시</th>
                <th className="px-6 py-3.5">탐지 내역</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentScans.map((scan) => (
                <tr
                  key={scan.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                    {scan.id}
                  </td>
                  <td className="px-6 py-3.5 font-semibold">{scan.target}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider ${
                        scan.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : scan.status === "IN_PROGRESS"
                            ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                            : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {scan.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-400">
                    {scan.date}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500 font-semibold">
                    {scan.issues}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
