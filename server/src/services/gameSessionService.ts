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
import { queueGameSessionInvites } from "./gameSessionInviteService.js";
import { publishCampaignEvent } from "./campaignEventBus.js";
import { CharacterSheet } from "../models/CharacterSheet.js";
import { PartyGroup } from "../models/PartyGroup.js";
import { resolveCampaignRole } from "./campaignMembershipService.js";

const GAME_SESSION_TITLE_MIN_LENGTH = 2;
const GAME_SESSION_TITLE_MAX_LENGTH = 128;
const GAME_SESSION_RECAP_MAX_LENGTH = 20000;

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
      session.scheduledAt = normalizeOptionalDate(body.scheduledAt);
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

/** Planned and live sessions for campaigns where the user owns a character in the selected party. */
export async function listUpcomingGameSessionsForPlayer(options: { userId: Types.ObjectId }) {
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
    .select({ name: 1, selectedPartyId: 1 })
    .lean()
    .exec();
  const sessions = await GameSession.find({
    campaignId: { $in: campaigns.map((campaign) => campaign._id) },
    status: { $in: ["planned", "live"] }
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
            characterId: characterId.toString(),
            characterClientId: sheet?.clientId ?? null
          }
        ]
      : [];
  });
}
