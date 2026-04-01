import { CLASS_FEATURE, SPELL_LIST_CLASS, TRACKER } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";
import { createUseSpellEntriesForSpellListClass } from "./spellAccess";

export type WizardSpellSlotProgression = [
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

export type WizardFeatureClassObj = FeatureClassObj & {
  cantrips: number;
  preparedSpells: number;
  spellSlots: WizardSpellSlotProgression;
};

export const wizardFeatures: WizardFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [
      CLASS_FEATURE.SPELLCASTING,
      CLASS_FEATURE.RITUAL_ADEPT,
      CLASS_FEATURE.ARCANE_RECOVERY
    ],
    featureOverrides: {
      [CLASS_FEATURE.SPELLCASTING]: {
        description: [
          "As a student of arcane magic, you have learned to cast spells. See 'Spells' for the rules on spellcasting. The information below details how you use those rules with Wizard spells, which appear in the Wizard spell list later in the class's description.",
          "<strong>Cantrips.</strong> You know three Wizard cantrips of your choice. Light, Mage Hand, and Ray of Frost are recommended. Whenever you finish a <link:long-rest>Long Rest</link>, you can replace one of your cantrips from this feature with another Wizard cantrip of your choice.",
          "When you reach Wizard levels 4 and 10, you learn another Wizard cantrip of your choice, as shown in the Cantrips column of the Wizard Features table.",
          "<strong>Spellbook.</strong> Your wizardly apprenticeship culminated in the creation of a unique book: your spellbook. It is a Tiny object that weighs 3 pounds, contains 100 pages, and can be read only by you or someone casting Identify. You determine the book's appearance and materials, such as a gilt-edged tome or a collection of vellum bound with twine.",
          "The book contains the level 1+ spells you know. It starts with six level 1 Wizard spells of your choice. Detect Magic, Feather Fall, Mage Armor, Magic Missile, Sleep, and Thunderwave are recommended.",
          "Whenever you gain a Wizard level after 1, add two Wizard spells of your choice to your spellbook. Each of these spells must be of a level for which you have spell slots, as shown in the Wizard Features table. The spells are the culmination of arcane research you do regularly.",
          "<strong>Spell Slots.</strong> The Wizard Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Prepared Spells of Level 1+.</strong> You prepare the list of level 1+ spells that are available for you to cast with this feature. To do so, choose four spells from your spellbook. The chosen spells must be of a level for which you have spell slots.",
          "The number of spells on your list increases as you gain Wizard levels, as shown in the Prepared Spells column of the Wizard Features table. Whenever that number increases, choose additional Wizard spells until the number of spells on your list matches the number in the table. The chosen spells must be of a level for which you have spell slots.",
          "If another Wizard feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Wizard spells for you.",
          "<strong>Changing Your Prepared Spells.</strong> Whenever you finish a <link:long-rest>Long Rest</link>, you can change your list of prepared spells, replacing any of the spells there with spells from your spellbook.",
          "<strong>Spellcasting Ability.</strong> Intelligence is your spellcasting ability for your Wizard spells.",
          "<strong>Spellcasting Focus.</strong> You can use an Arcane Focus or your spellbook as a Spellcasting Focus for your Wizard spells.",
          "<strong>Expanding and Replacing a Spellbook.</strong> The spells you add to your spellbook as you gain levels reflect your ongoing magical research, but you might find other spells during your adventures that you can add to the book.",
          "<strong>Copying a Spell into the Book.</strong> When you find a level 1+ Wizard spell, you can copy it into your spellbook if it's of a level you can prepare and if you have time to copy it. For each level of the spell, the transcription takes 2 hours and costs 50 GP. Afterward you can prepare the spell like the other spells in your spellbook.",
          "<strong>Copying the Book.</strong> You can copy a spell from your spellbook into another book. This is like copying a new spell into your spellbook but faster, since you already know how to cast the spell. You need spend only 1 hour and 10 GP for each level of the copied spell.",
          "If you lose your spellbook, you can use the same procedure to transcribe the Wizard spells that you have prepared into a new spellbook. Filling out the remainder of the new book requires you to find new spells to do so. For this reason, many wizards keep a backup spellbook."
        ],
        trackingState: TRACKER.TRACKED
      }
    },
    cantrips: 3,
    preparedSpells: 4,
    spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 2,
    classFeatures: [CLASS_FEATURE.SCHOLAR],
    cantrips: 3,
    preparedSpells: 5,
    spellSlots: [3, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 3,
    classFeatures: [],
    cantrips: 3,
    preparedSpells: 6,
    spellSlots: [4, 2, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    cantrips: 4,
    preparedSpells: 7,
    spellSlots: [4, 3, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 5,
    classFeatures: [CLASS_FEATURE.MEMORIZE_SPELL],
    cantrips: 4,
    preparedSpells: 9,
    spellSlots: [4, 3, 2, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 6,
    classFeatures: [],
    cantrips: 4,
    preparedSpells: 10,
    spellSlots: [4, 3, 3, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 7,
    classFeatures: [],
    cantrips: 4,
    preparedSpells: 11,
    spellSlots: [4, 3, 3, 1, 0, 0, 0, 0, 0]
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    cantrips: 4,
    preparedSpells: 12,
    spellSlots: [4, 3, 3, 2, 0, 0, 0, 0, 0]
  },
  {
    level: 9,
    classFeatures: [],
    cantrips: 4,
    preparedSpells: 14,
    spellSlots: [4, 3, 3, 3, 1, 0, 0, 0, 0]
  },
  {
    level: 10,
    classFeatures: [],
    cantrips: 5,
    preparedSpells: 15,
    spellSlots: [4, 3, 3, 3, 2, 0, 0, 0, 0]
  },
  {
    level: 11,
    classFeatures: [],
    cantrips: 5,
    preparedSpells: 16,
    spellSlots: [4, 3, 3, 3, 2, 1, 0, 0, 0]
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    cantrips: 5,
    preparedSpells: 16,
    spellSlots: [4, 3, 3, 3, 2, 1, 0, 0, 0]
  },
  {
    level: 13,
    classFeatures: [],
    cantrips: 5,
    preparedSpells: 17,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 0, 0]
  },
  {
    level: 14,
    classFeatures: [],
    cantrips: 5,
    preparedSpells: 18,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 0, 0]
  },
  {
    level: 15,
    classFeatures: [],
    cantrips: 5,
    preparedSpells: 19,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 0]
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    cantrips: 5,
    preparedSpells: 21,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 0]
  },
  {
    level: 17,
    classFeatures: [],
    cantrips: 5,
    preparedSpells: 22,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 1]
  },
  {
    level: 18,
    classFeatures: [CLASS_FEATURE.SPELL_MASTERY],
    cantrips: 5,
    preparedSpells: 23,
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
    cantrips: 5,
    preparedSpells: 24,
    spellSlots: [4, 3, 3, 3, 3, 2, 1, 1, 1]
  },
  {
    level: 20,
    classFeatures: [CLASS_FEATURE.SIGNATURE_SPELLS],
    cantrips: 5,
    preparedSpells: 25,
    spellSlots: [4, 3, 3, 3, 3, 2, 2, 1, 1]
  }
];

export const wizardFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.RITUAL_ADEPT]: {
    description: [
      "You can cast any spell as a Ritual if that spell has the Ritual tag and the spell is in your spellbook.",
      "You needn't have the spell prepared, but you must read from the book to cast a spell in this way."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.ARCANE_RECOVERY]: {
    description: [
      "You can regain some of your magical energy by studying your spellbook. When you finish a <link:short-rest>Short Rest</link>, you can choose expended spell slots to recover.",
      "The spell slots can have a combined level equal to no more than half your Wizard level, rounded up, and none of the slots can be level 6 or higher.",
      "For example, if you're a level 4 Wizard, you can recover up to two levels' worth of spell slots, regaining either one level 2 spell slot or two level 1 spell slots.",
      "Once you use this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link>."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.SCHOLAR]: {
    description: [
      "While studying magic, you also specialized in another field of study.",
      "Choose one of the following skills in which you have proficiency: <link:Arcana>Arcana</link>, <link:History>History</link>, <link:Investigation>Investigation</link>, <link:Medicine>Medicine</link>, <link:Nature>Nature</link>, or <link:Religion>Religion</link>.",
      "You have <link:Expertise>Expertise</link> in the chosen skill."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.MEMORIZE_SPELL]: {
    description: [
      "Whenever you finish a <link:short-rest>Short Rest</link>, you can study your spellbook and replace one of the level 1+ Wizard spells you have prepared for your Spellcasting feature with another level 1+ spell from the book."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.SPELL_MASTERY]: {
    description: [
      "You have achieved such mastery over certain spells that you can cast them at will. Choose a level 1 and a level 2 spell in your spellbook that have a casting time of an action.",
      "You always have those spells prepared, and you can cast them at their lowest level without expending a spell slot. To cast either spell at a higher level, you must expend a spell slot.",
      "Whenever you finish a <link:long-rest>Long Rest</link>, you can study your spellbook and replace one of those spells with an eligible spell of the same level from the book."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.SIGNATURE_SPELLS]: {
    description: [
      "Choose two level 3 spells in your spellbook as your signature spells.",
      "You always have these spells prepared, and you can cast each of them once at level 3 without expending a spell slot.",
      "When you do so, you can't cast them in this way again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
      "To cast either spell at a higher level, you must expend a spell slot."
    ],
    trackingState: TRACKER.TRACKED
  }
};

export const useWizardSpellEntries = createUseSpellEntriesForSpellListClass(
  SPELL_LIST_CLASS.WIZARD
);
