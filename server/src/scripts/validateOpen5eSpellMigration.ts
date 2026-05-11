import { pathToFileURL, fileURLToPath } from "node:url";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type SpellEntry = {
  id: string;
  name: string;
  source?: {
    documentKey?: string;
  };
  legacyIds?: string[];
  legacyNames?: string[];
};

type SpellAliasEntry = {
  legacyId: string;
  legacyName: string;
  canonicalId: string;
  canonicalName: string;
};

type SpellModule = {
  spellEntries?: unknown;
  spellAliasEntries?: SpellAliasEntry[];
  getSpellEntryById?: (id: string) => SpellEntry | null;
  getSpellEntryByName?: (name: string) => SpellEntry | null;
};

type LoadedSpellModule = {
  spellEntries: unknown[];
  spellAliasEntries: SpellAliasEntry[];
  getSpellEntryById: (id: string) => SpellEntry | null;
  getSpellEntryByName: (name: string) => SpellEntry | null;
};

type Open5eSpellRecord = {
  name?: string;
  document?: {
    key?: string;
  };
};

type Open5eSpellPage = {
  results?: Open5eSpellRecord[];
};

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const workspaceRoot = path.resolve(currentDir, "../../..");
const appSrcRoot = path.join(workspaceRoot, "app/src");
const appSpellsRoot = path.join(appSrcRoot, "codex/spells");
const open5eSpellsRoot = path.join(workspaceRoot, "server/data/open5e/spells");
const srd2024DocumentKey = "srd-2024";
const expectedSrd2024SpellCount = 339;
const expectedLegacySpellCount = 232;
const expectedTotalSpellCount = expectedSrd2024SpellCount + expectedLegacySpellCount;
const expectedAliasCount = 22;
const nonSpellIdLiterals = new Set([
  "spell-drawer-title",
  "spell-list",
  "spell-management-title",
  "spell-mage-armor-self",
  "spell-mastery",
  "spell-mastery-1-",
  "spell-mastery-2-",
  "spell-recall",
  "spell-slot",
  "spell-slot-actions-title",
  "spell-slot-to-wild-shape",
  "spell-slots",
  "spell-thief"
]);

function isSpellEntry(value: unknown): value is SpellEntry {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as { id?: unknown }).id === "string" &&
    typeof (value as { name?: unknown }).name === "string"
  );
}

function getFetchDateArg(): string | null {
  const fetchDateArg = process.argv.find((arg) => arg.startsWith("--fetch-date="));
  return fetchDateArg ? fetchDateArg.slice("--fetch-date=".length) : null;
}

async function getSnapshotDir(): Promise<string> {
  const fetchDate = getFetchDateArg();

  if (fetchDate) {
    return path.join(open5eSpellsRoot, `fetch-${fetchDate}`);
  }

  const entries = await readdir(open5eSpellsRoot, { withFileTypes: true });
  const latestFetchDir = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("fetch-"))
    .map((entry) => entry.name)
    .sort()
    .at(-1);

  if (!latestFetchDir) {
    throw new Error(`No Open5e spell snapshot found in ${open5eSpellsRoot}`);
  }

  return path.join(open5eSpellsRoot, latestFetchDir);
}

async function loadOpen5eSpellRecords(snapshotDir: string): Promise<Open5eSpellRecord[]> {
  const pageFiles = (await readdir(snapshotDir))
    .filter((fileName) => /^page-\d+\.json$/.test(fileName))
    .sort((left, right) => {
      const leftPage = Number(left.match(/\d+/)?.[0] ?? 0);
      const rightPage = Number(right.match(/\d+/)?.[0] ?? 0);
      return leftPage - rightPage;
    });
  const records: Open5eSpellRecord[] = [];

  for (const pageFile of pageFiles) {
    const page = JSON.parse(
      await readFile(path.join(snapshotDir, pageFile), "utf8")
    ) as Open5eSpellPage;

    records.push(...(page.results ?? []));
  }

  return records;
}

async function loadSpellModule(): Promise<LoadedSpellModule> {
  const spellsModule = (await import(pathToFileURL(path.join(appSpellsRoot, "index.ts")).href)) as SpellModule;

  if (
    !Array.isArray(spellsModule.spellEntries) ||
    !Array.isArray(spellsModule.spellAliasEntries) ||
    typeof spellsModule.getSpellEntryById !== "function" ||
    typeof spellsModule.getSpellEntryByName !== "function"
  ) {
    throw new Error("Could not load spellEntries, aliases, and lookup functions.");
  }

  return spellsModule as LoadedSpellModule;
}

async function listSourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(entryPath)));
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function addFailure(failures: string[], message: string) {
  failures.push(message);
}

async function main() {
  const failures: string[] = [];
  const spellModule = await loadSpellModule();
  const spellEntries = spellModule.spellEntries.filter(isSpellEntry);
  const srd2024Entries = spellEntries.filter(
    (entry) => entry.source?.documentKey === srd2024DocumentKey
  );
  const legacyEntries = spellEntries.filter(
    (entry) => entry.source?.documentKey !== srd2024DocumentKey
  );

  if (spellEntries.length !== expectedTotalSpellCount) {
    addFailure(
      failures,
      `Expected ${expectedTotalSpellCount} total spells, found ${spellEntries.length}.`
    );
  }

  if (srd2024Entries.length !== expectedSrd2024SpellCount) {
    addFailure(
      failures,
      `Expected ${expectedSrd2024SpellCount} srd-2024 spells, found ${srd2024Entries.length}.`
    );
  }

  if (legacyEntries.length !== expectedLegacySpellCount) {
    addFailure(
      failures,
      `Expected ${expectedLegacySpellCount} legacy spells, found ${legacyEntries.length}.`
    );
  }

  if (spellModule.spellAliasEntries.length !== expectedAliasCount) {
    addFailure(
      failures,
      `Expected ${expectedAliasCount} spell aliases, found ${spellModule.spellAliasEntries.length}.`
    );
  }

  const ids = new Set<string>();
  const names = new Set<string>();

  spellEntries.forEach((entry) => {
    if (ids.has(entry.id)) {
      addFailure(failures, `Duplicate spell id: ${entry.id}`);
    }

    ids.add(entry.id);

    const normalizedName = entry.name.trim().toLowerCase();

    if (names.has(normalizedName)) {
      addFailure(failures, `Duplicate spell name: ${entry.name}`);
    }

    names.add(normalizedName);
  });

  spellModule.spellAliasEntries.forEach((alias) => {
    const canonicalById = spellModule.getSpellEntryById(alias.canonicalId);
    const legacyById = spellModule.getSpellEntryById(alias.legacyId);
    const canonicalByName = spellModule.getSpellEntryByName(alias.canonicalName);
    const legacyByName = spellModule.getSpellEntryByName(alias.legacyName);

    if (!canonicalById) {
      addFailure(failures, `Alias canonical id does not resolve: ${alias.canonicalId}`);
    }

    if (!legacyById || legacyById.id !== alias.canonicalId) {
      addFailure(
        failures,
        `Alias legacy id ${alias.legacyId} does not resolve to ${alias.canonicalId}.`
      );
    }

    if (!canonicalByName) {
      addFailure(failures, `Alias canonical name does not resolve: ${alias.canonicalName}`);
    }

    if (!legacyByName || legacyByName.id !== alias.canonicalId) {
      addFailure(
        failures,
        `Alias legacy name ${alias.legacyName} does not resolve to ${alias.canonicalName}.`
      );
    }
  });

  const snapshotDir = await getSnapshotDir();
  const srd2024Records = (await loadOpen5eSpellRecords(snapshotDir)).filter(
    (record) => record.document?.key === srd2024DocumentKey
  );

  srd2024Records.forEach((record) => {
    if (!record.name) {
      return;
    }

    const spell = spellModule.getSpellEntryByName(record.name);

    if (!spell || spell.source?.documentKey !== srd2024DocumentKey) {
      addFailure(failures, `Missing srd-2024 spell record: ${record.name}`);
    }
  });

  const sourceFiles = await listSourceFiles(appSrcRoot);
  const spellIdPattern = /["'`]((?:spell-[a-z0-9-]+))["'`]/g;
  const spellLinkPattern = /<spell:([^>]+)>/g;

  for (const filePath of sourceFiles) {
    const contents = await readFile(filePath, "utf8");

    for (const match of contents.matchAll(spellIdPattern)) {
      const spellId = match[1];

      if (!spellId || nonSpellIdLiterals.has(spellId) || spellId.startsWith("spell-slot-")) {
        continue;
      }

      if (!spellModule.getSpellEntryById(spellId)) {
        addFailure(failures, `Unresolved spell id ${spellId} in ${filePath}`);
      }
    }

    for (const match of contents.matchAll(spellLinkPattern)) {
      const spellName = match[1]?.trim();

      if (spellName && !spellName.includes("([^") && !spellModule.getSpellEntryByName(spellName)) {
        addFailure(failures, `Unresolved spell link ${spellName} in ${filePath}`);
      }
    }
  }

  const report = {
    totalSpells: spellEntries.length,
    srd2024Spells: srd2024Entries.length,
    legacySpells: legacyEntries.length,
    aliases: spellModule.spellAliasEntries.length,
    snapshotSrd2024Records: srd2024Records.length,
    failures: failures.length
  };

  console.log(JSON.stringify(report, null, 2));

  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
