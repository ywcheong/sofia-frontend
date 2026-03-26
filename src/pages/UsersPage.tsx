import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getUsers,
  setRestStatus,
  adjustCharCount,
  promoteToAdmin,
  demoteFromAdmin,
} from '@/api/users';
import { ApiError } from '@/api/client';
import type { UserSummaryResponse, PageUserSummaryResponse, Role, UserSortField } from '@/types/api';
import { Modal, ModalHeader, ModalFooter } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/common/Badge';
import { PageError } from '@/components/common/PageError';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { useTableSorting, useTableFilters, useModalState } from '@/hooks';

import styles from './UsersPage.module.css';

const DEFAULT_PAGE_SIZE = 10;

type SortField = UserSortField;

interface UserFilters {
  search: string;
  role: Role | '';
  rest: boolean | '';
}

export function UsersPage() {
  const [users, setUsers] = useState<UserSummaryResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status: number } | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Search input state (separate from filter state)
  const [searchInput, setSearchInput] = useState('');

  // Adjust modal state
  const adjustModal = useModalState<{ userId: string; userName: string }>();
  const [adjustAmount, setAdjustAmount] = useState(0);

  // Filter state using custom hook
  const { filters, setFilter, resetFilters } = useTableFilters<UserFilters>({
    defaultFilters: { search: '', role: '', rest: '' },
  });

  // Sort state using custom hook
  const { sortState, toggleSort } = useTableSorting({
    defaultField: 'role',
    defaultDirection: 'ASC',
  });

  const renderSortIcon = (field: SortField) => {
    if (sortState.field !== field) {
      return <span className={styles.sortIcon}>↕</span>;
    }
    return (
      <span className={styles.sortIcon}>
        {sortState.direction === 'ASC' ? '▲' : '▼'}
      </span>
    );
  };

  const fetchUsers = useCallback(
    async (page: number, size: number) => {
      setLoading(true);
      try {
        setError(null);
        const response: PageUserSummaryResponse = await getUsers(
          { page, size },
          {
            search: filters.search || undefined,
            role: filters.role || undefined,
            rest: filters.rest === '' ? undefined : filters.rest,
            sortField: (sortState.field as SortField) || undefined,
            sortDirection: sortState.field ? sortState.direction : undefined,
          }
        );
        setUsers(response.content);
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
    [filters.search, filters.role, filters.rest, sortState.field, sortState.direction]
  );

  useEffect(() => {
    fetchUsers(0, pageSize);
  }, [fetchUsers, pageSize]);

  const handleSearch = () => {
    setFilter('search', searchInput);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    resetFilters();
  };

  const handleToggleRest = async (user: UserSummaryResponse) => {
    setProcessingIds((prev) => new Set(prev).add(user.id));
    try {
      await setRestStatus(user.id, { rest: !user.rest });
      toast.success(`${user.studentName}님의 휴식 상태가 ${!user.rest ? '설정' : '해제'}되었습니다`);
      await fetchUsers(currentPage, pageSize);
    } catch {
      // API 클라이언트에서 자동으로 에러 토스트 표시
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    }
  };

  const handleToggleRole = async (user: UserSummaryResponse) => {
    setProcessingIds((prev) => new Set(prev).add(user.id));
    try {
      if (user.role === 'STUDENT') {
        await promoteToAdmin(user.id);
        toast.success(`${user.studentName}님이 관리자로 승급되었습니다`);
      } else {
        await demoteFromAdmin(user.id);
        toast.success(`${user.studentName}님이 학생으로 강등되었습니다`);
      }
      await fetchUsers(currentPage, pageSize);
    } catch {
      // API 클라이언트에서 자동으로 에러 토스트 표시
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    }
  };

  const handleOpenAdjustModal = (user: UserSummaryResponse) => {
    adjustModal.open({ userId: user.id, userName: user.studentName });
    setAdjustAmount(0);
  };

  const handleSubmitAdjust = async () => {
    if (!adjustModal.selectedItem) return;
    const { userId, userName } = adjustModal.selectedItem;
    setProcessingIds((prev) => new Set(prev).add(userId));
    try {
      await adjustCharCount(userId, { amount: adjustAmount });
      toast.success(
        `${userName}님의 보정 자수가 ${adjustAmount >= 0 ? '+' : ''}${adjustAmount} 조정되었습니다`
      );
      adjustModal.close();
      await fetchUsers(currentPage, pageSize);
    } catch {
      // API 클라이언트에서 자동으로 에러 토스트 표시
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    fetchUsers(0, size);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="사용자 관리"
        subtitle="사용자 목록 조회, 휴식 설정, 보정 자수 조정, 권한 관리"
      />

      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="학번 또는 이름 검색..."
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
            value={filters.role}
            onChange={(e) => setFilter('role', e.target.value as Role | '')}
            className={styles.filterSelect}
          >
            <option value="">전체 권한</option>
            <option value="STUDENT">학생</option>
            <option value="ADMIN">관리자</option>
          </select>
          <select
            value={String(filters.rest)}
            onChange={(e) =>
              setFilter('rest', e.target.value === '' ? '' : e.target.value === 'true')
            }
            className={styles.filterSelect}
          >
            <option value="">전체 상태</option>
            <option value="false">활동 중</option>
            <option value="true">휴식 중</option>
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
          <PageError message={error.message} statusCode={error.status} onRetry={() => fetchUsers(currentPage, pageSize)} />
        ) : users.length === 0 ? (
          <EmptyState title="등록된 사용자가 없습니다" />
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th
                    className={`${styles.sortable} ${sortState.field === 'studentNumber' ? styles.sorted : ''}`}
                    onClick={() => toggleSort('studentNumber')}
                  >
                    학번
                    {renderSortIcon('studentNumber')}
                  </th>
                  <th
                    className={`${styles.sortable} ${sortState.field === 'studentName' ? styles.sorted : ''}`}
                    onClick={() => toggleSort('studentName')}
                  >
                    이름
                    {renderSortIcon('studentName')}
                  </th>
                  <th
                    className={`${styles.sortable} ${sortState.field === 'role' ? styles.sorted : ''}`}
                    onClick={() => toggleSort('role')}
                  >
                    권한
                    {renderSortIcon('role')}
                  </th>
                  <th
                    className={`${styles.sortable} ${sortState.field === 'warningCount' ? styles.sorted : ''}`}
                    onClick={() => toggleSort('warningCount')}
                  >
                    경고
                    {renderSortIcon('warningCount')}
                  </th>
                  <th
                    className={`${styles.sortable} ${sortState.field === 'totalCharCount' ? styles.sorted : ''}`}
                    onClick={() => toggleSort('totalCharCount')}
                  >
                    총 자수
                    {renderSortIcon('totalCharCount')}
                  </th>
                  <th>작업 자수</th>
                  <th>보정 자수</th>
                  <th
                    className={`${styles.sortable} ${sortState.field === 'rest' ? styles.sorted : ''}`}
                    onClick={() => toggleSort('rest')}
                  >
                    상태
                    {renderSortIcon('rest')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.studentNumber}</td>
                    <td>{user.studentName}</td>
                    <td>
                      <div className={styles.cellWithAction}>
                        <Badge variant={user.role === 'ADMIN' ? 'primary' : 'default'}>
                          {user.role === 'ADMIN' ? '관리자' : '학생'}
                        </Badge>
                        <button
                          className={user.role === 'ADMIN' ? styles.demoteButton : styles.promoteButton}
                          onClick={() => handleToggleRole(user)}
                          disabled={processingIds.has(user.id)}
                          title={user.role === 'ADMIN' ? '관리자 강등' : '관리자 승급'}
                        >
                          {user.role === 'ADMIN' ? '강등' : '승급'}
                        </button>
                      </div>
                    </td>
                    <td>{user.warningCount}</td>
                    <td>{user.totalCharCount.toLocaleString()}</td>
                    <td>{user.completedCharCount.toLocaleString()}</td>
                    <td>
                      <div className={styles.cellWithAction}>
                        <span>{user.adjustedCharCount.toLocaleString()}</span>
                        <button
                          className={styles.adjustButton}
                          onClick={() => handleOpenAdjustModal(user)}
                          disabled={processingIds.has(user.id)}
                          title="보정 자수 조정"
                        >
                          조정
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.cellWithAction}>
                        <Badge variant={user.rest ? 'warning' : 'success'}>
                          {user.rest ? '휴식 중' : '활동 중'}
                        </Badge>
                        <button
                          className={styles.restButton}
                          onClick={() => handleToggleRest(user)}
                          disabled={processingIds.has(user.id)}
                          title="휴식 상태 전환"
                        >
                          {user.rest ? '활동' : '휴식'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              itemName="명"
            />
          </>
        )}
      </div>

      <Modal isOpen={adjustModal.isOpen} onClose={adjustModal.close}>
        <ModalHeader title="보정 자수 조정" subtitle={adjustModal.selectedItem?.userName} />
        <div className={styles.modalInput}>
          <label>조정량 (양수: 증가, 음수: 감소)</label>
          <input
            type="number"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <ModalFooter>
          <button className={styles.modalCancelButton} onClick={adjustModal.close}>
            취소
          </button>
          <button className={styles.modalSubmitButton} onClick={handleSubmitAdjust}>
            확인
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
