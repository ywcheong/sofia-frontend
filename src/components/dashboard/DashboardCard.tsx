import styles from './DashboardCard.module.css';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning';
  className?: string;
  children?: React.ReactNode;
}

export function DashboardCard({
  title,
  subtitle,
  value,
  change,
  icon,
  variant = 'default',
  className = '',
  children,
}: DashboardCardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]} ${className}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <div className={styles.titleGroup}>
            <h3 className={styles.title}>{title}</h3>
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <span className={styles.value}>{value}</span>
        {change && (
          <span className={`${styles.change} ${styles[change.type]}`}>
            {change.type === 'increase' && '↑'}
            {change.type === 'decrease' && '↓'}
            {change.value > 0 && '+'}
            {change.value}
          </span>
        )}
      </div>
      {children && <div className={styles.footer}>{children}</div>}
    </div>
  );
}
