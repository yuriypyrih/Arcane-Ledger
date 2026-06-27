import type { CastSelectedSpellOptions, SpellCastingFormRendererContext } from "./types";

export function renderSpellCastingForm(context: SpellCastingFormRendererContext) {
  const {
    CharacterSpellDrawer,
    CircleHelp,
    Pencil,
    SpellCastingGuideModal,
    SpellMainListRow,
    SpellManagementModal,
    SpellSlotActionSheet,
    InputRequiredBadge,
    activeSpellSlotSheetExpended,
    activeSpellSlotSheetLevel,
    activeSpellSlotSheetTotal,
    activeWizardSpellFilter,
    alwaysPreparedSpellIds,
    alwaysSpellbookSpellIds,
    bardicInspirationUsesRemaining,
    bardicInspirationUsesTotal,
    beguilingMagicUsesRemaining,
    beguilingMagicUsesTotal,
    blessingOfMoonlightUsesRemaining,
    blessingOfMoonlightUsesTotal,
    cantripLimit,
    cantripOptions,
    castSelectedSpell,
    character,
    className,
    closeSelectedSpell,
    closeSpellSlotActionSheet,
    clsx,
    customClassSpellSlotMaximumLimit,
    createChargesAndUsageHeaderTags,
    createChargesCardUsage,
    createChargesHeaderTag,
    createChargesOrResourceCardUsage,
    createFeatureActionCardCost,
    createNamedResourceCardUsage,
    createNamedUsageHeaderTags,
    customCantripOptions,
    customSpellPreparationOptions,
    diceRollerPopup,
    druidNaturalRecoveryUsesRemaining,
    druidStarMapGuidingBoltUsesRemaining,
    druidStarMapGuidingBoltUsesTotal,
    fighterPsiWarriorEnergyDiceRemaining,
    fighterPsiWarriorEnergyDiceTotal,
    fighterPsiWarriorTelekineticMasterUsesRemaining,
    fighterPsiWarriorTelekineticMasterUsesTotal,
    formatSpellGroupTitle,
    frozenHauntFallbackSpellSlotMinimumLevel,
    getActionShapeForEconomyType,
    getSpellOutcomeSummary,
    getSpellRowActionShapes,
    hasSpellManagementOptions,
    hasSpellSelectionInputRequired,
    highestSpellSlotLevel,
    isPreparedSpellPreview,
    isCustomClass,
    isSelectedSpellDiceRollerSettingsOpen,
    isSpellcastingGuideOpen,
    isSpellManagementModalOpen,
    isSpellcastingRulesEnforced,
    isSpellcastingRulesEnforcementDisabled,
    knownSpellEntriesById,
    onPersistCharacter,
    openSpellDetails,
    openSpellManagementMenu,
    preparedSpellRowGroups,
    preparedSpellLimit,
    rangerFeyReinforcementsUsesRemaining,
    rangerFeyReinforcementsUsesTotal,
    rangerMistyWandererUsesRemaining,
    rangerMistyWandererUsesTotal,
    resetAllSpellSlotsAtLevel,
    selectedCantripIds,
    selectedFrozenHauntFallbackSlotLevel,
    selectedManualSpellbookSpellIds,
    selectedPreparedSpellIds,
    selectedSpell,
    selectedSpellActionPaths,
    selectedSpellAlwaysPrepared,
    selectedSpellAlwaysPreparedSources,
    selectedSpellAlwaysSpellbook,
    selectedSpellAttackRollFormula,
    selectedSpellBlockedReason,
    selectedSpellCanCastAsEmeraldEnclaveFledglingRitual,
    selectedSpellCanCastAsRitualFromSpellbook,
    selectedSpellCanOnlyBeCastAsRitual,
    selectedSpellCastWarning,
    selectedSpellDamageDetailOverride,
    selectedSpellDetectThoughtsDisabled,
    selectedSpellDetectThoughtsFreeCastState,
    selectedSpellCustomEffects,
    selectedSpellDisplay,
    selectedSpellMagicInitiateAbility,
    selectedSpellMagicInitiateDisabled,
    selectedSpellMagicInitiateFreeCastState,
    selectedSpellFacts,
    selectedSpellFalseLifeTemporaryHitPointsFormula,
    selectedSpellFeyMagicDisabled,
    selectedSpellFeyMagicFreeCastState,
    selectedSpellFiendishLegacyDisabled,
    selectedSpellFiendishLegacyFreeCastState,
    selectedSpellForestGnomeDisabled,
    selectedSpellForestGnomeFreeCastState,
    selectedSpellGoliathAncestryDisabled,
    selectedSpellGoliathAncestryState,
    selectedSpellFeyReinforcementsDisabled,
    selectedSpellFreeCastSlotLevel,
    selectedSpellFrozenHauntFallbackSlotOptions,
    selectedSpellFrozenHauntFallbackSlotSummary,
    selectedSpellFrozenHauntOptionState,
    selectedSpellHuntersRimeTemporaryHitPointsFormula,
    selectedSpellIsSpellbookOnly,
    selectedSpellIsCustom,
    selectedSpellIsWizardSpellMastery,
    selectedSpellMistyWandererDisabled,
    selectedSpellOverchannelDisabled,
    selectedSpellOverchannelNecroticDamage,
    selectedSpellPhantasmalCreaturesDisabled,
    selectedSpellPhantasmalCreaturesOptionState,
    selectedSpellPsionicSorceryCurrentCost,
    selectedSpellPsionicSorceryDisabled,
    selectedSpellQuickRitualDisabled,
    selectedSpellQuickRitualState,
    selectedSpellRadiantSoulDisabled,
    selectedSpellShadowMagicDisabled,
    selectedSpellShadowMagicFreeCastState,
    selectedSpellSharedCastWarning,
    selectedSpellSlotLevel,
    selectedSpellStarMapDisabled,
    selectedSpellStepsOfTheFeyDisabled,
    selectedSpellSupportsBeguilingMagic,
    selectedSpellSupportsBewitchingMagic,
    selectedSpellSupportsBlessingOfMoonlight,
    selectedSpellSupportsBoonOfSpellRecall,
    selectedSpellSupportsDetectThoughts,
    selectedSpellSupportsEmeraldEnclaveFledgling,
    selectedSpellSupportsFeyMagic,
    selectedSpellSupportsFiendishLegacy,
    selectedSpellSupportsForestGnome,
    selectedSpellSupportsFeyReinforcements,
    selectedSpellSupportsGoliathAncestry,
    selectedSpellSupportsMagicInitiate,
    selectedSpellSupportsMistyWanderer,
    selectedSpellSupportsNaturalRecovery,
    selectedSpellSupportsOverchannel,
    selectedSpellSupportsPhantasmalCreatures,
    selectedSpellSupportsPsionicSorcery,
    selectedSpellSupportsQuickRitual,
    selectedSpellSupportsRadiantSoul,
    selectedSpellSupportsShadowMagic,
    selectedSpellSupportsStarMap,
    selectedSpellSupportsStepsOfTheFey,
    selectedSpellSupportsTamedSurge,
    selectedSpellSupportsTelekineticMaster,
    selectedSpellTamedSurgeDisabled,
    selectedSpellTelekineticMasterDisabled,
    selectedSpellUnderMantleOfMajesty,
    selectedSpellViewMode,
    setActiveSpellSlotSheetLevel,
    setActiveWizardSpellFilter,
    setIsSelectedSpellDiceRollerSettingsOpen,
    setIsSpellcastingGuideOpen,
    setIsSpellManagementModalOpen,
    setSelectedFrozenHauntFallbackSlotLevel,
    setSelectedSpellSlotLevel,
    setUseBeguilingMagicOnSelectedSpell,
    setUseBewitchingMagicOnSelectedSpell,
    setUseBlessingOfMoonlightOnSelectedSpell,
    setUseBoonOfSpellRecallOnSelectedSpell,
    setUseDetectThoughtsOnSelectedSpell,
    setUseEmeraldEnclaveFledglingFreeUseOnSelectedSpell,
    setUseFeyMagicOnSelectedSpell,
    setUseFiendishLegacyOnSelectedSpell,
    setUseForestGnomeOnSelectedSpell,
    setUseGoliathAncestryOnSelectedSpell,
    setUseFeyReinforcementsNoConcentrationOnSelectedSpell,
    setUseFeyReinforcementsOnSelectedSpell,
    setUseFrozenHauntOnSelectedSpell,
    setUseMagicInitiateOnSelectedSpell,
    setUseMistyWandererOnSelectedSpell,
    setUseNaturalRecoveryOnSelectedSpell,
    setUseOverchannelOnSelectedSpell,
    setUsePhantasmalCreaturesOnSelectedSpell,
    setUsePsionicSorceryOnSelectedSpell,
    setUseQuickRitualOnSelectedSpell,
    setUseRadiantSoulOnSelectedSpell,
    setUseShadowMagicOnSelectedSpell,
    setUseStarMapOnSelectedSpell,
    setUseStepsOfTheFeyOnSelectedSpell,
    setUseTamedSurgeOnSelectedSpell,
    setUseTelekineticMasterOnSelectedSpell,
    shared,
    SheetActionButton,
    SheetSurface,
    sorceryPointsRemaining,
    sorceryPointsTotal,
    spellPreparationOptions,
    spellSlotLevels,
    spellSlotTotals,
    spellSlotsRemaining,
    spellbookSpellEntriesById,
    spellcastingState,
    styles,
    tamedSurgeUsesRemaining,
    tamedSurgeUsesTotal,
    updateCustomSpellSlotMaximum,
    updateSpellcastingRulesEnforcement,
    updateSpellSlotsExpended,
    useBeguilingMagicOnSelectedSpell,
    useBewitchingMagicOnSelectedSpell,
    useBlessingOfMoonlightOnSelectedSpell,
    useBoonOfSpellRecallOnSelectedSpell,
    useDetectThoughtsOnSelectedSpell,
    useEmeraldEnclaveFledglingFreeUseOnSelectedSpell,
    useFeyMagicOnSelectedSpell,
    useFiendishLegacyOnSelectedSpell,
    useForestGnomeOnSelectedSpell,
    useGoliathAncestryOnSelectedSpell,
    useFeyReinforcementsNoConcentrationOnSelectedSpell,
    useFeyReinforcementsOnSelectedSpell,
    useFrozenHauntOnSelectedSpell,
    useMagicInitiateOnSelectedSpell,
    useMistyWandererOnSelectedSpell,
    useNaturalRecoveryOnSelectedSpell,
    useOverchannelOnSelectedSpell,
    usePhantasmalCreaturesOnSelectedSpell,
    usePsionicSorceryOnSelectedSpell,
    useQuickRitualOnSelectedSpell,
    useRadiantSoulOnSelectedSpell,
    useShadowMagicOnSelectedSpell,
    useStarMapOnSelectedSpell,
    useStepsOfTheFeyOnSelectedSpell,
    useTamedSurgeOnSelectedSpell,
    useTelekineticMasterOnSelectedSpell,
    usesPreparedSpells,
    usesSpellbook,
    warlockStepsOfTheFeyUsesRemaining,
    warlockStepsOfTheFeyUsesTotal
  } = context;

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={clsx(shared.sectionHeader, styles.spellcastingSectionHeader)}>
        <div>
          <div className={shared.eyebrowHelpRow}>
            <p className={clsx(shared.eyebrow, shared.eyebrowInHelpRow)}>Spellcasting</p>
            <button
              type="button"
              className={shared.helpButton}
              onClick={() => setIsSpellcastingGuideOpen(true)}
              aria-label="Open spellcasting guide"
              title="Open spellcasting guide"
            >
              <CircleHelp size={16} />
            </button>
          </div>
        </div>
        <div className={clsx(shared.headerActions, styles.spellcastingHeaderActions)}>
          {hasSpellSelectionInputRequired ? <InputRequiredBadge /> : null}
          {hasSpellManagementOptions ? (
            <SheetActionButton
              onClick={openSpellManagementMenu}
              disabled={spellcastingState.blocked}
            >
              <Pencil size={16} />
              Edit
            </SheetActionButton>
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
              hasBorder
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
        {preparedSpellRowGroups.length === 0 ? (
          <p className={shared.emptyText}>No spells or cantrips have been selected yet.</p>
        ) : (
          preparedSpellRowGroups.map((group) => (
            <div key={group.level} className={styles.spellGroup}>
              <p className={styles.spellGroupTitle}>{formatSpellGroupTitle(group.level)}</p>
              <ul className={styles.spellList}>
                {group.spells.map((row) => (
                  <li key={row.spell.id}>
                    <SpellMainListRow row={row} onOpenSpellDetails={openSpellDetails} />
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
          maximumSlotLimit={isCustomClass ? customClassSpellSlotMaximumLimit : undefined}
          onIncreaseMaximum={
            isCustomClass
              ? () => updateCustomSpellSlotMaximum(activeSpellSlotSheetLevel, 1)
              : undefined
          }
          onDecreaseMaximum={
            isCustomClass
              ? () => updateCustomSpellSlotMaximum(activeSpellSlotSheetLevel, -1)
              : undefined
          }
        />
      ) : null}

      {isSpellManagementModalOpen ? (
        <SpellManagementModal
          allowAllSpellLevels={isCustomClass}
          alwaysPreparedSpellIds={alwaysPreparedSpellIds}
          alwaysSpellbookSpellIds={alwaysSpellbookSpellIds}
          cantripLimit={cantripLimit}
          cantripOptions={cantripOptions}
          character={character}
          customCantripOptions={customCantripOptions}
          customSpellPreparationOptions={customSpellPreparationOptions}
          highestSpellSlotLevel={highestSpellSlotLevel}
          knownSpellEntriesById={knownSpellEntriesById}
          getSpellActionShapes={getSpellRowActionShapes}
          getSpellOutcomeSummary={getSpellOutcomeSummary}
          onClose={() => setIsSpellManagementModalOpen(false)}
          onOpenSpellDetails={openSpellDetails}
          onPersistCharacter={onPersistCharacter}
          onSpellcastingRulesEnforcementChange={updateSpellcastingRulesEnforcement}
          preparedSpellLimit={preparedSpellLimit}
          selectedCantripIds={selectedCantripIds}
          selectedManualSpellbookSpellIds={selectedManualSpellbookSpellIds}
          selectedPreparedSpellIds={selectedPreparedSpellIds}
          spellbookSpellEntriesById={spellbookSpellEntriesById}
          spellPreparationOptions={spellPreparationOptions}
          suspendEscapeClose={Boolean(
            activeSpellSlotSheetLevel !== null ||
            selectedSpell ||
            isSelectedSpellDiceRollerSettingsOpen
          )}
          spellcastingRulesEnforced={isSpellcastingRulesEnforced}
          spellcastingRulesEnforcementDisabled={isSpellcastingRulesEnforcementDisabled}
          usesPreparedSpells={usesPreparedSpells}
          usesSpellbook={usesSpellbook}
        />
      ) : null}

      {isSpellcastingGuideOpen ? (
        <SpellCastingGuideModal onClose={() => setIsSpellcastingGuideOpen(false)} />
      ) : null}

      {selectedSpell ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedSpellDisplay ?? selectedSpell}
          customEffects={selectedSpellCustomEffects}
          isCustomSpell={selectedSpellIsCustom}
          damageDetailOverride={selectedSpellDamageDetailOverride}
          spellcastingAbilityOverride={selectedSpellMagicInitiateAbility}
          alwaysPrepared={selectedSpellAlwaysPrepared}
          alwaysPreparedSources={selectedSpellAlwaysPreparedSources}
          alwaysSpellbook={selectedSpellAlwaysSpellbook}
          mode={selectedSpellViewMode}
          spellSlotTotals={spellSlotTotals}
          spellSlotsRemaining={spellSlotsRemaining}
          selectedSpellSlotLevel={selectedSpellSlotLevel}
          onSelectedSpellSlotLevelChange={setSelectedSpellSlotLevel}
          onClose={closeSelectedSpell}
          onAction={(options: CastSelectedSpellOptions = {}) =>
            castSelectedSpell({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnSelectedSpell,
              useStarMap: useStarMapOnSelectedSpell,
              useMagicInitiate: useMagicInitiateOnSelectedSpell,
              useForestGnome: useForestGnomeOnSelectedSpell,
              useFiendishLegacy: useFiendishLegacyOnSelectedSpell,
              useGoliathAncestry: useGoliathAncestryOnSelectedSpell,
              useFeyMagic: useFeyMagicOnSelectedSpell,
              useQuickRitual: useQuickRitualOnSelectedSpell,
              useShadowMagic: useShadowMagicOnSelectedSpell,
              useDetectThoughts: useDetectThoughtsOnSelectedSpell,
              useBoonOfSpellRecall: useBoonOfSpellRecallOnSelectedSpell,
              useBlessingOfMoonlight: useBlessingOfMoonlightOnSelectedSpell,
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
              useOverchannel: useOverchannelOnSelectedSpell,
              useEmeraldEnclaveFledglingFreeUse:
                useEmeraldEnclaveFledglingFreeUseOnSelectedSpell
            })
          }
          actionConsumesSpellSlot={
            !selectedSpellIsSpellbookOnly &&
            !selectedSpellCanOnlyBeCastAsRitual &&
            !(selectedSpellSupportsStarMap && useStarMapOnSelectedSpell) &&
            !(selectedSpellSupportsMagicInitiate && useMagicInitiateOnSelectedSpell) &&
            !(selectedSpellSupportsForestGnome && useForestGnomeOnSelectedSpell) &&
            !(selectedSpellSupportsFiendishLegacy && useFiendishLegacyOnSelectedSpell) &&
            !(selectedSpellSupportsFeyMagic && useFeyMagicOnSelectedSpell) &&
            !(selectedSpellSupportsQuickRitual && useQuickRitualOnSelectedSpell) &&
            !(selectedSpellSupportsShadowMagic && useShadowMagicOnSelectedSpell) &&
            !(selectedSpellSupportsDetectThoughts && useDetectThoughtsOnSelectedSpell) &&
            !(selectedSpellSupportsBoonOfSpellRecall && useBoonOfSpellRecallOnSelectedSpell) &&
            !(
              selectedSpellSupportsEmeraldEnclaveFledgling &&
              useEmeraldEnclaveFledglingFreeUseOnSelectedSpell
            ) &&
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
            selectedSpellCanCastAsRitualFromSpellbook ||
            selectedSpellCanCastAsEmeraldEnclaveFledglingRitual ||
            selectedSpellCanOnlyBeCastAsRitual
          }
          ritualCastingRequired={selectedSpellCanOnlyBeCastAsRitual}
          slotFreeUseOption={
            selectedSpellSupportsEmeraldEnclaveFledgling
              ? {
                  label: "Free use",
                  selected: useEmeraldEnclaveFledglingFreeUseOnSelectedSpell,
                  onSelectedChange: setUseEmeraldEnclaveFledglingFreeUseOnSelectedSpell
                }
              : null
          }
          actionAvailabilityText={
            selectedSpellSupportsPsionicSorcery && usePsionicSorceryOnSelectedSpell
                ? `Psionic Sorcery lets you cast this spell at level ${selectedSpellPsionicSorceryCurrentCost} by spending ${selectedSpellPsionicSorceryCurrentCost} Sorcery Point${selectedSpellPsionicSorceryCurrentCost === 1 ? "" : "s"} instead of a spell slot.`
                : selectedSpellSupportsStarMap && useStarMapOnSelectedSpell
                  ? "Star Map lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                  : selectedSpellSupportsMagicInitiate && useMagicInitiateOnSelectedSpell
                    ? "Magic Initiate lets you cast this spell at level 1 without expending a spell slot. This use recharges on a Long Rest."
                    : selectedSpellSupportsForestGnome && useForestGnomeOnSelectedSpell
                      ? "Forest Gnome lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                      : selectedSpellSupportsFiendishLegacy && useFiendishLegacyOnSelectedSpell
                        ? "Fiendish Legacy lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                        : selectedSpellSupportsFeyMagic && useFeyMagicOnSelectedSpell
                          ? "Fey Magic lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                          : selectedSpellSupportsQuickRitual && useQuickRitualOnSelectedSpell
                            ? "Quick Ritual lets you cast this Ritual spell using its regular casting time without expending a spell slot. This use recharges on a Long Rest."
                            : selectedSpellSupportsShadowMagic && useShadowMagicOnSelectedSpell
                              ? "Shadow Magic lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                              : selectedSpellSupportsDetectThoughts &&
                                  useDetectThoughtsOnSelectedSpell
                                ? "Detect Thoughts lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                                : selectedSpellSupportsBoonOfSpellRecall &&
                                    useBoonOfSpellRecallOnSelectedSpell
                                  ? "Free Casting prevents this cast from expending a spell slot."
                                  : selectedSpellSupportsEmeraldEnclaveFledgling &&
                                      useEmeraldEnclaveFledglingFreeUseOnSelectedSpell
                                    ? "Emerald Enclave Fledgling lets you cast this spell without expending a spell slot."
                                    : selectedSpellSupportsStepsOfTheFey &&
                                        useStepsOfTheFeyOnSelectedSpell
                                      ? selectedSpellSupportsBewitchingMagic &&
                                        useBewitchingMagicOnSelectedSpell
                                        ? "Steps of the Fey and Bewitching Magic both let you cast this spell without expending a spell slot. Steps of the Fey still spends one use."
                                        : "Steps of the Fey lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
                                      : selectedSpellSupportsBewitchingMagic &&
                                          useBewitchingMagicOnSelectedSpell
                                        ? "Bewitching Magic lets you cast this spell without expending a spell slot."
                                        : selectedSpellSupportsMistyWanderer &&
                                            useMistyWandererOnSelectedSpell
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
                                                : selectedSpellSupportsTamedSurge &&
                                                    useTamedSurgeOnSelectedSpell
                                                  ? "Tamed Surge will be spent after this spell consumes a spell slot."
                                                  : selectedSpellUnderMantleOfMajesty
                                                    ? "Mantle of Majesty is active. Cast at level 1 without expending a spell slot, or upcast normally."
                                                    : null
          }
          actionContextText={
            selectedSpellSupportsFeyReinforcements &&
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
            selectedSpellFalseLifeTemporaryHitPointsFormula !== null ||
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
                    actionLabel: path.actionLabel,
                    actionShape,
                    actionShapeAvailable: path.shapeState.isAvailable,
                    actionShapeMultiCount: path.shapeState.multiCount,
                    disabledReason: path.disabledReason ?? path.shapeState.disabledReason,
                    roundTrackerResourceOverride: path.roundTrackerResource,
                    usage: path.usage,
                    spellImplementationCastSource: path.spellImplementationCastSource,
                    forcedSpellImplementationOptions: path.forcedSpellImplementationOptions,
                    spellCastEffectIds: path.spellCastEffectIds
                  }
                : null;
            })
            .filter((path): path is NonNullable<typeof path> => path !== null)}
          actionOptions={
            selectedSpellSupportsStarMap ||
            selectedSpellSupportsMagicInitiate ||
            selectedSpellSupportsForestGnome ||
            selectedSpellSupportsFiendishLegacy ||
            selectedSpellSupportsGoliathAncestry ||
            selectedSpellSupportsFeyMagic ||
            selectedSpellSupportsQuickRitual ||
            selectedSpellSupportsShadowMagic ||
            selectedSpellSupportsDetectThoughts ||
            selectedSpellSupportsBoonOfSpellRecall ||
            selectedSpellSupportsPsionicSorcery ||
            selectedSpellSupportsBeguilingMagic ||
            selectedSpellSupportsBlessingOfMoonlight ||
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
                  ...(selectedSpellSupportsForestGnome
                    ? [
                        {
                          id: "forest-gnome",
                          label: "Forest Gnome | Charges",
                          checked: useForestGnomeOnSelectedSpell,
                          onCheckedChange: setUseForestGnomeOnSelectedSpell,
                          disabled: selectedSpellForestGnomeDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              selectedSpellForestGnomeFreeCastState?.usesRemaining ?? 0,
                              selectedSpellForestGnomeFreeCastState?.usesTotal ?? 1
                            )
                          ],
                          usage: createChargesCardUsage(
                            selectedSpellForestGnomeFreeCastState?.usesRemaining ?? 0,
                            selectedSpellForestGnomeFreeCastState?.usesTotal ?? 1
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsFiendishLegacy
                    ? [
                        {
                          id: "fiendish-legacy",
                          label: "Fiendish Legacy | Charges",
                          checked: useFiendishLegacyOnSelectedSpell,
                          onCheckedChange: setUseFiendishLegacyOnSelectedSpell,
                          disabled: selectedSpellFiendishLegacyDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              selectedSpellFiendishLegacyFreeCastState?.usesRemaining ?? 0,
                              selectedSpellFiendishLegacyFreeCastState?.usesTotal ?? 1
                            )
                          ],
                          usage: createChargesCardUsage(
                            selectedSpellFiendishLegacyFreeCastState?.usesRemaining ?? 0,
                            selectedSpellFiendishLegacyFreeCastState?.usesTotal ?? 1
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsGoliathAncestry
                    ? [
                        {
                          id: "goliath-giant-ancestry",
                          label: selectedSpellGoliathAncestryState?.featureName ?? "Giant Ancestry",
                          checked: useGoliathAncestryOnSelectedSpell,
                          onCheckedChange: setUseGoliathAncestryOnSelectedSpell,
                          disabled: selectedSpellGoliathAncestryDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              selectedSpellGoliathAncestryState?.usesRemaining ?? 0,
                              selectedSpellGoliathAncestryState?.usesTotal ?? 1
                            )
                          ],
                          usage: createChargesCardUsage(
                            selectedSpellGoliathAncestryState?.usesRemaining ?? 0,
                            selectedSpellGoliathAncestryState?.usesTotal ?? 1
                          ),
                          application: {
                            targetLabel: "Damage"
                          }
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsFeyMagic
                    ? [
                        {
                          id: "fey-magic",
                          label: "Fey Magic",
                          checked: useFeyMagicOnSelectedSpell,
                          onCheckedChange: setUseFeyMagicOnSelectedSpell,
                          disabled: selectedSpellFeyMagicDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              selectedSpellFeyMagicFreeCastState?.usesRemaining ?? 0,
                              selectedSpellFeyMagicFreeCastState?.usesTotal ?? 1
                            )
                          ],
                          usage: createChargesCardUsage(
                            selectedSpellFeyMagicFreeCastState?.usesRemaining ?? 0,
                            selectedSpellFeyMagicFreeCastState?.usesTotal ?? 1
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsQuickRitual
                    ? [
                        {
                          id: "quick-ritual",
                          label: "Quick Ritual",
                          checked: useQuickRitualOnSelectedSpell,
                          onCheckedChange: setUseQuickRitualOnSelectedSpell,
                          disabled: selectedSpellQuickRitualDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              selectedSpellQuickRitualState?.usesRemaining ?? 0,
                              selectedSpellQuickRitualState?.usesTotal ?? 1
                            )
                          ],
                          usage: createChargesCardUsage(
                            selectedSpellQuickRitualState?.usesRemaining ?? 0,
                            selectedSpellQuickRitualState?.usesTotal ?? 1
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsShadowMagic
                    ? [
                        {
                          id: "shadow-magic",
                          label: "Shadow Magic",
                          checked: useShadowMagicOnSelectedSpell,
                          onCheckedChange: setUseShadowMagicOnSelectedSpell,
                          disabled: selectedSpellShadowMagicDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              selectedSpellShadowMagicFreeCastState?.usesRemaining ?? 0,
                              selectedSpellShadowMagicFreeCastState?.usesTotal ?? 1
                            )
                          ],
                          usage: createChargesCardUsage(
                            selectedSpellShadowMagicFreeCastState?.usesRemaining ?? 0,
                            selectedSpellShadowMagicFreeCastState?.usesTotal ?? 1
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsDetectThoughts
                    ? [
                        {
                          id: "detect-thoughts",
                          label: "Detect Thoughts",
                          checked: useDetectThoughtsOnSelectedSpell,
                          onCheckedChange: setUseDetectThoughtsOnSelectedSpell,
                          disabled: selectedSpellDetectThoughtsDisabled,
                          headerTags: [
                            createChargesHeaderTag(
                              selectedSpellDetectThoughtsFreeCastState?.usesRemaining ?? 0,
                              selectedSpellDetectThoughtsFreeCastState?.usesTotal ?? 1
                            )
                          ],
                          usage: createChargesCardUsage(
                            selectedSpellDetectThoughtsFreeCastState?.usesRemaining ?? 0,
                            selectedSpellDetectThoughtsFreeCastState?.usesTotal ?? 1
                          )
                        }
                      ]
                    : []),
                  ...(selectedSpellSupportsBoonOfSpellRecall
                    ? [
                        {
                          id: "boon-of-spell-recall",
                          label: "Free Casting",
                          checked: useBoonOfSpellRecallOnSelectedSpell,
                          onCheckedChange: setUseBoonOfSpellRecallOnSelectedSpell
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

      {diceRollerPopup}
    </article>
  );
}
