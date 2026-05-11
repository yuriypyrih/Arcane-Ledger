export type SpellAliasEntry = {
  legacyId: string;
  legacyName: string;
  canonicalId: string;
  canonicalName: string;
};

export const spellAliasEntries: SpellAliasEntry[] = [
  {
    legacyId: "spell-melfs-acid-arrow",
    legacyName: "Melf's Acid Arrow",
    canonicalId: "spell-acid-arrow",
    canonicalName: "Acid Arrow"
  },
  {
    legacyId: "spell-bigbys-hand",
    legacyName: "Bigby's Hand",
    canonicalId: "spell-arcane-hand",
    canonicalName: "Arcane Hand"
  },
  {
    legacyId: "spell-mordenkainens-sword",
    legacyName: "Mordenkainen's Sword",
    canonicalId: "spell-arcane-sword",
    canonicalName: "Arcane Sword"
  },
  {
    legacyId: "spell-nystuls-magic-aura",
    legacyName: "Nystul's Magic Aura",
    canonicalId: "spell-arcanists-magic-aura",
    canonicalName: "Arcanist's Magic Aura"
  },
  {
    legacyId: "spell-evards-black-tentacles",
    legacyName: "Evard's Black Tentacles",
    canonicalId: "spell-black-tentacles",
    canonicalName: "Black Tentacles"
  },
  {
    legacyId: "spell-branding-smite",
    legacyName: "Branding Smite",
    canonicalId: "spell-shining-smite",
    canonicalName: "Shining Smite"
  },
  {
    legacyId: "spell-mordenkainens-faithful-hound",
    legacyName: "Mordenkainen's Faithful Hound",
    canonicalId: "spell-faithful-hound",
    canonicalName: "Faithful Hound"
  },
  {
    legacyId: "spell-tensers-floating-disk",
    legacyName: "Tenser's Floating Disk",
    canonicalId: "spell-floating-disk",
    canonicalName: "Floating Disk"
  },
  {
    legacyId: "spell-otilukes-freezing-sphere",
    legacyName: "Otiluke's Freezing Sphere",
    canonicalId: "spell-freezing-sphere",
    canonicalName: "Freezing Sphere"
  },
  {
    legacyId: "spell-tashas-hideous-laughter",
    legacyName: "Tasha's Hideous Laughter",
    canonicalId: "spell-hideous-laughter",
    canonicalName: "Hideous Laughter"
  },
  {
    legacyId: "spell-drawmijs-instant-summons",
    legacyName: "Drawmij's Instant Summons",
    canonicalId: "spell-instant-summons",
    canonicalName: "Instant Summons"
  },
  {
    legacyId: "spell-ottos-irresistible-dance",
    legacyName: "Otto's Irresistible Dance",
    canonicalId: "spell-irresistible-dance",
    canonicalName: "Irresistible Dance"
  },
  {
    legacyId: "spell-mordenkainens-magnificent-mansion",
    legacyName: "Mordenkainen's Magnificent Mansion",
    canonicalId: "spell-magnificent-mansion",
    canonicalName: "Magnificent Mansion"
  },
  {
    legacyId: "spell-mordenkainens-private-sanctum",
    legacyName: "Mordenkainen's Private Sanctum",
    canonicalId: "spell-private-sanctum",
    canonicalName: "Private Sanctum"
  },
  {
    legacyId: "spell-otilukes-resilient-sphere",
    legacyName: "Otiluke's Resilient Sphere",
    canonicalId: "spell-resilient-sphere",
    canonicalName: "Resilient Sphere"
  },
  {
    legacyId: "spell-leomunds-secret-chest",
    legacyName: "Leomund's Secret Chest",
    canonicalId: "spell-secret-chest",
    canonicalName: "Secret Chest"
  },
  {
    legacyId: "spell-rarys-telepathic-bond",
    legacyName: "Rary's Telepathic Bond",
    canonicalId: "spell-telepathic-bond",
    canonicalName: "Telepathic Bond"
  },
  {
    legacyId: "spell-leomunds-tiny-hut",
    legacyName: "Leomund's Tiny Hut",
    canonicalId: "spell-tiny-hut",
    canonicalName: "Tiny Hut"
  },
  {
    legacyId: "spell-feeblemind",
    legacyName: "Feeblemind",
    canonicalId: "spell-befuddlement",
    canonicalName: "Befuddlement"
  },
  {
    legacyId: "spell-power-word-heal",
    legacyName: "Power Word: Heal",
    canonicalId: "spell-power-word-heal",
    canonicalName: "Power Word Heal"
  },
  {
    legacyId: "spell-power-word-kill",
    legacyName: "Power Word: Kill",
    canonicalId: "spell-power-word-kill",
    canonicalName: "Power Word Kill"
  },
  {
    legacyId: "spell-power-word-stun",
    legacyName: "Power Word: Stun",
    canonicalId: "spell-power-word-stun",
    canonicalName: "Power Word Stun"
  }
];

const spellIdAliases = new Map(
  spellAliasEntries.map(({ legacyId, canonicalId }) => [legacyId, canonicalId] as const)
);

function normalizeSpellNameAliasKey(name: string): string {
  return name.trim().toLowerCase();
}

const spellNameAliases = new Map(
  spellAliasEntries.map(({ legacyName, canonicalName }) => [
    normalizeSpellNameAliasKey(legacyName),
    canonicalName
  ])
);

export function resolveSpellIdAlias(spellId: string): string {
  return spellIdAliases.get(spellId) ?? spellId;
}

export function resolveSpellNameAlias(name: string): string {
  return spellNameAliases.get(normalizeSpellNameAliasKey(name)) ?? name;
}

