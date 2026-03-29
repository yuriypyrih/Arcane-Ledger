import type { Character, CharacterClassFeatureState } from "../../../types";
import { ALL_SKILLS } from "../../../types";
import type { AbilityKey, SkillName, WEAPON_PROFICIENCY } from "../../../types";
import type { EconomyType } from "../actionEconomy";
import {
  hasExhaustionAbilityCheckDisadvantage,
  hasExhaustionAttackRollDisadvantage,
  hasExhaustionSavingThrowDisadvantage,
  removeCharacterStatusEntry
} from "../traits";
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
  getBarbarianAbilityCheckIndicators,
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
  getClericChannelDivinityUsesRemaining,
  getClericChannelDivinityUsesTotal,
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
  activateRangerNaturesVeil,
  advanceRangerFeaturesForNewRound,
  applyLongRestToRangerFeatures,
  applyShortRestToRangerFeatures,
  consumeRangerFavoredEnemyUse,
  consumeRangerNaturesVeilUse,
  consumeRangerTirelessUse,
  consumeRangerWeaponAttack,
  getRangerFeatureActions,
  getRangerAlwaysPreparedSpellIds,
  getRangerDeftExplorerExpertiseSelection,
  getRangerDeftExplorerLanguageSelections,
  getRangerDerivedStatusEntries,
  getRangerFavoredEnemyUsesRemaining,
  getRangerFavoredEnemyUsesTotal,
  getRangerLanguageProficiencyEntries,
  getRangerLevel9ExpertiseSelections,
  getRangerNaturesVeilUsesRemaining,
  getRangerNaturesVeilUsesTotal,
  getRangerSkillProficiencyEntries,
  getRangerSpeedBonuses,
  getRangerSpellDamageFormula,
  getRangerSpellEntry,
  getRangerTirelessUsesRemaining,
  getRangerTirelessUsesTotal,
  getRangerWeaponAttackMultiCount,
  getRangerWeaponMasteryOptions,
  getRangerWeaponMasterySelectionCount,
  getRangerWeaponMasterySelections,
  getRangerWeaponProficiencyEntries,
  normalizeRangerFeatureState,
  naturesVeilActionKey,
  restoreRangerNaturesVeilOnLongRest,
  restoreRangerTirelessOnLongRest,
  setRangerDeftExplorerExpertiseSelection,
  setRangerDeftExplorerLanguageSelections,
  setRangerLevel9ExpertiseSelections,
  setRangerWeaponMasterySelections,
  tirelessActionKey
} from "./ranger";
import {
  activateRogueSteadyAim,
  activateRogueSneakAttack,
  advanceRogueFeaturesForNewRound,
  applyLongRestToRogueFeatures,
  applyShortRestToRogueFeatures,
  consumeRogueStrokeOfLuckUse,
  getRogueDerivedStatusEntries,
  getRogueFeatureActions,
  getRogueExpertiseSelections,
  getRogueLanguageProficiencyEntries,
  getRogueReactionEntries,
  getRogueSavingThrowProficiencyEntries,
  getRogueSkillProficiencyEntries,
  getRogueSneakAttackDiceCount,
  getRogueSneakAttackFormula,
  getRogueSpeedBonuses,
  getRogueStrokeOfLuckUsesRemaining,
  getRogueStrokeOfLuckUsesTotal,
  getRogueWeaponMasteryOptions,
  getRogueWeaponMasterySelectionCount,
  getRogueWeaponMasterySelections,
  getRogueWeaponProficiencyEntries,
  normalizeRogueFeatureState,
  rogueSteadyAimActionKey,
  rogueSneakAttackActionKey,
  rogueStrokeOfLuckActionKey,
  restoreRogueStrokeOfLuckOnLongRest,
  restoreRogueStrokeOfLuckOnShortRest,
  setRogueExpertiseSelections,
  setRogueThievesCantLanguageSelection,
  setRogueWeaponMasterySelections,
  getRogueThievesCantLanguageSelection
} from "./rogue";
import {
  activateInnateSorcery,
  advanceSorcererFeaturesForNewRound,
  applyLongRestToSorcererFeatures,
  applyShortRestToSorcererFeatures,
  createSpellSlotFromSorceryPoints,
  convertSpellSlotToSorceryPoints,
  expendOneSorceryPoint,
  getInnateSorceryUsesRemaining,
  getInnateSorceryUsesTotal,
  getInnateSorceryActivationSorceryPointCost,
  getSorcererMetamagicActionCost,
  getSorcererFeatureActions,
  getSorcererMetamagicDefinitions,
  getSorcererMetamagicOptionsForAction,
  getSorcererMetamagicSelectionCount,
  getSorcererMetamagicSelectionLimitForAction,
  getSorcererMetamagicSelections,
  getSorceryPointsRemaining,
  getSorceryPointsTotal,
  hasActiveInnateSorcery,
  hasArcaneApotheosisFreeMetamagicAvailable,
  innateSorceryActionKey,
  metamagicActionKey,
  normalizeSorcererFeatureState,
  restoreAllSorceryPoints,
  restoreInnateSorceryOnLongRest,
  restoreOneSorceryPoint,
  setSorcererMetamagicSelections,
  spendMetamagicOption,
  spendMetamagicOptions
} from "./sorcerer";
import {
  activateWarlockMagicalCunning,
  consumeContactPatronUse,
  consumeMysticArcanumUse,
  contactPatronActionKey,
  getContactPatronUsesRemaining,
  getContactPatronUsesTotal,
  getWarlockAlwaysPreparedSpellIds,
  getWarlockFeatureActions,
  getWarlockEldritchInvocationLimit,
  getWarlockMagicalCunningUsesRemaining,
  getWarlockMagicalCunningUsesTotal,
  getWarlockInvocationBlockingSelectionNames,
  getWarlockInvocationOptions,
  getWarlockInvocationSelectionIds,
  getWarlockLearnedInvocationOptions,
  getWarlockMysticArcanumSelections,
  getWarlockMysticArcanumSpellId,
  getWarlockMysticArcanumSpellOptions,
  magicalCunningActionKey,
  mysticArcanumActionKey,
  normalizeWarlockFeatureState,
  restoreContactPatronOnLongRest,
  restoreMysticArcanumOnLongRest,
  restoreWarlockMagicalCunningOnLongRest,
  setWarlockMysticArcanumSpellId,
  setWarlockInvocationSelectionIds
} from "./warlock";
import {
  activateArcaneRecovery,
  arcaneRecoveryActionKey,
  applyLongRestToWizardFeatures,
  applyShortRestToWizardFeatures,
  consumeWizardSignatureSpellFreeCast,
  getArcaneRecoveryUsesRemaining,
  getArcaneRecoveryUsesTotal,
  getWizardAlwaysPreparedSpellIds,
  getWizardFeatureActions,
  getWizardExpendedSignatureSpellIds,
  getWizardScholarSelection,
  getWizardSignatureSpellIds,
  hasWizardSignatureSpellFreeCastAvailable,
  getWizardSpellMasterySelection,
  getWizardSpellMasterySpellIds,
  getWizardSkillProficiencyEntries,
  normalizeWizardFeatureState,
  setWizardScholarSelection,
  setWizardSignatureSpellIds,
  setWizardSpellMasterySelection,
  syncWizardSignatureSpellsToSpellbook,
  syncWizardSpellMasterySelectionsToSpellbook
} from "./wizard";
import {
  activatePaladinFeatureActionOption,
  advancePaladinFeaturesForNewRound,
  applyLayOnHands,
  applyLongRestToPaladinFeatures,
  applyShortRestToPaladinFeatures,
  consumeFaithfulSteedUse,
  consumePaladinWeaponAttack,
  consumePaladinsSmiteUse,
  getLayOnHandsCurableConditions,
  getPaladinDerivedStatusEntries,
  getPaladinAlwaysPreparedSpellIds,
  getPaladinChannelDivinityUsesRemaining,
  getPaladinChannelDivinityUsesTotal,
  getPaladinFeatureActions,
  getPaladinFeatureActionOptions,
  getPaladinHealingPoolRemaining,
  getPaladinHealingPoolTotal,
  getPaladinWeaponDamageBonuses,
  getPaladinWeaponAttackMultiCount,
  getPaladinsSmiteUsesRemaining,
  hasActivePaladinAuraOfProtection,
  getPaladinWeaponMasteryOptions,
  getPaladinWeaponMasterySelectionCount,
  getPaladinWeaponMasterySelections,
  getPaladinWeaponProficiencyEntries,
  normalizePaladinFeatureState,
  paladinChannelDivinityActionKey,
  paladinLayOnHandsActionKey,
  paladinsSmiteActionKey,
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
  AbilityCheckIndicatorMap,
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
import type { ReactionEntry, SpellEntry } from "../../../codex/entries";
import { PROF_LEVEL } from "../../../types";

const exhaustionDisadvantageIndicator: FeatureIndicator = {
  label: "Disadvantage",
  tone: "disadvantage",
  source: "Exhaustion"
};
const abilityKeys: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

function mergeIndicatorMaps<T extends string>(
  ...maps: Array<Partial<Record<T, FeatureIndicator[]>>>
): Partial<Record<T, FeatureIndicator[]>> {
  return maps.reduce<Partial<Record<T, FeatureIndicator[]>>>((result, currentMap) => {
    (Object.keys(currentMap) as T[]).forEach((key) => {
      const indicators = currentMap[key];

      if (!indicators || indicators.length === 0) {
        return;
      }

      result[key] = [...(result[key] ?? []), ...indicators];
    });

    return result;
  }, {});
}

export type {
  AbilityCheckIndicatorMap,
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
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "abilities">>
): CharacterClassFeatureState {
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterClassFeatureState>) : {};

  return {
    rage: normalizeBarbarianRageState(record.rage, character),
    bard: normalizeBardFeatureState(record.bard, character),
    cleric: normalizeClericFeatureState(record.cleric, character),
    druid: normalizeDruidFeatureState(record.druid, character),
    wizard: normalizeWizardFeatureState(record.wizard, character),
    ranger: normalizeRangerFeatureState(record.ranger, character),
    rogue: normalizeRogueFeatureState(record.rogue, character),
    sorcerer: normalizeSorcererFeatureState(record.sorcerer, character),
    warlock: normalizeWarlockFeatureState(record.warlock, character),
    paladin: normalizePaladinFeatureState(record.paladin, character),
    monk: normalizeMonkFeatureState(record.monk, character),
    fighter: normalizeFighterFeatureState(record.fighter, character)
  };
}

export function getFeatureActionsForCharacter(character: Character): FeatureActionCard[] {
  const clericActions = getClericFeatureActions(character);
  const bardAction = getBardFeatureAction(character);
  const fighterActions = getFighterFeatureActions(character);
  const monkActions = getMonkFeatureActions(character);
  const paladinActions = getPaladinFeatureActions(character);
  const rangerActions = getRangerFeatureActions(character);
  const rogueActions = getRogueFeatureActions(character);
  const sorcererActions = getSorcererFeatureActions(character);
  const warlockActions = getWarlockFeatureActions(character);
  const wizardActions = getWizardFeatureActions(character);
  const rageAction = getBarbarianFeatureAction(character);
  return [
    ...clericActions,
    bardAction,
    ...fighterActions,
    ...monkActions,
    ...sorcererActions,
    ...warlockActions,
    ...wizardActions,
    ...rangerActions,
    ...rogueActions,
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

  if (actionKey === paladinChannelDivinityActionKey) {
    return getPaladinFeatureActionOptions(character);
  }

  if (actionKey === metamagicActionKey) {
    return getSorcererMetamagicOptionsForAction(character);
  }

  return [];
}

export function getFeatureDamageBonusesForWeaponAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: WeaponFeatureContext
): FeatureDamageBonus[] {
  return [
    ...getBarbarianWeaponDamageBonuses(character, context),
    ...getClericWeaponDamageBonuses(character, context),
    ...getPaladinWeaponDamageBonuses(character, context)
  ];
}

export function getSavingThrowIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): SavingThrowIndicatorMap {
  const exhaustionIndicators = hasExhaustionSavingThrowDisadvantage(character.statusEntries)
    ? (Object.fromEntries(
        abilityKeys.map((ability) => [ability, [exhaustionDisadvantageIndicator]])
      ) as SavingThrowIndicatorMap)
    : {};

  return mergeIndicatorMaps(getBarbarianSavingThrowIndicators(character), exhaustionIndicators);
}

export function getAbilityCheckIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): AbilityCheckIndicatorMap {
  const exhaustionIndicators = hasExhaustionAbilityCheckDisadvantage(character.statusEntries)
    ? (Object.fromEntries(
        abilityKeys.map((ability) => [ability, [exhaustionDisadvantageIndicator]])
      ) as AbilityCheckIndicatorMap)
    : {};

  return mergeIndicatorMaps(getBarbarianAbilityCheckIndicators(character), exhaustionIndicators);
}

export function getCoreStatIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): CoreStatIndicatorMap {
  return getBarbarianCoreStatIndicators(character);
}

export function getSkillIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): SkillIndicatorMap {
  const exhaustionIndicators = hasExhaustionAbilityCheckDisadvantage(character.statusEntries)
    ? (Object.fromEntries(
        ALL_SKILLS.map((skill) => [skill, [exhaustionDisadvantageIndicator]])
      ) as SkillIndicatorMap)
    : {};

  return mergeIndicatorMaps(getBarbarianSkillIndicators(character), exhaustionIndicators);
}

export function getWeaponAttackIndicatorsForCharacter(
  character: Pick<Character, "statusEntries">
): FeatureIndicator[] {
  return hasExhaustionAttackRollDisadvantage(character.statusEntries)
    ? [exhaustionDisadvantageIndicator]
    : [];
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
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "equipment" | "customEquipment"
  >,
  context: SpeedFeatureContext
): FeatureSpeedBonus[] {
  return [
    ...getBarbarianSpeedBonuses(character, context),
    ...getMonkSpeedBonuses(character, context),
    ...getRangerSpeedBonuses(character, context),
    ...getRogueSpeedBonuses(character)
  ];
}

export function getAbilityScoreBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureAbilityScoreBonus[] {
  return [...getBarbarianAbilityScoreBonuses(character), ...getMonkAbilityScoreBonuses(character)];
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

export function getRogueSneakAttackDiceCountForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getRogueSneakAttackDiceCount(character);
}

export function getRogueSneakAttackFormulaForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getRogueSneakAttackFormula(character);
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
    ...getRangerWeaponProficiencyEntries(character),
    ...getRogueWeaponProficiencyEntries(character),
    ...getPaladinWeaponProficiencyEntries(character)
  ];
}

export function getFeatureSkillProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSkillProficiencyEntry[] {
  return [
    ...getBardSkillProficiencyEntries(character),
    ...getRangerSkillProficiencyEntries(character),
    ...getRogueSkillProficiencyEntries(character),
    ...getWizardSkillProficiencyEntries(character)
  ];
}

export function getFeatureSavingThrowProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSavingThrowProficiencyEntry[] {
  return [
    ...getMonkSavingThrowProficiencyEntries(character),
    ...getRogueSavingThrowProficiencyEntries(character)
  ];
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
  return [
    ...getDruidLanguageProficiencyEntries(character),
    ...getRangerLanguageProficiencyEntries(character),
    ...getRogueLanguageProficiencyEntries(character)
  ];
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

export function getRangerDeftExplorerExpertiseSelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getRangerDeftExplorerExpertiseSelection(character);
}

export function setRangerDeftExplorerExpertiseSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setRangerDeftExplorerExpertiseSelection>[1]
): Character {
  return setRangerDeftExplorerExpertiseSelection(character, selection);
}

export function getRangerDeftExplorerLanguageSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getRangerDeftExplorerLanguageSelections(character);
}

export function setRangerDeftExplorerLanguageSelectionsForCharacter(
  character: Character,
  selections: Parameters<typeof setRangerDeftExplorerLanguageSelections>[1]
): Character {
  return setRangerDeftExplorerLanguageSelections(character, selections);
}

export function getRangerLevel9ExpertiseSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getRangerLevel9ExpertiseSelections(character);
}

export function getRogueExpertiseSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  tier: "level1" | "level6"
) {
  return getRogueExpertiseSelections(character, tier);
}

export function setRogueExpertiseSelectionsForCharacter(
  character: Character,
  tier: "level1" | "level6",
  selections: Parameters<typeof setRogueExpertiseSelections>[2]
): Character {
  return setRogueExpertiseSelections(character, tier, selections);
}

export function getRogueThievesCantLanguageSelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getRogueThievesCantLanguageSelection(character);
}

export function setRogueThievesCantLanguageSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setRogueThievesCantLanguageSelection>[1]
): Character {
  return setRogueThievesCantLanguageSelection(character, selection);
}

export function setRangerLevel9ExpertiseSelectionsForCharacter(
  character: Character,
  selections: Parameters<typeof setRangerLevel9ExpertiseSelections>[1]
): Character {
  return setRangerLevel9ExpertiseSelections(character, selections);
}

export function getWizardScholarSelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillName | null {
  return getWizardScholarSelection(character);
}

export function setWizardScholarSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setWizardScholarSelection>[1]
): Character {
  return setWizardScholarSelection(character, selection);
}

export function getWizardSpellMasterySelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds">,
  spellLevel: Parameters<typeof getWizardSpellMasterySelection>[1]
): string | null {
  return getWizardSpellMasterySelection(character, spellLevel);
}

export function getWizardSpellMasterySpellIdsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds">
): string[] {
  return getWizardSpellMasterySpellIds(character);
}

export function setWizardSpellMasterySelectionForCharacter(
  character: Character,
  spellLevel: Parameters<typeof setWizardSpellMasterySelection>[1],
  spellId: Parameters<typeof setWizardSpellMasterySelection>[2]
): Character {
  return setWizardSpellMasterySelection(character, spellLevel, spellId);
}

export function syncWizardSpellMasterySelectionsToSpellbookForCharacter(
  character: Character
): Character {
  return syncWizardSpellMasterySelectionsToSpellbook(character);
}

export function getWizardSignatureSpellIdsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds">
): string[] {
  return getWizardSignatureSpellIds(character);
}

export function getWizardExpendedSignatureSpellIdsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds">
): string[] {
  return getWizardExpendedSignatureSpellIds(character);
}

export function hasWizardSignatureSpellFreeCastAvailableForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds">,
  spellId: string
): boolean {
  return hasWizardSignatureSpellFreeCastAvailable(character, spellId);
}

export function setWizardSignatureSpellIdsForCharacter(
  character: Character,
  spellIds: Parameters<typeof setWizardSignatureSpellIds>[1]
): Character {
  return setWizardSignatureSpellIds(character, spellIds);
}

export function syncWizardSignatureSpellsToSpellbookForCharacter(character: Character): Character {
  return syncWizardSignatureSpellsToSpellbook(character);
}

export function consumeWizardSignatureSpellFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  return consumeWizardSignatureSpellFreeCast(character, spellId);
}

export function getSorcererMetamagicDefinitionsForCharacter() {
  return getSorcererMetamagicDefinitions();
}

export function getSorcererMetamagicSelectionCountForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getSorcererMetamagicSelectionCount(character);
}

export function getSorcererMetamagicSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getSorcererMetamagicSelections(character);
}

export function setSorcererMetamagicSelectionsForCharacter(
  character: Character,
  selections: Parameters<typeof setSorcererMetamagicSelections>[1]
): Character {
  return setSorcererMetamagicSelections(character, selections);
}

export function getSorceryPointsTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getSorceryPointsTotal(character);
}

export function getSorceryPointsRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getSorceryPointsRemaining(character);
}

export function restoreSorceryPointForCharacter(character: Character): Character {
  return restoreOneSorceryPoint(character);
}

export function expendSorceryPointForCharacter(character: Character): Character {
  return expendOneSorceryPoint(character);
}

export function restoreAllSorceryPointsForCharacter(character: Character): Character {
  return restoreAllSorceryPoints(character);
}

export function convertSpellSlotToSorceryPointsForCharacter(
  character: Character,
  spellSlotLevel: number
): Character {
  return convertSpellSlotToSorceryPoints(character, spellSlotLevel);
}

export function createSpellSlotFromSorceryPointsForCharacter(
  character: Character,
  spellSlotLevel: number
): Character {
  return createSpellSlotFromSorceryPoints(character, spellSlotLevel);
}

export function getInnateSorceryUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getInnateSorceryUsesTotal(character);
}

export function getInnateSorceryUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getInnateSorceryUsesRemaining(character);
}

export function getAlwaysPreparedSpellIdsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds">
): string[] {
  return [
    ...new Set([
      ...getBardAlwaysPreparedSpellIds(character),
      ...getDruidAlwaysPreparedSpellIds(character),
      ...getRangerAlwaysPreparedSpellIds(character),
      ...getPaladinAlwaysPreparedSpellIds(character),
      ...getWarlockAlwaysPreparedSpellIds(character),
      ...getWizardAlwaysPreparedSpellIds(character)
    ])
  ];
}

export function getWarlockEldritchInvocationLimitForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getWarlockEldritchInvocationLimit(character);
}

export function getWarlockMagicalCunningUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getWarlockMagicalCunningUsesTotal(character);
}

export function getWarlockMagicalCunningUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getWarlockMagicalCunningUsesRemaining(character);
}

export function getContactPatronUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getContactPatronUsesTotal(character);
}

export function getContactPatronUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getContactPatronUsesRemaining(character);
}

export function getWarlockMysticArcanumSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">
) {
  return getWarlockMysticArcanumSelections(character);
}

export function getWarlockMysticArcanumSpellIdForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">,
  spellLevel: Parameters<typeof getWarlockMysticArcanumSpellId>[1]
) {
  return getWarlockMysticArcanumSpellId(character, spellLevel);
}

export function getWarlockMysticArcanumSpellOptionsForCharacter(
  character: Pick<Character, "className" | "level">,
  spellLevel: Parameters<typeof getWarlockMysticArcanumSpellOptions>[1]
) {
  return getWarlockMysticArcanumSpellOptions(character, spellLevel);
}

export function setWarlockMysticArcanumSpellIdForCharacter(
  character: Character,
  spellLevel: Parameters<typeof setWarlockMysticArcanumSpellId>[1],
  spellId: Parameters<typeof setWarlockMysticArcanumSpellId>[2]
): Character {
  return setWarlockMysticArcanumSpellId(character, spellLevel, spellId);
}

export function getWarlockInvocationSelectionIdsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">
) {
  return getWarlockInvocationSelectionIds(character);
}

export function getWarlockInvocationOptionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">,
  selectedIds?: string[]
) {
  return getWarlockInvocationOptions(character, selectedIds);
}

export function getWarlockLearnedInvocationOptionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">
) {
  return getWarlockLearnedInvocationOptions(character);
}

export function getWarlockInvocationBlockingSelectionNamesForCharacter(
  selectionId: string,
  selectedIds: string[]
) {
  return getWarlockInvocationBlockingSelectionNames(selectionId, selectedIds);
}

export function setWarlockInvocationSelectionIdsForCharacter(
  character: Character,
  selectionIds: string[]
): Character {
  return setWarlockInvocationSelectionIds(character, selectionIds);
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

  if (character.className === "Ranger") {
    return getRangerWeaponMasterySelectionCount(character);
  }

  if (character.className === "Rogue") {
    return getRogueWeaponMasterySelectionCount(character);
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

  if (character.className === "Ranger") {
    return getRangerWeaponMasteryOptions();
  }

  if (character.className === "Rogue") {
    return getRogueWeaponMasteryOptions();
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

  if (character.className === "Ranger") {
    return getRangerWeaponMasterySelections(character);
  }

  if (character.className === "Rogue") {
    return getRogueWeaponMasterySelections(character);
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

  if (character.className === "Ranger") {
    return setRangerWeaponMasterySelections(character, selections);
  }

  if (character.className === "Rogue") {
    return setRogueWeaponMasterySelections(character, selections);
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
    ...getMonkDerivedStatusEntries(character),
    ...getRangerDerivedStatusEntries(character),
    ...getPaladinDerivedStatusEntries(character),
    ...getRogueDerivedStatusEntries(character)
  ];
}

export function getSpellEntryForCharacter(
  character: Pick<Character, "className" | "level">,
  spell: SpellEntry
): SpellEntry {
  return getRangerSpellEntry(character, spell);
}

export function getSpellDamageFormulaOverrideForCharacter(
  character: Pick<Character, "className" | "level">,
  spell: Pick<SpellEntry, "id">
): string | null {
  return getRangerSpellDamageFormula(character, spell);
}

export function getFeatureReactionEntriesForCharacter(
  character: Pick<Character, "className" | "level">
): ReactionEntry[] {
  return [
    ...getBardReactionEntries(character),
    ...getMonkReactionEntries(character),
    ...getRogueReactionEntries(character)
  ];
}

export function activateFeatureActionForCharacter(
  character: Character,
  actionKey: string
): Character {
  if (actionKey === bardicInspirationActionKey) {
    return activateBardicInspiration(character);
  }

  if (actionKey === paladinLayOnHandsActionKey) {
    return character;
  }

  if (actionKey === paladinsSmiteActionKey) {
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

  if (actionKey === innateSorceryActionKey) {
    return activateInnateSorcery(character);
  }

  if (actionKey === tirelessActionKey) {
    return consumeRangerTirelessUse(character);
  }

  if (actionKey === naturesVeilActionKey) {
    return activateRangerNaturesVeil(character);
  }

  if (actionKey === rogueSneakAttackActionKey) {
    return activateRogueSneakAttack(character);
  }

  if (actionKey === rogueSteadyAimActionKey) {
    return activateRogueSteadyAim(character);
  }

  if (actionKey === rogueStrokeOfLuckActionKey) {
    return consumeRogueStrokeOfLuckUse(character);
  }

  if (actionKey === magicalCunningActionKey) {
    return activateWarlockMagicalCunning(character);
  }

  if (actionKey === arcaneRecoveryActionKey) {
    return character;
  }

  if (actionKey === contactPatronActionKey) {
    return character;
  }

  if (actionKey === mysticArcanumActionKey) {
    return character;
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

export function getRangerFavoredEnemyUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getRangerFavoredEnemyUsesTotal(character);
}

export function getRangerFavoredEnemyUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): number {
  return getRangerFavoredEnemyUsesRemaining(character);
}

export function consumeRangerFavoredEnemyUseForCharacter(character: Character): Character {
  return consumeRangerFavoredEnemyUse(character);
}

export function getRangerTirelessUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "abilities">>
): number {
  return getRangerTirelessUsesTotal(character);
}

export function getRangerNaturesVeilUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "abilities">>
): number {
  return getRangerNaturesVeilUsesTotal(character);
}

export function getRangerTirelessUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): number {
  return getRangerTirelessUsesRemaining(character);
}

export function getRogueStrokeOfLuckUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getRogueStrokeOfLuckUsesTotal(character);
}

export function getRogueStrokeOfLuckUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getRogueStrokeOfLuckUsesRemaining(character);
}

export function getRangerNaturesVeilUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): number {
  return getRangerNaturesVeilUsesRemaining(character);
}

export function consumeRangerTirelessUseForCharacter(character: Character): Character {
  return consumeRangerTirelessUse(character);
}

export function consumeRangerNaturesVeilUseForCharacter(character: Character): Character {
  return consumeRangerNaturesVeilUse(character);
}

export function restoreRangerTirelessOnLongRestForCharacter(character: Character): Character {
  return restoreRangerTirelessOnLongRest(character);
}

export function restoreRangerNaturesVeilOnLongRestForCharacter(character: Character): Character {
  return restoreRangerNaturesVeilOnLongRest(character);
}

export function restoreRogueStrokeOfLuckOnShortRestForCharacter(character: Character): Character {
  return restoreRogueStrokeOfLuckOnShortRest(character);
}

export function restoreRogueStrokeOfLuckOnLongRestForCharacter(character: Character): Character {
  return restoreRogueStrokeOfLuckOnLongRest(character);
}

export function getChannelDivinityUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  if (character.className === "Cleric") {
    return getClericChannelDivinityUsesTotal(character);
  }

  if (character.className === "Paladin") {
    return getPaladinChannelDivinityUsesTotal(character);
  }

  return 0;
}

export function getChannelDivinityUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  if (character.className === "Cleric") {
    return getClericChannelDivinityUsesRemaining(character);
  }

  if (character.className === "Paladin") {
    return getPaladinChannelDivinityUsesRemaining(character);
  }

  return 0;
}

export function applyLayOnHandsForCharacter(
  character: Character,
  options: Parameters<typeof applyLayOnHands>[1]
): Character {
  return applyLayOnHands(character, options);
}

export function getLayOnHandsCurableConditionsForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getLayOnHandsCurableConditions(character);
}

export function getPaladinsSmiteUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getPaladinsSmiteUsesRemaining(character);
}

export function consumePaladinsSmiteUseForCharacter(character: Character): Character {
  return consumePaladinsSmiteUse(character);
}

export function consumeFaithfulSteedUseForCharacter(character: Character): Character {
  return consumeFaithfulSteedUse(character);
}

export function hasActivePaladinAuraOfProtectionForCharacter(
  character: Pick<Character, "className" | "level" | "statusEntries">
): boolean {
  return hasActivePaladinAuraOfProtection(character);
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

export function restoreInnateSorceryOnLongRestForCharacter(character: Character): Character {
  return restoreInnateSorceryOnLongRest(character);
}

export function restoreWarlockMagicalCunningOnLongRestForCharacter(character: Character): Character {
  return restoreWarlockMagicalCunningOnLongRest(character);
}

export function restoreContactPatronOnLongRestForCharacter(character: Character): Character {
  return restoreContactPatronOnLongRest(character);
}

export function consumeContactPatronUseForCharacter(character: Character): Character {
  return consumeContactPatronUse(character);
}

export function consumeMysticArcanumUseForCharacter(
  character: Character,
  spellLevel: Parameters<typeof consumeMysticArcanumUse>[1]
): Character {
  return consumeMysticArcanumUse(character, spellLevel);
}

export function hasActiveInnateSorceryForCharacter(
  character: Pick<Character, "statusEntries">
): boolean {
  return hasActiveInnateSorcery(character);
}

export function getInnateSorceryActivationSorceryPointCostForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): number {
  return getInnateSorceryActivationSorceryPointCost(character);
}

export function getSorcererMetamagicSelectionLimitForActionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): number {
  return getSorcererMetamagicSelectionLimitForAction(character);
}

export function hasSorcererArcaneApotheosisFreeMetamagicAvailableForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): boolean {
  return hasArcaneApotheosisFreeMetamagicAvailable(character);
}

export function getSorcererMetamagicActionCostForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">,
  optionKeys: string[]
): number {
  return getSorcererMetamagicActionCost(character, optionKeys);
}

export function spendSorcererMetamagicOptionsForCharacter(
  character: Character,
  optionKeys: string[]
): Character {
  return spendMetamagicOptions(character, optionKeys);
}

export function restorePaladinLayOnHandsOnLongRestForCharacter(character: Character): Character {
  return restorePaladinLayOnHandsOnLongRest(character);
}

export function restoreMonkUncannyMetabolismOnLongRestForCharacter(
  character: Character
): Character {
  return restoreMonkUncannyMetabolismOnLongRest(character);
}

export function markFeatureWeaponBonusUseForCharacter(
  character: Character,
  label: string
): Character {
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

  if (character.className === "Ranger") {
    return getRangerWeaponAttackMultiCount(character);
  }

  if (character.className === "Paladin") {
    return getPaladinWeaponAttackMultiCount(character);
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

  if (character.className === "Ranger") {
    return consumeRangerWeaponAttack(character);
  }

  if (character.className === "Paladin") {
    return consumePaladinWeaponAttack(character);
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

  if (actionKey === paladinChannelDivinityActionKey) {
    return activatePaladinFeatureActionOption(character, optionKey);
  }

  if (actionKey === metamagicActionKey) {
    return spendMetamagicOption(character, optionKey);
  }

  return character;
}

export function removeFeatureStatusEntryForCharacter(
  character: Character,
  statusEntry: Pick<CharacterStatusEntry, "id" | "value" | "sourceId">
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

  return {
    ...character,
    statusEntries: removeCharacterStatusEntry(character.statusEntries, statusEntry.id)
  };
}

export function applyShortRestToFeatureState(character: Character): Character {
  return applyShortRestToWizardFeatures(
    applyShortRestToSorcererFeatures(
      applyShortRestToClericFeatures(
        applyShortRestToBardFeatures(
          applyShortRestToFighterFeatures(
            applyShortRestToPaladinFeatures(
              applyShortRestToRangerFeatures(
                applyShortRestToRogueFeatures(
                  applyShortRestToMonkFeatures(applyShortRestToBarbarianFeatures(character))
                )
              )
            )
          )
        )
      )
    )
  );
}

export function applyLongRestToFeatureState(character: Character): Character {
  return restoreMysticArcanumOnLongRest(
    restoreContactPatronOnLongRest(
      restoreWarlockMagicalCunningOnLongRest(
        applyLongRestToWizardFeatures(
          applyLongRestToSorcererFeatures(
            applyLongRestToClericFeatures(
              applyLongRestToBardFeatures(
                applyLongRestToFighterFeatures(
                  applyLongRestToPaladinFeatures(
                    applyLongRestToRangerFeatures(
                      applyLongRestToRogueFeatures(
                        applyLongRestToMonkFeatures(applyLongRestToBarbarianFeatures(character))
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}

export function getArcaneRecoveryUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getArcaneRecoveryUsesTotal(character);
}

export function getArcaneRecoveryUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getArcaneRecoveryUsesRemaining(character);
}

export function activateArcaneRecoveryForCharacter(
  character: Character,
  selection: Parameters<typeof activateArcaneRecovery>[1]
): Character {
  return activateArcaneRecovery(character, selection);
}

export function advanceFeatureStateForNewRound(character: Character): Character {
  return advanceRogueFeaturesForNewRound(
    advanceMonkFeaturesForNewRound(
      advancePaladinFeaturesForNewRound(
        advanceRangerFeaturesForNewRound(
          advanceSorcererFeaturesForNewRound(
            advanceFighterFeaturesForNewRound(advanceClericFeaturesForNewRound(character))
          )
        )
      )
    )
  );
}
