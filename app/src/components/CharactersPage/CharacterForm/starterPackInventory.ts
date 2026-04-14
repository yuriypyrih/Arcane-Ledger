import {
  getStarterPackToolItemMapping,
  type StarterPackEquipmentChoice
} from "../../../codex/classes/starterPack";
import { fetchItemByKey, fetchItemPackContents } from "../../../api/items";
import type { CharacterInventoryItem } from "../../../types";
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

function getMissingPackReferenceWarnings(
  label: string,
  missingReferences: Array<{
    name: string;
    quantity: number;
  }>
): string[] {
  return missingReferences.map((reference) => {
    const quantityPrefix = reference.quantity > 1 ? `${reference.quantity} ` : "";
    return `${label} is missing ${quantityPrefix}${reference.name} in the backend pack contents.`;
  });
}

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
  const { requests, warnings } = resolveStarterPackRequests(choice, context);
  const previewWarnings = [...warnings];

  for (const request of requests) {
    if (request.type !== "pack") {
      continue;
    }

    try {
      const packContents = await fetchItemPackContents(request.itemKey);
      previewWarnings.push(
        ...getMissingPackReferenceWarnings(request.label, packContents.missingReferences)
      );
    } catch {
      previewWarnings.push(
        `Couldn't preview ${request.label} contents from the backend. Character creation will still continue without unresolved items.`
      );
    }
  }

  return [...new Set(previewWarnings)];
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

  for (const request of requests) {
    if (request.type === "item") {
      try {
        const item = await fetchItemByKey(request.itemKey);
        nextInventoryItems = addInventoryItemCopies(nextInventoryItems, item, request.quantity);
      } catch {
        nextWarnings.push(
          `Couldn't fetch ${request.label} from the backend, so it was skipped during character creation.`
        );
      }

      continue;
    }

    try {
      const packContents = await fetchItemPackContents(request.itemKey);
      nextWarnings.push(
        ...getMissingPackReferenceWarnings(request.label, packContents.missingReferences)
      );
      packContents.contents.forEach((entry) => {
        nextInventoryItems = addInventoryItemCopies(
          nextInventoryItems,
          entry.item,
          entry.quantity
        );
      });
    } catch {
      nextWarnings.push(
        `Couldn't fetch ${request.label} contents from the backend, so that pack was skipped during character creation.`
      );
    }
  }

  return {
    inventoryItems: nextInventoryItems,
    warnings: [...new Set(nextWarnings)]
  };
}
