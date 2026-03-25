import { useEffect } from "react";
import SpellDescriptionContent from "../../SpellDescriptionContent";
import type { DivinityEntry } from "../../../codex/entries";
import { useBodyScrollLock } from "../../../lib/useBodyScrollLock";
import sheetStyles from "../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { getClericResolvedDivinityDisplay } from "../../../pages/CharactersPage/classFeatures/cleric";
import type { Character } from "../../../types";
import {
  formatCodexLabel,
  formatDivinitySubtitle,
  formatDivinityValue,
  formatSpellCastingTime
} from "../../../utils/codex";

type CodexDivinityDrawerProps = {
  divinity: DivinityEntry;
  character?: Pick<Character, "className" | "level" | "abilities" | "feats">;
  onClose: () => void;
};

function CodexDivinityDrawer({ divinity, character, onClose }: CodexDivinityDrawerProps) {
  useBodyScrollLock(true);

  const resolvedDisplay = character
    ? getClericResolvedDivinityDisplay(character, divinity)
    : {
        damage: divinity.damage ?? null,
        healing: divinity.healing ?? null,
        description: divinity.description
      };
  const primaryValue = resolvedDisplay.damage ?? resolvedDisplay.healing;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={sheetStyles.spellDrawerBackdrop} role="presentation" onClick={onClose}>
      <section
        className={sheetStyles.spellDrawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="codex-divinity-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
        <div className={sheetStyles.spellDrawerHeader}>
          <div className={sheetStyles.spellDrawerHeaderContent}>
            <p className={sheetStyles.spellDrawerBadge}>{formatCodexLabel("DIVINITY")}</p>
            <div className={sheetStyles.spellDrawerTitleRow}>
              <h3 id="codex-divinity-drawer-title">{divinity.name}</h3>
            </div>
            <p className={sheetStyles.spellDrawerSummary}>{formatDivinitySubtitle(divinity)}</p>
          </div>
          <button
            type="button"
            className={sheetStyles.spellDrawerCloseButton}
            onClick={onClose}
            aria-label="Close divinity details"
          >
            ×
          </button>
        </div>

        <div className={sheetStyles.spellDrawerBody}>
          <div className={sheetStyles.spellDrawerDetails}>
            <div className={sheetStyles.spellDrawerDetailCard}>
              <span>Casting Time</span>
              <strong>{formatSpellCastingTime(divinity.castingTime)}</strong>
            </div>
            <div className={sheetStyles.spellDrawerDetailCard}>
              <span>Range</span>
              <strong>{divinity.range}</strong>
            </div>
            <div className={sheetStyles.spellDrawerDetailCard}>
              <span>Duration</span>
              <strong>{divinity.duration}</strong>
            </div>
            <div className={sheetStyles.spellDrawerDetailCard}>
              <span>Damage</span>
              <strong>{primaryValue ? formatDivinityValue(primaryValue) : "-"}</strong>
            </div>
          </div>

          <SpellDescriptionContent
            description={resolvedDisplay.description}
            className={`${sheetStyles.spellDrawerDescriptionList} ${sheetStyles.spellDrawerDescriptionSection}`}
            entryClassName={sheetStyles.spellDrawerDescriptionLine}
          />
        </div>
      </section>
    </div>
  );
}

export default CodexDivinityDrawer;
