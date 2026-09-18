import argon2 from "argon2";
import { User } from "../../src/models/User";
export const testPassword = "Synthetic-password-847!";
export async function createTestUser(email: string) {
  return User.create({
    email,
    nickname: "Test Player",
    passwordHash: await argon2.hash(testPassword),
    emailVerifiedAt: new Date(),
    active: true
  });
}
