import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { inspectItemSnapshot } from "../services/itemSnapshotInspectionService.js";
import { getOption, parseCliArgs } from "../utils/cli.js";

async function run() {
  const config = getAppConfig();
  const args = parseCliArgs();
  const sourceDir = getOption(args, "source");

  const result = await inspectItemSnapshot({
    rootDir: config.open5eItemsRootDir,
    sourceDir
  });

  console.info(
    `Wrote item schema inventory to ${result.outputPath} from ${result.pageFileCount} page(s) with ${result.uniqueItemCount} unique item record(s). ${result.unmappedCategoryCount} category bucket(s) remain unmapped.`
  );
}

void run().catch((error: unknown) => {
  if (error instanceof AppError) {
    console.error(error.message);
  } else {
    console.error("Failed to inspect Open5e item snapshot.", error);
  }

  process.exitCode = 1;
});
