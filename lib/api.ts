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

export default api;
