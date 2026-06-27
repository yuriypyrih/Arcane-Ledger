import { Router } from "express";
import {
  createCustomItem,
  deleteCustomItem,
  listCustomItems,
  updateCustomItem
} from "../controllers/customItemController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const customItemRoutes = Router();

customItemRoutes.get("/", requireAuth, listCustomItems);
customItemRoutes.post("/", requireAuth, createCustomItem);
customItemRoutes.put("/:customItemId", requireAuth, updateCustomItem);
customItemRoutes.delete("/:customItemId", requireAuth, deleteCustomItem);

export { customItemRoutes };
