import type { Character, CharacterFeatEntry, CharacterMulticlass } from "../../types";
import { normalizeCharacterFeats } from "./feats/normalization";

/** Keep unavailable choices on their owner, outside the active feat/runtime list. */
export function reconcileClassFeatChoices(
  character: Pick<Character, "feats" | "level">,
  state: CharacterMulticlass
): { classes: CharacterMulticlass["classes"]; feats: CharacterFeatEntry[] } {
  const classes = state.classes.map((entry) => ({
    ...entry,
    inactiveFeats: undefined as CharacterFeatEntry[] | undefined
  }));
  const owners = new Map(classes.map((entry) => [entry.id, entry]));
  const choices = new Map(
    normalizeCharacterFeats(
      [...state.classes.flatMap((entry) => entry.inactiveFeats ?? []), ...(character.feats ?? [])],
      character.level
    ).map((feat) => [feat.id, feat])
  );
  const feats: CharacterFeatEntry[] = [];
  for (const choice of choices.values()) {
    if (choice.source.type !== "class-feature" && choice.source.type !== "eldritch-invocation") {
      feats.push(choice);
      continue;
    }
    const ownerId = choice.source.classEntryId ?? state.startingClassId;
    const owner = owners.get(ownerId);
    if (!owner) continue;
    const feat = { ...choice, source: { ...choice.source, classEntryId: ownerId } };
    const requiredLevel = choice.source.type === "class-feature" ? choice.source.level : 1;
    if (owner.level < requiredLevel) {
      (owner.inactiveFeats ??= []).push(feat);
    } else {
      feats.push(feat);
    }
  }
  return { classes, feats };
}
