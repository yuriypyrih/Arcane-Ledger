export type ItemDetailReference = {
  name: string;
  key: string;
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
export const DEFAULT_ITEM_BROWSER_TAB: ItemBrowserTab = "all";

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

export type ItemRecord = {
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
  item: ItemRecord;
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

export type ItemBatchLookupRecord = {
  items: ItemRecord[];
  invalidKeys: string[];
  message?: string;
};
