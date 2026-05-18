import { TOOL_PROFICIENCY, WEAPON_PROFICIENCY } from "../../../../../types";
import {
  getPreparedSpellIdsByLevel,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import {
  createArtificerToolProficiencyEntries,
  createArtificerWeaponProficiencyEntries,
  hasArtificerSubclassFeature
} from "./artificerSubclassHelpers";

export const battleSmithSubclassId = "artificer-battle-smith";

const battleSmithSpellIdsByLevel = {
  3: ["spell-heroism", "spell-shield"],
  5: ["spell-shining-smite", "spell-warding-bond"],
  9: ["spell-aura-of-vitality", "spell-conjure-barrage"],
  13: ["spell-aura-of-purity", "spell-fire-shield"],
  17: ["spell-banishing-smite", "spell-mass-cure-wounds"]
} as const;

const battleSmithToolsSource = "Battle Smith: Tools of the Trade";

export const getArtificerBattleSmithDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasArtificerSubclassFeature(character, battleSmithSubclassId, 3)
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          battleSmithSpellIdsByLevel
        ),
        weaponProficiencyEntries: createArtificerWeaponProficiencyEntries(
          [WEAPON_PROFICIENCY.MARTIAL],
          battleSmithToolsSource
        ),
        toolProficiencyEntries: createArtificerToolProficiencyEntries(
          [TOOL_PROFICIENCY.SMITHS_TOOLKIT],
          battleSmithToolsSource
        )
      }
    : {};
