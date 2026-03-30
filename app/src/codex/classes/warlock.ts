import { CLASS_FEATURE, SPELL_LIST_CLASS } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";
import { createUseSpellEntriesForSpellListClass } from "./spellAccess";

export type WarlockSpellSlotProgression = [
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

export type WarlockFeatureClassObj = FeatureClassObj & {
  eldritchInvocations: number;
  cantrips: number;
  preparedSpells: number;
  pactMagicSlots: number;
  slotLevel: 1 | 2 | 3 | 4 | 5;
  spellSlots: WarlockSpellSlotProgression;
};

function createMysticArcanumDescription(arcanumLevel: 6 | 7 | 8 | 9): string[] {
  return [
    `Your patron grants you a magical secret called an arcanum. Choose one level ${arcanumLevel} Warlock spell as this arcanum.`,
    "You can cast your arcanum spell once without expending a spell slot, and you must finish a <link:long-rest>Long Rest</link> before you can cast it in this way again.",
    "Whenever you gain a Warlock level, you can replace one of your arcanum spells with another Warlock spell of the same level."
  ];
}

export const warlockFeatures: WarlockFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [CLASS_FEATURE.ELDRITCH_INVOCATIONS, CLASS_FEATURE.PACT_MAGIC],
    eldritchInvocations: 1,
    cantrips: 2,
    preparedSpells: 2,
    pactMagicSlots: 1,
    slotLevel: 1,
    spellSlots: [1, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 2,
    classFeatures: [CLASS_FEATURE.MAGICAL_CUNNING],
    eldritchInvocations: 3,
    cantrips: 2,
    preparedSpells: 3,
    pactMagicSlots: 2,
    slotLevel: 1,
    spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 3,
    classFeatures: [],
    eldritchInvocations: 3,
    cantrips: 2,
    preparedSpells: 4,
    pactMagicSlots: 2,
    slotLevel: 2,
    spellSlots: [0, 2, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    eldritchInvocations: 3,
    cantrips: 3,
    preparedSpells: 5,
    pactMagicSlots: 2,
    slotLevel: 2,
    spellSlots: [0, 2, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 5,
    classFeatures: [],
    eldritchInvocations: 5,
    cantrips: 3,
    preparedSpells: 6,
    pactMagicSlots: 2,
    slotLevel: 3,
    spellSlots: [0, 0, 2, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 6,
    classFeatures: [],
    eldritchInvocations: 5,
    cantrips: 3,
    preparedSpells: 7,
    pactMagicSlots: 2,
    slotLevel: 3,
    spellSlots: [0, 0, 2, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 7,
    classFeatures: [],
    eldritchInvocations: 6,
    cantrips: 3,
    preparedSpells: 8,
    pactMagicSlots: 2,
    slotLevel: 4,
    spellSlots: [0, 0, 0, 2, 0, 0, 0, 0, 0]
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    eldritchInvocations: 6,
    cantrips: 3,
    preparedSpells: 9,
    pactMagicSlots: 2,
    slotLevel: 4,
    spellSlots: [0, 0, 0, 2, 0, 0, 0, 0, 0]
  },
  {
    level: 9,
    classFeatures: [CLASS_FEATURE.CONTACT_PATRON],
    eldritchInvocations: 7,
    cantrips: 3,
    preparedSpells: 10,
    pactMagicSlots: 2,
    slotLevel: 5,
    spellSlots: [0, 0, 0, 0, 2, 0, 0, 0, 0]
  },
  {
    level: 10,
    classFeatures: [],
    eldritchInvocations: 7,
    cantrips: 4,
    preparedSpells: 10,
    pactMagicSlots: 2,
    slotLevel: 5,
    spellSlots: [0, 0, 0, 0, 2, 0, 0, 0, 0]
  },
  {
    level: 11,
    classFeatures: [CLASS_FEATURE.MYSTIC_ARCANUM],
    featureOverrides: {
      [CLASS_FEATURE.MYSTIC_ARCANUM]: {
        description: createMysticArcanumDescription(6),
        isTracked: true
      }
    },
    eldritchInvocations: 7,
    cantrips: 4,
    preparedSpells: 11,
    pactMagicSlots: 3,
    slotLevel: 5,
    spellSlots: [0, 0, 0, 0, 3, 0, 0, 0, 0]
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    eldritchInvocations: 8,
    cantrips: 4,
    preparedSpells: 11,
    pactMagicSlots: 3,
    slotLevel: 5,
    spellSlots: [0, 0, 0, 0, 3, 0, 0, 0, 0]
  },
  {
    level: 13,
    classFeatures: [CLASS_FEATURE.MYSTIC_ARCANUM],
    featureOverrides: {
      [CLASS_FEATURE.MYSTIC_ARCANUM]: {
        description: createMysticArcanumDescription(7),
        isTracked: true
      }
    },
    eldritchInvocations: 8,
    cantrips: 4,
    preparedSpells: 12,
    pactMagicSlots: 3,
    slotLevel: 5,
    spellSlots: [0, 0, 0, 0, 3, 0, 0, 0, 0]
  },
  {
    level: 14,
    classFeatures: [],
    eldritchInvocations: 8,
    cantrips: 4,
    preparedSpells: 12,
    pactMagicSlots: 3,
    slotLevel: 5,
    spellSlots: [0, 0, 0, 0, 3, 0, 0, 0, 0]
  },
  {
    level: 15,
    classFeatures: [CLASS_FEATURE.MYSTIC_ARCANUM],
    featureOverrides: {
      [CLASS_FEATURE.MYSTIC_ARCANUM]: {
        description: createMysticArcanumDescription(8),
        isTracked: true
      }
    },
    eldritchInvocations: 9,
    cantrips: 4,
    preparedSpells: 13,
    pactMagicSlots: 3,
    slotLevel: 5,
    spellSlots: [0, 0, 0, 0, 3, 0, 0, 0, 0]
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    eldritchInvocations: 9,
    cantrips: 4,
    preparedSpells: 13,
    pactMagicSlots: 3,
    slotLevel: 5,
    spellSlots: [0, 0, 0, 0, 3, 0, 0, 0, 0]
  },
  {
    level: 17,
    classFeatures: [CLASS_FEATURE.MYSTIC_ARCANUM],
    featureOverrides: {
      [CLASS_FEATURE.MYSTIC_ARCANUM]: {
        description: createMysticArcanumDescription(9),
        isTracked: true
      }
    },
    eldritchInvocations: 9,
    cantrips: 4,
    preparedSpells: 14,
    pactMagicSlots: 4,
    slotLevel: 5,
    spellSlots: [0, 0, 0, 0, 4, 0, 0, 0, 0]
  },
  {
    level: 18,
    classFeatures: [],
    eldritchInvocations: 10,
    cantrips: 4,
    preparedSpells: 14,
    pactMagicSlots: 4,
    slotLevel: 5,
    spellSlots: [0, 0, 0, 0, 4, 0, 0, 0, 0]
  },
  {
    level: 19,
    classFeatures: [CLASS_FEATURE.EPIC_BOON],
    featureOverrides: {
      [CLASS_FEATURE.EPIC_BOON]: {
        description: [
          "You gain an Epic Boon feat, or another feat of your choice for which you qualify.",
          "<feat:BOON_OF_FATE>Boon of Fate</feat> is recommended."
        ],
        isTracked: true
      }
    },
    eldritchInvocations: 10,
    cantrips: 4,
    preparedSpells: 15,
    pactMagicSlots: 4,
    slotLevel: 5,
    spellSlots: [0, 0, 0, 0, 4, 0, 0, 0, 0]
  },
  {
    level: 20,
    classFeatures: [CLASS_FEATURE.ELDRITCH_MASTER],
    eldritchInvocations: 10,
    cantrips: 4,
    preparedSpells: 15,
    pactMagicSlots: 4,
    slotLevel: 5,
    spellSlots: [0, 0, 0, 0, 4, 0, 0, 0, 0]
  }
];

export const warlockFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.ELDRITCH_INVOCATIONS]: {
    description: [
      "You have unearthed Eldritch Invocations, pieces of forbidden knowledge that imbue you with an abiding magical ability or other lessons. You gain one invocation of your choice, such as Pact of the Tome. Invocations are described in the Eldritch Invocation Options section later in this class's description.",
      "<strong>Prerequisites.</strong> If an invocation has a prerequisite, you must meet it to learn that invocation. For example, if an invocation requires you to be a level 5+ Warlock, you can select the invocation once you reach Warlock level 5.",
      "<strong>Replacing and Gaining Invocations.</strong> Whenever you gain a Warlock level, you can replace one of your invocations with another one for which you qualify. You can't replace an invocation if it's a prerequisite for another invocation that you have.",
      "When you gain certain Warlock levels, you gain more invocations of your choice, as shown in the Invocations column of the Warlock Features table.",
      "You can't pick the same invocation more than once unless its description says otherwise."
    ],
    isTracked: true
  },
  [CLASS_FEATURE.PACT_MAGIC]: {
    description: [
      "Through occult ceremony, you have formed a pact with a mysterious entity to gain magical powers. The entity is a voice in the shadows, its identity unclear, but its boon to you is concrete: the ability to cast spells. See 'Spells' for the rules on spellcasting. The information below details how you use those rules with Warlock spells, which appear in the Warlock spell list later in the class's description.",
      "<strong>Cantrips.</strong> You know two Warlock cantrips of your choice. Eldritch Blast and Prestidigitation are recommended. Whenever you gain a Warlock level, you can replace one of your cantrips from this feature with another Warlock cantrip of your choice.",
      "When you reach Warlock levels 4 and 10, you learn another Warlock cantrip of your choice, as shown in the Cantrips column of the Warlock Features table.",
      "<strong>Spell Slots.</strong> The Warlock Features table shows how many spell slots you have to cast your Warlock spells of levels 1 through 5. The table also shows the level of those slots, all of which are the same level. You regain all expended Pact Magic spell slots when you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
      "For example, when you're a level 5 Warlock, you have two level 3 spell slots. To cast the level 1 spell Witch Bolt, you must spend one of those slots, and you cast it as a level 3 spell.",
      "<strong>Prepared Spells of Level 1+.</strong> You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose two level 1 Warlock spells. Charm Person and Hex are recommended.",
      "The number of spells on your list increases as you gain Warlock levels, as shown in the Prepared Spells column of the Warlock Features table. Whenever that number increases, choose additional Warlock spells until the number of spells on your list matches the number in the table. The chosen spells must be of a level no higher than what's shown in the table's Slot Level column for your level.",
      "If another Warlock feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Warlock spells for you.",
      "<strong>Changing Your Prepared Spells.</strong> Whenever you gain a Warlock level, you can replace one spell on your list with another Warlock spell of an eligible level.",
      "<strong>Spellcasting Ability.</strong> Charisma is the spellcasting ability for your Warlock spells.",
      "<strong>Spellcasting Focus.</strong> You can use an Arcane Focus as a Spellcasting Focus for your Warlock spells."
    ],
    isTracked: true
  },
  [CLASS_FEATURE.MAGICAL_CUNNING]: {
    description: [
      "You can perform an esoteric rite for 1 minute.",
      "At the end of it, you regain expended Pact Magic spell slots but no more than a number equal to half your maximum, rounded up.",
      "Once you use this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link>."
    ],
    isTracked: true
  },
  [CLASS_FEATURE.CONTACT_PATRON]: {
    description: [
      "In the past, you usually contacted your patron through intermediaries. Now you can communicate directly; you always have the <spell:Contact Other Plane>Contact Other Plane</spell> spell prepared.",
      "With this feature, you can cast the spell without expending a spell slot to contact your patron, and you automatically succeed on the spell's saving throw.",
      "Once you cast the spell with this feature, you can't do so in this way again until you finish a <link:long-rest>Long Rest</link>."
    ],
    isTracked: true
  },
  [CLASS_FEATURE.MYSTIC_ARCANUM]: {
    description: createMysticArcanumDescription(6),
    isTracked: true
  },
  [CLASS_FEATURE.ELDRITCH_MASTER]: {
    description: [
      "When you use your Magical Cunning feature, you regain all your expended Pact Magic spell slots."
    ],
    isTracked: true
  }
};

export const useWarlockSpellEntries = createUseSpellEntriesForSpellListClass(
  SPELL_LIST_CLASS.WARLOCK
);
