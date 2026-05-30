import { CLASS_FEATURE, DAMAGE_TYPE, type SpellEntry } from "../../../../../codex/entries";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import type { FeatureDamageBonus, SpellFeatureContext } from "../../types";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";

const alchemistSubclassId = "artificer-alchemist";
const alchemicalSavantName = "Alchemical Savant";
const alchemicalSavantDamageTypes = new Set<DAMAGE_TYPE>([
  DAMAGE_TYPE.ACID,
  DAMAGE_TYPE.FIRE,
  DAMAGE_TYPE.POISON
]);

function hasArtificerAlchemistAlchemicalSavant(character: SubclassRuntimeCharacter): boolean {
  return hasArtificerSubclassFeature(character, alchemistSubclassId, 5);
}

function spellSupportsArtificerAlchemistAlchemicalSavant(
  spell: Pick<SpellEntry, "damage"> | null
): boolean {
  if (!spell || spell.damage.length <= 0) {
    return false;
  }

  return spell.damage.some(([, damageType]) =>
    (Array.isArray(damageType) ? damageType : [damageType]).some((entry) =>
      alchemicalSavantDamageTypes.has(entry)
    )
  );
}

export function transformArtificerAlchemistAlchemicalSavantSpellEntry(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  if (
    !hasArtificerAlchemistAlchemicalSavant(character) ||
    !spellSupportsArtificerAlchemistAlchemicalSavant(spell)
  ) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.ALCHEMICAL_SAVANT,
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.ALCHEMICAL_SAVANT),
    alchemicalSavantName
  );
}

export function getArtificerAlchemistAlchemicalSavantSpellDamageBonuses(
  character: SubclassRuntimeCharacter,
  { spell }: SpellFeatureContext
): FeatureDamageBonus[] {
  if (
    !hasArtificerAlchemistAlchemicalSavant(character) ||
    !spellSupportsArtificerAlchemistAlchemicalSavant(spell)
  ) {
    return [];
  }

  return [
    {
      label: alchemicalSavantName,
      value: Math.max(1, getAbilityModifierForCharacter(character, "INT")),
      abilityModifierSource: "INT"
    }
  ];
}
