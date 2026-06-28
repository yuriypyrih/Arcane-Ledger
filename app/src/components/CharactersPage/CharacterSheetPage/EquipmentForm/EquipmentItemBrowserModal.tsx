import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listCustomItems,
  type CustomItemListScope,
  type CustomItemRecord
} from "../../../../api/customItems";
import { CurrencyBalancePill } from "../../../CurrencyInlineDisplay";
import ItemBrowserFilters from "../../../ItemBrowser";
import { sanitizeItemBrowserScopedFilters } from "../../../ItemBrowser/itemBrowser";
import ItemCodexTable from "../../../CodexPage/ItemCodexTable";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import SegmentedToggle from "../../../SegmentedToggle";
import { useItemEntries } from "../../../../pages/CodexPage/useItemEntries";
import { useItemFilterOptions } from "../../../../pages/CodexPage/useItemFilterOptions";
import { createCharacterInventoryItemFromCustomSource } from "../../../../pages/CharactersPage/inventoryItems";
import {
  DEFAULT_ITEM_BROWSER_TAB,
  type CharacterCurrencies,
  type CharacterInventoryItem,
  type CodexStatus,
  type ItemArmorType,
  type ItemAttackType,
  type ItemBrowserTab,
  type ItemListItem,
  type ItemOrdering,
  type ItemRecord,
  type ItemProficiencyType
} from "../../../../types";
import { useAppSelector } from "../../../../store";
import { parseItemCost } from "../../../../utils/items/cost";
import styles from "./EquipmentItemBrowserModal.module.css";

const ITEM_BROWSER_PAGE_SIZE = 24;

type ItemSourceMode = "standard" | "custom";

function getCustomItemTab(record: CustomItemRecord): Exclude<ItemBrowserTab, "all"> {
  if (record.item.weapon) {
    return "weapons";
  }

  if (record.item.armor) {
    return "armor";
  }

  return "gear";
}

function customItemMatchesTab(record: CustomItemRecord, tab: ItemBrowserTab) {
  return tab === "all" || getCustomItemTab(record) === tab;
}

function normalizeComparableText(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase();
}

function getCustomItemListWeight(record: CustomItemRecord) {
  const weight = Number(record.item.weight ?? 0);

  return Number.isFinite(weight) ? weight : 0;
}

function getCustomItemListCost(record: CustomItemRecord) {
  return parseItemCost(record.item.cost)?.amount ?? 0;
}

function compareCustomItems(left: CustomItemRecord, right: CustomItemRecord, ordering: ItemOrdering) {
  const direction = ordering.startsWith("-") ? -1 : 1;
  const field = ordering.replace("-", "");
  let result = 0;

  if (field === "rarity") {
    result = normalizeComparableText(left.item.rarity?.name ?? left.item.rarity?.key).localeCompare(
      normalizeComparableText(right.item.rarity?.name ?? right.item.rarity?.key)
    );
  } else if (field === "weight") {
    result = getCustomItemListWeight(left) - getCustomItemListWeight(right);
  } else if (field === "cost") {
    result = getCustomItemListCost(left) - getCustomItemListCost(right);
  } else {
    result = normalizeComparableText(left.item.name).localeCompare(
      normalizeComparableText(right.item.name)
    );
  }

  if (result === 0) {
    result = normalizeComparableText(left.item.name).localeCompare(
      normalizeComparableText(right.item.name)
    );
  }

  return result * direction;
}

function createCustomItemListItem(record: CustomItemRecord): ItemListItem {
  return {
    id: record.id,
    key: record.item.key ?? record.id,
    name: record.item.name ?? "Custom Item",
    rarityKey: record.item.rarity?.key ?? null,
    rarityName: record.item.rarity?.name ?? null,
    categoryKey: record.item.category?.key ?? getCustomItemTab(record),
    categoryName: record.item.category?.name ?? "Custom Item",
    weight: record.item.weight ?? "",
    weightUnit: record.item.weight_unit ?? "",
    cost: record.item.cost ?? null,
    sourceKey: record.item.document?.key ?? "custom-items",
    sourceTitle: record.item.document?.display_name ?? record.item.document?.name ?? "Custom Items"
  };
}

function getCustomItemTabCounts(records: CustomItemRecord[]) {
  const counts: Record<ItemBrowserTab, number> = {
    all: records.length,
    armor: 0,
    gear: 0,
    weapons: 0
  };

  records.forEach((record) => {
    counts[getCustomItemTab(record)] += 1;
  });

  return counts;
}

export type EquipmentItemBrowserSelectionOptions = {
  initialInventoryItem?: CharacterInventoryItem;
  initialItem?: ItemRecord;
};

type EquipmentItemBrowserModalProps = {
  isOpen: boolean;
  isClosing?: boolean;
  currencies: CharacterCurrencies;
  onClose: () => void;
  onOpenCurrencyModal: () => void;
  onOpenCustomEquipmentCreator: () => void;
  onItemSelect: (item: ItemListItem, options?: EquipmentItemBrowserSelectionOptions) => void;
};

function EquipmentItemBrowserModal({
  isOpen,
  isClosing = false,
  currencies,
  onClose,
  onOpenCurrencyModal,
  onOpenCustomEquipmentCreator,
  onItemSelect
}: EquipmentItemBrowserModalProps) {
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const isAuthenticated = authStatus === "authenticated";
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<ItemBrowserTab>(DEFAULT_ITEM_BROWSER_TAB);
  const [itemSourceMode, setItemSourceMode] = useState<ItemSourceMode>("standard");
  const [customItemScope, setCustomItemScope] = useState<CustomItemListScope>("mine");
  const [customItemRecords, setCustomItemRecords] = useState<CustomItemRecord[]>([]);
  const [customItemStatus, setCustomItemStatus] = useState<CodexStatus>("ready");
  const [category, setCategory] = useState<string | null>(null);
  const [attackType, setAttackType] = useState<ItemAttackType | null>(null);
  const [proficiencyType, setProficiencyType] = useState<ItemProficiencyType | null>(null);
  const [mastery, setMastery] = useState<string | null>(null);
  const [property, setProperty] = useState<string | null>(null);
  const [armorType, setArmorType] = useState<ItemArmorType | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState<ItemOrdering>("name");
  const [searchResetSignal, setSearchResetSignal] = useState(0);
  const clearSearch = useCallback(() => {
    setQuery("");
    setSearchResetSignal((currentSignal) => currentSignal + 1);
  }, []);
  const resetBrowserState = useCallback(() => {
    setQuery("");
    setSearchResetSignal((currentSignal) => currentSignal + 1);
    setTab(DEFAULT_ITEM_BROWSER_TAB);
    setCategory(null);
    setAttackType(null);
    setProficiencyType(null);
    setMastery(null);
    setProperty(null);
    setArmorType(null);
    setRarity(null);
    setSource(null);
    setPage(1);
    setOrdering("name");
    setItemSourceMode("standard");
    setCustomItemScope("mine");
    setCustomItemRecords([]);
    setCustomItemStatus("ready");
  }, []);
  const { payload: filterOptionsPayload } = useItemFilterOptions(
    isOpen && itemSourceMode === "standard"
  );
  const sanitizedScopedFilters = useMemo(
    () =>
      sanitizeItemBrowserScopedFilters(
        {
          tab,
          category,
          attackType,
          proficiencyType,
          mastery,
          property,
          armorType
        },
        filterOptionsPayload
      ),
    [armorType, attackType, category, filterOptionsPayload, mastery, property, proficiencyType, tab]
  );
  const { payload, status } = useItemEntries({
    enabled: isOpen && itemSourceMode === "standard",
    page,
    limit: ITEM_BROWSER_PAGE_SIZE,
    search: query,
    tab: sanitizedScopedFilters.tab,
    category: sanitizedScopedFilters.category,
    attackType: sanitizedScopedFilters.attackType,
    proficiencyType: sanitizedScopedFilters.proficiencyType,
    mastery: sanitizedScopedFilters.mastery,
    property: sanitizedScopedFilters.property,
    armorType: sanitizedScopedFilters.armorType,
    rarity,
    source,
    ordering
  });
  const customItemTabCounts = useMemo(() => getCustomItemTabCounts(customItemRecords), [customItemRecords]);
  const filteredCustomItemRecords = useMemo(() => {
    const normalizedQuery = normalizeComparableText(query);

    return customItemRecords
      .filter((record) => customItemMatchesTab(record, sanitizedScopedFilters.tab))
      .filter(
        (record) =>
          !normalizedQuery || normalizeComparableText(record.item.name).includes(normalizedQuery)
      )
      .sort((left, right) => compareCustomItems(left, right, ordering));
  }, [customItemRecords, ordering, query, sanitizedScopedFilters.tab]);
  const customItemRecordsByKey = useMemo(
    () => new Map(customItemRecords.map((record) => [record.item.key ?? record.id, record])),
    [customItemRecords]
  );
  const customItemListItems = useMemo(
    () =>
      filteredCustomItemRecords
        .slice((page - 1) * ITEM_BROWSER_PAGE_SIZE, page * ITEM_BROWSER_PAGE_SIZE)
        .map(createCustomItemListItem),
    [filteredCustomItemRecords, page]
  );
  const activeItems = itemSourceMode === "custom" ? customItemListItems : (payload?.results ?? []);
  const activeStatus = itemSourceMode === "custom" ? customItemStatus : status;
  const activeCount =
    itemSourceMode === "custom" ? filteredCustomItemRecords.length : (payload?.count ?? 0);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(activeCount / ITEM_BROWSER_PAGE_SIZE)),
    [activeCount]
  );
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    resetBrowserState();
  }, [isOpen, resetBrowserState]);

  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
    }
  }, [page, safePage]);

  useEffect(() => {
    if (isAuthenticated || itemSourceMode !== "custom") {
      return;
    }

    setItemSourceMode("standard");
    setCustomItemScope("mine");
    setCustomItemRecords([]);
    setCustomItemStatus("ready");
  }, [isAuthenticated, itemSourceMode]);

  useEffect(() => {
    let didCancel = false;

    if (!isOpen || itemSourceMode !== "custom" || !isAuthenticated || !authUserId) {
      return () => {
        didCancel = true;
      };
    }

    setCustomItemStatus("loading");
    setCustomItemRecords([]);

    void listCustomItems({ scope: customItemScope, suppressFailureToast: true })
      .then(({ customItems }) => {
        if (!didCancel) {
          setCustomItemRecords(customItems);
          setCustomItemStatus("ready");
        }
      })
      .catch(() => {
        if (!didCancel) {
          setCustomItemRecords([]);
          setCustomItemStatus("error");
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authUserId, customItemScope, isAuthenticated, isOpen, itemSourceMode]);

  useEffect(() => {
    if (sanitizedScopedFilters.category !== category) {
      setCategory(sanitizedScopedFilters.category);
    }

    if (sanitizedScopedFilters.attackType !== attackType) {
      setAttackType(sanitizedScopedFilters.attackType);
    }

    if (sanitizedScopedFilters.proficiencyType !== proficiencyType) {
      setProficiencyType(sanitizedScopedFilters.proficiencyType);
    }

    if (sanitizedScopedFilters.mastery !== mastery) {
      setMastery(sanitizedScopedFilters.mastery);
    }

    if (sanitizedScopedFilters.property !== property) {
      setProperty(sanitizedScopedFilters.property);
    }

    if (sanitizedScopedFilters.armorType !== armorType) {
      setArmorType(sanitizedScopedFilters.armorType);
    }
  }, [
    armorType,
    attackType,
    category,
    mastery,
    property,
    proficiencyType,
    sanitizedScopedFilters.attackType,
    sanitizedScopedFilters.armorType,
    sanitizedScopedFilters.category,
    sanitizedScopedFilters.mastery,
    sanitizedScopedFilters.property,
    sanitizedScopedFilters.proficiencyType
  ]);

  function handleItemSourceModeChange(nextMode: ItemSourceMode) {
    if (nextMode === itemSourceMode || isClosing) {
      return;
    }

    clearSearch();
    setPage(1);
    setItemSourceMode(nextMode);
  }

  function handleCustomItemScopeChange(nextScope: CustomItemListScope) {
    if (nextScope === customItemScope || isClosing) {
      return;
    }

    clearSearch();
    setPage(1);
    setCustomItemScope(nextScope);
  }

  function renderItemSourceToggleGroup() {
    if (!isAuthenticated) {
      return null;
    }

    return (
      <div className={styles.sourceToggleGroup}>
        {itemSourceMode === "custom" ? (
          <SegmentedToggle
            ariaLabel="Custom item scope"
            value={customItemScope}
            options={[
              { label: "Mine", value: "mine" },
              { label: "Public", value: "public" }
            ]}
            disabled={isClosing}
            onValueChange={handleCustomItemScopeChange}
          />
        ) : null}
        <SegmentedToggle
          ariaLabel="Item source"
          value={itemSourceMode}
          options={[
            { label: "Standard", value: "standard" },
            { label: "Custom", value: "custom" }
          ]}
          disabled={isClosing}
          onValueChange={handleItemSourceModeChange}
        />
      </div>
    );
  }

  function handleItemSelect(item: ItemListItem) {
    if (itemSourceMode === "custom") {
      const customItem = customItemRecordsByKey.get(item.key);

      if (customItem) {
        onItemSelect(item, {
          initialInventoryItem: createCharacterInventoryItemFromCustomSource(customItem),
          initialItem: customItem.item
        });
      }
      return;
    }

    onItemSelect(item);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <SheetModal
      titleId="character-equipment-add-title"
      onClose={onClose}
      isBusy={isClosing}
      busyLabel="Saving equipment"
      size="large"
      panelClassName={styles.modal}
    >
      <OverlayHeader className={styles.header}>
        <OverlayHeaderContent>
          <p className={styles.eyebrow}>Equipment</p>
          <OverlayTitle id="character-equipment-add-title">Add equipment</OverlayTitle>
        </OverlayHeaderContent>
        <div className={styles.headerControlCluster}>
          <div className={styles.headerActions}>
            <CurrencyBalancePill
              currencies={currencies}
              onClick={onOpenCurrencyModal}
              disabled={isClosing}
            />
            <button
              type="button"
              className={styles.customButton}
              onClick={onOpenCustomEquipmentCreator}
              disabled={isClosing}
            >
              <Plus size={14} aria-hidden="true" />
              <span>Custom</span>
            </button>
          </div>
          <OverlayCloseButton
            className={styles.headerCloseButton}
            label="Close add equipment popup"
            onClick={onClose}
            disabled={isClosing}
          />
        </div>
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <ItemBrowserFilters
          query={query}
          searchResetSignal={searchResetSignal}
          tab={sanitizedScopedFilters.tab}
          category={sanitizedScopedFilters.category}
          attackType={sanitizedScopedFilters.attackType}
          proficiencyType={sanitizedScopedFilters.proficiencyType}
          mastery={sanitizedScopedFilters.mastery}
          property={sanitizedScopedFilters.property}
          armorType={sanitizedScopedFilters.armorType}
          rarity={rarity}
          source={source}
          controlsMode={itemSourceMode === "custom" ? "search-only" : "full"}
          filterOptions={itemSourceMode === "custom" ? null : filterOptionsPayload}
          tabCounts={itemSourceMode === "custom" ? customItemTabCounts : undefined}
          tabRowActions={renderItemSourceToggleGroup()}
          onQueryChange={(value: string) => {
            setQuery(value);
            setPage(1);
          }}
          onTabChange={(value: ItemBrowserTab) => {
            clearSearch();
            setTab(value);
            setCategory(null);
            setAttackType(null);
            setProficiencyType(null);
            setMastery(null);
            setProperty(null);
            setArmorType(null);
            setPage(1);
          }}
          onCategoryChange={(value: string | null) => {
            clearSearch();
            setCategory(value);
            setPage(1);
          }}
          onAttackTypeChange={(value: ItemAttackType | null) => {
            clearSearch();
            setAttackType(value);
            setPage(1);
          }}
          onProficiencyTypeChange={(value: ItemProficiencyType | null) => {
            clearSearch();
            setProficiencyType(value);
            setPage(1);
          }}
          onMasteryChange={(value: string | null) => {
            clearSearch();
            setMastery(value);
            setPage(1);
          }}
          onPropertyChange={(value: string | null) => {
            clearSearch();
            setProperty(value);
            setPage(1);
          }}
          onArmorTypeChange={(value: ItemArmorType | null) => {
            clearSearch();
            setArmorType(value);
            setPage(1);
          }}
          onRarityChange={(value: string | null) => {
            clearSearch();
            setRarity(value);
            setPage(1);
          }}
          onSourceChange={(value: string | null) => {
            clearSearch();
            setSource(value);
            setPage(1);
          }}
        />

        <ItemCodexTable
          items={activeItems}
          totalEntries={activeCount}
          status={activeStatus}
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          ordering={ordering}
          onOrderingChange={(value: ItemOrdering) => {
            setOrdering(value);
            setPage(1);
          }}
          onItemSelect={handleItemSelect}
          heading={itemSourceMode === "custom" ? "Browse Custom Items" : "Browse Items"}
          className={styles.itemTable}
          tableWrapperClassName={styles.itemTableWrapper}
          paginationClassName={styles.itemTablePagination}
        />
      </OverlayBody>
    </SheetModal>
  );
}

export default EquipmentItemBrowserModal;
