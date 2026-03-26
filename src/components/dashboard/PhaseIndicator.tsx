import type { Phase } from '@/types/api';
import styles from './PhaseIndicator.module.css';
import { PHASE_ORDER, PHASE_INFO } from '@/constants';

interface PhaseIndicatorProps {
  currentPhase: Phase;
  nextPhase: Phase | null;
}

export function PhaseIndicator({ currentPhase, nextPhase }: PhaseIndicatorProps) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>시스템 페이즈</h2>
        <span className={styles.currentLabel}>
          현재: {PHASE_INFO[currentPhase].label}
        </span>
      </div>

      <div className={styles.timeline}>
        <div
          className={styles.timelineProgress}
          style={{ width: `${(currentIndex / (PHASE_ORDER.length - 1)) * 100}%` }}
        />
        {PHASE_ORDER.map((phase, index) => {
          const info = PHASE_INFO[phase];
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isNext = phase === nextPhase;

          return (
            <div
              key={phase}
              className={`${styles.phase} ${isPast ? styles.past : ''} ${
                isCurrent ? styles.current : ''
              } ${isNext ? styles.next : ''}`}
            >
              <div className={styles.node}>
                <span className={styles.nodeDot}>
                  {isCurrent && <span className={styles.pulse} />}
                </span>
              </div>
              <div className={styles.info}>
                <span className={styles.label}>{info.label}</span>
                <span className={styles.description}>{info.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {nextPhase && (
        <div className={styles.nextInfo}>
          <span className={styles.nextLabel}>다음 페이즈</span>
          <span className={styles.nextValue}>{PHASE_INFO[nextPhase].label}</span>
        </div>
      )}
    </div>
  );
}
