import { useMemo } from "react";
import { useItemEntry } from "../../../../pages/ItemCodexEntryPage/useItemEntry";
import {
  getInventoryItemFeatureTagLabels,
  type GroupedInventoryItem
} from "../../../../pages/CharactersPage/inventoryItems";
import { hasCharacterItemMods } from "../../../../pages/CharactersPage/itemMods";
import EquipmentInventoryItemDrawer from "./EquipmentInventoryItemDrawer";
import EquipmentInventoryItemDrawerHeader from "./EquipmentInventoryItemDrawerHeader";
import {
  getInventoryItemChargesTagLabel,
  getInventoryItemStoredSpellHeaderTagLabel
} from "./equipmentItemUtilityTags";

type MasterChestItemInspectionDrawerProps = {
  item: GroupedInventoryItem | null;
  onClose: () => void;
};

function MasterChestItemInspectionDrawer({
  item,
  onClose
}: MasterChestItemInspectionDrawerProps) {
  const itemKey = item?.item.key || item?.itemKey;
  const { item: selectedItem, status } = useItemEntry(itemKey, {
    enabled: Boolean(item),
    initialItem: item?.item ?? null
  });
  const featureTags = useMemo(
    () =>
      item
        ? getInventoryItemFeatureTagLabels(item.stack, {
            includeSpellcastingFocusSource: true
          })
        : [],
    [item]
  );

  if (!item) {
    return null;
  }

  const drawerItem = selectedItem ?? item.item;
  const stack = item.stack;
  const modded = Boolean(
    stack.mods && hasCharacterItemMods(stack.mods) && !stack.mods.isCustom
  );

  return (
    <EquipmentInventoryItemDrawer
      key={item.stackId}
      titleId="master-chest-item-drawer-title"
      item={drawerItem}
      status={status}
      onClose={onClose}
      headerContent={
        drawerItem ? (
          <EquipmentInventoryItemDrawerHeader
            titleId="master-chest-item-drawer-title"
            item={drawerItem}
            onHandCount={item.onHandCount}
            worn={item.worn}
            attuned={Boolean(stack.attuned)}
            chargesLabel={getInventoryItemChargesTagLabel(stack, { includeRecharge: true })}
            spellTag={getInventoryItemStoredSpellHeaderTagLabel(stack)}
            featureTags={featureTags}
            customTag={stack.customTag}
            modded={modded}
          />
        ) : undefined
      }
      modEffects={stack.mods?.effects ?? []}
    />
  );
}

export default MasterChestItemInspectionDrawer;
