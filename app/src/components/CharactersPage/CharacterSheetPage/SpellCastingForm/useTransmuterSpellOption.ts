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
import {
  getShapeShifterUsesRemaining,
  hasShapeShifter,
  polymorphSpellId,
  shapeShifterFreeCastEffectId
} from "../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardTransmuterShapeShifter";
import {
  empoweredTransmutationEffectId,
  getEmpoweredTransmutationUsesRemaining,
  getEmpoweredTransmutationUsesTotal,
  supportsEmpoweredTransmutation
} from "../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardTransmuterEmpoweredTransmutation";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";

export function useTransmuterFreeCastOption(
  character: Character,
  spell: SpellEntry,
  enabled: boolean
): CharacterSpellDrawerActionOption | null {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  if (!enabled) return null;
  const feature =
    spell.id === alterSelfSpellId && hasWondrousAlteration(character)
      ? {
          id: wondrousAlterationFreeCastEffectId,
          label: "Wondrous Alteration",
          remaining: getWondrousAlterationUsesRemaining(character)
        }
      : spell.id === polymorphSpellId && hasShapeShifter(character)
        ? {
            id: shapeShifterFreeCastEffectId,
            label: "Shape-shifter",
            remaining: getShapeShifterUsesRemaining(character)
          }
        : null;
  if (!feature) return null;
  const { remaining } = feature;
  return {
    id: feature.id,
    label: `${feature.label}: Free cast`,
    checked: selectedSpellId === spell.id && remaining > 0,
    disabled: remaining <= 0,
    onCheckedChange: (checked) => setSelectedSpellId(checked ? spell.id : null),
    usage: createChargesCardUsage(remaining, 1)
  };
}

export function useEmpoweredTransmutationSpellOption(
  character: Character,
  spell: SpellEntry,
  enabled: boolean,
  spendsSpellSlot: boolean
): CharacterSpellDrawerActionOption | null {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  if (!enabled || !supportsEmpoweredTransmutation(character, spell)) return null;
  const remaining = getEmpoweredTransmutationUsesRemaining(character);
  const total = getEmpoweredTransmutationUsesTotal(character);
  return {
    id: empoweredTransmutationEffectId,
    label: "Empowered Transmutation",
    checked: spendsSpellSlot && selectedSpellId === spell.id && remaining > 0,
    disabled: !spendsSpellSlot || remaining <= 0,
    onCheckedChange: (checked) => setSelectedSpellId(checked ? spell.id : null),
    usage: createChargesCardUsage(remaining, total)
  };
}
