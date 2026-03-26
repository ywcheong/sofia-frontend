import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthUser } from '@/types/api';
import { config } from '@/config';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'sofia_token';
const USER_KEY = 'sofia_user';

// SSR-safe localStorage 유틸리티 함수들
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredAuth(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // localStorage 접근 실패 시 무시
  }
}

function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // localStorage 접근 실패 시 무시
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifyToken = useCallback(async (tokenToVerify: string): Promise<AuthUser | null> => {
    try {
      const response = await fetch('/auth/check', {
        headers: {
          'Authorization': `${config.authTokenPrefix} ${tokenToVerify}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          userId: data.userId,
          userStudentNumber: data.userStudentNumber,
          userStudentName: data.userStudentName,
        };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    async function initializeAuth(): Promise<void> {
      const storedToken = getStoredToken();
      if (storedToken) {
        const verifiedUser = await verifyToken(storedToken);
        if (verifiedUser) {
          setUser(verifiedUser);
          setToken(storedToken);
          setStoredAuth(storedToken, verifiedUser);
        } else {
          clearStoredAuth();
        }
      }
      setIsLoading(false);
    }

    initializeAuth();
  }, [verifyToken]);

  const login = useCallback(async (inputToken: string): Promise<boolean> => {
    setIsLoading(true);
    const verifiedUser = await verifyToken(inputToken);
    setIsLoading(false);

    if (verifiedUser) {
      setUser(verifiedUser);
      setToken(inputToken);
      setStoredAuth(inputToken, verifiedUser);
      return true;
    }
    return false;
  }, [verifyToken]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getToken(): string | null {
  return getStoredToken();
}
