import { CLASS_FEATURE, TRACKER } from "../entries/enums";
import type {
  FeatureMapEntry,
  SubclassEntry,
  SubclassFeatureClassObj,
  SubclassFeatureLevel
} from "../entries/types";

const SUBCLASS_FEATURE_LEVELS = {
  LEVEL_3: 3,
  LEVEL_6: 6,
  LEVEL_10: 10,
  LEVEL_14: 14
} as const;

function createSubclassFeatureRow(
  level: SubclassFeatureLevel,
  feature: CLASS_FEATURE,
  details: FeatureMapEntry
): SubclassFeatureClassObj {
  return {
    level,
    classFeatures: [feature],
    featureOverrides: {
      [feature]: details
    }
  };
}

function createSchoolSavantDescription(schoolName: string): string[] {
  return [
    `Choose two Wizard spells from the ${schoolName} school, each of which must be no higher than level 2, and add them to your spellbook for free.`,
    `In addition, whenever you gain access to a new level of spell slots in this class, you can add one Wizard spell from the ${schoolName} school to your spellbook for free. The chosen spell must be of a level for which you have spell slots.`
  ];
}

const notTracked = { trackingState: TRACKER.NOT_TRACKED } as const;

export const wizardSubclassEntries: SubclassEntry[] = [
  {
    id: "wizard-abjurer",
    name: "Abjurer",
    className: "Wizard",
    tagline: "Shield Companions and Banish Foes",
    summary:
      "Your study of magic is focused on spells that block, banish, or protect, ending harmful effects, banishing evil influences, and protecting the weak. Abjurers are sought when baleful spirits require exorcism, when locations must be guarded against magical spying, and when portals to other planes of existence must be closed. Adventuring parties value Abjurers for the protection they provide against a variety of hostile magic and other attacks.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.ABJURATION_SAVANT,
        {
          description: createSchoolSavantDescription("Abjuration"),
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.ARCANE_WARD, {
        description: [
          "You can weave magic around yourself for protection. When you cast an Abjuration spell with a spell slot, you can simultaneously use a strand of the spell's magic to create a magical ward on yourself that lasts until you finish a <link:long-rest>Long Rest</link>.",
          "The ward has a Hit Point maximum equal to twice your Wizard level plus your <link:INT>Intelligence</link> modifier.",
          "Whenever you take damage, the ward takes the damage instead, and if you have any <link:Resistance>Resistances</link> or <link:Vulnerability>Vulnerabilities</link>, apply them before reducing the ward's Hit Points.",
          "If the damage reduces the ward to 0 Hit Points, you take any remaining damage.",
          "While the ward has 0 Hit Points, it can't absorb damage, but its magic remains.",
          "Whenever you cast an Abjuration spell with a spell slot, the ward regains a number of Hit Points equal to twice the level of the spell slot.",
          "Alternatively, as a Bonus Action, you can expend a spell slot, and the ward regains a number of Hit Points equal to twice the level of the spell slot expended.",
          "Once you create the ward, you can't create it again until you finish a <link:long-rest>Long Rest</link>."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.PROJECTED_WARD,
        {
          description: [
            "When a creature that you can see within 30 feet of yourself takes damage, you can take a Reaction to cause your Arcane Ward to absorb that damage.",
            "If this damage reduces the ward to 0 Hit Points, the warded creature takes any remaining damage.",
            "If that creature has any <link:Resistance>Resistances</link> or <link:Vulnerability>Vulnerabilities</link>, apply them before reducing the ward's Hit Points."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_10,
        CLASS_FEATURE.SPELL_BREAKER,
        {
          description: [
            "You always have the <spell:Counterspell>Counterspell</spell> and <spell:Dispel Magic>Dispel Magic</spell> spells prepared.",
            "In addition, you can cast <spell:Dispel Magic>Dispel Magic</spell> as a Bonus Action, and you can add your <link:Proficiency Bonus>Proficiency Bonus</link> to its ability check.",
            "When you cast either spell with a spell slot, that slot isn't expended if the spell fails to stop a spell."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_14,
        CLASS_FEATURE.SPELL_RESISTANCE,
        {
          description: [
            "You have <link:Advantage>Advantage</link> on saving throws against spells, and you have <link:Resistance>Resistance</link> to the damage of spells."
          ],
          ...notTracked
        }
      )
    ]
  },
  {
    id: "wizard-bladesinger",
    name: "Bladesinger",
    className: "Wizard",
    tagline: "Wield Weapon and Wizardry in Elegant Tandem",
    summary:
      "Bladesingers master a tradition of wizardry that incorporates swordplay and dance. In combat, a Bladesinger uses intricate, elegant maneuvers that fend off harm and allow the Bladesinger to channel magic into devastating attacks and a cunning defense. Many who have observed a Bladesinger at work remember the display as one of the more beautiful experiences in their life, a glorious dance accompanied by a singing blade.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.BLADESONG, {
        description: [
          "As a Bonus Action, you invoke an elven magic called the Bladesong, provided you aren't wearing armor or using a <link:Shield>Shield</link>.",
          "The Bladesong lasts for 1 minute and ends early if you have the <link:Incapacitated>Incapacitated</link> condition, if you don armor or a <link:Shield>Shield</link>, or if you use two hands to make an attack with a weapon.",
          "You can dismiss the Bladesong at any time (no action required).",
          "While the Bladesong is active, you gain the following benefits.",
          "You can invoke the Bladesong a number of times equal to your <link:INT>Intelligence</link> modifier (minimum of once), and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
          "You regain one expended use when you use Arcane Recovery.",
          "<strong>Agility.</strong> You gain a bonus to your <link:Armor Class>AC</link> equal to your <link:INT>Intelligence</link> modifier (minimum of +1), and your <link:Speed>Speed</link> increases by 10 feet.",
          "In addition, you have <link:Advantage>Advantage</link> on Dexterity (<link:Acrobatics>Acrobatics</link>) checks.",
          "<strong>Bladework.</strong> Whenever you attack with a weapon with which you have proficiency, you can use your <link:INT>Intelligence</link> modifier for the attack and damage rolls instead of using Strength or Dexterity.",
          "<strong>Focus.</strong> When you make a <link:Constitution Saving Throw>Constitution saving throw</link> to maintain <link:Concentration>Concentration</link>, you can add your <link:INT>Intelligence</link> modifier to the total."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.TRAINING_IN_WAR_AND_SONG,
        {
          description: [
            "You gain proficiency with all Melee <link:Martial weapons>Martial weapons</link> that don't have the <link:Two-Handed>Two-Handed</link> or <link:Heavy>Heavy</link> property.",
            "You can use a Melee weapon with which you have proficiency as a Spellcasting Focus for your Wizard spells.",
            "You also gain proficiency in one of the following skills of your choice: <link:Acrobatics>Acrobatics</link>, <link:Athletics>Athletics</link>, <link:Performance>Performance</link>, or <link:Persuasion>Persuasion</link>."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.EXTRA_ATTACK, {
        description: [
          "You can attack twice, instead of once, whenever you take the Attack action on your turn.",
          "Moreover, you can cast one of your Wizard cantrips that has a casting time of an action in place of one of those attacks."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_10,
        CLASS_FEATURE.SONG_OF_DEFENSE,
        {
          description: [
            "When you take damage while your Bladesong is active, you can take a Reaction to expend one spell slot and reduce the damage taken by an amount equal to five times the spell slot's level."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_14,
        CLASS_FEATURE.SONG_OF_VICTORY,
        {
          description: [
            "After you cast a spell that has a casting time of an action, you can make one attack with a weapon as a Bonus Action."
          ],
          ...notTracked
        }
      )
    ]
  },
  {
    id: "wizard-diviner",
    name: "Diviner",
    className: "Wizard",
    tagline: "Learn the Secrets of the Multiverse",
    summary:
      "The counsel of a Diviner is sought by those who want a clearer understanding of the past, present, and future. As a Diviner, you strive to part the veils of space, time, and consciousness. You work to master spells of discernment, remote viewing, supernatural knowledge, and foresight.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.DIVINATION_SAVANT,
        {
          description: createSchoolSavantDescription("Divination"),
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PORTENT, {
        description: [
          "Glimpses of the future begin to press on your awareness.",
          "Whenever you finish a <link:long-rest>Long Rest</link>, roll two <strong>d20s</strong> and record the numbers rolled.",
          "You can replace any <strong>D20</strong> Test made by you or a creature that you can see with one of these foretelling rolls.",
          "You must choose to do so before the roll, and you can replace a roll in this way only once per turn.",
          "Each foretelling roll can be used only once.",
          "When you finish a <link:long-rest>Long Rest</link>, you lose any unused foretelling rolls."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.EXPERT_DIVINATION,
        {
          description: [
            "Casting Divination spells comes so easily to you that it expends only a fraction of your spellcasting efforts.",
            "When you cast a Divination spell using a level 2+ spell slot, you regain one expended spell slot.",
            "The slot you regain must be of a level lower than the slot you expended and can't be higher than level 5."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.THE_THIRD_EYE, {
        description: [
          "You can increase your powers of perception.",
          "As a Bonus Action, choose one of the following benefits, which lasts until you start a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
          "You can't use this feature again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
          "<strong>Darkvision.</strong> You gain <link:Darkvision>Darkvision</link> with a range of 120 feet.",
          "<strong>Greater Comprehension.</strong> You can read any language.",
          "<strong>See Invisibility.</strong> You can cast <spell:See Invisibility>See Invisibility</spell> without expending a spell slot."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_14,
        CLASS_FEATURE.GREATER_PORTENT,
        {
          description: [
            "The visions in your dreams intensify and paint a more accurate picture in your mind of what is to come.",
            "Roll three <strong>d20s</strong> for your Portent feature rather than two."
          ],
          ...notTracked
        }
      )
    ]
  },
  {
    id: "wizard-evoker",
    name: "Evoker",
    className: "Wizard",
    tagline: "Create Explosive Elemental Effects",
    summary:
      "Your studies focus on magic that creates powerful elemental effects such as bitter cold, searing flame, rolling thunder, crackling lightning, and burning acid. Some Evokers find employment in military forces, serving as artillery to blast armies from afar. Others use their power to protect others, while some seek their own gain.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.EVOCATION_SAVANT,
        {
          description: createSchoolSavantDescription("Evocation"),
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.POTENT_CANTRIP,
        {
          description: [
            "Your damaging cantrips affect even creatures that avoid the brunt of the effect.",
            "When you cast a cantrip at a creature and you miss with the attack roll or the target succeeds on a saving throw against the cantrip, the target takes half the cantrip's damage (if any) but suffers no additional effect from the cantrip."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.SCULPT_SPELLS,
        {
          description: [
            "You can create pockets of relative safety within the effects of your evocations.",
            "When you cast an Evocation spell that affects other creatures that you can see, you can choose a number of them equal to 1 plus the spell's level.",
            "The chosen creatures automatically succeed on their saving throws against the spell, and they take no damage if they would normally take half damage on a successful save."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_10,
        CLASS_FEATURE.EMPOWERED_EVOCATION,
        {
          description: [
            "Whenever you cast a Wizard spell from the Evocation school, you can add your <link:INT>Intelligence</link> modifier to one damage roll of that spell."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.OVERCHANNEL, {
        description: [
          "You can increase the power of your spells.",
          "When you cast a Wizard spell with a spell slot of levels 1-5 that deals damage, you can deal maximum damage with that spell on the turn you cast it.",
          "The first time you do so, you suffer no adverse effect.",
          "If you use this feature again before you finish a <link:long-rest>Long Rest</link>, you take <strong>2d12</strong> <link:Necrotic>Necrotic</link> damage for each level of the spell slot immediately after you cast it.",
          "This damage ignores <link:Resistance>Resistance</link> and <link:Immunity>Immunity</link>.",
          "Each time you use this feature again before finishing a <link:long-rest>Long Rest</link>, the Necrotic damage per spell level increases by <strong>1d12</strong>."
        ],
        ...notTracked
      })
    ]
  },
  {
    id: "wizard-illusionist",
    name: "Illusionist",
    className: "Wizard",
    tagline: "Weave Subtle Spells of Deception",
    summary:
      "You specialize in magic that dazzles the senses and tricks the mind, and the illusions you craft make the impossible seem real.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.ILLUSION_SAVANT,
        {
          description: createSchoolSavantDescription("Illusion"),
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.IMPROVED_ILLUSIONS,
        {
          description: [
            "You can cast Illusion spells without providing <link:v>Verbal</link> components, and if an Illusion spell you cast has a range of 10+ feet, the range increases by 60 feet.",
            "You also know the <spell:Minor Illusion>Minor Illusion</spell> cantrip.",
            "If you already know it, you learn a different Wizard cantrip of your choice.",
            "The cantrip doesn't count against your number of cantrips known.",
            "You can create both a sound and an image with a single casting of <spell:Minor Illusion>Minor Illusion</spell>, and you can cast it as a Bonus Action."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.PHANTASMAL_CREATURES,
        {
          description: [
            "You always have the <spell:Summon Beast>Summon Beast</spell> and <spell:Summon Fey>Summon Fey</spell> spells prepared.",
            "Whenever you cast either spell, you can change its school to Illusion, which causes the summoned creature to appear spectral.",
            "You can cast the Illusion version of each spell without expending a spell slot, but casting it without a slot halves the creature's Hit Points.",
            "Once you cast either spell without a spell slot, you must finish a <link:long-rest>Long Rest</link> before you can cast the spell in that way again."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_10,
        CLASS_FEATURE.ILLUSORY_SELF,
        {
          description: [
            "When a creature hits you with an attack roll, you can take a Reaction to interpose an illusory duplicate of yourself between the attacker and yourself.",
            "The attack automatically misses you, then the illusion dissipates.",
            "Once you use this feature, you can't use it again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
            "You can also restore your use of it by expending a level 2+ spell slot (no action required)."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_14,
        CLASS_FEATURE.ILLUSORY_REALITY,
        {
          description: [
            "You have learned to weave shadow magic into your illusions to give them a semi-reality.",
            "When you cast an Illusion spell with a spell slot, you can choose one inanimate, nonmagical object that is part of the illusion and make that object real.",
            "You can do this on your turn as a Bonus Action while the spell is ongoing.",
            "The object remains real for 1 minute, during which it can't deal damage or give any conditions.",
            "For example, you can create an illusion of a bridge over a chasm and then make it real and cross it."
          ],
          ...notTracked
        }
      )
    ]
  }
];
