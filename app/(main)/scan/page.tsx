"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ScanPage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // 분석기 옵션 상태 관리
  const [selectedProfile, setSelectedProfile] = useState("security_core");
  const [useLlmAdvisory, setUseLlmAdvisory] = useState(false);
  const [useSbom, setUseSbom] = useState(false);

  // 다중 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0)
      return alert("스캔할 파일을 하나 이상 선택해주세요.");
    setIsScanning(true);

    try {
      const formData = new FormData();

      // 1. 선택된 여러 파일을 순회하며 FormData에 모두 추가 ('files'라는 동일한 key 사용)
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      // 2. 엔진의 추가 옵션(Form) 데이터 추가
      formData.append("profile", selectedProfile);
      formData.append("llm_advisory", String(useLlmAdvisory));
      formData.append("generate_sbom", String(useSbom));

      // 3. 데모 백엔드 API 호출
      const response = await api.post("/scans/run-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(`스캔 완료! 발견된 취약점: ${response.data.issues_found}개`);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Scan Error:", error);
      alert("스캔 중 오류가 발생했습니다.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          다중 파일 보안 스캔
        </h1>
        <p className="text-slate-500 mb-8">
          여러 개의 소스코드 파일을 한 번에 분석합니다.
        </p>

        <form onSubmit={handleStartScan} className="space-y-6">
          {/* 파일 업로드 드롭존 */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:border-blue-400 transition-colors bg-slate-50">
            {/* multiple 속성 추가! */}
            <input
              type="file"
              id="multi-file-upload"
              className="hidden"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="multi-file-upload" className="cursor-pointer block">
              <div className="text-4xl mb-4">📁</div>
              {selectedFiles.length > 0 ? (
                <div className="text-blue-600 font-semibold">
                  {selectedFiles[0].name} 외 {selectedFiles.length - 1}개 파일
                  선택됨
                </div>
              ) : (
                <p className="text-slate-600 font-medium">
                  여러 파일을 드래그하거나 클릭하여 선택하세요
                </p>
              )}
            </label>
          </div>

          {/* 스캔 옵션 설정 (기획서 기반) */}
          <div className="grid grid-cols-3 gap-4 bg-white border border-slate-200 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                스캔 프로파일
              </label>
              <select
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded outline-none"
              >
                <option value="security_core">Core (빠름)</option>
                <option value="full">Full (정밀)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="llm-advisory"
                checked={useLlmAdvisory}
                onChange={(e) => setUseLlmAdvisory(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label
                htmlFor="llm-advisory"
                className="text-sm font-medium text-slate-700 cursor-pointer"
              >
                🤖 AI 코드 수정 제안
              </label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="sbom-gen"
                checked={useSbom}
                onChange={(e) => setUseSbom(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label
                htmlFor="sbom-gen"
                className="text-sm font-medium text-slate-700 cursor-pointer"
              >
                📦 SBOM 결과물 생성
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isScanning}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isScanning ? "분석 중..." : "다중 파일 스캔 시작"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
