/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Dispatch, SetStateAction } from "react";
import type { ArmorEntry, ItemEntry, WeaponEntry } from "../../../../codex/entries";
import type {
  Character,
  CharacterCurrencies,
  CharacterInventoryItem,
  CurrencyKey,
  ItemRecord
} from "../../../../types";
import type { GroupedInventoryItem } from "../../../../pages/CharactersPage/inventoryItems";
import type { ResolvedCustomLoadoutEntry } from "../../../../pages/CharactersPage/customEquipment";
import type {
  EquipmentRenderGroup,
  LoadoutDrawerEntry,
  LoadoutGroupItem
} from "./equipmentLoadoutModel";
import type { RarityPillValue } from "../../../CodexPage/RarityPill";

export type EquipmentCurrencyDefinition = {
  key: CurrencyKey;
  label: string;
  code: string;
  icon: string;
};

export type EquipmentSelectedLoadoutEntry = {
  entry: LoadoutDrawerEntry;
  customEquipmentId?: string;
  featureManagedSource?: string;
  featureTags?: string[];
  summaryText?: string;
  origin: "loadout";
};

export type EquipmentFormRendererContext = Record<string, any> & {
  activeCurrencyDefinition: EquipmentCurrencyDefinition;
  activeCurrencyKey: CurrencyKey;
  containerManagementInventoryItems: CharacterInventoryItem[];
  currencyDefinitions: EquipmentCurrencyDefinition[];
  currencyAmountDraft: number;
  equipmentCharacter: Character;
  equipmentRenderGroups: EquipmentRenderGroup[];
  groupedInventoryItems: GroupedInventoryItem[];
  normalizedCurrencies: CharacterCurrencies;
  selectedInventoryRecord: ItemRecord | null;
  selectedLoadoutEntry: EquipmentSelectedLoadoutEntry | null;
  selectedLoadoutEntryData:
    | ArmorEntry
    | ItemEntry
    | WeaponEntry
    | ResolvedCustomLoadoutEntry
    | null;
  selectedLoadoutItems: LoadoutGroupItem[];
  getArcaneArmorFeatureTagsForInventoryStack: (
    stack: CharacterInventoryItem,
    item: ItemRecord | null | undefined,
    options?: { includeModel?: boolean }
  ) => string[];
  getInventoryItemFeatureTagLabels: (
    stack: CharacterInventoryItem,
    options?: { excludeConjured?: boolean }
  ) => string[];
  getInventoryTagPillProps: (tagLabel: string) => Record<string, unknown>;
  hasDisplayableRarity: (rarity: RarityPillValue) => boolean;
  isHandEquippableEntry: (entry: LoadoutDrawerEntry) => boolean;
  openLoadoutEntryDetails: (entry: LoadoutGroupItem) => void;
  openInventoryInspectionFromLoadout: (entry: GroupedInventoryItem) => void;
  setCurrencyAmountDraft: Dispatch<SetStateAction<number>>;
  setIsGeneralEquipmentExpanded: Dispatch<SetStateAction<boolean>>;
};
