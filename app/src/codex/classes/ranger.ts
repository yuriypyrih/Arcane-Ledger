import { CLASS_FEATURE, SPELL_LIST_CLASS } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";
import { createUseSpellEntriesForSpellListClass } from "./spellAccess";

export type RangerSpellSlotProgression = [number, number, number, number, number];

export type RangerFeatureClassObj = FeatureClassObj & {
  favoredEnemy: number;
  preparedSpells: number;
  spellSlots: RangerSpellSlotProgression;
};

export const rangerFeatures: RangerFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [
      CLASS_FEATURE.SPELLCASTING,
      CLASS_FEATURE.FAVORED_ENEMY,
      CLASS_FEATURE.WEAPON_MASTERY
    ],
    featureOverrides: {
      [CLASS_FEATURE.SPELLCASTING]: {
        description: [
          "You have learned to channel the magical essence of nature to cast spells. See 'Spells' for the rules on spellcasting. The information below details how you use those rules with Ranger spells, which appear in the Ranger spell list later in the class's description.",
          "<strong>Spell Slots.</strong> The Ranger Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Prepared Spells of Level 1+.</strong> You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose two level 1 Ranger spells. Cure Wounds and Ensnaring Strike are recommended.",
          "The number of spells on your list increases as you gain Ranger levels, as shown in the Prepared Spells column of the Ranger Features table. Whenever that number increases, choose additional Ranger spells until the number of spells on your list matches the number in the Ranger Features table. The chosen spells must be of a level for which you have spell slots.",
          "If another Ranger feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Ranger spells for you.",
          "<strong>Changing Your Prepared Spells.</strong> Whenever you finish a <link:long-rest>Long Rest</link>, you can replace one spell on your list with another Ranger spell for which you have spell slots.",
          "<strong>Spellcasting Ability.</strong> Wisdom is your spellcasting ability for your Ranger spells.",
          "<strong>Spellcasting Focus.</strong> You can use a Druidic Focus as a Spellcasting Focus for your Ranger spells."
        ],
        isTracked: false
      },
      [CLASS_FEATURE.WEAPON_MASTERY]: {
        description: [
          "Your training with weapons allows you to use the mastery properties of two kinds of weapons of your choice with which you have proficiency, such as Longbows and Shortswords.",
          "Whenever you finish a <link:long-rest>Long Rest</link>, you can change the kinds of weapons you chose. For example, you could switch to using the mastery properties of Scimitars and Longswords."
        ],
        isTracked: false
      }
    },
    favoredEnemy: 2,
    preparedSpells: 2,
    spellSlots: [2, 0, 0, 0, 0]
  },
  {
    level: 2,
    classFeatures: [CLASS_FEATURE.DEFT_EXPLORER, CLASS_FEATURE.FIGHTING_STYLE],
    featureOverrides: {
      [CLASS_FEATURE.FIGHTING_STYLE]: {
        description: [
          "You gain a Fighting Style feat of your choice. Instead of choosing one of those feats, you can choose the option below.",
          "<strong>Druidic Warrior.</strong> You learn two Druid cantrips of your choice. Guidance and Starry Wisp are recommended. The chosen cantrips count as Ranger spells for you, and Wisdom is your spellcasting ability for them. Whenever you gain a Ranger level, you can replace one of these cantrips with another Druid cantrip."
        ],
        isTracked: false
      }
    },
    favoredEnemy: 2,
    preparedSpells: 3,
    spellSlots: [2, 0, 0, 0, 0]
  },
  {
    level: 3,
    classFeatures: [CLASS_FEATURE.RANGER_SUBCLASS],
    favoredEnemy: 2,
    preparedSpells: 4,
    spellSlots: [3, 0, 0, 0, 0]
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    favoredEnemy: 2,
    preparedSpells: 5,
    spellSlots: [3, 0, 0, 0, 0]
  },
  {
    level: 5,
    classFeatures: [CLASS_FEATURE.EXTRA_ATTACK],
    favoredEnemy: 3,
    preparedSpells: 6,
    spellSlots: [4, 2, 0, 0, 0]
  },
  {
    level: 6,
    classFeatures: [CLASS_FEATURE.ROVING],
    favoredEnemy: 3,
    preparedSpells: 6,
    spellSlots: [4, 2, 0, 0, 0]
  },
  {
    level: 7,
    classFeatures: [CLASS_FEATURE.SUBCLASS_FEATURE],
    favoredEnemy: 3,
    preparedSpells: 7,
    spellSlots: [4, 3, 0, 0, 0]
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    favoredEnemy: 3,
    preparedSpells: 7,
    spellSlots: [4, 3, 0, 0, 0]
  },
  {
    level: 9,
    classFeatures: [CLASS_FEATURE.EXPERTISE],
    featureOverrides: {
      [CLASS_FEATURE.EXPERTISE]: {
        description: [
          "Choose two of your skill proficiencies with which you lack Expertise.",
          "You gain Expertise in those skills."
        ],
        isTracked: false
      }
    },
    favoredEnemy: 4,
    preparedSpells: 9,
    spellSlots: [4, 3, 2, 0, 0]
  },
  {
    level: 10,
    classFeatures: [CLASS_FEATURE.TIRELESS],
    favoredEnemy: 4,
    preparedSpells: 9,
    spellSlots: [4, 3, 2, 0, 0]
  },
  {
    level: 11,
    classFeatures: [CLASS_FEATURE.SUBCLASS_FEATURE],
    favoredEnemy: 4,
    preparedSpells: 10,
    spellSlots: [4, 3, 3, 0, 0]
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    favoredEnemy: 4,
    preparedSpells: 10,
    spellSlots: [4, 3, 3, 0, 0]
  },
  {
    level: 13,
    classFeatures: [CLASS_FEATURE.RELENTLESS_HUNTER],
    favoredEnemy: 5,
    preparedSpells: 11,
    spellSlots: [4, 3, 3, 1, 0]
  },
  {
    level: 14,
    classFeatures: [CLASS_FEATURE.NATURES_VEIL],
    favoredEnemy: 5,
    preparedSpells: 11,
    spellSlots: [4, 3, 3, 1, 0]
  },
  {
    level: 15,
    classFeatures: [CLASS_FEATURE.SUBCLASS_FEATURE],
    favoredEnemy: 5,
    preparedSpells: 12,
    spellSlots: [4, 3, 3, 2, 0]
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    favoredEnemy: 5,
    preparedSpells: 12,
    spellSlots: [4, 3, 3, 2, 0]
  },
  {
    level: 17,
    classFeatures: [CLASS_FEATURE.PRECISE_HUNTER],
    favoredEnemy: 6,
    preparedSpells: 14,
    spellSlots: [4, 3, 3, 3, 1]
  },
  {
    level: 18,
    classFeatures: [CLASS_FEATURE.FERAL_SENSES],
    favoredEnemy: 6,
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
          "Boon of Dimensional Travel is recommended."
        ],
        isTracked: false
      }
    },
    favoredEnemy: 6,
    preparedSpells: 15,
    spellSlots: [4, 3, 3, 3, 2]
  },
  {
    level: 20,
    classFeatures: [CLASS_FEATURE.FOE_SLAYER],
    favoredEnemy: 6,
    preparedSpells: 15,
    spellSlots: [4, 3, 3, 3, 2]
  }
];

export const rangerFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.FAVORED_ENEMY]: {
    description: [
      "You always have the Hunter's Mark spell prepared. You can cast it twice without expending a spell slot, and you regain all expended uses of this ability when you finish a <link:long-rest>Long Rest</link>.",
      "The number of times you can cast the spell without a spell slot increases when you reach certain Ranger levels, as shown in the Favored Enemy column of the Ranger Features table."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.DEFT_EXPLORER]: {
    description: [
      "Thanks to your travels, you gain the following benefits.",
      "<strong>Expertise.</strong> Choose one of your skill proficiencies with which you lack Expertise. You gain Expertise in that skill.",
      "<strong>Languages.</strong> You know two languages of your choice from the language tables in 'Creating a Character'."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.RANGER_SUBCLASS]: {
    description: [
      "You gain a Ranger subclass of your choice. The Hunter subclass is detailed after this class's description.",
      "A subclass is a specialization that grants you features at certain Ranger levels.",
      "For the rest of your career, you gain each of your subclass's features that are of your Ranger level or lower."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.ROVING]: {
    description: [
      "Your Speed increases by 10 feet while you aren't wearing Heavy armor.",
      "You also have a Climb Speed and a Swim Speed equal to your Speed."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.TIRELESS]: {
    description: [
      "Primal forces now help fuel you on your journeys, granting you the following benefits.",
      "<strong>Temporary Hit Points.</strong> As a Magic action, you can give yourself a number of Temporary Hit Points equal to 1d8 plus your Wisdom modifier, minimum of 1. You can use this action a number of times equal to your Wisdom modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
      "<strong>Decrease Exhaustion.</strong> Whenever you finish a <link:short-rest>Short Rest</link>, your Exhaustion level, if any, decreases by 1."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.RELENTLESS_HUNTER]: {
    description: ["Taking damage can't break your Concentration on Hunter's Mark."],
    isTracked: false
  },
  [CLASS_FEATURE.NATURES_VEIL]: {
    description: [
      "You invoke spirits of nature to magically hide yourself. As a Bonus Action, you can give yourself the Invisible condition until the end of your next turn.",
      "You can use this feature a number of times equal to your Wisdom modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.PRECISE_HUNTER]: {
    description: [
      "You have Advantage on attack rolls against the creature currently marked by your Hunter's Mark."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.FERAL_SENSES]: {
    description: [
      "Your connection to the forces of nature grants you Blindsight with a range of 30 feet."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.FOE_SLAYER]: {
    description: ["The damage die of your Hunter's Mark is a d10 rather than a d6."],
    isTracked: false
  }
};

export const useRangerSpellEntries = createUseSpellEntriesForSpellListClass(
  SPELL_LIST_CLASS.RANGER
);
