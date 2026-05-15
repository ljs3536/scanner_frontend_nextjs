"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  AlertTriangle,
  Box,
  ShieldAlert,
  Download,
  ArrowLeft,
} from "lucide-react";
import {
  downloadSbomCycloneDx,
  getSbom,
  getSbomSummary,
  getSbomThreats,
  type SbomSummary,
  type SbomThreatResponse,
} from "@/lib/api";

// 심각도별 컬러 파레트 (레퍼런스 이미지 느낌)
const COLORS = {
  CRITICAL: "#ef4444", // Red
  HIGH: "#f97316", // Orange
  MEDIUM: "#eab308", // Yellow
  LOW: "#3b82f6", // Blue
  INFO: "#94a3b8", // Slate
};

export default function SbomDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [summary, setSummary] = useState<SbomSummary | null>(null);
  const [threats, setThreats] = useState<SbomThreatResponse | null>(null);
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        const [sumData, thrData, docData] = await Promise.all([
          getSbomSummary(id),
          getSbomThreats(id),
          getSbom(id),
        ]);
        setSummary(sumData);
        setThreats(thrData);
        setDocument(docData);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  // 차트용 데이터 가공
  const severityData = useMemo(() => {
    if (!threats) return [];
    return Object.entries(threats.summary.severity_totals)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [threats]);

  const components = document?.components || [];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        데이터를 분석 중입니다...
      </div>
    );
  }
  if (!summary || !threats)
    return (
      <div className="p-8 text-red-500">데이터를 불러오지 못했습니다.</div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. 상단 헤더 영역 */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/scans" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              정상
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">
            {components[0]?.name || summary.ecosystems[0] || "Project"}
          </h1>
          <div className="flex gap-4 text-sm text-slate-500 mt-2">
            <span>
              스캔 ID:{" "}
              <span className="text-slate-700 font-medium">
                {summary.scan_id || "N/A"}
              </span>
            </span>
            <span>
              형식:{" "}
              <span className="text-slate-700 font-medium">
                CycloneDX {summary.spec_version}
              </span>
            </span>
          </div>
        </div>
        <button
          onClick={() => downloadSbomCycloneDx(id)}
          className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium text-sm"
        >
          <Download className="w-4 h-4" /> 내보내기 (JSON)
        </button>
      </div>

      {/* 2. 핵심 요약 카드 (Metrics) */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Box className="w-4 h-4" /> 구성 요소
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {summary.component_count}
            <span className="text-sm font-normal text-slate-500 ml-1">
              전체
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <ShieldAlert className="w-4 h-4" /> 취약점 (CVE)
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {threats.summary.finding_count}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> 위협 점수
          </div>
          <div className="text-3xl font-bold text-amber-600">
            {threats.summary.risk_score}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            라이선스 종류
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            {summary.license_count || 0}
          </div>
        </div>
      </div>

      {/* 3. 통계 차트 영역 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 심각도 분포 도넛 차트 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">위협도 분포</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        COLORS[entry.name as keyof typeof COLORS] || COLORS.INFO
                      }
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 space-y-3">
              {severityData.map((entry) => (
                <div
                  key={entry.name}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS[entry.name as keyof typeof COLORS] ||
                          COLORS.INFO,
                      }}
                    ></div>
                    <span className="text-slate-600 font-medium">
                      {entry.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 핵심 시사점 (레퍼런스 반영) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            AI 보안 분석 브리핑
          </h3>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 h-64 overflow-y-auto">
            <ul className="space-y-4">
              {threats.summary.highlights.length > 0 ? (
                threats.summary.highlights.map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-slate-700"
                  >
                    <span className="mt-0.5 text-blue-500">•</span>
                    {text}
                  </li>
                ))
              ) : (
                <li className="text-slate-500 text-sm">
                  특이사항이 발견되지 않았습니다.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. 패키지 인벤토리 테이블 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            패키지 인벤토리{" "}
            <span className="text-sm font-normal text-slate-500 ml-2">
              총 {components.length}개
            </span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">패키지명</th>
                <th className="px-6 py-3 font-medium">버전</th>
                <th className="px-6 py-3 font-medium">유형</th>
                <th className="px-6 py-3 font-medium">라이선스</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {components.slice(0, 20).map((comp: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-800">
                    {comp.name}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {comp.version || "-"}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {comp.type || "library"}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {comp.licenses
                      ?.map((l: any) => l.license?.id || l.license?.name)
                      .join(", ") || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {components.length > 20 && (
            <div className="px-6 py-3 text-center text-sm text-slate-500 bg-slate-50 border-t border-slate-100">
              표시 제한: 상위 20개 패키지
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
