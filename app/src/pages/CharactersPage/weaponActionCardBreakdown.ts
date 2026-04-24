import type { WeaponAction } from "./gameplay";

const normalizedWeaponActionCardBonusLabels: Record<string, string> = {
  "Dazzling Footwork / Bardic Damage": "Dazzling Footwork",
  "Sacred Weapons": "Sacred Weapon"
};

function normalizeWeaponActionCardBonusLabel(label: string | null | undefined): string | null {
  const trimmedLabel = label?.trim();

  if (!trimmedLabel) {
    return null;
  }

  return normalizedWeaponActionCardBonusLabels[trimmedLabel] ?? trimmedLabel;
}

function appendUniqueWeaponActionCardBonusLabel(labels: string[], label: string | null | undefined) {
  const normalizedLabel = normalizeWeaponActionCardBonusLabel(label);

  if (!normalizedLabel || labels.includes(normalizedLabel)) {
    return labels;
  }

  return [...labels, normalizedLabel];
}

export function appendWeaponActionCardBonusLabel(
  action: WeaponAction,
  label: string | null | undefined
): WeaponAction {
  const nextCardBonusLabels = appendUniqueWeaponActionCardBonusLabel(
    action.cardBonusLabels,
    label
  );

  return nextCardBonusLabels === action.cardBonusLabels
    ? action
    : {
        ...action,
        cardBonusLabels: nextCardBonusLabels
      };
}

export function getWeaponActionCardBonusLabels(
  action: Pick<
    WeaponAction,
    | "cardBonusLabels"
    | "damageBreakdownLabel"
    | "hasVersatileBonus"
    | "hasGreatWeaponFighting"
    | "hasMartialArtsDamageDie"
    | "hasBatteringRootsBonus"
    | "damageBonusEntries"
  >
): string[] {
  let labels = action.cardBonusLabels.reduce<string[]>(
    (currentLabels, label) => appendUniqueWeaponActionCardBonusLabel(currentLabels, label),
    []
  );

  labels = appendUniqueWeaponActionCardBonusLabel(labels, action.damageBreakdownLabel);

  if (action.hasVersatileBonus) {
    labels = appendUniqueWeaponActionCardBonusLabel(labels, "Versatile Bonus");
  }

  if (action.hasGreatWeaponFighting) {
    labels = appendUniqueWeaponActionCardBonusLabel(labels, "Great Weapon Fighting");
  }

  if (action.hasMartialArtsDamageDie) {
    labels = appendUniqueWeaponActionCardBonusLabel(labels, "Martial Arts");
  }

  if (action.hasBatteringRootsBonus) {
    labels = appendUniqueWeaponActionCardBonusLabel(labels, "Battering Roots");
  }

  return action.damageBonusEntries.reduce<string[]>(
    (currentLabels, entry) => appendUniqueWeaponActionCardBonusLabel(currentLabels, entry.label),
    labels
  );
}
