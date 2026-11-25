import { useState } from "react";
import type { SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { createChargesCardUsage } from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  inspiringMagicEffectId,
  inspiringMagicResource,
  isInspiringMagicSpell
} from "../../../../pages/CharactersPage/feats/runtime/arcaneArtist";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";

export function useInspiringMagicSpellOption(
  character: Character,
  spell: SpellEntry
): CharacterSpellDrawerActionOption | null {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  if (!isInspiringMagicSpell(spell) || inspiringMagicResource.total(character) === 0) return null;

  const remaining = inspiringMagicResource.remaining(character);
  return {
    id: inspiringMagicEffectId,
    label: inspiringMagicResource.label,
    checked: selectedSpellId === spell.id && remaining > 0,
    disabled: remaining === 0,
    onCheckedChange: (checked) => setSelectedSpellId(checked ? spell.id : null),
    usage: createChargesCardUsage(remaining, 1)
  };
}
