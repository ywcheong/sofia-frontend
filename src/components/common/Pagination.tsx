import styles from './Pagination.module.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  itemName?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  itemName = '건',
}: PaginationProps) {
  const currentGroupStart = Math.floor(currentPage / 10) * 10;
  const currentGroupEnd = Math.min(currentGroupStart + 9, totalPages - 1);

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  const pageNumbers: number[] = [];
  for (let i = currentGroupStart; i <= currentGroupEnd; i++) {
    pageNumbers.push(i);
  }

  const handleFirstPage = () => {
    if (currentPage > 0) {
      onPageChange(0);
    }
  };

  const handlePrevGroup = () => {
    const prevGroupPage = currentGroupStart - 10;
    if (prevGroupPage >= 0) {
      onPageChange(prevGroupPage);
    } else if (currentPage > 0) {
      onPageChange(0);
    }
  };

  const handleNextGroup = () => {
    const nextGroupPage = currentGroupStart + 10;
    if (nextGroupPage < totalPages) {
      onPageChange(nextGroupPage);
    } else if (currentPage < totalPages - 1) {
      onPageChange(totalPages - 1);
    }
  };

  const handleLastPage = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(totalPages - 1);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(parseInt(e.target.value, 10));
  };

  if (totalPages <= 1) {
    return (
      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          ({totalElements}{itemName})
        </span>
        <select
          className={styles.pageSizeSelect}
          value={pageSize}
          onChange={handlePageSizeChange}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}개씩 보기
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={styles.pagination}>
      <button
        className={styles.navButton}
        onClick={handleFirstPage}
        disabled={currentPage === 0}
        title="첫 페이지"
      >
        &lt;&lt;
      </button>
      <button
        className={styles.navButton}
        onClick={handlePrevGroup}
        disabled={currentGroupStart === 0}
        title="이전 10페이지"
      >
        &lt;
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          className={page === currentPage ? styles.pageButtonActive : styles.pageButton}
          onClick={() => onPageChange(page)}
        >
          {page + 1}
        </button>
      ))}

      <button
        className={styles.navButton}
        onClick={handleNextGroup}
        disabled={currentGroupEnd >= totalPages - 1}
        title="다음 10페이지"
      >
        &gt;
      </button>
      <button
        className={styles.navButton}
        onClick={handleLastPage}
        disabled={currentPage >= totalPages - 1}
        title="마지막 페이지"
      >
        &gt;&gt;
      </button>

      <span className={styles.pageInfo}>
        ({startItem}-{endItem}/{totalElements}{itemName})
      </span>

      <select
        className={styles.pageSizeSelect}
        value={pageSize}
        onChange={handlePageSizeChange}
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            {size}개씩 보기
          </option>
        ))}
      </select>
    </div>
  );
}
