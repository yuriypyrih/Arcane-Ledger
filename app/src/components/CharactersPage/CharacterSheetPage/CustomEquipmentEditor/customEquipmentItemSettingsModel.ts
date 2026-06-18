import type {
  CharacterInventoryConjuredDuration,
  CharacterInventoryFeatureTag,
  CharacterInventoryItem,
  CharacterInventorySpellcastingFocusSource,
  CharacterInventoryStoredSpellMode
} from "../../../../types";
import {
  getDefaultInventoryItemChargesTotal,
  getInventoryItemConjuredDuration,
  getInventoryItemConjuredSource,
  getInventoryItemChargesRecharge,
  getInventoryItemExplicitChargesTotal,
  getInventoryItemStoredSpell,
  getInventoryItemStoredSpellIds,
  INVENTORY_CONJURED_DURATION_DEATH,
  INVENTORY_CONJURED_SOURCE_MANUAL,
  INVENTORY_REFILLABLE_LIMIT,
  INVENTORY_STORED_SPELL_LIMIT,
  INVENTORY_FEATURE_TAG_CONJURED,
  INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE,
  INVENTORY_FEATURE_TAG_SPELLCASTING_FOCUS,
  INVENTORY_SPELLCASTING_FOCUS_SOURCE_ARCANE_FIREARM,
  INVENTORY_SPELLCASTING_FOCUS_SOURCE_MANUAL,
  getInventoryItemSpellcastingFocusSources,
  INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES,
  INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES_DESTRUCTIBLE,
  INVENTORY_STORED_SPELL_MODE_DEFAULT,
  isConjuredInventoryItem,
  normalizeInventoryCustomTag,
  type InventoryItemSettingsSavePayload
} from "../../../../pages/CharactersPage/inventoryItems";
import { getEffectiveInventoryItemRecord } from "../../../../pages/CharactersPage/itemMods";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";

export type CustomEquipmentItemSettingsDraft = {
  chargesEnabled: boolean;
  chargesTotal: number;
  chargesRechargeEnabled: boolean;
  chargesRechargeShortRest: number;
  chargesRechargeLongRest: number;
  conjuredEnabled: boolean;
  conjuredDuration: CharacterInventoryConjuredDuration;
  spellcastingFocusEnabled: boolean;
  storedSpellEnabled: boolean;
  storedSpellIds: string[];
  storedSpellSearch: string;
  storedSpellMode: CharacterInventoryStoredSpellMode;
  storedSpellChargeCost: number;
  customTagEnabled: boolean;
  customTag: string;
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

function normalizeRestRechargeAmount(value: unknown, fallback = 0): number {
  return Math.floor(clampNumber(value, 0, INVENTORY_REFILLABLE_LIMIT, fallback));
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

export function normalizeItemSettingRestRechargeAmount(value: unknown, fallback = 0): number {
  return normalizeRestRechargeAmount(value, fallback);
}

const featureTagOrder: CharacterInventoryFeatureTag[] = [
  INVENTORY_FEATURE_TAG_CONJURED,
  INVENTORY_FEATURE_TAG_SPELLCASTING_FOCUS,
  INVENTORY_FEATURE_TAG_PACT_OF_THE_BLADE
];

function getOrderedFeatureTags(tagSet: Set<CharacterInventoryFeatureTag>) {
  return featureTagOrder.filter((tag) => tagSet.has(tag));
}

function getOrderedSpellcastingFocusSources(
  sourceSet: Set<CharacterInventorySpellcastingFocusSource>
): CharacterInventorySpellcastingFocusSource[] {
  const sourceOrder: CharacterInventorySpellcastingFocusSource[] = [
    INVENTORY_SPELLCASTING_FOCUS_SOURCE_MANUAL,
    INVENTORY_SPELLCASTING_FOCUS_SOURCE_ARCANE_FIREARM
  ];

  return sourceOrder.filter((source) => sourceSet.has(source));
}

function normalizeDraftStoredSpellIds(spellIds: string[]): string[] {
  return spellIds.map((spellId) => spellId.trim()).slice(0, INVENTORY_STORED_SPELL_LIMIT);
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
  const chargesRecharge = getInventoryItemChargesRecharge(initialStack);
  const storedSpell = getInventoryItemStoredSpell(initialStack);
  const customTag = normalizeInventoryCustomTag(initialStack?.customTag) ?? "";
  const spellcastingFocusSources = new Set(
    getInventoryItemSpellcastingFocusSources(initialStack)
  );
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
    chargesRechargeEnabled: chargesRecharge !== null,
    chargesRechargeShortRest: chargesRecharge?.shortRest ?? 0,
    chargesRechargeLongRest: chargesRecharge?.longRest ?? 0,
    conjuredEnabled: isConjuredInventoryItem(initialStack),
    conjuredDuration,
    spellcastingFocusEnabled: spellcastingFocusSources.has(
      INVENTORY_SPELLCASTING_FOCUS_SOURCE_MANUAL
    ),
    storedSpellEnabled: storedSpell !== null,
    storedSpellIds: storedSpell ? getInventoryItemStoredSpellIds(initialStack) : [""],
    storedSpellSearch: "",
    storedSpellMode: storedSpell?.mode ?? INVENTORY_STORED_SPELL_MODE_DEFAULT,
    storedSpellChargeCost: storedSpell?.chargeCost ?? 1,
    customTagEnabled: customTag.length > 0,
    customTag
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
  const chargesRecharge =
    chargesEnabled && draft.chargesRechargeEnabled
      ? {
          shortRest: normalizeRestRechargeAmount(draft.chargesRechargeShortRest, 0),
          longRest: normalizeRestRechargeAmount(draft.chargesRechargeLongRest, 0)
        }
      : undefined;
  const lockedConjured = isCustomEquipmentItemSettingsConjuredLocked(initialStack);
  const currentTags = new Set<CharacterInventoryFeatureTag>(initialStack?.featureTags ?? []);
  const nextTags = new Set(currentTags);
  const nextSpellcastingFocusSources = new Set(
    getInventoryItemSpellcastingFocusSources(initialStack)
  );
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

  if (draft.spellcastingFocusEnabled) {
    nextTags.add(INVENTORY_FEATURE_TAG_SPELLCASTING_FOCUS);
    nextSpellcastingFocusSources.add(INVENTORY_SPELLCASTING_FOCUS_SOURCE_MANUAL);
  } else {
    nextSpellcastingFocusSources.delete(INVENTORY_SPELLCASTING_FOCUS_SOURCE_MANUAL);

    if (nextSpellcastingFocusSources.size === 0) {
      nextTags.delete(INVENTORY_FEATURE_TAG_SPELLCASTING_FOCUS);
    }
  }

  const storedSpellIds = normalizeDraftStoredSpellIds(draft.storedSpellIds);

  if (draft.storedSpellEnabled) {
    if (storedSpellIds.length === 0 || storedSpellIds.some((spellId) => spellId.length === 0)) {
      return {
        settings: null,
        error: "Choose a stored spell for each Spell Storing row or turn off Spell Storing."
      };
    }

    if (new Set(storedSpellIds).size !== storedSpellIds.length) {
      return {
        settings: null,
        error: "Choose each stored spell only once."
      };
    }
  }

  const customTag = draft.customTagEnabled
    ? normalizeInventoryCustomTag(draft.customTag)
    : undefined;

  if (draft.customTagEnabled && !customTag) {
    return {
      settings: null,
      error: "Enter a custom tag or turn off Custom Tag."
    };
  }

  return {
    settings: {
      chargesTotal,
      chargesRecharge,
      storedSpell: draft.storedSpellEnabled
        ? {
            spellId: storedSpellIds[0],
            ...(storedSpellIds.length > 1 ? { spellIds: storedSpellIds } : {}),
            mode: draft.storedSpellMode,
            chargeCost: normalizePositiveInteger(draft.storedSpellChargeCost, 1)
          }
        : undefined,
      featureTags: getOrderedFeatureTags(nextTags),
      customTag,
      spellcastingFocusSources: getOrderedSpellcastingFocusSources(
        nextSpellcastingFocusSources
      ),
      conjuredSource,
      conjuredDuration
    },
    error: null
  };
}
