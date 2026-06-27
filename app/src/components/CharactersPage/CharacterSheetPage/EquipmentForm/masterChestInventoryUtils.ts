import {
  INVENTORY_OBJECT_LIMIT,
  type InventoryRootTransferBlockReason
} from "../../../../pages/CharactersPage/inventoryItems";

export function getMasterChestTransferBlockTitle(
  reason: InventoryRootTransferBlockReason | null,
  destinationName: string
): string | undefined {
  if (reason === "object-limit") {
    return `${destinationName} limit reached (${INVENTORY_OBJECT_LIMIT}).`;
  }

  return reason === "invalid" ? "This item cannot be moved." : undefined;
}
