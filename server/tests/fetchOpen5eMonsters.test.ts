import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMonsterSnapshot } from "../src/services/open5eFetchService.js";

const silentLogger = {
  info: vi.fn(),
  warn: vi.fn()
};

async function createTempRootDir() {
  return mkdtemp(join(tmpdir(), "dnd-monster-fetch-"));
}

describe("fetchMonsterSnapshot", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      tempDirs.map(async (tempDir) => {
        await import("node:fs/promises").then(({ rm }) => rm(tempDir, { recursive: true, force: true }));
      })
    );
    tempDirs.length = 0;
    vi.restoreAllMocks();
  });

  it("writes page JSON files into a dated snapshot directory", async () => {
    const rootDir = await createTempRootDir();
    tempDirs.push(rootDir);

    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            count: 2,
            next: "https://api.open5e.com/monsters/?page=2",
            previous: null,
            results: [{ slug: "wolf", name: "Wolf" }]
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json"
            }
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            count: 2,
            next: null,
            previous: "https://api.open5e.com/monsters/",
            results: [{ slug: "bear", name: "Bear" }]
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json"
            }
          }
        )
      );

    const result = await fetchMonsterSnapshot({
      rootDir,
      monstersUrl: "https://api.open5e.com/monsters/",
      requestDelayMs: 0,
      fetchDate: "03-22-2026",
      fetchImpl,
      logger: silentLogger
    });

    const pageOne = JSON.parse(await readFile(join(result.snapshotDir, "page-1.json"), "utf8"));
    const pageTwo = JSON.parse(await readFile(join(result.snapshotDir, "page-2.json"), "utf8"));

    expect(result.snapshotDir.endsWith("fetch-03-22-2026")).toBe(true);
    expect(result.pageCount).toBe(2);
    expect(pageOne.results[0].slug).toBe("wolf");
    expect(pageTwo.results[0].slug).toBe("bear");
  });

  it("fails when the snapshot directory already exists and overwrite is not enabled", async () => {
    const rootDir = await createTempRootDir();
    tempDirs.push(rootDir);
    const existingSnapshotDir = join(rootDir, "fetch-03-22-2026");

    await import("node:fs/promises").then(({ mkdir }) => mkdir(existingSnapshotDir, { recursive: true }));

    await expect(
      fetchMonsterSnapshot({
        rootDir,
        monstersUrl: "https://api.open5e.com/monsters/",
        requestDelayMs: 0,
        fetchDate: "03-22-2026",
        fetchImpl: vi.fn(),
        logger: silentLogger
      })
    ).rejects.toThrow("already exists");
  });

  it("replaces an existing dated snapshot when overwrite is enabled", async () => {
    const rootDir = await createTempRootDir();
    tempDirs.push(rootDir);
    const existingSnapshotDir = join(rootDir, "fetch-03-22-2026");

    await import("node:fs/promises").then(({ mkdir }) => mkdir(existingSnapshotDir, { recursive: true }));
    await writeFile(join(existingSnapshotDir, "stale.txt"), "stale", "utf8");

    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          count: 1,
          next: null,
          previous: null,
          results: [{ slug: "owl", name: "Owl" }]
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      )
    );

    const result = await fetchMonsterSnapshot({
      rootDir,
      monstersUrl: "https://api.open5e.com/monsters/",
      requestDelayMs: 0,
      fetchDate: "03-22-2026",
      overwrite: true,
      fetchImpl,
      logger: silentLogger
    });

    await expect(readFile(join(result.snapshotDir, "stale.txt"), "utf8")).rejects.toThrow();
    const pageOne = JSON.parse(await readFile(join(result.snapshotDir, "page-1.json"), "utf8"));
    expect(pageOne.results[0].slug).toBe("owl");
  });
});
