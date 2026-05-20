import type { ItemSpecialFilter } from "../types/item.js";

export const ALLOWED_ITEM_SPECIAL_FILTERS = new Set<ItemSpecialFilter>(["TinkersMagic"]);

const tinkersMagicItemKeys = [
  "srd-2024_ball-bearings",
  "srd-2024_basket",
  "srd-2024_bedroll",
  "srd-2024_bell",
  "srd-2024_blanket",
  "srd-2024_block-and-tackle",
  "srd-2024_bottle-glass",
  "srd-2024_bucket",
  "srd-2024_caltrops",
  "srd-2024_candle",
  "srd-2024_crowbar",
  "srd-2024_flask",
  "srd-2024_grappling-hook",
  "srd-2024_hunting-trap",
  "srd-2024_jug",
  "srd-2024_lamp",
  "srd-2024_manacles",
  "srd-2024_net",
  "srd-2024_oil",
  "srd-2024_paper",
  "srd-2024_parchment",
  "srd-2024_pole",
  "srd-2024_pouch",
  "srd-2024_rope",
  "srd-2024_sack",
  "srd-2024_shovel",
  "srd-2024_spikes-iron",
  "srd-2024_string",
  "srd-2024_tinderbox",
  "srd-2024_torch",
  "srd-2024_vial"
] as const;

export function getItemSpecialFilterKeys(
  specialFilter: ItemSpecialFilter | undefined
): readonly string[] {
  if (specialFilter === "TinkersMagic") {
    return tinkersMagicItemKeys;
  }

  return [];
}
