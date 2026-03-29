import type {
  AbilityKey,
  AbilityScores,
  Alignment,
  CharacterCurrencies,
  CharacterDraft,
  CoreStats
} from "../../types";
import { loadPreferences } from "../../storage/preferences";
import { createDefaultRoundTracker } from "./combat";

export const abilityKeys: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

export const speciesOptions = [
  "Dragonborn",
  "Dwarf",
  "Elf",
  "Gnome",
  "Half-Elf",
  "Half-Orc",
  "Halfling",
  "Human",
  "Tiefling"
];

export const alignmentGrid: Alignment[][] = [
  ["Lawful Good", "Neutral Good", "Chaotic Good"],
  ["Lawful Neutral", "True Neutral", "Chaotic Neutral"],
  ["Lawful Evil", "Neutral Evil", "Chaotic Evil"]
];
export const alignmentOptions = alignmentGrid.flat();

export const POINT_BUY_BUDGET = 27;

export const CHARACTERS_STORAGE_KEY = "dnd-companion.characters";

const pointBuyCostByScore: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9
};

export function createDefaultAbilities(): AbilityScores {
  return {
    STR: 8,
    DEX: 8,
    CON: 8,
    INT: 8,
    WIS: 8,
    CHA: 8
  };
}

export function createDefaultCoreStats(): CoreStats {
  return {
    armorClass: "16",
    initiative: "+2",
    speed: "30 ft",
    passivePerception: "12",
    proficiencyBonus: "+2",
    hitDice: "1d8"
  };
}

export function createDefaultCurrencies(): CharacterCurrencies {
  return {
    copper: 0,
    silver: 0,
    electrum: 0,
    gold: 0,
    platinum: 0
  };
}

export function createEmptyCharacter(): CharacterDraft {
  const preferences = loadPreferences();

  return {
    name: "",
    species: "",
    className: "",
    subclassId: "",
    level: 1,
    xp: 0,
    hitPoints: 8,
    currentHitPoints: 8,
    temporaryHitPoints: 0,
    maxHitPointsMode: preferences.defaultMaxHitPointsMode,
    hitDiceRemaining: 1,
    attributeMode: "custom",
    abilities: createDefaultAbilities(),
    alignment: "True Neutral",
    background: "",
    backgroundNotes: "",
    currencies: createDefaultCurrencies(),
    skills: [],
    skillExpertise: [],
    toolProficiencies: [],
    savingThrowProficiencies: [],
    roundTracker: createDefaultRoundTracker(),
    statusEntries: [],
    deathSaves: {
      successes: 0,
      failures: 0
    },
    equipment: [],
    customEquipment: [],
    spellbookSpellIds: [],
    preparedSpellIds: [],
    spellSlotsExpended: Array.from({ length: 9 }, () => 0),
    shortRestsUsedToday: 0,
    coreStats: createDefaultCoreStats(),
    classFeatureState: {},
    feats: []
  };
}

export function cloneAbilities(abilities: AbilityScores): AbilityScores {
  return abilityKeys.reduce((next, ability) => {
    next[ability] = abilities[ability];
    return next;
  }, {} as AbilityScores);
}

export function getPointBuyCost(score: number): number {
  const clampedScore = Math.max(8, Math.min(15, score));
  return pointBuyCostByScore[clampedScore];
}

export function getPointBuySpent(abilities: AbilityScores): number {
  return abilityKeys.reduce((total, ability) => total + getPointBuyCost(abilities[ability]), 0);
}

export function getPointBuyRemaining(abilities: AbilityScores): number {
  return POINT_BUY_BUDGET - getPointBuySpent(abilities);
}

export function getAffordablePointBuyMax(
  targetAbility: AbilityKey,
  abilities: AbilityScores
): number {
  const spentByOtherAbilities = abilityKeys.reduce((total, ability) => {
    if (ability === targetAbility) {
      return total;
    }

    return total + getPointBuyCost(abilities[ability]);
  }, 0);

  const affordableBudget = POINT_BUY_BUDGET - spentByOtherAbilities;
  let maxScore = 8;

  for (let score = 8; score <= 15; score += 1) {
    if (getPointBuyCost(score) <= affordableBudget) {
      maxScore = score;
    }
  }

  return maxScore;
}

export function normalizePointBuyAbilities(abilities: AbilityScores): AbilityScores {
  const normalized = abilityKeys.reduce((next, ability) => {
    next[ability] = Math.max(8, Math.min(15, abilities[ability]));
    return next;
  }, {} as AbilityScores);

  while (getPointBuySpent(normalized) > POINT_BUY_BUDGET) {
    const abilityToLower = [...abilityKeys]
      .sort((left, right) => normalized[right] - normalized[left])
      .find((ability) => normalized[ability] > 8);

    if (!abilityToLower) {
      break;
    }

    normalized[abilityToLower] -= 1;
  }

  return normalized;
}
