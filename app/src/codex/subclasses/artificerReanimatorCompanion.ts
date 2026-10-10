import type { MonsterRecord } from "../../types";

export const reanimatedCompanionMonsterKey = "artificer-reanimator-reanimated-companion";

type ReanimatedCompanionStats = {
  artificerLevel: number;
  intelligenceModifier: number;
  proficiencyBonus: number;
  spellAttackModifier: number;
  spellSaveDc: number;
};

function signed(value: number): string {
  return value < 0 ? `− ${Math.abs(value)}` : `+ ${value}`;
}

export function createReanimatedCompanionStatBlock({
  artificerLevel,
  intelligenceModifier,
  proficiencyBonus,
  spellAttackModifier,
  spellSaveDc
}: ReanimatedCompanionStats): MonsterRecord {
  return {
    key: reanimatedCompanionMonsterKey,
    name: "Reanimated Companion",
    deprecated: false,
    size: { name: "Small", key: "small" },
    type: { name: "Undead", key: "undead" },
    alignment: "Neutral",
    armor_class: 10 + intelligenceModifier,
    hit_points: 4 + 4 * artificerLevel,
    hit_dice: `${artificerLevel}d6`,
    speed: { walk: 30 },
    ability_scores: {
      strength: 14,
      dexterity: 10,
      constitution: 16,
      intelligence: 4,
      wisdom: 10,
      charisma: 6
    },
    saving_throws_all: {
      strength: 2,
      dexterity: 0,
      constitution: 3,
      intelligence: -3,
      wisdom: 0,
      charisma: -2
    },
    resistances_and_immunities: {
      damage_resistances_display: "Necrotic, Poison",
      damage_immunities_display: "Lightning",
      condition_immunities_display: "Charmed, Exhaustion, Poisoned"
    },
    blindsight_range: 60,
    passive_perception: 10,
    languages: { as_string: "Understands the languages you know" },
    challenge_rating: "None",
    experience_points: 0,
    proficiency_bonus: proficiencyBonus,
    traits: [
      ...(artificerLevel >= 9
        ? [
            {
              name: "Improved Reanimation",
              desc: "The companion's Necrotic damage ignores Resistance."
            }
          ]
        : []),
      {
        name: "Death Burst",
        desc: `The companion explodes when it dies. Dexterity Saving Throw: DC ${spellSaveDc}, each creature in a 10-foot Emanation originating from the companion. Failure: ${artificerLevel >= 9 ? "4d4" : "2d6"} Necrotic damage.`
      },
      {
        name: "Lightning Absorption",
        desc: "Whenever the companion is subjected to Lightning damage, it regains a number of Hit Points equal to the Lightning damage dealt."
      }
    ],
    actions: [
      {
        name: "Dreadful Swipe",
        action_type: "ACTION",
        desc: `Melee Attack Roll: ${spellAttackModifier >= 0 ? "+" : ""}${spellAttackModifier}, reach 5 ft. Hit: 1d4 ${signed(2 + intelligenceModifier)} Necrotic damage, and the target can’t take Opportunity Attacks until the start of its next turn.`
      }
    ],
    document: { key: "arcane-ledger", name: "Reanimator" }
  };
}
