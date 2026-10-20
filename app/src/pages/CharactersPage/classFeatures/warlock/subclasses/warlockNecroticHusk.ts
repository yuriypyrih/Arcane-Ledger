import { CLASS_FEATURE, DAMAGE_TYPE } from "../../../../../codex/entries/enums";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterWarlockFeatureState
} from "../../../../../types";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import { normalizeDeathSaveTrack } from "../../../deathSaves";
import {
  createSubclassContributionSource,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getClassLevel } from "../../../multiclassState";
import { extractDescriptionSection } from "../../../shared/descriptionSections";
import {
  createCharacterStatusEntry,
  getExhaustionLevel,
  setCharacterExhaustionLevel
} from "../../../statusEntries";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../traits";
import {
  getFeatureDescriptionForCharacter,
  getFeatureDescriptionMetadataForCharacter
} from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import { formOfDreadActionKey, hasActiveFormOfDread } from "./warlockUndeadPatron";

export function hasNecroticHusk(character: SubclassRuntimeCharacter): boolean {
  return getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.NECROTIC_HUSK) !== null;
}

export function normalizeUnholyResuscitationState(
  value: Partial<CharacterWarlockFeatureState>,
  character: SubclassRuntimeCharacter
): Pick<CharacterWarlockFeatureState, "unholyResuscitationUsesExpended"> {
  if (!hasNecroticHusk(character)) return {};
  const expended = Number(value.unholyResuscitationUsesExpended);
  return { unholyResuscitationUsesExpended: Number.isFinite(expended) && expended >= 1 ? 1 : 0 };
}

export function getUnholyResuscitationUsesRemaining(character: SubclassRuntimeCharacter): number {
  if (!hasNecroticHusk(character)) return 0;
  return (
    1 -
    (normalizeUnholyResuscitationState(character.classFeatureState?.warlock ?? {}, character)
      .unholyResuscitationUsesExpended ?? 0)
  );
}

function getNecroticHuskSection(character: SubclassRuntimeCharacter, heading: string): string[] {
  return extractDescriptionSection(
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.NECROTIC_HUSK).filter(
      (entry): entry is string => typeof entry === "string"
    ),
    heading
  );
}

export function getUnholyResuscitationDescriptionAdditions(character: Character) {
  if (!hasNecroticHusk(character)) return [];
  return [
    createFeatureSourcedDescriptionEntries(
      character,
      CLASS_FEATURE.NECROTIC_HUSK,
      getNecroticHuskSection(character, "Unholy Resuscitation.")
    )
  ];
}

export function isUnholyResuscitationRelevant(character: Character): boolean {
  const deathSaves = normalizeDeathSaveTrack(character.deathSaves);
  return (
    hasNecroticHusk(character) &&
    character.currentHitPoints === 0 &&
    deathSaves.resolution !== "instant-death" &&
    deathSaves.failures < 3 &&
    deathSaves.successes < 3
  );
}

export function isUnholyResuscitationAvailable(character: Character): boolean {
  return (
    isUnholyResuscitationRelevant(character) && getUnholyResuscitationUsesRemaining(character) > 0
  );
}

export function applyUnholyResuscitation(character: Character): Character {
  if (!isUnholyResuscitationAvailable(character)) return character;
  const nextCharacter = spendClassResource(
    character,
    {
      stateKey: "warlock",
      counter: "unholyResuscitationUsesExpended",
      total: 1,
      remaining: getUnholyResuscitationUsesRemaining(character)
    },
    1
  );
  return reconcileCharacterStatusConsequences({
    ...nextCharacter,
    currentHitPoints: Math.min(
      getEffectiveHitPointMaximumForCharacter(nextCharacter),
      2 * getClassLevel(nextCharacter, "Warlock")
    ),
    deathSaves: { successes: 0, failures: 0 },
    statusEntries: setCharacterExhaustionLevel(
      nextCharacter.statusEntries,
      (getExhaustionLevel(nextCharacter.statusEntries) ?? 0) + 1
    )
  });
}

export function restoreUnholyResuscitationOnRest(character: Character): Character {
  if (
    !hasNecroticHusk(character) ||
    !character.classFeatureState?.warlock?.unholyResuscitationUsesExpended
  ) {
    return character;
  }
  return replaceClassFeatureState(character, "warlock", {
    ...character.classFeatureState?.warlock,
    unholyResuscitationUsesExpended: 0
  });
}

export function collectNecroticHuskContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasNecroticHusk(character)) return [];
  const description = getNecroticHuskSection(character, "Necrotic Resilience.");
  return [
    {
      source: createSubclassContributionSource({
        id: "warlock-undead-necrotic-husk",
        label: "Necrotic Husk",
        entryId: CLASS_FEATURE.NECROTIC_HUSK
      }),
      statuses: [
        createCharacterStatusEntry({
          id: "feature-warlock-undead-necrotic-resilience",
          sourceId: "feature-warlock-undead-necrotic-resilience",
          group: hasActiveFormOfDread(character)
            ? STATUS_ENTRY_GROUP.IMMUNITIES
            : STATUS_ENTRY_GROUP.RESISTANCES,
          value: DAMAGE_TYPE.NECROTIC,
          source: "Necrotic Husk",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: { kind: STATUS_DURATION_KIND.INFINITE },
          description: description.join("\n")
        })
      ],
      featureActionTransforms: [
        {
          id: "warlock-undead-necrotic-resilience-description",
          transform: (action) =>
            action.key === formOfDreadActionKey
              ? appendFeatureSourcedDescriptionAddition(
                  action,
                  character,
                  CLASS_FEATURE.NECROTIC_HUSK,
                  description
                )
              : action
        }
      ]
    }
  ];
}
