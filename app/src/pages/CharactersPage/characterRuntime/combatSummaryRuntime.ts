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
import {
  getStatusRuntimeForCharacter,
  type CharacterStatusRuntime
} from "./statusRuntime";
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

class CharacterCombatSummaryRuntimeSnapshot implements CharacterCombatSummaryRuntime {
  private coreStatsSnapshot: CharacterCombatSummaryCoreStats | null = null;
  private abilitiesSnapshot: CharacterCombatSummaryAbilities | null = null;
  private skillsSnapshot: CharacterCombatSummarySkills | null = null;
  private hitPointsSnapshot: CharacterCombatSummaryHitPoints | null = null;
  private actionsSnapshot: CharacterCombatSummaryActions | null = null;
  private defensesSnapshot: CharacterCombatSummaryDefenses | null = null;
  private resourcesSnapshot: CharacterCombatSummaryResources | null = null;
  private statusRuntimeSnapshot: CharacterStatusRuntime | null = null;
  private spellcastingRuntimeSnapshot: CharacterSpellcastingRuntime | null = null;

  constructor(private readonly character: Character) {}

  private get statusRuntime(): CharacterStatusRuntime {
    if (!this.statusRuntimeSnapshot) {
      this.statusRuntimeSnapshot = getStatusRuntimeForCharacter(this.character);
    }

    return this.statusRuntimeSnapshot;
  }

  private get spellcastingRuntime(): CharacterSpellcastingRuntime {
    if (!this.spellcastingRuntimeSnapshot) {
      this.spellcastingRuntimeSnapshot = getSpellcastingRuntimeForCharacter(this.character);
    }

    return this.spellcastingRuntimeSnapshot;
  }

  get coreStats(): CharacterCombatSummaryCoreStats {
    if (!this.coreStatsSnapshot) {
      this.coreStatsSnapshot = measureCharacterRuntime(
        "character-sheet:combat-summary-core-stats",
        () => createCombatSummaryCoreStats(this.character)
      );
    }

    return this.coreStatsSnapshot;
  }

  get abilities(): CharacterCombatSummaryAbilities {
    if (!this.abilitiesSnapshot) {
      this.abilitiesSnapshot = measureCharacterRuntime(
        "character-sheet:combat-summary-abilities",
        () => createCombatSummaryAbilities(this.character)
      );
    }

    return this.abilitiesSnapshot;
  }

  get skills(): CharacterCombatSummarySkills {
    if (!this.skillsSnapshot) {
      this.skillsSnapshot = measureCharacterRuntime(
        "character-sheet:combat-summary-skills",
        () => createCombatSummarySkills(this.character)
      );
    }

    return this.skillsSnapshot;
  }

  get hitPoints(): CharacterCombatSummaryHitPoints {
    if (!this.hitPointsSnapshot) {
      this.hitPointsSnapshot = measureCharacterRuntime(
        "character-sheet:combat-summary-hit-points",
        () => createCombatSummaryHitPoints(this.character)
      );
    }

    return this.hitPointsSnapshot;
  }

  get actions(): CharacterCombatSummaryActions {
    if (!this.actionsSnapshot) {
      this.actionsSnapshot = measureCharacterRuntime(
        "character-sheet:combat-summary-actions",
        () => createCombatSummaryActions(this.character)
      );
    }

    return this.actionsSnapshot;
  }

  get defenses(): CharacterCombatSummaryDefenses {
    if (!this.defensesSnapshot) {
      this.defensesSnapshot = measureCharacterRuntime(
        "character-sheet:combat-summary-defenses",
        () => createCombatSummaryDefenses(this.statusRuntime)
      );
    }

    return this.defensesSnapshot;
  }

  get resources(): CharacterCombatSummaryResources {
    if (!this.resourcesSnapshot) {
      this.resourcesSnapshot = measureCharacterRuntime(
        "character-sheet:combat-summary-resources",
        () => ({
          spellcasting: this.spellcastingRuntime
        })
      );
    }

    return this.resourcesSnapshot;
  }
}

export function getCombatSummaryRuntimeForCharacter(
  character: Character
): CharacterCombatSummaryRuntime {
  const cachedRuntime = combatSummaryRuntimeByCharacter.get(character);

  if (cachedRuntime) {
    return cachedRuntime;
  }

  const runtime = new CharacterCombatSummaryRuntimeSnapshot(character);

  combatSummaryRuntimeByCharacter.set(character, runtime);
  return runtime;
}
