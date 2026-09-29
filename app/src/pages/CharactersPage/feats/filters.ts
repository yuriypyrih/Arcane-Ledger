import { FEAT_CATEGORY } from "../../../codex/entries/enums";
import type { FeatDefinition } from "./types";

export const FEAT_CATEGORY_FILTER_VALUES = [
  FEAT_CATEGORY.ORIGIN,
  "DARK_GIFT",
  FEAT_CATEGORY.GENERAL,
  FEAT_CATEGORY.FIGHTING_STYLE,
  FEAT_CATEGORY.EPIC_BOON
] as const;

export type FeatCategoryFilter = (typeof FEAT_CATEGORY_FILTER_VALUES)[number];

export function matchesFeatCategoryFilter(
  definition: FeatDefinition,
  filter: FeatCategoryFilter | null
): boolean {
  if (filter === "DARK_GIFT") {
    return definition.tags?.includes("dark-gift") ?? false;
  }

  return filter === null || definition.category === filter;
}
