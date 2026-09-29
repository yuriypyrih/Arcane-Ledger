/** Headings and their following paragraphs, stopping at the next bold heading. */
export function extractDescriptionSection(
  description: readonly string[],
  heading: string,
  options?: { stripHeading?: boolean }
): string[] {
  const start = description.findIndex((entry) => entry.includes(heading));
  if (start < 0) return [];
  let end = start + 1;
  while (end < description.length && !description[end]!.startsWith("<strong>")) end++;
  const section = description.slice(start, end);
  const marker = `<strong>${heading}</strong>`;
  if (options?.stripHeading && section[0]?.includes(marker)) {
    const first = section[0].replace(marker, "").trim();
    if (first) section[0] = first;
    else section.shift();
  }
  return section;
}
