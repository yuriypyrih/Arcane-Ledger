import { Router } from "express";
import { submitSupportFeedback } from "../controllers/supportController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const supportRoutes = Router();

supportRoutes.post("/feedback", requireAuth, submitSupportFeedback);

export { supportRoutes };
