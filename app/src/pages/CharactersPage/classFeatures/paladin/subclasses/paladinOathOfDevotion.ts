import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";

export const oathOfDevotionSubclassId = "paladin-oath-of-devotion";

const oathOfDevotionSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Protection from Evil and Good", "Shield of Faith"]),
  5: resolveSpellIdsByName(["Aid", "Zone of Truth"]),
  9: resolveSpellIdsByName(["Beacon of Hope", "Dispel Magic"]),
  13: resolveSpellIdsByName(["Freedom of Movement", "Guardian of Faith"]),
  17: resolveSpellIdsByName(["Commune", "Flame Strike"])
} as const;

export const getPaladinOathOfDevotionDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Paladin" &&
  character.subclassId === oathOfDevotionSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          oathOfDevotionSpellIdsByLevel
        )
      }
    : {};
