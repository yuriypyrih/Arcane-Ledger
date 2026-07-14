import { Router } from "express";
import {
  getAdministrationUsers,
  patchAdministrationUserRole
} from "../controllers/administrationController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";
import { validateAdministrationUserListQuery } from "../middleware/validateAdministrationUserListQuery.js";

const administrationRoutes = Router();

administrationRoutes.use(requireAuth, requireAdmin);
administrationRoutes.get("/users", validateAdministrationUserListQuery, getAdministrationUsers);
administrationRoutes.patch("/users/:userId/role", patchAdministrationUserRole);

export { administrationRoutes };
