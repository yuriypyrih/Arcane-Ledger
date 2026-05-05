import type { Character } from "../../../types";
import {
  getAlwaysPreparedSpellIdsForCharacter,
  getAlwaysSpellbookSpellIdsForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  getBardicInspirationUsesTotalForCharacter,
  getBeguilingMagicUsesRemainingForCharacter,
  getBeguilingMagicUsesTotalForCharacter,
  getBlessingOfMoonlightUsesRemainingForCharacter,
  getBlessingOfMoonlightUsesTotalForCharacter,
  getChannelDivinityUsesRemainingForCharacter,
  getChannelDivinityUsesTotalForCharacter,
  getDruidNaturalRecoveryUsesRemainingForCharacter,
  getDruidStarMapGuidingBoltUsesRemainingForCharacter,
  getDruidStarMapGuidingBoltUsesTotalForCharacter,
  getFeatureActionsForCharacter,
  getFighterPsiWarriorEnergyDiceRemainingForCharacter,
  getFighterPsiWarriorEnergyDiceTotalForCharacter,
  getFighterPsiWarriorTelekineticMasterUsesRemainingForCharacter,
  getFighterPsiWarriorTelekineticMasterUsesTotalForCharacter,
  getRangerFeyReinforcementsUsesRemainingForCharacter,
  getRangerFeyReinforcementsUsesTotalForCharacter,
  getRangerMistyWandererUsesRemainingForCharacter,
  getRangerMistyWandererUsesTotalForCharacter,
  getRitualOnlySpellIdsForCharacter,
  getWarlockStepsOfTheFeyUsesRemainingForCharacter,
  getWarlockStepsOfTheFeyUsesTotalForCharacter,
  getSpellcastingStateForCharacter,
  type FeatureActionCard
} from "../classFeatures";
import type { FeatureSpellcastingState } from "../classFeatures/types";
import { getSorceryPointsRemaining, getSorceryPointsTotal } from "../classFeatures/sorcerer/sorcerer";
import {
  getSorcererSubclassTamedSurgeUsesRemaining,
  getSorcererSubclassTamedSurgeUsesTotal
} from "../classFeatures/sorcerer/subclasses";
import {
  getCantripLimitForCharacter,
  getPreparedSpellLimitForCharacter,
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../spellcasting";
import { measureCharacterRuntime } from "./performance";

export type SpellSlotRuntimeOption = {
  level: number;
  remaining: number;
  total: number;
};

export type CharacterSpellcastingRuntime = {
  spellcastingState: FeatureSpellcastingState;
  featureActions: FeatureActionCard[];
  featureAlwaysPreparedSpellIds: string[];
  featureAlwaysSpellbookSpellIds: string[];
  featureRitualOnlySpellIds: string[];
  cantripLimit: number | null;
  preparedSpellLimit: number | null;
  spellSlotTotals: number[];
  spellSlotsExpended: number[];
  spellSlotsRemaining: number[];
  spellSlotOptions: SpellSlotRuntimeOption[];
  availableSpellSlotOptions: SpellSlotRuntimeOption[];
  highestSpellSlotLevel: number;
  channelDivinityUsesTotal: number;
  channelDivinityUsesRemaining: number;
  bardicInspirationUsesTotal: number;
  bardicInspirationUsesRemaining: number;
  sorceryPointsTotal: number;
  sorceryPointsRemaining: number;
  tamedSurgeUsesTotal: number;
  tamedSurgeUsesRemaining: number;
  beguilingMagicUsesTotal: number;
  beguilingMagicUsesRemaining: number;
  blessingOfMoonlightUsesTotal: number;
  blessingOfMoonlightUsesRemaining: number;
  druidNaturalRecoveryUsesRemaining: number;
  druidStarMapGuidingBoltUsesTotal: number;
  druidStarMapGuidingBoltUsesRemaining: number;
  rangerFeyReinforcementsUsesTotal: number;
  rangerFeyReinforcementsUsesRemaining: number;
  rangerMistyWandererUsesTotal: number;
  rangerMistyWandererUsesRemaining: number;
  warlockStepsOfTheFeyUsesTotal: number;
  warlockStepsOfTheFeyUsesRemaining: number;
  fighterPsiWarriorTelekineticMasterUsesTotal: number;
  fighterPsiWarriorTelekineticMasterUsesRemaining: number;
  fighterPsiWarriorEnergyDiceTotal: number;
  fighterPsiWarriorEnergyDiceRemaining: number;
};

export type SpellcastingRuntimeOptions = {
  includeSubclassSlots?: boolean;
};

const spellcastingRuntimeByCharacter = new WeakMap<
  Character,
  {
    withSubclassSlots?: CharacterSpellcastingRuntime;
    withoutSubclassSlots?: CharacterSpellcastingRuntime;
  }
>();

function getHighestSpellSlotLevel(spellSlotTotals: number[]): number {
  for (let index = spellSlotTotals.length - 1; index >= 0; index -= 1) {
    if ((spellSlotTotals[index] ?? 0) > 0) {
      return index + 1;
    }
  }

  return 0;
}

function createSpellSlotOptions(
  spellSlotTotals: number[],
  spellSlotsRemaining: number[],
  onlyAvailable: boolean
): SpellSlotRuntimeOption[] {
  return spellSlotTotals.flatMap((total, index) => {
    const remaining = spellSlotsRemaining[index] ?? 0;

    if (total <= 0 || (onlyAvailable && remaining <= 0)) {
      return [];
    }

    return [
      {
        level: index + 1,
        remaining,
        total
      }
    ];
  });
}

function createSpellcastingRuntime(
  character: Character,
  options?: SpellcastingRuntimeOptions
): CharacterSpellcastingRuntime {
  const includeSubclassSlots = options?.includeSubclassSlots !== false;
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level,
    includeSubclassSlots ? character.subclassId : undefined
  );
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );

  return {
    spellcastingState: getSpellcastingStateForCharacter(character),
    featureActions: getFeatureActionsForCharacter(character),
    featureAlwaysPreparedSpellIds: getAlwaysPreparedSpellIdsForCharacter(character),
    featureAlwaysSpellbookSpellIds: getAlwaysSpellbookSpellIdsForCharacter(character),
    featureRitualOnlySpellIds: getRitualOnlySpellIdsForCharacter(character),
    cantripLimit: getCantripLimitForCharacter(
      character.className,
      character.level,
      character.classFeatureState,
      character.subclassId
    ),
    preparedSpellLimit: getPreparedSpellLimitForCharacter(
      character.className,
      character.level,
      character.subclassId
    ),
    spellSlotTotals,
    spellSlotsExpended,
    spellSlotsRemaining,
    spellSlotOptions: createSpellSlotOptions(spellSlotTotals, spellSlotsRemaining, false),
    availableSpellSlotOptions: createSpellSlotOptions(spellSlotTotals, spellSlotsRemaining, true),
    highestSpellSlotLevel: getHighestSpellSlotLevel(spellSlotTotals),
    channelDivinityUsesTotal: getChannelDivinityUsesTotalForCharacter(character),
    channelDivinityUsesRemaining: getChannelDivinityUsesRemainingForCharacter(character),
    bardicInspirationUsesTotal: getBardicInspirationUsesTotalForCharacter(character),
    bardicInspirationUsesRemaining: getBardicInspirationUsesRemainingForCharacter(character),
    sorceryPointsTotal: getSorceryPointsTotal(character),
    sorceryPointsRemaining: getSorceryPointsRemaining(character),
    tamedSurgeUsesTotal: getSorcererSubclassTamedSurgeUsesTotal(character),
    tamedSurgeUsesRemaining: getSorcererSubclassTamedSurgeUsesRemaining(character),
    beguilingMagicUsesTotal: getBeguilingMagicUsesTotalForCharacter(character),
    beguilingMagicUsesRemaining: getBeguilingMagicUsesRemainingForCharacter(character),
    blessingOfMoonlightUsesTotal: getBlessingOfMoonlightUsesTotalForCharacter(character),
    blessingOfMoonlightUsesRemaining: getBlessingOfMoonlightUsesRemainingForCharacter(character),
    druidNaturalRecoveryUsesRemaining: getDruidNaturalRecoveryUsesRemainingForCharacter(character),
    druidStarMapGuidingBoltUsesTotal: getDruidStarMapGuidingBoltUsesTotalForCharacter(character),
    druidStarMapGuidingBoltUsesRemaining:
      getDruidStarMapGuidingBoltUsesRemainingForCharacter(character),
    rangerFeyReinforcementsUsesTotal:
      getRangerFeyReinforcementsUsesTotalForCharacter(character),
    rangerFeyReinforcementsUsesRemaining:
      getRangerFeyReinforcementsUsesRemainingForCharacter(character),
    rangerMistyWandererUsesTotal: getRangerMistyWandererUsesTotalForCharacter(character),
    rangerMistyWandererUsesRemaining: getRangerMistyWandererUsesRemainingForCharacter(character),
    warlockStepsOfTheFeyUsesTotal: getWarlockStepsOfTheFeyUsesTotalForCharacter(character),
    warlockStepsOfTheFeyUsesRemaining: getWarlockStepsOfTheFeyUsesRemainingForCharacter(character),
    fighterPsiWarriorTelekineticMasterUsesTotal:
      getFighterPsiWarriorTelekineticMasterUsesTotalForCharacter(character),
    fighterPsiWarriorTelekineticMasterUsesRemaining:
      getFighterPsiWarriorTelekineticMasterUsesRemainingForCharacter(character),
    fighterPsiWarriorEnergyDiceTotal: getFighterPsiWarriorEnergyDiceTotalForCharacter(character),
    fighterPsiWarriorEnergyDiceRemaining:
      getFighterPsiWarriorEnergyDiceRemainingForCharacter(character)
  };
}

export function getSpellcastingRuntimeForCharacter(
  character: Character,
  options?: SpellcastingRuntimeOptions
): CharacterSpellcastingRuntime {
  const includeSubclassSlots = options?.includeSubclassSlots !== false;
  const cacheKey = includeSubclassSlots ? "withSubclassSlots" : "withoutSubclassSlots";
  const cachedEntry = spellcastingRuntimeByCharacter.get(character);
  const cachedRuntime = cachedEntry?.[cacheKey];

  if (cachedRuntime) {
    return cachedRuntime;
  }

  const runtime = measureCharacterRuntime("character-sheet:spellcasting-runtime", () =>
    createSpellcastingRuntime(character, options)
  );

  spellcastingRuntimeByCharacter.set(character, {
    ...cachedEntry,
    [cacheKey]: runtime
  });
  return runtime;
}
