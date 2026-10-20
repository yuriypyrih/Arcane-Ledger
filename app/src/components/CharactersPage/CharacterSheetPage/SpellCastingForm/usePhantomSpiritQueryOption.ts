import { useState } from "react";
import type { Character } from "../../../../types";
import type { SpellEntry } from "../../../../codex/entries";
import {
  getPhantomSoulTrinketsMaximum,
  getPhantomSoulTrinketsRemaining,
  isPhantomSpiritQuerySpell,
  phantomSpiritQueryEffectId
} from "../../../../pages/CharactersPage/classFeatures/rogue/subclasses/roguePhantomTokens";
import {
  createFeatureActionCardCost,
  createNamedResourceCardUsage,
  createNamedUsageHeaderTags
} from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";

export function usePhantomSpiritQueryOption(
  character: Character,
  spell: SpellEntry,
  enabled: boolean
) {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  const required = enabled && isPhantomSpiritQuerySpell(character, spell);
  const remaining = getPhantomSoulTrinketsRemaining(character);
  const selected = required && remaining > 0 && selectedSpellId === spell.id;
  const cost = createFeatureActionCardCost({
    amountText: "1",
    icon: "ghost"
  });
  const options: CharacterSpellDrawerActionOption[] = required
    ? [
        {
          id: phantomSpiritQueryEffectId,
          label: "Spirit Query",
          checked: selected,
          disabled: remaining <= 0,
          onCheckedChange: (checked) => setSelectedSpellId(checked ? spell.id : null),
          usage: createNamedResourceCardUsage(cost),
          headerTags: createNamedUsageHeaderTags(
            cost,
            remaining,
            getPhantomSoulTrinketsMaximum(character),
            { icon: "ghost" }
          )
        }
      ]
    : [];
  return {
    required,
    selected,
    options,
    effectIds: selected ? [phantomSpiritQueryEffectId] : [],
    warning:
      !required || selected
        ? null
        : remaining <= 0
          ? "No Soul Trinkets remaining."
          : "Select Spirit Query to spend 1 Soul Trinket."
  };
}
