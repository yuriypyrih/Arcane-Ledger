import type { AbilitySavingThrowCard } from "../CharactersPage/CharacterSheetPage/StatsForm/AbilitySavingThrowCards";
import type { AbilityKey, MonsterRecord } from "../../types";
import { formatMonsterFeatureStat } from "./monsterEntryFormatting";

type MonsterAbilityCardConfig = {
  ability: AbilityKey;
  getScore: (monster: MonsterRecord) => number;
  getSave: (monster: MonsterRecord) => number | null;
};

const monsterAbilityCardConfigs: MonsterAbilityCardConfig[] = [
  {
    ability: "STR",
    getScore: (monster) => monster.strength,
    getSave: (monster) => monster.strength_save
  },
  {
    ability: "DEX",
    getScore: (monster) => monster.dexterity,
    getSave: (monster) => monster.dexterity_save
  },
  {
    ability: "CON",
    getScore: (monster) => monster.constitution,
    getSave: (monster) => monster.constitution_save
  },
  {
    ability: "INT",
    getScore: (monster) => monster.intelligence,
    getSave: (monster) => monster.intelligence_save
  },
  {
    ability: "WIS",
    getScore: (monster) => monster.wisdom,
    getSave: (monster) => monster.wisdom_save
  },
  {
    ability: "CHA",
    getScore: (monster) => monster.charisma,
    getSave: (monster) => monster.charisma_save
  }
];

function getAbilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export function buildMonsterAbilitySavingThrowCards(
  monster: MonsterRecord
): AbilitySavingThrowCard[] {
  return monsterAbilityCardConfigs.map(({ ability, getScore, getSave }) => {
    const score = getScore(monster);
    const modifierValue = getAbilityModifier(score);
    const listedSavingThrow = getSave(monster);
    const hasListedSavingThrow = listedSavingThrow !== null && listedSavingThrow !== undefined;
    const totalSavingThrowValue = hasListedSavingThrow ? listedSavingThrow : modifierValue;
    const listedSaveBonus = totalSavingThrowValue - modifierValue;

    return {
      ability,
      score,
      modifier: formatMonsterFeatureStat(modifierValue),
      modifierBaseValue: modifierValue,
      modifierValue,
      modifierBonusEntries: [],
      isSavingThrowProficient: hasListedSavingThrow,
      proficiencyContribution: hasListedSavingThrow ? listedSaveBonus : 0,
      proficiencyLabel: hasListedSavingThrow ? "Listed save bonus" : undefined,
      savingThrowBonusEntries:
        hasListedSavingThrow && listedSaveBonus !== 0
          ? [
              {
                label: "Stat block save bonus",
                value: listedSaveBonus
              }
            ]
          : [],
      totalSavingThrowValue,
      totalSavingThrow: formatMonsterFeatureStat(totalSavingThrowValue),
      modifierIndicators: [],
      modifierRollState: null,
      savingThrowIndicators: [],
      savingThrowRollState: null
    };
  });
}
