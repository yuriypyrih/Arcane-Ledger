import { artificerActionResources } from "./classFeatures/artificer/resourceManagement";
import { barbarianActionResources } from "./classFeatures/barbarian/resourceManagement";
import { bardActionResources } from "./classFeatures/bard/resourceManagement";
import { clericActionResources } from "./classFeatures/cleric/resourceManagement";
import { druidActionResources } from "./classFeatures/druid/resourceManagement";
import { fighterActionResources } from "./classFeatures/fighter/resourceManagement";
import { monkActionResources } from "./classFeatures/monk/resourceManagement";
import { paladinActionResources } from "./classFeatures/paladin/resourceManagement";
import { rangerActionResources } from "./classFeatures/ranger/resourceManagement";
import { rogueActionResources } from "./classFeatures/rogue/resourceManagement";
import { sorcererActionResources } from "./classFeatures/sorcerer/resourceManagement";
import type { FeatureActionHeaderTag } from "./classFeatures/types";
import { warlockActionResources } from "./classFeatures/warlock/resourceManagement";
import { wizardActionResources } from "./classFeatures/wizard/resourceManagement";
import { featActionResources } from "./feats/runtime/resourceManagement";
import type { ResourceManagementTarget } from "./resourceManagement";
import { speciesActionResources } from "./speciesResourceManagement";

const actionResources: Record<string, readonly ResourceManagementTarget[]> = {
  ...featActionResources,
  ...speciesActionResources,
  ...artificerActionResources,
  ...barbarianActionResources,
  ...bardActionResources,
  ...clericActionResources,
  ...druidActionResources,
  ...fighterActionResources,
  ...monkActionResources,
  ...paladinActionResources,
  ...rangerActionResources,
  ...rogueActionResources,
  ...sorcererActionResources,
  ...warlockActionResources,
  ...wizardActionResources
};

export function bindResourceHeaderTags(
  tags: FeatureActionHeaderTag[],
  targets: readonly ResourceManagementTarget[] = [],
  featureName?: string
): FeatureActionHeaderTag[] {
  return tags.map((tag, index) => {
    const target = tag.management ?? targets[index];
    if (!target) return tag;
    return {
      ...tag,
      management:
        tag.kind === "charges" && target.kind === "counter" && featureName
          ? { ...target, label: featureName }
          : target
    };
  });
}

export function bindActionResourceHeaderTags(
  key: string,
  tags: FeatureActionHeaderTag[],
  name: string
) {
  return bindResourceHeaderTags(tags, actionResources[key], name);
}
