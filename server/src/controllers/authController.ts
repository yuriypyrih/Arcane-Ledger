import argon2 from "argon2";
import type { Request, Response } from "express";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthenticatedLocals } from "../middleware/authMiddleware.js";
import { User, type UserDocument } from "../models/User.js";
import { clearAuthCookie, setAuthCookie } from "../services/authCookieService.js";
import { sendAuthEmail } from "../services/authEmailService.js";
import { normalizeUserNickname } from "../services/authNicknameService.js";
import { createExpiringToken, hashToken, signAuthToken } from "../services/authTokenService.js";
import { serializeAuthUser } from "../services/authUserService.js";
import {
  defaultUserPreferences,
  ensureUserPreferences,
  mergeUserPreferences,
  normalizeUserPreferences
} from "../services/userPreferencesService.js";
import type { AuthMessageEnvelope, AuthUserEnvelope } from "../types/auth.js";
import type { UserPreferencesEnvelope } from "../types/preferences.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const REGISTER_ACCEPTED_MESSAGE =
  "If this email can be registered, a verification email will be sent. Please check your inbox and your junk mail just to be sure.";
const RESEND_VERIFICATION_ACCEPTED_MESSAGE =
  "If this email belongs to an unverified account, a verification email will be sent.";
const FORGOT_PASSWORD_ACCEPTED_MESSAGE =
  "If an account exists for this email, a password reset link will be sent.";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(request: Request, fieldName: string): string {
  if (!isObjectRecord(request.body)) {
    throw new AppError("Request body must be a JSON object.", 400, "INVALID_AUTH_INPUT");
  }

  const value = request.body[fieldName];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(`Request body must include "${fieldName}".`, 400, "INVALID_AUTH_INPUT", {
      field: fieldName
    });
  }

  return value;
}

function readEmail(request: Request): string {
  const email = readRequiredString(request, "email").trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError("Please provide a valid email address.", 400, "INVALID_EMAIL");
  }

  return email;
}

function readNickname(request: Request): string {
  if (!isObjectRecord(request.body)) {
    throw new AppError("Request body must be a JSON object.", 400, "INVALID_NICKNAME", {
      field: "nickname"
    });
  }

  return normalizeUserNickname(request.body.nickname);
}

function readNewPassword(request: Request, fieldName = "password"): string {
  const password = readRequiredString(request, fieldName);

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new AppError(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
      400,
      "INVALID_PASSWORD",
      {
        field: fieldName
      }
    );
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    throw new AppError(
      `Password must be at most ${PASSWORD_MAX_LENGTH} characters long.`,
      400,
      "INVALID_PASSWORD",
      {
        field: fieldName
      }
    );
  }

  return password;
}

function createFrontendUrl(pathname: string): string {
  const { frontendUrl } = getAppConfig();

  return new URL(pathname, frontendUrl).toString();
}

function createPasswordHash(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id
  });
}

async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = createFrontendUrl(`/verify-email/${token}`);

  await sendAuthEmail({
    kind: "email_verification",
    to: email,
    subject: "Verify your Arcane Ledger account",
    text: [
      "Welcome to Arcane Ledger.",
      "",
      `Verify your email address here: ${verificationUrl}`,
      "",
      "If you did not create this account, you can ignore this email."
    ].join("\n")
  });
}

async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = createFrontendUrl(`/reset-password/${token}`);

  await sendAuthEmail({
    kind: "password_reset",
    to: email,
    subject: "Reset your Arcane Ledger password",
    text: [
      "A password reset was requested for your Arcane Ledger account.",
      "",
      `Reset your password here: ${resetUrl}`,
      "",
      "If you did not request this, you can ignore this email."
    ].join("\n")
  });
}

async function assignVerificationToken(user: UserDocument): Promise<string> {
  const { emailVerificationTokenExpiresMinutes } = getAppConfig();
  const verificationToken = createExpiringToken(emailVerificationTokenExpiresMinutes);

  user.emailVerificationTokenHash = verificationToken.tokenHash;
  user.emailVerificationTokenExpiresAt = verificationToken.expiresAt;

  await user.save({ validateModifiedOnly: true });

  return verificationToken.token;
}

async function assignPasswordResetToken(user: UserDocument): Promise<string> {
  const { passwordResetTokenExpiresMinutes } = getAppConfig();
  const resetToken = createExpiringToken(passwordResetTokenExpiresMinutes);

  user.passwordResetTokenHash = resetToken.tokenHash;
  user.passwordResetExpiresAt = resetToken.expiresAt;

  await user.save({ validateModifiedOnly: true });

  return resetToken.token;
}

function sendSessionResponse(response: Response<AuthUserEnvelope>, user: UserDocument) {
  const authToken = signAuthToken(user.id);

  setAuthCookie(response, authToken);
  response.json({
    user: serializeAuthUser(user)
  });
}

export const register = asyncHandler(async (request: Request, response: Response<AuthMessageEnvelope>) => {
  const email = readEmail(request);
  const nickname = readNickname(request);
  const password = readNewPassword(request);
  const existingUser = await User.findOne({
    email,
    active: true
  }).select("+emailVerificationTokenHash +emailVerificationTokenExpiresAt");

  if (existingUser) {
    if (!existingUser.emailVerifiedAt) {
      const verificationToken = await assignVerificationToken(existingUser);
      await sendVerificationEmail(existingUser.email, verificationToken);
    }

    response.status(202).json({
      message: REGISTER_ACCEPTED_MESSAGE
    });
    return;
  }

  const verificationToken = createExpiringToken(getAppConfig().emailVerificationTokenExpiresMinutes);
  const user = new User({
    email,
    nickname,
    role: "user",
    passwordHash: await createPasswordHash(password),
    preferences: { ...defaultUserPreferences },
    emailVerificationTokenHash: verificationToken.tokenHash,
    emailVerificationTokenExpiresAt: verificationToken.expiresAt
  });

  try {
    await user.save();
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      response.status(202).json({
        message: REGISTER_ACCEPTED_MESSAGE
      });
      return;
    }

    throw error;
  }

  await sendVerificationEmail(user.email, verificationToken.token);

  response.status(202).json({
    message: REGISTER_ACCEPTED_MESSAGE
  });
});

export const login = asyncHandler(async (request: Request, response: Response<AuthUserEnvelope>) => {
  const email = readEmail(request);
  const password = readRequiredString(request, "password");
  const user = await User.findOne({
    email,
    active: true
  }).select("+passwordHash");

  if (!user || !(await argon2.verify(user.passwordHash, password))) {
    throw new AppError("Incorrect email or password.", 401, "INVALID_CREDENTIALS");
  }

  if (!user.emailVerifiedAt) {
    throw new AppError("Please verify your email before logging in.", 403, "EMAIL_NOT_VERIFIED");
  }

  sendSessionResponse(response, user);
});

export const logout = asyncHandler(async (_request: Request, response: Response<AuthMessageEnvelope>) => {
  clearAuthCookie(response);
  response.json({
    message: "Logged out."
  });
});

export const getCurrentUser = asyncHandler(
  async (_request: Request, response: Response<AuthUserEnvelope, AuthenticatedLocals>) => {
    response.json({
      user: serializeAuthUser(response.locals.authUser)
    });
  }
);

export const getUserPreferences = asyncHandler(
  async (_request: Request, response: Response<UserPreferencesEnvelope, AuthenticatedLocals>) => {
    response.json({
      preferences: await ensureUserPreferences(response.locals.authUser)
    });
  }
);

export const updateUserPreferences = asyncHandler(
  async (request: Request, response: Response<UserPreferencesEnvelope, AuthenticatedLocals>) => {
    if (!isObjectRecord(request.body)) {
      throw new AppError("Request body must be a JSON object.", 400, "INVALID_PREFERENCES_INPUT");
    }

    const user = response.locals.authUser;
    const preferences = mergeUserPreferences(user.preferences, request.body);

    user.preferences = preferences;
    await user.save({ validateModifiedOnly: true });

    response.json({
      preferences: normalizeUserPreferences(user.preferences)
    });
  }
);

export const updateNickname = asyncHandler(
  async (request: Request, response: Response<AuthUserEnvelope, AuthenticatedLocals>) => {
    const user = response.locals.authUser;

    user.nickname = readNickname(request);
    await user.save({ validateModifiedOnly: true });

    response.json({
      user: serializeAuthUser(user)
    });
  }
);

export const verifyEmail = asyncHandler(
  async (request: Request, response: Response<AuthMessageEnvelope>) => {
    const token = readRequiredString(request, "token");
    const tokenHash = hashToken(token);
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationTokenExpiresAt: {
        $gt: new Date()
      },
      active: true
    }).select("+emailVerificationTokenHash +emailVerificationTokenExpiresAt");

    if (!user) {
      throw new AppError("Email verification token is invalid or has expired.", 400, "TOKEN_INVALID");
    }

    user.emailVerifiedAt = new Date();
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationTokenExpiresAt = undefined;
    await user.save({ validateModifiedOnly: true });

    response.json({
      message: "Email verified."
    });
  }
);

export const resendEmailVerification = asyncHandler(
  async (request: Request, response: Response<AuthMessageEnvelope>) => {
    const email = readEmail(request);
    const user = await User.findOne({
      email,
      active: true,
      emailVerifiedAt: null
    }).select("+emailVerificationTokenHash +emailVerificationTokenExpiresAt");

    if (user) {
      const verificationToken = await assignVerificationToken(user);
      await sendVerificationEmail(user.email, verificationToken);
    }

    response.status(202).json({
      message: RESEND_VERIFICATION_ACCEPTED_MESSAGE
    });
  }
);

export const forgotPassword = asyncHandler(
  async (request: Request, response: Response<AuthMessageEnvelope>) => {
    const email = readEmail(request);
    const user = await User.findOne({
      email,
      active: true
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (user) {
      const resetToken = await assignPasswordResetToken(user);
      await sendPasswordResetEmail(user.email, resetToken);
    }

    response.status(202).json({
      message: FORGOT_PASSWORD_ACCEPTED_MESSAGE
    });
  }
);

export const resetPassword = asyncHandler(
  async (request: Request, response: Response<AuthMessageEnvelope>) => {
    const token = readRequiredString(request, "token");
    const password = readNewPassword(request);
    const user = await User.findOne({
      passwordResetTokenHash: hashToken(token),
      passwordResetExpiresAt: {
        $gt: new Date()
      },
      active: true
    }).select("+passwordHash +passwordResetTokenHash +passwordResetExpiresAt");

    if (!user) {
      throw new AppError("Password reset token is invalid or has expired.", 400, "TOKEN_INVALID");
    }

    user.passwordHash = await createPasswordHash(password);
    user.passwordChangedAt = new Date();
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateModifiedOnly: true });

    clearAuthCookie(response);
    response.json({
      message: "Password reset."
    });
  }
);

export const changePassword = asyncHandler(
  async (request: Request, response: Response<AuthMessageEnvelope, AuthenticatedLocals>) => {
    const currentPassword = readRequiredString(request, "currentPassword");
    const password = readNewPassword(request);
    const user = await User.findOne({
      _id: response.locals.authUser.id,
      active: true
    }).select("+passwordHash");

    if (!user || !(await argon2.verify(user.passwordHash, currentPassword))) {
      throw new AppError("Current password is incorrect.", 401, "INVALID_CREDENTIALS");
    }

    user.passwordHash = await createPasswordHash(password);
    user.passwordChangedAt = new Date();
    await user.save({ validateModifiedOnly: true });

    clearAuthCookie(response);
    response.json({
      message: "Password changed."
    });
  }
);
