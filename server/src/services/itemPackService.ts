import { ItemModel } from "../models/Item.js";
import type {
  ItemPackContentsRecord,
  ItemPackMissingReference,
  Open5eItemRecord
} from "../types/item.js";
import { serializeItemRecord } from "../utils/serializers.js";

type EquipmentPackManifestEntry = {
  name: string;
  quantity: number;
  itemKey?: string;
};

const PREFERRED_ITEM_DOCUMENT_KEYS = ["srd-2024", "srd-2014"] as const;

const equipmentPackManifest: Record<string, EquipmentPackManifestEntry[]> = {
  "srd-2024_backpack": [],
  "srd-2024_burglars-pack": [
    { name: "Backpack", quantity: 1, itemKey: "srd-2024_backpack" },
    { name: "Ball Bearings", quantity: 1, itemKey: "srd-2024_ball-bearings" },
    { name: "Bell", quantity: 1, itemKey: "srd-2024_bell" },
    { name: "Candle", quantity: 10, itemKey: "srd-2024_candle" },
    { name: "Crowbar", quantity: 1, itemKey: "srd-2024_crowbar" },
    { name: "Hooded Lantern", quantity: 1 },
    { name: "Oil", quantity: 7, itemKey: "srd-2024_oil" },
    { name: "Rations", quantity: 5, itemKey: "srd-2024_rations" },
    { name: "Rope", quantity: 1, itemKey: "srd-2024_rope" },
    { name: "Tinderbox", quantity: 1, itemKey: "srd-2024_tinderbox" },
    { name: "Waterskin", quantity: 1, itemKey: "srd-2024_waterskin" }
  ],
  "srd-2024_diplomats-pack": [
    { name: "Chest", quantity: 1, itemKey: "srd-2024_chest" },
    { name: "Fine Clothes", quantity: 1 },
    { name: "Ink", quantity: 1, itemKey: "srd-2024_ink" },
    { name: "Ink Pen", quantity: 5, itemKey: "srd-2024_ink-pen" },
    { name: "Lamp", quantity: 1, itemKey: "srd-2024_lamp" },
    { name: "Map or Scroll Case", quantity: 2 },
    { name: "Oil", quantity: 4, itemKey: "srd-2024_oil" },
    { name: "Paper", quantity: 5, itemKey: "srd-2024_paper" },
    { name: "Parchment", quantity: 5, itemKey: "srd-2024_parchment" },
    { name: "Perfume", quantity: 1, itemKey: "srd-2024_perfume" },
    { name: "Tinderbox", quantity: 1, itemKey: "srd-2024_tinderbox" }
  ],
  "srd-2024_dungeoneers-pack": [
    { name: "Backpack", quantity: 1, itemKey: "srd-2024_backpack" },
    { name: "Caltrops", quantity: 1, itemKey: "srd-2024_caltrops" },
    { name: "Crowbar", quantity: 1, itemKey: "srd-2024_crowbar" },
    { name: "Oil", quantity: 2, itemKey: "srd-2024_oil" },
    { name: "Rations", quantity: 10, itemKey: "srd-2024_rations" },
    { name: "Rope", quantity: 1, itemKey: "srd-2024_rope" },
    { name: "Tinderbox", quantity: 1, itemKey: "srd-2024_tinderbox" },
    { name: "Torch", quantity: 10, itemKey: "srd-2024_torch" },
    { name: "Waterskin", quantity: 1, itemKey: "srd-2024_waterskin" }
  ],
  "srd-2024_entertainers-pack": [
    { name: "Backpack", quantity: 1, itemKey: "srd-2024_backpack" },
    { name: "Bedroll", quantity: 1, itemKey: "srd-2024_bedroll" },
    { name: "Bell", quantity: 1, itemKey: "srd-2024_bell" },
    { name: "Bullseye Lantern", quantity: 1 },
    { name: "Costume", quantity: 3, itemKey: "srd-2024_costume" },
    { name: "Mirror", quantity: 1, itemKey: "srd-2024_mirror" },
    { name: "Oil", quantity: 8, itemKey: "srd-2024_oil" },
    { name: "Rations", quantity: 9, itemKey: "srd-2024_rations" },
    { name: "Tinderbox", quantity: 1, itemKey: "srd-2024_tinderbox" },
    { name: "Waterskin", quantity: 1, itemKey: "srd-2024_waterskin" }
  ],
  "srd-2024_explorers-pack": [
    { name: "Backpack", quantity: 1, itemKey: "srd-2024_backpack" },
    { name: "Bedroll", quantity: 1, itemKey: "srd-2024_bedroll" },
    { name: "Oil", quantity: 2, itemKey: "srd-2024_oil" },
    { name: "Rations", quantity: 10, itemKey: "srd-2024_rations" },
    { name: "Rope", quantity: 1, itemKey: "srd-2024_rope" },
    { name: "Tinderbox", quantity: 1, itemKey: "srd-2024_tinderbox" },
    { name: "Torch", quantity: 10, itemKey: "srd-2024_torch" },
    { name: "Waterskin", quantity: 1, itemKey: "srd-2024_waterskin" }
  ],
  "srd-2024_priests-pack": [
    { name: "Backpack", quantity: 1, itemKey: "srd-2024_backpack" },
    { name: "Blanket", quantity: 1, itemKey: "srd-2024_blanket" },
    { name: "Holy Water", quantity: 1, itemKey: "srd-2024_holy-water" },
    { name: "Lamp", quantity: 1, itemKey: "srd-2024_lamp" },
    { name: "Rations", quantity: 7, itemKey: "srd-2024_rations" },
    { name: "Robe", quantity: 1, itemKey: "srd-2024_robe" },
    { name: "Tinderbox", quantity: 1, itemKey: "srd-2024_tinderbox" }
  ],
  "srd-2024_scholars-pack": [
    { name: "Backpack", quantity: 1, itemKey: "srd-2024_backpack" },
    { name: "Book", quantity: 1, itemKey: "srd-2024_book" },
    { name: "Ink", quantity: 1, itemKey: "srd-2024_ink" },
    { name: "Ink Pen", quantity: 1, itemKey: "srd-2024_ink-pen" },
    { name: "Lamp", quantity: 1, itemKey: "srd-2024_lamp" },
    { name: "Oil", quantity: 10, itemKey: "srd-2024_oil" },
    { name: "Parchment", quantity: 10, itemKey: "srd-2024_parchment" },
    { name: "Tinderbox", quantity: 1, itemKey: "srd-2024_tinderbox" }
  ]
};

function toMissingReference(
  entry: EquipmentPackManifestEntry,
  expectedItemKey: string | null
): ItemPackMissingReference {
  return {
    name: entry.name,
    quantity: entry.quantity,
    expectedItemKey
  };
}

function getDocumentPriority(record: Pick<Open5eItemRecord, "document">) {
  const documentKey = record.document?.key ?? "";
  const matchedPriority = PREFERRED_ITEM_DOCUMENT_KEYS.findIndex((key) => key === documentKey);

  return matchedPriority === -1 ? PREFERRED_ITEM_DOCUMENT_KEYS.length : matchedPriority;
}

function comparePreferredItemRecords(left: Open5eItemRecord, right: Open5eItemRecord) {
  return (
    getDocumentPriority(left) - getDocumentPriority(right) ||
    (left.document?.key ?? "").localeCompare(right.document?.key ?? "") ||
    (left.key ?? "").localeCompare(right.key ?? "") ||
    (left.name ?? "").localeCompare(right.name ?? "")
  );
}

function pickPreferredItemRecord(records: Open5eItemRecord[]) {
  return [...records].sort(comparePreferredItemRecords)[0] ?? null;
}

export async function getItemPackContentsByKey(
  key: string
): Promise<ItemPackContentsRecord | null> {
  const record = await ItemModel.findOne({ key }).lean<Open5eItemRecord | null>().exec();

  if (!record || record.category?.key !== "equipment-pack") {
    return null;
  }

  const manifestEntries = equipmentPackManifest[key] ?? [];
  const itemKeys = manifestEntries.flatMap((entry) => (entry.itemKey ? [entry.itemKey] : []));
  const itemNames = manifestEntries.map((entry) => entry.name);
  const referencedItems =
    itemKeys.length > 0 || itemNames.length > 0
      ? await ItemModel.find({
          $or: [
            {
              key: {
                $in: itemKeys
              }
            },
            {
              name: {
                $in: itemNames
              }
            }
          ]
        })
          .lean<Open5eItemRecord[]>()
          .exec()
      : [];
  const referencedItemsByKey = new Map(
    referencedItems
      .filter((entry): entry is Open5eItemRecord & { key: string } => typeof entry.key === "string")
      .map((entry) => [entry.key, entry])
  );
  const referencedItemsByName = referencedItems.reduce<Map<string, Open5eItemRecord[]>>(
    (itemsByName, entry) => {
      const name = typeof entry.name === "string" ? entry.name : "";

      if (!name) {
        return itemsByName;
      }

      const existingEntries = itemsByName.get(name) ?? [];
      existingEntries.push(entry);
      itemsByName.set(name, existingEntries);
      return itemsByName;
    },
    new Map()
  );

  return {
    packKey: record.key ?? key,
    packName: record.name ?? "",
    contents: manifestEntries.flatMap((entry) => {
      const referencedItem =
        (entry.itemKey ? referencedItemsByKey.get(entry.itemKey) : null) ??
        pickPreferredItemRecord(referencedItemsByName.get(entry.name) ?? []);

      if (!referencedItem) {
        return [];
      }

      return [
        {
          quantity: entry.quantity,
          item: serializeItemRecord(referencedItem)
        }
      ];
    }),
    missingReferences: manifestEntries.flatMap((entry) => {
      const hasResolvedItem = Boolean(
        (entry.itemKey ? referencedItemsByKey.get(entry.itemKey) : null) ??
          pickPreferredItemRecord(referencedItemsByName.get(entry.name) ?? [])
      );

      return hasResolvedItem
        ? []
        : [toMissingReference(entry, entry.itemKey ?? null)];
    })
  };
}
