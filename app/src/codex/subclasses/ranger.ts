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
  LEVEL_11: 11,
  LEVEL_15: 15
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

export const rangerSubclassEntries: SubclassEntry[] = [
  {
    id: "ranger-beast-master",
    name: "Beast Master",
    className: "Ranger",
    tagline: "Bond with a Primal Beast",
    summary:
      "A Beast Master forms a mystical bond with a special animal, drawing on primal magic and a deep connection to the natural world.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PRIMAL_COMPANION, {
        description: [
          "You magically summon a primal beast, which draws strength from your bond with nature.",
          "Choose its stat block: Beast of the Land, Beast of the Sea, or Beast of the Sky. You also determine the kind of animal it is, choosing a kind appropriate for the stat block. Whatever beast you choose, it bears primal markings indicating its supernatural origin.",
          "The beast is Friendly to you and your allies and obeys your commands. It vanishes if you die.",
          "<strong>The Beast in Combat.</strong> In combat, the beast acts during your turn. It can move and use its Reaction on its own, but the only action it takes is the Dodge action unless you take a Bonus Action to command it to take an action in its stat block or some other action.",
          "You can also sacrifice one of your attacks when you take the Attack action to command the beast to take the Beast's Strike action.",
          "If you have the <link:Incapacitated>Incapacitated</link> condition, the beast acts on its own and isn't limited to the Dodge action.",
          "<strong>Restoring or Replacing the Beast.</strong> If the beast has died within the last hour, you can take a Magic action to touch it and expend a spell slot. The beast returns to life after 1 minute with all its Hit Points restored.",
          "Whenever you finish a <link:long-rest>Long Rest</link>, you can summon a different primal beast, which appears in an unoccupied space within 5 feet of you. You choose its stat block and appearance. If you already have a beast from this feature, the old one vanishes when the new one appears."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_7,
        CLASS_FEATURE.EXCEPTIONAL_TRAINING,
        {
          description: [
            "When you take a Bonus Action to command your Primal Companion beast to take an action, you can also command it to take the Dash, Disengage, Dodge, or Help action using its Bonus Action.",
            "In addition, whenever it hits with an attack roll and deals damage, it can deal your choice of <link:Force>Force</link> damage or its normal damage type."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_11, CLASS_FEATURE.BESTIAL_FURY, {
        description: [
          "When you command your Primal Companion beast to take the Beast's Strike action, the beast can use it twice.",
          "In addition, the first time each turn it hits a creature under the effect of your <spell:Hunter's Mark>Hunter's Mark</spell> spell, the beast deals extra <link:Force>Force</link> damage equal to the bonus damage of that spell."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.SHARE_SPELLS, {
        description: [
          "When you cast a spell targeting yourself, you can also affect your Primal Companion beast with the spell if the beast is within 30 feet of you."
        ],
        ...notTracked
      })
    ]
  },
  {
    id: "ranger-fey-wanderer",
    name: "Fey Wanderer",
    className: "Ranger",
    tagline: "Wield Fey Mirth and Fury",
    summary:
      "A fey mystique surrounds you, thanks to the boon of an archfey or a location in the Feywild that transformed you. However you gained fey magic, you are now a Fey Wanderer. Your joyful laughter brightens the hearts of the downtrodden, and your martial prowess strikes terror in your foes, for great is the mirth of the fey and dreadful is their fury.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.DREADFUL_STRIKES, {
        description: [
          "You can augment your weapon strikes with mind-scarring magic drawn from the murky hollows of the Feywild.",
          "When you hit a creature with a weapon, you can deal an extra 1d4 <link:Psychic>Psychic</link> damage to the target, which can take this extra damage only once per turn.",
          "The extra damage increases to 1d6 when you reach Ranger level 11."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.FEY_WANDERER_SPELLS,
        {
          description: [
            "When you reach a Ranger level specified in the Fey Wanderer Spells table, you thereafter always have the listed spells prepared.",
            "<strong>Level 3.</strong> <spell:Charm Person>Charm Person</spell>",
            "<strong>Level 5.</strong> <spell:Misty Step>Misty Step</spell>",
            "<strong>Level 9.</strong> <spell:Summon Fey>Summon Fey</spell>",
            "<strong>Level 13.</strong> <spell:Dimension Door>Dimension Door</spell>",
            "<strong>Level 17.</strong> <spell:Mislead>Mislead</spell>",
            "You also possess a fey blessing. Choose it from the Feywild Gifts table or determine it randomly.",
            "<strong>Feywild Gifts.</strong>",
            "1. Illusory butterflies flutter around you while you take a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
            "2. Flowers bloom from your hair each dawn.",
            "3. You faintly smell of cinnamon, lavender, nutmeg, or another comforting herb or spice.",
            "4. Your shadow dances while no one is looking directly at it.",
            "5. Horns or antlers sprout from your head.",
            "6. Your skin and hair change color each dawn."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.OTHERWORLDLY_GLAMOUR,
        {
          description: [
            "Whenever you make a <link:CHA>Charisma</link> check, you gain a bonus to the check equal to your <link:WIS>Wisdom</link> modifier (minimum of +1).",
            "You also gain proficiency in one of these skills of your choice: <link:Deception>Deception</link>, <link:Performance>Performance</link>, or <link:Persuasion>Persuasion</link>."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.BEGUILING_TWIST, {
        description: [
          "The magic of the Feywild guards your mind. You have <link:Advantage>Advantage</link> on saving throws to avoid or end the <link:Charmed>Charmed</link> or <link:Frightened>Frightened</link> condition.",
          "In addition, whenever you or a creature you can see within 120 feet of you succeeds on a saving throw to avoid or end the <link:Charmed>Charmed</link> or <link:Frightened>Frightened</link> condition, you can take a Reaction to force a different creature you can see within 120 feet of yourself to make a <link:Wisdom Saving Throw>Wisdom save</link> against your spell save DC.",
          "On a failed save, the target is <link:Charmed>Charmed</link> or <link:Frightened>Frightened</link> (your choice) for 1 minute.",
          "The target repeats the save at the end of each of its turns, ending the effect on itself on a success."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_11,
        CLASS_FEATURE.FEY_REINFORCEMENTS,
        {
          description: [
            "You can cast <spell:Summon Fey>Summon Fey</spell> without a Material component.",
            "You can also cast it once without a spell slot, and you regain the ability to cast it in this way when you finish a <link:long-rest>Long Rest</link>.",
            "Whenever you start casting the spell, you can modify it so that it doesn't require <link:Concentration>Concentration</link>.",
            "If you do so, the spell's duration becomes 1 minute for that casting."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_15,
        CLASS_FEATURE.MISTY_WANDERER,
        {
          description: [
            "You can cast <spell:Misty Step>Misty Step</spell> without expending a spell slot.",
            "You can do so a number of times equal to your <link:WIS>Wisdom</link> modifier (minimum of once), and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
            "In addition, whenever you cast <spell:Misty Step>Misty Step</spell>, you can bring along one willing creature you can see within 5 feet of yourself.",
            "That creature teleports to an unoccupied space of your choice within 5 feet of your destination space."
          ],
          ...notTracked
        }
      )
    ]
  },
  {
    id: "ranger-gloom-stalker",
    name: "Gloom Stalker",
    className: "Ranger",
    tagline: "Draw on Shadow Magic to Fight Your Foes",
    summary:
      "Gloom Stalkers are at home in the darkest places, wielding magic drawn from the Shadowfell to combat enemies that lurk in darkness.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.DREAD_AMBUSHER, {
        description: [
          "You have mastered the art of creating fearsome ambushes, granting you the following benefits.",
          "<strong>Ambusher's Leap.</strong> At the start of your first turn of each combat, your <link:Speed>Speed</link> increases by 10 feet until the end of that turn.",
          "<strong>Dreadful Strike.</strong> When you attack a creature and hit it with a weapon, you can deal an extra 2d6 <link:Psychic>Psychic</link> damage.",
          "You can use this benefit only once per turn, you can use it a number of times equal to your <link:WIS>Wisdom</link> modifier (minimum of once), and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
          "<strong>Initiative Bonus.</strong> When you roll <link:Initiative>Initiative</link>, you can add your <link:WIS>Wisdom</link> modifier to the roll."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.GLOOM_STALKER_SPELLS,
        {
          description: [
            "When you reach a Ranger level specified in the Gloom Stalker Spells table, you thereafter always have the listed spells prepared.",
            "<strong>Level 3.</strong> <spell:Disguise Self>Disguise Self</spell>",
            "<strong>Level 5.</strong> <spell:Rope Trick>Rope Trick</spell>",
            "<strong>Level 9.</strong> <spell:Fear>Fear</spell>",
            "<strong>Level 13.</strong> <spell:Greater Invisibility>Greater Invisibility</spell>",
            "<strong>Level 17.</strong> <spell:Seeming>Seeming</spell>"
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.UMBRAL_SIGHT, {
        description: [
          "You gain <link:Darkvision>Darkvision</link> with a range of 60 feet. If you already have Darkvision when you gain this feature, its range increases by 60 feet.",
          "You are also adept at evading creatures that rely on <link:Darkvision>Darkvision</link>.",
          "While entirely in Darkness, you have the <link:Invisible>Invisible</link> condition to any creature that relies on <link:Darkvision>Darkvision</link> to see you in that Darkness."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.IRON_MIND, {
        description: [
          "You have honed your ability to resist mind-altering powers.",
          "You gain proficiency in <link:Wisdom Saving Throw>Wisdom saving throws</link>. If you already have this proficiency, you instead gain proficiency in <link:Intelligence Saving Throw>Intelligence</link> or <link:Charisma Saving Throw>Charisma</link> saving throws (your choice)."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_11,
        CLASS_FEATURE.STALKERS_FLURRY,
        {
          description: [
            "The <link:Psychic>Psychic</link> damage of your Dreadful Strike becomes 2d8.",
            "In addition, when you use the Dreadful Strike effect of your Dread Ambusher feature, you can cause one of the following additional effects.",
            "<strong>Sudden Strike.</strong> You can make another attack with the same weapon against a different creature that is within 5 feet of the original target and that is within the weapon's range.",
            "<strong>Mass Fear.</strong> The target and each creature within 10 feet of it must make a <link:Wisdom Saving Throw>Wisdom saving throw</link> against your spell save DC.",
            "On a failed save, a creature has the <link:Frightened>Frightened</link> condition until the start of your next turn."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.SHADOWY_DODGE, {
        description: [
          "When a creature makes an attack roll against you, you can take a Reaction to impose <link:Disadvantage>Disadvantage</link> on that roll.",
          "Whether the attack hits or misses, you can then teleport up to 30 feet to an unoccupied space you can see."
        ],
        ...notTracked
      })
    ]
  },
  {
    id: "ranger-hunter",
    name: "Hunter",
    className: "Ranger",
    tagline: "Protect Nature and People from Destruction",
    summary:
      "You stalk prey in the wilds and elsewhere, using your abilities as a Hunter to protect nature and people everywhere from forces that would destroy them.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.HUNTERS_PREY, {
        description: [
          "You gain one of the following feature options of your choice. Whenever you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>, you can replace the chosen option with the other one.",
          "<strong>Colossus Slayer.</strong> Your tenacity can wear down even the most resilient foes. When you hit a creature with a weapon, the weapon deals an extra 1d8 damage to the target if it's missing any of its Hit Points. You can deal this extra damage only once per turn.",
          "<strong>Horde Breaker.</strong> Once on each of your turns when you make an attack with a weapon, you can make another attack with the same weapon against a different creature that is within 5 feet of the original target, that is within the weapon's range, and that you haven't attacked this turn."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.HUNTERS_LORE, {
        description: [
          "You can call on the forces of nature to reveal certain strengths and weaknesses of your prey.",
          "While a creature is marked by your <spell:Hunter's Mark>Hunter's Mark</spell>, you know whether that creature has any <link:Immunities>Immunities</link>, <link:Resistances>Resistances</link>, or <link:Vulnerabilities>Vulnerabilities</link>, and if the creature has any, you know what they are."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_7,
        CLASS_FEATURE.DEFENSIVE_TACTICS,
        {
          description: [
            "You gain one of the following feature options of your choice. Whenever you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>, you can replace the chosen option with the other one.",
            "<strong>Escape the Horde.</strong> Opportunity Attacks have <link:Disadvantage>Disadvantage</link> against you.",
            "<strong>Multiattack Defense.</strong> When a creature hits you with an attack roll, that creature has <link:Disadvantage>Disadvantage</link> on all other attack rolls against you this turn."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_11,
        CLASS_FEATURE.SUPERIOR_HUNTERS_PREY,
        {
          description: [
            "Once per turn when you deal damage to a creature marked by your <spell:Hunter's Mark>Hunter's Mark</spell>, you can also deal that spell's extra damage to a different creature that you can see within 30 feet of the first creature."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_15,
        CLASS_FEATURE.SUPERIOR_HUNTERS_DEFENSE,
        {
          description: [
            "When you take damage, you can take a Reaction to give yourself <link:Resistance>Resistance</link> to that damage and any other damage of the same type until the end of the current turn."
          ],
          ...notTracked
        }
      )
    ]
  },
  {
    id: "ranger-winter-walker",
    name: "Winter Walker",
    className: "Ranger",
    tagline: "Withstand the Horrors of Frigid Wastelands",
    summary:
      "Winter Walkers hone their craft in the bleak and frozen wilds of places like Icewind Dale. These ruthless, rimed Rangers hunt monsters that haunt arctic wastelands, eventually becoming frigid terrors themselves. Winter Walkers are well versed in the phenomena of Icewind Dale, including the latent magic of fallen Netherese cities, endemic monsters like yetis and crag cats, and the rising threat of Underdark invaders. Due to their cold pragmatism, terrifying magic, and mastery of the region, Winter Walkers are regarded with equal parts respect and fear.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.FRIGID_EXPLORER, {
        description: [
          "You gain the following benefits.",
          "<strong>Biting Cold.</strong> Damage from your weapon attacks, Ranger spells, and Ranger features ignores <link:Resistance>Resistance</link> to <link:Cold>Cold</link> damage.",
          "<strong>Frost Resistance.</strong> You have <link:Resistance>Resistance</link> to <link:Cold>Cold</link> damage.",
          "<strong>Polar Strikes.</strong> When you hit a creature with an attack roll using a weapon, you can deal an extra 1d4 <link:Cold>Cold</link> damage to the target, which can take this extra damage only once per turn.",
          "When you reach Ranger level 11, this extra damage increases to 1d6."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.HUNTERS_RIME, {
        description: [
          "Ice rimes you and your prey, protecting you and slowing them.",
          "When you cast <spell:Hunter's Mark>Hunter's Mark</spell>, you gain <link:Temporary Hit Points>Temporary Hit Points</link> equal to 1d10 plus your Ranger level.",
          "Additionally, while a creature is marked by your <spell:Hunter's Mark>Hunter's Mark</spell>, it can't take the Disengage action."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.WINTER_WALKER_SPELLS,
        {
          description: [
            "When you reach a Ranger level specified in the Winter Walker Spells table, you thereafter always have the listed spells prepared.",
            "<strong>Level 3.</strong> <spell:Ice Knife>Ice Knife</spell>",
            "<strong>Level 5.</strong> <spell:Hold Person>Hold Person</spell>",
            "<strong>Level 9.</strong> <spell:Remove Curse>Remove Curse</spell>",
            "<strong>Level 13.</strong> <spell:Ice Storm>Ice Storm</spell>",
            "<strong>Level 17.</strong> <spell:Cone of Cold>Cone of Cold</spell>"
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_7, CLASS_FEATURE.FORTIFYING_SOUL, {
        description: [
          "Your experience surviving harrowing environments allows you to bolster your allies in addition to yourself.",
          "As a Magic action, choose a number of creatures you can see equal to your <link:WIS>Wisdom</link> modifier (minimum of one).",
          "Each chosen creature regains Hit Points equal to 1d10 plus your Ranger level and has <link:Advantage>Advantage</link> on saving throws to avoid or end the <link:Frightened>Frightened</link> condition for 1 hour.",
          "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link>."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_11,
        CLASS_FEATURE.CHILLING_RETRIBUTION,
        {
          description: [
            "When a creature hits you with an attack roll, you can take a Reaction to force the creature to make a <link:Wisdom Saving Throw>Wisdom saving throw</link> against your spell save DC.",
            "On a failed save, the target has the <link:Stunned>Stunned</link> condition until the end of your next turn.",
            "While the target is <link:Stunned>Stunned</link>, its <link:Speed>Speed</link> is reduced to 0 feet.",
            "You can use this feature a number of times equal to your <link:WIS>Wisdom</link> modifier (minimum of once), and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
          ],
          ...notTracked
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_15, CLASS_FEATURE.FROZEN_HAUNT, {
        description: [
          "When you cast <spell:Hunter's Mark>Hunter's Mark</spell>, you can adopt a ghostly, snowy form.",
          "This form lasts until the spell ends, and while you are in this form, you gain the following benefits.",
          "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link> unless you expend a level 4+ spell slot (no action required).",
          "<strong>Frozen Soul.</strong> You have <link:Immunity>Immunity</link> to <link:Cold>Cold</link> damage.",
          "When you first adopt this form and at the start of each of your subsequent turns, each creature of your choice in a 15-foot <link:Emanation>Emanation</link> originating from you takes 2d4 <link:Cold>Cold</link> damage.",
          "<strong>Partially Incorporeal.</strong> You have <link:Immunity>Immunity</link> to the <link:Grappled>Grappled</link>, <link:Prone>Prone</link>, and <link:Restrained>Restrained</link> conditions.",
          "You can move through creatures and objects as if they were Difficult Terrain, but you take 1d10 <link:Force>Force</link> damage if you end your turn inside a creature or an object.",
          "If the form ends while you are inside a creature or an object, you are shunted to the nearest unoccupied space."
        ],
        ...notTracked
      })
    ]
  }
];
