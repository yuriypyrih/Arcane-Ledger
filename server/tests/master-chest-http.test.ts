import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { CharacterSheet } from "../src/models/CharacterSheet";
import { PartyGroup } from "../src/models/PartyGroup";
import { startTestDatabase } from "./support/database";
import { createTestUser, testPassword } from "./support/users";
import { portableSheet } from "./support/sheet";

const app = createApp();
const gm = request.agent(app);
const players = [request.agent(app), request.agent(app)];
let stop: (() => Promise<void>) | undefined;

beforeAll(async () => {
  stop = await startTestDatabase();
  for (const [index, agent] of [gm, ...players].entries()) {
    const email = `chest-${index}@example.test`;
    await createTestUser(email);
    await agent.post("/api/v1/auth/login").send({ email, password: testPassword }).expect(200);
  }
});
afterAll(async () => {
  await stop?.();
});

async function partyWithSupplies() {
  const created = await gm.post("/api/v1/party-groups").send({ name: "Test Supplies" }).expect(201);
  const partyId: string = created.body.partyGroup.id;
  const characterIds: string[] = [];
  for (const player of players) {
    const sheet = portableSheet();
    sheet.inventory.items = [];
    sheet.inventory.currencies.gold = 0;
    const imported = await player
      .post("/api/v1/characters/import")
      .send({ records: [{ clientId: randomUUID(), sheet }] })
      .expect(201);
    const characterId: string = imported.body.characters[0].id;
    characterIds.push(characterId);
    await CharacterSheet.updateOne({ _id: characterId }, { $set: { partyGroupId: partyId } });
  }
  await PartyGroup.updateOne(
    { _id: partyId },
    {
      $set: {
        characterIds,
        masterChestCurrencies: { gold: 10 },
        masterChestItems: [
          {
            id: "last-potion",
            item: { id: "potion", name: "Potion" },
            quantity: 1,
            onHandQuantity: 0,
            worn: false
          }
        ]
      }
    }
  );
  return {
    partyId,
    characterIds,
    path: `/api/v1/party-groups/${partyId}/master-chest/transactions`,
    withdrawal: {
      operationId: randomUUID(),
      actorCharacterId: characterIds[0]!,
      operations: [
        { type: "transfer-currency", direction: "chest-to-character", currency: "gold", amount: 6 }
      ]
    }
  };
}

async function balances(partyId: string, characterId: string) {
  const chest = await gm.get(`/api/v1/party-groups/${partyId}/master-chest`).expect(200);
  const character = await players[0]!.get(`/api/v1/characters/${characterId}`).expect(200);
  return {
    chest: chest.body.masterChest.currencies.gold,
    character: character.body.character.sheet.inventory.currencies.gold
  };
}

it("replays a committed transfer without paying twice and rejects another actor or changed payload", async () => {
  const { partyId, path, withdrawal } = await partyWithSupplies();
  await players[0]!.post(path).send(withdrawal).expect(201);
  const replay = await players[0]!.post(path).send(withdrawal).expect(201);
  expect(replay.body.transaction.replayed).toBe(true);
  const changed = await players[0]!
    .post(path)
    .send({ ...withdrawal, operations: [{ ...withdrawal.operations[0], amount: 1 }] })
    .expect(409);
  expect(changed.body.error.code).toBe("MASTER_CHEST_IDEMPOTENCY_KEY_REUSED");
  await players[1]!.post(path).send(withdrawal).expect(409);
  // A fresh key must not let a party member spend another player's inventory either.
  await players[1]!
    .post(path)
    .send({ ...withdrawal, operationId: randomUUID() })
    .expect(404);
  expect(await balances(partyId, withdrawal.actorCharacterId)).toEqual({ chest: 4, character: 6 });
});

it("lets only one competing withdrawal take the final item and preserves total quantity", async () => {
  const { partyId, characterIds, path } = await partyWithSupplies();
  const responses = await Promise.all(
    players.map((player, index) =>
      player.post(path).send({
        operationId: randomUUID(),
        actorCharacterId: characterIds[index],
        operations: [
          {
            type: "transfer-item",
            direction: "chest-to-character",
            sourceStackId: "last-potion",
            quantity: 1
          }
        ]
      })
    )
  );
  expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
  expect(responses.find((response) => response.status === 409)!.body.error.code).toBe(
    "MASTER_CHEST_OPERATION_CONFLICT"
  );
  const chest = await gm.get(`/api/v1/party-groups/${partyId}/master-chest`).expect(200);
  expect(chest.body.masterChest.inventoryItems).toEqual([]);
  const inventories = await Promise.all(
    players.map(async (player, index) => {
      const loaded = await player.get(`/api/v1/characters/${characterIds[index]}`).expect(200);
      return loaded.body.character.sheet.inventory.items as { quantity: number }[];
    })
  );
  expect(inventories.map((items) => items.reduce((sum, item) => sum + item.quantity, 0))).toEqual(
    responses.map((response) => (response.status === 201 ? 1 : 0))
  );
});

it("compensates character writes when chest revisions keep conflicting, then permits a safe retry", async () => {
  const { partyId, path, withdrawal } = await partyWithSupplies();
  const update = PartyGroup.collection.findOneAndUpdate.bind(PartyGroup.collection);
  // Simulate another writer between the read and conditional chest write. The actual
  // MongoDB revision guard, character compensation, and bounded retries still execute.
  const competingWriter = vi
    .spyOn(PartyGroup.collection, "findOneAndUpdate")
    .mockImplementation(async (...args) => {
      await PartyGroup.collection.updateOne(args[0], { $inc: { masterChestRevision: 1 } });
      return update(...args);
    });
  let failed;
  try {
    failed = await players[0]!.post(path).send(withdrawal).expect(409);
    expect(competingWriter.mock.calls.length).toBeGreaterThan(1);
  } finally {
    competingWriter.mockRestore();
  }
  expect(failed.body.error).toMatchObject({
    code: "MASTER_CHEST_OPERATION_CONFLICT",
    details: { reason: "concurrent_update" }
  });
  expect(await balances(partyId, withdrawal.actorCharacterId)).toEqual({ chest: 10, character: 0 });
  await players[0]!.post(path).send(withdrawal).expect(201);
  expect(await balances(partyId, withdrawal.actorCharacterId)).toEqual({ chest: 4, character: 6 });
});
