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
  INVENTORY_REPLICATE_MAGIC_ITEM_SLOT_ARMOR_REPLICATION,
  INVENTORY_REPLICATE_MAGIC_ITEM_SLOT_BASE,
  createCharacterInventoryItem,
  getInventoryItemQuantity,
  isReplicateMagicItemInventoryItem
} from "../../inventoryItems";
import { createFeatureSourcedDescriptionEntries } from "../../actionModalDescriptions";
import { createTextCardUsage } from "../cardUsage";
import type { FeatureActionCard } from "../types";
import {
  artificerReplicateMagicItemArmorPlanKeySet,
  artificerReplicateMagicItemPlanGroups,
  artificerReplicateMagicItemPlanOptionsByKey,
  type ArtificerReplicateMagicItemPlanGroup
} from "./replicateMagicItemPlans";
import {
  getArtificerArmorerImprovedArmorerDescriptionSection,
  hasArtificerArmorerImprovedArmorerFeature
} from "./subclasses/artificerArmorer";

export const artificerReplicateMagicItemActionKey = "artificer-replicate-magic-item";

const replicateMagicItemName = "Replicate Magic Item";
const replicateMagicItemCreatingDescription = [
  "Creating an Item. When you finish a Long Rest, you can create one or two different magic items if you have Tinker's Tools in hand. Each item is based on one of the plans you know for this feature."
];

type ArtificerReplicateMagicItemCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "classFeatureState" | "inventoryItems" | "level" | "subclassId">>;

function getArtificerProgression(characterLevel: number) {
  return [...artificerFeatures].reverse().find((entry) => entry.level <= characterLevel);
}

export function hasArtificerReplicateMagicItemFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): boolean {
  return character.className === "Artificer" && (character.level ?? 0) >= 2;
}

function getArtificerReplicateMagicItemBaseLimit(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): number {
  if (!hasArtificerReplicateMagicItemFeature(character)) {
    return 0;
  }

  const characterLevel = character.level ?? 0;
  const progression = getArtificerProgression(characterLevel);

  return Math.max(0, progression?.magicItems ?? 0);
}

function getArtificerImprovedArmorerArmorReplicationLimit(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasArtificerArmorerImprovedArmorerFeature(character) ? 1 : 0;
}

export function getArtificerReplicateMagicItemLimit(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return (
    getArtificerReplicateMagicItemBaseLimit(character) +
    getArtificerImprovedArmorerArmorReplicationLimit(character)
  );
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

export function getArtificerImprovedArmorerArmorReplicationPlanGroups(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ArtificerReplicateMagicItemPlanGroup[] {
  if (!hasArtificerArmorerImprovedArmorerFeature(character)) {
    return [];
  }

  return getArtificerReplicateMagicItemAvailablePlanGroups(character)
    .map((group) => ({
      ...group,
      options: group.options.filter((option) =>
        artificerReplicateMagicItemArmorPlanKeySet.has(option.key)
      )
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

function normalizeArtificerImprovedArmorerArmorReplicationPlanKey(
  value: unknown,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  selectedBasePlanKeys: Set<string>
): string | undefined {
  if (!hasArtificerArmorerImprovedArmorerFeature(character)) {
    return undefined;
  }

  const planKey = typeof value === "string" ? value.trim() : "";
  const plan = artificerReplicateMagicItemPlanOptionsByKey.get(planKey);

  if (
    !plan ||
    plan.level > (character.level ?? 0) ||
    selectedBasePlanKeys.has(planKey) ||
    !artificerReplicateMagicItemArmorPlanKeySet.has(planKey)
  ) {
    return undefined;
  }

  return planKey;
}

export function normalizeArtificerReplicateMagicItemPlanState(
  value: unknown,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<
  CharacterArtificerFeatureState,
  "replicateMagicItemPlanKeys" | "armorerImprovedArmorReplicationPlanKey"
> {
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const replicateMagicItemPlanKeys = normalizeArtificerReplicateMagicItemPlanKeys(
    record.replicateMagicItemPlanKeys,
    character
  );
  const armorerImprovedArmorReplicationPlanKey =
    normalizeArtificerImprovedArmorerArmorReplicationPlanKey(
      record.armorerImprovedArmorReplicationPlanKey,
      character,
      new Set(replicateMagicItemPlanKeys)
    );

  return {
    ...(replicateMagicItemPlanKeys.length > 0 ? { replicateMagicItemPlanKeys } : {}),
    ...(armorerImprovedArmorReplicationPlanKey
      ? { armorerImprovedArmorReplicationPlanKey }
      : {})
  };
}

export function getArtificerReplicateMagicItemPlanKeysForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "classFeatureState" | "level">>
): string[] {
  return normalizeArtificerReplicateMagicItemPlanKeys(
    character.classFeatureState?.artificer?.replicateMagicItemPlanKeys,
    character
  );
}

export function getArtificerImprovedArmorerArmorReplicationPlanKeyForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): string | null {
  const basePlanKeys = getArtificerReplicateMagicItemPlanKeysForCharacter(character);
  const planKey = normalizeArtificerImprovedArmorerArmorReplicationPlanKey(
    character.classFeatureState?.artificer?.armorerImprovedArmorReplicationPlanKey,
    character,
    new Set(basePlanKeys)
  );

  return planKey ?? null;
}

export function setArtificerReplicateMagicItemPlanKeysForCharacter(
  character: Character,
  planKeys: string[]
): Character {
  const nextPlanKeys = normalizeArtificerReplicateMagicItemPlanKeys(planKeys, character);
  const nextArmorReplicationPlanKey = normalizeArtificerImprovedArmorerArmorReplicationPlanKey(
    character.classFeatureState?.artificer?.armorerImprovedArmorReplicationPlanKey,
    character,
    new Set(nextPlanKeys)
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...character.classFeatureState?.artificer,
        replicateMagicItemPlanKeys: nextPlanKeys.length > 0 ? nextPlanKeys : undefined,
        armorerImprovedArmorReplicationPlanKey: nextArmorReplicationPlanKey
      }
    }
  };
}

export function setArtificerImprovedArmorerArmorReplicationPlanKeyForCharacter(
  character: Character,
  planKey: string
): Character {
  const basePlanKeys = getArtificerReplicateMagicItemPlanKeysForCharacter(character);
  const nextPlanKey = normalizeArtificerImprovedArmorerArmorReplicationPlanKey(
    planKey,
    character,
    new Set(basePlanKeys)
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...character.classFeatureState?.artificer,
        armorerImprovedArmorReplicationPlanKey: nextPlanKey
      }
    }
  };
}

export function isArtificerReplicateMagicItemPlanSelectionInputRequired(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): boolean {
  const plansKnown = getArtificerReplicateMagicItemPlansKnown(character);

  return (
    (plansKnown > 0 &&
      getArtificerReplicateMagicItemPlanKeysForCharacter(character).length < plansKnown) ||
    (hasArtificerArmorerImprovedArmorerFeature(character) &&
      !getArtificerImprovedArmorerArmorReplicationPlanKeyForCharacter(character))
  );
}

function countReplicateMagicItemStack(entry: CharacterInventoryItem): number {
  return isReplicateMagicItemInventoryItem(entry) ? getInventoryItemQuantity(entry) : 0;
}

function isArmorReplicationReplicateMagicItemStack(entry: CharacterInventoryItem): boolean {
  return (
    isReplicateMagicItemInventoryItem(entry) &&
    entry.replicateMagicItemSlot === INVENTORY_REPLICATE_MAGIC_ITEM_SLOT_ARMOR_REPLICATION
  );
}

function countBaseReplicateMagicItemStack(entry: CharacterInventoryItem): number {
  return isReplicateMagicItemInventoryItem(entry) &&
    !isArmorReplicationReplicateMagicItemStack(entry)
    ? getInventoryItemQuantity(entry)
    : 0;
}

function countArmorReplicationReplicateMagicItemStack(entry: CharacterInventoryItem): number {
  return isArmorReplicationReplicateMagicItemStack(entry) ? getInventoryItemQuantity(entry) : 0;
}

function getArtificerReplicateMagicItemBaseCount(
  character: Pick<Character, "className"> & Partial<Pick<Character, "inventoryItems" | "level">>
): number {
  if (!hasArtificerReplicateMagicItemFeature(character)) {
    return 0;
  }

  return (character.inventoryItems ?? []).reduce(
    (total, entry) => total + countBaseReplicateMagicItemStack(entry),
    0
  );
}

function getArtificerImprovedArmorerArmorReplicationItemCount(
  character: Pick<Character, "className"> & Partial<Pick<Character, "inventoryItems" | "level">>
): number {
  if (!hasArtificerReplicateMagicItemFeature(character)) {
    return 0;
  }

  return (character.inventoryItems ?? []).reduce(
    (total, entry) => total + countArmorReplicationReplicateMagicItemStack(entry),
    0
  );
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

export function getArtificerReplicateMagicItemCreatablePlanKeysForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "inventoryItems" | "level" | "subclassId">>
): string[] {
  const basePlanKeys = getArtificerReplicateMagicItemPlanKeysForCharacter(character);
  const baseLimit = getArtificerReplicateMagicItemBaseLimit(character);
  const baseCount = getArtificerReplicateMagicItemBaseCount(character);
  const armorReplicationLimit = getArtificerImprovedArmorerArmorReplicationLimit(character);
  const armorReplicationCount = getArtificerImprovedArmorerArmorReplicationItemCount(character);
  const armorReplicationPlanKey =
    getArtificerImprovedArmorerArmorReplicationPlanKeyForCharacter(character);
  const creatablePlanKeys: string[] = [];

  if (baseCount < baseLimit) {
    creatablePlanKeys.push(...basePlanKeys);
  }

  if (
    armorReplicationPlanKey &&
    armorReplicationCount < armorReplicationLimit &&
    !creatablePlanKeys.includes(armorReplicationPlanKey)
  ) {
    creatablePlanKeys.push(armorReplicationPlanKey);
  }

  return creatablePlanKeys;
}

export function getArtificerReplicateMagicItemAction(
  character: ArtificerReplicateMagicItemCharacter
): FeatureActionCard | null {
  if (!hasArtificerReplicateMagicItemFeature(character)) {
    return null;
  }

  const magicItemsBaseTotal = getArtificerReplicateMagicItemBaseLimit(character);
  const magicItemsBaseCurrent = getArtificerReplicateMagicItemBaseCount(character);
  const armorReplicationTotal = getArtificerImprovedArmorerArmorReplicationLimit(character);
  const armorReplicationCurrent =
    getArtificerImprovedArmorerArmorReplicationItemCount(character);
  const armorReplicationPlanKey =
    getArtificerImprovedArmorerArmorReplicationPlanKeyForCharacter(character);
  const magicItemsTotal = magicItemsBaseTotal + armorReplicationTotal;
  const magicItemsCurrent = magicItemsBaseCurrent + armorReplicationCurrent;
  const hasBaseSlotAvailable = magicItemsBaseCurrent < magicItemsBaseTotal;
  const hasArmorReplicationSlotAvailable =
    Boolean(armorReplicationPlanKey) && armorReplicationCurrent < armorReplicationTotal;
  const isMissingArmorReplicationPlan =
    !hasBaseSlotAvailable &&
    armorReplicationTotal > 0 &&
    armorReplicationCurrent < armorReplicationTotal &&
    !armorReplicationPlanKey;
  const magicItemsRemaining =
    Math.max(0, magicItemsBaseTotal - magicItemsBaseCurrent) +
    Math.max(0, armorReplicationTotal - armorReplicationCurrent);
  const isAtMaximum =
    magicItemsTotal > 0 && !hasBaseSlotAvailable && !hasArmorReplicationSlotAvailable;
  const armorReplicationDescription = hasArtificerArmorerImprovedArmorerFeature(character)
    ? getArtificerArmorerImprovedArmorerDescriptionSection(character, "Armor Replication.")
    : [];
  const armorReplicationDescriptionAddition =
    armorReplicationDescription.length > 0
      ? createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.IMPROVED_ARMORER,
          armorReplicationDescription
        )
      : [];
  const disabledReason = isMissingArmorReplicationPlan
    ? "Choose an Armor Replication plan in Class Features before creating your additional armor item."
    : isAtMaximum
      ? "You already have the maximum number of Replicate Magic Item creations active."
      : undefined;

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
    descriptionAdditions:
      armorReplicationDescriptionAddition.length > 0 ? [armorReplicationDescriptionAddition] : [],
    drawer: {
      kind: "custom-form",
      description: replicateMagicItemCreatingDescription,
      descriptionAdditions:
        armorReplicationDescriptionAddition.length > 0
          ? [armorReplicationDescriptionAddition]
          : [],
      formKind: "replicate-magic-item"
    },
    execute: {
      kind: "custom-form",
      formKind: "replicate-magic-item"
    },
    disabled: magicItemsTotal <= 0 || isAtMaximum || isMissingArmorReplicationPlan,
    disabledReason
  };
}

export function addArtificerReplicateMagicItemToInventory(
  character: Character,
  item: ItemRecord,
  options?: {
    planKey?: string | null;
  }
): Character {
  if (!item.key) {
    return character;
  }

  const selectedPlanKey =
    typeof options?.planKey === "string" && options.planKey.trim().length > 0
      ? options.planKey.trim()
      : null;
  const baseLimit = getArtificerReplicateMagicItemBaseLimit(character);
  const baseCount = getArtificerReplicateMagicItemBaseCount(character);
  const armorReplicationLimit = getArtificerImprovedArmorerArmorReplicationLimit(character);
  const armorReplicationCount = getArtificerImprovedArmorerArmorReplicationItemCount(character);
  const armorReplicationPlanKey =
    getArtificerImprovedArmorerArmorReplicationPlanKeyForCharacter(character);
  const useArmorReplicationSlot =
    selectedPlanKey !== null &&
    selectedPlanKey === armorReplicationPlanKey &&
    armorReplicationCount < armorReplicationLimit;
  const useBaseSlot = !useArmorReplicationSlot && baseCount < baseLimit;
  const replicateMagicItemSlot = useArmorReplicationSlot
    ? INVENTORY_REPLICATE_MAGIC_ITEM_SLOT_ARMOR_REPLICATION
    : useBaseSlot
      ? INVENTORY_REPLICATE_MAGIC_ITEM_SLOT_BASE
      : null;

  if (!replicateMagicItemSlot) {
    return character;
  }

  return {
    ...character,
    inventoryItems: [
      ...(character.inventoryItems ?? []),
      createCharacterInventoryItem(item, {
        quantity: 1,
        featureTags: [INVENTORY_FEATURE_TAG_CONJURED],
        conjuredSource: INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM,
        replicateMagicItemPlanKey: selectedPlanKey ?? undefined,
        replicateMagicItemSlot
      })
    ]
  };
}
