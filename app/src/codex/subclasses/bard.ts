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
  LEVEL_14: 14
} as const;

export const mantleOfInspirationDescription = [
  "You can weave fey magic into a song or dance to fill others with vigor.",
  "As a Bonus Action, you can expend a use of Bardic Inspiration, rolling a Bardic Inspiration die.",
  "When you do so, choose a number of other creatures within 60 feet of yourself, up to a number equal to your <link:CHA>Charisma</link> modifier (minimum of one creature).",
  "Each of those creatures gains a number of <link:Temporary Hit Points>Temporary Hit Points</link> equal to two times the number rolled on the Bardic Inspiration die, and then each can use its Reaction to move up to its Speed without provoking Opportunity Attacks."
] as const;

export const cuttingWordsDescription = [
  "You learn to use your wit to supernaturally distract, confuse, and otherwise sap the confidence and competence of others.",
  "When a creature that you can see within 60 feet of yourself makes a damage roll or succeeds on an ability check or attack roll, you can take a Reaction to expend one use of your Bardic Inspiration; roll your Bardic Inspiration die, and subtract the number rolled from the creature's roll, reducing the damage or potentially turning the success into a failure."
] as const;

export const inspiredEclipseDescription = [
  "<strong>Inspired Eclipse.</strong> When you take a Bonus Action to give a creature a Bardic Inspiration die, you can have the <link:Invisible>Invisible</link> condition and teleport up to 30 feet to an unoccupied space you can see as part of that Bonus Action. This invisibility lasts until the start of your next turn and ends early immediately after you make an attack roll, deal damage, or cast a spell."
] as const;

export const shadowOfTheNewMoonDescription = [
  "<strong>Shadow of the New Moon.</strong> When you use Inspired Eclipse, the creature who received the Bardic Inspiration die can also have the <link:Invisible>Invisible</link> condition and immediately take a Reaction to teleport up to 30 feet to an unoccupied space it can see. The creature remains Invisible until the start of its next turn."
] as const;

export const blessingOfMoonlightDescription = [
  "<strong>Blessing of Moonlight.</strong> When you cast Moonbeam, you can modify the spell so that you glow faintly while the spell is active. While glowing, you shed Dim Light out to 5 feet, and whenever a creature fails its saving throw against the effects of this Moonbeam, another creature of your choice that you can see within 60 feet of yourself regains <strong>2d4</strong> Hit Points.",
  "Once you use this feature to modify a casting of Moonbeam, you can't use it again until you finish a <link:long-rest>Long Rest</link>."
] as const;

export const mantleOfMajestyDescription = [
  "You always have the <spell:Command>Command</spell> spell prepared.",
  "As a Bonus Action, you cast Command without expending a spell slot, and you take on an unearthly appearance for 10 turns or until your <link:Concentration>Concentration</link> ends.",
  "During this time, you can cast Command as a Bonus Action without expending a spell slot.",
  "Any creature <link:Charmed>Charmed</link> by you automatically fails its saving throw against the Command you cast with this feature.",
  "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link>.",
  "You can also restore your use of it by expending a level 3+ spell slot (no action required)."
] as const;

export const unbreakableMajestyDescription = [
  "As a Bonus Action, you can assume a magically majestic presence for 10 turns or until you have the <link:Incapacitated>Incapacitated</link> condition.",
  "For the duration, whenever any creature hits you with an attack roll for the first time on a turn, the attacker must succeed on a <link:Charisma saving throw>Charisma saving throw</link> against your spell save DC, or the attack misses instead, as the creature recoils from your majesty.",
  "Once you assume this majestic presence, you can't do so again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>."
] as const;

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

export const inspiringMovementDescription = [
  "When an enemy you can see ends its turn within 5 feet of you, you can take a Reaction and expend one use of your Bardic Inspiration to move up to half your Speed.",
  "Then one ally of your choice within 30 feet of you can also move up to half their Speed using their Reaction.",
  "None of this feature's movement provokes Opportunity Attacks."
] as const;

export const bardSubclassEntries: SubclassEntry[] = [
  {
    id: "bard-college-of-dance",
    name: "College of Dance",
    className: "Bard",
    tagline: "Move in Harmony with the Cosmos",
    summary:
      "Bards of the College of Dance know that the Words of Creation can't be contained within speech or song; the words are uttered by the movements of celestial bodies and flow through the motions of the smallest creatures. These Bards practice a way of being in harmony with the whirling cosmos that emphasizes agility, speed, and grace.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.DAZZLING_FOOTWORK, {
        description: [
          "While you aren't wearing armor or wielding a <link:Shield>Shield</link>, you gain the following benefits.",
          "<strong>Dance Virtuoso.</strong> You have <link:Advantage>Advantage</link> on any <link:Charisma>Charisma</link> (<link:Performance>Performance</link>) check you make that involves you dancing.",
          "<strong>Unarmored Defense.</strong> Your base <link:Armor Class>Armor Class</link> equals 10 plus your <link:DEX>Dexterity</link> and <link:CHA>Charisma</link> modifiers.",
          "<strong>Agile Strikes.</strong> When you expend a use of your Bardic Inspiration as part of an action, a Bonus Action, or a Reaction, you can make one Unarmed Strike as part of that action, Bonus Action, or Reaction.",
          "<strong>Bardic Damage.</strong> You can use <link:DEX>Dexterity</link> instead of <link:STR>Strength</link> for the attack rolls of your Unarmed Strikes. When you deal damage with an Unarmed Strike, you can deal <link:Bludgeoning>Bludgeoning</link> damage equal to a roll of your Bardic Inspiration die plus your <link:DEX>Dexterity</link> modifier, instead of the strike's normal damage. This roll doesn't expend the die."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.INSPIRING_MOVEMENT, {
        description: [...inspiringMovementDescription],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.TANDEM_FOOTWORK, {
        description: [
          "When you roll <link:Initiative>Initiative</link>, you can expend one use of your Bardic Inspiration if you don't have the <link:Incapacitated>Incapacitated</link> condition.",
          "When you do so, roll your Bardic Inspiration die; you and each ally within 30 feet of you who can see or hear you gain a bonus to Initiative equal to the number rolled."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.LEADING_EVASION, {
        description: [
          "When you are subjected to an effect that allows you to make a <link:Dexterity saving throw>Dexterity saving throw</link> to take only half damage, you instead take no damage if you succeed on the saving throw and only half damage if you fail.",
          "If any creatures within 5 feet of you are making the same Dexterity saving throw, you can share this benefit with them for that save.",
          "You can't use this feature if you have the <link:Incapacitated>Incapacitated</link> condition."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "bard-college-of-glamour",
    name: "College of Glamour",
    className: "Bard",
    tagline: "Weave Beguiling Fey Magic",
    summary:
      "The College of Glamour traces its origins to the beguiling magic of the Feywild. Bards who study this magic weave threads of beauty and terror into their songs and stories, and the mightiest among them can cloak themselves in otherworldly majesty. Their performances stir up wistful longing for forgotten innocence, evoke unconscious memories of long-held fears, and tug at the emotions of even the most hard-hearted listeners.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.BEGUILING_MAGIC, {
        description: [
          "You always have the <spell:Charm Person>Charm Person</spell> and <spell:Mirror Image>Mirror Image</spell> spells prepared.",
          "In addition, immediately after you cast an Enchantment or Illusion spell using a spell slot, you can cause a creature you can see within 60 feet of yourself to make a <link:Wisdom Saving Throw>Wisdom saving throw</link> against your spell save DC.",
          "On a failed save, the target has the <link:Charmed>Charmed</link> or <link:Frightened>Frightened</link> condition (your choice) for 1 minute.",
          "The target repeats the save at the end of each of its turns, ending the effect on itself on a success.",
          "Once you use this benefit, you can't use it again until you finish a <link:long-rest>Long Rest</link>.",
          "You can also restore your use of it by expending one use of your Bardic Inspiration (no action required)."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.MANTLE_OF_INSPIRATION,
        {
          description: [...mantleOfInspirationDescription],
          trackingState: TRACKER.SEMI_TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.MANTLE_OF_MAJESTY, {
        description: [...mantleOfMajestyDescription],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_14,
        CLASS_FEATURE.UNBREAKABLE_MAJESTY,
        {
          description: [...unbreakableMajestyDescription],
          trackingState: TRACKER.SEMI_TRACKED
        }
      )
    ]
  },
  {
    id: "bard-college-of-lore",
    name: "College of Lore",
    className: "Bard",
    tagline: "Plumb the Depths of Magical Knowledge",
    summary:
      "Bards of the College of Lore collect spells and secrets from diverse sources, such as scholarly tomes, mystical rites, and peasant tales. The college's members gather in libraries and universities to share their lore with one another. They also meet at festivals or affairs of state, where they can expose corruption, unravel lies, and poke fun at self-important figures of authority.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.BONUS_PROFICIENCIES, {
        description: ["You gain proficiency with three skills of your choice."],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.CUTTING_WORDS, {
        description: [...cuttingWordsDescription],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.MAGICAL_DISCOVERIES, {
        description: [
          "You learn two spells of your choice.",
          "These spells can come from the Cleric, Druid, or Wizard spell list or any combination thereof.",
          "A spell you choose must be a cantrip or a spell for which you have spell slots, as shown in the Bard Features table.",
          "You always have the chosen spells prepared, and whenever you gain a Bard level, you can replace one of the spells with another spell that meets these requirements."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.PEERLESS_SKILL, {
        description: [
          "When you make an ability check or attack roll and fail, you can expend one use of your Bardic Inspiration; roll the Bardic Inspiration die, and add the number rolled to the <strong>d20</strong>, potentially turning a failure into a success.",
          "On a failure, the Bardic Inspiration isn't expended."
        ],
        trackingState: TRACKER.NOT_TRACKED
      })
    ]
  },
  {
    id: "bard-college-of-the-moon",
    name: "College of the Moon",
    className: "Bard",
    tagline: "Inspire Allies with Primal Tales",
    summary:
      "The College of the Moon traces its origins to the ancient druidic circles of the Moonshae Isles, who entrusted the first Bards of this tradition with chronicling the stories of the islands and their people. Bards of this college draw from the isles' fey magic and the primal power of the moonwells to bolster their allies, protect the natural world, and inspire their bardic works.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.MOONS_INSPIRATION, {
        description: [
          "The primal and ever-changing power of the moon flows through you, granting you the following benefits.",
          "<strong>Inspired Eclipse.</strong> When you take a Bonus Action to give a creature a Bardic Inspiration die, you can have the <link:Invisible>Invisible</link> condition and teleport up to 30 feet to an unoccupied space you can see as part of that Bonus Action.",
          "This invisibility lasts until the start of your next turn and ends early immediately after you make an attack roll, deal damage, or cast a spell.",
          "<strong>Lunar Vitality.</strong> Once per turn when you restore Hit Points to a creature with a spell, you can expend a Bardic Inspiration die and increase the amount of Hit Points restored by a number equal to a roll of the Bardic Inspiration die.",
          "The creature's Speed also increases by 10 feet until the end of its next turn."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PRIMAL_LORE, {
        description: [
          "You learn Druidic and one cantrip from the Druid spell list.",
          "It counts as a Bard spell for you but doesn't count against the number of cantrips you know.",
          "Whenever you gain a Bard level, you can replace this cantrip with another cantrip of your choice from the Druid spell list.",
          "Additionally, choose one of the following skills: <link:Animal Handling>Animal Handling</link>, <link:Insight>Insight</link>, <link:Medicine>Medicine</link>, <link:Nature>Nature</link>, <link:Perception>Perception</link>, or <link:Survival>Survival</link>.",
          "You have proficiency in that skill."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.BLESSING_OF_MOONLIGHT,
        {
          description: [
            "You always have the <spell:Moonbeam>Moonbeam</spell> spell prepared.",
            ...blessingOfMoonlightDescription
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.EVENTIDES_SPLENDOR, {
        description: [
          "You become suffused with the might of the moon, improving your Moon's Inspiration in the following ways.",
          "<strong>Shadow of the New Moon.</strong> When you use Inspired Eclipse, the creature who received the Bardic Inspiration die can also have the <link:Invisible>Invisible</link> condition and immediately take a Reaction to teleport up to 30 feet to an unoccupied space it can see.",
          "The creature remains Invisible until the start of its next turn.",
          "<strong>Vibrance of the Full Moon.</strong> When you use Lunar Vitality, you can roll <strong>1d6</strong> and use the number rolled in place of expending a Bardic Inspiration die."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      })
    ]
  },
  {
    id: "bard-college-of-valor",
    name: "College of Valor",
    className: "Bard",
    tagline: "Sing the Deeds of Ancient Heroes",
    summary:
      "Bards of the College of Valor are daring storytellers whose tales preserve the memory of the great heroes of the past. These Bards sing the deeds of the mighty in vaulted halls or to crowds gathered around great bonfires. They travel to witness great events firsthand and to ensure that the memory of these events doesn't pass away. With their songs, they inspire new generations to reach the same heights of accomplishment as the heroes of old.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.COMBAT_INSPIRATION, {
        description: [
          "You can use your wit to turn the tide of battle.",
          "A creature that has a Bardic Inspiration die from you can use it for one of the following effects.",
          "<strong>Defense.</strong> When the creature is hit by an attack roll, that creature can use its Reaction to roll the Bardic Inspiration die and add the number rolled to its <link:Armor Class>AC</link> against that attack, potentially causing the attack to miss.",
          "<strong>Offense.</strong> Immediately after the creature hits a target with an attack roll, the creature can roll the Bardic Inspiration die and add the number rolled to the attack's damage against the target."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.MARTIAL_TRAINING, {
        description: [
          "You gain proficiency with <link:Martial weapons>Martial weapons</link> and training with <link:Medium armor>Medium armor</link> and <link:Shield>Shields</link>.",
          "In addition, you can use a Simple or Martial weapon as a Spellcasting Focus to cast spells from your Bard spell list."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.EXTRA_ATTACK, {
        description: [
          "You can attack twice instead of once whenever you take the Attack action on your turn.",
          "In addition, you can cast one of your cantrips that has a casting time of an action in place of one of those attacks."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.BATTLE_MAGIC, {
        description: [
          "After you cast a spell that has a casting time of an action, you can make one attack with a weapon as a Bonus Action."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  }
];
