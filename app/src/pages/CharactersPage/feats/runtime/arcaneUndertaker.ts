import { FEATS } from "../../../../codex/entries/enums";
import { SKILL, type AbilityKey, type Character, type SkillName } from "../../../../types";
import type { FeatureSkillBonusContribution } from "../../featureContributions";
import { restoreHeroicInspirationForCharacter } from "../../heroicInspiration";
import { featResource } from "./resources/counter";
import { collectFeatDerivedState } from "./state";

const knowledgeFromTheDeadChecks = new Map<SkillName, AbilityKey>([
  [SKILL.HISTORY, "INT"],
  [SKILL.MEDICINE, "WIS"]
]);
const knowledgeFromTheDeadLabel = "Knowledge from the Dead";

export const knowledgeFromTheDeadSkills = [...knowledgeFromTheDeadChecks.keys()];

export const knowledgeFromTheDeadSkillBonus: FeatureSkillBonusContribution = {
  id: "feat-arcane-undertaker-knowledge-from-the-dead",
  getBonuses: (skill, _proficiencyLevel, ability) =>
    ability && knowledgeFromTheDeadChecks.get(skill) === ability
      ? [
          {
            label: knowledgeFromTheDeadLabel,
            formula: "1d4",
            formulaSourceLabel: knowledgeFromTheDeadLabel
          }
        ]
      : []
};

export const understandingOfDeathResource = featResource(
  FEATS.ARCANE_UNDERTAKER,
  "arcaneUndertaker",
  "understandingOfDeathExpended",
  "Understanding of Death",
  (character) => {
    const entries = collectFeatDerivedState(character).featsByFeat.get(FEATS.ARCANE_UNDERTAKER);
    if (!entries?.length) return null;

    const expended = entries.some((entry) => entry.arcaneUndertaker?.understandingOfDeathExpended);
    return { usesTotal: 1, usesRemaining: expended ? 0 : 1 };
  }
);

export function applyUnderstandingOfDeath(character: Character): Character {
  const nextCharacter = understandingOfDeathResource.spendOne(character);
  return nextCharacter === character
    ? character
    : restoreHeroicInspirationForCharacter(nextCharacter);
}
