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

export const artilleristSubclassId = "artificer-artillerist";

const artilleristSpellIdsByLevel = {
  3: ["spell-shield", "spell-thunderwave"],
  5: ["spell-scorching-ray", "spell-shatter"],
  9: ["spell-fireball", "spell-wind-wall"],
  13: ["spell-ice-storm", "spell-wall-of-fire"],
  17: ["spell-cone-of-cold", "spell-wall-of-force"]
} as const;

const artilleristToolsSource = "Artillerist: Tools of the Trade";

export const getArtificerArtilleristDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasArtificerSubclassFeature(character, artilleristSubclassId, 3)
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          artilleristSpellIdsByLevel
        ),
        weaponProficiencyEntries: createArtificerWeaponProficiencyEntries(
          [WEAPON_PROFICIENCY.MARTIAL_RANGED],
          artilleristToolsSource
        ),
        toolProficiencyEntries: createArtificerToolProficiencyEntries(
          [TOOL_PROFICIENCY.WOODCARVERS_TOOLS],
          artilleristToolsSource
        )
      }
    : {};
