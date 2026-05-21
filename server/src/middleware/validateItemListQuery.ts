import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import type {
  ItemArmorType,
  ItemAttackType,
  ItemBrowserTab,
  ItemListQuery,
  ItemListQueryLocals,
  ItemOrdering,
  ItemProficiencyType
} from "../types/item.js";
import { ALLOWED_ITEM_SPECIAL_FILTERS } from "../services/itemSpecialFilters.js";
import {
  isArtificerReplicateMagicItemPlanKey,
  isArtificerReplicateMagicItemSpecificPlanKey
} from "../services/artificerReplicateMagicItemPlans.js";

const ALLOWED_ORDERINGS = new Set<ItemOrdering>([
  "name",
  "-name",
  "rarity",
  "-rarity",
  "weight",
  "-weight",
  "cost",
  "-cost"
]);
const ALLOWED_TABS = new Set<ItemBrowserTab>(["all", "weapons", "armor", "gear"]);
const ALLOWED_ATTACK_TYPES = new Set<ItemAttackType>(["melee", "range"]);
const ALLOWED_PROFICIENCY_TYPES = new Set<ItemProficiencyType>(["simple", "martial"]);
const ALLOWED_ARMOR_TYPES = new Set<ItemArmorType>(["light", "medium", "heavy"]);

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

function readStringListQueryValue(value: unknown, name: string): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const rawValues = Array.isArray(value) ? value : [value];

  return rawValues.flatMap((entry) => {
    if (typeof entry === "object" && entry !== null) {
      throw new AppError(
        `Query parameter "${name}" must be a string value or repeated string values.`,
        400,
        "INVALID_QUERY",
        {
          parameter: name
        }
      );
    }

    return String(entry)
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  });
}

function parsePositiveInteger(
  value: string | undefined,
  name: string,
  fallback: number,
  max?: number
) {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new AppError(
      `Query parameter "${name}" must be a positive integer.`,
      400,
      "INVALID_QUERY",
      {
        parameter: name
      }
    );
  }

  if (max !== undefined && parsedValue > max) {
    throw new AppError(`Query parameter "${name}" must be at most ${max}.`, 400, "INVALID_QUERY", {
      parameter: name
    });
  }

  return parsedValue;
}

function parseOrdering(value: string | undefined): ItemOrdering | undefined {
  if (!value) {
    return undefined;
  }

  if (!ALLOWED_ORDERINGS.has(value as ItemOrdering)) {
    throw new AppError("Unsupported ordering value.", 400, "INVALID_QUERY", {
      parameter: "ordering",
      allowedValues: [...ALLOWED_ORDERINGS]
    });
  }

  return value as ItemOrdering;
}

function parseEnumValue<T extends string>(
  value: string | undefined,
  parameter: string,
  allowedValues: Set<T>
): T | undefined {
  if (!value) {
    return undefined;
  }

  if (!allowedValues.has(value as T)) {
    throw new AppError(`Unsupported ${parameter} value.`, 400, "INVALID_QUERY", {
      parameter,
      allowedValues: [...allowedValues]
    });
  }

  return value as T;
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : undefined;
}

function parseArtificerPlan(value: string | undefined): string | undefined {
  const normalizedValue = normalizeOptionalString(value);

  if (!isArtificerReplicateMagicItemPlanKey(normalizedValue)) {
    throw new AppError("Unsupported artificerPlan value.", 400, "INVALID_QUERY", {
      parameter: "artificerPlan"
    });
  }

  return normalizedValue;
}

function parseArtificerPlans(values: string[] | undefined): string[] | undefined {
  if (values === undefined) {
    return undefined;
  }

  const uniqueValues = [...new Set(values)];
  const invalidValue = uniqueValues.find(
    (value) => !isArtificerReplicateMagicItemSpecificPlanKey(value)
  );

  if (invalidValue) {
    throw new AppError("Unsupported artificerPlans value.", 400, "INVALID_QUERY", {
      parameter: "artificerPlans"
    });
  }

  return uniqueValues;
}

function buildItemListQuery(request: Request): ItemListQuery {
  return {
    search: normalizeOptionalString(readSingleQueryValue(request.query.search, "search")),
    page: parsePositiveInteger(readSingleQueryValue(request.query.page, "page"), "page", 1),
    limit: parsePositiveInteger(
      readSingleQueryValue(request.query.limit, "limit"),
      "limit",
      50,
      100
    ),
    ordering: parseOrdering(readSingleQueryValue(request.query.ordering, "ordering")),
    tab: parseEnumValue(readSingleQueryValue(request.query.tab, "tab"), "tab", ALLOWED_TABS),
    category: normalizeOptionalString(readSingleQueryValue(request.query.category, "category")),
    attackType: parseEnumValue(
      readSingleQueryValue(request.query.attackType, "attackType"),
      "attackType",
      ALLOWED_ATTACK_TYPES
    ),
    proficiencyType: parseEnumValue(
      readSingleQueryValue(request.query.proficiencyType, "proficiencyType"),
      "proficiencyType",
      ALLOWED_PROFICIENCY_TYPES
    ),
    mastery: normalizeOptionalString(readSingleQueryValue(request.query.mastery, "mastery")),
    property: normalizeOptionalString(readSingleQueryValue(request.query.property, "property")),
    armorType: parseEnumValue(
      readSingleQueryValue(request.query.armorType, "armorType"),
      "armorType",
      ALLOWED_ARMOR_TYPES
    ),
    rarity: normalizeOptionalString(readSingleQueryValue(request.query.rarity, "rarity")),
    source: normalizeOptionalString(readSingleQueryValue(request.query.source, "source")),
    specialFilter: parseEnumValue(
      readSingleQueryValue(request.query.specialFilter, "specialFilter"),
      "specialFilter",
      ALLOWED_ITEM_SPECIAL_FILTERS
    ),
    artificerPlan: parseArtificerPlan(
      readSingleQueryValue(request.query.artificerPlan, "artificerPlan")
    ),
    artificerPlans: parseArtificerPlans(
      readStringListQueryValue(request.query.artificerPlans, "artificerPlans")
    )
  };
}

export function validateItemListQuery(
  request: Request,
  response: Response<unknown, ItemListQueryLocals>,
  next: NextFunction
) {
  try {
    response.locals.itemListQuery = buildItemListQuery(request);
    next();
  } catch (error: unknown) {
    next(error);
  }
}
