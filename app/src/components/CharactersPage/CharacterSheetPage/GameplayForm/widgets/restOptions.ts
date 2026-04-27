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
import { getMagicTemporaryHitPointsFeatureForCharacter } from "../../../../../pages/CharactersPage/classFeatures";
import { CLASS_FEATURE } from "../../../../../codex/entries";
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
  reconcileCharacterStatusConsequences,
} from "../../../../../pages/CharactersPage/traits";
import { createDefaultRoundTracker } from "../../../../../pages/CharactersPage/combat";
import {
  createDefaultDeathSaves,
  createMagicTemporaryHitPointsAssignment,
  normalizeMagicTemporaryHitPoints,
  normalizeTemporaryHitPoints
} from "../gameplayStateUtils";

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
    character.level,
    character.subclassId
  ).reduce((sum, value) => sum + value, 0);
  const hasWarlockPactMagic = hasWarlockFeature(character, CLASS_FEATURE.PACT_MAGIC);
  const magicTemporaryHitPointsFeature = getMagicTemporaryHitPointsFeatureForCharacter(character);
  const magicTemporaryHitPoints = normalizeMagicTemporaryHitPoints(
    character.magicTemporaryHitPoints
  );
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
  const blessingOfMoonlightUsesTotal = getBlessingOfMoonlightUsesTotal(character);
  const beguilingMagicUsesTotal = getBeguilingMagicUsesTotal(character);
  const mantleOfMajestyUsesTotal = getMantleOfMajestyUsesTotal(character);
  const unbreakableMajestyUsesTotal = getUnbreakableMajestyUsesTotal(character);
  const divineForeknowledgeUsesTotal = getDivineForeknowledgeUsesTotal(character);
  const coronaOfLightUsesTotal = getClericCoronaOfLightUsesTotal(character);
  const warPriestUsesTotal = getClericWarPriestUsesTotal(character);
  const wardingFlareUsesTotal = getClericWardingFlareUsesTotal(character);
  const secondWindUsesTotal = getFighterSecondWindUsesTotal(character);
  const groupRecoveryUsesTotal = getFighterGroupRecoveryUsesTotal(character);
  const actionSurgeUsesTotal = getFighterActionSurgeUsesTotal(character);
  const indomitableUsesTotal = getFighterIndomitableUsesTotal(character);
  const knowYourEnemyUsesTotal = getFighterBattleMasterKnowYourEnemyUsesTotal(character);
  const superiorityDiceTotal = getFighterBattleMasterSuperiorityDiceTotal(character);
  const psiEnergyDiceTotal = getFighterPsiWarriorEnergyDiceTotal(character);
  const psiPoweredLeapUsesTotal = getFighterPsiWarriorPsiPoweredLeapUsesTotal(character);
  const telekineticMovementUsesTotal = getFighterPsiWarriorTelekineticMovementUsesTotal(character);
  const bulwarkOfForceUsesTotal = getFighterPsiWarriorBulwarkOfForceUsesTotal(character);
  const telekineticMasterUsesTotal = getFighterPsiWarriorTelekineticMasterUsesTotal(character);
  const druidWildShapeUsesTotal = getDruidWildShapeUsesTotal(character);
  const druidCosmicOmenUsesTotal = getDruidCosmicOmenUsesTotal(character);
  const druidStarMapGuidingBoltUsesTotal = getDruidStarMapGuidingBoltUsesTotal(character);
  const druidMoonlightStepUsesTotal = getDruidMoonlightStepUsesTotal(character);
  const druidNaturalRecoveryUsesTotal = getDruidNaturalRecoveryUsesTotal(character);
  const druidWildResurgenceUsesTotal = getDruidWildResurgenceSpellSlotRecoveryUsesTotal(character);
  const druidNatureMagicianUsesTotal = getDruidNatureMagicianUsesTotal(character);
  const paladinHealingPoolTotal = getPaladinHealingPoolTotal(character);
  const paladinsSmiteUsesTotal = getPaladinsSmiteUsesTotal(character);
  const faithfulSteedUsesTotal = getFaithfulSteedUsesTotal(character);
  const undyingSentinelUsesTotal = getUndyingSentinelUsesTotal(character);
  const holyNimbusUsesTotal = getHolyNimbusUsesTotal(character);
  const gloriousDefenseUsesTotal = getGloriousDefenseUsesTotal(character);
  const elementalRebukeUsesTotal = getElementalRebukeUsesTotal(character);
  const livingLegendUsesTotal = getLivingLegendUsesTotal(character);
  const nobleScionUsesTotal = getNobleScionUsesTotal(character);
  const avengingAngelUsesTotal = getAvengingAngelUsesTotal(character);
  const elderChampionUsesTotal = getElderChampionUsesTotal(character);
  const rangerFeyReinforcementsUsesTotal = getRangerFeyReinforcementsUsesTotal(character);
  const rangerFavoredEnemyUsesTotal = getRangerFavoredEnemyUsesTotal(character);
  const rangerDreadAmbusherUsesTotal = getRangerGloomStalkerDreadAmbusherUsesTotal(character);
  const rangerMistyWandererUsesTotal = getRangerMistyWandererUsesTotal(character);
  const rangerNaturesVeilUsesTotal = getRangerNaturesVeilUsesTotal(character);
  const rangerTirelessUsesTotal = getRangerTirelessUsesTotal(character);
  const rangerChillingRetributionUsesTotal =
    getRangerWinterWalkerChillingRetributionUsesTotal(character);
  const rangerFrozenHauntUsesTotal = getRangerWinterWalkerFrozenHauntUsesTotal(character);
  const rangerFortifyingSoulUsesTotal = getRangerWinterWalkerFortifyingSoulUsesTotal(character);
  const rogueBloodthirstUsesTotal = getRogueScionOfTheThreeBloodthirstUsesTotal(character);
  const rogueSoulknifePsionicDiceTotal = getRogueSoulknifePsionicDiceTotal(character);
  const rogueSoulknifePsychicWhispersUsesTotal =
    getRogueSoulknifePsychicWhispersUsesTotal(character);
  const rogueSoulknifePsychicVeilUsesTotal = getRogueSoulknifePsychicVeilUsesTotal(character);
  const rogueSoulknifeRendMindUsesTotal = getRogueSoulknifeRendMindUsesTotal(character);
  const rogueSpellThiefUsesTotal = getRogueSpellThiefUsesTotal(character);
  const rogueStrokeOfLuckUsesTotal = getRogueStrokeOfLuckUsesTotal(character);
  const sorceryPointsTotal = getSorceryPointsTotal(character);
  const innateSorceryUsesTotal = getInnateSorceryUsesTotal(character);
  const sorcerousRestorationUsesTotal = getSorcerousRestorationUsesTotal(character);
  const sorcererClockworkCavalcadeUsesTotal =
    getSorcererSubclassClockworkCavalcadeUsesTotal(character);
  const sorcererCrownOfSpellfireUsesTotal = getSorcererSubclassCrownOfSpellfireUsesTotal(character);
  const sorcererDragonWingsUsesTotal = getSorcererSubclassDragonWingsUsesTotal(character);
  const sorcererRestoreBalanceUsesTotal = getSorcererSubclassRestoreBalanceUsesTotal(character);
  const sorcererTamedSurgeUsesTotal = getSorcererSubclassTamedSurgeUsesTotal(character);
  const sorcererTidesOfChaosUsesTotal = getSorcererSubclassTidesOfChaosUsesTotal(character);
  const sorcererTranceOfOrderUsesTotal = getSorcererSubclassTranceOfOrderUsesTotal(character);
  const sorcererWarpingImplosionUsesTotal = getSorcererSubclassWarpingImplosionUsesTotal(character);
  const magicalCunningUsesTotal = getWarlockMagicalCunningUsesTotal(character);
  const warlockCelestialResilienceTemporaryHitPoints =
    getWarlockCelestialResilienceTemporaryHitPoints(character);
  const arcaneRecoveryUsesTotal = getArcaneRecoveryUsesTotal(character);
  const wizardBladesongUsesTotal = getWizardBladesongUsesTotal(character);
  const wizardIllusionistIllusorySelfUsesTotal =
    getWizardIllusionistIllusorySelfUsesTotal(character);
  const wizardIllusionistPhantasmalCreaturesUsesTotal =
    getWizardIllusionistPhantasmalCreaturesUsesTotal(character);
  const wizardDivinerPortentUsesTotal = getWizardDivinerPortentUsesTotal(character);
  const wizardSignatureSpellIds = getWizardSignatureSpellIds(character);
  const darkOnesOwnLuckUsesTotal = getWarlockDarkOnesOwnLuckUsesTotal(character);
  const hurlThroughHellUsesTotal = getWarlockHurlThroughHellUsesTotal(character);
  const stepsOfTheFeyUsesTotal = getWarlockStepsOfTheFeyUsesTotal(character);
  const beguilingDefenseUsesTotal = getWarlockBeguilingDefenseUsesTotal(character);
  const clairvoyantCombatantUsesTotal = getWarlockClairvoyantCombatantUsesTotal(character);
  const contactPatronUsesTotal = getContactPatronUsesTotal(character);
  const healingLightDiceTotal = getWarlockHealingLightDiceTotal(character);
  const searingVengeanceUsesTotal = getWarlockSearingVengeanceUsesTotal(character);
  const hasMysticArcanum = hasWarlockFeature(character, CLASS_FEATURE.MYSTIC_ARCANUM);
  const monkFocusPointsTotal = getMonkFocusPointsTotal(character);
  const monkFlurryOfHealingAndHarmUsesTotal = getMonkFlurryOfHealingAndHarmUsesTotal(character);
  const monkHandOfUltimateJusticeUsesTotal = getMonkHandOfUltimateJusticeUsesTotal(character);
  const monkWholenessOfBodyUsesTotal = getMonkWholenessOfBodyUsesTotal(character);
  const hasUncannyMetabolism = hasMonkFeature(character, CLASS_FEATURE.UNCANNY_METABOLISM);
  const channelDivinityUsesTotal = Math.max(
    getClericChannelDivinityUsesTotal(character),
    getPaladinChannelDivinityUsesTotal(character)
  );
  const hasTimedStatuses =
    normalizeCharacterStatusEntries(character.statusEntries).length > 0 ||
    hasFiniteCompanionDuration(character.companions);
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
    ...(magicTemporaryHitPointsFeature && magicTemporaryHitPoints > 0
      ? [
          {
            id: "clear-magic-temporary-hit-points",
            label: `Reset ${magicTemporaryHitPointsFeature.modalTitle}`,
            detail: "Reset this Magical Temporary HP pool to 0.",
            emphasis: "feature",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              ...createMagicTemporaryHitPointsAssignment(0)
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
              "Ends Short Rest and Long Rest effects along with expiring timed statuses and companion durations.",
            apply: (currentCharacter: Character) => ({
              ...currentCharacter,
              statusEntries: applyLongRestToCharacterStatusEntries(currentCharacter.statusEntries),
              companions: applyLongRestToCharacterCompanions(currentCharacter.companions)
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
    ...(blessingOfMoonlightUsesTotal > 0
      ? [
          {
            id: "restore-blessing-of-moonlight",
            label: "Restore Blessing of Moonlight",
            apply: (currentCharacter: Character) =>
              restoreBlessingOfMoonlightOnLongRest(currentCharacter)
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
    ...(unbreakableMajestyUsesTotal > 0
      ? [
          {
            id: "restore-unbreakable-majesty",
            label: "Restore Unbreakable Majesty",
            apply: (currentCharacter: Character) =>
              restoreUnbreakableMajestyOnLongRest(currentCharacter)
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
    ...(groupRecoveryUsesTotal > 0
      ? [
          {
            id: "restore-group-recovery",
            label: "Restore Group Recovery",
            apply: (currentCharacter: Character) =>
              restoreFighterGroupRecoveryOnLongRest(currentCharacter)
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
    ...(superiorityDiceTotal > 0
      ? [
          {
            id: "restore-superiority-dice",
            label: "Restore all Superiority Dice",
            apply: (currentCharacter: Character) =>
              restoreFighterBattleMasterSuperiorityDiceOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(knowYourEnemyUsesTotal > 0
      ? [
          {
            id: "restore-know-your-enemy",
            label: "Restore Know Your Enemy",
            apply: (currentCharacter: Character) =>
              restoreFighterBattleMasterKnowYourEnemyOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(psiEnergyDiceTotal > 0
      ? [
          {
            id: "restore-psi-energy-dice",
            label: "Restore all Psi Energy Dice",
            apply: (currentCharacter: Character) =>
              restoreFighterPsiWarriorEnergyDiceOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(psiPoweredLeapUsesTotal > 0
      ? [
          {
            id: "restore-psi-powered-leap",
            label: "Restore Psi-Powered Leap",
            apply: (currentCharacter: Character) =>
              restoreFighterPsiWarriorPsiPoweredLeapOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(telekineticMovementUsesTotal > 0
      ? [
          {
            id: "restore-telekinetic-movement",
            label: "Restore Telekinetic Movement",
            apply: (currentCharacter: Character) =>
              restoreFighterPsiWarriorTelekineticMovementOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(bulwarkOfForceUsesTotal > 0
      ? [
          {
            id: "restore-bulwark-of-force",
            label: "Restore Bulwark of Force",
            apply: (currentCharacter: Character) =>
              restoreFighterPsiWarriorBulwarkOfForceOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(telekineticMasterUsesTotal > 0
      ? [
          {
            id: "restore-telekinetic-master",
            label: "Restore Telekinetic Master",
            apply: (currentCharacter: Character) =>
              restoreFighterPsiWarriorTelekineticMasterOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(druidWildShapeUsesTotal > 0
      ? [
          {
            id: "restore-wild-shape",
            label: "Restore all Wild Shape uses",
            apply: (currentCharacter: Character) => restoreAllDruidWildShapeUses(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(druidStarMapGuidingBoltUsesTotal > 0
      ? [
          {
            id: "restore-druids-guiding-bolt",
            label: "Restore Star Map charges",
            apply: (currentCharacter: Character) =>
              restoreDruidStarMapGuidingBoltOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(druidCosmicOmenUsesTotal > 0
      ? [
          {
            id: "restore-cosmic-omen",
            label: "Restore Cosmic Omen",
            apply: (currentCharacter: Character) =>
              restoreDruidCosmicOmenOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(druidMoonlightStepUsesTotal > 0
      ? [
          {
            id: "restore-moonlight-step",
            label: "Restore Moonlight Step",
            apply: (currentCharacter: Character) =>
              restoreDruidMoonlightStepOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(druidNatureMagicianUsesTotal > 0
      ? [
          {
            id: "restore-nature-magician",
            label: "Restore Nature Magician",
            apply: (currentCharacter: Character) =>
              restoreDruidNatureMagicianOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(druidNaturalRecoveryUsesTotal > 0
      ? [
          {
            id: "restore-natural-recovery",
            label: "Restore Natural Recovery",
            apply: (currentCharacter: Character) =>
              restoreDruidNaturalRecoveryOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(druidWildResurgenceUsesTotal > 0
      ? [
          {
            id: "restore-wild-resurgence",
            label: "Restore Wild Resurgence",
            apply: (currentCharacter: Character) =>
              restoreDruidWildResurgenceOnLongRest(currentCharacter)
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
    ...(undyingSentinelUsesTotal > 0
      ? [
          {
            id: "restore-undying-sentinel",
            label: "Restore Undying Sentinel",
            apply: (currentCharacter: Character) =>
              restoreUndyingSentinelOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(holyNimbusUsesTotal > 0
      ? [
          {
            id: "restore-holy-nimbus",
            label: "Restore Holy Nimbus",
            apply: (currentCharacter: Character) => restoreHolyNimbusOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(gloriousDefenseUsesTotal > 0
      ? [
          {
            id: "restore-glorious-defense",
            label: "Restore Glorious Defense",
            apply: (currentCharacter: Character) =>
              restoreGloriousDefenseOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(elementalRebukeUsesTotal > 0
      ? [
          {
            id: "restore-elemental-rebuke",
            label: "Restore Elemental Rebuke",
            apply: (currentCharacter: Character) =>
              restoreElementalRebukeOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(livingLegendUsesTotal > 0
      ? [
          {
            id: "restore-living-legend",
            label: "Restore Living Legend",
            apply: (currentCharacter: Character) => restoreLivingLegendOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(nobleScionUsesTotal > 0
      ? [
          {
            id: "restore-noble-scion",
            label: "Restore Noble Scion",
            apply: (currentCharacter: Character) => restoreNobleScionOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(avengingAngelUsesTotal > 0
      ? [
          {
            id: "restore-avenging-angel",
            label: "Restore Avenging Angel",
            apply: (currentCharacter: Character) => restoreAvengingAngelOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(elderChampionUsesTotal > 0
      ? [
          {
            id: "restore-elder-champion",
            label: "Restore Elder Champion",
            apply: (currentCharacter: Character) => restoreElderChampionOnLongRest(currentCharacter)
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
    ...(rangerFeyReinforcementsUsesTotal > 0
      ? [
          {
            id: "restore-fey-reinforcements",
            label: "Restore Fey Reinforcements",
            apply: (currentCharacter: Character) =>
              restoreRangerFeyReinforcementsOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rangerDreadAmbusherUsesTotal > 0
      ? [
          {
            id: "restore-dread-ambusher",
            label: "Restore Dread Ambusher",
            apply: (currentCharacter: Character) =>
              restoreRangerGloomStalkerDreadAmbusherOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rangerMistyWandererUsesTotal > 0
      ? [
          {
            id: "restore-misty-wanderer",
            label: "Restore Misty Wanderer",
            apply: (currentCharacter: Character) =>
              restoreRangerMistyWandererOnLongRest(currentCharacter)
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
    ...(rangerFortifyingSoulUsesTotal > 0
      ? [
          {
            id: "restore-fortifying-soul",
            label: "Restore Fortifying Soul",
            apply: (currentCharacter: Character) =>
              restoreRangerWinterWalkerFortifyingSoulOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rangerChillingRetributionUsesTotal > 0
      ? [
          {
            id: "restore-chilling-retribution",
            label: "Restore Chilling Retribution",
            apply: (currentCharacter: Character) =>
              restoreRangerWinterWalkerChillingRetributionOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rangerFrozenHauntUsesTotal > 0
      ? [
          {
            id: "restore-frozen-haunt",
            label: "Restore Frozen Haunt",
            apply: (currentCharacter: Character) =>
              restoreRangerWinterWalkerFrozenHauntOnLongRest(currentCharacter)
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
    ...(sorcererTidesOfChaosUsesTotal > 0
      ? [
          {
            id: "restore-tides-of-chaos",
            label: "Restore Tides of Chaos",
            apply: (currentCharacter: Character) =>
              restoreSorcererSubclassFeaturesOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(sorcererTamedSurgeUsesTotal > 0
      ? [
          {
            id: "restore-tamed-surge",
            label: "Restore Tamed Surge",
            apply: (currentCharacter: Character) =>
              restoreSorcererSubclassFeaturesOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(sorcererCrownOfSpellfireUsesTotal > 0
      ? [
          {
            id: "restore-crown-of-spellfire",
            label: "Restore Crown of Spellfire",
            apply: (currentCharacter: Character) =>
              restoreSorcererSubclassFeaturesOnLongRest(currentCharacter)
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
    ...(sorcererDragonWingsUsesTotal > 0
      ? [
          {
            id: "restore-dragon-wings",
            label: "Restore Dragon Wings",
            apply: (currentCharacter: Character) =>
              restoreSorcererSubclassFeaturesOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(sorcererRestoreBalanceUsesTotal > 0
      ? [
          {
            id: "restore-balance",
            label: "Restore Balance",
            apply: (currentCharacter: Character) =>
              restoreSorcererSubclassFeaturesOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(sorcererClockworkCavalcadeUsesTotal > 0
      ? [
          {
            id: "restore-clockwork-cavalcade",
            label: "Restore Clockwork Cavalcade",
            apply: (currentCharacter: Character) =>
              restoreSorcererSubclassFeaturesOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(sorcererTranceOfOrderUsesTotal > 0
      ? [
          {
            id: "restore-trance-of-order",
            label: "Restore Trance of Order",
            apply: (currentCharacter: Character) =>
              restoreSorcererSubclassFeaturesOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(sorcererWarpingImplosionUsesTotal > 0
      ? [
          {
            id: "restore-warping-implosion",
            label: "Restore Warping Implosion",
            apply: (currentCharacter: Character) =>
              restoreSorcererSubclassFeaturesOnLongRest(currentCharacter)
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
    ...(darkOnesOwnLuckUsesTotal > 0
      ? [
          {
            id: "restore-dark-ones-own-luck",
            label: "Restore Dark One's Own Luck",
            apply: (currentCharacter: Character) =>
              restoreWarlockDarkOnesOwnLuckOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(hurlThroughHellUsesTotal > 0
      ? [
          {
            id: "restore-hurl-through-hell",
            label: "Restore Hurl Through Hell",
            apply: (currentCharacter: Character) =>
              restoreWarlockHurlThroughHellOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(stepsOfTheFeyUsesTotal > 0
      ? [
          {
            id: "restore-steps-of-the-fey",
            label: "Restore Steps of the Fey",
            apply: (currentCharacter: Character) =>
              restoreWarlockStepsOfTheFeyOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(beguilingDefenseUsesTotal > 0
      ? [
          {
            id: "restore-beguiling-defense",
            label: "Restore Beguiling Defense",
            apply: (currentCharacter: Character) =>
              restoreWarlockBeguilingDefenseOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(clairvoyantCombatantUsesTotal > 0
      ? [
          {
            id: "restore-clairvoyant-combatant",
            label: "Restore Clairvoyant Combatant",
            apply: (currentCharacter: Character) =>
              restoreWarlockClairvoyantCombatantOnLongRest(currentCharacter)
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
    ...(wizardBladesongUsesTotal > 0
      ? [
          {
            id: "restore-bladesong",
            label: "Restore Bladesong",
            apply: (currentCharacter: Character) =>
              restoreWizardBladesongOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(wizardIllusionistIllusorySelfUsesTotal > 0
      ? [
          {
            id: "restore-illusory-self",
            label: "Restore Illusory Self",
            apply: (currentCharacter: Character) =>
              restoreWizardIllusionistIllusorySelfOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(wizardIllusionistPhantasmalCreaturesUsesTotal > 0
      ? [
          {
            id: "restore-phantasmal-creatures",
            label: "Restore Phantasmal Creatures",
            apply: (currentCharacter: Character) =>
              restoreWizardIllusionistPhantasmalCreaturesOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(wizardDivinerPortentUsesTotal > 0
      ? [
          {
            id: "restore-portent",
            label: "Restore Portent",
            detail: "Clear old foretelling rolls and ready new Portent rolls.",
            apply: (currentCharacter: Character) =>
              restoreWizardDivinerPortentOnLongRest(currentCharacter)
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
    ...(healingLightDiceTotal > 0
      ? [
          {
            id: "restore-healing-light",
            label: "Restore all Healing d6",
            apply: (currentCharacter: Character) =>
              restoreWarlockHealingLightOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(searingVengeanceUsesTotal > 0
      ? [
          {
            id: "restore-searing-vengeance",
            label: "Restore Searing Vengeance",
            apply: (currentCharacter: Character) =>
              restoreWarlockSearingVengeanceOnLongRest(currentCharacter)
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
    ...(rogueSpellThiefUsesTotal > 0
      ? [
          {
            id: "restore-spell-thief",
            label: "Restore Spell Thief",
            apply: (currentCharacter: Character) =>
              restoreRogueSpellThiefOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rogueBloodthirstUsesTotal > 0
      ? [
          {
            id: "restore-bloodthirst",
            label: "Restore Bloodthirst",
            apply: (currentCharacter: Character) =>
              restoreRogueScionOfTheThreeBloodthirstOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rogueSoulknifePsionicDiceTotal > 0
      ? [
          {
            id: "restore-rogue-soulknife-psionic-dice",
            label: "Restore all Psionic Dice",
            apply: (currentCharacter: Character) =>
              restoreAllRogueSoulknifePsionicDice(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rogueSoulknifePsychicWhispersUsesTotal > 0
      ? [
          {
            id: "restore-rogue-soulknife-psychic-whispers",
            label: "Restore Psychic Whispers",
            apply: (currentCharacter: Character) =>
              restoreRogueSoulknifePsychicWhispersOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rogueSoulknifePsychicVeilUsesTotal > 0
      ? [
          {
            id: "restore-rogue-soulknife-psychic-veil",
            label: "Restore Psychic Veil",
            apply: (currentCharacter: Character) =>
              restoreRogueSoulknifePsychicVeilOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(rogueSoulknifeRendMindUsesTotal > 0
      ? [
          {
            id: "restore-rogue-soulknife-rend-mind",
            label: "Restore Rend Mind",
            apply: (currentCharacter: Character) =>
              restoreRogueSoulknifeRendMindOnLongRest(currentCharacter)
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
    ...(monkFlurryOfHealingAndHarmUsesTotal > 0
      ? [
          {
            id: "restore-flurry-of-healing-and-harm",
            label: "Restore Flurry of Healing and Harm",
            apply: (currentCharacter: Character) =>
              restoreMonkFlurryOfHealingAndHarmOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(monkHandOfUltimateJusticeUsesTotal > 0
      ? [
          {
            id: "restore-hand-of-ultimate-justice",
            label: "Restore Hand of Ultimate Justice",
            apply: (currentCharacter: Character) =>
              restoreMonkHandOfUltimateJusticeOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(monkWholenessOfBodyUsesTotal > 0
      ? [
          {
            id: "restore-wholeness-of-body",
            label: "Restore Wholeness of Body",
            apply: (currentCharacter: Character) =>
              restoreMonkWholenessOfBodyOnLongRest(currentCharacter)
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
    ...(wardingFlareUsesTotal > 0
      ? [
          {
            id: "restore-warding-flare",
            label: "Restore all Warding Flare uses",
            apply: (currentCharacter: Character) =>
              restoreClericWardingFlareOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(warPriestUsesTotal > 0
      ? [
          {
            id: "restore-war-priest",
            label: "Restore all War Priest charges",
            apply: (currentCharacter: Character) =>
              restoreClericWarPriestOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : []),
    ...(coronaOfLightUsesTotal > 0
      ? [
          {
            id: "restore-corona-of-light",
            label: "Restore all Corona of Light uses",
            apply: (currentCharacter: Character) =>
              restoreClericCoronaOfLightOnLongRest(currentCharacter)
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
      : []),
    ...(divineForeknowledgeUsesTotal > 0
      ? [
          {
            id: "restore-divine-foreknowledge",
            label: "Restore Divine Foreknowledge",
            apply: (currentCharacter: Character) =>
              restoreClericDivineForeknowledgeOnLongRest(currentCharacter)
          } satisfies RestOption
        ]
      : [])
  ];
}
