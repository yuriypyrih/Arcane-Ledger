import { renderFormFooter } from "./uiAdapters";
import { formOfDreadActionKey } from "../../../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockUndeadPatron";
import clsx from "clsx";

import ActionShape from "../../../../../ActionShape";

import FeatureOptInToggle from "../../../FeatureOptInToggle/FeatureOptInToggle";

import {
  getSorceryPointsRemainingForCharacter,
  setRangerHunterHordeBreakerActionKeyForCharacter
} from "../../../../../../pages/CharactersPage/classFeatures";
import { bardicInspirationActionKey } from "../../../../../../pages/CharactersPage/classFeatures/bard/bard";
import {
  createChargesCardUsage,
  createFeatureActionCardCost,
  createNamedResourceCardUsage
} from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  boonOfFateImproveFateActionKey,
  durableSpeedyRecoveryActionKey,
  luckyFeatActionKey,
  purpleDragonCommandantEncourageAllyActionKey,
  resetLuckyPointForCharacter,
  restoreLuckyPointsForCharacter,
  spendLuckyPointForCharacter
} from "../../../../../../pages/CharactersPage/feats/runtime";
import { mantleOfInspirationActionKey } from "../../../../../../pages/CharactersPage/classFeatures/bard/subclasses/bardCollegeOfGlamour";

import { barbarianRageActionKey } from "../../../../../../pages/CharactersPage/classFeatures/barbarian/barbarian";
import { fighterSecondWindActionKey } from "../../../../../../pages/CharactersPage/classFeatures/fighter/fighter";

import {
  fortifyingSoulActionKey,
  tirelessActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/ranger/ranger";
import { rangerBeastMasterReviveActionKey } from "../../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerBeastMaster";
import {
  innateSorceryActionKey,
  metamagicActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/sorcerer";
import { sorcererWarpingImplosionActionKey } from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses/sorcererAberrantSorcery";

import { sorcererWildMagicSurgeActionKey } from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses/sorcererWildMagicSorcery";
import {
  darkOnesOwnLuckActionKey,
  hurlThroughHellActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import { awakenedMindActionKey } from "../../../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockGreatOldOnePatron";

import { wizardAbjurerArcaneWardActionKey } from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses";

import {
  rebornKnowledgeFromPastLifeActionKey,
  shifterBeasthideOptionKey,
  shifterShiftingActionKey
} from "../../../../../../pages/CharactersPage/species";

import {
  rogueSoulknifePsychicTeleportationActionKey,
  rogueSoulknifePsychicWhispersActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueSoulknife";
import { type GameplayActionDefinition } from "../../../../../../pages/CharactersPage/combatActions";
import { isCommonActionKey } from "../../../../../../pages/CharactersPage/commonActions";

import { getActionShapeForEconomyType } from "../../gameplayWidgetUtils";
import {
  runWithActionConfirmationToast,
  type ActionConfirmationToastTrigger
} from "../../../actionConfirmationToast";

import d20Icon from "../../../../../../assets/svg/d20.svg";

import ActionButton from "../../../../../ActionButton";
import styles from "./ActionsWidget.module.css";

import ActionDiceConfirmFooter from "./ActionDiceConfirmFooter";
import ActionFooterButtonRow from "./ActionFooterButtonRow";
import FortifyingSoulActionFooter from "./FortifyingSoulActionFooter";
import { ArcaneWardActionFooter } from "./ArcaneWardActionFooter";
import { BardicInspirationActionFooter } from "./BardicInspirationActionFooter";
import { BeastMasterReviveActionFooter } from "./BeastMasterReviveActionFooter";

import DiceRollerSettingsButton from "../DiceRollerSettingsButton";
import WeaponAttackFooterButtons from "./WeaponAttackFooterButtons";

import { FighterSecondWindActionFooter } from "./FighterSecondWindAction";

import { SorcererInnateSorceryActionFooter } from "./SorcererInnateSorceryAction";

import { WarlockAwakenedMindActionFooter } from "./WarlockAwakenedMindAction";

import RangerHunterWeaponOptions from "./RangerHunterWeaponOptions";

import {
  monkFlurryOfBlowsActionKey,
  monkPatientDefenseActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/monk/monk";
import { monkHandOfHealingActionKey } from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfMercy";
import {
  monkWarriorOfTheOpenHandQuiveringPalmFocusCost,
  monkWholenessOfBodyActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import { monkShadowStepActionKey } from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfShadow";
import { monkElementalBurstActionKey } from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheElements";
import { CommonActionFooter } from "./CommonAction";

import { ElementalBurstActionFooter } from "./ElementalBurstAction";
import { MonkHandOfHealingActionFooter } from "./MonkHandOfHealingAction";
import { MonkFlurryOfBlowsActionFooter } from "./MonkFlurryOfBlowsActionFooter";

import { getFeatureActionDrawerPrimaryLabel } from "./actionHelpers";
import type { ActionsWidgetDrawerFooterContext } from "./types";

const rollingFeatureEffectKinds = new Set([
  "second-wind",
  "speedy-recovery",
  "tactical-mind",
  "tireless"
]);
const rollingFeatureActionKeys = new Set([
  formOfDreadActionKey,
  boonOfFateImproveFateActionKey,
  darkOnesOwnLuckActionKey,
  durableSpeedyRecoveryActionKey,
  fighterSecondWindActionKey,
  fortifyingSoulActionKey,
  hurlThroughHellActionKey,
  monkElementalBurstActionKey,
  monkPatientDefenseActionKey,
  purpleDragonCommandantEncourageAllyActionKey,
  monkWholenessOfBodyActionKey,
  rogueSoulknifePsychicTeleportationActionKey,
  rogueSoulknifePsychicWhispersActionKey,
  sorcererWarpingImplosionActionKey,
  sorcererWildMagicSurgeActionKey,
  tirelessActionKey
]);
const rollingFeatureFormKinds = new Set([
  "aasimar-healing-hands",
  "dragonborn-breath-weapon",
  "goliath-stones-endurance",
  "goliath-storms-thunder",
  "healing-light",
  "indomitable",
  "recover-vitality",
  "sneak-attack",
  "spellfire-burst",
  "warrior-of-the-gods"
]);

function getSelectedActionToastTrigger(
  action: GameplayActionDefinition
): ActionConfirmationToastTrigger {
  if (action.kind !== "feature") {
    return action.economyType;
  }

  if (action.execute.kind === "activate") {
    const effectKind = action.execute.effectKind ?? "";

    if (
      rollingFeatureEffectKinds.has(effectKind) ||
      rollingFeatureActionKeys.has(action.action.key)
    ) {
      return null;
    }
  }

  if (
    action.execute.kind === "custom-form" &&
    rollingFeatureFormKinds.has(action.execute.formKind)
  ) {
    return null;
  }

  return action.economyType;
}

export function renderActionDrawerFooter(context: ActionsWidgetDrawerFooterContext) {
  const {
    arcaneWardSpellSlotOptions,
    bardicInspirationFallbackSpellSlotOptions,
    beastMasterReviveSpellSlotOptions,
    canUseInspiredEclipse,
    character,
    confirmSelectedFeatureOptions,
    executeCommonAction,
    executeFeatureActivate,
    executeMonkFlurryOfBlowsAction,
    executeMonkHandOfHealingPath,
    handleWeaponAttackRoll,
    handleWeaponDamageRoll,
    isClairvoyantCombatantSelected,
    isColossusSlayerSelected,
    isPullOfDeathSelected,
    isCrownOfSpellfireSelected,
    isDiceRollerSettingsOpen,
    isDreadfulStrikeSelected,
    isEmpoweredStrikesSelected,
    isEldritchSmiteSelected,
    isFortifyingSoulIncludingSelfSelected,
    isGoliathAncestryStrikeSelected,
    isLifedrinkerSelected,
    isFlurryOfHealingAndHarmSelected,
    isGroupRecoverySelected,
    isHandOfHarmSelected,
    isHordeBreakerSelected,
    isHuntersMarkTargetSelected,
    isImprovedShadowStepSelected,
    isInspiredEclipseSelected,
    isPolarStrikesSelected,
    isCurvingShotSelected,
    selectedWeaponCurvingShotState,
    setIsCurvingShotSelected,
    isArcaneShotSelected,
    selectedWeaponArcaneShotState,
    setIsArcaneShotSelected,
    isPsionicStrikeSelected,
    isQuiveringPalmSelected,
    isRecklessAttackSelected,
    isStunningStrikeSelected,
    isVampiricBiteSelected,
    onPersistCharacter,
    closeActionDrawer,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedActionOptionKeys,
    selectedArcaneWardDisabledReason,
    selectedArcaneWardSpellSlotLevel,
    selectedBardicInspirationFallbackDisabledReason,
    selectedBardicInspirationSpellSlotLevel,
    selectedBeastMasterReviveDisabledReason,
    selectedBeastMasterReviveSpellSlotLevel,
    selectedChannelDivinityRows,
    selectedClairvoyantCombatantToggleDisabled,
    selectedClairvoyantCombatantToggleDisabledReason,
    selectedClairvoyantCombatantUsesRemaining,
    selectedClairvoyantCombatantUsesTotal,
    selectedCommonActionPathStates,
    selectedCommonActionPrimaryDisabledReason,
    selectedCommonActionSecondaryDisabledReason,
    selectedCrownOfSpellfireBlockedReason,
    selectedCrownOfSpellfireFallbackSorceryPointCost,
    selectedCrownOfSpellfireUsesRemaining,
    selectedCrownOfSpellfireUsesTotal,
    selectedDrawerOption,
    selectedFeatureAction,
    selectedFeatureActionPathStates,
    selectedFeatureActionPrimaryDisabledReason,
    selectedFlurryOfBlowsPrimaryDisabledReason,
    selectedFlurryOfHealingAndHarmDisabledReason,
    selectedFlurryOfHealingAndHarmUsesRemaining,
    selectedFlurryOfHealingAndHarmUsesTotal,
    selectedHandOfHealingActionPathStates,
    selectedHandOfHealingFlurryOfHealingAndHarmHelperText,
    selectedImprovedShadowStepState,
    selectedMetamagicCost,
    selectedMonkPatientDefenseTemporaryHitPointsFormula,
    selectedMonkWholenessOfBodyHealingFormula,
    selectedOptionWarning,
    selectedRageSelectionWarning,
    selectedSecondWindGroupRecoveryUsesRemaining,
    selectedSecondWindGroupRecoveryUsesTotal,
    selectedUnarmedStrikeFlurryOfHealingAndHarmHelperText,
    selectedWeaponColossusSlayerState,
    selectedWeaponPullOfDeathState,
    selectedWeaponColossusSlayerToggleDisabled,
    selectedWeaponDreadAmbusherState,
    selectedWeaponDreadfulStrikeToggleDisabled,
    selectedWeaponEffectiveAction,
    selectedWeaponEldritchSmiteState,
    selectedWeaponLifedrinkerState,
    selectedWeaponEmpoweredStrikesState,
    selectedWeaponEmpoweredStrikesToggleDisabled,
    selectedWeaponFeyDreadfulStrikesState,
    selectedWeaponFeyDreadfulStrikesToggleDisabled,
    selectedWeaponHandOfHarmDisabledReason,
    selectedWeaponHandOfHarmState,
    selectedWeaponHandOfHarmToggleDisabled,
    selectedWeaponHandOfHarmUsage,
    selectedWeaponHordeBreakerState,
    selectedWeaponHordeBreakerToggleDisabled,
    selectedWeaponGoliathAncestryState,
    selectedWeaponGoliathAncestryToggleDisabled,
    selectedWeaponHuntersMarkTargetState,
    selectedWeaponHuntersMarkTargetToggleDisabled,
    selectedWeaponRecklessAttackState,
    selectedWeaponRecklessAttackToggleDisabled,
    selectedWeaponPolarStrikesState,
    selectedWeaponPolarStrikesToggleDisabled,
    selectedWeaponPrimaryAttackPathState,
    selectedWeaponPrimaryDisabledReason,
    selectedWeaponPsionicStrikeAvailable,
    selectedWeaponPsionicStrikeFormula,
    selectedWeaponQuiveringPalmDisabledReason,
    selectedWeaponQuiveringPalmState,
    selectedWeaponQuiveringPalmToggleDisabled,
    selectedWeaponVampiricBiteState,
    selectedWeaponVampiricBiteToggleDisabled,
    selectedWeaponSecondaryAttackPathState,
    selectedWeaponSecondaryDisabledReason,
    selectedWeaponStunningStrikeDisabledReason,
    selectedWeaponStunningStrikeState,
    selectedWeaponStunningStrikeToggleDisabled,
    setIsClairvoyantCombatantSelected,
    setIsColossusSlayerSelected,
    setIsPullOfDeathSelected,
    setIsCrownOfSpellfireSelected,
    setIsDiceRollerSettingsOpen,
    setIsDreadfulStrikeSelected,
    setIsEmpoweredStrikesSelected,
    setIsFortifyingSoulIncludingSelfSelected,
    setIsFixedSpellDrawerOpen,
    setIsEldritchSmiteSelected,
    setIsGoliathAncestryStrikeSelected,
    setIsLifedrinkerSelected,
    setIsFlurryOfHealingAndHarmSelected,
    setIsGroupRecoverySelected,
    setIsHandOfHarmSelected,
    setIsHuntersMarkTargetSelected,
    setIsImprovedShadowStepSelected,
    setIsInspiredEclipseSelected,
    setIsPolarStrikesSelected,
    setIsPsionicStrikeSelected,
    setIsQuiveringPalmSelected,
    setIsRecklessAttackSelected,
    setIsStunningStrikeSelected,
    setIsVampiricBiteSelected,
    setSelectedArcaneWardSpellSlotLevel,
    setSelectedBardicInspirationSpellSlotLevel,
    setSelectedBeastMasterReviveSpellSlotLevel,
    showBardicInspirationFallbackSlotSelect,
    showSelectedFlurryOfHealingAndHarmToggle,
    submitMonkElementalBurst,
    submitMonkPatientDefense,
    submitMonkWholenessOfBody,
    submitRage,
    submitRogueSoulknifePsionicDieRollAction,
    submitSorcererWarpingImplosion,
    submitSorcererWildMagicSurge
  } = context;
  if (!selectedAction) {
    return null;
  }

  const confirmSelectedActionToast = (callback: () => void) => () =>
    runWithActionConfirmationToast(getSelectedActionToastTrigger(selectedAction), callback);
  const confirmActionToast =
    (trigger: ActionConfirmationToastTrigger, callback: () => void) => () =>
      runWithActionConfirmationToast(trigger, callback);

  if (selectedAction.kind === "weapon") {
    const showPsionicStrikeToggle =
      selectedAction.action.attackKind === "weapon" && selectedWeaponPsionicStrikeFormula !== null;
    const selectedWeaponLightDamagePenaltyActive = Boolean(
      selectedWeaponEffectiveAction?.damageAbilityModifierSuppressionLabel
    );

    return (
      <div className={styles.footerActionStack}>
        {selectedWeaponHuntersMarkTargetState ? (
          <FeatureOptInToggle
            label="Attacking a target with Hunter's Mark"
            checked={isHuntersMarkTargetSelected}
            disabled={selectedWeaponHuntersMarkTargetToggleDisabled}
            muted={selectedWeaponHuntersMarkTargetToggleDisabled}
            onCheckedChange={setIsHuntersMarkTargetSelected}
            usageKey="hunters-mark-target"
          />
        ) : null}
        {selectedWeaponRecklessAttackState ? (
          <FeatureOptInToggle
            label="Reckless Attack"
            checked={
              selectedWeaponRecklessAttackState.active ||
              (!selectedWeaponRecklessAttackToggleDisabled && isRecklessAttackSelected)
            }
            disabled={selectedWeaponRecklessAttackToggleDisabled}
            muted={selectedWeaponRecklessAttackToggleDisabled}
            onCheckedChange={setIsRecklessAttackSelected}
            title={selectedWeaponRecklessAttackState.disabledReason ?? undefined}
            application={{ targetLabel: "Attack" }}
            usageKey="reckless-attack"
          />
        ) : null}
        {selectedWeaponDreadAmbusherState ? (
          <FeatureOptInToggle
            label="Dreadful Strike"
            checked={isDreadfulStrikeSelected}
            disabled={selectedWeaponDreadfulStrikeToggleDisabled}
            muted={selectedWeaponDreadfulStrikeToggleDisabled}
            onCheckedChange={setIsDreadfulStrikeSelected}
            title={selectedWeaponDreadAmbusherState.disabledReason ?? undefined}
            usage={createChargesCardUsage(
              selectedWeaponDreadAmbusherState.usesRemaining,
              selectedWeaponDreadAmbusherState.usesTotal
            )}
            application={{ targetLabel: "Damage" }}
            usageKey="dreadful-strike"
          />
        ) : null}
        {selectedWeaponFeyDreadfulStrikesState ? (
          <FeatureOptInToggle
            label="Dreadful Strikes"
            checked={isDreadfulStrikeSelected}
            disabled={selectedWeaponFeyDreadfulStrikesToggleDisabled}
            muted={selectedWeaponFeyDreadfulStrikesToggleDisabled}
            onCheckedChange={setIsDreadfulStrikeSelected}
            title={selectedWeaponFeyDreadfulStrikesState.disabledReason ?? undefined}
            application={{
              qualifierText: "Once per turn",
              targetLabel: "Damage"
            }}
            usageKey="dreadful-strikes"
          />
        ) : null}
        {selectedWeaponPullOfDeathState ? (
          <FeatureOptInToggle
            label="Pull of Death"
            checked={isPullOfDeathSelected}
            disabled={selectedWeaponPullOfDeathState.disabled}
            muted={selectedWeaponPullOfDeathState.disabled}
            onCheckedChange={setIsPullOfDeathSelected}
            title={selectedWeaponPullOfDeathState.disabledReason}
            application={{ qualifierText: "Wounded target · Once per turn", targetLabel: "Damage" }}
            usageKey="pull-of-death"
          />
        ) : null}
        <RangerHunterWeaponOptions
          colossusSlayerState={selectedWeaponColossusSlayerState}
          hordeBreakerState={selectedWeaponHordeBreakerState}
          isColossusSlayerSelected={isColossusSlayerSelected}
          isHordeBreakerSelected={isHordeBreakerSelected}
          colossusSlayerDisabled={selectedWeaponColossusSlayerToggleDisabled}
          hordeBreakerDisabled={selectedWeaponHordeBreakerToggleDisabled}
          onColossusSlayerChange={setIsColossusSlayerSelected}
          onHordeBreakerChange={(checked) =>
            onPersistCharacter((currentCharacter) =>
              setRangerHunterHordeBreakerActionKeyForCharacter(
                currentCharacter,
                checked && selectedAction.kind === "weapon" ? selectedAction.action.key : null
              )
            )
          }
        />
        {selectedWeaponPolarStrikesState ? (
          <FeatureOptInToggle
            label="Polar Strikes"
            checked={isPolarStrikesSelected}
            disabled={selectedWeaponPolarStrikesToggleDisabled}
            muted={selectedWeaponPolarStrikesToggleDisabled}
            onCheckedChange={setIsPolarStrikesSelected}
            title={selectedWeaponPolarStrikesState.disabledReason ?? undefined}
            application={{
              qualifierText: "Once per turn",
              targetLabel: "Damage"
            }}
            metaItems={
              selectedWeaponPolarStrikesState.damageBonus.displayLabel
                ? [
                    {
                      kind: "text" as const,
                      label: selectedWeaponPolarStrikesState.damageBonus.displayLabel
                    }
                  ]
                : []
            }
          />
        ) : null}
        {selectedWeaponGoliathAncestryState ? (
          <FeatureOptInToggle
            label={selectedWeaponGoliathAncestryState.featureName}
            checked={isGoliathAncestryStrikeSelected}
            disabled={selectedWeaponGoliathAncestryToggleDisabled}
            muted={selectedWeaponGoliathAncestryToggleDisabled}
            onCheckedChange={setIsGoliathAncestryStrikeSelected}
            title={selectedWeaponGoliathAncestryState.disabledReason ?? undefined}
            application={{ targetLabel: "Damage" }}
            usage={createChargesCardUsage(
              selectedWeaponGoliathAncestryState.usesRemaining,
              selectedWeaponGoliathAncestryState.usesTotal
            )}
            usageKey="goliath-giant-ancestry"
          />
        ) : null}
        {selectedWeaponStunningStrikeState ? (
          <FeatureOptInToggle
            label="Stunning Strike"
            checked={isStunningStrikeSelected}
            disabled={selectedWeaponStunningStrikeToggleDisabled}
            muted={selectedWeaponStunningStrikeToggleDisabled}
            onCheckedChange={setIsStunningStrikeSelected}
            title={selectedWeaponStunningStrikeDisabledReason ?? undefined}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: String(selectedWeaponStunningStrikeState.focusPointCost),
                icon: "brain"
              })
            )}
            application={{
              qualifierText: "Once per turn",
              targetLabel: "Damage"
            }}
            usageKey="stunning-strike"
          />
        ) : null}
        {selectedWeaponEmpoweredStrikesState ? (
          <FeatureOptInToggle
            label="Empowered Strikes"
            checked={isEmpoweredStrikesSelected}
            disabled={selectedWeaponEmpoweredStrikesToggleDisabled}
            muted={selectedWeaponEmpoweredStrikesToggleDisabled}
            onCheckedChange={setIsEmpoweredStrikesSelected}
            title={selectedWeaponEmpoweredStrikesState.disabledReason ?? undefined}
            application={{
              qualifierText: "Once per turn",
              targetLabel: "Damage"
            }}
            usageKey="empowered-strikes"
          />
        ) : null}
        {selectedWeaponHandOfHarmState ? (
          <FeatureOptInToggle
            label="Hand of Harm"
            checked={isHandOfHarmSelected}
            disabled={selectedWeaponHandOfHarmToggleDisabled}
            muted={selectedWeaponHandOfHarmToggleDisabled}
            onCheckedChange={setIsHandOfHarmSelected}
            title={selectedWeaponHandOfHarmDisabledReason ?? undefined}
            usage={selectedWeaponHandOfHarmUsage}
            application={{
              qualifierText: "Once per turn",
              targetLabel: "Damage"
            }}
            usageKey="hand-of-harm"
          />
        ) : null}
        {selectedWeaponQuiveringPalmState ? (
          <FeatureOptInToggle
            label="Quivering Palm"
            checked={isQuiveringPalmSelected}
            disabled={selectedWeaponQuiveringPalmToggleDisabled}
            muted={selectedWeaponQuiveringPalmToggleDisabled}
            onCheckedChange={setIsQuiveringPalmSelected}
            title={selectedWeaponQuiveringPalmDisabledReason ?? undefined}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: String(monkWarriorOfTheOpenHandQuiveringPalmFocusCost),
                icon: "brain"
              })
            )}
            application={{ targetLabel: "Damage" }}
            usageKey="quivering-palm"
          />
        ) : null}
        {selectedWeaponVampiricBiteState ? (
          <FeatureOptInToggle
            label="Vampiric Bite"
            checked={isVampiricBiteSelected}
            disabled={selectedWeaponVampiricBiteToggleDisabled}
            muted={selectedWeaponVampiricBiteToggleDisabled}
            onCheckedChange={setIsVampiricBiteSelected}
            title={selectedWeaponVampiricBiteState.disabledReason ?? undefined}
            usage={createChargesCardUsage(
              selectedWeaponVampiricBiteState.usesRemaining,
              selectedWeaponVampiricBiteState.usesTotal
            )}
            application={{ targetLabel: "Damage" }}
            usageKey="vampiric-bite"
          />
        ) : null}
        {selectedWeaponCurvingShotState ? (
          <FeatureOptInToggle
            label="Curving Shot"
            checked={isCurvingShotSelected}
            disabled={selectedWeaponCurvingShotState.disabled}
            muted={selectedWeaponCurvingShotState.disabled}
            onCheckedChange={setIsCurvingShotSelected}
            title={selectedWeaponCurvingShotState.disabledReason ?? undefined}
            actionShape="bonusAction"
            actionShapeAvailable={!selectedWeaponCurvingShotState.disabled}
            application={{ targetLabel: "Attack" }}
          />
        ) : null}
        {selectedWeaponArcaneShotState ? (
          <FeatureOptInToggle
            label="Arcane Shot"
            checked={isArcaneShotSelected}
            disabled={selectedWeaponArcaneShotState.disabled}
            muted={selectedWeaponArcaneShotState.disabled}
            onCheckedChange={setIsArcaneShotSelected}
            title={selectedWeaponArcaneShotState.disabledReason ?? undefined}
            usage={createChargesCardUsage(
              selectedWeaponArcaneShotState.usesRemaining,
              selectedWeaponArcaneShotState.usesTotal
            )}
            application={{ targetLabel: "Damage" }}
            usageKey="arcane-shot"
          />
        ) : null}
        {showPsionicStrikeToggle ? (
          <FeatureOptInToggle
            label="Psionic Strike"
            checked={isPsionicStrikeSelected}
            disabled={!selectedWeaponPsionicStrikeAvailable}
            muted={!selectedWeaponPsionicStrikeAvailable}
            onCheckedChange={setIsPsionicStrikeSelected}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: "1",
                icon: "psi"
              })
            )}
            application={{
              qualifierText: "Once per turn",
              targetLabel: "Damage"
            }}
            usageKey="psionic-strike"
          />
        ) : null}
        {selectedWeaponEldritchSmiteState ? (
          <FeatureOptInToggle
            label="Eldritch Smite"
            checked={isEldritchSmiteSelected}
            disabled={selectedWeaponEldritchSmiteState.disabled}
            muted={selectedWeaponEldritchSmiteState.disabled}
            onCheckedChange={setIsEldritchSmiteSelected}
            title={selectedWeaponEldritchSmiteState.disabledReason ?? undefined}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: "1",
                resourceLabel: "Pact Magic Spell"
              })
            )}
            application={{ targetLabel: "Damage" }}
            usageKey="eldritch-smite"
          />
        ) : null}
        {selectedWeaponLifedrinkerState ? (
          <FeatureOptInToggle
            label="Lifedrinker"
            checked={isLifedrinkerSelected}
            disabled={selectedWeaponLifedrinkerState.disabled}
            muted={selectedWeaponLifedrinkerState.disabled}
            onCheckedChange={setIsLifedrinkerSelected}
            title={selectedWeaponLifedrinkerState.disabledReason ?? undefined}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: "1",
                resourceLabel: "Hit Point Dice"
              })
            )}
            application={{ targetLabel: "Damage" }}
            usageKey="lifedrinker"
          />
        ) : null}
        {selectedUnarmedStrikeFlurryOfHealingAndHarmHelperText ? (
          <p className={styles.footerHelperText}>
            {selectedUnarmedStrikeFlurryOfHealingAndHarmHelperText}
          </p>
        ) : null}
        {selectedWeaponLightDamagePenaltyActive ? (
          <p className={clsx(styles.footerHelperText, styles.footerHelperTextInfo)}>
            Light Property is active on the next Damage roll.
          </p>
        ) : null}
        <WeaponAttackFooterButtons
          actionName={selectedAction.name}
          attackPaths={[
            ...(selectedWeaponPrimaryAttackPathState
              ? [
                  {
                    pathState: selectedWeaponPrimaryAttackPathState,
                    disabledReason: selectedWeaponPrimaryDisabledReason
                  }
                ]
              : []),
            ...(selectedWeaponSecondaryAttackPathState
              ? [
                  {
                    pathState: selectedWeaponSecondaryAttackPathState,
                    disabledReason: selectedWeaponSecondaryDisabledReason
                  }
                ]
              : [])
          ]}
          isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
          onAttack={(pathState) => handleWeaponAttackRoll(selectedAction.action, pathState)}
          onDamage={() => handleWeaponDamageRoll(selectedAction.action)}
          onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
        />
      </div>
    );
  }

  const selectedFeaturePrimaryLabel =
    ("confirmLabel" in selectedAction.drawer ? selectedAction.drawer.confirmLabel : undefined) ??
    getFeatureActionDrawerPrimaryLabel(selectedAction.action);

  if (selectedAction.kind === "feature" && selectedAction.action.key === luckyFeatActionKey) {
    const luckyPointsRemaining = selectedAction.action.usesRemaining ?? 0;
    const luckyPointsTotal = selectedAction.action.usesTotal ?? 0;
    const luckyPointsAreFull = luckyPointsRemaining >= luckyPointsTotal;

    return (
      <div className={styles.luckyFooterActions}>
        <ActionButton
          className={styles.footerActionButton}
          onClick={confirmSelectedActionToast(() => {
            onPersistCharacter(spendLuckyPointForCharacter);
            closeActionDrawer();
          })}
          disabled={luckyPointsRemaining <= 0}
        >
          Use 1
        </ActionButton>
        <ActionButton
          className={styles.footerActionButton}
          onClick={confirmSelectedActionToast(() => {
            onPersistCharacter(resetLuckyPointForCharacter);
            closeActionDrawer();
          })}
          disabled={luckyPointsAreFull}
        >
          Reset 1
        </ActionButton>
        <ActionButton
          className={styles.footerActionButton}
          onClick={confirmSelectedActionToast(() => {
            onPersistCharacter(restoreLuckyPointsForCharacter);
            closeActionDrawer();
          })}
          disabled={luckyPointsAreFull}
        >
          Reset All
        </ActionButton>
      </div>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === boonOfFateImproveFateActionKey
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={null}
        actionShapeAvailable
        actionShapeMultiCount={0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === purpleDragonCommandantEncourageAllyActionKey
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }
  const formFooter = renderFormFooter({
    ...context,
    confirmSelectedActionToast,
    selectedFeaturePrimaryLabel
  });
  if (formFooter !== undefined) return formFooter;

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === sorcererWildMagicSurgeActionKey
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={null}
        actionShapeAvailable
        actionShapeMultiCount={0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitSorcererWildMagicSurge}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === sorcererWarpingImplosionActionKey
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitSorcererWarpingImplosion}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    (selectedAction.action.key === rogueSoulknifePsychicWhispersActionKey ||
      selectedAction.action.key === rogueSoulknifePsychicTeleportationActionKey)
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => submitRogueSoulknifePsionicDieRollAction(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (selectedAction.kind === "feature" && isCommonActionKey(selectedAction.action.key)) {
    return (
      <CommonActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionPaths={selectedCommonActionPathStates.map((path) => ({
          ...path,
          disabledReason:
            path.id === "primary"
              ? selectedCommonActionPrimaryDisabledReason
              : selectedCommonActionSecondaryDisabledReason
        }))}
        onConfirmPath={(economyType) => executeCommonAction(selectedAction.action, economyType)}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedFeatureActionPathStates.length > 1
  ) {
    return (
      <CommonActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionPaths={selectedFeatureActionPathStates.map((path) => ({
          ...path,
          disabledReason: path.disabledReason ?? selectedFeatureActionPrimaryDisabledReason
        }))}
        onConfirmPath={(economyType) => executeFeatureActivate(selectedAction.action, economyType)}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === monkFlurryOfBlowsActionKey
  ) {
    return (
      <MonkFlurryOfBlowsActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        economyType={selectedAction.economyType}
        shapeState={selectedActionEconomyShapeState}
        confirmDisabledReason={selectedFlurryOfBlowsPrimaryDisabledReason}
        onConfirm={executeMonkFlurryOfBlowsAction}
        flurryOfHealingAndHarmOption={
          showSelectedFlurryOfHealingAndHarmToggle
            ? {
                checked: isFlurryOfHealingAndHarmSelected,
                disabled: selectedFlurryOfHealingAndHarmDisabledReason !== null,
                current: selectedFlurryOfHealingAndHarmUsesRemaining,
                total: selectedFlurryOfHealingAndHarmUsesTotal,
                title: selectedFlurryOfHealingAndHarmDisabledReason ?? undefined,
                onCheckedChange: setIsFlurryOfHealingAndHarmSelected
              }
            : undefined
        }
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === monkHandOfHealingActionKey
  ) {
    return (
      <MonkHandOfHealingActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionPaths={selectedHandOfHealingActionPathStates}
        helperText={selectedHandOfHealingFlurryOfHealingAndHarmHelperText ?? undefined}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirmPath={executeMonkHandOfHealingPath}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === tirelessActionKey
  ) {
    return (
      <ElementalBurstActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === mantleOfInspirationActionKey
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionFooterButtonRow
        settings={
          <DiceRollerSettingsButton
            actionName={selectedAction.action.name}
            className={styles.weaponFooterIconButton}
            isOpen={isDiceRollerSettingsOpen}
            ariaLabel="Open dice roller settings"
            onOpenChange={setIsDiceRollerSettingsOpen}
          />
        }
      >
        <ActionButton
          className={styles.weaponFooterButton}
          onClick={confirmSelectedActionToast(() => executeFeatureActivate(selectedAction.action))}
          disabled={selectedFeatureActionPrimaryDisabledReason !== null}
          icon={<img src={d20Icon} alt="" className={styles.weaponFooterIcon} />}
          trailingBadge={
            actionShape ? (
              <ActionShape
                shape={actionShape}
                isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
                multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
                className={styles.footerActionShape}
              />
            ) : null
          }
        >
          {selectedFeaturePrimaryLabel}
        </ActionButton>
      </ActionFooterButtonRow>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === monkWholenessOfBodyActionKey &&
    selectedMonkWholenessOfBodyHealingFormula
  ) {
    return (
      <ElementalBurstActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => submitMonkWholenessOfBody(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === monkPatientDefenseActionKey &&
    selectedMonkPatientDefenseTemporaryHitPointsFormula
  ) {
    return (
      <ElementalBurstActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitMonkPatientDefense}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === durableSpeedyRecoveryActionKey
  ) {
    return (
      <FighterSecondWindActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        groupRecoveryUnlocked={false}
        groupRecoveryUsesRemaining={0}
        groupRecoveryUsesTotal={0}
        isGroupRecoverySelected={false}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
        onGroupRecoverySelectedChange={() => undefined}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === fighterSecondWindActionKey
  ) {
    return (
      <FighterSecondWindActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null ||
          (isGroupRecoverySelected && selectedSecondWindGroupRecoveryUsesRemaining <= 0)
        }
        groupRecoveryUnlocked={selectedSecondWindGroupRecoveryUsesTotal > 0}
        groupRecoveryUsesRemaining={selectedSecondWindGroupRecoveryUsesRemaining}
        groupRecoveryUsesTotal={selectedSecondWindGroupRecoveryUsesTotal}
        isGroupRecoverySelected={isGroupRecoverySelected}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
        onGroupRecoverySelectedChange={setIsGroupRecoverySelected}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === monkElementalBurstActionKey
  ) {
    return (
      <ElementalBurstActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitMonkElementalBurst}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === innateSorceryActionKey
  ) {
    return (
      <SorcererInnateSorceryActionFooter
        character={character}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        crownOfSpellfireUnlocked={selectedCrownOfSpellfireUsesTotal > 0}
        crownOfSpellfireUsesRemaining={selectedCrownOfSpellfireUsesRemaining}
        crownOfSpellfireUsesTotal={selectedCrownOfSpellfireUsesTotal}
        crownOfSpellfireFallbackSorceryPointCost={selectedCrownOfSpellfireFallbackSorceryPointCost}
        crownOfSpellfireDisabledReason={selectedCrownOfSpellfireBlockedReason ?? undefined}
        isCrownOfSpellfireSelected={isCrownOfSpellfireSelected}
        onConfirm={(umbralForm) =>
          executeFeatureActivate(selectedAction.action, null, { umbralForm })
        }
        onCrownOfSpellfireSelectedChange={setIsCrownOfSpellfireSelected}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === awakenedMindActionKey &&
    selectedClairvoyantCombatantUsesTotal > 0
  ) {
    return (
      <WarlockAwakenedMindActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        clairvoyantCombatantUsesRemaining={selectedClairvoyantCombatantUsesRemaining}
        clairvoyantCombatantUsesTotal={selectedClairvoyantCombatantUsesTotal}
        toggleDisabled={selectedClairvoyantCombatantToggleDisabled}
        toggleDisabledReason={selectedClairvoyantCombatantToggleDisabledReason}
        isClairvoyantCombatantSelected={isClairvoyantCombatantSelected}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onClairvoyantCombatantSelectedChange={setIsClairvoyantCombatantSelected}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === bardicInspirationActionKey
  ) {
    return (
      <BardicInspirationActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedBardicInspirationFallbackDisabledReason !== null}
        disabledReason={selectedBardicInspirationFallbackDisabledReason}
        showInspiredEclipseToggle={canUseInspiredEclipse}
        isInspiredEclipseSelected={isInspiredEclipseSelected}
        onInspiredEclipseSelectedChange={setIsInspiredEclipseSelected}
        showSpellSlotSelect={showBardicInspirationFallbackSlotSelect}
        spellSlotOptions={bardicInspirationFallbackSpellSlotOptions}
        selectedSpellSlotLevel={selectedBardicInspirationSpellSlotLevel}
        onSelectedSpellSlotLevelChange={setSelectedBardicInspirationSpellSlotLevel}
        helperText={
          showBardicInspirationFallbackSlotSelect &&
          selectedBardicInspirationFallbackDisabledReason !==
            selectedFeatureActionPrimaryDisabledReason
            ? selectedBardicInspirationFallbackDisabledReason
            : null
        }
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === wizardAbjurerArcaneWardActionKey
  ) {
    return (
      <ArcaneWardActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedArcaneWardDisabledReason !== null}
        disabledReason={
          selectedArcaneWardDisabledReason !== selectedFeatureActionPrimaryDisabledReason
            ? selectedArcaneWardDisabledReason
            : null
        }
        spellSlotOptions={arcaneWardSpellSlotOptions}
        selectedSpellSlotLevel={selectedArcaneWardSpellSlotLevel}
        onSelectedSpellSlotLevelChange={setSelectedArcaneWardSpellSlotLevel}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === rangerBeastMasterReviveActionKey
  ) {
    return (
      <BeastMasterReviveActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedBeastMasterReviveDisabledReason !== null}
        disabledReason={
          selectedBeastMasterReviveDisabledReason !== selectedFeatureActionPrimaryDisabledReason
            ? selectedBeastMasterReviveDisabledReason
            : null
        }
        spellSlotOptions={beastMasterReviveSpellSlotOptions}
        selectedSpellSlotLevel={selectedBeastMasterReviveSpellSlotLevel}
        onSelectedSpellSlotLevelChange={setSelectedBeastMasterReviveSpellSlotLevel}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.action.key === monkShadowStepActionKey &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <div className={styles.footerActionStack}>
        {selectedImprovedShadowStepState ? (
          <FeatureOptInToggle
            label="Improved Shadow Step"
            checked={isImprovedShadowStepSelected}
            disabled={selectedImprovedShadowStepState.disabled}
            muted={selectedImprovedShadowStepState.disabled}
            onCheckedChange={setIsImprovedShadowStepSelected}
            title={selectedImprovedShadowStepState.disabledReason ?? undefined}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: "1",
                icon: "brain"
              })
            )}
            usageKey="improved-shadow-step"
          />
        ) : null}
        <ActionButton
          className={styles.footerActionButton}
          onClick={confirmSelectedActionToast(() => executeFeatureActivate(selectedAction.action))}
          disabled={selectedFeatureActionPrimaryDisabledReason !== null}
          trailingBadge={
            actionShape ? (
              <ActionShape
                shape={actionShape}
                isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
                multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
                className={styles.footerActionShape}
              />
            ) : null
          }
        >
          {selectedFeaturePrimaryLabel}
        </ActionButton>
      </div>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "options" &&
    selectedChannelDivinityRows.length > 0
  ) {
    return null;
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.action.key === shifterShiftingActionKey &&
    selectedAction.drawer.kind === "options" &&
    selectedDrawerOption?.key === shifterBeasthideOptionKey
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={actionShape}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={
          selectedDrawerOption.disabled === true ||
          selectedOptionWarning !== null ||
          selectedFeatureActionPrimaryDisabledReason !== null
        }
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={confirmActionToast(null, confirmSelectedFeatureOptions)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (selectedAction.drawer.kind === "options") {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);
    const selectedOption = selectedDrawerOption;
    const isMultiConfirm = selectedAction.drawer.selection === "multi-confirm";
    const selectedOptionToastTrigger = isMultiConfirm
      ? selectedAction.economyType
      : selectedOption?.rollFormula
        ? null
        : selectedOption?.economyType;
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmActionToast(selectedOptionToastTrigger, confirmSelectedFeatureOptions)}
        disabled={
          (isMultiConfirm
            ? selectedActionOptionKeys.length <= 0 ||
              selectedFeatureActionPrimaryDisabledReason !== null
            : !selectedOption ||
              selectedOption.disabled === true ||
              selectedOptionWarning !== null ||
              selectedFeatureActionPrimaryDisabledReason !== null) ||
          (selectedFeatureAction?.key === metamagicActionKey &&
            selectedMetamagicCost > getSorceryPointsRemainingForCharacter(character))
        }
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (selectedAction.kind === "feature" && selectedAction.action.key === barbarianRageActionKey) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitRage)}
        disabled={
          selectedRageSelectionWarning !== null ||
          selectedFeatureActionPrimaryDisabledReason !== null
        }
        trailingBadge={
          <ActionShape
            shape="bonusAction"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            className={styles.footerActionShape}
          />
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (selectedAction.drawer.kind !== "confirm") {
    return null;
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.action.key === rebornKnowledgeFromPastLifeActionKey &&
    selectedAction.execute.kind === "activate"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={actionShape}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    (selectedAction.action.key === darkOnesOwnLuckActionKey ||
      selectedAction.action.key === formOfDreadActionKey) &&
    selectedAction.execute.kind === "activate"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.action.key === hurlThroughHellActionKey &&
    selectedAction.execute.kind === "activate"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.action.key === fortifyingSoulActionKey &&
    selectedAction.execute.kind === "activate"
  ) {
    return (
      <FortifyingSoulActionFooter
        actionName={selectedAction.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        includingSelf={isFortifyingSoulIncludingSelfSelected}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
        onIncludingSelfChange={setIsFortifyingSoulIncludingSelfSelected}
      />
    );
  }

  if (selectedAction.execute.kind === "activate") {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);
    const confirmAction = isCommonActionKey(selectedAction.action.key)
      ? executeCommonAction
      : executeFeatureActivate;

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(() => confirmAction(selectedAction.action))}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (selectedAction.execute.kind === "spell") {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={() => setIsFixedSpellDrawerOpen(true)}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  return null;
}
