import type {
  CharacterInventoryChargesRecharge,
  CharacterInventoryConjuredDuration,
  CharacterInventoryConjuredSource,
  CharacterInventoryFeatureTag,
  CharacterInventorySpellcastingFocusSource,
  CharacterInventoryStoredSpell,
  CharacterItemMods,
  CharacterReplicateMagicItemSlot,
  ItemRecord
} from "../types";
import { apiDelete, apiGet, apiPost, apiPut, type ApiRequestOptions } from "./client";

export type CustomItemSettings = {
  chargesRecharge?: CharacterInventoryChargesRecharge;
  chargesTotal?: number | null;
  conjuredDuration?: CharacterInventoryConjuredDuration;
  conjuredSource?: CharacterInventoryConjuredSource;
  customTag?: string;
  featureTags?: CharacterInventoryFeatureTag[];
  replicateMagicItemPlanKey?: string;
  replicateMagicItemSlot?: CharacterReplicateMagicItemSlot;
  spellcastingFocusSources?: CharacterInventorySpellcastingFocusSource[];
  storedSpell?: CharacterInventoryStoredSpell;
};

export type CustomItemRecord = {
  id: string;
  ownerId: string;
  ownerNickname: string | null;
  public: boolean;
  item: ItemRecord;
  mods: CharacterItemMods;
  settings: CustomItemSettings;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CustomItemInput = {
  item: ItemRecord;
  mods: CharacterItemMods;
  public?: boolean;
  settings: CustomItemSettings;
};

export type CustomItemListEnvelope = {
  customItems: CustomItemRecord[];
};

export type CustomItemEnvelope = {
  customItem: CustomItemRecord;
};

export type CustomItemDeleteEnvelope = {
  customItemId: string;
};

export type CustomItemListScope = "mine" | "public";

export type CustomItemListOptions = ApiRequestOptions & {
  scope?: CustomItemListScope;
};

export function listCustomItems(options?: CustomItemListOptions) {
  const { scope = "mine", ...requestOptions } = options ?? {};
  const path = scope === "public" ? "/custom-items?scope=public" : "/custom-items";

  return apiGet<CustomItemListEnvelope>(path, requestOptions);
}

export function createCustomItem(input: CustomItemInput, options?: ApiRequestOptions) {
  return apiPost<CustomItemEnvelope>("/custom-items", input, options);
}

export function updateCustomItem(
  customItemId: string,
  input: CustomItemInput,
  options?: ApiRequestOptions
) {
  return apiPut<CustomItemEnvelope>(`/custom-items/${customItemId}`, input, options);
}

export function deleteCustomItem(customItemId: string, options?: ApiRequestOptions) {
  return apiDelete<CustomItemDeleteEnvelope>(`/custom-items/${customItemId}`, options);
}
