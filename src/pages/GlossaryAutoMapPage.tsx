import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Sparkles,
  Languages,
  Copy,
  Check,
  Loader2,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import styles from './GlossaryAutoMapPage.module.css';
import type { GlossaryAutoMapResponse } from '@/types/api';
import { glossaryAutoMap } from '@/api/glossary';

interface TooltipState {
  korean: string;
  english: string;
  x: number;
  y: number;
}

export function GlossaryAutoMapPage() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<GlossaryAutoMapResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);
  const [hasTranslated, setHasTranslated] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const data = await glossaryAutoMap({ text: inputText.trim() });
      setResults(data);
      setHasTranslated(true);
    } catch {
      setError('번역에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [inputText]);

  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
    setHasTranslated(false);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTerm(text);
      toast.success('복사되었습니다');
      setTimeout(() => {
        setCopiedTerm(null);
      }, 2000);
    } catch {
      // 클립보드 복사 실패 시 무시
    }
  };

  // 외부 클릭 시 말풍선 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setTooltip(null);
      }
    };
    if (tooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [tooltip]);

  const showTooltip = (e: React.MouseEvent, korean: string, english: string) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      korean,
      english,
      x: rect.left + rect.width / 2,
      y: rect.top - 36, // 툴팁 높이(약 32px) + 여유 공간
    });
  };

  const handleTermClick = async (e: React.MouseEvent, english: string, korean: string) => {
    e.stopPropagation();
    showTooltip(e, korean, english);
    await copyToClipboard(english);
  };

  // 결과 텍스트 생성 (용어 매핑이 적용된 텍스트) - 복사용
  const translatedText = useMemo(() => {
    if (!hasTranslated) return '';
    return inputText.split('\n').map(line => {
      let processedLine = line;
      results.forEach(result => {
        if (result.englishTerm) {
          const regex = new RegExp(result.koreanTerm, 'g');
          processedLine = processedLine.replace(regex, result.englishTerm);
        }
      });
      return processedLine;
    }).join('\n');
  }, [inputText, results, hasTranslated]);

  // 강조 표시가 포함된 JSX 요소 생성
  const highlightedElements = useMemo(() => {
    if (!hasTranslated) return null;

    // 영어 단어가 포함된 results만 필터링
    const validMappings = results.filter(r => r.englishTerm && r.englishTerm.trim() !== '');

    return inputText.split('\n').map((line, lineIndex) => {
      let processedLine = line;

      // 한국어를 영어로 변환하면서 플레이스홀더로 마킹
      const replacements: Array<{ english: string; korean: string; placeholder: string }> = [];
      validMappings.forEach(result => {
        const placeholder = `__TERM_${replacements.length}__`;
        const regex = new RegExp(result.koreanTerm, 'g');
        if (regex.test(processedLine)) {
          processedLine = processedLine.replace(new RegExp(result.koreanTerm, 'g'), placeholder);
          replacements.push({
            english: result.englishTerm!,
            korean: result.koreanTerm,
            placeholder,
          });
        }
      });

      // 플레이스홀더를 기준으로 분리
      const parts = processedLine.split(/(__TERM_\d+__)/g);

      return (
        <div key={lineIndex} className={styles.resultLine}>
          {parts.map((part, partIndex) => {
            const replacement = replacements.find(r => r.placeholder === part);
            if (replacement) {
              return (
                <strong
                  key={`${lineIndex}-${partIndex}`}
                  className={styles.highlightedTerm}
                  onClick={(e) => handleTermClick(e, replacement.english, replacement.korean)}
                  onMouseEnter={(e) => showTooltip(e, replacement.korean, replacement.english)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {replacement.english}
                </strong>
              );
            }
            return <span key={`${lineIndex}-${partIndex}`}>{part}</span>;
          })}
        </div>
      );
    });
  }, [inputText, results, hasTranslated]);

  const copyTranslatedText = async () => {
    if (translatedText) {
      await copyToClipboard(translatedText);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleGroup}>
            <h1 className={styles.pageTitle}>초벌 번역기</h1>
            <p className={styles.pageSubtitle}>
              텍스트를 입력하면 용어집에 등록된 용어를 자동으로 영어로 변환합니다
            </p>
          </div>
        </div>
      </header>

      {/* Translation Section */}
      <section className={styles.translationSection}>
        <div className={styles.inputPanel}>
          <div className={styles.panelHeader}>
            <FileText size={18} />
            <span>원문 (한국어)</span>
          </div>
          <textarea
            className={styles.textInput}
            placeholder="번역할 텍스트를 입력하세요..."
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            rows={12}
          />
        </div>

        <div className={styles.translateButtonWrapper}>
          <button
            className={styles.translateButton}
            onClick={handleTranslate}
            disabled={!inputText.trim() || loading}
          >
            {loading ? (
              <Loader2 size={20} className={styles.loadingIcon} />
            ) : (
              <Sparkles size={20} />
            )}
            <span>{loading ? '번역 중...' : '초벌 번역'}</span>
          </button>
        </div>

        <div className={styles.outputPanel}>
          <div className={styles.panelHeader}>
            <Languages size={18} />
            <span>번역 결과</span>
            {hasTranslated && translatedText && (
              <button
                className={styles.copyAllButton}
                onClick={copyTranslatedText}
                title="전체 복사"
              >
                {copiedTerm === translatedText ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}
                <span>복사</span>
              </button>
            )}
          </div>
          <div className={styles.textOutput}>
            {hasTranslated && highlightedElements ? (
              highlightedElements
            ) : (
              <span className={styles.placeholder}>
                번역 결과가 여기에 표시됩니다...
              </span>
            )}
            {tooltip && (
              <div
                ref={tooltipRef}
                className={styles.tooltip}
                style={{
                  position: 'fixed',
                  left: tooltip.x,
                  top: tooltip.y,
                  transform: 'translateX(-50%)',
                }}
              >
                <span className={styles.tooltipKorean}>{tooltip.korean}</span>
                <ArrowRight size={12} className={styles.tooltipArrow} />
                <span className={styles.tooltipEnglish}>{tooltip.english}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={handleTranslate} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      )}

      {/* Term Mappings Section */}
      {results.length > 0 && (
        <section className={styles.mappingsSection}>
          <div className={styles.mappingsHeader}>
            <h2>적용된 용어 매핑</h2>
            <span className={styles.mappingCount}>{results.length}개</span>
          </div>

          <div className={styles.mappingsList}>
            {results.map((result, index) => (
              <article key={`${result.koreanTerm}-${index}`} className={styles.mappingCard}>
                <div className={styles.mappingInfo}>
                  <span className={styles.koreanTerm}>{result.koreanTerm}</span>
                  <ArrowRight size={16} className={styles.arrowIcon} />
                  <span className={styles.englishTerm}>
                    {result.englishTerm || '(매칭 없음)'}
                  </span>
                  {result.englishTerm && (
                    <button
                      className={styles.copyButton}
                      onClick={() => copyToClipboard(result.englishTerm)}
                      title="복사"
                    >
                      {copiedTerm === result.englishTerm ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && !error && !hasTranslated && inputText.trim() === '' && (
        <div className={styles.empty}>
          <Sparkles size={48} className={styles.emptyIcon} />
          <p className={styles.emptyText}>텍스트를 입력하고 초벌 번역하세요</p>
          <p className={styles.emptySubtext}>
            용어집에 등록된 용어가 자동으로 영어로 변환됩니다
          </p>
        </div>
      )}
    </div>
  );
}
