import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ItemModel } from "../models/Item.js";
import { normalizeOpen5eItemRecord } from "./itemDataCorrectionService.js";
import type { Open5eItemRecord } from "../types/item.js";
import type { Open5eListEnvelope } from "../types/open5e.js";
import { getLatestSnapshotDirectory, getSnapshotPageFiles, resolveExistingPath } from "../utils/snapshots.js";

export type ImportItemSnapshotOptions = {
  rootDir: string;
  sourceDir?: string;
  replace?: boolean;
};

type ImportableItemRecord = Open5eItemRecord & {
  key: string;
  name: string;
};

function isItemRecord(value: unknown): value is ImportableItemRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return typeof record.key === "string" && typeof record.name === "string";
}

async function loadSnapshotItems(snapshotDir: string) {
  const pageFiles = await getSnapshotPageFiles(snapshotDir);
  const uniqueItems = new Map<string, Open5eItemRecord>();
  let skippedRecords = 0;

  for (const pageFile of pageFiles) {
    const fileContents = await readFile(pageFile, "utf8");
    const payload = JSON.parse(fileContents) as Open5eListEnvelope<unknown>;

    if (!Array.isArray(payload.results)) {
      continue;
    }

    for (const result of payload.results) {
      if (!isItemRecord(result)) {
        skippedRecords += 1;
        continue;
      }

      uniqueItems.set(result.key, normalizeOpen5eItemRecord(result));
    }
  }

  return {
    items: [...uniqueItems.values()],
    skippedRecords
  };
}

export async function importItemSnapshot({
  rootDir,
  sourceDir,
  replace = false
}: ImportItemSnapshotOptions) {
  const resolvedSourceDir = sourceDir
    ? await resolveExistingPath(sourceDir, [process.cwd(), rootDir, resolve(rootDir, "..", "..", "..")])
    : await getLatestSnapshotDirectory(rootDir);
  const { items, skippedRecords } = await loadSnapshotItems(resolvedSourceDir);

  if (replace) {
    await ItemModel.deleteMany({});

    if (items.length > 0) {
      await ItemModel.insertMany(items, {
        ordered: false
      });
    }
  } else if (items.length > 0) {
    await ItemModel.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: { key: item.key },
          update: { $set: item },
          upsert: true
        }
      })),
      {
        ordered: false
      }
    );
  }

  return {
    sourceDir: resolvedSourceDir,
    replace,
    processedCount: items.length,
    skippedRecords
  };
}
