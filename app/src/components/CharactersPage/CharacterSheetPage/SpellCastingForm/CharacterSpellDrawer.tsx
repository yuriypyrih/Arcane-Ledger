import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import ActionButton from "../../../ActionButton";
import ActionShape, {
  getActionShapeForCastingTime,
  type ActionShapeType
} from "../../../ActionShape";
import CellContainer from "../../../CellContainer/CellContainer";
import ConcentrationLabel from "../../../ConcentrationLabel";
import KeywordReferenceDrawer from "../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import SpellSubtitle from "../../../SpellSubtitle";
import SelectInput from "../../FormInputs/SelectInput";
import SpellDescriptionContent from "../../../SpellDescriptionContent";
import {
  ENTRY_CATEGORIES,
  KeywordTooltip,
  TRACKER,
  getSpellTrackingState,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../codex/entries";
import type { AbilityKey, Character } from "../../../../types";
import type { RoundTrackerResource } from "../../../../pages/CharactersPage/combat";
import {
  formatCodexLabel,
  formatCodexList,
  formatSpellCastingTime,
  formatSpellComponents,
  getSpellDurationDisplayParts
} from "../../../../utils/codex";
import {
  resolveKeywordReference,
  type ResolvedKeywordReference
} from "../../../../utils/codex/renderCodexRichText";
import {
  clampNumber,
  spellSlotLevels
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { markUsageHeaderTagsAsFallback } from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import { orderDescriptionAdditionSections } from "../../../../pages/CharactersPage/actionModalDescriptions";
import { getSpellLevel } from "../../../../pages/CharactersPage/spellcasting";
import { getSpellDamageDetailForCharacter } from "../../../../pages/CharactersPage/spellOutcome";
import {
  getSpellAttackFormulaCell,
  getSpellSaveFormulaCell
} from "../../../../pages/CharactersPage/shared/spellFormulas";
import { isInnateSorceryActiveForSpell } from "../../../../pages/CharactersPage/classFeatures/sorcerer/innateSorcerySpell";
import { isRogueArcaneTricksterMagicalAmbushActiveForSpell } from "../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueArcaneTrickster";
import { mageArmorSpellId } from "../../../../pages/CharactersPage/characterRuntime/spellImplementations";
import type {
  FeatureActionCardUsage,
  FeatureActionFact,
  FeatureActionHeaderTag
} from "../../../../pages/CharactersPage/classFeatures";
import FeatureOptInToggle, {
  type FeatureOptInToggleApplication,
  type FeatureOptInToggleMetaItem
} from "../FeatureOptInToggle/FeatureOptInToggle";
import { FeatureTrackingBadgeButton } from "../../../FeatureDisclosure";
import RadioContainerOption from "../RadioContainerOption";
import FeatureActionFacts from "../GameplayForm/widgets/ActionsWidget/FeatureActionFacts";
import FeatureActionHeaderTags from "../GameplayForm/widgets/ActionsWidget/FeatureActionHeaderTags";
import ActionFooterButtonRow from "../GameplayForm/widgets/ActionsWidget/ActionFooterButtonRow";
import DiceRollerSettingsButton from "../GameplayForm/widgets/DiceRollerSettingsButton";
import { runWithActionConfirmationToast } from "../actionConfirmationToast";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import gameplayActionStyles from "../GameplayForm/widgets/ActionsWidget/GameplayActionDrawer.module.css";
import d20Icon from "../../../../assets/svg/d20.svg";
import styles from "./CharacterSpellDrawer.module.css";
import actionStyles from "./SpellActionDrawer.module.css";

export type CharacterSpellDrawerMode = "standard" | "prepare-preview" | "divine-intervention";
export type CharacterSpellDrawerActionOptions = {
  castAsRitual?: boolean;
  roundTrackerResourceOverride?: RoundTrackerResource | null;
  useBeguilingMagic?: boolean;
  useMindMagic?: boolean;
  useStarMap?: boolean;
  useElementalSmite?: boolean;
  elementalSmiteOption?: string | null;
  usePhantasmalCreatures?: boolean;
  usePsionicSorcery?: boolean;
  useTamedSurge?: boolean;
  useTelekineticMaster?: boolean;
  useRadiantSoul?: boolean;
  useOverchannel?: boolean;
  useMagicInitiate?: boolean;
  useGoliathAncestry?: boolean;
  useFeyMagic?: boolean;
  useFiendishLegacy?: boolean;
  useQuickRitual?: boolean;
  useShadowMagic?: boolean;
  useDetectThoughts?: boolean;
  useBoonOfSpellRecall?: boolean;
  castMageArmorOnSelf?: boolean;
};

export type CharacterSpellDrawerActionRadioOption = {
  id: string;
  header: ReactNode;
  subheader?: ReactNode;
  breakdown?: ReactNode;
  description?: SpellDescriptionEntry[];
  disabled?: boolean;
};

export type CharacterSpellDrawerActionOption = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  headerTags?: FeatureActionHeaderTag[];
  usage?: FeatureActionCardUsage;
  application?: FeatureOptInToggleApplication;
  metaItems?: FeatureOptInToggleMetaItem[];
  radioOptions?: {
    value: string | null;
    onValueChange: (value: string) => void;
    options: CharacterSpellDrawerActionRadioOption[];
    required?: boolean;
    name?: string;
    placement?: "footer" | "body";
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

export type CharacterSpellDrawerActionPath = {
  id: string;
  actionLabel?: string;
  actionShape: ActionShapeType;
  actionShapeAvailable: boolean;
  actionShapeMultiCount?: number;
  disabledReason?: string | null;
  roundTrackerResourceOverride?: RoundTrackerResource | null;
};

type CharacterSpellDrawerProps = {
  character: Character;
  spell: SpellEntry;
  alwaysPrepared?: boolean;
  alwaysPreparedSources?: string[];
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
  freeCastAvailabilityText?: string | null;
  allowRitualCasting?: boolean;
  ritualCastingRequired?: boolean;
  actionAvailabilityText?: string | null;
  actionContextText?: string | null;
  actionPaths?: CharacterSpellDrawerActionPath[];
  actionShape?: ActionShapeType | null;
  actionShapeAvailable?: boolean;
  actionShapeMultiCount?: number;
  actionOptions?: CharacterSpellDrawerActionOption[];
  facts?: FeatureActionFact[];
  factsSectionTitle?: string | null;
  showActionDiceControls?: boolean;
  isDiceRollerSettingsOpen?: boolean;
  onDiceRollerSettingsOpenChange?: (isOpen: boolean) => void;
  damageDetailOverride?: string | null;
  spellcastingAbilityOverride?: AbilityKey | null;
  forceMageArmorSelfCast?: boolean;
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

function hasSpellHealing(spell: Pick<SpellEntry, "healing">): boolean {
  return Array.isArray(spell.healing)
    ? spell.healing.length > 0
    : spell.healing.label.trim().length > 0;
}

function formatAlwaysPreparedSourceDetailText(sources: string[]): string | null {
  const normalizedSources = [
    ...new Set(sources.map((source) => source.trim()).filter((source) => source.length > 0))
  ];

  return normalizedSources.length > 0 ? `From ${normalizedSources.join(", ")}` : null;
}

function CharacterSpellDrawer({
  character,
  spell,
  alwaysPrepared = false,
  alwaysPreparedSources = [],
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
  freeCastAvailabilityText = null,
  allowRitualCasting = false,
  ritualCastingRequired = false,
  actionAvailabilityText = null,
  actionContextText = null,
  actionPaths,
  actionShape = null,
  actionShapeAvailable = true,
  actionShapeMultiCount = 0,
  actionOptions = [],
  facts = [],
  factsSectionTitle = null,
  showActionDiceControls = false,
  isDiceRollerSettingsOpen = false,
  onDiceRollerSettingsOpenChange,
  damageDetailOverride = null,
  spellcastingAbilityOverride = null,
  forceMageArmorSelfCast = false,
  backdropClassName
}: CharacterSpellDrawerProps) {
  const [isComponentsTooltipOpen, setIsComponentsTooltipOpen] = useState(false);
  const [selectedTrackingKeyword, setSelectedTrackingKeyword] =
    useState<ResolvedKeywordReference | null>(null);
  const [isRitualCastingSelected, setIsRitualCastingSelected] = useState(ritualCastingRequired);
  const [isMageArmorSelfCastSelected, setIsMageArmorSelfCastSelected] =
    useState(forceMageArmorSelfCast);
  const spellLevel = getSpellLevel(spell);
  const shouldShowMageArmorSelfCast = mode === "standard" && spell.id === mageArmorSpellId;
  const allActionOptions = useMemo<CharacterSpellDrawerActionOption[]>(() => {
    if (!shouldShowMageArmorSelfCast) {
      return actionOptions;
    }

    return [
      {
        id: "mage-armor-self",
        label: "Cast on myself",
        checked: isMageArmorSelfCastSelected,
        onCheckedChange: forceMageArmorSelfCast ? () => undefined : setIsMageArmorSelfCastSelected,
        disabled: forceMageArmorSelfCast
      },
      ...actionOptions
    ];
  }, [
    actionOptions,
    forceMageArmorSelfCast,
    isMageArmorSelfCastSelected,
    shouldShowMageArmorSelfCast
  ]);
  const minimumSelectedSlotLevel = Math.max(1, spellLevel, minimumActionSpellSlotLevel);
  const isQuickRitualSelected = allActionOptions.some(
    (option) => option.id === "quick-ritual" && option.checked
  );
  const ritualCastingAvailable =
    mode === "standard" &&
    spellLevel > 0 &&
    spell.ritual === true &&
    (actionConsumesSpellSlot || allowRitualCasting || isQuickRitualSelected);
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
  const isMindMagicSelected = allActionOptions.some(
    (option) => option.id === "mind-magic" && option.checked
  );
  const visibleActionOptions = isRitualCastingSelected
    ? allActionOptions.filter((option) => option.id !== "mind-magic")
    : allActionOptions;
  const visibleHeaderTags = visibleActionOptions.flatMap((option) =>
    option.headerTags?.length
      ? (option.usage?.mode === "charges-or-resource"
          ? markUsageHeaderTagsAsFallback(option.headerTags)
          : option.headerTags
        ).map((tag, index) => ({
          key: `${option.id}-header-tag-${index}`,
          value: tag
        }))
      : []
  );
  const shouldShowRitualToggle = ritualCastingAvailable && !isMindMagicSelected;
  const shouldShowSlotControls =
    mode === "standard" &&
    spellLevel > 0 &&
    (actionConsumesSpellSlot || freeCastSlotLevel !== null) &&
    !isRitualCastingSelected &&
    !isQuickRitualSelected;
  const effectiveBlockedReason =
    isRitualCastingSelected || ritualCastingRequired ? null : blockedReason;
  const missingRequiredActionOptionSelection =
    effectiveBlockedReason === null
      ? (visibleActionOptions.find(
          (option) =>
            option.checked && option.radioOptions?.required && option.radioOptions.value === null
        ) ?? null)
      : null;
  const requiredActionOptionWarning =
    missingRequiredActionOptionSelection?.id === "elemental-smite"
      ? "Choose an Elemental Smite effect."
      : missingRequiredActionOptionSelection
        ? `Choose a ${missingRequiredActionOptionSelection.label} option.`
        : null;
  const isActionEnabled = shouldShowSlotControls
    ? canCastAtSelectedSlot &&
      !effectiveBlockedReason &&
      !actionDisabled &&
      requiredActionOptionWarning === null
    : !effectiveBlockedReason && !actionDisabled && requiredActionOptionWarning === null;
  const componentsTooltipEntry = KeywordTooltip.components ?? null;
  const spellTrackingState = getSpellTrackingState(spell);
  const badgeLabel =
    mode === "prepare-preview"
      ? "Spell preview"
      : mode === "divine-intervention"
        ? "Divine Intervention"
        : formatCodexLabel(ENTRY_CATEGORIES.SPELLS);
  const closeComponentsTooltip = () => setIsComponentsTooltipOpen(false);
  const closeTrackingKeyword = () => setSelectedTrackingKeyword(null);
  const spellDuration = getSpellDurationDisplayParts(spell.duration);
  const castingTimeActionShape = getActionShapeForCastingTime(spell.castingTime);
  const footerActionShape =
    actionShape ??
    ((isRitualCastingSelected || ritualCastingRequired) && !isQuickRitualSelected
      ? "nonCombat"
      : castingTimeActionShape);
  const castingTimeActionShapeTitle = castingTimeActionShape
    ? getActionShapeTitle(castingTimeActionShape)
    : null;
  const visibleActionWarning =
    requiredActionOptionWarning ?? (isSpentActionWarning(actionWarning) ? null : actionWarning);
  const baseActionOptions = {
    castAsRitual: !isQuickRitualSelected && (ritualCastingRequired || isRitualCastingSelected),
    useMindMagic:
      !isRitualCastingSelected &&
      allActionOptions.some((option) => option.id === "mind-magic" && option.checked),
    useStarMap: allActionOptions.some((option) => option.id === "star-map" && option.checked),
    useElementalSmite: allActionOptions.some(
      (option) => option.id === "elemental-smite" && option.checked
    ),
    elementalSmiteOption:
      allActionOptions.find((option) => option.id === "elemental-smite")?.radioOptions?.value ??
      null,
    usePsionicSorcery: allActionOptions.some(
      (option) => option.id === "psionic-sorcery" && option.checked
    ),
    useTamedSurge: allActionOptions.some((option) => option.id === "tamed-surge" && option.checked),
    usePhantasmalCreatures: allActionOptions.some(
      (option) => option.id === "phantasmal-creatures" && option.checked
    ),
    useTelekineticMaster: allActionOptions.some(
      (option) => option.id === "telekinetic-master" && option.checked
    ),
    useRadiantSoul: allActionOptions.some(
      (option) => option.id === "radiant-soul" && option.checked
    ),
    useOverchannel: allActionOptions.some(
      (option) => option.id === "overchannel" && option.checked
    ),
    useMagicInitiate: allActionOptions.some(
      (option) => option.id === "magic-initiate" && option.checked
    ),
    useFeyMagic: allActionOptions.some((option) => option.id === "fey-magic" && option.checked),
    useQuickRitual: isQuickRitualSelected,
    useShadowMagic: allActionOptions.some(
      (option) => option.id === "shadow-magic" && option.checked
    ),
    useDetectThoughts: allActionOptions.some(
      (option) => option.id === "detect-thoughts" && option.checked
    ),
    castMageArmorOnSelf: shouldShowMageArmorSelfCast && isMageArmorSelfCastSelected
  };
  const resolvedActionPaths =
    actionPaths && actionPaths.length > 0
      ? actionPaths
      : footerActionShape
        ? [
            {
              id: "primary",
              actionLabel,
              actionShape: footerActionShape,
              actionShapeAvailable,
              actionShapeMultiCount,
              disabledReason: !isActionEnabled
                ? (effectiveBlockedReason ?? visibleActionWarning)
                : null
            }
          ]
        : [];
  const castingTimeActionShapes =
    actionPaths && actionPaths.length > 0
      ? actionPaths.map((path) => ({
          key: path.id,
          shape: path.actionShape,
          title: getActionShapeTitle(path.actionShape)
        }))
      : castingTimeActionShape
        ? [
            {
              key: "primary",
              shape: castingTimeActionShape,
              title: castingTimeActionShapeTitle
            }
          ]
        : [];
  const shouldUseFullWidthReactionLayout =
    !shouldShowSlotControls &&
    resolvedActionPaths.length === 1 &&
    resolvedActionPaths[0]?.actionShape === "reaction";
  const shouldStackFooterActions =
    !showActionDiceControls &&
    (shouldUseFullWidthReactionLayout ||
      (!shouldShowSlotControls && resolvedActionPaths.length <= 1));
  const bodyRadioActionOptions = visibleActionOptions.filter(
    (option) => option.radioOptions?.placement === "body"
  );
  const freeCastContextText =
    selectedSlotIsFreeCast && freeCastAvailabilityText ? freeCastAvailabilityText : null;
  const actionContextTexts = [
    actionContextText,
    freeCastContextText,
    isRogueArcaneTricksterMagicalAmbushActiveForSpell(character, spell)
      ? "Magical Ambush is active"
      : null,
    isInnateSorceryActiveForSpell(character, spell) ? "Innate Sorcery is Active" : null
  ].filter((value): value is string => value !== null && value.length > 0);
  const spellFormulaCells = [
    getSpellSaveFormulaCell(spell, character, spellcastingAbilityOverride),
    getSpellAttackFormulaCell(spell, character, spellcastingAbilityOverride)
  ].filter((cell): cell is NonNullable<typeof cell> => cell !== null);
  const alwaysPreparedSourceDetailText =
    formatAlwaysPreparedSourceDetailText(alwaysPreparedSources);

  function openTrackingKeyword(trackingState: TRACKER) {
    const resolvedKeyword = resolveKeywordReference(trackingState);

    if (resolvedKeyword) {
      setSelectedTrackingKeyword(resolvedKeyword);
    }
  }

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
    setIsMageArmorSelfCastSelected(forceMageArmorSelfCast);
  }, [forceMageArmorSelfCast, spell.id]);

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
    if (!isQuickRitualSelected) {
      return;
    }

    setIsRitualCastingSelected(false);
  }, [isQuickRitualSelected]);

  useEffect(() => {
    if (!isRitualCastingSelected) {
      return;
    }

    const mindMagicOption = allActionOptions.find((option) => option.id === "mind-magic");

    if (mindMagicOption?.checked) {
      mindMagicOption.onCheckedChange(false);
    }
  }, [allActionOptions, isRitualCastingSelected]);

  const hasBaseDescription = spell.description.length > 0;
  const spellDescriptionSections = orderDescriptionAdditionSections(
    spell.descriptionAdditions ?? []
  );
  const availabilityText =
    (isRitualCastingSelected || ritualCastingRequired) && !isQuickRitualSelected
      ? (actionAvailabilityText ??
        "Cast as a Ritual without expending a spell slot. Ritual casting can't be upcast.")
      : actionAvailabilityText;
  const slotText =
    availabilityText ??
    (selectedSlotIsFreeCast
      ? (freeCastAvailabilityText ??
        `You can cast this spell at level ${normalizedSelectedSpellSlotLevel} without expending a spell slot.`)
      : `${selectedSpellRemainingSlots ?? 0} slot${
          (selectedSpellRemainingSlots ?? 0) === 1 ? "" : "s"
        } remaining at level ${normalizedSelectedSpellSlotLevel}.`);
  const relativeDescription = shouldShowSlotControls
    ? (availabilityText ?? (selectedSlotIsFreeCast && !freeCastContextText ? slotText : null))
    : availabilityText;
  const shouldShowTopRow =
    relativeDescription !== null ||
    ritualCastingAvailable ||
    allActionOptions.length > 0 ||
    visibleActionWarning !== null ||
    effectiveBlockedReason !== null ||
    actionContextTexts.length > 0;

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
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
                    <span className={styles.alwaysPreparedPillLabel}>
                      {alwaysPreparedSourceDetailText ? "Always Prepared:" : "Always Prepared"}
                    </span>
                    {alwaysPreparedSourceDetailText ? (
                      <span className={styles.alwaysPreparedPillDetail}>
                        {alwaysPreparedSourceDetailText}
                      </span>
                    ) : null}
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
            </div>
            <div className={styles.headerActions}>
              {visibleHeaderTags.length > 0 ? (
                <div className={gameplayActionStyles.resourceBadgeRow}>
                  <FeatureActionHeaderTags
                    tags={visibleHeaderTags.map((tag) => tag.value)}
                    tagKeyPrefix={spell.name}
                  />
                </div>
              ) : null}
              <FeatureTrackingBadgeButton
                trackingState={spellTrackingState}
                onClick={openTrackingKeyword}
              />
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
          </div>

          <div className={sheetStyles.spellDrawerBody}>
            <div className={sheetStyles.spellDrawerDetails}>
              <CellContainer
                label="Casting Time"
                content={
                  <span className={styles.castingTimeContent}>
                    <span>{formatSpellCastingTime(spell.castingTime)}</span>
                    {castingTimeActionShapes.length > 0 ? (
                      <span className={styles.castingTimeShapeGroup}>
                        {castingTimeActionShapes.map((shape) => (
                          <ActionShape
                            key={shape.key}
                            shape={shape.shape}
                            isSelected
                            size="small"
                            className={styles.castingTimeShape}
                            title={shape.title ?? undefined}
                          />
                        ))}
                      </span>
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
                label={
                  spell.damage.length > 0 ? "Damage" : hasSpellHealing(spell) ? "Healing" : "Damage"
                }
                content={
                  damageDetailOverride ??
                  getSpellDamageDetailForCharacter(character, spell, spellcastingAbilityOverride)
                }
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
            {spellFormulaCells.length > 0 ? (
              <div className={sheetStyles.spellDrawerDetails}>
                {spellFormulaCells.map((cell) => (
                  <CellContainer
                    key={cell.label}
                    className={sheetStyles.spellDrawerFormulaCell}
                    label={cell.label}
                    content={cell.content}
                    breakdown={cell.breakdown}
                  />
                ))}
              </div>
            ) : null}
            <FeatureActionFacts title={spell.name} facts={facts} sectionTitle={factsSectionTitle} />
            {bodyRadioActionOptions.map((option) => (
              <div
                key={`${option.id}-body-radio-options`}
                className={styles.bodyActionOptionSection}
              >
                <div
                  className={styles.bodyActionRadioGroup}
                  role="radiogroup"
                  aria-label={`${option.label} options`}
                >
                  {option.radioOptions?.options.map((radioOption) => (
                    <RadioContainerOption
                      key={`${option.id}-${radioOption.id}`}
                      header={radioOption.header}
                      subheader={radioOption.subheader}
                      breakdown={
                        radioOption.description ? (
                          <SpellDescriptionContent
                            description={radioOption.description}
                            className={styles.bodyActionOptionDescription}
                            entryClassName={sheetStyles.spellDrawerDescriptionLine}
                            strongClassName={sheetStyles.spellDrawerDescriptionStrong}
                          />
                        ) : (
                          radioOption.breakdown
                        )
                      }
                      selected={option.radioOptions?.value === radioOption.id}
                      onSelect={() => option.radioOptions?.onValueChange(radioOption.id)}
                      disabled={option.disabled || !option.checked || radioOption.disabled}
                      name={option.radioOptions?.name ?? `${spell.id}-${option.id}-options`}
                    />
                  ))}
                </div>
              </div>
            ))}
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
                          checked={isRitualCastingSelected && !isQuickRitualSelected}
                          disabled={ritualCastingRequired || isQuickRitualSelected}
                          onCheckedChange={setIsRitualCastingSelected}
                          checkboxAccentColor="#c96c14"
                        />
                      ) : null}
                      {visibleActionOptions.map((option) => {
                        const select = option.select;

                        return (
                          <div key={option.id} className={actionStyles.featureActionToggle}>
                            <FeatureOptInToggle
                              label={option.label}
                              checked={option.checked}
                              disabled={option.disabled}
                              muted={option.disabled}
                              onCheckedChange={option.onCheckedChange}
                              usage={option.usage}
                              application={option.application}
                              usageKey={option.id}
                              metaItems={option.metaItems}
                            />
                            {option.radioOptions && option.radioOptions.placement !== "body" ? (
                              <div
                                className={actionStyles.featureActionRadioGroup}
                                role="radiogroup"
                                aria-label={`${option.label} options`}
                              >
                                {option.radioOptions.options.map((radioOption) => (
                                  <RadioContainerOption
                                    key={`${option.id}-${radioOption.id}`}
                                    header={radioOption.header}
                                    subheader={radioOption.subheader}
                                    breakdown={radioOption.breakdown}
                                    selected={option.radioOptions?.value === radioOption.id}
                                    onSelect={() =>
                                      option.radioOptions?.onValueChange(radioOption.id)
                                    }
                                    disabled={
                                      option.disabled || !option.checked || radioOption.disabled
                                    }
                                    name={
                                      option.radioOptions?.name ??
                                      `${spell.id}-${option.id}-options`
                                    }
                                  />
                                ))}
                              </div>
                            ) : option.checked && select ? (
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
                      {actionContextTexts.map((contextText, index) => (
                        <p
                          key={`${spell.id}-action-context-${index}`}
                          className={actionStyles.castActionContext}
                        >
                          {contextText}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
                <ActionFooterButtonRow
                  className={clsx(
                    actionStyles.castActionBottomRow,
                    shouldStackFooterActions ? actionStyles.castActionBottomRowStacked : null
                  )}
                  endGroupClassName={actionStyles.castActionEndGroup}
                  settings={
                    showActionDiceControls ? (
                      <DiceRollerSettingsButton
                        actionName={spell.name}
                        className={actionStyles.castActionSettingsButton}
                        isOpen={isDiceRollerSettingsOpen}
                        onOpenChange={onDiceRollerSettingsOpenChange}
                      />
                    ) : null
                  }
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
                  {resolvedActionPaths.map((path) => (
                    <ActionButton
                      key={path.id}
                      className={actionStyles.castActionButton}
                      actionType={
                        isRitualCastingSelected || ritualCastingRequired ? "WARNING" : "INFO"
                      }
                      onClick={() =>
                        showActionDiceControls
                          ? onAction({
                              ...baseActionOptions,
                              roundTrackerResourceOverride: path.roundTrackerResourceOverride
                            })
                          : runWithActionConfirmationToast(
                              path.roundTrackerResourceOverride ?? path.actionShape,
                              () =>
                                onAction({
                                  ...baseActionOptions,
                                  roundTrackerResourceOverride: path.roundTrackerResourceOverride
                                })
                            )
                      }
                      disabled={!isActionEnabled || path.disabledReason !== null}
                      title={path.disabledReason ?? undefined}
                      icon={
                        showActionDiceControls ? (
                          <img src={d20Icon} alt="" className={actionStyles.castActionIcon} />
                        ) : undefined
                      }
                      trailingBadge={
                        <ActionShape
                          shape={path.actionShape}
                          isSelected={path.actionShapeAvailable}
                          multiCount={path.actionShapeMultiCount ?? 0}
                          className={actionStyles.footerActionShape}
                          title={getActionShapeTitle(path.actionShape)}
                        />
                      }
                    >
                      {path.actionLabel ?? actionLabel}
                    </ActionButton>
                  ))}
                </ActionFooterButtonRow>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {isComponentsTooltipOpen && componentsTooltipEntry ? (
        <KeywordReferenceDrawer
          title={componentsTooltipEntry.title}
          entries={[
            {
              title: componentsTooltipEntry.title,
              description: componentsTooltipEntry.description
            }
          ]}
          badgeLabel="Keyword"
          backdropClassName={backdropClassName}
          onClose={closeComponentsTooltip}
        />
      ) : null}
      {selectedTrackingKeyword ? (
        <KeywordReferenceDrawer
          title={selectedTrackingKeyword.title}
          entries={[
            {
              title: selectedTrackingKeyword.title,
              description: selectedTrackingKeyword.description
            }
          ]}
          badgeLabel="Keyword"
          backdropClassName={backdropClassName}
          onClose={closeTrackingKeyword}
        />
      ) : null}
    </>,
    document.body
  );
}

export default CharacterSpellDrawer;
