import { Router } from "express";
import { analyticsRoutes } from "./analyticsRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { characterRoutes } from "./characterRoutes.js";
import { healthRoutes } from "./healthRoutes.js";
import { itemRoutes } from "./itemRoutes.js";
import { monsterRoutes } from "./monsterRoutes.js";
import { supportRoutes } from "./supportRoutes.js";

const apiRouter = Router();

apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/characters", characterRoutes);
apiRouter.use("/health", healthRoutes);
apiRouter.use("/items", itemRoutes);
apiRouter.use("/monsters", monsterRoutes);
apiRouter.use("/support", supportRoutes);

export { apiRouter };
