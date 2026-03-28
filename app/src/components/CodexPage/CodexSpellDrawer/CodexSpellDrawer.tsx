import { useEffect, useState } from "react";
import SpellDescriptionContent from "../../SpellDescriptionContent";
import { ENTRY_CATEGORIES, KeywordTooltip, type SpellEntry } from "../../../codex/entries";
import { useBodyScrollLock } from "../../../lib/useBodyScrollLock";
import sheetStyles from "../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  formatCodexLabel,
  formatCodexList,
  formatSpellCastingTime,
  formatSpellComponents,
  formatSpellDuration,
  formatSpellSubtitle,
  formatWeaponDamage,
  renderCodexInlineText
} from "../../../utils/codex";
import styles from "./CodexSpellDrawer.module.css";

type CodexSpellDrawerProps = {
  spell: SpellEntry;
  onClose: () => void;
};

function CodexSpellDrawer({ spell, onClose }: CodexSpellDrawerProps) {
  const [isComponentsTooltipOpen, setIsComponentsTooltipOpen] = useState(false);
  const componentsTooltipEntry = KeywordTooltip.components ?? null;

  useBodyScrollLock(true);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (isComponentsTooltipOpen) {
        setIsComponentsTooltipOpen(false);
        return;
      }

      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isComponentsTooltipOpen, onClose]);

  return (
    <>
      <div className={sheetStyles.spellDrawerBackdrop} role="presentation" onClick={onClose}>
        <section
          className={sheetStyles.spellDrawer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="codex-spell-drawer-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
          <div className={sheetStyles.spellDrawerHeader}>
            <div className={sheetStyles.spellDrawerHeaderContent}>
              <p className={sheetStyles.spellDrawerBadge}>
                {formatCodexLabel(ENTRY_CATEGORIES.SPELLS)}
              </p>
              <div className={sheetStyles.spellDrawerTitleRow}>
                <h3 id="codex-spell-drawer-title">{spell.name}</h3>
              </div>
              <p className={sheetStyles.spellDrawerSummary}>{formatSpellSubtitle(spell)}</p>
            </div>
            <button
              type="button"
              className={sheetStyles.spellDrawerCloseButton}
              onClick={onClose}
              aria-label="Close spell details"
            >
              ×
            </button>
          </div>

          <div className={sheetStyles.spellDrawerBody}>
            <div className={sheetStyles.spellDrawerDetails}>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Casting Time</span>
                <strong>{formatSpellCastingTime(spell.castingTime)}</strong>
              </div>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Range</span>
                <strong>{spell.range}</strong>
              </div>
              <button
                type="button"
                className={`${sheetStyles.spellDrawerDetailCard} ${styles.detailButton}`}
                onClick={() => {
                  if (componentsTooltipEntry) {
                    setIsComponentsTooltipOpen(true);
                  }
                }}
              >
                <span>Components</span>
                <strong>{formatSpellComponents(spell.components)}</strong>
              </button>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Duration</span>
                <strong>{formatSpellDuration(spell.duration)}</strong>
              </div>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Spell Lists</span>
                <strong>{formatCodexList(spell.spellLists) || "None"}</strong>
              </div>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Damage</span>
                <strong>{formatWeaponDamage(spell.damage)}</strong>
              </div>
            </div>

            <SpellDescriptionContent
              description={spell.description}
              className={`${sheetStyles.spellDrawerDescriptionList} ${sheetStyles.spellDrawerDescriptionSection}`}
              entryClassName={sheetStyles.spellDrawerDescriptionLine}
            />
          </div>
        </section>
      </div>

      {isComponentsTooltipOpen ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => setIsComponentsTooltipOpen(false)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="codex-spell-components-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Spell Reference</p>
                <h3 id="codex-spell-components-title">
                  {componentsTooltipEntry?.title ?? "Components"}
                </h3>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsComponentsTooltipOpen(false)}
                aria-label="Close components tooltip"
              >
                ×
              </button>
            </div>
            {componentsTooltipEntry ? (
              <article className={styles.tooltipCard}>
                <div className={styles.tooltipDescription}>
                  {componentsTooltipEntry.description.map((line, index) => (
                    <p key={`components-${index}`}>{renderCodexInlineText(line)}</p>
                  ))}
                </div>
              </article>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default CodexSpellDrawer;
