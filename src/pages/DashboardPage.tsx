import { useState } from 'react';
import { Users, FileText, AlertTriangle, Clock } from 'lucide-react';
import { DashboardCard, PhaseIndicator, RecentTasks } from '@/components/dashboard';
import type { Phase, TaskSummaryResponse } from '@/types/api';

import styles from './DashboardPage.module.css';

// Mock data for development
const MOCK_PHASE: Phase = 'TRANSLATION';
const MOCK_TASKS: TaskSummaryResponse[] = [
  {
    id: '1',
    taskType: 'GAONNURI_POST',
    taskDescription: '[공지] 2026년 신입생 모집 안내',
    assigneeId: '101',
    assigneeStudentNumber: '24-001',
    assigneeName: '김민수',
    assignmentType: 'AUTOMATIC',
    assignedAt: '2026-03-20T10:30:00',
    characterCount: 2450,
    completed: true,
    completedAt: '2026-03-21T15:00:00',
    late: false,
    remindedAt: null,
  },
  {
    id: '2',
    taskType: 'GAONNURI_POST',
    taskDescription: '[공지] 2026년 동아리 가입 안내',
    assigneeId: '102',
    assigneeStudentNumber: '24-015',
    assigneeName: '이서연',
    assignmentType: 'AUTOMATIC',
    assignedAt: '2026-03-22T14:00:00',
    characterCount: null,
    completed: false,
    completedAt: null,
    late: false,
    remindedAt: null,
  },
  {
    id: '3',
    taskType: 'EXTERNAL_POST',
    taskDescription: '외부 기관 협력 번역',
    assigneeId: '103',
    assigneeStudentNumber: '23-008',
    assigneeName: '박지성',
    assignmentType: 'MANUAL',
    assignedAt: '2026-03-23T09:00:00',
    characterCount: null,
    completed: false,
    completedAt: null,
    late: false,
    remindedAt: '2026-03-25T09:00:00',
  },
  {
    id: '4',
    taskType: 'GAONNURI_POST',
    taskDescription: '[공지] 도서관 이용 안내',
    assigneeId: '104',
    assigneeStudentNumber: '24-022',
    assigneeName: '정하늘',
    assignmentType: 'AUTOMATIC',
    assignedAt: '2026-03-24T16:00:00',
    characterCount: 1890,
    completed: true,
    completedAt: '2026-03-26T10:30:00',
    late: true,
    remindedAt: null,
  },
];

const MOCK_STATS = {
  totalUsers: 12,
  activeUsers: 10,
  restingUsers: 2,
  totalTasks: 45,
  completedTasks: 38,
  pendingTasks: 7,
  totalCharacters: 87500,
};

export function DashboardPage() {
  const [currentPhase] = useState<Phase>(MOCK_PHASE);
  const [stats] = useState(MOCK_STATS);
  const [recentTasks] = useState<TaskSummaryResponse[]>(MOCK_TASKS);

  // In real app, fetch data from API
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const phaseRes = await api.get<GetCurrentPhaseResponse>('/system-phase');
  //     setCurrentPhase(phaseRes.currentPhase);
  //
  //     const usersRes = await api.get<PageUserSummaryResponse>('/users?pageable=...');
  //     const tasksRes = await api.get<PageTaskSummaryResponse>('/tasks?pageable=...');
  //   };
  //   fetchData();
  // }, []);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>대시보드</h1>
        <p className={styles.pageSubtitle}>번역버디 관리 현황을 한눈에 확인하세요</p>
      </header>

      <section className={styles.phaseSection}>
        <PhaseIndicator currentPhase={currentPhase} nextPhase="SETTLEMENT" />
      </section>

      <section className={styles.statsSection}>
        <DashboardCard
          title="전체 참가자"
          subtitle="승인된 번역버디"
          value={stats.totalUsers}
          icon={<Users size={20} />}
          variant="default"
          className="animate-slide-up delay-1"
        />
        <DashboardCard
          title="진행 중인 과제"
          subtitle="미완료 과제"
          value={stats.pendingTasks}
          icon={<FileText size={20} />}
          change={{ value: 3, type: 'increase' }}
          variant="accent"
          className="animate-slide-up delay-2"
        />
        <DashboardCard
          title="완료된 과제"
          subtitle="이번 시즌"
          value={stats.completedTasks}
          icon={<Clock size={20} />}
          change={{ value: 12, type: 'increase' }}
          variant="success"
          className="animate-slide-up delay-3"
        />
        <DashboardCard
          title="경고 발생"
          subtitle="지각 제출 등"
          value={2}
          icon={<AlertTriangle size={20} />}
          variant="warning"
          className="animate-slide-up delay-4"
        />
      </section>

      <section className={styles.contentSection}>
        <RecentTasks tasks={recentTasks} />
      </section>
    </div>
  );
}
