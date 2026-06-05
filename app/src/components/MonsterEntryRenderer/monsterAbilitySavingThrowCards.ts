import type { AbilitySavingThrowCard } from "../CharactersPage/CharacterSheetPage/StatsForm/AbilitySavingThrowCards";
import type { AbilityKey, MonsterAbilityKey, MonsterRecord } from "../../types";
import { monsterAbilityKeys } from "../../utils/monsters";
import { formatMonsterFeatureStat } from "./monsterEntryFormatting";

const abilityLabelByMonsterAbility: Record<MonsterAbilityKey, AbilityKey> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA"
};

function getAbilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

function getMonsterMapNumber(
  map: Record<string, number | null | undefined> | null | undefined,
  key: MonsterAbilityKey
) {
  const value = map?.[key];

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function buildMonsterAbilitySavingThrowCards(
  monster: MonsterRecord
): AbilitySavingThrowCard[] {
  return monsterAbilityKeys.map((monsterAbility) => {
    const score = getMonsterMapNumber(monster.ability_scores, monsterAbility) ?? 10;
    const modifierValue =
      getMonsterMapNumber(monster.modifiers, monsterAbility) ?? getAbilityModifier(score);
    const listedSavingThrow = getMonsterMapNumber(monster.saving_throws, monsterAbility);
    const totalSavingThrowValue =
      getMonsterMapNumber(monster.saving_throws_all, monsterAbility) ??
      listedSavingThrow ??
      modifierValue;
    const hasListedSavingThrow = listedSavingThrow !== null;
    const listedSaveBonus = totalSavingThrowValue - modifierValue;

    return {
      ability: abilityLabelByMonsterAbility[monsterAbility],
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
