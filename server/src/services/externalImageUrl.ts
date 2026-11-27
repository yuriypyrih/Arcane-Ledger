import { AppError } from "../errors/AppError.js";

export const EXTERNAL_IMAGE_URL_MAX_LENGTH = 500;

/**
 * Picture links entered by users must be plain https URLs: no embedded credentials, no other
 * schemes, and a bounded length. Returns "" for an empty value. The server only stores the link;
 * the browser loads it, so viewers' browsers (not the server) contact the image host.
 */
export function normalizeExternalImageUrl(
  value: unknown,
  options: { code: string; field: string; label: string }
): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const invalid = () =>
    new AppError(`${options.label} must be a valid https:// URL.`, 400, options.code, {
      field: options.field
    });

  if (typeof value !== "string" || value.trim().length > EXTERNAL_IMAGE_URL_MAX_LENGTH) {
    throw invalid();
  }

  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw invalid();
  }

  if (url.protocol !== "https:" || url.username || url.password) {
    throw invalid();
  }

  return url.toString();
}
