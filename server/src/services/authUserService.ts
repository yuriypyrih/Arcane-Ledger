import { User, type UserDocument } from "../models/User.js";
import { verifyAuthToken } from "./authTokenService.js";
import { AppError } from "../errors/AppError.js";
import { DEFAULT_USER_NICKNAME } from "./authNicknameService.js";
import type { AuthUserResponse } from "../types/auth.js";

const USER_INTERACTION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export function serializeAuthUser(user: UserDocument): AuthUserResponse {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname ?? DEFAULT_USER_NICKNAME,
    role: user.role,
    emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
    lastFeedback: user.lastFeedback ? user.lastFeedback.toISOString() : null
  };
}

function didPasswordChangeAfterToken(user: UserDocument, tokenIssuedAt: number): boolean {
  if (!user.passwordChangedAt) {
    return false;
  }

  const passwordChangedAtSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000);

  return tokenIssuedAt < passwordChangedAtSeconds;
}

function shouldRecordUserInteraction(user: UserDocument, now: Date) {
  const lastInteractedAt = user.lastInteractedAt?.getTime();

  return (
    lastInteractedAt === undefined ||
    !Number.isFinite(lastInteractedAt) ||
    now.getTime() - lastInteractedAt >= USER_INTERACTION_TOUCH_INTERVAL_MS
  );
}

export async function recordUserInteractionIfStale(user: UserDocument, now = new Date()) {
  if (!shouldRecordUserInteraction(user, now)) {
    return;
  }

  const staleBefore = new Date(now.getTime() - USER_INTERACTION_TOUCH_INTERVAL_MS);

  const result = await User.updateOne(
    {
      _id: user._id,
      active: true,
      $or: [
        { lastInteractedAt: { $exists: false } },
        { lastInteractedAt: null },
        { lastInteractedAt: { $lte: staleBefore } }
      ]
    },
    {
      $set: {
        lastInteractedAt: now
      }
    }
  ).exec();

  if (result.modifiedCount > 0) {
    user.lastInteractedAt = now;
  }
}

export async function getUserFromAuthToken(token: string): Promise<UserDocument> {
  const verifiedToken = verifyAuthToken(token);
  const user = await User.findOne({
    _id: verifiedToken.userId,
    active: true
  });

  if (!user) {
    throw new AppError("Authentication session is invalid.", 401, "AUTH_SESSION_INVALID");
  }

  if (didPasswordChangeAfterToken(user, verifiedToken.issuedAt)) {
    throw new AppError("Password changed after this session was created.", 401, "AUTH_SESSION_INVALID");
  }

  return user;
}
