import type { SpellEntry } from "../../../../../codex/entries";
import type { AbilityKey } from "../../../../../types";
import type { FeatureSpellGrant } from "../../../featureContributions/types";
import { getFeatLabel } from "../../catalog";
import type { FeatContributionContext } from "./types";
export function appendFeatSpellGrants(
  entry: FeatContributionContext["entry"],
  contribution: FeatContributionContext["contribution"],
  spells: SpellEntry[],
  options: {
    kind: FeatureSpellGrant["kind"];
    ability: AbilityKey;
    freeCast?: (spell: SpellEntry) => FeatureSpellGrant["freeCast"];
  }
) {
  const sourceLabel = getFeatLabel(entry.feat);
  for (const spell of spells)
    contribution.spellGrants!.push({
      kind: options.kind,
      spell,
      sourceLabel,
      spellcastingAbility: options.ability,
      ...(options.freeCast ? { freeCast: options.freeCast(spell) } : {})
    });
}
