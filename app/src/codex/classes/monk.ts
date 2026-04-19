import { CLASS_FEATURE, DICE, TRACKER } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";

export type MonkFeatureClassObj = FeatureClassObj & {
  martialArts: DICE;
  focusPoints: number;
  unarmoredMovement: number;
};

export const monkFeatures: MonkFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [CLASS_FEATURE.MARTIAL_ARTS, CLASS_FEATURE.UNARMORED_DEFENSE],
    featureOverrides: {
      [CLASS_FEATURE.UNARMORED_DEFENSE]: {
        description: [
          "While you aren't wearing armor or wielding a Shield, your base Armor Class equals 10 plus your Dexterity and Wisdom modifiers."
        ],
        trackingState: TRACKER.TRACKED
      }
    },
    martialArts: DICE.D6,
    focusPoints: 0,
    unarmoredMovement: 0
  },
  {
    level: 2,
    classFeatures: [
      CLASS_FEATURE.MONKS_FOCUS,
      CLASS_FEATURE.UNARMORED_MOVEMENT,
      CLASS_FEATURE.UNCANNY_METABOLISM
    ],
    martialArts: DICE.D6,
    focusPoints: 2,
    unarmoredMovement: 10
  },
  {
    level: 3,
    classFeatures: [CLASS_FEATURE.DEFLECT_ATTACKS],
    martialArts: DICE.D6,
    focusPoints: 3,
    unarmoredMovement: 10
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT, CLASS_FEATURE.SLOW_FALL],
    martialArts: DICE.D6,
    focusPoints: 4,
    unarmoredMovement: 10
  },
  {
    level: 5,
    classFeatures: [CLASS_FEATURE.EXTRA_ATTACK, CLASS_FEATURE.STUNNING_STRIKE],
    martialArts: DICE.D8,
    focusPoints: 5,
    unarmoredMovement: 10
  },
  {
    level: 6,
    classFeatures: [CLASS_FEATURE.EMPOWERED_STRIKES],
    martialArts: DICE.D8,
    focusPoints: 6,
    unarmoredMovement: 15
  },
  {
    level: 7,
    classFeatures: [CLASS_FEATURE.EVASION],
    martialArts: DICE.D8,
    focusPoints: 7,
    unarmoredMovement: 15
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    martialArts: DICE.D8,
    focusPoints: 8,
    unarmoredMovement: 15
  },
  {
    level: 9,
    classFeatures: [CLASS_FEATURE.ACROBATIC_MOVEMENT],
    martialArts: DICE.D8,
    focusPoints: 9,
    unarmoredMovement: 15
  },
  {
    level: 10,
    classFeatures: [CLASS_FEATURE.HEIGHTENED_FOCUS, CLASS_FEATURE.SELF_RESTORATION],
    martialArts: DICE.D8,
    focusPoints: 10,
    unarmoredMovement: 20
  },
  {
    level: 11,
    classFeatures: [],
    martialArts: DICE.D10,
    focusPoints: 11,
    unarmoredMovement: 20
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    martialArts: DICE.D10,
    focusPoints: 12,
    unarmoredMovement: 20
  },
  {
    level: 13,
    classFeatures: [CLASS_FEATURE.DEFLECT_ENERGY],
    martialArts: DICE.D10,
    focusPoints: 13,
    unarmoredMovement: 20
  },
  {
    level: 14,
    classFeatures: [CLASS_FEATURE.DISCIPLINED_SURVIVOR],
    martialArts: DICE.D10,
    focusPoints: 14,
    unarmoredMovement: 25
  },
  {
    level: 15,
    classFeatures: [CLASS_FEATURE.PERFECT_FOCUS],
    martialArts: DICE.D10,
    focusPoints: 15,
    unarmoredMovement: 25
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    martialArts: DICE.D10,
    focusPoints: 16,
    unarmoredMovement: 25
  },
  {
    level: 17,
    classFeatures: [],
    martialArts: DICE.D12,
    focusPoints: 17,
    unarmoredMovement: 25
  },
  {
    level: 18,
    classFeatures: [CLASS_FEATURE.SUPERIOR_DEFENSE],
    martialArts: DICE.D12,
    focusPoints: 18,
    unarmoredMovement: 30
  },
  {
    level: 19,
    classFeatures: [CLASS_FEATURE.EPIC_BOON],
    featureOverrides: {
      [CLASS_FEATURE.EPIC_BOON]: {
        description: [
          "You gain an Epic Boon feat, or another feat of your choice for which you qualify.",
          "<feat:BOON_OF_IRRESISTIBLE_OFFENSE>Boon of Irresistible Offense</feat> is recommended."
        ],
        trackingState: TRACKER.TRACKED
      }
    },
    martialArts: DICE.D12,
    focusPoints: 19,
    unarmoredMovement: 30
  },
  {
    level: 20,
    classFeatures: [CLASS_FEATURE.BODY_AND_MIND],
    martialArts: DICE.D12,
    focusPoints: 20,
    unarmoredMovement: 30
  }
];

const monkDeflectAttacksSharedDescription = [
  "If you reduce the damage to 0, you can expend 1 Focus Point to redirect some of the attack's force.",
  "If you do so, choose a creature you can see within 5 feet of yourself if the attack was a melee attack or a creature you can see within 60 feet of yourself that isn't behind Total Cover if the attack was a ranged attack.",
  "That creature must succeed on a Dexterity saving throw or take damage equal to two rolls of your Martial Arts die plus your Dexterity modifier. The damage is the same type dealt by the attack.",
  "This feature is <link:semi-tracked>Semi Tracked</link>. You can find it in the Reactions list, but you have to do the math yourself."
];

export function getMonkDeflectAttacksDescription(hasDeflectEnergy: boolean): string[] {
  return [
    hasDeflectEnergy
      ? "When an attack roll hits you and its damage includes <strong>ANY DAMAGE TYPE</strong>, you can take a Reaction to reduce the attack's total damage against you. The reduction equals <strong>1d10</strong> plus your Dexterity modifier and Monk level."
      : "When an attack roll hits you and its damage includes Bludgeoning, Piercing, or Slashing damage, you can take a Reaction to reduce the attack's total damage against you. The reduction equals <strong>1d10</strong> plus your Dexterity modifier and Monk level.",
    ...monkDeflectAttacksSharedDescription
  ];
}

export const monkFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.MARTIAL_ARTS]: {
    description: [
      "Your practice of martial arts gives you mastery of combat styles that use your Unarmed Strike and Monk weapons, which are the following:",
      "Simple Melee weapons.",
      "Martial Melee weapons that have the Light property.",
      "You gain the following benefits while you are unarmed or wielding only Monk weapons and you aren't wearing armor or wielding a Shield.",
      "<strong>Bonus Unarmed Strike.</strong> You can make an Unarmed Strike as a Bonus Action.",
      "<strong>Martial Arts Die.</strong> You can roll <strong>1d6</strong> in place of the normal damage of your Unarmed Strike or Monk weapons. This die changes as you gain Monk levels, as shown in the Martial Arts column of the Monk Features table.",
      "<strong>Dexterous Attacks.</strong> You can use your Dexterity modifier instead of your Strength modifier for the attack and damage rolls of your Unarmed Strikes and Monk weapons. In addition, when you use the Grapple or Shove option of your Unarmed Strike, you can use your Dexterity modifier instead of your Strength modifier to determine the save DC."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.MONKS_FOCUS]: {
    description: [
      "Your focus and martial training allow you to harness a well of extraordinary energy within yourself. This energy is represented by Focus Points. Your Monk level determines the number of points you have, as shown in the Focus Points column of the Monk Features table.",
      "You can expend these points to enhance or fuel certain Monk features. You start knowing three such features: Flurry of Blows, Patient Defense, and Step of the Wind, each of which is detailed below.",
      "When you expend a Focus Point, it is unavailable until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>, at the end of which you regain all your expended points.",
      "Some features that use Focus Points require your target to make a saving throw. The save DC equals 8 plus your Wisdom modifier and Proficiency Bonus.",
      "<strong>Flurry of Blows.</strong> You can expend 1 Focus Point to make two Unarmed Strikes as a Bonus Action. <link:tracked>Tracked</link>",
      "<strong>Patient Defense.</strong> You can take the Disengage action as a Bonus Action. Alternatively, you can expend 1 Focus Point to take both the Disengage and the Dodge actions as a Bonus Action. <link:not-tracked>Not Tracked</link>",
      "<strong>Step of the Wind.</strong> You can take the Dash action as a Bonus Action. Alternatively, you can expend 1 Focus Point to take both the Disengage and Dash actions as a Bonus Action, and your jump distance is doubled for the turn. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.UNARMORED_MOVEMENT]: {
    description: [
      "Your speed increases by 10 feet while you aren't wearing armor or wielding a Shield.",
      "This bonus increases when you reach certain Monk levels, as shown on the Monk Features table."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.UNCANNY_METABOLISM]: {
    description: [
      "When you roll Initiative, you can regain all expended Focus Points. <link:not-tracked>Not Tracked</link>",
      "When you do so, roll your Martial Arts die, and regain a number of Hit Points equal to your Monk level plus the number rolled. <link:not-tracked>Not Tracked</link>",
      "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link>. <link:tracked>Tracked</link>"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.DEFLECT_ATTACKS]: {
    description: getMonkDeflectAttacksDescription(false),
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.SLOW_FALL]: {
    description: [
      "You can take a Reaction when you fall to reduce any damage you take from the fall by an amount equal to five times your Monk level.",
      "This feature is <link:semi-tracked>Semi Tracked</link>. You can find it in the Reactions list, but you have to do the math yourself."
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.EXTRA_ATTACK]: {
    description: [
      "You can attack twice instead of once whenever you take the Attack action on your turn."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.STUNNING_STRIKE]: {
    description: [
      "Once per turn when you hit a creature with a Monk weapon or an Unarmed Strike, you can expend 1 Focus Point to attempt a stunning strike.",
      "The target must make a Constitution saving throw.",
      "On a failed save, the target has the Stunned condition until the start of your next turn.",
      "On a successful save, the target's Speed is halved until the start of your next turn, and the next attack roll made against the target before then has Advantage.",
      "The usage is being tracked but not the mechanic itself."
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.EMPOWERED_STRIKES]: {
    description: [
      "Whenever you deal damage with your Unarmed Strike, it can deal your choice of Force damage or its normal damage type."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.EVASION]: {
    description: [
      "When you're subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw and only half damage if you fail.",
      "You don't benefit from this feature if you have the Incapacitated condition."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.ACROBATIC_MOVEMENT]: {
    description: [
      "While you aren't wearing armor or wielding a Shield, you gain the ability to move along vertical surfaces and across liquids on your turn without falling during the movement."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.HEIGHTENED_FOCUS]: {
    description: [
      "Your Flurry of Blows, Patient Defense, and Step of the Wind gain the following benefits.",
      "<strong>Flurry of Blows.</strong> You can expend 1 Focus Point to use Flurry of Blows and make three Unarmed Strikes with it instead of two. <link:tracked>Tracked</link>",
      "<strong>Patient Defense.</strong> When you expend a Focus Point to use Patient Defense, you gain a number of Temporary Hit Points equal to two rolls of your Martial Arts die. <link:not-tracked>Not Tracked</link>",
      "<strong>Step of the Wind.</strong> When you expend a Focus Point to use Step of the Wind, you can choose a willing creature within 5 feet of yourself that is Large or smaller. You move the creature with you until the end of your turn. The creature's movement doesn't provoke Opportunity Attacks. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.SELF_RESTORATION]: {
    description: [
      "Through sheer force of will, you can remove one of the following conditions from yourself at the end of each of your turns: Charmed, Frightened, or Poisoned.",
      "In addition, forgoing food and drink doesn't give you levels of Exhaustion."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.DEFLECT_ENERGY]: {
    description: [
      "Your Deflect Attacks feature now works when an attack's damage includes <strong>ANY DAMAGE TYPE</strong>."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.DISCIPLINED_SURVIVOR]: {
    description: [
      "Your physical and mental discipline grant you proficiency in all saving throws. <link:tracked>Tracked</link>",
      "Additionally, whenever you make a saving throw and fail, you can expend 1 Focus Point to reroll it, and you must use the new roll. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  [CLASS_FEATURE.PERFECT_FOCUS]: {
    description: [
      "When you roll Initiative and don't use Uncanny Metabolism, you regain expended Focus Points until you have 4 if you have 3 or fewer."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.SUPERIOR_DEFENSE]: {
    description: [
      "At the start of your turn, you can expend 3 Focus Points to bolster yourself against harm for 1 minute or until you have the Incapacitated condition.",
      "During that time, you have <link:resistance>Resistance</link> to all damage except Force damage."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.BODY_AND_MIND]: {
    description: [
      "You have developed your body and mind to new heights.",
      "Your Dexterity and Wisdom scores increase by 4, to a maximum of 25."
    ],
    trackingState: TRACKER.TRACKED
  }
};
