import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { MonsterModel } from "../models/Monster.js";
import type { MonsterRecord, Open5eListEnvelope } from "../types/monster.js";
import { getLatestSnapshotDirectory, getSnapshotPageFiles, resolveExistingPath } from "../utils/snapshots.js";

export type ImportMonsterSnapshotOptions = {
  rootDir: string;
  sourceDir?: string;
  replace?: boolean;
};

function isMonsterRecord(value: unknown): value is MonsterRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return typeof record.slug === "string" && typeof record.name === "string";
}

async function loadSnapshotMonsters(snapshotDir: string) {
  const pageFiles = await getSnapshotPageFiles(snapshotDir);
  const uniqueMonsters = new Map<string, MonsterRecord>();
  let skippedRecords = 0;

  for (const pageFile of pageFiles) {
    const fileContents = await readFile(pageFile, "utf8");
    const payload = JSON.parse(fileContents) as Open5eListEnvelope<unknown>;

    if (!Array.isArray(payload.results)) {
      continue;
    }

    for (const result of payload.results) {
      if (!isMonsterRecord(result)) {
        skippedRecords += 1;
        continue;
      }

      uniqueMonsters.set(result.slug, result);
    }
  }

  return {
    monsters: [...uniqueMonsters.values()],
    skippedRecords
  };
}

export async function importMonsterSnapshot({
  rootDir,
  sourceDir,
  replace = false
}: ImportMonsterSnapshotOptions) {
  const resolvedSourceDir = sourceDir
    ? await resolveExistingPath(sourceDir, [process.cwd(), rootDir, resolve(rootDir, "..", "..", "..")])
    : await getLatestSnapshotDirectory(rootDir);
  const { monsters, skippedRecords } = await loadSnapshotMonsters(resolvedSourceDir);

  if (replace) {
    await MonsterModel.deleteMany({});

    if (monsters.length > 0) {
      await MonsterModel.insertMany(monsters, {
        ordered: false
      });
    }
  } else if (monsters.length > 0) {
    await MonsterModel.bulkWrite(
      monsters.map((monster) => ({
        updateOne: {
          filter: { slug: monster.slug },
          update: { $set: monster },
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
    processedCount: monsters.length,
    skippedRecords
  };
}
