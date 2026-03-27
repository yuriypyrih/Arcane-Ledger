import type { Character, CharacterClassFeatureState } from "../../../types";
import type { WEAPON_PROFICIENCY } from "../../../types";
import type { EconomyType } from "../actionEconomy";
import {
  activateBardicInspiration,
  applySuperiorInspirationOnInitiative,
  applyLongRestToBardFeatures,
  applyShortRestToBardFeatures,
  bardicInspirationActionKey,
  getBardAlwaysPreparedSpellIds,
  getBardicInspirationDie,
  getBardFeatureAction,
  getBardExpertiseSelections,
  getBardReactionEntries,
  getBardSkillBonuses,
  getBardSkillProficiencyEntries,
  normalizeBardFeatureState,
  setBardExpertiseSelections
} from "./bard";
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
  getBarbarianWeaponMasteryOptions,
  getBarbarianWeaponMasterySelectionCount,
  getBarbarianWeaponMasterySelections,
  getBarbarianWeaponProficiencyEntries,
  getBarbarianSavingThrowIndicators,
  getBarbarianSpeedBonuses,
  getBarbarianSpellcastingState,
  getBarbarianWeaponDamageBonuses,
  normalizeBarbarianRageState,
  setBarbarianWeaponMasterySelections
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
import {
  getDruidAlwaysPreparedSpellIds,
  getDruidArmorProficiencyEntries,
  getDruidCantripBonus,
  getDruidLanguageProficiencyEntries,
  getDruidPrimalOrderChoice,
  getDruidSkillBonuses,
  getDruidWeaponProficiencyEntries,
  normalizeDruidFeatureState,
  setDruidPrimalOrderChoice
} from "./druid";
import {
  applyLayOnHands,
  getPaladinFeatureActions,
  getPaladinHealingPoolRemaining,
  getPaladinHealingPoolTotal,
  getPaladinWeaponMasteryOptions,
  getPaladinWeaponMasterySelectionCount,
  getPaladinWeaponMasterySelections,
  getPaladinWeaponProficiencyEntries,
  normalizePaladinFeatureState,
  paladinLayOnHandsActionKey,
  restorePaladinLayOnHandsOnLongRest,
  setPaladinWeaponMasterySelections
} from "./paladin";
import {
  activateMonkFlurryOfBlows,
  activateMonkUncannyMetabolism,
  activateMonkSuperiorDefense,
  activateMonkStunningStrike,
  advanceMonkFeaturesForNewRound,
  applyPerfectFocusOnInitiative,
  applyLongRestToMonkFeatures,
  applyShortRestToMonkFeatures,
  canUseMonkMartialArts,
  consumeMonkWeaponAttack,
  expendMonkFocusPoint,
  getMonkAbilityScoreBonuses,
  getMonkArmorClassModes,
  getMonkDerivedStatusEntries,
  getMonkFeatureActions,
  getMonkFocusPointsRemaining,
  getMonkFocusPointsTotal,
  getMonkExtraAttackMultiCount,
  getMonkFlurryOfBlowsAttackMultiCount,
  hasMonkPerfectFocus,
  getMonkMartialArtsDie,
  getMonkUnarmedDamageTypeLabel,
  getMonkReactionEntries,
  getMonkSavingThrowProficiencyEntries,
  getMonkSpeedBonuses,
  monkFlurryOfBlowsActionKey,
  monkSuperiorDefenseActionKey,
  monkStunningStrikeActionKey,
  monkUncannyMetabolismActionKey,
  normalizeMonkFeatureState,
  restoreAllMonkFocusPoints,
  restoreMonkUncannyMetabolismOnLongRest,
  restoreOneMonkFocusPoint
} from "./monk";
import {
  activateFighterActionSurge,
  advanceFighterFeaturesForNewRound,
  applyLongRestToFighterFeatures,
  applyShortRestToFighterFeatures,
  consumeFighterNonMagicAction,
  consumeFighterWeaponAttack,
  consumeFighterSecondWindUse,
  consumeFighterIndomitableUse,
  fighterActionSurgeActionKey,
  fighterIndomitableActionKey,
  fighterSecondWindActionKey,
  fighterTacticalMindActionKey,
  getFighterFeatureActions,
  getFighterNonMagicActionMultiCount,
  getFighterWeaponAttackMultiCount,
  getFighterWeaponMasteryOptions,
  getFighterWeaponMasterySelectionCount,
  getFighterWeaponMasterySelections,
  getFighterWeaponProficiencyEntries,
  normalizeFighterFeatureState,
  setFighterWeaponMasterySelections
} from "./fighter";
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
  FeatureLanguageProficiencyEntry,
  FeatureDamageBonus,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillBonus,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus,
  FeatureSpellcastingState,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SpeedFeatureContext,
  SkillIndicatorMap,
  WeaponFeatureContext
} from "./types";
import type { CharacterStatusEntry } from "../../../types";
import type { ReactionEntry } from "../../../codex/entries";
import { PROF_LEVEL } from "../../../types";

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
  FeatureLanguageProficiencyEntry,
  FeatureDamageBonus,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillBonus,
  FeatureSkillProficiencyEntry,
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
    bard: normalizeBardFeatureState(record.bard, character),
    cleric: normalizeClericFeatureState(record.cleric, character),
    druid: normalizeDruidFeatureState(record.druid, character),
    paladin: normalizePaladinFeatureState(record.paladin, character),
    monk: normalizeMonkFeatureState(record.monk, character),
    fighter: normalizeFighterFeatureState(record.fighter, character)
  };
}

export function getFeatureActionsForCharacter(
  character: Character
): FeatureActionCard[] {
  const clericActions = getClericFeatureActions(character);
  const bardAction = getBardFeatureAction(character);
  const fighterActions = getFighterFeatureActions(character);
  const monkActions = getMonkFeatureActions(character);
  const paladinActions = getPaladinFeatureActions(character);
  const rageAction = getBarbarianFeatureAction(character);
  return [
    ...clericActions,
    bardAction,
    ...fighterActions,
    ...monkActions,
    ...paladinActions,
    rageAction
  ].filter((entry): entry is FeatureActionCard => entry !== null);
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
  skill: Parameters<typeof getClericSkillBonuses>[1],
  proficiencyLevel: PROF_LEVEL
): FeatureSkillBonus[] {
  return [
    ...getClericSkillBonuses(character, skill),
    ...getBardSkillBonuses(character, proficiencyLevel),
    ...getDruidSkillBonuses(character, skill)
  ];
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
  return [
    ...getBarbarianArmorClassModes(character, context),
    ...getMonkArmorClassModes(character, context)
  ];
}

export function getArmorClassBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: ArmorClassFeatureContext
): FeatureArmorClassBonus[] {
  return getBarbarianArmorClassBonuses(character, context);
}

export function getSpeedBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "equipment" | "customEquipment">,
  context: SpeedFeatureContext
): FeatureSpeedBonus[] {
  return [...getBarbarianSpeedBonuses(character, context), ...getMonkSpeedBonuses(character, context)];
}

export function getAbilityScoreBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureAbilityScoreBonus[] {
  return [
    ...getBarbarianAbilityScoreBonuses(character),
    ...getMonkAbilityScoreBonuses(character)
  ];
}

export function getCantripLimitBonusForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getClericCantripBonus(character) + getDruidCantripBonus(character);
}

export function getMonkMartialArtsDieForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getMonkMartialArtsDie(character);
}

export function getBardicInspirationDieForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getBardicInspirationDie(character);
}

export function getMonkUnarmedDamageTypeLabelForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getMonkUnarmedDamageTypeLabel(character);
}

export function canUseMonkMartialArtsForCharacter(
  character: Pick<Character, "className" | "level">,
  context: {
    hasWornBodyArmor: boolean;
    hasShieldEquipped: boolean;
    wieldsOnlyMonkWeaponsOrUnarmed: boolean;
  }
): boolean {
  return canUseMonkMartialArts(character, context);
}

export function getCantripDamageBonusForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities" | "feats">
): number {
  return getClericCantripDamageBonus(character);
}

export function getFeatureWeaponProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  return [
    ...getBarbarianWeaponProficiencyEntries(character),
    ...getClericWeaponProficiencyEntries(character),
    ...getDruidWeaponProficiencyEntries(character),
    ...getFighterWeaponProficiencyEntries(character),
    ...getPaladinWeaponProficiencyEntries(character)
  ];
}

export function getFeatureSkillProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSkillProficiencyEntry[] {
  return getBardSkillProficiencyEntries(character);
}

export function getFeatureSavingThrowProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSavingThrowProficiencyEntry[] {
  return getMonkSavingThrowProficiencyEntries(character);
}

export function getFeatureArmorProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureArmorProficiencyEntry[] {
  return [
    ...getClericArmorProficiencyEntries(character),
    ...getDruidArmorProficiencyEntries(character)
  ];
}

export function getFeatureLanguageProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureLanguageProficiencyEntry[] {
  return getDruidLanguageProficiencyEntries(character);
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

export function getBardExpertiseSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  tier: "level2" | "level9"
) {
  return getBardExpertiseSelections(character, tier);
}

export function getAlwaysPreparedSpellIdsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): string[] {
  return [...new Set([...getBardAlwaysPreparedSpellIds(character), ...getDruidAlwaysPreparedSpellIds(character)])];
}

export function setBardExpertiseSelectionsForCharacter(
  character: Character,
  tier: "level2" | "level9",
  selections: Parameters<typeof setBardExpertiseSelections>[2]
): Character {
  return setBardExpertiseSelections(character, tier, selections);
}

export function getDruidPrimalOrderChoiceForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getDruidPrimalOrderChoice(character);
}

export function setDruidPrimalOrderChoiceForCharacter(
  character: Character,
  primalOrderChoice: "magician" | "warden"
): Character {
  return setDruidPrimalOrderChoice(character, primalOrderChoice);
}

export function getWeaponMasterySelectionCountForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  if (character.className === "Barbarian") {
    return getBarbarianWeaponMasterySelectionCount(character);
  }

  if (character.className === "Fighter") {
    return getFighterWeaponMasterySelectionCount(character);
  }

  if (character.className === "Paladin") {
    return getPaladinWeaponMasterySelectionCount(character);
  }

  return 0;
}

export function getWeaponMasteryOptionsForCharacter(
  character: Pick<Character, "className" | "level">
): WEAPON_PROFICIENCY[] {
  if (character.className === "Barbarian") {
    return getBarbarianWeaponMasteryOptions();
  }

  if (character.className === "Fighter") {
    return getFighterWeaponMasteryOptions();
  }

  if (character.className === "Paladin") {
    return getPaladinWeaponMasteryOptions();
  }

  return [];
}

export function getWeaponMasterySelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): WEAPON_PROFICIENCY[] {
  if (character.className === "Barbarian") {
    return getBarbarianWeaponMasterySelections(character);
  }

  if (character.className === "Fighter") {
    return getFighterWeaponMasterySelections(character);
  }

  if (character.className === "Paladin") {
    return getPaladinWeaponMasterySelections(character);
  }

  return [];
}

export function setWeaponMasterySelectionsForCharacter(
  character: Character,
  selections: WEAPON_PROFICIENCY[]
): Character {
  if (character.className === "Barbarian") {
    return setBarbarianWeaponMasterySelections(character, selections);
  }

  if (character.className === "Fighter") {
    return setFighterWeaponMasterySelections(character, selections);
  }

  if (character.className === "Paladin") {
    return setPaladinWeaponMasterySelections(character, selections);
  }

  return character;
}

export function applySuperiorInspirationOnInitiativeForCharacter(character: Character): Character {
  return applySuperiorInspirationOnInitiative(character);
}

export function applyPerfectFocusOnInitiativeForCharacter(character: Character): Character {
  return applyPerfectFocusOnInitiative(character);
}

export function hasPerfectFocusForCharacter(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasMonkPerfectFocus(character);
}

export function getDerivedFeatureStatusEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): DerivedFeatureStatusEntry[] {
  return [
    ...getBarbarianDerivedConditions(character),
    ...getMonkDerivedStatusEntries(character)
  ];
}

export function getFeatureReactionEntriesForCharacter(
  character: Pick<Character, "className" | "level">
): ReactionEntry[] {
  return [...getBardReactionEntries(character), ...getMonkReactionEntries(character)];
}

export function activateFeatureActionForCharacter(character: Character, actionKey: string): Character {
  if (actionKey === bardicInspirationActionKey) {
    return activateBardicInspiration(character);
  }

  if (actionKey === paladinLayOnHandsActionKey) {
    return character;
  }

  if (actionKey === monkFlurryOfBlowsActionKey) {
    return activateMonkFlurryOfBlows(character);
  }

  if (actionKey === monkUncannyMetabolismActionKey) {
    return activateMonkUncannyMetabolism(character);
  }

  if (actionKey === monkStunningStrikeActionKey) {
    return activateMonkStunningStrike(character);
  }

  if (actionKey === monkSuperiorDefenseActionKey) {
    return activateMonkSuperiorDefense(character);
  }

  if (actionKey === fighterActionSurgeActionKey) {
    return activateFighterActionSurge(character);
  }

  if (actionKey === fighterSecondWindActionKey) {
    return consumeFighterSecondWindUse(character);
  }

  if (actionKey === fighterTacticalMindActionKey) {
    return consumeFighterSecondWindUse(character);
  }

  if (actionKey === fighterIndomitableActionKey) {
    return consumeFighterIndomitableUse(character);
  }

  if (actionKey === "barbarian-rage") {
    return activateBarbarianRage(character);
  }

  if (actionKey === divineInterventionActionKey) {
    return activateClericDivineIntervention(character);
  }

  return character;
}

export function getMonkFocusPointsTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getMonkFocusPointsTotal(character);
}

export function getPaladinHealingPoolTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getPaladinHealingPoolTotal(character);
}

export function getPaladinHealingPoolRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getPaladinHealingPoolRemaining(character);
}

export function applyLayOnHandsForCharacter(
  character: Character,
  options: Parameters<typeof applyLayOnHands>[1]
): Character {
  return applyLayOnHands(character, options);
}

export function getMonkFocusPointsRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getMonkFocusPointsRemaining(character);
}

export function expendMonkFocusPointForCharacter(character: Character): Character {
  return expendMonkFocusPoint(character);
}

export function restoreMonkFocusPointForCharacter(character: Character): Character {
  return restoreOneMonkFocusPoint(character);
}

export function restoreAllMonkFocusPointsForCharacter(character: Character): Character {
  return restoreAllMonkFocusPoints(character);
}

export function restorePaladinLayOnHandsOnLongRestForCharacter(character: Character): Character {
  return restorePaladinLayOnHandsOnLongRest(character);
}

export function restoreMonkUncannyMetabolismOnLongRestForCharacter(character: Character): Character {
  return restoreMonkUncannyMetabolismOnLongRest(character);
}

export function markFeatureWeaponBonusUseForCharacter(character: Character, label: string): Character {
  if (label === "Blessed Strikes") {
    return markClericBlessedStrikeUsed(character);
  }

  return character;
}

export function getWeaponActionEconomyMultiForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  if (character.className === "Fighter") {
    return getFighterWeaponAttackMultiCount(character);
  }

  if (character.className === "Monk") {
    return getMonkExtraAttackMultiCount(character);
  }

  return 0;
}

export function getMonkFlurryOfBlowsAttackMultiCountForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getMonkFlurryOfBlowsAttackMultiCount(character);
}

export function getNonMagicActionEconomyMultiForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  if (character.className === "Fighter") {
    return getFighterNonMagicActionMultiCount(character);
  }

  return 0;
}

export function consumeWeaponAttackActionForCharacter(
  character: Character,
  action: {
    key: string;
    economyType: EconomyType;
    attackKind: "weapon" | "unarmed";
  }
): Character {
  if (character.className === "Monk") {
    return consumeMonkWeaponAttack(character, action);
  }

  return consumeFighterWeaponAttack(character);
}

export function consumeNonMagicActionForCharacter(character: Character): Character {
  return consumeFighterNonMagicAction(character);
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
  return applyShortRestToClericFeatures(
    applyShortRestToBardFeatures(
      applyShortRestToFighterFeatures(
        applyShortRestToMonkFeatures(applyShortRestToBarbarianFeatures(character))
      )
    )
  );
}

export function applyLongRestToFeatureState(character: Character): Character {
  return applyLongRestToClericFeatures(
    applyLongRestToBardFeatures(
      applyLongRestToFighterFeatures(
        restorePaladinLayOnHandsOnLongRest(
          applyLongRestToMonkFeatures(applyLongRestToBarbarianFeatures(character))
        )
      )
    )
  );
}

export function advanceFeatureStateForNewRound(character: Character): Character {
  return advanceMonkFeaturesForNewRound(
    advanceFighterFeaturesForNewRound(advanceClericFeaturesForNewRound(character))
  );
}
