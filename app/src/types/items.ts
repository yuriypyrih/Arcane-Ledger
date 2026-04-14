export type Open5eKeyedReference = {
  name: string;
  key: string;
  url: string;
  [key: string]: unknown;
};

export type Open5eDocumentReference = {
  name: string;
  key: string;
  type?: string;
  display_name?: string;
  publisher?: Open5eKeyedReference | null;
  gamesystem?: Open5eKeyedReference | null;
  permalink?: string | null;
  [key: string]: unknown;
};

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
export type ItemBrowserTab = "weapons" | "armor" | "gear";
export type ItemAttackType = "melee" | "range";
export type ItemProficiencyType = "simple" | "martial";
export type ItemArmorType = "light" | "medium" | "heavy";

export const ITEM_NO_RARITY_FILTER_VALUE = "__none__";
export const DEFAULT_ITEM_BROWSER_TAB: ItemBrowserTab = "weapons";

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
};

export type ArmorItemFilterGroup = ItemFilterGroup & {
  armorTypes: ItemFilterOption[];
};

export type ItemFilterOptions = {
  groups: {
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
