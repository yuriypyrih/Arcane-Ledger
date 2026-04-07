import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";

export const spellfireSorcerySubclassId = "sorcerer-spellfire-sorcery";

const spellfireSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Cure Wounds", "Guiding Bolt", "Lesser Restoration", "Scorching Ray"]),
  5: resolveSpellIdsByName(["Aura of Vitality", "Dispel Magic"]),
  7: resolveSpellIdsByName(["Fire Shield", "Wall of Fire"]),
  9: resolveSpellIdsByName(["Greater Restoration", "Flame Strike"])
} as const;
const spellfireSorceryBonusSpellIdsByLevel = {
  6: resolveSpellIdsByName(["Counterspell"])
} as const;

export const getSorcererSpellfireSorceryDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Sorcerer" &&
  character.subclassId === spellfireSorcerySubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: [
          ...getPreparedSpellIdsByLevel(character.level ?? 0, spellfireSorcerySpellIdsByLevel),
          ...((character.level ?? 0) >= 6 ? spellfireSorceryBonusSpellIdsByLevel[6] : [])
        ]
      }
    : {};
