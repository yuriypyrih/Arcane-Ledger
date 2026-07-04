import { DAMAGE_TYPE, FEATS } from "../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry
} from "../../../types";
import { getAllDamageButStatusValue } from "../damageCoverageStatuses";
import { getFeatDefinition } from "../feats";
import { hasFeatForCharacter } from "../feats/runtime";
import { isCharacterBloodied } from "../bloodied";

const boonOfDesperateResilienceSource = "Boon of Desperate Resilience";
const boonOfDesperateResilienceResistanceStatusSourceId =
  "feat-boon-of-desperate-resilience-defense-of-body-and-mind";

function getBoonOfDesperateResilienceDescription(): string {
  const description = getFeatDefinition(FEATS.BOON_OF_DESPERATE_RESILIENCE)?.description ?? [];

  return description
    .filter(
      (entry): entry is string =>
        typeof entry === "string" &&
        entry.startsWith("<strong>Defense of Body and Mind.</strong>")
    )
    .join("\n");
}

function getBoonOfDesperateResilienceStatusEntry(): CharacterStatusEntry {
  const description = getBoonOfDesperateResilienceDescription();

  return {
    id: boonOfDesperateResilienceResistanceStatusSourceId,
    group: STATUS_ENTRY_GROUP.RESISTANCES,
    value: getAllDamageButStatusValue(DAMAGE_TYPE.FORCE),
    source: boonOfDesperateResilienceSource,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: boonOfDesperateResilienceResistanceStatusSourceId,
    ...(description ? { description } : {})
  };
}

export function getConditionalFeatStatusEntriesForCharacter(
  character: Character
): CharacterStatusEntry[] {
  if (
    !hasFeatForCharacter(character, FEATS.BOON_OF_DESPERATE_RESILIENCE) ||
    !isCharacterBloodied(character)
  ) {
    return [];
  }

  return [getBoonOfDesperateResilienceStatusEntry()];
}
