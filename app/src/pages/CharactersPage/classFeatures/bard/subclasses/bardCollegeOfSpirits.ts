import type { Character } from "../../../../../types";
import {
  PROFICIENCY_SOURCE,
  PROFICIENCY_OVERRIDE_POLICY,
  PROF_LEVEL,
  TOOL_PROFICIENCY
} from "../../../../../types";
import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import {
  chooseSpiritActionKey,
  collegeOfSpiritsSubclassId,
  getBardSpiritsState,
  hasBardSpirits
} from "./bardCollegeOfSpiritsState";
import {
  spiritGuardiansSpellId,
  transformBardSpiritsEmpoweredSpellEntry
} from "./bardCollegeOfSpiritsEmpowered";

export function collectBardCollegeOfSpiritsContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasBardSpirits(character)) return [];
  const state = getBardSpiritsState(character);
  const description = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.SPIRITS_FROM_BEYOND
  );
  const source = (feature: CLASS_FEATURE) =>
    createSubclassContributionSource({
      id: `${collegeOfSpiritsSubclassId}-${feature}`,
      label:
        feature === CLASS_FEATURE.CHANNELER
          ? "Channeler"
          : feature === CLASS_FEATURE.EMPOWERED_CHANNELING
            ? "Empowered Channeling"
            : "Spirits from Beyond",
      entryId: feature
    });
  const createAction = (
    key: string,
    name: string,
    economyType: FeatureActionCard["economyType"],
    breakdown: string,
    disabledReason?: string
  ): FeatureActionCard => ({
    key,
    name,
    sourceFeature: CLASS_FEATURE.SPIRITS_FROM_BEYOND,
    summary: breakdown,
    detail: "Channel spirits from beyond.",
    breakdown,
    economyType,
    actionCategory: ACTION_CATEGORY.FEATURE,
    description,
    drawer: { kind: "custom-form", formKind: "bard-spirits", description },
    execute: { kind: "custom-form", formKind: "bard-spirits" },
    disabled: !!disabledReason,
    disabledReason
  });
  const actions: FeatureActionCard[] = [];
  if (state.pendingSpiritRolls?.length)
    actions.push(
      createAction(
        chooseSpiritActionKey,
        "Choose Channeled Spirit",
        ECONOMY_TYPE.FREE,
        `${state.pendingSpiritRolls.length} pending spirit ${state.pendingSpiritRolls.length === 1 ? "roll" : "rolls"}`
      )
    );
  return [
    {
      source: source(CLASS_FEATURE.CHANNELER),
      alwaysPreparedSpellIds: ["spell-guidance"],
      toolProficiencyEntries: [
        {
          source: PROFICIENCY_SOURCE.CLASS,
          sourceStr: "College of Spirits: Channeler",
          proficiency: TOOL_PROFICIENCY.GAMING_SET_PLAYING_CARDS,
          proficiencyLevel: PROF_LEVEL.PROFICIENT,
          overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
        }
      ],
      spellTransforms: [
        {
          id: "bard-guiding-whispers",
          transform: (spell) =>
            spell.id === "spell-guidance"
              ? appendFeatureSourcedDescriptionAddition(
                  { ...spell, range: "60 feet" },
                  character,
                  CLASS_FEATURE.CHANNELER,
                  getFeatureDescriptionForCharacter(character, CLASS_FEATURE.CHANNELER).slice(0, 1),
                  "Guiding Whispers"
                )
              : spell
        }
      ]
    },
    {
      source: source(CLASS_FEATURE.SPIRITS_FROM_BEYOND),
      actions,
      featureActionTransforms: [
        {
          id: "bard-spirits-inspiration",
          transform: (action) => {
            if (action.key !== "bard-bardic-inspiration") return action;
            let result = appendFeatureSourcedDescriptionAddition(
              action,
              character,
              CLASS_FEATURE.SPIRITS_FROM_BEYOND,
              description,
              "Spirits from Beyond"
            );
            if (hasBardSpirits(character, 14))
              result = appendFeatureSourcedDescriptionAddition(
                result,
                character,
                CLASS_FEATURE.MYSTICAL_CONNECTION,
                getFeatureDescriptionForCharacter(character, CLASS_FEATURE.MYSTICAL_CONNECTION),
                "Mystical Connection"
              );
            return result;
          }
        }
      ]
    },
    ...(hasBardSpirits(character, 6)
      ? [
          {
            source: source(CLASS_FEATURE.EMPOWERED_CHANNELING),
            alwaysPreparedSpellIds: [spiritGuardiansSpellId],
            spellTransforms: [
              {
                id: "bard-empowered-channeling",
                transform: (spell) => transformBardSpiritsEmpoweredSpellEntry(character, spell)
              }
            ]
          } satisfies FeatureContributionSpec
        ]
      : [])
  ];
}

export const getBardCollegeOfSpiritsDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectBardCollegeOfSpiritsContributions),
    { character: character as Character }
  );
