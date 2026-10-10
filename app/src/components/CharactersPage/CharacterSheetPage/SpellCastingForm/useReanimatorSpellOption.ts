import { useState } from "react";
import type { SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  getArtificerJoltToLifeEffectLabel,
  getArtificerJoltToLifeUsesRemaining,
  getArtificerJoltToLifeUsesTotal,
  hasArtificerReanimatorFeature,
  spareTheDyingSpellId
} from "../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import { createChargesCardUsage } from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";

export function useReanimatorSpellOption(
  character: Character,
  spell: SpellEntry,
  enabled: boolean
): CharacterSpellDrawerActionOption | null {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  if (!enabled || spell.id !== spareTheDyingSpellId || !hasArtificerReanimatorFeature(character))
    return null;
  const remaining = getArtificerJoltToLifeUsesRemaining(character);
  return {
    id: "jolt-to-life",
    label: "Jolt to Life",
    checked: selectedSpellId === spell.id && remaining > 0,
    disabled: remaining <= 0,
    onCheckedChange: (checked) => setSelectedSpellId(checked ? spell.id : null),
    usage: createChargesCardUsage(remaining, getArtificerJoltToLifeUsesTotal(character)),
    metaItems: [{ kind: "text", label: getArtificerJoltToLifeEffectLabel(character) }]
  };
}
