type SanitizeUserInputOptions = {
  multiline?: boolean;
};

// eslint-disable-next-line no-control-regex -- User input sanitization intentionally strips C0/C1 controls.
const unsafeControlCharacterPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const whitespacePattern = /\s+/g;

export function sanitizeUserInput(
  value: string,
  { multiline = false }: SanitizeUserInputOptions = {}
): string {
  const normalizedValue = value
    .replace(/\r\n?/g, "\n")
    .replace(unsafeControlCharacterPattern, "")
    .replace(/</g, "\u2039")
    .replace(/>/g, "\u203A")
    .trim();

  return multiline ? normalizedValue : normalizedValue.replace(whitespacePattern, " ");
}
