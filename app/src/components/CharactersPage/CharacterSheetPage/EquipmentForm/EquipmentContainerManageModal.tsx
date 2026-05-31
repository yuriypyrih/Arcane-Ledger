import clsx from "clsx";
import { MoveLeft, MoveRight, Package, Save } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import ActionButton from "../../../ActionButton";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import type { CharacterContainerContentItem, CharacterInventoryItem } from "../../../../types";
import {
  BAG_OF_HOLDING_WEIGHT_LIMIT_LB,
  CONTAINER_OBJECT_LIMIT,
  findInventoryItemStackById,
  getContainerContentsWeightValue,
  getInventoryContainerContentsWeightLimit,
  getInventoryContainerContents,
  getInventoryItemCopyIntoContainerBlockReason,
  getInventoryItemTotalWeightValue,
  groupCharacterInventoryItems,
  isInventoryContainerItem,
  moveOneContainerContentItemOutByIndex,
  moveOneInventoryItemCopyIntoContainerById,
  type InventoryContainerAddBlockReason,
  type GroupedInventoryItem
} from "../../../../pages/CharactersPage/inventoryItems";
import { formatEquipmentWeight } from "../../../../utils/codex";
import { formatInventoryStackName } from "./equipmentLoadoutModel";
import styles from "./EquipmentContainerManageModal.module.css";

type EquipmentContainerManageModalProps = {
  containerStackId: string;
  inventoryItems: CharacterInventoryItem[];
  backdropClassName?: string;
  onCancel: () => void;
  onSave: (inventoryItems: CharacterInventoryItem[]) => void;
};

function formatWeight(weight: number): string {
  return formatEquipmentWeight(Math.round(weight * 100) / 100);
}

function formatWeightProgress(weight: number, weightLimit: number): string {
  return `${Math.round(weight * 100) / 100}/${formatWeight(weightLimit)}`;
}

function getContentItemWeight(content: CharacterContainerContentItem): number {
  return getContainerContentsWeightValue([content]);
}

function getTransferBlockTitle(reason: InventoryContainerAddBlockReason | null): string | undefined {
  if (reason === "container") {
    return "Containers cannot be placed inside containers.";
  }

  if (reason === "object-limit") {
    return `Container object limit reached (${CONTAINER_OBJECT_LIMIT}).`;
  }

  if (reason === "weight-limit") {
    return `Bag of Holding capacity reached (${BAG_OF_HOLDING_WEIGHT_LIMIT_LB} lb).`;
  }

  return reason === "invalid" ? "This item cannot be moved into the container." : undefined;
}

function EquipmentContainerManageModal({
  backdropClassName,
  containerStackId,
  inventoryItems,
  onCancel,
  onSave
}: EquipmentContainerManageModalProps) {
  const [draftInventoryItems, setDraftInventoryItems] = useState(inventoryItems);
  const containerStack = findInventoryItemStackById(draftInventoryItems, containerStackId);
  const containerName = containerStack?.item.name?.trim() || "Container";
  const containerContents = useMemo(
    () => getInventoryContainerContents(containerStack),
    [containerStack]
  );
  const inventoryColumnItems = useMemo(
    () =>
      groupCharacterInventoryItems(
        draftInventoryItems.filter((entry) => entry.id !== containerStackId)
      ),
    [containerStackId, draftInventoryItems]
  );
  const inventoryWeight = useMemo(
    () =>
      draftInventoryItems
        .filter((entry) => entry.id !== containerStackId)
        .reduce((totalWeight, entry) => totalWeight + getInventoryItemTotalWeightValue(entry), 0),
    [containerStackId, draftInventoryItems]
  );
  const containerWeight = useMemo(
    () => getContainerContentsWeightValue(containerContents),
    [containerContents]
  );
  const containerWeightLimit = useMemo(
    () => getInventoryContainerContentsWeightLimit(containerStack),
    [containerStack]
  );

  function moveIntoContainer(item: GroupedInventoryItem) {
    if (
      getInventoryItemCopyIntoContainerBlockReason(
        draftInventoryItems,
        containerStackId,
        item.stackId
      ) !== null
    ) {
      return;
    }

    setDraftInventoryItems((currentInventoryItems) =>
      moveOneInventoryItemCopyIntoContainerById(
        currentInventoryItems,
        containerStackId,
        item.stackId
      )
    );
  }

  function moveOutOfContainer(index: number) {
    setDraftInventoryItems((currentInventoryItems) =>
      moveOneContainerContentItemOutByIndex(currentInventoryItems, containerStackId, index)
    );
  }

  return (
    <SheetModal
      titleId="equipment-container-manage-title"
      onClose={onCancel}
      size="large"
      backdropClassName={backdropClassName}
      panelClassName={styles.modal}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id="equipment-container-manage-title">{containerName}</OverlayTitle>
          <OverlaySummary>Move one item at a time between inventory and container.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close container management" onClick={onCancel} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <ContainerColumn
          title="Inventory"
          weight={inventoryWeight}
          emptyLabel="Inventory is empty."
        >
          {inventoryColumnItems.map((item) => {
            const blockReason = getInventoryItemCopyIntoContainerBlockReason(
              draftInventoryItems,
              containerStackId,
              item.stackId
            );
            const isContainer = blockReason === "container" || isInventoryContainerItem(item.stack);
            const isDisabled = blockReason !== null;

            return (
              <li key={item.stackId}>
                <button
                  type="button"
                  className={clsx(styles.itemButton, isDisabled && styles.itemButtonDisabled)}
                  onClick={() => moveIntoContainer(item)}
                  disabled={isDisabled}
                  title={getTransferBlockTitle(blockReason)}
                >
                  <span className={styles.itemText}>
                    <span className={styles.itemName}>{formatInventoryStackName(item)}</span>
                    <span className={styles.itemMeta}>
                      {formatWeight(getInventoryItemTotalWeightValue(item.stack))}
                    </span>
                  </span>
                  <span className={styles.itemAction}>
                    {isContainer ? (
                      <Package size={17} aria-hidden="true" />
                    ) : (
                      <MoveRight size={17} aria-hidden="true" />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ContainerColumn>

        <ContainerColumn
          title="Container"
          weight={containerWeight}
          weightLimit={containerWeightLimit}
          objectCount={containerContents.length}
          emptyLabel="Container is empty."
        >
          {containerContents.map((content, index) => (
            <li key={`${content.item.key ?? content.item.name ?? "item"}-${index}`}>
              <button
                type="button"
                className={styles.itemButton}
                onClick={() => moveOutOfContainer(index)}
              >
                <span className={styles.itemText}>
                  <span className={styles.itemName}>
                    {content.quantity > 1
                      ? `${content.quantity}x ${content.item.name ?? "Item"}`
                      : content.item.name ?? "Item"}
                  </span>
                  <span className={styles.itemMeta}>
                    {formatWeight(getContentItemWeight(content))}
                  </span>
                </span>
                <span className={styles.itemAction}>
                  <MoveLeft size={17} aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ContainerColumn>
      </OverlayBody>

      <OverlayFooter>
        <div className={styles.footerActions}>
          <ActionButton variant="OUTLINE" onClick={onCancel}>
            Cancel
          </ActionButton>
          <ActionButton
            icon={<Save size={16} aria-hidden="true" />}
            onClick={() => onSave(draftInventoryItems)}
          >
            Save
          </ActionButton>
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

function ContainerColumn({
  children,
  emptyLabel,
  objectCount,
  title,
  weight,
  weightLimit
}: {
  children: ReactNode;
  emptyLabel: string;
  objectCount?: number;
  title: string;
  weight: number;
  weightLimit?: number | null;
}) {
  const childArray = Array.isArray(children) ? children : [children];
  const hasItems = childArray.some(Boolean);

  return (
    <section className={styles.column}>
      <header className={styles.columnHeader}>
        <h4>{title}</h4>
        <div className={styles.columnHeaderMeta}>
          {objectCount !== undefined ? (
            <span
              className={clsx(
                styles.columnHeaderMetric,
                objectCount >= CONTAINER_OBJECT_LIMIT && styles.columnHeaderMetricLimit
              )}
            >
              {`${objectCount}/${CONTAINER_OBJECT_LIMIT}`}
            </span>
          ) : null}
          <span
            className={clsx(
              styles.columnHeaderMetric,
              weightLimit !== null &&
                weightLimit !== undefined &&
                weight >= weightLimit &&
                styles.columnHeaderMetricLimit
            )}
          >
            {weightLimit !== null && weightLimit !== undefined
              ? formatWeightProgress(weight, weightLimit)
              : formatWeight(weight)}
          </span>
        </div>
      </header>
      {hasItems ? <ul className={styles.itemList}>{children}</ul> : <p className={styles.emptyText}>{emptyLabel}</p>}
    </section>
  );
}

export default EquipmentContainerManageModal;
