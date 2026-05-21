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
  ItemArtificerPlanFilterGroup,
  ItemFilterOption,
  ItemListItem,
  ItemOrdering,
  ItemRecord
} from "../../../../../../../types";
import styles from "./TinkersMagicActionBody.module.css";

const replicateMagicItemSpecialFilter = "ArtificerReplicateMagicItem";
const replicateMagicItemPageSize = 24;

type ReplicateMagicItemActionBodyProps = {
  knownPlanKeys: string[];
  isSubmitting: boolean;
  disabledReason: string | null;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  onUseItem: (item: ItemRecord) => Promise<void>;
};

function ReplicateMagicItemActionBody({
  knownPlanKeys,
  isSubmitting,
  disabledReason,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  onUseItem
}: ReplicateMagicItemActionBodyProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState<ItemOrdering>("name");
  const [selectedArtificerPlan, setSelectedArtificerPlan] = useState<string | null>(null);
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const knownPlanKeysKey = knownPlanKeys.join("|");
  const scopedPlanKeys = useMemo(() => [...new Set(knownPlanKeys)], [knownPlanKeysKey]);
  const selectedKnownPlanKeys = useMemo(() => new Set(scopedPlanKeys), [scopedPlanKeys]);
  const effectiveArtificerPlan = selectedArtificerPlan ?? undefined;
  const { payload: filterOptions } = useItemFilterOptions(true, {
    specialFilter: replicateMagicItemSpecialFilter,
    artificerPlan: effectiveArtificerPlan,
    artificerPlans: scopedPlanKeys
  });
  const { payload, status } = useItemEntries({
    enabled: true,
    page,
    limit: replicateMagicItemPageSize,
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
    specialFilter: replicateMagicItemSpecialFilter,
    artificerPlan: effectiveArtificerPlan,
    artificerPlans: scopedPlanKeys
  });
  const { item: selectedItem, status: selectedItemStatus } = useItemEntry(
    selectedItemKey ?? undefined,
    {
      enabled: selectedItemKey !== null
    }
  );
  const categoryOptions = filterOptions?.groups.all.categories ?? [];
  const rarityOptions = filterOptions?.rarities ?? [];
  const planGroups = useMemo(
    () => filterOptions?.artificerPlans?.groups ?? [],
    [filterOptions?.artificerPlans?.groups]
  );
  const unlockedPlanKeys = useMemo(
    () => new Set(planGroups.flatMap((group) => group.options.map((option) => option.value))),
    [planGroups]
  );
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((payload?.count ?? 0) / replicateMagicItemPageSize)),
    [payload?.count]
  );
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
    }
  }, [page, safePage]);

  useEffect(() => {
    if (
      selectedArtificerPlan &&
      (!selectedKnownPlanKeys.has(selectedArtificerPlan) ||
        !unlockedPlanKeys.has(selectedArtificerPlan))
    ) {
      setSelectedArtificerPlan(null);
    }
  }, [selectedArtificerPlan, selectedKnownPlanKeys, unlockedPlanKeys]);

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
      Use Replicate Magic Item
    </ActionButton>
  ) : null;

  return (
    <div className={styles.layout}>
      <div className={`${styles.filterRow} ${styles.replicateFilterRow}`}>
        <ArtificerPlanSelect
          value={selectedArtificerPlan}
          groups={planGroups}
          onChange={(value) => handleFilterChange(() => setSelectedArtificerPlan(value))}
        />
        <ReplicateMagicItemSelect
          label="Category"
          value={category}
          options={categoryOptions}
          onChange={(value) => handleFilterChange(() => setCategory(value))}
        />
        <ReplicateMagicItemSelect
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
        heading="Replicate Magic Item Plans"
        className={styles.itemTable}
        tableWrapperClassName={styles.itemTableWrapper}
        paginationClassName={styles.itemTablePagination}
      />

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

type ArtificerPlanSelectProps = {
  value: string | null;
  groups: ItemArtificerPlanFilterGroup[];
  onChange: (value: string | null) => void;
};

function ArtificerPlanSelect({ value, groups, onChange }: ArtificerPlanSelectProps) {
  return (
    <label className={styles.field}>
      <span>Artificer Plans</span>
      <select
        className={styles.input}
        value={value ?? "ALL"}
        onChange={(event) => onChange(event.target.value === "ALL" ? null : event.target.value)}
      >
        <option value="ALL">All</option>
        {groups.map((group) => (
          <optgroup key={group.level} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {`${option.label} (${option.count})`}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

type ReplicateMagicItemSelectProps = {
  label: string;
  value: string | null;
  options: ItemFilterOption[];
  onChange: (value: string | null) => void;
};

function ReplicateMagicItemSelect({
  label,
  value,
  options,
  onChange
}: ReplicateMagicItemSelectProps) {
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

export default ReplicateMagicItemActionBody;
