import { useState } from "react";
import type { SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { createChargesCardUsage } from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  getSplitEnchantmentUsesRemaining,
  getSplitEnchantmentUsesTotal,
  splitEnchantmentEffectId,
  supportsSplitEnchantment
} from "../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardEnchanterSplitEnchantment";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";

export function useSplitEnchantmentSpellOption(
  character: Character,
  spell: SpellEntry,
  enabled: boolean,
  spendsSpellSlot: boolean
): CharacterSpellDrawerActionOption | null {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  if (!enabled || !supportsSplitEnchantment(character, spell)) return null;
  const remaining = getSplitEnchantmentUsesRemaining(character);
  return {
    id: splitEnchantmentEffectId,
    label: "Split Enchantment",
    checked: spendsSpellSlot && selectedSpellId === spell.id && remaining > 0,
    disabled: !spendsSpellSlot || remaining <= 0,
    onCheckedChange: (checked) => setSelectedSpellId(checked ? spell.id : null),
    usage: createChargesCardUsage(remaining, getSplitEnchantmentUsesTotal(character))
  };
}
