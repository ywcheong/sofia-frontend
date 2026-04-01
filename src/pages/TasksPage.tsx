import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getTasks,
  createTask,
  downloadPerformanceReport,
  deleteTask,
  changeAssignee,
  type SortField as ApiSortField,
} from '@/api/tasks';
import { getUsers } from '@/api/users';
import { ApiError } from '@/api/client';
import type {
  TaskSummaryResponse,
  PageTaskSummaryResponse,
  UserSummaryResponse,
  PageUserSummaryResponse,
  TaskType,
  AssignmentType,
  SortDirection as ApiSortDirection,
} from '@/types/api';
import { Modal, ModalHeader, ModalFooter } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/common/Badge';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { PageError } from '@/components/common/PageError';
import { useTableSorting } from '@/hooks';
import { GAONNURI_BASE_URL } from '@/config';
import {
  TASK_TYPE_LABELS,
  TASK_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  type TaskStatus,
} from '@/constants';

import styles from './TasksPage.module.css';

const DEFAULT_PAGE_SIZE = 10;

// UI에서 정렬 가능한 필드 (API가 지원하는 필드만 포함)
type UISortField = 'assignedAt' | 'completedAt' | 'characterCount';

// UI 필드를 API 필드로 매핑
const UI_TO_API_SORT_FIELD: Record<UISortField, ApiSortField> = {
  assignedAt: 'assignedAt',
  completedAt: 'completedAt',
  characterCount: 'characterCount',
};

// Calculate task status function
function calculateTaskStatus(task: TaskSummaryResponse): TaskStatus {
  if (task.completed) {
    return task.late ? 'LATE_COMPLETED' : 'COMPLETED';
  }
  if (task.remindedAt) {
    return 'OVERDUE';
  }
  return 'IN_PROGRESS';
}

export function TasksPage() {
  // Pagination state
  const [tasks, setTasks] = useState<TaskSummaryResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<{ message: string; status: number } | null>(null);

  // Users state for modals
  const [users, setUsers] = useState<UserSummaryResponse[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState<TaskType | ''>('');
  const [assignmentTypeFilter, setAssignmentTypeFilter] = useState<AssignmentType | ''>('');
  const [completedFilter, setCompletedFilter] = useState<boolean | ''>('');

  // Sort state using custom hook
  const { sortState, toggleSort, resetSort } = useTableSorting({
    defaultField: 'assignedAt',
    defaultDirection: 'DESC',
  });

  // Create task modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<{
    taskType: TaskType;
    taskDescription: string;
    assignmentType: AssignmentType;
    assigneeId: string;
  }>({
    taskType: 'GAONNURI_POST',
    taskDescription: '',
    assignmentType: 'AUTOMATIC',
    assigneeId: '',
  });

  // Assignee change modal state
  const [assigneeChangeModal, setAssigneeChangeModal] = useState<{
    taskId: string;
    taskDescription: string;
    currentAssigneeId?: string;
    currentAssigneeName?: string;
  } | null>(null);
  const [newAssigneeId, setNewAssigneeId] = useState<string>('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    taskId: string;
    taskDescription: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(
    async (page: number, size: number) => {
      setLoading(true);
      try {
        setError(null);
        const response: PageTaskSummaryResponse = await getTasks({
          page,
          size,
          search: search || undefined,
          taskType: taskTypeFilter || undefined,
          assignmentType: assignmentTypeFilter || undefined,
          completed: completedFilter === '' ? undefined : completedFilter,
          sortField: sortState.field
            ? (UI_TO_API_SORT_FIELD[sortState.field as UISortField] as ApiSortField)
            : undefined,
          sortDirection: sortState.field
            ? (sortState.direction as ApiSortDirection)
            : undefined,
        });
        setTasks(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setCurrentPage(response.number);
      } catch (err) {
        if (err instanceof ApiError) {
          setError({ message: err.message, status: err.status });
        } else if (err instanceof Error) {
          setError({ message: err.message, status: 500 });
        }
      } finally {
        setLoading(false);
      }
    },
    [search, taskTypeFilter, assignmentTypeFilter, completedFilter, sortState]
  );

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response: PageUserSummaryResponse = await getUsers({
        page: 0,
        size: 100,
      });
      setUsers(response.content.filter((u) => !u.rest));
    } catch {
      console.error('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(0, pageSize);
  }, [fetchTasks, pageSize]);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setTaskTypeFilter('');
    setAssignmentTypeFilter('');
    setCompletedFilter('');
    resetSort();
  };

  const handleOpenCreateModal = () => {
    setNewTask({
      taskType: 'GAONNURI_POST',
      taskDescription: '',
      assignmentType: 'AUTOMATIC',
      assigneeId: '',
    });
    setCreateModalOpen(true);
    fetchUsers();
  };

  const handleSubmitCreate = async () => {
    const fieldName = newTask.taskType === 'GAONNURI_POST' ? '게시글 ID' : '과제 설명';
    if (!newTask.taskDescription.trim()) {
      toast.error(`${fieldName}을 입력해주세요`);
      return;
    }
    if (newTask.assignmentType === 'MANUAL' && !newTask.assigneeId) {
      toast.error('담당자를 선택해주세요');
      return;
    }
    try {
      const response = await createTask({
        taskType: newTask.taskType,
        taskDescription: newTask.taskDescription,
        assignmentType: newTask.assignmentType,
        assigneeId: newTask.assignmentType === 'MANUAL' ? newTask.assigneeId : undefined,
      });
      toast.success(
        response.assigneeName
          ? `과제가 ${response.assigneeName}님에게 할당되었습니다`
          : '과제가 생성되었습니다'
      );
      setCreateModalOpen(false);
      await fetchTasks(currentPage, pageSize);
    } catch {
      // 에러는 API 클라이언트에서 처리됨
    }
  };

  const handleOpenAssigneeChangeModal = (task: TaskSummaryResponse) => {
    setAssigneeChangeModal({
      taskId: task.id,
      taskDescription: task.taskDescription,
      currentAssigneeId: task.assigneeId ?? undefined,
      currentAssigneeName: task.assigneeName ?? undefined,
    });
    setNewAssigneeId(task.assigneeId || '');
    fetchUsers();
  };

  const handleSubmitAssigneeChange = async () => {
    if (!assigneeChangeModal) return;
    if (!newAssigneeId) {
      toast.error('담당자를 선택해주세요');
      return;
    }
    setProcessingIds((prev) => new Set(prev).add(assigneeChangeModal.taskId));
    try {
      await changeAssignee(assigneeChangeModal.taskId, { newAssigneeId });
      toast.success('담당자가 변경되었습니다');
      setAssigneeChangeModal(null);
      await fetchTasks(currentPage, pageSize);
    } catch {
      // 에러는 API 클라이언트에서 처리됨
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(assigneeChangeModal.taskId);
        return next;
      });
    }
  };

  const handleDownloadReport = async () => {
    try {
      const blob = await downloadPerformanceReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'performance.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // 에러는 API 클라이언트에서 처리됨
    }
  };

  const handleOpenDeleteModal = (task: TaskSummaryResponse) => {
    setDeleteModal({
      taskId: task.id,
      taskDescription: task.taskDescription,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await deleteTask(deleteModal.taskId);
      toast.success('과제가 삭제되었습니다');
      setDeleteModal(null);
      await fetchTasks(currentPage, pageSize);
    } catch {
      // 에러는 API 클라이언트에서 처리됨
    } finally {
      setDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchTasks(page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    fetchTasks(0, size);
  };

  // Sort toggle handler
  const handleSortToggle = (field: UISortField) => {
    toggleSort(field);
  };

  // Render sort icon
  const renderSortIcon = (field: UISortField) => {
    if (sortState.field !== field) {
      return <span className={styles.sortIcon}>↕</span>;
    }
    return (
      <span className={styles.sortIcon}>
        {sortState.direction === 'ASC' ? '▲' : '▼'}
      </span>
    );
  };

  // Render description cell
  const renderDescription = (task: TaskSummaryResponse) => {
    if (task.taskType === 'GAONNURI_POST') {
      const postId = task.taskDescription;
      return (
        <a
          href={`${GAONNURI_BASE_URL}/${postId}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.gaonnuriLink}
        >
          {postId}
        </a>
      );
    }
    return <span>{task.taskDescription}</span>;
  };

  // Page header actions
  const headerActions = (
    <div className={styles.headerActions}>
      <button className={styles.downloadButton} onClick={handleDownloadReport}>
        성과 보고서 다운로드
      </button>
      <button className={styles.createButton} onClick={handleOpenCreateModal}>
        과제 생성
      </button>
    </div>
  );

  return (
    <div className={styles.page}>
      <PageHeader title="과제 관리" subtitle="번역 과제 생성, 할당" actions={headerActions} />

      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="과제 설명 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button className={styles.searchButton} onClick={handleSearch}>
            검색
          </button>
        </div>
        <div className={styles.filterControls}>
          <select
            value={taskTypeFilter}
            onChange={(e) => setTaskTypeFilter(e.target.value as TaskType | '')}
            className={styles.filterSelect}
          >
            <option value="">전체 유형</option>
            <option value="GAONNURI_POST">가온누리</option>
            <option value="EXTERNAL_POST">외부</option>
          </select>
          <select
            value={assignmentTypeFilter}
            onChange={(e) => setAssignmentTypeFilter(e.target.value as AssignmentType | '')}
            className={styles.filterSelect}
          >
            <option value="">전체 방식</option>
            <option value="AUTOMATIC">자동</option>
            <option value="MANUAL">수동</option>
          </select>
          <select
            value={String(completedFilter)}
            onChange={(e) =>
              setCompletedFilter(e.target.value === '' ? '' : e.target.value === 'true')
            }
            className={styles.filterSelect}
          >
            <option value="">전체 상태</option>
            <option value="false">진행 중</option>
            <option value="true">완료됨</option>
          </select>
          <button className={styles.clearButton} onClick={handleClearFilters}>
            필터 초기화
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : error ? (
          <PageError
            message={error.message}
            statusCode={error.status}
            onRetry={() => fetchTasks(currentPage, pageSize)}
          />
        ) : tasks.length === 0 ? (
          <EmptyState title="등록된 과제가 없습니다" />
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>유형</th>
                  <th>설명</th>
                  <th>담당자</th>
                  <th>배정 방식</th>
                  <th
                    className={`${styles.sortable} ${sortState.field === 'assignedAt' ? styles.sorted : ''}`}
                    onClick={() => handleSortToggle('assignedAt')}
                  >
                    배정일
                    {renderSortIcon('assignedAt')}
                  </th>
                  <th
                    className={`${styles.sortable} ${sortState.field === 'completedAt' ? styles.sorted : ''}`}
                    onClick={() => handleSortToggle('completedAt')}
                  >
                    완료일
                    {renderSortIcon('completedAt')}
                  </th>
                  <th
                    className={`${styles.sortable} ${sortState.field === 'characterCount' ? styles.sorted : ''}`}
                    onClick={() => handleSortToggle('characterCount')}
                  >
                    자수
                    {renderSortIcon('characterCount')}
                  </th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const taskStatus = calculateTaskStatus(task);
                  return (
                    <tr key={task.id}>
                      <td>
                        <Badge
                          variant={task.taskType === 'GAONNURI_POST' ? 'gaonnuri' : 'external'}
                          size="md"
                        >
                          {TASK_TYPE_LABELS[task.taskType]}
                        </Badge>
                      </td>
                      <td className={styles.descriptionCell}>{renderDescription(task)}</td>
                      <td>
                        <div className={styles.assigneeCell}>
                          {task.assigneeName ? (
                            <span>
                              {task.assigneeStudentNumber} {task.assigneeName}
                            </span>
                          ) : (
                            <span className={styles.unassigned}>미배정</span>
                          )}
                          <button
                            className={styles.changeButton}
                            onClick={() => handleOpenAssigneeChangeModal(task)}
                            disabled={processingIds.has(task.id)}
                          >
                            변경
                          </button>
                        </div>
                      </td>
                      <td>{ASSIGNMENT_TYPE_LABELS[task.assignmentType]}</td>
                      <td>{task.assignedAt || '-'}</td>
                      <td>{task.completedAt || '-'}</td>
                      <td>{task.characterCount ? task.characterCount.toLocaleString() : '-'}</td>
                      <td>
                        <Badge
                          variant={
                            taskStatus === 'IN_PROGRESS'
                              ? 'info'
                              : taskStatus === 'OVERDUE'
                                ? 'danger'
                                : taskStatus === 'COMPLETED'
                                  ? 'success'
                                  : 'warning'
                          }
                        >
                          {TASK_STATUS_LABELS[taskStatus]}
                        </Badge>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleOpenDeleteModal(task)}
                            disabled={deleting && deleteModal?.taskId === task.id}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              itemName="건"
            />
          </>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <ModalHeader title="과제 생성" subtitle="새로운 번역 과제를 생성합니다" />
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>과제 유형</label>
            <select
              value={newTask.taskType}
              onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value as TaskType })}
            >
              <option value="GAONNURI_POST">가온누리</option>
              <option value="EXTERNAL_POST">외부</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>{newTask.taskType === 'GAONNURI_POST' ? '게시글 ID' : '과제 설명'}</label>
            <input
              type="text"
              value={newTask.taskDescription}
              onChange={(e) => setNewTask({ ...newTask, taskDescription: e.target.value })}
              placeholder={
                newTask.taskType === 'GAONNURI_POST'
                  ? '게시글 ID를 입력하세요'
                  : '과제 설명을 입력하세요'
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>배정 방식</label>
            <select
              value={newTask.assignmentType}
              onChange={(e) =>
                setNewTask({ ...newTask, assignmentType: e.target.value as AssignmentType })
              }
            >
              <option value="AUTOMATIC">자동 배정</option>
              <option value="MANUAL">수동 배정</option>
            </select>
          </div>
          {newTask.assignmentType === 'MANUAL' && (
            <div className={styles.formGroup}>
              <label>담당자</label>
              <select
                value={newTask.assigneeId}
                onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                disabled={usersLoading}
              >
                <option value="">담당자 선택</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.studentNumber} {user.studentName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <ModalFooter>
          <button className={styles.modalCancelButton} onClick={() => setCreateModalOpen(false)}>
            취소
          </button>
          <button className={styles.modalSubmitButton} onClick={handleSubmitCreate}>
            생성
          </button>
        </ModalFooter>
      </Modal>

      {/* Assignee Change Modal */}
      <Modal isOpen={!!assigneeChangeModal} onClose={() => setAssigneeChangeModal(null)}>
        <ModalHeader title="담당자 변경" subtitle={assigneeChangeModal?.taskDescription} />
        <div className={styles.modalBody}>
          <p className={styles.modalInfo}>
            현재 담당자: {assigneeChangeModal?.currentAssigneeName || '미배정'}
          </p>
          <div className={styles.formGroup}>
            <label>새 담당자</label>
            <select
              value={newAssigneeId}
              onChange={(e) => setNewAssigneeId(e.target.value)}
              disabled={usersLoading}
            >
              <option value="">담당자 선택</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.studentNumber} {user.studentName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ModalFooter>
          <button
            className={styles.modalCancelButton}
            onClick={() => setAssigneeChangeModal(null)}
          >
            취소
          </button>
          <button
            className={styles.modalSubmitButton}
            onClick={handleSubmitAssigneeChange}
            disabled={processingIds.has(assigneeChangeModal?.taskId || '')}
          >
            변경
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)}>
        <ModalHeader title="과제 삭제" subtitle="이 과제를 삭제하시겠습니까?" />
        <div className={styles.modalBody}>
          <p className={styles.deleteWarning}>삭제된 과제는 복구할 수 없습니다.</p>
          <p className={styles.modalInfo}>{deleteModal?.taskDescription}</p>
        </div>
        <ModalFooter>
          <button className={styles.modalCancelButton} onClick={() => setDeleteModal(null)}>
            취소
          </button>
          <button
            className={styles.modalDeleteButton}
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
