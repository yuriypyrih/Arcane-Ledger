import type { MasterChestTransactionOperation, PartyGroupMasterChestRecord } from "../../../../api";
import type { CharacterInventoryItem, CurrencyKey } from "../../../../types";
import type { MasterChestDraft } from "./useMasterChestData";

const currencyKeys: CurrencyKey[] = ["copper", "silver", "electrum", "gold", "platinum"];
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.keys(value as Record<string, unknown>)
    .sort()
    .reduce<Record<string, unknown>>((record, key) => {
      record[key] = canonicalize((value as Record<string, unknown>)[key]);
      return record;
    }, {});
}

function getTransferSignature(item: CharacterInventoryItem) {
  const {
    id: _id,
    quantity: _quantity,
    onHandQuantity: _onHandQuantity,
    worn: _worn,
    attuned: _attuned,
    ...transferState
  } = item;

  return JSON.stringify(canonicalize(transferState));
}

function getCounts(items: CharacterInventoryItem[]) {
  return items.reduce<Map<string, number>>((counts, item) => {
    const signature = getTransferSignature(item);
    counts.set(signature, (counts.get(signature) ?? 0) + item.quantity);
    return counts;
  }, new Map());
}

function getSignatures(...inventories: CharacterInventoryItem[][]) {
  return new Set(inventories.flatMap((items) => items.map(getTransferSignature)));
}

function allocateStackQuantities(options: {
  currentItems: CharacterInventoryItem[];
  quantity: number;
  signature: string;
  sourceItems: CharacterInventoryItem[];
}) {
  let remaining = options.quantity;
  const allocatedByStackId = new Map<string, number>();
  const matchingStacks = options.sourceItems.filter(
    (stack) => getTransferSignature(stack) === options.signature
  );

  matchingStacks.forEach((stack) => {
    if (remaining <= 0) {
      return;
    }

    const currentQuantity =
      options.currentItems.find((item) => item.id === stack.id)?.quantity ?? 0;
    const removedQuantity = Math.max(0, stack.quantity - currentQuantity);
    const allocated = Math.min(remaining, removedQuantity);

    if (allocated > 0) {
      allocatedByStackId.set(stack.id, allocated);
      remaining -= allocated;
    }
  });

  matchingStacks.forEach((stack) => {
    if (remaining <= 0) {
      return;
    }

    const alreadyAllocated = allocatedByStackId.get(stack.id) ?? 0;
    const allocated = Math.min(remaining, stack.quantity - alreadyAllocated);

    if (allocated > 0) {
      allocatedByStackId.set(stack.id, alreadyAllocated + allocated);
      remaining -= allocated;
    }
  });

  if (remaining > 0) {
    throw new Error("Unable to identify the original inventory stack for this transfer.");
  }

  return matchingStacks.flatMap((stack) => {
    const quantity = allocatedByStackId.get(stack.id) ?? 0;
    return quantity > 0 ? [{ stack, quantity }] : [];
  });
}

function allocateSourceOperations(options: {
  currentItems: CharacterInventoryItem[];
  direction: "character-to-chest" | "chest-to-character";
  quantity: number;
  signature: string;
  sourceItems: CharacterInventoryItem[];
}) {
  return allocateStackQuantities(options).map(
    ({ stack, quantity }) =>
      ({
        type: "transfer-item",
        direction: options.direction,
        sourceStackId: stack.id,
        quantity
      }) satisfies MasterChestTransactionOperation
  );
}

function assertPlayerInventoryConservation(base: MasterChestDraft, draft: MasterChestDraft) {
  const baseCounts = getCounts([...base.characterInventoryItems, ...base.chestInventoryItems]);
  const draftCounts = getCounts([...draft.characterInventoryItems, ...draft.chestInventoryItems]);
  const signatures = new Set([...baseCounts.keys(), ...draftCounts.keys()]);

  for (const signature of signatures) {
    if ((baseCounts.get(signature) ?? 0) !== (draftCounts.get(signature) ?? 0)) {
      throw new Error("The Master Chest draft contains an invalid item transfer.");
    }
  }

  currencyKeys.forEach((currency) => {
    const baseTotal = base.characterCurrencies[currency] + base.chestCurrencies[currency];
    const draftTotal = draft.characterCurrencies[currency] + draft.chestCurrencies[currency];

    if (baseTotal !== draftTotal) {
      throw new Error("The Master Chest draft contains an invalid currency transfer.");
    }
  });
}

export function buildPlayerMasterChestOperations(
  base: MasterChestDraft,
  draft: MasterChestDraft
): MasterChestTransactionOperation[] {
  assertPlayerInventoryConservation(base, draft);
  const baseChestCounts = getCounts(base.chestInventoryItems);
  const draftChestCounts = getCounts(draft.chestInventoryItems);
  const operations: MasterChestTransactionOperation[] = [];

  getSignatures(base.chestInventoryItems, draft.chestInventoryItems).forEach((signature) => {
    const delta = (draftChestCounts.get(signature) ?? 0) - (baseChestCounts.get(signature) ?? 0);

    if (delta > 0) {
      operations.push(
        ...allocateSourceOperations({
          direction: "character-to-chest",
          currentItems: draft.characterInventoryItems,
          quantity: delta,
          signature,
          sourceItems: base.characterInventoryItems
        })
      );
    } else if (delta < 0) {
      operations.push(
        ...allocateSourceOperations({
          direction: "chest-to-character",
          currentItems: draft.chestInventoryItems,
          quantity: Math.abs(delta),
          signature,
          sourceItems: base.chestInventoryItems
        })
      );
    }
  });

  currencyKeys.forEach((currency) => {
    const delta = draft.chestCurrencies[currency] - base.chestCurrencies[currency];

    if (delta !== 0) {
      operations.push({
        type: "transfer-currency",
        direction: delta > 0 ? "character-to-chest" : "chest-to-character",
        currency,
        amount: Math.abs(delta)
      });
    }
  });

  return operations;
}

function allocateGmRemovalOperations(options: {
  currentItems: CharacterInventoryItem[];
  quantity: number;
  signature: string;
  sourceItems: CharacterInventoryItem[];
}) {
  return allocateStackQuantities(options).map(
    ({ stack, quantity }) =>
      ({
        type: "remove-item",
        sourceStackId: stack.id,
        quantity
      }) satisfies MasterChestTransactionOperation
  );
}

function createGmAddedItem(items: CharacterInventoryItem[], signature: string, quantity: number) {
  const source = items.find((item) => getTransferSignature(item) === signature);

  if (!source) {
    throw new Error("Unable to identify the item added to the Master Chest.");
  }

  return {
    ...source,
    quantity,
    onHandQuantity: 0,
    worn: false,
    attuned: false
  };
}

export function buildGmMasterChestOperations(
  base: Pick<PartyGroupMasterChestRecord, "currencies" | "inventoryItems">,
  draft: MasterChestDraft
): MasterChestTransactionOperation[] {
  const baseCounts = getCounts(base.inventoryItems);
  const draftCounts = getCounts(draft.chestInventoryItems);
  const operations: MasterChestTransactionOperation[] = [];

  getSignatures(base.inventoryItems, draft.chestInventoryItems).forEach((signature) => {
    const delta = (draftCounts.get(signature) ?? 0) - (baseCounts.get(signature) ?? 0);

    if (delta > 0) {
      operations.push({
        type: "add-item",
        item: createGmAddedItem(draft.chestInventoryItems, signature, delta)
      });
    } else if (delta < 0) {
      operations.push(
        ...allocateGmRemovalOperations({
          quantity: Math.abs(delta),
          signature,
          currentItems: draft.chestInventoryItems,
          sourceItems: base.inventoryItems
        })
      );
    }
  });

  currencyKeys.forEach((currency) => {
    const delta = draft.chestCurrencies[currency] - base.currencies[currency];

    if (delta !== 0) {
      operations.push({ type: "adjust-currency", currency, delta });
    }
  });

  return operations;
}

export function createBaseMasterChestRecord(
  draft: MasterChestDraft,
  revision: number,
  history: string[]
): PartyGroupMasterChestRecord {
  return {
    partyGroupId: "",
    revision,
    inventoryItems: draft.chestInventoryItems,
    currencies: draft.chestCurrencies,
    history
  };
}
