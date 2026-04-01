import { CLASS_FEATURE, REACTION } from "../entries/enums";
import type { ReactionEntry } from "../entries/types";
import { rogueFeatureMap } from "../classes/rogue";
import { monkFeatureMap } from "../classes/monk";
import {
  berserkerRetaliationDescription,
  worldTreeBranchesOfTheTreeDescription
} from "../subclasses/barbarian";
import { inspiringMovementDescription } from "../subclasses/bard";

export const countercharmReaction: ReactionEntry = {
  id: "reaction-countercharm",
  reaction: REACTION.COUNTERCHARM,
  name: "Countercharm",
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.COUNTERCHARM,
  sourceLabel: "Bard",
  description: [
    "You can use musical notes or words of power to disrupt mind-influencing effects.",
    "If you or a creature within 30 feet of you fails a saving throw against an effect that applies the Charmed or Frightened condition, you can take a Reaction to cause the save to be rerolled, and the new roll has Advantage."
  ]
};

export const branchesOfTheTreeReaction: ReactionEntry = {
  id: "reaction-world-tree-branches-of-the-tree",
  reaction: REACTION.BRANCHES_OF_THE_TREE,
  name: "Branches of the Tree",
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.BRANCHES_OF_THE_TREE,
  sourceLabel: "Path of the World Tree",
  description: worldTreeBranchesOfTheTreeDescription
};

export const deflectAttacksReaction: ReactionEntry = {
  id: "reaction-deflect-attacks",
  reaction: REACTION.DEFLECT_ATTACKS,
  name: "Deflect Attacks",
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.DEFLECT_ATTACKS,
  sourceLabel: "Monk",
  description: monkFeatureMap[CLASS_FEATURE.DEFLECT_ATTACKS]?.description ?? []
};

export const slowFallReaction: ReactionEntry = {
  id: "reaction-slow-fall",
  reaction: REACTION.SLOW_FALL,
  name: "Slow Fall",
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.SLOW_FALL,
  sourceLabel: "Monk",
  description: monkFeatureMap[CLASS_FEATURE.SLOW_FALL]?.description ?? []
};

export const retaliationReaction: ReactionEntry = {
  id: "reaction-berserker-retaliation",
  reaction: REACTION.RETALIATION,
  name: "Retaliation",
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.RETALIATION,
  sourceLabel: "Path of the Berserker",
  description: berserkerRetaliationDescription
};

export const inspiringMovementReaction: ReactionEntry = {
  id: "reaction-inspiring-movement",
  reaction: REACTION.INSPIRING_MOVEMENT,
  name: "Inspiring Movement",
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.INSPIRING_MOVEMENT,
  sourceLabel: "College of Dance",
  description: [...inspiringMovementDescription]
};

export const uncannyDodgeReaction: ReactionEntry = {
  id: "reaction-uncanny-dodge",
  reaction: REACTION.UNCANNY_DODGE,
  name: "Uncanny Dodge",
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.UNCANNY_DODGE,
  sourceLabel: "Rogue",
  description: rogueFeatureMap[CLASS_FEATURE.UNCANNY_DODGE]?.description ?? []
};

export const reactionEntries: ReactionEntry[] = [
  branchesOfTheTreeReaction,
  countercharmReaction,
  deflectAttacksReaction,
  inspiringMovementReaction,
  retaliationReaction,
  slowFallReaction,
  uncannyDodgeReaction
];

const reactionEntriesById = new Map(reactionEntries.map((entry) => [entry.id, entry]));
const reactionEntriesByName = new Map(
  reactionEntries.map((entry) => [entry.name.trim().toLowerCase(), entry])
);

export function getReactionEntryById(id: string): ReactionEntry | null {
  return reactionEntriesById.get(id) ?? null;
}

export function getReactionEntryByName(name: string): ReactionEntry | null {
  return reactionEntriesByName.get(name.trim().toLowerCase()) ?? null;
}

export function getReactionEntriesForSourceFeature(feature: CLASS_FEATURE): ReactionEntry[] {
  return reactionEntries.filter(
    (entry) => entry.sourceType === "feature" && entry.sourceFeature === feature
  );
}
