import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import { vestigeCompanionName } from "../../../../../codex/subclasses/warlockVestigeCompanion";
import type { Character, CharacterWarlockFeatureState } from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { applyHealingToCharacterCompanion } from "../../../companions";
import {
  createChargesAndResourceCardUsage,
  createChargesAndUsageHeaderTags,
  createFeatureActionCardCost
} from "../../cardUsage";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import { getWarlockPactSlotState, spendWarlockPactSlot } from "../pactMagicPool";

export const vestigeRecoveryActionKey = "warlock-vestige-recovery";

export function hasVestigeRecovery(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.VESTIGE_RECOVERY) !== null
  );
}

export function normalizeVestigeRecoveryState(
  value: Partial<CharacterWarlockFeatureState>,
  character: SubclassRuntimeCharacter
): Pick<CharacterWarlockFeatureState, "vestigeRecoveryUsesExpended"> {
  if (!hasVestigeRecovery(character)) return {};
  const expended = Number(value.vestigeRecoveryUsesExpended);
  return { vestigeRecoveryUsesExpended: Number.isFinite(expended) && expended >= 1 ? 1 : 0 };
}

export function getVestigeRecoveryUsesRemaining(character: SubclassRuntimeCharacter): number {
  if (!hasVestigeRecovery(character)) return 0;
  return (
    1 -
    (normalizeVestigeRecoveryState(character.classFeatureState?.warlock ?? {}, character)
      .vestigeRecoveryUsesExpended ?? 0)
  );
}

function getRecoveryCompanion(character: SubclassRuntimeCharacter) {
  return character.companions?.find(
    (companion) => companion.source === vestigeCompanionName && companion.currentHitPoints === 0
  );
}

function getRecoverySlot(character: SubclassRuntimeCharacter) {
  const pool = getWarlockPactSlotState(character);
  const index = pool.totals.findIndex((total) => total > 0);
  const total = pool.totals[index] ?? 0;
  return { level: index + 1, total, remaining: Math.max(0, total - (pool.expended[index] ?? 0)) };
}

export function getVestigeRecoveryAction(
  character: SubclassRuntimeCharacter
): FeatureActionCard | null {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.VESTIGE_RECOVERY
  );
  if (!feature) return null;
  const usesRemaining = getVestigeRecoveryUsesRemaining(character);
  const slot = getRecoverySlot(character);
  const disabledReason = !getRecoveryCompanion(character)
    ? "Your Vestige Companion must be at 0 HP."
    : usesRemaining <= 0
      ? "Vestige Recovery is expended until your next Long Rest."
      : slot.remaining <= 0
        ? "No Pact Magic spell slots remaining."
        : undefined;
  const cost = createFeatureActionCardCost({ amountText: "1", resourceLabel: "Pact Magic Slot" });
  return {
    key: vestigeRecoveryActionKey,
    name: feature.name,
    sourceFeature: CLASS_FEATURE.VESTIGE_RECOVERY,
    summary: "Restore your Vestige Companion to full HP.",
    detail: "Spend one charge and one Pact Magic spell slot when your vestige is at 0 HP.",
    breakdown: "Restore companion to full HP",
    economyType: ECONOMY_TYPE.REACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal: 1,
    cardUsage: createChargesAndResourceCardUsage(usesRemaining, 1, cost),
    headerTags: createChargesAndUsageHeaderTags(usesRemaining, 1, cost, slot.remaining, slot.total),
    description: feature.description,
    disabled: Boolean(disabledReason),
    disabledReason,
    drawer: {
      kind: "confirm",
      description: feature.description,
      blockedReason: disabledReason
    },
    execute: { kind: "activate" }
  };
}

export function activateVestigeRecovery(character: Character): Character {
  const action = getVestigeRecoveryAction(character);
  const companion = getRecoveryCompanion(character);
  if (!action || action.disabled || !companion) return character;
  const withSlotSpent = spendWarlockPactSlot(character, getRecoverySlot(character).level);
  if (withSlotSpent === character) return character;
  const nextCharacter = spendClassResource(
    withSlotSpent,
    {
      stateKey: "warlock",
      counter: "vestigeRecoveryUsesExpended",
      total: 1,
      remaining: getVestigeRecoveryUsesRemaining(character)
    },
    1
  );
  return {
    ...nextCharacter,
    companions: nextCharacter.companions.map((entry) =>
      entry.id === companion.id
        ? applyHealingToCharacterCompanion(entry, entry.maxHitPoints)
        : entry
    )
  };
}

export function restoreVestigeRecoveryOnLongRest(character: Character): Character {
  if (
    !hasVestigeRecovery(character) ||
    !character.classFeatureState?.warlock?.vestigeRecoveryUsesExpended
  ) {
    return character;
  }
  return replaceClassFeatureState(character, "warlock", {
    ...character.classFeatureState?.warlock,
    vestigeRecoveryUsesExpended: 0
  });
}
