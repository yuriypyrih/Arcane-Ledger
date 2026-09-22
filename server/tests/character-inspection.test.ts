import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { Types } from "mongoose";
import { createApp } from "../src/app";
import { CharacterSheet } from "../src/models/CharacterSheet";
import { PartyGroup } from "../src/models/PartyGroup";
import { startTestDatabase } from "./support/database";
import { createTestUser, testPassword } from "./support/users";
import { portableSheet } from "./support/sheet";

const app = createApp();
const gm = request.agent(app);
const player = request.agent(app);
const admin = request.agent(app);
const stranger = request.agent(app);
let stop: (() => Promise<void>) | undefined;
let ownerId: string;
let otherUserId: string;
let characterId: string;
let partyId: string;

beforeAll(async () => {
  stop = await startTestDatabase();
  const users = await Promise.all(
    ["gm", "player", "admin", "stranger"].map((name) => createTestUser(`${name}@inspection.test`))
  );
  users[2]!.role = "admin";
  await users[2]!.save();
  for (const [index, agent] of [gm, player, admin, stranger].entries()) {
    await agent
      .post("/api/v1/auth/login")
      .send({ email: users[index]!.email, password: testPassword })
      .expect(200);
  }
  ownerId = users[1]!._id.toString();
  otherUserId = users[3]!._id.toString();
  const imported = await player
    .post("/api/v1/characters/import")
    .send({ records: [{ clientId: "inspection-character", sheet: portableSheet() }] })
    .expect(201);
  characterId = imported.body.characters[0].id;
  const created = await gm
    .post("/api/v1/party-groups")
    .send({ name: "Inspection Party" })
    .expect(201);
  partyId = created.body.partyGroup.id;
  // Real membership writes, without depending on the invite UI in every assertion.
  await PartyGroup.updateOne({ _id: partyId }, { $addToSet: { characterIds: characterId } });
  await CharacterSheet.updateOne({ _id: characterId }, { $set: { partyGroupId: partyId } });
});
afterAll(async () => {
  await stop?.();
});

const partyPath = () => `/api/v1/party-groups/${partyId}/characters/${characterId}`;
const adminPath = () => `/api/v1/administration/users/${ownerId}/characters/${characterId}`;

describe("scoped character inspection", () => {
  it("returns the same current cloud sheet to the GM and site admin without changing it", async () => {
    const before = await CharacterSheet.findById(characterId).lean();
    const owned = await player.get(`/api/v1/characters/${characterId}`).expect(200);
    for (const [agent, path] of [
      [gm, partyPath()],
      [admin, adminPath()]
    ] as const) {
      const response = await agent.get(path).expect(200);
      expect(response.body).toEqual(owned.body);
      expect(response.headers["cache-control"]).toContain("no-store");
    }
    expect(await CharacterSheet.findById(characterId).lean()).toEqual(before);
  });

  it("requires authentication and the exact party owner, not party membership", async () => {
    await request(app).get(partyPath()).expect(401);
    await player.get(partyPath()).expect(404);
    await stranger.get(partyPath()).expect(404);
    await admin.get(partyPath()).expect(404);
    await gm
      .get(`/api/v1/party-groups/${new Types.ObjectId()}/characters/${characterId}`)
      .expect(404);
    await gm.get(`/api/v1/party-groups/${partyId}/characters/${new Types.ObjectId()}`).expect(404);
    await gm.get(`/api/v1/party-groups/invalid/characters/${characterId}`).expect(400);
  });

  it("limits administration listing and inspection to admins and the selected user", async () => {
    const path = `/api/v1/administration/users/${ownerId}/characters`;
    await request(app).get(path).expect(401);
    for (const agent of [gm, player, stranger]) {
      await agent.get(path).expect(403);
      await agent.get(adminPath()).expect(403);
    }
    const roster = await admin.get(path).expect(200);
    expect(roster.body.count).toBe(1);
    expect(roster.body.characters[0].id).toBe(characterId);
    expect(roster.body.characters[0]).not.toHaveProperty("sheet");
    await admin
      .get(`/api/v1/administration/users/${otherUserId}/characters/${characterId}`)
      .expect(404);
    await admin.get(`/api/v1/administration/users/${new Types.ObjectId()}/characters`).expect(404);
  });

  it("never extends character write, delete, upload, or share permissions", async () => {
    for (const agent of [gm, admin]) {
      await agent
        .put(`/api/v1/characters/${characterId}`)
        .send({ clientId: "inspection-character", baseRevision: 1, sheet: portableSheet() })
        .expect(404);
      await agent.delete(`/api/v1/characters/${characterId}`).expect(404);
      await agent.delete(`/api/v1/characters/${characterId}/portrait`).expect(404);
      await agent
        .put(`/api/v1/characters/${characterId}/background-texture`)
        .send({ backgroundTexture: { source: "none" } })
        .expect(404);
      await agent.post(`/api/v1/characters/${characterId}/share`).send({}).expect(404);
    }
  });

  it("orders the selected user's roster by most recently updated and excludes other users", async () => {
    const imported = await player
      .post("/api/v1/characters/import")
      .send({ records: [{ clientId: "inspection-latest", sheet: portableSheet() }] })
      .expect(201);
    const latestId = imported.body.characters[0].id;
    try {
      const roster = await admin
        .get(`/api/v1/administration/users/${ownerId}/characters`)
        .expect(200);
      expect(roster.body.characters.map((entry: { id: string }) => entry.id)).toEqual([
        latestId,
        characterId
      ]);
      const empty = await admin
        .get(`/api/v1/administration/users/${otherUserId}/characters`)
        .expect(200);
      expect(empty.body).toEqual({ characters: [], count: 0 });
    } finally {
      await player.delete(`/api/v1/characters/${latestId}`).expect(200);
    }
  });

  it("loads a newly saved revision on the next request", async () => {
    const sheet = portableSheet();
    sheet.vitals.currentHitPoints = 9;
    await player
      .put(`/api/v1/characters/${characterId}`)
      .send({ clientId: "inspection-character", baseRevision: 1, sheet })
      .expect(200);
    const response = await gm.get(partyPath()).expect(200);
    expect(response.body.character.sheet.vitals.currentHitPoints).toBe(9);
    expect(response.body.character.revision).toBe(2);
  });

  it("revokes inspection when membership is removed or the sheet is deleted", async () => {
    await PartyGroup.updateOne(
      { _id: partyId },
      { $pull: { characterIds: new Types.ObjectId(characterId) } }
    );
    await gm.get(partyPath()).expect(404);
    await PartyGroup.updateOne({ _id: partyId }, { $addToSet: { characterIds: characterId } });
    await CharacterSheet.updateOne({ _id: characterId }, { $set: { partyGroupId: null } });
    await gm.get(partyPath()).expect(404);
    await CharacterSheet.updateOne(
      { _id: characterId },
      { $set: { deletedAt: new Date(), partyGroupId: partyId } }
    );
    await gm.get(partyPath()).expect(404);
    await admin.get(adminPath()).expect(404);
    expect((await admin.get(`/api/v1/administration/users/${ownerId}/characters`)).body.count).toBe(
      0
    );
  });
});
