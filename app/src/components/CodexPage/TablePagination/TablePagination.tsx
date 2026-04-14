import clsx from "clsx";
import styles from "./TablePagination.module.css";

type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: TablePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={clsx(styles.pagination, className)}>
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
    </div>
  );
}

export default TablePagination;
