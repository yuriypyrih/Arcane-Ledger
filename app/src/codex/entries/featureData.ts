import {
  bardFeatureMap,
  barbarianFeatureMap,
  clericFeatureMap,
  druidFeatureMap,
  fighterFeatureMap,
  monkFeatureMap,
  paladinFeatureMap,
  rangerFeatureMap,
  rogueFeatureMap,
  sorcererFeatureMap,
  warlockFeatureMap,
  wizardFeatureMap
} from "../classes";
import { CLASS_FEATURE } from "./enums";
import type { FeatureMapEntry, FeatureTrackingState, KeywordTooltipEntry } from "./types";

export const KeywordTooltip: Record<string, KeywordTooltipEntry> = {
  "short-rest": {
    title: "Short Rest",
    description: [
      "A <strong>Short Rest</strong> is a period of downtime, usually about 1 hour long.",
      "Some class resources recharge when you finish one."
    ]
  },
  "long-rest": {
    title: "Long Rest",
    description: [
      "A <strong>Long Rest</strong> is an extended period of downtime, usually around 8 hours.",
      "It commonly restores expended features, Hit Points, and other daily resources."
    ]
  },
  resistance: {
    title: "Resistance",
    description: [
      "<strong>Resistance</strong> halves damage of the listed type after all other modifiers are applied.",
      "If a rule says otherwise, follow that more specific rule."
    ]
  },
  components: {
    title: "Components",
    description: [
      "<strong>V (Verbal)</strong>: The caster must be able to speak, as spells require specific incantations.",
      "<strong>S (Somatic)</strong>: The caster must have at least one hand free to make gestures.",
      "<strong>M (Material)</strong>: Specific, often magical, items must be produced or used, often held in a component pouch or spellcasting focus."
    ]
  },
  v: {
    title: "Verbal (V)",
    description: [
      "<strong>V (Verbal)</strong>: The caster must be able to speak, as spells require specific incantations."
    ]
  },
  s: {
    title: "Somatic (S)",
    description: [
      "<strong>S (Somatic)</strong>: The caster must have at least one hand free to make gestures."
    ]
  },
  m: {
    title: "Material (M)",
    description: [
      "<strong>M (Material)</strong>: Specific, often magical, items must be produced or used, often held in a component pouch or spellcasting focus."
    ]
  },
  tracked: {
    title: "Tracked",
    description: [
      "<strong>Tracked</strong> means the app is keeping track of this feature or rule interaction for you."
    ]
  },
  "not-tracked": {
    title: "Not Tracked",
    description: [
      "<strong>Not Tracked</strong> means the app is not currently tracking this feature for you, so you need to remember it during play."
    ]
  },
  "semi-tracked": {
    title: "Semi Tracked",
    description: [
      "<strong>Semi Tracked</strong> means the app may handle parts of this feature but not all of them, so read the feature for more details."
    ]
  }
};

export function getFeatureTrackingState(feature: FeatureMapEntry): FeatureTrackingState {
  if (feature.trackingState) {
    return feature.trackingState;
  }

  return feature.isTracked ? "tracked" : "not-tracked";
}

const commonFeatureMap: Partial<Record<CLASS_FEATURE, FeatureMapEntry>> = {
  [CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT]: {
    description: ["You gain the Ability Score Improvement feat, or another feat of your choice for which you qualify."],
    isTracked: false
  },
  [CLASS_FEATURE.SUBCLASS_FEATURE]: {
    description: ["You gain a feature from your chosen subclass."],
    isTracked: false
  },
  [CLASS_FEATURE.EPIC_BOON]: {
    description: [
      "You gain an Epic Boon feat, or another feat of your choice for which you qualify."
    ],
    isTracked: false
  }
};

export const FeatureMap = {
  ...commonFeatureMap,
  ...barbarianFeatureMap,
  ...bardFeatureMap,
  ...clericFeatureMap,
  ...druidFeatureMap,
  ...fighterFeatureMap,
  ...monkFeatureMap,
  ...paladinFeatureMap,
  ...rangerFeatureMap,
  ...rogueFeatureMap,
  ...sorcererFeatureMap,
  ...warlockFeatureMap,
  ...wizardFeatureMap
} as Record<CLASS_FEATURE, FeatureMapEntry>;
