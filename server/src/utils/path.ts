import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CURRENT_FILE_PATH = fileURLToPath(import.meta.url);

export const SERVER_ROOT_DIR = resolve(dirname(CURRENT_FILE_PATH), "..", "..");
