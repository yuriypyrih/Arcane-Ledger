/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
// @ts-nocheck

export function renderEquipmentForm(context: Record<string, any>) {
  const {
    CellContainer, CurrencyInlineDisplay, CustomEquipmentEditor, ENTRY_CATEGORIES, EquipmentInventoryItemDrawer, EquipmentItemBrowserModal, Hand, InlineToggleButton, KeywordReferenceDrawer,
    Minus, NumberInput, Plus, RarityPill, Shield, WeaponMasteryStatusLabel, X, activeCurrencyDefinition, activeCurrencyKey,
    adjustCurrencyBalance, canSpendCurrency, carriedWeight, carryingCapacity, className, closeAddModal, closeCustomEquipmentModal, closeInventoryItemDrawer, closeLoadoutDrawer,
    clsx, currencyAmountDraft, currencyDefinitions, customEditorMode, deleteCustomEquipment, editingCustomEquipment, equipmentGroupMeta, formatCodexLabel, formatCodexList,
    formatEquipmentWeight, formatInventoryStackName, formatOnHandLabel, formatWeaponDamage, formatWeaponProperties, formatWeaponType, formatWeaponWeight, formatWeightValue, getArmorTypeSummary,
    getItemWeightValue, groupedInventoryItems, hasDisplayableRarity, inventoryDrawerFooter, inventoryDrawerHeaderContent, inventoryEquipmentGroups, isAddModalCommitting, isAddModalOpen, isCurrencyDrawerOpen,
    isCustomEquipmentModalOpen, isGeneralEquipmentExpanded, isHandEquippableEntry, isOverCarryingCapacity, isSelectedArmorWorn, isSelectedCustomEntry, isSelectedEntryOnHand, isSelectedFeatureManagedEntry, isSelectedShield,
    normalizeCurrencyAmountInput, normalizedCurrencies, openAddModal, openCurrencyModal, openCustomEquipmentCreator, openCustomEquipmentEditor, openInventoryInspectionFromBrowser, openInventoryInspectionFromLoadout, openLoadoutEntryDetails,
    openWeaponReference, pendingDeleteCustomEquipment, removeEquipmentItem, saveCustomEquipment, selectedAdditionalWeaponMasteries, selectedEquipmentGroups, selectedInventoryAdditionalDescription, selectedInventoryDescriptionAdditions,
    selectedInventoryInspection, selectedInventoryItemStatus, selectedInventoryRecord,
    selectedInventoryWeaponHasActiveMastery, selectedInventoryWeaponHasProficiency, selectedLoadoutEntry, selectedLoadoutEntryData, selectedLoadoutItems, selectedLoadoutSummary, selectedWeaponHasActiveMastery, selectedWeaponHasProficiency, selectedWeaponMasteryKeywords,
    selectedWeaponMasteryLabel, selectedWeaponReference, setActiveCurrencyKey, setCurrencyAmountDraft, setIsCurrencyDrawerOpen, setIsGeneralEquipmentExpanded, setPendingDeleteCustomEquipmentId, setSelectedWeaponReference, shared,
    sheetStyles, shouldOfferHandSwap, styles, swapEntryToHand, toggleArmorWorn, toggleEntryOnHand
  } = context;

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Equipment</p>
          <h3 className={shared.subtitle}>Current loadout</h3>
        </div>
        <div className={shared.headerActions}>
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
          <button type="button" className={shared.currencyPill} onClick={openCurrencyModal}>
            <span className={styles.currencyPillSummary}>
              {currencyDefinitions.map((currency) => (
                <span key={currency.key} className={styles.currencyPillToken}>
                  <img
                    src={currency.icon}
                    alt=""
                    className={styles.currencyPillTokenIcon}
                    aria-hidden="true"
                  />
                  <span className={styles.currencyPillTokenValue}>
                    {normalizedCurrencies[currency.key]}
                  </span>
                  <span className={styles.currencyPillTokenCode}>{currency.code}</span>
                </span>
              ))}
            </span>
          </button>
          <button
            type="button"
            className={shared.editButton}
            onClick={openAddModal}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {selectedLoadoutItems.length === 0 && groupedInventoryItems.length === 0 ? (
        <p className={shared.emptyText}>No equipment selected.</p>
      ) : (
        <div className={styles.equipmentGroupStack}>
          {equipmentGroupMeta.map((group) => {
            const legacyItems =
              selectedEquipmentGroups.find((entry) => entry.key === group.key)?.items ?? [];
            const inventoryItems =
              inventoryEquipmentGroups.find((entry) => entry.key === group.key)?.items ?? [];
            const combinedItems = [
              ...legacyItems.map((item) => ({
                key: item.key,
                name: item.name,
                kind: "legacy" as const,
                item
              })),
              ...inventoryItems.map((item) => ({
                key: `inventory-${item.key}`,
                name: item.name,
                kind: "inventory" as const,
                item
              }))
            ].sort((left, right) => left.name.localeCompare(right.name));

            if (combinedItems.length === 0) {
              return null;
            }

            const shouldCollapseGeneral =
              group.key === "generalEquipment" && combinedItems.length > 6;
            const visibleGroupItems =
              shouldCollapseGeneral && !isGeneralEquipmentExpanded
                ? combinedItems.slice(0, 4)
                : combinedItems;

            return (
              <section key={group.key} className={styles.equipmentGroup}>
                <header className={styles.equipmentGroupHeader}>
                  <p className={styles.equipmentGroupTitle}>{group.title}</p>
                </header>
                <ul className={styles.equipmentItemList}>
                  {visibleGroupItems.map((entry) =>
                    entry.kind === "legacy" ? (
                      <li key={entry.key}>
                        <button
                          type="button"
                          className={styles.equipmentItemButton}
                          onClick={() => openLoadoutEntryDetails(entry.item)}
                        >
                          <span className={styles.equipmentItemLabel}>
                            <span className={styles.equipmentItemName}>{entry.item.name}</span>
                            {entry.item.onHand ? (
                              <span className={styles.equipmentItemOnHand}>
                                <Hand size={13} aria-hidden="true" />
                                <span>On Hand</span>
                              </span>
                            ) : null}
                            {entry.item.worn ? (
                              <span className={styles.equipmentItemWorn}>
                                <Shield size={13} aria-hidden="true" />
                                <span>Worn</span>
                              </span>
                            ) : null}
                          </span>
                          <span className={styles.equipmentItemMeta}>
                            <span className={styles.equipmentItemWeight}>
                              {formatEquipmentWeight(entry.item.entry.weight)}
                            </span>
                            {"rarity" in entry.item.entry &&
                            hasDisplayableRarity(entry.item.entry.rarity) ? (
                              <RarityPill rarity={entry.item.entry.rarity} />
                            ) : null}
                          </span>
                        </button>
                      </li>
                    ) : (
                      <li key={entry.key}>
                        <button
                          type="button"
                          className={styles.equipmentItemButton}
                          onClick={() => openInventoryInspectionFromLoadout(entry.item)}
                        >
                          <span className={styles.equipmentItemLabel}>
                            <span className={styles.equipmentItemName}>
                              {formatInventoryStackName(entry.item)}
                            </span>
                            {entry.item.onHandCount > 0 ? (
                              <span className={styles.equipmentItemOnHand}>
                                <Hand size={13} aria-hidden="true" />
                                <span>{formatOnHandLabel(entry.item.onHandCount)}</span>
                              </span>
                            ) : null}
                            {entry.item.worn ? (
                              <span className={styles.equipmentItemWorn}>
                                <Shield size={13} aria-hidden="true" />
                                <span>Worn</span>
                              </span>
                            ) : null}
                          </span>
                          <span className={styles.equipmentItemMeta}>
                            <span className={styles.equipmentItemWeight}>
                              {formatEquipmentWeight(getItemWeightValue(entry.item.item))}
                            </span>
                            {hasDisplayableRarity(entry.item.item.rarity) ? (
                              <RarityPill rarity={entry.item.item.rarity} />
                            ) : null}
                          </span>
                        </button>
                      </li>
                    )
                  )}
                </ul>
                {shouldCollapseGeneral ? (
                  <InlineToggleButton
                    label={isGeneralEquipmentExpanded ? "Show less items" : "Show more items"}
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
        currencySummary={
          <span className={styles.currencyPillSummary}>
            {currencyDefinitions.map((currency) => (
              <span key={currency.key} className={styles.currencyPillToken}>
                <img
                  src={currency.icon}
                  alt=""
                  className={styles.currencyPillTokenIcon}
                  aria-hidden="true"
                />
                <span className={styles.currencyPillTokenValue}>
                  {normalizedCurrencies[currency.key]}
                </span>
                <span className={styles.currencyPillTokenCode}>{currency.code}</span>
              </span>
            ))}
          </span>
        }
        onClose={closeAddModal}
        onOpenCurrencyModal={openCurrencyModal}
        onOpenCustomEquipmentCreator={openCustomEquipmentCreator}
        onItemSelect={openInventoryInspectionFromBrowser}
      />

      {isCustomEquipmentModalOpen ? (
        <div
          className={clsx(sheetStyles.spellManagementBackdrop, styles.customEquipmentModalBackdrop)}
          role="presentation"
          onClick={closeCustomEquipmentModal}
        >
          <section
            className={clsx(sheetStyles.spellManagementModal, styles.customEquipmentModal)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-custom-equipment-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Equipment</p>
                <h3 id="character-custom-equipment-title" className={sheetStyles.sheetPanelTitle}>
                  {customEditorMode === "edit"
                    ? "Edit custom equipment"
                    : "Create custom equipment"}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={closeCustomEquipmentModal}
                aria-label="Close custom equipment modal"
              >
                <X size={18} />
              </button>
            </div>

            <CustomEquipmentEditor
              mode={customEditorMode}
              initialEquipment={editingCustomEquipment}
              onCancel={closeCustomEquipmentModal}
              onSave={saveCustomEquipment}
            />
          </section>
        </div>
      ) : null}

      {isCurrencyDrawerOpen ? (
        <div
          className={clsx(sheetStyles.spellManagementBackdrop, styles.currencyModalBackdrop)}
          role="presentation"
          onClick={() => setIsCurrencyDrawerOpen(false)}
        >
          <section
            className={clsx(sheetStyles.spellManagementModal, styles.currencyModal)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-currency-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Currency</p>
                <h3 id="character-currency-modal-title" className={sheetStyles.sheetPanelTitle}>
                  Currency balance
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsCurrencyDrawerOpen(false)}
                aria-label="Close currency modal"
              >
                <X size={18} />
              </button>
            </div>

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
              <div className={clsx(sheetStyles.currencyDrawerActions, styles.currencyModalActions)}>
                <button
                  type="button"
                  className={sheetStyles.currencySpendButton}
                  disabled={!canSpendCurrency}
                  onClick={() => adjustCurrencyBalance("spend")}
                >
                  <Minus
                    size={16}
                    aria-hidden="true"
                    className={sheetStyles.currencyActionIconSpend}
                  />
                  Spend
                </button>
                <button
                  type="button"
                  className={sheetStyles.currencyGainButton}
                  onClick={() => adjustCurrencyBalance("gain")}
                >
                  <Plus
                    size={16}
                    aria-hidden="true"
                    className={sheetStyles.currencyActionIconGain}
                  />
                  Gain
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {selectedLoadoutEntry && selectedLoadoutEntryData ? (
        <div
          className={clsx(sheetStyles.spellDrawerBackdrop, styles.equipmentOverlayDrawerBackdrop)}
          role="presentation"
          onClick={closeLoadoutDrawer}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-loadout-drawer-title"
            onClick={(event) => event.stopPropagation()}
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
                    <span className={styles.drawerOnHandBadge}>
                      <Hand size={13} aria-hidden="true" />
                      <span>On Hand</span>
                    </span>
                  ) : null}
                  {isSelectedArmorWorn ? (
                    <span className={styles.drawerWornBadge}>
                      <Shield size={13} aria-hidden="true" />
                      <span>Worn</span>
                    </span>
                  ) : null}
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

      {selectedInventoryInspection ? (
        <EquipmentInventoryItemDrawer
          item={selectedInventoryRecord}
          status={selectedInventoryItemStatus}
          onClose={closeInventoryItemDrawer}
          headerContent={inventoryDrawerHeaderContent}
          footer={inventoryDrawerFooter}
          additionalDescription={selectedInventoryAdditionalDescription}
          descriptionAdditions={selectedInventoryDescriptionAdditions}
          weaponMasteryActive={selectedInventoryWeaponHasActiveMastery}
          weaponProficient={selectedInventoryWeaponHasProficiency}
          onOpenWeaponReference={openWeaponReference}
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

      {pendingDeleteCustomEquipment ? (
        <div
          className={styles.customEquipmentDeleteBackdrop}
          role="presentation"
          onClick={() => setPendingDeleteCustomEquipmentId(null)}
        >
          <section
            className={styles.customEquipmentDeleteCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-equipment-delete-title"
            onClick={(event) => event.stopPropagation()}
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
