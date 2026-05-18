"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileCode,
  Terminal,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  Wand2,
  Brain,
  Sparkles,
  Code2,
  FileText,
  CheckCircle,
} from "lucide-react";
import api, { fetchAiExplanation, fetchAiFix } from "@/lib/api";

type AiTaskMode = "explain" | "fix";

const COLORS = {
  CRITICAL: {
    text: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    main: "#dc2626",
  },
  HIGH: {
    text: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    main: "#ea580c",
  },
  MEDIUM: {
    text: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    main: "#ca8a04",
  },
  LOW: {
    text: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    main: "#2563eb",
  },
  INFO: {
    text: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    main: "#64748b",
  },
};

export default function AdvancedScanReportPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const [aiActiveTab, setAiActiveTab] = useState<AiTaskMode>("explain");
  const [aiResponses, setAiResponses] = useState<{
    explain: string | null;
    fix: string | null;
  }>({ explain: null, fix: null });

  useEffect(() => {
    if (!scanId) return;
    const fetchReport = async () => {
      try {
        const response = await api.get(`/scans/report/${scanId}`);
        setReportData(response.data);
        // 첫 번째 이슈를 기본 선택
        if (response.data.issues?.length > 0) {
          setSelectedIssueId(response.data.issues[0].issue_id);
        }
      } catch (error) {
        console.error("리포트 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [scanId]);

  useEffect(() => {
    // 이슈 바뀔 때마다 기존 AI 누적 데이터 초기화
    setAiResponses({ explain: null, fix: null });
  }, [selectedIssueId]);

  // 데이터 포맷 보정용 내부 마크다운 파서 헬퍼 함수
  const renderAiFormattedContent = (text: string | null) => {
    if (!text) return null;

    // 줄바꿈 기준으로 분할하여 정제 맵핑
    const lines = text.split("\n");
    return lines.map((line, index) => {
      let cleanedLine = line.trim();

      // 1. 대형 서브 헤더 파싱 (###)
      if (cleanedLine.startsWith("###")) {
        return (
          <h4
            key={index}
            className="text-sm font-bold text-slate-900 border-l-4 border-purple-500 pl-2 mt-4 mb-2 first:mt-1"
          >
            {cleanedLine.replace("###", "").trim()}
          </h4>
        );
      }
      // 2. 글머리 기호 파싱 (- 또는 *)
      if (cleanedLine.startsWith("-") || cleanedLine.startsWith("*")) {
        cleanedLine = cleanedLine.replace(/^[-*]\s*/, "");
      }

      // 3. 인라인 강조 표기 (**텍스트**) 변환 처리
      if (cleanedLine.includes("**")) {
        const parts = cleanedLine.split("**");
        return (
          <p
            key={index}
            className="text-sm text-slate-700 my-1 leading-relaxed"
          >
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong
                  key={i}
                  className="font-bold text-slate-900 bg-purple-50 px-1 rounded"
                >
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
          </p>
        );
      }

      if (!cleanedLine) return <div key={index} className="h-2" />;
      return (
        <p key={index} className="text-sm text-slate-600 my-1 leading-relaxed">
          {cleanedLine}
        </p>
      );
    });
  };
  // 💡 AI 통합 가이드 요청 핸들러
  const handleExecuteAiAdvisory = async (task: AiTaskMode) => {
    if (!activeIssue) return;
    setIsAiLoading(true);
    setAiActiveTab(task);

    try {
      if (task === "explain") {
        const result = await fetchAiExplanation({
          vulnerability_type: activeIssue.issue_title,
          cwe_id: activeIssue.cwe_id,
          severity: activeIssue.severity,
          file_path: activeIssue.file_path,
          line_number: activeIssue.line_number,
          code_snippet: activeIssue.code_snippet,
          framework: reportData.metadata.framework_detected || "Python",
          language: activeIssue.language || "python",
        });
        const content = result.explanation || result.response || result.content;
        setAiResponses((prev) => ({ ...prev, explain: content }));
      } else {
        const result = await fetchAiFix({
          vulnerability_type: activeIssue.issue_title,
          cwe_id: activeIssue.cwe_id,
          code_snippet: activeIssue.code_snippet || activeIssue.description,
          language: activeIssue.language || "python",
          preserve_functionality: true,
        });
        const content = result.fix_code || result.response || result.content;
        setAiResponses((prev) => ({ ...prev, fix: content }));
      }
    } catch (error) {
      console.error(error);
      alert("AI 솔루션 어드바이저 데이터 연동 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setIsAiLoading(false);
    }
  };

  // 필터링된 이슈 필터
  const filteredIssues = useMemo(() => {
    if (!reportData) return [];
    if (severityFilter === "ALL") return reportData.issues;
    return reportData.issues.filter(
      (issue: any) => issue.severity.toUpperCase() === severityFilter,
    );
  }, [reportData, severityFilter]);

  // 현재 우측 창에 띄울 선택된 이슈 정보
  const activeIssue = useMemo(() => {
    if (!reportData || !selectedIssueId) return null;
    return reportData.issues.find(
      (issue: any) => issue.issue_id === selectedIssueId,
    );
  }, [reportData, selectedIssueId]);

  if (isLoading)
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        보안 진단 결과를 로드 중입니다...
      </div>
    );
  if (!reportData)
    return (
      <div className="p-8 text-center text-red-500">
        보고서 데이터를 찾을 수 없습니다.
      </div>
    );

  const { metadata, severity_totals } = reportData;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* 1. 상단 미니멀 요약 바 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/scans")}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {metadata.target_name}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              ID: {metadata.scan_id} |{" "}
              {new Date(metadata.scan_date).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 상단 미니 필터 탭 */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-bold">
          <button
            onClick={() => setSeverityFilter("ALL")}
            className={`px-3 py-1.5 rounded-md transition ${severityFilter === "ALL" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            전체 ({metadata.issues_count})
          </button>
          {Object.entries(severity_totals).map(([sev, count]) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              disabled={count === 0}
              className={`px-3 py-1.5 rounded-md transition disabled:opacity-30 ${
                severityFilter === sev
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              {sev} ({count as number})
            </button>
          ))}
        </div>
      </div>

      {/* 2. 메인 워크벤치 레이아웃 (IDE 스타일 스플릿 뷰) */}
      <div className="flex h-[calc(100vh-13rem)] min-h-[650px] border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        {/* 💻 왼쪽 컬럼: 취약점 리스트 내역 서랍 */}
        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-3 border-b border-slate-200 bg-white flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Detection List ({filteredIssues.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
            {filteredIssues.map((issue: any) => {
              const isSelected = issue.issue_id === selectedIssueId;
              const sev = issue.severity.toUpperCase();
              const theme = COLORS[sev as keyof typeof COLORS] || COLORS.INFO;

              return (
                <div
                  key={issue.issue_id}
                  onClick={() => setSelectedIssueId(issue.issue_id)}
                  className={`p-4 cursor-pointer transition-all flex justify-between items-start border-l-4 ${
                    isSelected
                      ? "bg-blue-50/50 border-blue-600 shadow-inner"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-1 max-w-[90%]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded ${theme.bg} ${theme.text} border ${theme.border}`}
                      >
                        {issue.severity_ko || sev}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {issue.cwe_id || "CWE"}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {issue.type_ko || issue.issue_title}
                    </p>
                    <p className="text-xs font-mono text-slate-400 truncate">
                      {issue.file_path.split("/").pop()} : Line{" "}
                      {issue.line_number}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 mt-1 text-slate-300 transition-transform ${isSelected ? "translate-x-1 text-blue-500" : ""}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 🖥️ 오른쪽 컬럼: 실제 코드 스니펫 및 세부 조치 정보 가이드 컴포넌트 */}
        <div className="w-2/3 flex flex-col overflow-y-auto bg-slate-50/30">
          {activeIssue ? (
            <div className="p-6 space-y-6">
              {/* 우측 메타 헤더 벤치 가이드 */}
              <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {activeIssue.type_ko || activeIssue.issue_title}
                    </h2>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                      {activeIssue.analyzer || "core-engine"}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400">
                    파일 경로:{" "}
                    <span className="text-slate-700 font-medium">
                      {activeIssue.file_path}
                    </span>
                  </p>
                </div>

                {/* 💡 개편된 듀얼 AI 액션 유도 실행 토글 버튼 그룹 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExecuteAiAdvisory("explain")}
                    disabled={isAiLoading}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition shadow-sm ${
                      aiActiveTab === "explain" && aiResponses.explain
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    원인 심층 진단
                  </button>
                  <button
                    onClick={() => handleExecuteAiAdvisory("fix")}
                    disabled={isAiLoading}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition shadow-sm ${
                      aiActiveTab === "fix" && aiResponses.fix
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    시큐어 패치 코드 생성
                  </button>
                </div>
              </div>

              {/* 💡 개편된 렌더링 컨테이너: 날것의 문자열 파싱 패널 */}
              {(isAiLoading || aiResponses.explain || aiResponses.fix) && (
                <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/40 border border-purple-100 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-purple-100/60 pb-2">
                    <div className="flex items-center gap-2 text-purple-800 font-extrabold text-sm">
                      <Brain className="w-4 h-4 animate-pulse" />
                      <span>
                        {aiActiveTab === "explain"
                          ? "AI 가이드 취약점 보조 브리핑"
                          : "AI 제안 솔루션 시큐어 코딩"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] bg-white text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 font-bold">
                      <Sparkles className="w-2.5 h-2.5" /> Live Engine
                    </div>
                  </div>

                  {isAiLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                      <p className="font-medium text-purple-600 animate-pulse">
                        지능형 분석기 솔루션 매트릭스를 연산하고 있습니다...
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white/90 border border-white p-5 rounded-xl shadow-inner space-y-1 font-sans">
                      {/* 💡 흉물스러운 날것의 마크다운 대신 가공된 엘리먼트 배열을 실시간 인쇄 */}
                      {aiActiveTab === "explain"
                        ? renderAiFormattedContent(aiResponses.explain)
                        : renderAiFormattedContent(aiResponses.fix)}
                    </div>
                  )}
                </div>
              )}

              {/* 💡 핵심: 코드 에비던스 뷰어 (레퍼런스 이미지의 소스코드 공간 연동) */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" /> 코드 증거
                  분석 (Code Evidence)
                </h3>
                <div className="bg-slate-950 rounded-xl border border-slate-900 shadow-lg overflow-hidden font-mono text-xs text-slate-300">
                  <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800 text-slate-500 flex justify-between">
                    <span>{activeIssue.file_path.split("/").pop()}</span>
                    <span className="text-blue-400">
                      Line {activeIssue.line_number}
                    </span>
                  </div>
                  <div className="p-4 flex gap-4 bg-slate-950 leading-relaxed overflow-x-auto">
                    {/* 가상 라인 넘버 */}
                    <div className="text-slate-600 select-none text-right pr-2 border-r border-slate-800/80">
                      <div>{activeIssue.line_number - 1}</div>
                      <div className="text-red-500 font-bold">
                        {activeIssue.line_number}
                      </div>
                      <div>{activeIssue.line_number + 1}</div>
                    </div>
                    {/* 코드 바디 본문 */}
                    <div className="w-full space-y-0.5">
                      <div className="opacity-40">// ... context snippet</div>
                      <div className="text-rose-400 bg-rose-950/40 font-bold px-2 py-0.5 rounded border border-rose-900/50 my-1 shadow-sm">
                        {activeIssue.code_snippet ||
                          "// 원천 코드를 매핑할 수 없습니다."}
                      </div>
                      <div className="opacity-40">// ... context snippet</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 탐지 사유 및 설명 카드 피드 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-500" /> 정밀 진단
                    원인
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-sans">
                    {activeIssue.detection_reason_ko || activeIssue.description}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> 분류
                    기준 체계
                  </h4>
                  <div className="text-xs space-y-1 text-slate-600">
                    <div>
                      • 취약점 종류:{" "}
                      <span className="font-semibold text-slate-800">
                        {activeIssue.issue_title}
                      </span>
                    </div>
                    <div>
                      • CWE 분류 ID:{" "}
                      <span className="font-mono font-semibold text-blue-600 underline cursor-pointer">
                        {activeIssue.cwe_id || "N/A"}
                      </span>
                    </div>
                    <div>
                      • OWASP 카테고리:{" "}
                      <span className="font-semibold text-slate-800">
                        {activeIssue.owasp_id || "N/A"}
                      </span>
                    </div>
                    <div>
                      • 탐지 확신도 스코어:{" "}
                      <span className="font-bold text-emerald-600">
                        {(activeIssue.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 💡 핵심 2: 안전한 수정 제안 코드 블록 (Fix Suggestions) */}
              {activeIssue.fix_code && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{" "}
                    시큐어 코딩 패치 권고 (Fix Suggestion)
                  </h3>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 font-sans">
                    <p className="text-xs text-slate-600 bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-100">
                      💡{" "}
                      {activeIssue.fix_description_ko ||
                        "아래 가이드 코드를 참고하여 안전한 코딩 표준 규칙을 준수하세요."}
                    </p>
                    <div className="bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-lg overflow-x-auto leading-relaxed border border-slate-950 shadow-inner">
                      <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2">
                        // RECOMMENDED FIX PATCH CODE
                      </div>
                      <span className="text-emerald-400">
                        {activeIssue.fix_code}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 text-sm">
              <FileCode className="w-12 h-12 text-slate-200 mb-2" />
              분석 세부 정보를 확인하려면 왼쪽 리스트에서 결함 항목을
              선택하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
