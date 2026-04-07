import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel } from "../../subclassRuntime";

export const lightDomainSubclassId = "cleric-light-domain";

const lightDomainSpellIdsByLevel = {
  3: ["spell-burning-hands", "spell-faerie-fire", "spell-scorching-ray", "spell-see-invisibility"],
  5: ["spell-daylight", "spell-fireball"],
  7: ["spell-arcane-eye", "spell-wall-of-fire"],
  9: ["spell-flame-strike", "spell-scrying"]
} as const;

export const getClericLightDomainDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Cleric" &&
  character.subclassId === lightDomainSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(character.level ?? 0, lightDomainSpellIdsByLevel)
      }
    : {};
