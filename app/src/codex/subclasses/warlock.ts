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

export const warlockSubclassEntries: SubclassEntry[] = [
  {
    id: "warlock-archfey-patron",
    name: "Archfey Patron",
    className: "Warlock",
    tagline: "Bargain with Whimsical Fey",
    summary:
      "Your pact draws on the power of the Feywild. You might bargain with an archfey such as the Prince of Frost, the Queen of Air and Darkness, Titania, or an ancient hag, or you might weave a web of favors and debts with a wider host of fey. However your pact was forged, your patron's gifts are elusive, whimsical, and often inscrutable.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.ARCHFEY_SPELLS, {
        description: [
          "When you reach a Warlock level specified in the Archfey Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Calm Emotions>Calm Emotions</spell>, <spell:Faerie Fire>Faerie Fire</spell>, <spell:Misty Step>Misty Step</spell>, <spell:Phantasmal Force>Phantasmal Force</spell>, <spell:Sleep>Sleep</spell>",
          "<strong>Level 5.</strong> <spell:Blink>Blink</spell>, <spell:Plant Growth>Plant Growth</spell>",
          "<strong>Level 7.</strong> <spell:Dominate Beast>Dominate Beast</spell>, <spell:Greater Invisibility>Greater Invisibility</spell>",
          "<strong>Level 9.</strong> <spell:Dominate Person>Dominate Person</spell>, <spell:Seeming>Seeming</spell>"
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.STEPS_OF_THE_FEY, {
        description: [
          "Your patron grants you the ability to move between the boundaries of the planes.",
          "You can cast <spell:Misty Step>Misty Step</spell> without expending a spell slot a number of times equal to your <link:CHA>Charisma</link> modifier (minimum of once), and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
          "In addition, whenever you cast that spell, you can choose one of the following additional effects.",
          "<strong>Refreshing Step.</strong> Immediately after you teleport, you or one creature you can see within 10 feet of yourself gains <strong>1d10</strong> <link:Temporary Hit Points>Temporary Hit Points</link>.",
          "<strong>Taunting Step.</strong> Creatures within 5 feet of the space you left must succeed on a <link:Wisdom Saving Throw>Wisdom saving throw</link> against your spell save DC or have <link:Disadvantage>Disadvantage</link> on attack rolls against creatures other than you until the start of your next turn."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.MISTY_ESCAPE, {
        description: [
          "You can cast <spell:Misty Step>Misty Step</spell> as a Reaction in response to taking damage.",
          "In addition, the following effects are now among your Steps of the Fey options.",
          "<strong>Disappearing Step.</strong> You have the <link:Invisible>Invisible</link> condition until the start of your next turn or until immediately after you make an attack roll, deal damage, or cast a spell.",
          "<strong>Dreadful Step.</strong> Creatures within 5 feet of the space you left or the space you appear in (your choice) must succeed on a <link:Wisdom Saving Throw>Wisdom saving throw</link> against your spell save DC or take <strong>2d10</strong> <link:Psychic>Psychic</link> damage."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.BEGUILING_DEFENSES, {
        description: [
          "Your patron teaches you how to guard your mind and body.",
          "You are immune to the <link:Charmed>Charmed</link> condition.",
          "In addition, immediately after a creature you can see hits you with an attack roll, you can take a Reaction to reduce the damage you take by half (round down), and you can force the attacker to make a <link:Wisdom Saving Throw>Wisdom saving throw</link> against your spell save DC.",
          "On a failed save, the attacker takes <link:Psychic>Psychic</link> damage equal to the damage you take.",
          "Once you use this Reaction, you can't use it again until you finish a <link:long-rest>Long Rest</link> unless you expend a Pact Magic spell slot (no action required) to restore your use of it."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.BEWITCHING_MAGIC, {
        description: [
          "Your patron grants you the ability to weave your magic with teleportation.",
          "Immediately after you cast an Enchantment or Illusion spell using an action and a spell slot, you can cast <spell:Misty Step>Misty Step</spell> as part of the same action and without expending a spell slot."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "warlock-celestial-patron",
    name: "Celestial Patron",
    className: "Warlock",
    tagline: "Call on the Power of the Heavens",
    summary:
      "Your pact draws on the Upper Planes, the realms of everlasting bliss. You might enter an agreement with an empyrean, a couatl, a sphinx, a unicorn, or another heavenly entity, or you might call on many such beings at once as you pursue goals aligned with theirs. Through that pact, you touch a fragment of the holy light that illuminates the multiverse.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.CELESTIAL_SPELLS, {
        description: [
          "When you reach a Warlock level specified in the Celestial Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Aid>Aid</spell>, <spell:Cure Wounds>Cure Wounds</spell>, <spell:Guiding Bolt>Guiding Bolt</spell>, <spell:Lesser Restoration>Lesser Restoration</spell>, <spell:Light>Light</spell>, <spell:Sacred Flame>Sacred Flame</spell>",
          "<strong>Level 5.</strong> <spell:Daylight>Daylight</spell>, <spell:Revivify>Revivify</spell>",
          "<strong>Level 7.</strong> <spell:Guardian of Faith>Guardian of Faith</spell>, <spell:Wall of Fire>Wall of Fire</spell>",
          "<strong>Level 9.</strong> <spell:Greater Restoration>Greater Restoration</spell>, <spell:Summon Celestial>Summon Celestial</spell>"
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.HEALING_LIGHT, {
        description: [
          "You gain the ability to channel celestial energy to heal wounds.",
          "You have a pool of <strong>d6s</strong> to fuel this healing. The number of dice in the pool equals 1 plus your Warlock level.",
          "As a Bonus Action, you can heal yourself or one creature you can see within 60 feet of yourself, expending dice from the pool.",
          "The maximum number of dice you can expend at once equals your <link:CHA>Charisma</link> modifier (minimum of one die).",
          "Roll the dice you expend, and restore a number of Hit Points equal to the roll's total.",
          "Your pool regains all expended dice when you finish a <link:long-rest>Long Rest</link>."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.RADIANT_SOUL, {
        description: [
          "Your link to your patron allows you to serve as a conduit for radiant energy.",
          "You have <link:Resistance>Resistance</link> to <link:Radiant>Radiant</link> damage.",
          "Once per turn, when a spell you cast deals <link:Radiant>Radiant</link> or <link:Fire>Fire</link> damage, you can add your <link:CHA>Charisma</link> modifier to that spell's damage against one of the spell's targets."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_10,
        CLASS_FEATURE.CELESTIAL_RESILIENCE,
        {
          description: [
            "You gain <link:Temporary Hit Points>Temporary Hit Points</link> whenever you use your Magical Cunning feature or finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
            "These Temporary Hit Points equal your Warlock level plus your <link:CHA>Charisma</link> modifier.",
            "Additionally, choose up to five creatures you can see when you gain the points.",
            "Those creatures each gain <link:Temporary Hit Points>Temporary Hit Points</link> equal to half your Warlock level plus your <link:CHA>Charisma</link> modifier."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.SEARING_VENGEANCE, {
        description: [
          "When you or an ally within 60 feet of you is about to make a Death Saving Throw, you can unleash radiant energy to save the creature.",
          "The creature regains Hit Points equal to half its Hit Point maximum and can end the <link:Prone>Prone</link> condition on itself.",
          "Each creature of your choice that is within 30 feet of the creature takes <link:Radiant>Radiant</link> damage equal to <strong>2d8</strong> plus your <link:CHA>Charisma</link> modifier, and each has the <link:Blinded>Blinded</link> condition until the end of the current turn.",
          "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link>."
        ],
        trackingState: TRACKER.NOT_TRACKED
      })
    ]
  },
  {
    id: "warlock-fiend-patron",
    name: "Fiend Patron",
    className: "Warlock",
    tagline: "Make a Deal with the Lower Planes",
    summary:
      "Your pact draws on the Lower Planes, the realms of perdition. You might forge a bargain with a demon lord, an archdevil, or some other especially mighty fiend, and that patron's aims are always destructive, corrupting, or cruel. Your path is shaped by how much you embrace those designs and how fiercely you struggle against them.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.FIEND_SPELLS, {
        description: [
          "When you reach a Warlock level specified in the Fiend Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Burning Hands>Burning Hands</spell>, <spell:Command>Command</spell>, <spell:Scorching Ray>Scorching Ray</spell>, <spell:Suggestion>Suggestion</spell>",
          "<strong>Level 5.</strong> <spell:Fireball>Fireball</spell>, <spell:Stinking Cloud>Stinking Cloud</spell>",
          "<strong>Level 7.</strong> <spell:Fire Shield>Fire Shield</spell>, <spell:Wall of Fire>Wall of Fire</spell>",
          "<strong>Level 9.</strong> <spell:Geas>Geas</spell>, <spell:Insect Plague>Insect Plague</spell>"
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.DARK_ONES_BLESSING, {
        description: [
          "When you reduce an enemy to 0 Hit Points, you gain <link:Temporary Hit Points>Temporary Hit Points</link> equal to your <link:CHA>Charisma</link> modifier plus your Warlock level (minimum of 1 Temporary Hit Point).",
          "You also gain this benefit if someone else reduces an enemy within 10 feet of you to 0 Hit Points."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.DARK_ONES_OWN_LUCK, {
        description: [
          "You can call on your fiendish patron to alter fate in your favor.",
          "When you make an ability check or a saving throw, you can use this feature to add <strong>1d10</strong> to your roll.",
          "You can do so after seeing the roll but before any of the roll's effects occur. (The tracking of uses and rolling of the 1d10 die happens in the Actions Widget of gameplay dashboard).",
          "You can use this feature a number of times equal to your <link:CHA>Charisma</link> modifier (minimum of once), but you can use it no more than once per roll.",
          "You regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_10,
        CLASS_FEATURE.FIENDISH_RESILIENCE,
        {
          description: [
            "Choose one damage type, other than <link:Force>Force</link>, whenever you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
            "You have <link:Resistance>Resistance</link> to that damage type until you choose a different one with this feature."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.HURL_THROUGH_HELL, {
        description: [
          "Once per turn when you hit a creature with an attack roll, you can try to instantly transport the target through the Lower Planes.",
          "The target must succeed on a <link:Charisma Saving Throw>Charisma saving throw</link> against your spell save DC, or the target disappears and hurtles through a nightmare landscape.",
          "The target takes <strong>8d10</strong> <link:Psychic>Psychic</link> damage if it isn't a Fiend, and it has the <link:Incapacitated>Incapacitated</link> condition until the end of your next turn, when it returns to the space it previously occupied or the nearest unoccupied space.",
          "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link> unless you expend a Pact Magic spell slot (no action required) to restore your use of it."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "warlock-great-old-one-patron",
    name: "Great Old One Patron",
    className: "Warlock",
    tagline: "Unearth Forbidden Lore of Ineffable Beings",
    summary:
      "When you bind yourself to a Great Old One, you tap into the maddening secrets of the Far Realm and other ineffable entities. Your patron might be Tharizdun, Zargon, Hadar, Great Cthulhu, or a broader chorus of incomprehensible beings whose motives remain beyond mortal understanding. Even their indifference can leave you transformed by alien magic and impossible knowledge.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.GREAT_OLD_ONE_SPELLS,
        {
          description: [
            "When you reach a Warlock level specified in the Great Old One Spells table, you thereafter always have the listed spells prepared.",
            "<strong>Level 3.</strong> <spell:Detect Thoughts>Detect Thoughts</spell>, <spell:Dissonant Whispers>Dissonant Whispers</spell>, <spell:Phantasmal Force>Phantasmal Force</spell>, <spell:Hideous Laughter>Hideous Laughter</spell>",
            "<strong>Level 5.</strong> <spell:Clairvoyance>Clairvoyance</spell>, <spell:Hunger of Hadar>Hunger of Hadar</spell>",
            "<strong>Level 7.</strong> <spell:Confusion>Confusion</spell>, <spell:Summon Aberration>Summon Aberration</spell>",
            "<strong>Level 9.</strong> <spell:Modify Memory>Modify Memory</spell>, <spell:Telekinesis>Telekinesis</spell>"
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.AWAKENED_MIND, {
        description: [
          "You can form a telepathic connection between your mind and the mind of another.",
          "As a Bonus Action, choose one creature you can see within 30 feet of yourself.",
          "You and the chosen creature can communicate telepathically with each other while the two of you are within a number of miles of each other equal to your <link:CHA>Charisma</link> modifier (minimum of 1 mile).",
          "To understand each other, you each must mentally use a language the other knows.",
          "The telepathic connection lasts for a number of minutes equal to your Warlock level.",
          "It ends early if you use this feature to connect with a different creature."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PSYCHIC_SPELLS, {
        description: [
          "When you cast a Warlock spell that deals damage, you can change its damage type to <link:Psychic>Psychic</link>.",
          "In addition, when you cast a Warlock spell that is an Enchantment or Illusion, you can do so without Verbal or Somatic components."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.CLAIRVOYANT_COMBATANT,
        {
          description: [
            "When you form a telepathic bond with a creature using your Awakened Mind, you can force that creature to make a <link:Wisdom Saving Throw>Wisdom saving throw</link> against your spell save DC.",
            "On a failed save, the creature has <link:Disadvantage>Disadvantage</link> on attack rolls against you, and you have <link:Advantage>Advantage</link> on attack rolls against that creature for the duration of the bond.",
            "Once you use this feature, you can't use it again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link> unless you expend a Pact Magic spell slot (no action required) to restore your use of it."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.ELDRITCH_HEX, {
        description: [
          "Your alien patron grants you a powerful curse.",
          "You always have the <spell:Hex>Hex</spell> spell prepared.",
          "When you cast <spell:Hex>Hex</spell> and choose an ability, the target also has <link:Disadvantage>Disadvantage</link> on saving throws of the chosen ability for the duration of the spell."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.THOUGHT_SHIELD, {
        description: [
          "Your thoughts can't be read by telepathy or other means unless you allow it.",
          "You also have <link:Resistance>Resistance</link> to <link:Psychic>Psychic</link> damage, and whenever a creature deals <link:Psychic>Psychic</link> damage to you, that creature takes the same amount of damage that you take."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.CREATE_THRALL, {
        description: [
          "When you cast <spell:Summon Aberration>Summon Aberration</spell>, you can modify it so that it doesn't require <link:Concentration>Concentration</link>.",
          "If you do so, the spell's duration becomes 1 minute for that casting, and when summoned, the Aberration has a number of <link:Temporary Hit Points>Temporary Hit Points</link> equal to your Warlock level plus your <link:CHA>Charisma</link> modifier.",
          "In addition, the first time each turn the Aberration hits a creature under the effect of your <spell:Hex>Hex</spell>, the Aberration deals extra <link:Psychic>Psychic</link> damage to the target equal to the bonus damage of that spell."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      })
    ]
  }
];
