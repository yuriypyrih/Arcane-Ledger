import { useNavigate } from "react-router-dom";
import { ARMOR_TYPES, ENTRY_CATEGORIES } from "../../../codex/entries";
import type { CodexEntry, CodexStatus } from "../../../types";
import {
  formatCodexLabel,
  formatCodexList,
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
  status: CodexStatus;
  category: CodexFilterCategory;
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

function CodexResults({ entries, status, category }: CodexResultsProps) {
  const navigate = useNavigate();
  const entriesTitle = `${formatCodexLabel(category)} Entries`;

  return (
    <>
      <div className={styles.resultsHeader}>
        <h3>{entriesTitle}</h3>
        <span>{entries.length} shown</span>
      </div>

      <div className={styles.grid}>
        {status === "loading" ? (
          <article className={styles.card}>
            <h4>Loading codex...</h4>
            <p>Loading hardcoded starter entries.</p>
          </article>
        ) : null}

        {status === "error" ? (
          <article className={styles.card}>
            <h4>Codex unavailable</h4>
            <p>Codex entries could not be loaded.</p>
          </article>
        ) : null}

        {status === "ready" && entries.length === 0 ? (
          <article className={styles.card}>
            <h4>No matches</h4>
            <p>Try a different search or switch the category filter.</p>
          </article>
        ) : null}

        {entries.map((entry) => {
          const itemTypeSubtitle = getItemTypeSubtitle(entry);

          return (
            <button
              key={entry.id}
              type="button"
              className={styles.cardButton}
              onClick={() =>
                navigate({
                  pathname: `/codex/${entry.id}`,
                  search: `?category=${category}`
                })
              }
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
                  <small>Primary Ability: {formatCodexList(entry.primaryAbilityModifiers)}</small>
                ) : null}
              </article>
            </button>
          );
        })}
      </div>
    </>
  );
}

export default CodexResults;
