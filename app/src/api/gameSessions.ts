import { apiGet, apiPatch, apiPost, apiPut, type ApiRequestOptions } from "./client";

export type GameSessionStatus = "planned" | "live" | "ended" | "cancelled";
export type GameSessionAvailabilityState = "yes" | "maybe" | "no";

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
  startedAt: string | null;
  endedAt: string | null;
  revision: number;
};

export type PlayerGameSessionRecord = GameSessionRecord & {
  campaignName: string;
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

export function listMyUpcomingGameSessions(options?: ApiRequestOptions) {
  return apiGet<{ gameSessions: PlayerGameSessionRecord[] }>("/game-sessions/mine", options);
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
