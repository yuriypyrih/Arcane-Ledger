import { useState } from "react";
import type { SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { createChargesCardUsage } from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  isPowerSurgeSpell,
  powerSurgeEffectId,
  powerSurgeResource
} from "../../../../pages/CharactersPage/feats/runtime/arcaneOverload";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";

export function usePowerSurgeSpellOption(
  character: Character,
  spell: SpellEntry
): CharacterSpellDrawerActionOption | null {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  if (!isPowerSurgeSpell(spell) || powerSurgeResource.total(character) === 0) return null;

  const remaining = powerSurgeResource.remaining(character);
  return {
    id: powerSurgeEffectId,
    label: powerSurgeResource.label,
    checked: selectedSpellId === spell.id && remaining > 0,
    disabled: remaining === 0,
    onCheckedChange: (checked) => setSelectedSpellId(checked ? spell.id : null),
    usage: createChargesCardUsage(remaining, 1),
    application: { targetLabel: "", qualifierText: "Use when this spell deals damage" }
  };
}
