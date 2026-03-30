import { CURRENCY_TYPE, ENTRY_CATEGORIES, ITEM_TYPES } from "./enums";
import type { ItemEntry } from "./types";

export const itemEntries: ItemEntry[] = [
  {
    id: "item-thieves-toolkit",
    name: "Thieve's Toolkit",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.TOOLKIT],
    weight: 1,
    cost: { amount: 25, currency: CURRENCY_TYPE.GP },
    summary: "Compact lock and trap tools for stealthy infiltration jobs."
  },
  {
    id: "item-disarm-toolkit",
    name: "Disarm Toolkit",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.TOOLKIT],
    weight: 2,
    cost: { amount: 25, currency: CURRENCY_TYPE.GP },
    summary: "Specialized picks, probes, and mirrors made for disabling mechanisms safely."
  },
  {
    id: "item-rope-50ft",
    name: "Rope (50ft)",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 10,
    cost: { amount: 1, currency: CURRENCY_TYPE.GP },
    summary: "A durable 50-foot rope for climbing, anchoring, and traversal."
  },
  {
    id: "item-shovel",
    name: "Shovel",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 5,
    cost: { amount: 2, currency: CURRENCY_TYPE.GP },
    summary: "A field shovel useful for digging cover, graves, and hidden caches."
  },
  {
    id: "item-mining-pickaxe",
    name: "Mining Pickaxe",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 10,
    cost: { amount: 2, currency: CURRENCY_TYPE.GP },
    summary: "A heavy pickaxe suited for stonework, excavation, and forced entry."
  },
  {
    id: "item-disguise-kit",
    name: "Disguise Kit",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.TOOLKIT],
    weight: 3,
    cost: { amount: 25, currency: CURRENCY_TYPE.GP },
    summary: "Cosmetic and wardrobe tools for changing appearance and mannerisms."
  },
  {
    id: "item-torch",
    name: "Torch",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 1,
    cost: { amount: 1, currency: CURRENCY_TYPE.CP },
    summary: "A handheld light source that keeps dark paths visible and can ignite campfires."
  },
  {
    id: "item-bedroll",
    name: "Bedroll",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 7,
    cost: { amount: 1, currency: CURRENCY_TYPE.GP },
    summary: "A compact sleeping roll for resting in the wilderness or rough shelter."
  },
  {
    id: "item-rations-1-day",
    name: "Rations (1 day)",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 2,
    cost: { amount: 5, currency: CURRENCY_TYPE.SP },
    summary: "Preserved food supplies that cover one full day of travel and exertion."
  },
  {
    id: "item-explorers-pack",
    name: "Explorer's Pack",
    category: ENTRY_CATEGORIES.ITEMS,
    tags: [ITEM_TYPES.ADVENTURING_GEAR],
    weight: 59,
    cost: { amount: 10, currency: CURRENCY_TYPE.GP },
    summary: "A bundled field kit packed with the basics for overland travel and dungeon delving."
  }
];
