import type { SpellEntry } from "../../codex/entries";

export function getSpellLevel(spell: Pick<SpellEntry, "spellLevel">): number {
  const numericValue = Number(spell.spellLevel);

  if (!Number.isFinite(numericValue)) {
    return 1;
  }

  return Math.max(0, Math.min(9, Math.floor(numericValue)));
}
