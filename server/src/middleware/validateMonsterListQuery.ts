import {
  normalizeOptionalString,
  parsePositiveInteger,
  readSingleQueryValue
} from "../utils/queryValues.js";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import type {
  MonsterChallengeRatingBucket,
  MonsterListQuery,
  MonsterListQueryLocals,
  MonsterOrdering
} from "../types/monster.js";

const ALLOWED_ORDERINGS = new Set<MonsterOrdering>([
  "name",
  "-name",
  "type",
  "-type",
  "challenge_rating",
  "-challenge_rating",
  "document",
  "-document",
  "cr",
  "-cr"
]);
const ALLOWED_CHALLENGE_RATING_BUCKETS = new Set<MonsterChallengeRatingBucket>([
  "0",
  "<1",
  ...Array.from({ length: 28 }, (_, index) => String(index + 2) as MonsterChallengeRatingBucket),
  "30+"
]);

function parseOrdering(value: string | undefined): MonsterOrdering | undefined {
  if (!value) {
    return undefined;
  }

  if (!ALLOWED_ORDERINGS.has(value as MonsterOrdering)) {
    throw new AppError("Unsupported ordering value.", 400, "INVALID_QUERY", {
      parameter: "ordering",
      allowedValues: [...ALLOWED_ORDERINGS]
    });
  }

  return value as MonsterOrdering;
}

function parseChallengeRatingValue(
  value: string | undefined,
  parameter = "challenge_rating"
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new AppError(
      `Query parameter "${parameter}" must be a non-negative number.`,
      400,
      "INVALID_QUERY",
      {
        parameter
      }
    );
  }

  return parsedValue;
}

function parseChallengeRatingBucketValue(
  value: string | undefined
): MonsterChallengeRatingBucket | undefined {
  if (!value) {
    return undefined;
  }

  if (!ALLOWED_CHALLENGE_RATING_BUCKETS.has(value as MonsterChallengeRatingBucket)) {
    throw new AppError("Unsupported challenge rating bucket.", 400, "INVALID_QUERY", {
      parameter: "challengeRatingBucket",
      allowedValues: [...ALLOWED_CHALLENGE_RATING_BUCKETS]
    });
  }

  return value as MonsterChallengeRatingBucket;
}

function normalizeOptionalStringList(value: string | undefined): string[] | undefined {
  const normalizedEntries = value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return normalizedEntries && normalizedEntries.length > 0
    ? Array.from(new Set(normalizedEntries))
    : undefined;
}

function buildMonsterListQuery(request: Request): MonsterListQuery {
  const sourceValue =
    normalizeOptionalString(readSingleQueryValue(request.query.source, "source")) ??
    normalizeOptionalString(readSingleQueryValue(request.query.document__slug, "document__slug"));
  const challengeRatingValue =
    readSingleQueryValue(request.query.challenge_rating, "challenge_rating") ??
    readSingleQueryValue(request.query.challengeRating, "challengeRating") ??
    readSingleQueryValue(request.query.cr, "cr");
  const maxChallengeRatingValue =
    readSingleQueryValue(request.query.max_challenge_rating, "max_challenge_rating") ??
    readSingleQueryValue(request.query.maxChallengeRating, "maxChallengeRating") ??
    readSingleQueryValue(request.query.max_cr, "max_cr") ??
    readSingleQueryValue(request.query.maxCr, "maxCr");
  const challengeRatingBucketValue =
    readSingleQueryValue(request.query.challengeRatingBucket, "challengeRatingBucket") ??
    readSingleQueryValue(request.query.challenge_rating_bucket, "challenge_rating_bucket");

  return {
    search: normalizeOptionalString(readSingleQueryValue(request.query.search, "search")),
    page: parsePositiveInteger(readSingleQueryValue(request.query.page, "page"), "page", 1),
    limit: parsePositiveInteger(
      readSingleQueryValue(request.query.limit, "limit"),
      "limit",
      20,
      100
    ),
    ordering: parseOrdering(readSingleQueryValue(request.query.ordering, "ordering")),
    challengeRating: parseChallengeRatingValue(challengeRatingValue),
    challengeRatingBucket: parseChallengeRatingBucketValue(challengeRatingBucketValue),
    maxChallengeRating: parseChallengeRatingValue(maxChallengeRatingValue, "max_challenge_rating"),
    type: normalizeOptionalString(readSingleQueryValue(request.query.type, "type")),
    types: normalizeOptionalStringList(
      readSingleQueryValue(request.query.types, "types") ??
        readSingleQueryValue(request.query.type__in, "type__in")
    ),
    source: sourceValue
  };
}

export function validateMonsterListQuery(
  request: Request,
  response: Response<unknown, MonsterListQueryLocals>,
  next: NextFunction
) {
  try {
    response.locals.monsterListQuery = buildMonsterListQuery(request);
    next();
  } catch (error: unknown) {
    next(error);
  }
}
