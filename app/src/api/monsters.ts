import type { MonsterListItem, MonsterOrdering, MonsterRecord, PaginatedApiResponse } from "../types";
import { apiGet, type ApiRequestOptions } from "./client";

export type FetchMonsterListParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  challengeRating?: number;
  maxChallengeRating?: number;
  source?: string;
  ordering?: MonsterOrdering;
};

export async function fetchMonsterList(
  {
    page = 1,
    limit = 50,
    search,
    type,
    challengeRating,
    maxChallengeRating,
    source,
    ordering = "name"
  }: FetchMonsterListParams = {},
  options?: ApiRequestOptions
) {
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

  if (challengeRating !== undefined) {
    searchParams.set("challenge_rating", String(challengeRating));
  }

  if (maxChallengeRating !== undefined) {
    searchParams.set("max_challenge_rating", String(maxChallengeRating));
  }

  return apiGet<PaginatedApiResponse<MonsterListItem>>(
    `monsters?${searchParams.toString()}`,
    options
  );
}

export async function fetchMonsterByKey(key: string, options?: ApiRequestOptions) {
  return apiGet<MonsterRecord>(`monsters/${key}`, options);
}
