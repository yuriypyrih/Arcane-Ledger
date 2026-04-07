import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";

export const draconicSorcerySubclassId = "sorcerer-draconic-sorcery";

const draconicSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Alter Self", "Chromatic Orb", "Command", "Dragon's Breath"]),
  5: resolveSpellIdsByName(["Fear", "Fly"]),
  7: resolveSpellIdsByName(["Arcane Eye", "Charm Monster"]),
  9: resolveSpellIdsByName(["Legend Lore", "Summon Dragon"])
} as const;

export const getSorcererDraconicSorceryDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Sorcerer" &&
  character.subclassId === draconicSorcerySubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          draconicSorcerySpellIdsByLevel
        )
      }
    : {};
