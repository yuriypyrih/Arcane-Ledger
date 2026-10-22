import { consumePullOfDeath } from "./cleric/subclasses/clericGraveDomain";
import { getSpellRuntimeCharacter } from "../characterRuntime/classContexts";
import { getCharacterSpellEntryTransformer } from "../characterRuntime/spellEntryTransformer";
import { applyClassEditorChange } from "../multiclass";
import { getCharacterClasses, hasCharacterClass } from "../multiclassState";

import type { Character } from "../../../types";

import { ECONOMY_TYPE, getRoundTrackerResourceForEconomyType } from "../actionEconomy";

import {
  consumeRoundTrackerResource,
  isRoundTrackerResourceAvailable,
  markLightWeaponFollowUpUsed,
  recordLightWeaponAttackTrigger,
  shouldTrackRoundScopedResources
} from "../combat";
import { hasActiveNickMasteryForWeaponAction, isLightWeaponAction } from "../weaponLightProperty";

import { activateBoonOfBrightSunDaylightPresenceForCharacter } from "../feats/runtime/brightSun";
import { activateFeatActionForCharacter } from "../feats/runtime/resources";
import {
  activateSpeciesFeatureActionForCharacter,
  activateSpeciesFeatureActionOptionForCharacter
} from "../species";
import { removeCharacterStatusEntry } from "../statusEntries";

import { consumeArtificerWeaponAttack } from "./artificer/artificer";
import {
  activateBardCollegeOfDanceInspiringMovement,
  applyMantleOfMajestyStatus,
  applyInspiredEclipseStatus,
  consumeBlessingOfMoonlightUse,
  consumeBardWeaponAttack,
  consumeBeguilingMagicOrBardicInspiration,
  consumeMantleOfMajestyUse,
  restoreAllBardicInspirationUses,
  restoreBardicInspirationUse
} from "./bard/bard";

import {
  activateBarbarianBerserkerRetaliation,
  applyPersistentRageOnInitiative,
  consumeBarbarianWarriorOfTheGodsCharges,
  expendBarbarianRageUse,
  consumeBarbarianDivineFuryBonus,
  consumeBarbarianBrutalStrikeBonus,
  consumeBarbarianFrenzyBonus,
  consumeBarbarianWeaponAttack,
  deactivateBarbarianRecklessAttack,
  deactivateBarbarianRage,
  getBarbarianPersistentRageUsesRemaining,
  getBarbarianPersistentRageUsesTotal,
  getBarbarianRageState,
  getBarbarianRageUsesRemaining,
  getBarbarianRageUsesTotal,
  getBarbarianWarriorOfTheGodsUsesRemaining,
  getBarbarianWarriorOfTheGodsUsesTotal,
  restoreAllBarbarianRageUses,
  restoreBarbarianRageUse
} from "./barbarian/barbarian";
import {
  activateClericBlessingOfTheTrickster,
  consumeClericWeaponAttack,
  consumeClericGuidedStrikeReaction,
  consumeClericWardingFlareUse,
  expendClericChannelDivinityUse,
  getClericChannelDivinityUsesRemaining,
  getClericChannelDivinityUsesTotal,
  getClericWardingFlareUsesRemaining,
  getClericWardingFlareUsesTotal,
  markClericBlessedStrikeUsed,
  restoreClericChannelDivinityOnLongRest,
  restoreClericChannelDivinityOnShortRest
} from "./cleric/cleric";
import {
  deactivateDruidWildShape,
  isDruidWildShapeStatusSourceId,
  markDruidPrimalStrikeUsed
} from "./druid/druid";
import {
  applyRangerWinterWalkerFrozenHauntStatusEntries,
  applyRangerWinterWalkerFortifyingSoulSelfStatus,
  consumeRangerFavoredEnemyUse,
  consumeRangerGloomStalkerDreadAmbusherUse,
  consumeRangerWinterWalkerChillingRetributionUse,
  consumeRangerWinterWalkerFrozenHauntUse,
  consumeRangerFeyReinforcementsUse,
  consumeRangerMistyWandererUse,
  consumeRangerWinterWalkerPolarStrikesUse,
  chillingRetributionReactionId,
  markRangerDreadfulStrikesUsed,
  markRangerHunterColossusSlayerUsed,
  consumeRangerNaturesVeilUse,
  consumeRangerTirelessUse,
  consumeRangerWeaponAttack,
  markRangerHunterHordeBreakerUsed,
  getRangerFeyReinforcementsUsesRemaining,
  getRangerFeyReinforcementsUsesTotal,
  getRangerGloomStalkerDreadAmbusherUsesRemaining,
  getRangerGloomStalkerDreadAmbusherUsesTotal,
  getRangerMistyWandererUsesRemaining,
  getRangerMistyWandererUsesTotal,
  getRangerWinterWalkerFrozenHauntSpellOptionState,
  getRangerWinterWalkerFortifyingSoulHealingFacts,
  getRangerWinterWalkerFortifyingSoulHealingFormula,
  getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFacts,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormula,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplay,
  getRangerWinterWalkerChillingRetributionUsesRemaining,
  getRangerWinterWalkerChillingRetributionUsesTotal,
  getRangerWinterWalkerFrozenHauntUsesRemaining,
  getRangerWinterWalkerFrozenHauntUsesTotal,
  getRangerFavoredEnemyUsesRemaining,
  getRangerFavoredEnemyUsesTotal,
  getRangerNaturesVeilUsesRemaining,
  getRangerNaturesVeilUsesTotal,
  getRangerTirelessUsesRemaining,
  getRangerTirelessUsesTotal,
  activateRangerHunterSuperiorHuntersDefense,
  restoreRangerFeyReinforcementsOnLongRest,
  restoreRangerGloomStalkerDreadAmbusherOnLongRest,
  restoreRangerMistyWandererOnLongRest,
  restoreRangerNaturesVeilOnLongRest,
  restoreRangerTirelessOnLongRest,
  setRangerHunterHordeBreakerActionKey
} from "./ranger/ranger";
import {
  getRogueSpellThiefUsesRemaining,
  getRogueSpellThiefUsesTotal,
  getRogueStrokeOfLuckUsesRemaining,
  getRogueStrokeOfLuckUsesTotal,
  consumeRogueSpellThiefUse,
  consumeRogueWeaponAttack,
  consumeRogueSteadyAimAttackAdvantage,
  restoreRogueStrokeOfLuckOnLongRest,
  restoreRogueSpellThiefOnLongRest,
  restoreRogueStrokeOfLuckOnShortRest
} from "./rogue/rogue";
import {
  consumeRogueScionOfTheThreeBloodthirstUse,
  getRogueScionOfTheThreeAuraOfMalevolenceFormulaFact,
  getRogueScionOfTheThreeBloodthirstUsesRemaining,
  getRogueScionOfTheThreeBloodthirstUsesTotal,
  rogueScionOfTheThreeBloodthirstReactionId
} from "./rogue/subclasses/rogueScionOfTheThree";

import {
  expendRogueSoulknifePsionicDie,
  getRogueSoulknifePsionicDiceRemaining,
  getRogueSoulknifePsionicDiceTotal,
  getRogueSoulknifePsionicDie,
  restoreAllRogueSoulknifePsionicDice,
  restoreRogueSoulknifePsionicDie
} from "./rogue/subclasses/rogueSoulknife";
import {
  getInnateSorceryActivationSorceryPointCost,
  getSorcererMetamagicActionCost,
  getSorcererMetamagicSelectionLimitForAction,
  hasActiveInnateSorcery,
  hasArcaneApotheosisFreeMetamagicAvailable,
  restoreInnateSorceryOnLongRest,
  spendMetamagicOptions
} from "./sorcerer/sorcerer";

import {
  consumeContactPatronUse,
  consumeWarlockGiftOfTheDepthsUse,
  consumeWarlockGiftOfTheProtectorsUse,
  expendWarlockHealingLightDie,
  consumeWarlockBeguilingDefenseUse,
  consumeMysticArcanumUse,
  getWarlockGiftOfTheProtectorsBookOfShadowsText,
  getWarlockGiftOfTheProtectorsUsesRemaining,
  getWarlockGiftOfTheProtectorsUsesTotal,
  getWarlockFeatureReactionSpellDefinition,
  restoreAllWarlockHealingLightDice,
  restoreContactPatronOnLongRest,
  restoreWarlockGiftOfTheDepthsOnLongRest,
  restoreWarlockGiftOfTheProtectorsOnLongRest,
  restoreWarlockHealingLightDie,
  restoreWarlockHealingLightOnLongRest,
  restoreWarlockBeguilingDefenseOnLongRest,
  restoreWarlockMagicalCunningOnLongRest,
  consumeWarlockPactWeaponAttack,
  consumeWarlockStepsOfTheFeyUse,
  spendWarlockHealingLightDice,
  setWarlockGiftOfTheProtectorsBookOfShadowsText
} from "./warlock/warlock";

import {
  activateArcaneRecovery,
  consumeWizardWeaponAttack,
  getArcaneRecoveryUsesRemaining,
  getArcaneRecoveryUsesTotal
} from "./wizard/wizard";
import { wizardIllusionistIllusorySelfReactionId } from "./wizard/subclasses/wizardIllusionist";

import {
  hasActivePaladinOathOfVengeanceVowOfEnmity,
  soulOfVengeanceReactionId
} from "./paladin/subclasses/paladinOathOfVengeance";
import { getSubclassDerivedFeatureState } from "./subclasses";
import {
  applyLayOnHands,
  consumeElementalRebukeUse,
  consumeGloriousDefenseUse,
  expendPaladinChannelDivinityUse,
  consumeFaithfulSteedUse,
  consumePaladinWeaponAttack,
  consumePaladinsSmiteUse,
  elementalRebukeReactionId,
  getElementalRebukeUsesRemaining,
  getElementalRebukeUsesTotal,
  getGloriousDefenseUsesRemaining,
  getGloriousDefenseUsesTotal,
  getLayOnHandsCurableConditions,
  getPaladinChannelDivinityUsesRemaining,
  getPaladinChannelDivinityUsesTotal,
  getPaladinHealingPoolRemaining,
  getPaladinHealingPoolTotal,
  getPaladinsSmiteUsesRemaining,
  gloriousDefenseReactionId,
  hasActivePaladinAuraOfProtection,
  restorePaladinChannelDivinityOnLongRest,
  restorePaladinChannelDivinityOnShortRest,
  restorePaladinLayOnHandsOnLongRest
} from "./paladin/paladin";
import {
  applyMonkUncannyMetabolismOnInitiative,
  applyPerfectFocusOnInitiative,
  consumeMonkWeaponAttack,
  expendMonkFocusPoint,
  getMonkFocusPointsRemaining,
  getMonkFocusPointsTotal,
  getMonkFlurryOfBlowsAttackMultiCount,
  getMonkUncannyMetabolismUsesRemaining,
  getMonkUncannyMetabolismUsesTotal,
  hasMonkPerfectFocus,
  getMonkUnarmedStrikeMultiCount,
  restoreAllMonkFocusPoints,
  restoreMonkUncannyMetabolismOnLongRest,
  restoreOneMonkFocusPoint
} from "./monk/monk";
import {
  consumeMonkWarriorOfMercyHandOfHarm,
  monkWarriorOfMercyHandOfHarmBonusLabel
} from "./monk/subclasses/monkWarriorOfMercy";
import { consumeMonkWarriorOfTheElementsEmpoweredStrikes } from "./monk/subclasses/monkWarriorOfTheElements";
import { consumeFighterWeaponAttack } from "./fighter/fighter";
import { consumeMonkWarriorOfShadowStepAttackAdvantage } from "./monk/subclasses/monkWarriorOfShadow";
import {
  payEconomyForCharacterAction,
  resolveEconomyPaymentForCharacterAction,
  createEconomyMultiContextForFeatureAction,
  createEconomyMultiContextForWeaponAction
} from "./economyMulti";
import {
  collectActiveClassFeatureState,
  getActiveClassFeatureModule,
  getClassFeatureModules
} from "./modules";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionFact,
  WeaponAttackConsumptionContext
} from "./types";
import type { CharacterStatusEntry } from "../../../types";
import { getSpellEntryById, type ReactionEntry, type SpellEntry } from "../../../codex/entries";

import {
  clearRoundScopedFeatureStateIfOutOfCombat
} from "./state";

export function activateBardCollegeOfDanceInspiringMovementForCharacter(
  character: Character
): Character {
  return activateBardCollegeOfDanceInspiringMovement(character);
}

export function restoreBardicInspirationUseForCharacter(character: Character): Character {
  return restoreBardicInspirationUse(character);
}

export function restoreAllBardicInspirationUsesForCharacter(character: Character): Character {
  return restoreAllBardicInspirationUses(character);
}

export function consumeBeguilingMagicOrBardicInspirationForCharacter(
  character: Character
): Character {
  return consumeBeguilingMagicOrBardicInspiration(character);
}

export function consumeBlessingOfMoonlightUseForCharacter(character: Character): Character {
  return consumeBlessingOfMoonlightUse(character);
}

export function consumeMantleOfMajestyUseForCharacter(character: Character): Character {
  return consumeMantleOfMajestyUse(character);
}

export function applyMantleOfMajestyStatusForCharacter(character: Character): Character {
  return applyMantleOfMajestyStatus(character);
}

export function applyInspiredEclipseStatusForCharacter(character: Character): Character {
  return applyInspiredEclipseStatus(character);
}

export function applyPerfectFocusOnInitiativeForCharacter(character: Character): Character {
  return applyPerfectFocusOnInitiative(character);
}

export function applyMonkUncannyMetabolismOnInitiativeForCharacter(
  character: Character
): Character {
  return applyMonkUncannyMetabolismOnInitiative(character);
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

export function getBarbarianRageUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getBarbarianRageUsesTotal(character);
}

export function getBarbarianRageUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getBarbarianRageUsesRemaining(character);
}

export function expendBarbarianRageUseForCharacter(character: Character): Character {
  return expendBarbarianRageUse(character);
}

export function restoreBarbarianRageUseForCharacter(character: Character): Character {
  return restoreBarbarianRageUse(character);
}

export function restoreAllBarbarianRageUsesForCharacter(character: Character): Character {
  return restoreAllBarbarianRageUses(character);
}

export function activateBarbarianBerserkerRetaliationForCharacter(character: Character): Character {
  return activateBarbarianBerserkerRetaliation(character);
}

export function getBarbarianWarriorOfTheGodsUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return getBarbarianWarriorOfTheGodsUsesTotal(character);
}

export function getBarbarianWarriorOfTheGodsUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return getBarbarianWarriorOfTheGodsUsesRemaining(character);
}

export function hasPerfectFocusForCharacter(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasMonkPerfectFocus(character);
}

export function getDerivedFeatureStatusEntriesForCharacter(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "classRules" | "customClass" | "statusEntries"
  >
): DerivedFeatureStatusEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.derivedStatusEntries ?? []),
    ...(subclassDerivedState.derivedStatusEntries ?? [])
  ];
}

export function getSpellEntryForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<
      Pick<
        Character,
        | "subclassId"
        | "statusEntries"
        | "classFeatureState"
        | "classRules"
        | "customClass"
        | "feats"
        | "species"
        | "speciesChoices"
      >
    >,
  spell: SpellEntry
): SpellEntry {
  return getCharacterSpellEntryTransformer(character).transformSpellEntry(spell);
}

export function getSpellbookSpellEntryForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<
      Pick<
        Character,
        | "subclassId"
        | "statusEntries"
        | "classFeatureState"
        | "feats"
        | "species"
        | "speciesChoices"
      >
    >,
  spell: SpellEntry
): SpellEntry {
  return getCharacterSpellEntryTransformer(character).transformSpellbookSpellEntry(spell);
}

export function getFeatureReactionSpellForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "statusEntries" | "classFeatureState" | "feats">>,
  reactionEntryId: string
): SpellEntry | null {
  const warlockReactionSpellDefinition = getWarlockFeatureReactionSpellDefinition(reactionEntryId);

  if (warlockReactionSpellDefinition) {
    const spell = getSpellEntryById(warlockReactionSpellDefinition.spellId);

    return spell
      ? warlockReactionSpellDefinition.transformSpellEntry(
          character,
          getSpellEntryForCharacter(character, spell)
        )
      : null;
  }

  return null;
}

export function getSpellDamageFormulaOverrideForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "classRules" | "customClass">>,
  spell: Pick<SpellEntry, "id">
): string | null {
  const baseFeatureState = collectActiveClassFeatureState(getSpellRuntimeCharacter(character));
  const subclassDerivedState = getSubclassDerivedFeatureState(getSpellRuntimeCharacter(character));
  return (
    subclassDerivedState.spellDamageFormulaOverrides?.[spell.id] ??
    subclassDerivedState.getSpellDamageFormulaOverride?.(spell) ??
    baseFeatureState.getSpellDamageFormulaOverride?.(spell) ??
    null
  );
}

export function getFeatureReactionEntriesForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "classRules" | "customClass">>
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
  return clearRoundScopedFeatureStateIfOutOfCombat(
    activateBoonOfBrightSunDaylightPresenceForCharacter(
      activateFeatActionForCharacter(
        activateSpeciesFeatureActionForCharacter(
          runClassAction(character, (module, view) => module.handleAction?.(view, actionKey)) ??
            character,
          actionKey
        ),
        actionKey
      ),
      actionKey
    )
  );
}

export function activateClericBlessingOfTheTricksterForCharacter(
  character: Character,
  target: "self" | "other"
): Character {
  return clearRoundScopedFeatureStateIfOutOfCombat(
    activateClericBlessingOfTheTrickster(character, target)
  );
}

export const clericWardingFlareReactionEntryId = "reaction-cleric-warding-flare";
export const clericGuidedStrikeReactionEntryId = "reaction-cleric-guided-strike";

export function getClericWardingFlareUsesTotalForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getClericWardingFlareUsesTotal(character);
}

export function getClericWardingFlareUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): number {
  return getClericWardingFlareUsesRemaining(character);
}

export function consumeClericWardingFlareUseForCharacter(character: Character): Character {
  return consumeClericWardingFlareUse(character);
}

export function consumeClericGuidedStrikeReactionForCharacter(character: Character): Character {
  return consumeClericGuidedStrikeReaction(character);
}

export function getMonkFocusPointsTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getMonkFocusPointsTotal(character);
}

export function getMonkUncannyMetabolismUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getMonkUncannyMetabolismUsesTotal(character);
}

export function getMonkUncannyMetabolismUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getMonkUncannyMetabolismUsesRemaining(character);
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

export function getRangerFeyReinforcementsUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return getRangerFeyReinforcementsUsesTotal(character);
}

export function getRangerMistyWandererUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getRangerMistyWandererUsesTotal(character);
}

export function getRangerGloomStalkerDreadAmbusherUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getRangerGloomStalkerDreadAmbusherUsesTotal(character);
}

export function getRangerWinterWalkerChillingRetributionUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getRangerWinterWalkerChillingRetributionUsesTotal(character);
}

export function getRangerWinterWalkerFrozenHauntUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return getRangerWinterWalkerFrozenHauntUsesTotal(character);
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

export function getRogueSpellThiefUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return getRogueSpellThiefUsesTotal(character);
}

export function getRogueSpellThiefUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return getRogueSpellThiefUsesRemaining(character);
}

export function getRogueSoulknifePsionicDiceTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return getRogueSoulknifePsionicDiceTotal(character);
}

export function getRogueSoulknifePsionicDiceRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return getRogueSoulknifePsionicDiceRemaining(character);
}

export function getRogueSoulknifePsionicDieForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): "d6" | "d8" | "d10" | "d12" | null {
  return getRogueSoulknifePsionicDie(character);
}

export const rogueScionOfTheThreeBloodthirstReactionEntryId =
  rogueScionOfTheThreeBloodthirstReactionId;

export function getRogueStrokeOfLuckUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getRogueStrokeOfLuckUsesRemaining(character);
}

export function getRogueScionOfTheThreeBloodthirstUsesTotalForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getRogueScionOfTheThreeBloodthirstUsesTotal(character);
}

export function getRogueScionOfTheThreeBloodthirstUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  return getRogueScionOfTheThreeBloodthirstUsesRemaining(character);
}

export function consumeRogueSpellThiefUseForCharacter(character: Character): Character {
  return consumeRogueSpellThiefUse(character);
}

export function consumeRogueScionOfTheThreeBloodthirstUseForCharacter(
  character: Character
): Character {
  return consumeRogueScionOfTheThreeBloodthirstUse(character);
}

export function getRogueScionOfTheThreeAuraOfMalevolenceFactsForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): FeatureActionFact[] {
  const formulaFact = getRogueScionOfTheThreeAuraOfMalevolenceFormulaFact(character);

  return formulaFact ? [formulaFact] : [];
}

export function expendRogueSoulknifePsionicDieForCharacter(character: Character): Character {
  return expendRogueSoulknifePsionicDie(character);
}

export function getRangerNaturesVeilUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): number {
  return getRangerNaturesVeilUsesRemaining(character);
}

export function getRangerFeyReinforcementsUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return getRangerFeyReinforcementsUsesRemaining(character);
}

export function getRangerMistyWandererUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getRangerMistyWandererUsesRemaining(character);
}

export function getRangerGloomStalkerDreadAmbusherUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getRangerGloomStalkerDreadAmbusherUsesRemaining(character);
}

export function getRangerWinterWalkerChillingRetributionUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getRangerWinterWalkerChillingRetributionUsesRemaining(character);
}

export function getRangerWinterWalkerFrozenHauntUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return getRangerWinterWalkerFrozenHauntUsesRemaining(character);
}

export function getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string | null {
  return getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormula(character);
}

export function getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplayForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string | null {
  return getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplay(character);
}

export function getRangerWinterWalkerHuntersRimeTemporaryHitPointsFactsForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureActionFact[] {
  return getRangerWinterWalkerHuntersRimeTemporaryHitPointsFacts(character);
}

export function getRangerWinterWalkerFortifyingSoulHealingFormulaForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string | null {
  return getRangerWinterWalkerFortifyingSoulHealingFormula(character);
}

export function getRangerWinterWalkerFortifyingSoulHealingFormulaDisplayForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string | null {
  return getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay(character);
}

export function getRangerWinterWalkerFortifyingSoulHealingFactsForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureActionFact[] {
  return getRangerWinterWalkerFortifyingSoulHealingFacts(character);
}

export function getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "subclassId">>,
  spell: Pick<SpellEntry, "id"> | null,
  spellSlotTotals: readonly number[],
  spellSlotsExpended: readonly number[]
) {
  return getRangerWinterWalkerFrozenHauntSpellOptionState(
    character,
    spell,
    spellSlotTotals,
    spellSlotsExpended
  );
}

export function consumeRangerTirelessUseForCharacter(character: Character): Character {
  return consumeRangerTirelessUse(character);
}

export function consumeRangerNaturesVeilUseForCharacter(character: Character): Character {
  return consumeRangerNaturesVeilUse(character);
}

export function consumeRangerFeyReinforcementsUseForCharacter(character: Character): Character {
  return consumeRangerFeyReinforcementsUse(character);
}

export function consumeRangerMistyWandererUseForCharacter(character: Character): Character {
  return consumeRangerMistyWandererUse(character);
}

export function consumeRangerGloomStalkerDreadAmbusherUseForCharacter(
  character: Character
): Character {
  return clearRoundScopedFeatureStateIfOutOfCombat(
    consumeRangerGloomStalkerDreadAmbusherUse(character)
  );
}

export function consumeRangerWinterWalkerPolarStrikesUseForCharacter(
  character: Character
): Character {
  return clearRoundScopedFeatureStateIfOutOfCombat(
    consumeRangerWinterWalkerPolarStrikesUse(character)
  );
}

export function consumeRangerWinterWalkerChillingRetributionUseForCharacter(
  character: Character
): Character {
  return consumeRangerWinterWalkerChillingRetributionUse(character);
}

export function consumeRangerWinterWalkerFrozenHauntUseForCharacter(
  character: Character
): Character {
  return consumeRangerWinterWalkerFrozenHauntUse(character);
}

export function applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter(value: unknown) {
  return applyRangerWinterWalkerFrozenHauntStatusEntries(value);
}

export function applyRangerWinterWalkerFortifyingSoulSelfStatusForCharacter(
  character: Character
): Character {
  return applyRangerWinterWalkerFortifyingSoulSelfStatus(character);
}

export function consumeBarbarianWarriorOfTheGodsChargesForCharacter(
  character: Character,
  chargeCount: number
): Character {
  return consumeBarbarianWarriorOfTheGodsCharges(character, chargeCount);
}

export function restoreRangerTirelessOnLongRestForCharacter(character: Character): Character {
  return restoreRangerTirelessOnLongRest(character);
}

export function restoreRangerNaturesVeilOnLongRestForCharacter(character: Character): Character {
  return restoreRangerNaturesVeilOnLongRest(character);
}

export function restoreRangerFeyReinforcementsOnLongRestForCharacter(
  character: Character
): Character {
  return restoreRangerFeyReinforcementsOnLongRest(character);
}

export function restoreRangerMistyWandererOnLongRestForCharacter(character: Character): Character {
  return restoreRangerMistyWandererOnLongRest(character);
}

export function restoreRangerGloomStalkerDreadAmbusherOnLongRestForCharacter(
  character: Character
): Character {
  return restoreRangerGloomStalkerDreadAmbusherOnLongRest(character);
}

export function restoreRogueStrokeOfLuckOnShortRestForCharacter(character: Character): Character {
  return restoreRogueStrokeOfLuckOnShortRest(character);
}

export function restoreRogueStrokeOfLuckOnLongRestForCharacter(character: Character): Character {
  return restoreRogueStrokeOfLuckOnLongRest(character);
}

export function restoreRogueSpellThiefOnLongRestForCharacter(character: Character): Character {
  return restoreRogueSpellThiefOnLongRest(character);
}

export function restoreRogueSoulknifePsionicDieForCharacter(character: Character): Character {
  return restoreRogueSoulknifePsionicDie(character);
}

export function restoreAllRogueSoulknifePsionicDiceForCharacter(character: Character): Character {
  return restoreAllRogueSoulknifePsionicDice(character);
}

export function getChannelDivinityUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  if (character.className === "Paladin" && hasCharacterClass(character, "Paladin"))
    return getPaladinChannelDivinityUsesTotal(character);
  if (hasCharacterClass(character, "Cleric")) {
    return getClericChannelDivinityUsesTotal(character);
  }

  if (hasCharacterClass(character, "Paladin")) {
    return getPaladinChannelDivinityUsesTotal(character);
  }

  return 0;
}

export function getChannelDivinityUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  if (character.className === "Paladin" && hasCharacterClass(character, "Paladin"))
    return getPaladinChannelDivinityUsesRemaining(character);
  if (hasCharacterClass(character, "Cleric")) {
    return getClericChannelDivinityUsesRemaining(character);
  }

  if (hasCharacterClass(character, "Paladin")) {
    return getPaladinChannelDivinityUsesRemaining(character);
  }

  return 0;
}

export function expendChannelDivinityUseForCharacter(character: Character): Character {
  if (character.className === "Paladin" && hasCharacterClass(character, "Paladin"))
    return expendPaladinChannelDivinityUse(character);
  if (hasCharacterClass(character, "Cleric")) {
    return expendClericChannelDivinityUse(character);
  }

  if (hasCharacterClass(character, "Paladin")) {
    return expendPaladinChannelDivinityUse(character);
  }

  return character;
}

export function restoreChannelDivinityUseForCharacter(character: Character): Character {
  if (hasCharacterClass(character, "Cleric")) {
    return restoreClericChannelDivinityOnShortRest(character);
  }

  if (hasCharacterClass(character, "Paladin")) {
    return restorePaladinChannelDivinityOnShortRest(character);
  }

  return character;
}

export function restoreAllChannelDivinityUsesForCharacter(character: Character): Character {
  if (hasCharacterClass(character, "Cleric")) {
    return restoreClericChannelDivinityOnLongRest(character);
  }

  if (hasCharacterClass(character, "Paladin")) {
    return restorePaladinChannelDivinityOnLongRest(character);
  }

  return character;
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

export const paladinGloriousDefenseReactionEntryId = gloriousDefenseReactionId;
export const paladinElementalRebukeReactionEntryId = elementalRebukeReactionId;
export const paladinSoulOfVengeanceReactionEntryId = soulOfVengeanceReactionId;
export const rangerWinterWalkerChillingRetributionReactionEntryId = chillingRetributionReactionId;
export const wizardIllusionistIllusorySelfReactionEntryId = wizardIllusionistIllusorySelfReactionId;

export function hasActivePaladinOathOfVengeanceVowOfEnmityForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  return hasActivePaladinOathOfVengeanceVowOfEnmity(character);
}

export function getGloriousDefenseUsesTotalForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getGloriousDefenseUsesTotal(character);
}

export function getGloriousDefenseUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): number {
  return getGloriousDefenseUsesRemaining(character);
}

export function consumeGloriousDefenseUseForCharacter(character: Character): Character {
  return consumeGloriousDefenseUse(character);
}

export function getElementalRebukeUsesTotalForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getElementalRebukeUsesTotal(character);
}

export function getElementalRebukeUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): number {
  return getElementalRebukeUsesRemaining(character);
}

export function consumeElementalRebukeUseForCharacter(character: Character): Character {
  return consumeElementalRebukeUse(character);
}

export function activateRangerHunterSuperiorHuntersDefenseForCharacter(
  character: Character
): Character {
  return activateRangerHunterSuperiorHuntersDefense(character);
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

export function restoreWarlockMagicalCunningOnLongRestForCharacter(
  character: Character
): Character {
  return restoreWarlockMagicalCunningOnLongRest(character);
}

export function restoreContactPatronOnLongRestForCharacter(character: Character): Character {
  return restoreContactPatronOnLongRest(character);
}

export function restoreWarlockGiftOfTheDepthsOnLongRestForCharacter(
  character: Character
): Character {
  return restoreWarlockGiftOfTheDepthsOnLongRest(character);
}

export function restoreWarlockGiftOfTheProtectorsOnLongRestForCharacter(
  character: Character
): Character {
  return restoreWarlockGiftOfTheProtectorsOnLongRest(character);
}

export function restoreWarlockBeguilingDefenseOnLongRestForCharacter(
  character: Character
): Character {
  return restoreWarlockBeguilingDefenseOnLongRest(character);
}

export function restoreWarlockHealingLightOnLongRestForCharacter(character: Character): Character {
  return restoreWarlockHealingLightOnLongRest(character);
}

export function consumeContactPatronUseForCharacter(character: Character): Character {
  return consumeContactPatronUse(character);
}

export function consumeWarlockGiftOfTheDepthsUseForCharacter(character: Character): Character {
  return consumeWarlockGiftOfTheDepthsUse(character);
}

export function consumeWarlockGiftOfTheProtectorsUseForCharacter(character: Character): Character {
  return consumeWarlockGiftOfTheProtectorsUse(character);
}

export function getWarlockGiftOfTheProtectorsUsesTotalForCharacter(character: Character): number {
  return getWarlockGiftOfTheProtectorsUsesTotal(character);
}

export function getWarlockGiftOfTheProtectorsUsesRemainingForCharacter(
  character: Character
): number {
  return getWarlockGiftOfTheProtectorsUsesRemaining(character);
}

export function getWarlockGiftOfTheProtectorsBookOfShadowsTextForCharacter(
  character: Character
): string {
  return getWarlockGiftOfTheProtectorsBookOfShadowsText(character);
}

export function setWarlockGiftOfTheProtectorsBookOfShadowsTextForCharacter(
  character: Character,
  text: string
): Character {
  return setWarlockGiftOfTheProtectorsBookOfShadowsText(character, text);
}

export function consumeWarlockStepsOfTheFeyUseForCharacter(character: Character): Character {
  return consumeWarlockStepsOfTheFeyUse(character);
}

export function consumeWarlockBeguilingDefenseUseForCharacter(character: Character): Character {
  return consumeWarlockBeguilingDefenseUse(character);
}

export function spendWarlockHealingLightDiceForCharacter(
  character: Character,
  diceCount: number
): Character {
  return spendWarlockHealingLightDice(character, diceCount);
}

export function expendWarlockHealingLightDieForCharacter(character: Character): Character {
  return expendWarlockHealingLightDie(character);
}

export function restoreWarlockHealingLightDieForCharacter(character: Character): Character {
  return restoreWarlockHealingLightDie(character);
}

export function restoreAllWarlockHealingLightDiceForCharacter(character: Character): Character {
  return restoreAllWarlockHealingLightDice(character);
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
  const finalize = (nextCharacter: Character) =>
    clearRoundScopedFeatureStateIfOutOfCombat(nextCharacter);

  if (label === "Divine Fury") {
    return finalize(consumeBarbarianDivineFuryBonus(character));
  }

  if (label === "Brutal Strike") {
    return finalize(consumeBarbarianBrutalStrikeBonus(character));
  }

  if (label === "Frenzy") {
    return finalize(consumeBarbarianFrenzyBonus(character));
  }

  if (label === "Divine Strike" || label === "Blessed Strikes") {
    return finalize(markClericBlessedStrikeUsed(character));
  }

  if (label === "Primal Strike") {
    return finalize(markDruidPrimalStrikeUsed(character));
  }

  if (label === "Dreadful Strikes") {
    return finalize(markRangerDreadfulStrikesUsed(character));
  }

  if (label === "Pull of Death") return finalize(consumePullOfDeath(character));

  if (label === "Colossus Slayer") {
    return finalize(markRangerHunterColossusSlayerUsed(character));
  }

  if (label === monkWarriorOfMercyHandOfHarmBonusLabel) {
    return finalize(consumeMonkWarriorOfMercyHandOfHarm(character));
  }

  if (label === "Empowered Strikes") {
    return finalize(consumeMonkWarriorOfTheElementsEmpoweredStrikes(character));
  }

  return character;
}

export function markRangerHunterHordeBreakerUsedForCharacter(character: Character): Character {
  return clearRoundScopedFeatureStateIfOutOfCombat(markRangerHunterHordeBreakerUsed(character));
}

export function setRangerHunterHordeBreakerActionKeyForCharacter(
  character: Character,
  actionKey: string | null
): Character {
  return setRangerHunterHordeBreakerActionKey(character, actionKey);
}

export function getMonkFlurryOfBlowsAttackMultiCountForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getMonkFlurryOfBlowsAttackMultiCount(character);
}

export function getMonkUnarmedStrikeMultiCountForCharacter(
  character: Pick<Character, "className" | "level" | "subclassId" | "classFeatureState">
): number {
  return getMonkUnarmedStrikeMultiCount(character);
}

export function consumeWeaponAttackActionForCharacter(
  character: Character,
  action: WeaponAttackConsumptionContext
): Character {
  const consumeLightFollowUp = (nextCharacter: Character): Character => {
    if (
      action.lightFollowUpKind === "bonus" &&
      !isRoundTrackerResourceAvailable(nextCharacter.roundTracker, "bonusAction")
    ) {
      return nextCharacter;
    }

    const roundTracker =
      action.lightFollowUpKind === "bonus"
        ? consumeRoundTrackerResource(nextCharacter.roundTracker, "bonusAction")
        : nextCharacter.roundTracker;

    return {
      ...nextCharacter,
      roundTracker: markLightWeaponFollowUpUsed(roundTracker, action.key)
    };
  };
  const applyLightTrigger = (nextCharacter: Character): Character => {
    if (
      nextCharacter === character ||
      action.lightFollowUpKind ||
      action.economyType !== ECONOMY_TYPE.ACTION ||
      !isLightWeaponAction({
        attackKind: action.attackKind,
        properties: action.properties ?? []
      })
    ) {
      return nextCharacter;
    }

    return {
      ...nextCharacter,
      roundTracker: recordLightWeaponAttackTrigger(
        nextCharacter.roundTracker,
        action.key,
        hasActiveNickMasteryForWeaponAction(character, {
          attackKind: action.attackKind,
          baseWeapon: action.baseWeapon,
          mastery: action.mastery,
          hasActiveMastery: action.hasActiveMastery
        })
      )
    };
  };
  const finalize = (nextCharacter: Character) => {
    const shouldPreserveFrenzy =
      !shouldTrackRoundScopedResources(nextCharacter.roundTracker) &&
      hasCharacterClass(nextCharacter, "Barbarian") &&
      getBarbarianRageState(nextCharacter).frenzyPending === true;
    const cleared = clearRoundScopedFeatureStateIfOutOfCombat(applyLightTrigger(nextCharacter));
    return shouldPreserveFrenzy
      ? {
          ...cleared,
          classFeatureState: {
            ...cleared.classFeatureState,
            rage: { ...getBarbarianRageState(cleared), frenzyPending: true }
          }
        }
      : cleared;
  };

  if (action.lightFollowUpKind) {
    return finalize(consumeLightFollowUp(character));
  }

  const economyContext = createEconomyMultiContextForWeaponAction(action);
  if (
    action.economyType === ECONOMY_TYPE.ACTION ||
    resolveEconomyPaymentForCharacterAction(character, economyContext).payment?.kind === "pool"
  ) {
    const paid = payEconomyForCharacterAction(character, economyContext);
    if (paid.status === "unavailable") {
      // Bloodthirst owns a separate melee-only grant, displayed on the weapon itself.
      return hasCharacterClass(character, "Rogue")
        ? finalize(consumeRogueWeaponAttack(character, action))
        : character;
    }
    return finalize(
      consumeRogueSteadyAimAttackAdvantage(
        consumeMonkWarriorOfShadowStepAttackAdvantage(paid.character, {
          attackKind: action.attackKind,
          combatType: action.combatType ?? null
        })
      )
    );
  }

  if (hasCharacterClass(character, "Barbarian")) {
    return finalize(consumeBarbarianWeaponAttack(character));
  }

  if (hasCharacterClass(character, "Bard")) {
    return finalize(consumeBardWeaponAttack(character, action));
  }

  if (hasCharacterClass(character, "Artificer")) {
    return finalize(consumeArtificerWeaponAttack(character));
  }

  if (hasCharacterClass(character, "Cleric")) {
    const nextCharacter = consumeClericWeaponAttack(character, action);

    if (nextCharacter !== character) {
      return finalize(nextCharacter);
    }
  }

  if (hasCharacterClass(character, "Monk")) {
    return finalize(consumeMonkWeaponAttack(character, action));
  }

  if (hasCharacterClass(character, "Ranger")) {
    return finalize(consumeRangerWeaponAttack(character));
  }

  if (hasCharacterClass(character, "Paladin")) {
    return finalize(consumePaladinWeaponAttack(character));
  }

  if (hasCharacterClass(character, "Rogue")) {
    return finalize(consumeRogueWeaponAttack(character, action));
  }

  if (hasCharacterClass(character, "Fighter")) {
    return finalize(consumeFighterWeaponAttack(character, action));
  }

  if (hasCharacterClass(character, "Warlock")) {
    return finalize(consumeWarlockPactWeaponAttack(character, action));
  }

  if (hasCharacterClass(character, "Wizard")) {
    const nextCharacter = consumeWizardWeaponAttack(character, action);

    if (nextCharacter !== character) {
      return finalize(nextCharacter);
    }
  }

  const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);

  return finalize(
    roundTrackerResource &&
      isRoundTrackerResourceAvailable(character.roundTracker, roundTrackerResource)
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, roundTrackerResource)
        }
      : character
  );
}

export function consumeNonMagicActionForCharacter(
  character: Character,
  action: Pick<FeatureActionCard, "economyType" | "actionCategory">
): Character {
  const paid = payEconomyForCharacterAction(
    character,
    createEconomyMultiContextForFeatureAction(action)
  );
  return paid.status === "paid"
    ? clearRoundScopedFeatureStateIfOutOfCombat(paid.character)
    : character;
}

export function activateFeatureActionOptionForCharacter(
  character: Character,
  actionKey: string,
  optionKey: string
): Character {
  const classCharacter =
    runClassAction(character, (module, view) =>
      module.handleActionOption?.(view, actionKey, optionKey)
    ) ?? character;

  return clearRoundScopedFeatureStateIfOutOfCombat(
    classCharacter !== character
      ? classCharacter
      : activateSpeciesFeatureActionOptionForCharacter(character, actionKey, optionKey)
  );
}

export function activateFeatureActionOptionsForCharacter(
  character: Character,
  actionKey: string,
  optionKeys: string[]
): Character {
  return clearRoundScopedFeatureStateIfOutOfCombat(
    runClassAction(character, (module, view) =>
      module.handleActionOptions?.(view, actionKey, optionKeys)
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
    statusEntry.sourceId === "feature-barbarian-rage-of-the-wilds-bear" ||
    normalizedValue === "Rage" ||
    normalizedValue === "BLUDGEONING" ||
    normalizedValue === "PIERCING" ||
    normalizedValue === "SLASHING"
  ) {
    return deactivateBarbarianRage(character);
  }

  if (
    statusEntry.sourceId === "feature-barbarian-reckless-attack" ||
    normalizedValue === "Reckless Attack"
  ) {
    return deactivateBarbarianRecklessAttack(character);
  }

  if (isDruidWildShapeStatusSourceId(statusEntry.sourceId)) {
    return deactivateDruidWildShape(character);
  }

  return {
    ...character,
    statusEntries: removeCharacterStatusEntry(character.statusEntries, statusEntry.id)
  };
}

export function applyShortRestToFeatureState(character: Character): Character {
  if (character.multiclass)
    return getCharacterClasses(character).reduce(
      (next, entry) =>
        applyClassEditorChange(
          next,
          entry.id,
          (view) => getActiveClassFeatureModule(entry.className)?.applyShortRest?.(view) ?? view
        ),
      character
    );
  return getClassFeatureModules().reduce((nextCharacter, module) => {
    return module.applyShortRest ? module.applyShortRest(nextCharacter) : nextCharacter;
  }, character);
}

export function applyLongRestToFeatureState(character: Character): Character {
  if (character.multiclass)
    return getCharacterClasses(character).reduce(
      (next, entry) =>
        applyClassEditorChange(
          next,
          entry.id,
          (view) => getActiveClassFeatureModule(entry.className)?.applyLongRest?.(view) ?? view
        ),
      character
    );
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
  if (character.multiclass)
    return getCharacterClasses(character).reduce(
      (next, entry) =>
        applyClassEditorChange(
          next,
          entry.id,
          (view) => getActiveClassFeatureModule(entry.className)?.advanceRound?.(view) ?? view
        ),
      character
    );
  return getClassFeatureModules().reduce((nextCharacter, module) => {
    return module.advanceRound ? module.advanceRound(nextCharacter) : nextCharacter;
  }, character);
}

function runClassAction(
  character: Character,
  run: (
    module: NonNullable<ReturnType<typeof getActiveClassFeatureModule>>,
    view: Character
  ) => Character | null | undefined
): Character | undefined {
  for (const entry of getCharacterClasses(character)) {
    const module = getActiveClassFeatureModule(entry.className);
    if (!module) continue;
    let handled = false;
    const result = applyClassEditorChange(character, entry.id, (view) => {
      const after = run(module, view);
      handled = after != null && after !== view;
      return after ?? view;
    });
    if (handled) return result;
  }
  return undefined;
}
