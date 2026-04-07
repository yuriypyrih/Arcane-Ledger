import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";

export const oathOfTheAncientsSubclassId = "paladin-oath-of-the-ancients";

const oathOfTheAncientsSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Ensnaring Strike", "Speak with Animals"]),
  5: resolveSpellIdsByName(["Misty Step", "Moonbeam"]),
  9: resolveSpellIdsByName(["Plant Growth", "Protection from Energy"]),
  13: resolveSpellIdsByName(["Ice Storm", "Stoneskin"]),
  17: resolveSpellIdsByName(["Commune with Nature", "Tree Stride"])
} as const;

export const getPaladinOathOfTheAncientsDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Paladin" &&
  character.subclassId === oathOfTheAncientsSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          oathOfTheAncientsSpellIdsByLevel
        )
      }
    : {};
