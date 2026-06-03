import type { Character } from "../../../types";
import {
  getBarbarianRageDamageBonusForCharacter,
  getBardicInspirationDieForCharacter,
  getFighterBattleMasterSuperiorityDiceRemainingForCharacter,
  getFighterBattleMasterSuperiorityDiceTotalForCharacter,
  getFighterBattleMasterSuperiorityDieForCharacter,
  getFighterPsiWarriorEnergyDiceRemainingForCharacter,
  getFighterPsiWarriorEnergyDiceTotalForCharacter,
  getFighterPsiWarriorEnergyDieForCharacter,
  getMonkMartialArtsDieForCharacter,
  getRogueSneakAttackDiceCountForCharacter,
  getRogueSneakAttackFormulaForCharacter,
  getRogueSoulknifePsionicDiceRemainingForCharacter,
  getRogueSoulknifePsionicDiceTotalForCharacter,
  getRogueSoulknifePsionicDieForCharacter
} from "../classFeatures";
import { formatAbilityModifier } from "../gameplay";
import type { CombatSummaryCoreStatCard } from "./combatSummaryCoreStats";

function formatDieValue(die: string | null): string | null {
  return die ? String(die).toLowerCase() : null;
}

export function createAdditionalCoreStatCards(
  character: Character
): CombatSummaryCoreStatCard[] {
  const barbarianRageDamageBonus = getBarbarianRageDamageBonusForCharacter(character);
  const monkMartialArtsDie = getMonkMartialArtsDieForCharacter(character);
  const bardicInspirationDie = getBardicInspirationDieForCharacter(character);
  const fighterBattleMasterSuperiorityDie =
    getFighterBattleMasterSuperiorityDieForCharacter(character);
  const fighterBattleMasterSuperiorityDiceTotal =
    getFighterBattleMasterSuperiorityDiceTotalForCharacter(character);
  const fighterBattleMasterSuperiorityDiceRemaining =
    getFighterBattleMasterSuperiorityDiceRemainingForCharacter(character);
  const fighterPsiWarriorEnergyDie = getFighterPsiWarriorEnergyDieForCharacter(character);
  const fighterPsiWarriorEnergyDiceTotal =
    getFighterPsiWarriorEnergyDiceTotalForCharacter(character);
  const fighterPsiWarriorEnergyDiceRemaining =
    getFighterPsiWarriorEnergyDiceRemainingForCharacter(character);
  const rogueSoulknifePsionicDie = getRogueSoulknifePsionicDieForCharacter(character);
  const rogueSoulknifePsionicDiceTotal = getRogueSoulknifePsionicDiceTotalForCharacter(character);
  const rogueSoulknifePsionicDiceRemaining =
    getRogueSoulknifePsionicDiceRemainingForCharacter(character);
  const rogueSneakAttackDiceCount = getRogueSneakAttackDiceCountForCharacter(character);
  const rogueSneakAttackFormula = getRogueSneakAttackFormulaForCharacter(character);
  const cards: CombatSummaryCoreStatCard[] = [];

  if (barbarianRageDamageBonus > 0) {
    cards.push({
      key: "barbarian-rage-damage",
      label: "Rage Damage",
      value: formatAbilityModifier(barbarianRageDamageBonus),
      summaryText:
        "Your current Rage Damage bonus. While Rage is active, Strength-based weapon and Unarmed Strike damage rolls gain this bonus. Rage Damage progresses from +2 at levels 1-8 to +3 at levels 9-15 and +4 at levels 16-20.",
      detailCards: [
        {
          label: "Current Bonus",
          value: formatAbilityModifier(barbarianRageDamageBonus)
        }
      ]
    });
  }

  if (monkMartialArtsDie) {
    cards.push({
      key: "martial-arts-die",
      label: "Martial Arts Die",
      value: formatDieValue(monkMartialArtsDie) ?? "-",
      summaryText:
        "Your current Martial Arts die. When Martial Arts applies, your Unarmed Strike and Monk weapons can use this die in place of their normal damage die if it is higher.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(monkMartialArtsDie) ?? "-"
        },
        {
          label: "Progression",
          value: "d6 at 1, d8 at 5, d10 at 11, d12 at 17"
        }
      ]
    });
  }

  if (bardicInspirationDie) {
    cards.push({
      key: "bardic-inspiration-die",
      label: "Bardic Die",
      value: formatDieValue(bardicInspirationDie) ?? "-",
      summaryText:
        "Your current Bardic Inspiration die. Creatures inspired by you roll this die when they spend a Bardic Inspiration use.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(bardicInspirationDie) ?? "-"
        },
        {
          label: "Progression",
          value: "d6 at 1, d8 at 5, d10 at 10, d12 at 15"
        }
      ]
    });
  }

  if (fighterBattleMasterSuperiorityDie && fighterBattleMasterSuperiorityDiceTotal > 0) {
    cards.push({
      key: "fighter-battle-master-superiority-dice",
      label: "Superiority Dice",
      value: formatDieValue(fighterBattleMasterSuperiorityDie) ?? "-",
      summaryText:
        "Your current Battle Master Superiority Dice pool. Maneuvers expend these dice, and you regain all expended Superiority Dice when you finish a Short Rest or Long Rest.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(fighterBattleMasterSuperiorityDie) ?? "-"
        },
        {
          label: "Current Dice",
          value: `${fighterBattleMasterSuperiorityDiceRemaining}/${fighterBattleMasterSuperiorityDiceTotal}`
        },
        {
          label: "Recovery",
          value: "Restore all expended dice on Short Rest or Long Rest"
        },
        {
          label: "Progression",
          value: "4 dice at 3, 5 dice at 7, 6 dice at 15 | d8 at 3, d10 at 10, d12 at 18"
        }
      ]
    });
  }

  if (fighterPsiWarriorEnergyDie && fighterPsiWarriorEnergyDiceTotal > 0) {
    cards.push({
      key: "fighter-psi-warrior-energy-dice",
      label: "Psi Energy Dice",
      value: formatDieValue(fighterPsiWarriorEnergyDie) ?? "-",
      summaryText:
        "Your current Psi Warrior Energy Die. Psionic powers expend these dice, and you regain one expended die on a Short Rest and all expended dice on a Long Rest.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(fighterPsiWarriorEnergyDie) ?? "-"
        },
        {
          label: "Current Dice",
          value: `${fighterPsiWarriorEnergyDiceRemaining}/${fighterPsiWarriorEnergyDiceTotal}`
        },
        {
          label: "Recovery",
          value: "Restore 1 die on Short Rest | Restore all dice on Long Rest"
        },
        {
          label: "Progression",
          value: "4d6 at 3, 6d8 at 5, 8d8 at 9, 8d10 at 11, 10d10 at 13, 12d12 at 17"
        }
      ]
    });
  }

  if (rogueSoulknifePsionicDie && rogueSoulknifePsionicDiceTotal > 0) {
    cards.push({
      key: "rogue-soulknife-psionic-die",
      label: "Psionic Die",
      value: formatDieValue(rogueSoulknifePsionicDie) ?? "-",
      summaryText:
        "Your current Soulknife Psionic Die. Soulknife powers spend this pool, and you regain one expended die on a Short Rest and all expended dice on a Long Rest.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(rogueSoulknifePsionicDie) ?? "-"
        },
        {
          label: "Current Dice",
          value: `${rogueSoulknifePsionicDiceRemaining}/${rogueSoulknifePsionicDiceTotal}`
        },
        {
          label: "Recovery",
          value: "Restore 1 die on Short Rest | Restore all dice on Long Rest"
        },
        {
          label: "Progression",
          value: "4d6 at 3, 6d8 at 5, 8d8 at 9, 8d10 at 11, 10d10 at 13, 12d12 at 17"
        }
      ]
    });
  }

  if (rogueSneakAttackDiceCount > 0 && rogueSneakAttackFormula) {
    cards.push({
      key: "rogue-sneak-attack",
      label: "Sneak Attack",
      value: rogueSneakAttackFormula,
      summaryText:
        "Your current Sneak Attack damage. You can apply it once per turn after a hit when Sneak Attack's requirements are met.",
      detailCards: [
        {
          label: "Current Dice",
          value: rogueSneakAttackFormula
        },
        {
          label: "Progression",
          value:
            "1d6 at 1, 2d6 at 3, 3d6 at 5, 4d6 at 7, 5d6 at 9, 6d6 at 11, 7d6 at 13, 8d6 at 15, 9d6 at 17, 10d6 at 19"
        }
      ]
    });
  }

  return cards;
}
