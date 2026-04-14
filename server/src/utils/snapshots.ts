import { readdir } from "node:fs/promises";
import { basename, isAbsolute, resolve } from "node:path";
import { AppError } from "../errors/AppError.js";
import { parseFetchDate } from "./dates.js";
import { pathExists } from "./filesystem.js";
import { SERVER_ROOT_DIR } from "./path.js";

function isSnapshotDirectoryName(value: string) {
  if (!value.startsWith("fetch-")) {
    return false;
  }

  try {
    parseFetchDate(value.slice("fetch-".length));
    return true;
  } catch {
    return false;
  }
}

export async function listSnapshotDirectories(rootDir: string) {
  if (!(await pathExists(rootDir))) {
    return [];
  }

  const entries = await readdir(rootDir, {
    withFileTypes: true
  });

  return entries
    .filter((entry) => entry.isDirectory() && isSnapshotDirectoryName(entry.name))
    .map((entry) => resolve(rootDir, entry.name))
    .sort((left, right) => {
      const leftName = basename(left).slice("fetch-".length);
      const rightName = basename(right).slice("fetch-".length);
      return parseFetchDate(leftName).getTime() - parseFetchDate(rightName).getTime();
    });
}

export async function getLatestSnapshotDirectory(rootDir: string) {
  const snapshotDirectories = await listSnapshotDirectories(rootDir);
  const latestSnapshotDirectory = snapshotDirectories.at(-1);

  if (!latestSnapshotDirectory) {
    throw new AppError("No snapshots were found.", 404, "SNAPSHOT_NOT_FOUND");
  }

  return latestSnapshotDirectory;
}

export async function getSnapshotPageFiles(snapshotDir: string) {
  const entries = await readdir(snapshotDir, {
    withFileTypes: true
  });

  const pageFiles = entries
    .filter((entry) => entry.isFile() && /^page-\d+\.json$/.test(entry.name))
    .map((entry) => resolve(snapshotDir, entry.name))
    .sort((left, right) => {
      const leftMatch = /page-(\d+)\.json$/.exec(left);
      const rightMatch = /page-(\d+)\.json$/.exec(right);
      return Number(leftMatch?.[1] ?? 0) - Number(rightMatch?.[1] ?? 0);
    });

  if (pageFiles.length === 0) {
    throw new AppError(`Snapshot directory "${snapshotDir}" does not contain any page JSON files.`, 404, "SNAPSHOT_EMPTY");
  }

  return pageFiles;
}

export async function resolveExistingPath(inputPath: string, bases: string[]) {
  const workspaceRootDir = resolve(SERVER_ROOT_DIR, "..");
  const candidatePaths = isAbsolute(inputPath)
    ? [inputPath]
    : [
        resolve(process.cwd(), inputPath),
        ...bases.map((base) => resolve(base, inputPath)),
        resolve(SERVER_ROOT_DIR, inputPath),
        resolve(workspaceRootDir, inputPath)
      ];
  const uniqueCandidatePaths = [...new Set(candidatePaths)];

  for (const candidatePath of uniqueCandidatePaths) {
    if (await pathExists(candidatePath)) {
      return candidatePath;
    }
  }

  throw new AppError(`Path "${inputPath}" could not be resolved.`, 404, "PATH_NOT_FOUND");
}
