import type {
  FeatureActionCard,
  FeatureActionHeaderTag,
  FeatureActionHeaderTagPool,
  FeatureActionCardUsage,
  FeatureActionCardUsageCharges,
  FeatureActionCardUsageCost,
  FeatureActionIcon,
  FeatureActionTone
} from "./types";

type FeatureActionCardCostOptions = {
  amountText?: string;
  resourceLabel?: string;
  icon?: FeatureActionIcon;
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
  icon
}: FeatureActionCardCostOptions): FeatureActionCardUsageCost {
  return {
    amountText: normalizeAmountText(amountText),
    resourceLabel: normalizeResourceLabel(resourceLabel),
    icon
  };
}

export function createFeatureActionCardUsageCharges(
  current: number,
  total: number
): FeatureActionCardUsageCharges {
  return {
    current: Math.max(0, current),
    total: Math.max(0, total)
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
  supplementaryText?: string
): FeatureActionHeaderTag {
  const normalizedSupplementaryText = supplementaryText?.trim();

  return {
    kind: "charges",
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
  usageOptions: FeatureActionUsageHeaderTagOptions = {}
): FeatureActionHeaderTag[] {
  return [
    createChargesHeaderTag(chargesCurrent, chargesTotal, supplementaryText),
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
  tone?: FeatureActionTone
): FeatureActionHeaderTag {
  return {
    kind: "text",
    label,
    value,
    icon,
    tone
  };
}

export function createFreeCardUsage(): FeatureActionCardUsage {
  return {
    mode: "free"
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

export function createChargesCardUsage(current: number, total: number): FeatureActionCardUsage {
  return {
    mode: "charges",
    charges: createFeatureActionCardUsageCharges(current, total)
  };
}

export function createChargesAndResourceCardUsage(
  current: number,
  total: number,
  cost: FeatureActionCardUsageCost
): FeatureActionCardUsage {
  return {
    mode: "charges-and-resource",
    charges: createFeatureActionCardUsageCharges(current, total),
    cost
  };
}

export function createChargesOrResourceCardUsage(
  current: number,
  total: number,
  cost: FeatureActionCardUsageCost
): FeatureActionCardUsage {
  return {
    mode: "charges-or-resource",
    charges: createFeatureActionCardUsageCharges(current, total),
    cost
  };
}

function parseLegacyUsesLabelCost(
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

function parseLegacyInlineCost(action: FeatureActionCard): FeatureActionCardUsageCost | null {
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

  const inlineCost = parseLegacyInlineCost(action);

  if (inlineCost) {
    return {
      ...action,
      cardUsage: createNamedResourceCardUsage(inlineCost)
    };
  }

  const usesLabelCost = parseLegacyUsesLabelCost(action.usesLabel, action.usesIcon);

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
