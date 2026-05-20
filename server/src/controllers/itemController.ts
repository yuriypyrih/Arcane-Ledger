import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { ItemListQueryLocals, ItemSpecialFilter } from "../types/item.js";
import { createPaginationEnvelope } from "../utils/pagination.js";
import {
  getItemByKey,
  getItemsByKeys,
  listItemFilterOptions,
  listItems
} from "../services/itemService.js";
import { getItemPackContentsByKey } from "../services/itemPackService.js";
import { ALLOWED_ITEM_SPECIAL_FILTERS } from "../services/itemSpecialFilters.js";

function readSingleQueryValue(value: unknown, name: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
    throw new AppError(`Query parameter "${name}" must be a single string value.`, 400, "INVALID_QUERY", {
      parameter: name
    });
  }

  return String(value);
}

function parseItemSpecialFilter(request: Request): ItemSpecialFilter | undefined {
  const value = readSingleQueryValue(request.query.specialFilter, "specialFilter")?.trim();

  if (!value) {
    return undefined;
  }

  if (!ALLOWED_ITEM_SPECIAL_FILTERS.has(value as ItemSpecialFilter)) {
    throw new AppError("Unsupported specialFilter value.", 400, "INVALID_QUERY", {
      parameter: "specialFilter",
      allowedValues: [...ALLOWED_ITEM_SPECIAL_FILTERS]
    });
  }

  return value as ItemSpecialFilter;
}

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

export const getItemBatch = asyncHandler(async (request: Request, response: Response) => {
  if (!Array.isArray(request.body?.keys)) {
    throw new AppError("Request body must include a keys array.", 400, "INVALID_ITEM_KEYS");
  }

  const rawKeys = request.body.keys as unknown[];
  const validKeys = rawKeys.filter(
    (key): key is string => typeof key === "string" && key.trim().length > 0
  );
  const invalidValueCount = rawKeys.length - validKeys.length;
  const lookup = await getItemsByKeys(validKeys);
  const messageParts = [
    invalidValueCount > 0
      ? `Ignored ${invalidValueCount} invalid item key value${invalidValueCount === 1 ? "" : "s"}.`
      : null,
    lookup.message ?? null
  ].filter(Boolean);

  response.json({
    ...lookup,
    message: messageParts.length > 0 ? messageParts.join(" ") : undefined
  });
});

export const getItemFilters = asyncHandler(async (request: Request, response: Response) => {
  response.json(
    await listItemFilterOptions({
      specialFilter: parseItemSpecialFilter(request)
    })
  );
});

export const getItemPackContents = asyncHandler(async (request: Request, response: Response) => {
  const key = request.params.key ?? "";
  const contents = await getItemPackContentsByKey(key);

  if (!contents) {
    throw new AppError(
      `Equipment pack with key "${key}" was not found.`,
      404,
      "ITEM_PACK_NOT_FOUND"
    );
  }

  response.json(contents);
});
