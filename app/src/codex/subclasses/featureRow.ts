import type { CLASS_FEATURE } from "../entries/enums";
import type {
  FeatureMapEntry,
  SubclassFeatureClassObj,
  SubclassFeatureLevel
} from "../entries/types";

export function createSubclassFeatureRow(
  level: SubclassFeatureLevel,
  feature: CLASS_FEATURE,
  details: FeatureMapEntry
): SubclassFeatureClassObj {
  return { level, classFeatures: [feature], featureOverrides: { [feature]: details } };
}
