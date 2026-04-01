// 가온누리 게시글 기본 URL
export const GAONNURI_BASE_URL =
  import.meta.env.VITE_GAONNURI_BASE_URL || 'http://example.com';

// 백엔드 API 기본 URL
// 프로덕션: VITE_BACKEND_BASE_URL=https://sofia-api.ywcheong.com
// 개발: VITE_BACKEND_BASE_URL='' (빈 값 → vite proxy가 대신 전달)
export const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || 'https://sofia-api.ywcheong.com';

interface Config {
  authTokenPrefix: string;
  apiTimeout: number;
}

export const config: Config = {
  authTokenPrefix: 'user',
  apiTimeout: 30000,
};
