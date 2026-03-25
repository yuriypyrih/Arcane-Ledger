import clsx from "clsx";
import { Hand, Minus, Plus, Search, SearchX, Shield, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useFormContext } from "react-hook-form";
import coinCopperIcon from "../../../../assets/svg/coin-copper.svg";
import coinElectrumIcon from "../../../../assets/svg/coin-electrum.svg";
import coinGoldIcon from "../../../../assets/svg/coin.svg";
import coinPlatinumIcon from "../../../../assets/svg/coin-platinum.svg";
import coinSilverIcon from "../../../../assets/svg/coin-silver.svg";
import NumberInput from "../../FormInputs/NumberInput";
import RarityPill from "../../../CodexPage/RarityPill";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import {
  CURRENCY_TYPE,
  ENTRY_CATEGORIES,
  type ArmorEntry,
  type ItemEntry,
  type WeaponEntry
} from "../../../../codex/entries";
import {
  PROF_LEVEL,
  currencyKeys,
  type Character,
  type CurrencyKey
} from "../../../../types";
import {
  formatEquipmentWeight,
  formatCodexLabel,
  formatCodexList,
  formatWeaponDamage,
  formatWeaponProperties,
  formatWeaponType,
  formatWeaponWeight
} from "../../../../utils/codex";
import {
  equipmentOptions,
  getEquipmentByName,
  getLoadoutCodexEntryByName,
  getWeaponLevelFromEntries,
  getWeaponProficiencyForBaseWeapon,
  normalizeCharacterEquipmentSelections,
  type LoadoutCodexEntry
} from "../../../../pages/CharactersPage/proficiency";
import { getAbilityScoreForCharacter } from "../../../../pages/CharactersPage/abilities";
import {
  getKeywordReferences,
  type KeywordReference
} from "../../../../pages/CharactersPage/keywordDescriptions";
import {
  findCustomEquipmentById,
  getResolvedCustomLoadoutEntries,
  isResolvedCustomLoadoutEntry,
  type ResolvedCustomLoadoutEntry
} from "../../../../pages/CharactersPage/customEquipment";
import {
  createHeldShieldDescriptor,
  canWeaponBePutOnHand,
  createHeldWeaponDescriptor,
  createCharacterEquipmentItem,
  getCharacterEquipmentItem,
  type HeldWeaponDescriptor
} from "../../../../pages/CharactersPage/inventory";
import {
  isShieldArmorEntry,
  setCodexArmorWornState,
  setCustomArmorWornState
} from "../../../../pages/CharactersPage/armor";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import KeywordReferenceDrawer from "../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import CustomEquipmentEditor from "../CustomEquipmentEditor";
import InlineToggleButton from "../InlineToggleButton";
import styles from "./EquipmentForm.module.css";

type EquipmentFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type LoadoutDrawerEntry = ArmorEntry | ItemEntry | WeaponEntry | ResolvedCustomLoadoutEntry;
type EquipmentGroupKey = "weaponsAndStaff" | "armorAndShield" | "generalEquipment";
type CatalogTab = "weapons" | "armor" | "items";
type SelectedLoadoutEntryState = {
  entry: LoadoutDrawerEntry;
  customEquipmentId?: string;
  origin: "loadout" | "catalog";
};
type SelectedWeaponReference = {
  name: string;
  entries: KeywordReference[];
};
type LoadoutGroupItem = {
  key: string;
  name: string;
  entry: LoadoutDrawerEntry;
  customEquipmentId?: string;
  onHand: boolean;
  worn: boolean;
};
type EquipmentGroup = {
  key: EquipmentGroupKey;
  title: string;
  description: string;
  items: LoadoutGroupItem[];
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

type PurchasableLoadoutEntry = LoadoutDrawerEntry & {
  cost: { amount: number; currency: CURRENCY_TYPE };
  weight: number | null;
};

type UndoableCatalogAction = {
  refundCost: PurchasableLoadoutEntry["cost"] | null;
};

const EQUIPMENT_PAGE_SIZE = 24;

function createCatalogPageState(): Record<CatalogTab, number> {
  return {
    weapons: 1,
    armor: 1,
    items: 1
  };
}

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

const currencyKeyByType: Record<CURRENCY_TYPE, CurrencyKey> = {
  [CURRENCY_TYPE.CP]: "copper",
  [CURRENCY_TYPE.SP]: "silver",
  [CURRENCY_TYPE.EP]: "electrum",
  [CURRENCY_TYPE.GP]: "gold",
  [CURRENCY_TYPE.PP]: "platinum"
};

function getCurrencyDefinitionByType(currencyType: CURRENCY_TYPE): CurrencyDefinition {
  const currencyKey = currencyKeyByType[currencyType];
  return (
    currencyDefinitions.find((currencyDefinition) => currencyDefinition.key === currencyKey) ??
    currencyDefinitions[0]
  );
}

function isHandEquippableEntry(entry: LoadoutDrawerEntry): boolean {
  return entry.category === ENTRY_CATEGORIES.WEAPONS || (
    entry.category === ENTRY_CATEGORIES.ARMOR && isShieldArmorEntry(entry)
  );
}

function createHeldDescriptorForEntry(
  key: string,
  entry: LoadoutDrawerEntry
): HeldWeaponDescriptor | null {
  if (entry.category === ENTRY_CATEGORIES.WEAPONS) {
    return createHeldWeaponDescriptor(key, entry);
  }

  if (entry.category === ENTRY_CATEGORIES.ARMOR && isShieldArmorEntry(entry)) {
    return createHeldShieldDescriptor(key);
  }

  return null;
}

function getArmorTypeSummary(entry: ArmorEntry): string {
  if (isShieldArmorEntry(entry)) {
    return "Shield";
  }

  return formatCodexList(entry.tags);
}

function formatWeightValue(weight: number): string {
  if (Number.isInteger(weight)) {
    return `${weight}`;
  }

  return `${weight}`.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function renderCurrencyDisplay(
  cost: PurchasableLoadoutEntry["cost"] | WeaponEntry["cost"],
  options?: {
    classNames?: {
      root?: string;
      icon?: string;
    };
    fontSize?: CSSProperties["fontSize"];
    color?: CSSProperties["color"];
    fontWeight?: CSSProperties["fontWeight"];
    iconSize?: CSSProperties["width"];
  }
) {
  const currency = getCurrencyDefinitionByType(cost.currency);
  const rootStyle: CSSProperties = {
    fontSize: options?.fontSize,
    color: options?.color,
    fontWeight: options?.fontWeight
  };
  const iconStyle: CSSProperties = {
    inlineSize: options?.iconSize,
    blockSize: options?.iconSize
  };

  return (
    <span
      className={clsx(styles.currencyInlineDisplay, options?.classNames?.root)}
      style={rootStyle}
    >
      <img
        src={currency.icon}
        alt=""
        className={clsx(styles.currencyInlineIcon, options?.classNames?.icon)}
        style={iconStyle}
        aria-hidden="true"
      />
      <span>{cost.amount}</span>
      <span>{currency.code}</span>
    </span>
  );
}

function normalizeCurrencyAmountInput(value: string, fallback: number): number {
  const numericOnly = value.replace(/[^\d]/g, "");

  if (numericOnly.length === 0) {
    return 0;
  }

  const withoutLeadingZeros = numericOnly.replace(/^0+(?=\d)/, "");
  return Math.floor(clampNumber(withoutLeadingZeros, 0, 999999999, fallback));
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

function getEquipmentGroupKeyForEntry(entry: LoadoutDrawerEntry): EquipmentGroupKey {
  if (entry.category === ENTRY_CATEGORIES.WEAPONS) {
    return "weaponsAndStaff";
  }

  if (entry.category === ENTRY_CATEGORIES.ARMOR) {
    return "armorAndShield";
  }

  return "generalEquipment";
}

function groupEquipmentItems(items: LoadoutGroupItem[]): EquipmentGroup[] {
  const groupedItems: Record<EquipmentGroupKey, LoadoutGroupItem[]> = {
    weaponsAndStaff: [],
    armorAndShield: [],
    generalEquipment: []
  };

  items.forEach((item) => {
    groupedItems[getEquipmentGroupKeyForEntry(item.entry)].push(item);
  });

  return equipmentGroupMeta.map((group) => ({
    ...group,
    items: groupedItems[group.key]
  }));
}

function groupCatalogItems(
  entries: LoadoutDrawerEntry[]
): Record<CatalogTab, LoadoutDrawerEntry[]> {
  const groupedItems: Record<CatalogTab, LoadoutDrawerEntry[]> = {
    weapons: [],
    armor: [],
    items: []
  };

  entries.forEach((entry) => {
    groupedItems[getCatalogTabForItem(entry.name)].push(entry);
  });

  return groupedItems;
}

function getCatalogEntryTypeLabel(entry: LoadoutDrawerEntry): string {
  if (entry.category === ENTRY_CATEGORIES.WEAPONS) {
    return `${formatWeaponType(entry.type)} weapon`;
  }

  const primaryTag = entry.tags[0];
  return primaryTag ? formatCodexLabel(primaryTag) : formatCodexLabel(entry.category);
}

function isPurchasableLoadoutEntry(entry: LoadoutDrawerEntry): entry is PurchasableLoadoutEntry {
  return "cost" in entry && "weight" in entry;
}

function matchesCatalogSearch(entry: LoadoutDrawerEntry, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableParts = [entry.name, "rarity" in entry ? formatCodexLabel(entry.rarity) : ""];

  return searchableParts.join(" ").toLowerCase().includes(normalizedQuery);
}

function applyEquipmentToCharacter(currentCharacter: Character, itemName: string): Character {
  if (currentCharacter.equipment.some((item) => item.name === itemName)) {
    return currentCharacter;
  }

  return {
    ...currentCharacter,
    equipment: normalizeCharacterEquipmentSelections([
      ...currentCharacter.equipment,
      createCharacterEquipmentItem(itemName)
    ])
  };
}

function EquipmentForm({ className, onPersistCharacter }: EquipmentFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const customEquipment = useMemo(
    () => character.customEquipment ?? [],
    [character.customEquipment]
  );
  const catalogSearchInputRef = useRef<HTMLInputElement | null>(null);
  const catalogListRef = useRef<HTMLUListElement | null>(null);
  const [selectedLoadoutEntry, setSelectedLoadoutEntry] =
    useState<SelectedLoadoutEntryState | null>(null);
  const [selectedWeaponReference, setSelectedWeaponReference] =
    useState<SelectedWeaponReference | null>(null);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [activeCurrencyKey, setActiveCurrencyKey] = useState<CurrencyKey>("gold");
  const [currencyAmountDraft, setCurrencyAmountDraft] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCustomEquipmentModalOpen, setIsCustomEquipmentModalOpen] = useState(false);
  const [customEditorMode, setCustomEditorMode] = useState<"create" | "edit">("create");
  const [editingCustomEquipmentId, setEditingCustomEquipmentId] = useState<string | null>(null);
  const [isCatalogSearchVisible, setIsCatalogSearchVisible] = useState(false);
  const [catalogSearchDraft, setCatalogSearchDraft] = useState("");
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [activeCatalogTab, setActiveCatalogTab] = useState<CatalogTab>("weapons");
  const [catalogPageByTab, setCatalogPageByTab] =
    useState<Record<CatalogTab, number>>(createCatalogPageState);
  const [undoableCatalogActions, setUndoableCatalogActions] = useState<
    Record<string, UndoableCatalogAction>
  >({});
  const [isGeneralEquipmentExpanded, setIsGeneralEquipmentExpanded] = useState(false);
  const [pendingDeleteCustomEquipmentId, setPendingDeleteCustomEquipmentId] = useState<
    string | null
  >(null);

  const hasBackdrop = Boolean(
    selectedWeaponReference ||
    selectedLoadoutEntry ||
    isCurrencyDrawerOpen ||
    isAddModalOpen ||
    isCustomEquipmentModalOpen ||
    pendingDeleteCustomEquipmentId
  );
  useBodyScrollLock(hasBackdrop);

  useEffect(() => {
    if (!hasBackdrop) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        if (selectedWeaponReference) {
          setSelectedWeaponReference(null);
          return;
        }

        if (pendingDeleteCustomEquipmentId) {
          setPendingDeleteCustomEquipmentId(null);
          return;
        }

        if (isCustomEquipmentModalOpen) {
          closeCustomEquipmentModal();
          return;
        }

        if (selectedLoadoutEntry) {
          closeLoadoutDrawer();
          return;
        }

        if (isCurrencyDrawerOpen) {
          setIsCurrencyDrawerOpen(false);
          return;
        }

        if (isAddModalOpen) {
          closeAddModal();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    hasBackdrop,
    isAddModalOpen,
    isCurrencyDrawerOpen,
    isCustomEquipmentModalOpen,
    pendingDeleteCustomEquipmentId,
    selectedLoadoutEntry,
    selectedWeaponReference
  ]);

  useEffect(() => {
    if (isAddModalOpen && isCatalogSearchVisible) {
      catalogSearchInputRef.current?.focus();
    }
  }, [isAddModalOpen, isCatalogSearchVisible]);

  const availableEquipmentOptions = equipmentOptions;
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
    currencyDefinitions.find((currency) => currency.key === activeCurrencyKey) ??
    currencyDefinitions[2];
  const activeCurrencyAmount = normalizedCurrencies[activeCurrencyKey];
  const normalizedCurrencyAmount = Math.max(
    0,
    Math.floor(clampNumber(currencyAmountDraft, 0, 999999999, 0))
  );
  const canSpendCurrency = activeCurrencyAmount >= normalizedCurrencyAmount;
  const resolvedCustomEquipmentEntries = useMemo(
    () => getResolvedCustomLoadoutEntries(customEquipment),
    [customEquipment]
  );
  const ownedEquipmentNames = useMemo(
    () => new Set(character.equipment.map((item) => item.name)),
    [character.equipment]
  );
  const selectedLoadoutItems = useMemo(
    () => [
      ...character.equipment
        .flatMap<LoadoutGroupItem>((item) => {
          const entry = getLoadoutCodexEntryByName(item.name);

          if (!entry) {
            return [];
          }

          return [
            {
              key: `codex-${entry.id}`,
              name: entry.name,
              entry,
              onHand: item.onHand,
              worn: item.worn
            }
          ];
        }),
      ...resolvedCustomEquipmentEntries.map(
        (entry) =>
          ({
            key: `custom-${entry.customEquipmentId}`,
            name: entry.name,
            entry,
            customEquipmentId: entry.customEquipmentId,
            onHand: entry.category === ENTRY_CATEGORIES.WEAPONS ? entry.onHand : false,
            worn: entry.category === ENTRY_CATEGORIES.ARMOR ? entry.worn : false
          }) satisfies LoadoutGroupItem
      )
    ],
    [character.equipment, resolvedCustomEquipmentEntries]
  );
  const selectedEquipmentGroups = useMemo(
    () => groupEquipmentItems(selectedLoadoutItems),
    [selectedLoadoutItems]
  );
  const carriedWeight = useMemo(
    () =>
      Math.round(
        selectedLoadoutItems.reduce(
          (totalWeight, item) => totalWeight + (item.entry.weight ?? 0),
          0
        ) * 100
      ) / 100,
    [selectedLoadoutItems]
  );
  const carryingCapacity = Math.max(0, getAbilityScoreForCharacter(character, "STR") * 15);
  const isOverCarryingCapacity = carriedWeight > carryingCapacity;
  const editingCustomEquipment = editingCustomEquipmentId
    ? (findCustomEquipmentById(customEquipment, editingCustomEquipmentId) ?? null)
    : null;
  const pendingDeleteCustomEquipment = pendingDeleteCustomEquipmentId
    ? (findCustomEquipmentById(customEquipment, pendingDeleteCustomEquipmentId) ?? null)
    : null;
  const selectedLoadoutEntryData = selectedLoadoutEntry?.entry ?? null;
  const isSelectedCustomEntry = selectedLoadoutEntryData
    ? isResolvedCustomLoadoutEntry(selectedLoadoutEntryData)
    : false;
  const isCatalogDrawerInspection = selectedLoadoutEntry?.origin === "catalog";
  const heldWeaponDescriptors = useMemo(
    () => [
      ...character.equipment
        .filter((item) => item.onHand)
        .flatMap<HeldWeaponDescriptor>((item) => {
          const entry = getLoadoutCodexEntryByName(item.name);

          if (!entry) {
            return [];
          }

          const heldDescriptor = createHeldDescriptorForEntry(`codex-${entry.id}`, entry);
          return heldDescriptor ? [heldDescriptor] : [];
        }),
      ...resolvedCustomEquipmentEntries
        .filter(
          (
            entry
          ): entry is Extract<ResolvedCustomLoadoutEntry, { category: ENTRY_CATEGORIES.WEAPONS }> =>
            entry.category === ENTRY_CATEGORIES.WEAPONS && entry.onHand
        )
        .map((entry) => createHeldWeaponDescriptor(`custom-${entry.customEquipmentId}`, entry))
    ],
    [character.equipment, resolvedCustomEquipmentEntries]
  );
  const selectedHandDescriptor = useMemo(() => {
    if (!selectedLoadoutEntryData || !isHandEquippableEntry(selectedLoadoutEntryData)) {
      return null;
    }

    const key = selectedLoadoutEntry?.customEquipmentId
      ? `custom-${selectedLoadoutEntry.customEquipmentId}`
      : `codex-${selectedLoadoutEntryData.id}`;

    return createHeldDescriptorForEntry(key, selectedLoadoutEntryData);
  }, [selectedLoadoutEntry, selectedLoadoutEntryData]);
  const isSelectedEntryOnHand = useMemo(() => {
    if (!selectedLoadoutEntryData || !isHandEquippableEntry(selectedLoadoutEntryData)) {
      return false;
    }

    if (selectedLoadoutEntry?.customEquipmentId) {
      const customWeapon = findCustomEquipmentById(
        customEquipment,
        selectedLoadoutEntry.customEquipmentId
      );
      return customWeapon?.kind === "weapon" ? customWeapon.onHand : false;
    }

    return Boolean(
      getCharacterEquipmentItem(character.equipment, selectedLoadoutEntryData.name)?.onHand
    );
  }, [character.equipment, customEquipment, selectedLoadoutEntry, selectedLoadoutEntryData]);
  const isSelectedArmorWorn = useMemo(() => {
    if (
      !selectedLoadoutEntryData ||
      selectedLoadoutEntryData.category !== ENTRY_CATEGORIES.ARMOR ||
      isShieldArmorEntry(selectedLoadoutEntryData)
    ) {
      return false;
    }

    if (selectedLoadoutEntry?.customEquipmentId) {
      const customArmor = findCustomEquipmentById(
        customEquipment,
        selectedLoadoutEntry.customEquipmentId
      );
      return customArmor?.kind === "armor" ? customArmor.worn : false;
    }

    return Boolean(getCharacterEquipmentItem(character.equipment, selectedLoadoutEntryData.name)?.worn);
  }, [character.equipment, customEquipment, selectedLoadoutEntry, selectedLoadoutEntryData]);
  const isSelectedShield =
    selectedLoadoutEntryData?.category === ENTRY_CATEGORIES.ARMOR &&
    isShieldArmorEntry(selectedLoadoutEntryData);
  const selectedWeaponMasteryStatus = useMemo(() => {
    if (
      !selectedLoadoutEntryData ||
      selectedLoadoutEntryData.category !== ENTRY_CATEGORIES.WEAPONS
    ) {
      return null;
    }

    if (!selectedLoadoutEntryData.mastery || !selectedLoadoutEntryData.baseWeapon) {
      return null;
    }

    const masteryProficiency = getWeaponProficiencyForBaseWeapon(
      selectedLoadoutEntryData.baseWeapon
    );
    const hasMastery =
      getWeaponLevelFromEntries(character.weaponProficiencies, masteryProficiency) !==
      PROF_LEVEL.NONE;

    return hasMastery ? "Active" : "Inactive";
  }, [character.weaponProficiencies, selectedLoadoutEntryData]);
  const canSelectedEntryBePutOnHand =
    selectedHandDescriptor && !isSelectedEntryOnHand
      ? canWeaponBePutOnHand(selectedHandDescriptor, heldWeaponDescriptors)
      : false;
  const shouldOfferHandSwap =
    Boolean(selectedHandDescriptor) &&
    !isSelectedEntryOnHand &&
    !canSelectedEntryBePutOnHand;
  const availableCatalogItems = useMemo(
    () =>
      groupCatalogItems(
        availableEquipmentOptions
          .map((itemName) => getLoadoutCodexEntryByName(itemName))
          .filter((entry): entry is LoadoutCodexEntry => entry !== undefined)
          .filter((entry) => matchesCatalogSearch(entry, catalogSearchQuery))
      ),
    [availableEquipmentOptions, catalogSearchQuery]
  );

  const activeCatalogItems = availableCatalogItems[activeCatalogTab] ?? [];
  const totalCatalogPages = Math.max(1, Math.ceil(activeCatalogItems.length / EQUIPMENT_PAGE_SIZE));
  const activeCatalogPage = Math.min(catalogPageByTab[activeCatalogTab] ?? 1, totalCatalogPages);
  const paginatedCatalogItems = activeCatalogItems.slice(
    (activeCatalogPage - 1) * EQUIPMENT_PAGE_SIZE,
    activeCatalogPage * EQUIPMENT_PAGE_SIZE
  );

  useEffect(() => {
    if (!isAddModalOpen) {
      return;
    }

    catalogListRef.current?.scrollTo({ top: 0 });
  }, [isAddModalOpen, activeCatalogPage, activeCatalogTab, catalogSearchQuery]);

  function openLoadoutEntryDetails(item: LoadoutGroupItem) {
    setIsCurrencyDrawerOpen(false);
    setSelectedWeaponReference(null);
    setSelectedLoadoutEntry({
      entry: item.entry,
      customEquipmentId: item.customEquipmentId,
      origin: "loadout"
    });
  }

  function openWeaponReference(title: string, keywords: string[]) {
    const entries = getKeywordReferences(keywords);

    if (entries.length === 0) {
      return;
    }

    setSelectedWeaponReference({
      name: title,
      entries
    });
  }

  function resetCatalogSearch() {
    setIsCatalogSearchVisible(false);
    setCatalogSearchDraft("");
    setCatalogSearchQuery("");
    setCatalogPageByTab(createCatalogPageState());
  }

  function closeAddModal() {
    setIsAddModalOpen(false);
    setUndoableCatalogActions({});
    resetCatalogSearch();
  }

  function openCustomEquipmentCreator() {
    closeAddModal();
    setIsCustomEquipmentModalOpen(true);
    setCustomEditorMode("create");
    setEditingCustomEquipmentId(null);
  }

  function openCustomEquipmentEditor(customEquipmentId: string) {
    setSelectedWeaponReference(null);
    setSelectedLoadoutEntry(null);
    setIsCurrencyDrawerOpen(false);
    setIsCustomEquipmentModalOpen(true);
    setCustomEditorMode("edit");
    setEditingCustomEquipmentId(customEquipmentId);
  }

  function closeCustomEquipmentModal() {
    setIsCustomEquipmentModalOpen(false);
    setCustomEditorMode("create");
    setEditingCustomEquipmentId(null);
  }

  function saveCustomEquipment(customEquipmentEntry: Character["customEquipment"][number]) {
    onPersistCharacter((currentCharacter) => {
      const normalizedCustomEquipmentEntry =
        customEquipmentEntry.kind === "weapon" && customEquipmentEntry.onHand
          ? (() => {
              const otherHeldWeapons: HeldWeaponDescriptor[] = [
                ...currentCharacter.equipment
                  .filter((item) => item.onHand)
                  .map((item) => {
                    const entry = getLoadoutCodexEntryByName(item.name);

                    if (!entry) {
                      return null;
                    }

                    return createHeldDescriptorForEntry(`codex-${entry.id}`, entry);
                  })
                  .filter((entry): entry is HeldWeaponDescriptor => entry !== null),
                ...currentCharacter.customEquipment
                  .filter(
                    (
                      entry
                    ): entry is Extract<Character["customEquipment"][number], { kind: "weapon" }> =>
                      entry.kind === "weapon" &&
                      entry.onHand &&
                      entry.id !== customEquipmentEntry.id
                  )
                  .map((entry) => createHeldWeaponDescriptor(`custom-${entry.id}`, entry))
              ];
              const nextDescriptor = createHeldWeaponDescriptor(
                `custom-${customEquipmentEntry.id}`,
                customEquipmentEntry
              );

              return canWeaponBePutOnHand(nextDescriptor, otherHeldWeapons)
                ? customEquipmentEntry
                : {
                    ...customEquipmentEntry,
                    onHand: false
                  };
            })()
          : customEquipmentEntry;
      const hasExistingEntry = currentCharacter.customEquipment.some(
        (entry) => entry.id === normalizedCustomEquipmentEntry.id
      );

      return {
        ...currentCharacter,
        customEquipment: hasExistingEntry
          ? currentCharacter.customEquipment.map((entry) =>
              entry.id === normalizedCustomEquipmentEntry.id
                ? normalizedCustomEquipmentEntry
                : entry
            )
          : [...currentCharacter.customEquipment, normalizedCustomEquipmentEntry]
      };
    });

    closeLoadoutDrawer();
    closeCustomEquipmentModal();
  }

  function deleteCustomEquipment(customEquipmentId: string) {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      customEquipment: currentCharacter.customEquipment.filter(
        (entry) => entry.id !== customEquipmentId
      )
    }));

    setPendingDeleteCustomEquipmentId(null);
    closeLoadoutDrawer();
  }

  function openCurrencyModal() {
    setSelectedWeaponReference(null);
    setSelectedLoadoutEntry(null);
    setCurrencyAmountDraft(0);
    setIsCurrencyDrawerOpen(true);
  }

  function runCatalogSearch() {
    setCatalogSearchQuery(catalogSearchDraft.trim());
    setCatalogPageByTab(createCatalogPageState());
  }

  function addEquipmentItem(itemName: string) {
    if (ownedEquipmentNames.has(itemName)) {
      return;
    }

    onPersistCharacter((currentCharacter) => applyEquipmentToCharacter(currentCharacter, itemName));
    setUndoableCatalogActions((currentActions) => ({
      ...currentActions,
      [itemName]: { refundCost: null }
    }));
  }

  function canAffordEntry(entry: PurchasableLoadoutEntry): boolean {
    const currencyKey = currencyKeyByType[entry.cost.currency];
    return normalizedCurrencies[currencyKey] >= entry.cost.amount;
  }

  function buyEquipmentItem(entry: PurchasableLoadoutEntry) {
    if (ownedEquipmentNames.has(entry.name) || !canAffordEntry(entry)) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (currentCharacter.equipment.some((item) => item.name === entry.name)) {
        return currentCharacter;
      }

      const currencyKey = currencyKeyByType[entry.cost.currency];
      const currentCurrencyAmount = Math.max(
        0,
        Math.floor(clampNumber(currentCharacter.currencies[currencyKey], 0, 999999999, 0))
      );

      if (currentCurrencyAmount < entry.cost.amount) {
        return currentCharacter;
      }

      return applyEquipmentToCharacter(
        {
          ...currentCharacter,
          currencies: {
            ...currentCharacter.currencies,
            [currencyKey]: currentCurrencyAmount - entry.cost.amount
          }
        },
        entry.name
      );
    });

    setUndoableCatalogActions((currentActions) => ({
      ...currentActions,
      [entry.name]: { refundCost: entry.cost }
    }));
  }

  function undoCatalogAction(itemName: string) {
    const undoableAction = undoableCatalogActions[itemName];

    if (!undoableAction) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (!currentCharacter.equipment.some((item) => item.name === itemName)) {
        return currentCharacter;
      }

      const nextEquipment = currentCharacter.equipment.filter(
        (equipmentItem) => equipmentItem.name !== itemName
      );

      if (!undoableAction.refundCost) {
        return {
          ...currentCharacter,
          equipment: nextEquipment
        };
      }

      const currencyKey = currencyKeyByType[undoableAction.refundCost.currency];
      const currentCurrencyAmount = Math.max(
        0,
        Math.floor(clampNumber(currentCharacter.currencies[currencyKey], 0, 999999999, 0))
      );

      return {
        ...currentCharacter,
        equipment: nextEquipment,
        currencies: {
          ...currentCharacter.currencies,
          [currencyKey]: Math.floor(
            clampNumber(currentCurrencyAmount + undoableAction.refundCost.amount, 0, 999999999, 0)
          )
        }
      };
    });

    setUndoableCatalogActions((currentActions) => {
      const nextActions = { ...currentActions };
      delete nextActions[itemName];
      return nextActions;
    });
  }

  function removeEquipmentItem(itemName: string) {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      equipment: currentCharacter.equipment.filter(
        (equipmentItem) => equipmentItem.name !== itemName
      )
    }));

    closeLoadoutDrawer();
  }

  function closeLoadoutDrawer() {
    setSelectedWeaponReference(null);
    setSelectedLoadoutEntry(null);
  }

  function toggleEntryOnHand() {
    if (!selectedLoadoutEntryData || !isHandEquippableEntry(selectedLoadoutEntryData)) {
      return;
    }

    if (!isSelectedEntryOnHand && !canSelectedEntryBePutOnHand) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (selectedLoadoutEntry?.customEquipmentId) {
        return {
          ...currentCharacter,
          customEquipment: currentCharacter.customEquipment.map((entry) => {
            if (entry.id !== selectedLoadoutEntry.customEquipmentId || entry.kind !== "weapon") {
              return entry;
            }

            return {
              ...entry,
              onHand: !entry.onHand
            };
          })
        };
      }

      return {
        ...currentCharacter,
        equipment: currentCharacter.equipment.map((equipmentItem) =>
          equipmentItem.name === selectedLoadoutEntryData.name
            ? {
                ...equipmentItem,
                onHand: !equipmentItem.onHand
              }
            : equipmentItem
        )
      };
    });

    closeLoadoutDrawer();
  }

  function swapEntryToHand() {
    if (!selectedLoadoutEntryData || !isHandEquippableEntry(selectedLoadoutEntryData) || isSelectedEntryOnHand) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextEquipment = currentCharacter.equipment.map((equipmentItem) => ({
        ...equipmentItem,
        onHand: equipmentItem.name === selectedLoadoutEntryData.name
      }));
      const nextCustomEquipment = currentCharacter.customEquipment.map((entry) =>
        entry.kind !== "weapon"
          ? entry
          : {
              ...entry,
              onHand: entry.id === selectedLoadoutEntry?.customEquipmentId
            }
      );

      return {
        ...currentCharacter,
        equipment: nextEquipment,
        customEquipment: nextCustomEquipment
      };
    });

    closeLoadoutDrawer();
  }

  function toggleArmorWorn() {
    if (!selectedLoadoutEntryData || selectedLoadoutEntryData.category !== ENTRY_CATEGORIES.ARMOR) {
      return;
    }

    const nextWornState = !isSelectedArmorWorn;

    onPersistCharacter((currentCharacter) =>
      selectedLoadoutEntry?.customEquipmentId
        ? setCustomArmorWornState(
            currentCharacter,
            selectedLoadoutEntry.customEquipmentId,
            nextWornState
          )
        : setCodexArmorWornState(currentCharacter, selectedLoadoutEntryData.name, nextWornState)
    );

    closeLoadoutDrawer();
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
          <div
            className={styles.carryCapacityPill}
            aria-label={`Carried weight ${formatWeightValue(carriedWeight)} out of ${formatWeightValue(
              carryingCapacity
            )} pounds`}
          >
            <span
              className={clsx(
                styles.carryCapacityValue,
                isOverCarryingCapacity && styles.carryCapacityValueOver
              )}
            >
              {formatWeightValue(carriedWeight)}
            </span>
            <span className={styles.carryCapacityDivider}>/</span>
            <span className={styles.carryCapacityLimit}>
              {formatWeightValue(carryingCapacity)} lb
            </span>
          </div>
          <button type="button" className={shared.currencyPill} onClick={openCurrencyModal}>
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
                    {normalizedCurrencies[currency.key]}
                  </span>
                  <span className={styles.currencyPillTokenCode}>{currency.code}</span>
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

      {selectedLoadoutItems.length === 0 ? (
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
                      <li key={item.key}>
                        <button
                          type="button"
                          className={styles.equipmentItemButton}
                          onClick={() => openLoadoutEntryDetails(item)}
                        >
                          <span className={styles.equipmentItemLabel}>
                            <span className={styles.equipmentItemName}>{item.name}</span>
                            {item.onHand ? (
                              <span className={styles.equipmentItemOnHand}>
                                <Hand size={13} aria-hidden="true" />
                                <span>On Hand</span>
                              </span>
                            ) : null}
                            {item.worn ? (
                              <span className={styles.equipmentItemWorn}>
                                <Shield size={13} aria-hidden="true" />
                                <span>Worn</span>
                              </span>
                            ) : null}
                          </span>
                          <span className={styles.equipmentItemMeta}>
                            <span className={styles.equipmentItemWeight}>
                              {formatEquipmentWeight(item.entry.weight)}
                            </span>
                            {"rarity" in item.entry ? (
                              <RarityPill rarity={item.entry.rarity} />
                            ) : null}
                          </span>
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
          onClick={closeAddModal}
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
              <div className={styles.catalogHeaderActions}>
                <button
                  type="button"
                  className={styles.catalogIconButton}
                  onClick={() => {
                    if (isCatalogSearchVisible) {
                      resetCatalogSearch();
                      return;
                    }

                    setIsCatalogSearchVisible(true);
                  }}
                  aria-label={
                    isCatalogSearchVisible ? "Close equipment search" : "Open equipment search"
                  }
                  title={isCatalogSearchVisible ? "Close search" : "Open search"}
                >
                  {isCatalogSearchVisible ? (
                    <SearchX size={16} aria-hidden="true" />
                  ) : (
                    <Search size={16} aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  className={clsx(shared.currencyPill, styles.catalogCurrencyPill)}
                  onClick={openCurrencyModal}
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
                          {normalizedCurrencies[currency.key]}
                        </span>
                        <span className={styles.currencyPillTokenCode}>{currency.code}</span>
                      </span>
                    ))}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.catalogCreateCustomButton}
                  onClick={openCustomEquipmentCreator}
                >
                  <Plus size={14} aria-hidden="true" />
                  <span>Custom</span>
                </button>
                <button
                  type="button"
                  className={sheetStyles.spellManagementCloseButton}
                  onClick={closeAddModal}
                  aria-label="Close add equipment popup"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {isCatalogSearchVisible ? (
              <div className={styles.catalogSearchRow}>
                <div className={styles.catalogSearchField}>
                  <input
                    ref={catalogSearchInputRef}
                    type="text"
                    className={styles.catalogSearchInput}
                    value={catalogSearchDraft}
                    onChange={(event) => setCatalogSearchDraft(event.target.value)}
                    placeholder="Search by name or rarity"
                  />
                </div>
                <button
                  type="button"
                  className={styles.catalogSearchButton}
                  onClick={runCatalogSearch}
                >
                  Search
                </button>
              </div>
            ) : null}

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
                <ul ref={catalogListRef} className={styles.catalogItemList}>
                  {paginatedCatalogItems.map((catalogEntry) => {
                    const isAlreadyAdded = ownedEquipmentNames.has(catalogEntry.name);
                    const isUndoable = Boolean(undoableCatalogActions[catalogEntry.name]);
                    const isPurchasable = isPurchasableLoadoutEntry(catalogEntry);
                    const canAffordPurchase = isPurchasable ? canAffordEntry(catalogEntry) : false;
                    const subtitle = getCatalogEntryTypeLabel(catalogEntry);
                    return (
                      <li
                        key={catalogEntry.name}
                        className={clsx(
                          styles.catalogItemRow,
                          isAlreadyAdded && styles.catalogItemRowDisabled
                        )}
                      >
                        <button
                          type="button"
                          className={clsx(
                            styles.catalogItemMetaButton,
                            isAlreadyAdded && styles.catalogItemMetaButtonDisabled
                          )}
                          disabled={isAlreadyAdded}
                          onClick={() => {
    setSelectedWeaponReference(null);
                            setSelectedLoadoutEntry({
                              entry: catalogEntry,
                              origin: "catalog"
                            });
                          }}
                        >
                          <div className={styles.catalogItemMeta}>
                            <div className={styles.catalogItemHeading}>
                              <span className={styles.catalogItemName}>{catalogEntry.name}</span>
                            </div>
                            <span className={styles.catalogItemType}>{subtitle}</span>
                          </div>
                        </button>
                        <div className={styles.catalogItemStats}>
                          {"rarity" in catalogEntry ? (
                            <RarityPill rarity={catalogEntry.rarity} />
                          ) : null}
                          <div className={styles.catalogItemMetric}>
                            <span className={styles.catalogItemStat}>
                              {formatEquipmentWeight(catalogEntry.weight)}
                            </span>
                          </div>
                          <div className={styles.catalogItemMetric}>
                            <span className={styles.catalogItemStat}>
                              {renderCurrencyDisplay(catalogEntry.cost)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.catalogItemActions}>
                          {isAlreadyAdded ? (
                            isUndoable ? (
                              <button
                                type="button"
                                className={styles.catalogItemUndoLink}
                                onClick={() => undoCatalogAction(catalogEntry.name)}
                              >
                                Undo
                              </button>
                            ) : (
                              <span className={styles.catalogItemAddedLabel}>Added</span>
                            )
                          ) : (
                            <>
                              <button
                                type="button"
                                className={clsx(
                                  styles.catalogItemBuyButton,
                                  !canAffordPurchase && styles.catalogItemBuyButtonDisabled
                                )}
                                disabled={!isPurchasable || !canAffordPurchase}
                                onClick={() => {
                                  if (isPurchasable) {
                                    buyEquipmentItem(catalogEntry);
                                  }
                                }}
                              >
                                <span>Buy</span>
                              </button>
                              <button
                                type="button"
                                className={styles.catalogItemAddButton}
                                onClick={() => addEquipmentItem(catalogEntry.name)}
                              >
                                <span>Add</span>
                              </button>
                            </>
                          )}
                        </div>
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

      {isCustomEquipmentModalOpen ? (
        <div
          className={clsx(sheetStyles.spellManagementBackdrop, styles.customEquipmentModalBackdrop)}
          role="presentation"
          onClick={closeCustomEquipmentModal}
        >
          <section
            className={clsx(sheetStyles.spellManagementModal, styles.customEquipmentModal)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-custom-equipment-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Equipment</p>
                <h3 id="character-custom-equipment-title">
                  {customEditorMode === "edit"
                    ? "Edit custom equipment"
                    : "Create custom equipment"}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={closeCustomEquipmentModal}
                aria-label="Close custom equipment modal"
              >
                <X size={18} />
              </button>
            </div>

            <CustomEquipmentEditor
              mode={customEditorMode}
              initialEquipment={editingCustomEquipment}
              onCancel={closeCustomEquipmentModal}
              onSave={saveCustomEquipment}
            />
          </section>
        </div>
      ) : null}

      {isCurrencyDrawerOpen ? (
        <div
          className={clsx(sheetStyles.spellManagementBackdrop, styles.currencyModalBackdrop)}
          role="presentation"
          onClick={() => setIsCurrencyDrawerOpen(false)}
        >
          <section
            className={clsx(sheetStyles.spellManagementModal, styles.currencyModal)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-currency-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Currency</p>
                <h3 id="character-currency-modal-title">Currency balance</h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsCurrencyDrawerOpen(false)}
                aria-label="Close currency modal"
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

            <div className={clsx(sheetStyles.currencyDrawerContent, styles.currencyModalActionRow)}>
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
              <div className={clsx(sheetStyles.currencyDrawerActions, styles.currencyModalActions)}>
                <button
                  type="button"
                  className={sheetStyles.currencySpendButton}
                  disabled={!canSpendCurrency}
                  onClick={() => adjustCurrencyBalance("spend")}
                >
                  <Minus
                    size={16}
                    aria-hidden="true"
                    className={sheetStyles.currencyActionIconSpend}
                  />
                  Spend
                </button>
                <button
                  type="button"
                  className={sheetStyles.currencyGainButton}
                  onClick={() => adjustCurrencyBalance("gain")}
                >
                  <Plus
                    size={16}
                    aria-hidden="true"
                    className={sheetStyles.currencyActionIconGain}
                  />
                  Gain
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {selectedLoadoutEntry && selectedLoadoutEntryData ? (
        <div
          className={clsx(sheetStyles.spellDrawerBackdrop, styles.equipmentOverlayDrawerBackdrop)}
          role="presentation"
          onClick={closeLoadoutDrawer}
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
                  {formatCodexLabel(selectedLoadoutEntryData.category)}
                </p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-loadout-drawer-title">{selectedLoadoutEntryData.name}</h3>
                  {isSelectedEntryOnHand ? (
                    <span className={styles.drawerOnHandBadge}>
                      <Hand size={13} aria-hidden="true" />
                      <span>On Hand</span>
                    </span>
                  ) : null}
                  {isSelectedArmorWorn ? (
                    <span className={styles.drawerWornBadge}>
                      <Shield size={13} aria-hidden="true" />
                      <span>Worn</span>
                    </span>
                  ) : null}
                  {"rarity" in selectedLoadoutEntryData ? (
                    <RarityPill rarity={selectedLoadoutEntryData.rarity} />
                  ) : null}
                </div>
                <p className={sheetStyles.spellDrawerSummary}>{selectedLoadoutEntryData.summary}</p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={closeLoadoutDrawer}
                aria-label="Close loadout details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.spellDrawerBody}>
              <div className={sheetStyles.spellDrawerDetails}>
                {selectedLoadoutEntryData.category === ENTRY_CATEGORIES.WEAPONS ? (
                  <>
                    <div className={sheetStyles.spellDrawerDetailCard}>
                      <span>Type</span>
                      <strong>{formatWeaponType(selectedLoadoutEntryData.type)} weapon</strong>
                    </div>
                    <div className={sheetStyles.spellDrawerDetailCard}>
                      <span>Damage</span>
                      <strong>{formatWeaponDamage(selectedLoadoutEntryData.damage)}</strong>
                    </div>
                    <button
                      type="button"
                      className={clsx(
                        sheetStyles.spellDrawerDetailCard,
                        styles.referenceDetailButton
                      )}
                      onClick={() =>
                        openWeaponReference(
                          "Properties",
                          selectedLoadoutEntryData.properties.map((property) =>
                            formatCodexLabel(property)
                          )
                        )
                      }
                    >
                      <span>Properties</span>
                      <strong>{formatWeaponProperties(selectedLoadoutEntryData)}</strong>
                    </button>
                    {selectedLoadoutEntryData.mastery ? (
                      <button
                        type="button"
                        className={clsx(
                          sheetStyles.spellDrawerDetailCard,
                          styles.referenceDetailButton
                        )}
                        onClick={() =>
                          openWeaponReference("Mastery", [
                            formatCodexLabel(selectedLoadoutEntryData.mastery!)
                          ])
                        }
                      >
                        <span>
                          {selectedWeaponMasteryStatus
                            ? `Mastery (${selectedWeaponMasteryStatus})`
                            : "Mastery"}
                        </span>
                        <strong>{formatCodexLabel(selectedLoadoutEntryData.mastery)}</strong>
                      </button>
                    ) : (
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Mastery</span>
                        <strong>None</strong>
                      </div>
                    )}
                    <div className={sheetStyles.spellDrawerDetailCard}>
                      <span>Weight</span>
                      <strong>{formatWeaponWeight(selectedLoadoutEntryData.weight)}</strong>
                    </div>
                    <div className={sheetStyles.spellDrawerDetailCard}>
                      <span>Cost</span>
                      <strong>
                        {renderCurrencyDisplay(selectedLoadoutEntryData.cost, {
                          classNames: {
                            root: styles.drawerCurrencyDisplay,
                            icon: styles.drawerCurrencyIcon
                          },
                          fontSize: "16px",
                          color: "rgb(46, 32, 23)",
                          fontWeight: 700
                        })}
                      </strong>
                    </div>
                  </>
                ) : selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR && isSelectedShield ? null : (
                  <div className={sheetStyles.spellDrawerDetailCard}>
                    <span>Type</span>
                    <strong>
                      {isSelectedCustomEntry
                        ? selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR
                          ? "Custom armor"
                          : "Custom item"
                        : selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR
                          ? getArmorTypeSummary(selectedLoadoutEntryData)
                          : formatCodexList(selectedLoadoutEntryData.tags)}
                    </strong>
                  </div>
                )}

                {selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR ? (
                  <>
                    {!isSelectedShield ? (
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Armor base</span>
                        <strong>{selectedLoadoutEntryData.armorBase}</strong>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {selectedLoadoutEntryData.category !== ENTRY_CATEGORIES.WEAPONS ? (
                  <>
                    <div className={sheetStyles.spellDrawerDetailCard}>
                      <span>Weight</span>
                      <strong>{formatEquipmentWeight(selectedLoadoutEntryData.weight)}</strong>
                    </div>
                    <div className={sheetStyles.spellDrawerDetailCard}>
                      <span>Cost</span>
                      <strong>
                        {renderCurrencyDisplay(selectedLoadoutEntryData.cost, {
                          classNames: {
                            root: styles.drawerCurrencyDisplay,
                            icon: styles.drawerCurrencyIcon
                          },
                          fontSize: "16px",
                          color: "rgb(46, 32, 23)",
                          fontWeight: 700
                        })}
                      </strong>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {!isCatalogDrawerInspection ? (
              <div className={styles.loadoutDrawerActions}>
                {selectedLoadoutEntryData && isHandEquippableEntry(selectedLoadoutEntryData) ? (
                  <>
                    {shouldOfferHandSwap ? (
                      <span className={styles.weaponHandStatusText}>Hands are full</span>
                    ) : null}
                    <button
                      type="button"
                      className={clsx(
                        styles.editItemButton,
                        shouldOfferHandSwap && styles.weaponHandSwapButton
                      )}
                      onClick={shouldOfferHandSwap ? swapEntryToHand : toggleEntryOnHand}
                    >
                      <Hand size={15} aria-hidden="true" />
                      {isSelectedEntryOnHand
                        ? "Remove from Hand"
                        : shouldOfferHandSwap
                          ? "Swap to Hand"
                          : "Put on Hand"}
                    </button>
                  </>
                ) : null}
                {selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR && !isSelectedShield ? (
                  <button
                    type="button"
                    className={styles.editItemButton}
                    onClick={toggleArmorWorn}
                  >
                    <Shield size={15} aria-hidden="true" />
                    {isSelectedArmorWorn ? "Remove Armor" : "Wear Armor"}
                  </button>
                ) : null}
                {selectedLoadoutEntry.customEquipmentId ? (
                  <>
                    <button
                      type="button"
                      className={styles.editItemButton}
                      onClick={() =>
                        openCustomEquipmentEditor(selectedLoadoutEntry.customEquipmentId!)
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.removeItemButton}
                      onClick={() =>
                        setPendingDeleteCustomEquipmentId(
                          selectedLoadoutEntry.customEquipmentId ?? null
                        )
                      }
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.removeItemButton}
                    onClick={() => removeEquipmentItem(selectedLoadoutEntryData.name)}
                  >
                    Remove Item
                  </button>
                )}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {selectedWeaponReference ? (
        <KeywordReferenceDrawer
          title={selectedWeaponReference.name}
          entries={selectedWeaponReference.entries}
          onClose={() => setSelectedWeaponReference(null)}
          backdropClassName={styles.masteryReferenceBackdrop}
        />
      ) : null}

      {pendingDeleteCustomEquipment ? (
        <div
          className={styles.customEquipmentDeleteBackdrop}
          role="presentation"
          onClick={() => setPendingDeleteCustomEquipmentId(null)}
        >
          <section
            className={styles.customEquipmentDeleteCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-equipment-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h4 id="custom-equipment-delete-title">Delete custom equipment?</h4>
            <p>
              This will permanently remove <strong>{pendingDeleteCustomEquipment.name}</strong> from
              the character&apos;s loadout.
            </p>
            <div className={styles.customEquipmentDeleteActions}>
              <button
                type="button"
                className={styles.customEquipmentDeleteCancelButton}
                onClick={() => setPendingDeleteCustomEquipmentId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.customEquipmentDeleteConfirmButton}
                onClick={() => deleteCustomEquipment(pendingDeleteCustomEquipment.id)}
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </article>
  );
}

export default EquipmentForm;
