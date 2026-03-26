import styles from './PageError.module.css';

interface PageErrorProps {
  message: string;
  statusCode?: number;
  onRetry?: () => void;
}

export function PageError({ message, statusCode, onRetry }: PageErrorProps) {
  const isWarning = statusCode !== undefined && statusCode >= 400 && statusCode < 500;
  const variant = isWarning ? 'warning' : 'error';

  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      <div className={styles.icon}>
        {isWarning ? '!' : 'X'}
      </div>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  );
}
