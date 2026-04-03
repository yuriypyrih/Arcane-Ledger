import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { CodexStatus, MonsterListItem, MonsterOrdering } from "../../../types";
import styles from "./MonsterCodexTable.module.css";

type MonsterCodexTableProps = {
  monsters: MonsterListItem[];
  totalEntries: number;
  status: CodexStatus;
  search: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ordering: MonsterOrdering;
  onOrderingChange: (ordering: MonsterOrdering) => void;
};

function formatChallengeRating(monster: MonsterListItem) {
  return monster.challengeRating || String(monster.cr);
}

function getOrderingState(ordering: MonsterOrdering) {
  switch (ordering) {
    case "-name":
      return { field: "name", direction: "desc" } as const;
    case "type":
      return { field: "type", direction: "asc" } as const;
    case "-type":
      return { field: "type", direction: "desc" } as const;
    case "cr":
      return { field: "cr", direction: "asc" } as const;
    case "-cr":
      return { field: "cr", direction: "desc" } as const;
    case "name":
    default:
      return { field: "name", direction: "asc" } as const;
  }
}

function getAriaSortValue(
  isActive: boolean,
  direction: "asc" | "desc"
): "ascending" | "descending" | "none" {
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

function MonsterCodexTable({
  monsters,
  totalEntries,
  status,
  search,
  currentPage,
  totalPages,
  onPageChange,
  ordering,
  onOrderingChange
}: MonsterCodexTableProps) {
  const navigate = useNavigate();
  const totalEntriesLabel = `${totalEntries} total ${totalEntries === 1 ? "monster" : "monsters"}`;
  const orderingState = getOrderingState(ordering);

  function openMonster(slug: string) {
    navigate({
      pathname: `/codex/monsters/${slug}`,
      search: search.length > 0 ? `?${search}` : ""
    });
  }

  function handleOrderingToggle(field: "name" | "type" | "cr") {
    const isCurrentField = orderingState.field === field;
    const nextDirection = isCurrentField && orderingState.direction === "asc" ? "desc" : "asc";
    const nextOrdering =
      nextDirection === "asc" ? field : (`-${field}` as MonsterOrdering);

    onOrderingChange(nextOrdering);
  }

  return (
    <>
      <div className={styles.resultsHeader}>
        <h3>Monster Entries</h3>
        <span>{totalEntriesLabel}</span>
      </div>

      {status === "loading" ? (
        <div className={styles.grid}>
          <article className={styles.card}>
            <h4>Loading monsters...</h4>
            <p>Fetching live monster data from the local backend.</p>
          </article>
        </div>
      ) : null}

      {status === "error" ? (
        <div className={styles.grid}>
          <article className={styles.card}>
            <h4>Monsters unavailable</h4>
            <p>The monsters API could not be reached.</p>
          </article>
        </div>
      ) : null}

      {status === "ready" && monsters.length === 0 ? (
        <div className={styles.grid}>
          <article className={styles.card}>
            <h4>No monsters found</h4>
            <p>Try a different name search or reset to page 1.</p>
          </article>
        </div>
      ) : null}

      {status === "ready" && monsters.length > 0 ? (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {(["name", "type", "cr"] as const).map((field) => {
                    const isActive = orderingState.field === field;
                    const direction = isActive ? orderingState.direction : "asc";
                    const label = field === "cr" ? "CR" : field === "name" ? "Name" : "Type";
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
                          onClick={() => handleOrderingToggle(field)}
                        >
                          <span className={styles.sortButtonLabel}>{label}</span>
                          <SortIcon isActive={isActive} direction={direction} />
                        </button>
                      </th>
                    );
                  })}
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {monsters.map((monster) => (
                  <tr
                    key={monster.id || monster.slug}
                    className={styles.tableRow}
                    onClick={() => openMonster(monster.slug)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openMonster(monster.slug);
                      }
                    }}
                    tabIndex={0}
                  >
                    <td className={styles.nameCell}>
                      <strong>{monster.name}</strong>
                    </td>
                    <td className={styles.typeCell}>{monster.type || "Unknown"}</td>
                    <td className={`${styles.crCell} ${styles.numericCell}`}>{formatChallengeRating(monster)}</td>
                    <td className={styles.sourceCell}>{monster.sourceSlug || "Unknown Source"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.paginationButton}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </button>
              <span className={styles.paginationStatus}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className={styles.paginationButton}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}

export default MonsterCodexTable;
