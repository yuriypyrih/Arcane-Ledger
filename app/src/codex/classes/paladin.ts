import { CLASS_FEATURE, SPELL_LIST_CLASS } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";
import { createUseSpellEntriesForSpellListClass } from "./spellAccess";

export type PaladinSpellSlotProgression = [number, number, number, number, number];

export type PaladinFeatureClassObj = FeatureClassObj & {
  channelDivinity: number;
  preparedSpells: number;
  spellSlots: PaladinSpellSlotProgression;
};

export const paladinFeatures: PaladinFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [
      CLASS_FEATURE.LAY_ON_HANDS,
      CLASS_FEATURE.SPELLCASTING,
      CLASS_FEATURE.WEAPON_MASTERY
    ],
    featureOverrides: {
      [CLASS_FEATURE.SPELLCASTING]: {
        description: [
          "You have learned to cast spells through prayer and meditation.",
          "<strong>Spell Slots.</strong> The Paladin Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Prepared Spells of Level 1+.</strong> You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose two level 1 Paladin spells. <spell:Heroism>Heroism</spell> and <spell:Searing Smite>Searing Smite</spell> are recommended.",
          "The number of spells on your list increases as you gain Paladin levels.",
          "If another Paladin feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Paladin spells for you.",
          "<strong>Changing Your Prepared Spells.</strong> Whenever you finish a <link:long-rest>Long Rest</link>, you can replace one spell on your list with another Paladin spell for which you have spell slots.",
          "<strong>Spellcasting Ability.</strong> Charisma is your spellcasting ability for your Paladin spells.",
          "<strong>Spellcasting Focus.</strong> You can use a Holy Symbol as a Spellcasting Focus for your Paladin spells."
        ],
        isTracked: true
      },
      [CLASS_FEATURE.WEAPON_MASTERY]: {
        description: [
          "Your training with weapons allows you to use the mastery properties of two kinds of weapons of your choice with which you have proficiency, such as Longswords and Javelins.",
          "Whenever you finish a <link:long-rest>Long Rest</link>, you can change the kinds of weapons you chose. For example, you could switch to using the mastery properties of Halberds and Flails."
        ],
        isTracked: true
      }
    },
    channelDivinity: 0,
    preparedSpells: 2,
    spellSlots: [2, 0, 0, 0, 0]
  },
  {
    level: 2,
    classFeatures: [CLASS_FEATURE.FIGHTING_STYLE, CLASS_FEATURE.PALADINS_SMITE],
    featureOverrides: {
      [CLASS_FEATURE.FIGHTING_STYLE]: {
        description: [
          "You gain a Fighting Style feat of your choice.",
          "Instead of choosing one of those feats, you can choose <feat:BLESSED_WARRIOR>Blessed Warrior</feat>.",
          "<strong>Blessed Warrior.</strong> You learn two Cleric cantrips of your choice. <spell:Guidance>Guidance</spell> and <spell:Sacred Flame>Sacred Flame</spell> are recommended. The chosen cantrips count as Paladin spells for you, and <link:CHA>Charisma</link> is your spellcasting ability for them. Whenever you gain a Paladin level, you can replace one of these cantrips with another Cleric cantrip."
        ],
        isTracked: true
      }
    },
    channelDivinity: 0,
    preparedSpells: 3,
    spellSlots: [2, 0, 0, 0, 0]
  },
  {
    level: 3,
    classFeatures: [CLASS_FEATURE.CHANNEL_DIVINITY],
    featureOverrides: {
      [CLASS_FEATURE.CHANNEL_DIVINITY]: {
        description: [
          "You can channel divine energy directly from the Outer Planes, using it to fuel magical effects. You start with one such effect: Divine Sense, which is described below. Other Paladin features give additional Channel Divinity effect options. Each time you use this class's Channel Divinity, you choose which effect from this class to create.",
          "You can use this class's Channel Divinity twice. You regain one of its expended uses when you finish a <link:short-rest>Short Rest</link>, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>. You gain an additional use when you reach Paladin level 11.",
          "If a Channel Divinity effect requires a saving throw, the DC equals the spell save DC from this class's Spellcasting feature.",
          "<strong>Divine Sense.</strong> As a Bonus Action, you can open your awareness to detect Celestials, Fiends, and Undead. For the next 10 minutes or until you have the <link:Incapacitated>Incapacitated</link> condition, you know the location of any creature of those types within 60 feet of yourself, and you know its creature type.",
          "Within the same radius, you also detect the presence of any place or object that has been consecrated or desecrated, as with the <spell:Hallow>Hallow</spell> spell."
        ],
        isTracked: false
      }
    },
    channelDivinity: 2,
    preparedSpells: 4,
    spellSlots: [3, 0, 0, 0, 0]
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    channelDivinity: 2,
    preparedSpells: 5,
    spellSlots: [3, 0, 0, 0, 0]
  },
  {
    level: 5,
    classFeatures: [CLASS_FEATURE.EXTRA_ATTACK, CLASS_FEATURE.FAITHFUL_STEED],
    channelDivinity: 2,
    preparedSpells: 6,
    spellSlots: [4, 2, 0, 0, 0]
  },
  {
    level: 6,
    classFeatures: [CLASS_FEATURE.AURA_OF_PROTECTION],
    channelDivinity: 2,
    preparedSpells: 6,
    spellSlots: [4, 2, 0, 0, 0]
  },
  {
    level: 7,
    classFeatures: [],
    channelDivinity: 2,
    preparedSpells: 7,
    spellSlots: [4, 3, 0, 0, 0]
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    channelDivinity: 2,
    preparedSpells: 7,
    spellSlots: [4, 3, 0, 0, 0]
  },
  {
    level: 9,
    classFeatures: [CLASS_FEATURE.ABJURE_FOES],
    channelDivinity: 2,
    preparedSpells: 9,
    spellSlots: [4, 3, 2, 0, 0]
  },
  {
    level: 10,
    classFeatures: [CLASS_FEATURE.AURA_OF_COURAGE],
    channelDivinity: 2,
    preparedSpells: 9,
    spellSlots: [4, 3, 2, 0, 0]
  },
  {
    level: 11,
    classFeatures: [CLASS_FEATURE.RADIANT_STRIKES],
    channelDivinity: 3,
    preparedSpells: 10,
    spellSlots: [4, 3, 3, 0, 0]
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    channelDivinity: 3,
    preparedSpells: 10,
    spellSlots: [4, 3, 3, 0, 0]
  },
  {
    level: 13,
    classFeatures: [],
    channelDivinity: 3,
    preparedSpells: 11,
    spellSlots: [4, 3, 3, 1, 0]
  },
  {
    level: 14,
    classFeatures: [CLASS_FEATURE.RESTORING_TOUCH],
    channelDivinity: 3,
    preparedSpells: 11,
    spellSlots: [4, 3, 3, 1, 0]
  },
  {
    level: 15,
    classFeatures: [],
    channelDivinity: 3,
    preparedSpells: 12,
    spellSlots: [4, 3, 3, 2, 0]
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    channelDivinity: 3,
    preparedSpells: 12,
    spellSlots: [4, 3, 3, 2, 0]
  },
  {
    level: 17,
    classFeatures: [],
    channelDivinity: 3,
    preparedSpells: 14,
    spellSlots: [4, 3, 3, 3, 1]
  },
  {
    level: 18,
    classFeatures: [CLASS_FEATURE.AURA_EXPANSION],
    channelDivinity: 3,
    preparedSpells: 14,
    spellSlots: [4, 3, 3, 3, 1]
  },
  {
    level: 19,
    classFeatures: [CLASS_FEATURE.EPIC_BOON],
    featureOverrides: {
      [CLASS_FEATURE.EPIC_BOON]: {
        description: [
          "You gain an Epic Boon feat, or another feat of your choice for which you qualify.",
          "<feat:BOON_OF_TRUESIGHT>Boon of Truesight</feat> is recommended."
        ],
        isTracked: true
      }
    },
    channelDivinity: 3,
    preparedSpells: 15,
    spellSlots: [4, 3, 3, 3, 2]
  },
  {
    level: 20,
    classFeatures: [],
    channelDivinity: 3,
    preparedSpells: 15,
    spellSlots: [4, 3, 3, 3, 2]
  }
];

export const paladinFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.LAY_ON_HANDS]: {
    description: [
      "Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you finish a <link:long-rest>Long Rest</link>. With that pool, you can restore a total number of Hit Points equal to five times your Paladin level.",
      "As a Bonus Action, you can touch a creature, which could be yourself, and draw power from the pool of healing to restore a number of Hit Points to that creature, up to the maximum amount remaining in the pool.",
      "You can also expend 5 Hit Points from the pool of healing power to remove the <link:Poisoned>Poisoned</link> condition from the creature; those points don't also restore Hit Points to the creature."
    ],
    isTracked: true
  },
  [CLASS_FEATURE.PALADINS_SMITE]: {
    description: [
      "You always have the <spell:Divine Smite>Divine Smite</spell> spell prepared.",
      "In addition, you can cast it without expending a spell slot, but you must finish a <link:long-rest>Long Rest</link> before you can cast it in this way again."
    ],
    isTracked: true
  },
  [CLASS_FEATURE.FAITHFUL_STEED]: {
    description: [
      "You can call on the aid of an otherworldly steed. You always have the <spell:Find Steed>Find Steed</spell> spell prepared.",
      "You can also cast the spell once without expending a spell slot, and you regain the ability to do so when you finish a <link:long-rest>Long Rest</link>."
    ],
    isTracked: true
  },
  [CLASS_FEATURE.AURA_OF_PROTECTION]: {
    description: [
      "You radiate a protective, unseeable aura in a 10-foot <link:Emanation>Emanation</link> that originates from you. The aura is inactive while you have the <link:Incapacitated>Incapacitated</link> condition.",
      "You and your allies in the aura gain a bonus to saving throws equal to your Charisma modifier, minimum bonus of +1.",
      "If another Paladin is present, a creature can benefit from only one Aura of Protection at a time; the creature chooses which aura while in them."
    ],
    isTracked: true
  },
  [CLASS_FEATURE.ABJURE_FOES]: {
    description: [
      "As a Magic action, you can expend one use of this class's Channel Divinity to overwhelm foes with awe.",
      "As you present your Holy Symbol or weapon, you can target a number of creatures equal to your Charisma modifier, minimum of one creature, that you can see within 60 feet of yourself.",
      "Each target must succeed on a Wisdom saving throw or have the <link:Frightened>Frightened</link> condition for 1 minute or until it takes any damage.",
      "While <link:Frightened>Frightened</link> in this way, a target can do only one of the following on its turns: move, take an action, or take a Bonus Action."
    ],
    isTracked: true
  },
  [CLASS_FEATURE.AURA_OF_COURAGE]: {
    description: [
      "You and your allies have Immunity to the <link:Frightened>Frightened</link> condition while in your Aura of Protection.",
      "If a <link:Frightened>Frightened</link> ally enters the aura, that condition has no effect on that ally while there."
    ],
    isTracked: true
  },
  [CLASS_FEATURE.RADIANT_STRIKES]: {
    description: [
      "Your strikes now carry supernatural power.",
      "When you hit a target with an attack roll using a Melee weapon or an Unarmed Strike, the target takes an extra 1d8 Radiant damage."
    ],
    isTracked: true
  },
  [CLASS_FEATURE.RESTORING_TOUCH]: {
    description: [
      "When you use Lay On Hands on a creature, you can also remove one or more of the following conditions from the creature: <link:Blinded>Blinded</link>, <link:Charmed>Charmed</link>, <link:Deafened>Deafened</link>, <link:Frightened>Frightened</link>, <link:Paralyzed>Paralyzed</link>, or <link:Stunned>Stunned</link>.",
      "You must expend 5 Hit Points from the healing pool of Lay On Hands for each of these conditions you remove; those points don't also restore Hit Points to the creature."
    ],
    isTracked: true
  },
  [CLASS_FEATURE.AURA_EXPANSION]: {
    description: ["Your Aura of Protection is now a 30-foot <link:Emanation>Emanation</link>."],
    isTracked: true
  }
};

export const usePaladinSpellEntries = createUseSpellEntriesForSpellListClass(
  SPELL_LIST_CLASS.PALADIN
);
