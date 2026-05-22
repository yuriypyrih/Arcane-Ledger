import type {
  CharacterInventoryConjuredDuration,
  CharacterInventoryFeatureTag,
  CharacterInventoryItem,
  CharacterInventoryStoredSpellMode
} from "../../../../types";
import {
  getDefaultInventoryItemChargesTotal,
  getInventoryItemConjuredDuration,
  getInventoryItemConjuredSource,
  getInventoryItemExplicitChargesTotal,
  getInventoryItemStoredSpell,
  INVENTORY_CONJURED_DURATION_DEATH,
  INVENTORY_CONJURED_SOURCE_MANUAL,
  INVENTORY_REFILLABLE_LIMIT,
  INVENTORY_FEATURE_TAG_CONJURED,
  INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE,
  INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES,
  INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES_DESTRUCTIBLE,
  INVENTORY_STORED_SPELL_MODE_DEFAULT,
  isConjuredInventoryItem,
  type InventoryItemSettingsSavePayload
} from "../../../../pages/CharactersPage/inventoryItems";
import { getEffectiveInventoryItemRecord } from "../../../../pages/CharactersPage/itemMods";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";

export type CustomEquipmentItemSettingsDraft = {
  chargesEnabled: boolean;
  chargesTotal: number;
  conjuredEnabled: boolean;
  conjuredDuration: CharacterInventoryConjuredDuration;
  storedSpellEnabled: boolean;
  storedSpellId: string;
  storedSpellSearch: string;
  storedSpellMode: CharacterInventoryStoredSpellMode;
  storedSpellChargeCost: number;
};

export type CustomEquipmentItemSettingsParseResult =
  | {
      settings: InventoryItemSettingsSavePayload;
      error: null;
    }
  | {
      settings: null;
      error: string;
    };

function normalizePositiveInteger(value: unknown, fallback = 1): number {
  return Math.floor(clampNumber(value, 1, INVENTORY_REFILLABLE_LIMIT, fallback));
}

function getItemForSettings(initialStack?: CharacterInventoryItem | null) {
  return initialStack ? getEffectiveInventoryItemRecord(initialStack) : null;
}

export function isChargeConsumingStoredSpellMode(mode: CharacterInventoryStoredSpellMode): boolean {
  return (
    mode === INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES ||
    mode === INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES_DESTRUCTIBLE
  );
}

export function normalizeItemSettingPositiveInteger(value: unknown, fallback = 1): number {
  return normalizePositiveInteger(value, fallback);
}

const featureTagOrder: CharacterInventoryFeatureTag[] = [
  INVENTORY_FEATURE_TAG_CONJURED,
  INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE
];

function getOrderedFeatureTags(tagSet: Set<CharacterInventoryFeatureTag>) {
  return featureTagOrder.filter((tag) => tagSet.has(tag));
}

export function isCustomEquipmentItemSettingsConjuredLocked(
  initialStack?: CharacterInventoryItem | null
): boolean {
  return (
    isConjuredInventoryItem(initialStack) &&
    getInventoryItemConjuredSource(initialStack) !== INVENTORY_CONJURED_SOURCE_MANUAL
  );
}

export function createCustomEquipmentItemSettingsDraft(
  initialStack?: CharacterInventoryItem | null
): CustomEquipmentItemSettingsDraft {
  const item = getItemForSettings(initialStack);
  const defaultChargesTotal = getDefaultInventoryItemChargesTotal(item);
  const explicitChargesTotal = getInventoryItemExplicitChargesTotal(initialStack);
  const storedSpell = getInventoryItemStoredSpell(initialStack);
  const storedSpellRequiresCharges =
    storedSpell !== null && isChargeConsumingStoredSpellMode(storedSpell.mode);
  const chargesEnabled =
    storedSpellRequiresCharges ||
    (explicitChargesTotal === null
      ? false
      : explicitChargesTotal !== undefined || defaultChargesTotal !== null);
  const conjuredDuration =
    getInventoryItemConjuredDuration(initialStack) ?? INVENTORY_CONJURED_DURATION_DEATH;

  return {
    chargesEnabled,
    chargesTotal:
      typeof explicitChargesTotal === "number"
        ? explicitChargesTotal
        : (defaultChargesTotal ?? 1),
    conjuredEnabled: isConjuredInventoryItem(initialStack),
    conjuredDuration,
    storedSpellEnabled: storedSpell !== null,
    storedSpellId: storedSpell?.spellId ?? "",
    storedSpellSearch: "",
    storedSpellMode: storedSpell?.mode ?? INVENTORY_STORED_SPELL_MODE_DEFAULT,
    storedSpellChargeCost: storedSpell?.chargeCost ?? 1
  };
}

export function parseCustomEquipmentItemSettingsDraft(
  draft: CustomEquipmentItemSettingsDraft,
  initialStack?: CharacterInventoryItem | null
): CustomEquipmentItemSettingsParseResult {
  const item = getItemForSettings(initialStack);
  const defaultChargesTotal = getDefaultInventoryItemChargesTotal(item);
  const storedSpellConsumesCharges =
    draft.storedSpellEnabled && isChargeConsumingStoredSpellMode(draft.storedSpellMode);
  const chargesEnabled = draft.chargesEnabled || storedSpellConsumesCharges;
  const chargesTotal = chargesEnabled
    ? normalizePositiveInteger(draft.chargesTotal, defaultChargesTotal ?? 1)
    : defaultChargesTotal !== null
      ? null
      : undefined;
  const lockedConjured = isCustomEquipmentItemSettingsConjuredLocked(initialStack);
  const currentTags = new Set<CharacterInventoryFeatureTag>(initialStack?.featureTags ?? []);
  const nextTags = new Set(currentTags);
  let conjuredSource = initialStack?.conjuredSource;
  let conjuredDuration = initialStack?.conjuredDuration;

  if (!lockedConjured) {
    if (draft.conjuredEnabled) {
      nextTags.add(INVENTORY_FEATURE_TAG_CONJURED);
      conjuredSource = INVENTORY_CONJURED_SOURCE_MANUAL;
      conjuredDuration = draft.conjuredDuration;
    } else {
      nextTags.delete(INVENTORY_FEATURE_TAG_CONJURED);
      conjuredSource = undefined;
      conjuredDuration = undefined;
    }
  }

  if (draft.storedSpellEnabled && !draft.storedSpellId) {
    return {
      settings: null,
      error: "Choose a stored spell or turn off Spell."
    };
  }

  return {
    settings: {
      chargesTotal,
      storedSpell: draft.storedSpellEnabled
        ? {
            spellId: draft.storedSpellId,
            mode: draft.storedSpellMode,
            chargeCost: normalizePositiveInteger(draft.storedSpellChargeCost, 1)
          }
        : undefined,
      featureTags: getOrderedFeatureTags(nextTags),
      conjuredSource,
      conjuredDuration
    },
    error: null
  };
}
