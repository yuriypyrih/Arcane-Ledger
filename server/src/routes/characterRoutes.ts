import express, { Router } from "express";
import { getAppConfig } from "../config/env.js";
import {
  deleteCharacterSheet,
  getCharacterSheet,
  importCharacterSheets,
  listFullCharacterSheets,
  listCharacterSheets,
  saveCharacterSheet,
  uploadCharacterPortrait
} from "../controllers/characterController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const characterRoutes = Router();

characterRoutes.get("/", requireAuth, listCharacterSheets);
characterRoutes.get("/full", requireAuth, listFullCharacterSheets);
characterRoutes.post("/import", requireAuth, importCharacterSheets);
characterRoutes.get("/:characterSheetId", requireAuth, getCharacterSheet);
characterRoutes.put("/:characterSheetId", requireAuth, saveCharacterSheet);
characterRoutes.delete("/:characterSheetId", requireAuth, deleteCharacterSheet);

characterRoutes.put(
  "/:characterId/portrait",
  requireAuth,
  express.raw({
    limit: getAppConfig().characterAvatarUploadMaxBytes,
    type: ["image/webp", "image/jpeg"]
  }),
  uploadCharacterPortrait
);

export { characterRoutes };
