import clsx from "clsx";
import { Hexagon, Music, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import pyromancyIcon from "../../../../assets/svg/pyromancy.svg";
import ActionShape, {
  getActionShapeForCastingTime,
  type ActionShapeType
} from "../../../ActionShape";
import CellContainer from "../../../CellContainer/CellContainer";
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
import styles from "./CharacterSpellDrawer.module.css";
import actionStyles from "./SpellActionDrawer.module.css";

export type CharacterSpellDrawerMode = "standard" | "prepare-preview" | "divine-intervention";
export type CharacterSpellDrawerActionOptions = {
  castAsRitual?: boolean;
  useBeguilingMagic?: boolean;
  useElementalSmite?: boolean;
  useTelekineticMaster?: boolean;
};

export type CharacterSpellDrawerActionOption = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  tracker?: {
    current: number;
    total: number;
  };
  fallbackCost?: {
    label: string;
    icon?: "divinity" | "music" | "psi";
  };
  select?: {
    label: string;
    value: number;
    onValueChange: (value: number) => void;
    options: Array<{
      value: number;
      label: string;
      disabled?: boolean;
    }>;
  };
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
  minimumActionSpellSlotLevel?: number;
  freeCastSlotLevel?: number | null;
  allowRitualCasting?: boolean;
  ritualCastingRequired?: boolean;
  actionAvailabilityText?: string | null;
  actionContextText?: string | null;
  actionShape?: ActionShapeType | null;
  actionShapeAvailable?: boolean;
  actionShapeMultiCount?: number;
  actionOptions?: CharacterSpellDrawerActionOption[];
  backdropClassName?: string;
};

function renderActionOptionIcon(icon?: "divinity" | "music" | "psi"): ReactNode {
  if (icon === "divinity") {
    return <img src={pyromancyIcon} alt="" className={actionStyles.featureActionCostIcon} />;
  }

  if (icon === "music") {
    return <Music size={14} aria-hidden="true" />;
  }

  if (icon === "psi") {
    return <Hexagon size={14} aria-hidden="true" />;
  }

  return null;
}

function getActionShapeTitle(shape: ActionShapeType): string {
  switch (shape) {
    case "bonusAction":
      return "Bonus action timing badge";
    case "reaction":
      return "Reaction timing badge";
    case "nonCombat":
      return "Non-combat timing badge";
    case "action":
    default:
      return "Action timing badge";
  }
}

function isSpentActionWarning(value: string | null): boolean {
  return value !== null && /^You already used the .+ for this turn$/.test(value);
}

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
  minimumActionSpellSlotLevel = 1,
  freeCastSlotLevel = null,
  allowRitualCasting = false,
  ritualCastingRequired = false,
  actionAvailabilityText = null,
  actionContextText = null,
  actionShape = null,
  actionShapeAvailable = true,
  actionShapeMultiCount = 0,
  actionOptions = [],
  backdropClassName
}: CharacterSpellDrawerProps) {
  const [isComponentsTooltipOpen, setIsComponentsTooltipOpen] = useState(false);
  const [isRitualCastingSelected, setIsRitualCastingSelected] = useState(ritualCastingRequired);
  const spellLevel = getSpellLevel(spell);
  const minimumSelectedSlotLevel = Math.max(1, spellLevel, minimumActionSpellSlotLevel);
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
  const effectiveBlockedReason =
    isRitualCastingSelected || ritualCastingRequired ? null : blockedReason;
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
  const castingTimeActionShape = getActionShapeForCastingTime(spell.castingTime);
  const footerActionShape =
    actionShape ??
    (isRitualCastingSelected || ritualCastingRequired ? "nonCombat" : castingTimeActionShape);
  const castingTimeActionShapeTitle = castingTimeActionShape
    ? getActionShapeTitle(castingTimeActionShape)
    : null;
  const footerActionShapeTitle = footerActionShape ? getActionShapeTitle(footerActionShape) : null;

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

  useEffect(() => {
    if (ritualCastingRequired) {
      setIsRitualCastingSelected(true);
    }
  }, [ritualCastingRequired, spell.id]);

  const spellDescription = useMemo(() => spell.description, [spell.description]);
  const availabilityText = isRitualCastingSelected || ritualCastingRequired
    ? (actionAvailabilityText ??
      "Cast as a Ritual without expending a spell slot. Ritual casting can't be upcast.")
    : actionAvailabilityText;
  const slotText =
    availabilityText ??
    (selectedSlotIsFreeCast
      ? `You can cast this spell at level ${normalizedSelectedSpellSlotLevel} without expending a spell slot.`
      : `${selectedSpellRemainingSlots ?? 0} slot${
          (selectedSpellRemainingSlots ?? 0) === 1 ? "" : "s"
        } remaining at level ${normalizedSelectedSpellSlotLevel}.`);
  const relativeDescription = shouldShowSlotControls
    ? (availabilityText ?? (selectedSlotIsFreeCast ? slotText : null))
    : availabilityText;
  const visibleActionWarning = isSpentActionWarning(actionWarning) ? null : actionWarning;
  const shouldShowTopRow =
    relativeDescription !== null ||
    ritualCastingAvailable ||
    actionOptions.length > 0 ||
    visibleActionWarning !== null ||
    effectiveBlockedReason !== null ||
    actionContextText !== null;

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
                <h3 id="character-spell-drawer-title" className={sheetStyles.spellDrawerTitle}>
                  {spell.name}
                </h3>
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
              <CellContainer
                label="Casting Time"
                content={
                  <span className={styles.castingTimeContent}>
                    <span>{formatSpellCastingTime(spell.castingTime)}</span>
                    {castingTimeActionShape ? (
                      <ActionShape
                        shape={castingTimeActionShape}
                        isSelected
                        size="small"
                        className={styles.castingTimeShape}
                        title={castingTimeActionShapeTitle ?? undefined}
                      />
                    ) : null}
                  </span>
                }
              />
              <CellContainer label="Range" content={spell.range} />
              <CellContainer
                type="button"
                as="button"
                className={styles.spellDetailButton}
                label="Components"
                content={formatSpellComponents(spell.components)}
                onClick={() => setIsComponentsTooltipOpen(true)}
              />
              <CellContainer
                label="Duration"
                content={
                  spellDuration.hasConcentration ? (
                    <span className={styles.concentrationDetailValue}>
                      <ConcentrationLabel iconSize={15} />
                      {spellDuration.detailText ? <span>, {spellDuration.detailText}</span> : null}
                    </span>
                  ) : (
                    spellDuration.detailText
                  )
                }
              />
              <CellContainer
                label="Spell Lists"
                content={formatCodexList(spell.spellLists) || "None"}
              />
              <CellContainer
                label="Damage"
                content={getSpellDamageDetailForCharacter(character, spell)}
              />
            </div>

            <SpellDescriptionContent
              description={spellDescription}
              className={clsx(
                sheetStyles.spellDrawerDescriptionList,
                sheetStyles.spellDrawerDescriptionSection
              )}
              entryClassName={sheetStyles.spellDrawerDescriptionLine}
              strongClassName={sheetStyles.spellDrawerDescriptionStrong}
            />
          </div>

          {shouldShowActionFooter ? (
            <div className={sheetStyles.spellDrawerActions}>
              <div className={actionStyles.castActionLayout}>
                {shouldShowTopRow ? (
                  <div className={actionStyles.castActionTopRow}>
                    <div className={actionStyles.castActionTopLeft}>
                      {relativeDescription ? (
                        <p className={actionStyles.castActionDescription}>{relativeDescription}</p>
                      ) : null}
                      {ritualCastingAvailable ? (
                        <label className={actionStyles.ritualCastToggle}>
                          <input
                            type="checkbox"
                            checked={isRitualCastingSelected}
                            disabled={ritualCastingRequired}
                            onChange={(event) => setIsRitualCastingSelected(event.target.checked)}
                          />
                          <span>{ritualCastingRequired ? "Ritual Casting Only" : "Cast as Ritual"}</span>
                        </label>
                      ) : null}
                      {actionOptions.map((option) => {
                        const tracker = option.tracker;
                        const select = option.select;

                        return (
                          <div
                            key={option.id}
                            className={clsx(
                              actionStyles.featureActionToggle,
                              option.disabled ? actionStyles.featureActionToggleDisabled : null
                            )}
                          >
                            <label className={actionStyles.featureActionToggleStart}>
                              <input
                                type="checkbox"
                                checked={option.checked}
                                disabled={option.disabled}
                                onChange={(event) => option.onCheckedChange(event.target.checked)}
                              />
                              <span>{option.label}</span>
                              {tracker ? (
                                <span className={actionStyles.featureActionTracker}>
                                  <span className={actionStyles.featureActionTrackerLabel}>
                                    Charges
                                  </span>
                                  <span className={sheetStyles.shortRestDots}>
                                    {Array.from({ length: tracker.total }, (_, index) => (
                                      <span
                                        key={`${option.id}-charge-${index}`}
                                        className={clsx(
                                          sheetStyles.shortRestDot,
                                          index < tracker.current && sheetStyles.shortRestDotActive
                                        )}
                                      />
                                    ))}
                                  </span>
                                </span>
                              ) : null}
                              {option.fallbackCost ? (
                                <span className={actionStyles.featureActionCost}>
                                  <span className={actionStyles.featureActionCostDivider}>|</span>
                                  <span>{option.fallbackCost.label}</span>
                                  {renderActionOptionIcon(option.fallbackCost.icon)}
                                </span>
                              ) : null}
                            </label>
                            {option.checked && select ? (
                              <div className={actionStyles.featureActionSelectField}>
                                <span className={actionStyles.featureActionSelectLabel}>
                                  {select.label}
                                </span>
                                <SelectInput
                                  aria-label={select.label}
                                  value={select.value}
                                  className={actionStyles.featureActionSelect}
                                  onChange={(event) =>
                                    select.onValueChange(clampNumber(event.target.value, 1, 9, 1))
                                  }
                                >
                                  {select.options.map((selectOption) => (
                                    <option
                                      key={`${option.id}-select-${selectOption.value}`}
                                      value={selectOption.value}
                                      disabled={selectOption.disabled}
                                    >
                                      {selectOption.label}
                                    </option>
                                  ))}
                                </SelectInput>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    <div className={actionStyles.castActionTopRight}>
                      {visibleActionWarning ? (
                        <p className={actionStyles.castActionWarning}>{visibleActionWarning}</p>
                      ) : null}
                      {effectiveBlockedReason ? (
                        <p className={actionStyles.castActionWarning}>{effectiveBlockedReason}</p>
                      ) : null}
                      {actionContextText ? (
                        <p className={actionStyles.castActionContext}>{actionContextText}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <div className={actionStyles.castActionBottomRow}>
                  {shouldShowSlotControls ? (
                    <div className={actionStyles.compactSlotSelectField}>
                      <SelectInput
                        aria-label="Cast at slot level"
                        value={normalizedSelectedSpellSlotLevel}
                        className={clsx(
                          sheetStyles.spellSlotSelect,
                          actionStyles.compactSlotSelect
                        )}
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
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className={clsx(
                      sheetStyles.castButton,
                      actionStyles.castActionButton,
                      isRitualCastingSelected || ritualCastingRequired
                        ? actionStyles.ritualCastButton
                        : null
                    )}
                    onClick={() =>
                      onAction({
                        castAsRitual: ritualCastingRequired || isRitualCastingSelected,
                        useTelekineticMaster: actionOptions.some(
                          (option) => option.id === "telekinetic-master" && option.checked
                        )
                      })
                    }
                    disabled={!isActionEnabled}
                  >
                    <span>{actionLabel}</span>
                    {footerActionShape ? (
                      <ActionShape
                        shape={footerActionShape}
                        isSelected={actionShapeAvailable}
                        multiCount={actionShapeMultiCount}
                        className={actionStyles.footerActionShape}
                        title={footerActionShapeTitle ?? undefined}
                      />
                    ) : null}
                  </button>
                </div>
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
                  <h3 id="spell-components-title" className={sheetStyles.spellDrawerTitle}>
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
                  {renderCodexInlineText(line, sheetStyles.spellDrawerDescriptionStrong)}
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
