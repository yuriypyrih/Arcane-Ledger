import { FEATS, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { ItemRecord } from "../../../../types";
import { createSourcedDescriptionEntries } from "../../actionModalDescriptions";
import { getFeatDefinition, getFeatLabel } from "..";
import { healerKitItemKeys, poisonersKitItemKeys } from "./constants";
import { isPoisonerBrewPoisonDescriptionEntry, filterDescriptionEntries } from "./descriptionMatchers";
import type { FeatDerivedState } from "./types";

function normalizeItemRuntimeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\s+/g, "-");
}

function getItemRuntimeKeys(item: Pick<ItemRecord, "id" | "key" | "name">): string[] {
  return [
    item.id,
    typeof item.key === "string" ? item.key : null,
    typeof item.name === "string" ? item.name : null
  ].flatMap((value) => {
    if (!value || value.trim().length === 0) {
      return [];
    }

    const normalized = normalizeItemRuntimeKey(value);
    return [normalized, normalized.replace(/-/g, "_")];
  });
}

function itemMatchesRuntimeKeySet(
  item: Pick<ItemRecord, "id" | "key" | "name">,
  keySet: Set<string>
): boolean {
  return getItemRuntimeKeys(item).some((key) => keySet.has(key));
}

export function getFeatItemAdditionalDescription(
  derivedState: FeatDerivedState,
  item: Pick<ItemRecord, "id" | "key" | "name"> | null | undefined
): SpellDescriptionEntry[] {
  if (!item) {
    return [];
  }

  const additions: SpellDescriptionEntry[] = [];

  if (derivedState.hasHealer && itemMatchesRuntimeKeySet(item, healerKitItemKeys)) {
    const healerDescription = getFeatDefinition(FEATS.HEALER)?.description ?? [];
    additions.push(
      ...createSourcedDescriptionEntries(getFeatLabel(FEATS.HEALER), healerDescription)
    );
  }

  if (
    derivedState.featSet.has(FEATS.POISONER) &&
    itemMatchesRuntimeKeySet(item, poisonersKitItemKeys)
  ) {
    const poisonerDescription = filterDescriptionEntries(
      getFeatDefinition(FEATS.POISONER)?.description ?? [],
      isPoisonerBrewPoisonDescriptionEntry
    );

    additions.push(
      ...createSourcedDescriptionEntries("Poisoner: Brew Poison", poisonerDescription)
    );
  }

  return additions;
}
