import { RARITY_TYPES, type WEAPON_BASE } from "../../codex/entries";
import { getWeaponEntries } from "../../codex/selectors";

export type WeaponBaseReference = {
  baseWeapon?: WEAPON_BASE | null;
  name?: string | null;
  key?: string | null;
};

function normalizeWeaponLookupValue(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function createCommaInvertedLookupValue(value: string | null | undefined): string | null {
  const [head, ...tailParts] = (value ?? "").split(",");
  const tail = tailParts.join(",").trim();

  if (!head || !tail) {
    return null;
  }

  return `${tail} ${head.trim()}`;
}

function createTwoWordInvertedLookupValue(value: string | null | undefined): string | null {
  const words = (value ?? "").trim().split(/\s+/);

  if (words.length !== 2) {
    return null;
  }

  return `${words[1]} ${words[0]}`;
}

function createWeaponLookupSlugs(...values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(
      values.map((value) => normalizeWeaponLookupValue(value)).filter((value) => value.length > 0)
    )
  ];
}

const commonWeaponBaseLookupEntries = getWeaponEntries()
  .filter((entry) => entry.rarity === RARITY_TYPES.COMMON && typeof entry.baseWeapon === "string")
  .map((entry) => ({
    baseWeapon: entry.baseWeapon as WEAPON_BASE,
    slugs: createWeaponLookupSlugs(entry.name, createTwoWordInvertedLookupValue(entry.name))
  }));

const weaponBaseByLookupKey = commonWeaponBaseLookupEntries.reduce<Map<string, WEAPON_BASE>>(
  (lookup, entry) => {
    const baseKey = normalizeWeaponLookupValue(entry.baseWeapon);

    entry.slugs.forEach((slug) => {
      lookup.set(slug, entry.baseWeapon);
    });

    if (baseKey) {
      lookup.set(baseKey, entry.baseWeapon);
      lookup.set(`srd_${baseKey}`, entry.baseWeapon);
    }

    return lookup;
  },
  new Map<string, WEAPON_BASE>()
);

function resolveWeaponBaseFromLookupValue(value: string | null | undefined): WEAPON_BASE | null {
  const normalizedValues = createWeaponLookupSlugs(value, createCommaInvertedLookupValue(value));

  if (normalizedValues.length === 0) {
    return null;
  }

  const directMatch = normalizedValues
    .map((normalizedValue) => weaponBaseByLookupKey.get(normalizedValue))
    .find((baseWeapon): baseWeapon is WEAPON_BASE => typeof baseWeapon === "string");

  if (directMatch) {
    return directMatch;
  }

  const suffixMatch = commonWeaponBaseLookupEntries.find(
    (entry) =>
      normalizedValues.some((normalizedValue) =>
        entry.slugs.some(
          (slug) => normalizedValue === slug || normalizedValue.endsWith(`_${slug}`)
        )
      )
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
