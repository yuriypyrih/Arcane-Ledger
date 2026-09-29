import { getFeatAbilityIncreaseMaxScore } from "../..";
import { getFeatLabel } from "../../catalog";
import type { FeatContributionContext } from "./types";
import { spellGrantsBuilders } from "./spellGrants";
import { benefitsBuilders } from "./benefits";
import { statusesBuilders } from "./statuses";

export function applyFeatContribution(context: FeatContributionContext): void {
  const { entry, contribution, index } = context;
  spellGrantsBuilders[entry.feat]?.(context);
  if (!benefitsBuilders[entry.feat]?.(context) && entry.epicBoonAbilityChoice) {
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: entry.epicBoonAbilityChoice.ability,
      label: getFeatLabel(entry.feat),
      value: 1,
      maxScore: getFeatAbilityIncreaseMaxScore(entry.feat) ?? 30,
      order
    });
  }
  statusesBuilders[entry.feat]?.(context);
}
