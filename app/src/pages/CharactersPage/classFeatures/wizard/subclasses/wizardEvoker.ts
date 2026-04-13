import { CLASS_FEATURE, MAGIC_SCHOOL, type SpellEntry } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import type { Character } from "../../../../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getWizardSavantSpellIdsFromFeatureState } from "../savant";

export const evokerSubclassId = "wizard-evoker";
const potentCantripName = "Potent Cantrip";
const evokerSubclassEntry = getSubclassEntryById(evokerSubclassId);

function getWizardEvokerFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = evokerSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const potentCantripDescription = getWizardEvokerFeatureDescriptionEntries(
  CLASS_FEATURE.POTENT_CANTRIP
);
const sculptSpellsDescription = getWizardEvokerFeatureDescriptionEntries(
  CLASS_FEATURE.SCULPT_SPELLS
);
const empoweredEvocationDescription = getWizardEvokerFeatureDescriptionEntries(
  CLASS_FEATURE.EMPOWERED_EVOCATION
);

function hasWizardEvokerPotentCantripFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === evokerSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasWizardEvokerSculptSpellsFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === evokerSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasWizardEvokerEmpoweredEvocationFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === evokerSubclassId &&
    (character.level ?? 0) >= 10
  );
}

function appendWizardEvokerPotentCantripDescription(spell: SpellEntry): SpellEntry {
  if (spell.spellLevel !== 0 || spell.damage.length <= 0) {
    return spell;
  }

  return appendSourcedDescriptionAddition(spell, potentCantripName, potentCantripDescription);
}

export function getWizardEvokerSpellbookSpellEntry(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: SpellEntry
): SpellEntry {
  if (spell.magicSchool !== MAGIC_SCHOOL.EVOCATION) {
    return spell;
  }

  const spellWithSculptSpells = hasWizardEvokerSculptSpellsFeature(character)
    ? appendSourcedDescriptionAddition(spell, "Sculpt Spells", sculptSpellsDescription)
    : spell;

  return hasWizardEvokerEmpoweredEvocationFeature(character)
    ? appendSourcedDescriptionAddition(
        spellWithSculptSpells,
        "Empowered Evocation",
        empoweredEvocationDescription
      )
    : spellWithSculptSpells;
}

export const getWizardEvokerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  typeof character.level === "number"
    ? {
        alwaysSpellbookSpellIds: getWizardSavantSpellIdsFromFeatureState({
          className: character.className,
          level: character.level,
          subclassId: character.subclassId,
          classFeatureState: character.classFeatureState
        }),
        transformSpellEntry: hasWizardEvokerPotentCantripFeature(character)
          ? appendWizardEvokerPotentCantripDescription
          : undefined
      }
    : {};
