import type { ReactNode } from "react";
import {
  ENTRY_CATEGORIES,
  FEATS,
  KeywordTooltip,
  getDivinityEntryByName,
  hardcodedCodexEntries,
  type DivinityEntry,
  type KeywordTooltipEntry,
  type SpellEntry
} from "../../codex/entries";
import {
  getKeywordDescriptionLines,
  splitKeywordDescription
} from "../../pages/CharactersPage/keywordDescriptions";

export type ResolvedKeywordReference = {
  key: string;
  title: string;
  description: string[];
};

export type RenderCodexRichTextOptions = {
  linkClassName?: string;
  onOpenKeyword?: (keyword: ResolvedKeywordReference) => void;
  onOpenSpell?: (spell: SpellEntry) => void;
  onOpenDivinity?: (divinity: DivinityEntry) => void;
  onOpenFeat?: (feat: FEATS, label: string) => void;
};

const spellEntriesByName = new Map<string, SpellEntry>(
  hardcodedCodexEntries
    .filter((entry): entry is SpellEntry => entry.category === ENTRY_CATEGORIES.SPELLS)
    .map((entry) => [entry.name.toLowerCase(), entry])
);

const inlineMarkupPattern =
  /<strong>(.*?)<\/strong>|<link:([^>]+)>(.*?)<\/link>|<spell:([^>]+)>(.*?)<\/spell>|<divinity:([^>]+)>(.*?)<\/divinity>|<feat:([^>]+)>(.*?)<\/feat>/g;

export function resolveKeywordReference(
  keywordKey: string,
  fallbackTitle?: string
): ResolvedKeywordReference | null {
  const tooltip = KeywordTooltip[keywordKey] as KeywordTooltipEntry | undefined;

  if (tooltip) {
    return {
      key: keywordKey,
      title: tooltip.title,
      description: tooltip.description
    };
  }

  const description = getKeywordDescriptionLines(keywordKey);

  if (!description) {
    return null;
  }

  return {
    key: keywordKey,
    title: fallbackTitle ?? keywordKey,
    description
  };
}

export function normalizeRichTextDescription(description: string | string[]): string[] {
  return Array.isArray(description)
    ? description.flatMap((line) => splitKeywordDescription(line))
    : splitKeywordDescription(description);
}

export function renderCodexRichText(
  text: string,
  {
    linkClassName,
    onOpenKeyword,
    onOpenSpell,
    onOpenDivinity,
    onOpenFeat
  }: RenderCodexRichTextOptions = {}
): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(inlineMarkupPattern)) {
    const index = match.index ?? 0;

    if (index > cursor) {
      nodes.push(text.slice(cursor, index));
    }

    if (match[1]) {
      nodes.push(<strong key={`${match[1]}-${index}`}>{match[1]}</strong>);
    }

    if (match[2]) {
      const keywordKey = match[2];
      const label = match[3] ?? keywordKey;
      const resolvedKeyword = resolveKeywordReference(keywordKey, label);

      nodes.push(
        resolvedKeyword && onOpenKeyword ? (
          <button
            key={`${keywordKey}-${index}`}
            type="button"
            className={linkClassName}
            onClick={() => onOpenKeyword(resolvedKeyword)}
          >
            {label}
          </button>
        ) : (
          label
        )
      );
    }

    if (match[4]) {
      const spell = spellEntriesByName.get(match[4].trim().toLowerCase());
      const label = match[5] ?? match[4];

      nodes.push(
        spell && onOpenSpell ? (
          <button
            key={`${match[4]}-${index}`}
            type="button"
            className={linkClassName}
            onClick={() => onOpenSpell(spell)}
          >
            {label}
          </button>
        ) : (
          label
        )
      );
    }

    if (match[6]) {
      const divinity = getDivinityEntryByName(match[6]);
      const label = match[7] ?? match[6];

      nodes.push(
        divinity && onOpenDivinity ? (
          <button
            key={`${match[6]}-${index}`}
            type="button"
            className={linkClassName}
            onClick={() => onOpenDivinity(divinity)}
          >
            {label}
          </button>
        ) : (
          label
        )
      );
    }

    if (match[8]) {
      const feat = match[8] as FEATS;
      const label = match[9] ?? match[8];

      nodes.push(
        onOpenFeat ? (
          <button
            key={`${match[8]}-${index}`}
            type="button"
            className={linkClassName}
            onClick={() => onOpenFeat(feat, label)}
          >
            {label}
          </button>
        ) : (
          label
        )
      );
    }

    cursor = index + match[0].length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes.length > 0 ? nodes : text;
}
