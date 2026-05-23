import express, { Router } from "express";
import { getAppConfig } from "../config/env.js";
import { uploadCharacterPortrait } from "../controllers/characterController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const characterRoutes = Router();

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
