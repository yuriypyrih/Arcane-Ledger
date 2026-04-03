import { join } from "node:path";
import { connectToDatabase, disconnectFromDatabase } from "../config/database.js";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { importMonsterSnapshot } from "../services/monsterImportService.js";
import { getOption, hasFlag, parseCliArgs } from "../utils/cli.js";

// Change this folder name when you want to import a different fetched snapshot by default.
const DEFAULT_IMPORT_SNAPSHOT_DIRECTORY = "fetch-04-03-2026";

async function run() {
  const config = getAppConfig();
  const args = parseCliArgs();
  const sourceDir =
    getOption(args, "source") ??
    (DEFAULT_IMPORT_SNAPSHOT_DIRECTORY
      ? join(config.open5eMonstersRootDir, DEFAULT_IMPORT_SNAPSHOT_DIRECTORY)
      : undefined);
  const replace = hasFlag(args, "replace");

  await connectToDatabase();

  try {
    const result = await importMonsterSnapshot({
      rootDir: config.open5eMonstersRootDir,
      sourceDir,
      replace
    });

    console.info(
      `Imported ${result.processedCount} monster record(s) from ${result.sourceDir}.${result.skippedRecords > 0 ? ` Skipped ${result.skippedRecords} invalid record(s).` : ""}`
    );
  } finally {
    await disconnectFromDatabase();
  }
}

void run().catch((error: unknown) => {
  if (error instanceof AppError) {
    console.error(error.message);
  } else {
    console.error("Failed to import monster snapshot.", error);
  }

  process.exitCode = 1;
});
