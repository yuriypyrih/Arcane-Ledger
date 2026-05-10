import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { CodexStatus, ItemListItem, ItemOrdering } from "../../../types";
import CurrencyInlineDisplay from "../../CurrencyInlineDisplay";
import RarityPill, { hasDisplayableRarity } from "../RarityPill";
import TablePagination from "../TablePagination";
import { parseItemCost } from "../../../utils/items/cost";
import styles from "./ItemCodexTable.module.css";

type ItemCodexTableProps = {
  items: ItemListItem[];
  totalEntries: number;
  status: CodexStatus;
  search?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ordering: ItemOrdering;
  onOrderingChange: (ordering: ItemOrdering) => void;
  onItemSelect?: (item: ItemListItem) => void;
  heading?: string;
};

function getOrderingState(ordering: ItemOrdering) {
  switch (ordering) {
    case "-name":
      return { field: "name", direction: "desc" } as const;
    case "rarity":
      return { field: "rarity", direction: "asc" } as const;
    case "-rarity":
      return { field: "rarity", direction: "desc" } as const;
    case "weight":
      return { field: "weight", direction: "asc" } as const;
    case "-weight":
      return { field: "weight", direction: "desc" } as const;
    case "cost":
      return { field: "cost", direction: "asc" } as const;
    case "-cost":
      return { field: "cost", direction: "desc" } as const;
    case "name":
    default:
      return { field: "name", direction: "asc" } as const;
  }
}

function getNextOrdering(
  field: "name" | "rarity" | "weight" | "cost",
  orderingState: ReturnType<typeof getOrderingState>
) {
  const isCurrentField = orderingState.field === field;
  const nextDirection = isCurrentField && orderingState.direction === "asc" ? "desc" : "asc";

  return nextDirection === "asc" ? field : (`-${field}` as ItemOrdering);
}

function formatNumberLikeValue(value: string | null) {
  if (!value) {
    return "-";
  }

  return value.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function formatWeight(item: ItemListItem) {
  const normalizedWeight = formatNumberLikeValue(item.weight);

  if (normalizedWeight === "-") {
    return "-";
  }

  return item.weightUnit ? `${normalizedWeight} ${item.weightUnit}` : normalizedWeight;
}

function renderCost(item: ItemListItem) {
  const parsedCost = parseItemCost(item.cost);

  if (!parsedCost) {
    return "-";
  }

  return (
    <CurrencyInlineDisplay
      cost={parsedCost}
      className={styles.costDisplay}
      iconClassName={styles.costDisplayIcon}
    />
  );
}

function renderSortableHeaderCell(
  field: "name" | "rarity" | "weight" | "cost",
  orderingState: ReturnType<typeof getOrderingState>,
  onOrderingChange: (ordering: ItemOrdering) => void
) {
  const isActive = orderingState.field === field;
  const direction = isActive ? orderingState.direction : "asc";
  const label =
    field === "name"
      ? "Name"
      : field === "rarity"
        ? "Rarity"
        : field === "weight"
          ? "Weight"
          : "Cost";
  const headerClassName =
    field === "weight"
      ? `${styles.sortHeader} ${styles.weightHeader}`
      : field === "cost"
        ? `${styles.sortHeader} ${styles.costHeader}`
        : styles.sortHeader;

  return (
    <th key={field} className={headerClassName} data-active={isActive} aria-sort={getAriaSortValue(isActive, direction)}>
      <button
        type="button"
        className={styles.sortButton}
        onClick={() => onOrderingChange(getNextOrdering(field, orderingState))}
      >
        <span className={styles.sortButtonLabel}>{label}</span>
        <SortIcon isActive={isActive} direction={direction} />
      </button>
    </th>
  );
}

function ItemCodexTable({
  items,
  totalEntries,
  status,
  search = "",
  currentPage,
  totalPages,
  onPageChange,
  ordering,
  onOrderingChange,
  onItemSelect,
  heading = "Item Entries"
}: ItemCodexTableProps) {
  const navigate = useNavigate();
  const totalEntriesLabel = `${totalEntries} total ${totalEntries === 1 ? "item" : "items"}`;
  const orderingState = getOrderingState(ordering);

  function openItem(item: ItemListItem) {
    if (onItemSelect) {
      onItemSelect(item);
      return;
    }

    navigate({
      pathname: `/library/items/${item.key}`,
      search: search.length > 0 ? `?${search}` : ""
    });
  }

  function renderStatusRow() {
    if (status === "loading") {
      return (
        <tr>
          <td colSpan={6} className={styles.statusCell}>
            <div className={styles.statusContent}>
              <strong>Loading items...</strong>
              <span>Fetching item data from the local backend.</span>
            </div>
          </td>
        </tr>
      );
    }

    if (status === "error") {
      return (
        <tr>
          <td colSpan={6} className={styles.statusCell}>
            <div className={styles.statusContent}>
              <strong>Items unavailable</strong>
              <span>The items API could not be reached.</span>
            </div>
          </td>
        </tr>
      );
    }

    if (status === "server-unavailable") {
      return (
        <tr>
          <td colSpan={6} className={styles.statusCell}>
            <div className={styles.statusContent}>
              <strong>Server Unavailable</strong>
              <span>Item data is unavailable while the app is offline.</span>
            </div>
          </td>
        </tr>
      );
    }

    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={6} className={styles.statusCell}>
            <div className={styles.statusContent}>
              <strong>No items found</strong>
              <span>Try a different search or adjust the filters.</span>
            </div>
          </td>
        </tr>
      );
    }

    return items.map((item) => (
      <tr
        key={item.id || item.key}
        className={styles.tableRow}
        onClick={() => openItem(item)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openItem(item);
          }
        }}
        tabIndex={0}
      >
        <td className={styles.nameCell}>
          <div className={styles.nameCellContent}>
            <strong>{item.name}</strong>
          </div>
        </td>
        <td className={styles.rarityCell}>
          {hasDisplayableRarity(item.rarityName ?? item.rarityKey) ? (
            <RarityPill rarity={item.rarityName ?? item.rarityKey} />
          ) : (
            item.rarityName ?? "No rarity"
          )}
        </td>
        <td className={styles.categoryCell}>{item.categoryName || "Unknown"}</td>
        <td className={`${styles.weightCell} ${styles.numericCell}`}>{formatWeight(item)}</td>
        <td className={`${styles.costCell} ${styles.numericCell}`}>{renderCost(item)}</td>
        <td className={styles.sourceCell}>{item.sourceTitle || item.sourceKey || "Unknown Source"}</td>
      </tr>
    ));
  }

  return (
    <div className={styles.layout}>
      <div className={styles.resultsHeader}>
        <h3>{heading}</h3>
        <div className={styles.resultsMeta}>
          <span className={styles.totalLabel}>{totalEntriesLabel}</span>
          {status === "ready" && items.length > 0 ? (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          ) : null}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {renderSortableHeaderCell("name", orderingState, onOrderingChange)}
              {renderSortableHeaderCell("rarity", orderingState, onOrderingChange)}
              <th className={styles.categoryHeader}>Category</th>
              {renderSortableHeaderCell("weight", orderingState, onOrderingChange)}
              {renderSortableHeaderCell("cost", orderingState, onOrderingChange)}
              <th className={styles.sourceHeader}>Source</th>
            </tr>
          </thead>
          <tbody>{renderStatusRow()}</tbody>
        </table>
      </div>
    </div>
  );
}

function getAriaSortValue(isActive: boolean, direction: "asc" | "desc"): "ascending" | "descending" | "none" {
  if (!isActive) {
    return "none";
  }

  return direction === "asc" ? "ascending" : "descending";
}

function SortIcon({
  isActive,
  direction
}: {
  isActive: boolean;
  direction: "asc" | "desc";
}) {
  if (!isActive) {
    return <ArrowUpDown className={styles.sortIcon} aria-hidden="true" />;
  }

  return direction === "asc" ? (
    <ArrowUp className={styles.sortIcon} aria-hidden="true" />
  ) : (
    <ArrowDown className={styles.sortIcon} aria-hidden="true" />
  );
}

export default ItemCodexTable;
