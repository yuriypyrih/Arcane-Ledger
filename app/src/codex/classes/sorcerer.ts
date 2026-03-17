import { CLASS_FEATURE } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";

export type SorcererSpellSlotProgression = [
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

export type SorcererFeatureClassObj = FeatureClassObj & {
  sorceryPoints: number;
  cantrips: number;
  preparedSpells: number;
  spellSlots: SorcererSpellSlotProgression;
};

export const sorcererFeatures: SorcererFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [CLASS_FEATURE.SPELLCASTING, CLASS_FEATURE.INNATE_SORCERY],
    featureOverrides: {
      [CLASS_FEATURE.SPELLCASTING]: {
        description: [
          "Drawing from your innate magic, you can cast spells. See 'Spells' for the rules on spellcasting. The information below details how you use those rules with Sorcerer spells, which appear in the Sorcerer spell list later in the class's description.",
          "<strong>Cantrips.</strong> You know four Sorcerer cantrips of your choice. Light, Prestidigitation, Shocking Grasp, and Sorcerous Burst are recommended.",
          "Whenever you gain a Sorcerer level, you can replace one of your cantrips from this feature with another Sorcerer cantrip of your choice.",
          "When you reach Sorcerer levels 4 and 10, you learn another Sorcerer cantrip of your choice, as shown in the Cantrips column of the Sorcerer Features table.",
          "<strong>Spell Slots.</strong> The Sorcerer Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Prepared Spells of Level 1+.</strong> You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose two level 1 Sorcerer spells. Burning Hands and Detect Magic are recommended.",
          "The number of spells on your list increases as you gain Sorcerer levels, as shown in the Prepared Spells column of the Sorcerer Features table. Whenever that number increases, choose additional Sorcerer spells until the number of spells on your list matches the number in the Sorcerer Features table. The chosen spells must be of a level for which you have spell slots.",
          "If another Sorcerer feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Sorcerer spells for you.",
          "<strong>Changing Your Prepared Spells.</strong> Whenever you gain a Sorcerer level, you can replace one spell on your list with another Sorcerer spell for which you have spell slots.",
          "<strong>Spellcasting Ability.</strong> Charisma is your spellcasting ability for your Sorcerer spells.",
          "<strong>Spellcasting Focus.</strong> You can use an Arcane Focus as a Spellcasting Focus for your Sorcerer spells."
        ],
        isTracked: false
      }
    },
    sorceryPoints: 0,
    cantrips: 4,
    preparedSpells: 2,
    spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 2,
    classFeatures: [CLASS_FEATURE.FONT_OF_MAGIC, CLASS_FEATURE.METAMAGIC],
    sorceryPoints: 2,
    cantrips: 4,
    preparedSpells: 4,
    spellSlots: [3, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 3,
    classFeatures: [CLASS_FEATURE.SORCERER_SUBCLASS],
    sorceryPoints: 3,
    cantrips: 4,
    preparedSpells: 6,
    spellSlots: [4, 2, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    sorceryPoints: 4,
    cantrips: 5,
    preparedSpells: 7,
    spellSlots: [4, 3, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 5,
    classFeatures: [CLASS_FEATURE.SORCEROUS_RESTORATION],
    sorceryPoints: 5,
    cantrips: 5,
    preparedSpells: 9,
    spellSlots: [4, 3, 2, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 6,
    classFeatures: [CLASS_FEATURE.SUBCLASS_FEATURE],
    sorceryPoints: 6,
    cantrips: 5,
    preparedSpells: 10,
    spellSlots: [4, 3, 3, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 7,
    classFeatures: [CLASS_FEATURE.SORCERY_INCARNATE],
    sorceryPoints: 7,
    cantrips: 5,
    preparedSpells: 11,
    spellSlots: [4, 3, 3, 1, 0, 0, 0, 0, 0]
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    sorceryPoints: 8,
    cantrips: 5,
    preparedSpells: 12,
    spellSlots: [4, 3, 3, 2, 0, 0, 0, 0, 0]
  },
  {
    level: 9,
    classFeatures: [],
    sorceryPoints: 9,
    cantrips: 5,
    preparedSpells: 14,
    spellSlots: [4, 3, 3, 3, 1, 0, 0, 0, 0]
  },
  {
    level: 10,
    classFeatures: [CLASS_FEATURE.METAMAGIC],
    sorceryPoints: 10,
    cantrips: 6,
    preparedSpells: 15,
    spellSlots: [4, 3, 3, 3, 2, 0, 0, 0, 0]
  },
  {
    level: 11,
    classFeatures: [],
    sorceryPoints: 11,
    cantrips: 6,
    preparedSpells: 16,
    spellSlots: [4, 3, 3, 3, 2, 1, 0, 0, 0]
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    sorceryPoints: 12,
    cantrips: 6,
    preparedSpells: 16,
    spellSlots: [4, 3, 3, 3, 2, 1, 0, 0, 0]
  },
  {
    level: 13,
    classFeatures: [],
    sorceryPoints: 13,
    cantrips: 6,
    preparedSpells: 17,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 0, 0]
  },
  {
    level: 14,
    classFeatures: [CLASS_FEATURE.SUBCLASS_FEATURE],
    sorceryPoints: 14,
    cantrips: 6,
    preparedSpells: 17,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 0, 0]
  },
  {
    level: 15,
    classFeatures: [],
    sorceryPoints: 15,
    cantrips: 6,
    preparedSpells: 18,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 0]
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    sorceryPoints: 16,
    cantrips: 6,
    preparedSpells: 18,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 0]
  },
  {
    level: 17,
    classFeatures: [CLASS_FEATURE.METAMAGIC],
    sorceryPoints: 17,
    cantrips: 6,
    preparedSpells: 19,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 1]
  },
  {
    level: 18,
    classFeatures: [CLASS_FEATURE.SUBCLASS_FEATURE],
    sorceryPoints: 18,
    cantrips: 6,
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
          "Boon of Dimensional Travel is recommended."
        ],
        isTracked: false
      }
    },
    sorceryPoints: 19,
    cantrips: 6,
    preparedSpells: 21,
    spellSlots: [4, 3, 3, 3, 3, 2, 1, 1, 1]
  },
  {
    level: 20,
    classFeatures: [CLASS_FEATURE.ARCANE_APOTHEOSIS],
    sorceryPoints: 20,
    cantrips: 6,
    preparedSpells: 22,
    spellSlots: [4, 3, 3, 3, 3, 2, 2, 1, 1]
  }
];

export const sorcererFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.INNATE_SORCERY]: {
    description: [
      "An event in your past left an indelible mark on you, infusing you with simmering magic. As a Bonus Action, you can unleash that magic for 1 minute, during which you gain the following benefits:",
      "The spell save DC of your Sorcerer spells increases by 1.",
      "You have Advantage on the attack rolls of Sorcerer spells you cast.",
      "You can use this feature twice, and you regain all expended uses of it when you finish a <link:long-rest>Long Rest</link>."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.FONT_OF_MAGIC]: {
    description: [
      "You can tap into the wellspring of magic within yourself. This wellspring is represented by Sorcery Points, which allow you to create a variety of magical effects.",
      "You have 2 Sorcery Points, and you gain more as you reach higher levels, as shown in the Sorcery Points column of the Sorcerer Features table. You can't have more Sorcery Points than the number shown in the table for your level. You regain all expended Sorcery Points when you finish a <link:long-rest>Long Rest</link>.",
      "You can use your Sorcery Points to fuel the options below, along with other features, such as Metamagic, that use those points.",
      "<strong>Converting Spell Slots to Sorcery Points.</strong> You can expend a spell slot to gain a number of Sorcery Points equal to the slot's level, with no action required.",
      "<strong>Creating Spell Slots.</strong> As a Bonus Action, you can transform unexpended Sorcery Points into one spell slot. The Creating Spell Slots table shows the cost of creating a spell slot of a given level, and it lists the minimum Sorcerer level you must be to create a slot. You can create a spell slot no higher than level 5.",
      "Any spell slot you create with this feature vanishes when you finish a <link:long-rest>Long Rest</link>.",
      "<strong>Creating Spell Slots.</strong> Level 1 slot: 2 Sorcery Points, minimum Sorcerer level 2.",
      "<strong>Creating Spell Slots.</strong> Level 2 slot: 3 Sorcery Points, minimum Sorcerer level 3.",
      "<strong>Creating Spell Slots.</strong> Level 3 slot: 5 Sorcery Points, minimum Sorcerer level 5.",
      "<strong>Creating Spell Slots.</strong> Level 4 slot: 6 Sorcery Points, minimum Sorcerer level 7.",
      "<strong>Creating Spell Slots.</strong> Level 5 slot: 7 Sorcery Points, minimum Sorcerer level 9."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.METAMAGIC]: {
    description: [
      "Because your magic flows from within, you can alter your spells to suit your needs; you gain two Metamagic options of your choice. You use the chosen options to temporarily modify spells you cast. To use an option, you must spend the number of Sorcery Points that it costs.",
      "You can use only one Metamagic option on a spell when you cast it unless otherwise noted in one of those options.",
      "Whenever you gain a Sorcerer level, you can replace one of your Metamagic options with one you don't know. You gain two more options at Sorcerer level 10 and two more at Sorcerer level 17.",
      "<strong>Careful Spell.</strong> Cost: 1 Sorcery Point.",
      "When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures from the spell's full force. Choose a number of those creatures up to your Charisma modifier, minimum of one creature. A chosen creature automatically succeeds on its saving throw against the spell, and it takes no damage if it would normally take half damage on a successful save.",
      "<strong>Distant Spell.</strong> Cost: 1 Sorcery Point.",
      "When you cast a spell that has a range of at least 5 feet, you can double the spell's range. Or when you cast a spell that has a range of Touch, you can make the spell's range 30 feet.",
      "<strong>Empowered Spell.</strong> Cost: 1 Sorcery Point.",
      "When you roll damage for a spell, you can reroll a number of the damage dice up to your Charisma modifier, minimum of one, and you must use the new rolls.",
      "You can use Empowered Spell even if you've already used a different Metamagic option during the casting of the spell.",
      "<strong>Extended Spell.</strong> Cost: 1 Sorcery Point.",
      "When you cast a spell that has a duration of 1 minute or longer, you can double its duration to a maximum duration of 24 hours.",
      "If the affected spell requires Concentration, you have Advantage on any saving throw you make to maintain that Concentration.",
      "<strong>Heightened Spell.</strong> Cost: 2 Sorcery Points.",
      "When you cast a spell that forces a creature to make a saving throw, you can give one target of the spell Disadvantage on saves against the spell.",
      "<strong>Quickened Spell.</strong> Cost: 2 Sorcery Points.",
      "When you cast a spell that has a casting time of an action, you can change the casting time to a Bonus Action for this casting. You can't modify a spell in this way if you've already cast a level 1+ spell on the current turn, nor can you cast a level 1+ spell on this turn after modifying a spell in this way.",
      "<strong>Seeking Spell.</strong> Cost: 1 Sorcery Point.",
      "If you make an attack roll for a spell and miss, you can reroll the d20, and you must use the new roll.",
      "You can use Seeking Spell even if you've already used a different Metamagic option during the casting of the spell.",
      "<strong>Subtle Spell.</strong> Cost: 1 Sorcery Point.",
      "When you cast a spell, you can cast it without any Verbal, Somatic, or Material components, except Material components that are consumed by the spell or that have a cost specified in the spell.",
      "<strong>Transmuted Spell.</strong> Cost: 1 Sorcery Point.",
      "When you cast a spell that deals Acid, Cold, Fire, Lightning, Poison, or Thunder damage, you can change that damage type to one of the other listed types.",
      "<strong>Twinned Spell.</strong> Cost: 1 Sorcery Point.",
      "When you cast a spell that can be cast with a higher-level spell slot to target an additional creature, you can increase the spell's effective level by 1."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.SORCERER_SUBCLASS]: {
    description: [
      "You gain a Sorcerer subclass of your choice. The Draconic Sorcery subclass is detailed after this class's description.",
      "A subclass is a specialization that grants you features at certain Sorcerer levels.",
      "For the rest of your career, you gain each of your subclass's features that are of your Sorcerer level or lower."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.SORCEROUS_RESTORATION]: {
    description: [
      "When you finish a <link:short-rest>Short Rest</link>, you can regain expended Sorcery Points, but no more than a number equal to half your Sorcerer level, rounded down.",
      "Once you use this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link>."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.SORCERY_INCARNATE]: {
    description: [
      "If you have no uses of Innate Sorcery left, you can use it if you spend 2 Sorcery Points when you take the Bonus Action to activate it.",
      "In addition, while your Innate Sorcery feature is active, you can use up to two of your Metamagic options on each spell you cast."
    ],
    isTracked: false
  },
  [CLASS_FEATURE.ARCANE_APOTHEOSIS]: {
    description: [],
    isTracked: false
  }
};
