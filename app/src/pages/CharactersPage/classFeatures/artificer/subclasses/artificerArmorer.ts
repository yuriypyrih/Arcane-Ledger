import { ARMOR_PROFICIENCY, TOOL_PROFICIENCY } from "../../../../../types";
import {
  getPreparedSpellIdsByLevel,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import {
  createArtificerArmorProficiencyEntries,
  createArtificerToolProficiencyEntries,
  hasArtificerSubclassFeature
} from "./artificerSubclassHelpers";

export const armorerSubclassId = "artificer-armorer";

const armorerSpellIdsByLevel = {
  3: ["spell-magic-missile", "spell-thunderwave"],
  5: ["spell-mirror-image", "spell-shatter"],
  9: ["spell-hypnotic-pattern", "spell-lightning-bolt"],
  13: ["spell-fire-shield", "spell-greater-invisibility"],
  17: ["spell-passwall", "spell-wall-of-force"]
} as const;

const armorerToolsSource = "Armorer: Tools of the Trade";

export const getArtificerArmorerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasArtificerSubclassFeature(character, armorerSubclassId, 3)
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          armorerSpellIdsByLevel
        ),
        armorProficiencyEntries: createArtificerArmorProficiencyEntries(
          [ARMOR_PROFICIENCY.HEAVY],
          armorerToolsSource
        ),
        toolProficiencyEntries: createArtificerToolProficiencyEntries(
          [TOOL_PROFICIENCY.SMITHS_TOOLKIT],
          armorerToolsSource
        )
      }
    : {};
