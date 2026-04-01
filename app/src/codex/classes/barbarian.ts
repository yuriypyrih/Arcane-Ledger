import { CLASS_FEATURE, TRACKER } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";

export type BarbarianFeatureClassObj = FeatureClassObj & {
  rages: number;
  rageDamage: number;
  weaponMastery: number;
};

export const barbarianFeatures: BarbarianFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [
      CLASS_FEATURE.RAGE,
      CLASS_FEATURE.UNARMORED_DEFENSE,
      CLASS_FEATURE.WEAPON_MASTERY
    ],
    rages: 2,
    rageDamage: 2,
    weaponMastery: 2
  },
  {
    level: 2,
    classFeatures: [CLASS_FEATURE.DANGER_SENSE, CLASS_FEATURE.RECKLESS_ATTACK],
    rages: 2,
    rageDamage: 2,
    weaponMastery: 2
  },
  {
    level: 3,
    classFeatures: [CLASS_FEATURE.PRIMAL_KNOWLEDGE],
    rages: 3,
    rageDamage: 2,
    weaponMastery: 2
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    rages: 3,
    rageDamage: 2,
    weaponMastery: 3
  },
  {
    level: 5,
    classFeatures: [CLASS_FEATURE.EXTRA_ATTACK, CLASS_FEATURE.FAST_MOVEMENT],
    rages: 3,
    rageDamage: 2,
    weaponMastery: 3
  },
  {
    level: 6,
    classFeatures: [],
    rages: 4,
    rageDamage: 2,
    weaponMastery: 3
  },
  {
    level: 7,
    classFeatures: [CLASS_FEATURE.FERAL_INSTINCT, CLASS_FEATURE.INSTINCTIVE_POUNCE],
    rages: 4,
    rageDamage: 2,
    weaponMastery: 3
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    rages: 4,
    rageDamage: 2,
    weaponMastery: 3
  },
  {
    level: 9,
    classFeatures: [CLASS_FEATURE.BRUTAL_STRIKE],
    rages: 4,
    rageDamage: 3,
    weaponMastery: 3
  },
  {
    level: 10,
    classFeatures: [],
    rages: 4,
    rageDamage: 3,
    weaponMastery: 4
  },
  {
    level: 11,
    classFeatures: [CLASS_FEATURE.RELENTLESS_RAGE],
    rages: 4,
    rageDamage: 3,
    weaponMastery: 4
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    rages: 5,
    rageDamage: 3,
    weaponMastery: 4
  },
  {
    level: 13,
    classFeatures: [CLASS_FEATURE.IMPROVED_BRUTAL_STRIKE],
    rages: 5,
    rageDamage: 3,
    weaponMastery: 4
  },
  {
    level: 14,
    classFeatures: [],
    rages: 5,
    rageDamage: 3,
    weaponMastery: 4
  },
  {
    level: 15,
    classFeatures: [CLASS_FEATURE.PERSISTENT_RAGE],
    rages: 5,
    rageDamage: 3,
    weaponMastery: 4
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    rages: 5,
    rageDamage: 4,
    weaponMastery: 4
  },
  {
    level: 17,
    classFeatures: [CLASS_FEATURE.IMPROVED_BRUTAL_STRIKE],
    featureOverrides: {
      [CLASS_FEATURE.IMPROVED_BRUTAL_STRIKE]: {
        description: [
          "The extra damage of your Brutal Strike increases to <strong>2d10</strong>.",
          "In addition, you can use two different Brutal Strike effects whenever you use your Brutal Strike feature."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }
    },
    rages: 6,
    rageDamage: 4,
    weaponMastery: 4
  },
  {
    level: 18,
    classFeatures: [CLASS_FEATURE.INDOMITABLE_MIGHT],
    rages: 6,
    rageDamage: 4,
    weaponMastery: 4
  },
  {
    level: 19,
    classFeatures: [CLASS_FEATURE.EPIC_BOON],
    featureOverrides: {
      [CLASS_FEATURE.EPIC_BOON]: {
        description: [
          "You gain an Epic Boon feat, or another feat of your choice for which you qualify.",
          "Boon of Irresistible Offense is recommended."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }
    },
    rages: 6,
    rageDamage: 4,
    weaponMastery: 4
  },
  {
    level: 20,
    classFeatures: [CLASS_FEATURE.PRIMAL_CHAMPION],
    rages: 6,
    rageDamage: 4,
    weaponMastery: 4
  }
];

export const barbarianFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.RAGE]: {
    description: [
      "You can imbue yourself with a primal power called <strong>Rage</strong>, a force that grants you extraordinary might and resilience. You can enter it as a Bonus Action if you aren't wearing Heavy armor.",
      "The times you can enter into Rage increases with your Barbarian level. You regain one expended use when you finish a <link:short-rest>Short Rest</link>, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
      "While active, your Rage follows the rules below.",
      "<strong>Damage Resistance.</strong> You have <link:resistance>Resistance</link> to Bludgeoning, Piercing, and Slashing damage.",
      "<strong>Rage Damage.</strong> When you make an attack using Strength, with either a weapon or an Unarmed Strike, and deal damage to the target, you gain a bonus to the damage that increases as you gain levels as a Barbarian.",
      "<strong>Strength Advantage.</strong> You have Advantage on Strength checks and Strength saving throws.",
      "<strong>No Concentration or Spells.</strong> You can't maintain Concentration, and you can't cast spells.",
      "<strong>Duration.</strong> The Rage lasts until the end of your next turn, and it ends early if you don Heavy armor or have the Incapacitated condition.",
      "If your Rage is still active on your next turn, you can extend the Rage for another round by doing one of the following:",
      "Make an attack roll against an enemy.",
      "Force an enemy to make a saving throw.",
      "Take a Bonus Action to extend your Rage.",
      "Each time the Rage is extended, it lasts until the end of your next turn. You can maintain a Rage for up to 10 minutes.",
      "(All these rules are <link:tracked>Tracked</link> except prolonging the Rage state. The app simply adds it with 10m duration. You should end it earlier if you cannot fulfill its requirements.)"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.UNARMORED_DEFENSE]: {
    description: [
      "While you aren't wearing any armor, your base Armor Class equals 10 plus your Dexterity and Constitution modifiers. You can use a Shield and still gain this benefit."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.WEAPON_MASTERY]: {
    description: [
      "Your training with weapons allows you to use the mastery properties of two kinds of Simple or Martial Melee weapons of your choice, such as Greataxes and Handaxes. Whenever you finish a <link:long-rest>Long Rest</link>, you can practice weapon drills and change one of those weapon choices.",
      "When you reach certain Barbarian levels, you gain the ability to use the mastery properties of more kinds of weapons [3 masteries at level-4 and 4 masteries at level-10]."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.DANGER_SENSE]: {
    description: [
      "You gain an uncanny sense of when things aren't as they should be, giving you an edge when you dodge perils.",
      "You have Advantage on Dexterity saving throws unless you have the Incapacitated condition."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.RECKLESS_ATTACK]: {
    description: [
      "You can throw aside all concern for defense to attack with increased ferocity.",
      "When you make your first attack roll on your turn, you can decide to attack recklessly. Doing so gives you <link:advantage>Advantage</link> on attack rolls using Strength until the start of your next turn, but attack rolls against you have <link:advantage>Advantage</link> during that time.",
      "(The app is tracking the usage but you have to remember that others have advantage over you.)"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.PRIMAL_KNOWLEDGE]: {
    description: [
      "You gain proficiency in another skill of your choice from the skill list available to Barbarians at level 1.",
      "In addition, while your Rage is active, you can channel primal power when you attempt certain tasks. Whenever you make an ability check using <link:Acrobatics>Acrobatics</link>, <link:Intimidation>Intimidation</link>, <link:Perception>Perception</link>, <link:Stealth>Stealth</link>, or <link:Survival>Survival</link>, you can make it as a Strength check even if it normally uses a different ability.",
      "When you use this ability, your Strength represents primal power coursing through you, honing your agility, bearing, and senses."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.EXTRA_ATTACK]: {
    description: [
      "You can attack twice instead of once whenever you take the Attack action on your turn."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.FAST_MOVEMENT]: {
    description: ["Your Speed increases by 10 feet while you aren't wearing Heavy armor."],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.FERAL_INSTINCT]: {
    description: ["Your instincts are so honed that you have Advantage on Initiative rolls."],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.INSTINCTIVE_POUNCE]: {
    description: [
      "As part of the Bonus Action you take to enter your Rage, you can move up to half your Speed."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.BRUTAL_STRIKE]: {
    description: [
      "If you use Reckless Attack, you can forgo any Advantage on one Strength-based attack roll of your choice on your turn. The chosen attack roll mustn't have Disadvantage. <link:not-tracked>Not Tracked</link>",
      "If the chosen attack roll hits, the target takes an extra 1d10 damage of the same type dealt by the weapon or Unarmed Strike, and you can cause one Brutal Strike effect of your choice. <link:tracked>Tracked</link>",
      "<strong>Forceful Blow.</strong> The target is pushed 15 feet straight away from you. You can then move up to half your Speed straight toward the target without provoking Opportunity Attacks. <link:not-tracked>Not Tracked</link>",
      "<strong>Hamstring Blow.</strong> The target's Speed is reduced by 15 feet until the start of your next turn. A target can be affected by only one Hamstring Blow at a time, the most recent one. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.RELENTLESS_RAGE]: {
    description: [
      "Your Rage can keep you fighting despite grievous wounds.",
      "If you drop to 0 Hit Points while your Rage is active and don't die outright, you can make a DC 10 Constitution saving throw. If you succeed, your Hit Points instead change to a number equal to twice your Barbarian level.",
      "Each time you use this feature after the first, the DC increases by 5. When you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>, the DC resets to 10.",
      "(The app tracks the current DC of this feature, but you still need to resolve the saving throw and resulting Hit Points.)"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.IMPROVED_BRUTAL_STRIKE]: {
    description: [
      "You have honed new ways to attack furiously. The following effects are now among your Brutal Strike options. <link:tracked>Tracked</link>",
      "<strong>Staggering Blow.</strong> The target has Disadvantage on the next saving throw it makes, and it can't make Opportunity Attacks until the start of your next turn. <link:not-tracked>Not Tracked</link>",
      "<strong>Sundering Blow.</strong> Before the start of your next turn, the next attack roll made by another creature against the target gains a +5 bonus to the roll. An attack roll can gain only one Sundering Blow bonus. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.PERSISTENT_RAGE]: {
    description: [
      "When you roll Initiative, you can regain all expended uses of Rage. After you regain uses of Rage in this way, you can't do so again until you finish a <link:long-rest>Long Rest</link>.",
      "In addition, your Rage is so fierce that it now lasts for 10 minutes without you needing to do anything to extend it from round to round.",
      "Your Rage ends early if you have the Unconscious condition, not just the Incapacitated condition, or don Heavy armor."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.INDOMITABLE_MIGHT]: {
    description: [
      "If your total for a Strength check or Strength saving throw is less than your Strength score, you can use that score in place of the total."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.PRIMAL_CHAMPION]: {
    description: [
      "You embody primal power. Your Strength and Constitution scores increase by 4, to a maximum of 25."
    ],
    trackingState: TRACKER.TRACKED
  }
};
