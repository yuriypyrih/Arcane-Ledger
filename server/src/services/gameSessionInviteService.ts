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

type EmailPreferenceKey = "emailNewSession" | "emailReschedule";

/**
 * Verified players of the campaign (not the GM) who have not switched this kind of email off in
 * their campaign settings. A missing preference counts as on.
 */
async function findSessionEmailRecipients(
  campaign: { ownerId: Types.ObjectId; selectedPartyId?: Types.ObjectId | null },
  preference: EmailPreferenceKey
) {
  const playerIds = await getCampaignPlayerUserIds(campaign);

  return User.find({
    _id: { $in: playerIds.filter((id: Types.ObjectId) => !id.equals(campaign.ownerId)) },
    emailVerifiedAt: { $ne: null },
    [`preferences.${preference}`]: { $ne: false }
  })
    .select({ email: 1 })
    .exec();
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

  const recipients = await findSessionEmailRecipients(campaign, "emailNewSession");
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

/** Tells the players the GM suggested a new time. Players who switched these emails off are skipped. */
export async function sendGameSessionRescheduleEmails(
  session: GameSessionDocument,
  previousScheduledAt: Date | null
) {
  const proposal = session.rescheduleProposal;

  if (session.status !== "planned" || !proposal) {
    return;
  }

  const campaign = await Campaign.findById(session.campaignId)
    .select({ name: 1, selectedPartyId: 1, ownerId: 1 })
    .exec();

  if (!campaign) {
    return;
  }

  const recipients = await findSessionEmailRecipients(campaign, "emailReschedule");
  const { frontendUrl } = getAppConfig();
  const text = [
    `The GM proposed a new time for a ${campaign.name} session.`,
    "",
    session.title,
    previousScheduledAt ? `Now: ${formatInviteDate(previousScheduledAt)}` : "Now: no time set",
    `Proposed: ${formatInviteDate(proposal.proposedAt)}`,
    ...(proposal.message ? ["", `Note from the GM: ${proposal.message}`] : []),
    "",
    `Tell the GM whether you can make it: ${frontendUrl}`
  ].join("\n");

  for (const recipient of recipients) {
    try {
      await sendAuthEmail({
        to: recipient.email,
        subject: `New time proposed: ${session.title}`,
        text
      });
    } catch (error) {
      captureServerError(error, {
        area: "game-session",
        action: "send-reschedule",
        extra: { gameSessionId: session.id as string }
      });
    }
  }
}

/** Fire-and-forget wrapper: email failures must never fail the proposal. */
export function queueGameSessionRescheduleEmails(
  session: GameSessionDocument,
  previousScheduledAt: Date | null
) {
  void sendGameSessionRescheduleEmails(session, previousScheduledAt).catch((error: unknown) => {
    captureServerError(error, {
      area: "game-session",
      action: "queue-reschedule",
      extra: { gameSessionId: session.id as string }
    });
  });
}
