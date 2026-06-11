import clsx from "clsx";
import { History, Minus, MoveLeft, MoveRight, Package, Plus, Save } from "lucide-react";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import ActionButton from "../../../ActionButton";
import {
  ApiRequestFailedError,
  getPartyGroupMasterChest,
  isApiAbortError,
  updatePartyGroupMasterChest
} from "../../../../api";
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
  SheetModal
} from "../../../Overlay";
import NumberInput from "../../FormInputs/NumberInput";
import type { Character, CharacterCurrencies, CharacterInventoryItem, CurrencyKey } from "../../../../types";
import { createDefaultCurrencies } from "../../../../pages/CharactersPage/constants";
import {
  getInventoryItemTotalWeightValue,
  getInventoryObjectCount,
  getInventoryRootTransferBlockReason,
  groupCharacterInventoryItems,
  INVENTORY_OBJECT_LIMIT,
  isInventoryContainerItem,
  moveOneInventoryItemCopyBetweenRootInventories,
  normalizeCharacterInventoryItems,
  type GroupedInventoryItem,
  type InventoryRootTransferBlockReason
} from "../../../../pages/CharactersPage/inventoryItems";
import { normalizeCharacterCurrencies } from "../../../../pages/CharactersPage/storage";
import { formatEquipmentWeight } from "../../../../utils/codex";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { formatCurrencyPillAmount, formatInventoryStackName, normalizeCurrencyAmountInput } from "./equipmentLoadoutModel";
import containerStyles from "./EquipmentContainerManageModal.module.css";
import styles from "./MasterChestModal.module.css";

type MasterChestMode = "player" | "gm";

type MasterChestDraft = {
  characterCurrencies: CharacterCurrencies;
  characterInventoryItems: CharacterInventoryItem[];
  chestCurrencies: CharacterCurrencies;
  chestInventoryItems: CharacterInventoryItem[];
};

type MasterChestTransactionLog = {
  deposits: Partial<Record<CurrencyKey, number>>;
  transferredInItems: Record<string, number>;
  transferredOutItems: Record<string, number>;
  withdrawals: Partial<Record<CurrencyKey, number>>;
};

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

function formatWeight(weight: number): string {
  return formatEquipmentWeight(Math.round(weight * 100) / 100);
}

function getInventoryWeight(inventoryItems: CharacterInventoryItem[]): number {
  return inventoryItems.reduce(
    (totalWeight, entry) => totalWeight + getInventoryItemTotalWeightValue(entry),
    0
  );
}

function createInitialDraft(character: Character | undefined): MasterChestDraft {
  return {
    characterCurrencies: normalizeCharacterCurrencies(
      character?.currencies,
      createDefaultCurrencies()
    ),
    characterInventoryItems: normalizeCharacterInventoryItems(character?.inventoryItems),
    chestCurrencies: createDefaultCurrencies(),
    chestInventoryItems: []
  };
}

function getMasterChestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestFailedError) {
    if (error.code === "MASTER_CHEST_REVISION_CONFLICT") {
      return "Master chest changed. Close and reopen it to get the latest contents.";
    }

    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

function getTransferBlockTitle(
  reason: InventoryRootTransferBlockReason | null,
  destinationName: string
): string | undefined {
  if (reason === "object-limit") {
    return `${destinationName} limit reached (${INVENTORY_OBJECT_LIMIT}).`;
  }

  return reason === "invalid" ? "This item cannot be moved." : undefined;
}

function normalizeCurrencies(value: unknown): CharacterCurrencies {
  return normalizeCharacterCurrencies(value, createDefaultCurrencies());
}

function createEmptyTransactionLog(): MasterChestTransactionLog {
  return {
    deposits: {},
    transferredInItems: {},
    transferredOutItems: {},
    withdrawals: {}
  };
}

function addTransactionItem(
  log: MasterChestTransactionLog,
  key: "transferredInItems" | "transferredOutItems",
  itemName: string
): MasterChestTransactionLog {
  return {
    ...log,
    [key]: {
      ...log[key],
      [itemName]: (log[key][itemName] ?? 0) + 1
    }
  };
}

function addTransactionCurrency(
  log: MasterChestTransactionLog,
  key: "deposits" | "withdrawals",
  currencyKey: CurrencyKey,
  amount: number
): MasterChestTransactionLog {
  return {
    ...log,
    [key]: {
      ...log[key],
      [currencyKey]: (log[key][currencyKey] ?? 0) + amount
    }
  };
}

function formatTransactionItems(items: Record<string, number>): string | null {
  const entries = Object.entries(items).filter(([, count]) => count > 0);

  if (entries.length === 0) {
    return null;
  }

  return entries
    .map(([itemName, count]) => `x${count} ${itemName}`)
    .join(", ");
}

function formatTransactionCurrencies(currencies: Partial<Record<CurrencyKey, number>>): string | null {
  const entries = currencyDefinitions
    .map((currency) => ({
      ...currency,
      amount: currencies[currency.key] ?? 0
    }))
    .filter((currency) => currency.amount > 0);

  if (entries.length === 0) {
    return null;
  }

  return entries
    .map((currency) => `${formatCurrencyPillAmount(currency.amount)}${currency.code}`)
    .join(", ");
}

function createTransactionSummary(log: MasterChestTransactionLog): string | undefined {
  const sections: string[] = [];
  const transferredInItems = formatTransactionItems(log.transferredInItems);
  const transferredOutItems = formatTransactionItems(log.transferredOutItems);
  const deposits = formatTransactionCurrencies(log.deposits);
  const withdrawals = formatTransactionCurrencies(log.withdrawals);

  if (transferredInItems) {
    sections.push(`Transferred-in (${transferredInItems})`);
  }

  if (transferredOutItems) {
    sections.push(`Transferred-out (${transferredOutItems})`);
  }

  if (deposits) {
    sections.push(`Deposit (${deposits})`);
  }

  if (withdrawals) {
    sections.push(`Withdraw (${withdrawals})`);
  }

  return sections.length > 0 ? sections.join(", ") : undefined;
}

type ParsedHistoryAction = {
  content: string;
  label: string;
};

type ParsedHistoryEntry = {
  actions: ParsedHistoryAction[];
  actor: string;
  timestamp: string;
};

const historyActionPattern =
  /(?:^|,\s*)(Transferred-in|Transferred-out|Deposit|Withdraw) \((.*?)\)(?=,\s*(?:Transferred-in|Transferred-out|Deposit|Withdraw) \(|$)/g;

function parseHistoryEntry(entry: string): ParsedHistoryEntry {
  const [, timestamp = "", actor = "", summary = entry] =
    entry.match(/^(\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}) - ([^:]+): (.+)$/) ?? [];
  const actions: ParsedHistoryAction[] = [];

  for (const match of summary.matchAll(historyActionPattern)) {
    const [, label, content] = match;

    if (label && content) {
      actions.push({ label, content });
    }
  }

  return {
    actions,
    actor,
    timestamp
  };
}

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
  const [draft, setDraft] = useState<MasterChestDraft>(() => createInitialDraft(character));
  const [history, setHistory] = useState<string[]>([]);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const [revision, setRevision] = useState<number | null>(null);
  const [activeCurrencyKey, setActiveCurrencyKey] = useState<CurrencyKey>("gold");
  const [currencyAmountDraft, setCurrencyAmountDraft] = useState(0);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [transactionLog, setTransactionLog] = useState<MasterChestTransactionLog>(
    createEmptyTransactionLog
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isGmMode = mode === "gm";
  const canTransferItems = mode === "player";
  const activeCurrencyDefinition =
    currencyDefinitions.find((currency) => currency.key === activeCurrencyKey) ??
    currencyDefinitions[3];
  const normalizedCurrencyAmount = Math.max(0, Math.floor(currencyAmountDraft));
  const canDepositCurrency =
    normalizedCurrencyAmount > 0 &&
    (isGmMode || (draft.characterCurrencies[activeCurrencyKey] ?? 0) >= normalizedCurrencyAmount);
  const canWithdrawCurrency =
    normalizedCurrencyAmount > 0 &&
    (draft.chestCurrencies[activeCurrencyKey] ?? 0) >= normalizedCurrencyAmount;

  useEffect(() => {
    const abortController = new AbortController();

    setLoadStatus("loading");
    setError(null);
    setNotice(null);
    setHistory([]);
    setTransactionLog(createEmptyTransactionLog());

    void getPartyGroupMasterChest(partyGroupId, {
      signal: abortController.signal,
      suppressFailureToast: true
    })
      .then(({ masterChest }) => {
        setDraft((currentDraft) => ({
          ...currentDraft,
          chestCurrencies: normalizeCurrencies(masterChest.currencies),
          chestInventoryItems: normalizeCharacterInventoryItems(masterChest.inventoryItems)
        }));
        setHistory(Array.isArray(masterChest.history) ? masterChest.history : []);
        setRevision(masterChest.revision);
        setLoadStatus("ready");
      })
      .catch((loadError) => {
        if (isApiAbortError(loadError)) {
          return;
        }

        setError(getMasterChestErrorMessage(loadError, "Unable to load master chest."));
        setLoadStatus("error");
      });

    return () => {
      abortController.abort();
    };
  }, [partyGroupId]);

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
        getTransferBlockTitle(
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
        formatInventoryStackName(item)
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
      const chestCurrencies = normalizeCurrencies(draft.chestCurrencies);

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
          currencies: normalizeCurrencies(draft.characterCurrencies),
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
          <button
            type="button"
            className={styles.historyHeaderButton}
            disabled={loadStatus !== "ready"}
            onClick={() => setIsHistoryModalOpen(true)}
          >
            <History size={16} aria-hidden="true" />
            History
          </button>
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
            <CurrencyPill
              currencies={draft.chestCurrencies}
              disabled={false}
              onClick={() => setIsCurrencyModalOpen(true)}
            />
          </div>
          <div
            className={clsx(
              styles.inventoryGrid,
              canTransferItems ? styles.transferBody : styles.readOnlyBody
            )}
          >
            {canTransferItems ? (
              <InventoryColumn
                destinationInventoryItems={draft.chestInventoryItems}
                destinationName="Master Chest"
                direction="deposit"
                inventoryItems={draft.characterInventoryItems}
                onMove={(item) => moveItem("deposit", item)}
                title="Inventory"
              />
            ) : null}
            <InventoryColumn
              destinationInventoryItems={draft.characterInventoryItems}
              destinationName="Inventory"
              direction={canTransferItems ? "withdraw" : "read-only"}
              inventoryItems={draft.chestInventoryItems}
              onMove={(item) => moveItem("withdraw", item)}
              title="Master Chest"
            />
            {notice ? <p className={styles.notice}>{notice}</p> : null}
            {error ? <p className={styles.error}>{error}</p> : null}
          </div>
        </OverlayBody>
      )}

      <OverlayFooter>
        <div className={styles.footerActions}>
          <ActionButton variant="OUTLINE" onClick={onClose}>
            {isGmMode ? "Close" : "Cancel"}
          </ActionButton>
          <ActionButton
            icon={<Save size={16} aria-hidden="true" />}
            disabled={loadStatus !== "ready" || isSaving}
            onClick={() => {
              void saveMasterChest();
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </ActionButton>
        </div>
      </OverlayFooter>

      {isCurrencyModalOpen && loadStatus === "ready" ? (
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
    </SheetModal>
  );
}

function InventoryColumn({
  destinationInventoryItems,
  destinationName,
  direction,
  inventoryItems,
  onMove,
  title
}: {
  destinationInventoryItems: CharacterInventoryItem[];
  destinationName: string;
  direction: "deposit" | "withdraw" | "read-only";
  inventoryItems: CharacterInventoryItem[];
  onMove: (item: GroupedInventoryItem) => void;
  title: string;
}) {
  const groupedItems = useMemo(() => groupCharacterInventoryItems(inventoryItems), [inventoryItems]);
  const inventoryWeight = useMemo(() => getInventoryWeight(inventoryItems), [inventoryItems]);
  const objectCount = useMemo(() => getInventoryObjectCount(inventoryItems), [inventoryItems]);

  return (
    <section className={containerStyles.column}>
      <header className={containerStyles.columnHeader}>
        <h4>{title}</h4>
        <div className={containerStyles.columnHeaderMeta}>
          <span
            className={clsx(
              containerStyles.columnHeaderMetric,
              objectCount >= INVENTORY_OBJECT_LIMIT && containerStyles.columnHeaderMetricLimit
            )}
          >
            {`${objectCount}/${INVENTORY_OBJECT_LIMIT}`}
          </span>
          <span className={containerStyles.columnHeaderMetric}>{formatWeight(inventoryWeight)}</span>
        </div>
      </header>
      {groupedItems.length > 0 ? (
        <ul className={containerStyles.itemList}>
          {groupedItems.map((item) => (
            <InventoryColumnItem
              key={item.stackId}
              destinationInventoryItems={destinationInventoryItems}
              destinationName={destinationName}
              direction={direction}
              inventoryItems={inventoryItems}
              item={item}
              onMove={onMove}
            />
          ))}
        </ul>
      ) : (
        <p className={containerStyles.emptyText}>{title} is empty.</p>
      )}
    </section>
  );
}

function InventoryColumnItem({
  destinationInventoryItems,
  destinationName,
  direction,
  inventoryItems,
  item,
  onMove
}: {
  destinationInventoryItems: CharacterInventoryItem[];
  destinationName: string;
  direction: "deposit" | "withdraw" | "read-only";
  inventoryItems: CharacterInventoryItem[];
  item: GroupedInventoryItem;
  onMove: (item: GroupedInventoryItem) => void;
}) {
  const isReadOnly = direction === "read-only";
  const blockReason = isReadOnly
    ? null
    : getInventoryRootTransferBlockReason(
        inventoryItems,
        destinationInventoryItems,
        item.stackId
      );
  const isDisabled = Boolean(blockReason);
  const isContainer = isInventoryContainerItem(item.stack);
  const icon =
    direction === "deposit" ? (
      <MoveRight size={17} aria-hidden="true" />
    ) : direction === "withdraw" ? (
      <MoveLeft size={17} aria-hidden="true" />
    ) : (
      <Package size={17} aria-hidden="true" />
    );
  const content = (
    <>
      <span className={containerStyles.itemText}>
        <span className={containerStyles.itemName}>{formatInventoryStackName(item)}</span>
        <span className={containerStyles.itemMeta}>
          {isContainer ? "Container" : formatWeight(getInventoryItemTotalWeightValue(item.stack))}
        </span>
      </span>
      <span className={containerStyles.itemAction}>{icon}</span>
    </>
  );

  if (isReadOnly) {
    return (
      <li>
        <div className={clsx(containerStyles.itemButton, styles.readOnlyItem)}>{content}</div>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        className={clsx(containerStyles.itemButton, isDisabled && containerStyles.itemButtonDisabled)}
        disabled={isDisabled}
        title={getTransferBlockTitle(blockReason, destinationName)}
        onClick={() => onMove(item)}
      >
        {content}
      </button>
    </li>
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
    <button
      type="button"
      className={clsx(styles.currencyPill, disabled && styles.currencyPillDisabled)}
      disabled={disabled}
      onClick={onClick}
    >
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
              {formatCurrencyPillAmount(currencies[currency.key] ?? 0)}
            </span>
            <span className={styles.currencyPillTokenCode}>{currency.code}</span>
          </span>
        ))}
      </span>
    </button>
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
