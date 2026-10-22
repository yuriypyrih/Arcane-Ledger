import type { Character } from "../../types";
import {
  createChargesHeaderTag,
  createUsageHeaderTag,
  markUsageHeaderTagsAsFallback
} from "./classFeatures/cardUsage";
import type { FeatureActionCardUsage, FeatureActionHeaderTag } from "./classFeatures/types";
import { bindResourceHeaderTags } from "./drawerResourceBindings";
import type { ResourceManagementTarget } from "./resourceManagement";
import { getSpellOptionResourceTargets } from "./spellResourceBindings";
import { getManagedSpellSlotPool } from "./spellSlotResourceManagement";

type SpellResourceOption = {
  id: string;
  usage?: FeatureActionCardUsage;
  headerTags?: FeatureActionHeaderTag[];
};

function getResourcePool(character: Character, target: ResourceManagementTarget | undefined) {
  if (target?.kind === "counter") {
    return { current: target.remaining(character), total: target.total(character) };
  }
  if (target?.kind !== "spell-slots") return null;
  const pool = getManagedSpellSlotPool(character, target);
  if (!pool) return null;
  let current = 0;
  let total = 0;
  pool.totals.forEach((count, index) => {
    if (index + 1 < target.minimumLevel || index + 1 > (target.maximumLevel ?? 9)) return;
    total += count;
    current += Math.max(0, count - (pool.expended[index] ?? 0));
  });
  return { current, total, label: target.label };
}

export function getSpellOptionHeaderTags(
  character: Character,
  spellId: string,
  option: SpellResourceOption
): FeatureActionHeaderTag[] {
  const tags = [...(option.headerTags ?? [])];
  const targets = getSpellOptionResourceTargets(option.id, spellId);
  const usage = option.usage;
  // The footer's charge data is also the header default. Explicit tags take precedence.
  if (usage && "charges" in usage) {
    if (!tags.some((tag) => tag.kind === "charges")) {
      tags.unshift(
        createChargesHeaderTag(
          usage.charges.current,
          usage.charges.total,
          undefined,
          usage.charges.management ?? targets[0]
        )
      );
    }
    if (usage.mode !== "charges" && !tags.some((tag) => tag.kind === "usage")) {
      const target = usage.cost.management ?? targets[1];
      const pool = getResourcePool(character, target);
      if (pool) {
        tags.push(
          createUsageHeaderTag(
            { ...usage.cost, management: target },
            { ...pool, icon: usage.cost.icon }
          )
        );
      }
    }
  }
  return bindResourceHeaderTags(
    usage?.mode === "charges-or-resource" ? markUsageHeaderTagsAsFallback(tags) : tags,
    targets
  );
}
