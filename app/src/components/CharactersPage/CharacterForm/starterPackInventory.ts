import {
  getStarterPackToolItemMapping,
  type StarterPackEquipmentChoice
} from "../../../codex/classes/starterPack";
import { fetchItemsByKeys } from "../../../api/items";
import type { CharacterInventoryItem, ItemRecord } from "../../../types";
import { addInventoryItemCopies } from "../../../pages/CharactersPage/inventoryItems";

type StarterPackResolutionContext = {
  selectedToolProficiencies: string[];
  selectionValues: Record<string, string>;
};

type ResolvedStarterPackRequest =
  | {
      type: "item";
      itemKey: string;
      label: string;
      quantity: number;
    }
  | {
      type: "pack";
      itemKey: string;
      label: string;
    };

function resolveSelectedToolItemRequest(
  reference: Extract<
    StarterPackEquipmentChoice[number],
    {
      type: "selected-tool";
    }
  >,
  context: StarterPackResolutionContext
): { request: ResolvedStarterPackRequest | null; warnings: string[] } {
  const selectedTool =
    (reference.selectionId ? context.selectionValues[reference.selectionId] : null) ??
    context.selectedToolProficiencies[0] ??
    null;

  if (!selectedTool) {
    return {
      request: null,
      warnings: []
    };
  }

  const mapping = getStarterPackToolItemMapping(selectedTool);

  if (!mapping?.itemKey) {
    return {
      request: null,
      warnings: [mapping?.warning ?? `Backend item missing for ${reference.label}.`]
    };
  }

  return {
    request: {
      type: "item",
      itemKey: mapping.itemKey,
      label: mapping.label,
      quantity: reference.quantity ?? 1
    },
    warnings: []
  };
}

function resolveStarterPackRequests(
  choice: StarterPackEquipmentChoice | null,
  context: StarterPackResolutionContext
): { requests: ResolvedStarterPackRequest[]; warnings: string[] } {
  if (!choice) {
    return {
      requests: [],
      warnings: []
    };
  }

  return choice.reduce<{ requests: ResolvedStarterPackRequest[]; warnings: string[] }>(
    (resolved, reference) => {
      if (reference.type === "currency") {
        return resolved;
      }

      if (reference.type === "item") {
        return {
          requests: [
            ...resolved.requests,
            {
              type: "item",
              itemKey: reference.itemKey,
              label: reference.label,
              quantity: reference.quantity ?? 1
            }
          ],
          warnings: resolved.warnings
        };
      }

      if (reference.type === "pack") {
        return {
          requests: [
            ...resolved.requests,
            {
              type: "pack",
              itemKey: reference.itemKey,
              label: reference.label
            }
          ],
          warnings: resolved.warnings
        };
      }

      const selectedToolResolution = resolveSelectedToolItemRequest(reference, context);

      return {
        requests: selectedToolResolution.request
          ? [...resolved.requests, selectedToolResolution.request]
          : resolved.requests,
        warnings: [...resolved.warnings, ...selectedToolResolution.warnings]
      };
    },
    {
      requests: [],
      warnings: []
    }
  );
}

export async function previewStarterPackChoiceWarnings(
  choice: StarterPackEquipmentChoice | null,
  context: StarterPackResolutionContext
): Promise<string[]> {
  const { warnings } = resolveStarterPackRequests(choice, context);
  return [...new Set(warnings)];
}

export async function materializeStarterPackChoiceToInventory(
  inventoryItems: CharacterInventoryItem[],
  choice: StarterPackEquipmentChoice | null,
  context: StarterPackResolutionContext
): Promise<{
  inventoryItems: CharacterInventoryItem[];
  warnings: string[];
}> {
  const { requests, warnings } = resolveStarterPackRequests(choice, context);
  let nextInventoryItems = [...inventoryItems];
  const nextWarnings = [...warnings];
  const requestKeys = [...new Set(requests.map((request) => request.itemKey))];

  if (requestKeys.length === 0) {
    return {
      inventoryItems: nextInventoryItems,
      warnings: [...new Set(nextWarnings)]
    };
  }

  let itemsByKey = new Map<string, ItemRecord>();

  try {
    const payload = await fetchItemsByKeys(requestKeys);

    itemsByKey = new Map(
      payload.items
        .filter((item): item is ItemRecord & { key: string } => typeof item.key === "string")
        .map((item) => [item.key, item])
    );

    if (payload.message) {
      nextWarnings.push(payload.message);
    }
  } catch {
    nextWarnings.push(
      "Couldn't fetch starter equipment from the backend, so it was skipped during character creation."
    );

    return {
      inventoryItems: nextInventoryItems,
      warnings: [...new Set(nextWarnings)]
    };
  }

  for (const request of requests) {
    const item = itemsByKey.get(request.itemKey);

    if (!item) {
      nextWarnings.push(
        `Couldn't fetch ${request.label} from the backend, so it was skipped during character creation.`
      );
      continue;
    }

    nextInventoryItems = addInventoryItemCopies(
      nextInventoryItems,
      item,
      request.type === "item" ? request.quantity : 1
    );
  }

  return {
    inventoryItems: nextInventoryItems,
    warnings: [...new Set(nextWarnings)]
  };
}
