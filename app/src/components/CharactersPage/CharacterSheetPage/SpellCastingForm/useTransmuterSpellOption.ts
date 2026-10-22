import { useState } from "react";
import type { SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { createChargesCardUsage } from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  alterSelfSpellId,
  getWondrousAlterationUsesRemaining,
  hasWondrousAlteration,
  wondrousAlterationFreeCastEffectId
} from "../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardTransmuterWondrousAlteration";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";

export function useTransmuterSpellOption(
  character: Character,
  spell: SpellEntry,
  enabled: boolean
): CharacterSpellDrawerActionOption | null {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  if (!enabled || spell.id !== alterSelfSpellId || !hasWondrousAlteration(character)) return null;
  const remaining = getWondrousAlterationUsesRemaining(character);
  return {
    id: wondrousAlterationFreeCastEffectId,
    label: "Wondrous Alteration: Free cast",
    checked: selectedSpellId === spell.id && remaining > 0,
    disabled: remaining <= 0,
    onCheckedChange: (checked) => setSelectedSpellId(checked ? spell.id : null),
    usage: createChargesCardUsage(remaining, 1)
  };
}
