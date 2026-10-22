type DescriptionTable = {
  headers: string[];
  rows: string[][];
};

export function parseDescriptionTable(text: string): DescriptionTable | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("|")) return null;

  const lines = trimmed.split(/\r?\n/).map((line) => line.trim());
  if (lines.length < 3 || lines.some((line) => !line.startsWith("|") || !line.endsWith("|"))) {
    return null;
  }

  const [headers, separator, ...rows] = lines.map((line) =>
    line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim())
  );
  if (
    separator.length !== headers.length ||
    separator.some((cell) => !/^:?-{3,}:?$/.test(cell)) ||
    rows.some((row) => row.length !== headers.length)
  ) {
    return null;
  }

  return { headers, rows };
}
