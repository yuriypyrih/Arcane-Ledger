/**
 * Audited against the current spell catalog: leveled Enchantment spells that impose Charmed.
 * Keep this list aligned when adding or revising spells; charm immunity/removal does not qualify.
 * Antipathy/Sympathy qualifies only when using Sympathy.
 */
export const alterMemoriesSpellIds: ReadonlySet<string> = new Set([
  "spell-animal-friendship",
  "spell-charm-person",
  "spell-crown-of-madness",
  "spell-suggestion",
  "spell-fast-friends",
  "spell-incite-greed",
  "spell-charm-monster",
  "spell-compulsion",
  "spell-dominate-beast",
  "spell-dominate-person",
  "spell-geas",
  "spell-modify-memory",
  "spell-irresistible-dance",
  "spell-mass-suggestion",
  "spell-antipathy-sympathy",
  "spell-dominate-monster"
]);
