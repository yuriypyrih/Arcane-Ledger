import { Router } from "express";
import {
  createEncounterTemplate,
  deleteEncounterTemplate,
  getEncounterTemplate,
  listEncounterTemplates,
  removeEncounterTemplateCreatureById,
  updateEncounterTemplate,
  upsertEncounterTemplateCreatureById
} from "../controllers/encounterTemplateController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const encounterTemplateRoutes = Router();

encounterTemplateRoutes.get("/", requireAuth, listEncounterTemplates);
encounterTemplateRoutes.post("/", requireAuth, createEncounterTemplate);
encounterTemplateRoutes.delete("/:encounterTemplateId", requireAuth, deleteEncounterTemplate);
encounterTemplateRoutes.put(
  "/:encounterTemplateId/creatures/:creatureId",
  requireAuth,
  upsertEncounterTemplateCreatureById
);
encounterTemplateRoutes.delete(
  "/:encounterTemplateId/creatures/:creatureId",
  requireAuth,
  removeEncounterTemplateCreatureById
);
encounterTemplateRoutes.patch("/:encounterTemplateId", requireAuth, updateEncounterTemplate);
encounterTemplateRoutes.get("/:encounterTemplateId", requireAuth, getEncounterTemplate);

export { encounterTemplateRoutes };
