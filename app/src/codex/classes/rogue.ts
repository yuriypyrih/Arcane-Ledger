import { CLASS_FEATURE, TRACKER } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";

export type RogueFeatureClassObj = FeatureClassObj & {
  sneakAttack: number;
};

const rogueExpertiseOverride: FeatureMapEntry = {
  description: [
    "You gain <link:Expertise>Expertise</link> in two of your skill proficiencies of your choice. <link:Sleight of Hand>Sleight of Hand</link> and <link:Stealth>Stealth</link> are recommended if you have proficiency in them.",
    "At Rogue level 6, you gain <link:Expertise>Expertise</link> in two more of your skill proficiencies of your choice."
  ],
  trackingState: TRACKER.TRACKED
};

const rogueWeaponMasteryOverride: FeatureMapEntry = {
  description: [
    "Your training with weapons allows you to use the mastery properties of two kinds of weapons of your choice with which you have proficiency, such as Daggers and Shortbows.",
    "Whenever you finish a <link:long-rest>Long Rest</link>, you can change the kinds of weapons you chose. For example, you could switch to using the mastery properties of Scimitars and Shortswords."
  ],
  trackingState: TRACKER.TRACKED
};

const rogueEvasionOverride: FeatureMapEntry = {
  description: [
    "When you're subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw and only half damage if you fail.",
    "You can't use this feature if you have the <link:Incapacitated>Incapacitated</link> condition."
  ],
  trackingState: TRACKER.TRACKED
};

const rogueEpicBoonOverride: FeatureMapEntry = {
  description: [
    "You gain an Epic Boon feat, or another feat of your choice for which you qualify.",
    "<feat:BOON_OF_THE_NIGHT_SPIRIT>Boon of the Night Spirit</feat> is recommended."
  ],
  trackingState: TRACKER.TRACKED
};

export const rogueFeatures: RogueFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [
      CLASS_FEATURE.EXPERTISE,
      CLASS_FEATURE.SNEAK_ATTACK,
      CLASS_FEATURE.THIEVES_CANT,
      CLASS_FEATURE.WEAPON_MASTERY
    ],
    featureOverrides: {
      [CLASS_FEATURE.EXPERTISE]: rogueExpertiseOverride,
      [CLASS_FEATURE.WEAPON_MASTERY]: rogueWeaponMasteryOverride
    },
    sneakAttack: 1
  },
  {
    level: 2,
    classFeatures: [CLASS_FEATURE.CUNNING_ACTION],
    sneakAttack: 1
  },
  {
    level: 3,
    classFeatures: [CLASS_FEATURE.STEADY_AIM],
    sneakAttack: 2
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    sneakAttack: 2
  },
  {
    level: 5,
    classFeatures: [CLASS_FEATURE.CUNNING_STRIKE, CLASS_FEATURE.UNCANNY_DODGE],
    sneakAttack: 3
  },
  {
    level: 6,
    classFeatures: [CLASS_FEATURE.EXPERTISE],
    featureOverrides: {
      [CLASS_FEATURE.EXPERTISE]: rogueExpertiseOverride
    },
    sneakAttack: 3
  },
  {
    level: 7,
    classFeatures: [CLASS_FEATURE.EVASION, CLASS_FEATURE.RELIABLE_TALENT],
    featureOverrides: {
      [CLASS_FEATURE.EVASION]: rogueEvasionOverride
    },
    sneakAttack: 4
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    sneakAttack: 4
  },
  {
    level: 9,
    classFeatures: [],
    sneakAttack: 5
  },
  {
    level: 10,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    sneakAttack: 5
  },
  {
    level: 11,
    classFeatures: [CLASS_FEATURE.IMPROVED_CUNNING_STRIKE],
    sneakAttack: 6
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    sneakAttack: 6
  },
  {
    level: 13,
    classFeatures: [],
    sneakAttack: 7
  },
  {
    level: 14,
    classFeatures: [CLASS_FEATURE.DEVIOUS_STRIKES],
    sneakAttack: 7
  },
  {
    level: 15,
    classFeatures: [CLASS_FEATURE.SLIPPERY_MIND],
    sneakAttack: 8
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    sneakAttack: 8
  },
  {
    level: 17,
    classFeatures: [],
    sneakAttack: 9
  },
  {
    level: 18,
    classFeatures: [CLASS_FEATURE.ELUSIVE],
    sneakAttack: 9
  },
  {
    level: 19,
    classFeatures: [CLASS_FEATURE.EPIC_BOON],
    featureOverrides: {
      [CLASS_FEATURE.EPIC_BOON]: rogueEpicBoonOverride
    },
    sneakAttack: 10
  },
  {
    level: 20,
    classFeatures: [CLASS_FEATURE.STROKE_OF_LUCK],
    sneakAttack: 10
  }
];

export const rogueFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.SNEAK_ATTACK]: {
    description: [
      "You know how to strike subtly and exploit a foe's distraction. Once per turn, you can deal an extra <strong>1d6</strong> damage to one creature you hit with an attack roll if you have <link:Advantage>Advantage</link> on the roll and the attack uses a <link:Finesse>Finesse</link> or a Ranged weapon. The extra damage's type is the same as the weapon's type.",
      "You don't need <link:Advantage>Advantage</link> on the attack roll if at least one of your allies is within 5 feet of the target, the ally doesn't have the <link:Incapacitated>Incapacitated</link> condition, and you don't have <link:Disadvantage>Disadvantage</link> on the attack roll.",
      "The extra damage increases as you gain Rogue levels, as shown in the Sneak Attack column of the Rogue Features table."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.THIEVES_CANT]: {
    description: [
      "You picked up various languages in the communities where you plied your roguish talents.",
      "You know <link:Thieves' Cant>Thieves' Cant</link> and one other language of your choice, which you choose from the language tables in 'Creating a Character'."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.CUNNING_ACTION]: {
    description: [
      "Your quick thinking and agility allow you to move and act quickly.",
      "On your turn, you can take one of the following actions as a Bonus Action: Dash, Disengage, or Hide."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.STEADY_AIM]: {
    description: [
      "As a Bonus Action, you give yourself <link:Advantage>Advantage</link> on your next attack roll on the current turn.",
      "You can use this feature only if you haven't moved during this turn, and after you use it, your Speed is 0 until the end of the current turn."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.CUNNING_STRIKE]: {
    description: [
      "You've developed cunning ways to use your Sneak Attack. When you deal Sneak Attack damage, you can add one of the following Cunning Strike effects. Each effect has a die cost, which is the number of Sneak Attack damage dice you must forgo to add the effect.",
      "You remove the die before rolling, and the effect occurs immediately after the attack's damage is dealt. For example, if you add the Poison effect, remove <strong>1d6</strong> from the Sneak Attack's damage before rolling.",
      "If a Cunning Strike effect requires a saving throw, the DC equals 8 plus your Dexterity modifier and Proficiency Bonus.",
      "<strong>Poison (Cost: 1d6).</strong> You add a toxin to your strike, forcing the target to make a Constitution saving throw. On a failed save, the target has the <link:Poisoned>Poisoned</link> condition for 1 minute. At the end of each of its turns, the Poisoned target repeats the save, ending the effect on itself on a success.",
      "To use this effect, you must have a Poisoner's Kit on your person.",
      "<strong>Trip (Cost: 1d6).</strong> If the target is Large or smaller, it must succeed on a Dexterity saving throw or have the <link:Prone>Prone</link> condition.",
      "<strong>Withdraw (Cost: 1d6).</strong> Immediately after the attack, you move up to half your Speed without provoking Opportunity Attacks."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.UNCANNY_DODGE]: {
    description: [
      "When an attacker that you can see hits you with an attack roll, you can take a Reaction to halve the attack's damage against you, rounded down."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.RELIABLE_TALENT]: {
    description: [
      "Whenever you make an ability check that uses one of your skill or tool proficiencies, you can treat a <strong>d20</strong> roll of 9 or lower as a 10."
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.IMPROVED_CUNNING_STRIKE]: {
    description: [
      "You can use up to two Cunning Strike effects when you deal Sneak Attack damage, paying the die cost for each effect."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.DEVIOUS_STRIKES]: {
    description: [
      "You've practiced new ways to use your Sneak Attack deviously. The following effects are now among your Cunning Strike options.",
      "<strong>Daze (Cost: 2d6).</strong> The target must succeed on a Constitution saving throw, or on its next turn, it can do only one of the following: move, take an action, or take a Bonus Action.",
      "<strong>Knock Out (Cost: 6d6).</strong> The target must succeed on a Constitution saving throw, or it has the <link:Unconscious>Unconscious</link> condition for 1 minute or until it takes any damage. The Unconscious target repeats the save at the end of each of its turns, ending the effect on itself on a success.",
      "<strong>Obscure (Cost: 3d6).</strong> The target must succeed on a Dexterity saving throw, or it has the <link:Blinded>Blinded</link> condition until the end of its next turn."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.SLIPPERY_MIND]: {
    description: [
      "Your cunning mind is exceptionally difficult to control. You gain proficiency in Wisdom and Charisma saving throws."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.ELUSIVE]: {
    description: [
      "You're so evasive that attackers rarely gain the upper hand against you. No attack roll can have <link:Advantage>Advantage</link> against you unless you have the <link:Incapacitated>Incapacitated</link> condition."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.STROKE_OF_LUCK]: {
    description: [
      "You have a marvelous knack for succeeding when you need to. If you fail a <strong>D20</strong> Test, you can turn the roll into a 20.",
      "Once you use this feature, you can't use it again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>."
    ],
    trackingState: TRACKER.TRACKED
  }
};
