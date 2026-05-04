/* eslint-disable @typescript-eslint/no-unused-vars */
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
} from "../../../../../pages/CharactersPage/classFeatures/barbarian/barbarian";
import {
  restoreBardicInspirationOnShortRest,
  getBardicInspirationUsesTotal,
  getBlessingOfMoonlightUsesTotal,
  getBeguilingMagicUsesTotal,
  getMantleOfMajestyUsesTotal,
  getUnbreakableMajestyUsesTotal,
  applyShortRestToBardFeatures,
  restoreBlessingOfMoonlightOnLongRest,
  restoreBeguilingMagicOnLongRest,
  restoreMantleOfMajestyOnLongRest,
  restoreUnbreakableMajestyOnLongRest,
  restoreUnbreakableMajestyOnShortRest,
  restoreBardicInspirationOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/bard/bard";
import {
  getClericChannelDivinityUsesTotal,
  getClericCoronaOfLightUsesTotal,
  getClericWarPriestUsesTotal,
  getClericWardingFlareUsesTotal,
  getDivineForeknowledgeUsesTotal,
  hasClericImprovedWardingFlareFeature,
  hasClericDivineInterventionFeature,
  restoreClericChannelDivinityOnLongRest,
  restoreClericChannelDivinityOnShortRest,
  restoreClericCoronaOfLightOnLongRest,
  restoreClericDivineForeknowledgeOnLongRest,
  restoreClericDivineInterventionOnLongRest,
  restoreClericWarPriestOnLongRest,
  restoreClericWarPriestOnShortRest,
  restoreClericWardingFlareOnLongRest,
  restoreClericWardingFlareOnShortRest
} from "../../../../../pages/CharactersPage/classFeatures/cleric/cleric";
import {
  getFighterActionSurgeUsesTotal,
  getFighterBattleMasterKnowYourEnemyUsesTotalForCharacter as getFighterBattleMasterKnowYourEnemyUsesTotal,
  getFighterBattleMasterSuperiorityDiceTotalForCharacter as getFighterBattleMasterSuperiorityDiceTotal,
  getFighterGroupRecoveryUsesTotal,
  getFighterIndomitableUsesTotal,
  getFighterPsiWarriorBulwarkOfForceUsesTotalForCharacter as getFighterPsiWarriorBulwarkOfForceUsesTotal,
  getFighterPsiWarriorEnergyDiceTotalForCharacter as getFighterPsiWarriorEnergyDiceTotal,
  getFighterPsiWarriorTelekineticMasterUsesTotalForCharacter as getFighterPsiWarriorTelekineticMasterUsesTotal,
  getFighterPsiWarriorPsiPoweredLeapUsesTotalForCharacter as getFighterPsiWarriorPsiPoweredLeapUsesTotal,
  getFighterPsiWarriorTelekineticMovementUsesTotalForCharacter as getFighterPsiWarriorTelekineticMovementUsesTotal,
  getFighterSecondWindUsesTotal,
  restoreFighterActionSurgeOnLongRest,
  restoreFighterActionSurgeOnShortRest,
  restoreFighterBattleMasterKnowYourEnemyOnLongRest,
  restoreFighterBattleMasterSuperiorityDiceOnLongRest,
  restoreFighterBattleMasterSuperiorityDiceOnShortRest,
  restoreFighterGroupRecoveryOnLongRest,
  restoreFighterGroupRecoveryOnShortRest,
  restoreFighterIndomitableOnLongRest,
  restoreFighterPsiWarriorBulwarkOfForceOnLongRest,
  restoreFighterPsiWarriorEnergyDiceOnLongRest,
  restoreFighterPsiWarriorEnergyDiceOnShortRest,
  restoreFighterPsiWarriorTelekineticMasterOnLongRest,
  restoreFighterPsiWarriorPsiPoweredLeapOnLongRest,
  restoreFighterPsiWarriorPsiPoweredLeapOnShortRest,
  restoreFighterPsiWarriorTelekineticMovementOnLongRest,
  restoreFighterPsiWarriorTelekineticMovementOnShortRest,
  restoreFighterSecondWindOnLongRest,
  restoreFighterSecondWindOnShortRest
} from "../../../../../pages/CharactersPage/classFeatures/fighter/fighter";
import {
  getDruidCosmicOmenUsesTotal,
  getDruidStarMapGuidingBoltUsesTotal,
  getDruidMoonlightStepUsesTotal,
  getDruidNaturalRecoveryUsesTotal,
  getDruidNatureMagicianUsesTotal,
  getDruidWildResurgenceSpellSlotRecoveryUsesTotal,
  getDruidWildShapeUsesTotal,
  restoreDruidCosmicOmenOnLongRest,
  restoreDruidMoonlightStepOnLongRest,
  restoreDruidNaturalRecoveryOnLongRest,
  restoreDruidNatureMagicianOnLongRest,
  restoreDruidStarMapGuidingBoltOnLongRest,
  restoreDruidWildResurgenceOnLongRest,
  restoreAllDruidWildShapeUses,
  restoreOneDruidWildShapeUse
} from "../../../../../pages/CharactersPage/classFeatures/druid/druid";
import {
  getElderChampionUsesTotal,
  getElementalRebukeUsesTotal,
  getFaithfulSteedUsesTotal,
  getGloriousDefenseUsesTotal,
  getHolyNimbusUsesTotal,
  getLivingLegendUsesTotal,
  getNobleScionUsesTotal,
  getAvengingAngelUsesTotal,
  getPaladinHealingPoolTotal,
  getPaladinChannelDivinityUsesTotal,
  getPaladinsSmiteUsesTotal,
  getUndyingSentinelUsesTotal,
  restorePaladinChannelDivinityOnLongRest,
  restorePaladinChannelDivinityOnShortRest,
  restoreElderChampionOnLongRest,
  restoreElementalRebukeOnLongRest,
  restoreFaithfulSteedOnLongRest,
  restoreGloriousDefenseOnLongRest,
  restoreHolyNimbusOnLongRest,
  restoreLivingLegendOnLongRest,
  restoreNobleScionOnLongRest,
  restoreAvengingAngelOnLongRest,
  restorePaladinLayOnHandsOnLongRest,
  restorePaladinsSmiteOnLongRest,
  restoreUndyingSentinelOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/paladin/paladin";
import {
  getMonkFocusPointsTotal,
  getMonkFlurryOfHealingAndHarmUsesTotal,
  getMonkHandOfUltimateJusticeUsesTotal,
  getMonkWholenessOfBodyUsesTotal,
  hasMonkFeature,
  restoreMonkFlurryOfHealingAndHarmOnLongRest,
  restoreMonkHandOfUltimateJusticeOnLongRest,
  restoreMonkFocusPointsOnLongRest,
  restoreMonkFocusPointsOnShortRest,
  restoreMonkUncannyMetabolismOnLongRest,
  restoreMonkWholenessOfBodyOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/monk/monk";
import {
  getRangerGloomStalkerDreadAmbusherUsesTotal,
  getRangerFeyReinforcementsUsesTotal,
  getRangerFavoredEnemyUsesTotal,
  getRangerMistyWandererUsesTotal,
  getRangerNaturesVeilUsesTotal,
  getRangerTirelessUsesTotal,
  getRangerWinterWalkerChillingRetributionUsesTotal,
  getRangerWinterWalkerFrozenHauntUsesTotal,
  getRangerWinterWalkerFortifyingSoulUsesTotal,
  restoreRangerGloomStalkerDreadAmbusherOnLongRest,
  restoreRangerFeyReinforcementsOnLongRest,
  restoreRangerFavoredEnemyOnLongRest,
  restoreRangerMistyWandererOnLongRest,
  restoreRangerNaturesVeilOnLongRest,
  restoreRangerTirelessOnLongRest,
  restoreRangerWinterWalkerChillingRetributionOnLongRest,
  restoreRangerWinterWalkerFrozenHauntOnLongRest,
  restoreRangerWinterWalkerFortifyingSoulOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/ranger/ranger";
import {
  getRogueSpellThiefUsesTotal,
  getRogueStrokeOfLuckUsesTotal,
  restoreRogueSpellThiefOnLongRest,
  restoreRogueStrokeOfLuckOnLongRest,
  restoreRogueStrokeOfLuckOnShortRest
} from "../../../../../pages/CharactersPage/classFeatures/rogue/rogue";
import {
  getRogueScionOfTheThreeBloodthirstUsesTotal,
  hasRogueScionOfTheThreeDreadIncarnateFeature,
  restoreRogueScionOfTheThreeBloodthirstOnShortRest,
  restoreRogueScionOfTheThreeBloodthirstOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueScionOfTheThree";
import {
  getRogueSoulknifePsionicDiceTotal,
  getRogueSoulknifePsychicWhispersUsesTotal,
  getRogueSoulknifePsychicVeilUsesTotal,
  getRogueSoulknifeRendMindUsesTotal,
  restoreAllRogueSoulknifePsionicDice,
  restoreRogueSoulknifePsychicWhispersOnLongRest,
  restoreRogueSoulknifePsychicVeilOnLongRest,
  restoreRogueSoulknifeRendMindOnLongRest,
  restoreRogueSoulknifePsionicDie
} from "../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueSoulknife";
import {
  applySorcerousRestorationOnShortRest,
  getInnateSorceryUsesTotal,
  getSorcerousRestorationUsesRemaining,
  getSorcerousRestorationUsesTotal,
  getSorceryPointsTotal,
  restoreInnateSorceryOnLongRest,
  restoreSorcerousRestorationOnLongRest,
  restoreSorceryPointsOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/sorcerer/sorcerer";
import {
  getSorcererSubclassClockworkCavalcadeUsesTotal,
  getSorcererSubclassCrownOfSpellfireUsesTotal,
  getSorcererSubclassDragonWingsUsesTotal,
  getSorcererSubclassRestoreBalanceUsesTotal,
  getSorcererSubclassTamedSurgeUsesTotal,
  getSorcererSubclassTidesOfChaosUsesTotal,
  getSorcererSubclassTranceOfOrderUsesTotal,
  getSorcererSubclassWarpingImplosionUsesTotal,
  restoreSorcererSubclassFeaturesOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses";
import {
  applyWarlockCelestialResilienceTemporaryHitPoints,
  getWarlockBeguilingDefenseUsesTotal,
  getWarlockCelestialResilienceTemporaryHitPoints,
  getWarlockClairvoyantCombatantUsesTotal,
  getContactPatronUsesTotal,
  getWarlockDarkOnesOwnLuckUsesTotal,
  getWarlockHurlThroughHellUsesTotal,
  getWarlockHealingLightDiceTotal,
  getWarlockSearingVengeanceUsesTotal,
  getWarlockStepsOfTheFeyUsesTotal,
  getWarlockMagicalCunningUsesTotal,
  hasWarlockFeature,
  restoreWarlockBeguilingDefenseOnLongRest,
  restoreWarlockClairvoyantCombatantOnLongRest,
  restoreWarlockClairvoyantCombatantOnShortRest,
  restoreContactPatronOnLongRest,
  restoreWarlockDarkOnesOwnLuckOnLongRest,
  restoreWarlockHurlThroughHellOnLongRest,
  restoreWarlockHealingLightOnLongRest,
  restoreWarlockSearingVengeanceOnLongRest,
  restoreMysticArcanumOnLongRest,
  restoreWarlockPactMagicSpellSlots,
  restoreWarlockMagicalCunningOnLongRest,
  restoreWarlockStepsOfTheFeyOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import {
  getArcaneRecoveryUsesTotal,
  getWizardSignatureSpellIds,
  restoreArcaneRecoveryOnLongRest,
  restoreWizardSignatureSpellsOnLongRest,
  restoreWizardSignatureSpellsOnShortRest
} from "../../../../../pages/CharactersPage/classFeatures/wizard/wizard";
import {
  getWizardBladesongUsesTotal,
  restoreWizardBladesongOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardBladesinger";
import { restoreWizardAbjurerArcaneWardOnLongRest } from "../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardAbjurer";
import {
  getWizardIllusionistIllusorySelfUsesTotal,
  getWizardIllusionistPhantasmalCreaturesUsesTotal,
  restoreWizardIllusionistIllusorySelfOnLongRest,
  restoreWizardIllusionistIllusorySelfOnShortRest,
  restoreWizardIllusionistPhantasmalCreaturesOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardIllusionist";
import {
  getWizardDivinerPortentUsesTotal,
  restoreWizardDivinerPortentOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerPortent";
import {
  hasWizardEvokerOverchannelFeature,
  restoreWizardEvokerOverchannelOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardEvoker";
import { getMagicTemporaryHitPointsFeatureForCharacter } from "../../../../../pages/CharactersPage/classFeatures/magicTemporaryHitPoints";
import { CLASS_FEATURE } from "../../../../../codex/entries";
import {
  getBoonOfFateImproveFateStateForCharacter,
  getMageSlayerGuardedMindStateForCharacter,
  restoreBoonOfFateImproveFateForCharacter,
  restoreMageSlayerGuardedMindForCharacter
} from "../../../../../pages/CharactersPage/feats/runtime";
import { getHitDiceRemainingForCharacter } from "../../../../../pages/CharactersPage/gameplay";
import { getSpellSlotTotalsForCharacter } from "../../../../../pages/CharactersPage/spellcasting";
import {
  applyLongRestToCharacterStatusEntries,
  applyShortRestToCharacterStatusEntries,
  getExhaustionLevel,
  normalizeCharacterStatusEntries,
  setCharacterExhaustionLevel
} from "../../../../../pages/CharactersPage/statusEntries";
import {
  applyLongRestToCharacterCompanions,
  applyShortRestToCharacterCompanions,
  hasFiniteCompanionDuration
} from "../../../../../pages/CharactersPage/companions";
import {
  type ExhaustionLevel,
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../../../pages/CharactersPage/traits";
import { createDefaultRoundTracker } from "../../../../../pages/CharactersPage/combat";
import {
  createDefaultDeathSaves,
  createMagicTemporaryHitPointsAssignment,
  normalizeMagicTemporaryHitPoints,
  normalizeTemporaryHitPoints
} from "../gameplayStateUtils";

import type { RestOption } from "./restOptionTypes";

export function createShortRestOptions(character: Character): RestOption[] {
  const spellSlotTotal = getSpellSlotTotalsForCharacter(
    character.className,
    character.level,
    character.subclassId
  ).reduce((sum, value) => sum + value, 0);
  const hasWarlockPactMagic = hasWarlockFeature(character, CLASS_FEATURE.PACT_MAGIC);
  const temporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);
  const rageUsesTotal = getBarbarianRageUsesTotal(character);
  const hasBarbarianRelentlessRage = hasBarbarianRelentlessRageFeature(character);
  const _barbarianRelentlessRageRecoveryAvailable =
    restoreBarbarianRelentlessRageOnShortRest(character) !== character;
  const bardicInspirationUsesTotal = getBardicInspirationUsesTotal(character);
  const bardicInspirationShortRestRecoveryAvailable =
    restoreBardicInspirationOnShortRest(character) !== character;
  const unbreakableMajestyUsesTotal = getUnbreakableMajestyUsesTotal(character);
  const secondWindUsesTotal = getFighterSecondWindUsesTotal(character);
  const groupRecoveryUsesTotal = getFighterGroupRecoveryUsesTotal(character);
  const actionSurgeUsesTotal = getFighterActionSurgeUsesTotal(character);
  const superiorityDiceTotal = getFighterBattleMasterSuperiorityDiceTotal(character);
  const psiEnergyDiceTotal = getFighterPsiWarriorEnergyDiceTotal(character);
  const psiPoweredLeapUsesTotal = getFighterPsiWarriorPsiPoweredLeapUsesTotal(character);
  const telekineticMovementUsesTotal = getFighterPsiWarriorTelekineticMovementUsesTotal(character);
  const druidWildShapeUsesTotal = getDruidWildShapeUsesTotal(character);
  const monkFocusPointsTotal = getMonkFocusPointsTotal(character);
  const channelDivinityUsesTotal = Math.max(
    getClericChannelDivinityUsesTotal(character),
    getPaladinChannelDivinityUsesTotal(character)
  );
  const warPriestUsesTotal = getClericWarPriestUsesTotal(character);
  const wardingFlareUsesTotal = getClericWardingFlareUsesTotal(character);
  const improvedWardingFlareShortRestAvailable = hasClericImprovedWardingFlareFeature(character);
  const hasTimedStatuses =
    normalizeCharacterStatusEntries(character.statusEntries).length > 0 ||
    hasFiniteCompanionDuration(character.companions);
  const exhaustionLevel = getExhaustionLevel(character.statusEntries);
  const tirelessUsesTotal = getRangerTirelessUsesTotal(character);
  const hasRogueScionDreadIncarnate = hasRogueScionOfTheThreeDreadIncarnateFeature(character);
  const rogueBloodthirstUsesTotal = getRogueScionOfTheThreeBloodthirstUsesTotal(character);
  const rogueSoulknifePsionicDiceTotal = getRogueSoulknifePsionicDiceTotal(character);
  const rogueStrokeOfLuckUsesTotal = getRogueStrokeOfLuckUsesTotal(character);
  const sorcerousRestorationUsesTotal = getSorcerousRestorationUsesTotal(character);
  const sorcerousRestorationUsesRemaining = getSorcerousRestorationUsesRemaining(character);
  const wizardSignatureSpellIds = getWizardSignatureSpellIds(character);
  const wizardIllusionistIllusorySelfUsesTotal =
    getWizardIllusionistIllusorySelfUsesTotal(character);
  const warlockCelestialResilienceTemporaryHitPoints =
    getWarlockCelestialResilienceTemporaryHitPoints(character);
  const clairvoyantCombatantUsesTotal = getWarlockClairvoyantCombatantUsesTotal(character);
  const boonOfFateImproveFateState = getBoonOfFateImproveFateStateForCharacter(character);
  const mageSlayerGuardedMindState = getMageSlayerGuardedMindStateForCharacter(character);

  return [
    {
      id: "reset-round-tracker",
      label: "Reset round tracker",
      apply: (currentCharacter) => ({
        ...currentCharacter,
        roundTracker: createDefaultRoundTracker()
      })
    },
    ...(boonOfFateImproveFateState
      ? [
          {
            id: "restore-boon-of-fate-improve-fate",
            label: "Restore Improve Fate",
            charges: {
              current: boonOfFateImproveFateState.usesRemaining,
              total: boonOfFateImproveFateState.usesTotal
            },
            disabled:
              boonOfFateImproveFateState.usesRemaining >= boonOfFateImproveFateState.usesTotal,
            apply: (currentCharacter: Character) =>
              restoreBoonOfFateImproveFateForCharacter(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(mageSlayerGuardedMindState
      ? [
          {
            id: "restore-mage-slayer-guarded-mind",
            label: "Restore Mage Slayer Guarded Mind",
            charges: {
              current: mageSlayerGuardedMindState.usesRemaining,
              total: mageSlayerGuardedMindState.usesTotal
            },
            disabled:
              mageSlayerGuardedMindState.usesRemaining >= mageSlayerGuardedMindState.usesTotal,
            apply: (currentCharacter: Character) =>
              restoreMageSlayerGuardedMindForCharacter(currentCharacter)
          } satisfies RestOption
        ]
      : []),
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
    ...(warlockCelestialResilienceTemporaryHitPoints > 0
      ? [
          {
            id: "gain-celestial-resilience-temporary-hit-points",
            label: "Gain Celestial Resilience Temporary Hit Points",
            detail: `Gain ${warlockCelestialResilienceTemporaryHitPoints} Temporary Hit Points.`,
            emphasis: "feature",
            apply: (currentCharacter: Character) =>
              applyWarlockCelestialResilienceTemporaryHitPoints(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(hasTimedStatuses
      ? [
          {
            id: "update-statuses",
            label: "Update Traits & Conditions",
            detail:
              "Ends Short Rest effects, durations below 1 hour, Concentration-linked effects, and matching companion durations.",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              statusEntries: applyShortRestToCharacterStatusEntries(currentCharacter.statusEntries),
              companions: applyShortRestToCharacterCompanions(currentCharacter.companions)
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
    ...(bardicInspirationShortRestRecoveryAvailable && bardicInspirationUsesTotal > 0
      ? [
          {
            id: "restore-bardic-inspiration",
            label: "Restore all Bardic dice",
            apply: (currentCharacter: Character) => applyShortRestToBardFeatures(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(unbreakableMajestyUsesTotal > 0
      ? [
          {
            id: "restore-unbreakable-majesty",
            label: "Restore Unbreakable Majesty",
            apply: (currentCharacter: Character) =>
              restoreUnbreakableMajestyOnShortRest(currentCharacter)
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
    ...(groupRecoveryUsesTotal > 0
      ? [
          {
            id: "restore-group-recovery",
            label: "Restore Group Recovery",
            apply: (currentCharacter: Character) =>
              restoreFighterGroupRecoveryOnShortRest(currentCharacter)
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
    ...(superiorityDiceTotal > 0
      ? [
          {
            id: "restore-superiority-dice",
            label: "Restore all Superiority Dice",
            apply: (currentCharacter: Character) =>
              restoreFighterBattleMasterSuperiorityDiceOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(psiEnergyDiceTotal > 0
      ? [
          {
            id: "restore-psi-energy-die",
            label: "Restore 1 Psi Energy Die",
            apply: (currentCharacter: Character) =>
              restoreFighterPsiWarriorEnergyDiceOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(psiPoweredLeapUsesTotal > 0
      ? [
          {
            id: "restore-psi-powered-leap",
            label: "Restore Psi-Powered Leap",
            apply: (currentCharacter: Character) =>
              restoreFighterPsiWarriorPsiPoweredLeapOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(telekineticMovementUsesTotal > 0
      ? [
          {
            id: "restore-telekinetic-movement",
            label: "Restore Telekinetic Movement",
            apply: (currentCharacter: Character) =>
              restoreFighterPsiWarriorTelekineticMovementOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(druidWildShapeUsesTotal > 0
      ? [
          {
            id: "restore-wild-shape",
            label: "Restore 1 Wild Shape use",
            apply: (currentCharacter: Character) => restoreOneDruidWildShapeUse(currentCharacter)
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
    ...(improvedWardingFlareShortRestAvailable && wardingFlareUsesTotal > 0
      ? [
          {
            id: "restore-warding-flare",
            label: "Restore all Warding Flare uses",
            apply: (currentCharacter: Character) =>
              restoreClericWardingFlareOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(warPriestUsesTotal > 0
      ? [
          {
            id: "restore-war-priest",
            label: "Restore all War Priest charges",
            apply: (currentCharacter: Character) =>
              restoreClericWarPriestOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(hasRogueScionDreadIncarnate && rogueBloodthirstUsesTotal > 0
      ? [
          {
            id: "restore-bloodthirst",
            label: "Restore 1 Bloodthirst use",
            detail: "Cutthroat restores one expended Bloodthirst use on a Short Rest.",
            apply: (currentCharacter: Character) =>
              restoreRogueScionOfTheThreeBloodthirstOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rogueSoulknifePsionicDiceTotal > 0
      ? [
          {
            id: "restore-rogue-soulknife-psionic-die",
            label: "Restore 1 Psionic Die",
            apply: (currentCharacter: Character) =>
              restoreRogueSoulknifePsionicDie(currentCharacter)
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
    ...(clairvoyantCombatantUsesTotal > 0
      ? [
          {
            id: "restore-clairvoyant-combatant",
            label: "Restore Clairvoyant Combatant",
            apply: (currentCharacter: Character) =>
              restoreWarlockClairvoyantCombatantOnShortRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(wizardIllusionistIllusorySelfUsesTotal > 0
      ? [
          {
            id: "restore-illusory-self",
            label: "Restore Illusory Self",
            apply: (currentCharacter: Character) =>
              restoreWizardIllusionistIllusorySelfOnShortRest(currentCharacter)
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
            charges: {
              current: sorcerousRestorationUsesRemaining,
              total: sorcerousRestorationUsesTotal
            },
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
