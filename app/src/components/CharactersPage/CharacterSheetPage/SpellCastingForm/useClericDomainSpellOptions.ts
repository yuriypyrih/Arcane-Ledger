import { useState } from "react";
import type { Character } from "../../../../types";
import type { SpellEntry } from "../../../../codex/entries";
import {
  getClericChannelDivinityUsesRemaining,
  getClericChannelDivinityUsesTotal
} from "../../../../pages/CharactersPage/classFeatures/cleric/clericChannelDivinity";
import {
  getDispellingRecoveryRemaining,
  hasArcanaDomain
} from "../../../../pages/CharactersPage/classFeatures/cleric/subclasses/clericArcanaDomain";
import {
  canUsePullOfDeath,
  getPullOfDeathBonus,
  supportsEnhancedNecromancy,
  enhancedNecromancyEffectId
} from "../../../../pages/CharactersPage/classFeatures/cleric/subclasses/clericGraveDomain";
import {
  dispellingRecoveryEffectId,
  pullOfDeathEffectId
} from "../../../../pages/CharactersPage/classFeatures/cleric/subclasses/clericDomainSpellEffects";
import {
  createChargesOrResourceCardUsage,
  createNamedResourceCardUsage,
  createFeatureActionCardCost,
  createNamedUsageHeaderTags
} from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import type { CharacterSpellDrawerActionOption } from "./CharacterSpellDrawer";

export function useClericDomainSpellOptions(
  character: Character,
  spell: SpellEntry,
  enabled: boolean
) {
  const [selection, setSelection] = useState<{ spellId: string; ids: string[] }>({
    spellId: "",
    ids: []
  });
  const selectedIds = selection.spellId === spell.id ? selection.ids : [];
  const options: CharacterSpellDrawerActionOption[] = [];
  const add = (
    id: string,
    label: string,
    disabled: boolean,
    extra: Partial<CharacterSpellDrawerActionOption> = {}
  ) =>
    options.push({
      id,
      label,
      disabled,
      checked: !disabled && selectedIds.includes(id),
      onCheckedChange: (checked) =>
        setSelection({
          spellId: spell.id,
          ids: checked ? [...selectedIds, id] : selectedIds.filter((value) => value !== id)
        }),
      ...extra
    });
  if (enabled) {
    const cost = createFeatureActionCardCost({ amountText: "1", icon: "pyromancy" });
    const remaining = getClericChannelDivinityUsesRemaining(character);
    if (hasArcanaDomain(character, 6) && spell.id === "spell-dispel-magic") {
      const uses = getDispellingRecoveryRemaining(character);
      add(dispellingRecoveryEffectId, "Dispelling Recovery", uses <= 0 && remaining <= 0, {
        usage: createChargesOrResourceCardUsage(uses, 1, cost),
        application: {
          qualifierText: "After a qualifying spell",
          targetLabel: "Cast without slot or action"
        }
      });
    }
    if (supportsEnhancedNecromancy(character, spell))
      add(enhancedNecromancyEffectId, "Enhanced Necromancy", remaining <= 0, {
        usage: createNamedResourceCardUsage(cost),
        headerTags: createNamedUsageHeaderTags(
          cost,
          remaining,
          getClericChannelDivinityUsesTotal(character),
          { icon: "pyromancy" }
        ),
        application: {
          qualifierText: "Eligible target and components confirmed",
          targetLabel: "Second target"
        }
      });
    if (getPullOfDeathBonus(character) && (spell.isDamagingSpell || spell.damage.length > 0))
      add(pullOfDeathEffectId, "Pull of Death", !canUsePullOfDeath(character), {
        application: { qualifierText: "Wounded target · Once per turn", targetLabel: "Damage" }
      });
  }
  const effectIds = options.filter((option) => option.checked).map((option) => option.id);
  return {
    options,
    effectIds,
    dispellingRecovery: effectIds.includes(dispellingRecoveryEffectId),
    pullOfDeath: effectIds.includes(pullOfDeathEffectId) ? getPullOfDeathBonus(character) : null
  };
}
