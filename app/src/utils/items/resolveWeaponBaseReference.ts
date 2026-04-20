import { RARITY_TYPES, type WEAPON_BASE } from "../../codex/entries";
import { getWeaponEntries } from "../../codex/selectors";

export type WeaponBaseReference = {
  baseWeapon?: WEAPON_BASE | null;
  name?: string | null;
  key?: string | null;
};

type WeaponBaseLookupEntry = {
  baseWeapon: WEAPON_BASE;
  slug: string;
};

function normalizeWeaponLookupValue(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const commonWeaponBaseLookupEntries = getWeaponEntries()
  .filter((entry) => entry.rarity === RARITY_TYPES.COMMON && typeof entry.baseWeapon === "string")
  .map((entry) => ({
    baseWeapon: entry.baseWeapon as WEAPON_BASE,
    slug: normalizeWeaponLookupValue(entry.name)
  }));

const weaponBaseByLookupKey = commonWeaponBaseLookupEntries.reduce<Map<string, WEAPON_BASE>>(
  (lookup, entry) => {
    const baseKey = normalizeWeaponLookupValue(entry.baseWeapon);

    lookup.set(entry.slug, entry.baseWeapon);

    if (baseKey) {
      lookup.set(baseKey, entry.baseWeapon);
      lookup.set(`srd_${baseKey}`, entry.baseWeapon);
    }

    return lookup;
  },
  new Map<WeaponBaseLookupEntry["slug"], WEAPON_BASE>()
);

function resolveWeaponBaseFromLookupValue(value: string | null | undefined): WEAPON_BASE | null {
  const normalizedValue = normalizeWeaponLookupValue(value);

  if (!normalizedValue) {
    return null;
  }

  const directMatch = weaponBaseByLookupKey.get(normalizedValue);

  if (directMatch) {
    return directMatch;
  }

  const suffixMatch = commonWeaponBaseLookupEntries.find(
    (entry) => normalizedValue === entry.slug || normalizedValue.endsWith(`_${entry.slug}`)
  );

  return suffixMatch?.baseWeapon ?? null;
}

export function resolveWeaponBaseReference(
  reference: WeaponBaseReference | null | undefined
): WEAPON_BASE | null {
  if (reference?.baseWeapon) {
    return reference.baseWeapon;
  }

  return (
    resolveWeaponBaseFromLookupValue(reference?.key) ??
    resolveWeaponBaseFromLookupValue(reference?.name)
  );
}
