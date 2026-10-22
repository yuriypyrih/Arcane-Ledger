import { useState } from "react";
import type { SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  getUndeadVitalityHealing,
  supportsUndeadVitality,
  undeadVitalityEffectId
} from "../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardNecromancer";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";
import { createChargesCardUsage } from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  animateDeadSpellId,
  getUndeadThrallsUsesRemaining,
  hasUndeadThralls,
  undeadThrallsFreeCastEffectId
} from "../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardNecromancerUndeadThralls";

export function useUndeadThrallsSpellOption(
  character: Character,
  spell: SpellEntry,
  enabled: boolean
): CharacterSpellDrawerActionOption | null {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  if (!enabled || spell.id !== animateDeadSpellId || !hasUndeadThralls(character)) return null;
  const remaining = getUndeadThrallsUsesRemaining(character);
  return {
    id: undeadThrallsFreeCastEffectId,
    label: "Undead Thralls: Free cast",
    checked: selectedSpellId === spell.id && remaining > 0,
    disabled: remaining <= 0,
    onCheckedChange: (checked) => setSelectedSpellId(checked ? spell.id : null),
    usage: createChargesCardUsage(remaining, 1)
  };
}

export function useNecromancerSpellOption(
  character: Character,
  spell: SpellEntry,
  slotLevel: number,
  enabled: boolean,
  spendsSpellSlot: boolean
): CharacterSpellDrawerActionOption | null {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  if (!enabled || spell.spellLevel === 0 || !supportsUndeadVitality(character, spell)) return null;
  return {
    id: undeadVitalityEffectId,
    label: "Undead Vitality",
    checked: spendsSpellSlot && selectedSpellId === spell.id,
    disabled: !spendsSpellSlot,
    onCheckedChange: (checked) => setSelectedSpellId(checked ? spell.id : null),
    metaItems: [
      { kind: "text", label: `Regain +${getUndeadVitalityHealing(character, slotLevel)} hp` }
    ]
  };
}
