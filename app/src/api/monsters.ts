import type { MonsterListItem, MonsterRecord, PaginatedApiResponse } from "../types";
import { apiGet } from "./client";

export type FetchMonsterListParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  cr?: number;
  source?: string;
};

export async function fetchMonsterList({
  page = 1,
  limit = 50,
  search,
  type,
  cr,
  source
}: FetchMonsterListParams = {}) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));
  searchParams.set("ordering", "name");

  if (search) {
    searchParams.set("search", search);
  }

  if (type) {
    searchParams.set("type", type);
  }

  if (cr !== undefined) {
    searchParams.set("cr", String(cr));
  }

  if (source) {
    searchParams.set("source", source);
  }

  return apiGet<PaginatedApiResponse<MonsterListItem>>(`monsters?${searchParams.toString()}`);
}

export async function fetchMonsterBySlug(slug: string) {
  return apiGet<MonsterRecord>(`monsters/${slug}`);
}
