import { getPreparedSpellIdsByLevel, type SubclassRuntimeResolver } from "../../subclassRuntime";
import { getArtificerToolsOfTheTradeToolProficiencyEntries } from "../toolsOfTheTrade";
import {
  getArtificerAlchemistAlchemicalSavantSpellDamageBonuses,
  transformArtificerAlchemistAlchemicalSavantSpellEntry
} from "./artificerAlchemistAlchemicalSavant";
import {
  getArtificerAlchemistChemicalMasteryStatusEntries,
  getArtificerConjuredCauldronAction,
  transformArtificerAlchemistChemicalMasterySpellEntry
} from "./artificerAlchemistChemicalMastery";
import { getArtificerExperimentalElixirAction } from "./artificerAlchemistExperimentalElixir";
import { getArtificerRestorativeReagentsAction } from "./artificerAlchemistRestorativeReagents";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";

export const alchemistSubclassId = "artificer-alchemist";

const alchemistSpellIdsByLevel = {
  3: ["spell-healing-word", "spell-ray-of-sickness"],
  5: ["spell-flaming-sphere", "spell-acid-arrow"],
  9: ["spell-gaseous-form", "spell-mass-healing-word"],
  13: ["spell-death-ward", "spell-vitriolic-sphere"],
  17: ["spell-cloudkill", "spell-raise-dead"]
} as const;

export const getArtificerAlchemistDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (!hasArtificerSubclassFeature(character, alchemistSubclassId, 3)) {
    return {};
  }

  const experimentalElixirAction = getArtificerExperimentalElixirAction(character);
  const restorativeReagentsAction = getArtificerRestorativeReagentsAction(character);
  const conjuredCauldronAction = getArtificerConjuredCauldronAction(character);

  return {
    alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
      character.level ?? 0,
      alchemistSpellIdsByLevel
    ),
    featureActions: [
      experimentalElixirAction,
      restorativeReagentsAction,
      conjuredCauldronAction
    ].filter(
      (action) => action !== null
    ),
    getSpellDamageBonuses: (context) =>
      getArtificerAlchemistAlchemicalSavantSpellDamageBonuses(character, context),
    transformSpellEntry: (spell) =>
      transformArtificerAlchemistChemicalMasterySpellEntry(
        character,
        transformArtificerAlchemistAlchemicalSavantSpellEntry(character, spell)
      ),
    derivedStatusEntries: getArtificerAlchemistChemicalMasteryStatusEntries(character),
    toolProficiencyEntries: getArtificerToolsOfTheTradeToolProficiencyEntries(character)
  };
};
