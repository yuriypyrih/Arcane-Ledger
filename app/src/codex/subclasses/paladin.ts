import { CLASS_FEATURE, TRACKER } from "../entries/enums";
import type {
  FeatureMapEntry,
  SubclassEntry,
  SubclassFeatureClassObj,
  SubclassFeatureLevel
} from "../entries/types";

const SUBCLASS_FEATURE_LEVELS = {
  LEVEL_3: 3,
  LEVEL_7: 7,
  LEVEL_15: 15,
  LEVEL_20: 20
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

const notTracked = { trackingState: TRACKER.NOT_TRACKED } as const;

export const paladinSubclassEntries: SubclassEntry[] = [
  {
    id: "paladin-oath-of-the-ancients",
    name: "Oath of the Ancients",
    className: "Paladin",
    tagline: "Preserve Life and Light in the World",
    summary:
      "The Oath of the Ancients is as old as the first elves. Paladins who swear this oath cherish the light and the life-giving beauty of the world more than abstract principles alone, often adorning themselves with leaves, antlers, or flowers. Their tenets are to kindle the light of hope, shelter life, and delight in art and laughter.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.OATH_OF_THE_ANCIENTS_SPELLS,
        {
          description: [
            "When you reach a Paladin level specified in the Oath of the Ancients Spells table, you thereafter always have the listed spells prepared.",
            "<strong>Level 3.</strong> <spell:Ensnaring Strike>Ensnaring Strike</spell>, <spell:Speak with Animals>Speak with Animals</spell>",
            "<strong>Level 5.</strong> <spell:Misty Step>Misty Step</spell>, <spell:Moonbeam>Moonbeam</spell>",
            "<strong>Level 9.</strong> <spell:Plant Growth>Plant Growth</spell>, <spell:Protection from Energy>Protection from Energy</spell>",
            "<strong>Level 13.</strong> <spell:Ice Storm>Ice Storm</spell>, <spell:Stoneskin>Stoneskin</spell>",
            "<strong>Level 17.</strong> <spell:Commune with Nature>Commune with Nature</spell>, <spell:Tree Stride>Tree Stride</spell>"
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.NATURES_WRATH, {
        description: [
          "As a Magic action, you can expend one use of your Channel Divinity to conjure spectral vines around nearby creatures.",
          "Each creature of your choice that you can see within 15 feet of yourself must succeed on a <link:Strength Saving Throw>Strength saving throw</link> or have the <link:Restrained>Restrained</link> condition for 1 minute.",
          "A Restrained creature repeats the save at the end of each of its turns, ending the effect on itself on a success."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.AURA_OF_WARDING, {
        description: [
          "Ancient magic lies so heavily upon you that it forms an eldritch ward, blunting energy from beyond the Material Plane.",
          "You and your allies have <link:Resistance>Resistance</link> to <link:Necrotic>Necrotic</link>, <link:Psychic>Psychic</link>, and <link:Radiant>Radiant</link> damage while in your Aura of Protection."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.UNDYING_SENTINEL, {
        description: [
          "When you are reduced to 0 Hit Points and not killed outright, you can drop to 1 Hit Point instead, and you regain a number of Hit Points equal to three times your Paladin level.",
          "Once you use this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link>.",
          "Additionally, you can't be aged magically, and you cease visibly aging."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_20, CLASS_FEATURE.ELDER_CHAMPION, {
        description: [
          "As a Bonus Action, you can imbue your Aura of Protection with primal power, granting the benefits below for 1 minute or until you end them, no action required.",
          "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link>.",
          "You can also restore your use of it by expending a level 5 spell slot, no action required.",
          "<strong>Diminish Defiance.</strong> Enemies in the aura have <link:Disadvantage>Disadvantage</link> on saving throws against your spells and Channel Divinity options.",
          "<strong>Regeneration.</strong> At the start of each of your turns, you regain 10 Hit Points.",
          "<strong>Swift Spells.</strong> Whenever you cast a spell that has a casting time of an action, you can cast it using a Bonus Action instead."
        ],
        ...notTracked
      })
    ]
  },
  {
    id: "paladin-oath-of-devotion",
    name: "Oath of Devotion",
    className: "Paladin",
    tagline: "Uphold the Ideals of Justice and Order",
    summary:
      "The Oath of Devotion binds Paladins to the ideals of justice and order. These Paladins embody the knight in shining armor, holding themselves to the highest standards of conduct and often measuring the world by those same standards. Their tenets are to let their word be their promise, protect the weak and never fear to act, and let honorable deeds be an example.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.OATH_OF_DEVOTION_SPELLS,
        {
          description: [
            "When you reach a Paladin level specified in the Oath of Devotion Spells table, you thereafter always have the listed spells prepared.",
            "<strong>Level 3.</strong> <spell:Protection from Evil and Good>Protection from Evil and Good</spell>, <spell:Shield of Faith>Shield of Faith</spell>",
            "<strong>Level 5.</strong> <spell:Aid>Aid</spell>, <spell:Zone of Truth>Zone of Truth</spell>",
            "<strong>Level 9.</strong> <spell:Beacon of Hope>Beacon of Hope</spell>, <spell:Dispel Magic>Dispel Magic</spell>",
            "<strong>Level 13.</strong> <spell:Freedom of Movement>Freedom of Movement</spell>, <spell:Guardian of Faith>Guardian of Faith</spell>",
            "<strong>Level 17.</strong> <spell:Commune>Commune</spell>, <spell:Flame Strike>Flame Strike</spell>"
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.SACRED_WEAPON, {
        description: [
          "When you take the Attack action, you can expend one use of your Channel Divinity to imbue one Melee weapon that you are holding with positive energy.",
          "For 10 minutes or until you use this feature again, you add your <link:CHA>Charisma</link> modifier to attack rolls you make with that weapon, minimum bonus of +1, and each time you hit with it, you cause it to deal its normal damage type or <link:Radiant>Radiant</link> damage.",
          "The weapon also emits Bright Light in a 20-foot radius and Dim Light 20 feet beyond that.",
          "You can end this effect early, no action required. This effect also ends if you aren't carrying the weapon."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.AURA_OF_DEVOTION, {
        description: [
          "You and your allies have <link:Immunity>Immunity</link> to the <link:Charmed>Charmed</link> condition while in your Aura of Protection.",
          "If a Charmed ally enters the aura, that condition has no effect on that ally while there."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_15,
        CLASS_FEATURE.SMITE_OF_PROTECTION,
        {
          description: [
            "Your magical smite now radiates protective energy.",
            "Whenever you cast <spell:Divine Smite>Divine Smite</spell>, you and your allies have Half Cover while in your Aura of Protection.",
            "The aura has this benefit until the start of your next turn."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_20, CLASS_FEATURE.HOLY_NIMBUS, {
        description: [
          "As a Bonus Action, you can imbue your Aura of Protection with holy power, granting the benefits below for 10 minutes or until you end them, no action required.",
          "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link>.",
          "You can also restore your use of it by expending a level 5 spell slot, no action required.",
          "<strong>Holy Ward.</strong> You have <link:Advantage>Advantage</link> on any saving throw you are forced to make by a Fiend or an Undead.",
          "<strong>Radiant Damage.</strong> Whenever an enemy starts its turn in the aura, that creature takes <link:Radiant>Radiant</link> damage equal to your <link:CHA>Charisma</link> modifier plus your <link:Proficiency Bonus>Proficiency Bonus</link>.",
          "<strong>Sunlight.</strong> The aura is filled with Bright Light that is sunlight."
        ],
        ...notTracked
      })
    ]
  },
  {
    id: "paladin-oath-of-glory",
    name: "Oath of Glory",
    className: "Paladin",
    tagline: "Strive for the Heights of Heroism",
    summary:
      "Paladins who take the Oath of Glory believe they and their companions are destined to achieve glory through deeds of heroism. They train diligently, face hardship with courage, and inspire others to strive for greatness. Their tenets are to be known by their deeds, face hardships with courage, and inspire others to strive for glory.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.OATH_OF_GLORY_SPELLS,
        {
          description: [
            "When you reach a Paladin level specified in the Oath of Glory Spells table, you thereafter always have the listed spells prepared.",
            "<strong>Level 3.</strong> <spell:Guiding Bolt>Guiding Bolt</spell>, <spell:Heroism>Heroism</spell>",
            "<strong>Level 5.</strong> <spell:Enhance Ability>Enhance Ability</spell>, <spell:Magic Weapon>Magic Weapon</spell>",
            "<strong>Level 9.</strong> <spell:Haste>Haste</spell>, <spell:Protection from Energy>Protection from Energy</spell>",
            "<strong>Level 13.</strong> <spell:Compulsion>Compulsion</spell>, <spell:Freedom of Movement>Freedom of Movement</spell>",
            "<strong>Level 17.</strong> <spell:Legend Lore>Legend Lore</spell>, <spell:Yolande's Regal Presence>Yolande's Regal Presence</spell>"
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.INSPIRING_SMITE, {
        description: [
          "Immediately after you cast <spell:Divine Smite>Divine Smite</spell>, you can expend one use of your Channel Divinity and distribute <link:Temporary Hit Points>Temporary Hit Points</link> to creatures of your choice within 30 feet of yourself, which can include you.",
          "The total number of Temporary Hit Points equals 2d8 plus your Paladin level, divided among the chosen creatures however you like."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PEERLESS_ATHLETE, {
        description: [
          "As a Bonus Action, you can expend one use of your Channel Divinity to augment your athleticism.",
          "For 1 hour, you have <link:Advantage>Advantage</link> on <link:STR>Strength</link> (<link:Athletics>Athletics</link>) and <link:DEX>Dexterity</link> (<link:Acrobatics>Acrobatics</link>) checks, and the distance of your Long and High Jumps increases by 10 feet.",
          "This extra distance costs movement as normal."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.AURA_OF_ALACRITY, {
        description: [
          "Your <link:Speed>Speed</link> increases by 10 feet.",
          "In addition, whenever an ally enters your Aura of Protection for the first time on a turn or starts their turn there, the ally's Speed increases by 10 feet until the end of their next turn."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.GLORIOUS_DEFENSE, {
        description: [
          "When you or another creature you can see within 10 feet of you is hit by an attack roll, you can take a Reaction to grant a bonus to the target's <link:Armor Class>AC</link> against that attack, potentially causing it to miss.",
          "The bonus equals your <link:CHA>Charisma</link> modifier, minimum of +1.",
          "If the attack misses, you can make one attack with a weapon against the attacker as part of this Reaction if the attacker is within your weapon's range.",
          "You can use this feature a number of times equal to your Charisma modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_20, CLASS_FEATURE.LIVING_LEGEND, {
        description: [
          "As a Bonus Action, you gain the benefits below for 10 minutes.",
          "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link>.",
          "You can also restore your use of it by expending a level 5 spell slot, no action required.",
          "<strong>Charismatic.</strong> You are blessed with an otherworldly presence and have <link:Advantage>Advantage</link> on all <link:Charisma>Charisma</link> checks.",
          "<strong>Saving Throw Reroll.</strong> If you fail a saving throw, you can take a Reaction to reroll it. You must use the new roll.",
          "<strong>Unerring Strike.</strong> Once on each of your turns when you make an attack roll with a weapon and miss, you can cause that attack to hit instead."
        ],
        ...notTracked
      })
    ]
  },
  {
    id: "paladin-oath-of-the-noble-genies",
    name: "Oath of the Noble Genies",
    className: "Paladin",
    tagline: "Brandish the Elemental Splendor of Genies",
    summary:
      "Paladins sworn to the Oath of the Noble Genies revere the forces of the Elemental Planes, drawing power from dao, djinn, efreet, and marids. Many hail from Calimshan, and their quests often carry them across Faerun, the multiverse, and the Elemental Planes. Their tenets are to sow the seeds of creation amid the ashes of destruction, lead with splendor and grace, and respect the elements while fearing their wrath.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.ELEMENTAL_SMITE, {
        description: [
          "Immediately after you cast <spell:Divine Smite>Divine Smite</spell>, you can expend one use of your Channel Divinity and invoke one of the following effects.",
          "<strong>Dao's Crush.</strong> Earth rises up around the target of your Divine Smite. The target has the <link:Grappled>Grappled</link> condition, with an escape DC equal to your spell save DC. While Grappled, the target has the <link:Restrained>Restrained</link> condition.",
          "<strong>Djinni's Escape.</strong> You teleport to an unoccupied space you can see within 30 feet of yourself and take on a semi-incorporeal form, which lasts until the end of your next turn.",
          "While in this form, you have <link:Resistance>Resistance</link> to <link:Bludgeoning>Bludgeoning</link>, <link:Piercing>Piercing</link>, and <link:Slashing>Slashing</link> damage, and you have <link:Immunity>Immunity</link> to the <link:Grappled>Grappled</link>, <link:Prone>Prone</link>, and <link:Restrained>Restrained</link> conditions.",
          "<strong>Efreeti's Fury.</strong> The target of your Divine Smite takes an extra 2d4 <link:Fire>Fire</link> damage, and fire jumps from the target to another creature you can see within 30 feet of yourself. The second creature also takes 2d4 Fire damage.",
          "<strong>Marid's Surge.</strong> The target of your Divine Smite and each creature of your choice in a 10-foot <link:Emanation>Emanation</link> originating from you make a <link:Strength Saving Throw>Strength saving throw</link> against your spell save DC. On a failed save, a creature is pushed 15 feet straight away from you and has the <link:Prone>Prone</link> condition."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.GENIE_SPELLS, {
        description: [
          "When you reach a Paladin level specified in the Genie Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Chromatic Orb>Chromatic Orb</spell>, <spell:Elementalism>Elementalism</spell>, <spell:Thunderous Smite>Thunderous Smite</spell>",
          "<strong>Level 5.</strong> <spell:Mirror Image>Mirror Image</spell>, <spell:Phantasmal Force>Phantasmal Force</spell>",
          "<strong>Level 9.</strong> <spell:Fly>Fly</spell>, <spell:Gaseous Form>Gaseous Form</spell>",
          "<strong>Level 13.</strong> <spell:Conjure Minor Elementals>Conjure Minor Elementals</spell>, <spell:Summon Elemental>Summon Elemental</spell>",
          "<strong>Level 17.</strong> <spell:Banishing Smite>Banishing Smite</spell>, <spell:Contact Other Plane>Contact Other Plane</spell>"
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.GENIES_SPLENDOR, {
        description: [
          "When you aren't wearing any armor, your base <link:Armor Class>Armor Class</link> equals 10 plus your <link:DEX>Dexterity</link> and <link:CHA>Charisma</link> modifiers.",
          "You can use a <link:Shield>Shield</link> and still gain this benefit.",
          "You also gain proficiency in one of the following skills of your choice: <link:Acrobatics>Acrobatics</link>, <link:Intimidation>Intimidation</link>, <link:Performance>Performance</link>, or <link:Persuasion>Persuasion</link>."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_7,
        CLASS_FEATURE.AURA_OF_ELEMENTAL_SHIELDING,
        {
          description: [
            "Choose one of the following damage types: <link:Acid>Acid</link>, <link:Cold>Cold</link>, <link:Fire>Fire</link>, <link:Lightning>Lightning</link>, or <link:Thunder>Thunder</link>.",
            "You and your allies have <link:Resistance>Resistance</link> to that damage type while in your Aura of Protection.",
            "At the start of each of your turns, you can change the damage type affected by this feature to one of the other listed options, no action required."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.ELEMENTAL_REBUKE, {
        description: [
          "When you are hit by an attack roll, you can take a Reaction to halve the attack's damage against yourself, round down, and force the attacker to make a <link:Dexterity Saving Throw>Dexterity saving throw</link> against your spell save DC.",
          "On a failed save, the attacker takes damage equal to 2d10 plus your <link:CHA>Charisma</link> modifier of one of the following types, your choice: <link:Acid>Acid</link>, <link:Cold>Cold</link>, <link:Fire>Fire</link>, <link:Lightning>Lightning</link>, or <link:Thunder>Thunder</link>.",
          "On a successful save, the attacker takes half as much damage.",
          "You can use this feature a number of times equal to your Charisma modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_20, CLASS_FEATURE.NOBLE_SCION, {
        description: [
          "As a Bonus Action, you gain the benefits below for 10 minutes or until you end them, no action required.",
          "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link>.",
          "You can also restore your use of it by expending a level 5 spell slot, no action required.",
          "<strong>Flight.</strong> You have a Fly Speed of 60 feet and can hover.",
          "<strong>Minor Wish.</strong> When you or an ally in your Aura of Protection fails a D20 Test, you can take a Reaction to make the D20 Test succeed instead."
        ],
        ...notTracked
      })
    ]
  },
  {
    id: "paladin-oath-of-vengeance",
    name: "Oath of Vengeance",
    className: "Paladin",
    tagline: "Punish Evildoers at Any Cost",
    summary:
      "The Oath of Vengeance is a solemn commitment to punish those who have committed grievously evil acts. When evil armies slaughter helpless villagers, tyrants defy the will of the gods, or monsters ravage the countryside, Paladins rise to set right what has gone wrong. Their tenets are to show the wicked no mercy, fight injustice and its causes, and aid those harmed by injustice.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.OATH_OF_VENGEANCE_SPELLS,
        {
          description: [
            "When you reach a Paladin level specified in the Oath of Vengeance Spells table, you thereafter always have the listed spells prepared.",
            "<strong>Level 3.</strong> <spell:Bane>Bane</spell>, <spell:Hunter's Mark>Hunter's Mark</spell>",
            "<strong>Level 5.</strong> <spell:Hold Person>Hold Person</spell>, <spell:Misty Step>Misty Step</spell>",
            "<strong>Level 9.</strong> <spell:Haste>Haste</spell>, <spell:Protection from Energy>Protection from Energy</spell>",
            "<strong>Level 13.</strong> <spell:Banishment>Banishment</spell>, <spell:Dimension Door>Dimension Door</spell>",
            "<strong>Level 17.</strong> <spell:Hold Monster>Hold Monster</spell>, <spell:Scrying>Scrying</spell>"
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.VOW_OF_ENMITY, {
        description: [
          "When you take the Attack action, you can expend one use of your Channel Divinity to utter a vow of enmity against a creature you can see within 30 feet of yourself.",
          "You have <link:Advantage>Advantage</link> on attack rolls against the creature for 1 minute or until you use this feature again.",
          "If the creature drops to 0 Hit Points before the vow ends, you can transfer the vow to a different creature within 30 feet of yourself, no action required."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.RELENTLESS_AVENGER, {
        description: [
          "When you hit a creature with an Opportunity Attack, you can reduce the creature's <link:Speed>Speed</link> to 0 until the end of the current turn.",
          "You can then move up to half your Speed as part of the same Reaction.",
          "This movement doesn't provoke Opportunity Attacks."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.SOUL_OF_VENGEANCE, {
        description: [
          "Immediately after a creature under the effect of your Vow of Enmity hits or misses with an attack roll, you can take a Reaction to make a melee attack against that creature if it's within range."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_20, CLASS_FEATURE.AVENGING_ANGEL, {
        description: [
          "As a Bonus Action, you gain the benefits below for 10 minutes or until you end them, no action required.",
          "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link>.",
          "You can also restore your use of it by expending a level 5 spell slot, no action required.",
          "<strong>Flight.</strong> You sprout spectral wings on your back, have a Fly Speed of 60 feet, and can hover.",
          "<strong>Frightful Aura.</strong> Whenever an enemy starts its turn in your Aura of Protection, that creature must succeed on a <link:Wisdom Saving Throw>Wisdom saving throw</link> or have the <link:Frightened>Frightened</link> condition for 1 minute or until it takes any damage.",
          "Attack rolls against the Frightened creature have <link:Advantage>Advantage</link>."
        ],
        ...notTracked
      })
    ]
  }
];
