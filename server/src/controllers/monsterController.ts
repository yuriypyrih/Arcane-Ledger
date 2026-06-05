import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import type { MonsterListQueryLocals } from "../types/monster.js";
import { createPaginationEnvelope } from "../utils/pagination.js";
import { getMonsterByKey, listMonsters } from "../services/monsterService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const getMonsters = asyncHandler(
  async (request: Request, response: Response<unknown, MonsterListQueryLocals>) => {
    const { count, page, limit, results } = await listMonsters(response.locals.monsterListQuery);

    response.json(
      createPaginationEnvelope({
        request,
        count,
        page,
        limit,
        results
      })
    );
  }
);

export const getMonster = asyncHandler(async (request: Request, response: Response) => {
  const key = request.params.key ?? "";
  const monster = await getMonsterByKey(key);

  if (!monster) {
    throw new AppError(`Monster with key "${key}" was not found.`, 404, "MONSTER_NOT_FOUND");
  }

  response.json(monster);
});
