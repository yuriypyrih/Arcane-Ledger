import type { Character } from "../../../types";
import {
  createCombatSummaryAbilities,
  type CharacterCombatSummaryAbilities
} from "./combatSummaryAbilities";
import {
  createCombatSummaryActions,
  type CharacterCombatSummaryActions
} from "./combatSummaryActions";
import {
  createCombatSummaryCoreStats,
  type CharacterCombatSummaryCoreStats
} from "./combatSummaryCoreStats";
import {
  createCombatSummaryDefenses,
  type CharacterCombatSummaryDefenses
} from "./combatSummaryDefenses";
import {
  createCombatSummaryHitPoints,
  type CharacterCombatSummaryHitPoints
} from "./combatSummaryHitPoints";
import {
  createCombatSummarySkills,
  type CharacterCombatSummarySkills
} from "./combatSummarySkills";
import {
  getSpellcastingRuntimeForCharacter,
  type CharacterSpellcastingRuntime
} from "./spellcastingRuntime";
import { getStatusRuntimeForCharacter } from "./statusRuntime";
import { measureCharacterRuntime } from "./performance";

export type CharacterCombatSummaryResources = {
  spellcasting: CharacterSpellcastingRuntime;
};

export type CharacterCombatSummaryRuntime = {
  coreStats: CharacterCombatSummaryCoreStats;
  abilities: CharacterCombatSummaryAbilities;
  skills: CharacterCombatSummarySkills;
  hitPoints: CharacterCombatSummaryHitPoints;
  actions: CharacterCombatSummaryActions;
  defenses: CharacterCombatSummaryDefenses;
  resources: CharacterCombatSummaryResources;
};

const combatSummaryRuntimeByCharacter = new WeakMap<Character, CharacterCombatSummaryRuntime>();

function createCombatSummaryRuntime(character: Character): CharacterCombatSummaryRuntime {
  const statusRuntime = getStatusRuntimeForCharacter(character);
  const spellcastingRuntime = getSpellcastingRuntimeForCharacter(character);

  return {
    coreStats: createCombatSummaryCoreStats(character),
    abilities: createCombatSummaryAbilities(character),
    skills: createCombatSummarySkills(character),
    hitPoints: createCombatSummaryHitPoints(character),
    actions: createCombatSummaryActions(character),
    defenses: createCombatSummaryDefenses(statusRuntime),
    resources: {
      spellcasting: spellcastingRuntime
    }
  };
}

export function getCombatSummaryRuntimeForCharacter(
  character: Character
): CharacterCombatSummaryRuntime {
  const cachedRuntime = combatSummaryRuntimeByCharacter.get(character);

  if (cachedRuntime) {
    return cachedRuntime;
  }

  const runtime = measureCharacterRuntime("character-sheet:combat-summary-runtime", () =>
    createCombatSummaryRuntime(character)
  );

  combatSummaryRuntimeByCharacter.set(character, runtime);
  return runtime;
}
