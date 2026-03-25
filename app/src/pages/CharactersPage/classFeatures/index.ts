import type { Character, CharacterClassFeatureState } from "../../../types";
import {
  activateBarbarianRage,
  applyLongRestToBarbarianFeatures,
  getBarbarianAbilityScoreBonuses,
  getBarbarianArmorClassBonuses,
  getBarbarianArmorClassModes,
  getBarbarianCoreStatIndicators,
  applyShortRestToBarbarianFeatures,
  deactivateBarbarianRage,
  getBarbarianDerivedConditions,
  getBarbarianFeatureAction,
  getBarbarianSkillIndicators,
  getBarbarianSavingThrowIndicators,
  getBarbarianSpeedBonuses,
  getBarbarianSpellcastingState,
  getBarbarianWeaponDamageBonuses,
  normalizeBarbarianRageState
} from "./barbarian";
import {
  activateClericDivineIntervention,
  activateClericFeatureActionOption,
  advanceClericFeaturesForNewRound,
  applyLongRestToClericFeatures,
  applyShortRestToClericFeatures,
  divineInterventionActionKey,
  getClericArmorProficiencyEntries,
  getClericBlessedStrikesChoice,
  getClericCantripBonus,
  getClericCantripDamageBonus,
  getClericFeatureActions,
  getClericFeatureActionOptions,
  getClericDivineOrderChoice,
  getClericSkillBonuses,
  getClericWeaponDamageBonuses,
  getClericWeaponProficiencyEntries,
  markClericBlessedStrikeUsed,
  normalizeClericFeatureState,
  setClericBlessedStrikesChoice,
  setClericDivineOrderChoice
} from "./cleric";
import type {
  ArmorClassFeatureContext,
  CoreStatIndicatorMap,
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureAbilityScoreBonus,
  FeatureArmorProficiencyEntry,
  FeatureIndicator,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureDamageBonus,
  FeatureSkillBonus,
  FeatureSpeedBonus,
  FeatureSpellcastingState,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SpeedFeatureContext,
  SkillIndicatorMap,
  WeaponFeatureContext
} from "./types";
import type { CharacterStatusEntry } from "../../../types";

export type {
  ArmorClassFeatureContext,
  CoreStatIndicatorMap,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureAbilityScoreBonus,
  FeatureArmorProficiencyEntry,
  FeatureIndicator,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureDamageBonus,
  FeatureSkillBonus,
  FeatureSpeedBonus,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SpeedFeatureContext,
  SkillIndicatorMap,
  WeaponFeatureContext
};

export function normalizeCharacterClassFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level">
): CharacterClassFeatureState {
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterClassFeatureState>) : {};

  return {
    rage: normalizeBarbarianRageState(record.rage, character),
    cleric: normalizeClericFeatureState(record.cleric, character)
  };
}

export function getFeatureActionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard[] {
  const clericActions = getClericFeatureActions(character);
  const rageAction = getBarbarianFeatureAction(character);
  return [...clericActions, rageAction].filter((entry): entry is FeatureActionCard => entry !== null);
}

export function getFeatureActionOptionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities" | "feats">,
  actionKey: string
): FeatureActionOptionCard[] {
  if (actionKey === "cleric-channel-divinity") {
    return getClericFeatureActionOptions(character);
  }

  return [];
}

export function getFeatureDamageBonusesForWeaponAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: WeaponFeatureContext
): FeatureDamageBonus[] {
  return [
    ...getBarbarianWeaponDamageBonuses(character, context),
    ...getClericWeaponDamageBonuses(character, context)
  ];
}

export function getSavingThrowIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): SavingThrowIndicatorMap {
  return getBarbarianSavingThrowIndicators(character);
}

export function getCoreStatIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): CoreStatIndicatorMap {
  return getBarbarianCoreStatIndicators(character);
}

export function getSkillIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillIndicatorMap {
  return getBarbarianSkillIndicators(character);
}

export function getSkillBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities">,
  skill: Parameters<typeof getClericSkillBonuses>[1]
): FeatureSkillBonus[] {
  return getClericSkillBonuses(character, skill);
}

export function getSpellcastingStateForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSpellcastingState {
  return getBarbarianSpellcastingState(character);
}

export function getArmorClassModesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: ArmorClassFeatureContext
): FeatureArmorClassMode[] {
  return getBarbarianArmorClassModes(character, context);
}

export function getArmorClassBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: ArmorClassFeatureContext
): FeatureArmorClassBonus[] {
  return getBarbarianArmorClassBonuses(character, context);
}

export function getSpeedBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: SpeedFeatureContext
): FeatureSpeedBonus[] {
  return getBarbarianSpeedBonuses(character, context);
}

export function getAbilityScoreBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureAbilityScoreBonus[] {
  return getBarbarianAbilityScoreBonuses(character);
}

export function getCantripLimitBonusForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getClericCantripBonus(character);
}

export function getCantripDamageBonusForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities" | "feats">
): number {
  return getClericCantripDamageBonus(character);
}

export function getFeatureWeaponProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  return getClericWeaponProficiencyEntries(character);
}

export function getFeatureArmorProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureArmorProficiencyEntry[] {
  return getClericArmorProficiencyEntries(character);
}

export function getClericDivineOrderChoiceForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getClericDivineOrderChoice(character);
}

export function setClericDivineOrderChoiceForCharacter(
  character: Character,
  divineOrderChoice: "protector" | "thaumaturge"
): Character {
  return setClericDivineOrderChoice(character, divineOrderChoice);
}

export function getClericBlessedStrikesChoiceForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getClericBlessedStrikesChoice(character);
}

export function setClericBlessedStrikesChoiceForCharacter(
  character: Character,
  blessedStrikesChoice: "blessed-strike" | "potent-spellcasting"
): Character {
  return setClericBlessedStrikesChoice(character, blessedStrikesChoice);
}

export function getDerivedFeatureStatusEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): DerivedFeatureStatusEntry[] {
  return getBarbarianDerivedConditions(character);
}

export function activateFeatureActionForCharacter(character: Character, actionKey: string): Character {
  if (actionKey === "barbarian-rage") {
    return activateBarbarianRage(character);
  }

  if (actionKey === divineInterventionActionKey) {
    return activateClericDivineIntervention(character);
  }

  return character;
}

export function markFeatureWeaponBonusUseForCharacter(character: Character, label: string): Character {
  if (label === "Blessed Strikes") {
    return markClericBlessedStrikeUsed(character);
  }

  return character;
}

export function activateFeatureActionOptionForCharacter(
  character: Character,
  actionKey: string,
  optionKey: string
): Character {
  if (actionKey === "cleric-channel-divinity") {
    return activateClericFeatureActionOption(character, optionKey);
  }

  return character;
}

export function removeFeatureStatusEntryForCharacter(
  character: Character,
  statusEntry: Pick<CharacterStatusEntry, "value" | "sourceId">
): Character {
  const normalizedValue = String(statusEntry.value).trim();

  if (
    statusEntry.sourceId === "feature-rage" ||
    normalizedValue === "Rage" ||
    normalizedValue === "BLUDGEONING" ||
    normalizedValue === "PIERCING" ||
    normalizedValue === "SLASHING"
  ) {
    return deactivateBarbarianRage(character);
  }

  return character;
}

export function applyShortRestToFeatureState(character: Character): Character {
  return applyShortRestToClericFeatures(applyShortRestToBarbarianFeatures(character));
}

export function applyLongRestToFeatureState(character: Character): Character {
  return applyLongRestToClericFeatures(applyLongRestToBarbarianFeatures(character));
}

export function advanceFeatureStateForNewRound(character: Character): Character {
  return advanceClericFeaturesForNewRound(character);
}
