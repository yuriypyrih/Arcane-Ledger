import clsx from "clsx";
import { CircleCheck, History, Pencil, RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import ActionButton from "../../../ActionButton";
import { CurrencyBalancePill } from "../../../CurrencyInlineDisplay";
import { updatePartyGroupMasterChest } from "../../../../api";
import coinCopperIcon from "../../../../assets/svg/coin-copper.svg";
import coinElectrumIcon from "../../../../assets/svg/coin-electrum.svg";
import coinGoldIcon from "../../../../assets/svg/coin.svg";
import coinPlatinumIcon from "../../../../assets/svg/coin-platinum.svg";
import coinSilverIcon from "../../../../assets/svg/coin-silver.svg";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal,
  DestructiveConfirmationModal
} from "../../../Overlay";
import SelectInput from "../../FormInputs/SelectInput";
import type {
  Character,
  CharacterCurrencies,
  CharacterInventoryItem,
  CurrencyKey,
  ItemRecord
} from "../../../../types";
import {
  canAddInventoryObject,
  createCharacterInventoryItem,
  getItemTransactionCost,
  moveOneInventoryItemCopyBetweenRootInventories,
  normalizeCharacterInventoryItems,
  type GroupedInventoryItem
} from "../../../../pages/CharactersPage/inventoryItems";
import SheetActionButton from "../SheetActionButton";
import type { CustomEquipmentEditorSavePayload } from "../CustomEquipmentEditor";
import containerStyles from "./EquipmentContainerManageModal.module.css";
import EquipmentItemBrowserModal, {
  type EquipmentItemBrowserSelectionOptions
} from "./EquipmentItemBrowserModal";
import MasterChestCurrencyModal, {
  type MasterChestCurrencyDefinition
} from "./MasterChestCurrencyModal";
import MasterChestCustomEquipmentModal from "./MasterChestCustomEquipmentModal";
import MasterChestHistoryModal from "./MasterChestHistoryModal";
import MasterChestInventoryColumn from "./MasterChestInventoryColumn";
import MasterChestItemInspectionDrawer from "./MasterChestItemInspectionDrawer";
import { getMasterChestTransferBlockTitle } from "./masterChestInventoryUtils";
import {
  addTransactionCurrency,
  addTransactionItem,
  createEmptyTransactionLog,
  createTransactionSummary,
  type MasterChestTransactionLog
} from "./masterChestTransactions";
import {
  addMasterChestInspectionItem,
  canAddMasterChestInspectionItem,
  createMasterChestBrowserInspection,
  createMasterChestStackInspection,
  getMasterChestObjectLimitMessage,
  masterChestInspectionHasContainerContents,
  removeMasterChestInspectionItem,
  type MasterChestItemInspection,
  type MasterChestRemovalAction,
  type PendingMasterChestItemRemoval
} from "./masterChestEditing";
import {
  getMasterChestErrorMessage,
  normalizeMasterChestCurrencies,
  useMasterChestData
} from "./useMasterChestData";
import styles from "./MasterChestModal.module.css";

type MasterChestMode = "player" | "gm";

type MasterChestModalProps = {
  character?: Character;
  mode: MasterChestMode;
  onClose: () => void;
  onSaveCharacterDraft?: (draft: {
    currencies: CharacterCurrencies;
    inventoryItems: CharacterInventoryItem[];
  }) => void;
  partyGroupId: string;
  partyGroupName?: string;
};

const currencyDefinitions: MasterChestCurrencyDefinition[] = [
  { key: "copper", label: "Copper", code: "CP", icon: coinCopperIcon },
  { key: "silver", label: "Silver", code: "SP", icon: coinSilverIcon },
  { key: "electrum", label: "Electrum", code: "EP", icon: coinElectrumIcon },
  { key: "gold", label: "Gold", code: "GP", icon: coinGoldIcon },
  { key: "platinum", label: "Platinum", code: "PP", icon: coinPlatinumIcon }
];

const masterChestViewId = "master-chest";
const refreshCooldownMs = 5_000;

function getTransactionItemName(item: Pick<ItemRecord, "name">): string {
  return item.name?.trim() || "Item";
}

function MasterChestModal({
  character,
  mode,
  onClose,
  onSaveCharacterDraft,
  partyGroupId,
  partyGroupName
}: MasterChestModalProps) {
  const refreshConfirmTitleId = useId();
  const refreshCooldownRef = useRef<number | null>(null);
  const {
    draft,
    error,
    history,
    loadMasterChestData,
    loadStatus,
    partyInventoryMembers,
    revision,
    setDraft,
    setError
  } = useMasterChestData({ character, partyGroupId });
  const [activeCurrencyKey, setActiveCurrencyKey] = useState<CurrencyKey>("gold");
  const [currencyAmountDraft, setCurrencyAmountDraft] = useState(0);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshCoolingDown, setIsRefreshCoolingDown] = useState(false);
  const [isRefreshConfirmationOpen, setIsRefreshConfirmationOpen] = useState(false);
  const [isGmAddModalOpen, setIsGmAddModalOpen] = useState(false);
  const [isCustomEquipmentModalOpen, setIsCustomEquipmentModalOpen] = useState(false);
  const [pendingItemRemoval, setPendingItemRemoval] =
    useState<PendingMasterChestItemRemoval | null>(null);
  const [selectedInspection, setSelectedInspection] =
    useState<MasterChestItemInspection | null>(null);
  const [selectedViewId, setSelectedViewId] = useState(masterChestViewId);
  const [transactionLog, setTransactionLog] = useState<MasterChestTransactionLog>(
    createEmptyTransactionLog
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isGmMode = mode === "gm";
  const selectedPartyMember =
    selectedViewId === masterChestViewId
      ? null
      : (partyInventoryMembers.find((member) => member.characterId === selectedViewId) ?? null);
  const isMasterChestView = selectedViewId === masterChestViewId;
  const canGmEditChest = isGmMode && isMasterChestView && loadStatus === "ready";
  const canTransferItems = mode === "player" && isMasterChestView;
  const hasUnsavedTransferDraft = Boolean(createTransactionSummary(transactionLog));
  const activeCurrencyDefinition =
    currencyDefinitions.find((currency) => currency.key === activeCurrencyKey) ??
    currencyDefinitions[3];
  const normalizedCurrencyAmount = Math.max(0, Math.floor(currencyAmountDraft));
  const canDepositCurrency =
    isMasterChestView &&
    normalizedCurrencyAmount > 0 &&
    (isGmMode || (draft.characterCurrencies[activeCurrencyKey] ?? 0) >= normalizedCurrencyAmount);
  const canWithdrawCurrency =
    isMasterChestView &&
    normalizedCurrencyAmount > 0 &&
    (draft.chestCurrencies[activeCurrencyKey] ?? 0) >= normalizedCurrencyAmount;
  const displayCurrencies = selectedPartyMember?.currencies ?? draft.chestCurrencies;
  const displayedInventoryItems = selectedPartyMember?.inventoryItems ?? draft.chestInventoryItems;
  const refreshButtonLabel = isRefreshing
    ? "Refreshing master chest"
    : isRefreshCoolingDown
      ? "Refreshed"
      : "Refresh";
  const refreshButtonIcon = isRefreshCoolingDown ? (
    <CircleCheck size={16} aria-hidden="true" />
  ) : (
    <RefreshCw size={16} aria-hidden="true" />
  );

  const clearRefreshCooldown = useCallback(() => {
    if (refreshCooldownRef.current === null) {
      return;
    }

    window.clearTimeout(refreshCooldownRef.current);
    refreshCooldownRef.current = null;
  }, []);

  const startRefreshCooldown = useCallback(() => {
    clearRefreshCooldown();
    setIsRefreshCoolingDown(true);

    refreshCooldownRef.current = window.setTimeout(() => {
      refreshCooldownRef.current = null;
      setIsRefreshCoolingDown(false);
    }, refreshCooldownMs);
  }, [clearRefreshCooldown]);

  useEffect(() => {
    return () => clearRefreshCooldown();
  }, [clearRefreshCooldown]);

  useEffect(() => {
    clearRefreshCooldown();
    setIsRefreshCoolingDown(false);
    setSelectedViewId(masterChestViewId);
    setIsGmAddModalOpen(false);
    setIsCustomEquipmentModalOpen(false);
    setPendingItemRemoval(null);
    setSelectedInspection(null);
    setTransactionLog(createEmptyTransactionLog());
  }, [clearRefreshCooldown, partyGroupId]);

  useEffect(() => {
    if (
      selectedViewId !== masterChestViewId &&
      !partyInventoryMembers.some((member) => member.characterId === selectedViewId)
    ) {
      setSelectedViewId(masterChestViewId);
    }
  }, [partyInventoryMembers, selectedViewId]);

  useEffect(() => {
    if (!isMasterChestView) {
      setIsCurrencyModalOpen(false);
      setIsGmAddModalOpen(false);
      setIsCustomEquipmentModalOpen(false);
      setPendingItemRemoval(null);
    }
  }, [isMasterChestView]);

  function moveItem(direction: "deposit" | "withdraw", item: GroupedInventoryItem) {
    if (!canTransferItems) {
      return;
    }

    const sourceInventoryItems =
      direction === "deposit" ? draft.characterInventoryItems : draft.chestInventoryItems;
    const destinationInventoryItems =
      direction === "deposit" ? draft.chestInventoryItems : draft.characterInventoryItems;
    const result = moveOneInventoryItemCopyBetweenRootInventories(
      sourceInventoryItems,
      destinationInventoryItems,
      item.stackId
    );

    if (result.blockReason) {
      setNotice(
        getMasterChestTransferBlockTitle(
          result.blockReason,
          direction === "deposit" ? "Master Chest" : "Inventory"
        ) ?? "This item cannot be moved."
      );
      return;
    }

    setDraft(
      direction === "deposit"
        ? {
            ...draft,
            characterInventoryItems: result.sourceInventoryItems,
            chestInventoryItems: result.destinationInventoryItems
          }
        : {
            ...draft,
            characterInventoryItems: result.destinationInventoryItems,
            chestInventoryItems: result.sourceInventoryItems
          }
    );
    setTransactionLog((currentLog) =>
      addTransactionItem(
        currentLog,
        direction === "deposit" ? "transferredInItems" : "transferredOutItems",
        item.name
      )
    );
    setNotice(null);
  }

  function moveCurrency(direction: "deposit" | "withdraw") {
    if (normalizedCurrencyAmount <= 0) {
      return;
    }

    if (direction === "deposit" && !canDepositCurrency) {
      setNotice(`Not enough ${activeCurrencyDefinition.label.toLowerCase()} to deposit.`);
      return;
    }

    if (direction === "withdraw" && !canWithdrawCurrency) {
      setNotice(`Not enough ${activeCurrencyDefinition.label.toLowerCase()} to withdraw.`);
      return;
    }

    const characterDelta =
      isGmMode ? 0 : direction === "deposit" ? -normalizedCurrencyAmount : normalizedCurrencyAmount;
    const chestDelta =
      direction === "deposit" ? normalizedCurrencyAmount : -normalizedCurrencyAmount;

    setDraft({
      ...draft,
      characterCurrencies: {
        ...draft.characterCurrencies,
        [activeCurrencyKey]: Math.max(
          0,
          (draft.characterCurrencies[activeCurrencyKey] ?? 0) + characterDelta
        )
      },
      chestCurrencies: {
        ...draft.chestCurrencies,
        [activeCurrencyKey]: Math.max(
          0,
          (draft.chestCurrencies[activeCurrencyKey] ?? 0) + chestDelta
        )
      }
    });
    setTransactionLog((currentLog) =>
      addTransactionCurrency(
        currentLog,
        direction === "deposit" ? "deposits" : "withdrawals",
        activeCurrencyKey,
        normalizedCurrencyAmount
      )
    );
    setNotice(null);
    setCurrencyAmountDraft(0);
  }

  function openGmAddModal() {
    if (!canGmEditChest) {
      return;
    }

    setNotice(null);
    setError(null);
    setSelectedInspection(null);
    setIsGmAddModalOpen(true);
  }

  function openGmCustomEquipmentCreator() {
    if (!canGmEditChest) {
      return;
    }

    setIsGmAddModalOpen(false);
    setIsCustomEquipmentModalOpen(true);
  }

  function closeGmCustomEquipmentModal() {
    setIsCustomEquipmentModalOpen(false);
  }

  function openGmInspectionFromBrowser(
    item: { key: string },
    options?: EquipmentItemBrowserSelectionOptions
  ) {
    if (!canGmEditChest) {
      return;
    }

    setNotice(null);
    setSelectedInspection(createMasterChestBrowserInspection(item, options));
  }

  function openInventoryInspection(item: GroupedInventoryItem) {
    setNotice(null);
    setSelectedInspection(createMasterChestStackInspection(item));
  }

  function showMasterChestObjectLimitNotice(inventoryItems = draft.chestInventoryItems) {
    setNotice(getMasterChestObjectLimitMessage(inventoryItems));
  }

  function addGmChestItem(inspection: MasterChestItemInspection, item: ItemRecord) {
    if (!canGmEditChest || !item.key) {
      return;
    }

    const itemName = getTransactionItemName(item);

    if (!canAddMasterChestInspectionItem(draft.chestInventoryItems, inspection, item)) {
      showMasterChestObjectLimitNotice();
      return;
    }

    setDraft({
      ...draft,
      chestInventoryItems: addMasterChestInspectionItem(
        draft.chestInventoryItems,
        inspection,
        item
      )
    });
    setTransactionLog((currentLog) => addTransactionItem(currentLog, "transferredInItems", itemName));
    setNotice(null);
  }

  function buyGmChestItem(inspection: MasterChestItemInspection, item: ItemRecord) {
    if (!canGmEditChest || !item.key) {
      return;
    }

    const transactionCost = getItemTransactionCost(item);
    const itemName = getTransactionItemName(item);

    if (!transactionCost || transactionCost.amount <= 0) {
      return;
    }

    if ((draft.chestCurrencies[transactionCost.currencyKey] ?? 0) < transactionCost.amount) {
      setNotice(`Not enough ${transactionCost.currency} to buy ${itemName}.`);
      return;
    }

    if (!canAddMasterChestInspectionItem(draft.chestInventoryItems, inspection, item)) {
      showMasterChestObjectLimitNotice();
      return;
    }

    setDraft({
      ...draft,
      chestCurrencies: {
        ...draft.chestCurrencies,
        [transactionCost.currencyKey]:
          (draft.chestCurrencies[transactionCost.currencyKey] ?? 0) - transactionCost.amount
      },
      chestInventoryItems: addMasterChestInspectionItem(
        draft.chestInventoryItems,
        inspection,
        item
      )
    });
    setTransactionLog((currentLog) =>
      addTransactionCurrency(
        addTransactionItem(currentLog, "transferredInItems", itemName),
        "withdrawals",
        transactionCost.currencyKey,
        transactionCost.amount
      )
    );
    setNotice(null);
  }

  function requestGmChestItemRemoval(
    action: MasterChestRemovalAction,
    inspection: MasterChestItemInspection,
    item: ItemRecord
  ) {
    if (!canGmEditChest || !item.key) {
      return;
    }

    if (masterChestInspectionHasContainerContents(draft.chestInventoryItems, inspection)) {
      setPendingItemRemoval({ action, inspection, item });
      return;
    }

    removeGmChestItem(action, inspection, item);
  }

  function removeGmChestItem(
    action: MasterChestRemovalAction,
    inspection: MasterChestItemInspection,
    item: ItemRecord
  ) {
    if (!canGmEditChest || !item.key) {
      return;
    }

    const nextInventoryItems = removeMasterChestInspectionItem(
      draft.chestInventoryItems,
      inspection
    );

    if (nextInventoryItems === draft.chestInventoryItems) {
      return;
    }

    const itemName = getTransactionItemName(item);

    if (action === "sell") {
      const transactionCost = getItemTransactionCost(item, {
        multiplier: 0.5,
        rounding: "floor"
      });

      if (!transactionCost || transactionCost.amount <= 0) {
        return;
      }

      setDraft({
        ...draft,
        chestCurrencies: {
          ...draft.chestCurrencies,
          [transactionCost.currencyKey]:
            (draft.chestCurrencies[transactionCost.currencyKey] ?? 0) + transactionCost.amount
        },
        chestInventoryItems: nextInventoryItems
      });
      setTransactionLog((currentLog) =>
        addTransactionCurrency(
          addTransactionItem(currentLog, "transferredOutItems", itemName),
          "deposits",
          transactionCost.currencyKey,
          transactionCost.amount
        )
      );
    } else {
      setDraft({
        ...draft,
        chestInventoryItems: nextInventoryItems
      });
      setTransactionLog((currentLog) =>
        addTransactionItem(currentLog, "transferredOutItems", itemName)
      );
    }

    setNotice(null);
  }

  function confirmPendingItemRemoval() {
    if (!pendingItemRemoval) {
      return;
    }

    removeGmChestItem(
      pendingItemRemoval.action,
      pendingItemRemoval.inspection,
      pendingItemRemoval.item
    );
    setPendingItemRemoval(null);
  }

  function saveGmCustomEquipment(payload: CustomEquipmentEditorSavePayload) {
    if (!canGmEditChest) {
      return;
    }

    if (!canAddInventoryObject(draft.chestInventoryItems, { kind: "new-root-stack" })) {
      showMasterChestObjectLimitNotice();
      return;
    }

    const newStack = createCharacterInventoryItem(payload.item, {
      quantity: 1,
      mods: payload.mods,
      chargesTotal: payload.settings.chargesTotal,
      chargesRecharge: payload.settings.chargesRecharge,
      storedSpell: payload.settings.storedSpell,
      featureTags: payload.settings.featureTags,
      customTag: payload.settings.customTag,
      spellcastingFocusSources: payload.settings.spellcastingFocusSources,
      conjuredSource: payload.settings.conjuredSource,
      conjuredDuration: payload.settings.conjuredDuration
    });

    setDraft({
      ...draft,
      chestInventoryItems: [...draft.chestInventoryItems, newStack]
    });
    setTransactionLog((currentLog) =>
      addTransactionItem(currentLog, "transferredInItems", getTransactionItemName(payload.item))
    );
    setNotice(null);
    setIsCustomEquipmentModalOpen(false);
  }

  async function saveMasterChest() {
    const actorCharacterId = character?.storageMetadata?.sync?.remoteId;

    if (isSaving || revision === null) {
      return;
    }

    if (mode === "player" && !actorCharacterId) {
      setError("This character must be synced before using the master chest.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const chestInventoryItems = normalizeCharacterInventoryItems(draft.chestInventoryItems);
      const chestCurrencies = normalizeMasterChestCurrencies(draft.chestCurrencies);

      await updatePartyGroupMasterChest(
        partyGroupId,
        {
          ...(actorCharacterId ? { actorCharacterId } : {}),
          baseRevision: revision,
          currencies: chestCurrencies,
          inventoryItems: chestInventoryItems,
          transactionSummary: createTransactionSummary(transactionLog)
        },
        { suppressFailureToast: true }
      );

      if (mode === "player") {
        onSaveCharacterDraft?.({
          currencies: normalizeMasterChestCurrencies(draft.characterCurrencies),
          inventoryItems: normalizeCharacterInventoryItems(draft.characterInventoryItems)
        });
      }
      onClose();
    } catch (saveError) {
      setError(getMasterChestErrorMessage(saveError, "Unable to save master chest."));
    } finally {
      setIsSaving(false);
    }
  }

  function handleSelectedViewChange(nextViewId: string) {
    setSelectedViewId(nextViewId);
    setIsGmAddModalOpen(false);
    setIsCustomEquipmentModalOpen(false);
    setPendingItemRemoval(null);
    setSelectedInspection(null);
    setNotice(null);
    setError(null);
  }

  function handleRefreshRequest() {
    if (loadStatus === "loading" || isSaving || isRefreshing || isRefreshCoolingDown) {
      return;
    }

    if (hasUnsavedTransferDraft) {
      setIsRefreshConfirmationOpen(true);
      return;
    }

    void refreshMasterChestData();
  }

  async function refreshMasterChestData() {
    setIsRefreshConfirmationOpen(false);
    setCurrencyAmountDraft(0);
    setNotice(null);
    setIsGmAddModalOpen(false);
    setIsCustomEquipmentModalOpen(false);
    setPendingItemRemoval(null);
    setSelectedInspection(null);
    setTransactionLog(createEmptyTransactionLog());
    setIsRefreshing(true);

    try {
      const didRefresh = await loadMasterChestData();

      if (didRefresh) {
        startRefreshCooldown();
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  const title = partyGroupName?.trim() ? partyGroupName : "Party Chest";

  return (
    <SheetModal
      titleId="master-chest-modal-title"
      onClose={onClose}
      size="large"
      panelClassName={containerStyles.modal}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Master Chest</OverlayEyebrow>
          <OverlayTitle id="master-chest-modal-title">{title}</OverlayTitle>
          <OverlaySummary>
            {isGmMode
              ? "Inspect shared party items and manage chest currency."
              : "Move items and currency between inventory and the party chest."}
          </OverlaySummary>
        </OverlayHeaderContent>
        <div className={styles.headerActions}>
          <ActionButton
            actionType={isRefreshCoolingDown ? "SUCCESS" : "INFO"}
            variant="FILL"
            size="sm"
            fullWidth={false}
            icon={refreshButtonIcon}
            loading={isRefreshing}
            loadingLabel="Refreshing master chest"
            disabled={loadStatus === "loading" || isSaving || isRefreshCoolingDown}
            aria-label={refreshButtonLabel}
            title={refreshButtonLabel}
            onClick={handleRefreshRequest}
          >
            {isRefreshCoolingDown ? "Refreshed" : "Refresh"}
          </ActionButton>
          <SheetActionButton
            disabled={loadStatus !== "ready"}
            onClick={() => setIsHistoryModalOpen(true)}
          >
            <History size={16} aria-hidden="true" />
            History
          </SheetActionButton>
          <OverlayCloseButton label="Close master chest" onClick={onClose} />
        </div>
      </OverlayHeader>

      {loadStatus === "loading" ? (
        <OverlayBody className={clsx(styles.body, styles.statusBody)}>
          <p className={styles.notice}>Loading master chest...</p>
        </OverlayBody>
      ) : loadStatus === "error" ? (
        <OverlayBody className={clsx(styles.body, styles.statusBody)}>
          <p className={styles.error}>{error ?? "Unable to load master chest."}</p>
        </OverlayBody>
      ) : (
        <OverlayBody className={styles.body}>
          <div className={styles.bodyToolbar}>
            <div className={styles.viewControls}>
              <label className={styles.viewSelector}>
                <span className={styles.viewSelectorLabel}>View</span>
                <SelectInput
                  compact
                  value={selectedViewId}
                  onChange={(event) => handleSelectedViewChange(event.target.value)}
                >
                  <option value={masterChestViewId}>Master Chest</option>
                  {partyInventoryMembers.map((member) => (
                    <option key={member.characterId} value={member.characterId}>
                      {`${member.summary.name} (${member.user.nickname})`}
                    </option>
                  ))}
                </SelectInput>
              </label>
              {isGmMode ? (
                <SheetActionButton disabled={!canGmEditChest || isSaving} onClick={openGmAddModal}>
                  <Pencil size={16} aria-hidden="true" />
                  Edit
                </SheetActionButton>
              ) : null}
            </div>
            <CurrencyPill
              currencies={displayCurrencies}
              disabled={!isMasterChestView}
              onClick={() => {
                if (isMasterChestView) {
                  setIsCurrencyModalOpen(true);
                }
              }}
            />
          </div>
          <div
            className={clsx(
              styles.inventoryGrid,
              canTransferItems ? styles.transferBody : styles.readOnlyBody
            )}
          >
            {canTransferItems ? (
              <MasterChestInventoryColumn
                destinationInventoryItems={draft.chestInventoryItems}
                destinationName="Master Chest"
                direction="deposit"
                inventoryItems={draft.characterInventoryItems}
                onInspect={openInventoryInspection}
                onMove={(item) => moveItem("deposit", item)}
                title="Inventory"
              />
            ) : null}
            <MasterChestInventoryColumn
              destinationInventoryItems={draft.characterInventoryItems}
              destinationName="Inventory"
              direction={canTransferItems ? "withdraw" : "read-only"}
              inventoryItems={displayedInventoryItems}
              onInspect={openInventoryInspection}
              onMove={(item) => moveItem("withdraw", item)}
              title={selectedPartyMember?.summary.name ?? "Master Chest"}
            />
            {notice ? <p className={styles.notice}>{notice}</p> : null}
            {error ? <p className={styles.error}>{error}</p> : null}
          </div>
        </OverlayBody>
      )}

      <OverlayFooter>
        <div
          className={clsx(
            isMasterChestView ? styles.footerActions : styles.readOnlyFooterActions
          )}
        >
          <ActionButton variant="OUTLINE" onClick={onClose}>
            {isGmMode || !isMasterChestView ? "Close" : "Cancel"}
          </ActionButton>
          {isMasterChestView ? (
            <ActionButton
              icon={<Save size={16} aria-hidden="true" />}
              disabled={loadStatus !== "ready" || isSaving}
              onClick={() => {
                void saveMasterChest();
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </ActionButton>
          ) : null}
        </div>
      </OverlayFooter>

      {isCurrencyModalOpen && loadStatus === "ready" && isMasterChestView ? (
        <MasterChestCurrencyModal
          activeCurrencyDefinition={activeCurrencyDefinition}
          activeCurrencyKey={activeCurrencyKey}
          canDeposit={canDepositCurrency}
          canWithdraw={canWithdrawCurrency}
          characterCurrencies={draft.characterCurrencies}
          chestCurrencies={draft.chestCurrencies}
          currencies={currencyDefinitions}
          currencyAmountDraft={currencyAmountDraft}
          isGmMode={isGmMode}
          onChangeAmount={setCurrencyAmountDraft}
          onChangeCurrency={setActiveCurrencyKey}
          onClose={() => setIsCurrencyModalOpen(false)}
          onDeposit={() => moveCurrency("deposit")}
          onWithdraw={() => moveCurrency("withdraw")}
        />
      ) : null}

      {isHistoryModalOpen && loadStatus === "ready" ? (
        <MasterChestHistoryModal history={history} onClose={() => setIsHistoryModalOpen(false)} />
      ) : null}

      <EquipmentItemBrowserModal
        isOpen={isGmAddModalOpen}
        currencies={draft.chestCurrencies}
        onClose={() => setIsGmAddModalOpen(false)}
        onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
        onOpenCustomEquipmentCreator={openGmCustomEquipmentCreator}
        onItemSelect={openGmInspectionFromBrowser}
      />

      {isCustomEquipmentModalOpen ? (
        <MasterChestCustomEquipmentModal
          onClose={closeGmCustomEquipmentModal}
          onSave={saveGmCustomEquipment}
        />
      ) : null}

      <MasterChestItemInspectionDrawer
        currencies={draft.chestCurrencies}
        editMode={canGmEditChest}
        inspection={selectedInspection}
        inventoryItems={displayedInventoryItems}
        notice={notice}
        onAdd={addGmChestItem}
        onBuy={buyGmChestItem}
        onClose={() => setSelectedInspection(null)}
        onRemove={(inspection, item) => requestGmChestItemRemoval("remove", inspection, item)}
        onSell={(inspection, item) => requestGmChestItemRemoval("sell", inspection, item)}
      />

      {isRefreshConfirmationOpen ? (
        <DestructiveConfirmationModal
          titleId={refreshConfirmTitleId}
          title="Refresh master chest?"
          message="Refreshing will discard your unsaved item and currency moves in this modal."
          confirmLabel="Refresh"
          cancelLabel="Keep Editing"
          closeLabel="Close refresh confirmation"
          onCancel={() => setIsRefreshConfirmationOpen(false)}
          onConfirm={() => {
            void refreshMasterChestData();
          }}
        />
      ) : null}

      {pendingItemRemoval ? (
        <DestructiveConfirmationModal
          titleId="master-chest-item-removal-title"
          title={
            pendingItemRemoval.action === "sell"
              ? "Sell container and contents?"
              : "Remove container and contents?"
          }
          message={
            <>
              This will delete <strong>{getTransactionItemName(pendingItemRemoval.item)}</strong>{" "}
              and everything inside it from the master chest.
            </>
          }
          confirmLabel={pendingItemRemoval.action === "sell" ? "Sell" : "Remove"}
          closeLabel="Close master chest item removal confirmation"
          onCancel={() => setPendingItemRemoval(null)}
          onConfirm={confirmPendingItemRemoval}
        />
      ) : null}
    </SheetModal>
  );
}

function CurrencyPill({
  currencies,
  disabled,
  onClick
}: {
  currencies: CharacterCurrencies;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <CurrencyBalancePill
      currencies={currencies}
      className={styles.masterChestCurrencyPill}
      disabled={disabled}
      onClick={onClick}
    />
  );
}

export default MasterChestModal;
