const MAX_URL_LENGTH = 500;

/** The message to show for a picture link that is not allowed, or null when it is empty or fine. */
export function getHttpsUrlValidationMessage(value: string, label: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return `${label} must be at most ${MAX_URL_LENGTH} characters.`;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "https:" || url.username || url.password) {
      return `${label} must be a plain https:// link.`;
    }
  } catch {
    return `${label} must be a valid https:// link.`;
  }

  return null;
}
