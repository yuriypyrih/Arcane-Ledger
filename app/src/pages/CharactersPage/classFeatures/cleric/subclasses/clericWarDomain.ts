import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel } from "../../subclassRuntime";

export const warDomainSubclassId = "cleric-war-domain";

const warDomainSpellIdsByLevel = {
  3: [
    "spell-guiding-bolt",
    "spell-magic-weapon",
    "spell-shield-of-faith",
    "spell-spiritual-weapon"
  ],
  5: ["spell-crusaders-mantle", "spell-spirit-guardians"],
  7: ["spell-fire-shield", "spell-freedom-of-movement"],
  9: ["spell-hold-monster", "spell-steel-wind-strike"]
} as const;

export const getClericWarDomainDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Cleric" &&
  character.subclassId === warDomainSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(character.level ?? 0, warDomainSpellIdsByLevel)
      }
    : {};
