import { fighterFeatureMap, fighterFeatures } from "../../../../codex/classes";
import { CLASS_FEATURE, type SpellEntry } from "../../../../codex/entries";
import type {
  Character,
  CharacterFighterFeatureState,
  WeaponProficiencyEntry
} from "../../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  WEAPON_PROFICIENCY
} from "../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../../combat";
import type {
  FeatureActionCard,
  FeatureActionResource,
  FeatureWeaponProficiencyEntry
} from "../types";
import { getWeaponMasteryOptions, normalizeWeaponMasterySelections } from "../weaponMastery";
import {
  advanceFighterSubclassFeaturesForNewRound,
  normalizeFighterSubclassFeatureState
} from "./subclasses";
import {
  applyFighterBanneretTeamTacticsStatus,
  consumeFighterBanneretGroupRecoveryUse,
  fighterBanneretKnightlyEnvoySkillOptions,
  getFighterBanneretGroupRecoveryHealingFormula,
  getFighterBanneretGroupRecoveryUsesRemaining,
  getFighterBanneretGroupRecoveryUsesTotal,
  getFighterBanneretKnightlyEnvoyLanguageSelection,
  getFighterBanneretKnightlyEnvoySkillSelection,
  restoreFighterBanneretGroupRecoveryOnLongRest,
  restoreFighterBanneretGroupRecoveryOnShortRest,
  setFighterBanneretKnightlyEnvoyLanguageSelection,
  setFighterBanneretKnightlyEnvoySkillSelection
} from "./subclasses/fighterBanneret";
import {
  expendFighterBattleMasterSuperiorityDie,
  getFighterBattleMasterManeuverSelectionCount,
  getFighterBattleMasterManeuverSelections,
  getFighterBattleMasterSuperiorityDiceRemaining,
  getFighterBattleMasterSuperiorityDiceTotal,
  getFighterBattleMasterSuperiorityDie,
  restoreAllFighterBattleMasterSuperiorityDice,
  restoreFighterBattleMasterSuperiorityDiceOnLongRest as restoreFighterBattleMasterSuperiorityDiceOnLongRestInternal,
  restoreFighterBattleMasterSuperiorityDiceOnShortRest as restoreFighterBattleMasterSuperiorityDiceOnShortRestInternal,
  restoreOneFighterBattleMasterSuperiorityDie,
  setFighterBattleMasterManeuverSelections
} from "./subclasses/fighterBattleMaster";
import {
  canUseFighterEldritchKnightActionCantripReplacement,
  consumeFighterEldritchKnightActionCantrip,
  getFighterEldritchKnightWarMagicMultiCount
} from "./subclasses/fighterEldritchKnight";
import {
  activateFighterPsiWarriorBulwarkOfForce,
  activateFighterPsiWarriorPsiPoweredLeap,
  activateFighterPsiWarriorTelekineticMasterSpellCast,
  activateFighterPsiWarriorTelekineticMovement,
  consumeFighterPsiWarriorPsionicStrike,
  consumeFighterPsiWarriorTelekineticMasterBonusAttack,
  expendFighterPsiWarriorEnergyDie,
  fighterPsiWarriorBulwarkOfForceActionKey,
  fighterPsiPoweredLeapActionKey,
  fighterPsiWarriorTelekineticMovementActionKey,
  getFighterPsiWarriorBulwarkOfForceUsesRemaining,
  getFighterPsiWarriorBulwarkOfForceUsesTotal,
  getFighterPsiWarriorEnergyDiceRemaining,
  getFighterPsiWarriorEnergyDiceTotal,
  getFighterPsiWarriorEnergyDie,
  getFighterPsiWarriorProtectiveFieldFormula,
  getFighterPsiWarriorPsionicStrikeFormula,
  getFighterPsiWarriorPsiPoweredLeapUsesRemaining,
  getFighterPsiWarriorPsiPoweredLeapUsesTotal,
  getFighterPsiWarriorTelekineticMasterUsesRemaining,
  getFighterPsiWarriorTelekineticMasterUsesTotal,
  getFighterPsiWarriorTelekineticMovementUsesRemaining,
  getFighterPsiWarriorTelekineticMovementUsesTotal,
  hasFighterPsiWarriorTelekineticMasterBonusAttackAvailable,
  hasFighterPsiWarriorPsionicStrikeAvailable,
  restoreAllFighterPsiWarriorEnergyDice,
  restoreFighterPsiWarriorEnergyDiceOnLongRest as restoreFighterPsiWarriorEnergyDiceOnLongRestInternal,
  restoreFighterPsiWarriorEnergyDiceOnShortRest as restoreFighterPsiWarriorEnergyDiceOnShortRestInternal,
  restoreFighterPsiWarriorEnergyDie,
  restoreFighterPsiWarriorBulwarkOfForceOnLongRest as restoreFighterPsiWarriorBulwarkOfForceOnLongRestInternal,
  restoreFighterPsiWarriorTelekineticMasterOnLongRest as restoreFighterPsiWarriorTelekineticMasterOnLongRestInternal,
  restoreFighterPsiWarriorPsiPoweredLeapOnLongRest as restoreFighterPsiWarriorPsiPoweredLeapOnLongRestInternal,
  restoreFighterPsiWarriorPsiPoweredLeapOnShortRest as restoreFighterPsiWarriorPsiPoweredLeapOnShortRestInternal,
  restoreFighterPsiWarriorTelekineticMovementOnLongRest as restoreFighterPsiWarriorTelekineticMovementOnLongRestInternal,
  restoreFighterPsiWarriorTelekineticMovementOnShortRest as restoreFighterPsiWarriorTelekineticMovementOnShortRestInternal
} from "./subclasses/fighterPsiWarrior";
import { createSourcedDescriptionEntries } from "../../actionModalDescriptions";

export const fighterSecondWindActionKey = "fighter-second-wind";
export const fighterActionSurgeActionKey = "fighter-action-surge";
export const fighterTacticalMindActionKey = "fighter-tactical-mind";
export const fighterIndomitableActionKey = "fighter-indomitable";
export { fighterPsiWarriorBulwarkOfForceActionKey };
export { fighterPsiPoweredLeapActionKey };
export { fighterPsiWarriorTelekineticMovementActionKey };
const weaponMasterySource = "Weapon Mastery";

const fighterWeaponMasteryOptions = getWeaponMasteryOptions();

function getFighterFeatureDescription(feature: CLASS_FEATURE): string[] {
  return [...(fighterFeatureMap[feature]?.description ?? [])];
}

function createFighterSecondWindResource(
  usesRemaining: number,
  usesTotal: number
): FeatureActionResource {
  return {
    kind: "text",
    label: "Second Wind",
    value: `${usesRemaining}/${usesTotal}`,
    icon: "wind"
  };
}

function getFighterSecondWindDescriptionAdditions(
  character: Pick<Character, "className" | "level">
) {
  if (!hasFighterFeature(character, CLASS_FEATURE.TACTICAL_SHIFT)) {
    return [];
  }

  const tacticalShiftDescription = getFighterFeatureDescription(CLASS_FEATURE.TACTICAL_SHIFT);

  return tacticalShiftDescription.length > 0
    ? [createSourcedDescriptionEntries("Tactical Shift", tacticalShiftDescription)]
    : [];
}

function getFighterFeatureRow(level: number) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = fighterFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedFighterFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return fighterFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function hasFighterFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Fighter") {
    return false;
  }

  return getUnlockedFighterFeatures(character.level).has(feature);
}

function getFighterAdditionalAttackCount(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasFighterFeature(character, CLASS_FEATURE.EXTRA_ATTACK)) {
    return 0;
  }

  if (hasFighterFeature(character, CLASS_FEATURE.THREE_EXTRA_ATTACKS)) {
    return 3;
  }

  if (hasFighterFeature(character, CLASS_FEATURE.TWO_EXTRA_ATTACKS)) {
    return 2;
  }

  return 1;
}

export function normalizeFighterFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): CharacterFighterFeatureState {
  const hasSecondWind = hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND);
  const hasActionSurge = hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE);
  const hasIndomitable = hasFighterFeature(character, CLASS_FEATURE.INDOMITABLE);
  const hasWeaponMastery = hasFighterFeature(character, CLASS_FEATURE.WEAPON_MASTERY);
  const additionalAttackCount = getFighterAdditionalAttackCount(character);
  const hasExtraAttack = additionalAttackCount > 0;

  if (
    !hasSecondWind &&
    !hasActionSurge &&
    !hasIndomitable &&
    !hasWeaponMastery &&
    !hasExtraAttack
  ) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterFighterFeatureState>) : {};
  const secondWindTotal = hasSecondWind
    ? (getFighterFeatureRow(character.level)?.secondWind ?? 0)
    : 0;
  const weaponMasteryTotal = hasWeaponMastery
    ? (getFighterFeatureRow(character.level)?.weaponMastery ?? 0)
    : 0;

  return {
    secondWindUsesExpended: hasSecondWind
      ? Math.max(
          0,
          Math.min(
            secondWindTotal,
            Number.isFinite(Number(record.secondWindUsesExpended))
              ? Math.floor(Number(record.secondWindUsesExpended))
              : 0
          )
        )
      : undefined,
    actionSurgeUsesExpended: hasActionSurge
      ? Math.max(
          0,
          Math.min(
            character.level >= 17 ? 2 : 1,
            Number.isFinite(Number(record.actionSurgeUsesExpended))
              ? Math.floor(Number(record.actionSurgeUsesExpended))
              : 0
          )
        )
      : undefined,
    actionSurgeUsedThisTurn: hasActionSurge ? Boolean(record.actionSurgeUsedThisTurn) : undefined,
    actionSurgeExtraActionsRemainingThisTurn: hasActionSurge
      ? Math.max(
          0,
          Math.min(
            2,
            Number.isFinite(Number(record.actionSurgeExtraActionsRemainingThisTurn))
              ? Math.floor(Number(record.actionSurgeExtraActionsRemainingThisTurn))
              : 0
          )
        )
      : undefined,
    indomitableUsesExpended: hasIndomitable
      ? Math.max(
          0,
          Math.min(
            character.level >= 17 ? 3 : character.level >= 13 ? 2 : 1,
            Number.isFinite(Number(record.indomitableUsesExpended))
              ? Math.floor(Number(record.indomitableUsesExpended))
              : 0
          )
        )
      : undefined,
    weaponMasteries: hasWeaponMastery
      ? normalizeWeaponMasterySelections(
          record.weaponMasteries,
          fighterWeaponMasteryOptions,
          weaponMasteryTotal
        )
      : undefined,
    extraAttacksRemainingThisTurn: hasExtraAttack
      ? Math.max(
          0,
          Math.min(
            additionalAttackCount,
            Number.isFinite(Number(record.extraAttacksRemainingThisTurn))
              ? Math.floor(Number(record.extraAttacksRemainingThisTurn))
              : 0
          )
        )
      : undefined,
    ...normalizeFighterSubclassFeatureState(record, character)
  };
}

export { fighterBanneretKnightlyEnvoySkillOptions };

export function getFighterActionSurgeUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE)) {
    return 0;
  }

  return character.level >= 17 ? 2 : 1;
}

export function getFighterActionSurgeUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getFighterActionSurgeUsesTotal(character);
  const usesExpended =
    normalizeFighterFeatureState(character.classFeatureState?.fighter, character)
      .actionSurgeUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getFighterExtraAttacksRemainingThisTurn(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  if (getFighterAdditionalAttackCount(character) <= 0) {
    return 0;
  }

  return (
    normalizeFighterFeatureState(character.classFeatureState?.fighter, character)
      .extraAttacksRemainingThisTurn ?? 0
  );
}

export function getFighterWeaponAttackMulti(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): boolean {
  return getFighterExtraAttacksRemainingThisTurn(character) > 0;
}

export function getFighterWeaponAttackMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  return (
    (fighterState.extraAttacksRemainingThisTurn ?? 0) +
    (fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0)
  );
}

export function getFighterActionCantripReplacementMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return getFighterEldritchKnightWarMagicMultiCount(character);
}

export function canUseFighterActionCantripReplacement(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "roundTracker"> &
    Partial<Pick<Character, "subclassId">>,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  return canUseFighterEldritchKnightActionCantripReplacement(character, spell);
}

export function consumeFighterActionCantrip(character: Character): Character {
  return consumeFighterEldritchKnightActionCantrip(character);
}

export function getFighterNonMagicActionMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return (
    normalizeFighterFeatureState(character.classFeatureState?.fighter, character)
      .actionSurgeExtraActionsRemainingThisTurn ?? 0
  );
}

export function getFighterSecondWindUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    return 0;
  }

  return getFighterFeatureRow(character.level)?.secondWind ?? 0;
}

export function getFighterSecondWindUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getFighterSecondWindUsesTotal(character);
  const usesExpended =
    normalizeFighterFeatureState(character.classFeatureState?.fighter, character)
      .secondWindUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getFighterSecondWindHealingFormula(
  character: Pick<Character, "className" | "level">
): string {
  return `1d10+${Math.max(1, Math.floor(character.level))}`;
}

export function getFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
) {
  return getFighterBanneretKnightlyEnvoyLanguageSelection(character);
}

export function setFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setFighterBanneretKnightlyEnvoyLanguageSelection>[1]
): Character {
  return setFighterBanneretKnightlyEnvoyLanguageSelection(character, selection);
}

export function getFighterBanneretKnightlyEnvoySkillSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
) {
  return getFighterBanneretKnightlyEnvoySkillSelection(character);
}

export function setFighterBanneretKnightlyEnvoySkillSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setFighterBanneretKnightlyEnvoySkillSelection>[1]
): Character {
  return setFighterBanneretKnightlyEnvoySkillSelection(character, selection);
}

export function getFighterGroupRecoveryUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterBanneretGroupRecoveryUsesTotal(character);
}

export function getFighterGroupRecoveryUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return getFighterBanneretGroupRecoveryUsesRemaining(character);
}

export function getFighterGroupRecoveryHealingFormula(
  character: Pick<Character, "level">
): string {
  return getFighterBanneretGroupRecoveryHealingFormula(character);
}

export function consumeFighterGroupRecoveryUse(character: Character): Character {
  return consumeFighterBanneretGroupRecoveryUse(character);
}

export function applyFighterTeamTacticsStatus(character: Character): Character {
  return applyFighterBanneretTeamTacticsStatus(character);
}

export function getFighterBattleMasterSuperiorityDiceTotalForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterBattleMasterSuperiorityDiceTotal(character);
}

export function getFighterBattleMasterManeuverSelectionCountForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterBattleMasterManeuverSelectionCount(character);
}

export function getFighterBattleMasterManeuverSelectionsForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): string[] {
  return getFighterBattleMasterManeuverSelections(character);
}

export function getFighterBattleMasterSuperiorityDiceRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return getFighterBattleMasterSuperiorityDiceRemaining(character);
}

export function getFighterBattleMasterSuperiorityDieForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): "d8" | "d10" | "d12" | null {
  return getFighterBattleMasterSuperiorityDie(character);
}

export function getFighterPsiWarriorEnergyDiceTotalForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterPsiWarriorEnergyDiceTotal(character);
}

export function getFighterPsiWarriorEnergyDiceRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return getFighterPsiWarriorEnergyDiceRemaining(character);
}

export function getFighterPsiWarriorEnergyDieForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): "d6" | "d8" | "d10" | "d12" | null {
  return getFighterPsiWarriorEnergyDie(character);
}

export function getFighterPsiWarriorProtectiveFieldFormulaForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): string | null {
  return getFighterPsiWarriorProtectiveFieldFormula(character);
}

export function getFighterPsiWarriorPsionicStrikeFormulaForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): string | null {
  return getFighterPsiWarriorPsionicStrikeFormula(character);
}

export function getFighterPsiWarriorPsiPoweredLeapUsesTotalForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterPsiWarriorPsiPoweredLeapUsesTotal(character);
}

export function getFighterPsiWarriorBulwarkOfForceUsesTotalForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterPsiWarriorBulwarkOfForceUsesTotal(character);
}

export function getFighterPsiWarriorPsiPoweredLeapUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return getFighterPsiWarriorPsiPoweredLeapUsesRemaining(character);
}

export function getFighterPsiWarriorBulwarkOfForceUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return getFighterPsiWarriorBulwarkOfForceUsesRemaining(character);
}

export function getFighterPsiWarriorTelekineticMasterUsesTotalForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterPsiWarriorTelekineticMasterUsesTotal(character);
}

export function getFighterPsiWarriorTelekineticMasterUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return getFighterPsiWarriorTelekineticMasterUsesRemaining(character);
}

export function hasFighterPsiWarriorPsionicStrikeAvailableForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): boolean {
  return hasFighterPsiWarriorPsionicStrikeAvailable(character);
}

export function getFighterPsiWarriorTelekineticMovementUsesTotalForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterPsiWarriorTelekineticMovementUsesTotal(character);
}

export function getFighterPsiWarriorTelekineticMovementUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return getFighterPsiWarriorTelekineticMovementUsesRemaining(character);
}

export function expendFighterBattleMasterSuperiorityDieForCharacter(character: Character): Character {
  return expendFighterBattleMasterSuperiorityDie(character);
}

export function restoreFighterBattleMasterSuperiorityDieForCharacter(character: Character): Character {
  return restoreOneFighterBattleMasterSuperiorityDie(character);
}

export function expendFighterPsiWarriorEnergyDieForCharacter(character: Character): Character {
  return expendFighterPsiWarriorEnergyDie(character);
}

export function consumeFighterPsiWarriorPsionicStrikeForCharacter(character: Character): Character {
  return consumeFighterPsiWarriorPsionicStrike(character);
}

export function restoreFighterPsiWarriorEnergyDieForCharacter(character: Character): Character {
  return restoreFighterPsiWarriorEnergyDie(character);
}

export function restoreAllFighterPsiWarriorEnergyDiceForCharacter(character: Character): Character {
  return restoreAllFighterPsiWarriorEnergyDice(character);
}

export function activateFighterPsiWarriorTelekineticMovementForCharacter(
  character: Character
): Character {
  return activateFighterPsiWarriorTelekineticMovement(character);
}

export function activateFighterPsiWarriorPsiPoweredLeapForCharacter(
  character: Character
): Character {
  return activateFighterPsiWarriorPsiPoweredLeap(character);
}

export function activateFighterPsiWarriorBulwarkOfForceForCharacter(
  character: Character
): Character {
  return activateFighterPsiWarriorBulwarkOfForce(character);
}

export function activateFighterPsiWarriorTelekineticMasterSpellCastForCharacter(
  character: Character
): Character {
  return activateFighterPsiWarriorTelekineticMasterSpellCast(character);
}

export function hasFighterPsiWarriorTelekineticMasterBonusAttackAvailableForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState" | "statusEntries">>
): boolean {
  return hasFighterPsiWarriorTelekineticMasterBonusAttackAvailable(character);
}

export function restoreAllFighterBattleMasterSuperiorityDiceForCharacter(
  character: Character
): Character {
  return restoreAllFighterBattleMasterSuperiorityDice(character);
}

export function setFighterBattleMasterManeuverSelectionsForCharacter(
  character: Character,
  selections: string[]
): Character {
  return setFighterBattleMasterManeuverSelections(character, selections);
}

export function getFighterIndomitableUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasFighterFeature(character, CLASS_FEATURE.INDOMITABLE)) {
    return 0;
  }

  if (character.level >= 17) {
    return 3;
  }

  if (character.level >= 13) {
    return 2;
  }

  return 1;
}

export function getFighterIndomitableUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getFighterIndomitableUsesTotal(character);
  const usesExpended =
    normalizeFighterFeatureState(character.classFeatureState?.fighter, character)
      .indomitableUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getFighterFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE)) {
    const totalUses = getFighterActionSurgeUsesTotal(character);
    const usesRemaining = getFighterActionSurgeUsesRemaining(character);
    const fighterState = normalizeFighterFeatureState(
      character.classFeatureState?.fighter,
      character
    );
    const usedThisTurn = fighterState.actionSurgeUsedThisTurn === true;

    actions.push({
      key: fighterActionSurgeActionKey,
      name: "Action Surge",
      summary: "Gain one additional non-Magic action.",
      detail:
        "Use Action Surge to gain one additional non-Magic action this turn. Starting at level 17, you can use it twice before resting, but only once per turn.",
      breakdown: "Extra action this turn",
      description: getFighterFeatureDescription(CLASS_FEATURE.ACTION_SURGE),
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesLabel: `${usesRemaining}/${totalUses} uses`,
      usesRemaining,
      usesTotal: totalUses,
      disabled: usesRemaining <= 0 || usedThisTurn,
      disabledReason:
        usesRemaining <= 0
          ? "No Action Surge uses remaining."
          : usedThisTurn
            ? "Action Surge has already been used this turn."
            : undefined
    });
  }

  if (hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    const totalUses = getFighterSecondWindUsesTotal(character);
    const usesRemaining = getFighterSecondWindUsesRemaining(character);
    const minimumHealing = character.level + 1;
    const maximumHealing = character.level + 10;
    const descriptionAdditions = getFighterSecondWindDescriptionAdditions(character);

    actions.push({
      key: fighterSecondWindActionKey,
      name: "Second Wind",
      sourceFeature: CLASS_FEATURE.SECOND_WIND,
      summary: `${minimumHealing}~${maximumHealing} Heal`,
      detail: "Use a Bonus Action to regain Hit Points equal to 1d10 plus your Fighter level.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      hideUsesTrackerOnCard: true,
      usesLabel: `${usesRemaining}/${totalUses} Second Wind`,
      usesIcon: "wind",
      usesRemaining,
      usesTotal: totalUses,
      descriptionAdditions,
      resources: [createFighterSecondWindResource(usesRemaining, totalUses)],
      drawer: {
        kind: "confirm",
        eyebrow: "Fighter",
        confirmLabel: "Use Second Wind"
      },
      execute: {
        kind: "activate",
        label: "Use Second Wind",
        effectKind: "second-wind"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Second Wind uses remaining." : undefined
    });
  }

  if (hasFighterFeature(character, CLASS_FEATURE.TACTICAL_MIND)) {
    const totalUses = getFighterSecondWindUsesTotal(character);
    const usesRemaining = getFighterSecondWindUsesRemaining(character);

    actions.push({
      key: fighterTacticalMindActionKey,
      name: "Tactical Mind",
      sourceFeature: CLASS_FEATURE.TACTICAL_MIND,
      summary: "Roll 1d10 for an ability check.",
      detail:
        "Use Tactical Mind to expend one Second Wind use and roll 1d10 to add to an ability check.",
      breakdown: "1d10 ability check",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      hideUsesTrackerOnCard: true,
      usesLabel: `${usesRemaining}/${totalUses} Second Wind`,
      usesIcon: "wind",
      usesRemaining,
      usesTotal: totalUses,
      resources: [createFighterSecondWindResource(usesRemaining, totalUses)],
      drawer: {
        kind: "confirm",
        eyebrow: "Fighter",
        confirmLabel: "Use Tactical Mind"
      },
      execute: {
        kind: "activate",
        label: "Use Tactical Mind",
        effectKind: "tactical-mind"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Second Wind uses remaining." : undefined
    });
  }

  if (hasFighterFeature(character, CLASS_FEATURE.INDOMITABLE)) {
    const totalUses = getFighterIndomitableUsesTotal(character);
    const usesRemaining = getFighterIndomitableUsesRemaining(character);

    actions.push({
      key: fighterIndomitableActionKey,
      name: "Indomitable",
      summary: "Roll 1d10 + a saving throw + Fighter level.",
      detail:
        "Choose a saving throw, then reroll it with a bonus equal to 1d10 plus that saving throw and your Fighter level.",
      breakdown: "Boosted save reroll",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesLabel: `${usesRemaining}/${totalUses} uses`,
      usesRemaining,
      usesTotal: totalUses,
      drawer: {
        kind: "custom-form",
        eyebrow: "Fighter",
        formKind: "indomitable"
      },
      execute: {
        kind: "custom-form",
        formKind: "indomitable",
        label: "Roll Saving Throw"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Indomitable uses remaining." : undefined
    });
  }

  return actions;
}

export function consumeFighterSecondWindUse(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const totalUses = getFighterSecondWindUsesTotal(character);
  const usesExpended = fighterState.secondWindUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        secondWindUsesExpended: usesExpended + 1
      }
    }
  };
}

export function consumeFighterIndomitableUse(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.INDOMITABLE)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const totalUses = getFighterIndomitableUsesTotal(character);
  const usesExpended = fighterState.indomitableUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        indomitableUsesExpended: usesExpended + 1
      }
    }
  };
}

export function applyShortRestToFighterFeatures(character: Character): Character {
  if (
    !hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND) &&
    !hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE) &&
    getFighterBattleMasterSuperiorityDiceTotal(character) <= 0 &&
    getFighterPsiWarriorPsiPoweredLeapUsesTotal(character) <= 0 &&
    getFighterPsiWarriorEnergyDiceTotal(character) <= 0 &&
    getFighterPsiWarriorTelekineticMovementUsesTotal(character) <= 0
  ) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const usesExpended = fighterState.secondWindUsesExpended ?? 0;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        secondWindUsesExpended: Math.max(0, usesExpended - 1),
        actionSurgeUsesExpended: 0,
        actionSurgeUsedThisTurn: false,
        actionSurgeExtraActionsRemainingThisTurn: 0,
        battleMasterSuperiorityDiceExpended:
          fighterState.battleMasterSuperiorityDiceExpended !== undefined ? 0 : undefined,
        psiWarriorEnergyDiceExpended:
          fighterState.psiWarriorEnergyDiceExpended !== undefined
            ? Math.max(0, (fighterState.psiWarriorEnergyDiceExpended ?? 0) - 1)
            : undefined,
        psiWarriorPsionicStrikeUsedThisTurn:
          fighterState.psiWarriorPsionicStrikeUsedThisTurn !== undefined ? false : undefined,
        psiWarriorPsiPoweredLeapUsesExpended:
          fighterState.psiWarriorPsiPoweredLeapUsesExpended !== undefined ? 0 : undefined,
        psiWarriorTelekineticMovementUsesExpended:
          fighterState.psiWarriorTelekineticMovementUsesExpended !== undefined ? 0 : undefined,
        psiWarriorTelekineticMasterBonusAttackAvailable:
          fighterState.psiWarriorTelekineticMasterBonusAttackAvailable !== undefined
            ? false
            : undefined,
        banneretGroupRecoveryUsesExpended:
          fighterState.banneretGroupRecoveryUsesExpended !== undefined ? 0 : undefined,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}

export function restoreFighterSecondWindOnShortRest(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const usesExpended = fighterState.secondWindUsesExpended ?? 0;

  if (usesExpended <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        secondWindUsesExpended: Math.max(0, usesExpended - 1)
      }
    }
  };
}

export function restoreFighterActionSurgeOnShortRest(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  if (
    (fighterState.actionSurgeUsesExpended ?? 0) === 0 &&
    fighterState.actionSurgeUsedThisTurn !== true &&
    (fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0) === 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        actionSurgeUsesExpended: 0,
        actionSurgeUsedThisTurn: false,
        actionSurgeExtraActionsRemainingThisTurn: 0
      }
    }
  };
}

export function applyLongRestToFighterFeatures(character: Character): Character {
  if (
    !hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND) &&
    !hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE) &&
    !hasFighterFeature(character, CLASS_FEATURE.INDOMITABLE) &&
    getFighterBattleMasterSuperiorityDiceTotal(character) <= 0 &&
    getFighterPsiWarriorPsiPoweredLeapUsesTotal(character) <= 0 &&
    getFighterPsiWarriorEnergyDiceTotal(character) <= 0 &&
    getFighterPsiWarriorTelekineticMovementUsesTotal(character) <= 0 &&
    getFighterPsiWarriorBulwarkOfForceUsesTotal(character) <= 0 &&
    getFighterPsiWarriorTelekineticMasterUsesTotal(character) <= 0
  ) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        secondWindUsesExpended: 0,
        actionSurgeUsesExpended: 0,
        actionSurgeUsedThisTurn: false,
        actionSurgeExtraActionsRemainingThisTurn: 0,
        indomitableUsesExpended: 0,
        battleMasterSuperiorityDiceExpended:
          fighterState.battleMasterSuperiorityDiceExpended !== undefined ? 0 : undefined,
        psiWarriorEnergyDiceExpended:
          fighterState.psiWarriorEnergyDiceExpended !== undefined ? 0 : undefined,
        psiWarriorPsionicStrikeUsedThisTurn:
          fighterState.psiWarriorPsionicStrikeUsedThisTurn !== undefined ? false : undefined,
        psiWarriorPsiPoweredLeapUsesExpended:
          fighterState.psiWarriorPsiPoweredLeapUsesExpended !== undefined ? 0 : undefined,
        psiWarriorTelekineticMovementUsesExpended:
          fighterState.psiWarriorTelekineticMovementUsesExpended !== undefined ? 0 : undefined,
        psiWarriorBulwarkOfForceUsesExpended:
          fighterState.psiWarriorBulwarkOfForceUsesExpended !== undefined ? 0 : undefined,
        psiWarriorTelekineticMasterUsesExpended:
          fighterState.psiWarriorTelekineticMasterUsesExpended !== undefined ? 0 : undefined,
        psiWarriorTelekineticMasterBonusAttackAvailable:
          fighterState.psiWarriorTelekineticMasterBonusAttackAvailable !== undefined
            ? false
            : undefined,
        banneretGroupRecoveryUsesExpended:
          fighterState.banneretGroupRecoveryUsesExpended !== undefined ? 0 : undefined,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}

export function restoreFighterSecondWindOnLongRest(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  if ((fighterState.secondWindUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        secondWindUsesExpended: 0
      }
    }
  };
}

export function restoreFighterActionSurgeOnLongRest(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  if (
    (fighterState.actionSurgeUsesExpended ?? 0) === 0 &&
    fighterState.actionSurgeUsedThisTurn !== true &&
    (fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0) === 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        actionSurgeUsesExpended: 0,
        actionSurgeUsedThisTurn: false,
        actionSurgeExtraActionsRemainingThisTurn: 0
      }
    }
  };
}

export function restoreFighterIndomitableOnLongRest(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.INDOMITABLE)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  if ((fighterState.indomitableUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        indomitableUsesExpended: 0
      }
    }
  };
}

export function restoreFighterGroupRecoveryOnShortRest(character: Character): Character {
  return restoreFighterBanneretGroupRecoveryOnShortRest(character);
}

export function restoreFighterGroupRecoveryOnLongRest(character: Character): Character {
  return restoreFighterBanneretGroupRecoveryOnLongRest(character);
}

export function restoreFighterBattleMasterSuperiorityDiceOnShortRest(character: Character): Character {
  return restoreFighterBattleMasterSuperiorityDiceOnShortRestInternal(character);
}

export function restoreFighterBattleMasterSuperiorityDiceOnLongRest(character: Character): Character {
  return restoreFighterBattleMasterSuperiorityDiceOnLongRestInternal(character);
}

export function restoreFighterPsiWarriorEnergyDiceOnShortRest(character: Character): Character {
  return restoreFighterPsiWarriorEnergyDiceOnShortRestInternal(character);
}

export function restoreFighterPsiWarriorEnergyDiceOnLongRest(character: Character): Character {
  return restoreFighterPsiWarriorEnergyDiceOnLongRestInternal(character);
}

export function restoreFighterPsiWarriorPsiPoweredLeapOnShortRest(character: Character): Character {
  return restoreFighterPsiWarriorPsiPoweredLeapOnShortRestInternal(character);
}

export function restoreFighterPsiWarriorPsiPoweredLeapOnLongRest(character: Character): Character {
  return restoreFighterPsiWarriorPsiPoweredLeapOnLongRestInternal(character);
}

export function restoreFighterPsiWarriorBulwarkOfForceOnLongRest(character: Character): Character {
  return restoreFighterPsiWarriorBulwarkOfForceOnLongRestInternal(character);
}

export function restoreFighterPsiWarriorTelekineticMasterOnLongRest(
  character: Character
): Character {
  return restoreFighterPsiWarriorTelekineticMasterOnLongRestInternal(character);
}

export function restoreFighterPsiWarriorTelekineticMovementOnShortRest(
  character: Character
): Character {
  return restoreFighterPsiWarriorTelekineticMovementOnShortRestInternal(character);
}

export function restoreFighterPsiWarriorTelekineticMovementOnLongRest(
  character: Character
): Character {
  return restoreFighterPsiWarriorTelekineticMovementOnLongRestInternal(character);
}

export function advanceFighterFeaturesForNewRound(character: Character): Character {
  let nextCharacter = character;
  const hasExtraAttack = getFighterAdditionalAttackCount(character) > 0;
  const hasActionSurge = hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE);

  if (hasExtraAttack || hasActionSurge) {
    const fighterState = normalizeFighterFeatureState(
      character.classFeatureState?.fighter,
      character
    );

    if (
      (fighterState.extraAttacksRemainingThisTurn ?? 0) !== 0 ||
      (fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0) !== 0 ||
      fighterState.actionSurgeUsedThisTurn === true
    ) {
      nextCharacter = {
        ...character,
        classFeatureState: {
          ...character.classFeatureState,
          fighter: {
            ...fighterState,
            actionSurgeUsedThisTurn: false,
            actionSurgeExtraActionsRemainingThisTurn: 0,
            extraAttacksRemainingThisTurn: 0
          }
        }
      };
    }
  }

  return advanceFighterSubclassFeaturesForNewRound(nextCharacter);
}

export function getFighterWeaponMasterySelectionCount(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasFighterFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    return 0;
  }

  return getFighterFeatureRow(character.level)?.weaponMastery ?? 0;
}

export function getFighterWeaponMasteryOptions(): WEAPON_PROFICIENCY[] {
  return fighterWeaponMasteryOptions;
}

export function getFighterWeaponMasterySelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): WEAPON_PROFICIENCY[] {
  return (
    normalizeFighterFeatureState(character.classFeatureState?.fighter, character).weaponMasteries ??
    []
  );
}

export function setFighterWeaponMasterySelections(
  character: Character,
  selections: WEAPON_PROFICIENCY[]
): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        weaponMasteries: normalizeWeaponMasterySelections(
          selections,
          fighterWeaponMasteryOptions,
          getFighterWeaponMasterySelectionCount(character)
        )
      }
    }
  };
}

export function getFighterWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  return getFighterWeaponMasterySelections(character).map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr: weaponMasterySource,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT,
        overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
      }) satisfies WeaponProficiencyEntry
  );
}

export function consumeFighterWeaponAttack(
  character: Character,
  action?: {
    attackKind: "weapon" | "unarmed";
  }
): Character {
  if (character.className !== "Fighter") {
    return isRoundTrackerResourceAvailable(character.roundTracker, "action")
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
        }
      : character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const additionalAttackCount = getFighterAdditionalAttackCount(character);
  const extraAttacksRemaining = fighterState.extraAttacksRemainingThisTurn ?? 0;
  const surgedActionsRemaining = fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");
  const canUseTelekineticMasterBonusAttack =
    action?.attackKind === "weapon" &&
    hasFighterPsiWarriorTelekineticMasterBonusAttackAvailable(character) &&
    isRoundTrackerResourceAvailable(character.roundTracker, "bonusAction");

  if (canUseTelekineticMasterBonusAttack) {
    const nextCharacter = consumeFighterPsiWarriorTelekineticMasterBonusAttack(character);

    return {
      ...nextCharacter,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "bonusAction"),
      classFeatureState: {
        ...nextCharacter.classFeatureState,
        fighter: {
          ...fighterState,
          ...nextCharacter.classFeatureState?.fighter,
          extraAttacksRemainingThisTurn: extraAttacksRemaining + additionalAttackCount
        }
      }
    };
  }

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        fighter: {
          ...fighterState,
          extraAttacksRemainingThisTurn: extraAttacksRemaining + additionalAttackCount
        }
      }
    };
  }

  if (extraAttacksRemaining <= 0) {
    if (surgedActionsRemaining <= 0) {
      return character;
    }

    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        fighter: {
          ...fighterState,
          actionSurgeExtraActionsRemainingThisTurn: surgedActionsRemaining - 1,
          extraAttacksRemainingThisTurn: extraAttacksRemaining + additionalAttackCount
        }
      }
    };
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}

export function consumeFighterNonMagicAction(character: Character): Character {
  if (character.className !== "Fighter") {
    return isRoundTrackerResourceAvailable(character.roundTracker, "action")
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
        }
      : character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const surgedActionsRemaining = fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
    };
  }

  if (surgedActionsRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        actionSurgeExtraActionsRemainingThisTurn: surgedActionsRemaining - 1
      }
    }
  };
}

export function activateFighterActionSurge(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const usesRemaining = getFighterActionSurgeUsesRemaining(character);

  if (usesRemaining <= 0 || fighterState.actionSurgeUsedThisTurn) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        actionSurgeUsesExpended: (fighterState.actionSurgeUsesExpended ?? 0) + 1,
        actionSurgeUsedThisTurn: true,
        actionSurgeExtraActionsRemainingThisTurn:
          (fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0) + 1
      }
    }
  };
}
