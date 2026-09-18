import { CharacterSheet } from "../src/models/CharacterSheet";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { startTestDatabase } from "./support/database";
import { createTestUser, testPassword } from "./support/users";
import { portableSheet } from "./support/sheet";

const app = createApp();
const owner = request.agent(app);
const stranger = request.agent(app);
let stop: (() => Promise<void>) | undefined;
beforeAll(async () => {
  stop = await startTestDatabase();
  await createTestUser("owner@example.test");
  await createTestUser("stranger@example.test");
  await owner
    .post("/api/v1/auth/login")
    .send({ email: "owner@example.test", password: testPassword })
    .expect(200);
  await stranger
    .post("/api/v1/auth/login")
    .send({ email: "stranger@example.test", password: testPassword })
    .expect(200);
});
afterAll(async () => {
  await stop?.();
});

async function importSheet(clientId: string) {
  const response = await owner
    .post("/api/v1/characters/import")
    .send({ records: [{ clientId, sheet: portableSheet() }] })
    .expect(201);
  return response.body.characters[0];
}
describe("real HTTP + MongoDB character persistence", () => {
  it("requires a valid session for cloud characters", async () => {
    const response = await request(app).get("/api/v1/characters").expect(401);
    expect(response.body.error.code).toBe("AUTH_REQUIRED");
  });
  it("imports, edits and retrieves the durable sheet with incremented revision", async () => {
    const original = await importSheet("round-trip");
    const sheet = portableSheet();
    sheet.vitals.currentHitPoints = 13;
    const saved = await owner
      .put(`/api/v1/characters/${original.id}`)
      .send({ clientId: "round-trip", baseRevision: original.revision, sheet })
      .expect(200);
    expect(saved.body.character.revision).toBe(original.revision + 1);
    const loaded = await owner.get(`/api/v1/characters/${original.id}`).expect(200);
    expect(loaded.body.character.sheet.vitals.currentHitPoints).toBe(13);
  });
  it("rejects stale saves without replacing the newer version", async () => {
    const original = await importSheet("revision-conflict");
    const sheet = portableSheet();
    sheet.vitals.currentHitPoints = 7;
    const body = { clientId: "revision-conflict", baseRevision: original.revision, sheet };
    await owner.put(`/api/v1/characters/${original.id}`).send(body).expect(200);
    await owner
      .put(`/api/v1/characters/${original.id}`)
      .send({ ...body, sheet: portableSheet() })
      .expect(409);
    const loaded = await owner.get(`/api/v1/characters/${original.id}`).expect(200);
    expect(loaded.body.character.sheet.vitals.currentHitPoints).toBe(7);
  });
  it("prevents another user from reading, changing or deleting a character", async () => {
    const original = await importSheet("private-sheet");
    const path = `/api/v1/characters/${original.id}`;
    await stranger.get(path).expect(404);
    await stranger
      .put(path)
      .send({ clientId: "private-sheet", baseRevision: original.revision, sheet: portableSheet() })
      .expect(404);
    await stranger.delete(path).expect(404);
    await owner.get(path).expect(200);
  });
  it("deduplicates repeated imports by client id", async () => {
    const original = await importSheet("idempotent-import");
    expect((await importSheet("idempotent-import")).id).toBe(original.id);
  });
  it("validates portable schema and duplicate ids before saving", async () => {
    await owner
      .post("/api/v1/characters/import")
      .send({ records: [{ clientId: "bad", sheet: { schemaVersion: 999 } }] })
      .expect(400);
    await owner
      .post("/api/v1/characters/import")
      .send({ records: [1, 2].map(() => ({ clientId: "same", sheet: portableSheet() })) })
      .expect(400);
  });
  it("deletes the owned character and removes it from the roster", async () => {
    const original = await importSheet("deleted-sheet");
    await owner.delete(`/api/v1/characters/${original.id}`).expect(200);
    await owner.get(`/api/v1/characters/${original.id}`).expect(404);
    const roster = await owner.get("/api/v1/characters").expect(200);
    expect(roster.body.characters.map((c: { id: string }) => c.id)).not.toContain(original.id);
  });
  it("rejects incorrect credentials", async () => {
    await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "owner@example.test", password: "incorrect" })
      .expect(401);
  });
});

it("only one competing save can commit the same base revision", async () => {
  const original = await importSheet("competing-saves");
  const edits = [11, 22].map((hp) => {
    const sheet = portableSheet();
    sheet.vitals.currentHitPoints = hp;
    return { clientId: "competing-saves", baseRevision: original.revision, sheet };
  });
  // Synchronize the two real database reads so this reproduces a lost-update race
  // deterministically. Writes still go through the real controller and MongoDB.
  const findOne = CharacterSheet.collection.findOne.bind(CharacterSheet.collection);
  let reads = 0;
  let release!: () => void;
  const bothRead = new Promise<void>((resolve) => {
    release = resolve;
  });
  const readBarrier = vi
    .spyOn(CharacterSheet.collection, "findOne")
    .mockImplementation(async (...args) => {
      const document = await findOne(...args);
      if (document && String(document._id) === original.id && reads < 2) {
        reads += 1;
        if (reads === 2) release();
        await bothRead;
      }
      return document;
    });
  let results;
  try {
    results = await Promise.all(
      edits.map((edit) => owner.put(`/api/v1/characters/${original.id}`).send(edit))
    );
  } finally {
    readBarrier.mockRestore();
  }
  expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
  const winner = results.findIndex((r) => r.status === 200);
  const winningEdit = edits[winner];
  if (!winningEdit) throw new Error("Neither competing save succeeded");
  const loaded = await owner.get(`/api/v1/characters/${original.id}`).expect(200);
  expect(loaded.body.character.sheet.vitals.currentHitPoints).toBe(
    winningEdit.sheet.vitals.currentHitPoints
  );
  expect(loaded.body.character.revision).toBe(original.revision + 1);
});
it("saves independent sheet sections together without dropping nested state", async () => {
  const original = await importSheet("all-sections");
  const sheet = portableSheet();
  sheet.identity.name = "Saved Hero";
  sheet.origin.backgroundNotes = "A persistent note";
  sheet.inventory.currencies.gold = 55;
  sheet.spellcasting.preparedSpellIds = ["spell-bless"];
  sheet.spellcasting.spellSlotsExpended[0] = 1;
  sheet.features.feats = [
    { id: "tough", feat: "TOUGH", takenAtLevel: 1, source: { type: "manual" } }
  ];
  sheet.companions.entries = [{ id: "owl", name: "Scout", currentHitPoints: 7, maxHitPoints: 12 }];
  await owner
    .put(`/api/v1/characters/${original.id}`)
    .send({ clientId: "all-sections", baseRevision: original.revision, sheet })
    .expect(200);
  const loaded = await owner.get(`/api/v1/characters/${original.id}`).expect(200);
  for (const section of [
    "identity",
    "origin",
    "inventory",
    "spellcasting",
    "features",
    "companions"
  ])
    expect(loaded.body.character.sheet[section]).toEqual(sheet[section]);
});
