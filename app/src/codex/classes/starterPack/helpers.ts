import { CURRENCY_TYPE } from "../../entries/enums";
import type {
  StarterPackCurrencyReference,
  StarterPackEquipmentChoice,
  StarterPackItemReference,
  StarterPackPackReference,
  StarterPackSelectedToolReference,
  StarterPackSelection
} from "./type";

export function starterPackItem(
  itemKey: string,
  label: string,
  quantity = 1
): StarterPackItemReference {
  return {
    type: "item",
    itemKey,
    label,
    quantity
  };
}

export function starterPackPack(itemKey: string, label: string): StarterPackPackReference {
  return {
    type: "pack",
    itemKey,
    label
  };
}

export function starterPackCurrency(
  amount: number,
  currency: CURRENCY_TYPE
): StarterPackCurrencyReference {
  return {
    type: "currency",
    amount,
    currency
  };
}

export function starterPackSelectedTool(
  label: string,
  options?: {
    quantity?: number;
    selectionId?: string;
  }
): StarterPackSelectedToolReference {
  return {
    type: "selected-tool",
    label,
    quantity: options?.quantity,
    selectionId: options?.selectionId
  };
}

export function starterPackSelection(
  id: string,
  label: string,
  options?: Partial<Omit<StarterPackSelection, "id" | "label">>
): StarterPackSelection {
  return {
    id,
    label,
    source: options?.source ?? "selectedToolProficiencies",
    filter: options?.filter,
    description: options?.description,
    recommendedValue: options?.recommendedValue
  };
}

export function starterPackChoice(
  ...references: StarterPackEquipmentChoice
): StarterPackEquipmentChoice {
  return references;
}
