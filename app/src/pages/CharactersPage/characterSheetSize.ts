export function getUtf8ByteLength(value: string): number {
  let byteLength = 0;

  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;

    if (codePoint <= 0x7f) {
      byteLength += 1;
    } else if (codePoint <= 0x7ff) {
      byteLength += 2;
    } else if (codePoint <= 0xffff) {
      byteLength += 3;
    } else {
      byteLength += 4;
    }
  }

  return byteLength;
}

export function getSerializedJsonSizeBytes(value: unknown): number {
  try {
    const serializedValue = JSON.stringify(value);

    return typeof serializedValue === "string" ? getUtf8ByteLength(serializedValue) : 0;
  } catch {
    return 0;
  }
}

export function normalizeSheetSizeBytes(value: unknown): number | undefined {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? Math.max(1, Math.floor(parsedValue))
    : undefined;
}

export function formatCharacterSheetSize(sizeBytes: number | undefined): string | null {
  const normalizedSizeBytes = normalizeSheetSizeBytes(sizeBytes);

  if (normalizedSizeBytes === undefined) {
    return null;
  }

  const sizeKilobytes = normalizedSizeBytes / 1024;
  const formattedSize =
    sizeKilobytes < 10 ? sizeKilobytes.toFixed(1) : Math.round(sizeKilobytes).toString();

  return `${formattedSize} KB`;
}
