import { useNavigate } from "react-router-dom";
import type { CodexStatus, MonsterListItem } from "../../../types";
import styles from "../CodexResults/CodexResults.module.css";

type MonsterCodexTableProps = {
  monsters: MonsterListItem[];
  totalEntries: number;
  status: CodexStatus;
  search: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function formatMonsterType(value: string) {
  return value || "Unknown";
}

function formatChallengeRating(monster: MonsterListItem) {
  return monster.challengeRating || String(monster.cr);
}

function MonsterCodexTable({
  monsters,
  totalEntries,
  status,
  search,
  currentPage,
  totalPages,
  onPageChange
}: MonsterCodexTableProps) {
  const navigate = useNavigate();
  const totalEntriesLabel = `${totalEntries} total ${totalEntries === 1 ? "monster" : "monsters"}`;

  function openMonster(slug: string) {
    navigate({
      pathname: `/codex/monsters/${slug}`,
      search: search.length > 0 ? `?${search}` : ""
    });
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
                  <th>Name</th>
                  <th>Type</th>
                  <th>CR</th>
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
                    <td>
                      <div className={styles.tableNameCell}>
                        <strong>{monster.name}</strong>
                        <span>{monster.slug}</span>
                      </div>
                    </td>
                    <td>{formatMonsterType(monster.type)}</td>
                    <td>{formatChallengeRating(monster)}</td>
                    <td>{monster.sourceTitle || "Unknown Source"}</td>
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
