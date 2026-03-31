import { toast } from 'react-toastify';
import { BACKEND_BASE_URL } from '@/config';

export class ApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getAuthToken(): string | null {
  return localStorage.getItem('sofia_token');
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
}

function showErrorToast(message: string, status: number): void {
  if (status >= 400 && status < 500) {
    toast.warning(message);
  } else {
    toast.error(message);
  }
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text();
    if (text) {
      const errorData: ApiErrorResponse = JSON.parse(text);
      return errorData.detail || errorData.message || errorData.error || `오류가 발생했습니다 (${response.status})`;
    }
  } catch {
    // JSON 파싱 실패 시 무시
  }
  return `오류가 발생했습니다 (${response.status})`;
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString() ? `?${searchParams.toString()}` : '';
}

type ReturnTypeOption = 'json' | 'void';

interface FetchApiOptions {
  method?: string;
  body?: unknown;
  returnType?: ReturnTypeOption;
}

async function fetchApi<T>(path: string, options?: FetchApiOptions): Promise<T> {
  const token = getAuthToken();
  const { method, body, returnType = 'json' } = options || {};

  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `user ${token}` } : {}),
    },
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('sofia_token');
    localStorage.removeItem('sofia_user');
    window.location.href = '/login';
    throw new ApiError('Unauthorized', response.status);
  }

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response);
    showErrorToast(errorMessage, response.status);
    throw new ApiError(errorMessage, response.status);
  }

  if (returnType === 'void') {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text);
}

export const api = {
  get: <T>(path: string) => fetchApi<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown, returnType?: ReturnTypeOption) =>
    fetchApi<T>(path, { method: 'POST', body, returnType }),
  put: <T>(path: string, body?: unknown) =>
    fetchApi<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) =>
    fetchApi<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) =>
    fetchApi<T>(path, { method: 'DELETE', returnType: 'void' }),
};
