import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import styles from './LoginPage.module.css';
import sofiaLogo from '@/assets/sofia-logo.png';

export function LoginPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const serverHealthy = useHealthCheck();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('인증 토큰을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);

    const success = await login(token.trim());

    if (success) {
      navigate('/');
    } else {
      setError('유효하지 않은 토큰입니다. 다시 확인해 주세요.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.background} />
      <div className={styles.pattern} />

      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src={sofiaLogo} alt="Sofia Logo" />
          </div>
          <h1 className={styles.title}>KSA 국제부 번역버디 ERP</h1>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="token">
              인증 토큰
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="token"
                type="password"
                className={`${styles.input} ${error ? styles.error : ''}`}
                placeholder="발급받은 토큰을 입력하세요"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle className={styles.errorIcon} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className={styles.spinner} />
                <span>확인 중...</span>
              </>
            ) : (
              <span>로그인</span>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            관리자에게 발급받은 인증 토큰으로 로그인하세요.
          </p>
        </div>
      </div>

      <div className={styles.healthCheck}>
        {serverHealthy === null ? (
          <span className={styles.healthChecking}>확인 중</span>
        ) : serverHealthy ? (
          <>
            <CheckCircle className={styles.healthIconOk} />
            <span>서버 정상</span>
          </>
        ) : (
          <>
            <XCircle className={styles.healthIconError} />
            <span>서버 장애</span>
          </>
        )}
      </div>
    </div>
  );
}
