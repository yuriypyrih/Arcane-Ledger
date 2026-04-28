import type { Open5eDocumentReference, Open5eKeyedReference } from "./open5e.js";

export type Open5eWeaponPropertyReference = {
  name: string;
  url: string;
  key?: string;
  type?: string | null;
  desc?: string | null;
  [key: string]: unknown;
};

export type Open5eItemWeaponPropertyRecord = {
  property: Open5eWeaponPropertyReference;
  detail: string | null;
};

export type Open5eItemWeaponRecord = {
  name: string;
  key: string;
  url: string;
  damage_dice: string;
  damage_type: Open5eKeyedReference;
  distance_unit: string;
  is_improvised: boolean;
  is_martial: boolean;
  is_simple: boolean;
  properties: Open5eItemWeaponPropertyRecord[];
};

export type Open5eItemArmorRecord = {
  name: string;
  key: string;
  url: string;
  category: string;
  ac_base: number;
  ac_display: string;
  ac_add_dexmod: boolean;
  ac_cap_dexmod: number | null;
  grants_stealth_disadvantage: boolean;
  strength_score_required: number | null;
};

export type ItemOrdering =
  | "name"
  | "-name"
  | "rarity"
  | "-rarity"
  | "weight"
  | "-weight"
  | "cost"
  | "-cost";
export type ItemBrowserTab = "all" | "weapons" | "armor" | "gear";
export type ItemAttackType = "melee" | "range";
export type ItemProficiencyType = "simple" | "martial";
export type ItemArmorType = "light" | "medium" | "heavy";

export const ITEM_NO_RARITY_FILTER_VALUE = "__none__";

export type ItemListItem = {
  id: string;
  key: string;
  name: string;
  rarityKey: string | null;
  rarityName: string | null;
  categoryKey: string;
  categoryName: string;
  weight: string;
  weightUnit: string;
  cost: string | null;
  sourceKey: string;
  sourceTitle: string;
};

export type ItemDetailReference = {
  key: string;
  name: string;
};

export type ItemDetailDocumentReference = ItemDetailReference & {
  display_name: string | null;
};

export type ItemDetailWeaponPropertyReference = {
  name: string;
  type: string | null;
};

export type ItemDetailWeaponPropertyRecord = {
  property: ItemDetailWeaponPropertyReference;
  detail: string | null;
};

export type ItemDetailWeaponRecord = {
  name: string;
  damage_dice: string;
  damage_type: ItemDetailReference;
  is_martial: boolean;
  properties: ItemDetailWeaponPropertyRecord[];
};

export type ItemDetailArmorRecord = {
  category: string;
  ac_base: number;
  ac_display: string;
  ac_add_dexmod: boolean;
  ac_cap_dexmod: number | null;
  grants_stealth_disadvantage: boolean;
  strength_score_required: number | null;
};

export type ItemDetailRecord = {
  id: string;
  key?: string;
  name?: string;
  desc?: string | null;
  category?: ItemDetailReference | null;
  rarity?: ItemDetailReference | null;
  is_magic_item?: boolean;
  weapon?: ItemDetailWeaponRecord | null;
  armor?: ItemDetailArmorRecord | null;
  weight?: string | null;
  weight_unit?: string | null;
  cost?: string | null;
  requires_attunement?: boolean;
  attunement_detail?: string | null;
  document?: ItemDetailDocumentReference | null;
};

export type ItemListQuery = {
  search?: string;
  page: number;
  limit: number;
  ordering?: ItemOrdering;
  tab?: ItemBrowserTab;
  category?: string;
  attackType?: ItemAttackType;
  proficiencyType?: ItemProficiencyType;
  mastery?: string;
  property?: string;
  armorType?: ItemArmorType;
  rarity?: string;
  source?: string;
};

export type ItemListQueryLocals = {
  itemListQuery: ItemListQuery;
};

export type ItemFilterOption = {
  value: string;
  label: string;
  count: number;
};

export type ItemFilterGroup = {
  count: number;
  categories: ItemFilterOption[];
};

export type WeaponItemFilterGroup = ItemFilterGroup & {
  attackTypes: ItemFilterOption[];
  proficiencyTypes: ItemFilterOption[];
  masteries: ItemFilterOption[];
  properties: ItemFilterOption[];
};

export type ArmorItemFilterGroup = ItemFilterGroup & {
  armorTypes: ItemFilterOption[];
};

export type ItemFilterOptions = {
  groups: {
    all: ItemFilterGroup;
    weapons: WeaponItemFilterGroup;
    armor: ArmorItemFilterGroup;
    gear: ItemFilterGroup;
  };
  rarities: ItemFilterOption[];
  sources: ItemFilterOption[];
};

export type ItemPackContent = {
  quantity: number;
  item: ItemDetailRecord;
};

export type ItemPackMissingReference = {
  name: string;
  quantity: number;
  expectedItemKey: string | null;
};

export type ItemPackContentsRecord = {
  packKey: string;
  packName: string;
  contents: ItemPackContent[];
  missingReferences: ItemPackMissingReference[];
};

export type Open5eItemRecord = {
  url?: string;
  key?: string;
  name?: string;
  desc?: string | null;
  category?: Open5eKeyedReference | null;
  rarity?: Open5eKeyedReference | null;
  is_magic_item?: boolean;
  weapon?: Open5eItemWeaponRecord | null;
  armor?: Open5eItemArmorRecord | null;
  size?: Open5eKeyedReference | null;
  weight?: string | null;
  weight_unit?: string | null;
  cost?: string | null;
  requires_attunement?: boolean;
  attunement_detail?: string | null;
  document?: Open5eDocumentReference | null;
  [key: string]: unknown;
};

export type ItemInventorySample = {
  key: string;
  name: string;
};

export type ItemInventoryFieldSummary = {
  presentCount: number;
  missingCount: number;
  nullCount: number;
  nonNullCount: number;
  typeCounts: Record<string, number>;
};

export type ItemInventoryBooleanSummary = {
  trueCount: number;
  falseCount: number;
  nullCount: number;
  missingCount: number;
};

export type ItemInventoryReferenceCount = {
  key: string;
  name: string;
  count: number;
};

export type ItemInventoryRaritySummary = {
  presentCount: number;
  missingCount: number;
  nullCount: number;
  nonNullCount: number;
  byKey: ItemInventoryReferenceCount[];
};

export type ItemInventoryNestedSummary = {
  presentCount: number;
  missingCount: number;
  nullCount: number;
  objectCount: number;
  nonObjectCount: number;
  fieldSummary: Record<string, ItemInventoryFieldSummary>;
};

export type PlannedCategoryMapping = {
  defaultTargetCategory: string;
  magicItemTargetCategory?: string;
};

export type ItemInventoryCategorySummary = {
  key: string;
  name: string;
  count: number;
  magicItemCount: number;
  nonMagicItemCount: number;
  sampleItems: ItemInventorySample[];
  plannedMapping: PlannedCategoryMapping | null;
};

export type ItemSnapshotSchemaInventory = {
  generatedAt: string;
  snapshot: {
    sourceDir: string;
    outputPath: string;
    pageFileCount: number;
    reportedTotalCount: number;
    rawRecordCount: number;
    uniqueItemCountByKey: number;
    duplicateRecordCount: number;
    duplicateKeyCount: number;
  };
  reconciliation: {
    categoryTotalMatchesUniqueItems: boolean;
    documentTotalMatchesUniqueItems: boolean;
    gameSystemTotalMatchesUniqueItems: boolean;
  };
  countsByCategory: ItemInventoryCategorySummary[];
  countsByDocument: ItemInventoryReferenceCount[];
  countsByGameSystem: ItemInventoryReferenceCount[];
  topLevelFieldSummary: Record<string, ItemInventoryFieldSummary>;
  nestedFieldSummary: {
    weapon: ItemInventoryNestedSummary;
    armor: ItemInventoryNestedSummary;
  };
  flags: {
    isMagicItem: ItemInventoryBooleanSummary;
    requiresAttunement: ItemInventoryBooleanSummary;
    rarity: ItemInventoryRaritySummary;
  };
  unmappedCategories: ItemInventoryCategorySummary[];
};
