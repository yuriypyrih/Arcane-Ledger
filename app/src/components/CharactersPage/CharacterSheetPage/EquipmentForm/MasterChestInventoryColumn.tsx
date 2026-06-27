import clsx from "clsx";
import { MoveLeft, MoveRight } from "lucide-react";
import { useMemo } from "react";
import {
  getInventoryItemTotalWeightValue,
  getInventoryObjectCount,
  getInventoryRootTransferBlockReason,
  groupCharacterInventoryItems,
  INVENTORY_OBJECT_LIMIT,
  isInventoryContainerItem,
  type GroupedInventoryItem
} from "../../../../pages/CharactersPage/inventoryItems";
import { formatEquipmentWeight } from "../../../../utils/codex";
import type { CharacterInventoryItem } from "../../../../types";
import { formatInventoryStackName } from "./equipmentLoadoutModel";
import { getMasterChestTransferBlockTitle } from "./masterChestInventoryUtils";
import containerStyles from "./EquipmentContainerManageModal.module.css";
import styles from "./MasterChestModal.module.css";

export type MasterChestInventoryColumnDirection = "deposit" | "withdraw" | "read-only";

type MasterChestInventoryColumnProps = {
  destinationInventoryItems: CharacterInventoryItem[];
  destinationName: string;
  direction: MasterChestInventoryColumnDirection;
  inventoryItems: CharacterInventoryItem[];
  onInspect: (item: GroupedInventoryItem) => void;
  onMove: (item: GroupedInventoryItem) => void;
  title: string;
};

function formatWeight(weight: number): string {
  return formatEquipmentWeight(Math.round(weight * 100) / 100);
}

function getInventoryWeight(inventoryItems: CharacterInventoryItem[]): number {
  return inventoryItems.reduce(
    (totalWeight, entry) => totalWeight + getInventoryItemTotalWeightValue(entry),
    0
  );
}

function MasterChestInventoryColumn({
  destinationInventoryItems,
  destinationName,
  direction,
  inventoryItems,
  onInspect,
  onMove,
  title
}: MasterChestInventoryColumnProps) {
  const groupedItems = useMemo(() => groupCharacterInventoryItems(inventoryItems), [inventoryItems]);
  const inventoryWeight = useMemo(() => getInventoryWeight(inventoryItems), [inventoryItems]);
  const objectCount = useMemo(() => getInventoryObjectCount(inventoryItems), [inventoryItems]);

  return (
    <section className={containerStyles.column}>
      <header className={containerStyles.columnHeader}>
        <h4>{title}</h4>
        <div className={containerStyles.columnHeaderMeta}>
          <span
            className={clsx(
              containerStyles.columnHeaderMetric,
              objectCount >= INVENTORY_OBJECT_LIMIT && containerStyles.columnHeaderMetricLimit
            )}
          >
            {`${objectCount}/${INVENTORY_OBJECT_LIMIT}`}
          </span>
          <span className={containerStyles.columnHeaderMetric}>{formatWeight(inventoryWeight)}</span>
        </div>
      </header>
      {groupedItems.length > 0 ? (
        <ul className={containerStyles.itemList}>
          {groupedItems.map((item) => (
            <MasterChestInventoryColumnItem
              key={item.stackId}
              destinationInventoryItems={destinationInventoryItems}
              destinationName={destinationName}
              direction={direction}
              inventoryItems={inventoryItems}
              item={item}
              onInspect={onInspect}
              onMove={onMove}
            />
          ))}
        </ul>
      ) : (
        <p className={containerStyles.emptyText}>{title} is empty.</p>
      )}
    </section>
  );
}

function MasterChestInventoryColumnItem({
  destinationInventoryItems,
  destinationName,
  direction,
  inventoryItems,
  item,
  onInspect,
  onMove
}: {
  destinationInventoryItems: CharacterInventoryItem[];
  destinationName: string;
  direction: MasterChestInventoryColumnDirection;
  inventoryItems: CharacterInventoryItem[];
  item: GroupedInventoryItem;
  onInspect: (item: GroupedInventoryItem) => void;
  onMove: (item: GroupedInventoryItem) => void;
}) {
  const isReadOnly = direction === "read-only";
  const blockReason = isReadOnly
    ? null
    : getInventoryRootTransferBlockReason(
        inventoryItems,
        destinationInventoryItems,
        item.stackId
      );
  const isDisabled = Boolean(blockReason);
  const isContainer = isInventoryContainerItem(item.stack);
  const icon =
    direction === "deposit" ? (
      <MoveRight size={17} aria-hidden="true" />
    ) : (
      <MoveLeft size={17} aria-hidden="true" />
    );
  const transferTitle = getMasterChestTransferBlockTitle(blockReason, destinationName);

  return (
    <li>
      <div className={clsx(containerStyles.itemButton, styles.itemCard)}>
        <button
          type="button"
          className={styles.itemInspectButton}
          onClick={() => onInspect(item)}
        >
          <span className={containerStyles.itemText}>
            <span className={containerStyles.itemName}>{formatInventoryStackName(item)}</span>
            <span className={containerStyles.itemMeta}>
              {isContainer ? "Container" : formatWeight(getInventoryItemTotalWeightValue(item.stack))}
            </span>
          </span>
        </button>
        {isReadOnly ? null : (
          <button
            type="button"
            className={clsx(
              styles.itemTransferThumb,
              isDisabled && styles.itemTransferThumbDisabled
            )}
            disabled={isDisabled}
            title={transferTitle}
            aria-label={`${direction === "deposit" ? "Deposit" : "Withdraw"} ${item.name}`}
            onClick={() => onMove(item)}
          >
            {icon}
          </button>
        )}
      </div>
    </li>
  );
}

export default MasterChestInventoryColumn;
