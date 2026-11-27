import { Types } from "mongoose";
import { getAppConfig } from "../config/env.js";
import { Campaign } from "../models/Campaign.js";
import { GameSession, type GameSessionDocument } from "../models/GameSession.js";
import { User } from "../models/User.js";
import { captureServerError } from "../sentry.js";
import { sendAuthEmail } from "./authEmailService.js";
import { getCampaignPlayerUserIds } from "./campaignMembershipService.js";

function formatInviteDate(date: Date) {
  return (
    date.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: "UTC" }) +
    " UTC"
  );
}

/**
 * Emails the campaign's players (verified accounts only) once per scheduled time.
 * The invitedScheduledAt claim is atomic, so concurrent saves or retries cannot send duplicates.
 */
export async function sendGameSessionInvites(session: GameSessionDocument) {
  const { scheduledAt } = session;

  if (session.status !== "planned" || !scheduledAt) {
    return;
  }

  const claimed = await GameSession.findOneAndUpdate(
    {
      _id: session._id,
      status: "planned",
      scheduledAt,
      invitedScheduledAt: { $ne: scheduledAt }
    },
    { $set: { invitedScheduledAt: scheduledAt } }
  ).exec();

  if (!claimed) {
    return;
  }

  const campaign = await Campaign.findById(session.campaignId)
    .select({ name: 1, selectedPartyId: 1, ownerId: 1 })
    .exec();

  if (!campaign) {
    return;
  }

  const playerIds = await getCampaignPlayerUserIds(campaign);
  const recipients = await User.find({
    _id: { $in: playerIds.filter((id: Types.ObjectId) => !id.equals(campaign.ownerId)) },
    emailVerifiedAt: { $ne: null }
  })
    .select({ email: 1 })
    .exec();
  const { frontendUrl } = getAppConfig();
  const text = [
    `A new session is scheduled for ${campaign.name}.`,
    "",
    `${session.title}`,
    `When: ${formatInviteDate(scheduledAt)}`,
    "",
    `Mark whether you can attend: ${frontendUrl}`
  ].join("\n");

  for (const recipient of recipients) {
    try {
      await sendAuthEmail({
        to: recipient.email,
        subject: `Session scheduled: ${session.title}`,
        text
      });
    } catch (error) {
      captureServerError(error, {
        area: "game-session",
        action: "send-invite",
        extra: { gameSessionId: session.id as string }
      });
    }
  }
}

/** Fire-and-forget wrapper: invite failures must never fail the session write. */
export function queueGameSessionInvites(session: GameSessionDocument) {
  void sendGameSessionInvites(session).catch((error: unknown) => {
    captureServerError(error, {
      area: "game-session",
      action: "queue-invites",
      extra: { gameSessionId: session.id as string }
    });
  });
}
