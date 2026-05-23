import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type {
  Character,
  CharacterArtificerFeatureState,
  CharacterInventoryItem,
  ItemRecord
} from "../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import { ACTION_CARD_THEME } from "../../actionCardTheme";
import {
  getInventoryItemQuantity,
  getInventoryItemUseState,
  isReplicateMagicItemInventoryItem,
  removeOneInventoryItemCopyById,
  resetInventoryItemChargeById
} from "../../inventoryItems";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../spellcasting";
import { createChargesCardUsage, createTextCardUsage } from "../cardUsage";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import type { FeatureActionCard } from "../types";
import { addArtificerReplicateMagicItemToInventory } from "./replicateMagicItem";

export const artificerChargeMagicItemActionKey = "artificer-charge-magic-item";
export const artificerDrainMagicItemActionKey = "artificer-drain-magic-item";
export const artificerTransmuteMagicItemActionKey = "artificer-transmute-magic-item";

const magicItemTinkerUsesTotal = 1;
const commonRarityKeys = new Set(["common"]);
const uncommonOrRareRarityKeys = new Set(["uncommon", "rare"]);

type MagicItemTinkerCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      "classFeatureState" | "inventoryItems" | "level" | "spellSlotsExpended" | "subclassId"
    >
  >;

export type MagicItemTinkerInventoryOption = {
  stackId: string;
  label: string;
  itemName: string;
  rarityKey: string | null;
  spellSlotLevel?: number;
  usesRemaining?: number;
  usesTotal?: number;
};

export type MagicItemTinkerSpellSlotOption = {
  level: number;
  label: string;
  remaining: number;
  total: number;
};

function normalizeUsesExpended(value: unknown, total: number): number {
  const parsedValue = Number(value);
  const normalizedValue = Number.isFinite(parsedValue) ? Math.floor(parsedValue) : 0;

  return Math.max(0, Math.min(total, normalizedValue));
}

function getArtificerState(
  character: Pick<Character, "classFeatureState">
): CharacterArtificerFeatureState {
  return character.classFeatureState?.artificer ?? {};
}

function getNormalizedRarityKey(item: ItemRecord | null | undefined): string | null {
  const rawKey = item?.rarity?.key ?? item?.rarity?.name ?? "";
  const normalizedKey = rawKey.trim().toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");

  return normalizedKey || null;
}

function getDrainSpellSlotLevelForRarity(rarityKey: string | null): number | null {
  if (!rarityKey) {
    return null;
  }

  if (commonRarityKeys.has(rarityKey)) {
    return 1;
  }

  return uncommonOrRareRarityKeys.has(rarityKey) ? 2 : null;
}

function createInventoryOptionLabel(
  entry: CharacterInventoryItem,
  details?: { rarityKey?: string | null; spellSlotLevel?: number | null }
): string {
  const name = entry.item.name ?? "Unnamed item";
  const quantity = getInventoryItemQuantity(entry);
  const quantityLabel = quantity > 1 ? ` x${quantity}` : "";
  const rarityLabel = details?.rarityKey ? ` (${details.rarityKey.replace(/-/g, " ")})` : "";
  const slotLabel = details?.spellSlotLevel ? ` -> level ${details.spellSlotLevel} slot` : "";

  return `${name}${quantityLabel}${rarityLabel}${slotLabel}`;
}

function getSpellSlotState(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "spellSlotsExpended" | "subclassId">>
) {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level ?? 1,
    character.subclassId
  );
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );

  return {
    spellSlotTotals,
    spellSlotsExpended,
    spellSlotsRemaining
  };
}

function expendSpellSlotForCharacter(character: Character, spellSlotLevel: number): Character {
  const normalizedSpellSlotLevel = Math.max(1, Math.min(9, Math.floor(spellSlotLevel)));
  const { spellSlotTotals, spellSlotsExpended, spellSlotsRemaining } = getSpellSlotState(character);
  const slotIndex = normalizedSpellSlotLevel - 1;

  if ((spellSlotTotals[slotIndex] ?? 0) <= 0 || (spellSlotsRemaining[slotIndex] ?? 0) <= 0) {
    return character;
  }

  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[slotIndex] = (nextSpellSlotsExpended[slotIndex] ?? 0) + 1;

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

function canRestoreSpellSlot(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "spellSlotsExpended" | "subclassId">>,
  spellSlotLevel: number
): boolean {
  const normalizedSpellSlotLevel = Math.max(1, Math.min(9, Math.floor(spellSlotLevel)));
  const { spellSlotsExpended } = getSpellSlotState(character);

  return (spellSlotsExpended[normalizedSpellSlotLevel - 1] ?? 0) > 0;
}

function restoreSpellSlotForCharacter(character: Character, spellSlotLevel: number): Character {
  const normalizedSpellSlotLevel = Math.max(1, Math.min(9, Math.floor(spellSlotLevel)));
  const { spellSlotTotals, spellSlotsExpended } = getSpellSlotState(character);
  const slotIndex = normalizedSpellSlotLevel - 1;

  if ((spellSlotsExpended[slotIndex] ?? 0) <= 0) {
    return character;
  }

  const nextSpellSlotsExpended = normalizeSpellSlotsExpended(spellSlotsExpended, spellSlotTotals);
  nextSpellSlotsExpended[slotIndex] = Math.max(0, nextSpellSlotsExpended[slotIndex] - 1);

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

function getMagicItemTinkerOptionDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  optionName: string
): SpellDescriptionEntry[] {
  const marker = `<strong>${optionName}.</strong>`;
  const matchingEntry = getFeatureDescriptionForCharacter(
    {
      className: character.className,
      level: character.level ?? 0,
      subclassId: character.subclassId
    },
    CLASS_FEATURE.MAGIC_ITEM_TINKER
  ).find((entry) => typeof entry === "string" && entry.startsWith(marker));

  return matchingEntry ? [matchingEntry] : [];
}

export function hasArtificerMagicItemTinkerFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): boolean {
  return character.className === "Artificer" && (character.level ?? 0) >= 6;
}

export function getArtificerMagicItemTinkerDrainUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): number {
  return hasArtificerMagicItemTinkerFeature(character) ? magicItemTinkerUsesTotal : 0;
}

export function getArtificerMagicItemTinkerTransmuteUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): number {
  return hasArtificerMagicItemTinkerFeature(character) ? magicItemTinkerUsesTotal : 0;
}

export function normalizeArtificerMagicItemTinkerState(
  value: unknown,
  character: Pick<Character, "className" | "level">
): Pick<
  CharacterArtificerFeatureState,
  "magicItemTinkerDrainUsesExpended" | "magicItemTinkerTransmuteUsesExpended"
> {
  if (!hasArtificerMagicItemTinkerFeature(character)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};

  return {
    magicItemTinkerDrainUsesExpended: normalizeUsesExpended(
      record.magicItemTinkerDrainUsesExpended,
      magicItemTinkerUsesTotal
    ),
    magicItemTinkerTransmuteUsesExpended: normalizeUsesExpended(
      record.magicItemTinkerTransmuteUsesExpended,
      magicItemTinkerUsesTotal
    )
  };
}

export function getArtificerMagicItemTinkerDrainUsesRemaining(
  character: MagicItemTinkerCharacter
): number {
  const usesTotal = getArtificerMagicItemTinkerDrainUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  return Math.max(
    0,
    usesTotal -
      normalizeUsesExpended(
        character.classFeatureState?.artificer?.magicItemTinkerDrainUsesExpended,
        usesTotal
      )
  );
}

export function getArtificerMagicItemTinkerTransmuteUsesRemaining(
  character: MagicItemTinkerCharacter
): number {
  const usesTotal = getArtificerMagicItemTinkerTransmuteUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  return Math.max(
    0,
    usesTotal -
      normalizeUsesExpended(
        character.classFeatureState?.artificer?.magicItemTinkerTransmuteUsesExpended,
        usesTotal
      )
  );
}

export function getArtificerMagicItemTinkerChargeItemOptions(
  character: Pick<Character, "inventoryItems">
): MagicItemTinkerInventoryOption[] {
  return (character.inventoryItems ?? []).flatMap((entry) => {
    const useState = getInventoryItemUseState(entry);

    if (!isReplicateMagicItemInventoryItem(entry) || !useState) {
      return [];
    }

    return [
      {
        stackId: entry.id,
        label: `${createInventoryOptionLabel(entry)} (${useState.remaining}/${useState.total} charges)`,
        itemName: entry.item.name ?? "Unnamed item",
        rarityKey: getNormalizedRarityKey(entry.item),
        usesRemaining: useState.remaining,
        usesTotal: useState.total
      }
    ];
  });
}

export function getArtificerMagicItemTinkerDrainItemOptions(
  character: Pick<Character, "inventoryItems">
): MagicItemTinkerInventoryOption[] {
  return (character.inventoryItems ?? []).flatMap((entry) => {
    if (!isReplicateMagicItemInventoryItem(entry)) {
      return [];
    }

    const rarityKey = getNormalizedRarityKey(entry.item);
    const spellSlotLevel = getDrainSpellSlotLevelForRarity(rarityKey);

    if (!spellSlotLevel) {
      return [];
    }

    return [
      {
        stackId: entry.id,
        label: createInventoryOptionLabel(entry, { rarityKey, spellSlotLevel }),
        itemName: entry.item.name ?? "Unnamed item",
        rarityKey,
        spellSlotLevel
      }
    ];
  });
}

export function getArtificerMagicItemTinkerTransmuteItemOptions(
  character: Pick<Character, "inventoryItems">
): MagicItemTinkerInventoryOption[] {
  return (character.inventoryItems ?? []).flatMap((entry) =>
    isReplicateMagicItemInventoryItem(entry)
      ? [
          {
            stackId: entry.id,
            label: createInventoryOptionLabel(entry, {
              rarityKey: getNormalizedRarityKey(entry.item)
            }),
            itemName: entry.item.name ?? "Unnamed item",
            rarityKey: getNormalizedRarityKey(entry.item)
          }
        ]
      : []
  );
}

export function getArtificerMagicItemTinkerAvailableSpellSlotOptions(
  character: MagicItemTinkerCharacter
): MagicItemTinkerSpellSlotOption[] {
  const { spellSlotTotals, spellSlotsRemaining } = getSpellSlotState(character);

  return spellSlotTotals.flatMap((total, index) => {
    const level = index + 1;
    const remaining = spellSlotsRemaining[index] ?? 0;

    return total > 0
      ? [
          {
            level,
            label: `Level ${level} (${remaining}/${total})`,
            remaining,
            total
          }
        ]
      : [];
  });
}

function consumeArtificerMagicItemTinkerDrainUse(character: Character): Character {
  if (getArtificerMagicItemTinkerDrainUsesRemaining(character) <= 0) {
    return character;
  }

  const currentArtificerState = getArtificerState(character);
  const magicItemTinkerState = normalizeArtificerMagicItemTinkerState(
    currentArtificerState,
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...magicItemTinkerState,
        magicItemTinkerDrainUsesExpended:
          (magicItemTinkerState.magicItemTinkerDrainUsesExpended ?? 0) + 1
      }
    }
  };
}

function consumeArtificerMagicItemTinkerTransmuteUse(character: Character): Character {
  if (getArtificerMagicItemTinkerTransmuteUsesRemaining(character) <= 0) {
    return character;
  }

  const currentArtificerState = getArtificerState(character);
  const magicItemTinkerState = normalizeArtificerMagicItemTinkerState(
    currentArtificerState,
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...magicItemTinkerState,
        magicItemTinkerTransmuteUsesExpended:
          (magicItemTinkerState.magicItemTinkerTransmuteUsesExpended ?? 0) + 1
      }
    }
  };
}

export function chargeArtificerMagicItemForCharacter(
  character: Character,
  stackId: string,
  spellSlotLevel: number
): Character {
  if (!hasArtificerMagicItemTinkerFeature(character)) {
    return character;
  }

  const targetItem = (character.inventoryItems ?? []).find((entry) => entry.id === stackId) ?? null;
  const useState = getInventoryItemUseState(targetItem);

  if (
    !targetItem ||
    !isReplicateMagicItemInventoryItem(targetItem) ||
    !useState ||
    useState.remaining >= useState.total
  ) {
    return character;
  }

  const characterWithSpellSlotSpent = expendSpellSlotForCharacter(character, spellSlotLevel);

  if (characterWithSpellSlotSpent === character) {
    return character;
  }

  return {
    ...characterWithSpellSlotSpent,
    inventoryItems: resetInventoryItemChargeById(
      characterWithSpellSlotSpent.inventoryItems,
      stackId,
      useState.total
    )
  };
}

export function drainArtificerMagicItemForCharacter(
  character: Character,
  stackId: string
): Character {
  if (!hasArtificerMagicItemTinkerFeature(character)) {
    return character;
  }

  const targetItem = (character.inventoryItems ?? []).find((entry) => entry.id === stackId) ?? null;
  const spellSlotLevel = getDrainSpellSlotLevelForRarity(getNormalizedRarityKey(targetItem?.item));

  if (
    !targetItem ||
    !isReplicateMagicItemInventoryItem(targetItem) ||
    !spellSlotLevel ||
    !canRestoreSpellSlot(character, spellSlotLevel)
  ) {
    return character;
  }

  const characterWithUseSpent = consumeArtificerMagicItemTinkerDrainUse(character);

  if (characterWithUseSpent === character) {
    return character;
  }

  const characterWithSlotRestored = restoreSpellSlotForCharacter(
    characterWithUseSpent,
    spellSlotLevel
  );

  return {
    ...characterWithSlotRestored,
    inventoryItems: removeOneInventoryItemCopyById(
      characterWithSlotRestored.inventoryItems,
      stackId
    )
  };
}

export function transmuteArtificerMagicItemForCharacter(
  character: Character,
  stackId: string,
  item: ItemRecord
): Character {
  if (!hasArtificerMagicItemTinkerFeature(character) || !item.key) {
    return character;
  }

  const targetItem = (character.inventoryItems ?? []).find((entry) => entry.id === stackId) ?? null;

  if (!targetItem || !isReplicateMagicItemInventoryItem(targetItem)) {
    return character;
  }

  const characterWithUseSpent = consumeArtificerMagicItemTinkerTransmuteUse(character);

  if (characterWithUseSpent === character) {
    return character;
  }

  const characterWithoutOldItem = {
    ...characterWithUseSpent,
    inventoryItems: removeOneInventoryItemCopyById(characterWithUseSpent.inventoryItems, stackId)
  };

  return addArtificerReplicateMagicItemToInventory(characterWithoutOldItem, item);
}

function getChargeMagicItemDisabledReason(character: MagicItemTinkerCharacter): string | undefined {
  const itemOptions = getArtificerMagicItemTinkerChargeItemOptions({
    inventoryItems: character.inventoryItems ?? []
  });
  const hasAvailableSpellSlot = getArtificerMagicItemTinkerAvailableSpellSlotOptions(
    character
  ).some((option) => option.remaining > 0);

  if (itemOptions.length <= 0) {
    return "No Replicate Magic Item creations with charges are in your inventory.";
  }

  if (!itemOptions.some((option) => (option.usesRemaining ?? 0) < (option.usesTotal ?? 0))) {
    return "All eligible Replicate Magic Item creations are fully charged.";
  }

  return hasAvailableSpellSlot ? undefined : "No level 1+ spell slots remaining.";
}

function getDrainMagicItemDisabledReason(character: MagicItemTinkerCharacter): string | undefined {
  const usesRemaining = getArtificerMagicItemTinkerDrainUsesRemaining(character);
  const itemOptions = getArtificerMagicItemTinkerDrainItemOptions({
    inventoryItems: character.inventoryItems ?? []
  });

  if (usesRemaining <= 0) {
    return "Drain Magic Item recharges when you finish a Long Rest.";
  }

  if (itemOptions.length <= 0) {
    return "No Common, Uncommon, or Rare Replicate Magic Item creations are in your inventory.";
  }

  return itemOptions.some((option) =>
    option.spellSlotLevel ? canRestoreSpellSlot(character, option.spellSlotLevel) : false
  )
    ? undefined
    : "No matching expended spell slot to restore.";
}

function getTransmuteMagicItemDisabledReason(
  character: MagicItemTinkerCharacter
): string | undefined {
  const usesRemaining = getArtificerMagicItemTinkerTransmuteUsesRemaining(character);
  const itemOptions = getArtificerMagicItemTinkerTransmuteItemOptions({
    inventoryItems: character.inventoryItems ?? []
  });

  if (usesRemaining <= 0) {
    return "Transmute Magic Item recharges when you finish a Long Rest.";
  }

  if (itemOptions.length <= 0) {
    return "No Replicate Magic Item creations are in your inventory.";
  }

  return undefined;
}

export function getArtificerMagicItemTinkerActions(
  character: MagicItemTinkerCharacter
): FeatureActionCard[] {
  if (!hasArtificerMagicItemTinkerFeature(character)) {
    return [];
  }

  const drainUsesTotal = getArtificerMagicItemTinkerDrainUsesTotal(character);
  const drainUsesRemaining = getArtificerMagicItemTinkerDrainUsesRemaining(character);
  const transmuteUsesTotal = getArtificerMagicItemTinkerTransmuteUsesTotal(character);
  const transmuteUsesRemaining = getArtificerMagicItemTinkerTransmuteUsesRemaining(character);
  const chargeDisabledReason = getChargeMagicItemDisabledReason(character);
  const drainDisabledReason = getDrainMagicItemDisabledReason(character);
  const transmuteDisabledReason = getTransmuteMagicItemDisabledReason(character);

  return [
    {
      key: artificerChargeMagicItemActionKey,
      name: "Charge Magic Item",
      sourceFeature: CLASS_FEATURE.MAGIC_ITEM_TINKER,
      cardTheme: ACTION_CARD_THEME.MAGIC,
      summary: "Recharge a replicated item.",
      detail: "Spend a spell slot to refill charges on a Replicate Magic Item creation.",
      breakdown: "Recharge magic item",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      cardUsage: createTextCardUsage("1+ Spell Slot"),
      description: getMagicItemTinkerOptionDescription(character, "Charge Magic Item"),
      drawer: {
        kind: "custom-form",
        description: getMagicItemTinkerOptionDescription(character, "Charge Magic Item"),
        formKind: "artificer-charge-magic-item"
      },
      execute: {
        kind: "custom-form",
        formKind: "artificer-charge-magic-item"
      },
      disabled: chargeDisabledReason !== undefined,
      disabledReason: chargeDisabledReason
    },
    {
      key: artificerDrainMagicItemActionKey,
      name: "Drain Magic Item",
      sourceFeature: CLASS_FEATURE.MAGIC_ITEM_TINKER,
      cardTheme: ACTION_CARD_THEME.MAGIC,
      summary: "Convert a replicated item into a spell slot.",
      detail: "Destroy a Replicate Magic Item creation to restore a spell slot.",
      breakdown: "Restore spell slot",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining: drainUsesRemaining,
      usesTotal: drainUsesTotal,
      cardUsage: createChargesCardUsage(drainUsesRemaining, drainUsesTotal),
      description: getMagicItemTinkerOptionDescription(character, "Drain Magic Item"),
      drawer: {
        kind: "custom-form",
        description: getMagicItemTinkerOptionDescription(character, "Drain Magic Item"),
        formKind: "artificer-drain-magic-item"
      },
      execute: {
        kind: "custom-form",
        formKind: "artificer-drain-magic-item"
      },
      disabled: drainDisabledReason !== undefined,
      disabledReason: drainDisabledReason
    },
    {
      key: artificerTransmuteMagicItemActionKey,
      name: "Transmute Magic Item",
      sourceFeature: CLASS_FEATURE.MAGIC_ITEM_TINKER,
      cardTheme: ACTION_CARD_THEME.MAGIC,
      summary: "Transform a replicated item into another plan.",
      detail: "Replace a Replicate Magic Item creation with a different known magic item plan.",
      breakdown: "Swap magic item",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining: transmuteUsesRemaining,
      usesTotal: transmuteUsesTotal,
      cardUsage: createChargesCardUsage(transmuteUsesRemaining, transmuteUsesTotal),
      description: getMagicItemTinkerOptionDescription(character, "Transmute Magic Item"),
      drawer: {
        kind: "custom-form",
        description: getMagicItemTinkerOptionDescription(character, "Transmute Magic Item"),
        formKind: "artificer-transmute-magic-item"
      },
      execute: {
        kind: "custom-form",
        formKind: "artificer-transmute-magic-item"
      },
      disabled: transmuteDisabledReason !== undefined,
      disabledReason: transmuteDisabledReason
    }
  ];
}

export function restoreArtificerMagicItemTinkerDrainOnLongRest(character: Character): Character {
  if (!hasArtificerMagicItemTinkerFeature(character)) {
    return character;
  }

  const currentArtificerState = getArtificerState(character);

  if ((currentArtificerState.magicItemTinkerDrainUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        magicItemTinkerDrainUsesExpended: 0
      }
    }
  };
}

export function restoreArtificerMagicItemTinkerTransmuteOnLongRest(
  character: Character
): Character {
  if (!hasArtificerMagicItemTinkerFeature(character)) {
    return character;
  }

  const currentArtificerState = getArtificerState(character);

  if ((currentArtificerState.magicItemTinkerTransmuteUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        magicItemTinkerTransmuteUsesExpended: 0
      }
    }
  };
}
