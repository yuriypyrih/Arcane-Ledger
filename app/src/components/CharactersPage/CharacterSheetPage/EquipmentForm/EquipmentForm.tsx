import clsx from "clsx";
import {
  BookOpen,
  CircleHelp,
  Hand,
  Minus,
  Package,
  Plus,
  Settings,
  Shield,
  Sparkles,
  TicketMinus,
  TicketPlus,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CellContainer from "../../../CellContainer/CellContainer";
import coinCopperIcon from "../../../../assets/svg/coin-copper.svg";
import coinElectrumIcon from "../../../../assets/svg/coin-electrum.svg";
import coinGoldIcon from "../../../../assets/svg/coin.svg";
import coinPlatinumIcon from "../../../../assets/svg/coin-platinum.svg";
import coinSilverIcon from "../../../../assets/svg/coin-silver.svg";
import CurrencyInlineDisplay from "../../../CurrencyInlineDisplay";
import { deferModalCommit, useExplicitBackdropClick } from "../../../Overlay";
import NumberInput from "../../FormInputs/NumberInput";
import RarityPill, { hasDisplayableRarity } from "../../../CodexPage/RarityPill";
import { captureAppError } from "../../../../lib/sentry";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { useRenderProfiler } from "../../../../lib/useRenderProfiler";
import { ApiRequestFailedError, fetchItemPackContents, isApiOfflineError } from "../../../../api";
import { ENTRY_CATEGORIES } from "../../../../codex/entries";
import { getSpellEntryById } from "../../../../codex/spells";
import {
  currencyKeys,
  type Character,
  type CharacterContainerContentItem,
  type CharacterInventoryItem,
  type CharacterItemWeaponMods,
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
import { getLoadoutCodexEntryByName } from "../../../../pages/CharactersPage/proficiency";
import {
  clearWarlockPactOfTheBladeInvocationSelectionForCharacter,
  getAdditionalWeaponMasteriesForCharacter,
  getFeatureEquipmentEntriesForCharacter,
  replaceWarlockPactOfTheBladeOwnedStackSelectionForCharacter
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
  canWeaponBePutOnHand,
  createHeldWeaponDescriptor,
  getCharacterEquipmentItem,
  type HeldWeaponDescriptor
} from "../../../../pages/CharactersPage/inventory";
import { clearCharacterHandOccupants } from "../../../../pages/CharactersPage/handStateMutations";
import {
  getCodexBodyArmorKey,
  getCustomBodyArmorKey,
  getInventoryBodyArmorKey,
  isShieldArmorEntry,
  setCodexArmorWornState,
  setCustomArmorWornState,
  setInventoryItemArmorWornState
} from "../../../../pages/CharactersPage/armor";
import type {
  PersistCharacterOptions,
  PersistCharacterUpdater
} from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  addInventoryItemCopies,
  addOneContainerContentItemCopyByIndex,
  canAddInventoryObject,
  createCharacterInventoryItem,
  createGroupedInventoryItem,
  createHeldDescriptorForInventoryItem,
  findInventoryItemStackById,
  findInventoryItemStackByKey,
  findOwnedInventoryItemRecord,
  getAddOneContainerContentItemCopyBlockReason,
  getInventoryContainerContents,
  getInventoryContainerContentsWeightLimit,
  getInventoryObjectCount,
  getInventoryItemConjuredRowTagLabel,
  getInventoryItemFeatureTagLabels,
  getInventoryAttunementCount,
  getInventoryItemTotalWeightValue,
  getInventoryItemUseState,
  getInventoryItemStoredSpell,
  getPreferredInventoryCopiesById,
  getPreferredInventoryCopiesByKey,
  getItemTransactionCost,
  getAdaptedItemWeapon,
  BAG_OF_HOLDING_WEIGHT_LIMIT_LB,
  isExtractableEquipmentPackRecord,
  isConjuredInventoryItem,
  hasInventoryContainerContents,
  INVENTORY_OBJECT_LIMIT,
  isInventoryContainerItem,
  isItemContainerRecord,
  isPactOfTheBladeInventoryItem,
  isItemBodyArmorRecord,
  isItemHandEquippableRecord,
  isInventoryItemAttunable,
  moveOneContainerContentItemOutByIndexWithResult,
  removeOneContainerContentItemByIndex,
  removeOneInventoryItemCopyById,
  removeOneInventoryItemCopyByKey,
  resetInventoryItemChargeById,
  resetInventoryItemChargeByKey,
  saveInventoryItemModsById,
  setInventoryItemAttunedById,
  setInventoryItemAttunedByKey,
  setInventoryItemOnHandQuantityById,
  setInventoryItemOnHandQuantityByKey,
  useInventoryItemChargeById as spendInventoryItemChargeById,
  useInventoryItemChargeByKey as spendInventoryItemChargeByKey,
  type GroupedInventoryItem
} from "../../../../pages/CharactersPage/inventoryItems";
import {
  getEffectiveInventoryItemRecord,
  hasCharacterItemMods
} from "../../../../pages/CharactersPage/itemMods";
import {
  crafterDiscountRuleText,
  isCrafterDiscountEligibleItem
} from "../../../../pages/CharactersPage/feats/crafter";
import {
  characterHasCrafterDiscount,
  getFeatItemAdditionalDescriptionForCharacter
} from "../../../../pages/CharactersPage/feats/runtime";
import { createSourcedDescriptionEntries } from "../../../../pages/CharactersPage/actionModalDescriptions";
import KeywordReferenceDrawer from "../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import type { ItemRecord } from "../../../../types";
import ActionButton from "../../../ActionButton";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import SheetSurface from "../SheetSurface";
import CustomEquipmentEditor, {
  type CustomEquipmentEditorSavePayload
} from "../CustomEquipmentEditor";
import EquipmentInventoryItemDrawer from "./EquipmentInventoryItemDrawer";
import EquipmentInventoryItemDrawerHeader from "./EquipmentInventoryItemDrawerHeader";
import EquipmentInventoryItemDrawerFooter, {
  type EquipmentInventoryDrawerAction
} from "./EquipmentInventoryItemDrawerFooter";
import EquipmentContainerManageModal from "./EquipmentContainerManageModal";
import EquipmentContainerContentsList from "./EquipmentContainerContentsList";
import EquipmentGuideModal from "./EquipmentGuideModal";
import EquipmentItemBrowserModal from "./EquipmentItemBrowserModal";
import InventoryTagPill from "./InventoryTagPill";
import { getInventoryTagPillProps } from "./inventoryTagPillModel";
import { renderEquipmentForm } from "./EquipmentFormRenderer";
import {
  applyAddEquipmentDraftToCharacter,
  createAddEquipmentDraftCharacter
} from "./equipmentDrafts";
import {
  createEquipmentRenderGroups,
  createHeldDescriptorForEntry,
  formatCurrencyPillAmount,
  formatInventoryStackName,
  formatOnHandLabel,
  formatWeightValue,
  getArmorTypeSummary,
  groupEquipmentItems,
  groupInventoryEquipmentItems,
  isHandEquippableEntry,
  normalizeCurrencyAmountInput,
  type LoadoutDrawerEntry,
  type LoadoutGroupItem
} from "./equipmentLoadoutModel";
import {
  getInventoryItemChargesTagLabel,
  getInventoryItemStoredSpellHeaderTagLabel,
  getInventoryItemStoredSpellRowTagLabel
} from "./equipmentItemUtilityTags";
import InlineToggleButton from "../InlineToggleButton";
import styles from "./EquipmentForm.module.css";
import { useItemEntry } from "../../../../pages/ItemCodexEntryPage/useItemEntry";
import WeaponMasteryStatusLabel from "../../../WeaponMasteryStatusLabel/WeaponMasteryStatusLabel";
import { getArtificerArmorerArcaneArmorTagLabelsForArmorKey } from "../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import {
  OverlayBody,
  OverlayCloseButton,
  DestructiveConfirmationModal,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import { getCharacterRuntime } from "../../../../pages/CharactersPage/characterRuntime/characterRuntime";
import { getInventoryAttunementLimit } from "../../../../pages/CharactersPage/characterRuntime/equipmentRuntime";
import EquipmentStoredSpellDrawer, {
  type SelectedInventoryStoredSpellState
} from "./EquipmentStoredSpellDrawer";

type EquipmentFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type SelectedLoadoutEntryState = {
  entry: LoadoutDrawerEntry;
  customEquipmentId?: string;
  featureManagedSource?: string;
  featureTags?: string[];
  summaryText?: string;
  origin: "loadout";
};
type SelectedInventoryInspectionState = {
  itemKey: string;
  stackId?: string;
  containerStackId?: string;
  contentIndex?: number;
  initialItem: ItemRecord | null;
  source: "browser" | "inventory" | "container";
};
type PendingContainerInventoryRemoval = {
  action: "remove" | "sell";
  item: ItemRecord;
  itemKey: string;
  stackId: string;
};
type SelectedWeaponReference = {
  name: string;
  entries: KeywordReference[];
};

type CurrencyDefinition = {
  key: CurrencyKey;
  label: string;
  code: string;
  icon: string;
};

const currencyDefinitions: CurrencyDefinition[] = [
  { key: "copper", label: "Copper", code: "CP", icon: coinCopperIcon },
  { key: "silver", label: "Silver", code: "SP", icon: coinSilverIcon },
  { key: "electrum", label: "Electrum", code: "EP", icon: coinElectrumIcon },
  { key: "gold", label: "Gold", code: "GP", icon: coinGoldIcon },
  { key: "platinum", label: "Platinum", code: "PP", icon: coinPlatinumIcon }
];

const equipmentPersistOptions: PersistCharacterOptions = {
  domains: ["equipment", "inventory"],
  normalize: "targeted"
};

function getInventoryObjectLimitMessage(objectCount: number): string {
  return `Inventory limit reached. This character has ${Math.max(
    objectCount,
    INVENTORY_OBJECT_LIMIT
  )} inventory objects. Sell, remove, or consolidate items before adding more.`;
}

function createInventoryStackFromContainerContent(
  containerStackId: string,
  content: CharacterContainerContentItem,
  contentIndex: number
) {
  return createCharacterInventoryItem(content.item, {
    id: `${containerStackId}:content:${contentIndex}`,
    quantity: content.quantity,
    attuned: content.attuned,
    usesRemaining: content.usesRemaining,
    chargesTotal: content.chargesTotal,
    chargesRecharge: content.chargesRecharge,
    storedSpell: content.storedSpell,
    featureTags: content.featureTags,
    spellcastingFocusSources: content.spellcastingFocusSources,
    conjuredSource: content.conjuredSource,
    conjuredDuration: content.conjuredDuration,
    mods: content.mods
  });
}

function getItemObjectTagLabel(item: ItemRecord | null | undefined): string | null {
  return item && isExtractableEquipmentPackRecord(item) ? "Pack" : null;
}

function getInventoryRowObjectTagLabel(
  stack: CharacterInventoryItem,
  item: ItemRecord | null | undefined
): string | null {
  if (isInventoryContainerItem(stack)) {
    const contentObjectCount = getInventoryContainerContents(stack).length;

    return contentObjectCount > 0 ? String(contentObjectCount) : "Empty";
  }

  return getItemObjectTagLabel(item);
}

function EquipmentForm({ character, className, onPersistCharacter }: EquipmentFormProps) {
  const isAddModalCommittingRef = useRef(false);
  const [selectedLoadoutEntry, setSelectedLoadoutEntry] =
    useState<SelectedLoadoutEntryState | null>(null);
  const [selectedInventoryInspection, setSelectedInventoryInspection] =
    useState<SelectedInventoryInspectionState | null>(null);
  const [selectedInventoryStoredSpell, setSelectedInventoryStoredSpell] =
    useState<SelectedInventoryStoredSpellState | null>(null);
  const [parentInventoryInspection, setParentInventoryInspection] =
    useState<SelectedInventoryInspectionState | null>(null);
  const [restoreParentInventoryWithoutAnimation, setRestoreParentInventoryWithoutAnimation] =
    useState(false);
  const [selectedWeaponReference, setSelectedWeaponReference] =
    useState<SelectedWeaponReference | null>(null);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [activeCurrencyKey, setActiveCurrencyKey] = useState<CurrencyKey>("gold");
  const [currencyAmountDraft, setCurrencyAmountDraft] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddModalCommitting, setIsAddModalCommitting] = useState(false);
  const [addEquipmentDraftCharacter, setAddEquipmentDraftCharacter] = useState<Character | null>(
    null
  );
  const [isAddEquipmentDraftDirty, setIsAddEquipmentDraftDirty] = useState(false);
  const [isCustomEquipmentModalOpen, setIsCustomEquipmentModalOpen] = useState(false);
  const [customEditorMode, setCustomEditorMode] = useState<"create" | "edit">("create");
  const [editingInventoryStackId, setEditingInventoryStackId] = useState<string | null>(null);
  const [isEquipmentGuideOpen, setIsEquipmentGuideOpen] = useState(false);
  const [isGeneralEquipmentExpanded, setIsGeneralEquipmentExpanded] = useState(false);
  const [extractingItemKey, setExtractingItemKey] = useState<string | null>(null);
  const [inventoryDrawerNotice, setInventoryDrawerNotice] = useState<string | null>(null);
  const [inventoryObjectLimitNotice, setInventoryObjectLimitNotice] = useState<string | null>(null);
  const [pendingDeleteCustomEquipmentId, setPendingDeleteCustomEquipmentId] = useState<
    string | null
  >(null);
  const [managingContainerStackId, setManagingContainerStackId] = useState<string | null>(null);
  const [pendingContainerInventoryRemoval, setPendingContainerInventoryRemoval] =
    useState<PendingContainerInventoryRemoval | null>(null);
  const equipmentCharacter = addEquipmentDraftCharacter ?? character;
  const customEquipment = useMemo(
    () => equipmentCharacter.customEquipment ?? [],
    [equipmentCharacter.customEquipment]
  );
  const inventoryObjectCount = useMemo(
    () => getInventoryObjectCount(equipmentCharacter.inventoryItems),
    [equipmentCharacter.inventoryItems]
  );
  const inventoryObjectLimitMessage =
    inventoryObjectCount >= INVENTORY_OBJECT_LIMIT
      ? getInventoryObjectLimitMessage(inventoryObjectCount)
      : inventoryObjectLimitNotice;
  function showInventoryObjectLimitNotice(count = inventoryObjectCount) {
    setInventoryObjectLimitNotice(getInventoryObjectLimitMessage(count));
  }
  function clearInventoryObjectLimitNotice() {
    setInventoryObjectLimitNotice(null);
  }
  const closeAddModal = useCallback(
    (options?: { afterClose?: () => void }) => {
      if (isAddModalCommittingRef.current) {
        return;
      }

      isAddModalCommittingRef.current = true;
      setIsAddModalCommitting(true);

      deferModalCommit(() => {
        try {
          if (addEquipmentDraftCharacter && isAddEquipmentDraftDirty) {
            onPersistCharacter(
              (currentCharacter) =>
                applyAddEquipmentDraftToCharacter(currentCharacter, addEquipmentDraftCharacter),
              equipmentPersistOptions
            );
          }

          setAddEquipmentDraftCharacter(null);
          setIsAddEquipmentDraftDirty(false);
          setIsAddModalOpen(false);
          setParentInventoryInspection(null);
          setRestoreParentInventoryWithoutAnimation(false);
          setIsEquipmentGuideOpen(false);
          setSelectedInventoryInspection((currentSelection) =>
            currentSelection?.source === "browser" ? null : currentSelection
          );
          setIsAddModalCommitting(false);
          isAddModalCommittingRef.current = false;
          options?.afterClose?.();
        } catch (error) {
          isAddModalCommittingRef.current = false;
          setIsAddModalCommitting(false);
          throw error;
        }
      });
    },
    [addEquipmentDraftCharacter, isAddEquipmentDraftDirty, onPersistCharacter]
  );

  function openAddModal() {
    if (isAddModalCommittingRef.current) {
      isAddModalCommittingRef.current = false;
    }
    setIsAddModalCommitting(false);
    setSelectedWeaponReference(null);
    setSelectedLoadoutEntry(null);
    setParentInventoryInspection(null);
    setRestoreParentInventoryWithoutAnimation(false);
    setIsEquipmentGuideOpen(false);
    setSelectedInventoryInspection(null);
    setIsCurrencyDrawerOpen(false);
    setAddEquipmentDraftCharacter(createAddEquipmentDraftCharacter(character));
    setIsAddEquipmentDraftDirty(false);
    setIsAddModalOpen(true);
  }

  function updateEquipmentCharacter(
    updater: (currentCharacter: Character) => Character,
    options?: { stage?: boolean }
  ) {
    if (options?.stage) {
      setAddEquipmentDraftCharacter((currentDraft) => {
        const draft = currentDraft ?? createAddEquipmentDraftCharacter(character);
        const nextDraft = updater(draft);

        if (nextDraft !== draft) {
          setIsAddEquipmentDraftDirty(true);
        }

        return nextDraft;
      });
      return;
    }

    onPersistCharacter(updater, equipmentPersistOptions);
  }

  const hasBackdrop = Boolean(
    selectedWeaponReference ||
    selectedLoadoutEntry ||
    selectedInventoryInspection ||
    selectedInventoryStoredSpell ||
    parentInventoryInspection ||
    isCurrencyDrawerOpen ||
    isAddModalOpen ||
    isCustomEquipmentModalOpen ||
    isEquipmentGuideOpen ||
    pendingDeleteCustomEquipmentId ||
    managingContainerStackId ||
    pendingContainerInventoryRemoval
  );
  useBodyScrollLock(hasBackdrop);

  useEffect(() => {
    if (inventoryObjectCount < INVENTORY_OBJECT_LIMIT) {
      setInventoryObjectLimitNotice(null);
    }
  }, [inventoryObjectCount]);

  const closeInventoryItemDrawer = useCallback(() => {
    setInventoryDrawerNotice(null);
    setSelectedInventoryStoredSpell(null);
    if (parentInventoryInspection && selectedInventoryInspection?.source === "container") {
      setRestoreParentInventoryWithoutAnimation(true);
      setSelectedInventoryInspection(parentInventoryInspection);
      setParentInventoryInspection(null);
      return;
    }

    setParentInventoryInspection(null);
    setRestoreParentInventoryWithoutAnimation(false);
    setSelectedInventoryInspection(null);
  }, [parentInventoryInspection, selectedInventoryInspection]);

  useEffect(() => {
    if (!hasBackdrop) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        if (selectedInventoryStoredSpell) {
          setSelectedInventoryStoredSpell(null);
          return;
        }

        if (selectedWeaponReference) {
          setSelectedWeaponReference(null);
          return;
        }

        if (pendingDeleteCustomEquipmentId) {
          setPendingDeleteCustomEquipmentId(null);
          return;
        }

        if (pendingContainerInventoryRemoval) {
          setPendingContainerInventoryRemoval(null);
          return;
        }

        if (managingContainerStackId) {
          setManagingContainerStackId(null);
          return;
        }

        if (isCustomEquipmentModalOpen) {
          closeCustomEquipmentModal();
          return;
        }

        if (isEquipmentGuideOpen) {
          setIsEquipmentGuideOpen(false);
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
    closeInventoryItemDrawer,
    hasBackdrop,
    isAddModalOpen,
    isCurrencyDrawerOpen,
    isCustomEquipmentModalOpen,
    isEquipmentGuideOpen,
    managingContainerStackId,
    pendingContainerInventoryRemoval,
    pendingDeleteCustomEquipmentId,
    parentInventoryInspection,
    selectedInventoryInspection,
    selectedInventoryStoredSpell,
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
        Math.floor(clampNumber(equipmentCharacter.currencies[currencyKey], 0, 999999999, 0))
      );
    });

    return nextCurrencies;
  }, [equipmentCharacter.currencies]);
  const activeCurrencyDefinition =
    currencyDefinitions.find((currency) => currency.key === activeCurrencyKey) ??
    currencyDefinitions[2];
  const activeCurrencyAmount = normalizedCurrencies[activeCurrencyKey];
  const normalizedCurrencyAmount = Math.max(
    0,
    Math.floor(clampNumber(currencyAmountDraft, 0, 999999999, 0))
  );
  const canSpendCurrency = activeCurrencyAmount >= normalizedCurrencyAmount;
  const hasCrafterDiscountFeat = useMemo(
    () =>
      characterHasCrafterDiscount({
        feats: equipmentCharacter.feats,
        level: equipmentCharacter.level
      }),
    [equipmentCharacter.feats, equipmentCharacter.level]
  );
  const resolvedCustomEquipmentEntries = useMemo(
    () => getResolvedCustomLoadoutEntries(customEquipment),
    [customEquipment]
  );
  const featureEquipmentEntries = useMemo(
    () => getFeatureEquipmentEntriesForCharacter(equipmentCharacter),
    [equipmentCharacter]
  );
  const getArcaneArmorFeatureTagsForArmorKey = useCallback(
    (armorKey: string | null | undefined, options?: { includeModel?: boolean }) =>
      getArtificerArmorerArcaneArmorTagLabelsForArmorKey(equipmentCharacter, armorKey, options),
    [equipmentCharacter]
  );
  const getArcaneArmorFeatureTagsForLoadoutEntry = useCallback(
    (
      entry: LoadoutDrawerEntry,
      customEquipmentId?: string,
      options?: { includeModel?: boolean }
    ) => {
      if (entry.category !== ENTRY_CATEGORIES.ARMOR || isShieldArmorEntry(entry)) {
        return [];
      }

      return getArcaneArmorFeatureTagsForArmorKey(
        customEquipmentId
          ? getCustomBodyArmorKey(customEquipmentId)
          : getCodexBodyArmorKey(entry.name),
        options
      );
    },
    [getArcaneArmorFeatureTagsForArmorKey]
  );
  const getArcaneArmorFeatureTagsForInventoryStack = useCallback(
    (
      stack: CharacterInventoryItem | null | undefined,
      item: ItemRecord | null | undefined,
      options?: { includeModel?: boolean }
    ) => {
      if (!stack || !item || !isItemBodyArmorRecord(item)) {
        return [];
      }

      return getArcaneArmorFeatureTagsForArmorKey(getInventoryBodyArmorKey(stack.id), options);
    },
    [getArcaneArmorFeatureTagsForArmorKey]
  );
  const selectedLoadoutItems = useMemo(
    () => [
      ...equipmentCharacter.equipment.flatMap<LoadoutGroupItem>((item) => {
        const entry = getLoadoutCodexEntryByName(item.name);

        if (!entry) {
          return [];
        }

        return [
          {
            key: `codex-${entry.id}`,
            name: entry.name,
            entry,
            featureTags: getArcaneArmorFeatureTagsForLoadoutEntry(entry),
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
            featureTags: getArcaneArmorFeatureTagsForLoadoutEntry(entry, entry.customEquipmentId),
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
    [
      equipmentCharacter.equipment,
      featureEquipmentEntries,
      getArcaneArmorFeatureTagsForLoadoutEntry,
      resolvedCustomEquipmentEntries
    ]
  );
  const selectedEquipmentGroups = useMemo(
    () => groupEquipmentItems(selectedLoadoutItems),
    [selectedLoadoutItems]
  );
  const characterRuntime = useMemo(
    () => getCharacterRuntime(equipmentCharacter),
    [equipmentCharacter]
  );
  const equipmentRuntime = characterRuntime.equipment;
  const inventoryIndex = equipmentRuntime.inventoryIndex;
  const inventoryCountsByKey = inventoryIndex.countsByKey;
  const inventoryCountsByStackId = inventoryIndex.countsByStackId;
  const groupedInventoryItems = inventoryIndex.groups;
  const inventoryEquipmentGroups = useMemo(
    () => groupInventoryEquipmentItems(groupedInventoryItems),
    [groupedInventoryItems]
  );
  const equipmentRenderGroups = useMemo(
    () => createEquipmentRenderGroups(selectedEquipmentGroups, inventoryEquipmentGroups),
    [inventoryEquipmentGroups, selectedEquipmentGroups]
  );
  const carriedWeight = useMemo(
    () =>
      Math.round(
        (selectedLoadoutItems.reduce(
          (totalWeight, item) => totalWeight + (item.entry.weight ?? 0),
          0
        ) +
          equipmentRuntime.inventoryWeight) *
          100
      ) / 100,
    [equipmentRuntime.inventoryWeight, selectedLoadoutItems]
  );
  const carryingCapacity = Math.max(0, getAbilityScoreForCharacter(equipmentCharacter, "STR") * 15);
  const isOverCarryingCapacity = carriedWeight > carryingCapacity;

  useRenderProfiler("EquipmentForm", {
    inventoryGroupCount: groupedInventoryItems.length,
    loadoutItemCount: selectedLoadoutItems.length
  });

  const editingInventoryStack = editingInventoryStackId
    ? findInventoryItemStackById(equipmentCharacter.inventoryItems, editingInventoryStackId)
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
      ...equipmentCharacter.equipment
        .filter((item) => item.onHand)
        .flatMap<HeldWeaponDescriptor>((item) => {
          const entry = getLoadoutCodexEntryByName(item.name);

          if (!entry) {
            return [];
          }

          const heldDescriptor = createHeldDescriptorForEntry(`codex-${entry.id}`, entry);
          return heldDescriptor ? [heldDescriptor] : [];
        }),
      ...equipmentRuntime.heldInventoryDescriptors,
      ...resolvedCustomEquipmentEntries
        .filter(
          (
            entry
          ): entry is Extract<ResolvedCustomLoadoutEntry, { category: ENTRY_CATEGORIES.WEAPONS }> =>
            entry.category === ENTRY_CATEGORIES.WEAPONS && entry.onHand
        )
        .map((entry) => createHeldWeaponDescriptor(`custom-${entry.customEquipmentId}`, entry))
    ],
    [
      equipmentCharacter.equipment,
      equipmentRuntime.heldInventoryDescriptors,
      resolvedCustomEquipmentEntries
    ]
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
      getCharacterEquipmentItem(equipmentCharacter.equipment, selectedLoadoutEntryData.name)?.onHand
    );
  }, [
    equipmentCharacter.equipment,
    customEquipment,
    selectedLoadoutEntry,
    selectedLoadoutEntryData
  ]);
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
      getCharacterEquipmentItem(equipmentCharacter.equipment, selectedLoadoutEntryData.name)?.worn
    );
  }, [
    equipmentCharacter.equipment,
    customEquipment,
    selectedLoadoutEntry,
    selectedLoadoutEntryData
  ]);
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
  const selectedRootInventoryGroup = useMemo(() => {
    if (!selectedInventoryInspection || selectedInventoryInspection.source === "container") {
      return null;
    }

    return selectedInventoryInspection.stackId
      ? (inventoryIndex.groupsByStackId.get(selectedInventoryInspection.stackId) ?? null)
      : (inventoryIndex.groupsByKey.get(selectedInventoryInspection.itemKey) ?? null);
  }, [inventoryIndex.groupsByKey, inventoryIndex.groupsByStackId, selectedInventoryInspection]);
  const selectedContainerStack = useMemo(() => {
    if (
      selectedInventoryInspection?.source !== "container" ||
      !selectedInventoryInspection.containerStackId
    ) {
      return null;
    }

    return findInventoryItemStackById(
      equipmentCharacter.inventoryItems,
      selectedInventoryInspection.containerStackId
    );
  }, [equipmentCharacter.inventoryItems, selectedInventoryInspection]);
  const selectedContainerContents = useMemo(
    () => getInventoryContainerContents(selectedContainerStack),
    [selectedContainerStack]
  );
  const selectedContainerContent =
    selectedInventoryInspection?.source === "container" &&
    selectedInventoryInspection.contentIndex !== undefined
      ? (selectedContainerContents[selectedInventoryInspection.contentIndex] ?? null)
      : null;
  const selectedContainerContentStack =
    selectedInventoryInspection?.source === "container" &&
    selectedInventoryInspection.containerStackId &&
    selectedInventoryInspection.contentIndex !== undefined &&
    selectedContainerContent
      ? createInventoryStackFromContainerContent(
          selectedInventoryInspection.containerStackId,
          selectedContainerContent,
          selectedInventoryInspection.contentIndex
        )
      : null;
  const selectedContainerContentGroup = selectedContainerContentStack
    ? createGroupedInventoryItem(selectedContainerContentStack)
    : null;
  const selectedInventoryGroup = selectedContainerContentGroup ?? selectedRootInventoryGroup;
  const { item: selectedInventoryItem, status: selectedInventoryItemStatus } = useItemEntry(
    selectedInventoryInspection?.itemKey,
    {
      enabled: Boolean(selectedInventoryInspection),
      initialItem: selectedInventoryInspection?.initialItem ?? null,
      localOnly: selectedInventoryInspection?.source === "container"
    }
  );
  const selectedInventoryCopy = useMemo(() => {
    if (!selectedInventoryInspection || selectedInventoryInspection.source === "container") {
      return null;
    }

    return selectedInventoryInspection.stackId
      ? (inventoryIndex.firstCopyByStackId.get(selectedInventoryInspection.stackId) ?? null)
      : (inventoryIndex.firstCopyByKey.get(selectedInventoryInspection.itemKey) ?? null);
  }, [
    inventoryIndex.firstCopyByKey,
    inventoryIndex.firstCopyByStackId,
    selectedInventoryInspection
  ]);
  const selectedAvailableInventoryCopy = useMemo(() => {
    if (!selectedInventoryInspection || selectedInventoryInspection.source === "container") {
      return null;
    }

    return selectedInventoryInspection.stackId
      ? (inventoryIndex.availableCopyByStackId.get(selectedInventoryInspection.stackId) ?? null)
      : (inventoryIndex.availableCopyByKey.get(selectedInventoryInspection.itemKey) ?? null);
  }, [
    inventoryIndex.availableCopyByKey,
    inventoryIndex.availableCopyByStackId,
    selectedInventoryInspection
  ]);
  const selectedWornInventoryCopy = useMemo(() => {
    if (!selectedInventoryInspection || selectedInventoryInspection.source === "container") {
      return null;
    }

    return selectedInventoryInspection.stackId
      ? (inventoryIndex.wornCopyByStackId.get(selectedInventoryInspection.stackId) ?? null)
      : (inventoryIndex.wornCopyByKey.get(selectedInventoryInspection.itemKey) ?? null);
  }, [inventoryIndex.wornCopyByKey, inventoryIndex.wornCopyByStackId, selectedInventoryInspection]);
  const selectedInventoryRecord = selectedInventoryGroup?.item ?? selectedInventoryItem ?? null;
  const selectedInventoryWeaponMods = (
    selectedInventoryRecord as (ItemRecord & { itemModsWeapon?: CharacterItemWeaponMods }) | null
  )?.itemModsWeapon;
  const selectedInventoryWeaponHasActiveMastery = useMemo(
    () =>
      selectedInventoryRecord?.weapon
        ? hasActiveWeaponMastery(character.weaponProficiencies, {
            baseWeapon: selectedInventoryWeaponMods?.baseWeapon,
            name: selectedInventoryRecord.weapon.name,
            key: selectedInventoryRecord.key
          })
        : false,
    [character.weaponProficiencies, selectedInventoryRecord, selectedInventoryWeaponMods]
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
      baseWeapon: selectedInventoryWeaponMods?.baseWeapon,
      name: selectedInventoryRecord.weapon?.name
    });
  }, [character.weaponProficiencies, selectedInventoryRecord, selectedInventoryWeaponMods]);
  const selectedInventoryCount = selectedInventoryInspection
    ? selectedInventoryInspection.source === "container"
      ? (selectedContainerContent?.quantity ?? 0)
      : selectedInventoryInspection.stackId
        ? (inventoryCountsByStackId[selectedInventoryInspection.stackId] ?? 0)
        : (inventoryCountsByKey[selectedInventoryInspection.itemKey] ?? 0)
    : 0;
  const selectedInventoryOnHandCount = selectedInventoryInspection
    ? selectedInventoryInspection.source === "container"
      ? 0
      : selectedInventoryInspection.stackId
        ? (inventoryIndex.heldCountsByStackId[selectedInventoryInspection.stackId] ?? 0)
        : (inventoryIndex.heldCountsByKey[selectedInventoryInspection.itemKey] ?? 0)
    : 0;
  const selectedInventoryStack = selectedInventoryGroup?.stack ?? null;
  const selectedInventoryIsContainer = Boolean(
    selectedInventoryRecord && isItemContainerRecord(selectedInventoryRecord)
  );
  const selectedInventoryOwnedContainer = Boolean(
    selectedInventoryInspection?.source === "inventory" &&
    selectedInventoryStack &&
    isInventoryContainerItem(selectedInventoryStack)
  );
  const selectedInventoryContainerHasContents =
    selectedInventoryStack && selectedInventoryOwnedContainer
      ? hasInventoryContainerContents(selectedInventoryStack)
      : false;
  const managedContainerStack = managingContainerStackId
    ? findInventoryItemStackById(equipmentCharacter.inventoryItems, managingContainerStackId)
    : null;
  const selectedInventoryModEffects = selectedInventoryStack?.mods?.effects ?? [];
  const selectedInventoryFeatureTagLabels = [
    ...getInventoryItemFeatureTagLabels(selectedInventoryStack, {
      includeSpellcastingFocusSource: true
    }),
    ...getArcaneArmorFeatureTagsForInventoryStack(selectedInventoryStack, selectedInventoryRecord, {
      includeModel: true
    })
  ];
  const selectedInventoryStoredSpellHeaderTag =
    getInventoryItemStoredSpellHeaderTagLabel(selectedInventoryStack);
  const selectedInventoryHasMods = Boolean(selectedInventoryStack?.mods);
  const selectedInventoryIsModded =
    selectedInventoryStack &&
    hasCharacterItemMods(selectedInventoryStack.mods) &&
    !selectedInventoryStack.mods?.isCustom;
  const selectedInventoryIsConjured = isConjuredInventoryItem(selectedInventoryStack);
  const selectedInventoryIsInventoryConjuredStack =
    selectedInventoryInspection?.source === "inventory" && selectedInventoryIsConjured;
  const isSelectedInventoryOwnedDrawer =
    selectedInventoryCount > 0 && selectedInventoryStack !== null;
  const inventoryAttunementCount = useMemo(
    () => getInventoryAttunementCount(equipmentCharacter.inventoryItems),
    [equipmentCharacter.inventoryItems]
  );
  const inventoryAttunementLimit = getInventoryAttunementLimit(equipmentCharacter);
  const inventoryAttunementLabel = `${inventoryAttunementCount}/${inventoryAttunementLimit}`;
  const selectedInventoryHeaderUseState =
    isSelectedInventoryOwnedDrawer && selectedInventoryStack && !selectedInventoryOwnedContainer
      ? getInventoryItemUseState(selectedInventoryStack)
      : null;
  const selectedInventoryChargesTagLabel =
    isSelectedInventoryOwnedDrawer && selectedInventoryStack && !selectedInventoryOwnedContainer
      ? getInventoryItemChargesTagLabel(selectedInventoryStack, { includeRecharge: true })
      : null;
  const selectedInventoryUseState =
    selectedInventoryInspection?.source !== "container" ? selectedInventoryHeaderUseState : null;
  const selectedInventoryItemStoredSpell =
    isSelectedInventoryOwnedDrawer && !selectedInventoryOwnedContainer
      ? getInventoryItemStoredSpell(selectedInventoryStack)
      : null;
  const selectedInventoryItemStoredSpellEntry = selectedInventoryItemStoredSpell
    ? getSpellEntryById(selectedInventoryItemStoredSpell.spellId)
    : null;
  const selectedInventoryAttuned = Boolean(
    selectedInventoryInspection?.source !== "container" &&
    isSelectedInventoryOwnedDrawer &&
    selectedInventoryStack?.attuned
  );
  const selectedInventoryAttunable = Boolean(
    selectedInventoryInspection?.source !== "container" &&
    isSelectedInventoryOwnedDrawer &&
    isInventoryItemAttunable(selectedInventoryRecord)
  );
  const isInventoryAttunementLimitReached = inventoryAttunementCount >= inventoryAttunementLimit;
  const selectedInventoryTransactionCost = selectedInventoryRecord
    ? getItemTransactionCost(selectedInventoryRecord)
    : null;
  const selectedInventorySaleCost = selectedInventoryRecord
    ? getItemTransactionCost(selectedInventoryRecord, {
        multiplier: 0.5,
        rounding: "floor"
      })
    : null;
  const selectedInventoryAddBlockedByLimit = selectedInventoryRecord
    ? !canAddItemToSelectedInventoryTarget(selectedInventoryRecord)
    : false;
  const selectedInventoryAddBlockNotice = selectedInventoryAddBlockedByLimit
    ? getSelectedContainerAddBlockMessage()
    : null;
  const selectedInventoryHasCrafterDiscount = Boolean(
    selectedInventoryRecord &&
    hasCrafterDiscountFeat &&
    isCrafterDiscountEligibleItem(selectedInventoryRecord)
  );
  const selectedInventoryDescriptionAdditions = useMemo(
    () =>
      selectedInventoryHasCrafterDiscount
        ? [createSourcedDescriptionEntries("Crafter: Discount", [crafterDiscountRuleText])]
        : [],
    [selectedInventoryHasCrafterDiscount]
  );
  const selectedInventoryAdditionalDescription = useMemo(
    () =>
      getFeatItemAdditionalDescriptionForCharacter(
        {
          feats: equipmentCharacter.feats,
          level: equipmentCharacter.level
        },
        selectedInventoryRecord
      ),
    [equipmentCharacter.feats, equipmentCharacter.level, selectedInventoryRecord]
  );
  const selectedInventoryHandDescriptor =
    selectedInventoryGroup && selectedInventoryInspection?.source === "container"
      ? createHeldDescriptorForInventoryItem(
          `container-${selectedInventoryInspection.containerStackId}-${selectedInventoryInspection.contentIndex}`,
          selectedInventoryGroup.item
        )
      : selectedInventoryGroup && selectedAvailableInventoryCopy
        ? createHeldDescriptorForInventoryItem(
            `inventory-${selectedAvailableInventoryCopy.id}`,
            selectedInventoryGroup.item
          )
        : null;
  const selectedInventoryDualDescriptors =
    selectedInventoryInspection?.source !== "container" &&
    selectedInventoryGroup &&
    selectedInventoryCount >= 2
      ? (selectedInventoryInspection?.stackId
          ? getPreferredInventoryCopiesById(
              equipmentCharacter.inventoryItems,
              selectedInventoryInspection.stackId,
              2
            )
          : getPreferredInventoryCopiesByKey(
              equipmentCharacter.inventoryItems,
              selectedInventoryGroup.itemKey,
              2
            )
        )
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
    if (selectedInventoryInspection?.source === "container" && selectedContainerContent === null) {
      if (parentInventoryInspection) {
        setRestoreParentInventoryWithoutAnimation(true);
        setSelectedInventoryInspection(parentInventoryInspection);
        setParentInventoryInspection(null);
        return;
      }

      setRestoreParentInventoryWithoutAnimation(false);
      setSelectedInventoryInspection(null);
      return;
    }

    if (
      selectedInventoryInspection?.source === "inventory" &&
      (selectedInventoryInspection.stackId
        ? (inventoryCountsByStackId[selectedInventoryInspection.stackId] ?? 0)
        : (inventoryCountsByKey[selectedInventoryInspection.itemKey] ?? 0)) === 0
    ) {
      setRestoreParentInventoryWithoutAnimation(false);
      setSelectedInventoryInspection(null);
    }
  }, [
    inventoryCountsByKey,
    inventoryCountsByStackId,
    parentInventoryInspection,
    selectedContainerContent,
    selectedInventoryInspection
  ]);

  function openLoadoutEntryDetails(item: LoadoutGroupItem) {
    setIsCurrencyDrawerOpen(false);
    setSelectedWeaponReference(null);
    setParentInventoryInspection(null);
    setRestoreParentInventoryWithoutAnimation(false);
    setIsEquipmentGuideOpen(false);
    setSelectedInventoryInspection(null);
    setSelectedLoadoutEntry({
      entry: item.entry,
      customEquipmentId: item.customEquipmentId,
      featureManagedSource: item.featureManagedSource,
      featureTags: getArcaneArmorFeatureTagsForLoadoutEntry(item.entry, item.customEquipmentId, {
        includeModel: true
      }),
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
    closeAddModal({
      afterClose: () => {
        setIsCustomEquipmentModalOpen(true);
        setCustomEditorMode("create");
        setEditingInventoryStackId(null);
      }
    });
  }

  function openCustomEquipmentEditor(_customEquipmentId: string) {
    setSelectedWeaponReference(null);
    setSelectedLoadoutEntry(null);
    setSelectedInventoryInspection(null);
    setIsCurrencyDrawerOpen(false);
    setIsCustomEquipmentModalOpen(true);
    setCustomEditorMode("edit");
    setEditingInventoryStackId(null);
  }

  function openInventoryItemModsEditor(stackId: string) {
    setSelectedWeaponReference(null);
    setSelectedLoadoutEntry(null);
    setIsCurrencyDrawerOpen(false);
    setIsCustomEquipmentModalOpen(true);
    setCustomEditorMode("edit");
    setEditingInventoryStackId(stackId);
  }

  function closeCustomEquipmentModal() {
    setIsCustomEquipmentModalOpen(false);
    setCustomEditorMode("create");
    setEditingInventoryStackId(null);
  }

  function saveCustomEquipment(payload: CustomEquipmentEditorSavePayload) {
    let nextInventorySelection: SelectedInventoryInspectionState | null = null;

    if (
      !(customEditorMode === "edit" && editingInventoryStackId) &&
      !canAddInventoryObject(equipmentCharacter.inventoryItems, { kind: "new-root-stack" })
    ) {
      showInventoryObjectLimitNotice();
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (customEditorMode === "edit" && editingInventoryStackId) {
        const originalStack = findInventoryItemStackById(
          currentCharacter.inventoryItems,
          editingInventoryStackId
        );
        const result = saveInventoryItemModsById(
          currentCharacter.inventoryItems,
          editingInventoryStackId,
          payload.item,
          payload.mods,
          payload.settings
        );
        const savedStack = result.stackId
          ? findInventoryItemStackById(result.inventoryItems, result.stackId)
          : null;

        if (savedStack) {
          nextInventorySelection = {
            itemKey: savedStack.item.key || payload.item.key || "",
            stackId: savedStack.id,
            initialItem: getEffectiveInventoryItemRecord(savedStack),
            source: "inventory"
          };
        }

        const nextCharacter = {
          ...currentCharacter,
          inventoryItems: result.inventoryItems
        };

        if (originalStack && savedStack && isPactOfTheBladeInventoryItem(originalStack)) {
          if (!getEffectiveInventoryItemRecord(savedStack).weapon) {
            return clearWarlockPactOfTheBladeInvocationSelectionForCharacter(nextCharacter);
          }

          if (originalStack.id !== savedStack.id) {
            return replaceWarlockPactOfTheBladeOwnedStackSelectionForCharacter(
              nextCharacter,
              originalStack.id,
              savedStack.id
            );
          }
        }

        return nextCharacter;
      }

      const newStack = createCharacterInventoryItem(payload.item, {
        quantity: 1,
        mods: payload.mods,
        chargesTotal: payload.settings.chargesTotal,
        chargesRecharge: payload.settings.chargesRecharge,
        storedSpell: payload.settings.storedSpell,
        featureTags: payload.settings.featureTags,
        conjuredSource: payload.settings.conjuredSource,
        conjuredDuration: payload.settings.conjuredDuration
      });

      return {
        ...currentCharacter,
        inventoryItems: [...currentCharacter.inventoryItems, newStack]
      };
    }, equipmentPersistOptions);

    if (nextInventorySelection) {
      setParentInventoryInspection(null);
      setSelectedInventoryInspection(nextInventorySelection);
    }

    clearInventoryObjectLimitNotice();
    closeLoadoutDrawer();
    closeCustomEquipmentModal();
  }

  function deleteCustomEquipment(customEquipmentId: string) {
    onPersistCharacter(
      (currentCharacter) => ({
        ...currentCharacter,
        customEquipment: currentCharacter.customEquipment.filter(
          (entry) => entry.id !== customEquipmentId
        )
      }),
      equipmentPersistOptions
    );

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
    setParentInventoryInspection(null);
    setRestoreParentInventoryWithoutAnimation(false);
    setIsEquipmentGuideOpen(false);
    setInventoryDrawerNotice(null);
    setSelectedInventoryInspection({
      itemKey: item.key,
      initialItem: findOwnedInventoryItemRecord(equipmentCharacter.inventoryItems, item.key),
      source: "browser"
    });
  }

  function openInventoryInspectionFromLoadout(item: GroupedInventoryItem) {
    setSelectedWeaponReference(null);
    setSelectedLoadoutEntry(null);
    setParentInventoryInspection(null);
    setRestoreParentInventoryWithoutAnimation(false);
    setIsEquipmentGuideOpen(false);
    setInventoryDrawerNotice(null);
    setSelectedInventoryInspection({
      itemKey: item.itemKey,
      stackId: item.stackId,
      initialItem: item.item,
      source: "inventory"
    });
  }

  function openInventoryInspectionFromContainerContent(
    containerStackId: string,
    contentIndex: number
  ) {
    const containerStack = findInventoryItemStackById(
      equipmentCharacter.inventoryItems,
      containerStackId
    );
    const content = getInventoryContainerContents(containerStack)[contentIndex] ?? null;

    if (!content || !content.item.key) {
      return;
    }

    const contentStack = createInventoryStackFromContainerContent(
      containerStackId,
      content,
      contentIndex
    );

    setSelectedWeaponReference(null);
    setSelectedLoadoutEntry(null);
    setInventoryDrawerNotice(null);
    setRestoreParentInventoryWithoutAnimation(false);
    setIsEquipmentGuideOpen(false);
    if (selectedInventoryInspection?.source === "inventory") {
      setParentInventoryInspection(selectedInventoryInspection);
    }
    setSelectedInventoryInspection({
      itemKey: content.item.key,
      containerStackId,
      contentIndex,
      initialItem: getEffectiveInventoryItemRecord(contentStack),
      source: "container"
    });
  }

  function openSelectedContainerManagement() {
    if (!selectedInventoryStack || !isInventoryContainerItem(selectedInventoryStack)) {
      return;
    }

    setManagingContainerStackId(selectedInventoryStack.id);
  }

  function closeContainerManagement() {
    setManagingContainerStackId(null);
  }

  function saveContainerManagement(inventoryItems: Character["inventoryItems"]) {
    onPersistCharacter(
      (currentCharacter) => ({
        ...currentCharacter,
        inventoryItems
      }),
      equipmentPersistOptions
    );

    setManagingContainerStackId(null);
    closeInventoryItemDrawer();
  }

  function canAddItemToSelectedInventoryTarget(item: ItemRecord): boolean {
    if (selectedInventoryHasMods) {
      return false;
    }

    if (
      selectedInventoryInspection?.source === "container" &&
      selectedInventoryInspection.containerStackId &&
      selectedInventoryInspection.contentIndex !== undefined
    ) {
      return canAddInventoryObject(equipmentCharacter.inventoryItems, {
        kind: "container-content",
        containerStackId: selectedInventoryInspection.containerStackId,
        contentIndex: selectedInventoryInspection.contentIndex
      });
    }

    return canAddInventoryObject(equipmentCharacter.inventoryItems, {
      kind: "root",
      item
    });
  }

  function getSelectedContainerAddBlockMessage(): string | null {
    if (
      selectedInventoryInspection?.source !== "container" ||
      !selectedInventoryInspection.containerStackId ||
      selectedInventoryInspection.contentIndex === undefined
    ) {
      return null;
    }

    const blockReason = getAddOneContainerContentItemCopyBlockReason(
      equipmentCharacter.inventoryItems,
      selectedInventoryInspection.containerStackId,
      selectedInventoryInspection.contentIndex
    );

    return blockReason === "weight-limit"
      ? `Bag of Holding capacity reached (${BAG_OF_HOLDING_WEIGHT_LIMIT_LB} lb). Move or remove items before adding more.`
      : null;
  }

  function showSelectedInventoryAddBlockedNotice() {
    const containerAddBlockMessage = getSelectedContainerAddBlockMessage();

    if (containerAddBlockMessage) {
      setInventoryDrawerNotice(containerAddBlockMessage);
      return;
    }

    showInventoryObjectLimitNotice();
  }

  function wouldExceedInventoryObjectLimit(inventoryItems: Character["inventoryItems"]): boolean {
    return getInventoryObjectCount(inventoryItems) > INVENTORY_OBJECT_LIMIT;
  }

  function addInventoryItemCopy(item: ItemRecord) {
    if (!item.key) {
      return;
    }

    if (!canAddItemToSelectedInventoryTarget(item)) {
      showSelectedInventoryAddBlockedNotice();
      return;
    }

    updateEquipmentCharacter(
      (currentCharacter) => {
        const nextInventoryItems =
          selectedInventoryInspection?.source === "container" &&
          selectedInventoryInspection.containerStackId &&
          selectedInventoryInspection.contentIndex !== undefined
            ? addOneContainerContentItemCopyByIndex(
                currentCharacter.inventoryItems,
                selectedInventoryInspection.containerStackId,
                selectedInventoryInspection.contentIndex
              )
            : addInventoryItemCopies(currentCharacter.inventoryItems, item);

        return {
          ...currentCharacter,
          inventoryItems: nextInventoryItems
        };
      },
      { stage: selectedInventoryInspection?.source === "browser" }
    );
    clearInventoryObjectLimitNotice();
  }

  function buyInventoryItemCopy(item: ItemRecord) {
    if (!item.key) {
      return;
    }

    const transactionCost = getItemTransactionCost(item);

    if (!transactionCost || transactionCost.amount <= 0) {
      return;
    }

    if (!canAddItemToSelectedInventoryTarget(item)) {
      showSelectedInventoryAddBlockedNotice();
      return;
    }

    updateEquipmentCharacter(
      (currentCharacter) => {
        const currentCurrencyAmount = Math.max(
          0,
          Math.floor(
            clampNumber(currentCharacter.currencies[transactionCost.currencyKey], 0, 999999999, 0)
          )
        );

        if (currentCurrencyAmount < transactionCost.amount) {
          return currentCharacter;
        }

        const nextInventoryItems =
          selectedInventoryInspection?.source === "container" &&
          selectedInventoryInspection.containerStackId &&
          selectedInventoryInspection.contentIndex !== undefined
            ? addOneContainerContentItemCopyByIndex(
                currentCharacter.inventoryItems,
                selectedInventoryInspection.containerStackId,
                selectedInventoryInspection.contentIndex
              )
            : addInventoryItemCopies(currentCharacter.inventoryItems, item);

        if (wouldExceedInventoryObjectLimit(nextInventoryItems)) {
          return currentCharacter;
        }

        return {
          ...currentCharacter,
          currencies: {
            ...currentCharacter.currencies,
            [transactionCost.currencyKey]: currentCurrencyAmount - transactionCost.amount
          },
          inventoryItems: nextInventoryItems
        };
      },
      { stage: selectedInventoryInspection?.source === "browser" }
    );
    clearInventoryObjectLimitNotice();
  }

  function getInventoryRemovalTargetStack(
    currentCharacter: Character,
    itemKey: string,
    stackId?: string | null
  ) {
    return stackId
      ? findInventoryItemStackById(currentCharacter.inventoryItems, stackId)
      : findInventoryItemStackByKey(currentCharacter.inventoryItems, itemKey);
  }

  function clearPactOfTheBladeSelectionIfTargetWasPact(
    currentCharacter: Character,
    targetStack: ReturnType<typeof findInventoryItemStackById>
  ): Character {
    return isPactOfTheBladeInventoryItem(targetStack)
      ? clearWarlockPactOfTheBladeInvocationSelectionForCharacter(currentCharacter)
      : currentCharacter;
  }

  function removeInventoryItemCopy(itemKey: string, options?: { closeDrawer?: boolean }) {
    if (!itemKey) {
      return;
    }

    if (
      selectedInventoryInspection?.source === "container" &&
      selectedInventoryInspection.containerStackId &&
      selectedInventoryInspection.contentIndex !== undefined
    ) {
      updateEquipmentCharacter((currentCharacter) => ({
        ...currentCharacter,
        inventoryItems: removeOneContainerContentItemByIndex(
          currentCharacter.inventoryItems,
          selectedInventoryInspection.containerStackId!,
          selectedInventoryInspection.contentIndex!
        )
      }));

      clearInventoryObjectLimitNotice();

      if (options?.closeDrawer) {
        closeInventoryItemDrawer();
      }

      return;
    }

    const stackId = selectedInventoryInspection?.stackId;

    updateEquipmentCharacter(
      (currentCharacter) => {
        const targetStack = getInventoryRemovalTargetStack(currentCharacter, itemKey, stackId);

        if (!targetStack) {
          return currentCharacter;
        }

        const nextCharacter = {
          ...currentCharacter,
          inventoryItems: stackId
            ? removeOneInventoryItemCopyById(currentCharacter.inventoryItems, stackId)
            : removeOneInventoryItemCopyByKey(currentCharacter.inventoryItems, itemKey)
        };

        return clearPactOfTheBladeSelectionIfTargetWasPact(nextCharacter, targetStack);
      },
      { stage: selectedInventoryInspection?.source === "browser" }
    );

    if (options?.closeDrawer) {
      closeInventoryItemDrawer();
    }

    clearInventoryObjectLimitNotice();
  }

  function sellInventoryItemCopy(item: ItemRecord, options?: { closeDrawer?: boolean }) {
    const itemKey = item.key;

    if (!itemKey) {
      return;
    }

    const transactionCost = getItemTransactionCost(item, {
      multiplier: 0.5,
      rounding: "floor"
    });

    if (!transactionCost || transactionCost.amount <= 0) {
      return;
    }

    if (
      selectedInventoryInspection?.source === "container" &&
      selectedInventoryInspection.containerStackId &&
      selectedInventoryInspection.contentIndex !== undefined
    ) {
      updateEquipmentCharacter((currentCharacter) => {
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
          inventoryItems: removeOneContainerContentItemByIndex(
            currentCharacter.inventoryItems,
            selectedInventoryInspection.containerStackId!,
            selectedInventoryInspection.contentIndex!
          )
        };
      });

      clearInventoryObjectLimitNotice();

      if (options?.closeDrawer) {
        closeInventoryItemDrawer();
      }

      return;
    }

    const stackId = selectedInventoryInspection?.stackId;

    updateEquipmentCharacter(
      (currentCharacter) => {
        const targetStack = getInventoryRemovalTargetStack(currentCharacter, itemKey, stackId);

        if (!targetStack) {
          return currentCharacter;
        }

        const currentCurrencyAmount = Math.max(
          0,
          Math.floor(
            clampNumber(currentCharacter.currencies[transactionCost.currencyKey], 0, 999999999, 0)
          )
        );

        const nextCharacter = {
          ...currentCharacter,
          currencies: {
            ...currentCharacter.currencies,
            [transactionCost.currencyKey]: currentCurrencyAmount + transactionCost.amount
          },
          inventoryItems: stackId
            ? removeOneInventoryItemCopyById(currentCharacter.inventoryItems, stackId)
            : removeOneInventoryItemCopyByKey(currentCharacter.inventoryItems, itemKey)
        };

        return clearPactOfTheBladeSelectionIfTargetWasPact(nextCharacter, targetStack);
      },
      { stage: selectedInventoryInspection?.source === "browser" }
    );

    if (options?.closeDrawer) {
      closeInventoryItemDrawer();
    }

    clearInventoryObjectLimitNotice();
  }

  function queueContainerRemoval(action: "remove" | "sell", item: ItemRecord) {
    const itemKey = item.key;
    const stackId = selectedInventoryInspection?.stackId;

    if (!itemKey || !stackId || !selectedInventoryStack) {
      return;
    }

    if (!selectedInventoryContainerHasContents) {
      if (action === "sell") {
        sellInventoryItemCopy(item);
        return;
      }

      removeInventoryItemCopy(itemKey);
      return;
    }

    setPendingContainerInventoryRemoval({
      action,
      item,
      itemKey,
      stackId
    });
  }

  function confirmContainerRemoval() {
    if (!pendingContainerInventoryRemoval) {
      return;
    }

    if (pendingContainerInventoryRemoval.action === "sell") {
      sellInventoryItemCopy(pendingContainerInventoryRemoval.item, { closeDrawer: true });
    } else {
      removeInventoryItemCopy(pendingContainerInventoryRemoval.itemKey, { closeDrawer: true });
    }

    setPendingContainerInventoryRemoval(null);
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
    setInventoryDrawerNotice(null);

    try {
      const payload = await fetchItemPackContents(packKey);
      let projectedInventoryItems = equipmentCharacter.inventoryItems;

      payload.contents.forEach((entry) => {
        projectedInventoryItems = addInventoryItemCopies(
          projectedInventoryItems,
          entry.item,
          entry.quantity
        );
      });

      if (source === "inventory") {
        projectedInventoryItems = selectedInventoryInspection?.stackId
          ? removeOneInventoryItemCopyById(
              projectedInventoryItems,
              selectedInventoryInspection.stackId
            )
          : removeOneInventoryItemCopyByKey(projectedInventoryItems, packKey);
      }

      if (wouldExceedInventoryObjectLimit(projectedInventoryItems)) {
        showInventoryObjectLimitNotice(getInventoryObjectCount(projectedInventoryItems));
        return;
      }

      updateEquipmentCharacter(
        (currentCharacter) => {
          let nextInventoryItems = currentCharacter.inventoryItems;

          payload.contents.forEach((entry) => {
            nextInventoryItems = addInventoryItemCopies(
              nextInventoryItems,
              entry.item,
              entry.quantity
            );
          });

          if (source === "inventory") {
            nextInventoryItems = selectedInventoryInspection?.stackId
              ? removeOneInventoryItemCopyById(
                  nextInventoryItems,
                  selectedInventoryInspection.stackId
                )
              : removeOneInventoryItemCopyByKey(nextInventoryItems, packKey);
          }

          if (
            nextInventoryItems === currentCharacter.inventoryItems ||
            wouldExceedInventoryObjectLimit(nextInventoryItems)
          ) {
            return currentCharacter;
          }

          return {
            ...currentCharacter,
            inventoryItems: nextInventoryItems
          };
        },
        { stage: source === "browser" }
      );
      clearInventoryObjectLimitNotice();
    } catch (error) {
      if (isApiOfflineError(error)) {
        setInventoryDrawerNotice("Server Unavailable");
        return;
      }

      if (
        error instanceof ApiRequestFailedError &&
        error.status !== undefined &&
        error.status < 500
      ) {
        return;
      }

      console.error("Failed to extract equipment pack contents.", error);
      captureAppError(error, {
        area: "equipment",
        action: "extract-pack-contents",
        extra: {
          packKey,
          source
        }
      });
    } finally {
      setExtractingItemKey((currentKey) => (currentKey === packKey ? null : currentKey));
    }
  }

  function removeEquipmentItem(itemName: string) {
    onPersistCharacter(
      (currentCharacter) => ({
        ...currentCharacter,
        equipment: currentCharacter.equipment.filter(
          (equipmentItem) => equipmentItem.name !== itemName
        )
      }),
      equipmentPersistOptions
    );

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
    }, equipmentPersistOptions);

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
    }, equipmentPersistOptions);

    closeLoadoutDrawer();
  }

  function toggleArmorWorn() {
    if (!selectedLoadoutEntryData || selectedLoadoutEntryData.category !== ENTRY_CATEGORIES.ARMOR) {
      return;
    }

    const nextWornState = !isSelectedArmorWorn;

    onPersistCharacter(
      (currentCharacter) =>
        selectedLoadoutEntry?.customEquipmentId
          ? setCustomArmorWornState(
              currentCharacter,
              selectedLoadoutEntry.customEquipmentId,
              nextWornState
            )
          : setCodexArmorWornState(currentCharacter, selectedLoadoutEntryData.name, nextWornState),
      equipmentPersistOptions
    );

    closeLoadoutDrawer();
  }

  function toggleSelectedInventoryItemOnHand() {
    if (!selectedInventoryInspection?.itemKey || !selectedInventoryGroup) {
      return;
    }

    if (selectedInventoryInspection.source === "container") {
      if (!selectedInventoryHandDescriptor || !canSelectedInventoryBePutOnHand) {
        return;
      }

      moveSelectedContainerContentToRoot({ onHand: true });
      return;
    }

    if (
      !isSelectedInventoryOnHand &&
      (!selectedInventoryHandDescriptor || !canSelectedInventoryBePutOnHand)
    ) {
      return;
    }

    updateEquipmentCharacter(
      (currentCharacter) => {
        const setOnHandQuantity = (
          inventoryItems: Character["inventoryItems"],
          quantity: number
        ) =>
          selectedInventoryInspection.stackId
            ? setInventoryItemOnHandQuantityById(
                inventoryItems,
                selectedInventoryInspection.stackId,
                quantity
              )
            : setInventoryItemOnHandQuantityByKey(
                inventoryItems,
                selectedInventoryInspection.itemKey,
                quantity
              );

        if (isSelectedInventoryOnHand) {
          return {
            ...currentCharacter,
            inventoryItems: setOnHandQuantity(
              currentCharacter.inventoryItems,
              selectedInventoryOnHandCount >= 2 ? 1 : 0
            )
          };
        }

        return {
          ...currentCharacter,
          inventoryItems: setOnHandQuantity(currentCharacter.inventoryItems, 1)
        };
      },
      { stage: selectedInventoryInspection.source === "browser" }
    );
  }

  function swapSelectedInventoryItemToHand() {
    if (
      !selectedInventoryInspection?.itemKey ||
      !selectedInventoryGroup ||
      (selectedInventoryInspection.source !== "container" && isSelectedInventoryOnHand)
    ) {
      return;
    }

    if (selectedInventoryInspection.source === "container") {
      if (!selectedInventoryHandDescriptor) {
        return;
      }

      moveSelectedContainerContentToRoot({ clearHands: true, onHand: true });
      return;
    }

    updateEquipmentCharacter(
      (currentCharacter) => {
        const clearedCharacter = clearCharacterHandOccupants(currentCharacter);

        return {
          ...clearedCharacter,
          inventoryItems: selectedInventoryInspection.stackId
            ? setInventoryItemOnHandQuantityById(
                clearedCharacter.inventoryItems,
                selectedInventoryInspection.stackId,
                1
              )
            : setInventoryItemOnHandQuantityByKey(
                clearedCharacter.inventoryItems,
                selectedInventoryInspection.itemKey,
                1
              )
        };
      },
      { stage: selectedInventoryInspection.source === "browser" }
    );
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

    updateEquipmentCharacter(
      (currentCharacter) => {
        const targetCopies = selectedInventoryInspection.stackId
          ? getPreferredInventoryCopiesById(
              currentCharacter.inventoryItems,
              selectedInventoryInspection.stackId,
              2
            )
          : getPreferredInventoryCopiesByKey(
              currentCharacter.inventoryItems,
              selectedInventoryInspection.itemKey,
              2
            );

        if (targetCopies.length < 2) {
          return currentCharacter;
        }

        if (canSelectedInventoryBeDualEquipped) {
          return {
            ...currentCharacter,
            inventoryItems: selectedInventoryInspection.stackId
              ? setInventoryItemOnHandQuantityById(
                  currentCharacter.inventoryItems,
                  selectedInventoryInspection.stackId,
                  2
                )
              : setInventoryItemOnHandQuantityByKey(
                  currentCharacter.inventoryItems,
                  selectedInventoryInspection.itemKey,
                  2
                )
          };
        }

        const clearedCharacter = clearCharacterHandOccupants(currentCharacter);

        return {
          ...clearedCharacter,
          inventoryItems: selectedInventoryInspection.stackId
            ? setInventoryItemOnHandQuantityById(
                clearedCharacter.inventoryItems,
                selectedInventoryInspection.stackId,
                2
              )
            : setInventoryItemOnHandQuantityByKey(
                clearedCharacter.inventoryItems,
                selectedInventoryInspection.itemKey,
                2
              )
        };
      },
      { stage: selectedInventoryInspection.source === "browser" }
    );
  }

  function toggleSelectedInventoryArmorWorn() {
    if (
      !selectedInventoryGroup ||
      !selectedInventoryInspection?.itemKey ||
      (selectedInventoryInspection.source !== "container" && !selectedInventoryCopy)
    ) {
      return;
    }

    if (!isItemBodyArmorRecord(selectedInventoryGroup.item)) {
      return;
    }

    if (selectedInventoryInspection.source === "container") {
      moveSelectedContainerContentToRoot({ worn: true });
      return;
    }

    if (!selectedInventoryCopy) {
      return;
    }

    updateEquipmentCharacter(
      (currentCharacter) =>
        setInventoryItemArmorWornState(
          currentCharacter,
          selectedInventoryCopy.id,
          !isSelectedInventoryArmorWorn
        ),
      { stage: selectedInventoryInspection.source === "browser" }
    );
  }

  function toggleSelectedInventoryItemAttunement() {
    if (
      !selectedInventoryInspection?.itemKey ||
      !isSelectedInventoryOwnedDrawer ||
      !selectedInventoryAttunable
    ) {
      return;
    }

    if (!selectedInventoryAttuned && isInventoryAttunementLimitReached) {
      return;
    }

    updateEquipmentCharacter(
      (currentCharacter) => ({
        ...currentCharacter,
        inventoryItems: selectedInventoryInspection.stackId
          ? setInventoryItemAttunedById(
              currentCharacter.inventoryItems,
              selectedInventoryInspection.stackId,
              !selectedInventoryAttuned
            )
          : setInventoryItemAttunedByKey(
              currentCharacter.inventoryItems,
              selectedInventoryInspection.itemKey,
              !selectedInventoryAttuned
            )
      }),
      { stage: selectedInventoryInspection.source === "browser" }
    );
  }

  function openSelectedInventoryStoredSpell() {
    if (
      !selectedInventoryInspection ||
      !selectedInventoryStack ||
      !selectedInventoryItemStoredSpell ||
      !selectedInventoryItemStoredSpellEntry
    ) {
      return;
    }

    if (selectedInventoryInspection.source === "container") {
      if (
        !selectedInventoryInspection.containerStackId ||
        selectedInventoryInspection.contentIndex === undefined
      ) {
        return;
      }

      setSelectedInventoryStoredSpell({
        spellId: selectedInventoryItemStoredSpell.spellId,
        source: "container",
        containerStackId: selectedInventoryInspection.containerStackId,
        contentIndex: selectedInventoryInspection.contentIndex
      });
    } else {
      setSelectedInventoryStoredSpell({
        spellId: selectedInventoryItemStoredSpell.spellId,
        source: "inventory",
        stackId: selectedInventoryStack.id
      });
    }
  }

  function useSelectedInventoryItemCharge() {
    if (
      !selectedInventoryInspection?.itemKey ||
      !isSelectedInventoryOwnedDrawer ||
      !selectedInventoryUseState ||
      selectedInventoryUseState.remaining <= 0
    ) {
      return;
    }

    updateEquipmentCharacter(
      (currentCharacter) => ({
        ...currentCharacter,
        inventoryItems: selectedInventoryInspection.stackId
          ? spendInventoryItemChargeById(
              currentCharacter.inventoryItems,
              selectedInventoryInspection.stackId
            )
          : spendInventoryItemChargeByKey(
              currentCharacter.inventoryItems,
              selectedInventoryInspection.itemKey
            )
      }),
      { stage: selectedInventoryInspection.source === "browser" }
    );
  }

  function resetSelectedInventoryItemCharge() {
    if (
      !selectedInventoryInspection?.itemKey ||
      !isSelectedInventoryOwnedDrawer ||
      !selectedInventoryUseState ||
      selectedInventoryUseState.remaining >= selectedInventoryUseState.total
    ) {
      return;
    }

    updateEquipmentCharacter(
      (currentCharacter) => ({
        ...currentCharacter,
        inventoryItems: selectedInventoryInspection.stackId
          ? resetInventoryItemChargeById(
              currentCharacter.inventoryItems,
              selectedInventoryInspection.stackId
            )
          : resetInventoryItemChargeByKey(
              currentCharacter.inventoryItems,
              selectedInventoryInspection.itemKey
            )
      }),
      { stage: selectedInventoryInspection.source === "browser" }
    );
  }

  function adjustCurrencyBalance(mode: "spend" | "gain") {
    const amount = Math.max(0, Math.floor(clampNumber(currencyAmountDraft, 0, 999999999, 0)));

    updateEquipmentCharacter(
      (currentCharacter) => {
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
      },
      { stage: isAddModalOpen }
    );

    setCurrencyAmountDraft(0);
  }

  function moveSelectedContainerContentToRoot(options: {
    clearHands?: boolean;
    onHand?: boolean;
    worn?: boolean;
  }) {
    if (
      selectedInventoryInspection?.source !== "container" ||
      !selectedInventoryInspection.containerStackId ||
      selectedInventoryInspection.contentIndex === undefined
    ) {
      return;
    }

    const projectedBaseCharacter = options.clearHands
      ? clearCharacterHandOccupants(equipmentCharacter)
      : equipmentCharacter;
    const projectedMoveResult = moveOneContainerContentItemOutByIndexWithResult(
      projectedBaseCharacter.inventoryItems,
      selectedInventoryInspection.containerStackId,
      selectedInventoryInspection.contentIndex
    );
    let projectedInventoryItems = projectedMoveResult.inventoryItems;

    if (!projectedMoveResult.stackId) {
      return;
    }

    if (options.onHand) {
      projectedInventoryItems = setInventoryItemOnHandQuantityById(
        projectedInventoryItems,
        projectedMoveResult.stackId,
        1
      );
    }

    if (wouldExceedInventoryObjectLimit(projectedInventoryItems)) {
      showInventoryObjectLimitNotice(getInventoryObjectCount(projectedInventoryItems));
      return;
    }

    let nextInventorySelection: SelectedInventoryInspectionState | null = null;

    updateEquipmentCharacter((currentCharacter) => {
      const baseCharacter = options.clearHands
        ? clearCharacterHandOccupants(currentCharacter)
        : currentCharacter;
      const moveResult = moveOneContainerContentItemOutByIndexWithResult(
        baseCharacter.inventoryItems,
        selectedInventoryInspection.containerStackId!,
        selectedInventoryInspection.contentIndex!
      );

      if (!moveResult.stackId || wouldExceedInventoryObjectLimit(moveResult.inventoryItems)) {
        return currentCharacter;
      }

      let nextCharacter = {
        ...baseCharacter,
        inventoryItems: options.onHand
          ? setInventoryItemOnHandQuantityById(moveResult.inventoryItems, moveResult.stackId, 1)
          : moveResult.inventoryItems
      };

      if (options.worn) {
        nextCharacter = setInventoryItemArmorWornState(nextCharacter, moveResult.stackId, true);
      }

      const movedStack = findInventoryItemStackById(
        nextCharacter.inventoryItems,
        moveResult.stackId
      );

      if (movedStack) {
        nextInventorySelection = {
          itemKey: movedStack.item.key || selectedInventoryInspection.itemKey,
          stackId: movedStack.id,
          initialItem: getEffectiveInventoryItemRecord(movedStack),
          source: "inventory"
        };
      }

      return nextCharacter;
    });

    if (nextInventorySelection) {
      setSelectedInventoryInspection(nextInventorySelection);
    }

    clearInventoryObjectLimitNotice();
  }

  const standardInventoryLeftFooterActions: EquipmentInventoryDrawerAction[] =
    selectedInventoryRecord
      ? [
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
            : []),
          ...(selectedInventoryAttunable
            ? [
                {
                  key: "attune",
                  label: `${
                    selectedInventoryAttuned ? "Unattune" : "Attune"
                  } ${inventoryAttunementLabel}`,
                  icon: Sparkles,
                  disabled: !selectedInventoryAttuned && isInventoryAttunementLimitReached,
                  onClick: toggleSelectedInventoryItemAttunement
                }
              ]
            : []),
          ...(selectedInventoryItemStoredSpellEntry
            ? [
                {
                  key: "open-spell",
                  label: "Open Spell",
                  icon: BookOpen,
                  onClick: openSelectedInventoryStoredSpell
                }
              ]
            : []),
          ...(selectedInventoryUseState
            ? [
                {
                  key: "charges",
                  kind: "charges" as const,
                  label: "Charges",
                  useDisabled: selectedInventoryUseState.remaining <= 0,
                  resetDisabled:
                    selectedInventoryUseState.remaining >= selectedInventoryUseState.total,
                  onUse: useSelectedInventoryItemCharge,
                  onReset: resetSelectedInventoryItemCharge
                }
              ]
            : []),
          ...(selectedInventoryInspection?.source !== "container" &&
          isExtractableEquipmentPackRecord(selectedInventoryRecord)
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
            : [])
        ]
      : [];
  const containerInventoryLeftFooterActions: EquipmentInventoryDrawerAction[] =
    selectedInventoryOwnedContainer && selectedInventoryStack
      ? [
          {
            key: "manage-container",
            label: "Manage",
            icon: Package,
            onClick: openSelectedContainerManagement
          },
          ...standardInventoryLeftFooterActions.filter((action) => action.key === "attune")
        ]
      : [];
  const inventoryLeftFooterActions: EquipmentInventoryDrawerAction[] =
    selectedInventoryOwnedContainer && selectedInventoryStack
      ? containerInventoryLeftFooterActions
      : selectedInventoryIsContainer
        ? []
        : standardInventoryLeftFooterActions;
  const inventoryRightFooterActions: EquipmentInventoryDrawerAction[] = selectedInventoryInspection
    ? [
        ...(!selectedInventoryOwnedContainer && !selectedInventoryHasMods
          ? [
              {
                key: "buy",
                label: "Buy",
                icon: TicketPlus,
                tone: "positive" as const,
                disabled:
                  selectedInventoryIsInventoryConjuredStack ||
                  selectedInventoryAddBlockedByLimit ||
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
              }
            ]
          : []),
        ...(!selectedInventoryIsContainer || selectedInventoryOwnedContainer
          ? [
              {
                key: "sell",
                label: "Sell",
                icon: TicketMinus,
                tone: "negative" as const,
                disabled:
                  selectedInventoryIsConjured ||
                  !selectedInventoryRecord ||
                  selectedInventoryCount <= 0 ||
                  !selectedInventorySaleCost ||
                  selectedInventorySaleCost.amount <= 0,
                onClick: () => {
                  if (!selectedInventoryRecord) {
                    return;
                  }

                  if (selectedInventoryOwnedContainer) {
                    queueContainerRemoval("sell", selectedInventoryRecord);
                    return;
                  }

                  sellInventoryItemCopy(selectedInventoryRecord);
                }
              }
            ]
          : []),
        ...(!selectedInventoryOwnedContainer && !selectedInventoryHasMods
          ? [
              {
                key: "add",
                label: "Add",
                icon: Plus,
                tone: "neutral" as const,
                disabled:
                  selectedInventoryIsInventoryConjuredStack ||
                  selectedInventoryAddBlockedByLimit ||
                  !selectedInventoryRecord,
                onClick: () => {
                  if (selectedInventoryRecord) {
                    addInventoryItemCopy(selectedInventoryRecord);
                  }
                }
              }
            ]
          : []),
        ...(!selectedInventoryIsContainer || selectedInventoryOwnedContainer
          ? [
              {
                key: "remove",
                label: "Remove",
                icon: Minus,
                tone: "neutral" as const,
                disabled: !selectedInventoryInspection.itemKey || selectedInventoryCount <= 0,
                onClick: () => {
                  if (!selectedInventoryInspection.itemKey) {
                    return;
                  }

                  if (selectedInventoryOwnedContainer && selectedInventoryRecord) {
                    queueContainerRemoval("remove", selectedInventoryRecord);
                    return;
                  }

                  removeInventoryItemCopy(selectedInventoryInspection.itemKey);
                }
              }
            ]
          : [])
      ]
    : [];
  const inventoryDrawerFooter = selectedInventoryInspection ? (
    <EquipmentInventoryItemDrawerFooter
      leftActions={inventoryLeftFooterActions}
      notice={inventoryDrawerNotice ?? selectedInventoryAddBlockNotice}
      rightActions={inventoryRightFooterActions}
      ownedCount={selectedInventoryCount}
    />
  ) : null;
  const inventoryDrawerTitleId = parentInventoryInspection
    ? "equipment-contained-item-drawer-title"
    : "equipment-item-drawer-title";
  const inventoryDrawerClassName = restoreParentInventoryWithoutAnimation
    ? styles.equipmentParentInspectionDrawer
    : undefined;
  const inventoryDrawerHeaderContent = selectedInventoryRecord ? (
    <EquipmentInventoryItemDrawerHeader
      titleId={inventoryDrawerTitleId}
      item={selectedInventoryRecord}
      onHandCount={selectedInventoryOnHandCount}
      worn={isSelectedInventoryArmorWorn}
      attuned={selectedInventoryAttuned}
      chargesLabel={selectedInventoryChargesTagLabel}
      spellTag={selectedInventoryStoredSpellHeaderTag}
      featureTags={selectedInventoryFeatureTagLabels}
      modded={Boolean(selectedInventoryIsModded)}
    />
  ) : undefined;
  const inventoryDrawerHeaderAction =
    selectedInventoryInspection?.source === "inventory" && selectedInventoryStack ? (
      <button
        type="button"
        className={clsx(shared.editButton, styles.inventoryModsButton)}
        onClick={() => openInventoryItemModsEditor(selectedInventoryStack.id)}
      >
        <Settings size={16} aria-hidden="true" />
        <span>Mods</span>
      </button>
    ) : null;
  const parentInventoryStack =
    parentInventoryInspection?.source === "inventory" && parentInventoryInspection.stackId
      ? findInventoryItemStackById(
          equipmentCharacter.inventoryItems,
          parentInventoryInspection.stackId
        )
      : null;
  const parentInventoryRecord = parentInventoryStack
    ? getEffectiveInventoryItemRecord(parentInventoryStack)
    : null;
  const parentInventoryDrawerTitleId = "equipment-parent-container-drawer-title";
  const parentInventoryDrawerHeaderContent = parentInventoryRecord ? (
    <EquipmentInventoryItemDrawerHeader
      titleId={parentInventoryDrawerTitleId}
      item={parentInventoryRecord}
      spellTag={getInventoryItemStoredSpellHeaderTagLabel(parentInventoryStack)}
      featureTags={[
        ...getInventoryItemFeatureTagLabels(parentInventoryStack, {
          includeSpellcastingFocusSource: true
        }),
        ...getArcaneArmorFeatureTagsForInventoryStack(parentInventoryStack, parentInventoryRecord, {
          includeModel: true
        })
      ]}
      modded={Boolean(
        parentInventoryStack &&
        hasCharacterItemMods(parentInventoryStack.mods) &&
        !parentInventoryStack.mods?.isCustom
      )}
    />
  ) : undefined;
  const parentInventoryDrawerBodyAfterItem = parentInventoryStack ? (
    <EquipmentContainerContentsList
      containerStackId={parentInventoryStack.id}
      contents={getInventoryContainerContents(parentInventoryStack)}
      contentsWeightLimit={getInventoryContainerContentsWeightLimit(parentInventoryStack)}
      onSelectContent={(contentIndex) =>
        openInventoryInspectionFromContainerContent(parentInventoryStack.id, contentIndex)
      }
    />
  ) : null;
  const inventoryDrawerBodyAfterItem =
    selectedInventoryOwnedContainer && selectedInventoryStack ? (
      <EquipmentContainerContentsList
        containerStackId={selectedInventoryStack.id}
        contents={getInventoryContainerContents(selectedInventoryStack)}
        contentsWeightLimit={getInventoryContainerContentsWeightLimit(selectedInventoryStack)}
        onSelectContent={(contentIndex) =>
          openInventoryInspectionFromContainerContent(selectedInventoryStack.id, contentIndex)
        }
      />
    ) : null;
  const currencyPillSummary = (
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
            {formatCurrencyPillAmount(normalizedCurrencies[currency.key])}
          </span>
          <span className={styles.currencyPillTokenCode}>{currency.code}</span>
        </span>
      ))}
    </span>
  );
  const loadoutDrawerBackdropHandlers = useExplicitBackdropClick(closeLoadoutDrawer);
  const deleteCustomEquipmentBackdropHandlers = useExplicitBackdropClick(() =>
    setPendingDeleteCustomEquipmentId(null)
  );

  return (
    <>
      {renderEquipmentForm({
    ActionButton,
    CellContainer,
    CircleHelp,
    CurrencyInlineDisplay,
    CustomEquipmentEditor,
    DestructiveConfirmationModal,
    ENTRY_CATEGORIES,
    EquipmentContainerManageModal,
    EquipmentGuideModal,
    EquipmentInventoryItemDrawer,
    EquipmentItemBrowserModal,
    Hand,
    InlineToggleButton,
    InventoryTagPill,
    KeywordReferenceDrawer,
    Minus,
    NumberInput,
    OverlayBody,
    OverlayCloseButton,
    OverlayEyebrow,
    OverlayFooter,
    OverlayHeader,
    OverlayHeaderContent,
    OverlaySummary,
    OverlayTitle,
    Plus,
    RarityPill,
    SheetModal,
    Shield,
    WeaponMasteryStatusLabel,
    X,
    activeCurrencyDefinition,
    activeCurrencyKey,
    adjustCurrencyBalance,
    canSpendCurrency,
    carriedWeight,
    carryingCapacity,
    characterSheetSizeBytes: character.storageMetadata?.sheetSizeBytes,
    className,
    containerManagementInventoryItems: equipmentCharacter.inventoryItems,
    closeAddModal,
    closeCustomEquipmentModal,
    closeInventoryItemDrawer,
    closeLoadoutDrawer,
    clsx,
    currencyAmountDraft,
    currencyDefinitions,
    currencyPillSummary,
    customEditorMode,
    deleteCustomEquipment,
    editingInventoryStack,
    equipmentRenderGroups,
    formatCodexLabel,
    formatCodexList,
    formatEquipmentWeight,
    formatInventoryStackName,
    formatOnHandLabel,
    formatWeaponDamage,
    formatWeaponProperties,
    formatWeaponType,
    formatWeaponWeight,
    formatWeightValue,
    getArcaneArmorFeatureTagsForInventoryStack,
    getArmorTypeSummary,
    getInventoryRowObjectTagLabel,
    getItemObjectTagLabel,
    getInventoryItemConjuredRowTagLabel,
    getInventoryItemChargesTagLabel,
    getInventoryItemFeatureTagLabels,
    getInventoryItemStoredSpellRowTagLabel,
    getInventoryItemTotalWeightValue,
    getInventoryTagPillProps,
    groupedInventoryItems,
    hasCharacterItemMods,
    hasDisplayableRarity,
    inventoryDrawerBodyAfterItem,
    inventoryDrawerClassName,
    inventoryDrawerFooter,
    inventoryDrawerHeaderAction,
    inventoryDrawerHeaderContent,
    inventoryObjectCount,
    inventoryObjectLimitMessage,
    isAddModalCommitting,
    isAddModalOpen,
    isCurrencyDrawerOpen,
    isCustomEquipmentModalOpen,
    isEquipmentGuideOpen,
    isGeneralEquipmentExpanded,
    isHandEquippableEntry,
    isOverCarryingCapacity,
    isSelectedArmorWorn,
    isSelectedCustomEntry,
    isSelectedEntryOnHand,
    isSelectedFeatureManagedEntry,
    isSelectedShield,
    loadoutDrawerBackdropHandlers,
    managedContainerStack,
    managingContainerStackId,
    normalizeCurrencyAmountInput,
    normalizedCurrencies,
    openAddModal,
    openCurrencyModal,
    openCustomEquipmentCreator,
    openCustomEquipmentEditor,
    openInventoryInspectionFromBrowser,
    openInventoryInspectionFromLoadout,
    openLoadoutEntryDetails,
    openWeaponReference,
    parentInventoryDrawerBodyAfterItem,
    parentInventoryDrawerHeaderContent,
    parentInventoryDrawerTitleId,
    parentInventoryInspection,
    parentInventoryRecord,
    pendingDeleteCustomEquipment,
    deleteCustomEquipmentBackdropHandlers,
    pendingContainerInventoryRemoval,
    closeContainerManagement,
    confirmContainerRemoval,
    removeEquipmentItem,
    saveCustomEquipment,
    saveContainerManagement,
    selectedAdditionalWeaponMasteries,
    selectedInventoryInspection,
    inventoryDrawerTitleId,
    selectedInventoryItemStatus,
    selectedInventoryAdditionalDescription,
    selectedInventoryDescriptionAdditions,
    selectedInventoryModEffects,
    selectedInventoryRecord,
    selectedInventoryWeaponHasActiveMastery,
    selectedInventoryWeaponHasProficiency,
    selectedLoadoutEntry,
    selectedLoadoutEntryData,
    selectedLoadoutItems,
    selectedLoadoutSummary,
    selectedWeaponHasActiveMastery,
    selectedWeaponHasProficiency,
    selectedWeaponMasteryKeywords,
    selectedWeaponMasteryLabel,
    selectedWeaponReference,
    setActiveCurrencyKey,
    setCurrencyAmountDraft,
    setIsEquipmentGuideOpen,
    setIsCurrencyDrawerOpen,
    setIsGeneralEquipmentExpanded,
    setPendingContainerInventoryRemoval,
    setPendingDeleteCustomEquipmentId,
    setSelectedWeaponReference,
    shared,
    SheetSurface,
    sheetStyles,
    shouldOfferHandSwap,
    styles,
    swapEntryToHand,
    toggleArmorWorn,
    toggleEntryOnHand
  })}

      <EquipmentStoredSpellDrawer
        character={equipmentCharacter}
        selectedStoredSpell={selectedInventoryStoredSpell}
        onClose={() => setSelectedInventoryStoredSpell(null)}
        onPersistCharacter={onPersistCharacter}
        persistOptions={equipmentPersistOptions}
      />
    </>
  );
}

export default EquipmentForm;
