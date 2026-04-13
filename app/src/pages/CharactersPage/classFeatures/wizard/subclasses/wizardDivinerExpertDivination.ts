import { CLASS_FEATURE, MAGIC_SCHOOL, type SpellEntry } from "../../../../../codex/entries";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import {
  getWizardDivinerFeatureDescriptionEntries,
  getWizardDivinerSpellbookSpellIds,
  hasWizardDivinerFeature
} from "./wizardDivinerShared";

const expertDivinationName = "Expert Divination";
const expertDivinationDescription = getWizardDivinerFeatureDescriptionEntries(
  CLASS_FEATURE.EXPERT_DIVINATION
);

export function transformWizardDivinerExpertDivinationSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  if (!hasWizardDivinerFeature(character, 6) || spell.magicSchool !== MAGIC_SCHOOL.DIVINATION) {
    return spell;
  }

  const spellbookSpellIdSet = new Set(getWizardDivinerSpellbookSpellIds(character));

  if (!spellbookSpellIdSet.has(spell.id)) {
    return spell;
  }

  return appendSourcedDescriptionAddition(
    spell,
    expertDivinationName,
    expertDivinationDescription
  );
}
