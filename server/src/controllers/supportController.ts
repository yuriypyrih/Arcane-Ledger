import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthenticatedLocals } from "../middleware/authMiddleware.js";
import { Feedback } from "../models/Feedback.js";
import { sendAuthEmail } from "../services/authEmailService.js";
import { serializeAuthUser } from "../services/authUserService.js";
import type { SupportFeedbackEnvelope } from "../types/support.js";

const FEEDBACK_COOLDOWN_MS = 60 * 60 * 1000;
const FEEDBACK_MAX_LENGTH = 4000;
const SUPPORT_EMAIL_TO = "arcane-ledger@hotmail.com";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFeedbackContent(request: Request): string {
  if (!isObjectRecord(request.body)) {
    throw new AppError("Request body must be a JSON object.", 400, "INVALID_FEEDBACK_INPUT");
  }

  const value = request.body.content;

  if (typeof value !== "string") {
    throw new AppError("Request body must include feedback content.", 400, "INVALID_FEEDBACK_INPUT", {
      field: "content"
    });
  }

  const content = value.trim();

  if (!content) {
    throw new AppError("Feedback content is required.", 400, "INVALID_FEEDBACK_INPUT", {
      field: "content"
    });
  }

  if (content.length > FEEDBACK_MAX_LENGTH) {
    throw new AppError(
      `Feedback content must be at most ${FEEDBACK_MAX_LENGTH} characters long.`,
      400,
      "INVALID_FEEDBACK_INPUT",
      {
        field: "content",
        maxLength: FEEDBACK_MAX_LENGTH
      }
    );
  }

  return content;
}

function assertFeedbackCooldown(lastFeedback: Date | null | undefined, now: Date) {
  if (!lastFeedback) {
    return;
  }

  const retryAt = new Date(lastFeedback.getTime() + FEEDBACK_COOLDOWN_MS);

  if (retryAt.getTime() > now.getTime()) {
    throw new AppError("Support tickets can be submitted once per hour.", 429, "FEEDBACK_COOLDOWN_ACTIVE", {
      retryAt: retryAt.toISOString()
    });
  }
}

function createSupportEmailText(options: {
  content: string;
  submittedAt: Date;
  userEmail: string;
  userId: string;
}) {
  return [
    "A new Arcane Ledger support ticket was submitted.",
    "",
    `User ID: ${options.userId}`,
    `User email: ${options.userEmail}`,
    `Submitted at: ${options.submittedAt.toISOString()}`,
    "",
    "Feedback:",
    options.content
  ].join("\n");
}

export const submitSupportFeedback = asyncHandler(
  async (request: Request, response: Response<SupportFeedbackEnvelope, AuthenticatedLocals>) => {
    const content = readFeedbackContent(request);
    const submittedAt = new Date();
    const user = response.locals.authUser;

    assertFeedbackCooldown(user.lastFeedback, submittedAt);

    await Feedback.create({
      userId: user._id,
      userEmail: user.email,
      content
    });

    user.lastFeedback = submittedAt;
    await user.save({ validateModifiedOnly: true });

    await sendAuthEmail({
      to: SUPPORT_EMAIL_TO,
      subject: "New Arcane Ledger support ticket",
      text: createSupportEmailText({
        content,
        submittedAt,
        userEmail: user.email,
        userId: user.id
      })
    });

    response.status(201).json({
      message: "Support ticket submitted.",
      user: serializeAuthUser(user)
    });
  }
);
