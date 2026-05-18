"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type ScanTabMode = "file" | "code";

export default function EnhancedScanPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ScanTabMode>("file");

  // 공통 옵션 상태
  const [selectedProfile, setSelectedProfile] = useState("security_core");
  const [useSbom, setUseSbom] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // [파일 업로드 모드] 전용 상태
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // [코드 직접 입력 모드] 전용 상태
  const [pastedCode, setPastedCode] = useState("");
  const [virtualFilename, setVirtualFilename] = useState(
    "vulnerable_snippet.py",
  );

  // 다중 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // 통합 스캔 요청 관리 핸들러
  const handleExecuteScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);

    try {
      let response;

      if (activeTab === "file") {
        // 📁 파일 업로드 로직 실행
        if (selectedFiles.length === 0)
          return alert("스캔할 파일을 선택해주세요.");
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("files", file));

        formData.append("profile", selectedProfile);
        formData.append("generate_sbom", String(useSbom));

        response = await api.post("/scans/run-upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // 💻 코드 직접 붙여넣기 로직 실행
        if (!pastedCode.trim())
          return alert("분석할 코드 내용을 입력해주세요.");

        response = await api.post("/scans/run-code", {
          code: pastedCode,
          filename: virtualFilename || "snippet.py",
          profile: selectedProfile,
        });
      }

      alert(`스캔 완료! 탐지된 보안 약점: ${response.data.issues_found}개`);
      router.push("/scans"); // 관리 이력 목록 화면으로 이동
    } catch (error: any) {
      console.error("Scan Request Failed:", error);
      alert("스캔 수행 중 오류가 발생했습니다. 라우터 상태를 점검하세요.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8">
        {/* 타이틀 헤더 세팅 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            다중 차원 보안 소스코드 스캔
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            원하는 코드를 직접 입력하거나 패키지 아카이브 파일을 업로드하여 정적
            웹 취약점 분석 엔진을 실시간 구동합니다.
          </p>
        </div>

        {/* 💡 상단 탭 셀렉터 전환 인터페이스 */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "file"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            📁 파일 및 아카이브 업로드
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "code"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            💻 코드 소스 직접 입력
          </button>
        </div>

        <form onSubmit={handleExecuteScan} className="space-y-6">
          {/* 탭 분기에 따른 동적 렌더링 카드 바디 */}
          {activeTab === "file" ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-blue-400 bg-slate-50/50 transition-colors">
              <input
                type="file"
                id="multi-file-picker"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
              <label
                htmlFor="multi-file-picker"
                className="cursor-pointer block"
              >
                <div className="text-5xl mb-4">📁</div>
                {selectedFiles.length > 0 ? (
                  <div className="text-blue-600 font-bold text-base">
                    {selectedFiles[0].name} 포함 총 {selectedFiles.length}개
                    파일 업로드 대기 중
                  </div>
                ) : (
                  <p className="text-slate-600 font-medium">
                    여러 파일을 마우스로 드래그하거나 여기를 클릭하여 선택하세요
                  </p>
                )}
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                  가상 소스 파일명 설정
                </label>
                <input
                  type="text"
                  value={virtualFilename}
                  onChange={(e) => setVirtualFilename(e.target.value)}
                  placeholder="예: SecurityInspectionController.java"
                  className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                  소스코드 컨텐츠 복사 / 붙여넣기
                </label>
                <textarea
                  value={pastedCode}
                  onChange={(e) => setPastedCode(e.target.value)}
                  className="w-full h-72 p-4 font-mono text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-slate-950 text-slate-100 leading-relaxed"
                  placeholder={`// 보안 취약점 점검을 가동할 코드를 입력하세요.\npublic void queryUser(String id) {\n    String query = "SELECT * FROM users WHERE id = '" + id + "'"; \n    // SQL 인젝션 취약 구문 테스트 예시\n}`}
                />
              </div>
            </div>
          )}

          {/* 하단 세부 조율 컨트롤러 */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex gap-6 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  스캔 프로파일
                </label>
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 font-medium outline-none"
                >
                  <option value="security_core">Core (CWE Top 25 기준)</option>
                  <option value="security_extended">
                    Extended (정밀 점검)
                  </option>
                  <option value="full">Full Engine Scan</option>
                </select>
              </div>

              {/* 💡 코드 스니펫 모드일 때는 종속성 분석(SBOM)이 불필요하므로 파일 모드에서만 체크박스 가시화 */}
              {activeTab === "file" && (
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="opt-sbom"
                    checked={useSbom}
                    onChange={(e) => setUseSbom(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label
                    htmlFor="opt-sbom"
                    className="text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    📦 SBOM 결과물 연계 생성
                  </label>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isScanning}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-40"
            >
              {isScanning ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  분석 엔진 연동 중...
                </>
              ) : (
                "보안 스캔 시작하기"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
