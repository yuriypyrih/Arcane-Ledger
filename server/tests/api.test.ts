import request from "supertest";
import { createApp } from "../src/app.js";
import { MonsterModel } from "../src/models/Monster.js";
import { createMonsterFixture } from "./helpers/createMonsterFixture.js";
import { clearTestDatabase, connectTestDatabase, disconnectTestDatabase } from "./helpers/mongo.js";

describe("DnD Companion API", () => {
  const app = createApp();

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await connectTestDatabase("dnd_companion_api");
    await MonsterModel.init();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it("returns a health payload", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      service: "dnd-companion-server"
    });
  });

  it("lists monsters with an Open5e-style pagination envelope", async () => {
    await MonsterModel.insertMany([
      createMonsterFixture({
        slug: "brown-bear",
        name: "Brown Bear",
        type: "Beast",
        cr: 1,
        challenge_rating: "1"
      }),
      createMonsterFixture({
        slug: "dire-wolf",
        name: "Dire Wolf",
        type: "Beast",
        cr: 1,
        challenge_rating: "1"
      }),
      createMonsterFixture({
        slug: "mimic",
        name: "Mimic",
        type: "Monstrosity",
        cr: 2,
        challenge_rating: "2"
      })
    ]);

    const response = await request(app)
      .get("/api/v1/monsters")
      .query({ type: "Beast", limit: 1, ordering: "name" })
      .set("Host", "api.example.test")
      .set("X-Forwarded-Proto", "https");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
    expect(response.body.previous).toBeNull();
    expect(response.body.next).toBe(
      "https://api.example.test/api/v1/monsters?type=Beast&limit=1&ordering=name&page=2"
    );
    expect(response.body.results).toHaveLength(1);
    expect(response.body.results[0]).toMatchObject({
      slug: "brown-bear",
      name: "Brown Bear",
      type: "Beast",
      cr: 1,
      challengeRating: "1",
      sourceTitle: "Test Document",
      sourceSlug: "test-doc"
    });
    expect(response.body.results[0]._id).toBeUndefined();
  });

  it("returns a single monster by slug", async () => {
    await MonsterModel.create(
      createMonsterFixture({
      slug: "owlbear",
      name: "Owlbear",
      type: "Monstrosity",
      cr: 3,
      challenge_rating: "3"
      })
    );

    const response = await request(app).get("/api/v1/monsters/owlbear");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      slug: "owlbear",
      name: "Owlbear",
      type: "Monstrosity"
    });
  });

  it("returns a validation error for invalid query params", async () => {
    const response = await request(app).get("/api/v1/monsters").query({ limit: 999 });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_QUERY");
  });

  it("returns a not found error for an unknown monster slug", async () => {
    const response = await request(app).get("/api/v1/monsters/unknown-monster");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("MONSTER_NOT_FOUND");
  });
});
