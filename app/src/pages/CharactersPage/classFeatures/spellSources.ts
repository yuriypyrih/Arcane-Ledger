import type { SpellSourceMap } from "./types";

type SpellSourceInput = string | string[] | null | undefined;

function normalizeSpellSourceLabel(source: string): string | null {
  const normalizedSource = source.trim();
  return normalizedSource.length > 0 ? normalizedSource : null;
}

export function addSpellSource(
  sourceMap: SpellSourceMap,
  spellId: string,
  source: SpellSourceInput
): SpellSourceMap {
  if (!spellId || !source) {
    return sourceMap;
  }

  const sources = Array.isArray(source) ? source : [source];
  const currentSources = sourceMap[spellId] ?? [];
  const nextSources = new Set(currentSources);

  sources.forEach((sourceLabel) => {
    const normalizedSource = normalizeSpellSourceLabel(sourceLabel);

    if (normalizedSource) {
      nextSources.add(normalizedSource);
    }
  });

  sourceMap[spellId] = [...nextSources];
  return sourceMap;
}

export function addSpellSourcesForIds(
  sourceMap: SpellSourceMap,
  spellIds: readonly string[] | null | undefined,
  source: SpellSourceInput
): SpellSourceMap {
  spellIds?.forEach((spellId) => addSpellSource(sourceMap, spellId, source));
  return sourceMap;
}

export function mergeSpellSourceMaps(
  ...sourceMaps: Array<SpellSourceMap | null | undefined>
): SpellSourceMap {
  const mergedSourceMap: SpellSourceMap = {};

  sourceMaps.forEach((sourceMap) => {
    Object.entries(sourceMap ?? {}).forEach(([spellId, sources]) => {
      addSpellSource(mergedSourceMap, spellId, sources);
    });
  });

  return mergedSourceMap;
}

export function getSpellSourceLabels(
  sourceMap: SpellSourceMap | null | undefined,
  spellId: string | null | undefined
): string[] {
  if (!sourceMap || !spellId) {
    return [];
  }

  return sourceMap[spellId] ?? [];
}
