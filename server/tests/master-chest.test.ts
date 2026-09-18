import { describe, expect, it } from "vitest";
import {
  applyMasterChestOperations,
  normalizeMasterChestOperationCurrencies
} from "../src/services/masterChestInventory";
function state() {
  return {
    isGm: false,
    chestInventoryItems: [],
    characterInventoryItems: [],
    chestCurrencies: normalizeMasterChestOperationCurrencies({ gold: 10 }),
    characterCurrencies: normalizeMasterChestOperationCurrencies({ gold: 4 })
  };
}
describe("Master Chest operation rules", () => {
  it("transfers currency conservatively without mutating the input", () => {
    const initial = state();
    const result = applyMasterChestOperations({
      ...initial,
      operations: [
        { type: "transfer-currency", direction: "chest-to-character", currency: "gold", amount: 6 }
      ]
    });
    expect(result.chestCurrencies.gold).toBe(4);
    expect(result.characterCurrencies.gold).toBe(10);
    expect(initial.chestCurrencies.gold).toBe(10);
  });
  it("rejects a stale request that exceeds the current balance", () => {
    expect(() =>
      applyMasterChestOperations({
        ...state(),
        operations: [
          {
            type: "transfer-currency",
            direction: "chest-to-character",
            currency: "gold",
            amount: 11
          }
        ]
      })
    ).toThrow(
      expect.objectContaining({
        statusCode: 409,
        code: "MASTER_CHEST_OPERATION_CONFLICT",
        details: expect.objectContaining({ reason: "insufficient_currency", operationIndex: 0 })
      })
    );
  });
  it("leaves the original state intact when a later operation in the batch conflicts", () => {
    const initial = state();
    expect(() =>
      applyMasterChestOperations({
        ...initial,
        operations: [
          {
            type: "transfer-currency",
            direction: "chest-to-character",
            currency: "gold",
            amount: 6
          },
          {
            type: "transfer-item",
            direction: "chest-to-character",
            sourceStackId: "no-longer-present",
            quantity: 1
          }
        ]
      })
    ).toThrow(
      expect.objectContaining({
        statusCode: 409,
        code: "MASTER_CHEST_OPERATION_CONFLICT",
        details: expect.objectContaining({ reason: "source_missing", operationIndex: 1 })
      })
    );
    expect(initial.chestCurrencies.gold).toBe(10);
    expect(initial.characterCurrencies.gold).toBe(4);
  });
  it("does not allow players to mint chest currency", () => {
    expect(() =>
      applyMasterChestOperations({
        ...state(),
        operations: [{ type: "adjust-currency", currency: "gold", delta: 100 }]
      })
    ).toThrow(
      expect.objectContaining({ statusCode: 403, code: "MASTER_CHEST_GM_OPERATION_FORBIDDEN" })
    );
  });
});

it("moves item quantities in both directions without losing custom properties", () => {
  const item = {
    id: "potions",
    item: { id: "potion", name: "Healing Potion" },
    quantity: 3,
    onHandQuantity: 0,
    worn: false,
    customTag: "Party supplies"
  };
  const initial = { ...state(), chestInventoryItems: [item] };
  const withdrawn = applyMasterChestOperations({
    ...initial,
    operations: [
      {
        type: "transfer-item",
        direction: "chest-to-character",
        sourceStackId: "potions",
        quantity: 2
      }
    ]
  });
  expect(withdrawn.chestInventoryItems).toEqual([expect.objectContaining({ quantity: 1 })]);
  expect(withdrawn.characterInventoryItems).toHaveLength(1);
  const transferredItem = withdrawn.characterInventoryItems[0];
  if (!transferredItem) throw new Error("The item was not transferred to the character");
  expect(transferredItem).toMatchObject({
    quantity: 2,
    customTag: "Party supplies",
    item: { name: "Healing Potion" }
  });
  const deposited = applyMasterChestOperations({
    ...initial,
    ...withdrawn,
    operations: [
      {
        type: "transfer-item",
        direction: "character-to-chest",
        sourceStackId: transferredItem.id,
        quantity: 2
      }
    ]
  });
  expect(deposited.characterInventoryItems).toEqual([]);
  expect(deposited.chestInventoryItems.reduce((sum, stack) => sum + stack.quantity, 0)).toBe(3);
  expect(item.quantity).toBe(3);
});
it("insufficient item quantity identifies the conflict and preserves both inventories", () => {
  const item = {
    id: "wand",
    item: { id: "wand", name: "Wand" },
    quantity: 1,
    onHandQuantity: 0,
    worn: false
  };
  const initial = { ...state(), characterInventoryItems: [item] };
  expect(() =>
    applyMasterChestOperations({
      ...initial,
      operations: [
        {
          type: "transfer-item",
          direction: "character-to-chest",
          sourceStackId: "wand",
          quantity: 2
        }
      ]
    })
  ).toThrow(
    expect.objectContaining({
      code: "MASTER_CHEST_OPERATION_CONFLICT",
      details: expect.objectContaining({ reason: "insufficient_quantity", operationIndex: 0 })
    })
  );
  expect(initial.characterInventoryItems).toEqual([item]);
  expect(initial.chestInventoryItems).toEqual([]);
});
it("allows an authorized GM to adjust currency without changing character balances", () => {
  const result = applyMasterChestOperations({
    ...state(),
    isGm: true,
    operations: [{ type: "adjust-currency", currency: "gold", delta: 7 }]
  });
  expect(result.chestCurrencies.gold).toBe(17);
  expect(result.characterCurrencies.gold).toBe(4);
});
