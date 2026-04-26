import clsx from "clsx";
import { Hand, Minus, Package, Plus, Shield, TicketMinus, TicketPlus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import CellContainer from "../../../CellContainer/CellContainer";
import coinCopperIcon from "../../../../assets/svg/coin-copper.svg";
import coinElectrumIcon from "../../../../assets/svg/coin-electrum.svg";
import coinGoldIcon from "../../../../assets/svg/coin.svg";
import coinPlatinumIcon from "../../../../assets/svg/coin-platinum.svg";
import coinSilverIcon from "../../../../assets/svg/coin-silver.svg";
import CurrencyInlineDisplay from "../../../CurrencyInlineDisplay";
import NumberInput from "../../FormInputs/NumberInput";
import RarityPill, { hasDisplayableRarity } from "../../../CodexPage/RarityPill";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { fetchItemPackContents } from "../../../../api";
import {
  ENTRY_CATEGORIES,
  type ArmorEntry,
  type ItemEntry,
  type WeaponEntry
} from "../../../../codex/entries";
import { currencyKeys, type Character, type CurrencyKey } from "../../../../types";
import {
  formatEquipmentWeight,
  formatCodexLabel,
  formatCodexList,
  formatWeaponDamage,
  formatWeaponProperties,
  formatWeaponType,
  formatWeaponWeight
} from "../../../../utils/codex";
import { getLoadoutCodexEntryByName } from "../../../../pages/CharactersPage/proficiency";
import {
  getAdditionalWeaponMasteriesForCharacter,
  getFeatureEquipmentEntriesForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import { getAbilityScoreForCharacter } from "../../../../pages/CharactersPage/abilities";
import { hasActiveWeaponMastery } from "../../../../pages/CharactersPage/weaponMasteryStatus";
import { hasAppliedWeaponProficiency } from "../../../../pages/CharactersPage/weaponProficiencyStatus";
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
  canWeaponCopiesBePutOnHand,
  createHeldShieldDescriptor,
  canWeaponBePutOnHand,
  createHeldWeaponDescriptor,
  getCharacterEquipmentItem,
  type HeldWeaponDescriptor
} from "../../../../pages/CharactersPage/inventory";
import { clearCharacterHandOccupants } from "../../../../pages/CharactersPage/handStateMutations";
import {
  isShieldArmorEntry,
  setCodexArmorWornState,
  setCustomArmorWornState,
  setInventoryItemArmorWornState
} from "../../../../pages/CharactersPage/armor";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  addInventoryItemCopies,
  createCharacterInventoryItem,
  createHeldDescriptorForInventoryItem,
  findAvailableInventoryCopyByKey,
  findFirstInventoryCopyByKey,
  findHeldInventoryCopiesByKey,
  findOwnedInventoryItemRecord,
  findWornInventoryCopyByKey,
  getPreferredInventoryCopiesByKey,
  getInventoryItemCountsByKey,
  getItemTransactionCost,
  getItemWeightValue,
  getAdaptedItemWeapon,
  groupCharacterInventoryItems,
  isExtractableEquipmentPackRecord,
  isItemBodyArmorRecord,
  isItemHandEquippableRecord,
  isItemShieldRecord,
  removeOneInventoryItemCopyByKey,
  type GroupedInventoryItem
} from "../../../../pages/CharactersPage/inventoryItems";
import KeywordReferenceDrawer from "../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import type { ItemRecord } from "../../../../types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import CustomEquipmentEditor from "../CustomEquipmentEditor";
import EquipmentInventoryItemDrawer from "./EquipmentInventoryItemDrawer";
import EquipmentInventoryItemDrawerHeader from "./EquipmentInventoryItemDrawerHeader";
import EquipmentInventoryItemDrawerFooter, {
  type EquipmentInventoryDrawerAction
} from "./EquipmentInventoryItemDrawerFooter";
import EquipmentItemBrowserModal from "./EquipmentItemBrowserModal";
import InlineToggleButton from "../InlineToggleButton";
import styles from "./EquipmentForm.module.css";
import { useItemEntry } from "../../../../pages/ItemCodexEntryPage/useItemEntry";
import WeaponMasteryStatusLabel from "../../../WeaponMasteryStatusLabel/WeaponMasteryStatusLabel";

type EquipmentFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type LoadoutDrawerEntry = ArmorEntry | ItemEntry | WeaponEntry | ResolvedCustomLoadoutEntry;
type EquipmentGroupKey = "weaponsAndStaff" | "armorAndShield" | "generalEquipment";
type SelectedLoadoutEntryState = {
  entry: LoadoutDrawerEntry;
  customEquipmentId?: string;
  featureManagedSource?: string;
  summaryText?: string;
  origin: "loadout";
};
type SelectedInventoryInspectionState = {
  itemKey: string;
  initialItem: ItemRecord | null;
  source: "browser" | "inventory";
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
  featureManagedSource?: string;
  summaryText?: string;
  onHand: boolean;
  worn: boolean;
};
type EquipmentGroup = {
  key: EquipmentGroupKey;
  title: string;
  description: string;
  items: LoadoutGroupItem[];
};

type CurrencyDefinition = {
  key: CurrencyKey;
  label: string;
  code: string;
  icon: string;
};

type InventoryEquipmentGroup = Omit<EquipmentGroup, "items"> & {
  items: GroupedInventoryItem[];
};

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

const currencyDefinitions: CurrencyDefinition[] = [
  { key: "copper", label: "Copper", code: "CP", icon: coinCopperIcon },
  { key: "silver", label: "Silver", code: "SP", icon: coinSilverIcon },
  { key: "electrum", label: "Electrum", code: "EP", icon: coinElectrumIcon },
  { key: "gold", label: "Gold", code: "GP", icon: coinGoldIcon },
  { key: "platinum", label: "Platinum", code: "PP", icon: coinPlatinumIcon }
];

function isHandEquippableEntry(entry: LoadoutDrawerEntry): boolean {
  return (
    entry.category === ENTRY_CATEGORIES.WEAPONS ||
    (entry.category === ENTRY_CATEGORIES.ARMOR && isShieldArmorEntry(entry))
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

function normalizeCurrencyAmountInput(value: string, fallback: number): number {
  const numericOnly = value.replace(/[^\d]/g, "");

  if (numericOnly.length === 0) {
    return 0;
  }

  const withoutLeadingZeros = numericOnly.replace(/^0+(?=\d)/, "");
  return Math.floor(clampNumber(withoutLeadingZeros, 0, 999999999, fallback));
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

function getEquipmentGroupKeyForInventoryItem(item: ItemRecord): EquipmentGroupKey {
  if (
    item.weapon ||
    item.category?.key === "staff" ||
    item.category?.key === "spellcasting-focus"
  ) {
    return "weaponsAndStaff";
  }

  if (isItemShieldRecord(item) || isItemBodyArmorRecord(item)) {
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

function groupInventoryEquipmentItems(items: GroupedInventoryItem[]): InventoryEquipmentGroup[] {
  const groupedItems: Record<EquipmentGroupKey, GroupedInventoryItem[]> = {
    weaponsAndStaff: [],
    armorAndShield: [],
    generalEquipment: []
  };

  items.forEach((item) => {
    groupedItems[getEquipmentGroupKeyForInventoryItem(item.item)].push(item);
  });

  return equipmentGroupMeta.map((group) => ({
    ...group,
    items: groupedItems[group.key]
  }));
}

function formatInventoryStackName(item: GroupedInventoryItem): string {
  return item.count > 1 ? `${item.count}x ${item.name}` : item.name;
}

function formatOnHandLabel(onHandCount: number): string {
  return onHandCount > 1 ? `On Hand x${onHandCount}` : "On Hand";
}

function EquipmentForm({ character, className, onPersistCharacter }: EquipmentFormProps) {
  const customEquipment = useMemo(
    () => character.customEquipment ?? [],
    [character.customEquipment]
  );
  const [selectedLoadoutEntry, setSelectedLoadoutEntry] =
    useState<SelectedLoadoutEntryState | null>(null);
  const [selectedInventoryInspection, setSelectedInventoryInspection] =
    useState<SelectedInventoryInspectionState | null>(null);
  const [selectedWeaponReference, setSelectedWeaponReference] =
    useState<SelectedWeaponReference | null>(null);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [activeCurrencyKey, setActiveCurrencyKey] = useState<CurrencyKey>("gold");
  const [currencyAmountDraft, setCurrencyAmountDraft] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCustomEquipmentModalOpen, setIsCustomEquipmentModalOpen] = useState(false);
  const [customEditorMode, setCustomEditorMode] = useState<"create" | "edit">("create");
  const [editingCustomEquipmentId, setEditingCustomEquipmentId] = useState<string | null>(null);
  const [isGeneralEquipmentExpanded, setIsGeneralEquipmentExpanded] = useState(false);
  const [extractingItemKey, setExtractingItemKey] = useState<string | null>(null);
  const [pendingDeleteCustomEquipmentId, setPendingDeleteCustomEquipmentId] = useState<
    string | null
  >(null);
  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setSelectedInventoryInspection((currentSelection) =>
      currentSelection?.source === "browser" ? null : currentSelection
    );
  }, []);

  const hasBackdrop = Boolean(
    selectedWeaponReference ||
    selectedLoadoutEntry ||
    selectedInventoryInspection ||
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

        if (selectedInventoryInspection) {
          closeInventoryItemDrawer();
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
    closeAddModal,
    hasBackdrop,
    isAddModalOpen,
    isCurrencyDrawerOpen,
    isCustomEquipmentModalOpen,
    pendingDeleteCustomEquipmentId,
    selectedInventoryInspection,
    selectedLoadoutEntry,
    selectedWeaponReference
  ]);

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
  const featureEquipmentEntries = useMemo(
    () => getFeatureEquipmentEntriesForCharacter(character),
    [character]
  );
  const selectedLoadoutItems = useMemo(
    () => [
      ...character.equipment.flatMap<LoadoutGroupItem>((item) => {
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
      ),
      ...featureEquipmentEntries.map(
        (featureEntry) =>
          ({
            key: featureEntry.key,
            name: featureEntry.entry.name,
            entry: featureEntry.entry,
            featureManagedSource: featureEntry.sourceLabel,
            summaryText: featureEntry.summaryOverride,
            onHand: false,
            worn: false
          }) satisfies LoadoutGroupItem
      )
    ],
    [character.equipment, featureEquipmentEntries, resolvedCustomEquipmentEntries]
  );
  const selectedEquipmentGroups = useMemo(
    () => groupEquipmentItems(selectedLoadoutItems),
    [selectedLoadoutItems]
  );
  const inventoryCountsByKey = useMemo(
    () => getInventoryItemCountsByKey(character.inventoryItems),
    [character.inventoryItems]
  );
  const groupedInventoryItems = useMemo(
    () => groupCharacterInventoryItems(character.inventoryItems),
    [character.inventoryItems]
  );
  const inventoryEquipmentGroups = useMemo(
    () => groupInventoryEquipmentItems(groupedInventoryItems),
    [groupedInventoryItems]
  );
  const carriedWeight = useMemo(
    () =>
      Math.round(
        (selectedLoadoutItems.reduce(
          (totalWeight, item) => totalWeight + (item.entry.weight ?? 0),
          0
        ) +
          groupedInventoryItems.reduce(
            (totalWeight, item) => totalWeight + (getItemWeightValue(item.item) ?? 0) * item.count,
            0
          )) *
          100
      ) / 100,
    [groupedInventoryItems, selectedLoadoutItems]
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
  const selectedLoadoutSummary =
    selectedLoadoutEntry?.summaryText ?? selectedLoadoutEntryData?.summary ?? "";
  const isSelectedCustomEntry = selectedLoadoutEntryData
    ? isResolvedCustomLoadoutEntry(selectedLoadoutEntryData)
    : false;
  const isSelectedFeatureManagedEntry = Boolean(selectedLoadoutEntry?.featureManagedSource);
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
      ...character.inventoryItems
        .filter((item) => item.onHand)
        .flatMap<HeldWeaponDescriptor>((item) => {
          const heldDescriptor = createHeldDescriptorForInventoryItem(
            `inventory-${item.id}`,
            item.item
          );
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
    [character.equipment, character.inventoryItems, resolvedCustomEquipmentEntries]
  );
  const selectedHandDescriptor = useMemo(() => {
    if (
      !selectedLoadoutEntryData ||
      selectedLoadoutEntry?.featureManagedSource ||
      !isHandEquippableEntry(selectedLoadoutEntryData)
    ) {
      return null;
    }

    const key = selectedLoadoutEntry?.customEquipmentId
      ? `custom-${selectedLoadoutEntry.customEquipmentId}`
      : `codex-${selectedLoadoutEntryData.id}`;

    return createHeldDescriptorForEntry(key, selectedLoadoutEntryData);
  }, [selectedLoadoutEntry, selectedLoadoutEntryData]);
  const isSelectedEntryOnHand = useMemo(() => {
    if (
      !selectedLoadoutEntryData ||
      selectedLoadoutEntry?.featureManagedSource ||
      !isHandEquippableEntry(selectedLoadoutEntryData)
    ) {
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

    return Boolean(
      getCharacterEquipmentItem(character.equipment, selectedLoadoutEntryData.name)?.worn
    );
  }, [character.equipment, customEquipment, selectedLoadoutEntry, selectedLoadoutEntryData]);
  const isSelectedShield =
    selectedLoadoutEntryData?.category === ENTRY_CATEGORIES.ARMOR &&
    isShieldArmorEntry(selectedLoadoutEntryData);
  const selectedAdditionalWeaponMasteries = useMemo(() => {
    if (
      !selectedLoadoutEntryData ||
      selectedLoadoutEntryData.category !== ENTRY_CATEGORIES.WEAPONS
    ) {
      return [];
    }

    return getAdditionalWeaponMasteriesForCharacter(character, {
      attackKind: "weapon",
      combatType: selectedLoadoutEntryData.type.combat,
      properties: selectedLoadoutEntryData.properties
    });
  }, [character, selectedLoadoutEntryData]);
  const selectedWeaponHasActiveMastery = useMemo(() => {
    if (
      !selectedLoadoutEntryData ||
      selectedLoadoutEntryData.category !== ENTRY_CATEGORIES.WEAPONS
    ) {
      return false;
    }

    const hasBaseWeaponMastery =
      Boolean(selectedLoadoutEntryData.mastery) &&
      hasActiveWeaponMastery(character.weaponProficiencies, {
        baseWeapon: selectedLoadoutEntryData.baseWeapon
      });

    return hasBaseWeaponMastery || selectedAdditionalWeaponMasteries.length > 0;
  }, [
    character.weaponProficiencies,
    selectedAdditionalWeaponMasteries.length,
    selectedLoadoutEntryData
  ]);
  const selectedWeaponHasProficiency = useMemo(() => {
    if (
      !selectedLoadoutEntryData ||
      selectedLoadoutEntryData.category !== ENTRY_CATEGORIES.WEAPONS
    ) {
      return false;
    }

    return hasAppliedWeaponProficiency(character.weaponProficiencies, {
      training: selectedLoadoutEntryData.type.training,
      combatType: selectedLoadoutEntryData.type.combat,
      properties: selectedLoadoutEntryData.properties,
      baseWeapon: selectedLoadoutEntryData.baseWeapon
    });
  }, [character.weaponProficiencies, selectedLoadoutEntryData]);
  const selectedWeaponMasteryKeywords = useMemo(() => {
    if (
      !selectedLoadoutEntryData ||
      selectedLoadoutEntryData.category !== ENTRY_CATEGORIES.WEAPONS
    ) {
      return [];
    }

    return [
      ...(selectedLoadoutEntryData.mastery
        ? [formatCodexLabel(selectedLoadoutEntryData.mastery)]
        : []),
      ...selectedAdditionalWeaponMasteries.map((entry) => formatCodexLabel(entry.mastery))
    ];
  }, [selectedAdditionalWeaponMasteries, selectedLoadoutEntryData]);
  const selectedWeaponMasteryLabel = useMemo(() => {
    if (
      !selectedLoadoutEntryData ||
      selectedLoadoutEntryData.category !== ENTRY_CATEGORIES.WEAPONS
    ) {
      return "None";
    }

    const baseLabel = selectedLoadoutEntryData.mastery
      ? formatCodexLabel(selectedLoadoutEntryData.mastery)
      : null;
    const additionalLabels = selectedAdditionalWeaponMasteries.map(
      (entry) => `${formatCodexLabel(entry.mastery)}${entry.source ? ` (${entry.source})` : ""}`
    );

    return (
      [baseLabel, ...additionalLabels]
        .filter((entry): entry is string => Boolean(entry))
        .join(", ") || "None"
    );
  }, [selectedAdditionalWeaponMasteries, selectedLoadoutEntryData]);
  const canSelectedEntryBePutOnHand =
    selectedHandDescriptor && !isSelectedEntryOnHand
      ? canWeaponBePutOnHand(selectedHandDescriptor, heldWeaponDescriptors)
      : false;
  const shouldOfferHandSwap =
    Boolean(selectedHandDescriptor) && !isSelectedEntryOnHand && !canSelectedEntryBePutOnHand;
  const selectedInventoryGroup = useMemo(
    () =>
      selectedInventoryInspection
        ? (groupedInventoryItems.find(
            (entry) => entry.key === selectedInventoryInspection.itemKey
          ) ?? null)
        : null,
    [groupedInventoryItems, selectedInventoryInspection]
  );
  const { item: selectedInventoryItem, status: selectedInventoryItemStatus } = useItemEntry(
    selectedInventoryInspection?.itemKey,
    {
      enabled: Boolean(selectedInventoryInspection),
      initialItem: selectedInventoryInspection?.initialItem ?? null
    }
  );
  const selectedInventoryCopy = useMemo(
    () =>
      selectedInventoryInspection
        ? findFirstInventoryCopyByKey(character.inventoryItems, selectedInventoryInspection.itemKey)
        : null,
    [character.inventoryItems, selectedInventoryInspection]
  );
  const selectedHeldInventoryCopies = useMemo(
    () =>
      selectedInventoryInspection
        ? findHeldInventoryCopiesByKey(
            character.inventoryItems,
            selectedInventoryInspection.itemKey
          )
        : [],
    [character.inventoryItems, selectedInventoryInspection]
  );
  const selectedAvailableInventoryCopy = useMemo(
    () =>
      selectedInventoryInspection
        ? findAvailableInventoryCopyByKey(
            character.inventoryItems,
            selectedInventoryInspection.itemKey
          )
        : null,
    [character.inventoryItems, selectedInventoryInspection]
  );
  const selectedWornInventoryCopy = useMemo(
    () =>
      selectedInventoryInspection
        ? findWornInventoryCopyByKey(character.inventoryItems, selectedInventoryInspection.itemKey)
        : null,
    [character.inventoryItems, selectedInventoryInspection]
  );
  const selectedInventoryRecord = selectedInventoryGroup?.item ?? selectedInventoryItem ?? null;
  const selectedInventoryWeaponHasActiveMastery = useMemo(
    () =>
      selectedInventoryRecord?.weapon
        ? hasActiveWeaponMastery(character.weaponProficiencies, selectedInventoryRecord.weapon)
        : false,
    [character.weaponProficiencies, selectedInventoryRecord]
  );
  const selectedInventoryWeaponHasProficiency = useMemo(() => {
    if (!selectedInventoryRecord) {
      return false;
    }

    const adaptedWeapon = getAdaptedItemWeapon(selectedInventoryRecord);

    if (!adaptedWeapon) {
      return false;
    }

    return hasAppliedWeaponProficiency(character.weaponProficiencies, {
      training: adaptedWeapon.type.training,
      combatType: adaptedWeapon.type.combat,
      properties: adaptedWeapon.properties,
      name: selectedInventoryRecord.weapon?.name,
      key: selectedInventoryRecord.weapon?.key
    });
  }, [character.weaponProficiencies, selectedInventoryRecord]);
  const selectedInventoryCount = selectedInventoryInspection
    ? (inventoryCountsByKey[selectedInventoryInspection.itemKey] ?? 0)
    : 0;
  const selectedInventoryOnHandCount = selectedInventoryInspection
    ? selectedHeldInventoryCopies.length
    : 0;
  const selectedInventoryTransactionCost = selectedInventoryRecord
    ? getItemTransactionCost(selectedInventoryRecord)
    : null;
  const selectedInventoryHandDescriptor =
    selectedInventoryGroup && selectedAvailableInventoryCopy
      ? createHeldDescriptorForInventoryItem(
          `inventory-${selectedAvailableInventoryCopy.id}`,
          selectedInventoryGroup.item
        )
      : null;
  const selectedInventoryDualDescriptors =
    selectedInventoryGroup && selectedInventoryCount >= 2
      ? getPreferredInventoryCopiesByKey(character.inventoryItems, selectedInventoryGroup.key, 2)
          .map((copy) => createHeldDescriptorForInventoryItem(`inventory-${copy.id}`, copy.item))
          .filter((entry): entry is HeldWeaponDescriptor => entry !== null)
      : [];
  const isSelectedInventoryOnHand = selectedInventoryOnHandCount > 0;
  const isSelectedInventoryArmorWorn = Boolean(selectedWornInventoryCopy);
  const canSelectedInventoryBePutOnHand =
    selectedInventoryHandDescriptor !== null
      ? canWeaponBePutOnHand(selectedInventoryHandDescriptor, heldWeaponDescriptors)
      : false;
  const shouldOfferInventoryHandSwap =
    Boolean(selectedInventoryHandDescriptor) && !canSelectedInventoryBePutOnHand;
  const shouldShowInventoryDualAction =
    Boolean(selectedInventoryGroup?.item.weapon) &&
    selectedInventoryDualDescriptors.length === 2 &&
    selectedInventoryDualDescriptors.every((descriptor) => descriptor.handSlots === 1);
  const canSelectedInventoryBeDualEquipped =
    shouldShowInventoryDualAction &&
    selectedInventoryOnHandCount < 2 &&
    canWeaponCopiesBePutOnHand(selectedInventoryDualDescriptors, heldWeaponDescriptors);
  const shouldOfferInventoryDualSwap =
    shouldShowInventoryDualAction &&
    selectedInventoryOnHandCount < 2 &&
    !canSelectedInventoryBeDualEquipped;

  useEffect(() => {
    if (
      selectedInventoryInspection?.source === "inventory" &&
      (inventoryCountsByKey[selectedInventoryInspection.itemKey] ?? 0) === 0
    ) {
      setSelectedInventoryInspection(null);
    }
  }, [inventoryCountsByKey, selectedInventoryInspection]);

  function openLoadoutEntryDetails(item: LoadoutGroupItem) {
    setIsCurrencyDrawerOpen(false);
    setSelectedWeaponReference(null);
    setSelectedInventoryInspection(null);
    setSelectedLoadoutEntry({
      entry: item.entry,
      customEquipmentId: item.customEquipmentId,
      featureManagedSource: item.featureManagedSource,
      summaryText: item.summaryText,
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

  function openCustomEquipmentCreator() {
    closeAddModal();
    setIsCustomEquipmentModalOpen(true);
    setCustomEditorMode("create");
    setEditingCustomEquipmentId(null);
  }

  function openCustomEquipmentEditor(customEquipmentId: string) {
    setSelectedWeaponReference(null);
    setSelectedLoadoutEntry(null);
    setSelectedInventoryInspection(null);
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
                ...currentCharacter.inventoryItems
                  .filter((item) => item.onHand)
                  .map((item) =>
                    createHeldDescriptorForInventoryItem(`inventory-${item.id}`, item.item)
                  )
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
    setSelectedInventoryInspection(null);
    setCurrencyAmountDraft(0);
    setIsCurrencyDrawerOpen(true);
  }

  function openInventoryInspectionFromBrowser(item: { key: string }) {
    setSelectedWeaponReference(null);
    setSelectedLoadoutEntry(null);
    setSelectedInventoryInspection({
      itemKey: item.key,
      initialItem: findOwnedInventoryItemRecord(character.inventoryItems, item.key),
      source: "browser"
    });
  }

  function openInventoryInspectionFromLoadout(item: GroupedInventoryItem) {
    setSelectedWeaponReference(null);
    setSelectedLoadoutEntry(null);
    setSelectedInventoryInspection({
      itemKey: item.key,
      initialItem: item.item,
      source: "inventory"
    });
  }

  function closeInventoryItemDrawer() {
    setSelectedInventoryInspection(null);
  }

  function addInventoryItemCopy(item: ItemRecord) {
    if (!item.key) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      inventoryItems: [...currentCharacter.inventoryItems, createCharacterInventoryItem(item)]
    }));
  }

  function buyInventoryItemCopy(item: ItemRecord) {
    if (!item.key) {
      return;
    }

    const transactionCost = getItemTransactionCost(item);

    if (!transactionCost || transactionCost.amount <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const currentCurrencyAmount = Math.max(
        0,
        Math.floor(
          clampNumber(currentCharacter.currencies[transactionCost.currencyKey], 0, 999999999, 0)
        )
      );

      if (currentCurrencyAmount < transactionCost.amount) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        currencies: {
          ...currentCharacter.currencies,
          [transactionCost.currencyKey]: currentCurrencyAmount - transactionCost.amount
        },
        inventoryItems: [...currentCharacter.inventoryItems, createCharacterInventoryItem(item)]
      };
    });
  }

  function removeInventoryItemCopy(itemKey: string, options?: { closeDrawer?: boolean }) {
    if (!itemKey) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (!currentCharacter.inventoryItems.some((entry) => entry.item.key === itemKey)) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        inventoryItems: removeOneInventoryItemCopyByKey(currentCharacter.inventoryItems, itemKey)
      };
    });

    if (options?.closeDrawer) {
      closeInventoryItemDrawer();
    }
  }

  function sellInventoryItemCopy(item: ItemRecord, options?: { closeDrawer?: boolean }) {
    const itemKey = item.key;

    if (!itemKey) {
      return;
    }

    const transactionCost = getItemTransactionCost(item);

    if (!transactionCost || transactionCost.amount <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (!currentCharacter.inventoryItems.some((entry) => entry.item.key === itemKey)) {
        return currentCharacter;
      }

      const currentCurrencyAmount = Math.max(
        0,
        Math.floor(
          clampNumber(currentCharacter.currencies[transactionCost.currencyKey], 0, 999999999, 0)
        )
      );

      return {
        ...currentCharacter,
        currencies: {
          ...currentCharacter.currencies,
          [transactionCost.currencyKey]: currentCurrencyAmount + transactionCost.amount
        },
        inventoryItems: removeOneInventoryItemCopyByKey(currentCharacter.inventoryItems, itemKey)
      };
    });

    if (options?.closeDrawer) {
      closeInventoryItemDrawer();
    }
  }

  async function extractInventoryPackContents() {
    const selectedItem = selectedInventoryRecord;
    const packKey = selectedInventoryInspection?.itemKey ?? selectedItem?.key ?? "";
    const source = selectedInventoryInspection?.source ?? "browser";

    if (
      !selectedItem ||
      !packKey ||
      !isExtractableEquipmentPackRecord(selectedItem) ||
      extractingItemKey === packKey
    ) {
      return;
    }

    setExtractingItemKey(packKey);

    try {
      const payload = await fetchItemPackContents(packKey);

      onPersistCharacter((currentCharacter) => {
        let nextInventoryItems = currentCharacter.inventoryItems;

        payload.contents.forEach((entry) => {
          nextInventoryItems = addInventoryItemCopies(
            nextInventoryItems,
            entry.item,
            entry.quantity
          );
        });

        if (source === "inventory") {
          nextInventoryItems = removeOneInventoryItemCopyByKey(nextInventoryItems, packKey);
        }

        if (nextInventoryItems === currentCharacter.inventoryItems) {
          return currentCharacter;
        }

        return {
          ...currentCharacter,
          inventoryItems: nextInventoryItems
        };
      });
    } catch (error) {
      console.error("Failed to extract equipment pack contents.", error);
    } finally {
      setExtractingItemKey((currentKey) => (currentKey === packKey ? null : currentKey));
    }
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
    if (
      !selectedLoadoutEntryData ||
      !isHandEquippableEntry(selectedLoadoutEntryData) ||
      isSelectedEntryOnHand
    ) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const clearedCharacter = clearCharacterHandOccupants(currentCharacter);
      const nextEquipment = clearedCharacter.equipment.map((equipmentItem) => ({
        ...equipmentItem,
        onHand:
          !selectedLoadoutEntry?.customEquipmentId &&
          equipmentItem.name === selectedLoadoutEntryData.name
      }));
      const nextCustomEquipment = clearedCharacter.customEquipment.map((entry) =>
        entry.kind !== "weapon"
          ? entry
          : {
              ...entry,
              onHand: entry.id === selectedLoadoutEntry?.customEquipmentId
            }
      );

      return {
        ...clearedCharacter,
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

  function toggleSelectedInventoryItemOnHand() {
    if (!selectedInventoryInspection?.itemKey || !selectedInventoryGroup) {
      return;
    }

    if (
      !isSelectedInventoryOnHand &&
      (!selectedInventoryHandDescriptor || !canSelectedInventoryBePutOnHand)
    ) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (isSelectedInventoryOnHand) {
        const heldCopies = findHeldInventoryCopiesByKey(
          currentCharacter.inventoryItems,
          selectedInventoryInspection.itemKey
        );

        if (heldCopies.length === 0) {
          return currentCharacter;
        }

        if (heldCopies.length >= 2) {
          const copyToKeepId = heldCopies[0]?.id;

          if (!copyToKeepId) {
            return currentCharacter;
          }

          return {
            ...currentCharacter,
            inventoryItems: currentCharacter.inventoryItems.map((entry) =>
              entry.item.key === selectedInventoryInspection.itemKey
                ? {
                    ...entry,
                    onHand: entry.id === copyToKeepId
                  }
                : entry
            )
          };
        }

        const targetCopy = heldCopies[0];

        return {
          ...currentCharacter,
          inventoryItems: currentCharacter.inventoryItems.map((entry) =>
            entry.id === targetCopy.id
              ? {
                  ...entry,
                  onHand: false
                }
              : entry
          )
        };
      }

      const targetCopy = findAvailableInventoryCopyByKey(
        currentCharacter.inventoryItems,
        selectedInventoryInspection.itemKey
      );

      if (!targetCopy) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        inventoryItems: currentCharacter.inventoryItems.map((entry) =>
          entry.id === targetCopy.id
            ? {
                ...entry,
                onHand: !entry.onHand
              }
            : entry
        )
      };
    });
  }

  function swapSelectedInventoryItemToHand() {
    if (
      !selectedInventoryInspection?.itemKey ||
      !selectedInventoryGroup ||
      isSelectedInventoryOnHand
    ) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const targetCopy = findAvailableInventoryCopyByKey(
        currentCharacter.inventoryItems,
        selectedInventoryInspection.itemKey
      );

      if (!targetCopy) {
        return currentCharacter;
      }

      const clearedCharacter = clearCharacterHandOccupants(currentCharacter);

      return {
        ...clearedCharacter,
        inventoryItems: clearedCharacter.inventoryItems.map((entry) => ({
          ...entry,
          onHand: entry.id === targetCopy.id
        }))
      };
    });
  }

  function toggleSelectedInventoryItemDualOnHand() {
    if (
      !selectedInventoryInspection?.itemKey ||
      !selectedInventoryGroup ||
      !shouldShowInventoryDualAction ||
      selectedInventoryOnHandCount >= 2
    ) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const targetCopyIds = getPreferredInventoryCopiesByKey(
        currentCharacter.inventoryItems,
        selectedInventoryInspection.itemKey,
        2
      ).map((entry) => entry.id);

      if (targetCopyIds.length < 2) {
        return currentCharacter;
      }

      if (canSelectedInventoryBeDualEquipped) {
        return {
          ...currentCharacter,
          inventoryItems: currentCharacter.inventoryItems.map((entry) =>
            targetCopyIds.includes(entry.id)
              ? {
                  ...entry,
                  onHand: true
                }
              : entry
          )
        };
      }

      const clearedCharacter = clearCharacterHandOccupants(currentCharacter);

      return {
        ...clearedCharacter,
        inventoryItems: clearedCharacter.inventoryItems.map((entry) => ({
          ...entry,
          onHand: targetCopyIds.includes(entry.id)
        }))
      };
    });
  }

  function toggleSelectedInventoryArmorWorn() {
    if (
      !selectedInventoryGroup ||
      !selectedInventoryInspection?.itemKey ||
      !selectedInventoryCopy
    ) {
      return;
    }

    if (!isItemBodyArmorRecord(selectedInventoryGroup.item)) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      setInventoryItemArmorWornState(
        currentCharacter,
        selectedInventoryCopy.id,
        !isSelectedInventoryArmorWorn
      )
    );
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

  const inventoryLeftFooterActions: EquipmentInventoryDrawerAction[] = selectedInventoryRecord
    ? [
        ...(isExtractableEquipmentPackRecord(selectedInventoryRecord)
          ? [
              {
                key: "extract-items",
                label: "Extract Items",
                icon: Package,
                disabled: extractingItemKey === selectedInventoryRecord.key,
                onClick: () => {
                  void extractInventoryPackContents();
                }
              }
            ]
          : []),
        ...(selectedInventoryGroup && isItemHandEquippableRecord(selectedInventoryGroup.item)
          ? [
              {
                key: "hand",
                label: isSelectedInventoryOnHand
                  ? "Unequip"
                  : shouldOfferInventoryHandSwap
                    ? "Swap"
                    : "Equip",
                icon: Hand,
                disabled:
                  !isSelectedInventoryOnHand &&
                  !canSelectedInventoryBePutOnHand &&
                  !shouldOfferInventoryHandSwap,
                onClick: shouldOfferInventoryHandSwap
                  ? swapSelectedInventoryItemToHand
                  : toggleSelectedInventoryItemOnHand
              },
              ...(shouldShowInventoryDualAction
                ? [
                    {
                      key: "dual",
                      label: "Dual",
                      icon: Hand,
                      disabled:
                        selectedInventoryOnHandCount >= 2 ||
                        (!canSelectedInventoryBeDualEquipped && !shouldOfferInventoryDualSwap),
                      onClick: toggleSelectedInventoryItemDualOnHand
                    }
                  ]
                : [])
            ]
          : []),
        ...(selectedInventoryGroup && isItemBodyArmorRecord(selectedInventoryGroup.item)
          ? [
              {
                key: "armor",
                label: isSelectedInventoryArmorWorn ? "DOFF" : "DON",
                icon: Shield,
                onClick: toggleSelectedInventoryArmorWorn
              }
            ]
          : [])
      ]
    : [];
  const inventoryRightFooterActions: EquipmentInventoryDrawerAction[] = selectedInventoryInspection
    ? [
        {
          key: "buy",
          label: "Buy",
          icon: TicketPlus,
          tone: "positive",
          disabled:
            !selectedInventoryRecord ||
            !selectedInventoryTransactionCost ||
            selectedInventoryTransactionCost.amount <= 0 ||
            normalizedCurrencies[selectedInventoryTransactionCost.currencyKey] <
              selectedInventoryTransactionCost.amount,
          onClick: () => {
            if (selectedInventoryRecord) {
              buyInventoryItemCopy(selectedInventoryRecord);
            }
          }
        },
        {
          key: "sell",
          label: "Sell",
          icon: TicketMinus,
          tone: "negative",
          disabled:
            !selectedInventoryRecord ||
            selectedInventoryCount <= 0 ||
            !selectedInventoryTransactionCost ||
            selectedInventoryTransactionCost.amount <= 0,
          onClick: () => {
            if (selectedInventoryRecord) {
              sellInventoryItemCopy(selectedInventoryRecord);
            }
          }
        },
        {
          key: "add",
          label: "Add",
          icon: Plus,
          tone: "neutral",
          disabled: !selectedInventoryRecord,
          onClick: () => {
            if (selectedInventoryRecord) {
              addInventoryItemCopy(selectedInventoryRecord);
            }
          }
        },
        {
          key: "remove",
          label: "Remove",
          icon: Minus,
          tone: "neutral",
          disabled: !selectedInventoryInspection.itemKey || selectedInventoryCount <= 0,
          onClick: () => {
            if (selectedInventoryInspection.itemKey) {
              removeInventoryItemCopy(selectedInventoryInspection.itemKey);
            }
          }
        }
      ]
    : [];
  const inventoryDrawerFooter = selectedInventoryInspection ? (
    <EquipmentInventoryItemDrawerFooter
      leftActions={inventoryLeftFooterActions}
      rightActions={inventoryRightFooterActions}
      ownedCount={selectedInventoryCount}
    />
  ) : null;
  const inventoryDrawerHeaderContent = selectedInventoryRecord ? (
    <EquipmentInventoryItemDrawerHeader
      item={selectedInventoryRecord}
      onHandCount={selectedInventoryOnHandCount}
      worn={isSelectedInventoryArmorWorn}
    />
  ) : undefined;

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

      {selectedLoadoutItems.length === 0 && groupedInventoryItems.length === 0 ? (
        <p className={shared.emptyText}>No equipment selected.</p>
      ) : (
        <div className={styles.equipmentGroupStack}>
          {equipmentGroupMeta.map((group) => {
            const legacyItems =
              selectedEquipmentGroups.find((entry) => entry.key === group.key)?.items ?? [];
            const inventoryItems =
              inventoryEquipmentGroups.find((entry) => entry.key === group.key)?.items ?? [];
            const combinedItems = [
              ...legacyItems.map((item) => ({
                key: item.key,
                name: item.name,
                kind: "legacy" as const,
                item
              })),
              ...inventoryItems.map((item) => ({
                key: `inventory-${item.key}`,
                name: item.name,
                kind: "inventory" as const,
                item
              }))
            ].sort((left, right) => left.name.localeCompare(right.name));

            if (combinedItems.length === 0) {
              return null;
            }

            const shouldCollapseGeneral =
              group.key === "generalEquipment" && combinedItems.length > 6;
            const visibleGroupItems =
              shouldCollapseGeneral && !isGeneralEquipmentExpanded
                ? combinedItems.slice(0, 4)
                : combinedItems;

            return (
              <section key={group.key} className={styles.equipmentGroup}>
                <header className={styles.equipmentGroupHeader}>
                  <p className={styles.equipmentGroupTitle}>{group.title}</p>
                </header>
                <ul className={styles.equipmentItemList}>
                  {visibleGroupItems.map((entry) =>
                    entry.kind === "legacy" ? (
                      <li key={entry.key}>
                        <button
                          type="button"
                          className={styles.equipmentItemButton}
                          onClick={() => openLoadoutEntryDetails(entry.item)}
                        >
                          <span className={styles.equipmentItemLabel}>
                            <span className={styles.equipmentItemName}>{entry.item.name}</span>
                            {entry.item.onHand ? (
                              <span className={styles.equipmentItemOnHand}>
                                <Hand size={13} aria-hidden="true" />
                                <span>On Hand</span>
                              </span>
                            ) : null}
                            {entry.item.worn ? (
                              <span className={styles.equipmentItemWorn}>
                                <Shield size={13} aria-hidden="true" />
                                <span>Worn</span>
                              </span>
                            ) : null}
                          </span>
                          <span className={styles.equipmentItemMeta}>
                            <span className={styles.equipmentItemWeight}>
                              {formatEquipmentWeight(entry.item.entry.weight)}
                            </span>
                            {"rarity" in entry.item.entry &&
                            hasDisplayableRarity(entry.item.entry.rarity) ? (
                              <RarityPill rarity={entry.item.entry.rarity} />
                            ) : null}
                          </span>
                        </button>
                      </li>
                    ) : (
                      <li key={entry.key}>
                        <button
                          type="button"
                          className={styles.equipmentItemButton}
                          onClick={() => openInventoryInspectionFromLoadout(entry.item)}
                        >
                          <span className={styles.equipmentItemLabel}>
                            <span className={styles.equipmentItemName}>
                              {formatInventoryStackName(entry.item)}
                            </span>
                            {entry.item.onHandCount > 0 ? (
                              <span className={styles.equipmentItemOnHand}>
                                <Hand size={13} aria-hidden="true" />
                                <span>{formatOnHandLabel(entry.item.onHandCount)}</span>
                              </span>
                            ) : null}
                            {entry.item.worn ? (
                              <span className={styles.equipmentItemWorn}>
                                <Shield size={13} aria-hidden="true" />
                                <span>Worn</span>
                              </span>
                            ) : null}
                          </span>
                          <span className={styles.equipmentItemMeta}>
                            <span className={styles.equipmentItemWeight}>
                              {formatEquipmentWeight(getItemWeightValue(entry.item.item))}
                            </span>
                            {hasDisplayableRarity(entry.item.item.rarity) ? (
                              <RarityPill rarity={entry.item.item.rarity} />
                            ) : null}
                          </span>
                        </button>
                      </li>
                    )
                  )}
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

      <EquipmentItemBrowserModal
        isOpen={isAddModalOpen}
        currencySummary={
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
        }
        onClose={closeAddModal}
        onOpenCurrencyModal={openCurrencyModal}
        onOpenCustomEquipmentCreator={openCustomEquipmentCreator}
        onItemSelect={openInventoryInspectionFromBrowser}
      />

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
                <h3 id="character-custom-equipment-title" className={sheetStyles.sheetPanelTitle}>
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
                <h3 id="character-currency-modal-title" className={sheetStyles.sheetPanelTitle}>
                  Currency balance
                </h3>
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
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>
                  {formatCodexLabel(selectedLoadoutEntryData.category)}
                </p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-loadout-drawer-title" className={sheetStyles.spellDrawerTitle}>
                    {selectedLoadoutEntryData.name}
                  </h3>
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
                <p className={sheetStyles.spellDrawerSummary}>{selectedLoadoutSummary}</p>
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
                    <CellContainer
                      label={
                        selectedWeaponHasProficiency ? (
                          <WeaponMasteryStatusLabel label="Type" status="PROFICIENT" />
                        ) : (
                          "Type"
                        )
                      }
                      content={`${formatWeaponType(selectedLoadoutEntryData.type)} weapon`}
                    />
                    <CellContainer
                      label="Damage"
                      content={formatWeaponDamage(selectedLoadoutEntryData.damage)}
                    />
                    <CellContainer
                      type="button"
                      as="button"
                      className={styles.referenceDetailButton}
                      label="Properties"
                      content={formatWeaponProperties(selectedLoadoutEntryData)}
                      onClick={() =>
                        openWeaponReference(
                          "Properties",
                          selectedLoadoutEntryData.properties.map((property) =>
                            formatCodexLabel(property)
                          )
                        )
                      }
                    />
                    {selectedLoadoutEntryData.mastery ||
                    selectedAdditionalWeaponMasteries.length > 0 ? (
                      <CellContainer
                        type="button"
                        as="button"
                        className={styles.referenceDetailButton}
                        label={
                          selectedWeaponHasActiveMastery ? <WeaponMasteryStatusLabel /> : "Mastery"
                        }
                        content={selectedWeaponMasteryLabel}
                        onClick={() =>
                          openWeaponReference("Mastery", selectedWeaponMasteryKeywords)
                        }
                      />
                    ) : (
                      <CellContainer label="Mastery" content="None" />
                    )}
                    <CellContainer
                      label="Weight"
                      content={formatWeaponWeight(selectedLoadoutEntryData.weight)}
                    />
                    <CellContainer
                      label="Cost"
                      content={
                        <CurrencyInlineDisplay
                          cost={selectedLoadoutEntryData.cost}
                          className={styles.drawerCurrencyDisplay}
                          iconClassName={styles.drawerCurrencyIcon}
                          style={{
                            fontSize: "16px",
                            color: "rgb(46, 32, 23)",
                            fontWeight: 700
                          }}
                          iconStyle={{
                            inlineSize: "18px",
                            blockSize: "18px"
                          }}
                        />
                      }
                    />
                  </>
                ) : selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR &&
                  isSelectedShield ? null : (
                  <CellContainer
                    label="Type"
                    content={
                      isSelectedCustomEntry
                        ? selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR
                          ? "Custom armor"
                          : "Custom item"
                        : selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR
                          ? getArmorTypeSummary(selectedLoadoutEntryData)
                          : formatCodexList(selectedLoadoutEntryData.tags)
                    }
                  />
                )}

                {selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR ? (
                  <>
                    {!isSelectedShield ? (
                      <CellContainer
                        label="Armor base"
                        content={selectedLoadoutEntryData.armorBase}
                      />
                    ) : null}
                  </>
                ) : null}

                {selectedLoadoutEntryData.category !== ENTRY_CATEGORIES.WEAPONS ? (
                  <>
                    <CellContainer
                      label="Weight"
                      content={formatEquipmentWeight(selectedLoadoutEntryData.weight)}
                    />
                    <CellContainer
                      label="Cost"
                      content={
                        <CurrencyInlineDisplay
                          cost={selectedLoadoutEntryData.cost}
                          className={styles.drawerCurrencyDisplay}
                          iconClassName={styles.drawerCurrencyIcon}
                          style={{
                            fontSize: "16px",
                            color: "rgb(46, 32, 23)",
                            fontWeight: 700
                          }}
                          iconStyle={{
                            inlineSize: "18px",
                            blockSize: "18px"
                          }}
                        />
                      }
                    />
                  </>
                ) : null}
              </div>
            </div>

            <div className={styles.loadoutDrawerActions}>
              {isSelectedFeatureManagedEntry ? (
                <p className={styles.featureManagedItemNote}>
                  Granted by {selectedLoadoutEntry.featureManagedSource} and managed automatically.
                </p>
              ) : (
                <>
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
                        {isSelectedEntryOnHand ? "Unequip" : shouldOfferHandSwap ? "Swap" : "Equip"}
                      </button>
                    </>
                  ) : null}
                  {selectedLoadoutEntryData.category === ENTRY_CATEGORIES.ARMOR &&
                  !isSelectedShield ? (
                    <button
                      type="button"
                      className={styles.editItemButton}
                      onClick={toggleArmorWorn}
                    >
                      <Shield size={15} aria-hidden="true" />
                      {isSelectedArmorWorn ? "DOFF" : "DON"}
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
                </>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {selectedInventoryInspection ? (
        <EquipmentInventoryItemDrawer
          item={selectedInventoryRecord}
          status={selectedInventoryItemStatus}
          onClose={closeInventoryItemDrawer}
          headerContent={inventoryDrawerHeaderContent}
          footer={inventoryDrawerFooter}
          weaponMasteryActive={selectedInventoryWeaponHasActiveMastery}
          weaponProficient={selectedInventoryWeaponHasProficiency}
          onOpenWeaponReference={openWeaponReference}
        />
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
