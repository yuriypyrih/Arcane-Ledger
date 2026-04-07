import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";

export const oathOfTheNobleGeniesSubclassId = "paladin-oath-of-the-noble-genies";

const oathOfTheNobleGeniesSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Chromatic Orb", "Elementalism", "Thunderous Smite"]),
  5: resolveSpellIdsByName(["Mirror Image", "Phantasmal Force"]),
  9: resolveSpellIdsByName(["Fly", "Gaseous Form"]),
  13: resolveSpellIdsByName(["Conjure Minor Elementals", "Summon Elemental"]),
  17: resolveSpellIdsByName(["Banishing Smite", "Contact Other Plane"])
} as const;

export const getPaladinOathOfTheNobleGeniesDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Paladin" &&
  character.subclassId === oathOfTheNobleGeniesSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          oathOfTheNobleGeniesSpellIdsByLevel
        )
      }
    : {};
