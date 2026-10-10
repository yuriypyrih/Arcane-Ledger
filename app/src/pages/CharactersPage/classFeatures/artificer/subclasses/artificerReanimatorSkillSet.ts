import type { SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character, CharacterArtificerFeatureState } from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getClassLevel } from "../../../multiclassState";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";

export const reanimatorSubclassId = "artificer-reanimator";
export const spareTheDyingSpellId = "spell-spare-the-dying";

export function hasArtificerReanimatorFeature(character: SubclassRuntimeCharacter): boolean {
  return hasArtificerSubclassFeature(character, reanimatorSubclassId, 3);
}

export function getArtificerJoltToLifeUsesTotal(character: SubclassRuntimeCharacter): number {
  return hasArtificerReanimatorFeature(character)
    ? Math.max(0, getAbilityModifierForCharacter(character, "INT"))
    : 0;
}

export function normalizeArtificerReanimatorSkillSetState(
  value: unknown,
  character: SubclassRuntimeCharacter
): Pick<CharacterArtificerFeatureState, "reanimatorJoltToLifeUsesExpended"> {
  if (!hasArtificerReanimatorFeature(character)) return {};
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const expended = Number(record.reanimatorJoltToLifeUsesExpended);
  return {
    reanimatorJoltToLifeUsesExpended: Math.max(
      0,
      Math.min(
        getArtificerJoltToLifeUsesTotal(character),
        Number.isFinite(expended) ? Math.floor(expended) : 0
      )
    )
  };
}

export function getArtificerJoltToLifeUsesRemaining(character: SubclassRuntimeCharacter): number {
  return (
    getArtificerJoltToLifeUsesTotal(character) -
    (normalizeArtificerReanimatorSkillSetState(character.classFeatureState?.artificer, character)
      .reanimatorJoltToLifeUsesExpended ?? 0)
  );
}

export function consumeArtificerJoltToLifeUse(character: Character): Character {
  return spendClassResource(
    character,
    {
      stateKey: "artificer",
      counter: "reanimatorJoltToLifeUsesExpended",
      total: getArtificerJoltToLifeUsesTotal(character),
      remaining: getArtificerJoltToLifeUsesRemaining(character)
    },
    1
  );
}

export function restoreArtificerJoltToLifeOnLongRest(character: Character): Character {
  if (
    !hasArtificerReanimatorFeature(character) ||
    !character.classFeatureState?.artificer?.reanimatorJoltToLifeUsesExpended
  )
    return character;
  return replaceClassFeatureState(character, "artificer", {
    ...character.classFeatureState?.artificer,
    reanimatorJoltToLifeUsesExpended: 0
  });
}

export function getArtificerJoltToLifeEffectLabel(character: SubclassRuntimeCharacter): string {
  const level = getClassLevel(character, "Artificer");
  const dice = level >= 17 ? 4 : level >= 11 ? 3 : 2;
  return `Restore ${level} HP; ${dice}d4 Lightning in a 10-foot Emanation (Dexterity save for half).`;
}

export function transformArtificerReanimatorSpellEntry(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  if (!hasArtificerReanimatorFeature(character) || spell.id !== spareTheDyingSpellId) return spell;
  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.REANIMATORS_SKILL_SET,
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.REANIMATORS_SKILL_SET).slice(0, 2),
    "Jolt to Life"
  );
}
