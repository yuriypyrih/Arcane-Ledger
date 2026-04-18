import { CLASS_FEATURE, SPELL_LIST_CLASS, TRACKER } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";
import { createUseSpellEntriesForSpellListClass } from "./spellAccess";

export type DruidSpellSlotProgression = [
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

export type DruidFeatureClassObj = FeatureClassObj & {
  wildShape: number;
  cantrips: number;
  preparedSpells: number;
  spellSlots: DruidSpellSlotProgression;
};

export const druidFeatures: DruidFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [CLASS_FEATURE.SPELLCASTING, CLASS_FEATURE.DRUIDIC, CLASS_FEATURE.PRIMAL_ORDER],
    featureOverrides: {
      [CLASS_FEATURE.SPELLCASTING]: {
        description: [
          "You have learned to cast spells through studying the mystical forces of nature.",
          "<strong>Cantrips.</strong> You know two cantrips of your choice from the Druid spell list. <spell:Druidcraft>Druidcraft</spell> and <spell:Produce Flame>Produce Flame</spell> are recommended.",
          "Whenever you gain a Druid level, you can replace one of your cantrips with another cantrip of your choice from the Druid spell list.",
          "When you reach Druid levels 4 and 10, you learn another cantrip of your choice from the Druid spell list, as shown in the Cantrips column of the Druid Features table.",
          "<strong>Spell Slots.</strong> The Druid Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Prepared Spells of Level 1+.</strong> You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Druid spell list. <spell:Animal Friendship>Animal Friendship</spell>, <spell:Cure Wounds>Cure Wounds</spell>, <spell:Faerie Fire>Faerie Fire</spell>, and <spell:Thunderwave>Thunderwave</spell> are recommended.",
          "The number of spells on your list increases as you gain Druid levels, as shown in the Prepared Spells column of the Druid Features table. Whenever that number increases, choose additional spells from the Druid spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots.",
          "If another Druid feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Druid spells for you.",
          "<strong>Changing Your Prepared Spells.</strong> Whenever you finish a <link:long-rest>Long Rest</link>, you can change your list of prepared spells, replacing any of the spells with other Druid spells for which you have spell slots.",
          "<strong>Spellcasting Ability.</strong> <link:WIS>Wisdom</link> is your spellcasting ability for your Druid spells.",
          "<strong>Spellcasting Focus.</strong> You can use a Druidic Focus as a Spellcasting Focus for your Druid spells."
        ],
        trackingState: TRACKER.TRACKED
      }
    },
    wildShape: 0,
    cantrips: 2,
    preparedSpells: 4,
    spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 2,
    classFeatures: [CLASS_FEATURE.WILD_SHAPE, CLASS_FEATURE.WILD_COMPANION],
    wildShape: 2,
    cantrips: 2,
    preparedSpells: 5,
    spellSlots: [3, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 3,
    classFeatures: [],
    wildShape: 2,
    cantrips: 2,
    preparedSpells: 6,
    spellSlots: [4, 2, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    wildShape: 2,
    cantrips: 3,
    preparedSpells: 7,
    spellSlots: [4, 3, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 5,
    classFeatures: [CLASS_FEATURE.WILD_RESURGENCE],
    wildShape: 2,
    cantrips: 3,
    preparedSpells: 9,
    spellSlots: [4, 3, 2, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 6,
    classFeatures: [],
    wildShape: 3,
    cantrips: 3,
    preparedSpells: 10,
    spellSlots: [4, 3, 3, 0, 0, 0, 0, 0, 0]
  },
  {
    level: 7,
    classFeatures: [CLASS_FEATURE.ELEMENTAL_FURY],
    wildShape: 3,
    cantrips: 3,
    preparedSpells: 11,
    spellSlots: [4, 3, 3, 1, 0, 0, 0, 0, 0]
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    wildShape: 3,
    cantrips: 3,
    preparedSpells: 12,
    spellSlots: [4, 3, 3, 2, 0, 0, 0, 0, 0]
  },
  {
    level: 9,
    classFeatures: [],
    wildShape: 3,
    cantrips: 3,
    preparedSpells: 14,
    spellSlots: [4, 3, 3, 3, 1, 0, 0, 0, 0]
  },
  {
    level: 10,
    classFeatures: [],
    wildShape: 3,
    cantrips: 4,
    preparedSpells: 15,
    spellSlots: [4, 3, 3, 3, 2, 0, 0, 0, 0]
  },
  {
    level: 11,
    classFeatures: [],
    wildShape: 3,
    cantrips: 4,
    preparedSpells: 16,
    spellSlots: [4, 3, 3, 3, 2, 1, 0, 0, 0]
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    wildShape: 3,
    cantrips: 4,
    preparedSpells: 16,
    spellSlots: [4, 3, 3, 3, 2, 1, 0, 0, 0]
  },
  {
    level: 13,
    classFeatures: [],
    wildShape: 3,
    cantrips: 4,
    preparedSpells: 17,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 0, 0]
  },
  {
    level: 14,
    classFeatures: [],
    wildShape: 3,
    cantrips: 4,
    preparedSpells: 17,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 0, 0]
  },
  {
    level: 15,
    classFeatures: [CLASS_FEATURE.IMPROVED_ELEMENTAL_FURY],
    wildShape: 3,
    cantrips: 4,
    preparedSpells: 18,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 0]
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    wildShape: 3,
    cantrips: 4,
    preparedSpells: 18,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 0]
  },
  {
    level: 17,
    classFeatures: [],
    wildShape: 4,
    cantrips: 4,
    preparedSpells: 19,
    spellSlots: [4, 3, 3, 3, 2, 1, 1, 1, 1]
  },
  {
    level: 18,
    classFeatures: [CLASS_FEATURE.BEAST_SPELLS],
    wildShape: 4,
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
          "<feat:BOON_OF_DIMENSIONAL_TRAVEL>Boon of Dimensional Travel</feat> is recommended."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }
    },
    wildShape: 4,
    cantrips: 4,
    preparedSpells: 21,
    spellSlots: [4, 3, 3, 3, 3, 2, 1, 1, 1]
  },
  {
    level: 20,
    classFeatures: [CLASS_FEATURE.ARCHDRUID],
    wildShape: 4,
    cantrips: 4,
    preparedSpells: 22,
    spellSlots: [4, 3, 3, 3, 3, 2, 2, 1, 1]
  }
];

export const druidFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.DRUIDIC]: {
    description: [
      "You know Druidic, the secret language of Druids. While learning this ancient tongue, you also unlocked the magic of communicating with animals; you always have the <spell:Speak with Animals>Speak with Animals</spell> spell prepared.",
      "You can use Druidic to leave hidden messages. You and others who know Druidic automatically spot such a message. Others spot the message's presence with a successful DC 15 Intelligence (Investigation) check but can't decipher it without magic."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.PRIMAL_ORDER]: {
    description: [
      "You have dedicated yourself to one of the following sacred roles of your choice.",
      "<strong>Magician.</strong> You know one extra cantrip from the Druid spell list. In addition, your mystical connection to nature gives you a bonus to your Intelligence (<link:Arcana>Arcana</link> or <link:Nature>Nature</link>) checks. The bonus equals your <link:WIS>Wisdom</link> modifier, minimum of +1.",
      "<strong>Warden.</strong> Trained for battle, you gain proficiency with <link:Martial weapons>Martial weapons</link> and training with <link:Medium armor>Medium armor</link>."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.WILD_SHAPE]: {
    description: [
      "The power of nature allows you to assume the form of an animal. As a Bonus Action, you shape-shift into a Beast form that you have learned for this feature. You stay in that form for a number of hours equal to half your Druid level or until you use Wild Shape again, have the Incapacitated condition, or die. You can also leave the form early as a Bonus Action.",
      "<strong>Number of Uses.</strong> You can use Wild Shape twice. You regain one expended use when you finish a <link:short-rest>Short Rest</link>, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
      "You gain additional uses when you reach certain Druid levels, as shown in the Wild Shape column of the Druid Features table.",
      "<strong>Known Forms.</strong> You know four Beast forms for this feature, chosen from among Beast stat blocks that have a maximum Challenge Rating of 1/4 and that lack a Fly Speed. The Rat, Riding Horse, Spider, and Wolf are recommended. Whenever you finish a <link:long-rest>Long Rest</link>, you can replace one of your known forms with another eligible form.",
      "When you reach certain Druid levels, your number of known forms and the maximum Challenge Rating for those forms increases, as shown in the Beast Shapes table. In addition, starting at level 8, you can adopt a form that has a Fly Speed.",
      "When choosing known forms, you may look in the Monster Manual or elsewhere for eligible Beasts if the Dungeon Master permits you to do so.",
      "<strong>Beast Shapes.</strong>",
      "Druid Level 2: 4 known forms, max CR 1/4, no Fly Speed.",
      "Druid Level 4: 6 known forms, max CR 1/2, no Fly Speed.",
      "Druid Level 8: 8 known forms, max CR 1, Fly Speed allowed.",
      "<strong>Rules While Shape-Shifted.</strong> While in a form, you retain your personality, memories, and ability to speak, and the following rules apply.",
      "<strong>Temporary Hit Points.</strong> When you assume a Wild Shape form, you gain a number of Temporary Hit Points equal to your Druid level.",
      "<strong>Game Statistics.</strong> Your game statistics are replaced by the Beast's stat block, but you retain your creature type; Hit Points; Hit Point Dice; Intelligence, Wisdom, and Charisma scores; class features; languages; and feats. You also retain your skill and saving throw proficiencies and use your Proficiency Bonus for them, in addition to gaining the proficiencies of the creature. If a skill or saving throw modifier in the Beast's stat block is higher than yours, use the one in the stat block.",
      "<strong>No Spellcasting.</strong> You can't cast spells, but shape-shifting doesn't break your Concentration or otherwise interfere with a spell you've already cast.",
      "<strong>Objects.</strong> Your ability to handle objects is determined by the form's limbs rather than your own. In addition, you choose whether your equipment falls in your space, merges into your new form, or is worn by it. Worn equipment functions as normal, but the DM decides whether it's practical for the new form to wear a piece of equipment based on the creature's size and shape. Your equipment doesn't change size or shape to match the new form, and any equipment that the new form can't wear must either fall to the ground or merge with the form. Equipment that merges with the form has no effect while you're in that form."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.WILD_COMPANION]: {
    description: [
      "You can summon a nature spirit that assumes an animal form to aid you. As a Magic action, you can expend a spell slot or a use of Wild Shape to cast the <spell:Find Familiar>Find Familiar</spell> spell without Material components.",
      "When you cast the spell in this way, the familiar is Fey and disappears when you finish a <link:long-rest>Long Rest</link>."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.WILD_RESURGENCE]: {
    description: [
      "Once on each of your turns, if you have no uses of Wild Shape left, you can give yourself one use by expending a spell slot, no action required.",
      "In addition, you can expend one use of Wild Shape, no action required, to give yourself a level 1 spell slot, but you can't do so again until you finish a <link:long-rest>Long Rest</link>."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.ELEMENTAL_FURY]: {
    description: [
      "The might of the elements flows through you. You gain one of the following options of your choice.",
      "<strong>Potent Spellcasting.</strong> Add your Wisdom modifier to the damage you deal with any Druid cantrip.",
      "<strong>Primal Strike.</strong> Once on each of your turns when you hit a creature with an attack roll using a weapon or a Beast form's attack in Wild Shape, you can cause the target to take an extra 1d8 Cold, Fire, Lightning, or Thunder damage, choose when you hit."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.IMPROVED_ELEMENTAL_FURY]: {
    description: [
      "The option you chose for Elemental Fury grows more powerful, as detailed below.",
      "<strong>Potent Spellcasting.</strong> When you cast a Druid cantrip with a range of 10 feet or greater, the spell's range increases by 300 feet.",
      "<strong>Primal Strike.</strong> The extra damage of your Primal Strike increases to 2d8."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.BEAST_SPELLS]: {
    description: [
      "While using Wild Shape, you can cast spells in Beast form, except for any spell that has a Material component with a cost specified or that consumes its Material component."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.ARCHDRUID]: {
    description: [
      "The vitality of nature constantly blooms within you, granting you the following benefits.",
      "<strong>Evergreen Wild Shape.</strong> Whenever you roll Initiative and have no uses of Wild Shape left, you regain one expended use of it.",
      "<strong>Nature Magician.</strong> You can convert uses of Wild Shape into a spell slot, no action required. Choose a number of your unexpended uses of Wild Shape and convert them into a single spell slot, with each use contributing 2 spell levels. For example, if you convert two uses of Wild Shape, you produce a level 4 spell slot. Once you use this benefit, you can't do so again until you finish a <link:long-rest>Long Rest</link>.",
      "<strong>Longevity.</strong> The primal magic that you wield causes you to age more slowly. For every ten years that pass, your body ages only one year."
    ],
    trackingState: TRACKER.TRACKED
  }
};

export const useDruidSpellEntries = createUseSpellEntriesForSpellListClass(SPELL_LIST_CLASS.DRUID);
