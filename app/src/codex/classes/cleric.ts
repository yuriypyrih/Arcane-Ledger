import { CLASS_FEATURE, SPELL_LIST_CLASS } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";
import { createUseSpellEntriesForSpellListClass } from "./spellAccess";

export type ClericSpellSlotProgression = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export type ClericFeatureClassObj = FeatureClassObj & {
  channelDivinity: number;
  cantrips: number;
  preparedSpells: number;
  spellSlots: ClericSpellSlotProgression;
};

export const clericFeatures: ClericFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [CLASS_FEATURE.SPELLCASTING, CLASS_FEATURE.DIVINE_ORDER],
    featureOverrides: {
      [CLASS_FEATURE.SPELLCASTING]: {
        description: [
          "You have learned to cast spells through prayer and meditation. See 'Spells' for the rules on spellcasting. The information below details how you use those rules with Cleric spells, which appear on the Cleric spell list later in the class's description.",
          "<strong>Cantrips.</strong> You know three cantrips of your choice from the Cleric spell list. <spell:Guidance>Guidance</spell>, <spell:Sacred Flame>Sacred Flame</spell>, and <spell:Thaumaturgy>Thaumaturgy</spell> are recommended.",
          "Whenever you gain a Cleric level, you can replace one of your cantrips with another cantrip of your choice from the Cleric spell list.",
          "When you reach Cleric levels 4 and 10, you learn another cantrip of your choice from the Cleric spell list, as shown in the Cantrips column of the Cleric Features table.",
          "<strong>Spell Slots.</strong> The Cleric Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Prepared Spells of Level 1+.</strong> You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Cleric spell list. <spell:Bless>Bless</spell>, <spell:Cure Wounds>Cure Wounds</spell>, <spell:Guiding Bolt>Guiding Bolt</spell>, and <spell:Shield of Faith>Shield of Faith</spell> are recommended.",
          "The number of spells on your list increases as you gain Cleric levels, as shown in the Prepared Spells column of the Cleric Features table. Whenever that number increases, choose additional spells from the Cleric spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots.",
          "If another Cleric feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Cleric spells for you.",
          "<strong>Changing Your Prepared Spells.</strong> Whenever you finish a <link:long-rest>Long Rest</link>, you can change your list of prepared spells, replacing any of the spells there with other Cleric spells for which you have spell slots.",
          "<strong>Spellcasting Ability.</strong> Wisdom is your spellcasting ability for your Cleric spells.",
          "<strong>Spellcasting Focus.</strong> You can use a Holy Symbol as a Spellcasting Focus for your Cleric spells."
        ],
        trackingState: "tracked"
      }
    },
    channelDivinity: 0,
    cantrips: 3,
    preparedSpells: 4,
    spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 2,
    classFeatures: [CLASS_FEATURE.CHANNEL_DIVINITY],
    channelDivinity: 2,
    cantrips: 3,
    preparedSpells: 5,
    spellSlots: [3, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 3,
    classFeatures: [],
    channelDivinity: 2,
    cantrips: 3,
    preparedSpells: 6,
    spellSlots: [4, 2, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    channelDivinity: 2,
    cantrips: 4,
    preparedSpells: 7,
    spellSlots: [4, 3, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 5,
    classFeatures: [CLASS_FEATURE.SEAR_UNDEAD],
    channelDivinity: 2,
    cantrips: 4,
    preparedSpells: 9,
    spellSlots: [4, 3, 2, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 6,
    classFeatures: [],
    channelDivinity: 3,
    cantrips: 4,
    preparedSpells: 10,
    spellSlots: [4, 3, 3, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 7,
    classFeatures: [CLASS_FEATURE.BLESSED_STRIKES],
    channelDivinity: 3,
    cantrips: 4,
    preparedSpells: 11,
    spellSlots: [4, 3, 3, 1, 0, 0, 0, 0, 0]
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    channelDivinity: 3,
    cantrips: 4,
    preparedSpells: 12,
    spellSlots: [4, 3, 3, 2, 0, 0, 0, 0, 0]
  },
  {
    level: 9,
    classFeatures: [],
    channelDivinity: 3,
    cantrips: 4,
    preparedSpells: 14,
    spellSlots: [4, 3, 3, 3, 1, 0, 0, 0, 0]
  },
  {
    level: 10,
    classFeatures: [CLASS_FEATURE.DIVINE_INTERVENTION],
    channelDivinity: 3,
    cantrips: 5,
    preparedSpells: 15,
    spellSlots: [4, 3, 3, 3, 2, 0, 0, 0, 0]
  },
  {
    level: 11,
    classFeatures: [],
    channelDivinity: 3,
    cantrips: 5,
    preparedSpells: 16,
    spellSlots: [4, 3, 3, 3, 2, 1, 0, 0, 0]
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    channelDivinity: 3,
    cantrips: 5,
    preparedSpells: 16,
    spellSlots: [4, 3, 3, 3, 2, 1, 0, 0, 0]
  },
  {
    level: 13,
    classFeatures: [],
    channelDivinity: 3,
    cantrips: 5,
    preparedSpells: 17,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 0, 0]
  },
  {
    level: 14,
    classFeatures: [CLASS_FEATURE.IMPROVED_BLESSED_STRIKES],
    channelDivinity: 3,
    cantrips: 5,
    preparedSpells: 17,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 0, 0]
  },
  {
    level: 15,
    classFeatures: [],
    channelDivinity: 3,
    cantrips: 5,
    preparedSpells: 18,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 0]
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    channelDivinity: 3,
    cantrips: 5,
    preparedSpells: 18,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 0]
  },
  {
    level: 17,
    classFeatures: [],
    channelDivinity: 3,
    cantrips: 5,
    preparedSpells: 19,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 1]
  },
  {
    level: 18,
    classFeatures: [],
    channelDivinity: 4,
    cantrips: 5,
    preparedSpells: 20,
    spellSlots: [4, 3, 3, 3, 3, 1, 1, 1, 1]
  },
  {
    level: 19,
    classFeatures: [CLASS_FEATURE.EPIC_BOON],
    featureOverrides: {
      [CLASS_FEATURE.EPIC_BOON]: {
        description: [
          "You gain an Epic Boon feat, or another feat of your choice for which you qualify.",
          "Boon of Fate is recommended."
        ],
        trackingState: "tracked"
      }
    },
    channelDivinity: 4,
    cantrips: 5,
    preparedSpells: 21,
    spellSlots: [4, 3, 3, 3, 3, 2, 1, 1, 1]
  },
  {
    level: 20,
    classFeatures: [CLASS_FEATURE.GREATER_DIVINE_INTERVENTION],
    channelDivinity: 4,
    cantrips: 5,
    preparedSpells: 22,
    spellSlots: [4, 3, 3, 3, 3, 2, 2, 1, 1]
  }
];

export const clericFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.DIVINE_ORDER]: {
    description: [
      "You have dedicated yourself to one of the following sacred roles of your choice.",
      "<strong>Protector.</strong> Trained for battle, you gain proficiency with Martial weapons and training with Heavy armor.",
      "<strong>Thaumaturge.</strong> You know one extra cantrip from the Cleric spell list. In addition, your mystical connection to the divine gives you a bonus to your Intelligence (Arcana or Religion) checks. The bonus equals your Wisdom modifier, minimum of +1."
    ],
    trackingState: "tracked"
  },
  [CLASS_FEATURE.CHANNEL_DIVINITY]: {
    description: [
      "You can channel divine energy directly from the Outer Planes to fuel magical effects. Each time you use this class's Channel Divinity, choose which Channel Divinity effect from this class to create. You gain additional effect options at higher Cleric levels.",
      "You can use this class's Channel Divinity twice. You regain one of its expended uses when you finish a <link:short-rest>Short Rest</link>, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>. You gain additional uses when you reach certain Cleric levels.",
      "If a Channel Divinity effect requires a saving throw, the DC equals the spell save DC from this class's Spellcasting feature.",
      "You have the following Channel Divinities: <divinity:Divine Spark>Divine Spark</divinity> and <divinity:Turn Undead>Turn Undead</divinity>."
    ],
    trackingState: "tracked"
  },
  [CLASS_FEATURE.SEAR_UNDEAD]: {
    description: [
      "Whenever you use Turn Undead, you can roll a number of d8s equal to your Wisdom modifier, minimum of 1d8, and add the rolls together.",
      "Each Undead that fails its saving throw against that use of Turn Undead takes Radiant damage equal to the roll's total. This damage doesn't end the turn effect."
    ],
    trackingState: "tracked"
  },
  [CLASS_FEATURE.BLESSED_STRIKES]: {
    description: [
      "Divine power infuses you in battle. You gain one of the following options of your choice. If you get either option from a Cleric subclass in an older book, use only the option you choose for this feature.",
      "<strong>Blessed Strike.</strong> Once on each of your turns when you hit a creature with an attack roll using a weapon, you can cause the target to take an extra 1d8 Necrotic or Radiant damage, your choice.",
      "<strong>Potent Spellcasting.</strong> Add your Wisdom modifier to the damage you deal with any Cleric cantrip."
    ],
    trackingState: "semi-tracked"
  },
  [CLASS_FEATURE.DIVINE_INTERVENTION]: {
    description: [
      "You can call on your deity or pantheon to intervene on your behalf.",
      "As a Magic action, choose any Cleric spell of level 5 or lower that doesn't require a Reaction to cast. As part of the same action, you cast that spell without expending a spell slot or needing Material components.",
      "You can't use this feature again until you finish a <link:long-rest>Long Rest</link>."
    ],
    trackingState: "tracked"
  },
  [CLASS_FEATURE.IMPROVED_BLESSED_STRIKES]: {
    description: [
      "The option you chose for Blessed Strikes grows more powerful.",
      "<strong>Divine Strike.</strong> The extra damage of your Divine Strike increases to 2d8. <link:tracked>Tracked</link>",
      "<strong>Potent Spellcasting.</strong> When you cast a Cleric cantrip and deal damage to a creature with it, you can give vitality to yourself or another creature within 60 feet of yourself, granting a number of Temporary Hit Points equal to twice your Wisdom modifier. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: "semi-tracked"
  },
  [CLASS_FEATURE.GREATER_DIVINE_INTERVENTION]: {
    description: [
      "You can call on even more powerful divine intervention.",
      "When you use your Divine Intervention feature, you can choose <spell:Wish>Wish</spell> when you select a spell. <link:tracked>Tracked</link>",
      "If you do so, you can't use Divine Intervention again until you finish 2d4 <link:long-rest>Long Rests</link>. (This is <link:not-tracked>Not Tracked</link> but you can roll the dice and keep skipping the Divine Intervenation reset during Long Rest)."
    ],
    trackingState: "semi-tracked"
  }
};

export const useClericSpellEntries = createUseSpellEntriesForSpellListClass(
  SPELL_LIST_CLASS.CLERIC
);
