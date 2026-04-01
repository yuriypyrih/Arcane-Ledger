import { CLASS_FEATURE, TRACKER } from "../entries/enums";
import type { FeatureClassObj, FeatureMapEntry } from "../entries/types";

export type FighterFeatureClassObj = FeatureClassObj & {
  secondWind: number;
  weaponMastery: number;
};

export const fighterFeatures: FighterFeatureClassObj[] = [
  {
    level: 1,
    classFeatures: [
      CLASS_FEATURE.FIGHTING_STYLE,
      CLASS_FEATURE.SECOND_WIND,
      CLASS_FEATURE.WEAPON_MASTERY
    ],
    featureOverrides: {
      [CLASS_FEATURE.WEAPON_MASTERY]: {
        description: [
          "Your training with weapons allows you to use the mastery properties of three kinds of Simple or Martial weapons of your choice. Whenever you finish a <link:long-rest>Long Rest</link>, you can practice weapon drills and change one of those weapon choices.",
          "When you reach certain Fighter levels, you gain the ability to use the mastery properties of more kinds of weapons, as shown in the Weapon Mastery column of the Fighter Features table."
        ],
        trackingState: TRACKER.TRACKED
      }
    },
    secondWind: 2,
    weaponMastery: 3
  },
  {
    level: 2,
    classFeatures: [CLASS_FEATURE.ACTION_SURGE, CLASS_FEATURE.TACTICAL_MIND],
    secondWind: 2,
    weaponMastery: 3
  },
  {
    level: 3,
    classFeatures: [],
    secondWind: 2,
    weaponMastery: 3
  },
  {
    level: 4,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    secondWind: 3,
    weaponMastery: 4
  },
  {
    level: 5,
    classFeatures: [CLASS_FEATURE.EXTRA_ATTACK, CLASS_FEATURE.TACTICAL_SHIFT],
    featureOverrides: {
      [CLASS_FEATURE.EXTRA_ATTACK]: {
        description: [
          "You can attack twice instead of once whenever you take the Attack action on your turn."
        ],
        trackingState: TRACKER.TRACKED
      }
    },
    secondWind: 3,
    weaponMastery: 4
  },
  {
    level: 6,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    secondWind: 3,
    weaponMastery: 4
  },
  {
    level: 7,
    classFeatures: [],
    secondWind: 3,
    weaponMastery: 4
  },
  {
    level: 8,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    secondWind: 3,
    weaponMastery: 4
  },
  {
    level: 9,
    classFeatures: [CLASS_FEATURE.INDOMITABLE, CLASS_FEATURE.TACTICAL_MASTER],
    secondWind: 3,
    weaponMastery: 4
  },
  {
    level: 10,
    classFeatures: [],
    secondWind: 4,
    weaponMastery: 5
  },
  {
    level: 11,
    classFeatures: [CLASS_FEATURE.TWO_EXTRA_ATTACKS],
    secondWind: 4,
    weaponMastery: 5
  },
  {
    level: 12,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    secondWind: 4,
    weaponMastery: 5
  },
  {
    level: 13,
    classFeatures: [CLASS_FEATURE.INDOMITABLE, CLASS_FEATURE.STUDIED_ATTACKS],
    secondWind: 4,
    weaponMastery: 5
  },
  {
    level: 14,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    secondWind: 4,
    weaponMastery: 5
  },
  {
    level: 15,
    classFeatures: [],
    secondWind: 4,
    weaponMastery: 5
  },
  {
    level: 16,
    classFeatures: [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT],
    secondWind: 4,
    weaponMastery: 6
  },
  {
    level: 17,
    classFeatures: [CLASS_FEATURE.ACTION_SURGE, CLASS_FEATURE.INDOMITABLE],
    secondWind: 4,
    weaponMastery: 6
  },
  {
    level: 18,
    classFeatures: [],
    secondWind: 4,
    weaponMastery: 6
  },
  {
    level: 19,
    classFeatures: [CLASS_FEATURE.EPIC_BOON],
    featureOverrides: {
      [CLASS_FEATURE.EPIC_BOON]: {
        description: [
          "You gain an Epic Boon feat, or another feat of your choice for which you qualify.",
          "Boon of Combat Prowess is recommended."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }
    },
    secondWind: 4,
    weaponMastery: 6
  },
  {
    level: 20,
    classFeatures: [CLASS_FEATURE.THREE_EXTRA_ATTACKS],
    secondWind: 4,
    weaponMastery: 6
  }
];

export const fighterFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.FIGHTING_STYLE]: {
    description: [
      "You have honed your martial prowess and gain a Fighting Style feat of your choice. Defense is recommended.",
      "Whenever you gain a Fighter level, you can replace the feat you chose with a different Fighting Style feat."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.SECOND_WIND]: {
    description: [
      "You have a limited well of physical and mental stamina that you can draw on. As a Bonus Action, you can use it to regain Hit Points equal to 1d10 plus your Fighter level.",
      "You can use this feature twice. You regain one expended use when you finish a <link:short-rest>Short Rest</link>, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
      "When you reach certain Fighter levels, you gain more uses of this feature, as shown in the Second Wind column of the Fighter Features table."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.ACTION_SURGE]: {
    description: [
      "You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action, except the Magic action.",
      "Once you use this feature, you can't do so again until you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
      "Starting at level 17, you can use it twice before a rest but only once on a turn."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.TACTICAL_MIND]: {
    description: [
      "You have a mind for tactics on and off the battlefield.",
      "When you fail an ability check, you can expend a use of your Second Wind to push yourself toward success. Rather than regaining Hit Points, you roll 1d10 and add the number rolled to the ability check, potentially turning it into a success.",
      "If the check still fails, this use of Second Wind isn't expended."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.TACTICAL_SHIFT]: {
    description: [
      "Whenever you activate your Second Wind with a Bonus Action, you can move up to half your Speed without provoking Opportunity Attacks."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.INDOMITABLE]: {
    description: [
      "If you fail a saving throw, you can reroll it with a bonus equal to your Fighter level.",
      "You must use the new roll, and you can't use this feature again until you finish a <link:long-rest>Long Rest</link>.",
      "You can use this feature twice before a Long Rest starting at level 13 and three times before a Long Rest starting at level 17."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.TACTICAL_MASTER]: {
    description: [
      "When you attack with a weapon whose mastery property you can use, you can replace that property with the Push, Sap, or Slow property for that attack."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.TWO_EXTRA_ATTACKS]: {
    description: [
      "You can attack three times instead of once whenever you take the Attack action on your turn."
    ],
    trackingState: TRACKER.TRACKED
  },
  [CLASS_FEATURE.STUDIED_ATTACKS]: {
    description: [
      "You study your opponents and learn from each attack you make.",
      "If you make an attack roll against a creature and miss, you have Advantage on your next attack roll against that creature before the end of your next turn."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  [CLASS_FEATURE.THREE_EXTRA_ATTACKS]: {
    description: [
      "You can attack four times instead of once whenever you take the Attack action on your turn."
    ],
    trackingState: TRACKER.TRACKED
  }
};
