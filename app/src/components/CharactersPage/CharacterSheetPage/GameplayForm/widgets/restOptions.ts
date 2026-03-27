import type { Character } from "../../../../../types";
import {
  getBarbarianRageUsesTotal,
  applyLongRestToBarbarianFeatures,
  applyShortRestToBarbarianFeatures
} from "../../../../../pages/CharactersPage/classFeatures/barbarian";
import {
  getBardicInspirationUsesTotal,
  applyLongRestToBardFeatures,
  applyShortRestToBardFeatures
} from "../../../../../pages/CharactersPage/classFeatures/bard";
import {
  getClericChannelDivinityUsesTotal,
  hasClericDivineInterventionFeature,
  restoreClericChannelDivinityOnLongRest,
  restoreClericChannelDivinityOnShortRest,
  restoreClericDivineInterventionOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/cleric";
import {
  getFighterActionSurgeUsesTotal,
  getFighterIndomitableUsesTotal,
  getFighterSecondWindUsesTotal,
  restoreFighterActionSurgeOnLongRest,
  restoreFighterActionSurgeOnShortRest,
  restoreFighterIndomitableOnLongRest,
  restoreFighterSecondWindOnLongRest,
  restoreFighterSecondWindOnShortRest
} from "../../../../../pages/CharactersPage/classFeatures/fighter";
import {
  getPaladinHealingPoolTotal,
  restorePaladinLayOnHandsOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/paladin";
import {
  getMonkFocusPointsTotal,
  hasMonkFeature,
  restoreMonkFocusPointsOnLongRest,
  restoreMonkFocusPointsOnShortRest,
  restoreMonkUncannyMetabolismOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/monk";
import { CLASS_FEATURE } from "../../../../../codex/entries";
import {
  getSpellSlotTotalsForCharacter
} from "../../../../../pages/CharactersPage/spellcasting";
import {
  applyLongRestToCharacterStatusEntries,
  applyShortRestToCharacterStatusEntries,
  normalizeCharacterStatusEntries
} from "../../../../../pages/CharactersPage/traits";
import { createDefaultRoundTracker } from "../../../../../pages/CharactersPage/combat";
import {
  createDefaultDeathSaves,
  normalizeTemporaryHitPoints
} from "../gameplayStateUtils";

export type RestType = "short" | "long";

export type RestOption = {
  id: string;
  label: string;
  detail?: string;
  apply: (character: Character) => Character;
};

export function createShortRestOptions(character: Character): RestOption[] {
  const shortRestHealAmount = Math.ceil(character.hitPoints / 2);
  const temporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);
  const rageUsesTotal = getBarbarianRageUsesTotal(character);
  const bardicInspirationUsesTotal = getBardicInspirationUsesTotal(character);
  const secondWindUsesTotal = getFighterSecondWindUsesTotal(character);
  const actionSurgeUsesTotal = getFighterActionSurgeUsesTotal(character);
  const monkFocusPointsTotal = getMonkFocusPointsTotal(character);
  const channelDivinityUsesTotal = getClericChannelDivinityUsesTotal(character);
  const hasTimedStatuses = normalizeCharacterStatusEntries(character.statusEntries).length > 0;
  const bardShortRestRecoveryAvailable = applyShortRestToBardFeatures(character) !== character;

  return [
    {
      id: "restore-hit-points",
      label: `Heal ${shortRestHealAmount} HP`,
      detail: "Restores half your max HP, up to your hit point maximum.",
      apply: (currentCharacter) => {
        const nextCurrentHitPoints = Math.max(
          0,
          Math.min(
            currentCharacter.hitPoints,
            currentCharacter.currentHitPoints + Math.ceil(currentCharacter.hitPoints / 2)
          )
        );

        return {
          ...currentCharacter,
          currentHitPoints: nextCurrentHitPoints,
          deathSaves:
            nextCurrentHitPoints > 0
              ? createDefaultDeathSaves()
              : currentCharacter.deathSaves
        };
      }
    },
    {
      id: "reset-round-tracker",
      label: "Reset round tracker",
      apply: (currentCharacter) => ({
        ...currentCharacter,
        roundTracker: createDefaultRoundTracker()
      })
    },
    ...(temporaryHitPoints > 0
      ? [
          {
            id: "clear-temporary-hit-points",
            label: "Remove Temporary Hit Points",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              temporaryHitPoints: 0
            })
          } satisfies RestOption
        ]
      : []),
    ...(hasTimedStatuses
      ? [
          {
            id: "update-statuses",
            label: "Update Traits & Conditions",
            detail: "Ends durations below 1 hour and clears Concentration-linked effects.",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              statusEntries: applyShortRestToCharacterStatusEntries(currentCharacter.statusEntries)
            })
          } satisfies RestOption
        ]
      : []),
    ...(rageUsesTotal > 0
      ? [
          {
            id: "restore-rage",
            label: "End Rage and restore 1 Rage use",
            apply: (currentCharacter: Character) =>
              applyShortRestToBarbarianFeatures(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(bardShortRestRecoveryAvailable && bardicInspirationUsesTotal > 0
      ? [
          {
            id: "restore-bardic-inspiration",
            label: "Restore all Bardic dice",
            apply: (currentCharacter: Character) => applyShortRestToBardFeatures(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(secondWindUsesTotal > 0
      ? [
          {
            id: "restore-second-wind",
            label: "Restore 1 Second Wind",
            apply: (currentCharacter: Character) =>
              restoreFighterSecondWindOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(actionSurgeUsesTotal > 0
      ? [
          {
            id: "restore-action-surge",
            label: "Restore all Action Surge uses",
            apply: (currentCharacter: Character) =>
              restoreFighterActionSurgeOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(monkFocusPointsTotal > 0
      ? [
          {
            id: "restore-focus-points",
            label: "Restore all Focus Points",
            apply: (currentCharacter: Character) =>
              restoreMonkFocusPointsOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(channelDivinityUsesTotal > 0
      ? [
          {
            id: "restore-channel-divinity",
            label: "Restore 1 Channel Divinity",
            apply: (currentCharacter: Character) =>
              restoreClericChannelDivinityOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : [])
  ];
}

export function createLongRestOptions(character: Character): RestOption[] {
  const spellSlotTotal = getSpellSlotTotalsForCharacter(
    character.className,
    character.level
  ).reduce((sum, value) => sum + value, 0);
  const temporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);
  const rageUsesTotal = getBarbarianRageUsesTotal(character);
  const bardicInspirationUsesTotal = getBardicInspirationUsesTotal(character);
  const secondWindUsesTotal = getFighterSecondWindUsesTotal(character);
  const actionSurgeUsesTotal = getFighterActionSurgeUsesTotal(character);
  const indomitableUsesTotal = getFighterIndomitableUsesTotal(character);
  const paladinHealingPoolTotal = getPaladinHealingPoolTotal(character);
  const monkFocusPointsTotal = getMonkFocusPointsTotal(character);
  const hasUncannyMetabolism = hasMonkFeature(character, CLASS_FEATURE.UNCANNY_METABOLISM);
  const channelDivinityUsesTotal = getClericChannelDivinityUsesTotal(character);
  const hasTimedStatuses = normalizeCharacterStatusEntries(character.statusEntries).length > 0;

  return [
    {
      id: "restore-hit-points",
      label: "Restore full HP",
      apply: (currentCharacter) => ({
        ...currentCharacter,
        currentHitPoints: currentCharacter.hitPoints,
        deathSaves: createDefaultDeathSaves()
      })
    },
    {
      id: "reset-round-tracker",
      label: "Reset round tracker",
      apply: (currentCharacter: Character) => ({
        ...currentCharacter,
        roundTracker: createDefaultRoundTracker()
      })
    },
    ...(spellSlotTotal > 0
      ? [
          {
            id: "restore-spell-slots",
            label: "Restore all spell slots",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              spellSlotsExpended: Array.from({ length: 9 }, () => 0)
            })
          } satisfies RestOption
        ]
      : []),
    ...(temporaryHitPoints > 0
      ? [
          {
            id: "clear-temporary-hit-points",
            label: "Remove Temporary Hit Points",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              temporaryHitPoints: 0
            })
          } satisfies RestOption
        ]
      : []),
    ...(hasTimedStatuses
      ? [
          {
            id: "update-statuses",
            label: "Update Traits & Conditions",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              statusEntries: applyLongRestToCharacterStatusEntries(currentCharacter.statusEntries)
            })
          } satisfies RestOption
        ]
      : []),
    ...(rageUsesTotal > 0
      ? [
          {
            id: "restore-rage",
            label: "End Rage and restore all Rage uses",
            apply: (currentCharacter: Character) =>
              applyLongRestToBarbarianFeatures(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(bardicInspirationUsesTotal > 0
      ? [
          {
            id: "restore-bardic-inspiration",
            label: "Restore all Bardic dice",
            apply: (currentCharacter: Character) => applyLongRestToBardFeatures(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(secondWindUsesTotal > 0
      ? [
          {
            id: "restore-second-wind",
            label: "Restore all Second Wind uses",
            apply: (currentCharacter: Character) =>
              restoreFighterSecondWindOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(actionSurgeUsesTotal > 0
      ? [
          {
            id: "restore-action-surge",
            label: "Restore all Action Surge uses",
            apply: (currentCharacter: Character) =>
              restoreFighterActionSurgeOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(indomitableUsesTotal > 0
      ? [
          {
            id: "restore-indomitable",
            label: "Restore all Indomitable uses",
            apply: (currentCharacter: Character) =>
              restoreFighterIndomitableOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(paladinHealingPoolTotal > 0
      ? [
          {
            id: "restore-pool-of-healing",
            label: "Restore Pool of Healing",
            apply: (currentCharacter: Character) =>
              restorePaladinLayOnHandsOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(monkFocusPointsTotal > 0
      ? [
          {
            id: "restore-focus-points",
            label: "Restore all Focus Points",
            apply: (currentCharacter: Character) =>
              restoreMonkFocusPointsOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(hasUncannyMetabolism
      ? [
          {
            id: "restore-uncanny-metabolism",
            label: "Restore Uncanny Metabolism",
            apply: (currentCharacter: Character) =>
              restoreMonkUncannyMetabolismOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(channelDivinityUsesTotal > 0
      ? [
          {
            id: "restore-channel-divinity",
            label: "Restore all Channel Divinity",
            apply: (currentCharacter: Character) =>
              restoreClericChannelDivinityOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(hasClericDivineInterventionFeature(character)
      ? [
          {
            id: "restore-divine-intervention",
            label: "Restore Divine Intervention",
            apply: (currentCharacter: Character) =>
              restoreClericDivineInterventionOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : [])
  ];
}
