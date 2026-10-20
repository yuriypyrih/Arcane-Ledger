import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import {
  SENSE,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterSorcererFeatureState
} from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { createFeatureSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import { normalizeDeathSaveTrack } from "../../../deathSaves";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getClassLevel } from "../../../multiclassState";
import { extractDescriptionSection } from "../../../shared/descriptionSections";
import { createCharacterStatusEntry } from "../../../statusEntries";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../traits";
import {
  getFeatureDescriptionForCharacter,
  getFeatureDescriptionMetadataForCharacter
} from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import { collectShadowBeastsContributions } from "./sorcererShadowBeasts";
import { collectShadowFormContributions, normalizeUmbralFormState } from "./sorcererShadowForm";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeCharacter,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";

export const shadowSorcerySubclassId = "sorcerer-shadow-sorcery";
const shadowSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Bane", "Darkness", "Inflict Wounds", "Pass Without Trace"]),
  5: resolveSpellIdsByName(["Hunger of Hadar", "Nondetection"]),
  7: resolveSpellIdsByName(["Greater Invisibility", "Phantasmal Killer"]),
  9: resolveSpellIdsByName(["Contagion", "Creation"])
};

export function hasSorcererPowerOfShadow(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.POWER_OF_SHADOW) !== null
  );
}

export function normalizeSorcererShadowState(
  record: Partial<CharacterSorcererFeatureState>,
  character: SubclassRuntimeCharacter
): Pick<
  CharacterSorcererFeatureState,
  "strengthOfTheGraveUsesExpended" | "umbralFormUsesExpended"
> {
  if (!hasSorcererPowerOfShadow(character)) return {};
  const expended = Number(record.strengthOfTheGraveUsesExpended);
  return {
    strengthOfTheGraveUsesExpended: Number.isFinite(expended) && expended >= 1 ? 1 : 0,
    ...normalizeUmbralFormState(record, character)
  };
}

export function getShadowStrengthOfTheGraveUsesRemaining(
  character: SubclassRuntimeCharacter
): number {
  if (!hasSorcererPowerOfShadow(character)) return 0;
  return (
    1 -
    (normalizeSorcererShadowState(character.classFeatureState?.sorcerer ?? {}, character)
      .strengthOfTheGraveUsesExpended ?? 0)
  );
}

export function getShadowStrengthOfTheGraveDescriptionAdditions(character: Character) {
  if (!hasSorcererPowerOfShadow(character)) return [];
  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.POWER_OF_SHADOW);
  return [
    createFeatureSourcedDescriptionEntries(
      character,
      CLASS_FEATURE.POWER_OF_SHADOW,
      extractDescriptionSection(
        description.filter((entry): entry is string => typeof entry === "string"),
        "Strength of the Grave."
      )
    )
  ];
}

export function isShadowStrengthOfTheGraveRelevant(character: Character): boolean {
  const deathSaves = normalizeDeathSaveTrack(character.deathSaves);
  return (
    hasSorcererPowerOfShadow(character) &&
    character.currentHitPoints === 0 &&
    deathSaves.resolution !== "instant-death" &&
    deathSaves.failures < 3 &&
    deathSaves.successes < 3
  );
}

export function isShadowStrengthOfTheGraveAvailable(character: Character): boolean {
  return (
    isShadowStrengthOfTheGraveRelevant(character) &&
    getShadowStrengthOfTheGraveUsesRemaining(character) > 0
  );
}

export function applyShadowStrengthOfTheGrave(character: Character): Character {
  if (!isShadowStrengthOfTheGraveAvailable(character)) return character;
  const nextCharacter = spendClassResource(
    character,
    {
      stateKey: "sorcerer",
      counter: "strengthOfTheGraveUsesExpended",
      total: 1,
      remaining: getShadowStrengthOfTheGraveUsesRemaining(character)
    },
    1
  );
  return reconcileCharacterStatusConsequences({
    ...nextCharacter,
    currentHitPoints: Math.min(
      getEffectiveHitPointMaximumForCharacter(nextCharacter),
      Math.max(
        0,
        getClassLevel(nextCharacter, "Sorcerer") +
          getAbilityModifierForCharacter(nextCharacter, "CHA")
      )
    ),
    deathSaves: { successes: 0, failures: 0 }
  });
}

export function restoreShadowStrengthOfTheGraveOnLongRest(character: Character): Character {
  if (
    !hasSorcererPowerOfShadow(character) ||
    !character.classFeatureState?.sorcerer?.strengthOfTheGraveUsesExpended
  ) {
    return character;
  }
  return replaceClassFeatureState(character, "sorcerer", {
    ...character.classFeatureState?.sorcerer,
    strengthOfTheGraveUsesExpended: 0
  });
}

function collectShadowSorceryContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasSorcererPowerOfShadow(character)) return [];
  return [
    ...collectShadowBeastsContributions(character),
    ...collectShadowFormContributions(character),
    {
      source: createSubclassContributionSource({
        id: "sorcerer-shadow-spells",
        label: "Shadow Spells",
        entryId: CLASS_FEATURE.SHADOW_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        getClassLevel(character, "Sorcerer"),
        shadowSpellIdsByLevel
      )
    },
    {
      source: createSubclassContributionSource({
        id: "sorcerer-power-of-shadow",
        label: "Power of Shadow",
        entryId: CLASS_FEATURE.POWER_OF_SHADOW
      }),
      statuses: [
        { sense: SENSE.DARKVISION, rangeFeet: 120, id: "darkvision" },
        { sense: SENSE.BLINDSIGHT, rangeFeet: 10, id: "blindsight" }
      ].map(({ sense, rangeFeet, id }) =>
        createCharacterStatusEntry({
          id: `feature-sorcerer-power-of-shadow-${id}`,
          sourceId: `feature-sorcerer-power-of-shadow-${id}`,
          group: STATUS_ENTRY_GROUP.SENSES,
          value: sense,
          source: "Power of Shadow",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          rangeFeet
        })
      )
    }
  ];
}

export const getSorcererShadowSorceryDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectShadowSorceryContributions),
    { character: character as Character }
  );
