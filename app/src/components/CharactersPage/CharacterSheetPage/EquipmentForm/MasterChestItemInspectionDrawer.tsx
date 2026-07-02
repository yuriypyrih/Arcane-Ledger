import { Minus, Plus, TicketMinus, TicketPlus } from "lucide-react";
import { useMemo } from "react";
import { useItemEntry } from "../../../../pages/ItemCodexEntryPage/useItemEntry";
import {
  getInventoryItemFeatureTagLabels,
  getItemTransactionCost
} from "../../../../pages/CharactersPage/inventoryItems";
import { hasCharacterItemMods } from "../../../../pages/CharactersPage/itemMods";
import type { CharacterCurrencies, CharacterInventoryItem, ItemRecord } from "../../../../types";
import EquipmentInventoryItemDrawer from "./EquipmentInventoryItemDrawer";
import EquipmentInventoryItemDrawerFooter, {
  type EquipmentInventoryDrawerAction
} from "./EquipmentInventoryItemDrawerFooter";
import EquipmentInventoryItemDrawerHeader from "./EquipmentInventoryItemDrawerHeader";
import {
  getInventoryItemChargesTagLabel,
  getInventoryItemStoredSpellHeaderTagLabel
} from "./equipmentItemUtilityTags";
import {
  canAddMasterChestInspectionItem,
  getMasterChestInspectionDisplayStack,
  getMasterChestInspectionEffectiveItem,
  getMasterChestInspectionInitialItem,
  getMasterChestInspectionItemCount,
  getMasterChestInspectionItemKey,
  type MasterChestItemInspection
} from "./masterChestEditing";

type MasterChestItemInspectionDrawerProps = {
  currencies?: CharacterCurrencies;
  editMode?: boolean;
  inspection: MasterChestItemInspection | null;
  inventoryItems: CharacterInventoryItem[];
  notice?: string | null;
  onAdd?: (inspection: MasterChestItemInspection, item: ItemRecord) => void;
  onBuy?: (inspection: MasterChestItemInspection, item: ItemRecord) => void;
  onClose: () => void;
  onRemove?: (inspection: MasterChestItemInspection, item: ItemRecord) => void;
  onSell?: (inspection: MasterChestItemInspection, item: ItemRecord) => void;
};

function MasterChestItemInspectionDrawer({
  currencies,
  editMode = false,
  inspection,
  inventoryItems,
  notice = null,
  onAdd,
  onBuy,
  onClose,
  onRemove,
  onSell
}: MasterChestItemInspectionDrawerProps) {
  const itemKey = getMasterChestInspectionItemKey(inspection);
  const initialItem =
    getMasterChestInspectionEffectiveItem(inventoryItems, inspection) ??
    getMasterChestInspectionInitialItem(inspection);
  const { item: selectedItem, status } = useItemEntry(itemKey, {
    enabled: Boolean(inspection),
    initialItem
  });
  const displayStack = getMasterChestInspectionDisplayStack(inventoryItems, inspection);
  const itemCount = getMasterChestInspectionItemCount(inventoryItems, inspection);
  const featureTags = useMemo(
    () =>
      displayStack
        ? getInventoryItemFeatureTagLabels(displayStack, {
            includeSpellcastingFocusSource: true
          })
        : [],
    [displayStack]
  );

  if (!inspection) {
    return null;
  }

  const drawerItem = selectedItem ?? initialItem;
  const stack = displayStack;
  const modded = Boolean(
    stack?.mods && hasCharacterItemMods(stack.mods) && !stack.mods.isCustom
  );
  const canAddItem = canAddMasterChestInspectionItem(inventoryItems, inspection, drawerItem);
  const buyCost = drawerItem ? getItemTransactionCost(drawerItem) : null;
  const saleCost = drawerItem
    ? getItemTransactionCost(drawerItem, {
        multiplier: 0.5,
        rounding: "floor"
      })
    : null;
  const footerActions: EquipmentInventoryDrawerAction[] =
    editMode && drawerItem
      ? [
          {
            key: "add",
            label: "Add",
            icon: Plus,
            tone: "neutral",
            disabled: !canAddItem,
            onClick: () => onAdd?.(inspection, drawerItem)
          },
          {
            key: "buy",
            label: "Buy",
            icon: TicketPlus,
            tone: "positive",
            disabled:
              !canAddItem ||
              !buyCost ||
              buyCost.amount <= 0 ||
              !currencies ||
              (currencies[buyCost.currencyKey] ?? 0) < buyCost.amount,
            onClick: () => onBuy?.(inspection, drawerItem)
          },
          {
            key: "sell",
            label: "Sell",
            icon: TicketMinus,
            tone: "negative",
            disabled: itemCount <= 0 || !saleCost || saleCost.amount <= 0,
            onClick: () => onSell?.(inspection, drawerItem)
          },
          {
            key: "remove",
            label: "Remove",
            icon: Minus,
            tone: "neutral",
            disabled: itemCount <= 0,
            onClick: () => onRemove?.(inspection, drawerItem)
          }
        ]
      : [];
  const footer =
    editMode && footerActions.length > 0 ? (
      <EquipmentInventoryItemDrawerFooter
        notice={notice}
        ownedCount={itemCount}
        rightActions={footerActions}
      />
    ) : null;

  return (
    <EquipmentInventoryItemDrawer
      key={`${inspection.source}-${inspection.source === "chest" ? inspection.stackId : itemKey}`}
      titleId="master-chest-item-drawer-title"
      item={drawerItem}
      status={status}
      onClose={onClose}
      footer={footer}
      headerContent={
        drawerItem ? (
          <EquipmentInventoryItemDrawerHeader
            titleId="master-chest-item-drawer-title"
            item={drawerItem}
            onHandCount={0}
            worn={false}
            attuned={Boolean(stack?.attuned)}
            chargesLabel={getInventoryItemChargesTagLabel(stack, { includeRecharge: true })}
            spellTag={getInventoryItemStoredSpellHeaderTagLabel(stack)}
            featureTags={featureTags}
            customTag={stack?.customTag}
            modded={modded}
          />
        ) : undefined
      }
      modEffects={stack?.mods?.effects ?? []}
    />
  );
}

export default MasterChestItemInspectionDrawer;
