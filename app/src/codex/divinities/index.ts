import { ACTION_TYPE, CLASS_FEATURE, DAMAGE_TYPE, DICE } from "../entries/enums";
import type { DivinityEntry, DivinityValue } from "../entries/types";

const divineSparkBaseValue: DivinityValue = {
  amounts: [DICE.D8],
  damageTypes: [DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.RADIANT]
};

export const divineSpark: DivinityEntry = {
  id: "divinity-divine-spark",
  name: "Divine Spark",
  sourceFeature: CLASS_FEATURE.CHANNEL_DIVINITY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  duration: "Instantaneous",
  description: [
    "You point your Holy Symbol at another creature you can see within 30 feet of yourself and focus divine energy at it.",
    "Roll <strong>1d8</strong> and add your Wisdom modifier. You either restore Hit Points to the creature equal to that total or force the creature to make a Constitution saving throw.",
    "On a failed save, the target takes Necrotic or Radiant damage equal to that total (your choice). On a successful save, the target takes half as much damage.",
    "You roll an additional d8 when you reach Cleric levels 7 (<strong>2d8</strong>), 13 (<strong>3d8</strong>), and 18 (<strong>4d8</strong>)."
  ],
  isHealingSpell: true,
  damage: divineSparkBaseValue,
  healing: {
    amounts: [DICE.D8]
  },
  scaling: [
    {
      level: 7,
      damage: {
        amounts: [DICE.D8, DICE.D8],
        damageTypes: [DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.RADIANT]
      },
      healing: {
        amounts: [DICE.D8, DICE.D8]
      }
    },
    {
      level: 13,
      damage: {
        amounts: [DICE.D8, DICE.D8, DICE.D8],
        damageTypes: [DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.RADIANT]
      },
      healing: {
        amounts: [DICE.D8, DICE.D8, DICE.D8]
      }
    },
    {
      level: 18,
      damage: {
        amounts: [DICE.D8, DICE.D8, DICE.D8, DICE.D8],
        damageTypes: [DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.RADIANT]
      },
      healing: {
        amounts: [DICE.D8, DICE.D8, DICE.D8, DICE.D8]
      }
    }
  ]
};

export const turnUndead: DivinityEntry = {
  id: "divinity-turn-undead",
  name: "Turn Undead",
  sourceFeature: CLASS_FEATURE.CHANNEL_DIVINITY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  duration: "1 minute",
  description: [
    "You present your Holy Symbol and censure Undead creatures.",
    "Each Undead of your choice within 30 feet of you must make a Wisdom saving throw.",
    "If the creature fails its save, it has the Frightened and Incapacitated conditions for 1 minute.",
    "For that duration, it tries to move as far from you as it can on its turns. This effect ends early on the creature if it takes any damage, if you have the Incapacitated condition, or if you die."
  ]
};

export const divineSense: DivinityEntry = {
  id: "divinity-divine-sense",
  name: "Divine Sense",
  sourceFeature: CLASS_FEATURE.CHANNEL_DIVINITY,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self (60-foot radius)",
  duration: "10 minutes",
  description: [
    "You open your awareness to detect Celestials, Fiends, and Undead.",
    "For the duration or until you have the Incapacitated condition, you know the location of any creature of those types within 60 feet of yourself, and you know its creature type.",
    "Within the same radius, you also detect the presence of any place or object that has been consecrated or desecrated, as with the Hallow spell."
  ]
};

export const divinityEntries: DivinityEntry[] = [divineSpark, turnUndead, divineSense];

const divinityEntriesById = new Map(divinityEntries.map((entry) => [entry.id, entry]));
const divinityEntriesByName = new Map(
  divinityEntries.map((entry) => [entry.name.toLowerCase(), entry])
);

export function getDivinityEntryById(id: string): DivinityEntry | null {
  return divinityEntriesById.get(id) ?? null;
}

export function getDivinityEntryByName(name: string): DivinityEntry | null {
  return divinityEntriesByName.get(name.trim().toLowerCase()) ?? null;
}

export function getResolvedDivinityValue(
  entry: DivinityEntry,
  kind: "damage" | "healing",
  level: number
): DivinityValue | null {
  let resolved = kind === "damage" ? entry.damage : entry.healing;

  (entry.scaling ?? [])
    .filter((scalingEntry) => scalingEntry.level <= level)
    .sort((left, right) => left.level - right.level)
    .forEach((scalingEntry) => {
      const nextValue = kind === "damage" ? scalingEntry.damage : scalingEntry.healing;

      if (nextValue) {
        resolved = nextValue;
      }
    });

  return resolved ?? null;
}

export function getDivinityEntriesForSourceFeature(feature: CLASS_FEATURE): DivinityEntry[] {
  return divinityEntries.filter((entry) => entry.sourceFeature === feature);
}
