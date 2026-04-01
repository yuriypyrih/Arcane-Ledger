import type { Character } from "../../../../../types";
import {
  getBarbarianIntimidatingPresenceUsesTotal,
  getBarbarianZealousPresenceUsesTotal,
  getBarbarianPersistentRageUsesTotal,
  getBarbarianRageOfTheGodsUsesTotal,
  getBarbarianRageUsesTotal,
  getBarbarianWarriorOfTheGodsUsesTotal,
  hasBarbarianRelentlessRageFeature,
  restoreBarbarianIntimidatingPresenceOnLongRest,
  restoreBarbarianRageOfTheGodsOnLongRest,
  restoreBarbarianZealousPresenceOnLongRest,
  restoreBarbarianPersistentRageOnLongRest,
  restoreBarbarianRageOnLongRest,
  restoreBarbarianRageOnShortRest,
  restoreBarbarianRelentlessRageOnLongRest,
  restoreBarbarianRelentlessRageOnShortRest,
  restoreBarbarianWarriorOfTheGodsOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/barbarian";
import {
  getBardicInspirationUsesTotal,
  getBeguilingMagicUsesTotal,
  getMantleOfMajestyUsesTotal,
  applyShortRestToBardFeatures,
  restoreBeguilingMagicOnLongRest,
  restoreMantleOfMajestyOnLongRest,
  restoreBardicInspirationOnLongRest
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
  getFaithfulSteedUsesTotal,
  getPaladinHealingPoolTotal,
  getPaladinChannelDivinityUsesTotal,
  getPaladinsSmiteUsesTotal,
  restorePaladinChannelDivinityOnLongRest,
  restorePaladinChannelDivinityOnShortRest,
  restoreFaithfulSteedOnLongRest,
  restorePaladinLayOnHandsOnLongRest,
  restorePaladinsSmiteOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/paladin";
import {
  getMonkFocusPointsTotal,
  hasMonkFeature,
  restoreMonkFocusPointsOnLongRest,
  restoreMonkFocusPointsOnShortRest,
  restoreMonkUncannyMetabolismOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/monk";
import {
  getRangerFavoredEnemyUsesTotal,
  getRangerNaturesVeilUsesTotal,
  getRangerTirelessUsesTotal,
  restoreRangerFavoredEnemyOnLongRest,
  restoreRangerNaturesVeilOnLongRest,
  restoreRangerTirelessOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/ranger";
import {
  getRogueStrokeOfLuckUsesTotal,
  restoreRogueStrokeOfLuckOnLongRest,
  restoreRogueStrokeOfLuckOnShortRest
} from "../../../../../pages/CharactersPage/classFeatures/rogue";
import {
  applySorcerousRestorationOnShortRest,
  getInnateSorceryUsesTotal,
  getSorcerousRestorationUsesRemaining,
  getSorcerousRestorationUsesTotal,
  getSorceryPointsTotal,
  restoreInnateSorceryOnLongRest,
  restoreSorcerousRestorationOnLongRest,
  restoreSorceryPointsOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/sorcerer";
import {
  getContactPatronUsesTotal,
  getWarlockMagicalCunningUsesTotal,
  hasWarlockFeature,
  restoreContactPatronOnLongRest,
  restoreMysticArcanumOnLongRest,
  restoreWarlockPactMagicSpellSlots,
  restoreWarlockMagicalCunningOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/warlock";
import {
  getArcaneRecoveryUsesTotal,
  getWizardSignatureSpellIds,
  restoreArcaneRecoveryOnLongRest,
  restoreWizardSignatureSpellsOnLongRest,
  restoreWizardSignatureSpellsOnShortRest
} from "../../../../../pages/CharactersPage/classFeatures/wizard";
import { CLASS_FEATURE } from "../../../../../codex/entries";
import { getSpellSlotTotalsForCharacter } from "../../../../../pages/CharactersPage/spellcasting";
import {
  applyLongRestToCharacterStatusEntries,
  type ExhaustionLevel,
  applyShortRestToCharacterStatusEntries,
  getEffectiveHitPointMaximumForCharacter,
  getExhaustionLevel,
  normalizeCharacterStatusEntries,
  reconcileCharacterStatusConsequences,
  setCharacterExhaustionLevel
} from "../../../../../pages/CharactersPage/traits";
import { createDefaultRoundTracker } from "../../../../../pages/CharactersPage/combat";
import { createDefaultDeathSaves, normalizeTemporaryHitPoints } from "../gameplayStateUtils";

export type RestType = "short" | "long";

export type RestOption = {
  id: string;
  label: string;
  detail?: string;
  defaultSelected?: boolean;
  disabled?: boolean;
  emphasis?: "default" | "feature";
  apply: (character: Character) => Character;
};

export function createShortRestOptions(character: Character): RestOption[] {
  const shortRestHealAmount = Math.ceil(getEffectiveHitPointMaximumForCharacter(character) / 2);
  const spellSlotTotal = getSpellSlotTotalsForCharacter(
    character.className,
    character.level
  ).reduce((sum, value) => sum + value, 0);
  const hasWarlockPactMagic = hasWarlockFeature(character, CLASS_FEATURE.PACT_MAGIC);
  const temporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);
  const rageUsesTotal = getBarbarianRageUsesTotal(character);
  const hasBarbarianRelentlessRage = hasBarbarianRelentlessRageFeature(character);
  const _barbarianRelentlessRageRecoveryAvailable =
    restoreBarbarianRelentlessRageOnShortRest(character) !== character;
  const bardicInspirationUsesTotal = getBardicInspirationUsesTotal(character);
  const secondWindUsesTotal = getFighterSecondWindUsesTotal(character);
  const actionSurgeUsesTotal = getFighterActionSurgeUsesTotal(character);
  const monkFocusPointsTotal = getMonkFocusPointsTotal(character);
  const channelDivinityUsesTotal = Math.max(
    getClericChannelDivinityUsesTotal(character),
    getPaladinChannelDivinityUsesTotal(character)
  );
  const hasTimedStatuses = normalizeCharacterStatusEntries(character.statusEntries).length > 0;
  const bardShortRestRecoveryAvailable = applyShortRestToBardFeatures(character) !== character;
  const exhaustionLevel = getExhaustionLevel(character.statusEntries);
  const tirelessUsesTotal = getRangerTirelessUsesTotal(character);
  const rogueStrokeOfLuckUsesTotal = getRogueStrokeOfLuckUsesTotal(character);
  const sorcerousRestorationUsesTotal = getSorcerousRestorationUsesTotal(character);
  const sorcerousRestorationUsesRemaining = getSorcerousRestorationUsesRemaining(character);
  const wizardSignatureSpellIds = getWizardSignatureSpellIds(character);

  return [
    {
      id: "restore-hit-points",
      label: `Heal ${shortRestHealAmount} HP`,
      detail: "Restores half your max HP, up to your hit point maximum.",
      apply: (currentCharacter) => {
        const effectiveHitPoints = getEffectiveHitPointMaximumForCharacter(currentCharacter);
        const nextCurrentHitPoints = Math.max(
          0,
          Math.min(
            effectiveHitPoints,
            currentCharacter.currentHitPoints + Math.ceil(effectiveHitPoints / 2)
          )
        );

        return reconcileCharacterStatusConsequences({
          ...currentCharacter,
          currentHitPoints: nextCurrentHitPoints,
          deathSaves:
            nextCurrentHitPoints > 0 ? createDefaultDeathSaves() : currentCharacter.deathSaves
        });
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
    ...(hasWarlockPactMagic && spellSlotTotal > 0
      ? [
          {
            id: "restore-pact-magic-spell-slots",
            label: "Restore all Pact Magic spell slots",
            apply: (currentCharacter: Character) =>
              restoreWarlockPactMagicSpellSlots(currentCharacter)
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
              temporaryHitPoints: 0,
              temporaryHitPointsSource: undefined
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
    ...(tirelessUsesTotal > 0 && exhaustionLevel !== null
      ? [
          {
            id: "reduce-exhaustion-tireless",
            label: "Lower Exhaustion by 1 level",
            detail: "Tireless lets you reduce your Exhaustion level by 1 on a Short Rest.",
            apply: (currentCharacter: Character) => {
              const currentExhaustionLevel = getExhaustionLevel(currentCharacter.statusEntries);
              const nextExhaustionLevel =
                currentExhaustionLevel === null || currentExhaustionLevel <= 1
                  ? null
                  : ((currentExhaustionLevel - 1) as ExhaustionLevel);
              const isLeavingExhaustionDeathState =
                currentExhaustionLevel !== null &&
                currentExhaustionLevel >= 6 &&
                (nextExhaustionLevel === null || nextExhaustionLevel < 6);

              return reconcileCharacterStatusConsequences({
                ...currentCharacter,
                deathSaves: isLeavingExhaustionDeathState
                  ? createDefaultDeathSaves()
                  : currentCharacter.deathSaves,
                statusEntries: setCharacterExhaustionLevel(
                  currentCharacter.statusEntries,
                  nextExhaustionLevel
                )
              });
            }
          } satisfies RestOption
        ]
      : []),
    ...(rageUsesTotal > 0
      ? [
          {
            id: "restore-rage",
            label: "End Rage and restore 1 Rage use",
            apply: (currentCharacter: Character) =>
              restoreBarbarianRageOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(hasBarbarianRelentlessRage
      ? [
          {
            id: "restore-relentless-rage",
            label: "Reset Relentless Rage DC",
            apply: (currentCharacter: Character) =>
              restoreBarbarianRelentlessRageOnShortRest(currentCharacter)
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
              currentCharacter.className === "Paladin"
                ? restorePaladinChannelDivinityOnShortRest(currentCharacter)
                : restoreClericChannelDivinityOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rogueStrokeOfLuckUsesTotal > 0
      ? [
          {
            id: "restore-stroke-of-luck",
            label: "Restore Stroke of Luck",
            apply: (currentCharacter: Character) =>
              restoreRogueStrokeOfLuckOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(wizardSignatureSpellIds.length > 0
      ? [
          {
            id: "restore-signature-spells",
            label: "Restore Signature Spells",
            apply: (currentCharacter: Character) =>
              restoreWizardSignatureSpellsOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(sorcerousRestorationUsesTotal > 0
      ? [
          {
            id: "sorcerous-restoration",
            label: "Sorcerous Restoration",
            detail:
              "Optional Sorcerer feature. Regain Sorcery Points equal to half your Sorcerer level.",
            defaultSelected: false,
            disabled: sorcerousRestorationUsesRemaining <= 0,
            emphasis: "feature",
            apply: (currentCharacter: Character) =>
              applySorcerousRestorationOnShortRest(currentCharacter)
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
  const hasWarlockPactMagic = hasWarlockFeature(character, CLASS_FEATURE.PACT_MAGIC);
  const temporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);
  const rageUsesTotal = getBarbarianRageUsesTotal(character);
  const hasBarbarianRelentlessRage = hasBarbarianRelentlessRageFeature(character);
  const barbarianIntimidatingPresenceUsesTotal =
    getBarbarianIntimidatingPresenceUsesTotal(character);
  const barbarianZealousPresenceUsesTotal = getBarbarianZealousPresenceUsesTotal(character);
  const barbarianPersistentRageUsesTotal = getBarbarianPersistentRageUsesTotal(character);
  const barbarianRageOfTheGodsUsesTotal = getBarbarianRageOfTheGodsUsesTotal(character);
  const barbarianWarriorOfTheGodsUsesTotal = getBarbarianWarriorOfTheGodsUsesTotal(character);
  const _barbarianRelentlessRageRecoveryAvailable =
    restoreBarbarianRelentlessRageOnLongRest(character) !== character;
  const barbarianIntimidatingPresenceRecoveryAvailable =
    restoreBarbarianIntimidatingPresenceOnLongRest(character) !== character;
  const barbarianZealousPresenceRecoveryAvailable =
    restoreBarbarianZealousPresenceOnLongRest(character) !== character;
  const barbarianPersistentRageRecoveryAvailable =
    restoreBarbarianPersistentRageOnLongRest(character) !== character;
  const barbarianRageOfTheGodsRecoveryAvailable =
    restoreBarbarianRageOfTheGodsOnLongRest(character) !== character;
  const barbarianWarriorOfTheGodsRecoveryAvailable =
    restoreBarbarianWarriorOfTheGodsOnLongRest(character) !== character;
  const bardicInspirationUsesTotal = getBardicInspirationUsesTotal(character);
  const beguilingMagicUsesTotal = getBeguilingMagicUsesTotal(character);
  const mantleOfMajestyUsesTotal = getMantleOfMajestyUsesTotal(character);
  const secondWindUsesTotal = getFighterSecondWindUsesTotal(character);
  const actionSurgeUsesTotal = getFighterActionSurgeUsesTotal(character);
  const indomitableUsesTotal = getFighterIndomitableUsesTotal(character);
  const paladinHealingPoolTotal = getPaladinHealingPoolTotal(character);
  const paladinsSmiteUsesTotal = getPaladinsSmiteUsesTotal(character);
  const faithfulSteedUsesTotal = getFaithfulSteedUsesTotal(character);
  const rangerFavoredEnemyUsesTotal = getRangerFavoredEnemyUsesTotal(character);
  const rangerNaturesVeilUsesTotal = getRangerNaturesVeilUsesTotal(character);
  const rangerTirelessUsesTotal = getRangerTirelessUsesTotal(character);
  const rogueStrokeOfLuckUsesTotal = getRogueStrokeOfLuckUsesTotal(character);
  const sorceryPointsTotal = getSorceryPointsTotal(character);
  const innateSorceryUsesTotal = getInnateSorceryUsesTotal(character);
  const sorcerousRestorationUsesTotal = getSorcerousRestorationUsesTotal(character);
  const magicalCunningUsesTotal = getWarlockMagicalCunningUsesTotal(character);
  const arcaneRecoveryUsesTotal = getArcaneRecoveryUsesTotal(character);
  const wizardSignatureSpellIds = getWizardSignatureSpellIds(character);
  const contactPatronUsesTotal = getContactPatronUsesTotal(character);
  const hasMysticArcanum = hasWarlockFeature(character, CLASS_FEATURE.MYSTIC_ARCANUM);
  const monkFocusPointsTotal = getMonkFocusPointsTotal(character);
  const hasUncannyMetabolism = hasMonkFeature(character, CLASS_FEATURE.UNCANNY_METABOLISM);
  const channelDivinityUsesTotal = Math.max(
    getClericChannelDivinityUsesTotal(character),
    getPaladinChannelDivinityUsesTotal(character)
  );
  const hasTimedStatuses = normalizeCharacterStatusEntries(character.statusEntries).length > 0;
  const exhaustionLevel = getExhaustionLevel(character.statusEntries);

  return [
    ...(exhaustionLevel !== null
      ? [
          {
            id: "reduce-exhaustion",
            label: "Lower Exhaustion by 1 level",
            apply: (currentCharacter: Character) => {
              const currentExhaustionLevel = getExhaustionLevel(currentCharacter.statusEntries);
              const nextExhaustionLevel =
                currentExhaustionLevel === null || currentExhaustionLevel <= 1
                  ? null
                  : ((currentExhaustionLevel - 1) as ExhaustionLevel);
              const isLeavingExhaustionDeathState =
                currentExhaustionLevel !== null &&
                currentExhaustionLevel >= 6 &&
                (nextExhaustionLevel === null || nextExhaustionLevel < 6);

              return reconcileCharacterStatusConsequences({
                ...currentCharacter,
                deathSaves: isLeavingExhaustionDeathState
                  ? createDefaultDeathSaves()
                  : currentCharacter.deathSaves,
                statusEntries: setCharacterExhaustionLevel(
                  currentCharacter.statusEntries,
                  nextExhaustionLevel
                )
              });
            }
          } satisfies RestOption
        ]
      : []),
    {
      id: "restore-hit-points",
      label: "Restore full HP",
      apply: (currentCharacter) =>
        reconcileCharacterStatusConsequences({
          ...currentCharacter,
          currentHitPoints: getEffectiveHitPointMaximumForCharacter(currentCharacter),
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
            label: hasWarlockPactMagic
              ? "Restore all Pact Magic spell slots"
              : "Restore all spell slots",
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
              temporaryHitPoints: 0,
              temporaryHitPointsSource: undefined
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
            apply: (currentCharacter: Character) => restoreBarbarianRageOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(hasBarbarianRelentlessRage
      ? [
          {
            id: "restore-relentless-rage",
            label: "Reset Relentless Rage DC",
            apply: (currentCharacter: Character) =>
              restoreBarbarianRelentlessRageOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(barbarianIntimidatingPresenceUsesTotal > 0
      ? [
          {
            id: "restore-intimidating-presence",
            label: "Restore Intimidating Presence",
            disabled: !barbarianIntimidatingPresenceRecoveryAvailable,
            apply: (currentCharacter: Character) =>
              restoreBarbarianIntimidatingPresenceOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(barbarianZealousPresenceUsesTotal > 0
      ? [
          {
            id: "restore-zealous-presence",
            label: "Restore Zealous Presence",
            disabled: !barbarianZealousPresenceRecoveryAvailable,
            apply: (currentCharacter: Character) =>
              restoreBarbarianZealousPresenceOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(barbarianPersistentRageUsesTotal > 0
      ? [
          {
            id: "restore-persistent-rage",
            label: "Restore Persistent Rage",
            disabled: !barbarianPersistentRageRecoveryAvailable,
            apply: (currentCharacter: Character) =>
              restoreBarbarianPersistentRageOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(barbarianRageOfTheGodsUsesTotal > 0
      ? [
          {
            id: "restore-rage-of-the-gods",
            label: "Restore Rage of the Gods",
            disabled: !barbarianRageOfTheGodsRecoveryAvailable,
            apply: (currentCharacter: Character) =>
              restoreBarbarianRageOfTheGodsOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(barbarianWarriorOfTheGodsUsesTotal > 0
      ? [
          {
            id: "restore-warrior-of-the-gods",
            label: "Restore Warrior of the Gods",
            disabled: !barbarianWarriorOfTheGodsRecoveryAvailable,
            apply: (currentCharacter: Character) =>
              restoreBarbarianWarriorOfTheGodsOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(bardicInspirationUsesTotal > 0
      ? [
          {
            id: "restore-bardic-inspiration",
            label: "Restore all Bardic dice",
            apply: (currentCharacter: Character) =>
              restoreBardicInspirationOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(beguilingMagicUsesTotal > 0
      ? [
          {
            id: "restore-beguiling-magic",
            label: "Restore Beguiling Magic",
            apply: (currentCharacter: Character) =>
              restoreBeguilingMagicOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(mantleOfMajestyUsesTotal > 0
      ? [
          {
            id: "restore-mantle-of-majesty",
            label: "Restore Mantle of Majesty",
            apply: (currentCharacter: Character) =>
              restoreMantleOfMajestyOnLongRest(currentCharacter)
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
    ...(paladinsSmiteUsesTotal > 0
      ? [
          {
            id: "restore-paladins-smite",
            label: "Restore Paladin's Smite",
            apply: (currentCharacter: Character) => restorePaladinsSmiteOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(faithfulSteedUsesTotal > 0
      ? [
          {
            id: "restore-faithful-steed",
            label: "Restore Faithful Steed",
            apply: (currentCharacter: Character) => restoreFaithfulSteedOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rangerFavoredEnemyUsesTotal > 0
      ? [
          {
            id: "restore-favored-enemy",
            label: "Restore Favored Enemy",
            apply: (currentCharacter: Character) =>
              restoreRangerFavoredEnemyOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rangerNaturesVeilUsesTotal > 0
      ? [
          {
            id: "restore-natures-veil",
            label: "Restore Nature's Veil",
            apply: (currentCharacter: Character) =>
              restoreRangerNaturesVeilOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rangerTirelessUsesTotal > 0
      ? [
          {
            id: "restore-tireless",
            label: "Restore Tireless",
            apply: (currentCharacter: Character) =>
              restoreRangerTirelessOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(sorceryPointsTotal > 0
      ? [
          {
            id: "restore-sorcery-points",
            label: "Restore all Sorcery Points",
            apply: (currentCharacter: Character) => restoreSorceryPointsOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(innateSorceryUsesTotal > 0
      ? [
          {
            id: "restore-innate-sorcery",
            label: "Restore Innate Sorcery",
            apply: (currentCharacter: Character) => restoreInnateSorceryOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(sorcerousRestorationUsesTotal > 0
      ? [
          {
            id: "restore-sorcerous-restoration",
            label: "Restore Sorcerous Restoration",
            apply: (currentCharacter: Character) =>
              restoreSorcerousRestorationOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(magicalCunningUsesTotal > 0
      ? [
          {
            id: "restore-magical-cunning",
            label: "Restore Magical Cunning",
            apply: (currentCharacter: Character) =>
              restoreWarlockMagicalCunningOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(arcaneRecoveryUsesTotal > 0
      ? [
          {
            id: "restore-arcane-recovery",
            label: "Restore Arcane Recovery",
            apply: (currentCharacter: Character) =>
              restoreArcaneRecoveryOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(wizardSignatureSpellIds.length > 0
      ? [
          {
            id: "restore-signature-spells",
            label: "Restore Signature Spells",
            apply: (currentCharacter: Character) =>
              restoreWizardSignatureSpellsOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(contactPatronUsesTotal > 0
      ? [
          {
            id: "restore-contact-patron",
            label: "Restore Contact Patron",
            apply: (currentCharacter: Character) => restoreContactPatronOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(hasMysticArcanum
      ? [
          {
            id: "restore-mystic-arcanum",
            label: "Restore Mystic Arcanum",
            apply: (currentCharacter: Character) => restoreMysticArcanumOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rogueStrokeOfLuckUsesTotal > 0
      ? [
          {
            id: "restore-stroke-of-luck",
            label: "Restore Stroke of Luck",
            apply: (currentCharacter: Character) =>
              restoreRogueStrokeOfLuckOnLongRest(currentCharacter)
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
              currentCharacter.className === "Paladin"
                ? restorePaladinChannelDivinityOnLongRest(currentCharacter)
                : restoreClericChannelDivinityOnLongRest(currentCharacter)
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
