import axios from "axios";

// FastAPI 백엔드 주소 기본 설정
const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// 요청(Request)을 보내기 직전에 가로채서 JWT 토큰을 헤더에 심어주는 로직
api.interceptors.request.use((config) => {
  // 브라우저 환경에서만 동작하도록 체크
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function downloadSbomCycloneDx(
  sbomId: string,
  filename?: string,
): Promise<void> {
  // 1. axios를 통해 데이터를 'blob'(Binary Large Object) 형태로 가져옵니다.
  // 이 과정에서 interceptor가 자동으로 Authorization 헤더(JWT)를 넣어줍니다.
  const response = await api.get(
    `/sbom/${sbomId}?format=cyclonedx-json&download=true`,
    {
      responseType: "blob",
    },
  );

  // 2. 받은 데이터를 브라우저가 인식할 수 있는 임시 URL로 만듭니다.
  const url = window.URL.createObjectURL(new Blob([response.data]));

  // 3. 가상의 <a> 태그를 만들어 클릭 이벤트를 발생시켜 다운로드를 실행합니다.
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename || `sbom-${sbomId}.cdx.json`);
  document.body.appendChild(link);
  link.click();

  // 4. 리소스 정리
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getSbom(
  sbomId: string,
): Promise<Record<string, unknown>> {
  const response = await api.get(`/sbom/${sbomId}?format=cyclonedx-json`);
  return response.data;
}

export async function getSbomSummary(sbomId: string): Promise<any> {
  const response = await api.get(`/sbom/${sbomId}/summary`);
  return response.data;
}

export async function getSbomThreats(sbomId: string): Promise<any> {
  const response = await api.get(`/sbom/${sbomId}/threats`);
  return response.data;
}

export interface SbomSummary {
  sbom_id: string;
  scan_id?: string | null;
  ecosystems: string[];
  component_count: number;
  dependency_edges?: number;
  license_count?: number;
  vulnerability_count: number;
  format?: string;
  spec_version?: string;
}

export interface SbomIndex {
  sbom_id: string;
  scan_id?: string | null;
  owner_key?: string | null;
  tenant_id?: string | null;
  project_slug?: string | null;
  branch?: string | null;
  commit_sha?: string | null;
  source_kind?: string | null;
  ecosystems: string[];
  component_count?: number;
  vulnerability_count?: number;
  created_at: string;
  cyclonedx_json: string;
}

export interface SbomThreatFinding {
  id: string;
  type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  component_ref: string;
  component_name: string;
  component_version?: string | null;
  ecosystem: string;
  message: string;
  recommendation?: string;
  evidence?: Record<string, unknown>;
}

export interface SbomThreatSummary {
  finding_count: number;
  risk_score: number;
  severity_totals: Record<string, number>;
  category_totals: Record<string, number>;
  vulnerable_components: string[];
  highlights: string[];
}

export interface SbomThreatResponse {
  sbom_id: string;
  scan_id?: string | null;
  summary: SbomThreatSummary;
  findings: SbomThreatFinding[];
}

export default api;
