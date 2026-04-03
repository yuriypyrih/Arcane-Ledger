import { Router } from "express";
import { getMonster, getMonsters } from "../controllers/monsterController.js";
import { validateMonsterListQuery } from "../middleware/validateMonsterListQuery.js";

const monsterRoutes = Router();

monsterRoutes.get("/", validateMonsterListQuery, getMonsters);
monsterRoutes.get("/:slug", getMonster);

export { monsterRoutes };
