import type { Character, CharacterClassFeatureState } from "../../../types";
import { ALL_SKILLS } from "../../../types";
import type { SkillName, WEAPON_PROFICIENCY } from "../../../types";
import type { EconomyType } from "../actionEconomy";
import { abilityKeys } from "../constants";
import {
  hasExhaustionAbilityCheckDisadvantage,
  hasExhaustionAttackRollDisadvantage,
  hasExhaustionSavingThrowDisadvantage,
  removeCharacterStatusEntry
} from "../traits";
import {
  applySuperiorInspirationOnInitiative,
  getBardExpertiseSelections,
  setBardExpertiseSelections
} from "./bard";
import {
  applyPersistentRageOnInitiative,
  consumeBarbarianBrutalStrikeBonus,
  consumeBarbarianFrenzyBonus,
  consumeBarbarianWeaponAttack,
  deactivateBarbarianRecklessAttack,
  deactivateBarbarianRage,
  getBarbarianPersistentRageUsesRemaining,
  getBarbarianPersistentRageUsesTotal,
  getBarbarianPrimalKnowledgeSkillOptions,
  getBarbarianPrimalKnowledgeSkillSelection,
  getBarbarianRageDamageBonus,
  getBarbarianWeaponAttackMultiCount,
  setBarbarianPrimalKnowledgeSkillSelection,
} from "./barbarian";
import {
  getClericBlessedStrikesChoice,
  getClericChannelDivinityUsesRemaining,
  getClericChannelDivinityUsesTotal,
  getClericDivineOrderChoice,
  markClericBlessedStrikeUsed,
  setClericBlessedStrikesChoice,
  setClericDivineOrderChoice
} from "./cleric";
import {
  getDruidPrimalOrderChoice,
  setDruidPrimalOrderChoice
} from "./druid";
import {
  consumeRangerFavoredEnemyUse,
  consumeRangerNaturesVeilUse,
  consumeRangerTirelessUse,
  consumeRangerWeaponAttack,
  getRangerDeftExplorerExpertiseSelection,
  getRangerDeftExplorerLanguageSelections,
  getRangerFavoredEnemyUsesRemaining,
  getRangerFavoredEnemyUsesTotal,
  getRangerLevel9ExpertiseSelections,
  getRangerNaturesVeilUsesRemaining,
  getRangerNaturesVeilUsesTotal,
  getRangerTirelessUsesRemaining,
  getRangerTirelessUsesTotal,
  getRangerWeaponAttackMultiCount,
  restoreRangerNaturesVeilOnLongRest,
  restoreRangerTirelessOnLongRest,
  setRangerDeftExplorerExpertiseSelection,
  setRangerDeftExplorerLanguageSelections,
  setRangerLevel9ExpertiseSelections,
} from "./ranger";
import {
  getRogueExpertiseSelections,
  getRogueStrokeOfLuckUsesRemaining,
  getRogueStrokeOfLuckUsesTotal,
  restoreRogueStrokeOfLuckOnLongRest,
  restoreRogueStrokeOfLuckOnShortRest,
  setRogueExpertiseSelections,
  setRogueThievesCantLanguageSelection,
  getRogueThievesCantLanguageSelection
} from "./rogue";
import {
  createSpellSlotFromSorceryPoints,
  convertSpellSlotToSorceryPoints,
  expendOneSorceryPoint,
  getInnateSorceryUsesRemaining,
  getInnateSorceryUsesTotal,
  getInnateSorceryActivationSorceryPointCost,
  getSorcererMetamagicActionCost,
  getSorcererMetamagicDefinitions,
  getSorcererMetamagicSelectionCount,
  getSorcererMetamagicSelectionLimitForAction,
  getSorcererMetamagicSelections,
  getSorceryPointsRemaining,
  getSorceryPointsTotal,
  hasActiveInnateSorcery,
  hasArcaneApotheosisFreeMetamagicAvailable,
  restoreAllSorceryPoints,
  restoreInnateSorceryOnLongRest,
  restoreOneSorceryPoint,
  setSorcererMetamagicSelections,
  spendMetamagicOptions
} from "./sorcerer";
import {
  consumeContactPatronUse,
  consumeMysticArcanumUse,
  getContactPatronUsesRemaining,
  getContactPatronUsesTotal,
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
  restoreContactPatronOnLongRest,
  restoreWarlockMagicalCunningOnLongRest,
  setWarlockMysticArcanumSpellId,
  setWarlockInvocationSelectionIds
} from "./warlock";
import {
  activateArcaneRecovery,
  consumeWizardSignatureSpellFreeCast,
  getArcaneRecoveryUsesRemaining,
  getArcaneRecoveryUsesTotal,
  getWizardExpendedSignatureSpellIds,
  getWizardScholarSelection,
  getWizardSignatureSpellIds,
  hasWizardSignatureSpellFreeCastAvailable,
  getWizardSpellMasterySelection,
  getWizardSpellMasterySpellIds,
  setWizardScholarSelection,
  setWizardSignatureSpellIds,
  setWizardSpellMasterySelection,
  syncWizardSignatureSpellsToSpellbook,
  syncWizardSpellMasterySelectionsToSpellbook
} from "./wizard";
import { getSubclassDerivedFeatureState } from "./subclasses";
import {
  applyLayOnHands,
  consumeFaithfulSteedUse,
  consumePaladinWeaponAttack,
  consumePaladinsSmiteUse,
  getLayOnHandsCurableConditions,
  getPaladinChannelDivinityUsesRemaining,
  getPaladinChannelDivinityUsesTotal,
  getPaladinHealingPoolRemaining,
  getPaladinHealingPoolTotal,
  getPaladinWeaponAttackMultiCount,
  getPaladinsSmiteUsesRemaining,
  hasActivePaladinAuraOfProtection,
  restorePaladinLayOnHandsOnLongRest,
} from "./paladin";
import {
  applyPerfectFocusOnInitiative,
  consumeMonkWeaponAttack,
  expendMonkFocusPoint,
  getMonkFocusPointsRemaining,
  getMonkFocusPointsTotal,
  getMonkExtraAttackMultiCount,
  getMonkFlurryOfBlowsAttackMultiCount,
  hasMonkPerfectFocus,
  restoreAllMonkFocusPoints,
  restoreMonkUncannyMetabolismOnLongRest,
  restoreOneMonkFocusPoint
} from "./monk";
import {
  consumeFighterNonMagicAction,
  consumeFighterWeaponAttack,
  getFighterNonMagicActionMultiCount,
  getFighterWeaponAttackMultiCount,
} from "./fighter";
import {
  collectActiveClassFeatureState,
  getActiveClassFeatureModule,
  getClassFeatureModules
} from "./modules";
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
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): CharacterClassFeatureState {
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterClassFeatureState>) : {};
  const rawRecord = record as Record<string, unknown>;
  const normalizedState = {} as CharacterClassFeatureState;

  getClassFeatureModules().forEach((module) => {
    (normalizedState as Record<string, unknown>)[module.stateKey] = module.normalizeState(
      rawRecord[module.stateKey],
      character
    );
  });

  return normalizedState;
}

export function getFeatureActionsForCharacter(character: Character): FeatureActionCard[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.actions ?? []),
    ...(subclassDerivedState.featureActions ?? [])
  ];
}

export function getFeatureActionOptionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities" | "feats">,
  actionKey: string
): FeatureActionOptionCard[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.actionOptions?.[actionKey] ?? []),
    ...(subclassDerivedState.featureActionOptions?.[actionKey] ?? [])
  ];
}

export function getFeatureDamageBonusesForWeaponAction(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>,
  context: WeaponFeatureContext
): FeatureDamageBonus[] {
  return collectActiveClassFeatureState(character).getWeaponDamageBonuses?.(context) ?? [];
}

export function getSavingThrowIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): SavingThrowIndicatorMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const exhaustionIndicators = hasExhaustionSavingThrowDisadvantage(character.statusEntries)
    ? (Object.fromEntries(
        abilityKeys.map((ability) => [ability, [exhaustionDisadvantageIndicator]])
      ) as SavingThrowIndicatorMap)
    : {};

  return mergeIndicatorMaps(
    baseFeatureState.savingThrowIndicators ?? {},
    subclassDerivedState.savingThrowIndicators ?? {},
    exhaustionIndicators
  );
}

export function getAbilityCheckIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): AbilityCheckIndicatorMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const exhaustionIndicators = hasExhaustionAbilityCheckDisadvantage(character.statusEntries)
    ? (Object.fromEntries(
        abilityKeys.map((ability) => [ability, [exhaustionDisadvantageIndicator]])
      ) as AbilityCheckIndicatorMap)
    : {};

  return mergeIndicatorMaps(
    baseFeatureState.abilityCheckIndicators ?? {},
    subclassDerivedState.abilityCheckIndicators ?? {},
    exhaustionIndicators
  );
}

export function getCoreStatIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): CoreStatIndicatorMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  return mergeIndicatorMaps(
    baseFeatureState.coreStatIndicators ?? {},
    getSubclassDerivedFeatureState(character).coreStatIndicators ?? {}
  );
}

export function getSkillIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): SkillIndicatorMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const exhaustionIndicators = hasExhaustionAbilityCheckDisadvantage(character.statusEntries)
    ? (Object.fromEntries(
        ALL_SKILLS.map((skill) => [skill, [exhaustionDisadvantageIndicator]])
      ) as SkillIndicatorMap)
    : {};

  return mergeIndicatorMaps(
    baseFeatureState.skillIndicators ?? {},
    subclassDerivedState.skillIndicators ?? {},
    exhaustionIndicators
  );
}

export function getWeaponAttackIndicatorsForCharacter(
  character: Pick<Character, "className" | "statusEntries"> & Partial<Pick<Character, "subclassId">>
): FeatureIndicator[] {
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const baseIndicators = hasExhaustionAttackRollDisadvantage(character.statusEntries)
    ? [exhaustionDisadvantageIndicator]
    : [];

  return [...(subclassDerivedState.weaponAttackIndicators ?? []), ...baseIndicators];
}

export function getSkillBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities">,
  skill: SkillName,
  proficiencyLevel: PROF_LEVEL
): FeatureSkillBonus[] {
  return collectActiveClassFeatureState(character).getSkillBonuses?.(skill, proficiencyLevel) ?? [];
}

export function getSpellcastingStateForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSpellcastingState {
  return (
    collectActiveClassFeatureState(character).spellcastingState ?? {
      blocked: false,
      reason: null
    }
  );
}

export function getArmorClassModesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: ArmorClassFeatureContext
): FeatureArmorClassMode[] {
  return collectActiveClassFeatureState(character).getArmorClassModes?.(context) ?? [];
}

export function getArmorClassBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: ArmorClassFeatureContext
): FeatureArmorClassBonus[] {
  return collectActiveClassFeatureState(character).getArmorClassBonuses?.(context) ?? [];
}

export function getSpeedBonusesForCharacter(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "equipment" | "customEquipment"
  >,
  context: SpeedFeatureContext
): FeatureSpeedBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.getSpeedBonuses?.(context) ?? []),
    ...(subclassDerivedState.speedBonuses ?? [])
  ];
}

export function getAbilityScoreBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureAbilityScoreBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  return [
    ...(baseFeatureState.abilityScoreBonuses ?? []),
    ...(getSubclassDerivedFeatureState(character).abilityScoreBonuses ?? [])
  ];
}

export function getCantripLimitBonusForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return (collectActiveClassFeatureState(character).cantripLimitBonus ?? 0) + (subclassDerivedState.cantripLimitBonus ?? 0);
}

export function getMonkMartialArtsDieForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return collectActiveClassFeatureState(character).monkMartialArtsDie ?? null;
}

export function getBardicInspirationDieForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return collectActiveClassFeatureState(character).bardicInspirationDie ?? null;
}

export function getRogueSneakAttackDiceCountForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return collectActiveClassFeatureState(character).rogueSneakAttackDiceCount ?? 0;
}

export function getRogueSneakAttackFormulaForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return collectActiveClassFeatureState(character).rogueSneakAttackFormula ?? "0";
}

export function getMonkUnarmedDamageTypeLabelForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return collectActiveClassFeatureState(character).monkUnarmedDamageTypeLabel ?? "";
}

export function getBarbarianRageDamageBonusForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getBarbarianRageDamageBonus(character);
}

export function canUseMonkMartialArtsForCharacter(
  character: Pick<Character, "className" | "level">,
  context: {
    hasWornBodyArmor: boolean;
    hasShieldEquipped: boolean;
    wieldsOnlyMonkWeaponsOrUnarmed: boolean;
  }
): boolean {
  return collectActiveClassFeatureState(character).canUseMonkMartialArts?.(context) ?? false;
}

export function getCantripDamageBonusForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities" | "feats">
): number {
  return (
    (collectActiveClassFeatureState(character).cantripDamageBonus ?? 0) +
    (getSubclassDerivedFeatureState(character).cantripDamageBonus ?? 0)
  );
}

export function getFeatureWeaponProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.weaponProficiencyEntries ?? []),
    ...(subclassDerivedState.weaponProficiencyEntries ?? [])
  ];
}

export function getFeatureSkillProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSkillProficiencyEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.skillProficiencyEntries ?? []),
    ...(subclassDerivedState.skillProficiencyEntries ?? [])
  ];
}

export function getFeatureSavingThrowProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSavingThrowProficiencyEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.savingThrowProficiencyEntries ?? []),
    ...(subclassDerivedState.savingThrowProficiencyEntries ?? [])
  ];
}

export function getFeatureArmorProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureArmorProficiencyEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.armorProficiencyEntries ?? []),
    ...(subclassDerivedState.armorProficiencyEntries ?? [])
  ];
}

export function getFeatureLanguageProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureLanguageProficiencyEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.languageProficiencyEntries ?? []),
    ...(subclassDerivedState.languageProficiencyEntries ?? [])
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

export function getBarbarianPrimalKnowledgeSkillOptionsForCharacter(
  character: Pick<Character, "className" | "level">
): SkillName[] {
  if (character.className !== "Barbarian" || character.level < 3) {
    return [];
  }

  return getBarbarianPrimalKnowledgeSkillOptions();
}

export function getBarbarianPrimalKnowledgeSkillSelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillName | null {
  return getBarbarianPrimalKnowledgeSkillSelection(character);
}

export function setBarbarianPrimalKnowledgeSkillSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setBarbarianPrimalKnowledgeSkillSelection>[1]
): Character {
  return setBarbarianPrimalKnowledgeSkillSelection(character, selection);
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
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...new Set([
      ...(baseFeatureState.alwaysPreparedSpellIds ?? []),
      ...(subclassDerivedState.alwaysPreparedSpellIds ?? [])
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
  return collectActiveClassFeatureState(character).weaponMastery?.selectionCount ?? 0;
}

export function getWeaponMasteryOptionsForCharacter(
  character: Pick<Character, "className" | "level">
): WEAPON_PROFICIENCY[] {
  return collectActiveClassFeatureState(character).weaponMastery?.options ?? [];
}

export function getWeaponMasterySelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): WEAPON_PROFICIENCY[] {
  return collectActiveClassFeatureState(character).weaponMastery?.selections ?? [];
}

export function setWeaponMasterySelectionsForCharacter(
  character: Character,
  selections: WEAPON_PROFICIENCY[]
): Character {
  return (
    collectActiveClassFeatureState(character).weaponMastery?.setSelections(character, selections) ??
    character
  );
}

export function applySuperiorInspirationOnInitiativeForCharacter(character: Character): Character {
  return applySuperiorInspirationOnInitiative(character);
}

export function applyPerfectFocusOnInitiativeForCharacter(character: Character): Character {
  return applyPerfectFocusOnInitiative(character);
}

export function applyPersistentRageOnInitiativeForCharacter(character: Character): Character {
  return applyPersistentRageOnInitiative(character);
}

export function getBarbarianPersistentRageUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getBarbarianPersistentRageUsesTotal(character);
}

export function getBarbarianPersistentRageUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getBarbarianPersistentRageUsesRemaining(character);
}

export function hasPerfectFocusForCharacter(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasMonkPerfectFocus(character);
}

export function getDerivedFeatureStatusEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): DerivedFeatureStatusEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.derivedStatusEntries ?? []),
    ...(subclassDerivedState.derivedStatusEntries ?? [])
  ];
}

export function getSpellEntryForCharacter(
  character: Pick<Character, "className" | "level">,
  spell: SpellEntry
): SpellEntry {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const baseSpellEntry = baseFeatureState.transformSpellEntry
    ? baseFeatureState.transformSpellEntry(spell)
    : spell;

  return subclassDerivedState.transformSpellEntry
    ? subclassDerivedState.transformSpellEntry(baseSpellEntry)
    : baseSpellEntry;
}

export function getSpellDamageFormulaOverrideForCharacter(
  character: Pick<Character, "className" | "level">,
  spell: Pick<SpellEntry, "id">
): string | null {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return (
    subclassDerivedState.spellDamageFormulaOverrides?.[spell.id] ??
    baseFeatureState.getSpellDamageFormulaOverride?.(spell) ??
    null
  );
}

export function getFeatureReactionEntriesForCharacter(
  character: Pick<Character, "className" | "level">
): ReactionEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.reactionEntries ?? []),
    ...(subclassDerivedState.reactionEntries ?? [])
  ];
}

export function activateFeatureActionForCharacter(
  character: Character,
  actionKey: string
): Character {
  return getActiveClassFeatureModule(character.className)?.handleAction?.(character, actionKey) ?? character;
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
  if (label === "Brutal Strike") {
    return consumeBarbarianBrutalStrikeBonus(character);
  }

  if (label === "Frenzy") {
    return consumeBarbarianFrenzyBonus(character);
  }

  if (label === "Blessed Strikes") {
    return markClericBlessedStrikeUsed(character);
  }

  return character;
}

export function getWeaponActionEconomyMultiForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  if (character.className === "Barbarian") {
    return getBarbarianWeaponAttackMultiCount(character);
  }

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
  if (character.className === "Barbarian") {
    return consumeBarbarianWeaponAttack(character);
  }

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
  return (
    getActiveClassFeatureModule(character.className)?.handleActionOption?.(
      character,
      actionKey,
      optionKey
    ) ?? character
  );
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

  if (statusEntry.sourceId === "feature-barbarian-reckless-attack" || normalizedValue === "Reckless Attack") {
    return deactivateBarbarianRecklessAttack(character);
  }

  return {
    ...character,
    statusEntries: removeCharacterStatusEntry(character.statusEntries, statusEntry.id)
  };
}

export function applyShortRestToFeatureState(character: Character): Character {
  return getClassFeatureModules().reduce((nextCharacter, module) => {
    return module.applyShortRest ? module.applyShortRest(nextCharacter) : nextCharacter;
  }, character);
}

export function applyLongRestToFeatureState(character: Character): Character {
  return getClassFeatureModules().reduce((nextCharacter, module) => {
    return module.applyLongRest ? module.applyLongRest(nextCharacter) : nextCharacter;
  }, character);
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
  return getClassFeatureModules().reduce((nextCharacter, module) => {
    return module.advanceRound ? module.advanceRound(nextCharacter) : nextCharacter;
  }, character);
}
