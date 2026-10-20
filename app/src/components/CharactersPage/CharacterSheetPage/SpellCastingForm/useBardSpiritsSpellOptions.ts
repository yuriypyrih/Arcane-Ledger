import { useState } from "react";
import type { Character } from "../../../../types";
import type { SpellEntry } from "../../../../codex/entries";
import { hasBardSpirits } from "../../../../pages/CharactersPage/classFeatures/bard/subclasses/bardCollegeOfSpiritsState";
import {
  getSpiritualManifestationRemaining,
  spiritualManifestationFreeCastEffectId,
  spiritualManifestationCoverEffectId,
  spiritGuardiansSpellId
} from "../../../../pages/CharactersPage/classFeatures/bard/subclasses/bardCollegeOfSpiritsEmpowered";
import { createChargesCardUsage } from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";

export function useBardSpiritsSpellOptions(
  character: Character,
  spell: SpellEntry,
  enabled: boolean,
  allowFreeCast: boolean
) {
  const [selection, setSelection] = useState<{ spellId: string; ids: string[] }>({
    spellId: "",
    ids: []
  });
  const selectedIds = selection.spellId === spell.id ? selection.ids : [];
  const options: CharacterSpellDrawerActionOption[] = [];
  if (enabled && spell.id === spiritGuardiansSpellId && hasBardSpirits(character, 6)) {
    const addOption = (id: string, label: string, cover: boolean) => {
      const remaining = getSpiritualManifestationRemaining(character, cover);
      options.push({
        id,
        label,
        checked: selectedIds.includes(id) && remaining > 0,
        disabled: remaining <= 0,
        onCheckedChange: (checked) =>
          setSelection({
            spellId: spell.id,
            ids: checked ? [...selectedIds, id] : selectedIds.filter((value) => value !== id)
          }),
        usage: createChargesCardUsage(remaining, 1)
      });
    };
    if (allowFreeCast)
      addOption(spiritualManifestationFreeCastEffectId, "Spiritual Manifestation: Free cast", false);
    addOption(spiritualManifestationCoverEffectId, "Spiritual Manifestation: Half Cover", true);
  }
  const effectIds = options.filter((option) => option.checked).map((option) => option.id);
  return {
    options,
    effectIds,
    freeCast: effectIds.includes(spiritualManifestationFreeCastEffectId)
  };
}
