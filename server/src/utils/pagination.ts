import type { Request } from "express";
import type { PaginationEnvelope } from "../types/api.js";

type PaginationInput<T> = {
  request: Request;
  count: number;
  page: number;
  limit: number;
  results: T[];
};

function buildPageUrl(request: Request, page: number) {
  const host = request.get("host");

  if (!host) {
    return null;
  }

  const url = new URL(`${request.protocol}://${host}${request.originalUrl}`);
  url.searchParams.set("page", String(page));

  return url.toString();
}

export function createPaginationEnvelope<T>({
  request,
  count,
  page,
  limit,
  results
}: PaginationInput<T>): PaginationEnvelope<T> {
  const totalPages = count === 0 ? 1 : Math.ceil(count / limit);
  const next = page < totalPages ? buildPageUrl(request, page + 1) : null;
  const previous = page > 1 ? buildPageUrl(request, page - 1) : null;

  return {
    count,
    next,
    previous,
    results
  };
}
