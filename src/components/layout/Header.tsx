import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import type { Phase } from '@/types/api';
import { PHASE_ORDER, PHASE_INFO } from '@/constants';

interface HeaderProps {
  currentPhase: Phase;
  user?: {
    studentNumber: string;
    studentName: string;
    role: 'STUDENT' | 'ADMIN';
  };
  onLogout?: () => void;
}

function MiniDotDiagram({ currentPhase }: { currentPhase: Phase }) {
  const navigate = useNavigate();
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);

  const handleClick = () => {
    navigate('/settings');
  };

  return (
    <div className={styles.miniDotDiagram} onClick={handleClick}>
      {PHASE_ORDER.map((phase, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <span
            key={phase}
            className={`${styles.miniDot} ${isPast ? styles.miniDotPast : ''} ${
              isCurrent ? styles.miniDotCurrent : ''
            }`}
          />
        );
      })}
    </div>
  );
}

export function Header({ currentPhase, user, onLogout }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.phaseIndicator}>
          <MiniDotDiagram currentPhase={currentPhase} />
          <div className={styles.phaseTextContainer}>
            <span className={styles.phaseLabel}>현재 페이즈</span>
            <span className={styles.phaseName}>{PHASE_INFO[currentPhase].label}</span>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        {user ? (
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.studentName}</span>
              <span className={styles.userNumber}>{user.studentNumber}</span>
              {user.role === 'ADMIN' && (
                <span className={styles.adminBadge}>관리자</span>
              )}
            </div>
            {onLogout && (
              <button
                className={styles.logoutButton}
                onClick={onLogout}
                title="로그아웃"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        ) : (
          <div className={styles.loginPrompt}>
            <span>로그인이 필요합니다</span>
          </div>
        )}
      </div>
    </header>
  );
}
