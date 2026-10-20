import type {
  FeatureActionCard,
  FeatureActionHeaderTag,
  FeatureActionHeaderTagPool,
  FeatureActionCardUsage,
  FeatureActionCardUsageCharges,
  FeatureActionCardUsageCost,
  FeatureActionIcon,
  FeatureActionResource,
  FeatureActionTone
} from "./types";
import type { ResourceManagementTarget } from "../resourceManagement";

type FeatureActionCardCostOptions = {
  amountText?: string;
  resourceLabel?: string;
  icon?: FeatureActionIcon;
  management?: ResourceManagementTarget;
};

function normalizeAmountText(value?: string) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
}

function normalizeResourceLabel(value?: string) {
  return value?.trim() ?? "";
}

export function createFeatureActionCardCost({
  amountText,
  resourceLabel = "",
  icon,
  management
}: FeatureActionCardCostOptions): FeatureActionCardUsageCost {
  return {
    amountText: normalizeAmountText(amountText),
    resourceLabel: normalizeResourceLabel(resourceLabel),
    icon,
    management
  };
}

export function createFeatureActionCardUsageCharges(
  current: number,
  total: number,
  management?: ResourceManagementTarget
): FeatureActionCardUsageCharges {
  return {
    current: Math.max(0, current),
    total: Math.max(0, total),
    management
  };
}

type FeatureActionHeaderTagPoolOptions = {
  label?: string;
  icon?: FeatureActionIcon;
};

type FeatureActionUsageHeaderTagOptions = {
  isFallback?: boolean;
};

export function createFeatureActionHeaderTagPool(
  current: number,
  total: number,
  { label, icon }: FeatureActionHeaderTagPoolOptions = {}
): FeatureActionHeaderTagPool {
  const normalizedLabel = label?.trim();

  return {
    current: Math.max(0, current),
    total: Math.max(0, total),
    label: normalizedLabel ? normalizedLabel : undefined,
    icon
  };
}

export function createChargesHeaderTag(
  current: number,
  total: number,
  supplementaryText?: string,
  management?: ResourceManagementTarget
): FeatureActionHeaderTag {
  const normalizedSupplementaryText = supplementaryText?.trim();

  return {
    kind: "charges",
    management,
    charges: createFeatureActionCardUsageCharges(current, total),
    supplementaryText: normalizedSupplementaryText ? normalizedSupplementaryText : undefined
  };
}

export function createUsageHeaderTag(
  cost: FeatureActionCardUsageCost,
  pool: FeatureActionHeaderTagPool,
  { isFallback = false }: FeatureActionUsageHeaderTagOptions = {}
): FeatureActionHeaderTag {
  return {
    kind: "usage",
    management: cost.management,
    cost,
    pool,
    isFallback
  };
}

export function createNamedUsageHeaderTags(
  cost: FeatureActionCardUsageCost,
  current: number,
  total: number,
  poolOptions: FeatureActionHeaderTagPoolOptions = {},
  usageOptions: FeatureActionUsageHeaderTagOptions = {}
): FeatureActionHeaderTag[] {
  return [
    createUsageHeaderTag(
      cost,
      createFeatureActionHeaderTagPool(current, total, poolOptions),
      usageOptions
    )
  ];
}

export function createChargesAndUsageHeaderTags(
  chargesCurrent: number,
  chargesTotal: number,
  cost: FeatureActionCardUsageCost,
  poolCurrent: number,
  poolTotal: number,
  poolOptions: FeatureActionHeaderTagPoolOptions = {},
  supplementaryText?: string,
  usageOptions: FeatureActionUsageHeaderTagOptions = {},
  chargesManagement?: ResourceManagementTarget
): FeatureActionHeaderTag[] {
  return [
    createChargesHeaderTag(chargesCurrent, chargesTotal, supplementaryText, chargesManagement),
    createUsageHeaderTag(
      cost,
      createFeatureActionHeaderTagPool(poolCurrent, poolTotal, poolOptions),
      usageOptions
    )
  ];
}

export function markUsageHeaderTagsAsFallback(
  tags: FeatureActionHeaderTag[]
): FeatureActionHeaderTag[] {
  return tags.map((tag) => (tag.kind === "usage" ? { ...tag, isFallback: true } : tag));
}

export function createTextHeaderTag(
  label: string,
  value: string,
  icon?: FeatureActionIcon,
  tone?: FeatureActionTone,
  management?: ResourceManagementTarget
): FeatureActionHeaderTag {
  return {
    kind: "text",
    label,
    value,
    icon,
    tone,
    management
  };
}

export function createHeaderTagsFromResources(
  resources: FeatureActionResource[]
): FeatureActionHeaderTag[] {
  return resources.map((resource): FeatureActionHeaderTag => {
    if (resource.kind === "text") {
      return createTextHeaderTag(
        resource.label,
        resource.value,
        resource.icon,
        resource.tone,
        resource.management
      );
    }

    if (!resource.icon) {
      return createChargesHeaderTag(
        resource.current,
        resource.total,
        resource.supplementary,
        resource.management
      );
    }

    return createUsageHeaderTag(
      createFeatureActionCardCost({
        amountText: resource.cost ? String(resource.cost) : undefined,
        resourceLabel: resource.label,
        icon: resource.icon,
        management: resource.management
      }),
      createFeatureActionHeaderTagPool(resource.current, resource.total, {
        icon: resource.icon
      })
    );
  });
}

export function createFreeCardUsage(): FeatureActionCardUsage {
  return {
    mode: "free"
  };
}

export function createTextCardUsage(label: string): FeatureActionCardUsage {
  return {
    mode: "text",
    label
  };
}

export function createNamedResourceCardUsage(
  cost: FeatureActionCardUsageCost
): FeatureActionCardUsage {
  return {
    mode: "named-resource",
    cost
  };
}

export function createNamedResourceOrResourceCardUsage(
  cost: FeatureActionCardUsageCost,
  fallbackCost: FeatureActionCardUsageCost
): FeatureActionCardUsage {
  return {
    mode: "named-resource-or-resource",
    cost,
    fallbackCost
  };
}

export function createChargesCardUsage(
  current: number,
  total: number,
  management?: ResourceManagementTarget
): FeatureActionCardUsage {
  return {
    mode: "charges",
    charges: createFeatureActionCardUsageCharges(current, total, management)
  };
}

export function createChargesAndResourceCardUsage(
  current: number,
  total: number,
  cost: FeatureActionCardUsageCost,
  management?: ResourceManagementTarget
): FeatureActionCardUsage {
  return {
    mode: "charges-and-resource",
    charges: createFeatureActionCardUsageCharges(current, total, management),
    cost
  };
}

export function createChargesOrResourceCardUsage(
  current: number,
  total: number,
  cost: FeatureActionCardUsageCost,
  management?: ResourceManagementTarget
): FeatureActionCardUsage {
  return {
    mode: "charges-or-resource",
    charges: createFeatureActionCardUsageCharges(current, total, management),
    cost
  };
}

function parseUsesLabelCost(
  usesLabel: string | undefined,
  icon: FeatureActionIcon | undefined
): FeatureActionCardUsageCost | null {
  if (!usesLabel || !icon) {
    return null;
  }

  const normalizedLabel = usesLabel.trim();

  if (!normalizedLabel) {
    return null;
  }

  const useMatch = normalizedLabel.match(/^Use\s+(.+)$/i);

  return createFeatureActionCardCost({
    amountText: useMatch ? useMatch[1] : normalizedLabel,
    icon
  });
}

function parseInlineCost(action: FeatureActionCard): FeatureActionCardUsageCost | null {
  if (!action.usesInlineLabel) {
    return null;
  }

  const normalizedLabel = action.usesInlineLabel.trim();

  if (!normalizedLabel || normalizedLabel.startsWith("|")) {
    return null;
  }

  if (normalizedLabel === "Spend") {
    return createFeatureActionCardCost({
      resourceLabel: action.usesInlineSuffix,
      icon: action.usesInlineIcon
    });
  }

  const useMatch = normalizedLabel.match(/^Use\s+(.+)$/i);

  if (!useMatch) {
    return null;
  }

  return createFeatureActionCardCost({
    amountText: useMatch[1],
    resourceLabel: action.usesInlineSuffix,
    icon: action.usesInlineIcon
  });
}

export function normalizeFeatureActionCardUsage(action: FeatureActionCard): FeatureActionCard {
  if (action.cardUsage) {
    return action;
  }

  const inlineCost = parseInlineCost(action);

  if (inlineCost) {
    return {
      ...action,
      cardUsage: createNamedResourceCardUsage(inlineCost)
    };
  }

  const usesLabelCost = parseUsesLabelCost(action.usesLabel, action.usesIcon);

  if (usesLabelCost) {
    return {
      ...action,
      cardUsage: createNamedResourceCardUsage(usesLabelCost)
    };
  }

  if (action.usesTotal && action.usesTotal > 0 && !action.hideUsesTrackerOnCard) {
    return {
      ...action,
      cardUsage: createChargesCardUsage(action.usesRemaining ?? 0, action.usesTotal)
    };
  }

  return action;
}
