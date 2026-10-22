import { useState } from "react";
import type { SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { createChargesCardUsage } from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  getSplinteredSummonsUsesRemaining,
  splinteredSummonsEffectId,
  supportsSplinteredSummons
} from "../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardConjurerSplinteredSummons";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";

export function useSplinteredSummonsSpellOption(
  character: Character,
  spell: SpellEntry,
  enabled: boolean,
  spendsSpellSlot: boolean
): CharacterSpellDrawerActionOption | null {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  if (!enabled || !supportsSplinteredSummons(character, spell)) return null;
  const remaining = getSplinteredSummonsUsesRemaining(character);
  return {
    id: splinteredSummonsEffectId,
    label: "Splintered Summons",
    checked: spendsSpellSlot && selectedSpellId === spell.id && remaining > 0,
    disabled: !spendsSpellSlot || remaining <= 0,
    onCheckedChange: (checked) => setSelectedSpellId(checked ? spell.id : null),
    usage: createChargesCardUsage(remaining, 1)
  };
}
