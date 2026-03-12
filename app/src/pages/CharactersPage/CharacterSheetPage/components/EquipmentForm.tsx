import clsx from "clsx";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import coinCopperIcon from "../../../../assets/svg/coin-copper.svg";
import coinElectrumIcon from "../../../../assets/svg/coin-electrum.svg";
import coinGoldIcon from "../../../../assets/svg/coin.svg";
import coinPlatinumIcon from "../../../../assets/svg/coin-platinum.svg";
import coinSilverIcon from "../../../../assets/svg/coin-silver.svg";
import NumberInput from "../../../../components/CharactersPage/FormInputs/NumberInput";
import RarityPill from "../../../../components/CodexPage/RarityPill";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import {
  ENTRY_CATEGORIES,
  type ArmorEntry,
  type ItemEntry,
  type WeaponEntry
} from "../../../../codex/entries";
import { currencyKeys, type Character, type CurrencyKey } from "../../../../types";
import { formatCodexLabel, formatCodexList, formatDamageDice } from "../../../../utils/codex";
import {
  getAvailableEquipmentNamesForClass,
  getEquipmentByName,
  getLoadoutCodexEntryByName,
  normalizeEquipmentSelectionsForClass
} from "../../proficiency";
import type { PersistCharacterUpdater } from "../types";
import { clampNumber } from "../utils";
import sheetStyles from "../CharacterSheetPage.module.css";
import shared from "./CharacterSheetSectionShared.module.css";
import InlineToggleButton from "./InlineToggleButton";
import styles from "./EquipmentForm.module.css";

type EquipmentFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type LoadoutDrawerEntry = ArmorEntry | ItemEntry | WeaponEntry;
type EquipmentGroupKey = "weaponsAndStaff" | "armorAndShield" | "generalEquipment";
type CatalogTab = "weapons" | "armor" | "items";
type EquipmentGroup = {
  key: EquipmentGroupKey;
  title: string;
  description: string;
  items: string[];
};

type CatalogTabDefinition = {
  key: CatalogTab;
  label: string;
};

type CurrencyDefinition = {
  key: CurrencyKey;
  label: string;
  code: string;
  icon: string;
};

const EQUIPMENT_PAGE_SIZE = 20;

const equipmentGroupMeta: Array<Omit<EquipmentGroup, "items">> = [
  {
    key: "weaponsAndStaff",
    title: "Weapons & Staff",
    description: "Anything the user holds in their arm while fighting."
  },
  {
    key: "armorAndShield",
    title: "Armor and Shield",
    description: "Anything that contributes to Armor Class (AC)."
  },
  {
    key: "generalEquipment",
    title: "General Equipment",
    description: "Everything else."
  }
];

const catalogTabs: CatalogTabDefinition[] = [
  { key: "weapons", label: "Weapons" },
  { key: "armor", label: "Armor" },
  { key: "items", label: "Items" }
];

const currencyDefinitions: CurrencyDefinition[] = [
  { key: "copper", label: "Copper", code: "CP", icon: coinCopperIcon },
  { key: "silver", label: "Silver", code: "SP", icon: coinSilverIcon },
  { key: "electrum", label: "Electrum", code: "EP", icon: coinElectrumIcon },
  { key: "gold", label: "Gold", code: "GP", icon: coinGoldIcon },
  { key: "platinum", label: "Platinum", code: "PP", icon: coinPlatinumIcon }
];

function formatMaxDexModifier(maxDexModifier: number | null): string {
  if (maxDexModifier === null) {
    return "Full modifier";
  }

  if (maxDexModifier === 0) {
    return "No DEX modifier";
  }

  return `Capped at +${maxDexModifier}`;
}

function normalizeCurrencyAmountInput(value: string, fallback: number): number {
  const numericOnly = value.replace(/[^\d]/g, "");

  if (numericOnly.length === 0) {
    return 0;
  }

  const withoutLeadingZeros = numericOnly.replace(/^0+(?=\d)/, "");
  return Math.floor(clampNumber(withoutLeadingZeros, 0, 999999999, fallback));
}

function getEquipmentGroupKey(itemName: string): EquipmentGroupKey {
  const equipmentDefinition = getEquipmentByName(itemName);

  if (!equipmentDefinition) {
    return "generalEquipment";
  }

  if (equipmentDefinition.category === "weapon") {
    return "weaponsAndStaff";
  }

  if (equipmentDefinition.category === "armor") {
    return "armorAndShield";
  }

  return "generalEquipment";
}

function getCatalogTabForItem(itemName: string): CatalogTab {
  const equipmentDefinition = getEquipmentByName(itemName);

  if (!equipmentDefinition) {
    return "items";
  }

  if (equipmentDefinition.category === "weapon") {
    return "weapons";
  }

  if (equipmentDefinition.category === "armor") {
    return "armor";
  }

  return "items";
}

function groupEquipmentItems(itemNames: string[]): EquipmentGroup[] {
  const groupedItems: Record<EquipmentGroupKey, string[]> = {
    weaponsAndStaff: [],
    armorAndShield: [],
    generalEquipment: []
  };

  itemNames.forEach((itemName) => {
    groupedItems[getEquipmentGroupKey(itemName)].push(itemName);
  });

  return equipmentGroupMeta.map((group) => ({
    ...group,
    items: groupedItems[group.key]
  }));
}

function groupCatalogItems(itemNames: string[]): Record<CatalogTab, string[]> {
  const groupedItems: Record<CatalogTab, string[]> = {
    weapons: [],
    armor: [],
    items: []
  };

  itemNames.forEach((itemName) => {
    groupedItems[getCatalogTabForItem(itemName)].push(itemName);
  });

  return groupedItems;
}

function EquipmentForm({ className, onPersistCharacter }: EquipmentFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [selectedLoadoutEntry, setSelectedLoadoutEntry] = useState<LoadoutDrawerEntry | null>(null);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [activeCurrencyKey, setActiveCurrencyKey] = useState<CurrencyKey>("gold");
  const [currencyAmountDraft, setCurrencyAmountDraft] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeCatalogTab, setActiveCatalogTab] = useState<CatalogTab>("weapons");
  const [catalogPageByTab, setCatalogPageByTab] = useState<Record<CatalogTab, number>>({
    weapons: 1,
    armor: 1,
    items: 1
  });
  const [isGeneralEquipmentExpanded, setIsGeneralEquipmentExpanded] = useState(false);

  const hasBackdrop = Boolean(selectedLoadoutEntry || isCurrencyDrawerOpen || isAddModalOpen);
  useBodyScrollLock(hasBackdrop);

  useEffect(() => {
    if (!hasBackdrop) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedLoadoutEntry(null);
        setIsCurrencyDrawerOpen(false);
        setIsAddModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasBackdrop]);

  const availableEquipmentOptions = getAvailableEquipmentNamesForClass(character.className);
  const normalizedCurrencies = useMemo(() => {
    const nextCurrencies: Record<CurrencyKey, number> = {
      copper: 0,
      silver: 0,
      gold: 0,
      electrum: 0,
      platinum: 0
    };

    currencyKeys.forEach((currencyKey) => {
      nextCurrencies[currencyKey] = Math.max(
        0,
        Math.floor(clampNumber(character.currencies[currencyKey], 0, 999999999, 0))
      );
    });

    return nextCurrencies;
  }, [character.currencies]);
  const activeCurrencyDefinition =
    currencyDefinitions.find((currency) => currency.key === activeCurrencyKey) ?? currencyDefinitions[2];
  const activeCurrencyAmount = normalizedCurrencies[activeCurrencyKey];
  const normalizedCurrencyAmount = Math.max(
    0,
    Math.floor(clampNumber(currencyAmountDraft, 0, 999999999, 0))
  );
  const canSpendCurrency = activeCurrencyAmount >= normalizedCurrencyAmount;
  const selectedEquipmentGroups = groupEquipmentItems(character.equipment);
  const availableCatalogItems = useMemo(
    () => groupCatalogItems(availableEquipmentOptions),
    [availableEquipmentOptions]
  );

  const activeCatalogItems = availableCatalogItems[activeCatalogTab] ?? [];
  const totalCatalogPages = Math.max(
    1,
    Math.ceil(activeCatalogItems.length / EQUIPMENT_PAGE_SIZE)
  );
  const activeCatalogPage = Math.min(catalogPageByTab[activeCatalogTab] ?? 1, totalCatalogPages);
  const paginatedCatalogItems = activeCatalogItems.slice(
    (activeCatalogPage - 1) * EQUIPMENT_PAGE_SIZE,
    activeCatalogPage * EQUIPMENT_PAGE_SIZE
  );

  function openLoadoutEntryDetails(itemName: string) {
    const entry = getLoadoutCodexEntryByName(itemName);

    if (!entry) {
      return;
    }

    setIsCurrencyDrawerOpen(false);
    setSelectedLoadoutEntry(entry);
  }

  function addEquipmentItem(itemName: string) {
    onPersistCharacter((currentCharacter) => {
      if (currentCharacter.equipment.includes(itemName)) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        equipment: normalizeEquipmentSelectionsForClass(currentCharacter.className, [
          ...currentCharacter.equipment,
          itemName
        ])
      };
    });
  }

  function removeEquipmentItem(itemName: string) {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      equipment: currentCharacter.equipment.filter((equipmentName) => equipmentName !== itemName)
    }));

    setSelectedLoadoutEntry(null);
  }

  function adjustCurrencyBalance(mode: "spend" | "gain") {
    const amount = Math.max(0, Math.floor(clampNumber(currencyAmountDraft, 0, 999999999, 0)));

    onPersistCharacter((currentCharacter) => {
      const currentCurrencyAmount = Math.max(
        0,
        Math.floor(clampNumber(currentCharacter.currencies[activeCurrencyKey], 0, 999999999, 0))
      );

      if (mode === "spend" && currentCurrencyAmount < amount) {
        return currentCharacter;
      }

      const nextAmount =
        mode === "spend" ? currentCurrencyAmount - amount : currentCurrencyAmount + amount;

      if (nextAmount === currentCurrencyAmount) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        currencies: {
          ...currentCharacter.currencies,
          [activeCurrencyKey]: nextAmount
        }
      };
    });

    setCurrencyAmountDraft(0);
  }

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Equipment</p>
          <h3 className={shared.subtitle}>Current loadout</h3>
        </div>
        <div className={shared.headerActions}>
          <button
            type="button"
            className={shared.currencyPill}
            onClick={() => {
              setSelectedLoadoutEntry(null);
              setCurrencyAmountDraft(0);
              setIsCurrencyDrawerOpen(true);
            }}
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
                  <span>{normalizedCurrencies[currency.key]}</span>
                </span>
              ))}
            </span>
          </button>
          <button
            type="button"
            className={shared.editButton}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {character.equipment.length === 0 ? (
        <p className={shared.emptyText}>No equipment selected.</p>
      ) : (
        <div className={styles.equipmentGroupStack}>
          {selectedEquipmentGroups
            .filter((group) => group.items.length > 0)
            .map((group) => {
              const shouldCollapseGeneral =
                group.key === "generalEquipment" && group.items.length > 6;
              const visibleGroupItems =
                shouldCollapseGeneral && !isGeneralEquipmentExpanded
                  ? group.items.slice(0, 4)
                  : group.items;

              return (
                <section key={group.key} className={styles.equipmentGroup}>
                  <header className={styles.equipmentGroupHeader}>
                    <p className={styles.equipmentGroupTitle}>{group.title}</p>
                  </header>
                  <ul className={styles.equipmentItemList}>
                    {visibleGroupItems.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className={styles.equipmentItemButton}
                          onClick={() => openLoadoutEntryDetails(item)}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
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

      {isAddModalOpen ? (
        <div
          className={sheetStyles.spellManagementBackdrop}
          role="presentation"
          onClick={() => setIsAddModalOpen(false)}
        >
          <section
            className={clsx(sheetStyles.spellManagementModal, styles.catalogModal)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-equipment-add-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Equipment</p>
                <h3 id="character-equipment-add-title">Add equipment</h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close add equipment popup"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.catalogTabRow} role="tablist" aria-label="Equipment categories">
              {catalogTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeCatalogTab === tab.key}
                  className={clsx(
                    styles.catalogTabButton,
                    activeCatalogTab === tab.key && styles.catalogTabButtonActive
                  )}
                  onClick={() => setActiveCatalogTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={styles.catalogBody}>
              {paginatedCatalogItems.length === 0 ? (
                <p className={styles.catalogEmptyState}>No available entries in this category.</p>
              ) : (
                <ul className={styles.catalogItemList}>
                  {paginatedCatalogItems.map((itemName) => {
                    const isAlreadyAdded = character.equipment.includes(itemName);
                    const catalogEntry = getLoadoutCodexEntryByName(itemName);

                    return (
                      <li
                        key={itemName}
                        className={clsx(
                          styles.catalogItemRow,
                          isAlreadyAdded && styles.catalogItemRowDisabled
                        )}
                      >
                        <div className={styles.catalogItemMeta}>
                          <span className={styles.catalogItemName}>{itemName}</span>
                          {catalogEntry && "rarity" in catalogEntry ? (
                            <RarityPill rarity={catalogEntry.rarity} />
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className={clsx(
                            styles.catalogItemAddButton,
                            isAlreadyAdded && styles.catalogItemAddButtonDisabled
                          )}
                          disabled={isAlreadyAdded}
                          onClick={() => addEquipmentItem(itemName)}
                        >
                          {isAlreadyAdded ? "Added" : "Add"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className={styles.catalogPaginationRow}>
              <button
                type="button"
                className={styles.catalogPageButton}
                disabled={activeCatalogPage <= 1}
                onClick={() =>
                  setCatalogPageByTab((currentPages) => ({
                    ...currentPages,
                    [activeCatalogTab]: Math.max(1, activeCatalogPage - 1)
                  }))
                }
              >
                Previous
              </button>
              <span>
                Page {activeCatalogPage} / {totalCatalogPages}
              </span>
              <button
                type="button"
                className={styles.catalogPageButton}
                disabled={activeCatalogPage >= totalCatalogPages}
                onClick={() =>
                  setCatalogPageByTab((currentPages) => ({
                    ...currentPages,
                    [activeCatalogTab]: Math.min(totalCatalogPages, activeCatalogPage + 1)
                  }))
                }
              >
                Next
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isCurrencyDrawerOpen ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setIsCurrencyDrawerOpen(false)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-currency-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Currency</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-currency-drawer-title">Currency balance</h3>
                </div>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setIsCurrencyDrawerOpen(false)}
                aria-label="Close currency drawer"
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

            <div className={sheetStyles.currencyDrawerContent}>
              <label className={sheetStyles.currencyDrawerField}>
                <span>Amount ({activeCurrencyDefinition.label})</span>
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
              <div className={sheetStyles.currencyDrawerActions}>
                <button
                  type="button"
                  className={sheetStyles.currencySpendButton}
                  disabled={!canSpendCurrency}
                  onClick={() => adjustCurrencyBalance("spend")}
                >
                  <Minus size={16} aria-hidden="true" className={sheetStyles.currencyActionIconSpend} />
                  Spend
                </button>
                <button
                  type="button"
                  className={sheetStyles.currencyGainButton}
                  onClick={() => adjustCurrencyBalance("gain")}
                >
                  <Plus size={16} aria-hidden="true" className={sheetStyles.currencyActionIconGain} />
                  Gain
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {selectedLoadoutEntry ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedLoadoutEntry(null)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-loadout-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>
                  {formatCodexLabel(selectedLoadoutEntry.category)}
                </p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-loadout-drawer-title">{selectedLoadoutEntry.name}</h3>
                  {"rarity" in selectedLoadoutEntry ? (
                    <RarityPill rarity={selectedLoadoutEntry.rarity} />
                  ) : null}
                </div>
                <p className={sheetStyles.spellDrawerSummary}>{selectedLoadoutEntry.summary}</p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedLoadoutEntry(null)}
                aria-label="Close loadout details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.spellDrawerDetails}>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Types</span>
                <strong>{formatCodexList(selectedLoadoutEntry.tags)}</strong>
              </div>

              {selectedLoadoutEntry.category === ENTRY_CATEGORIES.WEAPONS ? (
                <>
                  <div className={sheetStyles.spellDrawerDetailCard}>
                    <span>Damage</span>
                    <strong>{formatDamageDice(selectedLoadoutEntry.damage)}</strong>
                  </div>
                  <div className={sheetStyles.spellDrawerDetailCard}>
                    <span>Damage type</span>
                    <strong>
                      {selectedLoadoutEntry.damageType
                        ? formatCodexLabel(selectedLoadoutEntry.damageType)
                        : "None"}
                    </strong>
                  </div>
                </>
              ) : null}

              {selectedLoadoutEntry.category === ENTRY_CATEGORIES.ARMOR ? (
                <>
                  <div className={sheetStyles.spellDrawerDetailCard}>
                    <span>Armor base</span>
                    <strong>{selectedLoadoutEntry.armorBase > 0 ? selectedLoadoutEntry.armorBase : "-"}</strong>
                  </div>
                  <div className={sheetStyles.spellDrawerDetailCard}>
                    <span>Max DEX modifier</span>
                    <strong>{formatMaxDexModifier(selectedLoadoutEntry.maxDexModifier)}</strong>
                  </div>
                  <div className={sheetStyles.spellDrawerDetailCard}>
                    <span>Shield bonus</span>
                    <strong>
                      {selectedLoadoutEntry.shieldBonus > 0 ? `+${selectedLoadoutEntry.shieldBonus}` : "None"}
                    </strong>
                  </div>
                </>
              ) : null}
            </div>

            <div className={styles.loadoutDrawerActions}>
              <button
                type="button"
                className={styles.removeItemButton}
                onClick={() => removeEquipmentItem(selectedLoadoutEntry.name)}
              >
                Remove Item
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </article>
  );
}

export default EquipmentForm;
