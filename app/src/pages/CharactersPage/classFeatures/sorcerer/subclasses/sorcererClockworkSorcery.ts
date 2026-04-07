import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";

export const clockworkSorcerySubclassId = "sorcerer-clockwork-sorcery";

const clockworkSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Aid", "Alarm", "Lesser Restoration", "Protection from Evil and Good"]),
  5: resolveSpellIdsByName(["Dispel Magic", "Protection from Energy"]),
  7: resolveSpellIdsByName(["Freedom of Movement", "Summon Construct"]),
  9: resolveSpellIdsByName(["Greater Restoration", "Wall of Force"])
} as const;

export const getSorcererClockworkSorceryDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Sorcerer" &&
  character.subclassId === clockworkSorcerySubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          clockworkSorcerySpellIdsByLevel
        )
      }
    : {};
