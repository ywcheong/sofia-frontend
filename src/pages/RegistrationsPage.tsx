import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getRegistrations, acceptRegistration, rejectRegistration } from '@/api/registration';
import type { RegistrationSummaryResponse } from '@/types/api';
import { Pagination } from '@/components/common/Pagination';
import { PageError } from '@/components/common/PageError';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { usePaginatedData, useAsyncAction } from '@/hooks';

import styles from './RegistrationsPage.module.css';

export function RegistrationsPage() {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const {
    data: registrations,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    setPage,
    setSize,
    refresh,
  } = usePaginatedData<RegistrationSummaryResponse, void>({
    fetchFn: useCallback(async (page, size) => {
      const response = await getRegistrations({ page, size });
      return response;
    }, []),
    initialSize: 10,
  });

  const setProcessing = useCallback((id: string, isProcessing: boolean) => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      if (isProcessing) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const acceptAction = useAsyncAction(acceptRegistration, {
    onSuccess: () => {
      toast.success('승인되었습니다');
      refresh();
    },
  });

  const rejectAction = useAsyncAction(rejectRegistration, {
    onSuccess: () => {
      toast.success('거부되었습니다');
      refresh();
    },
  });

  const handleAccept = async (id: string) => {
    setProcessing(id, true);
    try {
      await acceptAction.execute(id);
    } finally {
      setProcessing(id, false);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id, true);
    try {
      await rejectAction.execute(id);
    } finally {
      setProcessing(id, false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="참가 신청"
        subtitle="대기 중인 참가 신청을 승인하거나 거부할 수 있습니다"
      />

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : error ? (
          <PageError
            message={error.message}
            statusCode={error.status}
            onRetry={refresh}
          />
        ) : registrations.length === 0 ? (
          <EmptyState title="대기 중인 신청이 없습니다" />
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>학번</th>
                  <th>이름</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{registration.studentNumber}</td>
                    <td>{registration.studentName}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.acceptButton}
                          onClick={() => handleAccept(registration.id)}
                          disabled={processingIds.has(registration.id)}
                        >
                          승인
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => handleReject(registration.id)}
                          disabled={processingIds.has(registration.id)}
                        >
                          거부
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={size}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              itemName="건"
            />
          </>
        )}
      </div>
    </div>
  );
}
