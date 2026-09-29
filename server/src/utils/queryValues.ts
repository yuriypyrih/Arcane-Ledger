import { AppError } from "../errors/AppError.js";

export function readSingleQueryValue(value: unknown, name: string): string | undefined {
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

export function readStringListQueryValue(value: unknown, name: string): string[] | undefined {
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

export function parsePositiveInteger(
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

export function normalizeOptionalString(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : undefined;
}
