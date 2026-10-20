import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterRogueFeatureState
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  createSubclassContributionSource,
  type FeatureContributionSpec
} from "../../../featureContributions";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import {
  getFeatureDescriptionForCharacter,
  getFeatureDescriptionMetadataForCharacter
} from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import {
  getPhantomSoulTrinketsMaximum,
  getPhantomSoulTrinketsRemaining,
  spendPhantomSoulTrinket
} from "./roguePhantomTokens";

export const phantomGhostWalkActionKey = "rogue-phantom-ghost-walk";
export const phantomGhostWalkStatusSourceId = "feature-rogue-phantom-ghost-walk";
const ghostWalkName = "Ghost Walk";

export function hasPhantomGhostWalk(character: SubclassRuntimeCharacter): boolean {
  return getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.GHOST_WALK) !== null;
}

export function normalizePhantomGhostWalkState(
  record: Partial<CharacterRogueFeatureState>,
  character: SubclassRuntimeCharacter
): Pick<CharacterRogueFeatureState, "phantomGhostWalkUsesExpended"> {
  if (!hasPhantomGhostWalk(character)) return {};
  const expended = Number(record.phantomGhostWalkUsesExpended);
  return { phantomGhostWalkUsesExpended: Number.isFinite(expended) && expended >= 1 ? 1 : 0 };
}

export function getPhantomGhostWalkUsesRemaining(character: SubclassRuntimeCharacter): number {
  if (!hasPhantomGhostWalk(character)) return 0;
  return (
    1 -
    (normalizePhantomGhostWalkState(character.classFeatureState?.rogue ?? {}, character)
      .phantomGhostWalkUsesExpended ?? 0)
  );
}

export function hasActivePhantomGhostWalk(character: SubclassRuntimeCharacter): boolean {
  return (
    hasPhantomGhostWalk(character) &&
    normalizeCharacterStatusEntries(character.statusEntries).some(
      (entry) => !entry.disabled && entry.sourceId === phantomGhostWalkStatusSourceId
    )
  );
}

export function activatePhantomGhostWalk(character: Character): Character {
  if (!hasPhantomGhostWalk(character)) return character;
  const usesRemaining = getPhantomGhostWalkUsesRemaining(character);
  const nextCharacter =
    usesRemaining > 0
      ? spendClassResource(
          character,
          {
            stateKey: "rogue",
            counter: "phantomGhostWalkUsesExpended",
            total: 1,
            remaining: usesRemaining
          },
          1
        )
      : spendPhantomSoulTrinket(character);
  if (nextCharacter === character) return character;

  return {
    ...nextCharacter,
    statusEntries: [
      ...normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
        (entry) => entry.sourceId !== phantomGhostWalkStatusSourceId
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: ghostWalkName,
        source: ghostWalkName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        sourceId: phantomGhostWalkStatusSourceId,
        duration: { kind: STATUS_DURATION_KIND.MINUTES, amount: 10 }
      })
    ]
  };
}

export function restorePhantomGhostWalkOnLongRest(character: Character): Character {
  if (
    !hasPhantomGhostWalk(character) ||
    !character.classFeatureState?.rogue?.phantomGhostWalkUsesExpended
  ) {
    return character;
  }
  return replaceClassFeatureState(character, "rogue", {
    ...character.classFeatureState?.rogue,
    phantomGhostWalkUsesExpended: 0
  });
}

export function collectPhantomGhostWalkContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasPhantomGhostWalk(character)) return [];
  const usesRemaining = getPhantomGhostWalkUsesRemaining(character);
  const trinketsRemaining = getPhantomSoulTrinketsRemaining(character);
  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.GHOST_WALK);
  const isActive = hasActivePhantomGhostWalk(character);
  const fallbackCost = createFeatureActionCardCost({
    amountText: "1",
    icon: "ghost"
  });
  const disabledReason =
    usesRemaining <= 0 && trinketsRemaining <= 0
      ? "No Ghost Walk charge or Soul Trinket remaining."
      : undefined;

  return [
    {
      source: createSubclassContributionSource({
        id: phantomGhostWalkActionKey,
        label: ghostWalkName,
        entryId: CLASS_FEATURE.GHOST_WALK
      }),
      actions: [
        {
          key: phantomGhostWalkActionKey,
          name: ghostWalkName,
          sourceFeature: CLASS_FEATURE.GHOST_WALK,
          summary: "Become spectral for 10 minutes.",
          detail: "Gain a Fly Speed of 10 feet while Ghost Walk persists.",
          breakdown: "Fly 10 ft. | 10 minutes",
          economyType: ECONOMY_TYPE.BONUS_ACTION,
          actionCategory: ACTION_CATEGORY.FEATURE,
          usesRemaining,
          usesTotal: 1,
          cardUsage: createChargesOrResourceCardUsage(usesRemaining, 1, fallbackCost),
          headerTags: createChargesAndUsageHeaderTags(
            usesRemaining,
            1,
            fallbackCost,
            trinketsRemaining,
            getPhantomSoulTrinketsMaximum(character),
            { icon: "ghost" },
            "Long Rest",
            { isFallback: true }
          ),
          description,
          drawer: { kind: "confirm", description },
          execute: { kind: "activate" },
          isActive,
          disabled: Boolean(disabledReason),
          disabledReason
        }
      ],
      speedBonuses: isActive
        ? [{ label: ghostWalkName, movementType: "fly", value: 0, setTotal: 10, hover: true }]
        : []
    }
  ];
}
