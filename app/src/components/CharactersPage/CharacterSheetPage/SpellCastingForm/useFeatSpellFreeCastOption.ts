import { useState } from "react";
import { createChargesCardUsage } from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import { getFeatSpellFreeCast } from "../../../../pages/CharactersPage/feats/runtime/featSpellFreeCasts";
import type { Character } from "../../../../types";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";

export function useFeatSpellFreeCastOption(
  character: Character,
  spellId: string,
  enabled: boolean,
  canSelect: boolean
) {
  const [selected, setSelected] = useState(false);
  const freeCast = enabled ? getFeatSpellFreeCast(character, spellId) : undefined;
  if (!freeCast) return null;
  const { resource } = freeCast;

  const total = resource.total(character);
  if (total === 0) return null;

  const remaining = resource.remaining(character);
  const available = canSelect && remaining > 0;
  const option: CharacterSpellDrawerActionOption = {
    id: resource.id,
    label: `${resource.label}: Free cast`,
    checked: available && selected,
    disabled: !available,
    onCheckedChange: setSelected,
    usage: createChargesCardUsage(remaining, total)
  };
  return { ...freeCast, option };
}
