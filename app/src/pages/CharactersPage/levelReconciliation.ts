import type { CLASS_FEATURE } from "../../codex/entries";
import { getClassEntryByName } from "../../codex/selectors";
import { STATUS_ENTRY_SOURCE_TYPE, type Character, type CharacterFeatEntry } from "../../types";
import { removeConjuredInventoryItems } from "./inventoryItems";
import { normalizeCharacterStatusEntries, pruneLinkedStatusEntries } from "./statusEntries";
import { getSubclassFeatureRowsForCharacter } from "./subclasses";

function createFeatureSourceKey(level: number, feature: CLASS_FEATURE): string {
  return `${level}:${feature}`;
}

function getAvailableFeatureSourceKeys(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): Set<string> {
  const sourceKeys = new Set<string>();
  const classEntry = getClassEntryByName(character.className);

  classEntry?.features.forEach((featureRow) => {
    if (featureRow.level > character.level) {
      return;
    }

    featureRow.classFeatures.forEach((feature) => {
      sourceKeys.add(createFeatureSourceKey(featureRow.level, feature));
    });
  });

  getSubclassFeatureRowsForCharacter(character).forEach((featureRow) => {
    if (featureRow.level > character.level) {
      return;
    }

    featureRow.classFeatures.forEach((feature) => {
      sourceKeys.add(createFeatureSourceKey(featureRow.level, feature));
    });
  });

  return sourceKeys;
}

function isClassFeatureFeatStillAvailable(
  entry: CharacterFeatEntry,
  availableFeatureSourceKeys: Set<string>
): boolean {
  if (entry.source.type !== "class-feature") {
    return true;
  }

  return availableFeatureSourceKeys.has(
    createFeatureSourceKey(entry.source.level, entry.source.feature)
  );
}

function isFeatureCreatedManualStatus(sourceId: string | undefined): boolean {
  return typeof sourceId === "string" && sourceId.startsWith("feature-");
}

export function reconcileCharacterAfterLevelDecrease(character: Character): Character {
  const availableFeatureSourceKeys = getAvailableFeatureSourceKeys(character);
  const nextFeats = (character.feats ?? []).filter((entry) =>
    isClassFeatureFeatStillAvailable(entry, availableFeatureSourceKeys)
  );
  const nextStatusEntries = pruneLinkedStatusEntries(
    normalizeCharacterStatusEntries(character.statusEntries).filter(
      (entry) =>
        entry.sourceType !== STATUS_ENTRY_SOURCE_TYPE.FEATURE &&
        entry.sourceType !== STATUS_ENTRY_SOURCE_TYPE.FEAT &&
        !(
          entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.MANUAL &&
          isFeatureCreatedManualStatus(entry.sourceId)
        )
    )
  );
  const nextInventoryItems = removeConjuredInventoryItems(character.inventoryItems ?? []);

  return {
    ...character,
    feats: nextFeats,
    statusEntries: nextStatusEntries,
    inventoryItems: nextInventoryItems
  };
}
