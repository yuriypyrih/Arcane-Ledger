import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel } from "../../subclassRuntime";
import {
  getKnowledgeDomainFeatureActions,
  getKnowledgeDomainSavingThrowIndicators,
  getKnowledgeDomainSavingThrowProficiencyEntries,
  getKnowledgeDomainSkillIndicators,
  getKnowledgeDomainSkillProficiencyEntries
} from "../cleric";

export const knowledgeDomainSubclassId = "cleric-knowledge-domain";

const knowledgeDomainSpellIdsByLevel = {
  3: [
    "spell-command",
    "spell-comprehend-languages",
    "spell-detect-magic",
    "spell-detect-thoughts",
    "spell-identify",
    "spell-mind-spike"
  ],
  5: ["spell-dispel-magic", "spell-nondetection", "spell-tongues"],
  7: ["spell-arcane-eye", "spell-banishment", "spell-confusion"],
  9: ["spell-legend-lore", "spell-scrying", "spell-synaptic-static"]
} as const;

export const getClericKnowledgeDomainDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (
    character.className !== "Cleric" ||
    character.subclassId !== knowledgeDomainSubclassId ||
    (character.level ?? 0) < 3
  ) {
    return {};
  }

  return {
    featureActions: getKnowledgeDomainFeatureActions(character),
    skillProficiencyEntries: getKnowledgeDomainSkillProficiencyEntries(character),
    savingThrowProficiencyEntries: getKnowledgeDomainSavingThrowProficiencyEntries(character),
    skillIndicators: getKnowledgeDomainSkillIndicators(character),
    savingThrowIndicators: getKnowledgeDomainSavingThrowIndicators(character),
    alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(character.level ?? 0, knowledgeDomainSpellIdsByLevel)
  };
};
