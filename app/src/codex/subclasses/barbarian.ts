import { CLASS_FEATURE } from "../entries/enums";
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

export const berserkerRetaliationDescription = [
  "When you take damage from a creature that is within 5 feet of you, you can take a Reaction to make one melee attack against that creature. <link:tracked>Tracked</link>",
  "You can make the attack using a weapon or an Unarmed Strike. <link:not-tracked>Not Tracked</link>"
];

export const barbarianSubclassEntries: SubclassEntry[] = [
  {
    id: "barbarian-path-of-the-berserker",
    name: "Path of the Berserker",
    className: "Barbarian",
    tagline: "Channel Rage into Violent Fury",
    summary:
      "Barbarians who walk the Path of the Berserker direct their Rage primarily toward violence. Their path is one of untrammeled fury, and they thrill in the chaos of battle as they allow their Rage to seize and empower them.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.FRENZY, {
        description: [
          "If you use Reckless Attack while your <link:Rage>Rage</link> is active, you deal extra damage to the first target you hit on your turn with a Strength-based attack.",
          "To determine the extra damage, roll a number of <strong>d6</strong>s equal to your Rage Damage bonus and add them together.",
          "The damage has the same type as the weapon or Unarmed Strike used for the attack."
        ],
        isTracked: true
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.MINDLESS_RAGE, {
        description: [
          "You have <link:Immunity>Immunity</link> to the <link:Charmed>Charmed</link> and <link:Frightened>Frightened</link> conditions while your <link:Rage>Rage</link> is active.",
          "If you're Charmed or Frightened when you enter your Rage, the condition ends on you."
        ],
        isTracked: true
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.RETALIATION, {
        description: berserkerRetaliationDescription,
        trackingState: "semi-tracked"
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_14,
        CLASS_FEATURE.INTIMIDATING_PRESENCE,
        {
          description: [
            "As a Bonus Action, you can strike terror into others with your menacing presence and primal power.",
            "When you do so, each creature of your choice in a 30-foot <link:Emanation>Emanation</link> originating from you must make a <link:Wisdom Saving Throw>Wisdom saving throw</link> with a DC equal to 8 plus your Strength modifier and <link:Proficiency Bonus>Proficiency Bonus</link>.",
            "On a failed save, a creature has the <link:Frightened>Frightened</link> condition for 1 minute.",
            "At the end of each Frightened creature's turns, the creature repeats the save, ending the effect on itself on a success.",
            "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link> unless you expend a use of your <link:Rage>Rage</link>, no action required, to restore your use of it.",
            "This feature is <link:semi-tracked>Semi Tracked</link>. The usage is tracked but not the effect of the feature."
          ],
          trackingState: "semi-tracked"
        }
      )
    ]
  },
  {
    id: "barbarian-path-of-the-wild-heart",
    name: "Path of the Wild Heart",
    className: "Barbarian",
    tagline: "Walk in Community with the Animal World",
    summary:
      "Barbarians who follow the Path of the Wild Heart view themselves as kin to animals. These Barbarians learn magical means to communicate with animals, and their Rage heightens their connection to animals as it fills them with supernatural might.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.ANIMAL_SPEAKER, {
        description: [
          "You can cast <link:Beast Sense>Beast Sense</link> and <link:Speak with Animals>Speak with Animals</link>, but only as Rituals.",
          "Wisdom is your spellcasting ability for them."
        ],
        isTracked: false
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.RAGE_OF_THE_WILDS, {
        description: [
          "Your <link:Rage>Rage</link> taps into the primal power of animals. Whenever you activate your Rage, you gain one of the following options of your choice.",
          "<strong>Bear.</strong> While your Rage is active, you have <link:Resistance>Resistance</link> to every damage type except Force, Necrotic, Psychic, and Radiant.",
          "<strong>Eagle.</strong> When you activate your Rage, you can take the Disengage and Dash actions as part of that Bonus Action. While your Rage is active, you can take a Bonus Action to take both of those actions.",
          "<strong>Wolf.</strong> While your Rage is active, your allies have <link:Advantage>Advantage</link> on attack rolls against any enemy of yours within 5 feet of you."
        ],
        isTracked: false
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.ASPECT_OF_THE_WILDS, {
        description: [
          "You gain one of the following options of your choice. Whenever you finish a <link:long-rest>Long Rest</link>, you can change your choice.",
          "<strong>Owl.</strong> You have <link:Darkvision>Darkvision</link> with a range of 60 feet. If you already have Darkvision, its range increases by 60 feet.",
          "<strong>Panther.</strong> You have a Climb Speed equal to your Speed.",
          "<strong>Salmon.</strong> You have a Swim Speed equal to your Speed."
        ],
        isTracked: false
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.NATURE_SPEAKER, {
        description: [
          "You can cast <link:Commune with Nature>Commune with Nature</link>, but only as a Ritual.",
          "Wisdom is your spellcasting ability for it."
        ],
        isTracked: false
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.POWER_OF_THE_WILDS, {
        description: [
          "Whenever you activate your <link:Rage>Rage</link>, you gain one of the following options of your choice.",
          "<strong>Falcon.</strong> While your Rage is active, you have a Fly Speed equal to your Speed if you aren't wearing any armor.",
          "<strong>Lion.</strong> While your Rage is active, any of your enemies within 5 feet of you have <link:Disadvantage>Disadvantage</link> on attack rolls against targets other than you or another Barbarian who has this option active.",
          "<strong>Ram.</strong> While your Rage is active, you can cause a Large or smaller creature to have the <link:Prone>Prone</link> condition when you hit it with a melee attack."
        ],
        isTracked: false
      })
    ]
  },
  {
    id: "barbarian-path-of-the-world-tree",
    name: "Path of the World Tree",
    className: "Barbarian",
    tagline: "Trace the Roots and Branches of the Multiverse",
    summary:
      "Barbarians who follow the Path of the World Tree connect with the cosmic tree Yggdrasil through their Rage. This tree grows among the Outer Planes, connecting them to each other and the Material Plane. These Barbarians draw on the tree's magic for vitality and as a means of dimensional travel.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.VITALITY_OF_THE_TREE,
        {
          description: [
            "Your <link:Rage>Rage</link> taps into the life force of the World Tree. You gain the following benefits.",
            "<strong>Vitality Surge.</strong> When you activate your Rage, you gain a number of <link:Temporary Hit Points>Temporary Hit Points</link> equal to your Barbarian level.",
            "<strong>Life-Giving Force.</strong> At the start of each of your turns while your Rage is active, you can choose another creature within 10 feet of yourself to gain Temporary Hit Points.",
            "To determine the number of Temporary Hit Points, roll a number of d6s equal to your Rage Damage bonus and add them together.",
            "If any of these Temporary Hit Points remain when your Rage ends, they vanish."
          ],
          isTracked: false
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.BRANCHES_OF_THE_TREE,
        {
          description: [
            "Whenever a creature you can see starts its turn within 30 feet of you while your <link:Rage>Rage</link> is active, you can take a reaction to summon spectral branches of the World Tree around it.",
            "The target must succeed on a <link:Strength Saving Throw>Strength saving throw</link> with a DC equal to 8 plus your Strength modifier and <link:Proficiency Bonus>Proficiency Bonus</link>, or be teleported to an unoccupied space you can see within 5 feet of yourself or in the nearest unoccupied space you can see.",
            "After the target teleports, you can reduce its Speed to 0 until the end of the current turn."
          ],
          isTracked: false
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.BATTERING_ROOTS, {
        description: [
          "During your turn, your reach is 10 feet greater with any Melee weapon that has the <link:Heavy>Heavy</link> or <link:Versatile>Versatile</link> property, as tendrils of the World Tree extend from you.",
          "When you hit with such a weapon on your turn, you can activate the <link:Push>Push</link> or <link:Topple>Topple</link> mastery property in addition to a different mastery property you're using with that weapon."
        ],
        isTracked: false
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_14,
        CLASS_FEATURE.TRAVEL_ALONG_THE_TREE,
        {
          description: [
            "When you activate your <link:Rage>Rage</link> and as a Bonus Action while your Rage is active, you can teleport up to 60 feet to an unoccupied space you can see.",
            "In addition, once per Rage, you can increase the range of that teleport to 150 feet.",
            "When you do so, you can also bring up to six willing creatures who are within 10 feet of you.",
            "Each creature teleports to an unoccupied space of your choice within 10 feet of your destination space."
          ],
          isTracked: false
        }
      )
    ]
  },
  {
    id: "barbarian-path-of-the-zealot",
    name: "Path of the Zealot",
    className: "Barbarian",
    tagline: "Rage in Ecstatic Union with a God",
    summary:
      "Barbarians who walk the Path of the Zealot receive boons from a god or pantheon. These Barbarians experience their Rage as an ecstatic episode of divine union that infuses them with power. They are often allies to the priests and other followers of their god or pantheon.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.DIVINE_FURY, {
        description: [
          "You can channel divine power into your strikes.",
          "On each of your turns while your <link:Rage>Rage</link> is active, the first creature you hit with a weapon or an Unarmed Strike takes extra damage equal to 1d6 plus half your Barbarian level, round down.",
          "The extra damage is <link:Necrotic>Necrotic</link> or <link:Radiant>Radiant</link>; you choose the type each time you deal the damage."
        ],
        isTracked: false
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.WARRIOR_OF_THE_GODS, {
        description: [
          "A divine entity helps ensure you can continue the fight. You have a pool of four d12s that you can spend to heal yourself.",
          "As a Bonus Action, you can expend dice from the pool, roll them, and regain a number of Hit Points equal to the roll's total.",
          "Your pool regains all expended dice when you finish a <link:long-rest>Long Rest</link>.",
          "The pool's maximum number of dice increases by one when you reach Barbarian levels 6, 12, and 17."
        ],
        isTracked: false
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.FANATICAL_FOCUS, {
        description: [
          "Once per active <link:Rage>Rage</link>, if you fail a saving throw, you can reroll it with a bonus equal to your Rage Damage bonus.",
          "You must use the new roll."
        ],
        isTracked: false
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_10, CLASS_FEATURE.ZEALOUS_PRESENCE, {
        description: [
          "As a Bonus Action, you unleash a battle cry infused with divine energy.",
          "Up to ten other creatures of your choice within 60 feet of you gain <link:Advantage>Advantage</link> on attack rolls and saving throws until the start of your next turn.",
          "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link> unless you expend a use of your <link:Rage>Rage</link>, no action required, to restore your use of it."
        ],
        isTracked: false
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_14, CLASS_FEATURE.RAGE_OF_THE_GODS, {
        description: [
          "When you activate your <link:Rage>Rage</link>, you can assume the form of a divine warrior.",
          "This form lasts for 1 minute or until you drop to 0 Hit Points. Once you use this feature, you can't do so again until you finish a <link:long-rest>Long Rest</link>.",
          "While in this form, you gain the benefits below.",
          "<strong>Flight.</strong> You have a Fly Speed equal to your Speed and can hover.",
          "<strong>Resistance.</strong> You have <link:Resistance>Resistance</link> to <link:Necrotic>Necrotic</link>, <link:Psychic>Psychic</link>, and <link:Radiant>Radiant</link> damage.",
          "<strong>Revivification.</strong> When a creature within 30 feet of you would drop to 0 Hit Points, you can take a Reaction to expend a use of your <link:Rage>Rage</link> to instead change the target's Hit Points to a number equal to your Barbarian level."
        ],
        isTracked: false
      })
    ]
  }
];
