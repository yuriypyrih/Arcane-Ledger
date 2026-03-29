import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ConcentrationLabel from "../../../ConcentrationLabel";
import SpellSubtitle from "../../../SpellSubtitle";
import SelectInput from "../../FormInputs/SelectInput";
import SpellDescriptionContent from "../../../SpellDescriptionContent";
import { ENTRY_CATEGORIES, KeywordTooltip, type SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  formatCodexLabel,
  formatCodexList,
  formatSpellCastingTime,
  formatSpellComponents,
  getSpellDurationDisplayParts,
  renderCodexInlineText
} from "../../../../utils/codex";
import {
  clampNumber,
  spellSlotLevels
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { getSpellLevel } from "../../../../pages/CharactersPage/spellcasting";
import { getSpellDamageDetailForCharacter } from "../../../../pages/CharactersPage/spellOutcome";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./SpellCastingForm.module.css";

export type CharacterSpellDrawerMode = "standard" | "prepare-preview" | "divine-intervention";
export type CharacterSpellDrawerActionOptions = {
  castAsRitual?: boolean;
};

type CharacterSpellDrawerProps = {
  character: Character;
  spell: SpellEntry;
  alwaysPrepared?: boolean;
  mode: CharacterSpellDrawerMode;
  spellSlotTotals: number[];
  spellSlotsRemaining: number[];
  selectedSpellSlotLevel: number;
  onSelectedSpellSlotLevelChange: (slotLevel: number) => void;
  onClose: () => void;
  onAction: (options?: CharacterSpellDrawerActionOptions) => void;
  actionLabel?: string;
  actionWarning?: string | null;
  blockedReason?: string | null;
  actionDisabled?: boolean;
  actionConsumesSpellSlot?: boolean;
  freeCastSlotLevel?: number | null;
  allowRitualCasting?: boolean;
  actionAvailabilityText?: string | null;
  actionContextText?: string | null;
  backdropClassName?: string;
};

function CharacterSpellDrawer({
  character,
  spell,
  alwaysPrepared = false,
  mode,
  spellSlotTotals,
  spellSlotsRemaining,
  selectedSpellSlotLevel,
  onSelectedSpellSlotLevelChange,
  onClose,
  onAction,
  actionLabel = "Cast",
  actionWarning = null,
  blockedReason = null,
  actionDisabled = false,
  actionConsumesSpellSlot = true,
  freeCastSlotLevel = null,
  allowRitualCasting = false,
  actionAvailabilityText = null,
  actionContextText = null,
  backdropClassName
}: CharacterSpellDrawerProps) {
  const [isComponentsTooltipOpen, setIsComponentsTooltipOpen] = useState(false);
  const [isRitualCastingSelected, setIsRitualCastingSelected] = useState(false);
  const spellLevel = getSpellLevel(spell);
  const minimumSelectedSlotLevel = Math.max(1, spellLevel);
  const ritualCastingAvailable =
    mode === "standard" &&
    spellLevel > 0 &&
    spell.ritual === true &&
    (actionConsumesSpellSlot || allowRitualCasting);
  const normalizedSelectedSpellSlotLevel = clampNumber(
    selectedSpellSlotLevel,
    minimumSelectedSlotLevel,
    9,
    minimumSelectedSlotLevel
  );
  const selectedSlotIsFreeCast =
    spellLevel > 0 &&
    freeCastSlotLevel !== null &&
    normalizedSelectedSpellSlotLevel === freeCastSlotLevel;
  const selectedSpellRemainingSlots =
    spellLevel === 0 ? null : (spellSlotsRemaining[normalizedSelectedSpellSlotLevel - 1] ?? 0);
  const canCastAtSelectedSlot =
    spellLevel === 0 ||
    selectedSlotIsFreeCast ||
    (selectedSpellRemainingSlots !== null &&
      normalizedSelectedSpellSlotLevel >= minimumSelectedSlotLevel &&
      selectedSpellRemainingSlots > 0);
  const shouldShowActionFooter = mode !== "prepare-preview";
  const shouldShowSlotControls =
    mode === "standard" &&
    spellLevel > 0 &&
    (actionConsumesSpellSlot || freeCastSlotLevel !== null) &&
    !isRitualCastingSelected;
  const effectiveBlockedReason = isRitualCastingSelected ? null : blockedReason;
  const isActionEnabled = shouldShowSlotControls
    ? canCastAtSelectedSlot && !effectiveBlockedReason && !actionDisabled
    : !effectiveBlockedReason && !actionDisabled;
  const componentsTooltipEntry = KeywordTooltip.components ?? null;
  const badgeLabel =
    mode === "prepare-preview"
      ? "Spell preview"
      : mode === "divine-intervention"
        ? "Divine Intervention"
        : formatCodexLabel(ENTRY_CATEGORIES.SPELLS);
  const closeComponentsTooltip = () => setIsComponentsTooltipOpen(false);
  const spellDuration = getSpellDurationDisplayParts(spell.duration);

  useEffect(() => {
    if (!isComponentsTooltipOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        closeComponentsTooltip();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isComponentsTooltipOpen]);

  useEffect(() => {
    if (shouldShowSlotControls) {
      return;
    }

    onSelectedSpellSlotLevelChange(1);
  }, [onSelectedSpellSlotLevelChange, shouldShowSlotControls]);

  useEffect(() => {
    if (ritualCastingAvailable) {
      return;
    }

    setIsRitualCastingSelected(false);
  }, [ritualCastingAvailable, spell.id]);

  const spellDescription = useMemo(() => spell.description, [spell.description]);
  const availabilityText = isRitualCastingSelected
    ? "Cast as a Ritual without expending a spell slot. Ritual casting can't be upcast."
    : actionAvailabilityText;

  return (
    <>
      <div
        className={clsx(sheetStyles.spellDrawerBackdrop, backdropClassName)}
        role="presentation"
        onClick={onClose}
      >
        <section
          className={sheetStyles.spellDrawer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="character-spell-drawer-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
          <div className={sheetStyles.spellDrawerHeader}>
            <div className={sheetStyles.spellDrawerHeaderContent}>
              <p className={sheetStyles.spellDrawerBadge}>{badgeLabel}</p>
              <div className={sheetStyles.spellDrawerTitleRow}>
                <h3 id="character-spell-drawer-title">{spell.name}</h3>
                {alwaysPrepared ? (
                  <span
                    className={clsx(styles.alwaysPreparedPill, styles.alwaysPreparedDrawerPill)}
                  >
                    Always Prepared
                  </span>
                ) : null}
              </div>
              <p className={sheetStyles.spellDrawerSummary}>
                <SpellSubtitle spell={spell} />
              </p>
            </div>
            <button
              type="button"
              className={sheetStyles.spellDrawerCloseButton}
              onClick={onClose}
              aria-label={
                mode === "prepare-preview" ? "Close spell preview" : "Close spell details"
              }
            >
              <X size={18} />
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
                className={clsx(sheetStyles.spellDrawerDetailCard, styles.spellDetailButton)}
                onClick={() => setIsComponentsTooltipOpen(true)}
              >
                <span>Components</span>
                <strong>{formatSpellComponents(spell.components)}</strong>
              </button>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Duration</span>
                <strong>
                  {spellDuration.hasConcentration ? (
                    <span className={styles.concentrationDetailValue}>
                      <ConcentrationLabel iconSize={15} />
                      {spellDuration.detailText ? <span>, {spellDuration.detailText}</span> : null}
                    </span>
                  ) : (
                    spellDuration.detailText
                  )}
                </strong>
              </div>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Spell Lists</span>
                <strong>{formatCodexList(spell.spellLists) || "None"}</strong>
              </div>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Damage</span>
                <strong>{getSpellDamageDetailForCharacter(character, spell)}</strong>
              </div>
            </div>

            <SpellDescriptionContent
              description={spellDescription}
              className={clsx(
                sheetStyles.spellDrawerDescriptionList,
                sheetStyles.spellDrawerDescriptionSection
              )}
              entryClassName={sheetStyles.spellDrawerDescriptionLine}
            />
          </div>

          {shouldShowActionFooter ? (
            <div className={sheetStyles.spellDrawerActions}>
              <div className={styles.castActionMeta}>
                {shouldShowSlotControls ? (
                  <div className={sheetStyles.spellDrawerCastControls}>
                    <p className={sheetStyles.spellDrawerSlotText}>
                      {selectedSlotIsFreeCast
                        ? `You can cast this spell at level ${normalizedSelectedSpellSlotLevel} without expending a spell slot.`
                        : `${selectedSpellRemainingSlots ?? 0} slot${
                            (selectedSpellRemainingSlots ?? 0) === 1 ? "" : "s"
                          } remaining at level ${normalizedSelectedSpellSlotLevel}.`}
                    </p>
                    <label className={sheetStyles.spellSlotSelectField}>
                      <span>Cast at slot level</span>
                      <SelectInput
                        value={normalizedSelectedSpellSlotLevel}
                        className={sheetStyles.spellSlotSelect}
                        onChange={(event) =>
                          onSelectedSpellSlotLevelChange(clampNumber(event.target.value, 1, 9, 1))
                        }
                      >
                        {spellSlotLevels.map((slotLevel) => {
                          const totalSlots = spellSlotTotals[slotLevel - 1] ?? 0;
                          const remainingSlots = spellSlotsRemaining[slotLevel - 1] ?? 0;
                          const isDisabled =
                            slotLevel < minimumSelectedSlotLevel || totalSlots === 0;

                          return (
                            <option key={slotLevel} value={slotLevel} disabled={isDisabled}>
                              Level {slotLevel} ({remainingSlots}/{totalSlots})
                            </option>
                          );
                        })}
                      </SelectInput>
                    </label>
                  </div>
                ) : availabilityText ? (
                  <div className={sheetStyles.spellDrawerCastControls}>
                    <p className={sheetStyles.spellDrawerSlotText}>{availabilityText}</p>
                  </div>
                ) : null}
                {ritualCastingAvailable ? (
                  <label className={styles.ritualCastToggle}>
                    <input
                      type="checkbox"
                      checked={isRitualCastingSelected}
                      onChange={(event) => setIsRitualCastingSelected(event.target.checked)}
                    />
                    <span>Cast as Ritual</span>
                  </label>
                ) : null}
              </div>
              <div className={styles.castActionFooter}>
                {actionWarning ? <p className={styles.castActionWarning}>{actionWarning}</p> : null}
                {effectiveBlockedReason ? (
                  <p className={styles.castActionWarning}>{effectiveBlockedReason}</p>
                ) : null}
                {actionContextText ? (
                  <p className={styles.castActionContext}>{actionContextText}</p>
                ) : null}
                <button
                  type="button"
                  className={clsx(
                    sheetStyles.castButton,
                    isRitualCastingSelected ? styles.ritualCastButton : null
                  )}
                  onClick={() => onAction({ castAsRitual: isRitualCastingSelected })}
                  disabled={!isActionEnabled}
                >
                  {actionLabel}
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {isComponentsTooltipOpen ? (
        <div
          className={clsx(sheetStyles.spellDrawerBackdrop, styles.componentsDrawerBackdrop)}
          role="presentation"
          onClick={closeComponentsTooltip}
        >
          <section
            className={clsx(sheetStyles.spellDrawer, styles.componentsDrawer)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spell-components-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Keyword</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="spell-components-title">
                    {componentsTooltipEntry?.title ?? "Components"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={closeComponentsTooltip}
                aria-label="Close components details"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className={clsx(sheetStyles.spellDrawerDescriptionList, styles.componentsDrawerBody)}
            >
              {componentsTooltipEntry?.description.map((line, index) => (
                <p
                  key={`components-description-${index}`}
                  className={sheetStyles.spellDrawerDescriptionLine}
                >
                  {renderCodexInlineText(line)}
                </p>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default CharacterSpellDrawer;
