import crypto from "node:crypto";
import { AppError } from "../errors/AppError.js";
import { isItemContainerKey } from "../utils/itemContainers.js";

export type MasterChestCurrencyKey = "copper" | "silver" | "electrum" | "gold" | "platinum";

export type MasterChestCurrencies = Record<MasterChestCurrencyKey, number>;

export type MasterChestInventoryItem = Record<string, unknown> & {
  id: string;
  item: Record<string, unknown>;
  quantity: number;
  onHandQuantity: number;
  worn: boolean;
};

export type MasterChestOperationInput =
  | {
      type: "transfer-item";
      direction: "character-to-chest" | "chest-to-character";
      sourceStackId: string;
      quantity: number;
    }
  | {
      type: "transfer-currency";
      direction: "character-to-chest" | "chest-to-character";
      currency: MasterChestCurrencyKey;
      amount: number;
    }
  | {
      type: "add-item";
      item: MasterChestInventoryItem;
    }
  | {
      type: "remove-item";
      sourceStackId: string;
      quantity: number;
    }
  | {
      type: "adjust-currency";
      currency: MasterChestCurrencyKey;
      delta: number;
    };

export type MasterChestOperationConflictReason =
  | "source_missing"
  | "insufficient_quantity"
  | "insufficient_currency";

const currencyKeys: MasterChestCurrencyKey[] = ["copper", "silver", "electrum", "gold", "platinum"];

const currencyCodes: Record<MasterChestCurrencyKey, string> = {
  copper: "CP",
  silver: "SP",
  electrum: "EP",
  gold: "GP",
  platinum: "PP"
};

const separateStackFields = [
  "mods",
  "usesRemaining",
  "chargesTotal",
  "chargesRecharge",
  "storedSpell",
  "featureTags",
  "customTag",
  "spellcastingFocusSources",
  "conjuredSource",
  "conjuredDuration",
  "replicateMagicItemPlanKey",
  "replicateMagicItemSlot",
  "containerContents"
] as const;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPositiveInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

function readInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function readRequiredString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

function readInventoryItem(value: unknown): MasterChestInventoryItem {
  if (!isObjectRecord(value)) {
    throw new AppError(
      "Master chest operation item is invalid.",
      400,
      "INVALID_MASTER_CHEST_OPERATION_INPUT"
    );
  }

  const id = readRequiredString(value.id);
  const quantity = readPositiveInteger(value.quantity);
  const onHandQuantity = readInteger(value.onHandQuantity);

  if (
    !id ||
    !isObjectRecord(value.item) ||
    !quantity ||
    onHandQuantity === null ||
    onHandQuantity < 0 ||
    onHandQuantity > quantity ||
    typeof value.worn !== "boolean"
  ) {
    throw new AppError(
      "Master chest operation item is invalid.",
      400,
      "INVALID_MASTER_CHEST_OPERATION_INPUT"
    );
  }

  return cloneValue(value) as MasterChestInventoryItem;
}

export function normalizeMasterChestInventory(value: unknown): MasterChestInventoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(readInventoryItem);
}

export function normalizeMasterChestOperationCurrencies(value: unknown): MasterChestCurrencies {
  const source = isObjectRecord(value) ? value : {};

  return currencyKeys.reduce<MasterChestCurrencies>(
    (currencies, key) => ({
      ...currencies,
      [key]: Math.max(0, readInteger(source[key]) ?? 0)
    }),
    {
      copper: 0,
      silver: 0,
      electrum: 0,
      gold: 0,
      platinum: 0
    }
  );
}

function hasSeparateStackState(item: MasterChestInventoryItem) {
  return (
    isItemContainerKey(getItemKey(item)) ||
    Array.isArray(item.item.containerContents) ||
    separateStackFields.some((field) => {
      const value = item[field];

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return value !== undefined && value !== null && value !== "";
    })
  );
}

function getItemKey(item: MasterChestInventoryItem) {
  return readRequiredString(item.item.key);
}

function createMovedStack(source: MasterChestInventoryItem, quantity: number) {
  return {
    ...cloneValue(source),
    id: crypto.randomUUID(),
    quantity,
    onHandQuantity: 0,
    worn: false,
    attuned: false
  } satisfies MasterChestInventoryItem;
}

function removeQuantityFromStack(
  inventory: MasterChestInventoryItem[],
  stackIndex: number,
  quantity: number
) {
  const source = inventory[stackIndex];

  if (!source) {
    return inventory;
  }

  if (source.quantity === quantity) {
    return inventory.filter((_, index) => index !== stackIndex);
  }

  const next = [...inventory];
  next[stackIndex] = {
    ...source,
    quantity: source.quantity - quantity,
    onHandQuantity: Math.min(source.onHandQuantity, source.quantity - quantity),
    worn: source.quantity - quantity > 0 ? source.worn : false
  };
  return next;
}

function addStackToInventory(
  inventory: MasterChestInventoryItem[],
  movedStack: MasterChestInventoryItem
) {
  const itemKey = getItemKey(movedStack);

  if (itemKey && !hasSeparateStackState(movedStack)) {
    const existingIndex = inventory.findIndex(
      (entry) => getItemKey(entry) === itemKey && !hasSeparateStackState(entry)
    );

    if (existingIndex >= 0) {
      const existing = inventory[existingIndex];

      if (existing) {
        const next = [...inventory];
        next[existingIndex] = {
          ...existing,
          quantity: existing.quantity + movedStack.quantity
        };
        return next;
      }
    }
  }

  return [...inventory, movedStack];
}

function createConflict(
  operationIndex: number,
  operation: MasterChestOperationInput,
  reason: MasterChestOperationConflictReason,
  details: Record<string, unknown>
): never {
  throw new AppError(
    "The Master Chest changed and this operation can no longer be completed.",
    409,
    "MASTER_CHEST_OPERATION_CONFLICT",
    {
      operationIndex,
      operationType: operation.type,
      reason,
      ...details
    }
  );
}

function transferItem(options: {
  destination: MasterChestInventoryItem[];
  operation: MasterChestOperationInput;
  operationIndex: number;
  quantity: number;
  source: MasterChestInventoryItem[];
  sourceStackId: string;
}) {
  const sourceIndex = options.source.findIndex((entry) => entry.id === options.sourceStackId);
  const sourceStack = options.source[sourceIndex];

  if (!sourceStack) {
    createConflict(options.operationIndex, options.operation, "source_missing", {
      stackId: options.sourceStackId,
      requested: options.quantity,
      available: 0
    });
  }

  if (sourceStack.quantity < options.quantity) {
    createConflict(options.operationIndex, options.operation, "insufficient_quantity", {
      stackId: options.sourceStackId,
      requested: options.quantity,
      available: sourceStack.quantity
    });
  }

  const movedStack = createMovedStack(sourceStack, options.quantity);

  return {
    destination: addStackToInventory(options.destination, movedStack),
    source: removeQuantityFromStack(options.source, sourceIndex, options.quantity),
    itemName: readRequiredString(sourceStack.item.name) ?? "Item"
  };
}

function applyCurrencyTransfer(options: {
  amount: number;
  currency: MasterChestCurrencyKey;
  destination: MasterChestCurrencies;
  operation: MasterChestOperationInput;
  operationIndex: number;
  source: MasterChestCurrencies;
}) {
  const available = options.source[options.currency];

  if (available < options.amount) {
    createConflict(options.operationIndex, options.operation, "insufficient_currency", {
      currency: options.currency,
      requested: options.amount,
      available
    });
  }

  return {
    destination: {
      ...options.destination,
      [options.currency]: options.destination[options.currency] + options.amount
    },
    source: {
      ...options.source,
      [options.currency]: available - options.amount
    }
  };
}

export type AppliedMasterChestState = {
  chestCurrencies: MasterChestCurrencies;
  chestInventoryItems: MasterChestInventoryItem[];
  characterCurrencies: MasterChestCurrencies;
  characterInventoryItems: MasterChestInventoryItem[];
  historyActions: string[];
};

export function applyMasterChestOperations(options: {
  chestCurrencies: MasterChestCurrencies;
  chestInventoryItems: MasterChestInventoryItem[];
  characterCurrencies?: MasterChestCurrencies;
  characterInventoryItems?: MasterChestInventoryItem[];
  isGm: boolean;
  operations: MasterChestOperationInput[];
}): AppliedMasterChestState {
  let chestCurrencies = cloneValue(options.chestCurrencies);
  let chestInventoryItems = cloneValue(options.chestInventoryItems);
  let characterCurrencies = cloneValue(
    options.characterCurrencies ?? normalizeMasterChestOperationCurrencies(null)
  );
  let characterInventoryItems = cloneValue(options.characterInventoryItems ?? []);
  const historyActions: string[] = [];

  options.operations.forEach((operation, operationIndex) => {
    if (operation.type === "transfer-item") {
      if (options.isGm) {
        throw new AppError(
          "GM Master Chest transactions cannot include player transfers.",
          400,
          "INVALID_MASTER_CHEST_OPERATION_INPUT"
        );
      }

      const result =
        operation.direction === "character-to-chest"
          ? transferItem({
              source: characterInventoryItems,
              destination: chestInventoryItems,
              sourceStackId: operation.sourceStackId,
              quantity: operation.quantity,
              operation,
              operationIndex
            })
          : transferItem({
              source: chestInventoryItems,
              destination: characterInventoryItems,
              sourceStackId: operation.sourceStackId,
              quantity: operation.quantity,
              operation,
              operationIndex
            });

      if (operation.direction === "character-to-chest") {
        characterInventoryItems = result.source;
        chestInventoryItems = result.destination;
        historyActions.push(`Transferred-in (x${operation.quantity} ${result.itemName})`);
      } else {
        chestInventoryItems = result.source;
        characterInventoryItems = result.destination;
        historyActions.push(`Transferred-out (x${operation.quantity} ${result.itemName})`);
      }
      return;
    }

    if (operation.type === "transfer-currency") {
      if (options.isGm) {
        throw new AppError(
          "GM Master Chest transactions cannot include player transfers.",
          400,
          "INVALID_MASTER_CHEST_OPERATION_INPUT"
        );
      }

      const result =
        operation.direction === "character-to-chest"
          ? applyCurrencyTransfer({
              source: characterCurrencies,
              destination: chestCurrencies,
              currency: operation.currency,
              amount: operation.amount,
              operation,
              operationIndex
            })
          : applyCurrencyTransfer({
              source: chestCurrencies,
              destination: characterCurrencies,
              currency: operation.currency,
              amount: operation.amount,
              operation,
              operationIndex
            });

      if (operation.direction === "character-to-chest") {
        characterCurrencies = result.source;
        chestCurrencies = result.destination;
        historyActions.push(`Deposit (${operation.amount}${currencyCodes[operation.currency]})`);
      } else {
        chestCurrencies = result.source;
        characterCurrencies = result.destination;
        historyActions.push(`Withdraw (${operation.amount}${currencyCodes[operation.currency]})`);
      }
      return;
    }

    if (!options.isGm) {
      throw new AppError(
        "Only a party owner or administrator can perform GM Master Chest operations.",
        403,
        "MASTER_CHEST_GM_OPERATION_FORBIDDEN"
      );
    }

    if (operation.type === "add-item") {
      const item = readInventoryItem(operation.item);
      chestInventoryItems = addStackToInventory(
        chestInventoryItems,
        createMovedStack(item, item.quantity)
      );
      historyActions.push(
        `Transferred-in (x${item.quantity} ${readRequiredString(item.item.name) ?? "Item"})`
      );
      return;
    }

    if (operation.type === "remove-item") {
      const result = transferItem({
        source: chestInventoryItems,
        destination: [],
        sourceStackId: operation.sourceStackId,
        quantity: operation.quantity,
        operation,
        operationIndex
      });
      chestInventoryItems = result.source;
      historyActions.push(`Transferred-out (x${operation.quantity} ${result.itemName})`);
      return;
    }

    const nextCurrencyAmount = chestCurrencies[operation.currency] + operation.delta;

    if (nextCurrencyAmount < 0) {
      createConflict(operationIndex, operation, "insufficient_currency", {
        currency: operation.currency,
        requested: Math.abs(operation.delta),
        available: chestCurrencies[operation.currency]
      });
    }

    chestCurrencies = {
      ...chestCurrencies,
      [operation.currency]: nextCurrencyAmount
    };
    historyActions.push(
      `${operation.delta >= 0 ? "Deposit" : "Withdraw"} (${Math.abs(operation.delta)}${currencyCodes[operation.currency]})`
    );
  });

  return {
    chestCurrencies,
    chestInventoryItems,
    characterCurrencies,
    characterInventoryItems,
    historyActions
  };
}

export function isMasterChestCurrencyKey(value: unknown): value is MasterChestCurrencyKey {
  return currencyKeys.includes(value as MasterChestCurrencyKey);
}
