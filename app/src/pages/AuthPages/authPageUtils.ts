import { ApiRequestFailedError } from "../../api/client";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestFailedError) {
    return error.message;
  }

  return fallback;
}

export function getApiErrorCode(error: unknown): string | undefined {
  if (error instanceof ApiRequestFailedError) {
    return error.code;
  }

  return undefined;
}

export function formatAuthDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium"
  }).format(new Date(value));
}
