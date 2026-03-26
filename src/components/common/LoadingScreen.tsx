import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  text?: string;
}

export function LoadingScreen({ text = '로딩 중...' }: LoadingScreenProps) {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContent}>
        <div className={styles.spinner} />
        <span className={styles.loadingText}>{text}</span>
      </div>
    </div>
  );
}
