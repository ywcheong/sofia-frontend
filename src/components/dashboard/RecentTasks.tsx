import type { TaskSummaryResponse } from '@/types/api';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './RecentTasks.module.css';
import { TASK_TYPE_LABELS } from '@/constants';

interface RecentTasksProps {
  tasks: TaskSummaryResponse[];
}

export function RecentTasks({ tasks }: RecentTasksProps) {
  if (tasks.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>최근 과제</h3>
        <div className={styles.empty}>
          <p>진행 중인 과제가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>최근 과제</h3>
        <span className={styles.count}>{tasks.length}건</span>
      </div>

      <div className={styles.list}>
        {tasks.slice(0, 5).map((task, index) => (
          <div
            key={task.id}
            className={`${styles.item} animate-slide-in`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={styles.iconWrapper}>
              {task.completed ? (
                <CheckCircle2 size={18} className={styles.completedIcon} />
              ) : (
                <Clock size={18} className={styles.pendingIcon} />
              )}
            </div>
            <div className={styles.content}>
              <span className={styles.description}>{task.taskDescription}</span>
              <div className={styles.meta}>
                <span className={styles.type}>
                  {TASK_TYPE_LABELS[task.taskType]}
                </span>
                {task.assigneeName && (
                  <>
                    <span className={styles.separator}>·</span>
                    <span className={styles.assignee}>{task.assigneeName}</span>
                  </>
                )}
              </div>
            </div>
            {task.completed && task.characterCount && (
              <div className={styles.charCount}>
                {task.characterCount.toLocaleString()}자
              </div>
            )}
            {!task.completed && task.assignedAt && (
              <div className={styles.warning}>
                <AlertCircle size={14} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
