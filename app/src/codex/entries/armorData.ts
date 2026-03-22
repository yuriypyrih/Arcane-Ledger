import { ARMOR_TYPES, CURRENCY_TYPE, ENTRY_CATEGORIES, RARITY_TYPES } from "./enums";
import type { ArmorEntry } from "./types";

export const armorEntries: ArmorEntry[] = [
  {
    id: "armor-padded-armor",
    name: "Padded Armor",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.LIGHT_ARMOR],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 11,
    shieldBonus: 0,
    weight: 8,
    cost: { amount: 5, currency: CURRENCY_TYPE.GP },
    summary: "Light armor with a base AC of 11 plus your Dexterity modifier. It imposes Disadvantage on Stealth checks."
  },
  {
    id: "armor-leather-armor",
    name: "Leather Armor",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.LIGHT_ARMOR],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 11,
    shieldBonus: 0,
    weight: 10,
    cost: { amount: 10, currency: CURRENCY_TYPE.GP },
    summary: "Light armor with a base AC of 11 plus your Dexterity modifier."
  },
  {
    id: "armor-studded-leather-armor",
    name: "Studded Leather Armor",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.LIGHT_ARMOR],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 12,
    shieldBonus: 0,
    weight: 13,
    cost: { amount: 45, currency: CURRENCY_TYPE.GP },
    summary: "Light armor with a base AC of 12 plus your Dexterity modifier."
  },
  {
    id: "armor-hide-armor",
    name: "Hide Armor",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.MEDIUM_ARMOR],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 12,
    shieldBonus: 0,
    weight: 12,
    cost: { amount: 10, currency: CURRENCY_TYPE.GP },
    summary: "Medium armor with a base AC of 12 plus up to +2 from Dexterity."
  },
  {
    id: "armor-chain-shirt",
    name: "Chain Shirt",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.MEDIUM_ARMOR],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 13,
    shieldBonus: 0,
    weight: 20,
    cost: { amount: 50, currency: CURRENCY_TYPE.GP },
    summary: "Medium armor with a base AC of 13 plus up to +2 from Dexterity."
  },
  {
    id: "armor-scale-mail",
    name: "Scale Mail",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.MEDIUM_ARMOR],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 14,
    shieldBonus: 0,
    weight: 45,
    cost: { amount: 50, currency: CURRENCY_TYPE.GP },
    summary: "Medium armor with a base AC of 14 plus up to +2 from Dexterity. It imposes Disadvantage on Stealth checks."
  },
  {
    id: "armor-breastplate",
    name: "Breastplate",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.MEDIUM_ARMOR],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 14,
    shieldBonus: 0,
    weight: 20,
    cost: { amount: 400, currency: CURRENCY_TYPE.GP },
    summary: "Medium armor with a base AC of 14 plus up to +2 from Dexterity."
  },
  {
    id: "armor-half-plate-armor",
    name: "Half Plate Armor",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.MEDIUM_ARMOR],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 15,
    shieldBonus: 0,
    weight: 40,
    cost: { amount: 750, currency: CURRENCY_TYPE.GP },
    summary: "Medium armor with a base AC of 15 plus up to +2 from Dexterity. It imposes Disadvantage on Stealth checks."
  },
  {
    id: "armor-ring-mail",
    name: "Ring Mail",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.HEAVY_ARMOR],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 14,
    shieldBonus: 0,
    weight: 40,
    cost: { amount: 30, currency: CURRENCY_TYPE.GP },
    summary: "Heavy armor with a fixed base AC of 14. It imposes Disadvantage on Stealth checks."
  },
  {
    id: "armor-chain-mail",
    name: "Chain Mail",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.HEAVY_ARMOR],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 16,
    shieldBonus: 0,
    weight: 55,
    cost: { amount: 75, currency: CURRENCY_TYPE.GP },
    summary: "Heavy armor with a fixed base AC of 16. It imposes Disadvantage on Stealth checks."
  },
  {
    id: "armor-splint-armor",
    name: "Splint Armor",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.HEAVY_ARMOR],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 17,
    shieldBonus: 0,
    weight: 60,
    cost: { amount: 200, currency: CURRENCY_TYPE.GP },
    summary: "Heavy armor with a fixed base AC of 17. It imposes Disadvantage on Stealth checks."
  },
  {
    id: "armor-plate-armor",
    name: "Plate Armor",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.HEAVY_ARMOR],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 18,
    shieldBonus: 0,
    weight: 65,
    cost: { amount: 1500, currency: CURRENCY_TYPE.GP },
    summary: "Heavy armor with a fixed base AC of 18. It imposes Disadvantage on Stealth checks."
  },
  {
    id: "armor-shield",
    name: "Shield",
    category: ENTRY_CATEGORIES.ARMOR,
    tags: [ARMOR_TYPES.SHIELD],
    rarity: RARITY_TYPES.COMMON,
    armorBase: 0,
    shieldBonus: 2,
    weight: 6,
    cost: { amount: 10, currency: CURRENCY_TYPE.GP },
    summary: "A shield that adds +2 AC while on hand."
  }
];
