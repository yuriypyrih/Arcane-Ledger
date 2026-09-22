import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./TablePagination.module.css";

type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  alwaysVisible?: boolean;
  className?: string;
  totalLabel?: ReactNode;
  ariaLabel?: string;
};

function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  alwaysVisible = false,
  className,
  totalLabel,
  ariaLabel = "Pagination"
}: TablePaginationProps) {
  if (totalPages <= 1 && !alwaysVisible) {
    return null;
  }

  return (
    <nav className={clsx(styles.pagination, className)} aria-label={ariaLabel}>
      {totalLabel ? <span className={styles.total}>{totalLabel}</span> : null}
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </button>
      <span className={styles.status}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </nav>
  );
}

export default TablePagination;
