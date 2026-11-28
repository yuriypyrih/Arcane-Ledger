import { afterAll, beforeAll, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { startTestDatabase } from "./support/database";
import { createTestUser, testPassword } from "./support/users";

const app = createApp();
const gm = request.agent(app);
const stranger = request.agent(app);
let stop: (() => Promise<void>) | undefined;

beforeAll(async () => {
  stop = await startTestDatabase();
  for (const [name, agent] of [
    ["gm", gm],
    ["stranger", stranger]
  ] as const) {
    await createTestUser(`types-${name}@example.test`);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: `types-${name}@example.test`, password: testPassword })
      .expect(200);
  }
});
afterAll(async () => {
  await stop?.();
});

const entry = (resistances: string) => ({
  key: "goblin",
  name: "Goblin",
  resistances_and_immunities: {
    damage_resistances_display: resistances,
    damage_resistances: [],
    condition_immunities_display: null,
    condition_immunities: []
  }
});
const goblin = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  name: id,
  type: "humanoid",
  description: "",
  maxHitPoints: 20,
  currentHitPoints: 20,
  temporaryHitPoints: 0,
  duration: {},
  inheritedCreatureEntry: entry("fire"),
  ...overrides
});

// A user may only have a handful of campaigns and prepared encounters, so tests share one campaign.
let sharedCampaignId = "";

async function encounter() {
  if (!sharedCampaignId) {
    sharedCampaignId = (await gm.post("/api/v1/campaigns").send({ name: "Types test" }).expect(201))
      .body.campaign.id;
  }

  const campaignId = sharedCampaignId;
  const preparedEncounterId = (
    await gm
      .post(`/api/v1/campaigns/${campaignId}/prepared-encounters`)
      .send({ name: "Ambush" })
      .expect(201)
  ).body.patch.preparedEncounters.at(-1).id;
  const base = `/api/v1/campaigns/${campaignId}/prepared-encounters/${preparedEncounterId}`;
  const creatures = async () =>
    (
      await gm.get(`/api/v1/campaigns/${campaignId}`).expect(200)
    ).body.campaign.preparedEncounters.find(
      (candidate: { id: string }) => candidate.id === preparedEncounterId
    ).creatures as Record<string, unknown>[];
  const byId = async () => Object.fromEntries((await creatures()).map((c) => [c.id as string, c]));
  const put = (body: Record<string, unknown>) =>
    gm
      .put(`${base}/creatures/${body.id as string}`)
      .send(body)
      .expect(200);

  return { base, byId, campaignId, creatures, preparedEncounterId, put };
}

it("a copy joins its source's type and inherits the whole definition", async () => {
  const { byId, put } = await encounter();
  await put(goblin("a", { imageUrl: "https://example.test/g.png", description: "Sneaky" }));
  // The copy asks for different values; as a linked copy it must take the source's definition.
  await put(
    goblin("b", {
      name: "Goblin 1",
      copyOfCreatureId: "a",
      maxHitPoints: 99,
      inheritedCreatureEntry: entry("none")
    })
  );
  const all = await byId();

  expect(all.a?.typeGroupId).toBeTruthy();
  expect(all.b?.typeGroupId).toBe(all.a?.typeGroupId);
  expect(all.b).toMatchObject({
    name: "Goblin 1",
    maxHitPoints: 20,
    currentHitPoints: 20,
    description: "Sneaky",
    imageUrl: "https://example.test/g.png"
  });
  expect(
    (
      all.b?.inheritedCreatureEntry as {
        resistances_and_immunities: { damage_resistances_display: string };
      }
    ).resistances_and_immunities.damage_resistances_display
  ).toBe("fire");
});

it("editing any member updates the others, but hit points stay per creature", async () => {
  const { byId, put } = await encounter();
  await put(goblin("a"));
  await put(goblin("b", { copyOfCreatureId: "a" }));
  await put(goblin("c", { copyOfCreatureId: "a" }));

  // Edit the type from a copy: defenses, max HP, picture and description follow on all three.
  await put(
    goblin("b", {
      inheritedCreatureEntry: entry("fire, cold"),
      maxHitPoints: 10,
      currentHitPoints: 10,
      description: "Boss",
      imageUrl: "https://example.test/boss.png"
    })
  );
  let all = await byId();

  for (const id of ["a", "b", "c"]) {
    expect(all[id]).toMatchObject({
      maxHitPoints: 10,
      description: "Boss",
      imageUrl: "https://example.test/boss.png"
    });
    expect(all[id]?.currentHitPoints).toBe(10); // clamped to the new max
    expect(
      (
        all[id]?.inheritedCreatureEntry as {
          resistances_and_immunities: { damage_resistances_display: string };
        }
      ).resistances_and_immunities.damage_resistances_display
    ).toBe("fire, cold");
  }

  // An HP-only edit changes only that creature.
  await put(
    goblin("c", {
      inheritedCreatureEntry: entry("fire, cold"),
      maxHitPoints: 10,
      description: "Boss",
      imageUrl: "https://example.test/boss.png",
      currentHitPoints: 3
    })
  );
  all = await byId();
  expect(all.c?.currentHitPoints).toBe(3);
  expect(all.a?.currentHitPoints).toBe(10);
  expect(all.b?.currentHitPoints).toBe(10);
});

it("unlinking detaches a creature, and a lone creature dissolves its type", async () => {
  const { byId, creatures, base, put } = await encounter();
  await put(goblin("a"));
  await put(goblin("b", { copyOfCreatureId: "a" }));
  await put(goblin("c", { copyOfCreatureId: "a" }));

  await put(goblin("c", { unlinkFromType: true }));
  await put(goblin("c", { inheritedCreatureEntry: entry("acid") }));
  let all = await byId();
  expect(all.c?.typeGroupId ?? null).toBeNull();
  expect(
    (
      all.a?.inheritedCreatureEntry as {
        resistances_and_immunities: { damage_resistances_display: string };
      }
    ).resistances_and_immunities.damage_resistances_display
  ).toBe("fire");

  // Removing one of the last two leaves a single creature, which is no longer a type.
  await gm.delete(`${base}/creatures/b`).expect(200);
  all = await byId();
  expect(all.a?.typeGroupId ?? null).toBeNull();
  expect(await creatures()).toHaveLength(2);
});

it("the visibility a GM sets for one creature applies to its whole type", async () => {
  const { base, byId, put } = await encounter();
  await put(goblin("a"));
  await put(goblin("b", { copyOfCreatureId: "a" }));
  const settings = {
    showVitalityStatus: true,
    showHpBar: true,
    showDeathSaves: false,
    showMonsterType: false,
    showBaseStatBlockDescription: false,
    showDmDescription: false,
    showArmorClass: false,
    showChallengeRating: false,
    showAbilityScoresAndSavingThrows: false,
    showResistancesAndImmunities: true,
    showSkills: false,
    showSenses: false,
    showLanguages: false,
    showActionsAndReactions: false
  };

  await gm.patch(`${base}/creatures/a/visibility-settings`).send(settings).expect(200);
  const all = await byId();
  expect(all.b?.visibilitySettings).toMatchObject({
    showResistancesAndImmunities: true,
    showHpBar: true
  });
});

it("Link same monsters groups older copies by monster and makes the first one's definition win", async () => {
  const { base, byId, put } = await encounter();
  await put(goblin("a"));
  await put(
    goblin("b", { inheritedCreatureEntry: entry("cold"), maxHitPoints: 12, currentHitPoints: 12 })
  );
  await put(
    goblin("ogre", { inheritedCreatureEntry: { ...entry("none"), key: "ogre", name: "Ogre" } })
  );

  await gm
    .post(`${base}/link-creature-types`)
    .expect(403)
    .catch(() => undefined);
  const result = await gm.post(`${base}/link-creature-types`).expect(200);
  expect(result.body.linkedCount).toBe(2);

  const all = await byId();
  expect(all.a?.typeGroupId).toBeTruthy();
  expect(all.b?.typeGroupId).toBe(all.a?.typeGroupId);
  expect(all.ogre?.typeGroupId ?? null).toBeNull();
  expect(all.b).toMatchObject({ maxHitPoints: 20, currentHitPoints: 12 });
  expect(
    (
      all.b?.inheritedCreatureEntry as {
        resistances_and_immunities: { damage_resistances_display: string };
      }
    ).resistances_and_immunities.damage_resistances_display
  ).toBe("fire");
});

it("copying a template keeps its types, and only the owner can change or link them", async () => {
  const template = (
    await gm.post("/api/v1/encounter-templates").send({ name: "Goblin pack" }).expect(201)
  ).body.encounterTemplate.id;
  const putTemplate = (body: Record<string, unknown>) =>
    gm
      .put(`/api/v1/encounter-templates/${template}/creatures/${body.id as string}`)
      .send(body)
      .expect(200);

  await putTemplate(goblin("t1"));
  await putTemplate(goblin("t2", { copyOfCreatureId: "t1" }));
  const stored = (await gm.get(`/api/v1/encounter-templates/${template}`).expect(200)).body
    .encounterTemplate.creatures;
  expect(stored[1].typeGroupId).toBe(stored[0].typeGroupId);

  const campaignId = (
    await gm.post("/api/v1/campaigns").send({ name: "From template" }).expect(201)
  ).body.campaign.id;
  const copied = await gm
    .post(`/api/v1/campaigns/${campaignId}/prepared-encounters/from-template`)
    .send({ encounterTemplateId: template })
    .expect(201);
  const creatures = copied.body.patch.preparedEncounters.at(-1).creatures;
  expect(creatures[0].typeGroupId).toBeTruthy();
  expect(creatures[1].typeGroupId).toBe(creatures[0].typeGroupId);

  const preparedEncounterId = copied.body.patch.preparedEncounters.at(-1).id;
  await stranger
    .post(
      `/api/v1/campaigns/${campaignId}/prepared-encounters/${preparedEncounterId}/link-creature-types`
    )
    .expect(404);
  await stranger.post(`/api/v1/encounter-templates/${template}/link-creature-types`).expect(404);
});
