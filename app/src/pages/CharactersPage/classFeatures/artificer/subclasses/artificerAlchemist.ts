import { TOOL_PROFICIENCY } from "../../../../../types";
import {
  getPreparedSpellIdsByLevel,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import {
  createArtificerToolProficiencyEntries,
  hasArtificerSubclassFeature
} from "./artificerSubclassHelpers";

export const alchemistSubclassId = "artificer-alchemist";

const alchemistSpellIdsByLevel = {
  3: ["spell-healing-word", "spell-ray-of-sickness"],
  5: ["spell-flaming-sphere", "spell-acid-arrow"],
  9: ["spell-gaseous-form", "spell-mass-healing-word"],
  13: ["spell-death-ward", "spell-vitriolic-sphere"],
  17: ["spell-cloudkill", "spell-raise-dead"]
} as const;

const alchemistToolsSource = "Alchemist: Tools of the Trade";

export const getArtificerAlchemistDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasArtificerSubclassFeature(character, alchemistSubclassId, 3)
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          alchemistSpellIdsByLevel
        ),
        toolProficiencyEntries: createArtificerToolProficiencyEntries(
          [TOOL_PROFICIENCY.ALCHEMISTS_SUPPLIES, TOOL_PROFICIENCY.HERBALISM_KIT],
          alchemistToolsSource
        )
      }
    : {};
