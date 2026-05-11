import type { FilterQuery, PipelineStage } from "mongoose";
import { ItemModel } from "../models/Item.js";
import {
  ITEM_NO_RARITY_FILTER_VALUE,
  type ItemBatchLookupRecord,
  type ItemArmorType,
  type ItemAttackType,
  type ItemBrowserTab,
  type ItemFilterOption,
  type ItemFilterOptions,
  type ItemListQuery,
  type ItemOrdering,
  type ItemProficiencyType,
  type Open5eItemRecord
} from "../types/item.js";
import { serializeItemListItem, serializeItemRecord } from "../utils/serializers.js";

const WEAPON_TAB_CATEGORY_KEYS = ["weapon", "staff"] as const;
const ARMOR_TAB_CATEGORY_KEYS = ["armor", "shield"] as const;
const NON_GEAR_CATEGORY_KEYS = new Set<string>([
  ...WEAPON_TAB_CATEGORY_KEYS,
  ...ARMOR_TAB_CATEGORY_KEYS
]);
const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  weapon: "Weapons"
};
const RARITY_FILTER_ORDER = [
  ITEM_NO_RARITY_FILTER_VALUE,
  "common",
  "uncommon",
  "rare",
  "very-rare",
  "legendary",
  "artifact"
] as const;
const rarityFilterOrderRank = new Map<string, number>(
  RARITY_FILTER_ORDER.map((value, index) => [value, index])
);
const RANGED_WEAPON_NAMES = [
  "Blowgun",
  "Dart",
  "Hand Crossbow",
  "Heavy Crossbow",
  "Light Crossbow",
  "Longbow",
  "Musket",
  "Pistol",
  "Shortbow",
  "Sling"
] as const;

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createCaseInsensitiveExactMatch(value: string) {
  return new RegExp(`^${escapeRegularExpression(value)}$`, "i");
}

function createCaseInsensitiveContainsMatch(value: string) {
  return new RegExp(escapeRegularExpression(value), "i");
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function normalizeOptionOrderKey(value: string) {
  return normalizeKey(value).replace(/[\s_]+/g, "-");
}

function combineAndFilters(
  filters: FilterQuery<Open5eItemRecord>[]
): FilterQuery<Open5eItemRecord> {
  if (filters.length === 0) {
    return {};
  }

  if (filters.length === 1) {
    return filters[0] ?? {};
  }

  return {
    $and: filters
  };
}

function isCategoryAllowedForTab(category: string, tab: ItemBrowserTab | undefined) {
  const normalizedCategory = normalizeKey(category);

  if (!tab || tab === "all") {
    return true;
  }

  if (tab === "weapons") {
    return WEAPON_TAB_CATEGORY_KEYS.includes(
      normalizedCategory as (typeof WEAPON_TAB_CATEGORY_KEYS)[number]
    );
  }

  if (tab === "armor") {
    return ARMOR_TAB_CATEGORY_KEYS.includes(
      normalizedCategory as (typeof ARMOR_TAB_CATEGORY_KEYS)[number]
    );
  }

  if (tab === "gear") {
    return !NON_GEAR_CATEGORY_KEYS.has(normalizedCategory);
  }

  return true;
}

function buildTabFilter(tab: ItemBrowserTab | undefined): FilterQuery<Open5eItemRecord> | null {
  if (!tab || tab === "all") {
    return null;
  }

  if (tab === "weapons") {
    return {
      "category.key": {
        $in: [...WEAPON_TAB_CATEGORY_KEYS]
      }
    };
  }

  if (tab === "armor") {
    return {
      "category.key": {
        $in: [...ARMOR_TAB_CATEGORY_KEYS]
      }
    };
  }

  if (tab === "gear") {
    return {
      "category.key": {
        $nin: [...NON_GEAR_CATEGORY_KEYS]
      }
    };
  }

  return null;
}

function buildWeaponRangeConditions(): FilterQuery<Open5eItemRecord>[] {
  return [
    {
      "weapon.properties.property.name": createCaseInsensitiveExactMatch("Ammunition")
    },
    {
      "weapon.name": {
        $in: RANGED_WEAPON_NAMES.map((name) => createCaseInsensitiveExactMatch(name))
      }
    }
  ];
}

function buildWeaponAttackTypeFilter(
  attackType: ItemAttackType
): FilterQuery<Open5eItemRecord> {
  const rangedConditions = buildWeaponRangeConditions();

  if (attackType === "range") {
    return {
      $or: rangedConditions
    };
  }

  return {
    $and: [
      {
        weapon: {
          $ne: null
        }
      },
      {
        $nor: rangedConditions
      }
    ]
  };
}

function buildWeaponProficiencyFilter(
  proficiencyType: ItemProficiencyType
): FilterQuery<Open5eItemRecord> {
  if (proficiencyType === "simple") {
    return {
      "weapon.is_simple": true
    };
  }

  return {
    "weapon.is_martial": true
  };
}

function buildWeaponMasteryFilter(mastery: string): FilterQuery<Open5eItemRecord> {
  return {
    "weapon.properties": {
      $elemMatch: {
        "property.type": createCaseInsensitiveExactMatch("Mastery"),
        "property.name": createCaseInsensitiveExactMatch(mastery)
      }
    }
  };
}

function buildWeaponPropertyFilter(property: string): FilterQuery<Open5eItemRecord> {
  return {
    "weapon.properties": {
      $elemMatch: {
        "property.name": createCaseInsensitiveExactMatch(property),
        "property.type": {
          $not: createCaseInsensitiveExactMatch("Mastery")
        }
      }
    }
  };
}

function buildArmorTypeFilter(armorType: ItemArmorType): FilterQuery<Open5eItemRecord> {
  return {
    $and: [
      {
        armor: {
          $ne: null
        }
      },
      {
        "armor.category": createCaseInsensitiveContainsMatch(armorType)
      }
    ]
  };
}

function buildItemFilter(query: ItemListQuery): FilterQuery<Open5eItemRecord> {
  const filters: FilterQuery<Open5eItemRecord>[] = [];
  const tabFilter = buildTabFilter(query.tab);

  if (query.search) {
    const searchPattern = new RegExp(escapeRegularExpression(query.search), "i");
    filters.push({
      name: searchPattern
    });
  }

  if (tabFilter) {
    filters.push(tabFilter);
  }

  if (query.category && isCategoryAllowedForTab(query.category, query.tab)) {
    filters.push({
      "category.key": createCaseInsensitiveExactMatch(query.category)
    });
  }

  if (query.rarity === ITEM_NO_RARITY_FILTER_VALUE) {
    filters.push({
      rarity: null
    });
  } else if (query.rarity) {
    filters.push({
      "rarity.key": createCaseInsensitiveExactMatch(query.rarity)
    });
  }

  if (query.source) {
    filters.push({
      "document.key": createCaseInsensitiveExactMatch(query.source)
    });
  }

  if (query.tab === "weapons" && query.attackType) {
    filters.push(buildWeaponAttackTypeFilter(query.attackType));
  }

  if (query.tab === "weapons" && query.proficiencyType) {
    filters.push(buildWeaponProficiencyFilter(query.proficiencyType));
  }

  if (query.tab === "weapons" && query.mastery) {
    filters.push(buildWeaponMasteryFilter(query.mastery));
  }

  if (query.tab === "weapons" && query.property) {
    filters.push(buildWeaponPropertyFilter(query.property));
  }

  if (query.tab === "armor" && query.armorType) {
    filters.push(buildArmorTypeFilter(query.armorType));
  }

  return combineAndFilters(filters);
}

function buildItemSort(ordering: ItemOrdering | undefined) {
  switch (ordering) {
    case "rarity":
      return [
        ["rarity.rank", 1],
        ["rarity.name", 1],
        ["name", 1],
        ["document.key", -1],
        ["key", 1]
      ] as [string, 1 | -1][];
    case "-rarity":
      return [
        ["rarity.rank", -1],
        ["rarity.name", -1],
        ["name", 1],
        ["document.key", -1],
        ["key", 1]
      ] as [string, 1 | -1][];
    case "-name":
      return [
        ["name", -1],
        ["document.key", -1],
        ["key", -1]
      ] as [string, 1 | -1][];
    case "weight":
      return [
        ["__sortMissing", 1],
        ["__sortValue", 1],
        ["name", 1],
        ["document.key", -1],
        ["key", 1]
      ] as [string, 1 | -1][];
    case "-weight":
      return [
        ["__sortMissing", 1],
        ["__sortValue", -1],
        ["name", 1],
        ["document.key", -1],
        ["key", 1]
      ] as [string, 1 | -1][];
    case "cost":
      return [
        ["__sortMissing", 1],
        ["__sortValue", 1],
        ["name", 1],
        ["document.key", -1],
        ["key", 1]
      ] as [string, 1 | -1][];
    case "-cost":
      return [
        ["__sortMissing", 1],
        ["__sortValue", -1],
        ["name", 1],
        ["document.key", -1],
        ["key", 1]
      ] as [string, 1 | -1][];
    case "name":
    default:
      return [
        ["name", 1],
        ["document.key", -1],
        ["key", 1]
      ] as [string, 1 | -1][];
  }
}

function buildNumericSortPipeline(fieldPath: "weight" | "cost", ordering: ItemOrdering) {
  const valueExpression = {
    $convert: {
      input: `$${fieldPath}`,
      to: "double",
      onError: null,
      onNull: null
    }
  };

  return [
    {
      $addFields: {
        __sortValue: valueExpression,
        __sortMissing: {
          $cond: [
            {
              $eq: [valueExpression, null]
            },
            1,
            0
          ]
        }
      }
    },
    {
      $sort: Object.fromEntries(buildItemSort(ordering))
    },
    {
      $project: {
        __sortValue: 0,
        __sortMissing: 0
      }
    }
  ] satisfies PipelineStage[];
}

function buildGroupedOptionsPipeline(fieldPath: string, labelPath: string): PipelineStage[] {
  return [
    {
      $group: {
        _id: {
          value: `$${fieldPath}`,
          label: `$${labelPath}`
        },
        count: {
          $sum: 1
        }
      }
    },
    {
      $project: {
        _id: 0,
        value: "$_id.value",
        label: "$_id.label",
        count: 1
      }
    },
    {
      $sort: {
        label: 1
      }
    }
  ];
}

function buildWeaponPropertyOptionsPipeline(
  match: FilterQuery<Open5eItemRecord>
): PipelineStage[] {
  return [
    {
      $match: combineAndFilters([
        buildTabFilter("weapons") ?? {},
        {
          weapon: {
            $ne: null
          }
        }
      ])
    },
    {
      $unwind: "$weapon.properties"
    },
    {
      $match: match
    },
    ...buildGroupedOptionsPipeline("weapon.properties.property.name", "weapon.properties.property.name")
  ];
}

function normalizeFilterOptions(
  entries: Array<{ value: string | null; label: string | null; count: number }>,
  fallback?: { value: string; label: string },
  compare?: (left: ItemFilterOption, right: ItemFilterOption) => number
): ItemFilterOption[] {
  const normalizedEntries = entries
    .filter((entry) => entry.value !== null || fallback)
    .map((entry) => {
      const value = entry.value ?? fallback?.value ?? "";
      const fallbackLabel = entry.label ?? fallback?.label ?? entry.value ?? "";

      return {
        value,
        label: CATEGORY_LABEL_OVERRIDES[value] ?? fallbackLabel,
        count: entry.count
      };
    })
    .filter((entry) => entry.value.length > 0);

  return compare ? normalizedEntries.sort(compare) : normalizedEntries;
}

function filterCategoryOptionsByTab(options: ItemFilterOption[], tab: ItemBrowserTab) {
  if (tab === "all") {
    return options;
  }

  if (tab === "weapons") {
    return options.filter((option) =>
      WEAPON_TAB_CATEGORY_KEYS.includes(option.value as (typeof WEAPON_TAB_CATEGORY_KEYS)[number])
    );
  }

  if (tab === "armor") {
    return options.filter((option) =>
      ARMOR_TAB_CATEGORY_KEYS.includes(option.value as (typeof ARMOR_TAB_CATEGORY_KEYS)[number])
    );
  }

  return options.filter((option) => !NON_GEAR_CATEGORY_KEYS.has(option.value));
}

function createStaticOption(value: string, label: string, count: number): ItemFilterOption {
  return {
    value,
    label,
    count
  };
}

function getRarityFilterRank(option: ItemFilterOption): number {
  const candidateKeys = [
    normalizeOptionOrderKey(option.value),
    normalizeOptionOrderKey(option.label)
  ];

  for (const candidateKey of candidateKeys) {
    const rank = rarityFilterOrderRank.get(candidateKey);

    if (rank !== undefined) {
      return rank;
    }
  }

  return Number.POSITIVE_INFINITY;
}

function compareRarityFilterOptions(left: ItemFilterOption, right: ItemFilterOption): number {
  const rankDifference = getRarityFilterRank(left) - getRarityFilterRank(right);

  if (rankDifference !== 0) {
    return rankDifference;
  }

  return left.label.localeCompare(right.label);
}

export async function listItems(query: ItemListQuery) {
  const filter = buildItemFilter(query);
  const sort = buildItemSort(query.ordering);
  const skip = (query.page - 1) * query.limit;
  const numericSortField =
    query.ordering === "weight" || query.ordering === "-weight"
      ? "weight"
      : query.ordering === "cost" || query.ordering === "-cost"
        ? "cost"
        : null;

  const [count, results] = await Promise.all([
    ItemModel.countDocuments(filter).exec(),
    numericSortField
      ? ItemModel.aggregate<Open5eItemRecord>([
          {
            $match: filter
          },
          ...buildNumericSortPipeline(numericSortField, query.ordering ?? "name"),
          {
            $skip: skip
          },
          {
            $limit: query.limit
          }
        ]).exec()
      : ItemModel.find(filter).sort(sort).skip(skip).limit(query.limit).lean<Open5eItemRecord[]>().exec()
  ]);

  return {
    count,
    page: query.page,
    limit: query.limit,
    results: results.map(serializeItemListItem)
  };
}

export async function getItemByKey(key: string) {
  const record = await ItemModel.findOne({ key }).lean<Open5eItemRecord | null>().exec();

  return record ? serializeItemRecord(record) : null;
}

export async function getItemsByKeys(keys: string[]): Promise<ItemBatchLookupRecord> {
  const uniqueKeys = [...new Set(keys.map((key) => key.trim()).filter(Boolean))];

  if (uniqueKeys.length === 0) {
    return {
      items: [],
      invalidKeys: []
    };
  }

  const records = await ItemModel.find({ key: { $in: uniqueKeys } })
    .lean<Open5eItemRecord[]>()
    .exec();
  const recordsByKey = new Map(
    records
      .filter(
        (record): record is Open5eItemRecord & { key: string } => typeof record.key === "string"
      )
      .map((record) => [record.key, record])
  );
  const items = uniqueKeys
    .map((key) => recordsByKey.get(key))
    .filter((record): record is Open5eItemRecord & { key: string } => Boolean(record))
    .map(serializeItemRecord);
  const invalidKeys = uniqueKeys.filter((key) => !recordsByKey.has(key));

  return {
    items,
    invalidKeys,
    message:
      invalidKeys.length > 0
        ? `Ignored ${invalidKeys.length} invalid item key${invalidKeys.length === 1 ? "" : "s"}: ${invalidKeys.join(", ")}.`
        : undefined
  };
}

export async function listItemFilterOptions(): Promise<ItemFilterOptions> {
  const [
    categories,
    rarities,
    sources,
    allCount,
    weaponsCount,
    armorCount,
    gearCount,
    meleeCount,
    rangeCount,
    simpleCount,
    martialCount,
    masteries,
    properties,
    lightCount,
    mediumCount,
    heavyCount
  ] =
    await Promise.all([
      ItemModel.aggregate<{ value: string; label: string; count: number }>(
        buildGroupedOptionsPipeline("category.key", "category.name")
      ).exec(),
      ItemModel.aggregate<{ value: string | null; label: string | null; count: number }>([
        {
          $group: {
            _id: {
              value: "$rarity.key",
              label: "$rarity.name"
            },
            count: {
              $sum: 1
            }
          }
        },
        {
          $project: {
            _id: 0,
            value: "$_id.value",
            label: "$_id.label",
            count: 1
          }
        },
        {
          $sort: {
            value: 1,
            label: 1
          }
        }
      ]).exec(),
      ItemModel.aggregate<{ value: string; label: string; count: number }>(
        buildGroupedOptionsPipeline("document.key", "document.display_name")
      ).exec(),
      ItemModel.countDocuments({}).exec(),
      ItemModel.countDocuments(buildTabFilter("weapons") ?? {}).exec(),
      ItemModel.countDocuments(buildTabFilter("armor") ?? {}).exec(),
      ItemModel.countDocuments(buildTabFilter("gear") ?? {}).exec(),
      ItemModel.countDocuments(
        combineAndFilters([
          buildTabFilter("weapons") ?? {},
          buildWeaponAttackTypeFilter("melee")
        ])
      ).exec(),
      ItemModel.countDocuments(
        combineAndFilters([
          buildTabFilter("weapons") ?? {},
          buildWeaponAttackTypeFilter("range")
        ])
      ).exec(),
      ItemModel.countDocuments(
        combineAndFilters([
          buildTabFilter("weapons") ?? {},
          buildWeaponProficiencyFilter("simple")
        ])
      ).exec(),
      ItemModel.countDocuments(
        combineAndFilters([
          buildTabFilter("weapons") ?? {},
          buildWeaponProficiencyFilter("martial")
        ])
      ).exec(),
      ItemModel.aggregate<{ value: string | null; label: string | null; count: number }>(
        buildWeaponPropertyOptionsPipeline({
          "weapon.properties.property.type": createCaseInsensitiveExactMatch("Mastery")
        })
      ).exec(),
      ItemModel.aggregate<{ value: string | null; label: string | null; count: number }>(
        buildWeaponPropertyOptionsPipeline({
          "weapon.properties.property.type": {
            $not: createCaseInsensitiveExactMatch("Mastery")
          }
        })
      ).exec(),
      ItemModel.countDocuments(
        combineAndFilters([
          buildTabFilter("armor") ?? {},
          buildArmorTypeFilter("light")
        ])
      ).exec(),
      ItemModel.countDocuments(
        combineAndFilters([
          buildTabFilter("armor") ?? {},
          buildArmorTypeFilter("medium")
        ])
      ).exec(),
      ItemModel.countDocuments(
        combineAndFilters([
          buildTabFilter("armor") ?? {},
          buildArmorTypeFilter("heavy")
        ])
      ).exec()
    ]);

  const normalizedCategories = normalizeFilterOptions(categories);
  const allCategories = filterCategoryOptionsByTab(normalizedCategories, "all");
  const weaponCategories = filterCategoryOptionsByTab(normalizedCategories, "weapons");
  const armorCategories = filterCategoryOptionsByTab(normalizedCategories, "armor");
  const gearCategories = filterCategoryOptionsByTab(normalizedCategories, "gear");

  return {
    groups: {
      all: {
        count: allCount,
        categories: allCategories
      },
      weapons: {
        count: weaponsCount,
        categories: weaponCategories,
        attackTypes: [
          createStaticOption("melee", "Melee", meleeCount),
          createStaticOption("range", "Range", rangeCount)
        ],
        proficiencyTypes: [
          createStaticOption("simple", "Simple", simpleCount),
          createStaticOption("martial", "Martial", martialCount)
        ],
        masteries: normalizeFilterOptions(masteries),
        properties: normalizeFilterOptions(properties)
      },
      armor: {
        count: armorCount,
        categories: armorCategories,
        armorTypes: [
          createStaticOption("light", "Light Armor", lightCount),
          createStaticOption("medium", "Medium Armor", mediumCount),
          createStaticOption("heavy", "Heavy Armor", heavyCount)
        ]
      },
      gear: {
        count: gearCount,
        categories: gearCategories
      }
    },
    rarities: normalizeFilterOptions(
      rarities,
      {
        value: ITEM_NO_RARITY_FILTER_VALUE,
        label: "No rarity"
      },
      compareRarityFilterOptions
    ),
    sources: normalizeFilterOptions(sources)
  };
}
