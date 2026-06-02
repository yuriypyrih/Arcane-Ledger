import { useEffect, useMemo, useState } from "react";
import ActionButton from "../../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../../ActionShape";
import ItemCodexTable from "../../../../../../CodexPage/ItemCodexTable";
import SearchField from "../../../../../../SearchField";
import EquipmentInventoryItemDrawer from "../../../../EquipmentForm/EquipmentInventoryItemDrawer";
import { useItemEntries } from "../../../../../../../pages/CodexPage/useItemEntries";
import { useItemFilterOptions } from "../../../../../../../pages/CodexPage/useItemFilterOptions";
import { useItemEntry } from "../../../../../../../pages/ItemCodexEntryPage/useItemEntry";
import { runWithActionConfirmationToastAsync } from "../../../../actionConfirmationToast";
import type {
  ItemFilterOption,
  ItemListItem,
  ItemOrdering,
  ItemRecord
} from "../../../../../../../types";
import styles from "./TinkersMagicActionBody.module.css";

const tinkersMagicSpecialFilter = "TinkersMagic";
const tinkersMagicPageSize = 24;

type TinkersMagicActionBodyProps = {
  isSubmitting: boolean;
  disabledReason: string | null;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  onUseItem: (item: ItemRecord) => Promise<void>;
};

function TinkersMagicActionBody({
  isSubmitting,
  disabledReason,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  onUseItem
}: TinkersMagicActionBodyProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState<ItemOrdering>("name");
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const { payload: filterOptions } = useItemFilterOptions(true, {
    specialFilter: tinkersMagicSpecialFilter
  });
  const { payload, status } = useItemEntries({
    enabled: true,
    page,
    limit: tinkersMagicPageSize,
    search: query,
    tab: "all",
    category,
    attackType: null,
    proficiencyType: null,
    mastery: null,
    property: null,
    armorType: null,
    rarity,
    source: null,
    ordering,
    specialFilter: tinkersMagicSpecialFilter
  });
  const { item: selectedItem, status: selectedItemStatus } = useItemEntry(
    selectedItemKey ?? undefined,
    {
      enabled: selectedItemKey !== null
    }
  );
  const categoryOptions = filterOptions?.groups.all.categories ?? [];
  const rarityOptions = filterOptions?.rarities ?? [];
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((payload?.count ?? 0) / tinkersMagicPageSize)),
    [payload?.count]
  );
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
    }
  }, [page, safePage]);

  function handleItemSelect(item: ItemListItem) {
    setSelectedItemKey(item.key);
  }

  function handleFilterChange(callback: () => void) {
    callback();
    setPage(1);
  }

  const footer = selectedItemKey ? (
    <ActionButton
      className={styles.useButton}
      onClick={() => {
        if (!selectedItem) {
          return;
        }

        void runWithActionConfirmationToastAsync("action", () => onUseItem(selectedItem)).catch(
          () => undefined
        );
      }}
      loading={isSubmitting}
      disabled={selectedItemStatus !== "ready" || !selectedItem || disabledReason !== null}
      trailingBadge={
        actionShape ? (
          <ActionShape
            shape={actionShape}
            isSelected={actionShapeAvailable}
            multiCount={actionShapeMultiCount}
            className={styles.useButtonShape}
          />
        ) : null
      }
    >
      {"Use Tinker's Magic"}
    </ActionButton>
  ) : null;

  return (
    <div className={styles.browserLayout}>
      <div className={styles.filterRow}>
        <TinkersMagicSelect
          label="Category"
          value={category}
          options={categoryOptions}
          onChange={(value) => handleFilterChange(() => setCategory(value))}
        />
        <TinkersMagicSelect
          label="Rarity"
          value={rarity}
          options={rarityOptions}
          onChange={(value) => handleFilterChange(() => setRarity(value))}
        />
        <label className={`${styles.field} ${styles.searchField}`}>
          <span>Search</span>
          <SearchField
            className={styles.input}
            value={query}
            onValueChange={(value) => handleFilterChange(() => setQuery(value))}
            placeholder="Search item names..."
          />
        </label>
      </div>

      <div className={styles.tableRegion}>
        <ItemCodexTable
          items={payload?.results ?? []}
          totalEntries={payload?.count ?? 0}
          status={status}
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          ordering={ordering}
          onOrderingChange={(value) => {
            setOrdering(value);
            setPage(1);
          }}
          onItemSelect={handleItemSelect}
          heading="Tinker's Magic Items"
          className={styles.itemTable}
          tableWrapperClassName={styles.itemTableWrapper}
          paginationClassName={styles.itemTablePagination}
        />
      </div>

      {selectedItemKey ? (
        <EquipmentInventoryItemDrawer
          item={selectedItem}
          status={selectedItemStatus}
          onClose={() => setSelectedItemKey(null)}
          footer={footer}
        />
      ) : null}
    </div>
  );
}

type TinkersMagicSelectProps = {
  label: string;
  value: string | null;
  options: ItemFilterOption[];
  onChange: (value: string | null) => void;
};

function TinkersMagicSelect({ label, value, options, onChange }: TinkersMagicSelectProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select
        className={styles.input}
        value={value ?? "ALL"}
        onChange={(event) => onChange(event.target.value === "ALL" ? null : event.target.value)}
      >
        <option value="ALL">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {`${option.label} (${option.count})`}
          </option>
        ))}
      </select>
    </label>
  );
}

export default TinkersMagicActionBody;
