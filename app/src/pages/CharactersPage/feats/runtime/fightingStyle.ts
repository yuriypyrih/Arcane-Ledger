import {
  FEATS,
  REACTION,
  type ReactionEntry,
  type SpellDescriptionEntry
} from "../../../../codex/entries";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type CharacterStatusEntry
} from "../../../../types";
import type { CharacterFeatEntry } from "../../../../types";
import {
  blindFightingBlindsightStatusSourceId,
  interceptionReactionEntryId,
  protectionReactionEntryId
} from "./constants";

type FeatDescriptionGetter = (feat: FEATS) => SpellDescriptionEntry[];

export function getFightingStyleDerivedStatusEntries(
  normalizedFeats: CharacterFeatEntry[]
): CharacterStatusEntry[] {
  return normalizedFeats.flatMap((entry) => {
    if (entry.feat !== FEATS.BLIND_FIGHTING) {
      return [];
    }

    return [
      {
        id: `${blindFightingBlindsightStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.SENSES,
        value: SENSE.BLINDSIGHT,
        source: "Blind Fighting",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: blindFightingBlindsightStatusSourceId,
        rangeFeet: 10
      } satisfies CharacterStatusEntry
    ];
  });
}

export function getFightingStyleReactionEntries(
  featSet: ReadonlySet<FEATS>,
  getFeatDescription: FeatDescriptionGetter
): ReactionEntry[] {
  const reactionEntries: ReactionEntry[] = [];

  if (featSet.has(FEATS.INTERCEPTION)) {
    reactionEntries.push({
      id: interceptionReactionEntryId,
      reaction: REACTION.INTERCEPTION,
      name: "Interception",
      sourceType: "feat",
      sourceLabel: "Interception",
      description: getFeatDescription(FEATS.INTERCEPTION)
    });
  }

  if (featSet.has(FEATS.PROTECTION)) {
    reactionEntries.push({
      id: protectionReactionEntryId,
      reaction: REACTION.PROTECTION,
      name: "Interception",
      sourceType: "feat",
      sourceLabel: "Protection",
      description: getFeatDescription(FEATS.PROTECTION)
    });
  }

  return reactionEntries;
}

export function hasDefenseFightingStyle(featSet: ReadonlySet<FEATS>): boolean {
  return featSet.has(FEATS.DEFENSE);
}
