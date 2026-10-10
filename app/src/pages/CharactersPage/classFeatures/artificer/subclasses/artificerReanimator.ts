import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import { getClassLevel } from "../../../multiclassState";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getPreparedSpellIdsByLevel, type SubclassRuntimeResolver } from "../../subclassRuntime";
import { getArtificerToolsOfTheTradeToolProficiencyEntries } from "../toolsOfTheTrade";
import { getArtificerReanimatedCompanionAction } from "./artificerReanimatorCompanion";
import {
  hasArtificerReanimatorFeature,
  reanimatorSubclassId,
  transformArtificerReanimatorSpellEntry
} from "./artificerReanimatorSkillSet";

export { reanimatorSubclassId } from "./artificerReanimatorSkillSet";

const reanimatorSpellIdsByLevel = {
  3: ["spell-false-life", "spell-spare-the-dying", "spell-witch-bolt"],
  5: ["spell-blindness-deafness", "spell-enhance-ability"],
  9: ["spell-animate-dead", "spell-lightning-bolt"],
  13: ["spell-blight", "spell-death-ward"],
  17: ["spell-antilife-shell", "spell-raise-dead"]
} as const;

export function collectArtificerReanimatorContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasArtificerReanimatorFeature(character)) return [];
  const companionAction = getArtificerReanimatedCompanionAction(character);
  return [
    {
      source: createSubclassContributionSource({
        id: `${reanimatorSubclassId}-spells`,
        label: "Reanimator Spells",
        entryId: CLASS_FEATURE.REANIMATOR_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        getClassLevel(character, "Artificer"),
        reanimatorSpellIdsByLevel
      )
    },
    {
      source: createSubclassContributionSource({
        id: `${reanimatorSubclassId}-skill-set`,
        label: "Reanimator's Skill Set",
        entryId: CLASS_FEATURE.REANIMATORS_SKILL_SET
      }),
      toolProficiencyEntries: getArtificerToolsOfTheTradeToolProficiencyEntries(character),
      spellTransforms: [
        {
          id: `${reanimatorSubclassId}-jolt-to-life`,
          transform: (spell) => transformArtificerReanimatorSpellEntry(character, spell)
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: `${reanimatorSubclassId}-companion`,
        label: "Reanimated Companion",
        entryId: CLASS_FEATURE.REANIMATED_COMPANION
      }),
      actions: companionAction ? [companionAction] : []
    }
  ];
}

export const getArtificerReanimatorDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectArtificerReanimatorContributions),
    { character: character as Character }
  );
