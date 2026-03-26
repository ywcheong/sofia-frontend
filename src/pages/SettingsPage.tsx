import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getCurrentPhase,
  checkTransitAvailability,
  transitToTranslation,
  transitToSettlement,
  transitToRecruitment,
  transitToDeactivation,
} from '@/api/phase';
import { PhaseIndicator } from '@/components/dashboard/PhaseIndicator';
import { Modal, ModalHeader, ModalFooter } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { PageError } from '@/components/common/PageError';
import { PageHeader } from '@/components/common/PageHeader';
import { usePhaseInvalidation } from '@/hooks/usePhase';
import { useApiState, useModalState } from '@/hooks';
import type {
  GetCurrentPhaseResponse,
  TransitAvailabilityResponse,
  DeactivationAvailabilityResponse,
  UserRetentionMode,
  PendingRegistrationResponse,
  IncompleteTaskResponse,
  Phase,
  TaskType,
} from '@/types/api';
import { PHASE_INFO, TASK_TYPE_LABELS } from '@/constants';
import styles from './SettingsPage.module.css';

type AvailabilityData = TransitAvailabilityResponse | DeactivationAvailabilityResponse;

export function SettingsPage() {
  // Phase data 상태 관리
  const {
    data: phaseData,
    loading,
    error,
    execute: executePhaseFetch,
  } = useApiState<GetCurrentPhaseResponse>();

  // Availability data 상태 관리
  const {
    data: availabilityData,
    loading: availabilityLoading,
    execute: executeAvailabilityFetch,
    setData: setAvailabilityData,
  } = useApiState<AvailabilityData>();

  // 모달 상태 관리
  const confirmModal = useModalState();
  const deactivationModal = useModalState();

  // 기타 상태
  const [transitting, setTransitting] = useState(false);
  const [selectedRetentionMode, setSelectedRetentionMode] = useState<UserRetentionMode>('KEEP_SELF');
  const [expandedSections, setExpandedSections] = useState({
    pendingRegistrations: false,
    incompleteTasks: false,
  });

  const { invalidatePhase } = usePhaseInvalidation();

  // 페이즈 데이터 가져오기
  const fetchPhaseData = useCallback(() => {
    executePhaseFetch(() => getCurrentPhase());
  }, [executePhaseFetch]);

  // 전환 가능 여부 데이터 가져오기
  const fetchAvailabilityData = useCallback(
    (nextPhase: Phase) => {
      executeAvailabilityFetch(() => checkTransitAvailability(nextPhase));
    },
    [executeAvailabilityFetch]
  );

  useEffect(() => {
    fetchPhaseData();
  }, [fetchPhaseData]);

  useEffect(() => {
    if (phaseData?.nextPhase) {
      fetchAvailabilityData(phaseData.nextPhase);
    }
  }, [phaseData?.nextPhase, fetchAvailabilityData]);

  const toggleSection = (section: 'pendingRegistrations' | 'incompleteTasks') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTransitPhase = async (userRetentionMode?: UserRetentionMode) => {
    if (!phaseData?.nextPhase) return;

    setTransitting(true);
    confirmModal.close();
    deactivationModal.close();

    try {
      let response;
      switch (phaseData.nextPhase) {
        case 'TRANSLATION':
          response = await transitToTranslation();
          break;
        case 'SETTLEMENT':
          response = await transitToSettlement();
          break;
        case 'RECRUITMENT':
          response = await transitToRecruitment();
          break;
        case 'DEACTIVATION':
          response = await transitToDeactivation(userRetentionMode || 'KEEP_SELF');
          break;
        default:
          return;
      }
      toast.success(
        `${PHASE_INFO[phaseData.currentPhase].label} → ${response.currentPhaseDisplayName}로 전환되었습니다`
      );
      await fetchPhaseData();
      setAvailabilityData(null);
      invalidatePhase();
    } catch {
      // API 클라이언트에서 자동으로 에러 토스트 표시
    } finally {
      setTransitting(false);
    }
  };

  const handleOpenConfirmModal = () => {
    if (phaseData?.nextPhase === 'DEACTIVATION') {
      deactivationModal.open();
    } else {
      confirmModal.open();
    }
  };

  const handleDeactivationConfirm = () => {
    handleTransitPhase(selectedRetentionMode);
  };

  const isTransitAvailable = (): boolean => {
    if (!availabilityData) return false;
    return availabilityData.available;
  };

  const getTransitDisabledReason = (): string | null => {
    if (availabilityLoading) return '전환 가능 여부 확인 중...';
    if (!availabilityData) return '전환 가능 여부를 확인할 수 없습니다.';
    if (availabilityData.available) return null;

    const pendingCount = 'pendingRegistrations' in availabilityData
      ? availabilityData.pendingRegistrations.length
      : 0;
    const incompleteCount = 'incompleteTasks' in availabilityData
      ? availabilityData.incompleteTasks.length
      : 0;

    if (phaseData?.nextPhase === 'TRANSLATION' && pendingCount > 0) {
      return `미처리 회원가입 신청 ${pendingCount}건이 있습니다.`;
    }
    if (phaseData?.nextPhase === 'SETTLEMENT') {
      const reasons: string[] = [];
      if (pendingCount > 0) reasons.push(`미처리 회원가입 신청 ${pendingCount}건`);
      if (incompleteCount > 0) reasons.push(`미완료 작업 ${incompleteCount}건`);
      if (reasons.length > 0) return reasons.join(', ') + '이 있습니다.';
    }
    return '전환할 수 없는 상태입니다.';
  };

  const renderPendingItems = () => {
    if (!availabilityData || !('pendingRegistrations' in availabilityData)) return null;
    const data = availabilityData as TransitAvailabilityResponse;

    if (data.pendingRegistrations.length === 0 && data.incompleteTasks.length === 0) {
      return null;
    }

    return (
      <div className={styles.pendingItemsContainer}>
        {data.pendingRegistrations.length > 0 && (
          <div className={styles.pendingSection}>
            <button
              className={styles.pendingSectionHeader}
              onClick={() => toggleSection('pendingRegistrations')}
              type="button"
            >
              <span className={styles.pendingSectionTitle}>
                미처리 회원가입 신청 ({data.pendingRegistrations.length}건)
              </span>
              <span className={styles.expandIcon}>
                {expandedSections.pendingRegistrations ? '▼' : '▶'}
              </span>
            </button>
            {expandedSections.pendingRegistrations && (
              <ul className={styles.pendingList}>
                {data.pendingRegistrations.map((item: PendingRegistrationResponse) => (
                  <li key={item.id} className={styles.pendingItem}>
                    <span className={styles.itemStudentNumber}>{item.studentNumber}</span>
                    <span className={styles.itemStudentName}>{item.studentName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {data.incompleteTasks.length > 0 && (
          <div className={styles.pendingSection}>
            <button
              className={styles.pendingSectionHeader}
              onClick={() => toggleSection('incompleteTasks')}
              type="button"
            >
              <span className={styles.pendingSectionTitle}>
                미완료 작업 ({data.incompleteTasks.length}건)
              </span>
              <span className={styles.expandIcon}>
                {expandedSections.incompleteTasks ? '▼' : '▶'}
              </span>
            </button>
            {expandedSections.incompleteTasks && (
              <ul className={styles.pendingList}>
                {data.incompleteTasks.map((item: IncompleteTaskResponse) => (
                  <li key={item.id} className={styles.pendingItem}>
                    <div className={styles.itemTaskInfo}>
                      <Badge variant={item.taskType === 'GAONNURI_POST' ? 'gaonnuri' : 'external'} size="md">
                        {TASK_TYPE_LABELS[item.taskType as TaskType]}
                      </Badge>
                      <span className={styles.itemTaskDescription}>{item.description}</span>
                    </div>
                    <span className={styles.itemAssignee}>담당: {item.assigneeName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="페이즈 설정"
        subtitle="시스템 운영 페이즈 관리 및 전환"
      />

      {loading ? (
        <div className={styles.loading}>불러오는 중...</div>
      ) : error ? (
        <PageError message={error.message} statusCode={error.status} onRetry={fetchPhaseData} />
      ) : (
        phaseData && (
          <div className={styles.content}>
            <PhaseIndicator
              currentPhase={phaseData.currentPhase}
              nextPhase={phaseData.nextPhase}
            />

            {phaseData.nextPhase && (
              <div className={styles.transitCard}>
                <h2 className={styles.cardTitle}>페이즈 전환</h2>
                <div className={styles.transitInfo}>
                  <div className={styles.transitFrom}>
                    <span className={styles.transitLabel}>현재</span>
                    <span className={styles.transitValue}>
                      {PHASE_INFO[phaseData.currentPhase].label}
                    </span>
                  </div>
                  <span className={styles.transitArrow}>→</span>
                  <div className={styles.transitTo}>
                    <span className={styles.transitLabel}>다음</span>
                    <span className={styles.transitValue}>
                      {PHASE_INFO[phaseData.nextPhase].label}
                    </span>
                  </div>
                </div>

                {availabilityLoading && (
                  <div className={styles.availabilityLoading}>
                    전환 가능 여부 확인 중...
                  </div>
                )}

                {!availabilityLoading && !isTransitAvailable() && (
                  <div className={styles.unavailableMessage}>
                    <span className={styles.unavailableIcon}>⚠️</span>
                    <span>{getTransitDisabledReason()}</span>
                  </div>
                )}

                {!availabilityLoading && renderPendingItems()}

                <button
                  className={styles.transitButton}
                  onClick={handleOpenConfirmModal}
                  disabled={transitting || availabilityLoading || !isTransitAvailable()}
                >
                  {PHASE_INFO[phaseData.nextPhase].label} 페이즈로 전환하기
                </button>
              </div>
            )}

            {!phaseData.nextPhase && (
              <div className={styles.finalPhaseCard}>
                <h2 className={styles.cardTitle}>페이즈 전환</h2>
                <p className={styles.finalPhaseMessage}>
                  현재 마지막 페이즈(비활성화)입니다. 더 이상 전환할 페이즈가 없습니다.
                </p>
              </div>
            )}
          </div>
        )
      )}

      <Modal isOpen={confirmModal.isOpen} onClose={confirmModal.close}>
        <ModalHeader
          title="페이즈 전환 확인"
          subtitle={
            phaseData?.nextPhase
              ? `정말로 ${PHASE_INFO[phaseData.currentPhase].label}에서 ${PHASE_INFO[phaseData.nextPhase].label}로 전환하시겠습니까?`
              : undefined
          }
        />
        <p className={styles.modalWarning}>이 작업은 되돌릴 수 없습니다.</p>
        <ModalFooter>
          <button
            className={styles.modalCancelButton}
            onClick={confirmModal.close}
          >
            취소
          </button>
          <button
            className={styles.modalConfirmButton}
            onClick={() => handleTransitPhase()}
            disabled={transitting}
          >
            전환하기
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deactivationModal.isOpen} onClose={deactivationModal.close}>
        <ModalHeader
          title="비활성화 전환"
          subtitle="시스템을 비활성화하기 전, 사용자 데이터 처리 방식을 선택해주세요."
        />
        <div className={styles.retentionOptions}>
          <label className={`${styles.retentionOption} ${selectedRetentionMode === 'KEEP_ALL' ? styles.retentionOptionSelected : ''}`}>
            <input
              type="radio"
              name="retentionMode"
              value="KEEP_ALL"
              checked={selectedRetentionMode === 'KEEP_ALL'}
              onChange={(e) => setSelectedRetentionMode(e.target.value as UserRetentionMode)}
            />
            <div className={styles.retentionOptionContent}>
              <span className={styles.retentionOptionTitle}>모든 사용자 유지</span>
              <span className={styles.retentionOptionDescription}>
                모든 사용자 데이터를 보존합니다.
              </span>
            </div>
          </label>
          <label className={`${styles.retentionOption} ${selectedRetentionMode === 'KEEP_ADMINS' ? styles.retentionOptionSelected : ''}`}>
            <input
              type="radio"
              name="retentionMode"
              value="KEEP_ADMINS"
              checked={selectedRetentionMode === 'KEEP_ADMINS'}
              onChange={(e) => setSelectedRetentionMode(e.target.value as UserRetentionMode)}
            />
            <div className={styles.retentionOptionContent}>
              <span className={styles.retentionOptionTitle}>관리자만 유지</span>
              <span className={styles.retentionOptionDescription}>
                관리자 계정만 보존하고, 일반 사용자는 삭제합니다.
              </span>
            </div>
          </label>
          <label className={`${styles.retentionOption} ${selectedRetentionMode === 'KEEP_SELF' ? styles.retentionOptionSelected : ''}`}>
            <input
              type="radio"
              name="retentionMode"
              value="KEEP_SELF"
              checked={selectedRetentionMode === 'KEEP_SELF'}
              onChange={(e) => setSelectedRetentionMode(e.target.value as UserRetentionMode)}
            />
            <div className={styles.retentionOptionContent}>
              <span className={styles.retentionOptionTitle}>본인만 유지</span>
              <span className={styles.retentionOptionDescription}>
                현재 로그인한 관리자 계정만 보존합니다.
              </span>
            </div>
          </label>
        </div>
        <p className={styles.modalWarning}>이 작업은 되돌릴 수 없습니다.</p>
        <div className={styles.modalDanger}>
          <p className={styles.modalDangerTitle}>비활성화 페이즈로 전환하면 현재 모든 작업이 삭제됩니다.</p>
          <p className={styles.modalDangerDesc}>필요할 경우 미리 엑셀 다운로드를 받아두세요.</p>
        </div>
        <ModalFooter>
          <button
            className={styles.modalCancelButton}
            onClick={deactivationModal.close}
          >
            취소
          </button>
          <button
            className={styles.modalConfirmButton}
            onClick={handleDeactivationConfirm}
            disabled={transitting}
          >
            비활성화하기
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
