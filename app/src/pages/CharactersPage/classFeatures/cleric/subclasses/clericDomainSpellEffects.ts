import { getSpellEntryById, type SpellEntry } from "../../../../../codex/entries";
import type { Character } from "../../../../../types";
import { getCharacterCustomSpellSnapshotBySpellId } from "../../../customSpells";
import type { FeatureSpellCastEffectContribution } from "../../../featureContributions";
import { replaceClassFeatureState } from "../../shared/resourceState";
import {
  expendClericChannelDivinityUse,
  getClericChannelDivinityUsesRemaining
} from "../clericChannelDivinity";
import {
  canUsePullOfDeath,
  consumePullOfDeath,
  enhancedNecromancyEffectId,
  hasGraveDomain,
  supportsEnhancedNecromancy
} from "./clericGraveDomain";
import { getDispellingRecoveryRemaining, hasArcanaDomain } from "./clericArcanaDomain";

export const dispellingRecoveryEffectId = "cleric-dispelling-recovery";
export const pullOfDeathEffectId = "cleric-pull-of-death";
export function canUseDispellingRecovery(
  character: Character,
  spell: Pick<SpellEntry, "id">
): boolean {
  return (
    hasArcanaDomain(character, 6) &&
    spell.id === "spell-dispel-magic" &&
    (getDispellingRecoveryRemaining(character) > 0 ||
      getClericChannelDivinityUsesRemaining(character) > 0)
  );
}
export function getClericDomainSpellCastEffects(
  character: Character
): FeatureSpellCastEffectContribution[] {
  const effects: FeatureSpellCastEffectContribution[] = [];
  if (hasArcanaDomain(character, 6))
    effects.push({
      id: dispellingRecoveryEffectId,
      apply: (current, context) => {
        if (!canUseDispellingRecovery(current, context.spell)) return current;
        const next =
          getDispellingRecoveryRemaining(current) > 0
            ? current
            : expendClericChannelDivinityUse(current);
        return replaceClassFeatureState(next, "cleric", {
          ...next.classFeatureState?.cleric,
          dispellingRecoveryUsesExpended: 1
        });
      }
    });
  if (hasGraveDomain(character))
    effects.push({
      id: pullOfDeathEffectId,
      apply: (current) => (canUsePullOfDeath(current) ? consumePullOfDeath(current) : current)
    });
  if (hasGraveDomain(character, 17))
    effects.push({
      id: enhancedNecromancyEffectId,
      apply: (current, context) => {
        const spell =
          getSpellEntryById(context.spell.id) ??
          getCharacterCustomSpellSnapshotBySpellId(current, context.spell.id)?.spell;
        return spell &&
          supportsEnhancedNecromancy(current, spell) &&
          getClericChannelDivinityUsesRemaining(current) > 0
          ? expendClericChannelDivinityUse(current)
          : current;
      }
    });
  return effects;
}
