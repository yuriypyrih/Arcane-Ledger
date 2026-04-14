import { Router } from "express";
import { healthRoutes } from "./healthRoutes.js";
import { itemRoutes } from "./itemRoutes.js";
import { monsterRoutes } from "./monsterRoutes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/items", itemRoutes);
apiRouter.use("/monsters", monsterRoutes);

export { apiRouter };
