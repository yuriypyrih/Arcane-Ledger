import { CLASS_FEATURE, DICE, SPELL_LIST_CLASS, TRACKER } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";
import { createUseSpellEntriesForSpellListClass } from "./spellAccess";

export type BardSpellSlotProgression = [
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

export type BardFeatureClassObj = FeatureClassObj & {
  bardicDie: DICE;
  cantrips: number;
  preparedSpells: number;
  spellSlots: BardSpellSlotProgression;
};

export const bardFeatures: BardFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [CLASS_FEATURE.BARDIC_INSPIRATION, CLASS_FEATURE.SPELLCASTING],
    bardicDie: DICE.D6,
    cantrips: 2,
    preparedSpells: 4,
    spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 2,
    classFeatures: [CLASS_FEATURE.EXPERTISE, CLASS_FEATURE.JACK_OF_ALL_TRADES],
    bardicDie: DICE.D6,
    cantrips: 2,
    preparedSpells: 5,
    spellSlots: [3, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 3,
    classFeatures: [],
    bardicDie: DICE.D6,
    cantrips: 2,
    preparedSpells: 6,
    spellSlots: [4, 2, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    bardicDie: DICE.D6,
    cantrips: 3,
    preparedSpells: 7,
    spellSlots: [4, 3, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 5,
    classFeatures: [CLASS_FEATURE.FONT_OF_INSPIRATION],
    bardicDie: DICE.D8,
    cantrips: 3,
    preparedSpells: 9,
    spellSlots: [4, 3, 2, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 6,
    classFeatures: [],
    bardicDie: DICE.D8,
    cantrips: 3,
    preparedSpells: 10,
    spellSlots: [4, 3, 3, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 7,
    classFeatures: [CLASS_FEATURE.COUNTERCHARM],
    bardicDie: DICE.D8,
    cantrips: 3,
    preparedSpells: 11,
    spellSlots: [4, 3, 3, 1, 0, 0, 0, 0, 0]
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    bardicDie: DICE.D8,
    cantrips: 3,
    preparedSpells: 12,
    spellSlots: [4, 3, 3, 2, 0, 0, 0, 0, 0]
  },
  {
    level: 9,
    classFeatures: [CLASS_FEATURE.EXPERTISE],
    bardicDie: DICE.D8,
    cantrips: 3,
    preparedSpells: 14,
    spellSlots: [4, 3, 3, 3, 1, 0, 0, 0, 0]
  },
  {
    level: 10,
    classFeatures: [CLASS_FEATURE.MAGICAL_SECRETS],
    bardicDie: DICE.D10,
    cantrips: 4,
    preparedSpells: 15,
    spellSlots: [4, 3, 3, 3, 2, 0, 0, 0, 0]
  },
  {
    level: 11,
    classFeatures: [],
    bardicDie: DICE.D10,
    cantrips: 4,
    preparedSpells: 16,
    spellSlots: [4, 3, 3, 3, 2, 1, 0, 0, 0]
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    bardicDie: DICE.D10,
    cantrips: 4,
    preparedSpells: 16,
    spellSlots: [4, 3, 3, 3, 2, 1, 0, 0, 0]
  },
  {
    level: 13,
    classFeatures: [],
    bardicDie: DICE.D10,
    cantrips: 4,
    preparedSpells: 17,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 0, 0]
  },
  {
    level: 14,
    classFeatures: [],
    bardicDie: DICE.D10,
    cantrips: 4,
    preparedSpells: 17,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 0, 0]
  },
  {
    level: 15,
    classFeatures: [],
    bardicDie: DICE.D12,
    cantrips: 4,
    preparedSpells: 18,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 0]
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    bardicDie: DICE.D12,
    cantrips: 4,
    preparedSpells: 18,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 0]
  },
  {
    level: 17,
    classFeatures: [],
    bardicDie: DICE.D12,
    cantrips: 4,
    preparedSpells: 19,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 1]
  },
  {
    level: 18,
    classFeatures: [CLASS_FEATURE.SUPERIOR_INSPIRATION],
    bardicDie: DICE.D12,
    cantrips: 4,
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
          "<feat:BOON_OF_SPELL_RECALL>Boon of Spell Recall</feat> is recommended."
        ],
        trackingState: TRACKER.TRACKED
      }
    },
    bardicDie: DICE.D12,
    cantrips: 4,
    preparedSpells: 21,
    spellSlots: [4, 3, 3, 3, 3, 2, 1, 1, 1]
  },
  {
    level: 20,
    classFeatures: [CLASS_FEATURE.WORDS_OF_CREATION],
    bardicDie: DICE.D12,
    cantrips: 4,
    preparedSpells: 22,
    spellSlots: [4, 3, 3, 3, 3, 2, 2, 1, 1]
  }
];

export const bardFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.BARDIC_INSPIRATION]: {
    description: [
      "You can supernaturally inspire others through words, music, or dance. This inspiration is represented by your Bardic Inspiration die, which is a <strong>d6</strong>.",
      "<strong>Using Bardic Inspiration.</strong> As a Bonus Action, you can inspire another creature within 60 feet of yourself who can see or hear you. That creature gains one of your Bardic Inspiration dice. A creature can have only one Bardic Inspiration die at a time.",
      "Once within the next hour when the creature fails a <strong>D20</strong> Test, the creature can roll the Bardic Inspiration die and add the number rolled to the <strong>d20</strong>, potentially turning the failure into a success. A Bardic Inspiration die is expended when it is rolled.",
      "<strong>Number of Uses.</strong> You can confer a Bardic Inspiration die a number of times equal to your <link:CHA>Charisma</link> modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
      "<strong>At Higher Levels.</strong> Your Bardic Inspiration die changes when you reach certain Bard levels. The die becomes a <strong>d8</strong> at level 5, a <strong>d10</strong> at level 10, and a <strong>d12</strong> at level 15."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.SPELLCASTING]: {
    description: [
      "You have learned to cast spells through your bardic arts.",
      "<strong>Cantrips.</strong> You know two cantrips of your choice from the Bard spell list. <spell:Dancing Lights>Dancing Lights</spell> and <spell:Vicious Mockery>Vicious Mockery</spell> are recommended.",
      "Whenever you gain a Bard level, you can replace one of your cantrips with another cantrip of your choice from the Bard spell list.",
      "When you reach Bard levels 4 and 10, you learn another cantrip of your choice from the Bard spell list.",
      "<strong>Spell Slots.</strong> You regain all expended slots when you finish a <link:long-rest>Long Rest</link>.",
      "<strong>Prepared Spells of Level 1+.</strong> You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Bard spell list. <spell:Charm Person>Charm Person</spell>, <spell:Color Spray>Color Spray</spell>, <spell:Dissonant Whispers>Dissonant Whispers</spell>, and <spell:Healing Word>Healing Word</spell> are recommended.",
      "The number of spells on your list increases as you gain Bard levels. The chosen spells must be of a level for which you have spell slots.",
      "If another Bard feature gives you spells that you always have prepared, those spells do not count against the number of spells you can prepare with this feature, but those spells otherwise count as Bard spells for you.",
      "<strong>Changing Your Prepared Spells.</strong> Whenever you gain a Bard level, you can replace one spell on your list with another Bard spell for which you have spell slots.",
      "<strong>Spellcasting Ability.</strong> <link:CHA>Charisma</link> is your spellcasting ability for your Bard spells.",
      "<strong>Spellcasting Focus.</strong> You can use a Musical Instrument as a Spellcasting Focus for your Bard spells."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.EXPERTISE]: {
    description: [
      "You gain Expertise in two of your skill proficiencies of your choice. Performance and Persuasion are recommended if you have proficiency in them.",
      "At Bard level 9, you gain Expertise in two more of your skill proficiencies of your choice."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.JACK_OF_ALL_TRADES]: {
    description: [
      "You can add half your Proficiency Bonus, round down, to any ability check you make that uses a skill proficiency you lack and that does not otherwise use your Proficiency Bonus.",
      "For example, if you make a Strength (Athletics) check and lack Athletics proficiency, you can add half your Proficiency Bonus to the check."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.FONT_OF_INSPIRATION]: {
    description: [
      "You now regain all your expended uses of Bardic Inspiration when you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
      "In addition, you can expend a spell slot, no action required, to regain one expended use of Bardic Inspiration."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.COUNTERCHARM]: {
    description: [
      "You can use musical notes or words of power to disrupt mind-influencing effects.",
      "If you or a creature within 30 feet of you fails a saving throw against an effect that applies the Charmed or Frightened condition, you can take a Reaction to cause the save to be rerolled, and the new roll has Advantage."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.MAGICAL_SECRETS]: {
    description: [
      "You have learned secrets from various magical traditions.",
      "Whenever you reach a Bard level, including this level, and the Prepared Spells number in the Bard Features table increases, you can choose any of your new prepared spells from the Bard, Cleric, Druid, and Wizard spell lists, and the chosen spells count as Bard spells for you.",
      "In addition, whenever you replace a spell prepared for this class, you can replace it with a spell from those lists."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.SUPERIOR_INSPIRATION]: {
    description: [
      "When you roll Initiative, you regain expended uses of Bardic Inspiration until you have two if you have fewer than that."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.WORDS_OF_CREATION]: {
    description: [
      "You have mastered two of the Words of Creation: the words of life and death.",
      "You therefore always have the <spell:Power Word Heal>Power Word Heal</spell> and <spell:Power Word Kill>Power Word Kill</spell> spells prepared.",
      "When you cast either spell, you can target a second creature with it if that creature is within 10 feet of the first target."
    ],
    trackingState: TRACKER.TRACKED
  }
};

export const useBardSpellEntries = createUseSpellEntriesForSpellListClass(SPELL_LIST_CLASS.BARD);
