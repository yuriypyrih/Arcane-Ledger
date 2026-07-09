import { WEAPON_COMBAT_TYPE } from "../../../../codex/entries";
import {
  EFFECT_NAME,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type AbilityKey,
  type Character,
  type CharacterStatusEntry
} from "../../../../types";
import type {
  FeatureDamageBonus,
  FeatureIndicator,
  FeatureSpeedBonus,
  SavingThrowIndicatorMap
} from "../../classFeatures/types";
import { swapSystemTemporaryHitPointsAssignmentForCharacter } from "../../feats/runtime/bountifulHealth";
import { normalizeCharacterStatusEntries } from "../../statusEntries";
import type {
  SpellImplementationApplyContext,
  SpellImplementationCastOption,
  SpellImplementationStatusOptionsContext
} from "./types";

export const guardianOfNatureSpellId = "spell-guardian-of-nature";
export const guardianOfNatureStatusValue = "Guardian of Nature";
export const guardianOfNatureFormOptionId = "guardianOfNatureForm";
export const guardianOfNaturePrimalBeastStatusSourceId =
  "spell-guardian-of-nature-primal-beast";
export const guardianOfNatureGreatTreeStatusSourceId = "spell-guardian-of-nature-great-tree";
export const guardianOfNaturePrimalBeastDarkvisionSourceId =
  "spell-guardian-of-nature-primal-beast-darkvision";
export const guardianOfNatureGreatTreeTemporaryHitPointsSource =
  "Guardian of Nature: Great Tree";

type GuardianOfNatureForm = "primal-beast" | "great-tree";

const guardianOfNaturePrimalBeastLabel = "Primal Beast";
const guardianOfNatureGreatTreeLabel = "Great Tree";
const guardianOfNatureTemporaryHitPoints = 10;
const guardianOfNaturePrimalBeastDarkvisionRangeFeet = 120;
const guardianOfNaturePrimalBeastDamageFormula = "1d6";
const guardianOfNaturePrimalBeastDamageLabel = "1d6 Force";
const guardianOfNatureAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: guardianOfNatureStatusValue
};

const guardianOfNatureFormChoices = [
  { value: "primal-beast", label: guardianOfNaturePrimalBeastLabel },
  { value: "great-tree", label: guardianOfNatureGreatTreeLabel }
];

export function getGuardianOfNatureCastOptions(): SpellImplementationCastOption[] {
  return [
    {
      id: guardianOfNatureFormOptionId,
      label: "Form",
      defaultValue: "primal-beast",
      choices: guardianOfNatureFormChoices
    }
  ];
}

function getGuardianOfNatureFormFromOptions(
  context: Pick<SpellImplementationStatusOptionsContext, "options">
): GuardianOfNatureForm {
  return context.options[guardianOfNatureFormOptionId] === "great-tree"
    ? "great-tree"
    : "primal-beast";
}

function getGuardianOfNatureStatusSourceId(form: GuardianOfNatureForm): string {
  return form === "great-tree"
    ? guardianOfNatureGreatTreeStatusSourceId
    : guardianOfNaturePrimalBeastStatusSourceId;
}

function getGuardianOfNatureFormFromSourceId(sourceId: string | null | undefined) {
  switch (sourceId) {
    case guardianOfNaturePrimalBeastStatusSourceId:
      return "primal-beast";
    case guardianOfNatureGreatTreeStatusSourceId:
      return "great-tree";
    default:
      return null;
  }
}

function getGuardianOfNatureFormLabel(form: GuardianOfNatureForm): string {
  return form === "great-tree"
    ? guardianOfNatureGreatTreeLabel
    : guardianOfNaturePrimalBeastLabel;
}

export function getGuardianOfNatureStatusOptionLabel(
  entry: Pick<CharacterStatusEntry, "sourceId" | "sourceSpellId"> | null | undefined
): string | null {
  if (!entry || entry.sourceSpellId !== guardianOfNatureSpellId) {
    return null;
  }

  const form = getGuardianOfNatureFormFromSourceId(entry.sourceId);
  return form ? getGuardianOfNatureFormLabel(form) : null;
}

export function isActiveGuardianOfNatureStatusEntry(
  entry: CharacterStatusEntry | null | undefined
): entry is CharacterStatusEntry {
  if (!entry) {
    return false;
  }

  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === guardianOfNatureSpellId &&
    entry.value === EFFECT_NAME.CONCENTRATION &&
    getGuardianOfNatureFormFromSourceId(entry.sourceId) !== null &&
    entry.disabled !== true
  );
}

export function getActiveGuardianOfNatureFormForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): GuardianOfNatureForm | null {
  const activeEntry = normalizeCharacterStatusEntries(character.statusEntries).find(
    isActiveGuardianOfNatureStatusEntry
  );

  return getGuardianOfNatureFormFromSourceId(activeEntry?.sourceId);
}

export function hasActiveGuardianOfNatureStatus(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return getActiveGuardianOfNatureFormForCharacter(character) !== null;
}

export function hasActiveGuardianOfNaturePrimalBeastStatus(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return getActiveGuardianOfNatureFormForCharacter(character) === "primal-beast";
}

export function hasActiveGuardianOfNatureGreatTreeStatus(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return getActiveGuardianOfNatureFormForCharacter(character) === "great-tree";
}

function applyGuardianOfNatureSpellImplementation(
  context: SpellImplementationApplyContext
): Character {
  if (getGuardianOfNatureFormFromOptions(context) !== "great-tree") {
    return context.character;
  }

  return {
    ...context.character,
    ...swapSystemTemporaryHitPointsAssignmentForCharacter(
      context.character,
      guardianOfNatureTemporaryHitPoints,
      guardianOfNatureGreatTreeTemporaryHitPointsSource
    )
  };
}

function getGuardianOfNatureStatusOptions(context: SpellImplementationStatusOptionsContext) {
  return {
    sourceId: getGuardianOfNatureStatusSourceId(getGuardianOfNatureFormFromOptions(context))
  };
}

export function getGuardianOfNatureSpeedBonusesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): FeatureSpeedBonus[] {
  if (!hasActiveGuardianOfNaturePrimalBeastStatus(character)) {
    return [];
  }

  return [
    {
      label: guardianOfNatureStatusValue,
      value: 10,
      movementType: "walk"
    }
  ];
}

export function getGuardianOfNatureSpellDerivedStatusEntriesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): CharacterStatusEntry[] {
  if (!hasActiveGuardianOfNaturePrimalBeastStatus(character)) {
    return [];
  }

  return [
    {
      id: guardianOfNaturePrimalBeastDarkvisionSourceId,
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      source: guardianOfNatureStatusValue,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.CONCENTRATION
      },
      sourceId: guardianOfNaturePrimalBeastDarkvisionSourceId,
      rangeFeet: guardianOfNaturePrimalBeastDarkvisionRangeFeet,
      description:
        "While Primal Beast is active, you have Darkvision with a range of 120 feet."
    }
  ];
}

export function getGuardianOfNatureSavingThrowIndicatorsForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): SavingThrowIndicatorMap {
  if (!hasActiveGuardianOfNatureGreatTreeStatus(character)) {
    return {};
  }

  return {
    CON: [guardianOfNatureAdvantageIndicator]
  };
}

export function getGuardianOfNatureWeaponAttackIndicatorsForCharacter(
  character: Partial<Pick<Character, "statusEntries">>,
  context?: {
    ability?: AbilityKey | null;
    attackKind: "weapon" | "unarmed";
  }
): FeatureIndicator[] {
  if (!context || context.attackKind !== "weapon") {
    return [];
  }

  const activeForm = getActiveGuardianOfNatureFormForCharacter(character);

  if (activeForm === "primal-beast" && context.ability === "STR") {
    return [guardianOfNatureAdvantageIndicator];
  }

  if (
    activeForm === "great-tree" &&
    (context.ability === "DEX" || context.ability === "WIS")
  ) {
    return [guardianOfNatureAdvantageIndicator];
  }

  return [];
}

export function getGuardianOfNatureWeaponDamageBonusesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>,
  context: {
    attackKind: "weapon" | "unarmed";
    combatType?: WEAPON_COMBAT_TYPE | null;
  }
): FeatureDamageBonus[] {
  if (
    !hasActiveGuardianOfNaturePrimalBeastStatus(character) ||
    context.attackKind !== "weapon" ||
    context.combatType !== WEAPON_COMBAT_TYPE.MELEE
  ) {
    return [];
  }

  return [
    {
      label: guardianOfNatureStatusValue,
      formula: guardianOfNaturePrimalBeastDamageFormula,
      displayLabel: guardianOfNaturePrimalBeastDamageLabel,
      breakdownLabel: guardianOfNatureStatusValue,
      formulaSourceLabel: guardianOfNatureStatusValue
    }
  ];
}

export const guardianOfNatureSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: guardianOfNatureSpellId,
    label: guardianOfNatureStatusValue
  },
  spellId: guardianOfNatureSpellId,
  getCastOptions: getGuardianOfNatureCastOptions,
  applyOnCast: applyGuardianOfNatureSpellImplementation,
  getStatusOptions: getGuardianOfNatureStatusOptions
};
