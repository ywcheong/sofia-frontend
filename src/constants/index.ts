import type { AssignmentType, Phase, TaskType } from '@/types/api';

export const PHASE_ORDER: Phase[] = ['DEACTIVATION', 'RECRUITMENT', 'TRANSLATION', 'SETTLEMENT'];

export const PHASE_INFO: Record<Phase, { label: string; description: string }> = {
  DEACTIVATION: { label: '비활성', description: '시스템 비활성 상태' },
  RECRUITMENT: { label: '모집', description: '참가자 모집 기간' },
  TRANSLATION: { label: '번역', description: '번역 과제 진행 중' },
  SETTLEMENT: { label: '정산', description: '성과 정산 기간' },
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  GAONNURI_POST: '가온누리',
  EXTERNAL_POST: '외부',
};

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  AUTOMATIC: '자동',
  MANUAL: '수동',
};

// Task status types (defined on frontend before API implementation)
export type TaskStatus = 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED' | 'LATE_COMPLETED';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  IN_PROGRESS: '진행 중',
  OVERDUE: '기한 경과',
  COMPLETED: '완료됨',
  LATE_COMPLETED: '늦게 완료됨',
};
