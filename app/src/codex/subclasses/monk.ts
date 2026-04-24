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
  LEVEL_11: 11,
  LEVEL_17: 17
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

export const monkSubclassEntries: SubclassEntry[] = [
  {
    id: "monk-warrior-of-mercy",
    name: "Warrior of Mercy",
    className: "Monk",
    tagline: "Manipulate Forces of Life and Death",
    summary:
      "Warriors of Mercy manipulate the life force of others. These Monks are wandering physicians, but they bring a swift end to their enemies. They often wear masks, presenting themselves as faceless bringers of life and death.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.HAND_OF_HARM, {
        description: [
          "Once per turn when you hit a creature with an Unarmed Strike and deal damage, you can expend 1 Focus Point to deal extra <link:Necrotic>Necrotic</link> damage equal to one roll of your Martial Arts die plus your <link:WIS>Wisdom</link> modifier."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.HAND_OF_HEALING, {
        description: [
          "As a Magic action, you can expend 1 Focus Point to touch a creature and restore a number of Hit Points equal to a roll of your Martial Arts die plus your <link:WIS>Wisdom</link> modifier.",
          "When you use your Flurry of Blows, you can replace one of the Unarmed Strikes with a use of this feature without expending a Focus Point for the healing."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.IMPLEMENTS_OF_MERCY, {
        description: [
          "You gain proficiency in the <link:Insight>Insight</link> and <link:Medicine>Medicine</link> skills and proficiency with the Herbalism Kit."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.PHYSICIANS_TOUCH, {
        description: [
          "Your Hand of Harm and Hand of Healing improve, as detailed below.",
          "<strong>Hand of Harm.</strong> When you use Hand of Harm on a creature, you can also give that creature the <link:Poisoned>Poisoned</link> condition until the end of your next turn.",
          "<strong>Hand of Healing.</strong> When you use Hand of Healing, you can also end one of the following conditions on the creature you heal: <link:Blinded>Blinded</link>, <link:Deafened>Deafened</link>, <link:Paralyzed>Paralyzed</link>, <link:Poisoned>Poisoned</link>, or <link:Stunned>Stunned</link>."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_11,
        CLASS_FEATURE.FLURRY_OF_HEALING_AND_HARM,
        {
          description: [
            "When you use Flurry of Blows, you can replace each of the Unarmed Strikes with a use of Hand of Healing without expending Focus Points for the healing.",
            "In addition, when you make an Unarmed Strike with Flurry of Blows and deal damage, you can use Hand of Harm with that strike without expending a Focus Point for Hand of Harm. You can still use Hand of Harm only once per turn.",
            "You can use these benefits a total number of times equal to your <link:WIS>Wisdom</link> modifier (minimum of once). You regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_17,
        CLASS_FEATURE.HAND_OF_ULTIMATE_MERCY,
        {
          description: [
            "Your mastery of life energy opens the door to the ultimate mercy. As a Magic action, you can touch the corpse of a creature that died within the past 24 hours and expend 5 Focus Points. The creature then returns to life with a number of Hit Points equal to <strong>4d10</strong> plus your <link:WIS>Wisdom</link> modifier.",
            "If the creature died with any of the following conditions, the creature revives with the conditions removed: <link:Blinded>Blinded</link>, <link:Deafened>Deafened</link>, <link:Paralyzed>Paralyzed</link>, <link:Poisoned>Poisoned</link>, and <link:Stunned>Stunned</link>.",
            "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link>."
          ],
          trackingState: TRACKER.SEMI_TRACKED
        }
      )
    ]
  },
  {
    id: "monk-warrior-of-shadow",
    name: "Warrior of Shadow",
    className: "Monk",
    tagline: "Harness Shadow Power for Stealth and Subterfuge",
    summary:
      "Warriors of Shadow practice stealth and subterfuge, harnessing the power of the Shadowfell. They are at home in darkness, able to draw gloom around themselves to hide, leap from shadow to shadow, and take on a wraithlike form.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.SHADOW_ARTS, {
        description: [
          "You have learned to draw on the power of the Shadowfell, gaining the following benefits.",
          "<strong>Darkness.</strong> You can expend 1 Focus Point to cast the <spell:Darkness>Darkness</spell> spell without spell components. You can see within the spell's area when you cast it with this feature. While the spell persists, you can move its area to a space within 60 feet of yourself at the start of each of your turns.",
          "<strong>Darkvision.</strong> You gain <link:Darkvision>Darkvision</link> with a range of 60 feet. If you already have Darkvision, its range increases by 60 feet.",
          "<strong>Shadowy Figments.</strong> You know the <spell:Minor Illusion>Minor Illusion</spell> spell. <link:WIS>Wisdom</link> is your spellcasting ability for it."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.SHADOW_STEP, {
        description: [
          "While entirely within Dim Light or Darkness, you can use a Bonus Action to teleport up to 60 feet to an unoccupied space you can see that is also in Dim Light or Darkness.",
          "You then have <link:Advantage>Advantage</link> on the next melee attack you make before the end of the current turn."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_11,
        CLASS_FEATURE.IMPROVED_SHADOW_STEP,
        {
          description: [
            "You can draw on your Shadowfell connection to empower your teleportation.",
            "When you use your Shadow Step, you can expend 1 Focus Point to remove the requirement that you must start and end in Dim Light or Darkness for that use of the feature.",
            "As part of this Bonus Action, you can make an Unarmed Strike immediately after you teleport."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.CLOAK_OF_SHADOWS, {
        description: [
          "As a Magic action while entirely within Dim Light or Darkness, you can expend 3 Focus Points to shroud yourself with shadows for 1 minute, until you have the <link:Incapacitated>Incapacitated</link> condition, or until you end your turn in Bright Light.",
          "While shrouded by these shadows, you gain the following benefits.",
          "<strong>Invisibility.</strong> You have the <link:Invisible>Invisible</link> condition.",
          "<strong>Partially Incorporeal.</strong> You can move through occupied spaces as if they were Difficult Terrain. If you end your turn in such a space, you are shunted to the last unoccupied space you were in.",
          "<strong>Shadow Flurry.</strong> You can use your Flurry of Blows without expending any Focus Points."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "monk-warrior-of-the-elements",
    name: "Warrior of the Elements",
    className: "Monk",
    tagline: "Wield Strikes and Bursts of Elemental Power",
    summary:
      "Warriors of the Elements tap into the power of the Elemental Planes. Harnessing their supernatural focus, these Monks momentarily tame the energy of the Elemental Chaos to empower themselves in and out of battle.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.ELEMENTAL_ATTUNEMENT,
        {
          description: [
            "At the start of your turn, you can expend 1 Focus Point to imbue yourself with elemental energy. The energy lasts for 10 minutes or until you have the <link:Incapacitated>Incapacitated</link> condition.",
            "You gain the following benefits while this feature is active.",
            "<strong>Reach.</strong> When you make an Unarmed Strike, your reach is 10 feet greater than normal, as elemental energy extends from you.",
            "<strong>Elemental Strikes.</strong> Whenever you hit with your Unarmed Strike, you can cause it to deal your choice of <link:Acid>Acid</link>, <link:Cold>Cold</link>, <link:Fire>Fire</link>, <link:Lightning>Lightning</link>, or <link:Thunder>Thunder</link> damage rather than its normal damage type.",
            "When you deal one of these types with it, you can also force the target to make a <link:Strength Saving Throw>Strength saving throw</link>. On a failed save, you can move the target up to 10 feet toward or away from you, as elemental energy swirls around it."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.MANIPULATE_ELEMENTS, {
        description: [
          "You know the Elementalism spell. <link:WIS>Wisdom</link> is your spellcasting ability for it."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.ELEMENTAL_BURST, {
        description: [
          "As a Magic action, you can expend 2 Focus Points to cause elemental energy to burst in a 20-foot-radius Sphere centered on a point within 120 feet of yourself.",
          "Choose a damage type: <link:Acid>Acid</link>, <link:Cold>Cold</link>, <link:Fire>Fire</link>, <link:Lightning>Lightning</link>, or <link:Thunder>Thunder</link>.",
          "Each creature in the Sphere must make a <link:Dexterity Saving Throw>Dexterity saving throw</link>. On a failed save, a creature takes damage of the chosen type equal to three rolls of your Martial Arts die. On a successful save, a creature takes half as much damage."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_11,
        CLASS_FEATURE.STRIDE_OF_THE_ELEMENTS,
        {
          description: [
            "While your Elemental Attunement is active, you also have a Fly Speed and a Swim Speed equal to your <link:Speed>Speed</link>."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.ELEMENTAL_EPITOME, {
        description: [
          "While your Elemental Attunement is active, you also gain the following benefits.",
          "<strong>Damage Resistance.</strong> You gain <link:Resistance>Resistance</link> to one of the following damage types of your choice: <link:Acid>Acid</link>, <link:Cold>Cold</link>, <link:Fire>Fire</link>, <link:Lightning>Lightning</link>, or <link:Thunder>Thunder</link>. At the start of each of your turns, you can change this choice.",
          "<strong>Destructive Stride.</strong> When you use your Step of the Wind, your <link:Speed>Speed</link> increases by 20 feet until the end of the turn. For that duration, any creature of your choice takes damage equal to one roll of your Martial Arts die when you enter a space within 5 feet of it. The damage type is your choice of <link:Acid>Acid</link>, <link:Cold>Cold</link>, <link:Fire>Fire</link>, <link:Lightning>Lightning</link>, or <link:Thunder>Thunder</link>. A creature can take this damage only once per turn.",
          "<strong>Empowered Strikes.</strong> Once on each of your turns, you can deal extra damage to a target equal to one roll of your Martial Arts die when you hit it with an Unarmed Strike. The extra damage is the same type dealt by that strike."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    id: "monk-warrior-of-the-open-hand",
    name: "Warrior of the Open Hand",
    className: "Monk",
    tagline: "Master Unarmed Combat Techniques",
    summary:
      "Warriors of the Open Hand are masters of unarmed combat. They learn techniques to push and trip their opponents and manipulate their own energy to protect themselves from harm.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.OPEN_HAND_TECHNIQUE, {
        description: [
          "Whenever you hit a creature with an attack granted by your Flurry of Blows, you can impose one of the following effects on that target.",
          "<strong>Addle.</strong> The target can't make Opportunity Attacks until the start of its next turn.",
          "<strong>Push.</strong> The target must succeed on a <link:Strength Saving Throw>Strength saving throw</link> or be pushed up to 15 feet away from you.",
          "<strong>Topple.</strong> The target must succeed on a <link:Dexterity Saving Throw>Dexterity saving throw</link> or have the <link:Prone>Prone</link> condition."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.WHOLENESS_OF_BODY, {
        description: [
          "You gain the ability to heal yourself. As a Bonus Action, you can roll your Martial Arts die. You regain a number of Hit Points equal to the number rolled plus your <link:WIS>Wisdom</link> modifier (minimum of 1 Hit Point regained).",
          "You can use this feature a number of times equal to your <link:WIS>Wisdom</link> modifier (minimum of once), and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_11, CLASS_FEATURE.FLEET_STEP, {
        description: [
          "When you take a Bonus Action other than Step of the Wind, you can also use Step of the Wind immediately after that Bonus Action."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.QUIVERING_PALM, {
        description: [
          "You gain the ability to set up lethal vibrations in someone's body. When you hit a creature with an Unarmed Strike, you can expend 4 Focus Points to start these imperceptible vibrations, which last for a number of days equal to your Monk level.",
          "The vibrations are harmless unless you take an action to end them. Alternatively, when you take the Attack action on your turn, you can forgo one of the attacks to end the vibrations. To end them, you and the target must be on the same plane of existence.",
          "When you end them, the target must make a <link:Constitution Saving Throw>Constitution saving throw</link>, taking <strong>10d12</strong> <link:Force>Force</link> damage on a failed save or half as much damage on a successful one.",
          "You can have only one creature under the effect of this feature at a time. You can end the vibrations harmlessly (no action required)."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  }
];
