import type { SpellEntry } from "../../codex/entries";

const inlineBoldTagPattern = /<\/?strong>/g;

function stripSpellDescriptionFormatting(text: string): string {
  return text.replace(inlineBoldTagPattern, "").trim();
}

function resolveSpellDescription(
  spell: Pick<SpellEntry, "description"> | Pick<SpellEntry, "description">["description"]
): Pick<SpellEntry, "description">["description"] {
  return Array.isArray(spell) ? spell : spell.description;
}

export function flattenSpellDescriptionLines(
  spell: Pick<SpellEntry, "description"> | Pick<SpellEntry, "description">["description"]
): string[] {
  return resolveSpellDescription(spell).flatMap((entry) =>
    typeof entry === "string"
      ? [stripSpellDescriptionFormatting(entry)]
      : entry.items.map((item) => stripSpellDescriptionFormatting(item))
  );
}

export function getSpellExcerpt(
  spell: Pick<SpellEntry, "description"> | Pick<SpellEntry, "description">["description"]
): string {
  return (
    flattenSpellDescriptionLines(spell).find((line) => line.trim().length > 0) ??
    "No description available."
  );
}
