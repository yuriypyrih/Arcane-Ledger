import { User, type UserDocument } from "../models/User.js";
import { verifyAuthToken } from "./authTokenService.js";
import { AppError } from "../errors/AppError.js";
import type { AuthUserResponse } from "../types/auth.js";

export function serializeAuthUser(user: UserDocument): AuthUserResponse {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null
  };
}

function didPasswordChangeAfterToken(user: UserDocument, tokenIssuedAt: number): boolean {
  if (!user.passwordChangedAt) {
    return false;
  }

  const passwordChangedAtSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000);

  return tokenIssuedAt < passwordChangedAtSeconds;
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
