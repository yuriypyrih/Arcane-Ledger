import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { normalizeOpen5eItemSnapshotPayload } from "../services/itemDataCorrectionService.js";
import type { Open5eListEnvelope } from "../types/open5e.js";
import { getOption, parseCliArgs } from "../utils/cli.js";
import {
  getLatestSnapshotDirectory,
  getSnapshotPageFiles,
  resolveExistingPath
} from "../utils/snapshots.js";

async function run() {
  const config = getAppConfig();
  const args = parseCliArgs();
  const sourceDir = getOption(args, "source");
  const resolvedSourceDir = sourceDir
    ? await resolveExistingPath(sourceDir, [
        process.cwd(),
        config.open5eItemsRootDir,
        join(config.open5eItemsRootDir, "..", "..", "..")
      ])
    : await getLatestSnapshotDirectory(config.open5eItemsRootDir);
  const pageFiles = await getSnapshotPageFiles(resolvedSourceDir);
  let updatedPageCount = 0;
  let correctedRecordCount = 0;

  for (const pageFile of pageFiles) {
    const fileContents = await readFile(pageFile, "utf8");
    const payload = JSON.parse(fileContents) as Open5eListEnvelope<Record<string, unknown>>;
    const normalizedPayload = normalizeOpen5eItemSnapshotPayload(payload);
    const originalJson = JSON.stringify(payload);
    const normalizedJson = JSON.stringify(normalizedPayload);

    if (originalJson === normalizedJson) {
      continue;
    }

    const originalResults = Array.isArray(payload.results) ? payload.results : [];
    const normalizedResults = Array.isArray(normalizedPayload.results)
      ? normalizedPayload.results
      : [];

    correctedRecordCount += normalizedResults.reduce((count, entry, index) => {
      return JSON.stringify(entry) === JSON.stringify(originalResults[index]) ? count : count + 1;
    }, 0);
    updatedPageCount += 1;

    await writeFile(pageFile, `${JSON.stringify(normalizedPayload, null, 2)}\n`, "utf8");
  }

  console.info(
    `Normalized ${correctedRecordCount} item record(s) across ${updatedPageCount} snapshot page(s) in ${resolvedSourceDir}.`
  );
}

void run().catch((error: unknown) => {
  if (error instanceof AppError) {
    console.error(error.message);
  } else {
    console.error("Failed to normalize item snapshot.", error);
  }

  process.exitCode = 1;
});
