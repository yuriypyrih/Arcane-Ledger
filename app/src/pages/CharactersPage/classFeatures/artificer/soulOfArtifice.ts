import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { Character, CharacterInventoryItem, ItemRecord } from "../../../../types";
import { createFeatureSourcedDescriptionEntries } from "../../actionModalDescriptions";
import {
  getInventoryContainerContents,
  getInventoryItemQuantity,
  getItemRecordKey,
  getItemRecordName,
  isReplicateMagicItemInventoryItem,
  removeOneContainerContentItemByIndex,
  removeOneInventoryItemCopyById
} from "../../inventoryItems";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";

export type SoulOfArtificeCheatDeathItemOption =
  | {
      id: string;
      itemName: string;
      kind: "inventory";
      label: string;
      rarityKey: string;
      rarityLabel: string;
      stackId: string;
      copyIndex: number;
    }
  | {
      id: string;
      itemName: string;
      kind: "container";
      label: string;
      rarityKey: string;
      rarityLabel: string;
      containerStackId: string;
      containerName: string;
      contentIndex: number;
      copyIndex: number;
    };

type SoulOfArtificeCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "currentHitPoints" | "deathSaves" | "inventoryItems" | "level">>;

const cheatDeathDescriptionMarker = "<strong>Cheat Death.</strong>";
const cheatDeathEligibleRarityKeys = new Set(["uncommon", "rare"]);

function isUnconsciousAtZeroHitPoints(character: SoulOfArtificeCharacter): boolean {
  const deathSaves = character.deathSaves ?? { successes: 0, failures: 0 };

  return (
    (character.currentHitPoints ?? 1) <= 0 &&
    deathSaves.resolution !== "instant-death" &&
    (deathSaves.successes ?? 0) < 3 &&
    (deathSaves.failures ?? 0) < 3
  );
}

function getNormalizedRarityKey(item: ItemRecord | null | undefined): string | null {
  const rawKey = item?.rarity?.key ?? item?.rarity?.name ?? "";
  const normalizedKey = rawKey.trim().toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");

  return normalizedKey || null;
}

function formatRarityLabel(rarityKey: string): string {
  return rarityKey
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function createOptionId(parts: Array<string | number>): string {
  return parts.map((part) => encodeURIComponent(String(part))).join("|");
}

function isEligibleCheatDeathItem(
  entry: Pick<CharacterInventoryItem, "conjuredSource" | "featureTags" | "item">
): entry is Pick<CharacterInventoryItem, "conjuredSource" | "featureTags" | "item"> & {
  item: ItemRecord;
} {
  const rarityKey = getNormalizedRarityKey(entry.item);

  return (
    isReplicateMagicItemInventoryItem(entry) &&
    rarityKey !== null &&
    cheatDeathEligibleRarityKeys.has(rarityKey)
  );
}

export function hasArtificerSoulOfArtificeFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): boolean {
  return character.className === "Artificer" && (character.level ?? 0) >= 20;
}

export function isArtificerSoulOfArtificeCheatDeathAvailable(
  character: SoulOfArtificeCharacter
): boolean {
  return (
    hasArtificerSoulOfArtificeFeature(character) &&
    isUnconsciousAtZeroHitPoints(character) &&
    getSoulOfArtificeCheatDeathItemOptions(character).length > 0
  );
}

export function getSoulOfArtificeCheatDeathDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  if (!hasArtificerSoulOfArtificeFeature(character)) {
    return [];
  }

  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.SOUL_OF_ARTIFICE).filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.startsWith(cheatDeathDescriptionMarker)
  );
}

export function getSoulOfArtificeLifeAndDeathDescriptionAdditions(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "inventoryItems" | "level" | "subclassId">>
): SpellDescriptionEntry[][] {
  if (getSoulOfArtificeCheatDeathItemOptions(character).length <= 0) {
    return [];
  }

  const cheatDeathDescription = getSoulOfArtificeCheatDeathDescription(character);

  return cheatDeathDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.SOUL_OF_ARTIFICE,
          cheatDeathDescription
        )
      ]
    : [];
}

export function getSoulOfArtificeCheatDeathItemOptions(
  character: Partial<Pick<Character, "inventoryItems">>
): SoulOfArtificeCheatDeathItemOption[] {
  return (character.inventoryItems ?? []).flatMap((entry) => {
    const options: SoulOfArtificeCheatDeathItemOption[] = [];

    if (isEligibleCheatDeathItem(entry)) {
      const rarityKey = getNormalizedRarityKey(entry.item)!;
      const itemKey = getItemRecordKey(entry.item);
      const quantity = getInventoryItemQuantity(entry);

      for (let copyIndex = 0; copyIndex < quantity; copyIndex += 1) {
        const itemName = getItemRecordName(entry.item);
        options.push({
          id: createOptionId(["inventory", entry.id, itemKey, copyIndex]),
          kind: "inventory",
          stackId: entry.id,
          copyIndex,
          itemName,
          label: quantity > 1 ? `${itemName} #${copyIndex + 1}` : itemName,
          rarityKey,
          rarityLabel: formatRarityLabel(rarityKey)
        });
      }
    }

    getInventoryContainerContents(entry).forEach((content, contentIndex) => {
      if (!isEligibleCheatDeathItem(content)) {
        return;
      }

      const rarityKey = getNormalizedRarityKey(content.item)!;
      const itemKey = getItemRecordKey(content.item);
      const quantity = Math.max(1, Math.floor(Number(content.quantity) || 1));
      const itemName = getItemRecordName(content.item);
      const containerName = getItemRecordName(entry.item);

      for (let copyIndex = 0; copyIndex < quantity; copyIndex += 1) {
        options.push({
          id: createOptionId(["container", entry.id, contentIndex, itemKey, copyIndex]),
          kind: "container",
          containerStackId: entry.id,
          containerName,
          contentIndex,
          copyIndex,
          itemName,
          label: quantity > 1 ? `${itemName} #${copyIndex + 1}` : itemName,
          rarityKey,
          rarityLabel: formatRarityLabel(rarityKey)
        });
      }
    });

    return options;
  });
}

export function applySoulOfArtificeCheatDeathForCharacter(
  character: Character,
  selectedOptionIds: readonly string[]
): Character {
  if (!isArtificerSoulOfArtificeCheatDeathAvailable(character)) {
    return character;
  }

  const selectedOptionIdSet = new Set(selectedOptionIds);
  const selectedOptions = getSoulOfArtificeCheatDeathItemOptions(character).filter((option) =>
    selectedOptionIdSet.has(option.id)
  );

  if (selectedOptions.length <= 0) {
    return character;
  }

  const containerOptions = selectedOptions
    .filter((option): option is Extract<SoulOfArtificeCheatDeathItemOption, { kind: "container" }> =>
      option.kind === "container"
    )
    .sort((left, right) => {
      const containerSort = right.containerStackId.localeCompare(left.containerStackId);

      return containerSort !== 0
        ? containerSort
        : right.contentIndex - left.contentIndex || right.copyIndex - left.copyIndex;
    });
  const inventoryOptions = selectedOptions.filter(
    (option): option is Extract<SoulOfArtificeCheatDeathItemOption, { kind: "inventory" }> =>
      option.kind === "inventory"
  );
  let nextInventoryItems = character.inventoryItems ?? [];

  containerOptions.forEach((option) => {
    nextInventoryItems = removeOneContainerContentItemByIndex(
      nextInventoryItems,
      option.containerStackId,
      option.contentIndex
    );
  });

  inventoryOptions.forEach((option) => {
    nextInventoryItems = removeOneInventoryItemCopyById(nextInventoryItems, option.stackId);
  });

  return {
    ...character,
    inventoryItems: nextInventoryItems,
    currentHitPoints: selectedOptions.length * 20,
    deathSaves: {
      successes: 0,
      failures: 0
    }
  };
}
