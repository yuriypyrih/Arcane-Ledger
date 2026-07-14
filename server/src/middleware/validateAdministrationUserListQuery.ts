import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import {
  ADMINISTRATION_USER_ORDERINGS,
  ADMINISTRATION_USER_SEARCH_MAX_LENGTH,
  ADMINISTRATION_USER_SEARCH_MIN_LENGTH,
  type AdministrationUserListQueryLocals,
  type AdministrationUserOrdering
} from "../types/administration.js";

const allowedOrderings = new Set<AdministrationUserOrdering>(ADMINISTRATION_USER_ORDERINGS);

function readSingleQueryValue(value: unknown, name: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
    throw new AppError(
      `Query parameter "${name}" must be a single string value.`,
      400,
      "INVALID_QUERY",
      {
        parameter: name
      }
    );
  }

  return String(value);
}

function parsePage(value: string | undefined): number {
  if (!value) {
    return 1;
  }

  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    throw new AppError('Query parameter "page" must be a positive integer.', 400, "INVALID_QUERY", {
      parameter: "page"
    });
  }

  return page;
}

function parseOrdering(value: string | undefined): AdministrationUserOrdering {
  if (!value) {
    return "-createdAt";
  }

  if (!allowedOrderings.has(value as AdministrationUserOrdering)) {
    throw new AppError("Unsupported ordering value.", 400, "INVALID_QUERY", {
      parameter: "ordering",
      allowedValues: ADMINISTRATION_USER_ORDERINGS
    });
  }

  return value as AdministrationUserOrdering;
}

function parseSearch(value: unknown): string | undefined {
  const search = readSingleQueryValue(value, "search")?.trim();

  if (!search) {
    return undefined;
  }

  if (search.length < ADMINISTRATION_USER_SEARCH_MIN_LENGTH) {
    throw new AppError(
      `Query parameter "search" must be at least ${ADMINISTRATION_USER_SEARCH_MIN_LENGTH} characters long.`,
      400,
      "INVALID_QUERY",
      {
        parameter: "search",
        minLength: ADMINISTRATION_USER_SEARCH_MIN_LENGTH
      }
    );
  }

  if (search.length > ADMINISTRATION_USER_SEARCH_MAX_LENGTH) {
    throw new AppError(
      `Query parameter "search" must be at most ${ADMINISTRATION_USER_SEARCH_MAX_LENGTH} characters long.`,
      400,
      "INVALID_QUERY",
      {
        parameter: "search",
        maxLength: ADMINISTRATION_USER_SEARCH_MAX_LENGTH
      }
    );
  }

  return search;
}

export function validateAdministrationUserListQuery(
  request: Request,
  response: Response<unknown, AdministrationUserListQueryLocals>,
  next: NextFunction
) {
  try {
    response.locals.administrationUserListQuery = {
      page: parsePage(readSingleQueryValue(request.query.page, "page")),
      ordering: parseOrdering(readSingleQueryValue(request.query.ordering, "ordering")),
      search: parseSearch(request.query.search)
    };
    next();
  } catch (error: unknown) {
    next(error);
  }
}
