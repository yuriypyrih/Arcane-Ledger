import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  clampDmToolsPage,
  DM_TOOLS_CUSTOM_PAGE_SIZE,
  getDmToolsPageCount
} from "./dmToolsPagination";
import styles from "./DmToolsPage.module.css";

type DmToolsPaginationControlsProps = {
  currentPage: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems: number;
};

function DmToolsPaginationControls({
  currentPage,
  itemLabel,
  onPageChange,
  pageSize = DM_TOOLS_CUSTOM_PAGE_SIZE,
  totalItems
}: DmToolsPaginationControlsProps) {
  const pageCount = getDmToolsPageCount(totalItems, pageSize);
  const normalizedCurrentPage = clampDmToolsPage(currentPage, totalItems, pageSize);

  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav className={styles.paginationControls} aria-label={`${itemLabel} pages`}>
      <button
        type="button"
        className={styles.paginationIconButton}
        disabled={normalizedCurrentPage <= 1}
        aria-label={`Previous ${itemLabel} page`}
        title="Previous page"
        onClick={() => onPageChange(Math.max(1, normalizedCurrentPage - 1))}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <span className={styles.paginationPageLabel}>
        Page {normalizedCurrentPage} of {pageCount}
      </span>
      <button
        type="button"
        className={styles.paginationIconButton}
        disabled={normalizedCurrentPage >= pageCount}
        aria-label={`Next ${itemLabel} page`}
        title="Next page"
        onClick={() => onPageChange(Math.min(pageCount, normalizedCurrentPage + 1))}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
}

export default DmToolsPaginationControls;
