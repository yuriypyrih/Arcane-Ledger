/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
// @ts-nocheck

export function renderSpellCastingForm(context: Record<string, any>) {
  const {
    ActionButton, ActionShape, CellContainer, CharacterSpellDrawer, DURATION, DivinityListRow, EldritchInvocationDrawer, EldritchInvocationListRow, Pencil,
    SpellDescriptionContent, SpellListRow, SpellManagementModal, SpellSlotActionSheet, TriangleAlert, X, activeSpellSlotSheetExpended, activeSpellSlotSheetLevel, activeSpellSlotSheetTotal,
    activeWizardSpellFilter, alwaysPreparedSpellIdSet, alwaysPreparedSpellIds, alwaysSpellbookSpellIdSet, alwaysSpellbookSpellIds, bardicInspirationUsesRemaining, bardicInspirationUsesTotal, beguilingMagicUsesRemaining, beguilingMagicUsesTotal,
    blessingOfMoonlightUsesRemaining, blessingOfMoonlightUsesTotal, cantripLimit, cantripOptions, castSelectedSpell, channelDivinityUsesRemaining, channelDivinityUsesTotal, channelSelectedDivinity, character,
    className, closeSelectedDivinity, closeSelectedInvocation, closeSelectedSpell, closeSpellSlotActionSheet, clsx, createChargesAndUsageHeaderTags, createChargesCardUsage, createChargesHeaderTag,
    createChargesOrResourceCardUsage, createFeatureActionCardCost, createNamedResourceCardUsage, createNamedUsageHeaderTags, diceRollerPopup, druidNaturalRecoveryUsesRemaining, druidStarMapGuidingBoltUsesRemaining, druidStarMapGuidingBoltUsesTotal, eldritchInvocationLimit,
    fighterPsiWarriorEnergyDiceRemaining, fighterPsiWarriorEnergyDiceTotal, fighterPsiWarriorTelekineticMasterUsesRemaining, fighterPsiWarriorTelekineticMasterUsesTotal, formatCodexLabel, formatDivinitySubtitle, formatFeatureActionOptionRangeLabel, formatSpellCastingTime, formatSpellGroupTitle,
    featAlwaysPreparedCantripIdSet, frozenHauntFallbackSpellSlotMinimumLevel, gameplayActionStyles, getActionShapeForEconomyType, getDivinityDrawerValueLabel, getDivinityRowActionShapeState, getSpellRowActionShapes, hasEldritchInvocationManagement, hasSpellManagementOptions, hasSpellSelectionInputRequired,
    highestSpellSlotLevel, isPreparedSpellPreview, isSelectedSpellDiceRollerSettingsOpen, isSpellManagementModalOpen, knownSpellEntriesById, learnedInvocationOptions, onPersistCharacter, openDivinityDetails, openInvocationDetails,
    openSpellDetails, openSpellManagementMenu, orderDescriptionAdditionSections, paladinOathOfTheNobleGeniesElementalSmiteOptions, preparedSpellGroups, preparedSpellLimit, rangerFeyReinforcementsUsesRemaining, rangerFeyReinforcementsUsesTotal, rangerMistyWandererUsesRemaining,
    rangerMistyWandererUsesTotal, resetAllSpellSlotsAtLevel, selectedCantripIds, selectedDivinityActionShape, selectedDivinityActionShapeState, selectedDivinityActionWarning, selectedDivinityDisplay, selectedDivinityOptionKey, selectedDivinityRow,
    selectedElementalSmiteOptionOnSelectedSpell, selectedFrozenHauntFallbackSlotLevel, selectedInvocation, selectedInvocationCount, selectedInvocationIds, selectedManualSpellbookSpellIds, selectedPreparedSpellIds, selectedSpell, selectedSpellActionPaths,
    selectedSpellAlwaysPrepared, selectedSpellAlwaysSpellbook, selectedSpellAttackRollFormula, selectedSpellBlockedReason, selectedSpellCanCastAsRitualFromSpellbook, selectedSpellCanOnlyBeCastAsRitual, selectedSpellCastWarning, selectedSpellDamageDetailOverride, selectedSpellDisplay, selectedSpellMagicInitiateAbility, selectedSpellMagicInitiateDisabled, selectedSpellMagicInitiateFreeCastState,
    selectedSpellElementalSmiteDisabled, selectedSpellFacts, selectedSpellFeyReinforcementsDisabled, selectedSpellFreeCastSlotLevel, selectedSpellFrozenHauntFallbackSlotOptions, selectedSpellFrozenHauntFallbackSlotSummary, selectedSpellFrozenHauntOptionState, selectedSpellHuntersRimeTemporaryHitPointsFormula, selectedSpellIsSpellbookOnly,
    selectedSpellIsWizardSpellMastery, selectedSpellMindMagicDisabled, selectedSpellMistyWandererDisabled, selectedSpellOverchannelDisabled, selectedSpellOverchannelNecroticDamage, selectedSpellPhantasmalCreaturesDisabled, selectedSpellPhantasmalCreaturesOptionState, selectedSpellPsionicSorceryCurrentCost, selectedSpellPsionicSorceryDisabled,
    selectedSpellRadiantSoulDisabled, selectedSpellSharedCastWarning, selectedSpellSlotLevel, selectedSpellStarMapDisabled, selectedSpellStepsOfTheFeyDisabled, selectedSpellSupportsBeguilingMagic, selectedSpellSupportsBewitchingMagic, selectedSpellSupportsBlessingOfMoonlight, selectedSpellSupportsElementalSmite,
    selectedSpellSupportsFeyReinforcements, selectedSpellSupportsMagicInitiate, selectedSpellSupportsMindMagic, selectedSpellSupportsMistyWanderer, selectedSpellSupportsNaturalRecovery, selectedSpellSupportsOverchannel, selectedSpellSupportsPhantasmalCreatures, selectedSpellSupportsPsionicSorcery, selectedSpellSupportsRadiantSoul, selectedSpellSupportsStarMap,
    selectedSpellSupportsStepsOfTheFey, selectedSpellSupportsTamedSurge, selectedSpellSupportsTelekineticMaster, selectedSpellSupportsWarGodsBlessing, selectedSpellTamedSurgeDisabled, selectedSpellTelekineticMasterDisabled, selectedSpellUnderMantleOfMajesty, selectedSpellViewMode, selectedSpellWarGodsBlessingDisabled,
    setActiveSpellSlotSheetLevel, setActiveWizardSpellFilter, setIsSelectedSpellDiceRollerSettingsOpen, setIsSpellManagementModalOpen, setSelectedElementalSmiteOptionOnSelectedSpell, setSelectedFrozenHauntFallbackSlotLevel, setSelectedSpellSlotLevel, setUseBeguilingMagicOnSelectedSpell, setUseBewitchingMagicOnSelectedSpell,
    setUseBlessingOfMoonlightOnSelectedSpell, setUseElementalSmiteOnSelectedSpell, setUseFeyReinforcementsNoConcentrationOnSelectedSpell, setUseFeyReinforcementsOnSelectedSpell, setUseFrozenHauntOnSelectedSpell, setUseMagicInitiateOnSelectedSpell, setUseMindMagicOnSelectedSpell, setUseMistyWandererOnSelectedSpell, setUseNaturalRecoveryOnSelectedSpell, setUseOverchannelOnSelectedSpell,
    setUsePhantasmalCreaturesOnSelectedSpell, setUsePsionicSorceryOnSelectedSpell, setUseRadiantSoulOnSelectedSpell, setUseStarMapOnSelectedSpell, setUseStepsOfTheFeyOnSelectedSpell, setUseTamedSurgeOnSelectedSpell, setUseTelekineticMasterOnSelectedSpell, setUseWarGodsBlessingOnSelectedSpell, shared, SheetSurface,
    sheetStyles, sorceryPointsRemaining, sorceryPointsTotal, spellOutcomeSummariesById, spellPreparationOptions, spellSlotLevels, spellSlotTotals, spellSlotsRemaining, spellbookSpellEntriesById,
    spellcastingChannelDivinityRows, spellcastingState, styles, tamedSurgeUsesRemaining, tamedSurgeUsesTotal, updateSpellSlotsExpended, useBeguilingMagicOnSelectedSpell, useBewitchingMagicOnSelectedSpell, useBlessingOfMoonlightOnSelectedSpell,
    useElementalSmiteOnSelectedSpell, useFeyReinforcementsNoConcentrationOnSelectedSpell, useFeyReinforcementsOnSelectedSpell, useFrozenHauntOnSelectedSpell, useMagicInitiateOnSelectedSpell, useMindMagicOnSelectedSpell, useMistyWandererOnSelectedSpell, useNaturalRecoveryOnSelectedSpell, useOverchannelOnSelectedSpell, usePhantasmalCreaturesOnSelectedSpell,
    usePsionicSorceryOnSelectedSpell, useRadiantSoulOnSelectedSpell, useStarMapOnSelectedSpell, useStepsOfTheFeyOnSelectedSpell, useTamedSurgeOnSelectedSpell, useTelekineticMasterOnSelectedSpell, useWarGodsBlessingOnSelectedSpell, usesPreparedSpells, usesSpellbook,
    warlockStepsOfTheFeyUsesRemaining, warlockStepsOfTheFeyUsesTotal, wizardSignatureSpellIdSet, wizardSpellMasterySpellIdSet, wizardSpellbookOnlyIdSet, wizardSpellbookOnlyRitualIdSet
  } = context;

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Spellcasting</p>
          <h3 className={shared.subtitle}>
            {hasEldritchInvocationManagement
              ? "Invocations, prepared spells, and spell slots"
              : usesSpellbook
                ? "Spellbook, prepared spells, and spell slots"
                : "Prepared spells and spell slots"}
          </h3>
        </div>
        <div className={shared.headerActions}>
          {hasSpellSelectionInputRequired ? (
            <span className={styles.spellInputRequired}>
              <TriangleAlert size={16} aria-hidden="true" />
              INPUT REQUIRED
            </span>
          ) : null}
          {hasSpellManagementOptions ? (
            <button
              type="button"
              className={shared.editButton}
              onClick={openSpellManagementMenu}
              disabled={spellcastingState.blocked}
            >
              <Pencil size={16} />
              Edit
            </button>
          ) : null}
        </div>
      </div>

      {spellcastingState.reason ? (
        <p className={styles.spellcastingBlockedNotice}>{spellcastingState.reason}</p>
      ) : null}

      <div className={styles.spellSlotHeader}>
        <p className={styles.spellGroupTitle}>Spell slots</p>
      </div>
      <div className={styles.spellSlotGrid}>
        {spellSlotLevels.map((slotLevel) => {
          const totalSlots = spellSlotTotals[slotLevel - 1] ?? 0;
          const remainingSlots = spellSlotsRemaining[slotLevel - 1] ?? 0;

          return (
            <SheetSurface
              as="button"
              key={slotLevel}
              type="button"
              borderSize="sm"
              hoverBorder
              className={clsx(
                styles.spellSlotCard,
                styles.spellSlotCardButton,
                totalSlots === 0 && styles.spellSlotCardEmpty
              )}
              onClick={() => setActiveSpellSlotSheetLevel(slotLevel)}
              disabled={spellcastingState.blocked}
              aria-label={
                totalSlots > 0
                  ? `Manage level ${slotLevel} spell slots (${remainingSlots} of ${totalSlots} remaining)`
                  : `Manage level ${slotLevel} spell slots (no slots available)`
              }
            >
              <span>L{slotLevel}</span>
              {totalSlots === 0 ? (
                <small className={styles.spellSlotDash}>-</small>
              ) : (
                <div className={styles.spellSlotSquares}>
                  {Array.from({ length: totalSlots }, (_, index) => (
                    <span
                      key={`${slotLevel}-${index}`}
                      className={clsx(
                        styles.spellSlotSquare,
                        index < remainingSlots && styles.spellSlotSquareFilled
                      )}
                    />
                  ))}
                </div>
              )}
            </SheetSurface>
          );
        })}
      </div>

      {usesSpellbook ? (
        <div className={styles.wizardFilterBar} role="tablist" aria-label="Wizard spell view">
          {(
            [
              ["all", "All Spellbook"],
              ["prepared", "Prepared"]
            ] as const
          ).map(([filterKey, label]) => (
            <button
              key={filterKey}
              type="button"
              role="tab"
              aria-selected={activeWizardSpellFilter === filterKey}
              className={clsx(
                styles.wizardFilterButton,
                activeWizardSpellFilter === filterKey && styles.wizardFilterButtonActive
              )}
              onClick={() => setActiveWizardSpellFilter(filterKey)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.spellListStack}>
        {learnedInvocationOptions.length > 0 ? (
          <div className={styles.spellGroup}>
            <p className={styles.spellGroupTitle}>
              {`Eldritch Invocations (${selectedInvocationCount}/${eldritchInvocationLimit})`}
            </p>
            <ul className={styles.spellList}>
              {learnedInvocationOptions.map((option) => (
                <li key={option.selectionId}>
                  <EldritchInvocationListRow
                    name={option.displayName}
                    subtitle={option.displaySubtitle}
                    metaText="Eldritch Invocation"
                    onClick={() => openInvocationDetails(option)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {spellcastingChannelDivinityRows.length > 0 ? (
          <div className={styles.spellGroup}>
            <p className={styles.spellGroupTitle}>
              {`Channel Divinity (uses ${channelDivinityUsesRemaining}/${channelDivinityUsesTotal})`}
            </p>
            <ul className={styles.spellList}>
              {spellcastingChannelDivinityRows.map((row) => (
                <li key={row.option.key}>
                  {(() => {
                    const actionShapeState = getDivinityRowActionShapeState(row);

                    return (
                      <DivinityListRow
                        divinity={{
                          ...row.entry,
                          name: row.option.name
                        }}
                        onClick={() => openDivinityDetails(row.option.key)}
                        valueSummary={formatFeatureActionOptionRangeLabel(row.option)}
                        actionShapeSelected={actionShapeState.isSelected}
                        actionShapeMultiCount={actionShapeState.multiCount}
                      />
                    );
                  })()}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {preparedSpellGroups.length === 0 &&
        spellcastingChannelDivinityRows.length === 0 &&
        learnedInvocationOptions.length === 0 ? (
          <p className={shared.emptyText}>
            No spells, cantrips, or eldritch invocations have been selected yet.
          </p>
        ) : (
          preparedSpellGroups.map((group) => (
            <div key={group.level} className={styles.spellGroup}>
              <p className={styles.spellGroupTitle}>{formatSpellGroupTitle(group.level)}</p>
              <ul className={styles.spellList}>
                {group.spells.map((spell) => (
                  <li key={spell.id}>
                    {(() => {
                      const actionShapes = getSpellRowActionShapes(spell);

                      return (
                        <SpellListRow
                          spell={spell}
                          onClick={() => openSpellDetails(spell)}
                          valueSummary={
                            wizardSpellbookOnlyIdSet.has(spell.id)
                              ? ""
                              : (spellOutcomeSummariesById.get(spell.id) ?? "")
                          }
                          detailNote={
                            wizardSpellbookOnlyRitualIdSet.has(spell.id)
                              ? "Ritual from spellbook"
                              : wizardSpellbookOnlyIdSet.has(spell.id)
                                ? "In Spellbook but not prepared"
                                : undefined
                          }
                          detailNoteTone={
                            wizardSpellbookOnlyIdSet.has(spell.id) ? "accent" : "default"
                          }
                          alwaysPrepared={
                            alwaysPreparedSpellIdSet.has(spell.id) ||
                            featAlwaysPreparedCantripIdSet.has(spell.id)
                          }
                          alwaysSpellbook={alwaysSpellbookSpellIdSet.has(spell.id)}
                          highlightTone={
                            wizardSpellMasterySpellIdSet.has(spell.id) ||
                            wizardSignatureSpellIdSet.has(spell.id)
                              ? "spell-mastery"
                              : "default"
                          }
                          compactConcentrationDuration
                          actionShapes={actionShapes}
                        />
                      );
                    })()}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {activeSpellSlotSheetLevel !== null ? (
        <SpellSlotActionSheet
          slotLevel={activeSpellSlotSheetLevel}
          totalSlots={activeSpellSlotSheetTotal}
          expendedSlots={activeSpellSlotSheetExpended}
          onClose={closeSpellSlotActionSheet}
          onResetSlot={() => updateSpellSlotsExpended(activeSpellSlotSheetLevel, -1)}
          onUseSlot={() => updateSpellSlotsExpended(activeSpellSlotSheetLevel, 1)}
          onResetAll={() => resetAllSpellSlotsAtLevel(activeSpellSlotSheetLevel)}
        />
      ) : null}

      {isSpellManagementModalOpen ? (
        <SpellManagementModal
          alwaysPreparedSpellIds={alwaysPreparedSpellIds}
          alwaysSpellbookSpellIds={alwaysSpellbookSpellIds}
          cantripLimit={cantripLimit}
          cantripOptions={cantripOptions}
          character={character}
          eldritchInvocationLimit={eldritchInvocationLimit}
          getSpellRowActionShapes={getSpellRowActionShapes}
          highestSpellSlotLevel={highestSpellSlotLevel}
          knownSpellEntriesById={knownSpellEntriesById}
          onClose={() => setIsSpellManagementModalOpen(false)}
          onOpenInvocationDetails={openInvocationDetails}
          onOpenSpellDetails={openSpellDetails}
          onPersistCharacter={onPersistCharacter}
          preparedSpellLimit={preparedSpellLimit}
          selectedCantripIds={selectedCantripIds}
          selectedInvocationIds={selectedInvocationIds}
          selectedManualSpellbookSpellIds={selectedManualSpellbookSpellIds}
          selectedPreparedSpellIds={selectedPreparedSpellIds}
          spellbookSpellEntriesById={spellbookSpellEntriesById}
          spellOutcomeSummariesById={spellOutcomeSummariesById}
          spellPreparationOptions={spellPreparationOptions}
          suspendEscapeClose={Boolean(
            activeSpellSlotSheetLevel !== null ||
            selectedSpell ||
            selectedDivinityOptionKey ||
            selectedInvocation ||
            isSelectedSpellDiceRollerSettingsOpen
          )}
          usesPreparedSpells={usesPreparedSpells}
          usesSpellbook={usesSpellbook}
        />
      ) : null}

      {selectedSpell ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedSpellDisplay ?? selectedSpell}
          damageDetailOverride={selectedSpellDamageDetailOverride}
          spellcastingAbilityOverride={selectedSpellMagicInitiateAbility}
          alwaysPrepared={selectedSpellAlwaysPrepared}
          alwaysSpellbook={selectedSpellAlwaysSpellbook}
          mode={selectedSpellViewMode}
          spellSlotTotals={spellSlotTotals}
          spellSlotsRemaining={spellSlotsRemaining}
          selectedSpellSlotLevel={selectedSpellSlotLevel}
          onSelectedSpellSlotLevelChange={setSelectedSpellSlotLevel}
          onClose={closeSelectedSpell}
          onAction={(options) =>
            castSelectedSpell({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnSelectedSpell,
              useMindMagic: useMindMagicOnSelectedSpell,
              useWarGodsBlessing: useWarGodsBlessingOnSelectedSpell,
              useStarMap: useStarMapOnSelectedSpell,
              useMagicInitiate: useMagicInitiateOnSelectedSpell,
              useBlessingOfMoonlight: useBlessingOfMoonlightOnSelectedSpell,
              useElementalSmite: useElementalSmiteOnSelectedSpell,
              elementalSmiteOption: selectedElementalSmiteOptionOnSelectedSpell,
              useFeyReinforcements: useFeyReinforcementsOnSelectedSpell,
              useFeyReinforcementsNoConcentration:
                useFeyReinforcementsNoConcentrationOnSelectedSpell,
              useFrozenHaunt: useFrozenHauntOnSelectedSpell,
              frozenHauntFallbackSlotLevel: selectedFrozenHauntFallbackSlotLevel,
              usePhantasmalCreatures: usePhantasmalCreaturesOnSelectedSpell,
              useMistyWanderer: useMistyWandererOnSelectedSpell,
              useStepsOfTheFey: useStepsOfTheFeyOnSelectedSpell,
              useBewitchingMagic: useBewitchingMagicOnSelectedSpell,
              useNaturalRecovery: useNaturalRecoveryOnSelectedSpell,
              usePsionicSorcery: usePsionicSorceryOnSelectedSpell,
              useTamedSurge: useTamedSurgeOnSelectedSpell,
              useTelekineticMaster: useTelekineticMasterOnSelectedSpell,
              useRadiantSoul: useRadiantSoulOnSelectedSpell,
              useOverchannel: useOverchannelOnSelectedSpell
            })
          }
          actionConsumesSpellSlot={
            !selectedSpellIsSpellbookOnly &&
            !selectedSpellCanOnlyBeCastAsRitual &&
            !(selectedSpellSupportsMindMagic && useMindMagicOnSelectedSpell) &&
            !(selectedSpellSupportsWarGodsBlessing && useWarGodsBlessingOnSelectedSpell) &&
            !(selectedSpellSupportsStarMap && useStarMapOnSelectedSpell) &&
            !(selectedSpellSupportsMagicInitiate && useMagicInitiateOnSelectedSpell) &&
            !(selectedSpellSupportsPsionicSorcery && usePsionicSorceryOnSelectedSpell) &&
            !(selectedSpellSupportsStepsOfTheFey && useStepsOfTheFeyOnSelectedSpell) &&
            !(selectedSpellSupportsBewitchingMagic && useBewitchingMagicOnSelectedSpell) &&
            !(selectedSpellSupportsMistyWanderer && useMistyWandererOnSelectedSpell) &&
            !(selectedSpellSupportsFeyReinforcements && useFeyReinforcementsOnSelectedSpell) &&
            !(selectedSpellSupportsPhantasmalCreatures && usePhantasmalCreaturesOnSelectedSpell) &&
            !(selectedSpellSupportsTelekineticMaster && useTelekineticMasterOnSelectedSpell)
          }
          freeCastSlotLevel={selectedSpellFreeCastSlotLevel}
          freeCastAvailabilityText={
            selectedSpellIsWizardSpellMastery
              ? "Due to Spell Mastery, this spell can be cast without expending a spell slot if cast at its base level."
              : null
          }
          allowRitualCasting={
            selectedSpellCanCastAsRitualFromSpellbook || selectedSpellCanOnlyBeCastAsRitual
          }
          ritualCastingRequired={selectedSpellCanOnlyBeCastAsRitual}
          actionAvailabilityText={
            selectedSpellSupportsMindMagic && useMindMagicOnSelectedSpell
              ? "Mind Magic lets you cast this spell at its base level by using 1 Channel Divinity instead of a spell slot."
              : selectedSpellSupportsPsionicSorcery && usePsionicSorceryOnSelectedSpell
                ? `Psionic Sorcery lets you cast this spell at level ${selectedSpellPsionicSorceryCurrentCost} by spending ${selectedSpellPsionicSorceryCurrentCost} Sorcery Point${selectedSpellPsionicSorceryCurrentCost === 1 ? "" : "s"} instead of a spell slot.`
                : selectedSpellSupportsStarMap && useStarMapOnSelectedSpell
                  ? "Star Map lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                  : selectedSpellSupportsMagicInitiate && useMagicInitiateOnSelectedSpell
                    ? "Magic Initiate lets you cast this spell at level 1 without expending a spell slot. This use recharges on a Long Rest."
                    : selectedSpellSupportsStepsOfTheFey && useStepsOfTheFeyOnSelectedSpell
                      ? selectedSpellSupportsBewitchingMagic && useBewitchingMagicOnSelectedSpell
                        ? "Steps of the Fey and Bewitching Magic both let you cast this spell without expending a spell slot. Steps of the Fey still spends one use."
                        : "Steps of the Fey lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                      : selectedSpellSupportsBewitchingMagic && useBewitchingMagicOnSelectedSpell
                        ? "Bewitching Magic lets you cast this spell without expending a spell slot."
                        : selectedSpellSupportsMistyWanderer && useMistyWandererOnSelectedSpell
                          ? "Misty Wanderer lets you cast this spell without expending a spell slot."
                          : selectedSpellSupportsFeyReinforcements &&
                              useFeyReinforcementsOnSelectedSpell
                            ? "Fey Reinforcements lets you cast this spell without expending a spell slot."
                            : selectedSpellSupportsPhantasmalCreatures &&
                                usePhantasmalCreaturesOnSelectedSpell
                              ? "Phantasmal Creatures lets you cast this spell without expending a spell slot. This shared use recharges on a Long Rest, and the summoned creature has half Hit Points."
                              : selectedSpellSupportsTelekineticMaster &&
                                  useTelekineticMasterOnSelectedSpell
                                ? fighterPsiWarriorTelekineticMasterUsesRemaining > 0
                                  ? "Telekinetic Master lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                                  : "Telekinetic Master lets you cast this spell without expending a spell slot by using 1 Psi Energy Die."
                                : selectedSpellSupportsTamedSurge && useTamedSurgeOnSelectedSpell
                                  ? "Tamed Surge will be spent after this spell consumes a spell slot."
                                  : selectedSpellUnderMantleOfMajesty
                                    ? "Mantle of Majesty is active. Cast at level 1 without expending a spell slot, or upcast normally."
                                    : null
          }
          actionContextText={
            selectedSpellSupportsWarGodsBlessing &&
            useWarGodsBlessingOnSelectedSpell &&
            selectedSpell?.duration.includes(DURATION.CONCENTRATION)
              ? "Concentration is removed for this casting."
              : selectedSpellSupportsFeyReinforcements &&
                  useFeyReinforcementsNoConcentrationOnSelectedSpell
                ? "Concentration is removed for this casting, and the duration becomes 10 turns."
                : selectedSpellUnderMantleOfMajesty
                  ? "Under the effect of Mantle of Majesty."
                  : null
          }
          actionWarning={selectedSpellCastWarning}
          actionDisabled={selectedSpellSharedCastWarning !== null}
          blockedReason={selectedSpellBlockedReason}
          facts={selectedSpellFacts}
          factsSectionTitle={null}
          showActionDiceControls={
            selectedSpellHuntersRimeTemporaryHitPointsFormula !== null ||
            selectedSpellAttackRollFormula !== null
          }
          isDiceRollerSettingsOpen={isSelectedSpellDiceRollerSettingsOpen}
          onDiceRollerSettingsOpenChange={setIsSelectedSpellDiceRollerSettingsOpen}
          actionPaths={selectedSpellActionPaths
            .map((path) => {
              const actionShape = getActionShapeForEconomyType(path.economyType);

              return actionShape
                ? {
                    id: path.id,
                    actionShape,
                    actionShapeAvailable: path.shapeState.isAvailable,
                    actionShapeMultiCount: path.shapeState.multiCount,
                    disabledReason: path.shapeState.disabledReason,
                    roundTrackerResourceOverride: path.roundTrackerResource
                  }
                : null;
            })
            .filter((path): path is NonNullable<typeof path> => path !== null)}
          actionOptions={
            selectedSpellSupportsWarGodsBlessing ||
            selectedSpellSupportsMindMagic ||
            selectedSpellSupportsStarMap ||
            selectedSpellSupportsMagicInitiate ||
            selectedSpellSupportsPsionicSorcery ||
            selectedSpellSupportsBeguilingMagic ||
            selectedSpellSupportsBlessingOfMoonlight ||
            selectedSpellSupportsElementalSmite ||
            selectedSpellSupportsStepsOfTheFey ||
            selectedSpellSupportsBewitchingMagic ||
            selectedSpellSupportsMistyWanderer ||
            selectedSpellSupportsFeyReinforcements ||
            selectedSpellSupportsPhantasmalCreatures ||
            selectedSpellFrozenHauntOptionState !== null ||
            selectedSpellSupportsNaturalRecovery ||
            selectedSpellSupportsTamedSurge ||
            selectedSpellSupportsTelekineticMaster ||
            selectedSpellSupportsRadiantSoul ||
            selectedSpellSupportsOverchannel
              ? [
                  ...(selectedSpellSupportsOverchannel
                    ? [
                        {
                          id: "overchannel",
                          label: `Overchannel | take ${selectedSpellOverchannelNecroticDamage} Necrotic damage on Cast`,
                          checked: useOverchannelOnSelectedSpell,
                          onCheckedChange: setUseOverchannelOnSelectedSpell,
                          disabled: selectedSpellOverchannelDisabled
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsWarGodsBlessing
                    ? [
                        {
                          id: "war-gods-blessing",
                          label: "War God's Blessing",
                          checked: useWarGodsBlessingOnSelectedSpell,
                          onCheckedChange: setUseWarGodsBlessingOnSelectedSpell,
                          disabled: selectedSpellWarGodsBlessingDisabled,
                          headerTags: createNamedUsageHeaderTags(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            }),
                            channelDivinityUsesRemaining,
                            channelDivinityUsesTotal,
                            {
                              icon: "pyromancy"
                            }
                          ),
                          usage: createNamedResourceCardUsage(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsMindMagic
                    ? [
                        {
                          id: "mind-magic",
                          label: "Mind Magic",
                          checked: useMindMagicOnSelectedSpell,
                          onCheckedChange: setUseMindMagicOnSelectedSpell,
                          disabled: selectedSpellMindMagicDisabled,
                          headerTags: createNamedUsageHeaderTags(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            }),
                            channelDivinityUsesRemaining,
                            channelDivinityUsesTotal,
                            {
                              icon: "pyromancy"
                            }
                          ),
                          usage: createNamedResourceCardUsage(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsStarMap
                    ? [
                        {
                          id: "star-map",
                          label: "Star Map",
                          checked: useStarMapOnSelectedSpell,
                          onCheckedChange: setUseStarMapOnSelectedSpell,
                          disabled: selectedSpellStarMapDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              druidStarMapGuidingBoltUsesRemaining,
                              druidStarMapGuidingBoltUsesTotal
                            )
                          ],
                          usage: createChargesCardUsage(
                            druidStarMapGuidingBoltUsesRemaining,
                            druidStarMapGuidingBoltUsesTotal
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsMagicInitiate
                    ? [
                        {
                          id: "magic-initiate",
                          label: "Magic Initiate | Once per long rest",
                          checked: useMagicInitiateOnSelectedSpell,
                          onCheckedChange: setUseMagicInitiateOnSelectedSpell,
                          disabled: selectedSpellMagicInitiateDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              selectedSpellMagicInitiateFreeCastState?.usesRemaining ?? 0,
                              selectedSpellMagicInitiateFreeCastState?.usesTotal ?? 1
                            )
                          ],
                          usage: createChargesCardUsage(
                            selectedSpellMagicInitiateFreeCastState?.usesRemaining ?? 0,
                            selectedSpellMagicInitiateFreeCastState?.usesTotal ?? 1
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsPsionicSorcery
                    ? [
                        {
                          id: "psionic-sorcery",
                          label: "Psionic Sorcery",
                          checked: usePsionicSorceryOnSelectedSpell,
                          onCheckedChange: setUsePsionicSorceryOnSelectedSpell,
                          disabled: selectedSpellPsionicSorceryDisabled,
                          headerTags: createNamedUsageHeaderTags(
                            createFeatureActionCardCost({
                              amountText: String(selectedSpellPsionicSorceryCurrentCost),
                              icon: "sparkles"
                            }),
                            sorceryPointsRemaining,
                            sorceryPointsTotal,
                            {
                              icon: "sparkles"
                            }
                          ),
                          usage: createNamedResourceCardUsage(
                            createFeatureActionCardCost({
                              amountText: String(selectedSpellPsionicSorceryCurrentCost),
                              icon: "sparkles"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsTamedSurge
                    ? [
                        {
                          id: "tamed-surge",
                          label: "Tamed Surge",
                          checked: useTamedSurgeOnSelectedSpell,
                          onCheckedChange: setUseTamedSurgeOnSelectedSpell,
                          disabled: selectedSpellTamedSurgeDisabled,
                          headerTags: [
                            createChargesHeaderTag(tamedSurgeUsesRemaining, tamedSurgeUsesTotal)
                          ],
                          usage: createChargesCardUsage(
                            tamedSurgeUsesRemaining,
                            tamedSurgeUsesTotal
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsBeguilingMagic
                    ? [
                        {
                          id: "beguiling-magic",
                          label: "Beguiling Magic",
                          checked: useBeguilingMagicOnSelectedSpell,
                          onCheckedChange: setUseBeguilingMagicOnSelectedSpell,
                          disabled:
                            beguilingMagicUsesRemaining <= 0 && bardicInspirationUsesRemaining <= 0,
                          headerTags: createChargesAndUsageHeaderTags(
                            beguilingMagicUsesRemaining,
                            beguilingMagicUsesTotal,
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "music"
                            }),
                            bardicInspirationUsesRemaining,
                            bardicInspirationUsesTotal,
                            {
                              icon: "music"
                            }
                          ),
                          usage: createChargesOrResourceCardUsage(
                            beguilingMagicUsesRemaining,
                            beguilingMagicUsesTotal,
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "music"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsTelekineticMaster
                    ? [
                        {
                          id: "telekinetic-master",
                          label: "Telekinetic Master",
                          checked: useTelekineticMasterOnSelectedSpell,
                          onCheckedChange: setUseTelekineticMasterOnSelectedSpell,
                          disabled: selectedSpellTelekineticMasterDisabled,
                          headerTags: createChargesAndUsageHeaderTags(
                            fighterPsiWarriorTelekineticMasterUsesRemaining,
                            fighterPsiWarriorTelekineticMasterUsesTotal,
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "psi"
                            }),
                            fighterPsiWarriorEnergyDiceRemaining,
                            fighterPsiWarriorEnergyDiceTotal,
                            {
                              icon: "psi"
                            }
                          ),
                          usage: createChargesOrResourceCardUsage(
                            fighterPsiWarriorTelekineticMasterUsesRemaining,
                            fighterPsiWarriorTelekineticMasterUsesTotal,
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "psi"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsRadiantSoul
                    ? [
                        {
                          id: "radiant-soul",
                          label: "Radiant Soul | Once per turn",
                          checked: useRadiantSoulOnSelectedSpell,
                          onCheckedChange: setUseRadiantSoulOnSelectedSpell,
                          disabled: selectedSpellRadiantSoulDisabled
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsElementalSmite
                    ? [
                        {
                          id: "elemental-smite",
                          label: "Elemental Smite",
                          checked: useElementalSmiteOnSelectedSpell,
                          onCheckedChange: setUseElementalSmiteOnSelectedSpell,
                          disabled: selectedSpellElementalSmiteDisabled,
                          radioOptions: {
                            value: selectedElementalSmiteOptionOnSelectedSpell,
                            onValueChange: (value: string) =>
                              setSelectedElementalSmiteOptionOnSelectedSpell(
                                value as Exclude<
                                  typeof selectedElementalSmiteOptionOnSelectedSpell,
                                  null
                                >
                              ),
                            required: true,
                            placement: "body" as const,
                            options: paladinOathOfTheNobleGeniesElementalSmiteOptions.map(
                              (option) => ({
                                id: option.key,
                                header: option.label,
                                description: option.descriptionEntries
                              })
                            )
                          },
                          headerTags: createNamedUsageHeaderTags(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            }),
                            channelDivinityUsesRemaining,
                            channelDivinityUsesTotal,
                            {
                              icon: "pyromancy"
                            }
                          ),
                          usage: createNamedResourceCardUsage(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsStepsOfTheFey
                    ? [
                        {
                          id: "steps-of-the-fey",
                          label: "Steps of the Fey",
                          checked: useStepsOfTheFeyOnSelectedSpell,
                          onCheckedChange: setUseStepsOfTheFeyOnSelectedSpell,
                          disabled: selectedSpellStepsOfTheFeyDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              warlockStepsOfTheFeyUsesRemaining,
                              warlockStepsOfTheFeyUsesTotal
                            )
                          ],
                          usage: createChargesCardUsage(
                            warlockStepsOfTheFeyUsesRemaining,
                            warlockStepsOfTheFeyUsesTotal
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsBewitchingMagic
                    ? [
                        {
                          id: "bewitching-magic",
                          label: "Bewitching Magic | Free Cast",
                          checked: useBewitchingMagicOnSelectedSpell,
                          onCheckedChange: setUseBewitchingMagicOnSelectedSpell
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsMistyWanderer
                    ? [
                        {
                          id: "misty-wanderer",
                          label: "Misty Wanderer",
                          checked: useMistyWandererOnSelectedSpell,
                          onCheckedChange: setUseMistyWandererOnSelectedSpell,
                          disabled: selectedSpellMistyWandererDisabled,
                          usage: createChargesCardUsage(
                            rangerMistyWandererUsesRemaining,
                            rangerMistyWandererUsesTotal
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsFeyReinforcements
                    ? [
                        {
                          id: "fey-reinforcements",
                          label: "Fey Reinforcements",
                          checked: useFeyReinforcementsOnSelectedSpell,
                          onCheckedChange: setUseFeyReinforcementsOnSelectedSpell,
                          disabled: selectedSpellFeyReinforcementsDisabled,
                          usage: createChargesCardUsage(
                            rangerFeyReinforcementsUsesRemaining,
                            rangerFeyReinforcementsUsesTotal
                          )
                        },
                        {
                          id: "fey-reinforcements-no-concentration",
                          label: "No Concentration (10 turns)",
                          checked: useFeyReinforcementsNoConcentrationOnSelectedSpell,
                          onCheckedChange: setUseFeyReinforcementsNoConcentrationOnSelectedSpell,
                          disabled:
                            selectedSpellFeyReinforcementsDisabled ||
                            !useFeyReinforcementsOnSelectedSpell
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsPhantasmalCreatures
                    ? [
                        {
                          id: "phantasmal-creatures",
                          label: "Phantasmal Creatures",
                          checked: usePhantasmalCreaturesOnSelectedSpell,
                          onCheckedChange: setUsePhantasmalCreaturesOnSelectedSpell,
                          disabled: selectedSpellPhantasmalCreaturesDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              selectedSpellPhantasmalCreaturesOptionState?.usesRemaining ?? 0,
                              selectedSpellPhantasmalCreaturesOptionState?.usesTotal ?? 1
                            )
                          ],
                          usage: createChargesCardUsage(
                            selectedSpellPhantasmalCreaturesOptionState?.usesRemaining ?? 0,
                            selectedSpellPhantasmalCreaturesOptionState?.usesTotal ?? 1
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellFrozenHauntOptionState
                    ? [
                        {
                          id: "frozen-haunt",
                          label: "Frozen Haunt",
                          checked: useFrozenHauntOnSelectedSpell,
                          onCheckedChange: setUseFrozenHauntOnSelectedSpell,
                          disabled: selectedSpellFrozenHauntOptionState.disabled,
                          headerTags: createChargesAndUsageHeaderTags(
                            selectedSpellFrozenHauntOptionState.usesRemaining,
                            selectedSpellFrozenHauntOptionState.usesTotal,
                            createFeatureActionCardCost({
                              amountText: `${frozenHauntFallbackSpellSlotMinimumLevel}+`,
                              resourceLabel: "Spell Slot"
                            }),
                            selectedSpellFrozenHauntFallbackSlotSummary.remaining,
                            selectedSpellFrozenHauntFallbackSlotSummary.total,
                            {
                              label: "Spell Slots"
                            }
                          ),
                          usage: createChargesOrResourceCardUsage(
                            selectedSpellFrozenHauntOptionState.usesRemaining,
                            selectedSpellFrozenHauntOptionState.usesTotal,
                            createFeatureActionCardCost({
                              amountText: `${frozenHauntFallbackSpellSlotMinimumLevel}+`,
                              resourceLabel: "Spell Slot"
                            })
                          ),
                          select:
                            useFrozenHauntOnSelectedSpell &&
                            selectedSpellFrozenHauntOptionState.usesRemaining <= 0 &&
                            selectedSpellFrozenHauntFallbackSlotOptions.length > 0
                              ? {
                                  label: "Frozen Haunt Slot",
                                  value: selectedFrozenHauntFallbackSlotLevel,
                                  onValueChange: setSelectedFrozenHauntFallbackSlotLevel,
                                  options: selectedSpellFrozenHauntFallbackSlotOptions
                                }
                              : undefined
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsBlessingOfMoonlight
                    ? [
                        {
                          id: "blessing-of-moonlight",
                          label: "Blessing of Moonlight",
                          checked: useBlessingOfMoonlightOnSelectedSpell,
                          onCheckedChange: setUseBlessingOfMoonlightOnSelectedSpell,
                          disabled: blessingOfMoonlightUsesRemaining <= 0,
                          headerTags: [
                            createChargesHeaderTag(
                              blessingOfMoonlightUsesRemaining,
                              blessingOfMoonlightUsesTotal
                            )
                          ],
                          usage: createChargesCardUsage(
                            blessingOfMoonlightUsesRemaining,
                            blessingOfMoonlightUsesTotal
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsNaturalRecovery
                    ? [
                        {
                          id: "natural-recovery",
                          label: "Natural Recovery",
                          checked: useNaturalRecoveryOnSelectedSpell,
                          onCheckedChange: setUseNaturalRecoveryOnSelectedSpell,
                          disabled: druidNaturalRecoveryUsesRemaining <= 0,
                          headerTags: [
                            createChargesHeaderTag(druidNaturalRecoveryUsesRemaining, 1)
                          ],
                          usage: createChargesCardUsage(druidNaturalRecoveryUsesRemaining, 1)
                        }
                      ]
                    : [])
                ]
              : undefined
          }
          backdropClassName={isPreparedSpellPreview ? styles.previewSpellDrawerBackdrop : undefined}
        />
      ) : null}

      {selectedInvocation ? (
        <EldritchInvocationDrawer
          option={selectedInvocation}
          onClose={closeSelectedInvocation}
          backdropClassName={
            isSpellManagementModalOpen ? styles.previewSpellDrawerBackdrop : undefined
          }
        />
      ) : null}

      {selectedDivinityRow ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={closeSelectedDivinity}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-divinity-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>{formatCodexLabel("DIVINITY")}</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-divinity-drawer-title" className={sheetStyles.spellDrawerTitle}>
                    {selectedDivinityRow.option.name}
                  </h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>
                  {formatDivinitySubtitle(selectedDivinityRow.entry)}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={closeSelectedDivinity}
                aria-label="Close divinity details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.spellDrawerBody}>
              <div className={sheetStyles.spellDrawerDetails}>
                <CellContainer
                  label="Casting Time"
                  content={
                    <span className={styles.divinityCastingTimeContent}>
                      <span>{formatSpellCastingTime(selectedDivinityRow.entry.castingTime)}</span>
                      {selectedDivinityActionShape ? (
                        <ActionShape
                          shape={selectedDivinityActionShape}
                          isSelected
                          size="small"
                          className={styles.divinityCastingTimeShape}
                        />
                      ) : null}
                    </span>
                  }
                />
                <CellContainer label="Range" content={selectedDivinityRow.entry.range} />
                <CellContainer label="Duration" content={selectedDivinityRow.entry.duration} />
                <CellContainer
                  label={selectedDivinityRow.option.resultLabel ?? "Damage"}
                  content={getDivinityDrawerValueLabel(selectedDivinityRow.option)}
                />
              </div>

              {(() => {
                const descriptionEntries =
                  selectedDivinityDisplay?.description ?? selectedDivinityRow.entry.description;
                const descriptionSections = orderDescriptionAdditionSections(
                  selectedDivinityDisplay?.descriptionAdditions ?? []
                );
                const hasBaseDescription = descriptionEntries.length > 0;

                return hasBaseDescription || descriptionSections.length > 0 ? (
                  <div className={sheetStyles.spellDrawerDescriptionStack}>
                    {hasBaseDescription ? (
                      <SpellDescriptionContent
                        description={descriptionEntries}
                        className={clsx(
                          sheetStyles.spellDrawerDescriptionList,
                          sheetStyles.spellDrawerDescriptionSection
                        )}
                        entryClassName={sheetStyles.spellDrawerDescriptionLine}
                        strongClassName={sheetStyles.spellDrawerDescriptionStrong}
                      />
                    ) : null}
                    {descriptionSections.map((section, index) => (
                      <div
                        key={`${selectedDivinityRow.option.key}-description-addition-${index}`}
                        className={sheetStyles.spellDrawerDescriptionAdditionSection}
                      >
                        {hasBaseDescription || index > 0 ? (
                          <hr
                            className={sheetStyles.spellDrawerDescriptionDivider}
                            aria-hidden="true"
                          />
                        ) : null}
                        <SpellDescriptionContent
                          description={section}
                          className={clsx(
                            sheetStyles.spellDrawerDescriptionList,
                            sheetStyles.spellDrawerDescriptionSection
                          )}
                          entryClassName={sheetStyles.spellDrawerDescriptionLine}
                          strongClassName={sheetStyles.spellDrawerDescriptionStrong}
                        />
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>

            <div className={sheetStyles.spellDrawerActions}>
              <div className={styles.divinityDrawerActionStack}>
                {selectedDivinityActionWarning ? (
                  <div className={styles.divinityDrawerWarningBlock}>
                    <p className={gameplayActionStyles.warningCard}>
                      {selectedDivinityActionWarning}
                    </p>
                  </div>
                ) : null}
              </div>
              <ActionButton
                className={styles.divinityDrawerActionButton}
                onClick={channelSelectedDivinity}
                disabled={
                  channelDivinityUsesRemaining <= 0 || selectedDivinityActionWarning !== null
                }
                trailingBadge={
                  selectedDivinityActionShape ? (
                    <ActionShape
                      shape={selectedDivinityActionShape}
                      isSelected={selectedDivinityActionShapeState?.isSelected ?? true}
                      multiCount={selectedDivinityActionShapeState?.multiCount ?? 0}
                      className={styles.divinityDrawerActionButtonShape}
                    />
                  ) : null
                }
              >
                Use Channel Divinity
              </ActionButton>
            </div>
          </section>
        </div>
      ) : null}
      {diceRollerPopup}
    </article>
  );
}
