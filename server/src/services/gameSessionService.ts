import { Types } from "mongoose";
import { CAMPAIGN_MAX_GAME_SESSIONS } from "../constants/QUOTAS.js";
import { AppError } from "../errors/AppError.js";
import { Campaign } from "../models/Campaign.js";
import {
  GAME_SESSION_AVAILABILITY_STATES,
  GameSession,
  type GameSessionAvailabilityState,
  type GameSessionDocument,
  type GameSessionStatus
} from "../models/GameSession.js";
import { User } from "../models/User.js";
import {
  queueGameSessionInvites,
  queueGameSessionRescheduleEmails
} from "./gameSessionInviteService.js";
import { publishCampaignEvent } from "./campaignEventBus.js";
import { CharacterSheet } from "../models/CharacterSheet.js";
import { PartyGroup } from "../models/PartyGroup.js";
import { getCampaignPlayerUserIds, resolveCampaignRole } from "./campaignMembershipService.js";

const GAME_SESSION_TITLE_MIN_LENGTH = 2;
const GAME_SESSION_TITLE_MAX_LENGTH = 128;
const GAME_SESSION_RECAP_MAX_LENGTH = 20000;
const GAME_SESSION_PROPOSAL_MESSAGE_MAX_LENGTH = 500;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createObjectId(value: string, message: string, code: string) {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(message, 400, code);
  }

  return new Types.ObjectId(value);
}

function normalizeTitle(value: unknown) {
  const title = typeof value === "string" ? value.trim() : "";

  if (
    title.length < GAME_SESSION_TITLE_MIN_LENGTH ||
    title.length > GAME_SESSION_TITLE_MAX_LENGTH
  ) {
    throw new AppError(
      `Session title must be ${GAME_SESSION_TITLE_MIN_LENGTH}-${GAME_SESSION_TITLE_MAX_LENGTH} characters.`,
      400,
      "INVALID_GAME_SESSION_INPUT",
      { field: "title" }
    );
  }

  return title;
}

function normalizeOptionalDate(value: unknown) {
  if (value === null || value === "") {
    return null;
  }

  const date = new Date(typeof value === "string" || typeof value === "number" ? value : NaN);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("Session date is invalid.", 400, "INVALID_GAME_SESSION_INPUT", {
      field: "scheduledAt"
    });
  }

  return date;
}

function normalizeOptionalDuration(value: unknown) {
  if (value === null) {
    return null;
  }

  const minutes = Math.floor(Number(value));

  if (!Number.isFinite(minutes) || minutes < 15 || minutes > 1440) {
    throw new AppError("Session duration is invalid.", 400, "INVALID_GAME_SESSION_INPUT", {
      field: "durationMinutes"
    });
  }

  return minutes;
}

function normalizeRecap(value: unknown) {
  if (typeof value !== "string") {
    throw new AppError("Session recap must be text.", 400, "INVALID_GAME_SESSION_INPUT", {
      field: "recap"
    });
  }

  const recap = value.trim();

  if (recap.length > GAME_SESSION_RECAP_MAX_LENGTH) {
    throw new AppError("Session recap is too long.", 400, "INVALID_GAME_SESSION_INPUT", {
      field: "recap"
    });
  }

  return recap;
}

function toIsoTimestamp(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

export function toGameSessionRecord(session: GameSessionDocument) {
  return {
    id: session.id as string,
    campaignId: session.campaignId.toString(),
    title: session.title,
    scheduledAt: toIsoTimestamp(session.scheduledAt),
    durationMinutes: session.durationMinutes ?? null,
    status: session.status,
    recap: session.recap,
    linkedPreparedEncounterIds: session.linkedPreparedEncounterIds,
    availability: session.availability.map((entry) => ({
      userId: entry.userId.toString(),
      state: entry.state,
      updatedAt: entry.updatedAt.toISOString()
    })),
    attendedUserIds: session.attendedUserIds.map((userId) => userId.toString()),
    rescheduleProposal: session.rescheduleProposal
      ? {
          proposedAt: session.rescheduleProposal.proposedAt.toISOString(),
          message: session.rescheduleProposal.message ?? "",
          createdAt: session.rescheduleProposal.createdAt.toISOString()
        }
      : null,
    startedAt: toIsoTimestamp(session.startedAt),
    endedAt: toIsoTimestamp(session.endedAt),
    revision: session.revision,
    createdAt: toIsoTimestamp(session.createdAt),
    updatedAt: toIsoTimestamp(session.updatedAt)
  };
}

function publishSessionEvent(
  type: "game-session.updated" | "game-session.started" | "game-session.ended",
  session: GameSessionDocument
) {
  publishCampaignEvent({
    type,
    campaignId: session.campaignId.toString(),
    gameSessionId: session.id as string,
    revision: session.revision
  });
}

async function assertOwnedCampaign(options: { campaignId: string; ownerId: Types.ObjectId }) {
  const campaignId = createObjectId(
    options.campaignId,
    "Campaign id is invalid.",
    "INVALID_CAMPAIGN_ID"
  );
  const campaign = await Campaign.findOne({ _id: campaignId, ownerId: options.ownerId })
    .select({ preparedEncounters: 1 })
    .exec();

  if (!campaign) {
    throw new AppError("Campaign was not found.", 404, "CAMPAIGN_NOT_FOUND");
  }

  return campaign;
}

async function findOwnedSession(options: {
  gameSessionId: string;
  ownerId: Types.ObjectId;
}): Promise<GameSessionDocument> {
  const gameSessionId = createObjectId(
    options.gameSessionId,
    "Game session id is invalid.",
    "INVALID_GAME_SESSION_ID"
  );
  const session = await GameSession.findOne({
    _id: gameSessionId,
    ownerId: options.ownerId
  }).exec();

  if (!session) {
    throw new AppError("Game session was not found.", 404, "GAME_SESSION_NOT_FOUND");
  }

  return session;
}

function assertStatus(session: GameSessionDocument, allowed: GameSessionStatus[], action: string) {
  if (!allowed.includes(session.status)) {
    throw new AppError(
      `A ${session.status} session cannot be ${action}.`,
      409,
      "GAME_SESSION_INVALID_STATE",
      { status: session.status }
    );
  }
}

export async function listOwnedGameSessions(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
}) {
  await assertOwnedCampaign(options);
  const sessions = await GameSession.find({
    campaignId: new Types.ObjectId(options.campaignId),
    ownerId: options.ownerId
  })
    .sort({ scheduledAt: 1, createdAt: 1 })
    .exec();

  return sessions.map(toGameSessionRecord);
}

export async function createOwnedGameSession(options: {
  body: Record<string, unknown>;
  campaignId: string;
  ownerId: Types.ObjectId;
}) {
  await assertOwnedCampaign(options);
  const campaignId = new Types.ObjectId(options.campaignId);

  const count = await GameSession.countDocuments({ campaignId });

  if (count >= CAMPAIGN_MAX_GAME_SESSIONS) {
    throw new AppError(
      "This campaign has reached its game session limit.",
      409,
      "GAME_SESSION_LIMIT_REACHED",
      {
        limit: CAMPAIGN_MAX_GAME_SESSIONS
      }
    );
  }

  const session = await GameSession.create({
    campaignId,
    ownerId: options.ownerId,
    title: normalizeTitle(options.body.title),
    scheduledAt:
      options.body.scheduledAt === undefined
        ? null
        : normalizeOptionalDate(options.body.scheduledAt),
    durationMinutes:
      options.body.durationMinutes === undefined
        ? null
        : normalizeOptionalDuration(options.body.durationMinutes)
  });

  queueGameSessionInvites(session);
  return toGameSessionRecord(session);
}

export async function getOwnedGameSession(options: {
  gameSessionId: string;
  ownerId: Types.ObjectId;
}) {
  return toGameSessionRecord(await findOwnedSession(options));
}

export async function updateOwnedGameSession(options: {
  body: Record<string, unknown>;
  gameSessionId: string;
  ownerId: Types.ObjectId;
}) {
  const session = await findOwnedSession(options);
  assertStatus(session, ["planned", "live", "ended"], "edited");
  const { body } = options;

  if (body.title !== undefined) {
    session.title = normalizeTitle(body.title);
  }

  if (body.recap !== undefined) {
    session.recap = normalizeRecap(body.recap);
  }

  if (session.status === "planned") {
    if (body.scheduledAt !== undefined) {
      const nextScheduledAt = normalizeOptionalDate(body.scheduledAt);

      if (nextScheduledAt?.getTime() !== session.scheduledAt?.getTime()) {
        // A new time settles any pending suggestion.
        session.rescheduleProposal = null;
      }

      session.scheduledAt = nextScheduledAt;
    }

    if (body.durationMinutes !== undefined) {
      session.durationMinutes = normalizeOptionalDuration(body.durationMinutes);
    }

    if (body.linkedPreparedEncounterIds !== undefined) {
      if (
        !Array.isArray(body.linkedPreparedEncounterIds) ||
        body.linkedPreparedEncounterIds.some((id) => typeof id !== "string")
      ) {
        throw new AppError("Linked encounters are invalid.", 400, "INVALID_GAME_SESSION_INPUT", {
          field: "linkedPreparedEncounterIds"
        });
      }

      const campaign = await assertOwnedCampaign({
        campaignId: session.campaignId.toString(),
        ownerId: options.ownerId
      });
      const knownIds = new Set(campaign.preparedEncounters.map((encounter) => encounter.id));
      const linkedIds = [...new Set(body.linkedPreparedEncounterIds as string[])];

      if (linkedIds.some((id) => !knownIds.has(id))) {
        throw new AppError(
          "A linked encounter was not found.",
          404,
          "PREPARED_ENCOUNTER_NOT_FOUND"
        );
      }

      session.linkedPreparedEncounterIds = linkedIds;
    }
  }

  session.revision += 1;
  await session.save();
  publishSessionEvent("game-session.updated", session);
  queueGameSessionInvites(session);
  return toGameSessionRecord(session);
}

export async function cancelOwnedGameSession(options: {
  gameSessionId: string;
  ownerId: Types.ObjectId;
}) {
  const session = await findOwnedSession(options);
  assertStatus(session, ["planned"], "cancelled");
  session.status = "cancelled";
  session.revision += 1;
  await session.save();
  publishSessionEvent("game-session.updated", session);
  return toGameSessionRecord(session);
}

export async function startOwnedGameSession(options: {
  gameSessionId: string;
  ownerId: Types.ObjectId;
}) {
  const session = await findOwnedSession(options);

  // Idempotent retry: starting an already-live session returns it unchanged.
  if (session.status === "live") {
    return toGameSessionRecord(session);
  }

  assertStatus(session, ["planned"], "started");

  const liveSession = await GameSession.findOne({ campaignId: session.campaignId, status: "live" })
    .select({ _id: 1 })
    .exec();

  if (liveSession) {
    throw new AppError(
      "This campaign already has a live session.",
      409,
      "GAME_SESSION_ALREADY_LIVE"
    );
  }

  session.status = "live";
  session.startedAt = new Date();
  session.revision += 1;

  try {
    await session.save();
  } catch (error) {
    if (isObjectRecord(error) && error.code === 11000) {
      throw new AppError(
        "This campaign already has a live session.",
        409,
        "GAME_SESSION_ALREADY_LIVE"
      );
    }

    throw error;
  }

  publishSessionEvent("game-session.started", session);
  return toGameSessionRecord(session);
}

export async function endOwnedGameSession(options: {
  gameSessionId: string;
  ownerId: Types.ObjectId;
}) {
  const session = await findOwnedSession(options);

  if (session.status === "ended") {
    return toGameSessionRecord(session);
  }

  assertStatus(session, ["live"], "ended");
  session.status = "ended";
  session.endedAt = new Date();
  session.revision += 1;
  await session.save();

  // Ending the session closes the combat it hosted so players do not keep a stale tracker.
  const closedTracker = await Campaign.updateOne(
    { _id: session.campaignId, "liveEncounterTracker.gameSessionId": session._id },
    { $set: { liveEncounterTracker: null } }
  ).exec();

  if (closedTracker.modifiedCount > 0) {
    publishCampaignEvent({
      type: "live-encounter.updated",
      campaignId: session.campaignId.toString(),
      revision: 0
    });
  }

  publishSessionEvent("game-session.ended", session);
  return toGameSessionRecord(session);
}

export async function listGameSessionsForMember(options: {
  campaignId: string;
  userId: Types.ObjectId;
}) {
  const { campaignId } = await resolveCampaignRole(options);
  const sessions = await GameSession.find({ campaignId })
    .sort({ scheduledAt: 1, createdAt: 1 })
    .exec();

  return sessions.map(toGameSessionRecord);
}

export async function setGameSessionAvailability(options: {
  gameSessionId: string;
  state: unknown;
  userId: Types.ObjectId;
}) {
  if (!GAME_SESSION_AVAILABILITY_STATES.includes(options.state as GameSessionAvailabilityState)) {
    throw new AppError("Availability is invalid.", 400, "INVALID_GAME_SESSION_INPUT", {
      field: "state"
    });
  }

  const gameSessionId = createObjectId(
    options.gameSessionId,
    "Game session id is invalid.",
    "INVALID_GAME_SESSION_ID"
  );
  const found = await GameSession.findById(gameSessionId).select({ campaignId: 1 }).exec();

  if (!found) {
    throw new AppError("Game session was not found.", 404, "GAME_SESSION_NOT_FOUND");
  }

  // Players only: the owner is the GM and does not vote.
  const { role } = await resolveCampaignRole({
    campaignId: found.campaignId.toString(),
    userId: options.userId
  });

  if (role !== "player") {
    throw new AppError("Only players can set availability.", 403, "GAME_SESSION_FORBIDDEN");
  }

  const state = options.state as GameSessionAvailabilityState;
  const now = new Date();

  // Update the player's entry in place; otherwise push a new one. Both only apply while planned.
  const updated = await GameSession.findOneAndUpdate(
    { _id: gameSessionId, status: "planned", "availability.userId": options.userId },
    {
      $set: { "availability.$.state": state, "availability.$.updatedAt": now },
      $inc: { revision: 1 }
    },
    { new: true }
  ).exec();
  const session =
    updated ??
    (await GameSession.findOneAndUpdate(
      { _id: gameSessionId, status: "planned", "availability.userId": { $ne: options.userId } },
      {
        $push: { availability: { userId: options.userId, state, updatedAt: now } },
        $inc: { revision: 1 }
      },
      { new: true }
    ).exec());

  if (!session) {
    throw new AppError(
      "Availability can only be set on a planned session.",
      409,
      "GAME_SESSION_INVALID_STATE"
    );
  }

  publishSessionEvent("game-session.updated", session);
  return toGameSessionRecord(session);
}

export type PlayerSessionScope = "upcoming" | "all";

/**
 * Sessions for campaigns where the user owns a character in the selected party. "upcoming" is the
 * planned and live sessions the player has not hidden (the bell); "all" adds ended and cancelled
 * ones and the hidden ones, flagged, for the Sessions page.
 */
export async function listGameSessionsForPlayer(options: {
  scope?: PlayerSessionScope;
  userId: Types.ObjectId;
}) {
  const scope = options.scope ?? "upcoming";
  const sheets = await CharacterSheet.find({ ownerId: options.userId, deletedAt: null })
    .select({ _id: 1, clientId: 1 })
    .lean()
    .exec();

  if (sheets.length === 0) {
    return [];
  }

  const sheetIds = sheets.map((sheet) => sheet._id);
  const parties = await PartyGroup.find({ characterIds: { $in: sheetIds } })
    .select({ characterIds: 1 })
    .lean()
    .exec();

  if (parties.length === 0) {
    return [];
  }

  const campaigns = await Campaign.find({
    selectedPartyId: { $in: parties.map((party) => party._id) },
    ownerId: { $ne: options.userId }
  })
    .select({ name: 1, selectedPartyId: 1, imageUrl: 1 })
    .lean()
    .exec();
  const sessions = await GameSession.find({
    campaignId: { $in: campaigns.map((campaign) => campaign._id) },
    ...(scope === "upcoming"
      ? { status: { $in: ["planned", "live"] }, hiddenByUserIds: { $ne: options.userId } }
      : {})
  })
    .sort({ scheduledAt: 1, createdAt: 1 })
    .exec();
  const ownedSheetIds = new Set(sheetIds.map((id) => id.toString()));

  return sessions.flatMap((session) => {
    const campaign = campaigns.find((entry) => entry._id.equals(session.campaignId));
    const party = parties.find(
      (entry) => campaign?.selectedPartyId && entry._id.equals(campaign.selectedPartyId)
    );
    const characterId = party?.characterIds.find((id) => ownedSheetIds.has(id.toString()));
    const sheet = sheets.find((entry) => characterId && entry._id.equals(characterId));

    return campaign && characterId
      ? [
          {
            ...toGameSessionRecord(session),
            campaignName: campaign.name,
            campaignImageUrl: campaign.imageUrl ?? "",
            characterId: characterId.toString(),
            characterClientId: sheet?.clientId ?? null,
            hidden: session.hiddenByUserIds.some((id) => id.equals(options.userId))
          }
        ]
      : [];
  });
}

async function findSessionForMember(options: { gameSessionId: string; userId: Types.ObjectId }) {
  const gameSessionId = createObjectId(
    options.gameSessionId,
    "Game session id is invalid.",
    "INVALID_GAME_SESSION_ID"
  );
  const session = await GameSession.findById(gameSessionId).exec();

  if (!session) {
    throw new AppError("Game session was not found.", 404, "GAME_SESSION_NOT_FOUND");
  }

  // 404 for non-members, like the rest of the campaign endpoints.
  const { role } = await resolveCampaignRole({
    campaignId: session.campaignId.toString(),
    userId: options.userId
  });

  return { role, session };
}

/** A player hides a session from their own lists (or shows it again). The GM and others are unaffected. */
export async function setGameSessionHidden(options: {
  gameSessionId: string;
  hidden: unknown;
  userId: Types.ObjectId;
}) {
  if (typeof options.hidden !== "boolean") {
    throw new AppError("Hidden must be true or false.", 400, "INVALID_GAME_SESSION_INPUT", {
      field: "hidden"
    });
  }

  const { role, session } = await findSessionForMember(options);

  if (role !== "player") {
    throw new AppError("Only players can hide sessions.", 403, "GAME_SESSION_FORBIDDEN");
  }

  await GameSession.updateOne(
    { _id: session._id },
    options.hidden
      ? { $addToSet: { hiddenByUserIds: options.userId } }
      : { $pull: { hiddenByUserIds: options.userId } }
  ).exec();

  return { hidden: options.hidden };
}

/**
 * The log (recap) of the most recent ended session of the same campaign that came before this one,
 * or null when no earlier session has one. Members of the campaign only.
 */
export async function getPreviousGameSessionLog(options: {
  gameSessionId: string;
  userId: Types.ObjectId;
}) {
  const { session } = await findSessionForMember(options);
  const reference =
    (session.status === "ended" ? session.endedAt : session.scheduledAt) ?? new Date();
  const previous = await GameSession.findOne({
    campaignId: session.campaignId,
    _id: { $ne: session._id },
    status: "ended",
    recap: { $ne: "" },
    endedAt: { $lt: reference }
  })
    .sort({ endedAt: -1 })
    .select({ title: 1, scheduledAt: 1, endedAt: 1, recap: 1 })
    .exec();

  return {
    log: previous
      ? {
          id: previous.id as string,
          title: previous.title,
          scheduledAt: toIsoTimestamp(previous.scheduledAt),
          endedAt: toIsoTimestamp(previous.endedAt),
          recap: previous.recap
        }
      : null
  };
}

/** The GM suggests a new time for a planned session; players are emailed unless they opted out. */
export async function proposeGameSessionReschedule(options: {
  body: Record<string, unknown>;
  gameSessionId: string;
  ownerId: Types.ObjectId;
}) {
  const session = await findOwnedSession(options);

  assertStatus(session, ["planned"], "rescheduled");

  const proposedAt =
    options.body.proposedAt === undefined ? null : normalizeOptionalDate(options.body.proposedAt);

  if (!proposedAt || proposedAt.getTime() <= Date.now()) {
    throw new AppError("Pick a time in the future.", 400, "INVALID_GAME_SESSION_INPUT", {
      field: "proposedAt"
    });
  }

  const message =
    options.body.message === undefined || options.body.message === null
      ? ""
      : typeof options.body.message === "string"
        ? options.body.message.trim()
        : null;

  if (message === null || message.length > GAME_SESSION_PROPOSAL_MESSAGE_MAX_LENGTH) {
    throw new AppError("Note is invalid.", 400, "INVALID_GAME_SESSION_INPUT", { field: "message" });
  }

  const previousScheduledAt = session.scheduledAt ?? null;

  session.rescheduleProposal = { proposedAt, message, createdAt: new Date() };
  session.revision += 1;
  await session.save();
  publishSessionEvent("game-session.updated", session);
  queueGameSessionRescheduleEmails(session, previousScheduledAt);
  return toGameSessionRecord(session);
}

export async function withdrawGameSessionReschedule(options: {
  gameSessionId: string;
  ownerId: Types.ObjectId;
}) {
  const session = await findOwnedSession(options);

  if (session.rescheduleProposal) {
    session.rescheduleProposal = null;
    session.revision += 1;
    await session.save();
    publishSessionEvent("game-session.updated", session);
  }

  return toGameSessionRecord(session);
}

/**
 * The GM's view of the players: who they are, and how each answered for the planned and live sessions.
 * A player who has not answered has a null state.
 */
export async function getCampaignPlayerStatus(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
}) {
  const campaignId = createObjectId(
    options.campaignId,
    "Campaign id is invalid.",
    "INVALID_CAMPAIGN_ID"
  );
  const campaign = await Campaign.findOne({ _id: campaignId, ownerId: options.ownerId })
    .select({ ownerId: 1, selectedPartyId: 1 })
    .exec();

  if (!campaign) {
    throw new AppError("Campaign was not found.", 404, "CAMPAIGN_NOT_FOUND");
  }

  const playerIds = (await getCampaignPlayerUserIds(campaign)).filter(
    (id) => !id.equals(campaign.ownerId)
  );
  const users = await User.find({ _id: { $in: playerIds } })
    .select({ nickname: 1, avatarUrl: 1, bio: 1, emailVerifiedAt: 1 })
    .exec();
  const sessions = await GameSession.find({ campaignId, status: { $in: ["planned", "live"] } })
    .sort({ scheduledAt: 1, createdAt: 1 })
    .exec();

  return {
    players: users.map((user) => ({
      userId: user.id as string,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl ?? "",
      bio: user.bio ?? "",
      emailVerified: Boolean(user.emailVerifiedAt)
    })),
    sessions: sessions.map((session) => ({
      id: session.id as string,
      title: session.title,
      status: session.status,
      scheduledAt: toIsoTimestamp(session.scheduledAt),
      rescheduleProposal: toGameSessionRecord(session).rescheduleProposal,
      responses: users.map((user) => ({
        userId: user.id as string,
        state:
          session.availability.find((entry) => entry.userId.equals(user._id))?.state ?? null
      }))
    }))
  };
}
