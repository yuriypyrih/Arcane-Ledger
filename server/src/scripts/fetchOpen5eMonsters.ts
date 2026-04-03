import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { fetchMonsterSnapshot } from "../services/open5eFetchService.js";
import { getOption, hasFlag, parseCliArgs } from "../utils/cli.js";

async function run() {
  const config = getAppConfig();
  const args = parseCliArgs();
  const overwrite = hasFlag(args, "overwrite");
  const fetchDate = getOption(args, "fetch-date");

  const result = await fetchMonsterSnapshot({
    rootDir: config.open5eMonstersRootDir,
    monstersUrl: config.open5eMonstersUrl,
    requestDelayMs: config.open5eRequestDelayMs,
    overwrite,
    fetchDate
  });

  console.info(
    `Saved ${result.pageCount} monster page(s) from Open5e into ${result.snapshotDir} (${result.totalCount} records reported).`
  );
}

void run().catch((error: unknown) => {
  if (error instanceof AppError) {
    console.error(error.message);
  } else {
    console.error("Failed to fetch Open5e monsters.", error);
  }

  process.exitCode = 1;
});
