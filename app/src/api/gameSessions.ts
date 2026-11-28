import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type ApiRequestOptions } from "./client";

export type GameSessionStatus = "planned" | "live" | "ended" | "cancelled";
export type GameSessionAvailabilityState = "yes" | "maybe" | "no";

export type GameSessionRescheduleProposal = {
  proposedAt: string;
  message: string;
  createdAt: string;
};

export type GameSessionRecord = {
  id: string;
  campaignId: string;
  title: string;
  scheduledAt: string | null;
  durationMinutes: number | null;
  status: GameSessionStatus;
  recap: string;
  linkedPreparedEncounterIds: string[];
  availability: { userId: string; state: GameSessionAvailabilityState; updatedAt: string }[];
  attendedUserIds: string[];
  /** A new time the GM suggested; null when there is none. */
  rescheduleProposal: GameSessionRescheduleProposal | null;
  startedAt: string | null;
  endedAt: string | null;
  revision: number;
};

export type PlayerGameSessionRecord = GameSessionRecord & {
  campaignName: string;
  campaignImageUrl: string;
  /** True when this player hid the session from their own lists. */
  hidden: boolean;
  characterId: string;
  characterClientId: string | null;
};

export type GameSessionInput = {
  title?: string;
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  recap?: string;
  linkedPreparedEncounterIds?: string[];
};

type GameSessionEnvelope = { gameSession: GameSessionRecord };

export function listGameSessions(campaignId: string, options?: ApiRequestOptions) {
  return apiGet<{ gameSessions: GameSessionRecord[] }>(
    `/game-sessions?campaignId=${encodeURIComponent(campaignId)}`,
    options
  );
}

/** Planned and live sessions the player has not hidden: what the bell shows. */
export function listMyUpcomingGameSessions(options?: ApiRequestOptions) {
  return apiGet<{ gameSessions: PlayerGameSessionRecord[] }>("/game-sessions/mine", options);
}

/** Every session the player can see, past and hidden ones included (flagged). */
export function listAllMyGameSessions(options?: ApiRequestOptions) {
  return apiGet<{ gameSessions: PlayerGameSessionRecord[] }>(
    "/game-sessions/mine?scope=all",
    options
  );
}

export function setGameSessionHidden(
  gameSessionId: string,
  hidden: boolean,
  options?: ApiRequestOptions
) {
  return apiPut<{ hidden: boolean }>(`/game-sessions/${gameSessionId}/hidden`, { hidden }, options);
}

export type GameSessionLog = {
  id: string;
  title: string;
  scheduledAt: string | null;
  endedAt: string | null;
  recap: string;
};

/** The log of the last earlier ended session that has one; log is null when there is none. */
export function getPreviousGameSessionLog(gameSessionId: string, options?: ApiRequestOptions) {
  return apiGet<{ log: GameSessionLog | null }>(
    `/game-sessions/${gameSessionId}/previous-log`,
    options
  );
}

export function proposeGameSessionReschedule(
  gameSessionId: string,
  proposal: { message?: string; proposedAt: string },
  options?: ApiRequestOptions
) {
  return apiPost<GameSessionEnvelope>(
    `/game-sessions/${gameSessionId}/propose-reschedule`,
    proposal,
    options
  );
}

export function withdrawGameSessionReschedule(gameSessionId: string, options?: ApiRequestOptions) {
  return apiDelete<GameSessionEnvelope>(
    `/game-sessions/${gameSessionId}/propose-reschedule`,
    options
  );
}

export type CampaignPlayerStatusPlayer = {
  userId: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
  emailVerified: boolean;
};

export type CampaignPlayerStatusSession = {
  id: string;
  title: string;
  status: GameSessionStatus;
  scheduledAt: string | null;
  rescheduleProposal: GameSessionRescheduleProposal | null;
  /** One entry per player; state is null until that player answers. */
  responses: { userId: string; state: GameSessionAvailabilityState | null }[];
};

export function getCampaignPlayerStatus(campaignId: string, options?: ApiRequestOptions) {
  return apiGet<{ players: CampaignPlayerStatusPlayer[]; sessions: CampaignPlayerStatusSession[] }>(
    `/game-sessions/campaign-status?campaignId=${encodeURIComponent(campaignId)}`,
    options
  );
}

export function createGameSession(
  campaignId: string,
  input: GameSessionInput,
  options?: ApiRequestOptions
) {
  return apiPost<GameSessionEnvelope>("/game-sessions", { ...input, campaignId }, options);
}

export function updateGameSession(
  gameSessionId: string,
  input: GameSessionInput,
  options?: ApiRequestOptions
) {
  return apiPatch<GameSessionEnvelope>(`/game-sessions/${gameSessionId}`, input, options);
}

export function cancelGameSession(gameSessionId: string, options?: ApiRequestOptions) {
  return apiPost<GameSessionEnvelope>(`/game-sessions/${gameSessionId}/cancel`, {}, options);
}

export function startGameSession(gameSessionId: string, options?: ApiRequestOptions) {
  return apiPost<GameSessionEnvelope>(`/game-sessions/${gameSessionId}/start`, {}, options);
}

export function endGameSession(gameSessionId: string, options?: ApiRequestOptions) {
  return apiPost<GameSessionEnvelope>(`/game-sessions/${gameSessionId}/end`, {}, options);
}

export function setGameSessionAvailability(
  gameSessionId: string,
  state: GameSessionAvailabilityState,
  options?: ApiRequestOptions
) {
  return apiPut<GameSessionEnvelope>(
    `/game-sessions/${gameSessionId}/availability`,
    { state },
    options
  );
}

export type PendingSessionLog = {
  id: string;
  campaignId: string;
  campaignName: string;
  title: string;
  endedAt: string | null;
};

/** The GM's recently ended sessions that still have no log. */
export function listPendingSessionLogs(options?: ApiRequestOptions) {
  return apiGet<{ gameSessions: PendingSessionLog[] }>("/game-sessions/pending-logs", options);
}

export function dismissSessionLogReminder(gameSessionId: string, options?: ApiRequestOptions) {
  return apiPost<{ dismissed: boolean }>(
    `/game-sessions/${gameSessionId}/dismiss-log-reminder`,
    {},
    options
  );
}
