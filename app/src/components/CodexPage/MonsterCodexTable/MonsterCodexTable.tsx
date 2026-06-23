import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { CodexStatus, MonsterListItem, MonsterOrdering } from "../../../types";
import TablePagination from "../TablePagination";
import styles from "./MonsterCodexTable.module.css";

type MonsterTableRowTone = "valid" | "invalid";

type MonsterCodexTableProps = {
  monsters: MonsterListItem[];
  totalEntries: number;
  status: CodexStatus;
  search?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ordering: MonsterOrdering;
  onOrderingChange: (ordering: MonsterOrdering) => void;
  onMonsterClick?: (monster: MonsterListItem) => void;
  renderNamePrefix?: (monster: MonsterListItem) => ReactNode;
  getRowTone?: (monster: MonsterListItem) => MonsterTableRowTone | null;
  heading?: string;
  className?: string;
  tableWrapperClassName?: string;
  paginationClassName?: string;
};

function formatChallengeRating(monster: MonsterListItem) {
  return monster.challengeRating ?? "-";
}

function getOrderingState(ordering: MonsterOrdering) {
  switch (ordering) {
    case "-name":
      return { field: "name", direction: "desc" } as const;
    case "cr":
    case "challenge_rating":
      return { field: "cr", direction: "asc" } as const;
    case "-cr":
    case "-challenge_rating":
      return { field: "cr", direction: "desc" } as const;
    case "name":
      return { field: "name", direction: "asc" } as const;
    case "type":
    case "-type":
    default:
      return { field: null, direction: "asc" } as const;
  }
}

function getNextOrdering(
  field: "name" | "cr",
  orderingState: ReturnType<typeof getOrderingState>
) {
  const isCurrentField = orderingState.field === field;
  const nextDirection = isCurrentField && orderingState.direction === "asc" ? "desc" : "asc";

  if (field === "cr") {
    return nextDirection === "asc" ? "challenge_rating" : "-challenge_rating";
  }

  return nextDirection === "asc" ? field : (`-${field}` as MonsterOrdering);
}

function getRowToneClassName(tone: MonsterTableRowTone | null | undefined) {
  switch (tone) {
    case "valid":
      return styles.tableRowValid;
    case "invalid":
      return styles.tableRowInvalid;
    default:
      return "";
  }
}

function getContainerClassName(baseClassName: string, className?: string) {
  return [baseClassName, className ?? ""].join(" ").trim();
}

function getHeaderSortLabel(field: "name" | "cr") {
  return field === "cr" ? "CR" : "Name";
}

function renderSortableHeaderCell(
  field: "name" | "cr",
  orderingState: ReturnType<typeof getOrderingState>,
  onOrderingChange: (ordering: MonsterOrdering) => void
) {
  const isActive = orderingState.field === field;
  const direction = isActive ? orderingState.direction : "asc";
  const headerClassName =
    field === "cr" ? `${styles.sortHeader} ${styles.crHeader}` : styles.sortHeader;

  return (
    <th
      key={field}
      className={headerClassName}
      data-active={isActive}
      aria-sort={getAriaSortValue(isActive, direction)}
    >
      <button
        type="button"
        className={styles.sortButton}
        onClick={() => onOrderingChange(getNextOrdering(field, orderingState))}
      >
        <span className={styles.sortButtonLabel}>{getHeaderSortLabel(field)}</span>
        <SortIcon isActive={isActive} direction={direction} />
      </button>
    </th>
  );
}

function MonsterCodexTable({
  monsters,
  totalEntries,
  status,
  search = "",
  currentPage,
  totalPages,
  onPageChange,
  ordering,
  onOrderingChange,
  onMonsterClick,
  renderNamePrefix,
  getRowTone,
  heading = "Monster Entries",
  className,
  tableWrapperClassName,
  paginationClassName
}: MonsterCodexTableProps) {
  const navigate = useNavigate();
  const totalEntriesLabel = `${totalEntries} total ${totalEntries === 1 ? "monster" : "monsters"}`;
  const orderingState = getOrderingState(ordering);

  function openMonster(monster: MonsterListItem) {
    if (onMonsterClick) {
      onMonsterClick(monster);
      return;
    }

    navigate({
      pathname: `/compendium/monsters/${monster.key}`,
      search: search.length > 0 ? `?${search}` : ""
    });
  }

  function renderStatusRow() {
    if (status === "loading") {
      return (
        <tr>
          <td colSpan={4} className={styles.statusCell}>
            <div className={styles.statusContent}>
              <strong>Loading monsters...</strong>
              <span>Fetching live monster data from the configured backend.</span>
            </div>
          </td>
        </tr>
      );
    }

    if (status === "error") {
      return (
        <tr>
          <td colSpan={4} className={styles.statusCell}>
            <div className={styles.statusContent}>
              <strong>Monsters unavailable</strong>
              <span>The monsters API could not be reached.</span>
            </div>
          </td>
        </tr>
      );
    }

    if (status === "server-unavailable") {
      return (
        <tr>
          <td colSpan={4} className={styles.statusCell}>
            <div className={styles.statusContent}>
              <strong>Server Unavailable</strong>
              <span>Monster data is unavailable because the backend is not configured or cannot be reached.</span>
            </div>
          </td>
        </tr>
      );
    }

    if (monsters.length === 0) {
      return (
        <tr>
          <td colSpan={4} className={styles.statusCell}>
            <div className={styles.statusContent}>
              <strong>No monsters found</strong>
              <span className={styles.emptyStatusText}>Try a different search or adjust the filters.</span>
            </div>
          </td>
        </tr>
      );
    }

    return monsters.map((monster) => {
      const rowTone = getRowTone?.(monster);

      return (
        <tr
          key={monster.id || monster.key}
          className={`${styles.tableRow} ${getRowToneClassName(rowTone)}`.trim()}
          onClick={() => openMonster(monster)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openMonster(monster);
            }
          }}
          tabIndex={0}
        >
          <td className={styles.nameCell}>
            <div className={styles.nameCellContent}>
              {renderNamePrefix ? renderNamePrefix(monster) : null}
              <strong>{monster.name}</strong>
            </div>
          </td>
          <td className={styles.typeCell}>{monster.typeName || "Unknown"}</td>
          <td className={`${styles.crCell} ${styles.numericCell}`}>{formatChallengeRating(monster)}</td>
          <td className={styles.sourceCell}>
            {monster.sourceKey || monster.sourceTitle || "Unknown Source"}
          </td>
        </tr>
      );
    });
  }

  return (
    <div className={getContainerClassName(styles.layout, className)}>
      <div className={styles.resultsHeader}>
        <h3>{heading}</h3>
        <div className={styles.resultsMeta}>
          <span className={styles.totalLabel}>{totalEntriesLabel}</span>
          {status === "ready" && monsters.length > 0 ? (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              className={paginationClassName}
            />
          ) : null}
        </div>
      </div>

      <div className={getContainerClassName(styles.tableWrapper, tableWrapperClassName)}>
        <table className={styles.table}>
          <thead>
            <tr>
              {renderSortableHeaderCell("name", orderingState, onOrderingChange)}
              <th className={styles.typeHeader}>Type</th>
              {renderSortableHeaderCell("cr", orderingState, onOrderingChange)}
              <th>Source</th>
            </tr>
          </thead>
          <tbody>{renderStatusRow()}</tbody>
        </table>
      </div>
    </div>
  );
}

function getAriaSortValue(isActive: boolean, direction: "asc" | "desc"): "ascending" | "descending" | "none" {
  if (!isActive) {
    return "none";
  }

  return direction === "asc" ? "ascending" : "descending";
}

function SortIcon({
  isActive,
  direction
}: {
  isActive: boolean;
  direction: "asc" | "desc";
}) {
  if (!isActive) {
    return <ArrowUpDown className={styles.sortIcon} aria-hidden="true" />;
  }

  return direction === "asc" ? (
    <ArrowUp className={styles.sortIcon} aria-hidden="true" />
  ) : (
    <ArrowDown className={styles.sortIcon} aria-hidden="true" />
  );
}


export default MonsterCodexTable;
