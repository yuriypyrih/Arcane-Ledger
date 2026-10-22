import { CLASS_FEATURE, REACTION } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { isCharacterBloodied } from "../../../bloodied";
import {
  createSubclassContributionSource,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getCharacterSpellSlotPools, setSlotPoolExpended } from "../../../multiclassSpellcasting";
import { getClassLevel } from "../../../multiclassState";
import { swapTemporaryHitPointsAssignment } from "../../../shared/temporaryHitPoints";
import { extractDescriptionSection } from "../../../shared/descriptionSections";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../traits";
import { createChargesCardUsage, createChargesHeaderTag } from "../../cardUsage";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";

export const harvestUndeadReactionId = "reaction-wizard-harvest-undead";
export const extinguishUndeadReactionId = "reaction-wizard-extinguish-undead";
export const bolsterUndeadActionKey = "wizard-bolster-undead";

export function getHarvestUndeadBlockedReason(character: SubclassRuntimeCharacter): string | null {
  if (!getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.HARVEST_UNDEAD)) {
    return "Harvest Undead is not unlocked.";
  }
  return isCharacterBloodied(character) ? null : "You must be Bloodied and above 0 HP.";
}

export function activateHarvestUndead(character: Character): Character {
  if (getHarvestUndeadBlockedReason(character)) return character;
  return reconcileCharacterStatusConsequences({
    ...character,
    currentHitPoints: Math.min(
      getEffectiveHitPointMaximumForCharacter(character),
      character.currentHitPoints + getClassLevel(character, "Wizard")
    )
  });
}

export function hasDeathsMaster(character: SubclassRuntimeCharacter): boolean {
  return getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.DEATHS_MASTER) !== null;
}

export function normalizeBolsterUndeadUsesExpended(
  value: unknown,
  character: SubclassRuntimeCharacter
): number {
  const expended = Number(value);
  return hasDeathsMaster(character) && Number.isFinite(expended)
    ? Math.max(0, Math.min(1, Math.floor(expended)))
    : 0;
}

export function getBolsterUndeadUsesRemaining(character: SubclassRuntimeCharacter): number {
  return hasDeathsMaster(character)
    ? 1 -
        normalizeBolsterUndeadUsesExpended(
          character.classFeatureState?.wizard?.bolsterUndeadUsesExpended,
          character
        )
    : 0;
}

function isUndeadCompanion(companion: { type: string }): boolean {
  return companion.type.trim().toLowerCase() === "undead";
}

function getDeathsMasterSection(character: SubclassRuntimeCharacter, heading: string) {
  const description =
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.DEATHS_MASTER)
      ?.description ?? [];
  return extractDescriptionSection(
    description.filter((entry): entry is string => typeof entry === "string"),
    heading
  );
}

export function getBolsterUndeadAction(
  character: SubclassRuntimeCharacter
): FeatureActionCard | null {
  if (!hasDeathsMaster(character)) return null;
  const usesRemaining = getBolsterUndeadUsesRemaining(character);
  const description = getDeathsMasterSection(character, "Bolster Undead.");
  const disabledReason =
    usesRemaining <= 0
      ? "Bolster Undead is expended until your next Long Rest."
      : !character.companions?.some(isUndeadCompanion)
        ? "You have no Undead companions."
        : undefined;
  return {
    key: bolsterUndeadActionKey,
    name: "Bolster Undead",
    sourceFeature: CLASS_FEATURE.DEATHS_MASTER,
    summary: "Grant temporary HP to your Undead companions.",
    detail: "Regain this use after a Long Rest.",
    breakdown: `Grant ${getClassLevel(character, "Wizard")} temporary HP`,
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal: 1,
    cardUsage: createChargesCardUsage(usesRemaining, 1),
    headerTags: [createChargesHeaderTag(usesRemaining, 1)],
    description,
    disabled: Boolean(disabledReason),
    disabledReason,
    drawer: { kind: "confirm", description, blockedReason: disabledReason },
    execute: { kind: "activate" }
  };
}

export function activateBolsterUndead(character: Character): Character {
  const action = getBolsterUndeadAction(character);
  if (!action || action.disabled) return character;
  const next = spendClassResource(
    character,
    {
      stateKey: "wizard",
      counter: "bolsterUndeadUsesExpended",
      total: 1,
      remaining: getBolsterUndeadUsesRemaining(character)
    },
    1
  );
  return {
    ...next,
    companions: next.companions.map((companion) =>
      isUndeadCompanion(companion)
        ? {
            ...companion,
            ...swapTemporaryHitPointsAssignment(
              companion.temporaryHitPoints,
              companion.temporaryHitPointsSource,
              getClassLevel(character, "Wizard"),
              "Bolster Undead"
            )
          }
        : companion
    )
  };
}

export function restoreBolsterUndeadOnLongRest(character: Character): Character {
  return hasDeathsMaster(character) &&
    character.classFeatureState?.wizard?.bolsterUndeadUsesExpended
    ? replaceClassFeatureState(character, "wizard", {
        ...character.classFeatureState?.wizard,
        bolsterUndeadUsesExpended: 0
      })
    : character;
}

export function getExtinguishUndeadSlotOptions(character: SubclassRuntimeCharacter) {
  if (!hasDeathsMaster(character)) return [];
  return getCharacterSpellSlotPools(character).flatMap((pool) =>
    pool.totals.flatMap((total, index) => {
      const level = index + 1;
      const remaining = Math.max(0, total - (pool.expended[index] ?? 0));
      return level >= 5 && remaining > 0
        ? [{ id: `${pool.id}:${level}`, poolId: pool.id, level, remaining, label: pool.label }]
        : [];
    })
  );
}

export function activateExtinguishUndead(character: Character, slotId: string): Character {
  const option = getExtinguishUndeadSlotOptions(character).find((slot) => slot.id === slotId);
  if (!option) return character;
  const pool = getCharacterSpellSlotPools(character).find((entry) => entry.id === option.poolId)!;
  const expended = [...pool.expended];
  expended[option.level - 1] = (expended[option.level - 1] ?? 0) + 1;
  return setSlotPoolExpended(character, pool.id, expended);
}

export function collectNecromancerDeathMasterContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  const contributions: FeatureContributionSpec[] = [];
  const harvest = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.HARVEST_UNDEAD
  );
  if (harvest) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "wizard-necromancer-harvest-undead",
        label: harvest.name,
        entryId: CLASS_FEATURE.HARVEST_UNDEAD
      }),
      reactions: [
        {
          id: harvestUndeadReactionId,
          reaction: REACTION.HARVEST_UNDEAD,
          name: harvest.name,
          sourceType: "feature",
          sourceFeature: CLASS_FEATURE.HARVEST_UNDEAD,
          sourceLabel: "Necromancer",
          description: harvest.description
        }
      ]
    });
  }
  const bolster = getBolsterUndeadAction(character);
  if (bolster) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "wizard-necromancer-deaths-master",
        label: "Death's Master",
        entryId: CLASS_FEATURE.DEATHS_MASTER
      }),
      actions: [bolster],
      reactions: [
        {
          id: extinguishUndeadReactionId,
          reaction: REACTION.EXTINGUISH_UNDEAD,
          name: "Extinguish Undead",
          sourceType: "feature",
          sourceFeature: CLASS_FEATURE.DEATHS_MASTER,
          sourceLabel: "Necromancer",
          description: getDeathsMasterSection(character, "Extinguish Undead.")
        }
      ]
    });
  }
  return contributions;
}
