import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthenticatedLocals } from "../middleware/authMiddleware.js";
import {
  resolveCampaignRole,
  resolvePartyMemberCampaignIds
} from "../services/campaignMembershipService.js";
import { subscribeToCampaignEvents } from "../services/campaignEventBus.js";
import {
  cancelOwnedGameSession,
  createOwnedGameSession,
  endOwnedGameSession,
  getOwnedGameSession,
  listGameSessionsForMember,
  listOwnedGameSessions,
  dismissGameSessionLogReminder,
  getCampaignPlayerStatus,
  getPreviousGameSessionLog,
  listGameSessionsForPlayer,
  listPendingGameSessionLogs,
  proposeGameSessionReschedule,
  setGameSessionAvailability,
  setGameSessionHidden,
  startOwnedGameSession,
  updateOwnedGameSession,
  withdrawGameSessionReschedule
} from "../services/gameSessionService.js";

type Locals = Response<unknown, AuthenticatedLocals>;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getBody(request: Request) {
  if (!isObjectRecord(request.body)) {
    throw new AppError("Request body must be a JSON object.", 400, "INVALID_GAME_SESSION_INPUT");
  }

  return request.body;
}

function getSessionOptions(request: Request, response: Locals) {
  return {
    gameSessionId: request.params.gameSessionId ?? "",
    ownerId: response.locals.authUser._id
  };
}

export const listGameSessions = asyncHandler(async (request: Request, response: Locals) => {
  const campaignId = typeof request.query.campaignId === "string" ? request.query.campaignId : "";

  const userId = response.locals.authUser._id;
  const { role } = await resolveCampaignRole({ campaignId, userId });

  response.json({
    gameSessions:
      role === "owner"
        ? await listOwnedGameSessions({ campaignId, ownerId: userId })
        : await listGameSessionsForMember({ campaignId, userId })
  });
});

export const createGameSession = asyncHandler(async (request: Request, response: Locals) => {
  const body = getBody(request);
  const gameSession = await createOwnedGameSession({
    body,
    campaignId: typeof body.campaignId === "string" ? body.campaignId : "",
    ownerId: response.locals.authUser._id
  });

  response.status(201).json({ gameSession });
});

export const getGameSession = asyncHandler(async (request: Request, response: Locals) => {
  response.json({ gameSession: await getOwnedGameSession(getSessionOptions(request, response)) });
});

export const updateGameSession = asyncHandler(async (request: Request, response: Locals) => {
  response.json({
    gameSession: await updateOwnedGameSession({
      ...getSessionOptions(request, response),
      body: getBody(request)
    })
  });
});

export const cancelGameSession = asyncHandler(async (request: Request, response: Locals) => {
  response.json({
    gameSession: await cancelOwnedGameSession(getSessionOptions(request, response))
  });
});

export const startGameSession = asyncHandler(async (request: Request, response: Locals) => {
  response.json({ gameSession: await startOwnedGameSession(getSessionOptions(request, response)) });
});

export const endGameSession = asyncHandler(async (request: Request, response: Locals) => {
  response.json({ gameSession: await endOwnedGameSession(getSessionOptions(request, response)) });
});

export const setAvailability = asyncHandler(async (request: Request, response: Locals) => {
  response.json({
    gameSession: await setGameSessionAvailability({
      gameSessionId: request.params.gameSessionId ?? "",
      state: getBody(request).state,
      userId: response.locals.authUser._id
    })
  });
});

const SSE_HEARTBEAT_MS = 25_000;
const SSE_MAX_SUBSCRIPTIONS = 25;

/** Query params may repeat (`?campaignId=a&campaignId=b`); a single value still works. */
function readQueryList(value: unknown) {
  const values = Array.isArray(value) ? value : [value];

  return [
    ...new Set(
      values
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
  ].slice(0, SSE_MAX_SUBSCRIPTIONS);
}

/**
 * One connection can follow many campaigns and parties, so a browser tab needs a single stream.
 * Entries the user cannot access are skipped; if none are accessible the request fails like before.
 */
async function resolveStreamSubscriptions(request: Request, response: Locals) {
  const userId = response.locals.authUser._id;
  const campaignRequests = readQueryList(request.query.campaignId);
  const partyRequests = readQueryList(request.query.partyGroupId);
  const campaignResults = await Promise.allSettled(
    campaignRequests.map((campaignId) => resolveCampaignRole({ campaignId, userId }))
  );
  const partyResults = await Promise.allSettled(
    partyRequests.map((partyGroupId) => resolvePartyMemberCampaignIds({ partyGroupId, userId }))
  );
  const campaignIds = new Set<string>();
  const partyIdsByCampaign = new Map<string, string[]>();

  campaignResults.forEach((result) => {
    if (result.status === "fulfilled") {
      campaignIds.add(result.value.campaignId.toString());
    }
  });
  partyResults.forEach((result, index) => {
    if (result.status !== "fulfilled") {
      return;
    }

    result.value.forEach((campaignId) => {
      campaignIds.add(campaignId);
      partyIdsByCampaign.set(campaignId, [
        ...(partyIdsByCampaign.get(campaignId) ?? []),
        partyRequests[index]!
      ]);
    });
  });

  const failure = [...campaignResults, ...partyResults].find(
    (result): result is PromiseRejectedResult => result.status === "rejected"
  );
  const requestedAnything = campaignRequests.length + partyRequests.length > 0;
  const accessedAnything =
    campaignIds.size > 0 || partyResults.some((result) => result.status === "fulfilled");

  if (!requestedAnything) {
    throw new AppError("Campaign was not found.", 404, "CAMPAIGN_NOT_FOUND");
  }

  if (!accessedAnything && failure) {
    throw failure.reason;
  }

  return { campaignIds: [...campaignIds], partyIdsByCampaign };
}

export const streamCampaignEvents = asyncHandler(async (request: Request, response: Locals) => {
  const { campaignIds, partyIdsByCampaign } = await resolveStreamSubscriptions(request, response);

  // The client may have disconnected while access was being resolved; its close event already fired.
  if (response.destroyed || response.writableEnded) {
    return;
  }

  response.status(200).set({
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "X-Accel-Buffering": "no"
  });
  response.flushHeaders();
  response.write("retry: 3000\n\n");

  const unsubscribers = campaignIds.map((campaignId) =>
    subscribeToCampaignEvents(campaignId, (event) => {
      // partyGroupIds lets a shared client stream route the event to party-scoped listeners.
      const payload = { ...event, partyGroupIds: partyIdsByCampaign.get(event.campaignId) ?? [] };

      response.write(`event: ${event.type}\ndata: ${JSON.stringify(payload)}\n\n`);
    })
  );
  const heartbeat = setInterval(() => response.write(": keep-alive\n\n"), SSE_HEARTBEAT_MS);

  request.on("close", () => {
    clearInterval(heartbeat);
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  });
});

export const listMyUpcomingGameSessions = asyncHandler(
  async (request: Request, response: Locals) => {
    response.json({
      gameSessions: await listGameSessionsForPlayer({
        scope: request.query.scope === "all" ? "all" : "upcoming",
        userId: response.locals.authUser._id
      })
    });
  }
);

export const setSessionHidden = asyncHandler(async (request: Request, response: Locals) => {
  response.json(
    await setGameSessionHidden({
      gameSessionId: request.params.gameSessionId ?? "",
      hidden: getBody(request).hidden,
      userId: response.locals.authUser._id
    })
  );
});

export const getSessionPreviousLog = asyncHandler(async (request: Request, response: Locals) => {
  response.json(
    await getPreviousGameSessionLog({
      gameSessionId: request.params.gameSessionId ?? "",
      userId: response.locals.authUser._id
    })
  );
});

export const proposeSessionReschedule = asyncHandler(async (request: Request, response: Locals) => {
  response.json({
    gameSession: await proposeGameSessionReschedule({
      ...getSessionOptions(request, response),
      body: getBody(request)
    })
  });
});

export const withdrawSessionReschedule = asyncHandler(
  async (request: Request, response: Locals) => {
    response.json({
      gameSession: await withdrawGameSessionReschedule(getSessionOptions(request, response))
    });
  }
);

export const getCampaignStatus = asyncHandler(async (request: Request, response: Locals) => {
  response.json(
    await getCampaignPlayerStatus({
      campaignId: typeof request.query.campaignId === "string" ? request.query.campaignId : "",
      ownerId: response.locals.authUser._id
    })
  );
});

export const listPendingSessionLogs = asyncHandler(async (_request: Request, response: Locals) => {
  response.json({
    gameSessions: await listPendingGameSessionLogs({ ownerId: response.locals.authUser._id })
  });
});

export const dismissSessionLogReminder = asyncHandler(
  async (request: Request, response: Locals) => {
    response.json(await dismissGameSessionLogReminder(getSessionOptions(request, response)));
  }
);
