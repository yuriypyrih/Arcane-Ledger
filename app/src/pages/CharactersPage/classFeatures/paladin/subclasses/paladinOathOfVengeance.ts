import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";

export const oathOfVengeanceSubclassId = "paladin-oath-of-vengeance";

const oathOfVengeanceSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Bane", "Hunter's Mark"]),
  5: resolveSpellIdsByName(["Hold Person", "Misty Step"]),
  9: resolveSpellIdsByName(["Haste", "Protection from Energy"]),
  13: resolveSpellIdsByName(["Banishment", "Dimension Door"]),
  17: resolveSpellIdsByName(["Hold Monster", "Scrying"])
} as const;

export const getPaladinOathOfVengeanceDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Paladin" &&
  character.subclassId === oathOfVengeanceSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          oathOfVengeanceSpellIdsByLevel
        )
      }
    : {};
