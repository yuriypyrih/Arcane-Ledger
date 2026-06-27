import { Router } from "express";
import {
  createCustomSpell,
  deleteCustomSpell,
  listCustomSpells,
  updateCustomSpell
} from "../controllers/customSpellController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const customSpellRoutes = Router();

customSpellRoutes.get("/", requireAuth, listCustomSpells);
customSpellRoutes.post("/", requireAuth, createCustomSpell);
customSpellRoutes.put("/:customSpellId", requireAuth, updateCustomSpell);
customSpellRoutes.delete("/:customSpellId", requireAuth, deleteCustomSpell);

export { customSpellRoutes };
