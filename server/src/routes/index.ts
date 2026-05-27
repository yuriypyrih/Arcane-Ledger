import { Router } from "express";
import { analyticsRoutes } from "./analyticsRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { characterRoutes } from "./characterRoutes.js";
import { encounterTemplateRoutes } from "./encounterTemplateRoutes.js";
import { healthRoutes } from "./healthRoutes.js";
import { itemRoutes } from "./itemRoutes.js";
import { monsterRoutes } from "./monsterRoutes.js";
import { partyGroupRoutes } from "./partyGroupRoutes.js";
import { supportRoutes } from "./supportRoutes.js";

const apiRouter = Router();

apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/characters", characterRoutes);
apiRouter.use("/encounter-templates", encounterTemplateRoutes);
apiRouter.use("/health", healthRoutes);
apiRouter.use("/items", itemRoutes);
apiRouter.use("/monsters", monsterRoutes);
apiRouter.use("/party-groups", partyGroupRoutes);
apiRouter.use("/support", supportRoutes);

export { apiRouter };
