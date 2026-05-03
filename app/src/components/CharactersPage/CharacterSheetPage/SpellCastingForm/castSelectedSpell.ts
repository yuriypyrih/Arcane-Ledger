/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// @ts-nocheck

export function castSelectedSpellWithContext(context: Record<string, any>, options?: any) {
  const {
    ACTION_CATEGORY, DURATION, activateFighterPsiWarriorTelekineticMasterSpellCastForCharacter, applyPaladinOathOfTheNobleGeniesElementalSmiteEffect, applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter, applySpellCastFeatureEffectsForCharacter, applySpellConcentrationToStatusEntries, applyWizardEvokerOverchannelUse, canUseWarlockCelestialPatronRadiantSoulForSpell,
    canUseWizardEvokerOverchannelForSpellSlot, channelDivinityUsesRemaining, character, clampNumber, closeSelectedSpell, consumeBeguilingMagicOrBardicInspirationForCharacter, consumeBlessingOfMoonlightUseForCharacter, consumeDruidNaturalRecoveryUseForCharacter, consumeDruidStarMapGuidingBoltUseForCharacter, consumeFeyTouchedFreeCastForCharacter, consumeMagicInitiateFreeCastForCharacter,
    consumeRangerFeyReinforcementsUseForCharacter, consumeRangerMistyWandererUseForCharacter, consumeRangerWinterWalkerFrozenHauntUseForCharacter, consumeRoundTrackerResourceForCharacter, consumeSharedEconomyMultiForCharacterAction, consumeSorcererSubclassTamedSurgeUseForCharacter, consumeWarlockStepsOfTheFeyUseForCharacter, consumeWizardIllusionistPhantasmalCreaturesUseForCharacter, consumeWizardSignatureSpellFreeCastForCharacter,
    createEconomyMultiContextForSpell, druidNaturalRecoveryUsesRemaining, expendChannelDivinityUseForCharacter, fighterPsiWarriorEnergyDiceRemaining, fighterPsiWarriorTelekineticMasterConcentrationStatusSourceId, fighterPsiWarriorTelekineticMasterUsesRemaining, getDruidStarMapGuidingBoltUsesRemainingForCharacter, getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter, getRoundTrackerResourceForSpell,
    getSorceryPointsRemaining, getSpellLevel, getSpellSlotTotalsForCharacter, getWizardIllusionistPhantasmalCreaturesSpellOptionStateForCharacter, grantMonkFleetStepFollowUpForSpellCastIfEligible, hasWizardRitualAdept, hasWizardSignatureSpellFreeCastAvailableForCharacter, normalizeSpellSlotsExpended, onPersistCharacter,
    prepareCharacterForResourceConsumption, rangerFeyReinforcementsUsesRemaining, rangerMistyWandererUsesRemaining, restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter, rollHuntersRimeTemporaryHitPointsForSpellCast, rollSpellAttackForSpellCast, selectedSpell, selectedSpellActionPaths, selectedSpellCanIgnoreSpellcastingBlock,
    selectedSpellCanOnlyBeCastAsRitual, selectedSpellDisplay, selectedSpellFrozenHauntOptionState, selectedSpellIsSpellbookOnly, selectedSpellIsWizardSignatureSpell, selectedSpellIsWizardSpellMastery, selectedSpellPhantasmalCreaturesOptionState, selectedSpellSlotLevel, selectedSpellSupportsBewitchingMagic,
    selectedSpellSupportsElementalSmite, selectedSpellSupportsFeyMagic, selectedSpellSupportsFeyReinforcements, selectedSpellSupportsMagicInitiate, selectedSpellSupportsMindMagic, selectedSpellSupportsMistyWanderer, selectedSpellSupportsNaturalRecovery, selectedSpellSupportsOverchannel, selectedSpellSupportsPsionicSorcery, selectedSpellSupportsStarMap, selectedSpellSupportsStepsOfTheFey,
    selectedSpellSupportsTamedSurge, selectedSpellSupportsTelekineticMaster, selectedSpellSupportsWarGodsBlessing, sorceryPointsRemaining, spellSlotsExpended, spellSlotsRemaining, spellcastingState, spendSorceryPoints, tamedSurgeUsesRemaining,
    warlockStepsOfTheFeyUsesRemaining, wizardSignatureSpellLevel
  } = context;

if (!selectedSpell || (spellcastingState.blocked && !selectedSpellCanIgnoreSpellcastingBlock)) {
      return;
    }

    const spellLevel = getSpellLevel(selectedSpell);
    const roundTrackerResource =
      options?.roundTrackerResourceOverride ??
      selectedSpellActionPaths[0]?.roundTrackerResource ??
      getRoundTrackerResourceForSpell(selectedSpell);
    const selectedSpellActionPath =
      selectedSpellActionPaths.find((path) => path.roundTrackerResource === roundTrackerResource) ??
      selectedSpellActionPaths[0] ??
      null;
    const sharedEconomyContext = selectedSpellActionPath
      ? {
          economyType: selectedSpellActionPath.economyType,
          actionCategory: ACTION_CATEGORY.MAGIC,
          spellLevel: selectedSpell.spellLevel
        }
      : createEconomyMultiContextForSpell(selectedSpell);
    const castAsRitual = options?.castAsRitual === true && selectedSpell.ritual === true;
    const useBeguilingMagic = options?.useBeguilingMagic === true;
    const useMindMagic =
      options?.useMindMagic === true &&
      selectedSpellSupportsMindMagic &&
      channelDivinityUsesRemaining > 0;
    const useWarGodsBlessing =
      options?.useWarGodsBlessing === true &&
      selectedSpellSupportsWarGodsBlessing &&
      channelDivinityUsesRemaining > 0;
    const useStarMap = options?.useStarMap === true && selectedSpellSupportsStarMap;
    const useMagicInitiate =
      options?.useMagicInitiate === true && selectedSpellSupportsMagicInitiate;
    const useFeyMagic = options?.useFeyMagic === true && selectedSpellSupportsFeyMagic;
    const useBlessingOfMoonlight = options?.useBlessingOfMoonlight === true;
    const useElementalSmite =
      options?.useElementalSmite === true &&
      selectedSpellSupportsElementalSmite &&
      channelDivinityUsesRemaining > 0;
    const elementalSmiteOption = useElementalSmite ? (options?.elementalSmiteOption ?? null) : null;
    const useStepsOfTheFey =
      options?.useStepsOfTheFey === true &&
      selectedSpellSupportsStepsOfTheFey &&
      warlockStepsOfTheFeyUsesRemaining > 0;
    const useBewitchingMagic =
      options?.useBewitchingMagic === true && selectedSpellSupportsBewitchingMagic;
    const useMistyWanderer =
      options?.useMistyWanderer === true &&
      selectedSpellSupportsMistyWanderer &&
      rangerMistyWandererUsesRemaining > 0;
    const useFeyReinforcements =
      options?.useFeyReinforcements === true &&
      selectedSpellSupportsFeyReinforcements &&
      rangerFeyReinforcementsUsesRemaining > 0;
    const usePhantasmalCreatures =
      options?.usePhantasmalCreatures === true &&
      selectedSpellPhantasmalCreaturesOptionState !== null &&
      selectedSpellPhantasmalCreaturesOptionState.usesRemaining > 0;
    const useFeyReinforcementsNoConcentration =
      useFeyReinforcements && options?.useFeyReinforcementsNoConcentration === true;
    const useNaturalRecovery = options?.useNaturalRecovery === true;
    const usePsionicSorcery =
      options?.usePsionicSorcery === true && selectedSpellSupportsPsionicSorcery;
    const useTamedSurge =
      options?.useTamedSurge === true &&
      selectedSpellSupportsTamedSurge &&
      tamedSurgeUsesRemaining > 0;
    const useTelekineticMaster =
      options?.useTelekineticMaster === true &&
      selectedSpellSupportsTelekineticMaster &&
      (fighterPsiWarriorTelekineticMasterUsesRemaining > 0 ||
        fighterPsiWarriorEnergyDiceRemaining > 0);
    const useRadiantSoul =
      options?.useRadiantSoul === true &&
      canUseWarlockCelestialPatronRadiantSoulForSpell(character, selectedSpellDisplay);
    const wantsOverchannel = options?.useOverchannel === true && selectedSpellSupportsOverchannel;
    const useFrozenHaunt =
      options?.useFrozenHaunt === true && selectedSpellFrozenHauntOptionState !== null;
    const frozenHauntFallbackSlotLevel = useFrozenHaunt
      ? (options?.frozenHauntFallbackSlotLevel ?? null)
      : null;
    const spellForStatusEntries = useFeyReinforcementsNoConcentration
      ? {
          name: selectedSpell.name,
          duration: ["1 minute"]
        }
      : useWarGodsBlessing && selectedSpell.duration.includes(DURATION.CONCENTRATION)
        ? {
            name: selectedSpell.name,
            duration: selectedSpell.duration.filter(
              (durationPart) => durationPart !== DURATION.CONCENTRATION
            )
          }
        : selectedSpell;
    const concentrationStatusOptions = useTelekineticMaster
      ? {
          sourceId: fighterPsiWarriorTelekineticMasterConcentrationStatusSourceId
        }
      : undefined;
    const canCastSpellbookRitual =
      selectedSpellIsSpellbookOnly &&
      castAsRitual &&
      (hasWizardRitualAdept || selectedSpellCanOnlyBeCastAsRitual);

    if (selectedSpellIsSpellbookOnly && !canCastSpellbookRitual) {
      return;
    }

    if (useElementalSmite && elementalSmiteOption === null) {
      return;
    }

    if (spellLevel === 0) {
      if (roundTrackerResource) {
        onPersistCharacter((currentCharacter) => {
          const preparedCharacter = prepareCharacterForResourceConsumption(
            currentCharacter,
            roundTrackerResource
          );
          const nextCharacter = {
            ...preparedCharacter,
            statusEntries: applySpellConcentrationToStatusEntries(
              preparedCharacter.statusEntries,
              spellForStatusEntries,
              concentrationStatusOptions
            )
          };
          const nextCharacterWithBeguilingMagic = useBeguilingMagic
            ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacter)
            : nextCharacter;
          const nextCharacterWithMindMagic = useMindMagic
            ? expendChannelDivinityUseForCharacter(nextCharacterWithBeguilingMagic)
            : nextCharacterWithBeguilingMagic;
          const nextCharacterWithSpellOptions = useBlessingOfMoonlight
            ? consumeBlessingOfMoonlightUseForCharacter(nextCharacterWithMindMagic)
            : nextCharacterWithMindMagic;
          const nextCharacterWithElementalSmite = useElementalSmite
            ? applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
                expendChannelDivinityUseForCharacter(nextCharacterWithSpellOptions),
                elementalSmiteOption
              )
            : nextCharacterWithSpellOptions;

          const nextCharacterWithSharedMulti = consumeSharedEconomyMultiForCharacterAction(
            nextCharacterWithElementalSmite,
            sharedEconomyContext
          );

          if (nextCharacterWithSharedMulti !== nextCharacterWithElementalSmite) {
            return applySpellCastFeatureEffectsForCharacter(
              nextCharacterWithSharedMulti,
              selectedSpell,
              { useRadiantSoul }
            );
          }

          const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
            nextCharacterWithElementalSmite,
            selectedSpell,
            { useRadiantSoul }
          );
          const nextCharacterWithFleetStep = grantMonkFleetStepFollowUpForSpellCastIfEligible(
            nextCharacterWithSpellCastEffects,
            roundTrackerResource
          );

          return consumeRoundTrackerResourceForCharacter(
            nextCharacterWithFleetStep,
            roundTrackerResource
          );
        });
      } else {
        onPersistCharacter((currentCharacter) => {
          const nextCharacter = useBeguilingMagic
            ? consumeBeguilingMagicOrBardicInspirationForCharacter(currentCharacter)
            : currentCharacter;
          const nextCharacterWithMindMagic = useMindMagic
            ? expendChannelDivinityUseForCharacter(nextCharacter)
            : nextCharacter;
          const nextCharacterWithSpellOptions = useBlessingOfMoonlight
            ? consumeBlessingOfMoonlightUseForCharacter(nextCharacterWithMindMagic)
            : nextCharacterWithMindMagic;
          const nextCharacterWithElementalSmite = useElementalSmite
            ? applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
                expendChannelDivinityUseForCharacter(nextCharacterWithSpellOptions),
                elementalSmiteOption
              )
            : nextCharacterWithSpellOptions;

          const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
            nextCharacterWithElementalSmite,
            selectedSpell,
            { useRadiantSoul }
          );

          return {
            ...nextCharacterWithSpellCastEffects,
            statusEntries: applySpellConcentrationToStatusEntries(
              nextCharacterWithSpellCastEffects.statusEntries,
              spellForStatusEntries,
              concentrationStatusOptions
            )
          };
        });
      }

      rollHuntersRimeTemporaryHitPointsForSpellCast(selectedSpell);
      rollSpellAttackForSpellCast(selectedSpell);
      closeSelectedSpell();
      return;
    }

    if (castAsRitual) {
      onPersistCharacter((currentCharacter) => {
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = {
          ...preparedCharacter,
          statusEntries: applySpellConcentrationToStatusEntries(
            preparedCharacter.statusEntries,
            spellForStatusEntries,
            concentrationStatusOptions
          )
        };
        const nextCharacterWithBeguilingMagic = useBeguilingMagic
          ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacter)
          : nextCharacter;
        const nextCharacterWithMindMagic = useMindMagic
          ? expendChannelDivinityUseForCharacter(nextCharacterWithBeguilingMagic)
          : nextCharacterWithBeguilingMagic;
        const nextCharacterWithSpellOptions = useBlessingOfMoonlight
          ? consumeBlessingOfMoonlightUseForCharacter(nextCharacterWithMindMagic)
          : nextCharacterWithMindMagic;
        const nextCharacterWithElementalSmite = useElementalSmite
          ? applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
              expendChannelDivinityUseForCharacter(nextCharacterWithSpellOptions),
              elementalSmiteOption
            )
          : nextCharacterWithSpellOptions;

        const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
          nextCharacterWithElementalSmite,
          selectedSpell,
          { includeBardBattleMagic: false, useRadiantSoul }
        );
        const nextCharacterWithFleetStep = grantMonkFleetStepFollowUpForSpellCastIfEligible(
          nextCharacterWithSpellCastEffects,
          roundTrackerResource
        );

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(
              nextCharacterWithFleetStep,
              roundTrackerResource
            )
          : nextCharacterWithFleetStep;
      });

      rollHuntersRimeTemporaryHitPointsForSpellCast(selectedSpell);
      rollSpellAttackForSpellCast(selectedSpell);
      closeSelectedSpell();
      return;
    }

    const minimumSlotLevel = Math.max(1, spellLevel);
    const slotLevel =
      useMindMagic ||
      useWarGodsBlessing ||
      useStarMap ||
      useMagicInitiate ||
      useFeyMagic ||
      useStepsOfTheFey ||
      useBewitchingMagic ||
      useMistyWanderer ||
      useFeyReinforcements ||
      usePhantasmalCreatures
        ? minimumSlotLevel
        : clampNumber(selectedSpellSlotLevel, minimumSlotLevel, 9, minimumSlotLevel);
    const castsFreeViaSpellMastery =
      selectedSpellIsWizardSpellMastery && slotLevel === minimumSlotLevel;
    const castsFreeViaSignatureSpells =
      selectedSpellIsWizardSignatureSpell &&
      slotLevel === wizardSignatureSpellLevel &&
      hasWizardSignatureSpellFreeCastAvailableForCharacter(character, selectedSpell.id);
    const castsFreeViaNaturalRecovery =
      useNaturalRecovery &&
      selectedSpellSupportsNaturalRecovery &&
      druidNaturalRecoveryUsesRemaining > 0 &&
      slotLevel === spellLevel;
    const castsFreeViaStarMap = useStarMap;
    const castsFreeViaMagicInitiate = useMagicInitiate;
    const castsFreeViaFeyMagic = useFeyMagic;
    const castsFreeViaMindMagic = useMindMagic;
    const castsFreeViaWarGodsBlessing = useWarGodsBlessing;
    const castsFreeViaPsionicSorcery = usePsionicSorcery && sorceryPointsRemaining >= slotLevel;
    const castsFreeViaStepsOfTheFey = useStepsOfTheFey;
    const castsFreeViaBewitchingMagic = useBewitchingMagic;
    const castsFreeViaMistyWanderer = useMistyWanderer;
    const castsFreeViaFeyReinforcements = useFeyReinforcements;
    const castsFreeViaPhantasmalCreatures = usePhantasmalCreatures;
    const castsFreeViaTelekineticMaster = useTelekineticMaster;
    const castsWithoutSpellSlot =
      castsFreeViaSpellMastery ||
      castsFreeViaSignatureSpells ||
      castsFreeViaNaturalRecovery ||
      castsFreeViaStarMap ||
      castsFreeViaMagicInitiate ||
      castsFreeViaFeyMagic ||
      castsFreeViaMindMagic ||
      castsFreeViaWarGodsBlessing ||
      castsFreeViaPsionicSorcery ||
      castsFreeViaStepsOfTheFey ||
      castsFreeViaBewitchingMagic ||
      castsFreeViaMistyWanderer ||
      castsFreeViaFeyReinforcements ||
      castsFreeViaPhantasmalCreatures ||
      castsFreeViaTelekineticMaster;
    const useOverchannel =
      wantsOverchannel &&
      !castsWithoutSpellSlot &&
      canUseWizardEvokerOverchannelForSpellSlot(character, selectedSpellDisplay, slotLevel);

    if (usePsionicSorcery && sorceryPointsRemaining < slotLevel) {
      return;
    }

    if (!castsWithoutSpellSlot && (spellSlotsRemaining[slotLevel - 1] ?? 0) <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const currentSpellSlotTotals = getSpellSlotTotalsForCharacter(
        preparedCharacter.className,
        preparedCharacter.level,
        preparedCharacter.subclassId
      );
      const currentSpellSlotsExpended = normalizeSpellSlotsExpended(
        preparedCharacter.spellSlotsExpended,
        currentSpellSlotTotals
      );
      const preparedCharacterSorceryPointsRemaining = getSorceryPointsRemaining(preparedCharacter);
      const nextSpellSlotsExpended = [...currentSpellSlotsExpended];
      const currentFrozenHauntOptionState =
        getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter(
          preparedCharacter,
          selectedSpell,
          currentSpellSlotTotals,
          nextSpellSlotsExpended
        );
      const currentPhantasmalCreaturesOptionState =
        getWizardIllusionistPhantasmalCreaturesSpellOptionStateForCharacter(
          preparedCharacter,
          selectedSpell
        );
      const currentDruidStarMapGuidingBoltUsesRemaining =
        getDruidStarMapGuidingBoltUsesRemainingForCharacter(preparedCharacter);

      if (!castsWithoutSpellSlot) {
        if (
          (currentSpellSlotTotals[slotLevel - 1] ?? 0) -
            (nextSpellSlotsExpended[slotLevel - 1] ?? 0) <=
          0
        ) {
          return currentCharacter;
        }

        nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;
      }

      if (castsFreeViaPsionicSorcery && preparedCharacterSorceryPointsRemaining < slotLevel) {
        return currentCharacter;
      }

      if (castsFreeViaStarMap && currentDruidStarMapGuidingBoltUsesRemaining <= 0) {
        return currentCharacter;
      }

      const usesFrozenHauntCharge =
        useFrozenHaunt && (currentFrozenHauntOptionState?.usesRemaining ?? 0) > 0;
      const shouldSpendFrozenHauntFallbackSlot = useFrozenHaunt && !usesFrozenHauntCharge;

      if (shouldSpendFrozenHauntFallbackSlot) {
        const availableFrozenHauntFallbackSlotLevels =
          getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter(
            preparedCharacter,
            selectedSpell,
            currentSpellSlotTotals,
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
      }

      if (castsFreeViaPhantasmalCreatures) {
        if ((currentPhantasmalCreaturesOptionState?.usesRemaining ?? 0) <= 0) {
          return currentCharacter;
        }
      }

      const nextCharacter = castsFreeViaSignatureSpells
        ? consumeWizardSignatureSpellFreeCastForCharacter(preparedCharacter, selectedSpell.id)
        : preparedCharacter;
      const nextCharacterWithPsionicSorcery = castsFreeViaPsionicSorcery
        ? spendSorceryPoints(nextCharacter, slotLevel)
        : nextCharacter;
      const nextCharacterWithMagicInitiate = castsFreeViaMagicInitiate
        ? consumeMagicInitiateFreeCastForCharacter(nextCharacterWithPsionicSorcery, selectedSpell.id)
        : nextCharacterWithPsionicSorcery;

      if (
        castsFreeViaMagicInitiate &&
        nextCharacterWithMagicInitiate === nextCharacterWithPsionicSorcery
      ) {
        return currentCharacter;
      }

      const nextCharacterWithFeyMagic = castsFreeViaFeyMagic
        ? consumeFeyTouchedFreeCastForCharacter(nextCharacterWithMagicInitiate, selectedSpell.id)
        : nextCharacterWithMagicInitiate;

      if (castsFreeViaFeyMagic && nextCharacterWithFeyMagic === nextCharacterWithMagicInitiate) {
        return currentCharacter;
      }

      const nextCharacterWithSpellcast = {
        ...nextCharacterWithFeyMagic,
        spellSlotsExpended:
          castsWithoutSpellSlot && !shouldSpendFrozenHauntFallbackSlot
            ? nextCharacterWithFeyMagic.spellSlotsExpended
            : nextSpellSlotsExpended,
        statusEntries: useFrozenHaunt
          ? applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter(
              applySpellConcentrationToStatusEntries(
                nextCharacterWithMagicInitiate.statusEntries,
                spellForStatusEntries,
                concentrationStatusOptions
              )
            )
          : applySpellConcentrationToStatusEntries(
              nextCharacterWithMagicInitiate.statusEntries,
              spellForStatusEntries,
              concentrationStatusOptions
            )
      };
      const nextCharacterWithTelekineticMaster = castsFreeViaTelekineticMaster
        ? activateFighterPsiWarriorTelekineticMasterSpellCastForCharacter(
            nextCharacterWithSpellcast
          )
        : nextCharacterWithSpellcast;
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithTelekineticMaster)
        : nextCharacterWithTelekineticMaster;
      const nextCharacterWithMindMagic = castsFreeViaMindMagic
        ? expendChannelDivinityUseForCharacter(nextCharacterWithBeguilingMagic)
        : nextCharacterWithBeguilingMagic;
      const nextCharacterWithWarGodsBlessing = castsFreeViaWarGodsBlessing
        ? expendChannelDivinityUseForCharacter(nextCharacterWithMindMagic)
        : nextCharacterWithMindMagic;
      const nextCharacterWithSpellOptions = useBlessingOfMoonlight
        ? consumeBlessingOfMoonlightUseForCharacter(nextCharacterWithWarGodsBlessing)
        : nextCharacterWithWarGodsBlessing;
      const nextCharacterWithElementalSmite = useElementalSmite
        ? applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
            expendChannelDivinityUseForCharacter(nextCharacterWithSpellOptions),
            elementalSmiteOption
          )
        : nextCharacterWithSpellOptions;
      const nextCharacterWithNaturalRecovery = castsFreeViaNaturalRecovery
        ? consumeDruidNaturalRecoveryUseForCharacter(nextCharacterWithElementalSmite)
        : nextCharacterWithElementalSmite;
      const nextCharacterWithStarMap = castsFreeViaStarMap
        ? consumeDruidStarMapGuidingBoltUseForCharacter(nextCharacterWithNaturalRecovery)
        : nextCharacterWithNaturalRecovery;
      const nextCharacterWithStepsOfTheFey = castsFreeViaStepsOfTheFey
        ? consumeWarlockStepsOfTheFeyUseForCharacter(nextCharacterWithStarMap)
        : nextCharacterWithStarMap;
      const nextCharacterWithMistyWanderer = castsFreeViaMistyWanderer
        ? consumeRangerMistyWandererUseForCharacter(nextCharacterWithStepsOfTheFey)
        : nextCharacterWithStepsOfTheFey;
      const nextCharacterWithFeyReinforcements = castsFreeViaFeyReinforcements
        ? consumeRangerFeyReinforcementsUseForCharacter(nextCharacterWithMistyWanderer)
        : nextCharacterWithMistyWanderer;
      const nextCharacterWithPhantasmalCreatures = castsFreeViaPhantasmalCreatures
        ? consumeWizardIllusionistPhantasmalCreaturesUseForCharacter(
            nextCharacterWithFeyReinforcements
          )
        : nextCharacterWithFeyReinforcements;
      const nextCharacterWithFrozenHaunt = usesFrozenHauntCharge
        ? consumeRangerWinterWalkerFrozenHauntUseForCharacter(nextCharacterWithPhantasmalCreatures)
        : nextCharacterWithPhantasmalCreatures;
      const spellConsumedSpellSlot = !castsWithoutSpellSlot || shouldSpendFrozenHauntFallbackSlot;
      const nextCharacterWithTamedSurge =
        useTamedSurge && spellConsumedSpellSlot
          ? consumeSorcererSubclassTamedSurgeUseForCharacter(nextCharacterWithFrozenHaunt)
          : nextCharacterWithFrozenHaunt;
      const nextCharacterWithOverchannel = useOverchannel
        ? applyWizardEvokerOverchannelUse(nextCharacterWithTamedSurge)
        : nextCharacterWithTamedSurge;
      const spellCastFeatureEffectSlotLevel = spellConsumedSpellSlot
        ? shouldSpendFrozenHauntFallbackSlot
          ? frozenHauntFallbackSlotLevel
          : slotLevel
        : null;
      const nextCharacterWithSorcererSubclassRecharge = spellConsumedSpellSlot
        ? restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter(nextCharacterWithOverchannel)
        : nextCharacterWithOverchannel;
      const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
        nextCharacterWithSorcererSubclassRecharge,
        selectedSpell,
        {
          spellSlotLevel: spellCastFeatureEffectSlotLevel,
          useRadiantSoul
        }
      );
      const nextCharacterWithFleetStep = grantMonkFleetStepFollowUpForSpellCastIfEligible(
        nextCharacterWithSpellCastEffects,
        roundTrackerResource
      );

      if (castsFreeViaTelekineticMaster && roundTrackerResource) {
        return consumeRoundTrackerResourceForCharacter(
          nextCharacterWithFleetStep,
          roundTrackerResource
        );
      }

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
        ? consumeRoundTrackerResourceForCharacter(nextCharacterWithFleetStep, roundTrackerResource)
        : nextCharacterWithFleetStep;
    });

    rollHuntersRimeTemporaryHitPointsForSpellCast(selectedSpell);
    rollSpellAttackForSpellCast(selectedSpell);
    closeSelectedSpell();
}
