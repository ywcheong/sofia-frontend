// 가온누리 게시글 기본 URL
// 환경 변수 VITE_GAONNURI_BASE_URL이 설정되어 있으면 사용, 없으면 기본값 사용
export const GAONNURI_BASE_URL =
  import.meta.env.VITE_GAONNURI_BASE_URL || 'http://sofia-api.ywcheong.com:8080';

interface Config {
  apiBaseUrl: string;
  authTokenPrefix: string;
  apiTimeout: number;
}

export const config: Config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  authTokenPrefix: 'user',
  apiTimeout: 30000,
};
