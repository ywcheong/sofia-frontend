import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gaonnuri'
  | 'external';

export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  return (
    <span
      className={[
        styles.badge,
        styles[variant],
        styles[size],
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  );
}
