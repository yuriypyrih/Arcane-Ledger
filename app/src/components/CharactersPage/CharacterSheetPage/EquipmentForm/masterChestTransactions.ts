import type { CurrencyKey } from "../../../../types";
import { formatCurrencyPillAmount } from "./equipmentLoadoutModel";

export type MasterChestTransactionLog = {
  deposits: Partial<Record<CurrencyKey, number>>;
  transferredInItems: Record<string, number>;
  transferredOutItems: Record<string, number>;
  withdrawals: Partial<Record<CurrencyKey, number>>;
};

export type ParsedHistoryAction = {
  content: string;
  label: string;
};

export type ParsedHistoryEntry = {
  actions: ParsedHistoryAction[];
  actor: string;
  timestamp: string;
};

type TransactionCurrencyKey = "deposits" | "withdrawals";
type TransactionItemKey = "transferredInItems" | "transferredOutItems";

const transactionCurrencyOrder: CurrencyKey[] = [
  "copper",
  "silver",
  "electrum",
  "gold",
  "platinum"
];

const transactionCurrencyCodes: Record<CurrencyKey, string> = {
  copper: "CP",
  silver: "SP",
  electrum: "EP",
  gold: "GP",
  platinum: "PP"
};

const opposingCurrencyTransactionKey: Record<TransactionCurrencyKey, TransactionCurrencyKey> = {
  deposits: "withdrawals",
  withdrawals: "deposits"
};

const opposingItemTransactionKey: Record<TransactionItemKey, TransactionItemKey> = {
  transferredInItems: "transferredOutItems",
  transferredOutItems: "transferredInItems"
};

const historyActionPattern =
  /(?:^|,\s*)(Transferred-in|Transferred-out|Deposit|Withdraw) \((.*?)\)(?=,\s*(?:Transferred-in|Transferred-out|Deposit|Withdraw) \(|$)/g;

export function createEmptyTransactionLog(): MasterChestTransactionLog {
  return {
    deposits: {},
    transferredInItems: {},
    transferredOutItems: {},
    withdrawals: {}
  };
}

function normalizeTransactionAmount(amount: number): number {
  return Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0));
}

function setItemCount(
  items: Record<string, number>,
  itemName: string,
  count: number
): Record<string, number> {
  const nextItems = { ...items };

  if (count > 0) {
    nextItems[itemName] = count;
  } else {
    delete nextItems[itemName];
  }

  return nextItems;
}

function setCurrencyAmount(
  currencies: Partial<Record<CurrencyKey, number>>,
  currencyKey: CurrencyKey,
  amount: number
): Partial<Record<CurrencyKey, number>> {
  const nextCurrencies = { ...currencies };

  if (amount > 0) {
    nextCurrencies[currencyKey] = amount;
  } else {
    delete nextCurrencies[currencyKey];
  }

  return nextCurrencies;
}

export function addTransactionItem(
  log: MasterChestTransactionLog,
  key: TransactionItemKey,
  itemName: string
): MasterChestTransactionLog {
  const normalizedItemName = itemName.trim();

  if (!normalizedItemName) {
    return log;
  }

  const opposingKey = opposingItemTransactionKey[key];
  const opposingCount = log[opposingKey][normalizedItemName] ?? 0;

  if (opposingCount > 0) {
    return {
      ...log,
      [opposingKey]: setItemCount(log[opposingKey], normalizedItemName, opposingCount - 1)
    };
  }

  return {
    ...log,
    [key]: setItemCount(log[key], normalizedItemName, (log[key][normalizedItemName] ?? 0) + 1)
  };
}

export function addTransactionCurrency(
  log: MasterChestTransactionLog,
  key: TransactionCurrencyKey,
  currencyKey: CurrencyKey,
  amount: number
): MasterChestTransactionLog {
  const normalizedAmount = normalizeTransactionAmount(amount);

  if (normalizedAmount <= 0) {
    return log;
  }

  const opposingKey = opposingCurrencyTransactionKey[key];
  const opposingAmount = log[opposingKey][currencyKey] ?? 0;
  const canceledAmount = Math.min(opposingAmount, normalizedAmount);
  const remainingAmount = normalizedAmount - canceledAmount;
  let nextLog = log;

  if (canceledAmount > 0) {
    nextLog = {
      ...nextLog,
      [opposingKey]: setCurrencyAmount(
        nextLog[opposingKey],
        currencyKey,
        opposingAmount - canceledAmount
      )
    };
  }

  if (remainingAmount <= 0) {
    return nextLog;
  }

  return {
    ...nextLog,
    [key]: setCurrencyAmount(
      nextLog[key],
      currencyKey,
      (nextLog[key][currencyKey] ?? 0) + remainingAmount
    )
  };
}

function formatTransactionItems(items: Record<string, number>): string | null {
  const entries = Object.entries(items).filter(([, count]) => count > 0);

  if (entries.length === 0) {
    return null;
  }

  return entries.map(([itemName, count]) => `x${count} ${itemName}`).join(", ");
}

function formatTransactionCurrencies(
  currencies: Partial<Record<CurrencyKey, number>>
): string | null {
  const entries = transactionCurrencyOrder
    .map((currencyKey) => ({
      amount: currencies[currencyKey] ?? 0,
      code: transactionCurrencyCodes[currencyKey]
    }))
    .filter((currency) => currency.amount > 0);

  if (entries.length === 0) {
    return null;
  }

  return entries
    .map((currency) => `${formatCurrencyPillAmount(currency.amount)}${currency.code}`)
    .join(", ");
}

export function createTransactionSummary(log: MasterChestTransactionLog): string | undefined {
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

export function parseHistoryEntry(entry: string): ParsedHistoryEntry {
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
