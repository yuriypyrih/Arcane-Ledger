import { characterFixture } from "../fixtures/character";
import { describe, expect, it } from "vitest";
import type { ItemRecord } from "../../src/types";
import {
  createCharacterInventoryItem,
  setInventoryItemWornStateById,
  moveOneInventoryItemCopyBetweenRootInventories,
  useInventoryItemChargeById as spendItemCharge,
  resetInventoryItemChargeById
} from "../../src/pages/CharactersPage/inventoryItems";
import { getArmorClassForCharacter } from "../../src/pages/CharactersPage/armor";

const chainMail: ItemRecord = {
  id: "test-chain",
  key: "test-chain",
  name: "Chain Mail",
  category: { key: "heavy-armor", name: "Heavy Armor" },
  armor: {
    category: "heavy",
    ac_base: 16,
    ac_display: "16",
    ac_add_dexmod: false,
    ac_cap_dexmod: 0,
    grants_stealth_disadvantage: true,
    strength_score_required: 13
  }
};
describe("equipment affects the sheet", () => {
  it("wearing armor changes AC, and removing it restores the unarmored formula", () => {
    const character = characterFixture({
      inventoryItems: [createCharacterInventoryItem(chainMail, { id: "chain" })]
    });
    expect(getArmorClassForCharacter(character)).toBe(12);
    const worn = {
      ...character,
      inventoryItems: setInventoryItemWornStateById(character.inventoryItems, "chain", true)
    };
    expect(getArmorClassForCharacter(worn)).toBe(16);
    expect(
      getArmorClassForCharacter({
        ...worn,
        inventoryItems: setInventoryItemWornStateById(worn.inventoryItems, "chain", false)
      })
    ).toBe(12);
  });
  it("moves exactly one copy and preserves item properties", () => {
    const inventory = [
      createCharacterInventoryItem(
        { id: "potion", key: "potion", name: "Healing Potion" },
        { id: "potions", quantity: 3 }
      )
    ];
    const moved = moveOneInventoryItemCopyBetweenRootInventories(inventory, [], "potions");
    expect(moved.blockReason).toBeNull();
    expect(moved.sourceInventoryItems[0].quantity).toBe(2);
    expect(moved.destinationInventoryItems[0]).toMatchObject({
      quantity: 1,
      item: { name: "Healing Potion" }
    });
    expect(inventory[0].quantity).toBe(3);
  });
  it("does not destroy an item when the destination has no capacity", () => {
    const inventory = [createCharacterInventoryItem(chainMail, { id: "chain" })];
    const moved = moveOneInventoryItemCopyBetweenRootInventories(inventory, [], "chain", 0);
    expect(moved.blockReason).toBe("object-limit");
    expect(moved.sourceInventoryItems).toEqual(inventory);
    expect(moved.destinationInventoryItems).toEqual([]);
  });
  it("spends and restores charged equipment within its limits", () => {
    let inventory = [
      createCharacterInventoryItem(
        { id: "wand", key: "wand", name: "Wand" },
        { id: "wand-stack", chargesTotal: 2, usesRemaining: 2 }
      )
    ];
    for (let i = 0; i < 4; i++) inventory = spendItemCharge(inventory, "wand-stack");
    expect(inventory[0].usesRemaining).toBe(0);
    expect(resetInventoryItemChargeById(inventory, "wand-stack")[0].usesRemaining).toBe(1);
  });
});
