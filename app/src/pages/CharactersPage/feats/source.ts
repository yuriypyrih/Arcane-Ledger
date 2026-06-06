export const FEAT_SOURCE_VALUES = ["PHB'24", "FRHoF"] as const;
export type FeatSource = (typeof FEAT_SOURCE_VALUES)[number];
export const DEFAULT_FEAT_SOURCE: FeatSource = "PHB'24";
