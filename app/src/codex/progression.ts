/** Select the latest unlocked row without sorting or copying the progression table. */
export function getProgressionRow<T extends { level: number }>(
  rows: readonly T[],
  level: number
): T | null {
  let selected: T | null = null;
  for (const row of rows) {
    if (row.level <= level && (!selected || row.level >= selected.level)) selected = row;
  }
  return selected;
}

export function getUnlockedProgressionFeatures<T>(
  rows: readonly { level: number; classFeatures: readonly T[] }[],
  level: number
): Set<T> {
  const features = new Set<T>();
  for (const row of rows) {
    if (row.level <= level) for (const feature of row.classFeatures) features.add(feature);
  }
  return features;
}
