import clsx from "clsx";
import { Brain, Flame, Hexagon, Music, PawPrint, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import ActionShape, {
  getActionShapeForCastingTime,
  type ActionShapeType
} from "../../../ActionShape";
import CellContainer from "../../../CellContainer/CellContainer";
import ConcentrationLabel from "../../../ConcentrationLabel";
import SpellSubtitle from "../../../SpellSubtitle";
import SelectInput from "../../FormInputs/SelectInput";
import SpellDescriptionContent from "../../../SpellDescriptionContent";
import {
  ENTRY_CATEGORIES,
  KeywordTooltip,
  type SpellEntry
} from "../../../../codex/entries";
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
import type {
  FeatureActionIcon,
  FeatureActionResource
} from "../../../../pages/CharactersPage/classFeatures";
import FeatureOptInToggle, {
  type FeatureOptInToggleIconKind
} from "../FeatureOptInToggle/FeatureOptInToggle";
import animaIcon from "../../../../assets/svg/anima.svg";
import pyromancyIcon from "../../../../assets/svg/pyromancy.svg";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import gameplayActionStyles from "../GameplayForm/widgets/GameplayActionDrawer.module.css";
import styles from "./CharacterSpellDrawer.module.css";
import actionStyles from "./SpellActionDrawer.module.css";

export type CharacterSpellDrawerMode = "standard" | "prepare-preview" | "divine-intervention";
export type CharacterSpellDrawerActionOptions = {
  castAsRitual?: boolean;
  useBeguilingMagic?: boolean;
  useMindMagic?: boolean;
  useElementalSmite?: boolean;
  usePhantasmalCreatures?: boolean;
  usePsionicSorcery?: boolean;
  useTelekineticMaster?: boolean;
};

export type CharacterSpellDrawerActionOption = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  headerResource?: FeatureActionResource;
  tracker?: {
    current: number;
    total: number;
  };
  fallbackCost?: {
    label: string;
    icon?: FeatureOptInToggleIconKind;
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

function renderUsesIcon(icon?: FeatureActionIcon) {
  if (icon === "anima") {
    return <img src={animaIcon} alt="" className={styles.resourceAssetIcon} />;
  }

  if (icon === "brain") {
    return <Brain size={14} strokeWidth={2.1} />;
  }

  if (icon === "sparkles") {
    return <Sparkles size={14} strokeWidth={2.1} />;
  }

  if (icon === "music") {
    return <Music size={14} strokeWidth={2.1} />;
  }

  if (icon === "flame") {
    return <Flame size={14} strokeWidth={2.1} />;
  }

  if (icon === "paw") {
    return <PawPrint size={14} strokeWidth={2.1} />;
  }

  if (icon === "psi") {
    return <Hexagon size={14} strokeWidth={2.1} />;
  }

  if (icon === "pyromancy") {
    return <img src={pyromancyIcon} alt="" className={styles.resourceAssetIcon} />;
  }

  return null;
}

function renderHeaderResource(resource: FeatureActionResource, key: string) {
  if (resource.kind === "tracker" && resource.icon) {
    return (
      <span key={key} className={styles.resourceBadge}>
        <span className={styles.resourceBadgeLabel}>{resource.label}</span>
        <span className={styles.resourceBadgeValue}>
          <span>{resource.cost ?? resource.current}</span>
          {renderUsesIcon(resource.icon)}
          <span>out of</span>
          <span>{`${resource.current}/${resource.total}`}</span>
          {renderUsesIcon(resource.icon)}
        </span>
      </span>
    );
  }

  if (resource.kind === "tracker") {
    return (
      <span key={key} className={styles.resourceBadge}>
        Charges
        <span className={sheetStyles.shortRestDots}>
          {Array.from({ length: resource.total }, (_, dotIndex) => (
            <span
              key={`${key}-dot-${dotIndex}`}
              className={[
                sheetStyles.shortRestDot,
                dotIndex < resource.current ? sheetStyles.shortRestDotActive : ""
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </span>
      </span>
    );
  }

  return (
    <span key={key} className={styles.resourceBadge}>
      <span className={styles.resourceBadgeLabel}>{resource.label}</span>
      <span className={styles.resourceBadgeValue}>
        <span>{resource.value}</span>
        {renderUsesIcon(resource.icon)}
      </span>
    </span>
  );
}

type CharacterSpellDrawerProps = {
  character: Character;
  spell: SpellEntry;
  alwaysPrepared?: boolean;
  alwaysSpellbook?: boolean;
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
  alwaysSpellbook = false,
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
  const isMindMagicSelected = actionOptions.some(
    (option) => option.id === "mind-magic" && option.checked
  );
  const visibleActionOptions = isRitualCastingSelected
    ? actionOptions.filter((option) => option.id !== "mind-magic")
    : actionOptions;
  const visibleHeaderResources = visibleActionOptions.flatMap((option, index) =>
    option.headerResource ? [{ key: `${option.id}-header-resource-${index}`, value: option.headerResource }] : []
  );
  const shouldShowRitualToggle = ritualCastingAvailable && !isMindMagicSelected;
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
  const shouldUseFullWidthReactionLayout = footerActionShape === "reaction";
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

  useEffect(() => {
    if (!isMindMagicSelected) {
      return;
    }

    setIsRitualCastingSelected(false);
  }, [isMindMagicSelected]);

  useEffect(() => {
    if (!isRitualCastingSelected) {
      return;
    }

    const mindMagicOption = actionOptions.find((option) => option.id === "mind-magic");

    if (mindMagicOption?.checked) {
      mindMagicOption.onCheckedChange(false);
    }
  }, [actionOptions, isRitualCastingSelected]);

  const hasBaseDescription = spell.description.length > 0;
  const spellDescriptionSections =
    spell.descriptionAdditions?.filter((section) => section.length > 0) ?? [];
  const availabilityText =
    isRitualCastingSelected || ritualCastingRequired
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
                {alwaysSpellbook ? (
                  <span
                    className={clsx(styles.alwaysSpellbookPill, styles.alwaysPreparedDrawerPill)}
                  >
                    Always Spellbook
                  </span>
                ) : null}
              </div>
              <p className={sheetStyles.spellDrawerSummary}>
                <SpellSubtitle spell={spell} />
              </p>
              {visibleHeaderResources.length > 0 ? (
                <div className={styles.resourceBadgeRow}>
                  {visibleHeaderResources.map((resource) =>
                    renderHeaderResource(resource.value, resource.key)
                  )}
                </div>
              ) : null}
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

            {hasBaseDescription || spellDescriptionSections.length > 0 ? (
              <div className={sheetStyles.spellDrawerDescriptionStack}>
                {hasBaseDescription ? (
                  <SpellDescriptionContent
                    description={spell.description}
                    className={clsx(
                      sheetStyles.spellDrawerDescriptionList,
                      sheetStyles.spellDrawerDescriptionSection
                    )}
                    entryClassName={sheetStyles.spellDrawerDescriptionLine}
                    strongClassName={sheetStyles.spellDrawerDescriptionStrong}
                  />
                ) : null}
                {spellDescriptionSections.map((section, index) => (
                  <div
                    key={`${spell.id}-description-addition-${index}`}
                    className={sheetStyles.spellDrawerDescriptionAdditionSection}
                  >
                    {hasBaseDescription || index > 0 ? (
                      <hr
                        className={sheetStyles.spellDrawerDescriptionDivider}
                        aria-hidden="true"
                      />
                    ) : null}
                    <SpellDescriptionContent
                      description={section}
                      className={clsx(
                        sheetStyles.spellDrawerDescriptionList,
                        sheetStyles.spellDrawerDescriptionSection
                      )}
                      entryClassName={sheetStyles.spellDrawerDescriptionLine}
                      strongClassName={sheetStyles.spellDrawerDescriptionStrong}
                    />
                  </div>
                ))}
              </div>
            ) : null}
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
                      {shouldShowRitualToggle ? (
                        <FeatureOptInToggle
                          className={actionStyles.ritualCastToggle}
                          label={ritualCastingRequired ? "Ritual Casting Only" : "Cast as Ritual"}
                          checked={isRitualCastingSelected}
                          disabled={ritualCastingRequired}
                          onCheckedChange={setIsRitualCastingSelected}
                          checkboxAccentColor="#c96c14"
                        />
                      ) : null}
                      {visibleActionOptions.map((option) => {
                        const tracker = option.tracker;
                        const select = option.select;

                        return (
                          <div key={option.id} className={actionStyles.featureActionToggle}>
                            <FeatureOptInToggle
                              label={option.label}
                              checked={option.checked}
                              disabled={option.disabled}
                              muted={option.disabled}
                              onCheckedChange={option.onCheckedChange}
                              metaItems={[
                                ...(tracker
                                  ? [
                                      {
                                        kind: "tracker" as const,
                                        current: tracker.current,
                                        total: tracker.total
                                      }
                                    ]
                                  : []),
                                ...(option.fallbackCost
                                  ? [
                                      {
                                        kind: "cost" as const,
                                        label: option.fallbackCost.label,
                                        icon: option.fallbackCost.icon
                                      }
                                    ]
                                  : [])
                              ]}
                            />
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
                      {visibleActionWarning || effectiveBlockedReason ? (
                        <div className={gameplayActionStyles.warningBlock}>
                          {visibleActionWarning ? (
                            <p className={gameplayActionStyles.warningCard}>
                              {visibleActionWarning}
                            </p>
                          ) : null}
                          {effectiveBlockedReason ? (
                            <p className={gameplayActionStyles.warningCard}>
                              {effectiveBlockedReason}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      {actionContextText ? (
                        <p className={actionStyles.castActionContext}>{actionContextText}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <div
                  className={clsx(
                    actionStyles.castActionBottomRow,
                    shouldUseFullWidthReactionLayout || !shouldShowSlotControls
                      ? actionStyles.castActionBottomRowStacked
                      : null
                  )}
                >
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
                        useMindMagic:
                          !isRitualCastingSelected &&
                          actionOptions.some(
                          (option) => option.id === "mind-magic" && option.checked
                        ),
                        usePsionicSorcery: actionOptions.some(
                          (option) => option.id === "psionic-sorcery" && option.checked
                        ),
                        usePhantasmalCreatures: actionOptions.some(
                          (option) => option.id === "phantasmal-creatures" && option.checked
                        ),
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
