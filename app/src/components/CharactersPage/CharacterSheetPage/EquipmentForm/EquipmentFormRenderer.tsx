/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
// @ts-nocheck

export function renderEquipmentForm(context: Record<string, any>) {
  const {
    ActionButton, CellContainer, CircleHelp, CurrencyInlineDisplay, CustomEquipmentEditor, DestructiveConfirmationModal, ENTRY_CATEGORIES, EquipmentContainerManageModal, EquipmentGuideModal, EquipmentInventoryItemDrawer, EquipmentItemBrowserModal, Hand, InlineToggleButton, InventoryTagPill, KeywordReferenceDrawer, MasterChestModal,
    Minus, NumberInput, OverlayBody, OverlayCloseButton, OverlayEyebrow, OverlayFooter, OverlayHeader, OverlayHeaderContent, OverlaySummary, OverlayTitle, Package, Plus, RarityPill, SheetModal, Shield, WeaponMasteryStatusLabel, X, activeCurrencyDefinition, activeCurrencyKey,
    adjustCurrencyBalance, canSpendCurrency, carriedWeight, carryingCapacity, className, containerManagementInventoryItems, closeAddModal, closeContainerManagement, closeCustomEquipmentModal, closeInventoryItemDrawer, closeLoadoutDrawer,
    clsx, currencyAmountDraft, currencyDefinitions, currencyPillSummary, customEditorMode, deleteCustomEquipment, editingInventoryStack, equipmentCharacter, equipmentRenderGroups, formatCodexLabel, formatCodexList,
    formatEquipmentWeight, formatInventoryStackName, formatOnHandLabel, formatWeaponDamage, formatWeaponProperties, formatWeaponType, formatWeaponWeight, formatWeightValue, getArcaneArmorFeatureTagsForInventoryStack, getArmorTypeSummary, getInventoryItemChargesTagLabel, getInventoryItemConjuredRowTagLabel, getInventoryItemFeatureTagLabels, getInventoryItemStoredSpellRowTagLabel, getInventoryItemTotalWeightValue, getInventoryRowObjectTagLabel, getInventoryTagPillProps, getItemObjectTagLabel,
    groupedInventoryItems, hasCharacterItemMods, hasDisplayableRarity, inventoryDrawerBodyAfterItem, inventoryDrawerClassName, inventoryDrawerFooter, inventoryDrawerHeaderAction, inventoryDrawerHeaderContent, inventoryObjectCount, inventoryObjectLimitMessage, isAddModalCommitting, isAddModalOpen, isCurrencyDrawerOpen, characterSheetSizeBytes,
    isCustomEquipmentModalOpen, isEquipmentGuideOpen, isGeneralEquipmentExpanded, isHandEquippableEntry, isMasterChestOpen, isOverCarryingCapacity, isSelectedArmorWorn, isSelectedCustomEntry, isSelectedEntryOnHand, isSelectedFeatureManagedEntry, isSelectedShield, loadoutDrawerBackdropHandlers, managedContainerStack, managingContainerStackId,
    normalizeCurrencyAmountInput, normalizedCurrencies, openAddModal, openCurrencyModal, openCustomEquipmentCreator, openCustomEquipmentEditor, openInventoryInspectionFromBrowser, openInventoryInspectionFromLoadout, openLoadoutEntryDetails,
    openWeaponReference, parentInventoryDrawerBodyAfterItem, parentInventoryDrawerHeaderContent, parentInventoryDrawerTitleId, parentInventoryInspection, parentInventoryRecord, pendingContainerInventoryRemoval, pendingDeleteCustomEquipment, partyMembership, deleteCustomEquipmentBackdropHandlers, removeEquipmentItem, saveContainerManagement, saveCustomEquipment, saveMasterChestCharacterDraft, selectedAdditionalWeaponMasteries, selectedInventoryAdditionalDescription, selectedInventoryDescriptionAdditions,
    inventoryDrawerTitleId, selectedInventoryInspection, selectedInventoryItemStatus, selectedInventoryModEffects, selectedInventoryRecord,
    selectedInventoryWeaponHasActiveMastery, selectedInventoryWeaponHasProficiency, selectedLoadoutEntry, selectedLoadoutEntryData, selectedLoadoutItems, selectedLoadoutSummary, selectedWeaponHasActiveMastery, selectedWeaponHasProficiency, selectedWeaponMasteryKeywords,
    selectedWeaponMasteryLabel, selectedWeaponReference, setActiveCurrencyKey, setCurrencyAmountDraft, setIsCurrencyDrawerOpen, setIsEquipmentGuideOpen, setIsGeneralEquipmentExpanded, setIsMasterChestOpen, setPendingContainerInventoryRemoval, setPendingDeleteCustomEquipmentId, setSelectedWeaponReference, shared, SheetSurface,
    sheetStyles, shouldOfferHandSwap, styles, swapEntryToHand, toggleArmorWorn, toggleEntryOnHand, confirmContainerRemoval
  } = context;

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={styles.loadoutSectionHeader}>
        <div className={styles.loadoutHeaderTop}>
          <div className={shared.eyebrowHelpRow}>
            <p className={clsx(shared.eyebrow, shared.eyebrowInHelpRow)}>Equipment</p>
            <button
              type="button"
              className={clsx(shared.helpButton, styles.loadoutHelpButton)}
              onClick={() => setIsEquipmentGuideOpen(true)}
              aria-label="Open equipment guide"
              title="Open equipment guide"
            >
              <CircleHelp size={16} />
            </button>
            {partyMembership ? (
              <button
                type="button"
                className={clsx(shared.editButton, styles.masterChestButton)}
                onClick={() => setIsMasterChestOpen(true)}
                aria-label={`Open ${partyMembership.partyGroupName} master chest`}
                title={`Open ${partyMembership.partyGroupName} master chest`}
              >
                <Package size={16} aria-hidden="true" />
                <span>Master Chest</span>
              </button>
            ) : null}
          </div>
          <div className={styles.loadoutPinnedActions}>
            <div
              className={styles.carryCapacityPill}
              aria-label={`Carried weight ${formatWeightValue(carriedWeight)} out of ${formatWeightValue(
                carryingCapacity
              )} pounds`}
            >
              <span
                className={clsx(
                  styles.carryCapacityValue,
                  isOverCarryingCapacity && styles.carryCapacityValueOver
                )}
              >
                {formatWeightValue(carriedWeight)}
              </span>
              <span className={styles.carryCapacityDivider}>/</span>
              <span className={styles.carryCapacityLimit}>
                {formatWeightValue(carryingCapacity)} lb
              </span>
            </div>
            <button
              type="button"
              className={clsx(shared.editButton, styles.loadoutAddButton)}
              onClick={openAddModal}
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>
        <button
          type="button"
          className={clsx(shared.currencyPill, styles.loadoutCurrencyPill)}
          onClick={openCurrencyModal}
        >
          {currencyPillSummary}
        </button>
        <h3 className={shared.subtitle}>Current loadout</h3>
      </div>

      {inventoryObjectLimitMessage ? (
        <p className={styles.inventoryLimitNotice} role="alert">
          {inventoryObjectLimitMessage}
        </p>
      ) : null}

      {selectedLoadoutItems.length === 0 && groupedInventoryItems.length === 0 ? (
        <p className={shared.emptyText}>No equipment selected.</p>
      ) : (
        <div className={styles.equipmentGroupStack}>
          {equipmentRenderGroups.map((group) => {
            const combinedItems = group.items;

            if (combinedItems.length === 0) {
              return null;
            }

            const shouldCollapseGeneral =
              group.key === "generalEquipment" && combinedItems.length > 6;
            const visibleGroupItems =
              shouldCollapseGeneral && !isGeneralEquipmentExpanded
                ? combinedItems.slice(0, 4)
                : combinedItems;
            const hiddenGroupItemCount = shouldCollapseGeneral
              ? Math.max(0, combinedItems.length - visibleGroupItems.length)
              : 0;

            return (
              <section key={group.key} className={styles.equipmentGroup}>
                <header className={styles.equipmentGroupHeader}>
                  <p className={styles.equipmentGroupTitle}>{group.title}</p>
                </header>
                <ul className={styles.equipmentItemList}>
                  {visibleGroupItems.map((entry) =>
                    entry.kind === "loadout" ? (() => {
                      const objectTagLabel = getItemObjectTagLabel(entry.item.entry);
                      const featureTagLabels = entry.item.featureTags ?? [];

                      return (
                      <li key={entry.key}>
                        <SheetSurface
                          as="button"
                          type="button"
                          borderSize="sm"
                          hoverBorder
                          className={styles.equipmentItemButton}
                          onClick={() => openLoadoutEntryDetails(entry.item)}
                        >
                          <span className={styles.equipmentItemName}>{entry.item.name}</span>
                          <span className={styles.equipmentItemTagRow}>
                            <span className={styles.equipmentItemTagsLeft}>
                              {entry.item.onHand ? (
                                <InventoryTagPill type="onHand" />
                              ) : null}
                              {entry.item.worn ? (
                                <InventoryTagPill type="worn" />
                              ) : null}
                              {objectTagLabel ? (
                                <InventoryTagPill type="pack" />
                              ) : null}
                              {featureTagLabels.map((tagLabel) => (
                                <InventoryTagPill key={tagLabel} {...getInventoryTagPillProps(tagLabel)} />
                              ))}
                            </span>
                            <span className={styles.equipmentItemTagsRight}>
                              {"rarity" in entry.item.entry &&
                              hasDisplayableRarity(entry.item.entry.rarity) ? (
                                <RarityPill rarity={entry.item.entry.rarity} />
                              ) : null}
                              <span className={styles.equipmentItemWeight}>
                                {formatEquipmentWeight(entry.item.entry.weight)}
                              </span>
                            </span>
                          </span>
                        </SheetSurface>
                      </li>
                      );
                    })() : (() => {
                      const conjuredRowTagLabel = getInventoryItemConjuredRowTagLabel(entry.item.stack);
                      const chargesTagLabel = getInventoryItemChargesTagLabel(entry.item.stack);
                      const storedSpellRowTagLabel = getInventoryItemStoredSpellRowTagLabel(
                        entry.item.stack
                      );
                      const objectTagLabel = getInventoryRowObjectTagLabel(
                        entry.item.stack,
                        entry.item.item
                      );
                      const featureTagLabels = getInventoryItemFeatureTagLabels(entry.item.stack, {
                        excludeConjured: true
                      });
                      const arcaneArmorTagLabels = getArcaneArmorFeatureTagsForInventoryStack(
                        entry.item.stack,
                        entry.item.item
                      );
                      const spellcastingFocusTagLabels = featureTagLabels.filter(
                        (tagLabel) => tagLabel.startsWith("Spellcasting Focus")
                      );
                      const otherFeatureTagLabels = featureTagLabels.filter(
                        (tagLabel) => !tagLabel.startsWith("Spellcasting Focus")
                      );
                      const isContainerObjectTag = objectTagLabel !== null && objectTagLabel !== "Pack";

                      return (
                      <li key={entry.key}>
                        <SheetSurface
                          as="button"
                          type="button"
                          borderSize="sm"
                          hoverBorder
                          className={styles.equipmentItemButton}
                          onClick={() => openInventoryInspectionFromLoadout(entry.item)}
                        >
                          <span className={styles.equipmentItemName}>
                            {formatInventoryStackName(entry.item)}
                          </span>
                          <span className={styles.equipmentItemTagRow}>
                            <span className={styles.equipmentItemTagsLeft}>
                              {entry.item.onHandCount > 0 ? (
                                <InventoryTagPill
                                  type="onHand"
                                  label={formatOnHandLabel(entry.item.onHandCount)}
                                />
                              ) : null}
                              {entry.item.worn ? (
                                <InventoryTagPill type="worn" />
                              ) : null}
                              {isContainerObjectTag ? (
                                <InventoryTagPill
                                  type="container"
                                  expandedText={objectTagLabel}
                                />
                              ) : null}
                              {objectTagLabel === "Pack" ? (
                                <InventoryTagPill type="pack" />
                              ) : null}
                              {arcaneArmorTagLabels.map((tagLabel) => (
                                <InventoryTagPill key={tagLabel} {...getInventoryTagPillProps(tagLabel)} />
                              ))}
                              {chargesTagLabel ? (
                                <InventoryTagPill type="charges" label={chargesTagLabel} />
                              ) : null}
                              {entry.item.stack.attuned ? (
                                <InventoryTagPill type="attuned" />
                              ) : null}
                              {spellcastingFocusTagLabels.map((tagLabel) => (
                                <InventoryTagPill key={tagLabel} {...getInventoryTagPillProps(tagLabel)} />
                              ))}
                              {otherFeatureTagLabels.map((tagLabel) => (
                                <InventoryTagPill key={tagLabel} {...getInventoryTagPillProps(tagLabel)} />
                              ))}
                            </span>
                            <span className={styles.equipmentItemTagsRight}>
                              {storedSpellRowTagLabel ? (
                                <InventoryTagPill type="spell" />
                              ) : null}
                              {conjuredRowTagLabel ? (
                                <InventoryTagPill {...getInventoryTagPillProps(conjuredRowTagLabel)} />
                              ) : null}
                              {hasCharacterItemMods(entry.item.stack.mods) &&
                              !entry.item.stack.mods?.isCustom ? (
                                <InventoryTagPill type="modded" />
                              ) : null}
                              {hasDisplayableRarity(entry.item.item.rarity) ? (
                                <RarityPill rarity={entry.item.item.rarity} />
                              ) : null}
                              <span className={styles.equipmentItemWeight}>
                                {formatEquipmentWeight(getInventoryItemTotalWeightValue(entry.item.stack))}
                              </span>
                            </span>
                          </span>
                        </SheetSurface>
                      </li>
                      );
                    })()
                  )}
                </ul>
                {shouldCollapseGeneral ? (
                  <InlineToggleButton
                    label={
                      isGeneralEquipmentExpanded
                        ? "Show less items"
                        : `Show ${hiddenGroupItemCount} more items`
                    }
                    expanded={isGeneralEquipmentExpanded}
                    onClick={() => setIsGeneralEquipmentExpanded((currentState) => !currentState)}
                  />
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      <EquipmentItemBrowserModal
        isOpen={isAddModalOpen}
        isClosing={isAddModalCommitting}
        currencySummary={currencyPillSummary}
        onClose={closeAddModal}
        onOpenCurrencyModal={openCurrencyModal}
        onOpenCustomEquipmentCreator={openCustomEquipmentCreator}
        onItemSelect={openInventoryInspectionFromBrowser}
      />

      {isEquipmentGuideOpen ? (
        <EquipmentGuideModal
          inventoryObjectCount={inventoryObjectCount}
          sheetSizeBytes={characterSheetSizeBytes}
          onClose={() => setIsEquipmentGuideOpen(false)}
        />
      ) : null}

      {isMasterChestOpen && partyMembership ? (
        <MasterChestModal
          character={equipmentCharacter}
          mode="player"
          partyGroupId={partyMembership.partyGroupId}
          partyGroupName={partyMembership.partyGroupName}
          onClose={() => setIsMasterChestOpen(false)}
          onSaveCharacterDraft={saveMasterChestCharacterDraft}
        />
      ) : null}

      {isCustomEquipmentModalOpen ? (
        <SheetModal
          titleId="character-custom-equipment-title"
          onClose={closeCustomEquipmentModal}
          size="medium"
          backdropClassName={styles.customEquipmentModalBackdrop}
          panelClassName={styles.customEquipmentModal}
        >
          <OverlayHeader>
            <OverlayHeaderContent>
              <OverlayTitle id="character-custom-equipment-title">
                {customEditorMode === "edit" ? "Modify item" : "Create custom equipment"}
              </OverlayTitle>
              <OverlaySummary>
                Create or modify an item with full control over its details, including special
                effects. Modifying an existing non-modded item transforms one copy into a separate
                modded stack. Non-general item effects are active only while held or worn; general
                item effects stay active while the modded stack remains in inventory.
              </OverlaySummary>
            </OverlayHeaderContent>
            <OverlayCloseButton
              label="Close custom equipment modal"
              onClick={closeCustomEquipmentModal}
            />
          </OverlayHeader>

          <CustomEquipmentEditor
            mode={customEditorMode}
            initialStack={editingInventoryStack}
            onCancel={closeCustomEquipmentModal}
            onSave={saveCustomEquipment}
          />
        </SheetModal>
      ) : null}

      {isCurrencyDrawerOpen ? (
        <SheetModal
          titleId="character-currency-modal-title"
          onClose={() => setIsCurrencyDrawerOpen(false)}
          size="small"
          backdropClassName={styles.currencyModalBackdrop}
          panelClassName={styles.currencyModal}
        >
          <OverlayHeader>
            <OverlayHeaderContent>
              <OverlayEyebrow>Currency</OverlayEyebrow>
              <OverlayTitle id="character-currency-modal-title">Currency balance</OverlayTitle>
            </OverlayHeaderContent>
            <OverlayCloseButton
              label="Close currency modal"
              onClick={() => setIsCurrencyDrawerOpen(false)}
            />
          </OverlayHeader>

          <OverlayBody className={styles.currencyModalBody}>
            <div className={styles.currencySelectorRow}>
              {currencyDefinitions.map((currency) => (
                <button
                  key={currency.key}
                  type="button"
                  className={clsx(
                    styles.currencySelectorButton,
                    activeCurrencyKey === currency.key && styles.currencySelectorButtonActive
                  )}
                  onClick={() => setActiveCurrencyKey(currency.key)}
                >
                  <img
                    src={currency.icon}
                    alt=""
                    className={styles.currencySelectorIcon}
                    aria-hidden="true"
                  />
                  <strong>{normalizedCurrencies[currency.key]}</strong>
                  <span>{currency.code}</span>
                </button>
              ))}
            </div>

            <div className={clsx(sheetStyles.currencyDrawerContent, styles.currencyModalActionRow)}>
              <label className={sheetStyles.currencyDrawerField}>
                <span className={sheetStyles.currencyDrawerLabel}>
                  {`Amount (${activeCurrencyDefinition.label})`}
                </span>
                <NumberInput
                  min={0}
                  className={sheetStyles.currencyDrawerInput}
                  value={currencyAmountDraft}
                  onFocus={(event) => {
                    if (currencyAmountDraft === 0) {
                      event.currentTarget.select();
                    }
                  }}
                  onChange={(event) =>
                    setCurrencyAmountDraft((current) =>
                      normalizeCurrencyAmountInput(event.target.value, current)
                    )
                  }
                />
              </label>
            </div>
          </OverlayBody>

          <OverlayFooter>
            <div className={styles.currencyModalActions}>
              <ActionButton
                actionType="ERROR"
                icon={<Minus size={16} aria-hidden="true" />}
                disabled={!canSpendCurrency}
                onClick={() => adjustCurrencyBalance("spend")}
              >
                Spend
              </ActionButton>
              <ActionButton
                actionType="SUCCESS"
                icon={<Plus size={16} aria-hidden="true" />}
                onClick={() => adjustCurrencyBalance("gain")}
              >
                Gain
              </ActionButton>
            </div>
          </OverlayFooter>
        </SheetModal>
      ) : null}

      {selectedLoadoutEntry && selectedLoadoutEntryData ? (
        <div
          className={clsx(sheetStyles.spellDrawerBackdrop, styles.equipmentOverlayDrawerBackdrop)}
          role="presentation"
          onClick={loadoutDrawerBackdropHandlers.onBackdropClick}
          onPointerDown={loadoutDrawerBackdropHandlers.onBackdropPointerDown}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-loadout-drawer-title"
            onClick={loadoutDrawerBackdropHandlers.onContentClick}
          >
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>
                  {formatCodexLabel(selectedLoadoutEntryData.category)}
                </p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-loadout-drawer-title" className={sheetStyles.spellDrawerTitle}>
                    {selectedLoadoutEntryData.name}
                  </h3>
                  {isSelectedEntryOnHand ? (
                    <InventoryTagPill type="onHand" />
                  ) : null}
                  {isSelectedArmorWorn ? (
                    <InventoryTagPill type="worn" />
                  ) : null}
                  {selectedLoadoutEntry.featureTags?.map((tagLabel) => (
                    <InventoryTagPill key={tagLabel} {...getInventoryTagPillProps(tagLabel)} />
                  ))}
                  {"rarity" in selectedLoadoutEntryData ? (
                    <RarityPill rarity={selectedLoadoutEntryData.rarity} />
                  ) : null}
                </div>
                <p className={sheetStyles.spellDrawerSummary}>{selectedLoadoutSummary}</p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={closeLoadoutDrawer}
                aria-label="Close loadout details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.spellDrawerBody}>
              <div className={sheetStyles.spellDrawerDetails}>
                {selectedLoadoutEntryData.category === ENTRY_CATEGORIES.WEAPONS ? (
                  <>
                    <CellContainer
                      label={
                        selectedWeaponHasProficiency ? (
                          <WeaponMasteryStatusLabel label="Type" status="PROFICIENT" />
                        ) : (
                          "Type"
                        )
                      }
                      content={`${formatWeaponType(selectedLoadoutEntryData.type)} weapon`}
                    />
                    <CellContainer
                      label="Damage"
                      content={formatWeaponDamage(selectedLoadoutEntryData.damage)}
                    />
                    <CellContainer
                      type="button"
                      as="button"
                      className={styles.referenceDetailButton}
                      label="Properties"
                      content={formatWeaponProperties(selectedLoadoutEntryData)}
                      onClick={() =>
                        openWeaponReference(
                          "Properties",
                          selectedLoadoutEntryData.properties.map((property) =>
                            formatCodexLabel(property)
                          )
                        )
                      }
                    />
                    {selectedLoadoutEntryData.mastery ||
                    selectedAdditionalWeaponMasteries.length > 0 ? (
                      <CellContainer
                        type="button"
                        as="button"
                        className={styles.referenceDetailButton}
                        label={
                          selectedWeaponHasActiveMastery ? <WeaponMasteryStatusLabel /> : "Mastery"
                        }
                        content={selectedWeaponMasteryLabel}
                        onClick={() =>
                          openWeaponReference("Mastery", selectedWeaponMasteryKeywords)
                        }
                      />
                    ) : (
                      <CellContainer label="Mastery" content="None" />
                    )}
                    <CellContainer
                      label="Weight"
                      content={formatWeaponWeight(selectedLoadoutEntryData.weight)}
                    />
                    <CellContainer
                      label="Cost"
                      content={
                        <CurrencyInlineDisplay
                          cost={selectedLoadoutEntryData.cost}
                          className={styles.drawerCurrencyDisplay}
                          iconClassName={styles.drawerCurrencyIcon}
                          style={{
                            fontSize: "16px",
                            color: "rgb(46, 32, 23)",
                            fontWeight: 700
                          }}
                          iconStyle={{
                            inlineSize: "18px",
                            blockSize: "18px"
                          }}
                        />
                      }
                    />
                  </>
                ) : selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR &&
                  isSelectedShield ? null : (
                  <CellContainer
                    label="Type"
                    content={
                      isSelectedCustomEntry
                        ? selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR
                          ? "Custom armor"
                          : "Custom item"
                        : selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR
                          ? getArmorTypeSummary(selectedLoadoutEntryData)
                          : formatCodexList(selectedLoadoutEntryData.tags)
                    }
                  />
                )}

                {selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR ? (
                  <>
                    {!isSelectedShield ? (
                      <CellContainer
                        label="Armor base"
                        content={selectedLoadoutEntryData.armorBase}
                      />
                    ) : null}
                  </>
                ) : null}

                {selectedLoadoutEntryData.category !== ENTRY_CATEGORIES.WEAPONS ? (
                  <>
                    <CellContainer
                      label="Weight"
                      content={formatEquipmentWeight(selectedLoadoutEntryData.weight)}
                    />
                    <CellContainer
                      label="Cost"
                      content={
                        <CurrencyInlineDisplay
                          cost={selectedLoadoutEntryData.cost}
                          className={styles.drawerCurrencyDisplay}
                          iconClassName={styles.drawerCurrencyIcon}
                          style={{
                            fontSize: "16px",
                            color: "rgb(46, 32, 23)",
                            fontWeight: 700
                          }}
                          iconStyle={{
                            inlineSize: "18px",
                            blockSize: "18px"
                          }}
                        />
                      }
                    />
                  </>
                ) : null}
              </div>
            </div>

            <div className={styles.loadoutDrawerActions}>
              {isSelectedFeatureManagedEntry ? (
                <p className={styles.featureManagedItemNote}>
                  Granted by {selectedLoadoutEntry.featureManagedSource} and managed automatically.
                </p>
              ) : (
                <>
                  {selectedLoadoutEntryData && isHandEquippableEntry(selectedLoadoutEntryData) ? (
                    <>
                      {shouldOfferHandSwap ? (
                        <span className={styles.weaponHandStatusText}>Hands are full</span>
                      ) : null}
                      <button
                        type="button"
                        className={clsx(
                          styles.editItemButton,
                          shouldOfferHandSwap && styles.weaponHandSwapButton
                        )}
                        onClick={shouldOfferHandSwap ? swapEntryToHand : toggleEntryOnHand}
                      >
                        <Hand size={15} aria-hidden="true" />
                        {isSelectedEntryOnHand ? "Unequip" : shouldOfferHandSwap ? "Swap" : "Equip"}
                      </button>
                    </>
                  ) : null}
                  {selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR &&
                  !isSelectedShield ? (
                    <button
                      type="button"
                      className={styles.editItemButton}
                      onClick={toggleArmorWorn}
                    >
                      <Shield size={15} aria-hidden="true" />
                      {isSelectedArmorWorn ? "DOFF" : "DON"}
                    </button>
                  ) : null}
                  {selectedLoadoutEntry.customEquipmentId ? (
                    <>
                      <button
                        type="button"
                        className={styles.editItemButton}
                        onClick={() =>
                          openCustomEquipmentEditor(selectedLoadoutEntry.customEquipmentId!)
                        }
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.removeItemButton}
                        onClick={() =>
                          setPendingDeleteCustomEquipmentId(
                            selectedLoadoutEntry.customEquipmentId ?? null
                          )
                        }
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className={styles.removeItemButton}
                      onClick={() => removeEquipmentItem(selectedLoadoutEntryData.name)}
                    >
                      Remove Item
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {parentInventoryInspection && parentInventoryRecord ? (
        <EquipmentInventoryItemDrawer
          titleId={parentInventoryDrawerTitleId}
          item={parentInventoryRecord}
          status="ready"
          onClose={closeInventoryItemDrawer}
          headerContent={parentInventoryDrawerHeaderContent}
          bodyAfterItem={parentInventoryDrawerBodyAfterItem}
          backdropClassName={styles.equipmentParentInspectionBackdrop}
          drawerClassName={styles.equipmentParentInspectionDrawer}
        />
      ) : null}

      {selectedInventoryInspection ? (
        <EquipmentInventoryItemDrawer
          key={`${selectedInventoryInspection.source}-${selectedInventoryInspection.stackId ?? selectedInventoryInspection.containerStackId ?? selectedInventoryInspection.itemKey}-${selectedInventoryInspection.contentIndex ?? "root"}`}
          titleId={inventoryDrawerTitleId}
          item={selectedInventoryRecord}
          status={selectedInventoryItemStatus}
          onClose={closeInventoryItemDrawer}
          headerContent={inventoryDrawerHeaderContent}
          headerAction={inventoryDrawerHeaderAction}
          footer={inventoryDrawerFooter}
          bodyAfterItem={inventoryDrawerBodyAfterItem}
          drawerClassName={inventoryDrawerClassName}
          additionalDescription={selectedInventoryAdditionalDescription}
          descriptionAdditions={selectedInventoryDescriptionAdditions}
          modEffects={selectedInventoryModEffects}
          weaponMasteryActive={selectedInventoryWeaponHasActiveMastery}
          weaponProficient={selectedInventoryWeaponHasProficiency}
          onOpenWeaponReference={openWeaponReference}
        />
      ) : null}

      {managingContainerStackId && managedContainerStack ? (
        <EquipmentContainerManageModal
          containerStackId={managingContainerStackId}
          inventoryItems={containerManagementInventoryItems}
          backdropClassName={styles.equipmentDrawerTopModalBackdrop}
          onCancel={closeContainerManagement}
          onSave={saveContainerManagement}
        />
      ) : null}

      {selectedWeaponReference ? (
        <KeywordReferenceDrawer
          title={selectedWeaponReference.name}
          entries={selectedWeaponReference.entries}
          onClose={() => setSelectedWeaponReference(null)}
          backdropClassName={styles.masteryReferenceBackdrop}
        />
      ) : null}

      {pendingContainerInventoryRemoval ? (
        <DestructiveConfirmationModal
          titleId="container-removal-confirmation-title"
          title={
            pendingContainerInventoryRemoval.action === "sell"
              ? "Sell container?"
              : "Remove container?"
          }
          message={
            <>
              This will delete <strong>{pendingContainerInventoryRemoval.item.name}</strong> and
              every item inside it.
            </>
          }
          confirmLabel={pendingContainerInventoryRemoval.action === "sell" ? "Sell" : "Remove"}
          closeLabel="Close container removal confirmation"
          backdropClassName={styles.equipmentDrawerTopModalBackdrop}
          onCancel={() => setPendingContainerInventoryRemoval(null)}
          onConfirm={confirmContainerRemoval}
        />
      ) : null}

      {pendingDeleteCustomEquipment ? (
        <div
          className={styles.customEquipmentDeleteBackdrop}
          role="presentation"
          onClick={deleteCustomEquipmentBackdropHandlers.onBackdropClick}
          onPointerDown={deleteCustomEquipmentBackdropHandlers.onBackdropPointerDown}
        >
          <section
            className={styles.customEquipmentDeleteCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-equipment-delete-title"
            onClick={deleteCustomEquipmentBackdropHandlers.onContentClick}
          >
            <h4 id="custom-equipment-delete-title">Delete custom equipment?</h4>
            <p>
              This will permanently remove <strong>{pendingDeleteCustomEquipment.name}</strong> from
              the character&apos;s loadout.
            </p>
            <div className={styles.customEquipmentDeleteActions}>
              <button
                type="button"
                className={styles.customEquipmentDeleteCancelButton}
                onClick={() => setPendingDeleteCustomEquipmentId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.customEquipmentDeleteConfirmButton}
                onClick={() => deleteCustomEquipment(pendingDeleteCustomEquipment.id)}
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </article>
  );
}
