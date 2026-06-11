import { ACTION_TYPE, CLASS_FEATURE, DAMAGE_TYPE, DICE } from "../entries/enums";
import type { DivinityEntry, DivinityValue } from "../entries/types";
import {
  invokeDuplicityDescription,
  preserveLifeDescription,
  radianceOfTheDawnDescription
} from "../subclasses/cleric";

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

export const mindMagic: DivinityEntry = {
  id: "divinity-mind-magic",
  name: "Mind Magic",
  sourceFeature: CLASS_FEATURE.MIND_MAGIC,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  duration: "Instantaneous",
  description: [
    "As a Magic action, you can expend one use of your Channel Divinity to manifest your magical knowledge.",
    "Choose one spell from the Divination school on the Knowledge Domain Spells table that you have prepared.",
    "As part of that action, you cast that spell without expending a spell slot or needing Material components."
  ]
};

export const preserveLife: DivinityEntry = {
  id: "divinity-preserve-life",
  name: "Preserve Life",
  sourceFeature: CLASS_FEATURE.PRESERVE_LIFE,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  duration: "Instantaneous",
  description: [...preserveLifeDescription],
  isHealingSpell: true
};

export const radianceOfTheDawn: DivinityEntry = {
  id: "divinity-radiance-of-the-dawn",
  name: "Radiance of the Dawn",
  sourceFeature: CLASS_FEATURE.RADIANCE_OF_THE_DAWN,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot Emanation)",
  duration: "Instantaneous",
  description: [...radianceOfTheDawnDescription]
};

export const invokeDuplicity: DivinityEntry = {
  id: "divinity-invoke-duplicity",
  name: "Invoke Duplicity",
  sourceFeature: CLASS_FEATURE.INVOKE_DUPLICITY,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "30 feet",
  duration: "1 minute",
  description: [...invokeDuplicityDescription]
};

export const guidedStrike: DivinityEntry = {
  id: "divinity-guided-strike",
  name: "Guided Strike",
  sourceFeature: CLASS_FEATURE.GUIDED_STRIKE,
  castingTime: [ACTION_TYPE.REACTION],
  range: "30 feet",
  duration: "Instantaneous",
  description: [
    "When you or a creature within 30 feet of you misses with an attack roll, you can expend one use of your Channel Divinity and give that roll a +10 bonus, potentially causing it to hit.",
    "When you use this feature to benefit another creature's attack roll, you must take a Reaction to do so."
  ]
};

export const warGodsBlessing: DivinityEntry = {
  id: "divinity-war-gods-blessing",
  name: "War God's Blessing",
  sourceFeature: CLASS_FEATURE.WAR_GODS_BLESSING,
  castingTime: [ACTION_TYPE.ACTION, ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  duration: "1 minute",
  description: [
    "You can expend a use of your Channel Divinity to cast Shield of Faith or Spiritual Weapon rather than expending a spell slot.",
    "When you cast either spell in this way, the spell doesn't require Concentration.",
    "Instead the spell lasts for 1 minute, but it ends early if you cast that spell again, have the Incapacitated condition, or die."
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

export const abjureFoes: DivinityEntry = {
  id: "divinity-abjure-foes",
  name: "Abjure Foes",
  sourceFeature: CLASS_FEATURE.ABJURE_FOES,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  duration: "1 minute",
  description: [
    "As a Magic action, you can expend one use of this class's Channel Divinity to overwhelm foes with awe.",
    "As you present your Holy Symbol or weapon, you can target a number of creatures equal to your Charisma modifier, minimum of one creature, that you can see within 60 feet of yourself.",
    "Each target must succeed on a Wisdom saving throw or have the Frightened condition for 1 minute or until it takes any damage.",
    "While Frightened in this way, a target can do only one of the following on its turns: move, take an action, or take a Bonus Action."
  ]
};

export const naturesWrath: DivinityEntry = {
  id: "divinity-natures-wrath",
  name: "Nature's Wrath",
  sourceFeature: CLASS_FEATURE.NATURES_WRATH,
  castingTime: [ACTION_TYPE.ACTION],
  range: "15 feet",
  duration: "1 minute",
  description: [
    "As a Magic action, you can expend one use of your Channel Divinity to conjure spectral vines around nearby creatures.",
    "Each creature of your choice that you can see within 15 feet of yourself must succeed on a Strength saving throw or have the Restrained condition for 1 minute.",
    "A Restrained creature repeats the save at the end of each of its turns, ending the effect on itself on a success."
  ]
};

export const sacredWeapon: DivinityEntry = {
  id: "divinity-sacred-weapon",
  name: "Sacred Weapon",
  sourceFeature: CLASS_FEATURE.SACRED_WEAPON,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  duration: "10 minutes",
  description: [
    "When you take the Attack action, you can expend one use of your Channel Divinity to imbue one Melee weapon that you are holding with positive energy.",
    "For 10 minutes or until you use this feature again, you add your Charisma modifier to attack rolls you make with that weapon, minimum bonus of +1, and each time you hit with it, you cause it to deal its normal damage type or Radiant damage.",
    "The weapon also emits Bright Light in a 20-foot radius and Dim Light 20 feet beyond that.",
    "You can end this effect early, no action required. This effect also ends if you aren't carrying the weapon."
  ]
};

export const inspiringSmite: DivinityEntry = {
  id: "divinity-inspiring-smite",
  name: "Inspiring Smite",
  sourceFeature: CLASS_FEATURE.INSPIRING_SMITE,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "30 feet",
  duration: "Instantaneous",
  description: [
    "Immediately after you cast Divine Smite, you can expend one use of your Channel Divinity and distribute Temporary Hit Points to creatures of your choice within 30 feet of yourself, which can include you.",
    "The total number of Temporary Hit Points equals 2d8 plus your Paladin level, divided among the chosen creatures however you like."
  ]
};

export const peerlessAthlete: DivinityEntry = {
  id: "divinity-peerless-athlete",
  name: "Peerless Athlete",
  sourceFeature: CLASS_FEATURE.PEERLESS_ATHLETE,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  duration: "1 hour",
  description: [
    "As a Bonus Action, you can expend one use of your Channel Divinity to augment your athleticism.",
    "For 1 hour, you have Advantage on Strength (Athletics) and Dexterity (Acrobatics) checks, and the distance of your Long and High Jumps increases by 10 feet.",
    "This extra distance costs movement as normal."
  ]
};

export const elementalSmite: DivinityEntry = {
  id: "divinity-elemental-smite",
  name: "Elemental Smite",
  sourceFeature: CLASS_FEATURE.ELEMENTAL_SMITE,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  duration: "Instantaneous",
  description: [
    "Immediately after you cast Divine Smite, you can expend one use of your Channel Divinity and invoke one of the following effects.",
    "Dao's Crush. Earth rises up around the target of your Divine Smite. The target has the Grappled condition, with an escape DC equal to your spell save DC. While Grappled, the target has the Restrained condition.",
    "Djinni's Escape. You teleport to an unoccupied space you can see within 30 feet of yourself and take on a semi-incorporeal form, which lasts until the end of your next turn.",
    "While in this form, you have Resistance to Bludgeoning, Piercing, and Slashing damage, and you have Immunity to the Grappled, Prone, and Restrained conditions.",
    "Efreeti's Fury. The target of your Divine Smite takes an extra 2d4 Fire damage, and fire jumps from the target to another creature you can see within 30 feet of yourself. The second creature also takes 2d4 Fire damage.",
    "Marid's Surge. The target of your Divine Smite and each creature of your choice in a 10-foot Emanation originating from you make a Strength saving throw against your spell save DC. On a failed save, a creature is pushed 15 feet straight away from you and has the Prone condition."
  ]
};

export const vowOfEnmity: DivinityEntry = {
  id: "divinity-vow-of-enmity",
  name: "Vow of Enmity",
  sourceFeature: CLASS_FEATURE.VOW_OF_ENMITY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  duration: "1 minute",
  description: [
    "When you take the Attack action, you can expend one use of your Channel Divinity to utter a vow of enmity against a creature you can see within 30 feet of yourself.",
    "You have Advantage on attack rolls against the creature for 1 minute or until you use this feature again.",
    "If the creature drops to 0 Hit Points before the vow ends, you can transfer the vow to a different creature within 30 feet of yourself, no action required."
  ]
};

export const divinityEntries: DivinityEntry[] = [
  divineSpark,
  turnUndead,
  mindMagic,
  preserveLife,
  radianceOfTheDawn,
  invokeDuplicity,
  guidedStrike,
  warGodsBlessing,
  divineSense,
  abjureFoes,
  naturesWrath,
  sacredWeapon,
  inspiringSmite,
  peerlessAthlete,
  elementalSmite,
  vowOfEnmity
];

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
