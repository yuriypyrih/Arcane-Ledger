import type { ReactionEntry } from "../../../../../codex/entries";
import {
  ABILITY_TYPES,
  CLASS_FEATURE,
  REACTION,
  SPELL_LIST_CLASS
} from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import { getSpellSaveFormulaCell } from "../../../shared/spellFormulas";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import type { FeatureActionFact } from "../../types";

export const instinctiveCharmReactionId = "reaction-wizard-enchanter-instinctive-charm";

export function hasInstinctiveCharm(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.INSTINCTIVE_CHARM) !== null
  );
}

export function normalizeInstinctiveCharmUsesExpended(
  value: unknown,
  character: SubclassRuntimeCharacter
): number {
  const expended = Number(value);
  return hasInstinctiveCharm(character) && Number.isFinite(expended)
    ? Math.max(0, Math.min(1, Math.floor(expended)))
    : 0;
}

export function getInstinctiveCharmUsesRemaining(character: SubclassRuntimeCharacter): number {
  return hasInstinctiveCharm(character)
    ? 1 -
        normalizeInstinctiveCharmUsesExpended(
          character.classFeatureState?.wizard?.instinctiveCharmUsesExpended,
          character
        )
    : 0;
}

export function getInstinctiveCharmReaction(
  character: SubclassRuntimeCharacter
): ReactionEntry | null {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.INSTINCTIVE_CHARM
  );
  return feature
    ? {
        id: instinctiveCharmReactionId,
        reaction: REACTION.INSTINCTIVE_CHARM,
        name: feature.name,
        sourceType: "feature",
        sourceFeature: CLASS_FEATURE.INSTINCTIVE_CHARM,
        sourceLabel: "Enchanter",
        description: feature.description
      }
    : null;
}

export function getInstinctiveCharmFacts(character: Character): FeatureActionFact[] {
  const formula = getSpellSaveFormulaCell(
    {
      isSavingThrowSpell: true,
      savingThrowAbility: ABILITY_TYPES.WIS,
      spellLists: [SPELL_LIST_CLASS.WIZARD]
    },
    character,
    "INT"
  );
  return formula
    ? [
        {
          label: formula.label,
          value: formula.content,
          breakdown: formula.breakdown,
          fullWidth: true
        }
      ]
    : [];
}

export function activateInstinctiveCharm(character: Character): Character {
  return spendClassResource(
    character,
    {
      stateKey: "wizard",
      counter: "instinctiveCharmUsesExpended",
      total: hasInstinctiveCharm(character) ? 1 : 0,
      remaining: getInstinctiveCharmUsesRemaining(character)
    },
    1
  );
}

export function restoreInstinctiveCharmOnLongRest(character: Character): Character {
  return hasInstinctiveCharm(character) &&
    character.classFeatureState?.wizard?.instinctiveCharmUsesExpended
    ? replaceClassFeatureState(character, "wizard", {
        ...character.classFeatureState?.wizard,
        instinctiveCharmUsesExpended: 0
      })
    : character;
}
