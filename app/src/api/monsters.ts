import type { MonsterListItem, MonsterOrdering, MonsterRecord, PaginatedApiResponse } from "../types";
import { apiGet } from "./client";

export type FetchMonsterListParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  cr?: number;
  maxCr?: number;
  source?: string;
  ordering?: MonsterOrdering;
};

export async function fetchMonsterList({
  page = 1,
  limit = 50,
  search,
  type,
  cr,
  maxCr,
  source,
  ordering = "name"
}: FetchMonsterListParams = {}) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));
  searchParams.set("ordering", ordering);

  if (search) {
    searchParams.set("search", search);
  }

  if (type) {
    searchParams.set("type", type);
  }

  if (source) {
    searchParams.set("source", source);
  }

  if (cr !== undefined) {
    searchParams.set("cr", String(cr));
  }

  if (maxCr !== undefined) {
    searchParams.set("max_cr", String(maxCr));
  }

  return apiGet<PaginatedApiResponse<MonsterListItem>>(`monsters?${searchParams.toString()}`);
}

export async function fetchMonsterBySlug(slug: string) {
  return apiGet<MonsterRecord>(`monsters/${slug}`);
}
