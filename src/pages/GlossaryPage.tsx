import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  X,
  Loader2,
} from 'lucide-react';
import styles from './GlossaryPage.module.css';
import type { EntryResponse } from '@/types/api';
import {
  getGlossaryEntries,
  createGlossaryEntry,
  updateGlossaryEntry,
  deleteGlossaryEntry,
} from '@/api/glossary';
import { PageError } from '@/components/common/PageError';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { useApiState, useModalState } from '@/hooks';

// 한글 자소 분리 및 초성 추출
function getKoreanInitialConsonant(text: string): string {
  const CHOSEONG = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
    'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
  ];

  const firstChar = text.charAt(0);
  const code = firstChar.charCodeAt(0);

  // 한글 유니코드 범위 (AC00-D7AF)
  if (code >= 0xAC00 && code <= 0xD7AF) {
    const choseongIndex = Math.floor((code - 0xAC00) / (21 * 28));
    return CHOSEONG[choseongIndex];
  }

  // 영문인 경우
  if (/[a-zA-Z]/.test(firstChar)) {
    return firstChar.toUpperCase();
  }

  // 기타
  return '#';
}

// 정렬 순서
const SORT_ORDER = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ',
  'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '#',
];

export function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  const [newTerm, setNewTerm] = useState({
    koreanTerm: '',
    englishTerm: '',
  });

  // API 상태 관리
  const {
    data: terms,
    loading,
    error: apiError,
    execute: loadTerms,
    setData: setTerms,
  } = useApiState<EntryResponse[]>({
    initialData: [],
  });

  // 모달 상태 관리
  const addModal = useModalState<{ koreanTerm: string }>({
    onClose: () => setNewTerm({ koreanTerm: '', englishTerm: '' }),
  });
  const editModal = useModalState<EntryResponse>();

  // 용어 추가/수정 제출 상태
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTerms(async () => getGlossaryEntries());
  }, [loadTerms]);

  // 필터링 및 정렬된 용어 목록
  const filteredTerms = useMemo(() => {
    let result = [...(terms ?? [])];

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.koreanTerm.toLowerCase().includes(query) ||
          t.englishTerm.toLowerCase().includes(query)
      );
    }

    // 정렬
    result.sort((a, b) => {
      const aInitial = getKoreanInitialConsonant(a.koreanTerm);
      const bInitial = getKoreanInitialConsonant(b.koreanTerm);
      const aIndex = SORT_ORDER.indexOf(aInitial);
      const bIndex = SORT_ORDER.indexOf(bInitial);

      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
      return a.koreanTerm.localeCompare(b.koreanTerm, 'ko');
    });

    return result;
  }, [terms, searchQuery]);

  // 자소별 그룹화
  const groupedByInitial = useMemo(() => {
    const groups = new Map<string, EntryResponse[]>();

    filteredTerms.forEach((term) => {
      const initial = getKoreanInitialConsonant(term.koreanTerm);
      if (!groups.has(initial)) {
        groups.set(initial, []);
      }
      groups.get(initial)!.push(term);
    });

    return groups;
  }, [filteredTerms]);

  // 사용 가능한 자소 목록
  const availableInitials = useMemo(() => {
    return Array.from(groupedByInitial.keys()).sort(
      (a, b) => SORT_ORDER.indexOf(a) - SORT_ORDER.indexOf(b)
    );
  }, [groupedByInitial]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleAddTerm = async () => {
    if (!newTerm.koreanTerm.trim()) return;

    try {
      setSubmitting(true);
      const created = await createGlossaryEntry({
        koreanTerm: newTerm.koreanTerm.trim(),
        englishTerm: newTerm.englishTerm.trim(),
      });
      setTerms([...(terms ?? []), created]);
      addModal.close();
    } catch {
      alert('용어 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTerm = async () => {
    if (!editModal.selectedItem || !editModal.selectedItem.koreanTerm.trim()) return;

    try {
      setSubmitting(true);
      const updated = await updateGlossaryEntry(editModal.selectedItem.id, {
        koreanTerm: editModal.selectedItem.koreanTerm.trim(),
        englishTerm: editModal.selectedItem.englishTerm.trim(),
      });
      setTerms(
        (terms ?? []).map((t) => (t.id === updated.id ? updated : t))
      );
      editModal.close();
    } catch {
      alert('용어 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTerm = async (id: string) => {
    if (!confirm('이 용어를 삭제하시겠습니까?')) return;

    try {
      await deleteGlossaryEntry(id);
      setTerms((terms ?? []).filter((t) => t.id !== id));
    } catch {
      alert('용어 삭제에 실패했습니다.');
    }
  };

  const scrollToInitial = (initial: string) => {
    const element = document.getElementById(`section-${initial}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 에러 상태 변환
  const error = apiError ? { message: apiError.message, status: apiError.status } : null;

  return (
    <div className={styles.page}>
      <PageHeader
        title="용어 사전"
        subtitle="번역 작업에 필요한 용어를 검색하고 관리합니다"
        actions={
          <button
            className={styles.addButton}
            onClick={() => addModal.open({ koreanTerm: '' })}
          >
            <Plus size={18} />
            <span>용어 추가</span>
          </button>
        }
      />

      {/* Search and Filter */}
      <section className={styles.controls}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="용어, 영문명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.clearButton}
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      {/* Index Navigation */}
      <nav className={styles.indexNav}>
        {SORT_ORDER.filter(
          (initial) =>
            availableInitials.includes(initial) || !searchQuery
        ).map((initial) => {
          const isAvailable = availableInitials.includes(initial);
          return (
            <button
              key={initial}
              className={`${styles.indexButton} ${isAvailable ? styles.active : ''}`}
              onClick={() => scrollToInitial(initial)}
              disabled={!isAvailable}
            >
              {initial}
            </button>
          );
        })}
      </nav>

      {/* Terms Count */}
      <div className={styles.countInfo}>
        <BookOpen size={16} />
        <span>총 {filteredTerms.length}개의 용어</span>
      </div>

      {/* Terms List */}
      <div className={styles.termsContainer}>
        {loading ? (
          <div className={styles.loading}>
            <Loader2 size={32} className={styles.loadingIcon} />
            <p>불러오는 중...</p>
          </div>
        ) : error ? (
          <PageError message={error.message} statusCode={error.status} onRetry={() => loadTerms(async () => getGlossaryEntries())} />
        ) : filteredTerms.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={48} />}
            title="검색 결과가 없습니다"
            description="다른 검색어나 카테고리를 시도해보세요"
          />
        ) : (
          Array.from(groupedByInitial.entries())
            .sort((a, b) => SORT_ORDER.indexOf(a[0]) - SORT_ORDER.indexOf(b[0]))
            .map(([initial, termsInInitial]) => {
              // 이 초성 내에서 한국어 단어별로 다시 그룹화
              const koreanGroupsInInitial = new Map<string, EntryResponse[]>();
              termsInInitial.forEach((term) => {
                if (!koreanGroupsInInitial.has(term.koreanTerm)) {
                  koreanGroupsInInitial.set(term.koreanTerm, []);
                }
                koreanGroupsInInitial.get(term.koreanTerm)!.push(term);
              });

              return (
                <section
                  key={initial}
                  id={`section-${initial}`}
                  className={styles.initialSection}
                >
                  <h2 className={styles.initialHeader}>
                    <span className={styles.initialBadge}>{initial}</span>
                    <span className={styles.initialCount}>{koreanGroupsInInitial.size}</span>
                  </h2>

                  <div className={styles.termsList}>
                    {Array.from(koreanGroupsInInitial.entries()).map(([koreanTerm, entries], index) => (
                      <article
                        key={koreanTerm}
                        className={`${styles.termCard} animate-slide-up`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div
                          className={styles.termHeader}
                          onClick={() => toggleExpand(koreanTerm)}
                        >
                          <div className={styles.termMain}>
                            <h3 className={styles.termTitle}>{koreanTerm}</h3>
                            <span className={styles.englishTermCount}>
                              {entries.length}개의 영어 단어
                            </span>
                          </div>

                          <div className={styles.termMeta}>
                            {expandedTerms.has(koreanTerm) ? (
                              <ChevronUp size={18} className={styles.expandIcon} />
                            ) : (
                              <ChevronDown size={18} className={styles.expandIcon} />
                            )}
                          </div>
                        </div>

                        <div
                          className={`${styles.termBody} ${expandedTerms.has(koreanTerm) ? styles.expanded : ''}`}
                        >
                          <div className={styles.englishTermsList}>
                            {entries.map((entry) => (
                              <div key={entry.id} className={styles.englishTermRow}>
                                <span className={styles.englishTermText}>
                                  {entry.englishTerm || '(영어 없음)'}
                                </span>
                                <div className={styles.termActions}>
                                  <button
                                    className={styles.iconButton}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      editModal.open(entry);
                                    }}
                                    title="수정"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    className={`${styles.iconButton} ${styles.deleteButton}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTerm(entry.id);
                                    }}
                                    title="삭제"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            className={styles.addEnglishButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewTerm({ koreanTerm, englishTerm: '' });
                              addModal.open({ koreanTerm });
                            }}
                          >
                            <Plus size={16} />
                            <span>영어 단어 추가</span>
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })
        )}
      </div>

      {/* Add Modal */}
      {addModal.isOpen && (
        <div className={styles.modalOverlay} onClick={() => addModal.close()}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>새 용어 추가</h3>
              <button
                className={styles.modalClose}
                onClick={() => addModal.close()}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>용어 *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newTerm.koreanTerm}
                  onChange={(e) => setNewTerm({ ...newTerm, koreanTerm: e.target.value })}
                  placeholder="한글 용어를 입력하세요"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>영문명</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newTerm.englishTerm}
                  onChange={(e) => setNewTerm({ ...newTerm, englishTerm: e.target.value })}
                  placeholder="English term (optional)"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => addModal.close()}
              >
                취소
              </button>
              <button
                className={styles.submitButton}
                onClick={handleAddTerm}
                disabled={!newTerm.koreanTerm.trim() || submitting}
              >
                {submitting ? '추가 중...' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && editModal.selectedItem && (
        <div className={styles.modalOverlay} onClick={() => editModal.close()}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>용어 수정</h3>
              <button
                className={styles.modalClose}
                onClick={() => editModal.close()}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>용어 *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editModal.selectedItem.koreanTerm}
                  onChange={(e) =>
                    editModal.setSelectedItem({ ...editModal.selectedItem!, koreanTerm: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>영문명</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editModal.selectedItem.englishTerm || ''}
                  onChange={(e) =>
                    editModal.setSelectedItem({ ...editModal.selectedItem!, englishTerm: e.target.value })
                  }
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => editModal.close()}
              >
                취소
              </button>
              <button
                className={styles.submitButton}
                onClick={handleEditTerm}
                disabled={!editModal.selectedItem.koreanTerm.trim() || submitting}
              >
                {submitting ? '수정 중...' : '수정'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
