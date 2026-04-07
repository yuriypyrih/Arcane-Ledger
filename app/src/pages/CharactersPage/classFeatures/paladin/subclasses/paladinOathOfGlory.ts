import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";

export const oathOfGlorySubclassId = "paladin-oath-of-glory";

const oathOfGlorySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Guiding Bolt", "Heroism"]),
  5: resolveSpellIdsByName(["Enhance Ability", "Magic Weapon"]),
  9: resolveSpellIdsByName(["Haste", "Protection from Energy"]),
  13: resolveSpellIdsByName(["Compulsion", "Freedom of Movement"]),
  17: resolveSpellIdsByName(["Legend Lore", "Yolande's Regal Presence"])
} as const;

export const getPaladinOathOfGloryDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Paladin" &&
  character.subclassId === oathOfGlorySubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(character.level ?? 0, oathOfGlorySpellIdsByLevel)
      }
    : {};
