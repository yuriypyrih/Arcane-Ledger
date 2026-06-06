import { FEAT_CATEGORY, FEATS, TRACKER } from "../../../codex/entries";
import { formatCodexLabel } from "../../../utils/codex";
import { featDefinitions } from "./definitions";
import { DEFAULT_FEAT_SOURCE } from "./source";
import type { FeatDefinition } from "./types";

export { featDefinitions } from "./definitions";
export * from "./choiceOptions";
export * from "./choices";
export * from "./harperAgent";
export * from "./normalization";
export * from "./purpleDragonRook";
export * from "./spellfireSpark";
export * from "./source";
export type { FeatDefinition, FeatProficiencyRequirement, FeatRequirement } from "./types";

const featDefinitionsByFeat = new Map(
  featDefinitions.map((definition) => [definition.feat, definition])
);

export function getFeatDefinition(feat: FEATS): FeatDefinition | null {
  return featDefinitionsByFeat.get(feat) ?? null;
}

export function getFeatLabel(feat: FEATS): string {
  return getFeatDefinition(feat)?.label ?? formatCodexLabel(feat);
}

export function getFeatCategoryLabel(category: FEAT_CATEGORY): string {
  return formatCodexLabel(category);
}

export function isFeatRepeatable(feat: FEATS): boolean {
  return Boolean(getFeatDefinition(feat)?.repeatable);
}

export function getFeatTrackingState(feat: FEATS): TRACKER {
  return getFeatDefinition(feat)?.trackingState ?? TRACKER.NOT_TRACKED;
}

export function getFeatSource(definition: FeatDefinition) {
  return definition.source ?? DEFAULT_FEAT_SOURCE;
}

export function getFeatDefinitionsByCategory(): Record<FEAT_CATEGORY, FeatDefinition[]> {
  return featDefinitions.reduce<Record<FEAT_CATEGORY, FeatDefinition[]>>(
    (groups, definition) => {
      groups[definition.category].push(definition);
      return groups;
    },
    {
      [FEAT_CATEGORY.ORIGIN]: [],
      [FEAT_CATEGORY.GENERAL]: [],
      [FEAT_CATEGORY.FIGHTING_STYLE]: [],
      [FEAT_CATEGORY.EPIC_BOON]: []
    }
  );
}
