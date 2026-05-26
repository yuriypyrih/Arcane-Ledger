import { ApiRequestFailedError } from "../../api/client";

export function getDmToolsApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestFailedError || error instanceof Error) {
    return error.message;
  }

  return fallback;
}
