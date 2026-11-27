import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import http from "node:http";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { CharacterSheet } from "../src/models/CharacterSheet";
import { PartyGroup } from "../src/models/PartyGroup";
import { startTestDatabase } from "./support/database";
import { createTestUser, testPassword } from "./support/users";
import { portableSheet } from "./support/sheet";

const sendAuthEmail = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock("../src/services/authEmailService", () => ({ sendAuthEmail }));

const app = createApp();
const gm = request.agent(app);
const player = request.agent(app);
const outsider = request.agent(app);
let stop: (() => Promise<void>) | undefined;
let server: http.Server;
const cookies: Record<string, string> = {};

beforeAll(async () => {
  stop = await startTestDatabase();
  for (const [name, agent] of [
    ["gm", gm],
    ["player", player],
    ["outsider", outsider]
  ] as const) {
    const email = `sessions-${name}@example.test`;
    await createTestUser(email);
    const login = await agent
      .post("/api/v1/auth/login")
      .send({ email, password: testPassword })
      .expect(200);
    cookies[name] = (login.headers["set-cookie"] as unknown as string[])
      .map((c) => c.split(";")[0])
      .join("; ");
  }
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
});
afterAll(async () => {
  server?.close();
  await stop?.();
});

async function campaignWithParty() {
  const party = await gm.post("/api/v1/party-groups").send({ name: "Session Party" }).expect(201);
  const partyId: string = party.body.partyGroup.id;
  const imported = await player
    .post("/api/v1/characters/import")
    .send({ records: [{ clientId: randomUUID(), sheet: portableSheet() }] })
    .expect(201);
  const characterId: string = imported.body.characters[0].id;
  await CharacterSheet.updateOne({ _id: characterId }, { $set: { partyGroupId: partyId } });
  await PartyGroup.updateOne({ _id: partyId }, { $set: { characterIds: [characterId] } });

  const campaign = await gm
    .post("/api/v1/campaigns")
    .send({ name: "Session Campaign" })
    .expect(201);
  const campaignId: string = campaign.body.campaign.id;
  await gm
    .patch(`/api/v1/campaigns/${campaignId}/selected-party`)
    .send({ partyGroupId: partyId })
    .expect(200);
  const encounter = await gm
    .post(`/api/v1/campaigns/${campaignId}/prepared-encounters`)
    .send({ name: "Ambush" })
    .expect(201);
  const preparedEncounterId: string = encounter.body.patch.preparedEncounters.at(-1).id;
  return { campaignId, preparedEncounterId };
}

function openStream(query: string, cookie: string) {
  return new Promise<{ events: string[]; close: () => void; status: number }>((resolve) => {
    const { port } = server.address() as AddressInfo;
    const events: string[] = [];
    const req = http.get(
      {
        host: "127.0.0.1",
        port,
        path: `/api/v1/game-sessions/events?${query}`,
        headers: { cookie }
      },
      (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk: string) => events.push(chunk));
        resolve({ events, status: res.statusCode ?? 0, close: () => req.destroy() });
      }
    );
    req.on("error", () => undefined);
  });
}

const waitFor = async (check: () => boolean) => {
  for (let attempt = 0; attempt < 50 && !check(); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
};

it("runs a session end to end: invite, availability, live combat, SSE push and cleanup on end", async () => {
  const { campaignId, preparedEncounterId } = await campaignWithParty();
  const scheduledAt = new Date(Date.now() + 86_400_000).toISOString();

  const created = await gm
    .post("/api/v1/game-sessions")
    .send({ campaignId, title: "Session One", scheduledAt })
    .expect(201);
  const sessionId: string = created.body.gameSession.id;

  // The player is invited once; the GM is not.
  await waitFor(() => sendAuthEmail.mock.calls.length > 0);
  expect(sendAuthEmail).toHaveBeenCalledTimes(1);
  expect(sendAuthEmail).toHaveBeenCalledWith(
    expect.objectContaining({ to: "sessions-player@example.test" })
  );
  await gm.patch(`/api/v1/game-sessions/${sessionId}`).send({ title: "Session One!" }).expect(200);
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(sendAuthEmail).toHaveBeenCalledTimes(1);

  // Players vote; the GM cannot; outsiders cannot see the campaign.
  const mine = await player.get("/api/v1/game-sessions/mine").expect(200);
  expect(mine.body.gameSessions.map((s: { id: string }) => s.id)).toEqual([sessionId]);
  await player
    .put(`/api/v1/game-sessions/${sessionId}/availability`)
    .send({ state: "yes" })
    .expect(200);
  const voted = await player.get(`/api/v1/game-sessions?campaignId=${campaignId}`).expect(200);
  expect(voted.body.gameSessions[0].availability).toHaveLength(1);
  await gm
    .put(`/api/v1/game-sessions/${sessionId}/availability`)
    .send({ state: "yes" })
    .expect(403);
  await player
    .put(`/api/v1/game-sessions/${sessionId}/availability`)
    .send({ state: "bogus" })
    .expect(400);
  await outsider.get(`/api/v1/game-sessions?campaignId=${campaignId}`).expect(404);
  await player.post(`/api/v1/game-sessions/${sessionId}/start`).expect(404);

  // Only the GM starts; start is idempotent and only one session can be live.
  const stream = await openStream(`campaignId=${campaignId}`, cookies.player!);
  expect(stream.status).toBe(200);
  await gm.post(`/api/v1/game-sessions/${sessionId}/start`).expect(200);
  await gm.post(`/api/v1/game-sessions/${sessionId}/start`).expect(200);
  await waitFor(() => stream.events.join("").includes("game-session.started"));
  expect(stream.events.join("")).toContain("game-session.started");
  const second = await gm
    .post("/api/v1/game-sessions")
    .send({ campaignId, title: "Session Two" })
    .expect(201);
  await gm.post(`/api/v1/game-sessions/${second.body.gameSession.id}/start`).expect(409);
  await player
    .put(`/api/v1/game-sessions/${sessionId}/availability`)
    .send({ state: "no" })
    .expect(409);

  // Combat started during the live session is tied to it, and the player stream hears about it.
  const partyId = (await gm.get(`/api/v1/campaigns/${campaignId}`).expect(200)).body.campaign
    .selectedPartyId;
  const partyStream = await openStream(`partyGroupId=${partyId}`, cookies.player!);
  expect(partyStream.status).toBe(200);
  await outsider.get(`/api/v1/game-sessions/events?partyGroupId=${partyId}`).expect(404);
  await gm
    .post(`/api/v1/campaigns/${campaignId}/live-encounter`)
    .send({ preparedEncounterId })
    .expect(201);
  await waitFor(() => partyStream.events.join("").includes("live-encounter.updated"));
  expect(partyStream.events.join("")).toContain("live-encounter.updated");
  const tracker = await player.get(`/api/v1/party-groups/${partyId}/live-encounter`).expect(200);
  expect(tracker.body.liveEncounterTracker).not.toBeNull();

  // The tracker keeps its session link through a GM update.
  const stored = await gm.get(`/api/v1/campaigns/${campaignId}`).expect(200);
  const trackerBody = stored.body.campaign.liveEncounterTracker;
  const trackerUpdate = {
    activeParticipantId: trackerBody.activeParticipantId,
    creatures: trackerBody.creatures,
    initiativeOrder: trackerBody.initiativeOrder,
    partyMembers: trackerBody.partyMembers,
    revision: trackerBody.revision,
    roundNumber: 2
  };
  await gm.patch(`/api/v1/campaigns/${campaignId}/live-encounter`).send(trackerUpdate).expect(200);
  // A stale revision (another tab or a player's turn got there first) is rejected, not overwritten.
  const conflict = await gm
    .patch(`/api/v1/campaigns/${campaignId}/live-encounter`)
    .send({ ...trackerUpdate, roundNumber: 9 })
    .expect(409);
  expect(conflict.body.error.code).toBe("LIVE_ENCOUNTER_REVISION_CONFLICT");

  // Ending the session closes its combat and tells the players.
  await gm.post(`/api/v1/game-sessions/${sessionId}/end`).expect(200);
  await gm.post(`/api/v1/game-sessions/${sessionId}/end`).expect(200);
  await waitFor(() => stream.events.join("").includes("game-session.ended"));
  expect(stream.events.join("")).toContain("game-session.ended");
  const after = await player.get(`/api/v1/party-groups/${partyId}/live-encounter`).expect(200);
  expect(after.body.liveEncounterTracker).toBeNull();

  stream.close();
  partyStream.close();
});

it("takes a player's initiative once, sorts it into the order, and lets the GM override it", async () => {
  const { campaignId, preparedEncounterId } = await campaignWithParty();
  await gm
    .post(`/api/v1/campaigns/${campaignId}/live-encounter`)
    .send({ preparedEncounterId })
    .expect(201);
  const partyId = (await gm.get(`/api/v1/campaigns/${campaignId}`).expect(200)).body.campaign
    .selectedPartyId;
  const initiativePath = `/api/v1/party-groups/${partyId}/live-encounter/initiative`;
  const before = await player.get(`/api/v1/party-groups/${partyId}/live-encounter`).expect(200);
  const characterId: string = before.body.liveEncounterTracker.partyMembers[0].characterId;

  // Validation, ownership and the one-time rule.
  await player.patch(initiativePath).send({ characterId, initiative: 1.5 }).expect(400);
  await player.patch(initiativePath).send({ characterId, initiative: 500 }).expect(400);
  await outsider.patch(initiativePath).send({ characterId, initiative: 10 }).expect(404);
  const submitted = await player
    .patch(initiativePath)
    .send({ characterId, initiative: 14 })
    .expect(200);
  const order = submitted.body.liveEncounterTracker.initiativeOrder;
  expect(order).toHaveLength(1);
  expect(order[0]).toMatchObject({ characterId, initiative: 14 });
  const again = await player
    .patch(initiativePath)
    .send({ characterId, initiative: 20 })
    .expect(409);
  expect(again.body.error.code).toBe("LIVE_ENCOUNTER_INITIATIVE_ALREADY_SET");

  // The GM can overwrite the value; it survives the save.
  const stored = (await gm.get(`/api/v1/campaigns/${campaignId}`).expect(200)).body.campaign
    .liveEncounterTracker;
  const ref = (participant: { participantId: string; kind: string; characterId?: string }) => ({
    participantId: participant.participantId,
    kind: participant.kind,
    characterId: participant.characterId,
    initiative: 9
  });
  const updated = await gm
    .patch(`/api/v1/campaigns/${campaignId}/live-encounter`)
    .send({
      activeParticipantId: stored.activeParticipantId,
      creatures: stored.creatures,
      initiativeOrder: stored.initiativeOrder.map(ref),
      partyMembers: stored.partyMembers,
      revision: stored.revision,
      roundNumber: stored.roundNumber
    })
    .expect(200);
  expect(updated.body.patch.liveEncounterTracker.initiativeOrder[0].initiative).toBe(9);
  await gm
    .patch(`/api/v1/campaigns/${campaignId}/live-encounter`)
    .send({
      activeParticipantId: stored.activeParticipantId,
      creatures: [],
      initiativeOrder: [{ ...ref(stored.initiativeOrder[0]), initiative: 1000 }],
      partyMembers: [],
      revision: updated.body.patch.liveEncounterTracker.revision,
      roundNumber: 1
    })
    .expect(400);
});

it("lets the GM drive turns on the server, guarded by revision, with undo only while nothing else changed", async () => {
  const { campaignId, preparedEncounterId } = await campaignWithParty();
  await gm
    .post(`/api/v1/campaigns/${campaignId}/live-encounter`)
    .send({ preparedEncounterId })
    .expect(201);
  const turnPath = `/api/v1/campaigns/${campaignId}/live-encounter/turn`;
  const load = async () =>
    (await gm.get(`/api/v1/campaigns/${campaignId}`).expect(200)).body.campaign
      .liveEncounterTracker;
  let tracker = await load();

  // Nobody is in initiative yet: turn actions are refused, not silently ignored.
  await gm.post(turnPath).send({ action: "next", revision: tracker.revision }).expect(409);
  await gm.post(turnPath).send({ action: "bogus", revision: tracker.revision }).expect(400);

  // Put the only party member into initiative, then step through turns.
  const member = tracker.partyMembers[0];
  await gm
    .patch(`/api/v1/campaigns/${campaignId}/live-encounter`)
    .send({
      activeParticipantId: null,
      creatures: [],
      initiativeOrder: [
        { participantId: member.participantId, kind: member.kind, characterId: member.characterId }
      ],
      partyMembers: [],
      revision: tracker.revision,
      roundNumber: 1
    })
    .expect(200);
  tracker = await load();
  const started = await gm
    .post(turnPath)
    .send({ action: "next", revision: tracker.revision })
    .expect(200);
  expect(started.body.patch.liveEncounterTracker).toMatchObject({
    activeParticipantId: member.participantId,
    canUndo: true,
    roundNumber: 1
  });
  const wrapped = await gm
    .post(turnPath)
    .send({ action: "next", revision: started.body.patch.liveEncounterTracker.revision })
    .expect(200);
  expect(wrapped.body.patch.liveEncounterTracker.roundNumber).toBe(2);

  // A stale revision loses; undo restores round 1 and then has nothing left to undo.
  await gm
    .post(turnPath)
    .send({ action: "next", revision: started.body.patch.liveEncounterTracker.revision })
    .expect(409);
  const undone = await gm
    .post(turnPath)
    .send({ action: "undo", revision: wrapped.body.patch.liveEncounterTracker.revision })
    .expect(200);
  expect(undone.body.patch.liveEncounterTracker.roundNumber).toBe(1);
  await gm
    .post(turnPath)
    .send({ action: "undo", revision: undone.body.patch.liveEncounterTracker.revision })
    .expect(409);

  // Anyone who is not the campaign owner cannot drive turns.
  await player.post(turnPath).send({ action: "next", revision: 1 }).expect(404);
});
