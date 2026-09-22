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

it("converts a v2 save atomically, keeps its original backup, and rejects v2 overwrites even when forced", async () => {
  const original = await importSheet("multiclass-migration");
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression.multiclass = {
    classes: [
      { id: "fighter", className: "Fighter", level: 3 },
      { id: "wizard", className: "Wizard", level: 2 }
    ],
    startingClassId: "fighter",
    hitDiceExpendedByClass: { fighter: 1, wizard: 2 }
  };
  sheet.progression.level = 5;
  sheet.summary.level = 5;
  sheet.summary.className = "Fighter 3 / Wizard 2";
  const migrated = await owner
    .put(`/api/v1/characters/${original.id}`)
    .send({ clientId: "multiclass-migration", baseRevision: original.revision, sheet })
    .expect(200);
  expect(migrated.body.character.schemaVersion).toBe(3);
  const stored = await CharacterSheet.findById(original.id).select("+preMulticlassBackup").lean();
  expect(stored?.preMulticlassBackup).toEqual(original.sheet);
  for (const force of [false, true]) {
    const rejected = await owner
      .put(`/api/v1/characters/${original.id}`)
      .send({
        clientId: "multiclass-migration",
        baseRevision: migrated.body.character.revision,
        force,
        sheet: portableSheet()
      })
      .expect(409);
    expect(rejected.body.error.code).toBe("SHEET_VERSION_CONFLICT");
  }
  const loaded = await owner.get(`/api/v1/characters/${original.id}`).expect(200);
  expect(loaded.body.character.sheet.progression.multiclass).toEqual(sheet.progression.multiclass);
  const roster = await owner.get("/api/v1/characters").expect(200);
  expect(
    roster.body.characters.find((item: { id: string }) => item.id === original.id).summary.className
  ).toBe("Fighter 3 / Wizard 2");
});

it.each([
  {
    classes: [{ id: "a", className: "Wizard", level: 5 }],
    startingClassId: "a",
    hitDiceExpendedByClass: { a: -1 }
  },
  {
    classes: [{ id: "a", className: "Wizard", level: 5 }],
    startingClassId: "a",
    hitDiceExpendedByClass: { a: 0.5 }
  },
  {
    classes: [{ id: "a", className: "Wizard", level: 5 }],
    startingClassId: "a",
    hitDiceExpendedByClass: []
  },
  { classes: [], startingClassId: "missing" },
  { classes: [{ id: "a", className: "Unknown", level: 5 }], startingClassId: "a" },
  {
    classes: [{ id: "a", className: "Wizard", level: 5, preparedSpellIds: {} }],
    startingClassId: "a"
  },
  {
    classes: [{ id: "a", className: "Wizard", level: 5 }],
    startingClassId: "a",
    slotPoolsExpended: { standard: [-1] }
  },
  {
    classes: [{ id: "a", className: "Wizard", level: 5 }],
    startingClassId: "a",
    hitDiceExpended: { d6: -1 }
  },

  {
    classes: [
      { id: "a", className: "Fighter", level: 3 },
      { id: "a", className: "Wizard", level: 2 }
    ],
    startingClassId: "a"
  },
  {
    classes: [
      { id: "a", className: "Fighter", level: 3 },
      { id: "b", className: "Fighter", level: 2 }
    ],
    startingClassId: "a"
  },
  { classes: [{ id: "a", className: "Fighter", level: -1 }], startingClassId: "a" },
  { classes: [{ id: "a", className: "Fighter", level: 101 }], startingClassId: "a" },
  { classes: [{ id: "a", className: "Fighter", level: 5 }], startingClassId: "missing" }
])("rejects malformed multiclass imports before saving: %j", async (multiclass) => {
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression.level = 5;
  sheet.progression.multiclass = multiclass;
  await owner
    .post("/api/v1/characters/import")
    .send({ records: [{ clientId: "invalid-multiclass", sheet }] })
    .expect(400);
  expect(await CharacterSheet.countDocuments({ clientId: "invalid-multiclass" })).toBe(0);
});

it("keeps the original backup private and shares/imports the complete v3 sheet", async () => {
  const original = await importSheet("multiclass-shared");
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression.level = 5;
  sheet.progression.multiclass = {
    classes: [
      { id: "fighter", className: "Fighter", level: 2 },
      { id: "warlock", className: "Warlock", level: 3, preparedSpellIds: ["spell-hex"] }
    ],
    startingClassId: "fighter",
    slotPoolsExpended: { "pact:warlock": [0, 1] },
    hitDiceExpended: { d8: 1 }
  };
  await owner
    .put(`/api/v1/characters/${original.id}`)
    .send({ clientId: "multiclass-shared", baseRevision: original.revision, sheet })
    .expect(200);
  const backupPath = `/api/v1/characters/${original.id}/pre-multiclass-backup`;
  expect((await owner.get(backupPath).expect(200)).body.sheet).toEqual(original.sheet);
  await stranger.get(backupPath).expect(404);
  await request(app).get(backupPath).expect(401);
  const shared = await owner.post(`/api/v1/characters/${original.id}/share`).expect(201);
  const imported = await stranger
    .post("/api/v1/characters/shared/import")
    .send({ link: shared.body.link, localId: 918 })
    .expect(201);
  const copy = imported.body.character;
  expect(copy.schemaVersion).toBe(3);
  expect(copy.sheet.progression.multiclass).toEqual(sheet.progression.multiclass);
  expect(copy.sheet.identity.localId).toBe(918);
  expect(copy.preMulticlassBackup).toBeUndefined();
  await stranger.get(`/api/v1/characters/${copy.id}/pre-multiclass-backup`).expect(404);
});

it("round-trips a declared level-zero class through cloud save, share, and import", async () => {
  const original = await importSheet("zero-class");
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression.multiclass = {
    classes: [
      { id: "fighter", className: "Fighter", level: sheet.progression.level },
      {
        id: "bard",
        className: "Bard",
        level: 0,
        subclassId: "bard-college-of-lore",
        skillChoices: ["Performance"],
        toolChoices: ["MUSICAL_INSTRUMENT_LUTE"],
        inactiveFeats: [
          {
            id: "bard-lucky",
            feat: "LUCKY",
            takenAtLevel: 4,
            source: {
              type: "class-feature",
              classEntryId: "bard",
              level: 4,
              feature: "ABILITY_SCORE_IMPROVEMENT"
            },
            lucky: { pointsExpended: 1 }
          }
        ]
      }
    ],
    startingClassId: "fighter",
    hitDiceExpendedByClass: { bard: 1 }
  };
  await owner
    .put(`/api/v1/characters/${original.id}`)
    .send({ clientId: "zero-class", baseRevision: original.revision, sheet })
    .expect(200);
  const loaded = await owner.get(`/api/v1/characters/${original.id}`).expect(200);
  expect(loaded.body.character.sheet.progression.multiclass).toEqual(sheet.progression.multiclass);
  const shared = await owner.post(`/api/v1/characters/${original.id}/share`).expect(201);
  const imported = await stranger
    .post("/api/v1/characters/shared/import")
    .send({ link: shared.body.link, localId: 919 })
    .expect(201);
  expect(imported.body.character.sheet.progression.multiclass).toEqual(
    sheet.progression.multiclass
  );
});

it.each([
  [
    { id: "primary", className: "Fighter", level: 0 },
    { id: "secondary", className: "Wizard", level: 5 }
  ],
  [
    { id: "primary", className: "Fighter", level: 5 },
    { id: "secondary", className: "Wizard", level: -1 }
  ],
  [
    { id: "primary", className: "Fighter", level: 5 },
    { id: "secondary", className: "Wizard", level: 0.5 }
  ],
  [
    { id: "primary", className: "Fighter", level: 5 },
    { id: "secondary", className: "Fighter", level: 0 }
  ],
  [
    { id: "primary", className: "Fighter", level: 4 },
    { id: "secondary", className: "Wizard", level: 0 }
  ]
])("rejects invalid inactive-class allocations: %j", async (classes) => {
  const sheet = portableSheet();
  sheet.schemaVersion = 3;
  sheet.progression.level = 5;
  sheet.progression.multiclass = { classes, startingClassId: "primary" };
  await owner
    .post("/api/v1/characters/import")
    .send({ records: [{ clientId: "invalid-inactive", sheet }] })
    .expect(400);
  expect(await CharacterSheet.countDocuments({ clientId: "invalid-inactive" })).toBe(0);
});
