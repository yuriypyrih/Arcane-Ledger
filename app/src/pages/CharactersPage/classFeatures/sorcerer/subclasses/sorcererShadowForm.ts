import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import {
  DAMAGE_TYPE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterSorcererFeatureState,
  type CharacterStatusEntry
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getAllDamageButStatusValue } from "../../../damageCoverageStatuses";
import {
  createSubclassContributionSource,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { extractDescriptionSection } from "../../../shared/descriptionSections";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import {
  getFeatureDescriptionForCharacter,
  getFeatureDescriptionMetadataForCharacter
} from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import {
  createDefaultFeatureActionDescription,
  type SubclassRuntimeCharacter
} from "../../subclassRuntime";
import {
  getInnateSorceryActivationSorceryPointCost,
  getSorceryPointsRemaining,
  hasActiveInnateSorcery,
  innateSorceryActionKey,
  spendSorceryPoints
} from "../sorcerer";

export const shadowWalkActionKey = "sorcerer-shadow-walk";
export const umbralFormStatusSourceId = "feature-sorcerer-umbral-form";
export const umbralFormSorceryPointCost = 6;
export const umbralFormOptions = [
  { key: "incorporeal-movement", label: "Incorporeal Movement" },
  { key: "shadow-resilience", label: "Shadow Resilience" }
] as const;
export type UmbralFormOption = (typeof umbralFormOptions)[number]["key"];
const umbralFormName = "Umbral Form";

export function hasShadowWalk(character: SubclassRuntimeCharacter): boolean {
  return getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.SHADOW_WALK) !== null;
}

export function activateShadowWalk(character: Character): Character {
  // Position and lighting are resolved by the player; the shared transition spends the Bonus Action.
  return hasShadowWalk(character) ? { ...character } : character;
}

export function hasUmbralForm(character: SubclassRuntimeCharacter): boolean {
  return getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.UMBRAL_FORM) !== null;
}

export function normalizeUmbralFormState(
  record: Partial<CharacterSorcererFeatureState>,
  character: SubclassRuntimeCharacter
): Pick<CharacterSorcererFeatureState, "umbralFormUsesExpended"> {
  if (!hasUmbralForm(character)) return {};
  const expended = Number(record.umbralFormUsesExpended);
  return { umbralFormUsesExpended: Number.isFinite(expended) && expended >= 1 ? 1 : 0 };
}

export function getUmbralFormUsesRemaining(character: SubclassRuntimeCharacter): number {
  if (!hasUmbralForm(character)) return 0;
  return (
    1 -
    (normalizeUmbralFormState(character.classFeatureState?.sorcerer ?? {}, character)
      .umbralFormUsesExpended ?? 0)
  );
}

export function getUmbralFormActivationSorceryPointCost(
  character: SubclassRuntimeCharacter
): number {
  return getUmbralFormUsesRemaining(character) > 0 ? 0 : umbralFormSorceryPointCost;
}

export function getUmbralFormActivationDisabledReason(character: Character): string | null {
  if (!hasUmbralForm(character)) return "Requires Umbral Form.";
  const cost =
    getInnateSorceryActivationSorceryPointCost(character) +
    getUmbralFormActivationSorceryPointCost(character);
  return getSorceryPointsRemaining(character) < cost
    ? `Requires ${cost} Sorcery Points to activate Innate Sorcery with Umbral Form.`
    : null;
}

export function isUmbralFormStatusEntry(entry: Pick<CharacterStatusEntry, "sourceId">): boolean {
  return entry.sourceId === umbralFormStatusSourceId;
}

export function activateUmbralForm(character: Character, option: UmbralFormOption): Character {
  const selection = umbralFormOptions.find((entry) => entry.key === option);
  if (!selection || !hasUmbralForm(character) || !hasActiveInnateSorcery(character))
    return character;
  const usesRemaining = getUmbralFormUsesRemaining(character);
  const nextCharacter =
    usesRemaining > 0
      ? spendClassResource(
          character,
          {
            stateKey: "sorcerer",
            counter: "umbralFormUsesExpended",
            total: 1,
            remaining: usesRemaining
          },
          1
        )
      : spendSorceryPoints(character, umbralFormSorceryPointCost);
  if (nextCharacter === character) return character;
  const description = extractDescriptionSection(
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.UMBRAL_FORM).filter(
      (entry): entry is string => typeof entry === "string"
    ),
    `${selection.label}.`
  );
  return {
    ...nextCharacter,
    statusEntries: [
      ...normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
        (entry) =>
          entry.sourceId !== umbralFormStatusSourceId &&
          entry.sourceId !== `${umbralFormStatusSourceId}-resistance`
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: umbralFormName,
        source: umbralFormName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        sourceId: umbralFormStatusSourceId,
        description: description.join("\n"),
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: "Innate Sorcery"
        }
      }),
      ...(option === "shadow-resilience"
        ? [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.RADIANT].map((damageType) =>
            createCharacterStatusEntry({
              group: STATUS_ENTRY_GROUP.RESISTANCES,
              value: getAllDamageButStatusValue(damageType),
              source: umbralFormName,
              sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
              sourceId: `${umbralFormStatusSourceId}-resistance`,
              description: description.join("\n"),
              duration: {
                kind: STATUS_DURATION_KIND.LINKED,
                linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
                linkedValue: umbralFormName
              }
            })
          )
        : [])
    ]
  };
}

export function restoreUmbralFormOnLongRest(character: Character): Character {
  if (!hasUmbralForm(character) || !character.classFeatureState?.sorcerer?.umbralFormUsesExpended) {
    return character;
  }
  return replaceClassFeatureState(character, "sorcerer", {
    ...character.classFeatureState?.sorcerer,
    umbralFormUsesExpended: 0
  });
}

export function collectShadowFormContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  const contributions: FeatureContributionSpec[] = [];
  if (hasShadowWalk(character)) {
    const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.SHADOW_WALK);
    contributions.push({
      source: createSubclassContributionSource({
        id: shadowWalkActionKey,
        label: "Shadow Walk",
        entryId: CLASS_FEATURE.SHADOW_WALK
      }),
      actions: [
        {
          key: shadowWalkActionKey,
          name: "Shadow Walk",
          sourceFeature: CLASS_FEATURE.SHADOW_WALK,
          summary: "Teleport between shadows.",
          detail: "Teleport up to 120 feet while in Dim Light or Darkness.",
          breakdown: "Teleport up to 120 ft.",
          economyType: ECONOMY_TYPE.BONUS_ACTION,
          actionCategory: ACTION_CATEGORY.FEATURE,
          description,
          drawer: { kind: "confirm", description },
          execute: { kind: "activate" }
        }
      ]
    });
  }
  if (hasUmbralForm(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "sorcerer-umbral-form",
        label: umbralFormName,
        entryId: CLASS_FEATURE.UMBRAL_FORM
      }),
      featureActionTransforms: [
        {
          id: "sorcerer-umbral-form-description",
          transform: (action) =>
            action.key === innateSorceryActionKey
              ? appendFeatureSourcedDescriptionAddition(
                  {
                    ...action,
                    description: action.description?.length
                      ? [...action.description]
                      : createDefaultFeatureActionDescription(action)
                  },
                  character,
                  CLASS_FEATURE.UMBRAL_FORM,
                  getFeatureDescriptionForCharacter(character, CLASS_FEATURE.UMBRAL_FORM)
                )
              : action
        }
      ]
    });
  }
  return contributions;
}
