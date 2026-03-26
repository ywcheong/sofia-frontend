import { NavLink } from 'react-router-dom';
import {
  Users,
  UserCog,
  FileText,
  BookOpen,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import styles from './Sidebar.module.css';
import logoImage from '@/assets/logo.png';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout?: () => void;
}

const NAV_ITEMS = [
  { path: '/', icon: FileText, label: '과제 관리', exact: true },
  { path: '/users', icon: UserCog, label: '사용자 관리' },
  { path: '/registrations', icon: Users, label: '참가 신청' },
  { path: '/glossary', icon: BookOpen, label: '용어 사전' },
  { path: '/translator', icon: Sparkles, label: '초벌 번역기' },
  { path: '/settings', icon: Settings, label: '페이즈 설정' },
];

export function Sidebar({ collapsed, onToggle, onLogout }: SidebarProps) {
  const serverHealthy = useHealthCheck();

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.logo}>
        <img src={logoImage} alt="SOFIA" className={styles.logoImage} />
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            end={item.exact}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={20} className={styles.navIcon} />
            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        className={styles.toggleButton}
        onClick={onToggle}
        aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
      >
        {collapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
      </button>

      <div className={styles.footer}>
        <button className={styles.logoutButton} onClick={onLogout}>
          <LogOut size={18} className={styles.logoutIcon} />
          {!collapsed && <span className={styles.logoutLabel}>로그아웃</span>}
        </button>
        {!collapsed && (
          <div className={styles.footerText}>
            <div className={styles.footerRow}>
              <span>KSA 번역버디</span>
              <span className={styles.footerVersion}>v1.0.0</span>
            </div>
            <div className={styles.healthRow}>
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
        )}
      </div>
    </aside>
  );
}
