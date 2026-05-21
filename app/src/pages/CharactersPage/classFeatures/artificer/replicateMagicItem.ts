import { CLASS_FEATURE } from "../../../../codex/entries";
import { artificerFeatures } from "../../../../codex/classes/artificer";
import type {
  Character,
  CharacterArtificerFeatureState,
  CharacterInventoryItem,
  ItemRecord
} from "../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import { ACTION_CARD_THEME } from "../../actionCardTheme";
import {
  INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM,
  INVENTORY_FEATURE_TAG_CONJURED,
  createCharacterInventoryItem,
  getInventoryItemQuantity,
  isReplicateMagicItemInventoryItem
} from "../../inventoryItems";
import { createTextCardUsage } from "../cardUsage";
import type { FeatureActionCard } from "../types";
import {
  artificerReplicateMagicItemPlanGroups,
  artificerReplicateMagicItemPlanOptionsByKey,
  type ArtificerReplicateMagicItemPlanGroup
} from "./replicateMagicItemPlans";

export const artificerReplicateMagicItemActionKey = "artificer-replicate-magic-item";

const replicateMagicItemName = "Replicate Magic Item";
const replicateMagicItemCreatingDescription = [
  "Creating an Item. When you finish a Long Rest, you can create one or two different magic items if you have Tinker's Tools in hand. Each item is based on one of the plans you know for this feature."
];

type ArtificerReplicateMagicItemCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "classFeatureState" | "inventoryItems" | "level">>;

function getArtificerProgression(characterLevel: number) {
  return [...artificerFeatures].reverse().find((entry) => entry.level <= characterLevel);
}

export function hasArtificerReplicateMagicItemFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): boolean {
  return character.className === "Artificer" && (character.level ?? 0) >= 2;
}

export function getArtificerReplicateMagicItemLimit(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): number {
  if (!hasArtificerReplicateMagicItemFeature(character)) {
    return 0;
  }

  const characterLevel = character.level ?? 0;
  const progression = getArtificerProgression(characterLevel);

  return Math.max(0, progression?.magicItems ?? 0);
}

export function getArtificerReplicateMagicItemPlansKnown(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): number {
  if (!hasArtificerReplicateMagicItemFeature(character)) {
    return 0;
  }

  return Math.max(0, getArtificerProgression(character.level ?? 0)?.plansKnown ?? 0);
}

export function getArtificerReplicateMagicItemAvailablePlanGroups(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): ArtificerReplicateMagicItemPlanGroup[] {
  if (!hasArtificerReplicateMagicItemFeature(character)) {
    return [];
  }

  const characterLevel = character.level ?? 0;

  return artificerReplicateMagicItemPlanGroups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) => option.level <= characterLevel)
    }))
    .filter((group) => group.options.length > 0);
}

export function normalizeArtificerReplicateMagicItemPlanKeys(
  value: unknown,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): string[] {
  const plansKnown = getArtificerReplicateMagicItemPlansKnown(character);

  if (plansKnown <= 0 || !Array.isArray(value)) {
    return [];
  }

  const characterLevel = character.level ?? 0;
  const selectedPlanKeys: string[] = [];
  const selectedPlanKeySet = new Set<string>();

  value.forEach((entry) => {
    const planKey = typeof entry === "string" ? entry.trim() : "";
    const plan = artificerReplicateMagicItemPlanOptionsByKey.get(planKey);

    if (!plan || plan.level > characterLevel || selectedPlanKeySet.has(planKey)) {
      return;
    }

    selectedPlanKeySet.add(planKey);
    selectedPlanKeys.push(planKey);
  });

  return selectedPlanKeys.slice(0, plansKnown);
}

export function normalizeArtificerReplicateMagicItemPlanState(
  value: unknown,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): Pick<CharacterArtificerFeatureState, "replicateMagicItemPlanKeys"> {
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const replicateMagicItemPlanKeys = normalizeArtificerReplicateMagicItemPlanKeys(
    record.replicateMagicItemPlanKeys,
    character
  );

  return replicateMagicItemPlanKeys.length > 0 ? { replicateMagicItemPlanKeys } : {};
}

export function getArtificerReplicateMagicItemPlanKeysForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "classFeatureState" | "level">>
): string[] {
  return normalizeArtificerReplicateMagicItemPlanKeys(
    character.classFeatureState?.artificer?.replicateMagicItemPlanKeys,
    character
  );
}

export function setArtificerReplicateMagicItemPlanKeysForCharacter(
  character: Character,
  planKeys: string[]
): Character {
  const nextPlanKeys = normalizeArtificerReplicateMagicItemPlanKeys(planKeys, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...character.classFeatureState?.artificer,
        replicateMagicItemPlanKeys: nextPlanKeys.length > 0 ? nextPlanKeys : undefined
      }
    }
  };
}

export function isArtificerReplicateMagicItemPlanSelectionInputRequired(
  character: Pick<Character, "className"> & Partial<Pick<Character, "classFeatureState" | "level">>
): boolean {
  const plansKnown = getArtificerReplicateMagicItemPlansKnown(character);

  return (
    plansKnown > 0 &&
    getArtificerReplicateMagicItemPlanKeysForCharacter(character).length < plansKnown
  );
}

function countReplicateMagicItemStack(entry: CharacterInventoryItem): number {
  return isReplicateMagicItemInventoryItem(entry) ? getInventoryItemQuantity(entry) : 0;
}

export function getArtificerReplicateMagicItemCount(
  character: Pick<Character, "className"> & Partial<Pick<Character, "inventoryItems" | "level">>
): number {
  if (!hasArtificerReplicateMagicItemFeature(character)) {
    return 0;
  }

  return (character.inventoryItems ?? []).reduce(
    (total, entry) => total + countReplicateMagicItemStack(entry),
    0
  );
}

export function getArtificerReplicateMagicItemAction(
  character: ArtificerReplicateMagicItemCharacter
): FeatureActionCard | null {
  if (!hasArtificerReplicateMagicItemFeature(character)) {
    return null;
  }

  const magicItemsTotal = getArtificerReplicateMagicItemLimit(character);
  const magicItemsCurrent = getArtificerReplicateMagicItemCount(character);
  const magicItemsRemaining = Math.max(0, magicItemsTotal - magicItemsCurrent);
  const isAtMaximum = magicItemsTotal > 0 && magicItemsCurrent >= magicItemsTotal;

  return {
    key: artificerReplicateMagicItemActionKey,
    name: replicateMagicItemName,
    sourceFeature: CLASS_FEATURE.REPLICATE_MAGIC_ITEM,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Create a planned magic item.",
    detail: "Use Tinker's Tools to create a magic item from a known Artificer plan.",
    breakdown: "Create magic item",
    economyType: ECONOMY_TYPE.NON_COMBAT,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining: magicItemsRemaining,
    usesTotal: magicItemsTotal,
    cardUsage: createTextCardUsage(`${magicItemsCurrent}/${magicItemsTotal} Magic Items`),
    description: replicateMagicItemCreatingDescription,
    drawer: {
      kind: "custom-form",
      description: replicateMagicItemCreatingDescription,
      formKind: "replicate-magic-item"
    },
    execute: {
      kind: "custom-form",
      formKind: "replicate-magic-item"
    },
    disabled: magicItemsTotal <= 0 || isAtMaximum,
    disabledReason: isAtMaximum
      ? "You already have the maximum number of Replicate Magic Item creations active."
      : undefined
  };
}

export function addArtificerReplicateMagicItemToInventory(
  character: Character,
  item: ItemRecord
): Character {
  if (
    !item.key ||
    getArtificerReplicateMagicItemCount(character) >= getArtificerReplicateMagicItemLimit(character)
  ) {
    return character;
  }

  return {
    ...character,
    inventoryItems: [
      ...(character.inventoryItems ?? []),
      createCharacterInventoryItem(item, {
        quantity: 1,
        featureTags: [INVENTORY_FEATURE_TAG_CONJURED],
        conjuredSource: INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM
      })
    ]
  };
}
