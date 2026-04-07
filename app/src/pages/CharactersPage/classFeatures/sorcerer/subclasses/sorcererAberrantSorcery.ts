import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";

export const aberrantSorcerySubclassId = "sorcerer-aberrant-sorcery";

const aberrantSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName([
    "Arms of Hadar",
    "Calm Emotions",
    "Detect Thoughts",
    "Dissonant Whispers",
    "Mind Sliver"
  ]),
  5: resolveSpellIdsByName(["Hunger of Hadar", "Sending"]),
  7: resolveSpellIdsByName(["Evard's Black Tentacles", "Summon Aberration"]),
  9: resolveSpellIdsByName(["Rary's Telepathic Bond", "Telekinesis"])
} as const;

export const getSorcererAberrantSorceryDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Sorcerer" &&
  character.subclassId === aberrantSorcerySubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          aberrantSorcerySpellIdsByLevel
        )
      }
    : {};
