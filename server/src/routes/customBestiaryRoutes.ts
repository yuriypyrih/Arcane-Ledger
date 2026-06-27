import { Router } from "express";
import {
  createCustomBestiary,
  deleteCustomBestiary,
  listCustomBestiary,
  updateCustomBestiary
} from "../controllers/customBestiaryController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const customBestiaryRoutes = Router();

customBestiaryRoutes.get("/", requireAuth, listCustomBestiary);
customBestiaryRoutes.post("/", requireAuth, createCustomBestiary);
customBestiaryRoutes.put("/:customBestiaryId", requireAuth, updateCustomBestiary);
customBestiaryRoutes.delete("/:customBestiaryId", requireAuth, deleteCustomBestiary);

export { customBestiaryRoutes };
