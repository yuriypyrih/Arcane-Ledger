/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
// @ts-nocheck

export function renderClassFeatureContent(context: Record<string, any>) {
  const {
    ArtificerReplicateMagicItemPlanSelection,
    BattleMasterManeuverSelection,
    CLASS_FEATURE,
    EldritchInvocationList,
    FeatureChoiceOptions,
    FeatureDescriptionLines,
    Pencil,
    Plus,
    SKILL,
    SelectInput,
    WizardBladesingerTrainingInWarAndSongFields,
    WizardSavantFeatureFields,
    artisanToolProficiencies,
    blessedStrikesChoice,
    buildSkillSelectOptions,
    buildToolSelectOptions,
    character,
    clsx,
    druidElementalFuryChoice,
    druidWildShapeKnownForms,
    druidWildShapeRules,
    featureDetails,
    featureRow,
    fighterBanneretKnightlyEnvoySkillOptions,
    formatCodexLabel,
    getArtificerReplicateMagicItemAvailablePlanGroups,
    getArtificerReplicateMagicItemPlanSelections,
    getArtificerReplicateMagicItemPlansKnown,
    getAvailableBardExpertiseSkills,
    getAvailableBardLoreBonusProficiencySkills,
    getAvailableBardMagicalDiscoveriesSpells,
    getAvailableBardPrimalLoreCantrips,
    getAvailableBardPrimalLoreSkills,
    getAvailableFighterBanneretKnightlyEnvoyLanguages,
    getAvailableFighterBanneretKnightlyEnvoySkills,
    getAvailableKnowledgeDomainBlessingsSkills,
    getAvailableKnowledgeDomainBlessingsTools,
    getAvailableKnowledgeDomainUnfetteredMindSavingThrows,
    getAvailablePaladinOathOfTheNobleGeniesGeniesSplendorSkills,
    getAvailableRangerDeftExplorerLanguages,
    getAvailableRangerDeftExplorerSkills,
    getAvailableRangerGloomStalkerIronMindSavingThrows,
    getAvailableRangerLevel9ExpertiseSkills,
    getAvailableRangerOtherworldlyGlamourSkills,
    getAvailableRogueExpertiseSkills,
    getAvailableRogueThievesCantLanguages,
    getAvailableSorcererMetamagicOptions,
    getAvailableWarlockMysticArcanumSpells,
    getAvailableWeaponMasteryOptions,
    getAvailableWizardScholarSkills,
    getAvailableWizardSignatureSpells,
    getAvailableWizardSpellMasterySpells,
    getBarbarianPrimalKnowledgeOptions,
    getBarbarianPrimalKnowledgeSelection,
    getBarbarianWildHeartAspectChoiceForCharacter,
    getBardExpertiseSelections,
    getBardLoreBonusProficiencySelections,
    getBardMagicalDiscoveriesSpellSelections,
    getBardPrimalLoreCantripSelection,
    getBardPrimalLoreSkillOptionsForCharacter,
    getBardPrimalLoreSkillSelection,
    getClericDivineOrderChoiceForCharacter,
    getDamageTypeChoiceContent,
    getDruidCircleOfTheLandChoiceForCharacter,
    getDruidPrimalOrderChoiceForCharacter,
    getFighterBanneretKnightlyEnvoyLanguageSelection,
    getFighterBanneretKnightlyEnvoySkillSelection,
    getKnowledgeDomainBlessingsSkillSelections,
    getKnowledgeDomainBlessingsToolSelection,
    getKnowledgeDomainUnfetteredMindSavingThrowSelection,
    getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection,
    getProficiencyLabel,
    getRangerDeftExplorerExpertiseSelection,
    getRangerDeftExplorerLanguageSelections,
    getRangerFeyWandererGiftSelection,
    getRangerGloomStalkerIronMindSavingThrowSelection,
    getRangerHunterDefensiveTacticsChoice,
    getRangerHunterPreyChoice,
    getRangerLevel9ExpertiseSelections,
    getRangerOtherworldlyGlamourSkillSelection,
    getRogueExpertiseSelections,
    getRogueScionOfTheThreeDreadAllegianceChoice,
    getRogueThievesCantLanguageSelection,
    getSorcererDraconicElementalAffinityDamageTypeSelection,
    getSorcererMetamagicSelections,
    getSorcererMetamagicStartIndex,
    getWarlockFiendishResilienceDamageTypeSelection,
    getWarlockMysticArcanumSelection,
    getWarlockMysticArcanumSpellLevel,
    getWeaponMasterySelectionCountForCharacter,
    getWeaponMasterySelections,
    getWeaponProficiencyLabel,
    getWizardScholarSelection,
    getWizardSignatureSpellSelections,
    getWizardSpellMasterySelection,
    isEldritchInvocationInputRequired,
    isFeatChoiceFeature,
    isKnowledgeDomainUnfetteredMindLocked,
    isRangerGloomStalkerIronMindLocked,
    isSpellcastingFeatureInputRequired,
    isUnlocked,
    isWarlockFiendishResilienceInputRequired,
    isWizardSavantFeature,
    learnedInvocationOptions,
    linkedFeat,
    linkedFeatDefinition,
    linkedFeatSummary,
    eldritchInvocationInputStatus,
    onOpenDivinityReference,
    onOpenEldritchInvocationEditor,
    onOpenFeatEditorForFeature,
    onOpenFeatReference,
    onOpenInvocationReference,
    onOpenKeyword,
    onOpenSpellReference,
    onPersistCharacter,
    paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions,
    rangerFeyWandererGiftOptions,
    rangerOtherworldlyGlamourSkillOptions,
    recomputeCharacterFeatureProficiencies,
    renderTrackingButton,
    setIsWildShapeModalOpen,
    setSelectedWildShapeMonster,
    shared,
    skillsOptions,
    sorcererDraconicElementalAffinityDamageTypeOptions,
    spellSelectionInputStatus,
    styles,
    updateBarbarianPrimalKnowledgeSelection,
    updateBarbarianWildHeartAspectChoice,
    updateArtificerReplicateMagicItemPlanSelection,
    updateBardExpertiseSelection,
    updateBardLoreBonusProficiencySelection,
    updateBardMagicalDiscoveriesSpellSelection,
    updateBardPrimalLoreCantripSelection,
    updateBardPrimalLoreSkillSelection,
    updateClericBlessedStrikesChoice,
    updateClericDivineOrderChoice,
    updateDruidCircleOfTheLandChoice,
    updateDruidElementalFuryChoice,
    updateDruidPrimalOrderChoice,
    updateFighterBanneretKnightlyEnvoyLanguageSelection,
    updateFighterBanneretKnightlyEnvoySkillSelection,
    updateKnowledgeDomainBlessingsSkillSelection,
    updateKnowledgeDomainBlessingsToolSelection,
    updateKnowledgeDomainUnfetteredMindSavingThrowSelection,
    updatePaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection,
    updateRangerDeftExplorerExpertiseSelection,
    updateRangerDeftExplorerLanguageSelection,
    updateRangerFeyWandererGiftSelection,
    updateRangerGloomStalkerIronMindSavingThrowSelection,
    updateRangerHunterDefensiveTacticsChoice,
    updateRangerHunterPreyChoice,
    updateRangerLevel9ExpertiseSelection,
    updateRangerOtherworldlyGlamourSkillSelection,
    updateRogueExpertiseSelection,
    updateRogueScionOfTheThreeDreadAllegianceChoice,
    updateRogueThievesCantLanguageSelection,
    updateSorcererDraconicElementalAffinityDamageTypeSelection,
    updateSorcererMetamagicSelection,
    updateWarlockFiendishResilienceDamageTypeSelection,
    updateWarlockMysticArcanumSelection,
    updateWeaponMasterySelection,
    updateWizardScholarSelection,
    updateWizardSignatureSpellSelection,
    updateWizardSpellMasterySelection,
    warlockFiendPatronFiendishResilienceDamageTypeOptions,
    wizardScholarSkillOptions
  } = context;

  return featureDetails.description.length > 0 ? (
    <>
      {featureRow.feature === CLASS_FEATURE.REPLICATE_MAGIC_ITEM &&
      character.className === "Artificer" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <ArtificerReplicateMagicItemPlanSelection
            groups={getArtificerReplicateMagicItemAvailablePlanGroups()}
            isUnlocked={isUnlocked}
            plansKnown={getArtificerReplicateMagicItemPlansKnown()}
            selections={getArtificerReplicateMagicItemPlanSelections()}
            onChange={updateArtificerReplicateMagicItemPlanSelection}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.DIVINE_ORDER ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 1)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <FeatureChoiceOptions
            featureKey={featureRow.key}
            groupName={`divine-order-${character.id}`}
            isUnlocked={isUnlocked}
            selectedValue={getClericDivineOrderChoiceForCharacter(character)}
            options={[
              {
                key: "protector",
                value: "protector",
                content: featureDetails.description[1] ?? ""
              },
              {
                key: "thaumaturge",
                value: "thaumaturge",
                content: featureDetails.description[2] ?? ""
              }
            ]}
            onChange={updateClericDivineOrderChoice}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.BLESSED_STRIKES ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 1)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <FeatureChoiceOptions
            featureKey={featureRow.key}
            groupName={`blessed-strikes-${character.id}`}
            isUnlocked={isUnlocked}
            selectedValue={blessedStrikesChoice}
            options={[
              {
                key: "blessed-strike",
                value: "blessed-strike",
                content: featureDetails.description[1] ?? ""
              },
              {
                key: "potent-spellcasting",
                value: "potent-spellcasting",
                content: featureDetails.description[2] ?? ""
              }
            ]}
            onChange={updateClericBlessedStrikesChoice}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.CIRCLE_OF_THE_LAND_SPELLS &&
        character.className === "Druid" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 1)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <FeatureChoiceOptions
            featureKey={featureRow.key}
            groupName={`circle-of-the-land-${character.id}`}
            isUnlocked={isUnlocked}
            selectedValue={getDruidCircleOfTheLandChoiceForCharacter(character)}
            options={[
              {
                key: "arid",
                value: "arid",
                content: featureDetails.description[1] ?? ""
              },
              {
                key: "polar",
                value: "polar",
                content: featureDetails.description[2] ?? ""
              },
              {
                key: "temperate",
                value: "temperate",
                content: featureDetails.description[3] ?? ""
              },
              {
                key: "tropical",
                value: "tropical",
                content: featureDetails.description[4] ?? ""
              }
            ]}
            onChange={updateDruidCircleOfTheLandChoice}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.ELEMENTAL_FURY && character.className === "Druid" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 1)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <FeatureChoiceOptions
            featureKey={featureRow.key}
            groupName={`elemental-fury-${character.id}`}
            isUnlocked={isUnlocked}
            selectedValue={druidElementalFuryChoice}
            options={[
              {
                key: "potent-spellcasting",
                value: "potent-spellcasting",
                content: featureDetails.description[1] ?? ""
              },
              {
                key: "primal-strike",
                value: "primal-strike",
                content: featureDetails.description[2] ?? ""
              }
            ]}
            onChange={updateDruidElementalFuryChoice}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.ELEMENTAL_AFFINITY &&
        character.className === "Sorcerer" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 2)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <FeatureChoiceOptions
            featureKey={featureRow.key}
            groupName={`elemental-affinity-${character.id}`}
            isUnlocked={isUnlocked}
            selectedValue={getSorcererDraconicElementalAffinityDamageTypeSelection()}
            options={sorcererDraconicElementalAffinityDamageTypeOptions.map((damageType) => ({
              key: damageType,
              value: damageType,
              content: getDamageTypeChoiceContent(damageType)
            }))}
            onChange={updateSorcererDraconicElementalAffinityDamageTypeSelection}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(2)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.FIENDISH_RESILIENCE &&
        character.className === "Warlock" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 1)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Resistance</span>
              <SelectInput
                value={getWarlockFiendishResilienceDamageTypeSelection() ?? ""}
                disabled={!isUnlocked}
                invalid={isUnlocked && isWarlockFiendishResilienceInputRequired()}
                onChange={(event) => {
                  const nextDamageType = event.target.value as DAMAGE_TYPE;

                  if (nextDamageType) {
                    updateWarlockFiendishResilienceDamageTypeSelection(nextDamageType);
                  }
                }}
              >
                <option value="">Select a damage type</option>
                {warlockFiendPatronFiendishResilienceDamageTypeOptions.map((damageType) => (
                  <option key={`${featureRow.key}-${damageType}`} value={damageType}>
                    {formatCodexLabel(damageType)}
                  </option>
                ))}
              </SelectInput>
            </label>
          </div>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(1)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.ELDRITCH_INVOCATIONS &&
        character.className === "Warlock" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureChoiceRow}>
            <div className={styles.featureChoiceSummary}>
              <span className={styles.featureChoiceLabel}>Selected invocations</span>
              <span className={styles.featureChoiceValueText}>
                {`${eldritchInvocationInputStatus.selectedCount}/${eldritchInvocationInputStatus.limit} selected`}
              </span>
            </div>
            <button
              type="button"
              className={shared.editButton}
              disabled={!isUnlocked}
              onClick={onOpenEldritchInvocationEditor}
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>
          <EldritchInvocationList
            invocations={learnedInvocationOptions}
            onOpenInvocationReference={onOpenInvocationReference}
            renderTrackingButton={renderTrackingButton}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.PRIMAL_ORDER ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 1)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <FeatureChoiceOptions
            featureKey={featureRow.key}
            groupName={`primal-order-${character.id}`}
            isUnlocked={isUnlocked}
            selectedValue={getDruidPrimalOrderChoiceForCharacter(character)}
            options={[
              {
                key: "magician",
                value: "magician",
                content: featureDetails.description[1] ?? ""
              },
              {
                key: "warden",
                value: "warden",
                content: featureDetails.description[2] ?? ""
              }
            ]}
            onChange={updateDruidPrimalOrderChoice}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.WILD_SHAPE && character.className === "Druid" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureChoiceRow}>
            <div className={styles.featureChoiceSummary}>
              <span className={styles.featureChoiceLabel}>Beast shapes</span>
              <span className={styles.featureChoiceValueText}>
                {druidWildShapeRules
                  ? `${druidWildShapeKnownForms.length} / ${druidWildShapeRules.knownForms} selected`
                  : "Unavailable"}
              </span>
            </div>
            <button
              type="button"
              className={shared.editButton}
              disabled={!isUnlocked}
              onClick={() => setIsWildShapeModalOpen(true)}
            >
              {druidWildShapeKnownForms.length > 0 ? <Pencil size={16} /> : <Plus size={16} />}
              {druidWildShapeKnownForms.length > 0 ? "Edit" : "Choose"}
            </button>
          </div>
          {druidWildShapeKnownForms.length > 0 ? (
            <div className={styles.wildShapeMonsterList}>
              {druidWildShapeKnownForms.map((monster) => (
                <button
                  key={`${featureRow.key}-${monster.slug}`}
                  type="button"
                  className={styles.wildShapeMonsterRow}
                  onClick={() => setSelectedWildShapeMonster(monster)}
                >
                  <span className={styles.wildShapeMonsterName}>{monster.name}</span>
                  <span className={styles.wildShapeMonsterMeta}>
                    {[monster.type, monster.document__slug].filter(Boolean).join(", ")}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.emptyFeatureText}>No beast shapes selected yet.</p>
          )}
        </>
      ) : featureRow.feature === CLASS_FEATURE.MANEUVER_OPTIONS &&
        character.className === "Fighter" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 1)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <BattleMasterManeuverSelection
            character={character}
            featureKey={featureRow.key}
            isUnlocked={isUnlocked}
            onPersistCharacter={onPersistCharacter}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.METAMAGIC && character.className === "Sorcerer" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            {[0, 1].map((slotIndex) => {
              const currentIndex = getSorcererMetamagicStartIndex(featureRow.level) + slotIndex;
              const currentValue = getSorcererMetamagicSelections()[currentIndex] ?? "";
              const availableOptions = getAvailableSorcererMetamagicOptions(
                featureRow.level,
                slotIndex
              );

              return (
                <label
                  key={`${featureRow.key}-metamagic-slot-${slotIndex}`}
                  className={clsx(
                    styles.featureSelectionField,
                    !isUnlocked && styles.featureOptionRowDisabled
                  )}
                >
                  <span className={styles.featureSelectionLabel}>Metamagic {currentIndex + 1}</span>
                  <SelectInput
                    value={currentValue}
                    disabled={!isUnlocked}
                    onChange={(event) =>
                      updateSorcererMetamagicSelection(
                        featureRow.level,
                        slotIndex,
                        event.target.value
                      )
                    }
                  >
                    <option value="">Select an option</option>
                    {availableOptions.map((definition) => (
                      <option key={`${featureRow.key}-${definition.key}`} value={definition.key}>
                        {definition.name}
                      </option>
                    ))}
                  </SelectInput>
                </label>
              );
            })}
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.DEFT_EXPLORER ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Expertise</span>
              <SelectInput
                value={getRangerDeftExplorerExpertiseSelection() ?? ""}
                disabled={!isUnlocked}
                onChange={(event) => updateRangerDeftExplorerExpertiseSelection(event.target.value)}
              >
                <option value="">Select a skill</option>
                {buildSkillSelectOptions(
                  skillsOptions,
                  getAvailableRangerDeftExplorerSkills(),
                  getRangerDeftExplorerExpertiseSelection()
                ).map((option) => (
                  <option
                    key={`${featureRow.key}-${option.skill}`}
                    value={option.skill}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
            {[0, 1].map((slotIndex) => {
              const currentValue = getRangerDeftExplorerLanguageSelections()[slotIndex] ?? "";
              const availableLanguages = getAvailableRangerDeftExplorerLanguages(slotIndex);

              if (
                currentValue &&
                !availableLanguages.includes(currentValue as LANGUAGE_PROFICIENCY)
              ) {
                availableLanguages.unshift(currentValue as LANGUAGE_PROFICIENCY);
              }

              return (
                <label
                  key={`${featureRow.key}-language-slot-${slotIndex}`}
                  className={clsx(
                    styles.featureSelectionField,
                    !isUnlocked && styles.featureOptionRowDisabled
                  )}
                >
                  <span className={styles.featureSelectionLabel}>Language {slotIndex + 1}</span>
                  <SelectInput
                    value={currentValue}
                    disabled={!isUnlocked}
                    onChange={(event) =>
                      updateRangerDeftExplorerLanguageSelection(slotIndex, event.target.value)
                    }
                  >
                    <option value="">Select a language</option>
                    {availableLanguages.map((proficiency) => (
                      <option
                        key={`${featureRow.key}-${slotIndex}-${proficiency}`}
                        value={proficiency}
                      >
                        {getProficiencyLabel(proficiency)}
                      </option>
                    ))}
                  </SelectInput>
                </label>
              );
            })}
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.HUNTERS_PREY && character.className === "Ranger" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 1)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <FeatureChoiceOptions
            featureKey={featureRow.key}
            groupName={`hunters-prey-${character.id}`}
            isUnlocked={isUnlocked}
            selectedValue={getRangerHunterPreyChoice()}
            options={[
              {
                key: "colossus-slayer",
                value: "colossus-slayer",
                content: featureDetails.description[1] ?? ""
              },
              {
                key: "horde-breaker",
                value: "horde-breaker",
                content: featureDetails.description[2] ?? ""
              }
            ]}
            onChange={updateRangerHunterPreyChoice}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.DEFENSIVE_TACTICS &&
        character.className === "Ranger" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 1)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <FeatureChoiceOptions
            featureKey={featureRow.key}
            groupName={`defensive-tactics-${character.id}`}
            isUnlocked={isUnlocked}
            selectedValue={getRangerHunterDefensiveTacticsChoice()}
            options={[
              {
                key: "escape-the-horde",
                value: "escape-the-horde",
                content: featureDetails.description[1] ?? ""
              },
              {
                key: "multiattack-defense",
                value: "multiattack-defense",
                content: featureDetails.description[2] ?? ""
              }
            ]}
            onChange={updateRangerHunterDefensiveTacticsChoice}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.FEY_WANDERER_SPELLS &&
        character.className === "Ranger" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 8)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <FeatureChoiceOptions
            featureKey={featureRow.key}
            groupName={`fey-wanderer-gift-${character.id}`}
            isUnlocked={isUnlocked}
            selectedValue={getRangerFeyWandererGiftSelection()}
            options={rangerFeyWandererGiftOptions}
            onChange={updateRangerFeyWandererGiftSelection}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.OTHERWORLDLY_GLAMOUR &&
        character.className === "Ranger" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          {getAvailableRangerOtherworldlyGlamourSkills().length > 0 ? (
            <div className={styles.featureSelectionGrid}>
              <label
                className={clsx(
                  styles.featureSelectionField,
                  !isUnlocked && styles.featureOptionRowDisabled
                )}
              >
                <span className={styles.featureSelectionLabel}>Bonus Skill</span>
                <SelectInput
                  value={getRangerOtherworldlyGlamourSkillSelection() ?? ""}
                  disabled={!isUnlocked}
                  onChange={(event) =>
                    updateRangerOtherworldlyGlamourSkillSelection(event.target.value)
                  }
                >
                  <option value="">Select a skill</option>
                  {buildSkillSelectOptions(
                    rangerOtherworldlyGlamourSkillOptions.map((option) => option.value),
                    getAvailableRangerOtherworldlyGlamourSkills(),
                    getRangerOtherworldlyGlamourSkillSelection()
                  ).map((option) => (
                    <option
                      key={`${featureRow.key}-${option.skill}`}
                      value={option.skill}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </option>
                  ))}
                </SelectInput>
              </label>
            </div>
          ) : null}
        </>
      ) : isWizardSavantFeature(featureRow.feature) && character.className === "Wizard" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <WizardSavantFeatureFields
            character={character}
            feature={featureRow.feature}
            featureKey={featureRow.key}
            isUnlocked={isUnlocked}
            onPersistCharacter={onPersistCharacter}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.SCHOLAR && character.className === "Wizard" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Scholar Skill</span>
              <SelectInput
                value={getWizardScholarSelection() ?? ""}
                disabled={!isUnlocked}
                onChange={(event) => updateWizardScholarSelection(event.target.value)}
              >
                <option value="">Select a skill</option>
                {buildSkillSelectOptions(
                  wizardScholarSkillOptions,
                  getAvailableWizardScholarSkills(),
                  getWizardScholarSelection()
                ).map((option) => (
                  <option
                    key={`${featureRow.key}-${option.skill}`}
                    value={option.skill}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.TRAINING_IN_WAR_AND_SONG &&
        character.className === "Wizard" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <WizardBladesingerTrainingInWarAndSongFields
            character={character}
            featureKey={featureRow.key}
            isUnlocked={isUnlocked}
            onPersistCharacter={onPersistCharacter}
            recomputeCharacterFeatureProficiencies={recomputeCharacterFeatureProficiencies}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.KNIGHTLY_ENVOY &&
        character.className === "Fighter" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Bonus Language</span>
              <SelectInput
                value={getFighterBanneretKnightlyEnvoyLanguageSelection() ?? ""}
                disabled={!isUnlocked}
                onChange={(event) =>
                  updateFighterBanneretKnightlyEnvoyLanguageSelection(event.target.value)
                }
              >
                <option value="">Select a language</option>
                {getAvailableFighterBanneretKnightlyEnvoyLanguages().map((proficiency) => (
                  <option
                    key={`${featureRow.key}-banneret-language-${proficiency}`}
                    value={proficiency}
                  >
                    {getProficiencyLabel(proficiency)}
                  </option>
                ))}
              </SelectInput>
            </label>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Bonus Skill</span>
              <SelectInput
                value={getFighterBanneretKnightlyEnvoySkillSelection() ?? ""}
                disabled={!isUnlocked}
                onChange={(event) =>
                  updateFighterBanneretKnightlyEnvoySkillSelection(event.target.value)
                }
              >
                <option value="">Select a skill</option>
                {buildSkillSelectOptions(
                  fighterBanneretKnightlyEnvoySkillOptions,
                  getAvailableFighterBanneretKnightlyEnvoySkills(),
                  getFighterBanneretKnightlyEnvoySkillSelection()
                ).map((option) => (
                  <option
                    key={`${featureRow.key}-banneret-skill-${option.skill}`}
                    value={option.skill}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.GENIES_SPLENDOR &&
        character.className === "Paladin" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Bonus Skill</span>
              <SelectInput
                value={getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection() ?? ""}
                disabled={!isUnlocked}
                onChange={(event) =>
                  updatePaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(event.target.value)
                }
              >
                <option value="">Select a skill</option>
                {buildSkillSelectOptions(
                  paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions,
                  getAvailablePaladinOathOfTheNobleGeniesGeniesSplendorSkills(),
                  getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection()
                ).map((option) => (
                  <option
                    key={`${featureRow.key}-noble-genies-skill-${option.skill}`}
                    value={option.skill}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.PRIMAL_KNOWLEDGE &&
        character.className === "Barbarian" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>New Skill</span>
              <SelectInput
                value={getBarbarianPrimalKnowledgeSelection() ?? ""}
                disabled={!isUnlocked}
                onChange={(event) => updateBarbarianPrimalKnowledgeSelection(event.target.value)}
              >
                <option value="">Select a skill</option>
                {getBarbarianPrimalKnowledgeOptions().map((option) => (
                  <option
                    key={`${featureRow.key}-${option.skill}`}
                    value={option.skill}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.ASPECT_OF_THE_WILDS &&
        character.className === "Barbarian" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 1)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <FeatureChoiceOptions
            featureKey={featureRow.key}
            groupName={`aspect-of-the-wilds-${character.id}`}
            isUnlocked={isUnlocked}
            selectedValue={getBarbarianWildHeartAspectChoiceForCharacter(character)}
            options={[
              {
                key: "owl",
                value: "owl",
                content: featureDetails.description[1] ?? ""
              },
              {
                key: "panther",
                value: "panther",
                content: featureDetails.description[2] ?? ""
              },
              {
                key: "salmon",
                value: "salmon",
                content: featureDetails.description[3] ?? ""
              }
            ]}
            onChange={updateBarbarianWildHeartAspectChoice}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.SPELL_MASTERY && character.className === "Wizard" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Level 1 Spell</span>
              <SelectInput
                value={getWizardSpellMasterySelection(1)}
                disabled={!isUnlocked}
                onChange={(event) => updateWizardSpellMasterySelection(1, event.target.value)}
              >
                <option value="">Select a spell from your spellbook</option>
                {getAvailableWizardSpellMasterySpells(1).map((spell) => (
                  <option key={`${featureRow.key}-spell-mastery-1-${spell.id}`} value={spell.id}>
                    {spell.name}
                  </option>
                ))}
              </SelectInput>
            </label>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Level 2 Spell</span>
              <SelectInput
                value={getWizardSpellMasterySelection(2)}
                disabled={!isUnlocked}
                onChange={(event) => updateWizardSpellMasterySelection(2, event.target.value)}
              >
                <option value="">Select a spell from your spellbook</option>
                {getAvailableWizardSpellMasterySpells(2).map((spell) => (
                  <option key={`${featureRow.key}-spell-mastery-2-${spell.id}`} value={spell.id}>
                    {spell.name}
                  </option>
                ))}
              </SelectInput>
            </label>
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.SIGNATURE_SPELLS &&
        character.className === "Wizard" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            {[0, 1].map((slotIndex) => {
              const currentValue = getWizardSignatureSpellSelections()[slotIndex] ?? "";
              const availableSpells = getAvailableWizardSignatureSpells(slotIndex);

              return (
                <label
                  key={`${featureRow.key}-signature-slot-${slotIndex}`}
                  className={clsx(
                    styles.featureSelectionField,
                    !isUnlocked && styles.featureOptionRowDisabled
                  )}
                >
                  <span className={styles.featureSelectionLabel}>
                    Signature Spell {slotIndex + 1}
                  </span>
                  <SelectInput
                    value={currentValue}
                    disabled={!isUnlocked}
                    onChange={(event) =>
                      updateWizardSignatureSpellSelection(slotIndex, event.target.value)
                    }
                  >
                    <option value="">Select a level 3 spell from your spellbook</option>
                    {availableSpells.map((spell) => (
                      <option key={`${featureRow.key}-signature-${spell.id}`} value={spell.id}>
                        {spell.name}
                      </option>
                    ))}
                  </SelectInput>
                </label>
              );
            })}
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.BONUS_PROFICIENCIES &&
        character.className === "Bard" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            {[0, 1, 2].map((slotIndex) => {
              const currentValue = getBardLoreBonusProficiencySelections()[slotIndex] ?? "";
              const availableSkills = getAvailableBardLoreBonusProficiencySkills(slotIndex);

              return (
                <label
                  key={`${featureRow.key}-bonus-proficiency-slot-${slotIndex}`}
                  className={clsx(
                    styles.featureSelectionField,
                    !isUnlocked && styles.featureOptionRowDisabled
                  )}
                >
                  <span className={styles.featureSelectionLabel}>
                    Bonus Proficiency {slotIndex + 1}
                  </span>
                  <SelectInput
                    value={currentValue}
                    disabled={!isUnlocked}
                    onChange={(event) =>
                      updateBardLoreBonusProficiencySelection(slotIndex, event.target.value)
                    }
                  >
                    <option value="">Select a skill</option>
                    {buildSkillSelectOptions(
                      skillsOptions,
                      availableSkills,
                      currentValue.length > 0 ? (currentValue as SkillName) : null
                    ).map((option) => (
                      <option
                        key={`${featureRow.key}-bonus-proficiency-${option.skill}`}
                        value={option.skill}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </label>
              );
            })}
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.MAGICAL_DISCOVERIES &&
        character.className === "Bard" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            {[0, 1].map((slotIndex) => {
              const currentValue = getBardMagicalDiscoveriesSpellSelections()[slotIndex] ?? "";
              const availableSpells = getAvailableBardMagicalDiscoveriesSpells(slotIndex);

              return (
                <label
                  key={`${featureRow.key}-magical-discovery-slot-${slotIndex}`}
                  className={clsx(
                    styles.featureSelectionField,
                    !isUnlocked && styles.featureOptionRowDisabled
                  )}
                >
                  <span className={styles.featureSelectionLabel}>
                    Magical Discovery {slotIndex + 1}
                  </span>
                  <SelectInput
                    value={currentValue}
                    disabled={!isUnlocked}
                    onChange={(event) =>
                      updateBardMagicalDiscoveriesSpellSelection(slotIndex, event.target.value)
                    }
                  >
                    <option value="">Select a Cleric, Druid, or Wizard spell</option>
                    {availableSpells.map((spell) => (
                      <option
                        key={`${featureRow.key}-magical-discovery-${spell.id}`}
                        value={spell.id}
                      >
                        {spell.name}
                      </option>
                    ))}
                  </SelectInput>
                </label>
              );
            })}
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.PRIMAL_LORE && character.className === "Bard" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Primal Lore Cantrip</span>
              <SelectInput
                value={getBardPrimalLoreCantripSelection()}
                disabled={!isUnlocked}
                onChange={(event) => updateBardPrimalLoreCantripSelection(event.target.value)}
              >
                <option value="">Select a Druid cantrip</option>
                {getAvailableBardPrimalLoreCantrips().map((spell) => (
                  <option
                    key={`${featureRow.key}-primal-lore-cantrip-${spell.id}`}
                    value={spell.id}
                  >
                    {spell.name}
                  </option>
                ))}
              </SelectInput>
            </label>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Primal Lore Skill</span>
              <SelectInput
                value={getBardPrimalLoreSkillSelection() ?? ""}
                disabled={!isUnlocked}
                onChange={(event) => updateBardPrimalLoreSkillSelection(event.target.value)}
              >
                <option value="">Select a skill</option>
                {buildSkillSelectOptions(
                  getBardPrimalLoreSkillOptionsForCharacter(),
                  getAvailableBardPrimalLoreSkills(),
                  getBardPrimalLoreSkillSelection()
                ).map((option) => (
                  <option
                    key={`${featureRow.key}-primal-lore-skill-${option.skill}`}
                    value={option.skill}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.BLESSINGS_OF_KNOWLEDGE &&
        character.className === "Cleric" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Artisan&apos;s Tool</span>
              <SelectInput
                value={getKnowledgeDomainBlessingsToolSelection() ?? ""}
                disabled={!isUnlocked}
                onChange={(event) =>
                  updateKnowledgeDomainBlessingsToolSelection(event.target.value)
                }
              >
                <option value="">Select a tool</option>
                {buildToolSelectOptions(
                  artisanToolProficiencies,
                  getAvailableKnowledgeDomainBlessingsTools(),
                  getKnowledgeDomainBlessingsToolSelection()
                ).map((option) => (
                  <option
                    key={`${featureRow.key}-knowledge-tool-${option.tool}`}
                    value={option.tool}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
            {[0, 1].map((slotIndex) => {
              const currentValue = getKnowledgeDomainBlessingsSkillSelections()[slotIndex] ?? "";
              const availableSkills = getAvailableKnowledgeDomainBlessingsSkills(slotIndex);

              return (
                <label
                  key={`${featureRow.key}-knowledge-blessing-${slotIndex}`}
                  className={clsx(
                    styles.featureSelectionField,
                    !isUnlocked && styles.featureOptionRowDisabled
                  )}
                >
                  <span className={styles.featureSelectionLabel}>
                    Blessing Skill {slotIndex + 1}
                  </span>
                  <SelectInput
                    value={currentValue}
                    disabled={!isUnlocked}
                    onChange={(event) =>
                      updateKnowledgeDomainBlessingsSkillSelection(slotIndex, event.target.value)
                    }
                  >
                    <option value="">Select a skill</option>
                    {buildSkillSelectOptions(
                      [SKILL.ARCANA, SKILL.HISTORY, SKILL.NATURE, SKILL.RELIGION],
                      availableSkills,
                      currentValue.length > 0 ? (currentValue as SkillName) : null
                    ).map((option) => (
                      <option
                        key={`${featureRow.key}-knowledge-skill-${option.skill}`}
                        value={option.skill}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </label>
              );
            })}
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.UNFETTERED_MIND &&
        character.className === "Cleric" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Unfettered Mind Save</span>
              <SelectInput
                value={getKnowledgeDomainUnfetteredMindSavingThrowSelection() ?? ""}
                disabled={!isUnlocked || isKnowledgeDomainUnfetteredMindLocked()}
                onChange={(event) =>
                  updateKnowledgeDomainUnfetteredMindSavingThrowSelection(event.target.value)
                }
              >
                <option value="">Select a saving throw</option>
                {getAvailableKnowledgeDomainUnfetteredMindSavingThrows().map((proficiency) => (
                  <option
                    key={`${featureRow.key}-unfettered-mind-${proficiency}`}
                    value={proficiency}
                  >
                    {getProficiencyLabel(proficiency)}
                  </option>
                ))}
              </SelectInput>
            </label>
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.IRON_MIND && character.className === "Ranger" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Iron Mind Save</span>
              <SelectInput
                value={getRangerGloomStalkerIronMindSavingThrowSelection() ?? ""}
                disabled={!isUnlocked || isRangerGloomStalkerIronMindLocked()}
                onChange={(event) =>
                  updateRangerGloomStalkerIronMindSavingThrowSelection(event.target.value)
                }
              >
                <option value="">Select a saving throw</option>
                {getAvailableRangerGloomStalkerIronMindSavingThrows().map((proficiency) => (
                  <option key={`${featureRow.key}-iron-mind-${proficiency}`} value={proficiency}>
                    {getProficiencyLabel(proficiency)}
                  </option>
                ))}
              </SelectInput>
            </label>
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.EXPERTISE ? (
        character.className === "Ranger" ? (
          <>
            <FeatureDescriptionLines
              featureKey={featureRow.key}
              lines={featureDetails.description}
              onOpenKeyword={onOpenKeyword}
              onOpenFeatReference={onOpenFeatReference}
              onOpenSpellReference={onOpenSpellReference}
              onOpenDivinityReference={onOpenDivinityReference}
            />
            <div className={styles.featureSelectionGrid}>
              {[0, 1].map((slotIndex) => {
                const currentValue = getRangerLevel9ExpertiseSelections()[slotIndex] ?? "";
                const availableSkills = getAvailableRangerLevel9ExpertiseSkills(slotIndex);

                return (
                  <label
                    key={`${featureRow.key}-expertise-slot-${slotIndex}`}
                    className={clsx(
                      styles.featureSelectionField,
                      !isUnlocked && styles.featureOptionRowDisabled
                    )}
                  >
                    <span className={styles.featureSelectionLabel}>Expertise {slotIndex + 1}</span>
                    <SelectInput
                      value={currentValue}
                      disabled={!isUnlocked}
                      onChange={(event) =>
                        updateRangerLevel9ExpertiseSelection(slotIndex, event.target.value)
                      }
                    >
                      <option value="">Select a skill</option>
                      {buildSkillSelectOptions(
                        skillsOptions,
                        availableSkills,
                        currentValue.length > 0 ? (currentValue as SkillName) : null
                      ).map((option) => (
                        <option
                          key={`${featureRow.key}-${option.skill}`}
                          value={option.skill}
                          disabled={option.disabled}
                        >
                          {option.label}
                        </option>
                      ))}
                    </SelectInput>
                  </label>
                );
              })}
            </div>
          </>
        ) : character.className === "Rogue" ? (
          <>
            <FeatureDescriptionLines
              featureKey={featureRow.key}
              lines={
                featureRow.level >= 6
                  ? featureDetails.description.slice(1, 2)
                  : featureDetails.description.slice(0, 1)
              }
              onOpenKeyword={onOpenKeyword}
              onOpenFeatReference={onOpenFeatReference}
              onOpenSpellReference={onOpenSpellReference}
              onOpenDivinityReference={onOpenDivinityReference}
            />
            <div className={styles.featureSelectionGrid}>
              {[0, 1].map((slotIndex) => {
                const currentValue = getRogueExpertiseSelections(featureRow.level)[slotIndex] ?? "";
                const availableSkills = getAvailableRogueExpertiseSkills(
                  featureRow.level,
                  slotIndex
                );

                return (
                  <label
                    key={`${featureRow.key}-expertise-slot-${slotIndex}`}
                    className={clsx(
                      styles.featureSelectionField,
                      !isUnlocked && styles.featureOptionRowDisabled
                    )}
                  >
                    <span className={styles.featureSelectionLabel}>Expertise {slotIndex + 1}</span>
                    <SelectInput
                      value={currentValue}
                      disabled={!isUnlocked}
                      onChange={(event) =>
                        updateRogueExpertiseSelection(
                          featureRow.level,
                          slotIndex,
                          event.target.value
                        )
                      }
                    >
                      <option value="">Select a skill</option>
                      {buildSkillSelectOptions(
                        skillsOptions,
                        availableSkills,
                        currentValue.length > 0 ? (currentValue as SkillName) : null
                      ).map((option) => (
                        <option
                          key={`${featureRow.key}-${option.skill}`}
                          value={option.skill}
                          disabled={option.disabled}
                        >
                          {option.label}
                        </option>
                      ))}
                    </SelectInput>
                  </label>
                );
              })}
            </div>
          </>
        ) : character.className === "Bard" ? (
          <>
            <FeatureDescriptionLines
              featureKey={featureRow.key}
              lines={
                featureRow.level >= 9
                  ? featureDetails.description.slice(1, 2)
                  : featureDetails.description.slice(0, 1)
              }
              onOpenKeyword={onOpenKeyword}
              onOpenFeatReference={onOpenFeatReference}
              onOpenSpellReference={onOpenSpellReference}
              onOpenDivinityReference={onOpenDivinityReference}
            />
            <div className={styles.featureSelectionGrid}>
              {[0, 1].map((slotIndex) => {
                const currentValue = getBardExpertiseSelections(featureRow.level)[slotIndex] ?? "";
                const availableSkills = getAvailableBardExpertiseSkills(
                  featureRow.level,
                  slotIndex
                );

                return (
                  <label
                    key={`${featureRow.key}-expertise-slot-${slotIndex}`}
                    className={clsx(
                      styles.featureSelectionField,
                      !isUnlocked && styles.featureOptionRowDisabled
                    )}
                  >
                    <span className={styles.featureSelectionLabel}>Expertise {slotIndex + 1}</span>
                    <SelectInput
                      value={currentValue}
                      disabled={!isUnlocked}
                      onChange={(event) =>
                        updateBardExpertiseSelection(
                          featureRow.level,
                          slotIndex,
                          event.target.value
                        )
                      }
                    >
                      <option value="">Select a skill</option>
                      {buildSkillSelectOptions(
                        skillsOptions,
                        availableSkills,
                        currentValue.length > 0 ? (currentValue as SkillName) : null
                      ).map((option) => (
                        <option
                          key={`${featureRow.key}-${option.skill}`}
                          value={option.skill}
                          disabled={option.disabled}
                        >
                          {option.label}
                        </option>
                      ))}
                    </SelectInput>
                  </label>
                );
              })}
            </div>
          </>
        ) : (
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        )
      ) : featureRow.feature === CLASS_FEATURE.DREAD_ALLEGIANCE &&
        character.className === "Rogue" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description.slice(0, 1)}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <FeatureChoiceOptions
            featureKey={featureRow.key}
            groupName={`dread-allegiance-${character.id}`}
            isUnlocked={isUnlocked}
            selectedValue={getRogueScionOfTheThreeDreadAllegianceChoice()}
            options={[
              {
                key: "bane",
                value: "bane",
                content: featureDetails.description[1] ?? ""
              },
              {
                key: "bhaal",
                value: "bhaal",
                content: featureDetails.description[2] ?? ""
              },
              {
                key: "myrkul",
                value: "myrkul",
                content: featureDetails.description[3] ?? ""
              }
            ]}
            onChange={updateRogueScionOfTheThreeDreadAllegianceChoice}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
        </>
      ) : featureRow.feature === CLASS_FEATURE.THIEVES_CANT && character.className === "Rogue" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            <label
              className={clsx(
                styles.featureSelectionField,
                !isUnlocked && styles.featureOptionRowDisabled
              )}
            >
              <span className={styles.featureSelectionLabel}>Bonus Language</span>
              <SelectInput
                value={getRogueThievesCantLanguageSelection() ?? ""}
                disabled={!isUnlocked}
                onChange={(event) => updateRogueThievesCantLanguageSelection(event.target.value)}
              >
                <option value="">Select a language</option>
                {getAvailableRogueThievesCantLanguages().map((proficiency) => (
                  <option key={`${featureRow.key}-${proficiency}`} value={proficiency}>
                    {getProficiencyLabel(proficiency)}
                  </option>
                ))}
              </SelectInput>
            </label>
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.WEAPON_MASTERY ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          <div className={styles.featureSelectionGrid}>
            {Array.from(
              { length: getWeaponMasterySelectionCountForCharacter(character) },
              (_, slotIndex) => {
                const currentValue = getWeaponMasterySelections()[slotIndex] ?? "";
                const availableOptions = getAvailableWeaponMasteryOptions(slotIndex);

                return (
                  <label
                    key={`${featureRow.key}-weapon-mastery-slot-${slotIndex}`}
                    className={clsx(
                      styles.featureSelectionField,
                      !isUnlocked && styles.featureOptionRowDisabled
                    )}
                  >
                    <span className={styles.featureSelectionLabel}>
                      Weapon Mastery {slotIndex + 1}
                    </span>
                    <SelectInput
                      value={currentValue}
                      disabled={!isUnlocked}
                      onChange={(event) =>
                        updateWeaponMasterySelection(slotIndex, event.target.value)
                      }
                    >
                      <option value="">Select a weapon</option>
                      {availableOptions.map((proficiency) => (
                        <option
                          key={`${featureRow.key}-weapon-mastery-${proficiency}`}
                          value={proficiency}
                        >
                          {getWeaponProficiencyLabel(proficiency)}
                        </option>
                      ))}
                    </SelectInput>
                  </label>
                );
              }
            )}
          </div>
        </>
      ) : featureRow.feature === CLASS_FEATURE.MYSTIC_ARCANUM &&
        character.className === "Warlock" ? (
        <>
          <FeatureDescriptionLines
            featureKey={featureRow.key}
            lines={featureDetails.description}
            onOpenKeyword={onOpenKeyword}
            onOpenFeatReference={onOpenFeatReference}
            onOpenSpellReference={onOpenSpellReference}
            onOpenDivinityReference={onOpenDivinityReference}
          />
          {getWarlockMysticArcanumSpellLevel(featureRow.level) ? (
            <div className={styles.featureSelectionGrid}>
              <label
                className={clsx(
                  styles.featureSelectionField,
                  !isUnlocked && styles.featureOptionRowDisabled
                )}
              >
                <span className={styles.featureSelectionLabel}>
                  {`${getWarlockMysticArcanumSpellLevel(featureRow.level)}th-level Arcanum`}
                </span>
                <SelectInput
                  value={getWarlockMysticArcanumSelection(featureRow.level)}
                  disabled={!isUnlocked}
                  onChange={(event) =>
                    updateWarlockMysticArcanumSelection(featureRow.level, event.target.value)
                  }
                >
                  <option value="">Select a spell</option>
                  {getAvailableWarlockMysticArcanumSpells(featureRow.level).map((spell) => (
                    <option key={`${featureRow.key}-${spell.id}`} value={spell.id}>
                      {spell.name}
                    </option>
                  ))}
                </SelectInput>
              </label>
            </div>
          ) : null}
        </>
      ) : (
        <FeatureDescriptionLines
          featureKey={featureRow.key}
          lines={featureDetails.description}
          onOpenKeyword={onOpenKeyword}
          onOpenFeatReference={onOpenFeatReference}
          onOpenSpellReference={onOpenSpellReference}
          onOpenDivinityReference={onOpenDivinityReference}
        />
      )}

      {isSpellcastingFeatureInputRequired && spellSelectionInputStatus.message ? (
        <p className={styles.featureInputRequiredDescription}>
          {spellSelectionInputStatus.message}
        </p>
      ) : null}

      {isEldritchInvocationInputRequired && eldritchInvocationInputStatus.message ? (
        <p className={styles.featureInputRequiredDescription}>
          {eldritchInvocationInputStatus.message}
        </p>
      ) : null}

      {isFeatChoiceFeature(featureRow.feature) ? (
        linkedFeat && linkedFeatDefinition ? (
          <div className={styles.featureChoiceRow}>
            <div className={styles.featureChoiceSummary}>
              <span className={styles.featureChoiceLabel}>Chosen feat</span>
              <button
                type="button"
                className={styles.featureChoiceValue}
                onClick={() => onOpenFeatReference(linkedFeat.feat, linkedFeat)}
              >
                {linkedFeatDefinition.label}
                {linkedFeatSummary ? ` · ${linkedFeatSummary}` : ""}
              </button>
            </div>
            <button
              type="button"
              className={shared.editButton}
              disabled={!isUnlocked}
              onClick={() => onOpenFeatEditorForFeature(featureRow.level, featureRow.feature)}
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>
        ) : (
          <div className={styles.featureChoiceRow}>
            <button
              type="button"
              className={shared.editButton}
              disabled={!isUnlocked}
              onClick={() => onOpenFeatEditorForFeature(featureRow.level, featureRow.feature)}
            >
              <Plus size={16} />
              Choose Feat
            </button>
          </div>
        )
      ) : null}
    </>
  ) : (
    <p className={styles.emptyFeatureText}>Details coming soon.</p>
  );
}
