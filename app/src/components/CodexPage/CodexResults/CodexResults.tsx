import { useNavigate } from "react-router-dom";
import { ARMOR_TYPES, ENTRY_CATEGORIES, type SpellEntry } from "../../../codex/entries";
import SpellListRow from "../../SpellListRow";
import type { CodexEntry, CodexStatus } from "../../../types";
import { getPrimaryAbilityForClass } from "../../../pages/CharactersPage/proficiency";
import {
  formatCodexLabel,
  formatSpellSubtitle,
  getSpellExcerpt,
  formatWeaponType,
  truncateCodexText
} from "../../../utils/codex";
import type { CodexFilterCategory } from "../../../utils/codex";
import RarityPill from "../RarityPill";
import styles from "./CodexResults.module.css";

type CodexResultsProps = {
  entries: CodexEntry[];
  totalEntries: number;
  status: CodexStatus;
  category: CodexFilterCategory;
  search: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSpellSelect?: (spell: SpellEntry) => void;
};

function getItemTypeSubtitle(entry: CodexEntry): string | null {
  if (entry.category === ENTRY_CATEGORIES.SPELLS) {
    return formatSpellSubtitle(entry);
  }

  if (entry.category === ENTRY_CATEGORIES.ARMOR) {
    const armorType = entry.tags.find((type) =>
      [
        ARMOR_TYPES.LIGHT_ARMOR,
        ARMOR_TYPES.MEDIUM_ARMOR,
        ARMOR_TYPES.HEAVY_ARMOR,
        ARMOR_TYPES.SHIELD
      ].includes(type)
    );

    return armorType ? formatCodexLabel(armorType) : null;
  }

  if (entry.category === ENTRY_CATEGORIES.WEAPONS) {
    return `${formatWeaponType(entry.type)} weapon`;
  }

  if (entry.category === ENTRY_CATEGORIES.ITEMS) {
    const itemType = entry.tags[0];
    return itemType ? formatCodexLabel(itemType) : null;
  }

  if (entry.category === ENTRY_CATEGORIES.BACKGROUNDS) {
    const backgroundType = entry.tags[0];
    return backgroundType ? formatCodexLabel(backgroundType) : null;
  }

  return null;
}

function CodexResults({
  entries,
  totalEntries,
  status,
  category,
  search,
  currentPage,
  totalPages,
  onPageChange,
  onSpellSelect
}: CodexResultsProps) {
  const navigate = useNavigate();
  const entriesTitle = `${formatCodexLabel(category)} Entries`;
  const isSpellCategory = category === ENTRY_CATEGORIES.SPELLS;
  const totalEntriesLabel = `${totalEntries} total ${totalEntries === 1 ? "entry" : "entries"}`;

  function openEntry(entryId: string) {
    navigate({
      pathname: `/codex/${entryId}`,
      search: search.length > 0 ? `?${search}` : ""
    });
  }

  return (
    <>
      <div className={styles.resultsHeader}>
        <h3>{entriesTitle}</h3>
        <span>{totalEntriesLabel}</span>
      </div>

      {status === "loading" ? (
        <div className={styles.grid}>
          <article className={styles.card}>
            <h4>Loading codex...</h4>
            <p>Loading hardcoded starter entries.</p>
          </article>
        </div>
      ) : null}

      {status === "error" ? (
        <div className={styles.grid}>
          <article className={styles.card}>
            <h4>Codex unavailable</h4>
            <p>Codex entries could not be loaded.</p>
          </article>
        </div>
      ) : null}

      {status === "ready" && entries.length === 0 ? (
        <div className={styles.grid}>
          <article className={styles.card}>
            <h4>No matches</h4>
            <p>Try a different search or switch the category filter.</p>
          </article>
        </div>
      ) : null}

      {status === "ready" && entries.length > 0 && isSpellCategory ? (
        <>
          <div className={styles.spellList}>
            {entries.map((entry) => {
              if (entry.category !== ENTRY_CATEGORIES.SPELLS) {
                return null;
              }

              return (
                <SpellListRow
                  key={entry.id}
                  spell={entry}
                  onClick={() => (onSpellSelect ? onSpellSelect(entry) : openEntry(entry.id))}
                />
              );
            })}
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

      {status === "ready" && entries.length > 0 && !isSpellCategory ? (
        <div className={styles.grid}>
          {entries.map((entry) => {
            const itemTypeSubtitle = getItemTypeSubtitle(entry);

            return (
              <button
                key={entry.id}
                type="button"
                className={styles.cardButton}
                onClick={() => openEntry(entry.id)}
              >
                <article className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.titleBlock}>
                      <h4>{entry.name}</h4>
                      {itemTypeSubtitle ? (
                        <p className={styles.typeSubtitle}>{itemTypeSubtitle}</p>
                      ) : null}
                    </div>
                    {"rarity" in entry ? <RarityPill rarity={entry.rarity} /> : null}
                  </div>
                  <p>
                    {truncateCodexText(
                      entry.category === ENTRY_CATEGORIES.SPELLS
                        ? getSpellExcerpt(entry)
                        : entry.summary,
                      120
                    )}
                  </p>
                  {entry.category === ENTRY_CATEGORIES.CLASSES ? (
                    <small>
                      Primary Ability:{" "}
                      {getPrimaryAbilityForClass(entry.name)
                        ? formatCodexLabel(getPrimaryAbilityForClass(entry.name) as string)
                        : "Not configured"}
                    </small>
                  ) : null}
                </article>
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

export default CodexResults;
