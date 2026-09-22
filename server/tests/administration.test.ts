import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { User } from "../src/models/User";
import { startTestDatabase } from "./support/database";
import { createTestUser, testPassword } from "./support/users";

const app = createApp();
const admin = request.agent(app);
let stop: (() => Promise<void>) | undefined;

beforeAll(async () => {
  stop = await startTestDatabase();
  const user = await createTestUser("admin@example.test");
  user.role = "admin";
  await user.save();
  await admin
    .post("/api/v1/auth/login")
    .send({ email: user.email, password: testPassword })
    .expect(200);
  await User.insertMany(
    [
      {
        nickname: "Recent",
        email: "recent@sort-fixture.test",
        lastInteractedAt: new Date("2026-09-19"),
        createdAt: new Date("2026-01-01")
      },
      {
        nickname: "Older",
        email: "older@sort-fixture.test",
        lastInteractedAt: new Date("2026-08-01"),
        createdAt: new Date("2026-02-01")
      },
      {
        nickname: "Never",
        email: "never@sort-fixture.test",
        lastInteractedAt: null,
        createdAt: new Date("2026-03-01")
      }
    ].map((record) => ({
      ...record,
      passwordHash: user.passwordHash,
      emailVerifiedAt: new Date(),
      active: true
    }))
  );
});

afterAll(async () => {
  await stop?.();
});

describe("administration user ordering", () => {
  it("defaults to most recently active first, with never-active accounts last", async () => {
    const response = await admin
      .get("/api/v1/administration/users")
      .query({ search: "sort-fixture" })
      .expect(200);
    expect(response.body.results.map((user: { nickname: string }) => user.nickname)).toEqual([
      "Recent",
      "Older",
      "Never"
    ]);
  });

  it("still honors an explicitly selected ordering", async () => {
    const response = await admin
      .get("/api/v1/administration/users")
      .query({ search: "sort-fixture", ordering: "-createdAt" })
      .expect(200);
    expect(response.body.results.map((user: { nickname: string }) => user.nickname)).toEqual([
      "Never",
      "Older",
      "Recent"
    ]);
  });
});
