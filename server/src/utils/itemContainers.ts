export const ITEM_CONTAINER_KEYS = [
  "srd-2024_backpack",
  "srd_backpack",
  "srd-2024_chest",
  "srd_chest",
  "srd-2024_bag-of-holding",
  "srd_bag-of-holding"
] as const;

const itemContainerKeySet = new Set<string>(ITEM_CONTAINER_KEYS);

export function isItemContainerKey(key: string | null | undefined): boolean {
  return typeof key === "string" && itemContainerKeySet.has(key);
}
