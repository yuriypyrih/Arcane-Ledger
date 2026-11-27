import { Router } from "express";
import {
  cancelGameSession,
  createGameSession,
  endGameSession,
  getGameSession,
  listGameSessions,
  listMyUpcomingGameSessions,
  setAvailability,
  startGameSession,
  streamCampaignEvents,
  updateGameSession
} from "../controllers/gameSessionController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const gameSessionRoutes = Router();

gameSessionRoutes.get("/", requireAuth, listGameSessions);
gameSessionRoutes.post("/", requireAuth, createGameSession);
gameSessionRoutes.get("/mine", requireAuth, listMyUpcomingGameSessions);
gameSessionRoutes.get("/events", requireAuth, streamCampaignEvents);
gameSessionRoutes.get("/:gameSessionId", requireAuth, getGameSession);
gameSessionRoutes.patch("/:gameSessionId", requireAuth, updateGameSession);
gameSessionRoutes.post("/:gameSessionId/cancel", requireAuth, cancelGameSession);
gameSessionRoutes.put("/:gameSessionId/availability", requireAuth, setAvailability);
gameSessionRoutes.post("/:gameSessionId/start", requireAuth, startGameSession);
gameSessionRoutes.post("/:gameSessionId/end", requireAuth, endGameSession);

export { gameSessionRoutes };
