import { CLASS_FEATURE } from "../../../../../codex/entries";
import type { Character } from "../../../../../types";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
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

function compactActions<TAction>(actions: Array<TAction | null>): TAction[] {
  return actions.filter((action): action is TAction => action !== null);
}

export function collectArtificerAlchemistContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasArtificerSubclassFeature(character, alchemistSubclassId, 3)) {
    return [];
  }

  const experimentalElixirAction = getArtificerExperimentalElixirAction(character);
  const restorativeReagentsAction = getArtificerRestorativeReagentsAction(character);
  const conjuredCauldronAction = getArtificerConjuredCauldronAction(character);

  return [
    {
      source: createSubclassContributionSource({
        id: `${alchemistSubclassId}-tools-of-the-trade`,
        label: "Tools of the Trade",
        entryId: CLASS_FEATURE.TOOLS_OF_THE_TRADE
      }),
      toolProficiencyEntries: getArtificerToolsOfTheTradeToolProficiencyEntries(character)
    },
    {
      source: createSubclassContributionSource({
        id: `${alchemistSubclassId}-alchemist-spells`,
        label: "Alchemist Spells",
        entryId: CLASS_FEATURE.ALCHEMIST_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        character.level ?? 0,
        alchemistSpellIdsByLevel
      )
    },
    {
      source: createSubclassContributionSource({
        id: `${alchemistSubclassId}-experimental-elixir`,
        label: "Experimental Elixir",
        entryId: CLASS_FEATURE.EXPERIMENTAL_ELIXIR
      }),
      actions: compactActions([experimentalElixirAction])
    },
    {
      source: createSubclassContributionSource({
        id: `${alchemistSubclassId}-alchemical-savant`,
        label: "Alchemical Savant",
        entryId: CLASS_FEATURE.ALCHEMICAL_SAVANT
      }),
      spellDamageBonuses: [
        {
          id: "artificer-alchemist-alchemical-savant-spell-damage",
          getBonuses: (context) =>
            getArtificerAlchemistAlchemicalSavantSpellDamageBonuses(character, context)
        }
      ],
      spellTransforms: [
        {
          id: "artificer-alchemist-alchemical-savant-spell-transform",
          transform: (spell) =>
            transformArtificerAlchemistAlchemicalSavantSpellEntry(character, spell)
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: `${alchemistSubclassId}-restorative-reagents`,
        label: "Restorative Reagents",
        entryId: CLASS_FEATURE.RESTORATIVE_REAGENTS
      }),
      actions: compactActions([restorativeReagentsAction])
    },
    {
      source: createSubclassContributionSource({
        id: `${alchemistSubclassId}-chemical-mastery`,
        label: "Chemical Mastery",
        entryId: CLASS_FEATURE.CHEMICAL_MASTERY
      }),
      actions: compactActions([conjuredCauldronAction]),
      statuses: getArtificerAlchemistChemicalMasteryStatusEntries(character),
      spellTransforms: [
        {
          id: "artificer-alchemist-chemical-mastery-spell-transform",
          transform: (spell) =>
            transformArtificerAlchemistChemicalMasterySpellEntry(character, spell)
        }
      ]
    }
  ];
}

export const getArtificerAlchemistDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  return projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectArtificerAlchemistContributions(character)),
    {
      character: character as Character
    }
  );
};
