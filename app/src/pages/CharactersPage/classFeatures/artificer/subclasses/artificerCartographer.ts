import { TOOL_PROFICIENCY } from "../../../../../types";
import {
  getPreparedSpellIdsByLevel,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import {
  createArtificerToolProficiencyEntries,
  hasArtificerSubclassFeature
} from "./artificerSubclassHelpers";

export const cartographerSubclassId = "artificer-cartographer";

const cartographerSpellIdsByLevel = {
  3: ["spell-faerie-fire", "spell-guiding-bolt", "spell-healing-word"],
  5: ["spell-locate-object", "spell-mind-spike"],
  9: ["spell-call-lightning", "spell-clairvoyance"],
  13: ["spell-banishment", "spell-locate-creature"],
  17: ["spell-scrying", "spell-teleportation-circle"]
} as const;

const cartographerToolsSource = "Cartographer: Tools of the Trade";

export const getArtificerCartographerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasArtificerSubclassFeature(character, cartographerSubclassId, 3)
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          cartographerSpellIdsByLevel
        ),
        toolProficiencyEntries: createArtificerToolProficiencyEntries(
          [TOOL_PROFICIENCY.CALLIGRAPHERS_SUPPLIES, TOOL_PROFICIENCY.CARTOGRAPHERS_TOOLS],
          cartographerToolsSource
        )
      }
    : {};
