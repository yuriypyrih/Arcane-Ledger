import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel } from "../../subclassRuntime";

export const trickeryDomainSubclassId = "cleric-trickery-domain";

const trickeryDomainSpellIdsByLevel = {
  3: [
    "spell-charm-person",
    "spell-disguise-self",
    "spell-invisibility",
    "spell-pass-without-trace"
  ],
  5: ["spell-hypnotic-pattern", "spell-nondetection"],
  7: ["spell-confusion", "spell-dimension-door"],
  9: ["spell-dominate-person", "spell-modify-memory"]
} as const;

export const getClericTrickeryDomainDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Cleric" &&
  character.subclassId === trickeryDomainSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          trickeryDomainSpellIdsByLevel
        )
      }
    : {};
