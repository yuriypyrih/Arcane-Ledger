import clsx from "clsx";
import { Dices, FastForward, HeartPlus, Moon, Pencil, Save, Skull, Sword, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useFormContext } from "react-hook-form";
import NumberInput from "../../FormInputs/NumberInput";
import SelectInput from "../../FormInputs/SelectInput";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import SpellListRow from "../../../SpellListRow";
import CharacterSpellDrawer from "../SpellCastingForm/CharacterSpellDrawer";
import SpellDescriptionContent from "../../../SpellDescriptionContent";
import { useClassSpellEntries, usePreparedSpellEntries } from "../../../../codex/classes";
import { ACTION_TYPE, type ReactionEntry, type SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  consumeRoundTrackerResource,
  createDefaultRoundTracker,
  isRoundTrackerResourceAvailable,
  normalizeRoundTracker,
  setRoundTrackerResourceAvailability,
  type RoundTrackerResource
} from "../../../../pages/CharactersPage/combat";
import { getCombatActionsForCharacter } from "../../../../pages/CharactersPage/combatActions";
import {
  activateFeatureActionOptionForCharacter,
  activateFeatureActionForCharacter,
  advanceFeatureStateForNewRound,
  getDerivedFeatureStatusEntriesForCharacter,
  getFeatureActionOptionsForCharacter,
  getFeatureReactionEntriesForCharacter,
  markFeatureWeaponBonusUseForCharacter,
  getSpellcastingStateForCharacter,
  removeFeatureStatusEntryForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import {
  divineInterventionActionKey,
  getClericDivineInterventionEnabledLevels,
  getClericDivineInterventionSpellEntries
} from "../../../../pages/CharactersPage/classFeatures/cleric";
import {
  getBarbarianRageUsesTotal,
  applyLongRestToBarbarianFeatures,
  applyShortRestToBarbarianFeatures
} from "../../../../pages/CharactersPage/classFeatures/barbarian";
import {
  getBardicInspirationUsesTotal,
  applyLongRestToBardFeatures,
  applyShortRestToBardFeatures
} from "../../../../pages/CharactersPage/classFeatures/bard";
import {
  applyLongRestToFighterFeatures,
  applyShortRestToFighterFeatures,
  fighterSecondWindActionKey,
  getFighterSecondWindHealingFormula,
  getFighterSecondWindUsesTotal
} from "../../../../pages/CharactersPage/classFeatures/fighter";
import {
  getClericChannelDivinityUsesTotal,
  hasClericDivineInterventionFeature,
  restoreClericChannelDivinityOnLongRest,
  restoreClericChannelDivinityOnShortRest,
  restoreClericDivineInterventionOnLongRest
} from "../../../../pages/CharactersPage/classFeatures/cleric";
import { getFeatDerivedStatusEntriesForCharacter } from "../../../../pages/CharactersPage/feats";
import {
  formatAbilityModifier,
  getAutomaticMaxHitPointsForCharacter,
  type WeaponAction
} from "../../../../pages/CharactersPage/gameplay";
import {
  formatFeatureActionOptionValueLabel,
  parseRollFormulaRange
} from "../../../../pages/CharactersPage/actionOutcome";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_DURATION_PRESET,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type CharacterStatusDuration,
  type CharacterStatusEntry,
  type CharacterStatusValue
} from "../../../../types";
import type {
  HpDraft,
  PersistCharacterUpdater
} from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  clampNumber,
  formatSpellGroupTitle,
  spellSlotLevels
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import {
  advanceCharacterStatusEntries,
  applyLongRestToCharacterStatusEntries,
  applyShortRestToCharacterStatusEntries,
  createStatusDurationFromPreset,
  durationPresetOptions,
  getConditionOptions,
  getDamageTypeOptions,
  getImmunityOptions,
  getSenseOptions,
  getStatusDurationLabel,
  getStatusDurationPreset,
  getStatusDurationShortLabel,
  getStatusEntryDescription,
  getStatusEntrySourceLabel,
  getStatusEntryTitle,
  normalizeCharacterStatusEntries,
  updateCharacterStatusEntryDuration,
  resolveCharacterStatusEntries,
  statusGroupOrder,
  statusGroupTitles,
  upsertManualStatusEntry,
  removeCharacterStatusEntry
} from "../../../../pages/CharactersPage/traits";
import {
  getAlwaysPreparedSpellIds,
  getCantripLimitForCharacter,
  getPreparedSpellLimitForCharacter,
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended,
  normalizePreparedSpellIds,
  normalizeTrackedSpellIds,
  usesPreparedSpellsForCharacter
} from "../../../../pages/CharactersPage/spellcasting";
import { getSpellOutcomeSummaryForCharacter } from "../../../../pages/CharactersPage/spellOutcome";
import { rollFormulaWithDice } from "../../../../utils/dice";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./GameplayForm.module.css";
import TemporaryHitPoints from "../TemporaryHitPoints";

type GameplayFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type DeathSaveState = {
  successes: number;
  failures: number;
};

type MaxHitPointsMode = "automatic" | "custom";
type TraitEditorTab = "conditions" | "senses" | "resistances" | "vulnerabilities" | "immunities";
type RestType = "short" | "long";
type RestOption = {
  id: string;
  label: string;
  detail?: string;
  apply: (character: Character) => Character;
};

const traitEditorTabs: Array<{ id: TraitEditorTab; label: string }> = [
  { id: "conditions", label: "Conditions" },
  { id: "senses", label: "Senses" },
  { id: "resistances", label: "Resistances" },
  { id: "vulnerabilities", label: "Vulnerabilities" },
  { id: "immunities", label: "Immunities" }
];

const senseOptions = getSenseOptions();
const conditionOptions = getConditionOptions();
const damageTypeOptions = getDamageTypeOptions();
const immunityOptions = getImmunityOptions();
const divineInterventionSpellLevels = [0, ...spellSlotLevels] as const;

function createDefaultStatusDraftValues(): Record<TraitEditorTab, string> {
  return {
    conditions: conditionOptions[0] ?? CONDITION_NAME.POISONED,
    senses: senseOptions[0] ?? "Darkvision",
    resistances: damageTypeOptions[0] ?? "FIRE",
    vulnerabilities: damageTypeOptions[0] ?? "FIRE",
    immunities: immunityOptions[0] ?? "FIRE"
  };
}

function createHpDraft(character: Character): HpDraft {
  return {
    hitPoints: character.hitPoints,
    currentHitPoints: character.currentHitPoints
  };
}

function normalizeMaxHitPointsMode(value: Character["maxHitPointsMode"]): MaxHitPointsMode {
  return value === "automatic" ? "automatic" : "custom";
}

function createDefaultDeathSaves(): DeathSaveState {
  return {
    successes: 0,
    failures: 0
  };
}

function normalizeDeathSaves(value: Character["deathSaves"]): DeathSaveState {
  return {
    successes: Math.floor(clampNumber(value?.successes, 0, 3, 0)),
    failures: Math.floor(clampNumber(value?.failures, 0, 3, 0))
  };
}

function normalizeTemporaryHitPoints(value: unknown): number {
  return Math.floor(clampNumber(value, 0, 999, 0));
}

function formatSignedValue(value: number): string {
  return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
}

function formatProficiencyLabel(label: string): string {
  return label
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDamageExpression(damageLabel: string, modifier: number): string {
  if (modifier === 0) {
    return damageLabel;
  }

  return `${damageLabel} ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
}

function getDivineInterventionLevelGroups(spells: SpellEntry[]): Record<number, SpellEntry[]> {
  return divineInterventionSpellLevels.reduce<Record<number, SpellEntry[]>>((groups, level) => {
    groups[level] = spells
      .filter((spell) => getSpellLevel(spell) === level)
      .sort((left, right) => left.name.localeCompare(right.name));

    return groups;
  }, {});
}

function getDamageRangeLabel(
  damageLabel: string,
  modifier: number,
  fullRollFormula: string
): string {
  const parsedRange = parseRollFormulaRange(fullRollFormula);
  const damageExpression = formatDamageExpression(damageLabel, modifier);

  if (!parsedRange) {
    return `Damage (${damageExpression})`;
  }

  if (parsedRange.minimum === parsedRange.maximum) {
    return `${parsedRange.minimum} Damage (${damageExpression})`;
  }

  return `${parsedRange.minimum}~${parsedRange.maximum} Damage (${damageExpression})`;
}

function hasVisibleWeaponProficiency(
  action: Pick<WeaponAction, "proficiencyLabel" | "proficiencyBonus">
) {
  return action.proficiencyBonus !== 0 && action.proficiencyLabel.trim().length > 0;
}

function getWeaponActionRollDescription(action: WeaponAction): string {
  const segments = [`${action.ability} ${formatAbilityModifier(action.abilityModifier)}`];

  if (hasVisibleWeaponProficiency(action)) {
    segments.push(
      `Proficiency (${formatProficiencyLabel(action.proficiencyLabel)}) ${formatAbilityModifier(action.proficiencyBonus)}`
    );
  }

  if (action.hasVersatileBonus) {
    segments.push("+ Versatile Bonus");
  }

  if (action.hasGreatWeaponFighting) {
    segments.push("+ Great Weapon Fighting");
  }

  action.damageBonusEntries.forEach((entry) => {
    if (entry.value !== undefined) {
      segments.push(`${entry.label} ${formatAbilityModifier(entry.value)}`);
      return;
    }

    segments.push(`+ ${entry.label}`);
  });

  return segments.join(" | ");
}

function getWeaponActionBreakdown(action: WeaponAction): string {
  const segments = [`${action.ability} ${formatSignedValue(action.abilityModifier)}`];

  if (hasVisibleWeaponProficiency(action)) {
    segments.push(
      `Prof. (${formatProficiencyLabel(action.proficiencyLabel)}) ${formatSignedValue(action.proficiencyBonus)}`
    );
  }

  if (action.hasVersatileBonus) {
    segments.push("+ Versatile Bonus");
  }

  if (action.hasGreatWeaponFighting) {
    segments.push("+ Great Weapon Fighting");
  }

  action.damageBonusEntries.forEach((entry) => {
    if (entry.value !== undefined) {
      segments.push(`${entry.label} ${formatSignedValue(entry.value)}`);
      return;
    }

    segments.push(`+ ${entry.label}`);
  });

  return segments.join(" | ");
}

function getFeatureActionModeLabel(actionCost: RoundTrackerResource | null): string {
  if (actionCost === "reaction") {
    return "Reaction";
  }

  if (actionCost === "bonusAction") {
    return "Bonus Action";
  }

  if (actionCost === "action") {
    return "Action";
  }

  return "Free";
}

function getRoundTrackerResourceLabel(resource: RoundTrackerResource): string {
  switch (resource) {
    case "bonusAction":
      return ACTION_TYPE.BONUS_ACTION;
    case "reaction":
      return ACTION_TYPE.REACTION;
    case "action":
    default:
      return ACTION_TYPE.ACTION;
  }
}

function getRoundTrackerActionWarning(
  resource: RoundTrackerResource | null,
  roundTracker: ReturnType<typeof normalizeRoundTracker>
): string | null {
  if (!resource || isRoundTrackerResourceAvailable(roundTracker, resource)) {
    return null;
  }

  return `You already used the ${getRoundTrackerResourceLabel(resource)} for this turn`;
}

function getRoundTrackerResourceMeta(
  resource: RoundTrackerResource,
  isAvailable: boolean
): {
  title: string;
  description: string;
  useLabel: string;
  resetLabel: string;
} {
  if (resource === "action") {
    return {
      title: "Action",
      description: isAvailable
        ? "Your main action is ready for this round. Weapon attacks and most spells will spend it automatically."
        : "Your main action has already been spent this round. Reset it here if you need to correct the tracker manually.",
      useLabel: "Use Action",
      resetLabel: "Reset Action"
    };
  }

  if (resource === "reaction") {
    return {
      title: "Reaction",
      description: isAvailable
        ? "Your reaction is ready for this round. Reaction spells and similar responses will spend it automatically."
        : "Your reaction has already been spent this round. Reset it here if you need to correct the tracker manually.",
      useLabel: "Use Reaction",
      resetLabel: "Reset Reaction"
    };
  }

  return {
    title: "Bonus Action",
    description: isAvailable
      ? "Your bonus action is ready for this round. Bonus-action spells and similar abilities will spend it automatically."
      : "Your bonus action has already been spent this round. Reset it here if you need to correct the tracker manually.",
    useLabel: "Use Bonus Action",
    resetLabel: "Reset Bonus Action"
  };
}

function createDerivedReactionStatusDuration(): CharacterStatusDuration {
  return { kind: STATUS_DURATION_KIND.INFINITE };
}

function getDerivedReactionStatusEntries(
  spells: SpellEntry[],
  reactions: ReactionEntry[]
): CharacterStatusEntry[] {
  return [...new Map(spells.map((spell) => [spell.id, spell])).values()]
    .filter((spell) => spell.castingTime.includes(ACTION_TYPE.REACTION))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((spell) => ({
      id: `reaction-spell-${spell.id}`,
      group: STATUS_ENTRY_GROUP.REACTIONS,
      value: spell.name,
      source: "Spellcasting",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: createDerivedReactionStatusDuration(),
      sourceId: `reaction-spell-${spell.id}`,
      rangeFeet: null
    }))
    .concat(
      reactions
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((reaction) => ({
          id: `reaction-entry-${reaction.id}`,
          group: STATUS_ENTRY_GROUP.REACTIONS,
          value: reaction.name,
          source: reaction.sourceFeature === "COUNTERCHARM" ? "Bard" : "Feature",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: createDerivedReactionStatusDuration(),
          sourceId: `reaction-entry-${reaction.id}`,
          rangeFeet: null
        }))
    );
}

function getTraitEditorGroup(tab: TraitEditorTab): STATUS_ENTRY_GROUP {
  switch (tab) {
    case "senses":
      return STATUS_ENTRY_GROUP.SENSES;
    case "resistances":
      return STATUS_ENTRY_GROUP.RESISTANCES;
    case "vulnerabilities":
      return STATUS_ENTRY_GROUP.VULNERABILITIES;
    case "immunities":
      return STATUS_ENTRY_GROUP.IMMUNITIES;
    case "conditions":
    default:
      return STATUS_ENTRY_GROUP.CONDITIONS;
  }
}

function formatTraitEditorOptionLabel(tab: TraitEditorTab, value: string): string {
  if (tab === "resistances" || tab === "vulnerabilities") {
    return `${value.charAt(0)}${value.slice(1).toLowerCase()} damage`;
  }

  if (tab === "immunities") {
    return conditionOptions.includes(value as CONDITION_NAME)
      ? `${value} condition`
      : `${value.charAt(0)}${value.slice(1).toLowerCase()} damage`;
  }

  return value;
}

function isStatusEntryRemovable(entry: CharacterStatusEntry): boolean {
  return (
    entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.MANUAL &&
    entry.duration.kind !== STATUS_DURATION_KIND.LINKED
  );
}

function isStatusEntryDurationEditable(entry: CharacterStatusEntry): boolean {
  return isStatusEntryRemovable(entry);
}

function getStatusDrawerBadgeLabel(group: STATUS_ENTRY_GROUP): string {
  switch (group) {
    case STATUS_ENTRY_GROUP.EFFECTS:
      return "Effect";
    case STATUS_ENTRY_GROUP.REACTIONS:
      return "Reaction";
    case STATUS_ENTRY_GROUP.SENSES:
      return "Sense";
    case STATUS_ENTRY_GROUP.AURAS:
      return "Aura";
    case STATUS_ENTRY_GROUP.RESISTANCES:
      return "Resistance";
    case STATUS_ENTRY_GROUP.VULNERABILITIES:
      return "Vulnerability";
    case STATUS_ENTRY_GROUP.IMMUNITIES:
      return "Immunity";
    case STATUS_ENTRY_GROUP.CONDITIONS:
    default:
      return "Condition";
  }
}

function getExpiredFeatureOverrideEntries(
  previousEntries: unknown,
  nextEntries: unknown
): CharacterStatusEntry[] {
  const nextOverrideIds = new Set(
    normalizeCharacterStatusEntries(nextEntries).map((entry) => entry.id)
  );

  return normalizeCharacterStatusEntries(previousEntries).filter(
    (entry) =>
      entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.FEATURE &&
      typeof entry.sourceId === "string" &&
      entry.sourceId.length > 0 &&
      !nextOverrideIds.has(entry.id)
  );
}

function resolveStatusDurationPreset(
  preset: STATUS_DURATION_PRESET,
  group: STATUS_ENTRY_GROUP,
  value: CharacterStatusValue
) {
  if (
    preset === STATUS_DURATION_PRESET.CONCENTRATION &&
    group === STATUS_ENTRY_GROUP.EFFECTS &&
    value === EFFECT_NAME.CONCENTRATION
  ) {
    return createStatusDurationFromPreset(STATUS_DURATION_PRESET.INFINITE);
  }

  return createStatusDurationFromPreset(preset);
}

function createShortRestOptions(character: Character): RestOption[] {
  const shortRestHealAmount = Math.ceil(character.hitPoints / 2);
  const temporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);
  const rageUsesTotal = getBarbarianRageUsesTotal(character);
  const bardicInspirationUsesTotal = getBardicInspirationUsesTotal(character);
  const secondWindUsesTotal = getFighterSecondWindUsesTotal(character);
  const channelDivinityUsesTotal = getClericChannelDivinityUsesTotal(character);
  const hasTimedStatuses = normalizeCharacterStatusEntries(character.statusEntries).length > 0;
  const bardShortRestRecoveryAvailable = applyShortRestToBardFeatures(character) !== character;

  return [
    {
      id: "restore-hit-points",
      label: `Heal ${shortRestHealAmount} HP`,
      detail: "Restores half your max HP, up to your hit point maximum.",
      apply: (currentCharacter) => {
        const nextCurrentHitPoints = clampNumber(
          currentCharacter.currentHitPoints + Math.ceil(currentCharacter.hitPoints / 2),
          0,
          currentCharacter.hitPoints,
          currentCharacter.currentHitPoints
        );

        return {
          ...currentCharacter,
          currentHitPoints: nextCurrentHitPoints,
          deathSaves:
            nextCurrentHitPoints > 0
              ? createDefaultDeathSaves()
              : normalizeDeathSaves(currentCharacter.deathSaves)
        };
      }
    },
    {
      id: "reset-round-tracker",
      label: "Reset round tracker",
      apply: (currentCharacter) => ({
        ...currentCharacter,
        roundTracker: createDefaultRoundTracker()
      })
    },
    ...(temporaryHitPoints > 0
      ? [
          {
            id: "clear-temporary-hit-points",
            label: "Remove Temporary Hit Points",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              temporaryHitPoints: 0
            })
          } satisfies RestOption
        ]
      : []),
    ...(hasTimedStatuses
      ? [
          {
            id: "update-statuses",
            label: "Update Traits & Conditions",
            detail: "Ends durations below 1 hour and clears Concentration-linked effects.",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              statusEntries: applyShortRestToCharacterStatusEntries(currentCharacter.statusEntries)
            })
          } satisfies RestOption
        ]
      : []),
    ...(rageUsesTotal > 0
      ? [
          {
            id: "restore-rage",
            label: "End Rage and restore 1 Rage use",
            apply: (currentCharacter: Character) =>
              applyShortRestToBarbarianFeatures(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(bardShortRestRecoveryAvailable && bardicInspirationUsesTotal > 0
      ? [
          {
            id: "restore-bardic-inspiration",
            label: "Restore all Bardic dice",
            apply: (currentCharacter: Character) => applyShortRestToBardFeatures(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(secondWindUsesTotal > 0
      ? [
          {
            id: "restore-second-wind",
            label: "Restore 1 Second Wind",
            apply: (currentCharacter: Character) => applyShortRestToFighterFeatures(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(channelDivinityUsesTotal > 0
      ? [
          {
            id: "restore-channel-divinity",
            label: "Restore 1 Channel Divinity",
            apply: (currentCharacter: Character) =>
              restoreClericChannelDivinityOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : [])
  ];
}

function createLongRestOptions(character: Character): RestOption[] {
  const spellSlotTotal = getSpellSlotTotalsForCharacter(
    character.className,
    character.level
  ).reduce((sum, value) => sum + value, 0);
  const temporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);
  const rageUsesTotal = getBarbarianRageUsesTotal(character);
  const bardicInspirationUsesTotal = getBardicInspirationUsesTotal(character);
  const secondWindUsesTotal = getFighterSecondWindUsesTotal(character);
  const channelDivinityUsesTotal = getClericChannelDivinityUsesTotal(character);
  const hasTimedStatuses = normalizeCharacterStatusEntries(character.statusEntries).length > 0;

  return [
    {
      id: "restore-hit-points",
      label: "Restore full HP",
      apply: (currentCharacter) => ({
        ...currentCharacter,
        currentHitPoints: currentCharacter.hitPoints,
        deathSaves: createDefaultDeathSaves()
      })
    },
    {
      id: "reset-round-tracker",
      label: "Reset round tracker",
      apply: (currentCharacter: Character) => ({
        ...currentCharacter,
        roundTracker: createDefaultRoundTracker()
      })
    },
    ...(spellSlotTotal > 0
      ? [
          {
            id: "restore-spell-slots",
            label: "Restore all spell slots",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              spellSlotsExpended: Array.from({ length: 9 }, () => 0)
            })
          } satisfies RestOption
        ]
      : []),
    ...(temporaryHitPoints > 0
      ? [
          {
            id: "clear-temporary-hit-points",
            label: "Remove Temporary Hit Points",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              temporaryHitPoints: 0
            })
          } satisfies RestOption
        ]
      : []),
    ...(hasTimedStatuses
      ? [
          {
            id: "update-statuses",
            label: "Update Traits & Conditions",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              statusEntries: applyLongRestToCharacterStatusEntries(currentCharacter.statusEntries)
            })
          } satisfies RestOption
        ]
      : []),
    ...(rageUsesTotal > 0
      ? [
          {
            id: "restore-rage",
            label: "End Rage and restore all Rage uses",
            apply: (currentCharacter: Character) =>
              applyLongRestToBarbarianFeatures(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(bardicInspirationUsesTotal > 0
      ? [
          {
            id: "restore-bardic-inspiration",
            label: "Restore all Bardic dice",
            apply: (currentCharacter: Character) => applyLongRestToBardFeatures(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(secondWindUsesTotal > 0
      ? [
          {
            id: "restore-second-wind",
            label: "Restore all Second Wind uses",
            apply: (currentCharacter: Character) => applyLongRestToFighterFeatures(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(channelDivinityUsesTotal > 0
      ? [
          {
            id: "restore-channel-divinity",
            label: "Restore all Channel Divinity",
            apply: (currentCharacter: Character) =>
              restoreClericChannelDivinityOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(hasClericDivineInterventionFeature(character)
      ? [
          {
            id: "restore-divine-intervention",
            label: "Restore Divine Intervention",
            apply: (currentCharacter: Character) =>
              restoreClericDivineInterventionOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : [])
  ];
}

function GameplayForm({ className, onPersistCharacter }: GameplayFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [isEditing, setIsEditing] = useState(false);
  const [hpDraft, setHpDraft] = useState<HpDraft>(() => createHpDraft(character));
  const [hpModeDraft, setHpModeDraft] = useState<MaxHitPointsMode>(() =>
    normalizeMaxHitPointsMode(character.maxHitPointsMode)
  );
  const [hitPointStep, setHitPointStep] = useState(1);
  const [isRestPopupOpen, setIsRestPopupOpen] = useState(false);
  const [selectedRestType, setSelectedRestType] = useState<RestType | null>(null);
  const [selectedRestOptionIds, setSelectedRestOptionIds] = useState<string[]>([]);
  const [isTraitModalOpen, setIsTraitModalOpen] = useState(false);
  const [activeTraitEditorTab, setActiveTraitEditorTab] = useState<TraitEditorTab>("conditions");
  const [statusDraftValues, setStatusDraftValues] = useState<Record<TraitEditorTab, string>>(
    createDefaultStatusDraftValues
  );
  const [statusDraftDurationPreset, setStatusDraftDurationPreset] = useState(
    STATUS_DURATION_PRESET.INFINITE
  );
  const [selectedStatusEntryId, setSelectedStatusEntryId] = useState<string | null>(null);
  const [isEditingStatusDuration, setIsEditingStatusDuration] = useState(false);
  const [statusDrawerDurationPreset, setStatusDrawerDurationPreset] = useState(
    STATUS_DURATION_PRESET.INFINITE
  );
  const [selectedRoundTrackerResource, setSelectedRoundTrackerResource] =
    useState<RoundTrackerResource | null>(null);
  const [selectedFeatureActionKey, setSelectedFeatureActionKey] = useState<string | null>(null);
  const [selectedDivineInterventionSpell, setSelectedDivineInterventionSpell] =
    useState<SpellEntry | null>(null);
  const [selectedReactionSpellSlotLevel, setSelectedReactionSpellSlotLevel] = useState(1);
  const [activeDivineInterventionLevel, setActiveDivineInterventionLevel] = useState(0);
  const [lastDeathSaveRoll, setLastDeathSaveRoll] = useState<number | null>(null);
  const [lastProcessedDeathSaveRollToken, setLastProcessedDeathSaveRollToken] = useState<
    number | null
  >(null);
  const { popupState, openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  const hasOverlayOpen =
    isRestPopupOpen ||
    isTraitModalOpen ||
    selectedStatusEntryId !== null ||
    selectedRoundTrackerResource !== null ||
    selectedFeatureActionKey !== null;

  useBodyScrollLock(hasOverlayOpen);

  useEffect(() => {
    if (!isEditing) {
      setHpDraft(createHpDraft(character));
      setHpModeDraft(normalizeMaxHitPointsMode(character.maxHitPointsMode));
    }
  }, [character.hitPoints, character.currentHitPoints, character.maxHitPointsMode, isEditing]);

  useEffect(() => {
    if (character.currentHitPoints > 0) {
      setLastDeathSaveRoll(null);
      setLastProcessedDeathSaveRollToken(null);
    }
  }, [character.currentHitPoints]);

  useEffect(() => {
    if (!hasOverlayOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        if (selectedDivineInterventionSpell) {
          setSelectedDivineInterventionSpell(null);
          return;
        }

        setIsRestPopupOpen(false);
        setSelectedRestType(null);
        setSelectedRestOptionIds([]);
        setIsTraitModalOpen(false);
        setSelectedStatusEntryId(null);
        setSelectedRoundTrackerResource(null);
        setSelectedFeatureActionKey(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasOverlayOpen, selectedDivineInterventionSpell]);

  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const classSpellEntries = useClassSpellEntries(character.className);
  const preparedSpellPoolEntries = usePreparedSpellEntries(character.className, character.level);
  const cantripLimit = useMemo(
    () =>
      getCantripLimitForCharacter(
        character.className,
        character.level,
        character.classFeatureState
      ),
    [character.classFeatureState, character.className, character.level]
  );
  const preparedSpellLimit = useMemo(
    () => getPreparedSpellLimitForCharacter(character.className, character.level),
    [character.className, character.level]
  );
  const spellSlotTotals = useMemo(
    () => getSpellSlotTotalsForCharacter(character.className, character.level),
    [character.className, character.level]
  );
  const spellSlotsExpended = useMemo(
    () => normalizeSpellSlotsExpended(character.spellSlotsExpended, spellSlotTotals),
    [character.spellSlotsExpended, spellSlotTotals]
  );
  const spellSlotsRemaining = useMemo(
    () =>
      spellSlotTotals.map((total, index) => Math.max(0, total - (spellSlotsExpended[index] ?? 0))),
    [spellSlotTotals, spellSlotsExpended]
  );
  const usesPreparedSpells = useMemo(
    () => usesPreparedSpellsForCharacter(character.className, character.level),
    [character.className, character.level]
  );
  const highestSpellSlotLevel = useMemo(() => {
    const slotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);

    for (let index = slotTotals.length - 1; index >= 0; index -= 1) {
      if ((slotTotals[index] ?? 0) > 0) {
        return index + 1;
      }
    }

    return 0;
  }, [character.className, character.level]);
  const cantripOptions = useMemo(
    () => classSpellEntries.filter((spell) => getSpellLevel(spell) === 0),
    [classSpellEntries]
  );
  const spellPreparationOptions = useMemo(
    () =>
      preparedSpellPoolEntries.filter((spell) => {
        const spellLevel = getSpellLevel(spell);
        return spellLevel > 0 && spellLevel <= highestSpellSlotLevel;
      }),
    [highestSpellSlotLevel, preparedSpellPoolEntries]
  );
  const alwaysPreparedSpellIds = useMemo(
    () =>
      getAlwaysPreparedSpellIds(character.className, character.level, character.classFeatureState),
    [character.classFeatureState, character.className, character.level]
  );
  const classSpellEntriesById = useMemo(
    () =>
      new Map(
        [...classSpellEntries, ...preparedSpellPoolEntries].map((spell) => [spell.id, spell])
      ),
    [classSpellEntries, preparedSpellPoolEntries]
  );
  const featureReactionEntries = useMemo(
    () => getFeatureReactionEntriesForCharacter(character),
    [character]
  );
  const featureReactionEntriesById = useMemo(
    () =>
      new Map(
        featureReactionEntries.map(
          (reaction) => [`reaction-entry-${reaction.id}`, reaction] as const
        )
      ),
    [featureReactionEntries]
  );
  const selectedCantrips = useMemo(
    () =>
      normalizeTrackedSpellIds(character.cantripIds, cantripOptions, cantripLimit)
        .map((spellId) => classSpellEntriesById.get(spellId))
        .filter((spell): spell is SpellEntry => spell !== undefined),
    [cantripLimit, cantripOptions, character.cantripIds, classSpellEntriesById]
  );
  const selectedPreparedSpells = useMemo(
    () =>
      usesPreparedSpells
        ? [
            ...alwaysPreparedSpellIds,
            ...normalizePreparedSpellIds(
              character.preparedSpellIds,
              spellPreparationOptions,
              preparedSpellLimit,
              alwaysPreparedSpellIds
            )
          ]
            .map((spellId) => classSpellEntriesById.get(spellId))
            .filter((spell): spell is SpellEntry => spell !== undefined)
        : spellPreparationOptions,
    [
      alwaysPreparedSpellIds,
      character.preparedSpellIds,
      classSpellEntriesById,
      preparedSpellLimit,
      spellPreparationOptions,
      usesPreparedSpells
    ]
  );
  const reactionStatusEntries = useMemo(
    () =>
      getDerivedReactionStatusEntries(
        [...selectedCantrips, ...selectedPreparedSpells],
        featureReactionEntries
      ),
    [featureReactionEntries, selectedCantrips, selectedPreparedSpells]
  );
  const statusEntries = resolveCharacterStatusEntries(character.statusEntries, [
    ...getDerivedFeatureStatusEntriesForCharacter(character),
    ...getFeatDerivedStatusEntriesForCharacter(character),
    ...reactionStatusEntries
  ]);
  const deathSaves = normalizeDeathSaves(character.deathSaves);
  const temporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);

  useEffect(() => {
    if (character.currentHitPoints <= 0) {
      return;
    }

    if (deathSaves.successes === 0 && deathSaves.failures === 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      deathSaves: createDefaultDeathSaves()
    }));
  }, [character.currentHitPoints, deathSaves.successes, deathSaves.failures, onPersistCharacter]);

  useEffect(() => {
    if (normalizeMaxHitPointsMode(character.maxHitPointsMode) !== "automatic") {
      return;
    }

    const nextAutomaticMaxHitPoints = getAutomaticMaxHitPointsForCharacter(character);

    if (character.hitPoints === nextAutomaticMaxHitPoints) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (normalizeMaxHitPointsMode(currentCharacter.maxHitPointsMode) !== "automatic") {
        return currentCharacter;
      }

      const automaticHitPoints = getAutomaticMaxHitPointsForCharacter(currentCharacter);

      if (currentCharacter.hitPoints === automaticHitPoints) {
        return currentCharacter;
      }

      const nextCurrentHitPoints = clampNumber(
        currentCharacter.currentHitPoints,
        0,
        automaticHitPoints,
        currentCharacter.currentHitPoints
      );

      return {
        ...currentCharacter,
        hitPoints: automaticHitPoints,
        currentHitPoints: nextCurrentHitPoints,
        deathSaves:
          nextCurrentHitPoints > 0
            ? createDefaultDeathSaves()
            : normalizeDeathSaves(currentCharacter.deathSaves)
      };
    });
  }, [
    character.className,
    character.level,
    character.abilities.CON,
    character.maxHitPointsMode,
    character.hitPoints,
    character.currentHitPoints,
    onPersistCharacter
  ]);

  const currentHitPointPercent =
    character.hitPoints > 0 ? (character.currentHitPoints / character.hitPoints) * 100 : 0;
  const temporaryHitPointPercent =
    character.hitPoints > 0 ? (temporaryHitPoints / character.hitPoints) * 100 : 0;
  const temporaryHitPointOverflow =
    character.currentHitPoints + temporaryHitPoints > character.hitPoints;
  const combatActions = getCombatActionsForCharacter(character);
  const shortRestsUsedToday = clampNumber(character.shortRestsUsedToday, 0, 2, 0);
  const shortRestsRemaining = Math.max(0, 2 - shortRestsUsedToday);
  const shortRestHealAmount = Math.ceil(character.hitPoints / 2);
  const shortRestOptions = useMemo(() => createShortRestOptions(character), [character]);
  const longRestOptions = useMemo(() => createLongRestOptions(character), [character]);
  const selectedRestOptions = useMemo(
    () =>
      selectedRestType === "short"
        ? shortRestOptions
        : selectedRestType === "long"
          ? longRestOptions
          : [],
    [longRestOptions, selectedRestType, shortRestOptions]
  );
  const isAtZeroHitPoints = character.currentHitPoints === 0;
  const isDeathSaveResolved = deathSaves.successes >= 3 || deathSaves.failures >= 3;
  const selectedStatusEntry = selectedStatusEntryId
    ? (statusEntries.find((entry) => entry.id === selectedStatusEntryId) ?? null)
    : null;
  const selectedReactionSpell =
    selectedStatusEntry?.group === STATUS_ENTRY_GROUP.REACTIONS &&
    selectedStatusEntry.sourceId?.startsWith("reaction-spell-")
      ? (classSpellEntriesById.get(selectedStatusEntry.sourceId.replace(/^reaction-spell-/, "")) ??
        null)
      : null;
  const selectedReactionEntry =
    selectedStatusEntry?.group === STATUS_ENTRY_GROUP.REACTIONS &&
    selectedStatusEntry.sourceId?.startsWith("reaction-entry-")
      ? (featureReactionEntriesById.get(
          selectedStatusEntry.sourceId as `reaction-entry-${string}`
        ) ?? null)
      : null;
  const hasSelectedStatusEntry = selectedStatusEntry !== null;
  const selectedStatusEntryPreset = selectedStatusEntry
    ? getStatusDurationPreset(selectedStatusEntry.duration)
    : STATUS_DURATION_PRESET.INFINITE;
  const statusSections = statusGroupOrder
    .map((group) => ({
      group,
      title: statusGroupTitles[group],
      entries: statusEntries.filter((entry) => entry.group === group)
    }))
    .filter((section) => section.entries.length > 0);
  const selectedFeatureActionEntry =
    selectedFeatureActionKey !== null
      ? (combatActions.find(
          (combatAction) =>
            combatAction.kind === "feature" && combatAction.action.key === selectedFeatureActionKey
        ) ?? null)
      : null;
  const selectedFeatureAction =
    selectedFeatureActionEntry?.kind === "feature" ? selectedFeatureActionEntry.action : null;
  const selectedFeatureActionOptions =
    selectedFeatureActionKey && selectedFeatureAction
      ? getFeatureActionOptionsForCharacter(character, selectedFeatureActionKey)
      : [];
  const isDivineInterventionSelected = selectedFeatureAction?.key === divineInterventionActionKey;
  const divineInterventionEnabledLevels = useMemo(
    () => getClericDivineInterventionEnabledLevels(character),
    [character]
  );
  const divineInterventionSpellEntries = useMemo(
    () => getClericDivineInterventionSpellEntries(character),
    [character]
  );
  const divineInterventionSpellGroups = useMemo(
    () => getDivineInterventionLevelGroups(divineInterventionSpellEntries),
    [divineInterventionSpellEntries]
  );
  const firstAvailableDivineInterventionLevel = useMemo(
    () =>
      divineInterventionEnabledLevels.find(
        (level) => (divineInterventionSpellGroups[level]?.length ?? 0) > 0
      ) ??
      divineInterventionEnabledLevels[0] ??
      0,
    [divineInterventionEnabledLevels, divineInterventionSpellGroups]
  );
  const activeDivineInterventionSpells = useMemo(
    () => divineInterventionSpellGroups[activeDivineInterventionLevel] ?? [],
    [activeDivineInterventionLevel, divineInterventionSpellGroups]
  );
  const divineInterventionOutcomeSummariesById = useMemo(
    () =>
      new Map(
        divineInterventionSpellEntries.map((spell) => [
          spell.id,
          getSpellOutcomeSummaryForCharacter(character, spell)
        ])
      ),
    [character, divineInterventionSpellEntries]
  );
  const spellcastingState = getSpellcastingStateForCharacter(character);
  const selectedReactionActionWarning = getRoundTrackerActionWarning("reaction", roundTracker);
  const selectedReactionBlockedReason = spellcastingState.blocked ? spellcastingState.reason : null;
  const selectedRoundTrackerMeta = selectedRoundTrackerResource
    ? getRoundTrackerResourceMeta(
        selectedRoundTrackerResource,
        isRoundTrackerResourceAvailable(roundTracker, selectedRoundTrackerResource)
      )
    : null;
  const selectedDivineInterventionActionWarning = getRoundTrackerActionWarning(
    selectedFeatureAction?.actionCost ?? null,
    roundTracker
  );
  const selectedDivineInterventionBlockedReason =
    selectedDivineInterventionSpell?.castingTime.includes(ACTION_TYPE.REACTION)
      ? "Divine Intervention can't cast Reaction spells."
      : spellcastingState.blocked
        ? spellcastingState.reason
        : null;

  useEffect(() => {
    if (!selectedStatusEntryId) {
      return;
    }

    if (selectedStatusEntry) {
      return;
    }

    setSelectedStatusEntryId(null);
  }, [selectedStatusEntry, selectedStatusEntryId]);

  useEffect(() => {
    if (!hasSelectedStatusEntry) {
      setIsEditingStatusDuration(false);
      return;
    }

    setStatusDrawerDurationPreset(selectedStatusEntryPreset);
    setIsEditingStatusDuration(false);
  }, [hasSelectedStatusEntry, selectedStatusEntryId, selectedStatusEntryPreset]);

  useEffect(() => {
    if (!selectedFeatureActionKey) {
      setSelectedDivineInterventionSpell(null);
      return;
    }

    if (
      selectedFeatureAction &&
      (selectedFeatureActionOptions.length > 0 || isDivineInterventionSelected)
    ) {
      return;
    }

    setSelectedDivineInterventionSpell(null);
    setSelectedFeatureActionKey(null);
  }, [
    isDivineInterventionSelected,
    selectedFeatureAction,
    selectedFeatureActionKey,
    selectedFeatureActionOptions.length
  ]);

  useEffect(() => {
    if (!isDivineInterventionSelected) {
      setSelectedDivineInterventionSpell(null);
      return;
    }

    setActiveDivineInterventionLevel(1);
  }, [isDivineInterventionSelected]);

  useEffect(() => {
    if (!isDivineInterventionSelected) {
      return;
    }

    setActiveDivineInterventionLevel((currentLevel) => {
      if (
        divineInterventionEnabledLevels.includes(currentLevel) &&
        (divineInterventionSpellGroups[currentLevel]?.length ?? 0) > 0
      ) {
        return currentLevel;
      }

      return firstAvailableDivineInterventionLevel;
    });
  }, [
    divineInterventionEnabledLevels,
    divineInterventionSpellGroups,
    firstAvailableDivineInterventionLevel,
    isDivineInterventionSelected
  ]);

  useEffect(() => {
    if (!selectedReactionSpell) {
      return;
    }

    const spellLevel = getSpellLevel(selectedReactionSpell);
    const minimumSlotLevel = Math.max(1, spellLevel);
    const preferredSlotLevel =
      spellLevel === 0
        ? 1
        : (spellSlotLevels.find(
            (slotLevel) =>
              slotLevel >= minimumSlotLevel && (spellSlotsRemaining[slotLevel - 1] ?? 0) > 0
          ) ??
          spellSlotLevels.find(
            (slotLevel) =>
              slotLevel >= minimumSlotLevel && (spellSlotTotals[slotLevel - 1] ?? 0) > 0
          ) ??
          minimumSlotLevel);

    setSelectedReactionSpellSlotLevel(preferredSlotLevel);
  }, [selectedReactionSpell, spellSlotTotals, spellSlotsRemaining]);

  function updateRoundTracker(resource: RoundTrackerResource) {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      roundTracker: consumeRoundTrackerResource(currentCharacter.roundTracker, resource)
    }));
  }

  function resetRoundTrackerResource(resource: RoundTrackerResource) {
    onPersistCharacter((currentCharacter) => {
      return {
        ...currentCharacter,
        roundTracker: setRoundTrackerResourceAvailability(
          currentCharacter.roundTracker,
          resource,
          true
        )
      };
    });
  }

  function consumeRoundTrackerFromDrawer(resource: RoundTrackerResource) {
    updateRoundTracker(resource);
    setSelectedRoundTrackerResource(null);
  }

  function handleResetRoundTrackerResource(resource: RoundTrackerResource) {
    resetRoundTrackerResource(resource);
    setSelectedRoundTrackerResource(null);
  }

  function beginEditing() {
    setHpDraft(createHpDraft(character));
    setHpModeDraft(normalizeMaxHitPointsMode(character.maxHitPointsMode));
    setIsEditing(true);
  }

  function cancelEditing() {
    setHpDraft(createHpDraft(character));
    setHpModeDraft(normalizeMaxHitPointsMode(character.maxHitPointsMode));
    setIsEditing(false);
  }

  function saveHitPoints() {
    const nextMaxHitPoints =
      hpModeDraft === "automatic"
        ? getAutomaticMaxHitPointsForCharacter(character)
        : clampNumber(hpDraft.hitPoints, 1, 999, character.hitPoints);
    const nextCurrentHitPoints = clampNumber(
      hpDraft.currentHitPoints,
      0,
      nextMaxHitPoints,
      character.currentHitPoints
    );

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      hitPoints: nextMaxHitPoints,
      currentHitPoints: nextCurrentHitPoints,
      maxHitPointsMode: hpModeDraft,
      deathSaves:
        nextCurrentHitPoints > 0
          ? createDefaultDeathSaves()
          : normalizeDeathSaves(currentCharacter.deathSaves)
    }));

    setIsEditing(false);
  }

  function setHitPointMode(nextMode: MaxHitPointsMode) {
    setHpModeDraft(nextMode);

    if (nextMode !== "automatic") {
      return;
    }

    const automaticHitPoints = getAutomaticMaxHitPointsForCharacter(character);

    setHpDraft((currentDraft) => ({
      hitPoints: automaticHitPoints,
      currentHitPoints: clampNumber(
        currentDraft.currentHitPoints,
        0,
        automaticHitPoints,
        currentDraft.currentHitPoints
      )
    }));
  }

  function adjustHitPoints(direction: -1 | 1) {
    const amount = clampNumber(hitPointStep, 0, 999, 0);

    if (amount === 0) {
      setHitPointStep(1);
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (direction > 0) {
        const nextCurrentHitPoints = clampNumber(
          currentCharacter.currentHitPoints + amount,
          0,
          currentCharacter.hitPoints,
          currentCharacter.currentHitPoints
        );

        if (nextCurrentHitPoints === currentCharacter.currentHitPoints) {
          return currentCharacter;
        }

        return {
          ...currentCharacter,
          currentHitPoints: nextCurrentHitPoints,
          deathSaves:
            nextCurrentHitPoints > 0
              ? createDefaultDeathSaves()
              : normalizeDeathSaves(currentCharacter.deathSaves)
        };
      }

      const currentTemporaryHitPoints = normalizeTemporaryHitPoints(
        currentCharacter.temporaryHitPoints
      );
      const absorbedByTemporaryHitPoints = Math.min(amount, currentTemporaryHitPoints);
      const nextTemporaryHitPoints = currentTemporaryHitPoints - absorbedByTemporaryHitPoints;
      const remainingDamage = amount - absorbedByTemporaryHitPoints;
      const nextCurrentHitPoints = clampNumber(
        currentCharacter.currentHitPoints - remainingDamage,
        0,
        currentCharacter.hitPoints,
        currentCharacter.currentHitPoints
      );

      if (
        nextTemporaryHitPoints === currentTemporaryHitPoints &&
        nextCurrentHitPoints === currentCharacter.currentHitPoints
      ) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        temporaryHitPoints: nextTemporaryHitPoints,
        currentHitPoints: nextCurrentHitPoints,
        deathSaves:
          nextCurrentHitPoints > 0
            ? createDefaultDeathSaves()
            : normalizeDeathSaves(currentCharacter.deathSaves)
      };
    });

    setHitPointStep(1);
  }

  function openRestPopup() {
    setSelectedRestType(null);
    setSelectedRestOptionIds([]);
    setIsRestPopupOpen(true);
  }

  function closeRestPopup() {
    setIsRestPopupOpen(false);
    setSelectedRestType(null);
    setSelectedRestOptionIds([]);
  }

  function selectRestType(restType: RestType) {
    if (restType === "short" && shortRestsRemaining <= 0) {
      return;
    }

    const nextOptions = restType === "short" ? shortRestOptions : longRestOptions;
    setSelectedRestType(restType);
    setSelectedRestOptionIds(nextOptions.map((option) => option.id));
  }

  function toggleRestOption(optionId: string) {
    setSelectedRestOptionIds((currentOptionIds) =>
      currentOptionIds.includes(optionId)
        ? currentOptionIds.filter((id) => id !== optionId)
        : [...currentOptionIds, optionId]
    );
  }

  function confirmRest() {
    if (!selectedRestType) {
      return;
    }

    if (selectedRestType === "short" && shortRestsRemaining <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const availableOptions =
        selectedRestType === "short"
          ? createShortRestOptions(currentCharacter)
          : createLongRestOptions(currentCharacter);
      const selectedOptionIdSet = new Set(selectedRestOptionIds);
      const restedCharacter = availableOptions.reduce((nextCharacter, option) => {
        if (!selectedOptionIdSet.has(option.id)) {
          return nextCharacter;
        }

        return option.apply(nextCharacter);
      }, currentCharacter);

      return {
        ...restedCharacter,
        shortRestsUsedToday:
          selectedRestType === "short"
            ? clampNumber((restedCharacter.shortRestsUsedToday ?? 0) + 1, 0, 2, 0)
            : 0
      };
    });

    closeRestPopup();
  }

  function openTraitEditor() {
    setActiveTraitEditorTab("conditions");
    setStatusDraftDurationPreset(STATUS_DURATION_PRESET.INFINITE);
    setIsTraitModalOpen(true);
  }

  function addStatusEntry() {
    const selectedValue = statusDraftValues[activeTraitEditorTab]?.trim();

    if (!selectedValue) {
      return;
    }

    const nextGroup = getTraitEditorGroup(activeTraitEditorTab);
    const nextDuration = resolveStatusDurationPreset(
      statusDraftDurationPreset,
      nextGroup,
      selectedValue as CharacterStatusValue
    );

    onPersistCharacter((currentCharacter) => {
      return {
        ...currentCharacter,
        statusEntries: upsertManualStatusEntry(currentCharacter.statusEntries, {
          group: nextGroup,
          value: selectedValue as CharacterStatusValue,
          source: "Manual",
          duration: nextDuration
        })
      };
    });

    setStatusDraftDurationPreset(STATUS_DURATION_PRESET.INFINITE);
    setIsTraitModalOpen(false);
  }

  function removeStatusEntry(entry: CharacterStatusEntry) {
    onPersistCharacter((currentCharacter) => {
      if (entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.FEATURE) {
        return removeFeatureStatusEntryForCharacter(currentCharacter, entry);
      }

      return {
        ...currentCharacter,
        statusEntries: removeCharacterStatusEntry(currentCharacter.statusEntries, entry.id)
      };
    });

    setSelectedStatusEntryId(null);
  }

  function applyStatusEntryDuration() {
    if (!selectedStatusEntry) {
      return;
    }

    const nextDuration = resolveStatusDurationPreset(
      statusDrawerDurationPreset,
      selectedStatusEntry.group,
      selectedStatusEntry.value
    );

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      statusEntries: updateCharacterStatusEntryDuration(
        currentCharacter.statusEntries,
        selectedStatusEntry,
        nextDuration
      )
    }));

    setIsEditingStatusDuration(false);
  }

  function activateFeatureAction(actionKey: string, actionCost: RoundTrackerResource | null) {
    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateFeatureActionForCharacter(currentCharacter, actionKey);

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      return actionCost
        ? {
            ...nextCharacter,
            roundTracker: consumeRoundTrackerResource(nextCharacter.roundTracker, actionCost)
          }
        : nextCharacter;
    });
  }

  function handleFeatureActionClick(
    actionKey: string,
    actionCost: RoundTrackerResource | null,
    interaction: "activate" | "select" | undefined
  ) {
    if (interaction === "select") {
      setSelectedFeatureActionKey(actionKey);
      return;
    }

    if (actionKey === fighterSecondWindActionKey) {
      onPersistCharacter((currentCharacter) => {
        const nextCharacter = activateFeatureActionForCharacter(currentCharacter, actionKey);

        if (nextCharacter === currentCharacter) {
          return currentCharacter;
        }

        const healingResult = rollFormulaWithDice(
          getFighterSecondWindHealingFormula(currentCharacter),
          "normal"
        );
        const nextCurrentHitPoints = clampNumber(
          nextCharacter.currentHitPoints + healingResult.total,
          0,
          nextCharacter.hitPoints,
          nextCharacter.currentHitPoints
        );
        const healedCharacter = {
          ...nextCharacter,
          currentHitPoints: nextCurrentHitPoints,
          deathSaves:
            nextCurrentHitPoints > 0
              ? createDefaultDeathSaves()
              : normalizeDeathSaves(nextCharacter.deathSaves)
        };

        return actionCost
          ? {
              ...healedCharacter,
              roundTracker: consumeRoundTrackerResource(healedCharacter.roundTracker, actionCost)
            }
          : healedCharacter;
      });
      return;
    }

    activateFeatureAction(actionKey, actionCost);
  }

  function activateFeatureActionOptionSelection(
    actionKey: string,
    optionKey: string,
    actionCost: RoundTrackerResource | null
  ) {
    const option = selectedFeatureActionOptions.find((entry) => entry.key === optionKey);

    if (!option) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateFeatureActionOptionForCharacter(
        currentCharacter,
        actionKey,
        optionKey
      );

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      return actionCost
        ? {
            ...nextCharacter,
            roundTracker: consumeRoundTrackerResource(nextCharacter.roundTracker, actionCost)
          }
        : nextCharacter;
    });

    if (option.rollFormula) {
      openDiceRoller({
        title: option.name,
        formula: option.rollFormula,
        formulaDisplay: option.rollFormulaDisplay,
        description: option.rollDescription ?? option.detail
      });
    }

    setSelectedFeatureActionKey(null);
  }

  function closeDivineInterventionModal() {
    setSelectedDivineInterventionSpell(null);
    setSelectedFeatureActionKey(null);
  }

  function closeSelectedReaction() {
    setSelectedStatusEntryId(null);
  }

  function useDivineInterventionSpell() {
    if (!selectedDivineInterventionSpell || !selectedFeatureAction) {
      return;
    }

    if (selectedDivineInterventionBlockedReason) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateFeatureActionForCharacter(
        currentCharacter,
        selectedFeatureAction.key
      );

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      return selectedFeatureAction.actionCost
        ? {
            ...nextCharacter,
            roundTracker: consumeRoundTrackerResource(
              nextCharacter.roundTracker,
              selectedFeatureAction.actionCost
            )
          }
        : nextCharacter;
    });

    closeDivineInterventionModal();
  }

  function castSelectedReactionSpell() {
    if (!selectedReactionSpell || selectedReactionBlockedReason || selectedReactionActionWarning) {
      return;
    }

    const spellLevel = getSpellLevel(selectedReactionSpell);

    if (spellLevel === 0) {
      onPersistCharacter((currentCharacter) => ({
        ...currentCharacter,
        roundTracker: consumeRoundTrackerResource(currentCharacter.roundTracker, "reaction")
      }));
      closeSelectedReaction();
      return;
    }

    const minimumSlotLevel = Math.max(1, spellLevel);
    const slotLevel = clampNumber(
      selectedReactionSpellSlotLevel,
      minimumSlotLevel,
      9,
      minimumSlotLevel
    );

    if ((spellSlotsRemaining[slotLevel - 1] ?? 0) <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const currentSpellSlotTotals = getSpellSlotTotalsForCharacter(
        currentCharacter.className,
        currentCharacter.level
      );
      const currentSpellSlotsExpended = normalizeSpellSlotsExpended(
        currentCharacter.spellSlotsExpended,
        currentSpellSlotTotals
      );
      const nextSpellSlotsExpended = [...currentSpellSlotsExpended];

      nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;

      return {
        ...currentCharacter,
        spellSlotsExpended: nextSpellSlotsExpended,
        roundTracker: consumeRoundTrackerResource(currentCharacter.roundTracker, "reaction")
      };
    });

    closeSelectedReaction();
  }

  function castSelectedReactionEntry() {
    if (!selectedReactionEntry || selectedReactionActionWarning) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      roundTracker: consumeRoundTrackerResource(currentCharacter.roundTracker, "reaction")
    }));

    closeSelectedReaction();
  }

  function finishRound() {
    onPersistCharacter((currentCharacter) => {
      const nextStatusEntries = advanceCharacterStatusEntries(currentCharacter.statusEntries);
      const expiredFeatureOverrideEntries = getExpiredFeatureOverrideEntries(
        currentCharacter.statusEntries,
        nextStatusEntries
      );
      let nextCharacter: Character = advanceFeatureStateForNewRound({
        ...currentCharacter,
        roundTracker: createDefaultRoundTracker(),
        statusEntries: nextStatusEntries
      });

      expiredFeatureOverrideEntries.forEach((entry) => {
        nextCharacter = removeFeatureStatusEntryForCharacter(nextCharacter, entry);
      });

      return nextCharacter;
    });
  }

  function updateDeathSaves(track: "success" | "failure") {
    if (!isAtZeroHitPoints || isDeathSaveResolved) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const currentDeathSaves = normalizeDeathSaves(currentCharacter.deathSaves);

      if (track === "success") {
        return {
          ...currentCharacter,
          deathSaves: {
            ...currentDeathSaves,
            successes: Math.min(3, currentDeathSaves.successes + 1)
          }
        };
      }

      return {
        ...currentCharacter,
        deathSaves: {
          ...currentDeathSaves,
          failures: Math.min(3, currentDeathSaves.failures + 1)
        }
      };
    });
  }

  function resetDeathSaves() {
    setLastDeathSaveRoll(null);
    setLastProcessedDeathSaveRollToken(null);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      deathSaves: createDefaultDeathSaves()
    }));
  }

  function rollDeathSave() {
    if (!isAtZeroHitPoints || isDeathSaveResolved) {
      return;
    }

    openDiceRoller({
      title: "Death save",
      formula: "1d20",
      description: "Roll a d20. 10 or higher counts as a success."
    });
  }

  useEffect(() => {
    if (!popupState || popupState.request.title !== "Death save") {
      return;
    }

    if (!popupState.result || popupState.error) {
      return;
    }

    if (lastProcessedDeathSaveRollToken === popupState.rollToken) {
      return;
    }

    const rolledValue = popupState.result.total;

    setLastProcessedDeathSaveRollToken(popupState.rollToken);
    setLastDeathSaveRoll(rolledValue);
    updateDeathSaves(rolledValue >= 10 ? "success" : "failure");
  }, [popupState, lastProcessedDeathSaveRollToken]);

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={clsx(shared.sectionHeader, styles.gameplaySectionHeader)}>
        <div>
          <p className={shared.eyebrow}>Gameplay</p>
        </div>
        <div className={styles.gameplayHeaderControls}>
          <div className={styles.roundTrackerPill} aria-label="Round tracker">
            <button
              type="button"
              className={styles.roundTrackerPillButton}
              onClick={() => setSelectedRoundTrackerResource("action")}
              aria-label={roundTracker.actionAvailable ? "Action available" : "Action spent"}
              title={roundTracker.actionAvailable ? "Action available" : "Action spent"}
            >
              <span
                className={clsx(
                  styles.roundTrackerCircle,
                  roundTracker.actionAvailable && styles.roundTrackerCircleFilled
                )}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              className={styles.roundTrackerPillButton}
              onClick={() => setSelectedRoundTrackerResource("bonusAction")}
              aria-label={
                roundTracker.bonusActionAvailable ? "Bonus action available" : "Bonus action spent"
              }
              title={
                roundTracker.bonusActionAvailable ? "Bonus action available" : "Bonus action spent"
              }
            >
              <span
                className={clsx(
                  styles.roundTrackerTriangle,
                  roundTracker.bonusActionAvailable && styles.roundTrackerTriangleFilled
                )}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              className={styles.roundTrackerPillButton}
              onClick={() => setSelectedRoundTrackerResource("reaction")}
              aria-label={roundTracker.reactionAvailable ? "Reaction available" : "Reaction spent"}
              title={roundTracker.reactionAvailable ? "Reaction available" : "Reaction spent"}
            >
              <svg
                viewBox="0 0 24 24"
                className={clsx(
                  styles.roundTrackerReaction,
                  roundTracker.reactionAvailable && styles.roundTrackerReactionFilled
                )}
                aria-hidden="true"
              >
                <path d="M12 1.5 15.6 8.4 22.5 12 15.6 15.6 12 22.5 8.4 15.6 1.5 12 8.4 8.4Z" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.roundTrackerPillButton}
              onClick={finishRound}
              aria-label="Finish round"
              title="Finish round"
            >
              <FastForward size={15} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            className={clsx(shared.editButton, styles.campTriggerButton)}
            onClick={openRestPopup}
          >
            <Moon size={16} />
            Camp
          </button>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <section className={clsx(styles.widgetCard, styles.hpWidget)}>
          <header className={styles.widgetHeader}>
            <p className={styles.widgetTitle}>Hit Points</p>
            {isEditing ? null : (
              <button
                type="button"
                className={clsx(shared.editButton, styles.hpWidgetEditButton)}
                onClick={beginEditing}
              >
                <Pencil size={16} />
                Edit
              </button>
            )}
          </header>

          {isEditing ? (
            <div className={styles.hpEditGrid}>
              <div className={styles.hpModeSwitch} role="tablist" aria-label="Max HP mode">
                <button
                  type="button"
                  className={clsx(
                    styles.hpModeSwitchButton,
                    hpModeDraft === "automatic" && styles.hpModeSwitchButtonActive
                  )}
                  onClick={() => setHitPointMode("automatic")}
                  aria-pressed={hpModeDraft === "automatic"}
                >
                  Automatic
                </button>
                <button
                  type="button"
                  className={clsx(
                    styles.hpModeSwitchButton,
                    hpModeDraft === "custom" && styles.hpModeSwitchButtonActive
                  )}
                  onClick={() => setHitPointMode("custom")}
                  aria-pressed={hpModeDraft === "custom"}
                >
                  Custom
                </button>
              </div>

              <label className={styles.widgetField}>
                <span>Max HP</span>
                <NumberInput
                  min={1}
                  disabled={hpModeDraft === "automatic"}
                  value={hpDraft.hitPoints}
                  onChange={(event) =>
                    setHpDraft((current) => ({
                      ...current,
                      hitPoints: clampNumber(event.target.value, 1, 999, current.hitPoints)
                    }))
                  }
                />
              </label>
              <label className={styles.widgetField}>
                <span>Current HP</span>
                <NumberInput
                  min={0}
                  max={hpDraft.hitPoints}
                  value={hpDraft.currentHitPoints}
                  onChange={(event) =>
                    setHpDraft((current) => ({
                      ...current,
                      currentHitPoints: clampNumber(
                        event.target.value,
                        0,
                        current.hitPoints,
                        current.currentHitPoints
                      )
                    }))
                  }
                />
              </label>
              <div className={styles.hpEditActions}>
                <button type="button" className={shared.saveButton} onClick={saveHitPoints}>
                  <Save size={16} />
                  Save
                </button>
                <button type="button" className={shared.cancelButton} onClick={cancelEditing}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.hpSummary}>
                <div className={styles.hpValueRow}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <strong>
                        {character.currentHitPoints}/{character.hitPoints} HP
                      </strong>
                      <TemporaryHitPoints
                        temporaryHitPoints={temporaryHitPoints}
                        onPersistCharacter={onPersistCharacter}
                      />
                    </div>

                    <span>
                      {character.currentHitPoints === 0
                        ? "Unconscious"
                        : character.currentHitPoints <= Math.ceil(character.hitPoints * 0.35)
                          ? "Critical"
                          : "Stable"}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.hpActionRow}>
                <div className={styles.hpBarTrack}>
                  <div className={styles.hpBarMeter}>
                    <div
                      className={styles.hpBarFill}
                      style={{ width: `${Math.max(0, currentHitPointPercent)}%` }}
                    />
                    {temporaryHitPointPercent > 0 ? (
                      <div
                        className={clsx(
                          styles.hpBarTempFill,
                          temporaryHitPointOverflow && styles.tempOverflow
                        )}
                        style={{ width: `${temporaryHitPointPercent}%` }}
                      />
                    ) : null}
                  </div>
                </div>
                <div className={styles.hpStepControl}>
                  <NumberInput
                    min={0}
                    className={styles.hpStepInput}
                    value={hitPointStep}
                    onChange={(event) => {
                      const normalizedValue = event.target.value.replace(/^0+(?=\d)/, "");
                      setHitPointStep(clampNumber(normalizedValue, 0, 999, 0));
                    }}
                  />
                  <button
                    type="button"
                    className={clsx(styles.hpActionButton, styles.hpDamage)}
                    onClick={() => adjustHitPoints(-1)}
                    title={`Deal ${hitPointStep} hit points`}
                  >
                    <Sword size={20} />
                  </button>
                  <button
                    type="button"
                    className={clsx(styles.hpActionButton, styles.hpHeal)}
                    onClick={() => adjustHitPoints(1)}
                    title={`Heal ${hitPointStep} hit points`}
                  >
                    <HeartPlus size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <section className={clsx(styles.widgetCard, styles.weaponWidget)}>
          <header className={styles.widgetHeader}>
            <p className={styles.widgetTitle}>Actions</p>
          </header>
          {combatActions.length === 0 ? (
            <p className={shared.emptyText}>
              No actions available. Equip a weapon to roll attacks.
            </p>
          ) : (
            <div className={styles.weaponActionGrid}>
              {combatActions.map((combatAction) =>
                combatAction.kind === "weapon" ? (
                  <button
                    key={combatAction.action.key}
                    type="button"
                    className={styles.weaponActionButton}
                    onClick={() => {
                      openDiceRoller({
                        title: `${combatAction.action.name} attack`,
                        formula: combatAction.action.rollFormula,
                        formulaDisplay: combatAction.action.rollFormulaDisplay,
                        description: getWeaponActionRollDescription(combatAction.action)
                      });
                      onPersistCharacter((currentCharacter) => {
                        const nextCharacter = combatAction.action.damageBonusEntries.reduce(
                          (updatedCharacter, entry) =>
                            markFeatureWeaponBonusUseForCharacter(updatedCharacter, entry.label),
                          currentCharacter
                        );

                        return {
                          ...nextCharacter,
                          roundTracker: consumeRoundTrackerResource(
                            nextCharacter.roundTracker,
                            "action"
                          )
                        };
                      });
                    }}
                  >
                    <strong>{combatAction.action.name}</strong>
                    <span className={styles.weaponActionDamageRow}>
                      {getDamageRangeLabel(
                        combatAction.action.damageLabel,
                        combatAction.action.totalModifier,
                        combatAction.action.rollFormula
                      )}
                    </span>
                    <small className={styles.weaponActionBreakdownRow}>
                      {getWeaponActionBreakdown(combatAction.action)}
                    </small>
                  </button>
                ) : (
                  <button
                    key={combatAction.action.key}
                    type="button"
                    className={clsx(
                      styles.weaponActionButton,
                      styles.featureActionButton,
                      combatAction.action.isActive && styles.featureActionButtonActive
                    )}
                    disabled={combatAction.action.disabled}
                    onClick={() =>
                      handleFeatureActionClick(
                        combatAction.action.key,
                        combatAction.action.actionCost,
                        combatAction.action.interaction
                      )
                    }
                  >
                    <strong>{combatAction.action.name}</strong>
                    <span className={clsx(styles.weaponActionDamageRow, styles.featureActionMeta)}>
                      {getFeatureActionModeLabel(combatAction.action.actionCost)}
                      {combatAction.action.usesLabel ? ` | ${combatAction.action.usesLabel}` : ""}
                    </span>
                    <small className={styles.weaponActionBreakdownRow}>
                      {combatAction.action.disabledReason ??
                        (combatAction.action.isActive
                          ? combatAction.action.detail
                          : combatAction.action.summary)}
                    </small>
                  </button>
                )
              )}
            </div>
          )}
        </section>

        <section className={clsx(styles.widgetCard, styles.traitsWidget)}>
          <header className={styles.widgetHeader}>
            <p className={styles.widgetTitle}>Traits &amp; Conditions</p>
            <button type="button" className={shared.editButton} onClick={openTraitEditor}>
              <Pencil size={16} />
              Edit
            </button>
          </header>

          {statusSections.length === 0 ? (
            <p className={shared.emptyText}>No traits or conditions.</p>
          ) : (
            <div
              className={styles.statusSectionStack}
              style={
                {
                  "--status-column-count": String(Math.max(4, Math.min(6, statusSections.length))),
                  "--status-tablet-column-count": String(
                    statusSections.length > 4 ? 3 : Math.max(1, statusSections.length)
                  ),
                  "--status-mobile-column-count": String(
                    Math.max(1, Math.min(2, statusSections.length))
                  )
                } as CSSProperties
              }
            >
              {statusSections.map((section) => (
                <div key={section.group} className={styles.statusSection}>
                  <p className={styles.statusSectionTitle}>{section.title}</p>
                  <ul className={styles.statusList}>
                    {section.entries.map((entry) => {
                      const shortDurationLabel = getStatusDurationShortLabel(entry.duration);

                      return (
                        <li key={entry.id}>
                          <button
                            type="button"
                            className={styles.statusButton}
                            onClick={() => setSelectedStatusEntryId(entry.id)}
                          >
                            <span className={styles.statusButtonText}>
                              <span>{getStatusEntryTitle(entry)}</span>
                              <small>{getStatusEntrySourceLabel(entry)}</small>
                            </span>
                            {shortDurationLabel ? (
                              <strong className={styles.conditionDuration}>
                                <span>(</span>
                                {shortDurationLabel}
                                <span>)</span>
                              </strong>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {isAtZeroHitPoints ? (
          <section className={clsx(styles.widgetCard, styles.deathWidget)}>
            <header className={clsx(styles.widgetHeader, styles.deathHeaderRow)}>
              <div className={styles.deathHeaderMain}>
                <p className={styles.widgetTitle}>Death Saves</p>
                <div className={styles.deathStateRow}>
                  <Skull size={16} />
                  <strong>
                    {deathSaves.failures >= 3
                      ? "Dead"
                      : deathSaves.successes >= 3
                        ? "Stabilized"
                        : "Make death saves"}
                  </strong>
                </div>
              </div>
              <div className={styles.deathSummaryRow}>
                <span>Successes</span>
                <span>Failures</span>
              </div>
            </header>

            <div className={styles.deathTrackGrid}>
              <div className={styles.deathTrackColumn}>
                <div className={styles.deathDotsRow}>
                  {Array.from({ length: 3 }, (_, index) => (
                    <span
                      key={`success-${index}`}
                      className={clsx(
                        styles.deathDot,
                        index < deathSaves.successes && styles.deathDotSuccess
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.deathTrackColumn}>
                <div className={styles.deathDotsRow}>
                  {Array.from({ length: 3 }, (_, index) => (
                    <span
                      key={`failure-${index}`}
                      className={clsx(
                        styles.deathDot,
                        index < deathSaves.failures && styles.deathDotFailure
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.deathActionRow}>
              <button
                type="button"
                className={clsx(styles.deathActionButton, styles.deathRollButton)}
                disabled={isDeathSaveResolved}
                onClick={rollDeathSave}
              >
                <Dices size={15} />
                Roll d20
              </button>
              <button
                type="button"
                className={styles.deathActionButton}
                disabled={isDeathSaveResolved}
                onClick={() => updateDeathSaves("success")}
              >
                Success
              </button>
              <button
                type="button"
                className={styles.deathActionButton}
                disabled={isDeathSaveResolved}
                onClick={() => updateDeathSaves("failure")}
              >
                Failure
              </button>
              <button type="button" className={styles.deathActionButton} onClick={resetDeathSaves}>
                Reset
              </button>
            </div>
            {lastDeathSaveRoll !== null ? (
              <p className={styles.deathRollResult}>
                Last roll: d20 = {lastDeathSaveRoll} (
                {lastDeathSaveRoll >= 10 ? "Success" : "Failure"})
              </p>
            ) : null}
          </section>
        ) : null}
      </div>

      {isRestPopupOpen ? (
        <div className={sheetStyles.restPopupBackdrop} role="presentation" onClick={closeRestPopup}>
          <section
            className={sheetStyles.restPopupCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rest-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Camp</p>
                <h3 id="rest-popup-title">Choose your rest</h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={closeRestPopup}
                aria-label="Close rest options"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.restOptionGrid}>
              <button
                type="button"
                className={clsx(
                  sheetStyles.restOptionButton,
                  selectedRestType === "short" && sheetStyles.restOptionButtonActive
                )}
                onClick={() => selectRestType("short")}
                disabled={shortRestsRemaining <= 0}
              >
                <strong>Short rest</strong>
                <small>Heal {shortRestHealAmount} HP (half your max HP).</small>
                <div
                  className={sheetStyles.shortRestDots}
                  aria-label={`${shortRestsRemaining} short rests remaining today`}
                >
                  {Array.from({ length: 2 }, (_, index) => (
                    <span
                      key={index}
                      className={clsx(
                        sheetStyles.shortRestDot,
                        index < shortRestsRemaining && sheetStyles.shortRestDotActive
                      )}
                    />
                  ))}
                </div>
              </button>

              <button
                type="button"
                className={clsx(
                  sheetStyles.restOptionButton,
                  selectedRestType === "long" && sheetStyles.restOptionButtonActive
                )}
                onClick={() => selectRestType("long")}
              >
                <strong>Long rest</strong>
                <small>Restore full HP and refresh all spell slots.</small>
                <span className={sheetStyles.longRestNote}>Also resets short rests.</span>
              </button>
            </div>

            {selectedRestType ? (
              <div className={sheetStyles.restChecklistSection}>
                <p className={sheetStyles.restChecklistHeading}>
                  {selectedRestType === "short" ? "Short Rest Effects" : "Long Rest Effects"}
                </p>
                <div className={sheetStyles.restChecklist}>
                  {selectedRestOptions.slice(0, 2).map((option) => (
                    <label key={option.id} className={sheetStyles.restChecklistItem}>
                      <input
                        type="checkbox"
                        checked={selectedRestOptionIds.includes(option.id)}
                        onChange={() => toggleRestOption(option.id)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                  {selectedRestOptions.length > 2 ? (
                    <div className={sheetStyles.restChecklistDivider} aria-hidden="true" />
                  ) : null}
                  {selectedRestOptions.slice(2).map((option) => (
                    <label key={option.id} className={sheetStyles.restChecklistItem}>
                      <input
                        type="checkbox"
                        checked={selectedRestOptionIds.includes(option.id)}
                        onChange={() => toggleRestOption(option.id)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                <div className={sheetStyles.restPopupActions}>
                  <button
                    type="button"
                    className={sheetStyles.cancelButton}
                    onClick={closeRestPopup}
                  >
                    Cancel
                  </button>
                  <button type="button" className={sheetStyles.castButton} onClick={confirmRest}>
                    Rest
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {isTraitModalOpen ? (
        <div
          className={sheetStyles.spellManagementBackdrop}
          role="presentation"
          onClick={() => setIsTraitModalOpen(false)}
        >
          <section
            className={clsx(sheetStyles.spellManagementModal, styles.traitEditorModal)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trait-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div className={styles.modalHeading}>
                <h3 id="trait-modal-title">Edit Traits &amp; Conditions</h3>
                <p className={shared.helperText}>
                  Add passive traits and temporary states so the dashboard reflects what is
                  currently affecting the character.
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsTraitModalOpen(false)}
                aria-label="Close traits and conditions editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.traitTabRow} role="tablist" aria-label="Trait categories">
              {traitEditorTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTraitEditorTab === tab.id}
                  className={clsx(
                    styles.traitTabButton,
                    activeTraitEditorTab === tab.id && styles.traitTabButtonActive
                  )}
                  onClick={() => setActiveTraitEditorTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={shared.formGrid}>
              <label className={shared.field}>
                <span>{traitEditorTabs.find((tab) => tab.id === activeTraitEditorTab)?.label}</span>
                <SelectInput
                  value={statusDraftValues[activeTraitEditorTab]}
                  onChange={(event) =>
                    setStatusDraftValues((current) => ({
                      ...current,
                      [activeTraitEditorTab]: event.target.value
                    }))
                  }
                >
                  {(activeTraitEditorTab === "conditions"
                    ? conditionOptions
                    : activeTraitEditorTab === "senses"
                      ? senseOptions
                      : activeTraitEditorTab === "immunities"
                        ? immunityOptions
                        : damageTypeOptions
                  ).map((option) => (
                    <option key={option} value={option}>
                      {formatTraitEditorOptionLabel(activeTraitEditorTab, option)}
                    </option>
                  ))}
                </SelectInput>
              </label>

              <label className={shared.field}>
                <span>Duration</span>
                <SelectInput
                  value={statusDraftDurationPreset}
                  onChange={(event) =>
                    setStatusDraftDurationPreset(event.target.value as STATUS_DURATION_PRESET)
                  }
                >
                  {durationPresetOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectInput>
              </label>
            </div>

            <div className={shared.formActions}>
              <button type="button" className={shared.saveButton} onClick={addStatusEntry}>
                Save
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                onClick={() => setIsTraitModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedFeatureAction && isDivineInterventionSelected ? (
        <div
          className={sheetStyles.spellManagementBackdrop}
          role="presentation"
          onClick={closeDivineInterventionModal}
        >
          <section
            className={clsx(
              sheetStyles.spellManagementModal,
              styles.featureActionModal,
              styles.divineInterventionModal
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feature-action-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div className={styles.modalHeading}>
                <p className={sheetStyles.eyebrow}>Cleric</p>
                <h3 id="feature-action-modal-title">{selectedFeatureAction.name}</h3>
                <p className={shared.helperText}>
                  {selectedFeatureAction.detail} {selectedFeatureAction.usesLabel ?? ""}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={closeDivineInterventionModal}
                aria-label="Close Divine Intervention"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.divineInterventionTabRow}>
              <span className={styles.divineInterventionTabLabel}>Level</span>
              <div
                className={styles.divineInterventionTabList}
                role="tablist"
                aria-label="Divine Intervention spell levels"
              >
                {divineInterventionSpellLevels.map((level) => {
                  const isDisabled = !divineInterventionEnabledLevels.includes(level);

                  return (
                    <button
                      key={`divine-intervention-level-${level}`}
                      type="button"
                      role="tab"
                      aria-selected={activeDivineInterventionLevel === level}
                      className={clsx(
                        styles.divineInterventionTabButton,
                        activeDivineInterventionLevel === level &&
                          styles.divineInterventionTabButtonActive
                      )}
                      onClick={() => setActiveDivineInterventionLevel(level)}
                      disabled={isDisabled}
                    >
                      {level === 0 ? "C" : level}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={clsx(sheetStyles.spellManagementList, styles.divineInterventionList)}>
              {activeDivineInterventionSpells.length === 0 ? (
                <p className={shared.emptyText}>
                  No {formatSpellGroupTitle(activeDivineInterventionLevel).toLowerCase()} are
                  available in the Cleric spell list.
                </p>
              ) : (
                <ul className={styles.divineInterventionSelectionList}>
                  {activeDivineInterventionSpells.map((spell) => (
                    <li key={spell.id}>
                      <SpellListRow
                        spell={spell}
                        onClick={() => setSelectedDivineInterventionSpell(spell)}
                        valueSummary={divineInterventionOutcomeSummariesById.get(spell.id) ?? ""}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      ) : selectedFeatureAction && selectedFeatureActionOptions.length > 0 ? (
        <div
          className={sheetStyles.spellManagementBackdrop}
          role="presentation"
          onClick={() => setSelectedFeatureActionKey(null)}
        >
          <section
            className={clsx(sheetStyles.spellManagementModal, styles.featureActionModal)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feature-action-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div className={styles.modalHeading}>
                <p className={sheetStyles.eyebrow}>Cleric</p>
                <h3 id="feature-action-modal-title">{selectedFeatureAction.name}</h3>
                <p className={shared.helperText}>
                  Choose which divine effect to channel. {selectedFeatureAction.usesLabel ?? ""}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setSelectedFeatureActionKey(null)}
                aria-label="Close feature action options"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.featureActionOptionGrid}>
              {selectedFeatureActionOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={clsx(styles.weaponActionButton, styles.featureActionOptionButton)}
                  onClick={() =>
                    activateFeatureActionOptionSelection(
                      selectedFeatureAction.key,
                      option.key,
                      selectedFeatureAction.actionCost
                    )
                  }
                >
                  <strong>{option.name}</strong>
                  <span className={styles.weaponActionDamageRow}>
                    {formatFeatureActionOptionValueLabel(option)}
                  </span>
                  <small className={styles.weaponActionBreakdownRow}>
                    {option.breakdown ?? option.summary}
                  </small>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {selectedDivineInterventionSpell && selectedFeatureAction && isDivineInterventionSelected ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedDivineInterventionSpell}
          mode="divine-intervention"
          spellSlotTotals={Array.from({ length: 9 }, () => 0)}
          spellSlotsRemaining={Array.from({ length: 9 }, () => 0)}
          selectedSpellSlotLevel={1}
          onSelectedSpellSlotLevelChange={() => {}}
          onClose={() => setSelectedDivineInterventionSpell(null)}
          onAction={useDivineInterventionSpell}
          actionLabel="Divine Intervention"
          actionWarning={selectedDivineInterventionActionWarning}
          actionDisabled={selectedDivineInterventionActionWarning !== null}
          blockedReason={selectedDivineInterventionBlockedReason}
          actionAvailabilityText={selectedFeatureAction.usesLabel ?? null}
          backdropClassName={styles.divineInterventionDrawerBackdrop}
        />
      ) : null}

      {selectedReactionSpell ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedReactionSpell}
          mode="standard"
          spellSlotTotals={spellSlotTotals}
          spellSlotsRemaining={spellSlotsRemaining}
          selectedSpellSlotLevel={selectedReactionSpellSlotLevel}
          onSelectedSpellSlotLevelChange={setSelectedReactionSpellSlotLevel}
          onClose={closeSelectedReaction}
          onAction={castSelectedReactionSpell}
          actionWarning={selectedReactionActionWarning}
          actionDisabled={selectedReactionActionWarning !== null}
          blockedReason={selectedReactionBlockedReason}
        />
      ) : null}

      {selectedReactionEntry && selectedStatusEntry ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={closeSelectedReaction}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reaction-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Reaction</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="reaction-drawer-title">{selectedReactionEntry.name}</h3>
                </div>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={closeSelectedReaction}
                aria-label="Close reaction details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.spellDrawerBody}>
              <SpellDescriptionContent
                description={selectedReactionEntry.description}
                className={clsx(
                  sheetStyles.spellDrawerDescriptionList,
                  sheetStyles.spellDrawerDescriptionSection
                )}
                entryClassName={sheetStyles.spellDrawerDescriptionLine}
              />
            </div>

            <div className={sheetStyles.spellDrawerActions}>
              <div className={styles.castActionMeta}>
                {selectedReactionActionWarning ? (
                  <p className={styles.castActionWarning}>{selectedReactionActionWarning}</p>
                ) : null}
              </div>
              <button
                type="button"
                className={sheetStyles.castButton}
                onClick={castSelectedReactionEntry}
                disabled={selectedReactionActionWarning !== null}
              >
                Cast
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedStatusEntry && !selectedReactionSpell && !selectedReactionEntry ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedStatusEntryId(null)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>
                  {getStatusDrawerBadgeLabel(selectedStatusEntry.group)}
                </p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="status-drawer-title">{getStatusEntryTitle(selectedStatusEntry)}</h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>
                  {getStatusEntryDescription(selectedStatusEntry)}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedStatusEntryId(null)}
                aria-label="Close trait details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.statusDrawerBody}>
              <div className={styles.statusDrawerFacts}>
                <div className={styles.statusDrawerFact}>
                  <span>Duration</span>
                  <strong>{getStatusDurationLabel(selectedStatusEntry.duration)}</strong>
                </div>
                <div className={styles.statusDrawerFact}>
                  <span>Source</span>
                  <strong>{getStatusEntrySourceLabel(selectedStatusEntry)}</strong>
                </div>
              </div>

              {isEditingStatusDuration ? (
                <div className={styles.statusDurationEditor}>
                  <label className={shared.field}>
                    <span>Duration</span>
                    <SelectInput
                      value={statusDrawerDurationPreset}
                      onChange={(event) =>
                        setStatusDrawerDurationPreset(event.target.value as STATUS_DURATION_PRESET)
                      }
                    >
                      {durationPresetOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectInput>
                  </label>

                  <div className={styles.statusDurationEditorActions}>
                    <button
                      type="button"
                      className={shared.saveButton}
                      onClick={applyStatusEntryDuration}
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      className={shared.cancelButton}
                      onClick={() => {
                        setStatusDrawerDurationPreset(
                          getStatusDurationPreset(selectedStatusEntry.duration)
                        );
                        setIsEditingStatusDuration(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              {isEditingStatusDuration ||
              isStatusEntryDurationEditable(selectedStatusEntry) ||
              isStatusEntryRemovable(selectedStatusEntry) ? (
                <div className={styles.conditionDrawerFooter}>
                  {isStatusEntryDurationEditable(selectedStatusEntry) ? (
                    <button
                      type="button"
                      className={shared.editButton}
                      onClick={() => setIsEditingStatusDuration(true)}
                    >
                      Edit Duration
                    </button>
                  ) : (
                    <span />
                  )}

                  {isStatusEntryRemovable(selectedStatusEntry) ? (
                    <button
                      type="button"
                      className={styles.conditionRemoveButton}
                      onClick={() => removeStatusEntry(selectedStatusEntry)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {selectedRoundTrackerResource && selectedRoundTrackerMeta ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedRoundTrackerResource(null)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="round-tracker-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Round Tracker</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="round-tracker-drawer-title">{selectedRoundTrackerMeta.title}</h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>
                  {selectedRoundTrackerMeta.description}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedRoundTrackerResource(null)}
                aria-label="Close round tracker details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.roundTrackerDrawerActions}>
              <button
                type="button"
                className={shared.saveButton}
                onClick={() => consumeRoundTrackerFromDrawer(selectedRoundTrackerResource)}
              >
                {selectedRoundTrackerMeta.useLabel}
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                onClick={() => handleResetRoundTrackerResource(selectedRoundTrackerResource)}
              >
                {selectedRoundTrackerMeta.resetLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {diceRollerPopup}
    </article>
  );
}

export default GameplayForm;
