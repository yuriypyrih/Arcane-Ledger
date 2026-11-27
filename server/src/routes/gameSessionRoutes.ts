import { Router } from "express";
import {
  cancelGameSession,
  createGameSession,
  endGameSession,
  dismissSessionLogReminder,
  getCampaignStatus,
  getGameSession,
  getSessionPreviousLog,
  listGameSessions,
  listPendingSessionLogs,
  listMyUpcomingGameSessions,
  proposeSessionReschedule,
  setAvailability,
  setSessionHidden,
  startGameSession,
  streamCampaignEvents,
  updateGameSession,
  withdrawSessionReschedule
} from "../controllers/gameSessionController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const gameSessionRoutes = Router();

gameSessionRoutes.get("/", requireAuth, listGameSessions);
gameSessionRoutes.post("/", requireAuth, createGameSession);
gameSessionRoutes.get("/mine", requireAuth, listMyUpcomingGameSessions);
gameSessionRoutes.get("/events", requireAuth, streamCampaignEvents);
gameSessionRoutes.get("/campaign-status", requireAuth, getCampaignStatus);
gameSessionRoutes.get("/pending-logs", requireAuth, listPendingSessionLogs);
gameSessionRoutes.get("/:gameSessionId", requireAuth, getGameSession);
gameSessionRoutes.patch("/:gameSessionId", requireAuth, updateGameSession);
gameSessionRoutes.post("/:gameSessionId/cancel", requireAuth, cancelGameSession);
gameSessionRoutes.put("/:gameSessionId/availability", requireAuth, setAvailability);
gameSessionRoutes.put("/:gameSessionId/hidden", requireAuth, setSessionHidden);
gameSessionRoutes.post(
  "/:gameSessionId/dismiss-log-reminder",
  requireAuth,
  dismissSessionLogReminder
);
gameSessionRoutes.get("/:gameSessionId/previous-log", requireAuth, getSessionPreviousLog);
gameSessionRoutes.post("/:gameSessionId/propose-reschedule", requireAuth, proposeSessionReschedule);
gameSessionRoutes.delete(
  "/:gameSessionId/propose-reschedule",
  requireAuth,
  withdrawSessionReschedule
);
gameSessionRoutes.post("/:gameSessionId/start", requireAuth, startGameSession);
gameSessionRoutes.post("/:gameSessionId/end", requireAuth, endGameSession);

export { gameSessionRoutes };
