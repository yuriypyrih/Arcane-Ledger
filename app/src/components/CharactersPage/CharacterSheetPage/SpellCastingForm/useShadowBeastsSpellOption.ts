import { useEffect, useMemo, useState } from "react";
import type { SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  canCastShadowBeasts,
  getShadowBeastsCastSpell,
  shadowBeastsWithoutConcentrationOptionId
} from "../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses/sorcererShadowBeasts";
import {
  getSpellConcentrationDuration,
  getSpellNonConcentrationDuration
} from "../../../../pages/CharactersPage/statusEntries";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";
import type { SpellImplementationOptionValues } from "../../../../pages/CharactersPage/characterRuntime/spellImplementations";

export function useShadowBeastsSpellOption(
  character: Character,
  spell: SpellEntry | null,
  enabled: boolean
) {
  const [selected, setSelected] = useState(false);
  useEffect(() => {
    if (!enabled) setSelected(false);
  }, [enabled]);
  const withoutConcentration = enabled && selected;
  const displaySpell = useMemo(
    () => (spell && enabled ? getShadowBeastsCastSpell(spell, withoutConcentration) : spell),
    [enabled, spell, withoutConcentration]
  );
  const options: CharacterSpellDrawerActionOption[] = enabled
    ? [
        {
          id: shadowBeastsWithoutConcentrationOptionId,
          label: "Without Concentration: 1 minute",
          checked: withoutConcentration,
          onCheckedChange: setSelected
        }
      ]
    : [];
  const castOptions: SpellImplementationOptionValues = enabled
    ? { [shadowBeastsWithoutConcentrationOptionId]: withoutConcentration }
    : {};
  return {
    spell: displaySpell,
    options,
    castOptions,
    summonDuration:
      enabled && displaySpell
        ? (getSpellConcentrationDuration(displaySpell.duration) ??
          getSpellNonConcentrationDuration(displaySpell.duration) ??
          undefined)
        : undefined,
    blockedReason: enabled && !canCastShadowBeasts(character) ? "Requires 3 Sorcery Points." : null
  };
}
