import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MonsterModel } from "../src/models/Monster.js";
import { importMonsterSnapshot } from "../src/services/monsterImportService.js";
import { createMonsterFixture } from "./helpers/createMonsterFixture.js";
import { clearTestDatabase, connectTestDatabase, disconnectTestDatabase } from "./helpers/mongo.js";

async function writeSnapshot(rootDir: string, snapshotName: string, pages: unknown[]) {
  const snapshotDir = join(rootDir, snapshotName);
  await mkdir(snapshotDir, { recursive: true });

  await Promise.all(
    pages.map((page, index) =>
      writeFile(join(snapshotDir, `page-${index + 1}.json`), `${JSON.stringify(page, null, 2)}\n`, "utf8")
    )
  );

  return snapshotDir;
}

describe("importMonsterSnapshot", () => {
  let rootDir = "";

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await connectTestDatabase("dnd_companion_import");
    await MonsterModel.init();
  });

  beforeEach(async () => {
    rootDir = await mkdtemp(join(tmpdir(), "dnd-monster-import-"));
  });

  afterEach(async () => {
    await clearTestDatabase();
    await import("node:fs/promises").then(({ rm }) => rm(rootDir, { recursive: true, force: true }));
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it("imports the latest snapshot when no source directory is provided", async () => {
    await writeSnapshot(rootDir, "fetch-03-21-2026", [
      {
        count: 1,
        next: null,
        previous: null,
        results: [createMonsterFixture({ slug: "older-wolf", name: "Older Wolf" })]
      }
    ]);
    await writeSnapshot(rootDir, "fetch-03-22-2026", [
      {
        count: 2,
        next: null,
        previous: null,
        results: [
          createMonsterFixture({ slug: "dire-wolf", name: "Dire Wolf", type: "Beast" }),
          createMonsterFixture({ slug: "brown-bear", name: "Brown Bear", type: "Beast" })
        ]
      }
    ]);

    const result = await importMonsterSnapshot({
      rootDir
    });

    const storedMonsters = await MonsterModel.find().sort({ slug: 1 }).lean().exec();

    expect(result.sourceDir.endsWith("fetch-03-22-2026")).toBe(true);
    expect(storedMonsters).toHaveLength(2);
    expect(storedMonsters[0]?.slug).toBe("brown-bear");
    expect(storedMonsters[1]?.slug).toBe("dire-wolf");
  });

  it("imports a specific source snapshot and replaces existing monster documents", async () => {
    const sourceDir = await writeSnapshot(rootDir, "fetch-03-20-2026", [
      {
        count: 3,
        next: "https://api.open5e.com/monsters/?page=2",
        previous: null,
        results: [
          createMonsterFixture({ slug: "wolf", name: "Wolf", type: "Beast" }),
          createMonsterFixture({ slug: "wolf", name: "Wolf Duplicate", type: "Beast" })
        ]
      },
      {
        count: 3,
        next: null,
        previous: "https://api.open5e.com/monsters/",
        results: [
          createMonsterFixture({ slug: "ogre", name: "Ogre", type: "Giant" }),
          { name: "Invalid Monster" }
        ]
      }
    ]);

    await MonsterModel.create(createMonsterFixture({
      slug: "old-entry",
      name: "Old Entry"
    }));

    const result = await importMonsterSnapshot({
      rootDir,
      sourceDir,
      replace: true
    });

    const storedMonsters = await MonsterModel.find().sort({ slug: 1 }).lean().exec();

    expect(result.processedCount).toBe(2);
    expect(result.skippedRecords).toBe(1);
    expect(storedMonsters).toHaveLength(2);
    expect(storedMonsters.map((monster) => monster.slug)).toEqual(["ogre", "wolf"]);
    expect(storedMonsters.find((monster) => monster.slug === "wolf")?.name).toBe("Wolf Duplicate");
  });
});
