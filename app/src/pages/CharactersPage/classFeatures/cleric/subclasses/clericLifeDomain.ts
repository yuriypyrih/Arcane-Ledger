import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel } from "../../subclassRuntime";

export const lifeDomainSubclassId = "cleric-life-domain";

const lifeDomainSpellIdsByLevel = {
  3: ["spell-aid", "spell-bless", "spell-cure-wounds", "spell-lesser-restoration"],
  5: ["spell-mass-healing-word", "spell-revivify"],
  7: ["spell-aura-of-life", "spell-death-ward"],
  9: ["spell-greater-restoration", "spell-mass-cure-wounds"]
} as const;

export const getClericLifeDomainDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Cleric" &&
  character.subclassId === lifeDomainSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(character.level ?? 0, lifeDomainSpellIdsByLevel)
      }
    : {};
