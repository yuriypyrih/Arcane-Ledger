import clsx from "clsx";
import { CircleCheck, History, Minus, Plus, RefreshCw, Save } from "lucide-react";
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode
} from "react";
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
import NumberInput from "../../FormInputs/NumberInput";
import SelectInput from "../../FormInputs/SelectInput";
import type { Character, CharacterCurrencies, CharacterInventoryItem, CurrencyKey } from "../../../../types";
import {
  moveOneInventoryItemCopyBetweenRootInventories,
  normalizeCharacterInventoryItems,
  type GroupedInventoryItem
} from "../../../../pages/CharactersPage/inventoryItems";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { formatCurrencyPillAmount, normalizeCurrencyAmountInput } from "./equipmentLoadoutModel";
import SheetActionButton from "../SheetActionButton";
import containerStyles from "./EquipmentContainerManageModal.module.css";
import MasterChestInventoryColumn from "./MasterChestInventoryColumn";
import MasterChestItemInspectionDrawer from "./MasterChestItemInspectionDrawer";
import { getMasterChestTransferBlockTitle } from "./masterChestInventoryUtils";
import {
  addTransactionCurrency,
  addTransactionItem,
  createEmptyTransactionLog,
  createTransactionSummary,
  parseHistoryEntry,
  type MasterChestTransactionLog
} from "./masterChestTransactions";
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

type CurrencyDefinition = {
  code: string;
  icon: string;
  key: CurrencyKey;
  label: string;
};

const currencyDefinitions: CurrencyDefinition[] = [
  { key: "copper", label: "Copper", code: "CP", icon: coinCopperIcon },
  { key: "silver", label: "Silver", code: "SP", icon: coinSilverIcon },
  { key: "electrum", label: "Electrum", code: "EP", icon: coinElectrumIcon },
  { key: "gold", label: "Gold", code: "GP", icon: coinGoldIcon },
  { key: "platinum", label: "Platinum", code: "PP", icon: coinPlatinumIcon }
];

const masterChestViewId = "master-chest";
const refreshCooldownMs = 5_000;

function getHistoryActionClassName(label: string) {
  if (label === "Transferred-in" || label === "Deposit") {
    return styles.historyActionIn;
  }

  if (label === "Transferred-out" || label === "Withdraw") {
    return styles.historyActionOut;
  }

  return undefined;
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
  const [selectedInspectionItem, setSelectedInspectionItem] = useState<GroupedInventoryItem | null>(
    null
  );
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
    setSelectedInspectionItem(null);
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
                onInspect={setSelectedInspectionItem}
                onMove={(item) => moveItem("deposit", item)}
                title="Inventory"
              />
            ) : null}
            <MasterChestInventoryColumn
              destinationInventoryItems={draft.characterInventoryItems}
              destinationName="Inventory"
              direction={canTransferItems ? "withdraw" : "read-only"}
              inventoryItems={selectedPartyMember?.inventoryItems ?? draft.chestInventoryItems}
              onInspect={setSelectedInspectionItem}
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

      <MasterChestItemInspectionDrawer
        item={selectedInspectionItem}
        onClose={() => setSelectedInspectionItem(null)}
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

function MasterChestCurrencyModal({
  activeCurrencyDefinition,
  activeCurrencyKey,
  canDeposit,
  canWithdraw,
  characterCurrencies,
  chestCurrencies,
  currencyAmountDraft,
  isGmMode,
  onChangeAmount,
  onChangeCurrency,
  onClose,
  onDeposit,
  onWithdraw
}: {
  activeCurrencyDefinition: CurrencyDefinition;
  activeCurrencyKey: CurrencyKey;
  canDeposit: boolean;
  canWithdraw: boolean;
  characterCurrencies: CharacterCurrencies;
  chestCurrencies: CharacterCurrencies;
  currencyAmountDraft: number;
  isGmMode: boolean;
  onChangeAmount: (value: number) => void;
  onChangeCurrency: (value: CurrencyKey) => void;
  onClose: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
}) {
  return (
    <SheetModal
      titleId="master-chest-currency-modal-title"
      onClose={onClose}
      size="small"
      backdropClassName={styles.currencyModalBackdrop}
      panelClassName={styles.currencyModal}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Currency</OverlayEyebrow>
          <OverlayTitle id="master-chest-currency-modal-title">Currency balance</OverlayTitle>
          <OverlaySummary>Deposit into or withdraw from the master chest.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close currency modal" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.currencyModalBody}>
        <div className={styles.currencySelectorRow}>
          {currencyDefinitions.map((currency) => (
            <div key={currency.key} className={styles.currencySelectorCell}>
              <span className={styles.currencySelectorHint}>
                {isGmMode
                  ? "You: Unlimited"
                  : `You: ${formatCurrencyPillAmount(characterCurrencies[currency.key] ?? 0)} ${currency.code}`}
              </span>
              <button
                type="button"
                className={clsx(
                  styles.currencySelectorButton,
                  activeCurrencyKey === currency.key && styles.currencySelectorButtonActive
                )}
                onClick={() => onChangeCurrency(currency.key)}
              >
                <img
                  src={currency.icon}
                  alt=""
                  className={styles.currencySelectorIcon}
                  aria-hidden="true"
                />
                <strong>{formatCurrencyPillAmount(chestCurrencies[currency.key] ?? 0)}</strong>
                <span>{currency.code}</span>
              </button>
            </div>
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
                onChangeAmount(normalizeCurrencyAmountInput(event.target.value, currencyAmountDraft))
              }
            />
          </label>
        </div>
      </OverlayBody>

      <OverlayFooter>
        <div className={styles.currencyModalActions}>
          <ActionButton
            actionType="SUCCESS"
            icon={<Plus size={16} aria-hidden="true" />}
            disabled={!canDeposit}
            onClick={onDeposit}
          >
            Deposit
          </ActionButton>
          <ActionButton
            actionType="ERROR"
            icon={<Minus size={16} aria-hidden="true" />}
            disabled={!canWithdraw}
            onClick={onWithdraw}
          >
            Withdraw
          </ActionButton>
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

function MasterChestHistoryModal({
  history,
  onClose
}: {
  history: string[];
  onClose: () => void;
}) {
  return (
    <SheetModal
      titleId="master-chest-history-modal-title"
      onClose={onClose}
      size="small"
      backdropClassName={styles.historyModalBackdrop}
      panelClassName={styles.historyModal}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Master Chest</OverlayEyebrow>
          <OverlayTitle id="master-chest-history-modal-title">History</OverlayTitle>
          <OverlaySummary>Latest saved transactions.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close history modal" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.historyModalBody}>
        {history.length > 0 ? (
          <ol className={styles.historyList}>
            {history.map((entry, index) => (
              <li key={`${entry}-${index}`} className={styles.historyItem}>
                <HistoryEntry entry={entry} />
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.historyEmpty}>No saved transactions yet.</p>
        )}
      </OverlayBody>

      <OverlayFooter>
        <div className={styles.readOnlyFooterActions}>
          <ActionButton variant="OUTLINE" onClick={onClose}>
            Close
          </ActionButton>
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

function HistoryEntry({ entry }: { entry: string }) {
  const parsedEntry = parseHistoryEntry(entry);

  if (!parsedEntry.timestamp || !parsedEntry.actor || parsedEntry.actions.length === 0) {
    return <span>{entry}</span>;
  }

  return (
    <article className={styles.historyEntryContent}>
      <header className={styles.historyEntryHeader}>
        <time className={styles.historyTimestamp}>{parsedEntry.timestamp}</time>
        <span className={styles.historyActor}>{parsedEntry.actor}</span>
      </header>
      <div className={styles.historyActionList}>
        {parsedEntry.actions.map((action) => (
          <div key={`${action.label}-${action.content}`} className={styles.historyAction}>
            <strong
              className={clsx(
                styles.historyActionLabel,
                getHistoryActionClassName(action.label)
              )}
            >
              {action.label}
            </strong>
            <span className={styles.historyActionTokens}>
              {formatHistoryActionContent(action.content)}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function formatHistoryActionContent(content: string): ReactNode {
  const entries = content
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return entries.map((entry, index) => (
    <Fragment key={`${entry}-${index}`}>
      {index > 0 ? <span className={styles.historyTokenSeparator}> </span> : null}
      <span className={styles.historyToken}>{entry}</span>
    </Fragment>
  ));
}

export default MasterChestModal;
