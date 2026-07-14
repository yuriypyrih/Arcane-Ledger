import { spawn } from "node:child_process";
import { createReadStream, existsSync } from "node:fs";
import { chmod, mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { createGunzip } from "node:zlib";
import { parse } from "dotenv";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const SERVER_DIRECTORY = resolve(SCRIPT_DIRECTORY, "../..");
const BACKUP_ENV_PATH = resolve(SERVER_DIRECTORY, ".env.backup.local");
const BACKUP_DIRECTORY = resolve(SERVER_DIRECTORY, "backups");

function getDatedBackupFileName(now = new Date()) {
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  return `arcane_ledger_back_up_${day}_${month}_${year}.archive.gz`;
}

function getMongoDumpConfig(uri) {
  const trimmedUri = uri.trim();

  if (!trimmedUri.startsWith("mongodb://") && !trimmedUri.startsWith("mongodb+srv://")) {
    throw new Error("MONGODB_BACKUP_URI must start with mongodb:// or mongodb+srv://.");
  }

  if (trimmedUri.includes("${")) {
    throw new Error(
      "MONGODB_BACKUP_URI must contain the complete credentials, not environment placeholders."
    );
  }

  const match = trimmedUri.match(/^(mongodb(?:\+srv)?:\/\/)([^/?#]+)(\/[^#]*)?$/);

  if (!match?.[1] || !match[2]) {
    throw new Error("MONGODB_BACKUP_URI is not a valid MongoDB connection URI.");
  }

  const uriSuffix = match[3] ?? "";
  const databasePath = uriSuffix.split("?", 1)[0];

  if (databasePath !== "/arcane_ledger") {
    throw new Error(
      "MONGODB_BACKUP_URI must include /arcane_ledger after the host and before any query options."
    );
  }

  const authority = match[2];
  const credentialSeparatorIndex = authority.lastIndexOf("@");

  if (credentialSeparatorIndex < 0) {
    throw new Error("MONGODB_BACKUP_URI must include a username and password.");
  }

  const userInfo = authority.slice(0, credentialSeparatorIndex);
  const hostList = authority.slice(credentialSeparatorIndex + 1);
  const passwordSeparatorIndex = userInfo.indexOf(":");

  if (passwordSeparatorIndex <= 0 || passwordSeparatorIndex === userInfo.length - 1) {
    throw new Error("MONGODB_BACKUP_URI must include a username and password.");
  }

  const encodedUsername = userInfo.slice(0, passwordSeparatorIndex);
  const encodedPassword = userInfo.slice(passwordSeparatorIndex + 1);
  let password;

  try {
    password = decodeURIComponent(encodedPassword);
  } catch {
    throw new Error("The password in MONGODB_BACKUP_URI is not valid percent-encoded text.");
  }

  return {
    password,
    uri: `${match[1]}${encodedUsername}@${hostList}${match[3] ?? ""}`
  };
}

async function runCommand(command, args) {
  await new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "inherit", "inherit"]
    });

    child.once("error", (error) => {
      rejectCommand(
        error.code === "ENOENT"
          ? new Error(
              `Could not find ${command}. Install the MongoDB Database Tools and try again.`
            )
          : error
      );
    });

    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolveCommand();
        return;
      }

      rejectCommand(
        new Error(
          signal
            ? `${command} was terminated by signal ${signal}.`
            : `${command} exited with code ${String(code)}.`
        )
      );
    });
  });
}

async function verifyGzipArchive(archivePath) {
  const discardOutput = new Writable({
    write(_chunk, _encoding, callback) {
      callback();
    }
  });

  await pipeline(createReadStream(archivePath), createGunzip(), discardOutput);
}

async function loadMongoDumpConfig() {
  if (!existsSync(BACKUP_ENV_PATH)) {
    throw new Error(
      [
        `Missing ${BACKUP_ENV_PATH}.`,
        "Copy server/.env.backup.example to server/.env.backup.local, then set MONGODB_BACKUP_URI."
      ].join(" ")
    );
  }

  const env = parse(await readFile(BACKUP_ENV_PATH));
  const backupUri = env.MONGODB_BACKUP_URI?.trim();

  if (!backupUri) {
    throw new Error(`MONGODB_BACKUP_URI is missing from ${BACKUP_ENV_PATH}.`);
  }

  return getMongoDumpConfig(backupUri);
}

async function backupMongoDatabase() {
  const mongoDumpConfig = await loadMongoDumpConfig();
  const backupFileName = getDatedBackupFileName();
  const backupPath = resolve(BACKUP_DIRECTORY, backupFileName);

  await mkdir(BACKUP_DIRECTORY, { recursive: true });

  if (existsSync(backupPath)) {
    throw new Error(
      `Backup already exists at ${backupPath}. Move or delete it before creating another backup today.`
    );
  }

  const temporaryDirectory = await mkdtemp(resolve(tmpdir(), "arcane-ledger-backup-"));
  const mongoConfigPath = resolve(temporaryDirectory, "mongodump.yml");
  const temporaryBackupPath = resolve(BACKUP_DIRECTORY, `.${backupFileName}.partial`);

  try {
    await writeFile(
      mongoConfigPath,
      [
        `uri: ${JSON.stringify(mongoDumpConfig.uri)}`,
        `password: ${JSON.stringify(mongoDumpConfig.password)}`,
        ""
      ].join("\n"),
      { mode: 0o600 }
    );

    process.stdout.write("Creating a best-effort live MongoDB backup...\n");
    await runCommand("mongodump", [
      `--config=${mongoConfigPath}`,
      `--archive=${temporaryBackupPath}`,
      "--gzip",
      "--db=arcane_ledger",
      "--numParallelCollections=1"
    ]);

    const backupStats = await stat(temporaryBackupPath);

    if (backupStats.size === 0) {
      throw new Error("mongodump created an empty backup archive.");
    }

    process.stdout.write("Verifying the compressed backup archive...\n");
    await verifyGzipArchive(temporaryBackupPath);
    await chmod(temporaryBackupPath, 0o600);
    await rename(temporaryBackupPath, backupPath);

    process.stdout.write(`Backup created successfully: ${backupPath}\n`);
  } finally {
    await rm(temporaryBackupPath, { force: true });
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
}

void backupMongoDatabase().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);

  process.stderr.write(`Database backup failed. ${message}\n`);
  process.exitCode = 1;
});
