import type { Character, CharacterInventoryItem } from "../../../../../types";
import {
  createInventoryItemFromContainerContent,
  getInventoryContainerContents,
  getInventoryItemChargesRecharge,
  getInventoryItemUseState,
  isInventoryContainerItem,
  resetContainerContentItemChargeByIndex,
  resetInventoryItemChargeById
} from "../../../../../pages/CharactersPage/inventoryItems";
import type { RestOption, RestType } from "./restOptionTypes";

type InventoryRechargeTarget =
  | {
      kind: "inventory";
      stackId: string;
      amount: number;
    }
  | {
      kind: "container-content";
      containerStackId: string;
      contentIndex: number;
      amount: number;
    };

function getRechargeAmount(entry: CharacterInventoryItem, restType: RestType): number {
  const recharge = getInventoryItemChargesRecharge(entry);

  if (!recharge) {
    return 0;
  }

  return restType === "short" ? recharge.shortRest : recharge.longRest;
}

function createInventoryRechargeTarget(
  entry: CharacterInventoryItem,
  restType: RestType
): InventoryRechargeTarget | null {
  const amount = getRechargeAmount(entry, restType);
  const useState = getInventoryItemUseState(entry);

  if (amount <= 0 || !useState) {
    return null;
  }

  return {
    kind: "inventory",
    stackId: entry.id,
    amount
  };
}

function applyInventoryRechargeTargets(
  character: Character,
  targets: InventoryRechargeTarget[]
): Character {
  const inventoryItems = targets.reduce((nextInventoryItems, target) => {
    if (target.kind === "inventory") {
      return resetInventoryItemChargeById(nextInventoryItems, target.stackId, target.amount);
    }

    return resetContainerContentItemChargeByIndex(
      nextInventoryItems,
      target.containerStackId,
      target.contentIndex,
      target.amount
    );
  }, character.inventoryItems);

  return {
    ...character,
    inventoryItems
  };
}

export function createInventoryRestRechargeOptions(
  character: Character,
  restType: RestType
): RestOption[] {
  const targets = character.inventoryItems.flatMap((entry) => {
    const entryTargets = [createInventoryRechargeTarget(entry, restType)].filter(
      (target): target is InventoryRechargeTarget => target !== null
    );

    if (!isInventoryContainerItem(entry)) {
      return entryTargets;
    }

    const contentTargets = getInventoryContainerContents(entry)
      .map((content, index): InventoryRechargeTarget | null => {
        const contentStack = createInventoryItemFromContainerContent(entry.id, content, index);
        const amount = getRechargeAmount(contentStack, restType);
        const useState = getInventoryItemUseState(contentStack);

        if (amount <= 0 || !useState) {
          return null;
        }

        return {
          kind: "container-content",
          containerStackId: entry.id,
          contentIndex: index,
          amount
        } satisfies InventoryRechargeTarget;
      })
      .filter((target): target is InventoryRechargeTarget => target !== null);

    return [...entryTargets, ...contentTargets];
  });

  if (targets.length === 0) {
    return [];
  }

  return [
    {
      id: `recharge-items-${restType}`,
      label: "Recharge Items",
      apply: (currentCharacter: Character) =>
        applyInventoryRechargeTargets(currentCharacter, targets)
    }
  ];
}
