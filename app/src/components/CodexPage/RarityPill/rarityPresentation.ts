import { RARITY_TYPES } from "../../../codex/entries";
import type { ItemDetailReference } from "../../../types";
import { formatCodexLabel } from "../../../utils/codex";

export type RarityPillValue = RARITY_TYPES | ItemDetailReference | string | null | undefined;

type RarityAppearance = {
  color: string;
  background: string;
  border: string;
};

const appearanceByRarity: Record<RARITY_TYPES, RarityAppearance> = {
  [RARITY_TYPES.CUSTOM]: {
    color: "#4b5563",
    background: "#e5e7eb",
    border: "#c8ccd3"
  },
  [RARITY_TYPES.NO_RARITY]: {
    color: "#5b524b",
    background: "#ede5dd",
    border: "#cbbeb0"
  },
  [RARITY_TYPES.COMMON]: {
    color: "#4b3f35",
    background: "#f7f2eb",
    border: "#d7c9ba"
  },
  [RARITY_TYPES.UNCOMMON]: {
    color: "#1f7a43",
    background: "#e6f6ea",
    border: "#9dd2ae"
  },
  [RARITY_TYPES.RARE]: {
    color: "#0e62ba",
    background: "#e7f3ff",
    border: "#8abde8"
  },
  [RARITY_TYPES.VERY_RARE]: {
    color: "#7b36b2",
    background: "#f3e9ff",
    border: "#cba3ef"
  },
  [RARITY_TYPES.LEGENDARY]: {
    color: "#9b5200",
    background: "#fff0d9",
    border: "#efbf72"
  },
  [RARITY_TYPES.ARTIFACT]: {
    color: "#9e2f24",
    background: "#ffe7e2",
    border: "#e7a79d"
  }
};

function normalizeRarityKey(value: string): string {
  return value.trim().replace(/[\s-]+/g, "_").toUpperCase();
}

export function getRarityDisplayLabel(rarity: Exclude<RarityPillValue, null | undefined>): string | null {
  if (typeof rarity === "string") {
    return formatCodexLabel(normalizeRarityKey(rarity));
  }

  const rarityName = typeof rarity.name === "string" ? rarity.name.trim() : "";

  if (rarityName) {
    return rarityName;
  }

  const rarityKey = typeof rarity.key === "string" ? rarity.key.trim() : "";
  return rarityKey ? formatCodexLabel(normalizeRarityKey(rarityKey)) : null;
}

function getRarityAppearanceKey(rarity: Exclude<RarityPillValue, null | undefined>): RARITY_TYPES {
  if (typeof rarity === "string") {
    const normalizedKey = normalizeRarityKey(rarity);
    return appearanceByRarity[normalizedKey as RARITY_TYPES]
      ? (normalizedKey as RARITY_TYPES)
      : RARITY_TYPES.NO_RARITY;
  }

  const rarityKey = typeof rarity.key === "string" ? normalizeRarityKey(rarity.key) : "";

  if (appearanceByRarity[rarityKey as RARITY_TYPES]) {
    return rarityKey as RARITY_TYPES;
  }

  const rarityName = typeof rarity.name === "string" ? normalizeRarityKey(rarity.name) : "";
  return appearanceByRarity[rarityName as RARITY_TYPES]
    ? (rarityName as RARITY_TYPES)
    : RARITY_TYPES.NO_RARITY;
}

export function getRarityAppearance(
  rarity: Exclude<RarityPillValue, null | undefined>
): RarityAppearance {
  return appearanceByRarity[getRarityAppearanceKey(rarity)];
}

export function hasDisplayableRarity(rarity: RarityPillValue): boolean {
  if (!rarity) {
    return false;
  }

  if (typeof rarity === "string") {
    const normalizedKey = normalizeRarityKey(rarity);
    return normalizedKey.length > 0 && normalizedKey !== RARITY_TYPES.NO_RARITY;
  }

  const normalizedName =
    typeof rarity.name === "string" ? normalizeRarityKey(rarity.name) : "";
  const normalizedKey =
    typeof rarity.key === "string" ? normalizeRarityKey(rarity.key) : "";

  if (!normalizedName && !normalizedKey) {
    return false;
  }

  return normalizedName !== RARITY_TYPES.NO_RARITY && normalizedKey !== RARITY_TYPES.NO_RARITY;
}
