import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { ItemListQueryLocals } from "../types/item.js";
import { createPaginationEnvelope } from "../utils/pagination.js";
import { getItemByKey, listItemFilterOptions, listItems } from "../services/itemService.js";

export const getItems = asyncHandler(
  async (request: Request, response: Response<unknown, ItemListQueryLocals>) => {
    const { count, page, limit, results } = await listItems(response.locals.itemListQuery);

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

export const getItem = asyncHandler(async (request: Request, response: Response) => {
  const key = request.params.key ?? "";
  const item = await getItemByKey(key);

  if (!item) {
    throw new AppError(`Item with key "${key}" was not found.`, 404, "ITEM_NOT_FOUND");
  }

  response.json(item);
});

export const getItemFilters = asyncHandler(async (_request: Request, response: Response) => {
  response.json(await listItemFilterOptions());
});
