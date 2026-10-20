import { applyActionResourceTransition } from "./actionResourceTransition";
import type { CharacterCompanion } from "../../../../../../types";
import {
  appendSpellSummonCompanionsForCast,
  canAddSpellSummonCompanionsForCast
} from "../../../../../../pages/CharactersPage/spellSummons";
import {
  endPreviousShadowBeastsCast,
  getShadowBeastsCastSpell,
  prepareShadowBeastsSummons,
  shadowBeastsWithoutConcentrationOptionId,
  spendShadowBeastsSorceryPoints
} from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses/sorcererShadowBeasts";
import { createWizardFormSubmissions } from "./uiAdapters/wizard";
import { createWarlockFormSubmissions } from "./uiAdapters/warlock";
import { createSpeciesFormSubmissions } from "./uiAdapters/species";
import { createSorcererFormSubmissions } from "./uiAdapters/sorcerer";
import { createRogueFormSubmissions } from "./uiAdapters/rogue";
import { consumePhantomVoiceOfDeathUse } from "../../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/roguePhantomVoiceOfDeath";
import { createPaladinFormSubmissions } from "./uiAdapters/paladin";
import { createFighterFormSubmissions } from "./uiAdapters/fighter";
import { createFeatsFormSubmissions } from "./uiAdapters/feats";
import { createDruidFormSubmissions } from "./uiAdapters/druid";
import { createClericFormSubmissions } from "./uiAdapters/cleric";
import { createBarbarianFormSubmissions } from "./uiAdapters/barbarian";
import { getSheetSpellSlotTotals } from "../../../../../../pages/CharactersPage/multiclassSpellcasting";

import {
  activateFeatureActionForCharacter,
  activateFeatureActionOptionsForCharacter,
  activateFeatureActionOptionForCharacter,
  applySpellCastFeatureEffectsForCharacter,
  applyMantleOfMajestyStatusForCharacter,
  applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter,
  consumeBeguilingMagicOrBardicInspirationForCharacter,
  consumeMantleOfMajestyUseForCharacter,
  consumeContactPatronUseForCharacter,
  consumeWarlockGiftOfTheDepthsUseForCharacter,
  expendChannelDivinityUseForCharacter,
  consumeMysticArcanumUseForCharacter,
  consumeRangerWinterWalkerFrozenHauntUseForCharacter,
  consumeFaithfulSteedUseForCharacter,
  consumePaladinsSmiteUseForCharacter,
  consumeArtificerConjuredCauldronUseForCharacter,
  consumeArtificerFacilitatedRevivalUseForCharacter,
  consumeArtificerIlluminatedCartographyUseForCharacter,
  consumeArtificerRestorativeReagentsUseForCharacter,
  consumeArtificerUnerringPathUseForCharacter,
  consumeRangerFavoredEnemyUseForCharacter,
  consumeNonMagicActionForCharacter,
  consumeSharedEconomyMultiForCharacterAction,
  createEconomyMultiContextForFeatureAction,
  createEconomyMultiContextForSpell,
  expendMonkFocusPointForCharacter,
  getMantleOfMajestyUsesRemainingForCharacter,
  getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter,
  restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter,
  type FeatureActionCard,
  type FeatureActionOptionCard
} from "../../../../../../pages/CharactersPage/classFeatures";
import {
  applyFeatureSpellCastEffectsForCharacter,
  spendGenieMagicWishMagicForCharacter
} from "../../../../../../pages/CharactersPage/feats/runtime";

import {
  applyShifterBeasthideTemporaryHitPointsRollForCharacter,
  consumeGoliathGiantAncestryUseForCharacter,
  shifterBeasthideOptionKey,
  shifterShiftingActionKey
} from "../../../../../../pages/CharactersPage/species";

import {
  activateBarbarianRage,
  activateBarbarianWildHeartRage
} from "../../../../../../pages/CharactersPage/classFeatures/barbarian/barbarian";

import {
  applyPaladinOathOfTheNobleGeniesElementalSmiteEffect,
  isPaladinOathOfTheNobleGeniesElementalSmiteOptionKey,
  type PaladinOathOfTheNobleGeniesElementalSmiteOptionKey
} from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfTheNobleGenies";
import {
  getRangerWinterWalkerFortifyingSoulHealingFormula,
  getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay,
  huntersMarkSpellId
} from "../../../../../../pages/CharactersPage/classFeatures/ranger/ranger";

import {
  sorcererWarpingImplosionDamageFormula,
  sorcererWarpingImplosionDamageFormulaDisplay
} from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses/sorcererAberrantSorcery";

import {
  hasSorcererControlledChaosFeatureForCharacter,
  sorcererWildMagicSurgeActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses/sorcererWildMagicSorcery";

import { isWarlockInvocationSpellEffectKind } from "../../../../../../pages/CharactersPage/classFeatures/warlock/warlockInvocationSpellActions";

import {
  getRogueSoulknifePsychicTeleportationRollFormula,
  getRogueSoulknifePsychicTeleportationRollFormulaDisplay,
  getRogueSoulknifePsychicWhispersRollFormula,
  getRogueSoulknifePsychicWhispersRollFormulaDisplay,
  rogueSoulknifePsychicWhispersActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueSoulknife";

import {
  ACTION_CATEGORY,
  getRoundTrackerResourceForEconomyType
} from "../../../../../../pages/CharactersPage/actionEconomy";

import { applySpellDurationToStatusEntries } from "../../../../../../pages/CharactersPage/statusEntries";
import {
  applySpellImplementationForCharacter,
  getSpellImplementationStatusOptionsForCharacter,
  getSpellImplementationRollEffectsForCharacter,
  type SpellImplementationCastSource,
  type SpellImplementationOptionValues
} from "../../../../../../pages/CharactersPage/characterRuntime/spellImplementations";
import { getSpellFormulaCellsForCharacterSpell } from "../../../../../../pages/CharactersPage/shared/spellFormulas";
import {
  applyRolledHealingToCharacter,
  applyRolledTemporaryHitPointsToCharacter,
  consumeRoundTrackerResourceForCharacter,
  prepareCharacterForRoundTrackerResourceConsumption
} from "../../gameplayStateUtils";

import { type SpellEntry } from "../../../../../../codex/entries";
import { DAMAGE_TYPE, DURATION } from "../../../../../../codex/entries/enums";
import { getRoundTrackerResourceForSpell } from "../../../../../../pages/CharactersPage/shared";
import {
  getSpellLevel,
  normalizeSpellSlotsExpended
} from "../../../../../../pages/CharactersPage/spellcasting";

import {
  getMonkWarriorOfTheElementsElementalBurstDamageFormula,
  setMonkWarriorOfTheElementsElementalResistanceDamageTypeSelection
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheElements";

import { type ChannelDivinityOptionRow } from "../../../channelDivinityUtils";

import type { ActionsWidgetSubmissionContext } from "./types";

import {
  consumeArtificerJoltToLifeUse,
  spareTheDyingSpellId
} from "../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import { useArtificerActionSubmissions } from "./useArtificerActionSubmissions";

export function useActionsWidgetSubmissions(context: ActionsWidgetSubmissionContext) {
  const {
    character,
    onPersistCharacter,
    openDiceRoller,
    closeActionDrawer,
    prepareCharacterForResourceConsumption,
    setSelectedActionOptionKeys,
    setSelectedMysticArcanumSpell,
    setSelectedMysticArcanumSpellLevel,
    selectedAction,
    selectedFeatureAction,
    selectedDrawerOptions,
    selectedActionOptionKeys,
    selectedRageOptions,
    selectedRagePowerOptions,
    selectedRageOptionKey,
    selectedRagePowerOptionKey,
    selectedDivineInterventionSpell,
    selectedMysticArcanumSpell,
    selectedMysticArcanumSpellLevel,
    fixedSpellHuntersRimeTemporaryHitPointsFormula,
    fixedSpellHuntersRimeTemporaryHitPointsFormulaDisplay,
    fixedSpellExecute,
    fixedSpellEntry,
    fixedSpellMinimumActionSlotLevel,
    fixedSpellFreeCastSlotLevel,
    fixedSpellActionPaths,
    fixedSpellConsumesSpellSlot,
    selectedActionSpellSupportsElementalSmite,
    selectedActionSpellFrozenHauntOptionState,
    selectedActionSpellGoliathAncestryState,
    selectedFixedSpellSlotLevel,
    channelDivinityUsesRemaining,
    isRageOfTheGodsSelected
  } = context;
  const { submitArcaneRecovery, submitPortent, submitThirdEye } =
    createWizardFormSubmissions(context);
  const { submitHealingLight, submitVestigeCompanion } = createWarlockFormSubmissions(context);
  const {
    submitAasimarHealingHands,
    submitAasimarCelestialRevelation,
    submitDragonbornBreathWeapon,
    submitDragonbornDraconicFlight,
    submitDwarfStonecunning,
    submitGoliathCloudsJaunt,
    submitGoliathLargeForm,
    submitGoliathStonesEndurance,
    submitGoliathStormsThunder
  } = createSpeciesFormSubmissions(context);
  const {
    submitSorcererSpellfireBurst,
    confirmFontOfMagicSelection,
    convertSpellSlotToSorceryPoints,
    createSpellSlotFromSorceryPoints
  } = createSorcererFormSubmissions(context);
  const { submitSneakAttack } = createRogueFormSubmissions(context);
  const { submitLayOnHands } = createPaladinFormSubmissions(context);
  const { submitIndomitable } = createFighterFormSubmissions(context);
  const { submitBoonOfFluidFormsShapechanger } = createFeatsFormSubmissions(context);
  const {
    submitWildShape,
    submitStarryForm,
    submitWildCompanion,
    submitNatureMagician,
    submitWildResurgence
  } = createDruidFormSubmissions(context);
  const { submitBlessingOfTheTrickster } = createClericFormSubmissions(context);
  const { submitWarriorOfTheGods, submitBrutalStrike } = createBarbarianFormSubmissions(context);

  const {
    isArcaneFirearmSubmitting,
    isArtificerMagicItemTinkerSubmitting,
    isEldritchCannonSubmitting,
    isExperimentalElixirSubmitting,
    isReplicateMagicItemSubmitting,
    isReanimatedCompanionSubmitting,
    isSteelDefenderSubmitting,
    isTinkersMagicSubmitting,
    submitArtificerArcaneFirearm,
    submitArtificerChargeMagicItem,
    submitArtificerDrainMagicItem,
    submitArtificerEldritchCannon,
    submitArtificerExperimentalElixir,
    submitArtificerReplicateMagicItem,
    submitArtificerReanimatedCompanion,
    submitArtificerSteelDefender,
    submitArtificerTinkersMagic,
    submitArtificerTransmuteMagicItem
  } = useArtificerActionSubmissions({
    selectedAction,
    selectedFeatureAction,
    onPersistCharacter,
    closeActionDrawer,
    prepareCharacterForResourceConsumption
  });

  function toggleFeatureOptionSelection(option: FeatureActionOptionCard) {
    if (
      !selectedAction ||
      selectedAction.kind !== "feature" ||
      selectedAction.drawer.kind !== "options"
    ) {
      return;
    }

    if (option.disabled) {
      return;
    }

    const selection = selectedAction.drawer.selection;
    const selectionLimit =
      selection === "multi-confirm"
        ? (selectedAction.drawer.selectionLimit ?? selectedAction.drawer.options.length)
        : 1;

    setSelectedActionOptionKeys((currentKeys) => {
      if (selection === "multi-confirm") {
        if (currentKeys.includes(option.key)) {
          return currentKeys.filter((entry) => entry !== option.key);
        }

        if (currentKeys.length >= selectionLimit) {
          return currentKeys;
        }

        return [...currentKeys, option.key];
      }

      return currentKeys.length === 1 && currentKeys[0] === option.key ? [] : [option.key];
    });
  }

  function handleFeatureOptionExecute(action: FeatureActionCard, option: FeatureActionOptionCard) {
    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(option.economyType);
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionOptionForCharacter(
        preparedCharacter,
        action.key,
        option.key
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      if (option.economyType === "action" && option.actionCategory !== "magic") {
        return consumeNonMagicActionForCharacter(nextCharacter, option);
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    if (option.rollFormula) {
      openDiceRoller({
        title: option.name,
        formula: option.rollFormula,
        formulaDisplay: option.rollFormulaDisplay,
        description: option.rollDescription ?? option.detail,
        onResolvedResult:
          action.key === shifterShiftingActionKey && option.key === shifterBeasthideOptionKey
            ? ({ result }) => {
                onPersistCharacter((currentCharacter) =>
                  applyShifterBeasthideTemporaryHitPointsRollForCharacter(
                    currentCharacter,
                    result.total
                  )
                );
              }
            : undefined
      });
    }

    closeActionDrawer();
  }

  function activateSelectedChannelDivinity(row: ChannelDivinityOptionRow) {
    onPersistCharacter((currentCharacter) => applyActionResourceTransition(currentCharacter, row.option.economyType, prepareCharacterForResourceConsumption, preparedCharacter => activateFeatureActionOptionForCharacter(
        preparedCharacter,
        row.action.key,
        row.option.key
      )));

    if (row.option.rollFormula) {
      openDiceRoller({
        title: row.option.name,
        formula: row.option.rollFormula,
        formulaDisplay: row.option.rollFormulaDisplay ?? row.option.rollFormula,
        description: row.option.rollDescription ?? row.option.detail
      });
    }

    closeActionDrawer();
  }

  function castSelectedChannelDivinitySpell(row: ChannelDivinityOptionRow, spell: SpellEntry) {
    if (channelDivinityUsesRemaining <= 0) {
      return;
    }

    const roundTrackerResource = getRoundTrackerResourceForSpell(spell);
    const spellLevel = Math.max(1, getSpellLevel(spell));

    onPersistCharacter((currentCharacter) => {
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionOptionForCharacter(
        preparedCharacter,
        row.action.key,
        row.option.key
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      const spellForStatusEntries =
        row.option.key === "cleric-war-gods-blessing" &&
        spell.duration.includes(DURATION.CONCENTRATION)
          ? {
              id: spell.id,
              name: spell.name,
              duration: spell.duration.filter(
                (durationPart) => durationPart !== DURATION.CONCENTRATION
              ),
              description: spell.description
            }
          : spell;
      const nextCharacterWithSpellImplementation = applySpellImplementationForCharacter({
        character: nextCharacter,
        spell,
        spellSlotLevel: spellLevel,
        sourceSpellSlotLevel: null,
        castSource: "standard",
        options: {}
      });
      const nextCharacterWithSpellDuration = {
        ...nextCharacterWithSpellImplementation,
        statusEntries: applySpellDurationToStatusEntries(
          nextCharacterWithSpellImplementation.statusEntries,
          spellForStatusEntries,
          {
            ...getSpellImplementationStatusOptionsForCharacter({
              character: nextCharacterWithSpellImplementation,
              spell,
              spellSlotLevel: spellLevel,
              sourceSpellSlotLevel: null,
              castSource: "standard",
              options: {}
            }),
            sourceSpellSlotLevel: null,
            spellFormulas: getSpellFormulaCellsForCharacterSpell(
              spell,
              nextCharacterWithSpellImplementation
            )
          }
        )
      };
      const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
        nextCharacterWithSpellDuration,
        spell,
        {
          spellSlotLevel: spellLevel
        }
      );
      const nextCharacterWithSharedMulti = roundTrackerResource
        ? consumeSharedEconomyMultiForCharacterAction(
            nextCharacterWithSpellCastEffects,
            createEconomyMultiContextForSpell(spell)
          )
        : nextCharacterWithSpellCastEffects;

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(
            nextCharacterWithSharedMulti,
            roundTrackerResource
          )
        : nextCharacterWithSharedMulti;
    });

    closeActionDrawer();
  }

  function activateSelectedElementalSmiteChannelDivinity(
    row: ChannelDivinityOptionRow,
    option: PaladinOathOfTheNobleGeniesElementalSmiteOptionKey
  ) {
    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(row.option.economyType);
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionOptionForCharacter(
        preparedCharacter,
        row.action.key,
        row.option.key
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithEffect = applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
        nextCharacter,
        option
      );

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacterWithEffect, roundTrackerResource)
        : nextCharacterWithEffect;
    });

    closeActionDrawer();
  }

  function confirmSelectedFeatureOptions() {
    if (
      !selectedFeatureAction ||
      !selectedAction ||
      selectedAction.kind !== "feature" ||
      selectedAction.drawer.kind !== "options" ||
      selectedActionOptionKeys.length <= 0
    ) {
      return;
    }

    if (selectedAction.drawer.selection === "multi-confirm") {
      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(
          selectedFeatureAction.economyType
        );
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = activateFeatureActionOptionsForCharacter(
          preparedCharacter,
          selectedFeatureAction.key,
          selectedActionOptionKeys
        );

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        if (
          selectedFeatureAction.economyType === "action" &&
          selectedFeatureAction.actionCategory !== "magic"
        ) {
          return consumeNonMagicActionForCharacter(nextCharacter, selectedFeatureAction);
        }

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
          : nextCharacter;
      });

      closeActionDrawer();
      return;
    }

    const selectedOption = selectedDrawerOptions.find(
      (option) => option.key === selectedActionOptionKeys[0]
    );

    if (!selectedOption) {
      return;
    }

    handleFeatureOptionExecute(selectedFeatureAction, selectedOption);
  }

  function submitMonkElementalBurst() {
    if (!selectedFeatureAction) {
      return;
    }

    const damageFormula = getMonkWarriorOfTheElementsElementalBurstDamageFormula(character);

    if (!damageFormula) {
      return;
    }

    onPersistCharacter((currentCharacter) => applyActionResourceTransition(currentCharacter, selectedFeatureAction.economyType, prepareCharacterForResourceConsumption, preparedCharacter => activateFeatureActionForCharacter(
        preparedCharacter,
        selectedFeatureAction.key
      )));

    openDiceRoller({
      title: selectedFeatureAction.name,
      formula: damageFormula,
      formulaDisplay: damageFormula,
      description: selectedFeatureAction.detail
    });

    closeActionDrawer();
  }

  function submitSorcererWarpingImplosion() {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) => applyActionResourceTransition(currentCharacter, selectedFeatureAction.economyType, prepareCharacterForResourceConsumption, preparedCharacter => activateFeatureActionForCharacter(
        preparedCharacter,
        selectedFeatureAction.key
      )));

    openDiceRoller({
      title: selectedFeatureAction.name,
      formula: sorcererWarpingImplosionDamageFormula,
      formulaDisplay: sorcererWarpingImplosionDamageFormulaDisplay,
      description: "3~30 Damage = 3d10 Force"
    });

    closeActionDrawer();
  }

  function submitSorcererWildMagicSurge() {
    if (!selectedFeatureAction || selectedFeatureAction.key !== sorcererWildMagicSurgeActionKey) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateFeatureActionForCharacter(
        currentCharacter,
        selectedFeatureAction.key
      );

      return nextCharacter === currentCharacter ? currentCharacter : nextCharacter;
    });

    const hasControlledChaos = hasSorcererControlledChaosFeatureForCharacter(character);

    openDiceRoller(
      hasControlledChaos
        ? {
            title: selectedFeatureAction.name,
            description: "Roll twice on the Wild Magic Surge table and use either number.",
            entries: [
              {
                label: "First Roll",
                formula: "1d100",
                formulaDisplay: "1d100"
              },
              {
                label: "Second Roll",
                formula: "1d100",
                formulaDisplay: "1d100"
              }
            ]
          }
        : {
            title: selectedFeatureAction.name,
            formula: "1d100",
            formulaDisplay: "1d100",
            description: "Roll on the Wild Magic Surge table."
          }
    );
  }

  function submitRogueSoulknifePsionicDieRollAction(action: FeatureActionCard) {
    const rollFormula =
      action.key === rogueSoulknifePsychicWhispersActionKey
        ? getRogueSoulknifePsychicWhispersRollFormula(character)
        : getRogueSoulknifePsychicTeleportationRollFormula(character);
    const rollFormulaDisplay =
      action.key === rogueSoulknifePsychicWhispersActionKey
        ? getRogueSoulknifePsychicWhispersRollFormulaDisplay(character)
        : getRogueSoulknifePsychicTeleportationRollFormulaDisplay(character);

    if (!rollFormula) {
      return;
    }

    onPersistCharacter((currentCharacter) => applyActionResourceTransition(currentCharacter, action.economyType, prepareCharacterForResourceConsumption, preparedCharacter => activateFeatureActionForCharacter(preparedCharacter, action.key)));

    openDiceRoller({
      title: action.name,
      formula: rollFormula,
      formulaDisplay: rollFormulaDisplay ?? rollFormula,
      description: action.detail
    });

    closeActionDrawer();
  }

  function submitRage() {
    if (!selectedFeatureAction) {
      return;
    }

    const requiresRageOption = selectedRageOptions.length > 0;
    const requiresPowerOption = selectedRagePowerOptions.length > 0;

    if (requiresRageOption && !selectedRageOptionKey) {
      return;
    }

    if (requiresPowerOption && !selectedRagePowerOptionKey) {
      return;
    }

    onPersistCharacter((currentCharacter) => applyActionResourceTransition(currentCharacter, selectedFeatureAction.economyType, prepareCharacterForResourceConsumption, preparedCharacter => requiresRageOption && selectedRageOptionKey
          ? activateBarbarianWildHeartRage(
              preparedCharacter,
              selectedRageOptionKey,
              selectedRagePowerOptionKey ?? undefined,
              {
                useRageOfTheGods: isRageOfTheGodsSelected
              }
            )
          : activateBarbarianRage(preparedCharacter, {
              useRageOfTheGods: isRageOfTheGodsSelected
            })));

    closeActionDrawer();
  }

  function rollFixedSpellHuntersRimeTemporaryHitPoints(spell: Pick<SpellEntry, "id" | "name">) {
    if (spell.id !== huntersMarkSpellId || !fixedSpellHuntersRimeTemporaryHitPointsFormula) {
      return;
    }

    openDiceRoller({
      title: "Hunter's Rime",
      formula: fixedSpellHuntersRimeTemporaryHitPointsFormula,
      formulaDisplay:
        fixedSpellHuntersRimeTemporaryHitPointsFormulaDisplay ??
        fixedSpellHuntersRimeTemporaryHitPointsFormula,
      description: `When you cast ${spell.name}, you gain Temporary Hit Points.`,
      onResolvedResult: ({ result }) => {
        onPersistCharacter((currentCharacter) =>
          applyRolledTemporaryHitPointsToCharacter(currentCharacter, result.total, "Hunter's Rime")
        );
      }
    });
  }

  function rollFixedSpellImplementationEffects(
    spell: SpellEntry,
    spellSlotLevel: number | null,
    options: SpellImplementationOptionValues,
    castSource: SpellImplementationCastSource
  ) {
    const rollEffects = getSpellImplementationRollEffectsForCharacter({
      character,
      spell,
      spellSlotLevel,
      sourceSpellSlotLevel: null,
      castSource,
      options
    });

    rollEffects.forEach((effect) => {
      openDiceRoller({
        title: effect.title,
        formula: effect.formula,
        formulaDisplay: effect.formulaDisplay ?? effect.formula,
        description: effect.description,
        onResolvedResult: effect.applyResolvedResult
          ? ({ result }) => {
              onPersistCharacter((currentCharacter) =>
                effect.applyResolvedResult!(currentCharacter, result)
              );
            }
          : undefined
      });
    });
  }

  function rollFortifyingSoulHealing(
    action: FeatureActionCard,
    options: { applySelfResult?: boolean } = {}
  ) {
    const healingFormula = getRangerWinterWalkerFortifyingSoulHealingFormula(character);
    const healingFormulaDisplay =
      getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay(character);
    const shouldApplySelfResult = options.applySelfResult === true;

    if (!healingFormula) {
      return;
    }

    openDiceRoller({
      title: action.name,
      formula: healingFormula,
      formulaDisplay: healingFormulaDisplay ?? healingFormula,
      description: action.detail,
      onResolvedResult: shouldApplySelfResult
        ? ({ result }) => {
            onPersistCharacter((currentCharacter) =>
              applyRolledHealingToCharacter(currentCharacter, result.total)
            );
          }
        : undefined
    });
  }

  function castFixedSpellAction(options?: {
    summonCompanions?: CharacterCompanion[];
    roundTrackerResourceOverride?: "action" | "bonusAction" | "reaction" | null;
    spellCastEffectIds?: string[];
    useBeguilingMagic?: boolean;
    useJoltToLife?: boolean;
    useElementalSmite?: boolean;
    elementalSmiteOption?: string | null;
    useGoliathAncestry?: boolean;
    useFrozenHaunt?: boolean;
    frozenHauntFallbackSlotLevel?: number;
    castAsRitual?: boolean;
    spellActionPathId?: string | null;
    spellImplementationCastSource?: SpellImplementationCastSource;
    spellImplementationOptions?: SpellImplementationOptionValues;
  }) {
    if (!fixedSpellExecute || !fixedSpellEntry || !selectedFeatureAction) {
      return;
    }

    const isShadowBeastsCast = fixedSpellExecute.effectKind === "beasts-of-ill-omen";
    const spellForCast = isShadowBeastsCast
      ? getShadowBeastsCastSpell(
          fixedSpellEntry,
          options?.spellImplementationOptions?.[shadowBeastsWithoutConcentrationOptionId] === true
        )
      : fixedSpellEntry;
    const summonCompanions = isShadowBeastsCast
      ? prepareShadowBeastsSummons(spellForCast, options?.summonCompanions ?? [])
      : (options?.summonCompanions ?? []);
    if (isShadowBeastsCast && summonCompanions.length === 0) return;

    const useBeguilingMagic = options?.useBeguilingMagic === true;
    const useElementalSmite =
      options?.useElementalSmite === true &&
      selectedActionSpellSupportsElementalSmite &&
      channelDivinityUsesRemaining > 0;
    const elementalSmiteOption =
      useElementalSmite &&
      isPaladinOathOfTheNobleGeniesElementalSmiteOptionKey(options?.elementalSmiteOption)
        ? options.elementalSmiteOption
        : null;
    const useFrozenHaunt =
      options?.useFrozenHaunt === true && selectedActionSpellFrozenHauntOptionState !== null;
    const useGoliathAncestry =
      options?.useGoliathAncestry === true &&
      selectedActionSpellGoliathAncestryState !== null &&
      !selectedActionSpellGoliathAncestryState.disabled;
    const frozenHauntFallbackSlotLevel = useFrozenHaunt
      ? (options?.frozenHauntFallbackSlotLevel ?? null)
      : null;
    const castAsRitual = options?.castAsRitual === true;
    const minimumSlotLevel = Math.max(
      getSpellLevel(fixedSpellEntry),
      fixedSpellMinimumActionSlotLevel ?? 1
    );
    const slotLevel = Math.max(minimumSlotLevel, selectedFixedSpellSlotLevel);
    const castsWithoutSpellSlot =
      fixedSpellFreeCastSlotLevel !== null && slotLevel === fixedSpellFreeCastSlotLevel;
    const roundTrackerResource =
      options?.roundTrackerResourceOverride ??
      fixedSpellActionPaths[0]?.roundTrackerResource ??
      getRoundTrackerResourceForEconomyType(selectedFeatureAction.economyType);
    const fixedSpellActionPath =
      fixedSpellActionPaths.find((path) => path.roundTrackerResource === roundTrackerResource) ??
      fixedSpellActionPaths[0] ??
      null;
    const spellImplementationOptions = {
      ...(options?.spellImplementationOptions ?? {}),
      ...(fixedSpellExecute.forcedSpellImplementationOptions ?? {}),
      ...(fixedSpellActionPath?.forcedSpellImplementationOptions ?? {})
    };
    const spellImplementationCastSource =
      options?.spellImplementationCastSource ??
      fixedSpellActionPath?.spellImplementationCastSource ??
      fixedSpellExecute.spellImplementationCastSource ??
      "fixed-feature";
    const spellActionPathId = options?.spellActionPathId ?? fixedSpellActionPath?.id ?? null;
    const spellCastEffectIds = [
      ...new Set([
        ...(fixedSpellExecute.spellCastEffectIds ?? []),
        ...(fixedSpellActionPath?.spellCastEffectIds ?? []),
        ...(options?.spellCastEffectIds ?? [])
      ])
    ];
    const sharedEconomyContext = fixedSpellActionPath
      ? {
          economyType: fixedSpellActionPath.economyType,
          actionCategory: ACTION_CATEGORY.MAGIC,
          spellLevel: fixedSpellEntry.spellLevel
        }
      : createEconomyMultiContextForFeatureAction(selectedFeatureAction);

    if (useElementalSmite && elementalSmiteOption === null) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      let nextCharacter = preparedCharacter;
      const spellSlotTotals = getSheetSpellSlotTotals(preparedCharacter);
      const spellSlotsExpended = normalizeSpellSlotsExpended(
        preparedCharacter.spellSlotsExpended,
        spellSlotTotals
      );

      if (isShadowBeastsCast) {
        nextCharacter = spendShadowBeastsSorceryPoints(preparedCharacter);
        if (nextCharacter === preparedCharacter) return currentCharacter;
        nextCharacter = endPreviousShadowBeastsCast(nextCharacter);
      } else if (fixedSpellExecute.effectKind === "paladins-smite") {
        nextCharacter = consumePaladinsSmiteUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "faithful-steed") {
        nextCharacter = consumeFaithfulSteedUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "favored-enemy") {
        nextCharacter = consumeRangerFavoredEnemyUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "shadow-arts-darkness") {
        nextCharacter = expendMonkFocusPointForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "contact-patron") {
        nextCharacter = consumeContactPatronUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "gift-of-the-depths") {
        nextCharacter = consumeWarlockGiftOfTheDepthsUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "mantle-of-majesty") {
        nextCharacter =
          getMantleOfMajestyUsesRemainingForCharacter(preparedCharacter) > 0
            ? consumeMantleOfMajestyUseForCharacter(preparedCharacter)
            : preparedCharacter;
      } else if (fixedSpellExecute.effectKind === "restorative-reagents") {
        nextCharacter = consumeArtificerRestorativeReagentsUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "illuminated-cartography") {
        nextCharacter = consumeArtificerIlluminatedCartographyUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "unerring-path") {
        nextCharacter = consumeArtificerUnerringPathUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "facilitated-revival") {
        nextCharacter = consumeArtificerFacilitatedRevivalUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "voice-of-death") {
        nextCharacter = consumePhantomVoiceOfDeathUse(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "conjured-cauldron") {
        nextCharacter = consumeArtificerConjuredCauldronUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "genie-magic") {
        nextCharacter = spendGenieMagicWishMagicForCharacter(preparedCharacter);
      }

      if (
        nextCharacter === preparedCharacter &&
        fixedSpellExecute.effectKind === "gift-of-the-depths"
      ) {
        return currentCharacter;
      }

      if (!canAddSpellSummonCompanionsForCast(nextCharacter, summonCompanions)) {
        return currentCharacter;
      }

      if (
        nextCharacter === preparedCharacter &&
        fixedSpellExecute.effectKind !== "mantle-of-majesty" &&
        !isWarlockInvocationSpellEffectKind(fixedSpellExecute.effectKind)
      ) {
        return currentCharacter;
      }

      let nextCharacterWithSpellSlot = nextCharacter;
      const nextSpellSlotsExpended = [...spellSlotsExpended];

      if (fixedSpellConsumesSpellSlot && !castsWithoutSpellSlot) {
        if (
          (spellSlotTotals[slotLevel - 1] ?? 0) - (nextSpellSlotsExpended[slotLevel - 1] ?? 0) <=
          0
        ) {
          return currentCharacter;
        }

        nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;
        nextCharacterWithSpellSlot = {
          ...nextCharacter,
          spellSlotsExpended: nextSpellSlotsExpended
        };
      }

      const currentFrozenHauntOptionState =
        getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter(
          preparedCharacter,
          fixedSpellEntry,
          spellSlotTotals,
          nextSpellSlotsExpended
        );
      const usesFrozenHauntCharge =
        useFrozenHaunt && (currentFrozenHauntOptionState?.usesRemaining ?? 0) > 0;
      const shouldSpendFrozenHauntFallbackSlot = useFrozenHaunt && !usesFrozenHauntCharge;

      if (shouldSpendFrozenHauntFallbackSlot) {
        const availableFrozenHauntFallbackSlotLevels =
          getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter(
            preparedCharacter,
            fixedSpellEntry,
            spellSlotTotals,
            nextSpellSlotsExpended
          )?.fallbackSpellSlotLevels ?? [];

        if (
          frozenHauntFallbackSlotLevel === null ||
          !availableFrozenHauntFallbackSlotLevels.includes(frozenHauntFallbackSlotLevel)
        ) {
          return currentCharacter;
        }

        nextSpellSlotsExpended[frozenHauntFallbackSlotLevel - 1] =
          (nextSpellSlotsExpended[frozenHauntFallbackSlotLevel - 1] ?? 0) + 1;
        nextCharacterWithSpellSlot = {
          ...nextCharacterWithSpellSlot,
          spellSlotsExpended: nextSpellSlotsExpended
        };
      }

      const nextCharacterWithFeatureStatus =
        fixedSpellExecute.effectKind === "mantle-of-majesty"
          ? applyMantleOfMajestyStatusForCharacter(nextCharacterWithSpellSlot)
          : nextCharacterWithSpellSlot;
      const sourceSpellSlotLevel = shouldSpendFrozenHauntFallbackSlot
        ? frozenHauntFallbackSlotLevel
        : fixedSpellConsumesSpellSlot && !castsWithoutSpellSlot
          ? slotLevel
          : null;
      const useJoltToLife =
        options?.useJoltToLife === true && fixedSpellEntry.id === spareTheDyingSpellId;
      const nextCharacterWithJoltToLife = useJoltToLife
        ? consumeArtificerJoltToLifeUse(nextCharacterWithFeatureStatus)
        : nextCharacterWithFeatureStatus;
      if (useJoltToLife && nextCharacterWithJoltToLife === nextCharacterWithFeatureStatus)
        return currentCharacter;
      const nextCharacterWithSpellImplementation = applySpellImplementationForCharacter({
        character: nextCharacterWithJoltToLife,
        spell: spellForCast,
        spellSlotLevel: slotLevel,
        sourceSpellSlotLevel,
        castSource: spellImplementationCastSource,
        options: spellImplementationOptions
      });
      const fixedSpellStatusEntries = applySpellDurationToStatusEntries(
        nextCharacterWithSpellImplementation.statusEntries,
        spellForCast,
        {
          ...getSpellImplementationStatusOptionsForCharacter({
            character: nextCharacterWithSpellImplementation,
            spell: spellForCast,
            spellSlotLevel: slotLevel,
            sourceSpellSlotLevel,
            castSource: spellImplementationCastSource,
            options: spellImplementationOptions
          }),
          sourceSpellSlotLevel,
          spellFormulas: getSpellFormulaCellsForCharacterSpell(
            spellForCast,
            nextCharacterWithSpellImplementation
          )
        }
      );
      const nextCharacterWithSpellDuration = appendSpellSummonCompanionsForCast(
        {
          ...nextCharacterWithSpellImplementation,
          statusEntries: useFrozenHaunt
            ? applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter(fixedSpellStatusEntries)
            : fixedSpellStatusEntries
        },
        summonCompanions
      );
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithSpellDuration)
        : nextCharacterWithSpellDuration;
      const nextCharacterWithElementalSmite = useElementalSmite
        ? applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
            expendChannelDivinityUseForCharacter(nextCharacterWithBeguilingMagic),
            elementalSmiteOption
          )
        : nextCharacterWithBeguilingMagic;
      const nextCharacterWithFrozenHaunt = usesFrozenHauntCharge
        ? consumeRangerWinterWalkerFrozenHauntUseForCharacter(nextCharacterWithElementalSmite)
        : nextCharacterWithElementalSmite;
      const nextCharacterWithGoliathAncestry = useGoliathAncestry
        ? consumeGoliathGiantAncestryUseForCharacter(nextCharacterWithFrozenHaunt)
        : nextCharacterWithFrozenHaunt;
      const nextCharacterWithFeatCastEffects = applyFeatureSpellCastEffectsForCharacter(
        nextCharacterWithGoliathAncestry,
        fixedSpellEntry,
        spellCastEffectIds,
        {
          spellSlotLevel: slotLevel,
          castSource: spellImplementationCastSource,
          options: spellImplementationOptions,
          spellActionPathId
        }
      );

      if (!nextCharacterWithFeatCastEffects) {
        return currentCharacter;
      }

      const spellConsumedSpellSlot =
        (fixedSpellConsumesSpellSlot && !castsWithoutSpellSlot) ||
        shouldSpendFrozenHauntFallbackSlot;
      const nextCharacterWithSorcererSubclassRecharge = spellConsumedSpellSlot
        ? restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter(
            nextCharacterWithFeatCastEffects
          )
        : nextCharacterWithFeatCastEffects;
      const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
        nextCharacterWithSorcererSubclassRecharge,
        fixedSpellEntry,
        { includeBardBattleMagic: !castAsRitual }
      );
      const nextCharacterWithSharedMulti = roundTrackerResource
        ? consumeSharedEconomyMultiForCharacterAction(
            nextCharacterWithSpellCastEffects,
            sharedEconomyContext
          )
        : nextCharacterWithSpellCastEffects;

      if (nextCharacterWithSharedMulti !== nextCharacterWithSpellCastEffects) {
        return nextCharacterWithSharedMulti;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(
            nextCharacterWithSharedMulti,
            roundTrackerResource
          )
        : nextCharacterWithSharedMulti;
    });

    rollFixedSpellHuntersRimeTemporaryHitPoints(fixedSpellEntry);
    rollFixedSpellImplementationEffects(
      fixedSpellEntry,
      slotLevel,
      spellImplementationOptions,
      spellImplementationCastSource
    );
    closeActionDrawer();
  }

  function castDivineInterventionSpell(options?: {
    useBeguilingMagic?: boolean;
    useGoliathAncestry?: boolean;
    spellImplementationOptions?: SpellImplementationOptionValues;
  }) {
    if (!selectedDivineInterventionSpell || !selectedFeatureAction) {
      return;
    }

    const useBeguilingMagic = options?.useBeguilingMagic === true;
    const useGoliathAncestry =
      options?.useGoliathAncestry === true &&
      selectedActionSpellGoliathAncestryState !== null &&
      !selectedActionSpellGoliathAncestryState.disabled;
    const spellImplementationOptions = options?.spellImplementationOptions ?? {};

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionForCharacter(
        preparedCharacter,
        selectedFeatureAction.key
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithSpellImplementation = applySpellImplementationForCharacter({
        character: nextCharacter,
        spell: selectedDivineInterventionSpell,
        spellSlotLevel: null,
        sourceSpellSlotLevel: null,
        castSource: "divine-intervention",
        options: spellImplementationOptions
      });
      const nextCharacterWithSpellDuration = {
        ...nextCharacterWithSpellImplementation,
        statusEntries: applySpellDurationToStatusEntries(
          nextCharacterWithSpellImplementation.statusEntries,
          selectedDivineInterventionSpell,
          {
            ...getSpellImplementationStatusOptionsForCharacter({
              character: nextCharacterWithSpellImplementation,
              spell: selectedDivineInterventionSpell,
              spellSlotLevel: null,
              sourceSpellSlotLevel: null,
              castSource: "divine-intervention",
              options: spellImplementationOptions
            }),
            sourceSpellSlotLevel: null,
            spellFormulas: getSpellFormulaCellsForCharacterSpell(
              selectedDivineInterventionSpell,
              nextCharacterWithSpellImplementation
            )
          }
        )
      };
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithSpellDuration)
        : nextCharacterWithSpellDuration;
      const nextCharacterWithGoliathAncestry = useGoliathAncestry
        ? consumeGoliathGiantAncestryUseForCharacter(nextCharacterWithBeguilingMagic)
        : nextCharacterWithBeguilingMagic;
      const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
        nextCharacterWithGoliathAncestry,
        selectedDivineInterventionSpell
      );

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(
            nextCharacterWithSpellCastEffects,
            roundTrackerResource
          )
        : nextCharacterWithSpellCastEffects;
    });

    closeActionDrawer();
  }

  function openMysticArcanumSpell(spellLevel: number, spell: SpellEntry) {
    if (spellLevel !== 6 && spellLevel !== 7 && spellLevel !== 8 && spellLevel !== 9) {
      return;
    }

    setSelectedMysticArcanumSpell(spell);
    setSelectedMysticArcanumSpellLevel(spellLevel);
  }

  function castMysticArcanumSpell(options?: {
    useBeguilingMagic?: boolean;
    useGoliathAncestry?: boolean;
    spellImplementationOptions?: SpellImplementationOptionValues;
  }) {
    if (!selectedMysticArcanumSpell || selectedMysticArcanumSpellLevel === null) {
      return;
    }

    const useBeguilingMagic = options?.useBeguilingMagic === true;
    const useGoliathAncestry =
      options?.useGoliathAncestry === true &&
      selectedActionSpellGoliathAncestryState !== null &&
      !selectedActionSpellGoliathAncestryState.disabled;
    const spellImplementationOptions = options?.spellImplementationOptions ?? {};

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForSpell(selectedMysticArcanumSpell);
      const preparedCharacter = roundTrackerResource
        ? prepareCharacterForRoundTrackerResourceConsumption(currentCharacter, roundTrackerResource)
        : currentCharacter;
      const nextCharacter = consumeMysticArcanumUseForCharacter(
        preparedCharacter,
        selectedMysticArcanumSpellLevel
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithSpellImplementation = applySpellImplementationForCharacter({
        character: nextCharacter,
        spell: selectedMysticArcanumSpell,
        spellSlotLevel: selectedMysticArcanumSpellLevel,
        sourceSpellSlotLevel: null,
        castSource: "mystic-arcanum",
        options: spellImplementationOptions
      });
      const nextCharacterWithSpellDuration = {
        ...nextCharacterWithSpellImplementation,
        statusEntries: applySpellDurationToStatusEntries(
          nextCharacterWithSpellImplementation.statusEntries,
          selectedMysticArcanumSpell,
          {
            ...getSpellImplementationStatusOptionsForCharacter({
              character: nextCharacterWithSpellImplementation,
              spell: selectedMysticArcanumSpell,
              spellSlotLevel: selectedMysticArcanumSpellLevel,
              sourceSpellSlotLevel: null,
              castSource: "mystic-arcanum",
              options: spellImplementationOptions
            }),
            sourceSpellSlotLevel: null,
            spellFormulas: getSpellFormulaCellsForCharacterSpell(
              selectedMysticArcanumSpell,
              nextCharacterWithSpellImplementation
            )
          }
        )
      };
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithSpellDuration)
        : nextCharacterWithSpellDuration;
      const nextCharacterWithGoliathAncestry = useGoliathAncestry
        ? consumeGoliathGiantAncestryUseForCharacter(nextCharacterWithBeguilingMagic)
        : nextCharacterWithBeguilingMagic;
      const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
        nextCharacterWithGoliathAncestry,
        selectedMysticArcanumSpell
      );

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(
            nextCharacterWithSpellCastEffects,
            roundTrackerResource
          )
        : nextCharacterWithSpellCastEffects;
    });

    closeActionDrawer();
  }

  function updateMonkElementalAttunementResistanceDamageType(nextDamageType: DAMAGE_TYPE) {
    onPersistCharacter((currentCharacter) =>
      setMonkWarriorOfTheElementsElementalResistanceDamageTypeSelection(
        currentCharacter,
        nextDamageType
      )
    );
  }

  return {
    toggleFeatureOptionSelection,
    handleFeatureOptionExecute,
    activateSelectedChannelDivinity,
    castSelectedChannelDivinitySpell,
    activateSelectedElementalSmiteChannelDivinity,
    confirmSelectedFeatureOptions,
    isArcaneFirearmSubmitting,
    isArtificerMagicItemTinkerSubmitting,
    isEldritchCannonSubmitting,
    isExperimentalElixirSubmitting,
    isReplicateMagicItemSubmitting,
    isReanimatedCompanionSubmitting,
    isSteelDefenderSubmitting,
    isTinkersMagicSubmitting,
    submitArtificerArcaneFirearm,
    submitArtificerChargeMagicItem,
    submitArtificerDrainMagicItem,
    submitArtificerEldritchCannon,
    submitArtificerExperimentalElixir,
    submitArtificerReplicateMagicItem,
    submitArtificerReanimatedCompanion,
    submitArtificerSteelDefender,
    submitArtificerTinkersMagic,
    submitArtificerTransmuteMagicItem,
    submitLayOnHands,
    submitAasimarHealingHands,
    submitAasimarCelestialRevelation,
    submitDragonbornBreathWeapon,
    submitDragonbornDraconicFlight,
    submitDwarfStonecunning,
    submitGoliathCloudsJaunt,
    submitGoliathLargeForm,
    submitGoliathStonesEndurance,
    submitGoliathStormsThunder,
    submitWarriorOfTheGods,
    submitIndomitable,
    submitHealingLight,
    submitVestigeCompanion,
    submitMonkElementalBurst,
    submitSorcererWarpingImplosion,
    submitSorcererSpellfireBurst,
    submitSorcererWildMagicSurge,
    submitSneakAttack,
    submitRogueSoulknifePsionicDieRollAction,
    submitArcaneRecovery,
    submitPortent,
    submitThirdEye,
    submitBlessingOfTheTrickster,
    submitBoonOfFluidFormsShapechanger,
    submitWildShape,
    submitStarryForm,
    submitWildCompanion,
    submitNatureMagician,
    submitWildResurgence,
    submitRage,
    submitBrutalStrike,
    convertSpellSlotToSorceryPoints,
    createSpellSlotFromSorceryPoints,
    confirmFontOfMagicSelection,
    rollFixedSpellHuntersRimeTemporaryHitPoints,
    rollFortifyingSoulHealing,
    castFixedSpellAction,
    castDivineInterventionSpell,
    openMysticArcanumSpell,
    castMysticArcanumSpell,
    updateMonkElementalAttunementResistanceDamageType
  };
}
