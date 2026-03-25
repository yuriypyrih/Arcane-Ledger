import { CLASS_FEATURE, REACTION } from "../entries/enums";
import type { ReactionEntry } from "../entries/types";

export const countercharmReaction: ReactionEntry = {
  id: "reaction-countercharm",
  reaction: REACTION.COUNTERCHARM,
  name: "Countercharm",
  sourceFeature: CLASS_FEATURE.COUNTERCHARM,
  description: [
    "You can use musical notes or words of power to disrupt mind-influencing effects.",
    "If you or a creature within 30 feet of you fails a saving throw against an effect that applies the Charmed or Frightened condition, you can take a Reaction to cause the save to be rerolled, and the new roll has Advantage."
  ]
};

export const reactionEntries: ReactionEntry[] = [countercharmReaction];

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
  return reactionEntries.filter((entry) => entry.sourceFeature === feature);
}
