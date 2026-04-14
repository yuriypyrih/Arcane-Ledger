import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type {
  ItemInventoryBooleanSummary,
  ItemInventoryCategorySummary,
  ItemInventoryFieldSummary,
  ItemInventoryNestedSummary,
  ItemInventoryReferenceCount,
  ItemInventoryRaritySummary,
  ItemSnapshotSchemaInventory,
  Open5eItemRecord,
  PlannedCategoryMapping
} from "../types/item.js";
import type { Open5eDocumentReference, Open5eKeyedReference } from "../types/open5e.js";
import { normalizeOpen5eItemRecord } from "./itemDataCorrectionService.js";
import { readSnapshotPage } from "./open5eFetchService.js";
import { getLatestSnapshotDirectory, getSnapshotPageFiles, resolveExistingPath } from "../utils/snapshots.js";

const DEFAULT_OUTPUT_FILE_NAME = "schema-inventory.json";
const MAX_CATEGORY_SAMPLES = 3;
const MISSING_REFERENCE_KEY = "__missing__";

const PLANNED_CATEGORY_MAPPINGS: Record<string, PlannedCategoryMapping> = {
  weapon: {
    defaultTargetCategory: "Weapons",
    magicItemTargetCategory: "Magic Items"
  },
  armor: {
    defaultTargetCategory: "Armor",
    magicItemTargetCategory: "Magic Items"
  },
  shield: {
    defaultTargetCategory: "Shields"
  },
  ammunition: {
    defaultTargetCategory: "Ammunition"
  },
  "adventuring-gear": {
    defaultTargetCategory: "Adventuring Gear"
  },
  tools: {
    defaultTargetCategory: "Tools & Kits"
  },
  poison: {
    defaultTargetCategory: "Potions & Consumables"
  },
  potion: {
    defaultTargetCategory: "Potions & Consumables"
  },
  "land-vehicle": {
    defaultTargetCategory: "Vehicles"
  },
  "waterborne-vehicle": {
    defaultTargetCategory: "Vehicles"
  },
  ring: {
    defaultTargetCategory: "Magic Items"
  },
  rod: {
    defaultTargetCategory: "Magic Items"
  },
  wand: {
    defaultTargetCategory: "Magic Items"
  },
  staff: {
    defaultTargetCategory: "Magic Items"
  },
  "wondrous-item": {
    defaultTargetCategory: "Magic Items"
  },
  "trade-good": {
    defaultTargetCategory: "Miscellaneous / Trade Goods"
  }
};

export type InspectItemSnapshotOptions = {
  rootDir: string;
  sourceDir?: string;
  outputFileName?: string;
};

type CountBucket = {
  key: string;
  name: string;
  count: number;
};

type CategoryBucket = CountBucket & {
  magicItemCount: number;
  nonMagicItemCount: number;
  sampleItems: Array<{ key: string; name: string }>;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toItemRecord(value: unknown): Open5eItemRecord | null {
  return isObjectRecord(value) ? normalizeOpen5eItemRecord(value as Open5eItemRecord) : null;
}

function getValueType(value: unknown) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  return typeof value;
}

function sortCountEntries(entries: CountBucket[]): ItemInventoryReferenceCount[] {
  return [...entries].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.key.localeCompare(right.key);
  });
}

function summarizeRecordFields(records: Record<string, unknown>[]): Record<string, ItemInventoryFieldSummary> {
  const fieldNames = [...new Set(records.flatMap((record) => Object.keys(record)))].sort((left, right) =>
    left.localeCompare(right)
  );

  return Object.fromEntries(
    fieldNames.map((fieldName) => {
      let presentCount = 0;
      let missingCount = 0;
      let nullCount = 0;
      const typeCounts: Record<string, number> = {};

      for (const record of records) {
        if (!(fieldName in record)) {
          missingCount += 1;
          continue;
        }

        presentCount += 1;
        const value = record[fieldName];
        const valueType = getValueType(value);
        typeCounts[valueType] = (typeCounts[valueType] ?? 0) + 1;

        if (value === null) {
          nullCount += 1;
        }
      }

      return [
        fieldName,
        {
          presentCount,
          missingCount,
          nullCount,
          nonNullCount: presentCount - nullCount,
          typeCounts
        }
      ];
    })
  );
}

function summarizeNestedField(records: Open5eItemRecord[], fieldName: "weapon" | "armor"): ItemInventoryNestedSummary {
  let presentCount = 0;
  let missingCount = 0;
  let nullCount = 0;
  let objectCount = 0;
  let nonObjectCount = 0;
  const nestedRecords: Record<string, unknown>[] = [];

  for (const record of records) {
    if (!(fieldName in record)) {
      missingCount += 1;
      continue;
    }

    presentCount += 1;
    const value = record[fieldName];

    if (value === null) {
      nullCount += 1;
      continue;
    }

    if (!isObjectRecord(value)) {
      nonObjectCount += 1;
      continue;
    }

    objectCount += 1;
    nestedRecords.push(value);
  }

  return {
    presentCount,
    missingCount,
    nullCount,
    objectCount,
    nonObjectCount,
    fieldSummary: summarizeRecordFields(nestedRecords)
  };
}

function summarizeBooleanField(records: Open5eItemRecord[], fieldName: keyof Open5eItemRecord): ItemInventoryBooleanSummary {
  let trueCount = 0;
  let falseCount = 0;
  let nullCount = 0;
  let missingCount = 0;

  for (const record of records) {
    if (!(fieldName in record)) {
      missingCount += 1;
      continue;
    }

    const value = record[fieldName];

    if (value === null) {
      nullCount += 1;
      continue;
    }

    if (value === true) {
      trueCount += 1;
      continue;
    }

    if (value === false) {
      falseCount += 1;
      continue;
    }

    missingCount += 1;
  }

  return {
    trueCount,
    falseCount,
    nullCount,
    missingCount
  };
}

function getReference(value: unknown): Open5eKeyedReference | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  return typeof value.key === "string" && typeof value.name === "string" && typeof value.url === "string"
    ? (value as Open5eKeyedReference)
    : null;
}

function getDocumentReference(value: unknown): Open5eDocumentReference | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  return typeof value.key === "string" && typeof value.name === "string"
    ? (value as Open5eDocumentReference)
    : null;
}

function pushReferenceCount(map: Map<string, CountBucket>, key: string, name: string) {
  const existing = map.get(key);

  if (existing) {
    existing.count += 1;
    return;
  }

  map.set(key, {
    key,
    name,
    count: 1
  });
}

function summarizeRarity(records: Open5eItemRecord[]): ItemInventoryRaritySummary {
  const rarityCounts = new Map<string, CountBucket>();
  let presentCount = 0;
  let missingCount = 0;
  let nullCount = 0;

  for (const record of records) {
    if (!("rarity" in record)) {
      missingCount += 1;
      continue;
    }

    presentCount += 1;
    const rarity = getReference(record.rarity);

    if (!rarity) {
      nullCount += 1;
      continue;
    }

    pushReferenceCount(rarityCounts, rarity.key, rarity.name);
  }

  return {
    presentCount,
    missingCount,
    nullCount,
    nonNullCount: presentCount - nullCount,
    byKey: sortCountEntries([...rarityCounts.values()])
  };
}

function createMissingCategoryBucket(): CategoryBucket {
  return {
    key: MISSING_REFERENCE_KEY,
    name: "Missing Category",
    count: 0,
    magicItemCount: 0,
    nonMagicItemCount: 0,
    sampleItems: []
  };
}

function summarizeCategories(records: Open5eItemRecord[]): ItemInventoryCategorySummary[] {
  const categoryCounts = new Map<string, CategoryBucket>();

  for (const record of records) {
    const category = getReference(record.category);
    const categoryKey = category?.key ?? MISSING_REFERENCE_KEY;
    const bucket = categoryCounts.get(categoryKey) ?? createMissingCategoryBucket();

    bucket.key = categoryKey;
    bucket.name = category?.name ?? "Missing Category";
    bucket.count += 1;

    if (record.is_magic_item === true) {
      bucket.magicItemCount += 1;
    } else {
      bucket.nonMagicItemCount += 1;
    }

    if (
      typeof record.key === "string" &&
      typeof record.name === "string" &&
      !bucket.sampleItems.some((sample) => sample.key === record.key)
    ) {
      bucket.sampleItems.push({
        key: record.key,
        name: record.name
      });
    }

    categoryCounts.set(categoryKey, bucket);
  }

  return [...categoryCounts.values()]
    .map((bucket) => ({
      key: bucket.key,
      name: bucket.name,
      count: bucket.count,
      magicItemCount: bucket.magicItemCount,
      nonMagicItemCount: bucket.nonMagicItemCount,
      sampleItems: [...bucket.sampleItems]
        .sort((left, right) => left.name.localeCompare(right.name))
        .slice(0, MAX_CATEGORY_SAMPLES),
      plannedMapping: PLANNED_CATEGORY_MAPPINGS[bucket.key] ?? null
    }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.key.localeCompare(right.key);
    });
}

function summarizeDocuments(records: Open5eItemRecord[]): ItemInventoryReferenceCount[] {
  const documentCounts = new Map<string, CountBucket>();

  for (const record of records) {
    const document = getDocumentReference(record.document);
    const key = document?.key ?? MISSING_REFERENCE_KEY;
    const name = document?.display_name ?? document?.name ?? "Missing Document";

    pushReferenceCount(documentCounts, key, name);
  }

  return sortCountEntries([...documentCounts.values()]);
}

function summarizeGameSystems(records: Open5eItemRecord[]): ItemInventoryReferenceCount[] {
  const gameSystemCounts = new Map<string, CountBucket>();

  for (const record of records) {
    const document = getDocumentReference(record.document);
    const gameSystem = getReference(document?.gamesystem);
    const key = gameSystem?.key ?? MISSING_REFERENCE_KEY;
    const name = gameSystem?.name ?? "Missing Game System";

    pushReferenceCount(gameSystemCounts, key, name);
  }

  return sortCountEntries([...gameSystemCounts.values()]);
}

async function loadSnapshotItems(snapshotDir: string) {
  const pageFiles = await getSnapshotPageFiles(snapshotDir);
  const rawItems: Open5eItemRecord[] = [];
  const uniqueItems = new Map<string, Open5eItemRecord>();
  const duplicateKeys = new Set<string>();
  let reportedTotalCount = 0;

  for (const pageFile of pageFiles) {
    const payload = await readSnapshotPage(pageFile);

    if (!Array.isArray(payload.results)) {
      continue;
    }

    reportedTotalCount = Math.max(reportedTotalCount, payload.count);

    for (const rawResult of payload.results) {
      const item = toItemRecord(rawResult);

      if (!item) {
        continue;
      }

      rawItems.push(item);

      if (typeof item.key !== "string" || item.key.length === 0) {
        continue;
      }

      if (uniqueItems.has(item.key)) {
        duplicateKeys.add(item.key);
      }

      uniqueItems.set(item.key, item);
    }
  }

  return {
    pageFiles,
    rawItems,
    uniqueItems: [...uniqueItems.values()],
    reportedTotalCount,
    duplicateKeyCount: duplicateKeys.size
  };
}

async function resolveSourceDirectory(rootDir: string, sourceDir: string | undefined) {
  if (!sourceDir) {
    return getLatestSnapshotDirectory(rootDir);
  }

  return resolveExistingPath(sourceDir, [process.cwd(), rootDir, resolve(rootDir, "..", "..", "..")]);
}

export async function inspectItemSnapshot({
  rootDir,
  sourceDir,
  outputFileName = DEFAULT_OUTPUT_FILE_NAME
}: InspectItemSnapshotOptions) {
  const resolvedSourceDir = await resolveSourceDirectory(rootDir, sourceDir);
  const { pageFiles, rawItems, uniqueItems, reportedTotalCount, duplicateKeyCount } = await loadSnapshotItems(
    resolvedSourceDir
  );
  const outputPath = join(resolvedSourceDir, outputFileName);
  const categorySummary = summarizeCategories(uniqueItems);
  const documentSummary = summarizeDocuments(uniqueItems);
  const gameSystemSummary = summarizeGameSystems(uniqueItems);

  const inventory: ItemSnapshotSchemaInventory = {
    generatedAt: new Date().toISOString(),
    snapshot: {
      sourceDir: resolvedSourceDir,
      outputPath,
      pageFileCount: pageFiles.length,
      reportedTotalCount,
      rawRecordCount: rawItems.length,
      uniqueItemCountByKey: uniqueItems.length,
      duplicateRecordCount: rawItems.length - uniqueItems.length,
      duplicateKeyCount
    },
    reconciliation: {
      categoryTotalMatchesUniqueItems:
        categorySummary.reduce((total, entry) => total + entry.count, 0) === uniqueItems.length,
      documentTotalMatchesUniqueItems:
        documentSummary.reduce((total, entry) => total + entry.count, 0) === uniqueItems.length,
      gameSystemTotalMatchesUniqueItems:
        gameSystemSummary.reduce((total, entry) => total + entry.count, 0) === uniqueItems.length
    },
    countsByCategory: categorySummary,
    countsByDocument: documentSummary,
    countsByGameSystem: gameSystemSummary,
    topLevelFieldSummary: summarizeRecordFields(uniqueItems),
    nestedFieldSummary: {
      weapon: summarizeNestedField(uniqueItems, "weapon"),
      armor: summarizeNestedField(uniqueItems, "armor")
    },
    flags: {
      isMagicItem: summarizeBooleanField(uniqueItems, "is_magic_item"),
      requiresAttunement: summarizeBooleanField(uniqueItems, "requires_attunement"),
      rarity: summarizeRarity(uniqueItems)
    },
    unmappedCategories: categorySummary.filter((entry) => entry.plannedMapping === null)
  };

  await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

  return {
    sourceDir: resolvedSourceDir,
    outputPath,
    pageFileCount: pageFiles.length,
    rawRecordCount: rawItems.length,
    uniqueItemCount: uniqueItems.length,
    unmappedCategoryCount: inventory.unmappedCategories.length
  };
}
