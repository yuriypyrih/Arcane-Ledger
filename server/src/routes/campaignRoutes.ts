import { Router } from "express";
import {
  copyEncounterTemplateToCampaignById,
  createCampaign,
  createCampaignPreparedEncounterById,
  createCampaignSessionNoteById,
  deleteCampaign,
  getCampaign,
  listCampaigns,
  removeCampaignLiveEncounterById,
  removeCampaignPreparedEncounterById,
  removeCampaignPreparedEncounterCreatureById,
  removeCampaignSessionNoteById,
  startCampaignLiveEncounterById,
  updateCampaign,
  updateCampaignLiveEncounterById,
  updateCampaignParty,
  updateCampaignPreparedEncounterById,
  updateCampaignPreparedEncounterCreatureVisibilityById,
  updateCampaignPreparedEncounterVisibilityById,
  updateCampaignSessionNoteById,
  updateCampaignVisibility,
  upsertCampaignPreparedEncounterCreatureById
} from "../controllers/campaignController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const campaignRoutes = Router();

campaignRoutes.get("/", requireAuth, listCampaigns);
campaignRoutes.post("/", requireAuth, createCampaign);
campaignRoutes.delete("/:campaignId", requireAuth, deleteCampaign);
campaignRoutes.patch("/:campaignId", requireAuth, updateCampaign);
campaignRoutes.patch("/:campaignId/visibility-settings", requireAuth, updateCampaignVisibility);
campaignRoutes.patch("/:campaignId/selected-party", requireAuth, updateCampaignParty);
campaignRoutes.post("/:campaignId/live-encounter", requireAuth, startCampaignLiveEncounterById);
campaignRoutes.patch("/:campaignId/live-encounter", requireAuth, updateCampaignLiveEncounterById);
campaignRoutes.delete("/:campaignId/live-encounter", requireAuth, removeCampaignLiveEncounterById);
campaignRoutes.post("/:campaignId/session-notes", requireAuth, createCampaignSessionNoteById);
campaignRoutes.put(
  "/:campaignId/session-notes/:sessionNoteId",
  requireAuth,
  updateCampaignSessionNoteById
);
campaignRoutes.delete(
  "/:campaignId/session-notes/:sessionNoteId",
  requireAuth,
  removeCampaignSessionNoteById
);
campaignRoutes.post(
  "/:campaignId/prepared-encounters",
  requireAuth,
  createCampaignPreparedEncounterById
);
campaignRoutes.post(
  "/:campaignId/prepared-encounters/from-template",
  requireAuth,
  copyEncounterTemplateToCampaignById
);
campaignRoutes.patch(
  "/:campaignId/prepared-encounters/:preparedEncounterId/visibility-settings",
  requireAuth,
  updateCampaignPreparedEncounterVisibilityById
);
campaignRoutes.patch(
  "/:campaignId/prepared-encounters/:preparedEncounterId",
  requireAuth,
  updateCampaignPreparedEncounterById
);
campaignRoutes.delete(
  "/:campaignId/prepared-encounters/:preparedEncounterId",
  requireAuth,
  removeCampaignPreparedEncounterById
);
campaignRoutes.put(
  "/:campaignId/prepared-encounters/:preparedEncounterId/creatures/:creatureId",
  requireAuth,
  upsertCampaignPreparedEncounterCreatureById
);
campaignRoutes.patch(
  "/:campaignId/prepared-encounters/:preparedEncounterId/creatures/:creatureId/visibility-settings",
  requireAuth,
  updateCampaignPreparedEncounterCreatureVisibilityById
);
campaignRoutes.delete(
  "/:campaignId/prepared-encounters/:preparedEncounterId/creatures/:creatureId",
  requireAuth,
  removeCampaignPreparedEncounterCreatureById
);
campaignRoutes.get("/:campaignId", requireAuth, getCampaign);

export { campaignRoutes };
