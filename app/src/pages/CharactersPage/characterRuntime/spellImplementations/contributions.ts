import type { SpellImplementation, SpellImplementationContributionSpec } from "./types";

export function compileSpellImplementationContributions(
  specs: readonly SpellImplementationContributionSpec[]
): SpellImplementation[] {
  return specs.map((spec) => ({
    spellId: spec.spellId,
    getCastOptions: spec.getCastOptions,
    applyOnCast: spec.applyOnCast,
    getRollEffects: spec.getRollEffects,
    getStatusOptions: spec.getStatusOptions
  }));
}
