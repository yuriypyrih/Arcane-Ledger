export type CharacterSheetDomain =
  | "profile"
  | "resources"
  | "equipment"
  | "inventory"
  | "spells"
  | "features"
  | "statuses"
  | "proficiencies"
  | "companions";

export const characterSheetDomains: CharacterSheetDomain[] = [
  "profile",
  "resources",
  "equipment",
  "inventory",
  "spells",
  "features",
  "statuses",
  "proficiencies",
  "companions"
];

export type CharacterSheetDomainRevisions = Record<CharacterSheetDomain, number>;

export function createCharacterSheetDomainRevisions(): CharacterSheetDomainRevisions {
  return characterSheetDomains.reduce(
    (revisions, domain) => ({
      ...revisions,
      [domain]: 0
    }),
    {} as CharacterSheetDomainRevisions
  );
}

export function normalizeCharacterSheetDomains(
  domains: readonly CharacterSheetDomain[] | undefined
): CharacterSheetDomain[] {
  if (!domains || domains.length === 0) {
    return [...characterSheetDomains];
  }

  return [...new Set(domains)];
}
