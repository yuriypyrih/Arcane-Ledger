import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useItemEntries } from "../../../../pages/CodexPage/useItemEntries";
import { useItemFilterOptions } from "../../../../pages/CodexPage/useItemFilterOptions";
import {
  DEFAULT_ITEM_BROWSER_TAB,
  type CharacterCurrencies,
  type ItemArmorType,
  type ItemAttackType,
  type ItemBrowserTab,
  type ItemListItem,
  type ItemOrdering,
  type ItemProficiencyType
} from "../../../../types";
import styles from "./EquipmentItemBrowserModal.module.css";

type EquipmentItemBrowserModalProps = {
  isOpen: boolean;
  isClosing?: boolean;
  currencies: CharacterCurrencies;
  onClose: () => void;
  onOpenCurrencyModal: () => void;
  onOpenCustomEquipmentCreator: () => void;
  onItemSelect: (item: ItemListItem) => void;
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
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<ItemBrowserTab>(DEFAULT_ITEM_BROWSER_TAB);
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
  }, []);
  const { payload: filterOptionsPayload } = useItemFilterOptions(isOpen);
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
    enabled: isOpen,
    page,
    limit: 24,
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
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((payload?.count ?? 0) / 24)),
    [payload?.count]
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
          filterOptions={filterOptionsPayload}
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
          items={payload?.results ?? []}
          totalEntries={payload?.count ?? 0}
          status={status}
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          ordering={ordering}
          onOrderingChange={(value: ItemOrdering) => {
            setOrdering(value);
            setPage(1);
          }}
          onItemSelect={onItemSelect}
          heading="Browse Items"
          className={styles.itemTable}
          tableWrapperClassName={styles.itemTableWrapper}
          paginationClassName={styles.itemTablePagination}
        />
      </OverlayBody>
    </SheetModal>
  );
}

export default EquipmentItemBrowserModal;
