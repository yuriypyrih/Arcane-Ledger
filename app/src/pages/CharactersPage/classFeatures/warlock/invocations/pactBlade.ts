import {
  ELDRITCH_INVOCATION,
  WEAPON_COMBAT_TYPE,
  type EldritchInvocationEntry,
  type WEAPON_BASE
} from "../../../../../codex/entries";
import { getWeaponEntries } from "../../../../../codex/selectors";
import type { Character } from "../../../../../types";
import { getOfficial2024BackendItemKeyForWeaponBase } from "../../../../../utils/items/weaponBaseItemKeys";
import { createSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import type { WeaponAction } from "../../../gameplay";
import {
  findInventoryItemStackById,
  getInventoryItemStackIdFromCopyId,
  isConjuredInventoryItem,
  isPactOfTheBladeInventoryItem
} from "../../../inventoryItems";
import { getEffectiveInventoryItemRecord } from "../../../itemMods";
import type { WeaponAttackConsumptionContext } from "../../types";
import type { WarlockEldritchInvocationOption } from "../warlock";
import { appendInvocationSourcedDescriptionAddition } from "./descriptions";
import {
  createWarlockInvocationSelectionId,
  parseWarlockInvocationSelectionId
} from "./selectionIds";

const pactBladeOwnedSelectionPrefix = "owned:";
const pactBladeConjuredSelectionPrefix = "conjured:";

export const pactOfTheBladeDamageTypeLabel = "Necrotic/Psychic/Radiant";

const pactOfTheBladeAttackDamageDescription =
  "Whenever you attack with the bonded weapon, you can use your Charisma modifier for the attack and damage rolls instead of using Strength or Dexterity, and you can cause the weapon to deal Necrotic, Psychic, or Radiant damage or its normal damage type.";

type WarlockPactBladeCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "inventoryItems">>;

type WarlockPactBladeInvocationOptionsParams = {
  invocation: EldritchInvocationEntry;
  selectedIds: string[];
  requirementLabel: string;
  isQualified: boolean;
  inventoryItems?: Character["inventoryItems"];
};

export function getPactBladeOwnedSelectionValue(stackId: string): string {
  return `${pactBladeOwnedSelectionPrefix}${getInventoryItemStackIdFromCopyId(stackId)}`;
}

export function getPactBladeConjuredSelectionValue(baseWeapon: string): string {
  return `${pactBladeConjuredSelectionPrefix}${baseWeapon}`;
}

export function getPactBladeOwnedStackIdFromChoice(choiceValue: string | null): string | null {
  if (!choiceValue?.startsWith(pactBladeOwnedSelectionPrefix)) {
    return null;
  }

  const stackId = choiceValue.slice(pactBladeOwnedSelectionPrefix.length).trim();
  return stackId.length > 0 ? stackId : null;
}

export function getPactBladeConjuredBaseWeaponFromChoice(
  choiceValue: string | null
): string | null {
  if (!choiceValue?.startsWith(pactBladeConjuredSelectionPrefix)) {
    return null;
  }

  const baseWeapon = choiceValue.slice(pactBladeConjuredSelectionPrefix.length).trim();
  return baseWeapon.length > 0 ? baseWeapon : null;
}

export function getWarlockPactBladeConjuredWeaponOptions() {
  return getWeaponEntries()
    .filter(
      (
        weapon
      ): weapon is ReturnType<typeof getWeaponEntries>[number] & { baseWeapon: WEAPON_BASE } =>
        Boolean(weapon.baseWeapon) &&
        weapon.type.combat === WEAPON_COMBAT_TYPE.MELEE &&
        getOfficial2024BackendItemKeyForWeaponBase(weapon.baseWeapon) !== null
    )
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getSelectedPactBladeSelection(
  selectionIds: string[]
): { kind: "owned"; stackId: string } | { kind: "conjured"; baseWeapon: string } | null {
  const parsedSelection = selectionIds
    .map(parseWarlockInvocationSelectionId)
    .find((selection) => selection.invocationId === ELDRITCH_INVOCATION.PACT_OF_THE_BLADE);

  if (!parsedSelection) {
    return null;
  }

  const ownedStackId = getPactBladeOwnedStackIdFromChoice(parsedSelection.choiceValue);

  if (ownedStackId) {
    return {
      kind: "owned",
      stackId: ownedStackId
    };
  }

  const conjuredBaseWeapon = getPactBladeConjuredBaseWeaponFromChoice(parsedSelection.choiceValue);

  return conjuredBaseWeapon
    ? {
        kind: "conjured",
        baseWeapon: conjuredBaseWeapon
      }
    : null;
}

export function getWarlockPactBladeAdditionalAttackCountFromInvocationIds(
  selectedInvocationIds: ReadonlySet<ELDRITCH_INVOCATION>
): number {
  if (!selectedInvocationIds.has(ELDRITCH_INVOCATION.PACT_OF_THE_BLADE)) {
    return 0;
  }

  if (selectedInvocationIds.has(ELDRITCH_INVOCATION.DEVOURING_BLADE)) {
    return 2;
  }

  return selectedInvocationIds.has(ELDRITCH_INVOCATION.THIRSTING_BLADE) ? 1 : 0;
}

export function getWarlockPactBladeInvocationOptions({
  invocation,
  selectedIds,
  requirementLabel,
  isQualified,
  inventoryItems = []
}: WarlockPactBladeInvocationOptionsParams): WarlockEldritchInvocationOption[] {
  const ownedWeaponOptions = inventoryItems
    .map((entry) => ({
      entry,
      item: getEffectiveInventoryItemRecord(entry)
    }))
    .filter(({ entry, item }) => Boolean(item.weapon) && !isConjuredInventoryItem(entry))
    .slice()
    .sort((left, right) =>
      (left.item.name ?? left.item.key ?? "").localeCompare(
        right.item.name ?? right.item.key ?? ""
      )
    )
    .map(({ entry, item }) => ({
      selectionId: createWarlockInvocationSelectionId(
        invocation.id,
        getPactBladeOwnedSelectionValue(entry.id)
      ),
      invocation,
      displayName: invocation.name,
      displaySubtitle: `Owned: ${item.name ?? item.key ?? "Weapon"}`,
      selectionGroup: "Owned weapons",
      requirementLabel,
      isQualified,
      isPlaceholder: false
    }));
  const conjuredWeaponOptions = getWarlockPactBladeConjuredWeaponOptions().map((weapon) => ({
    selectionId: createWarlockInvocationSelectionId(
      invocation.id,
      getPactBladeConjuredSelectionValue(weapon.baseWeapon)
    ),
    invocation,
    displayName: invocation.name,
    displaySubtitle: `Conjure: ${weapon.name}`,
    selectionGroup: "Conjured base weapons",
    requirementLabel,
    isQualified,
    isPlaceholder: false
  }));
  const availableSelectionIds = new Set(
    [...ownedWeaponOptions, ...conjuredWeaponOptions].map((option) => option.selectionId)
  );
  const missingSelectedWeaponOptions = selectedIds.flatMap((selectionId) => {
    const { invocationId, choiceValue } = parseWarlockInvocationSelectionId(selectionId);

    if (
      invocationId !== ELDRITCH_INVOCATION.PACT_OF_THE_BLADE ||
      availableSelectionIds.has(selectionId) ||
      (!getPactBladeOwnedStackIdFromChoice(choiceValue) &&
        !getPactBladeConjuredBaseWeaponFromChoice(choiceValue))
    ) {
      return [];
    }

    return [
      {
        selectionId,
        invocation,
        displayName: invocation.name,
        displaySubtitle: "Missing pact weapon",
        selectionGroup: "Missing saved choices",
        requirementLabel,
        isQualified,
        isPlaceholder: false
      }
    ];
  });

  return [...ownedWeaponOptions, ...conjuredWeaponOptions, ...missingSelectedWeaponOptions];
}

function getWeaponActionPactBladeInventoryStack(
  character: WarlockPactBladeCharacter,
  action: WeaponAction
) {
  const stackId =
    action.inventoryStackId ??
    (action.key.startsWith("inventory-") ? action.key.replace(/^inventory-/, "") : null);

  return stackId ? findInventoryItemStackById(character.inventoryItems ?? [], stackId) : null;
}

export function isWarlockPactBladeWeaponAction(
  character: WarlockPactBladeCharacter,
  action: WeaponAction,
  selectedInvocationIds: ReadonlySet<ELDRITCH_INVOCATION>
): boolean {
  if (
    action.attackKind !== "weapon" ||
    !selectedInvocationIds.has(ELDRITCH_INVOCATION.PACT_OF_THE_BLADE)
  ) {
    return false;
  }

  if ((action.inventoryFeatureTags ?? []).includes("pact-of-the-blade")) {
    return true;
  }

  return isPactOfTheBladeInventoryItem(getWeaponActionPactBladeInventoryStack(character, action));
}

export function isWarlockPactBladeWeaponAttackContext(
  character: WarlockPactBladeCharacter,
  action: WeaponAttackConsumptionContext,
  selectedInvocationIds: ReadonlySet<ELDRITCH_INVOCATION>
): boolean {
  if (
    action.attackKind !== "weapon" ||
    !selectedInvocationIds.has(ELDRITCH_INVOCATION.PACT_OF_THE_BLADE)
  ) {
    return false;
  }

  if ((action.inventoryFeatureTags ?? []).includes("pact-of-the-blade")) {
    return true;
  }

  return action.inventoryStackId
    ? isPactOfTheBladeInventoryItem(
        findInventoryItemStackById(character.inventoryItems ?? [], action.inventoryStackId)
      )
    : false;
}

function appendPactOfTheBladeDescription(action: WeaponAction): WeaponAction {
  const descriptionAddition = createSourcedDescriptionEntries("Pact of the Blade", [
    pactOfTheBladeAttackDamageDescription
  ]);
  const hasExistingDescription = (action.descriptionAdditions ?? []).some((section) =>
    section.some(
      (entry) =>
        typeof entry === "string" &&
        entry.includes("Pact of the Blade") &&
        entry.includes("Charisma modifier")
    )
  );

  return hasExistingDescription
    ? action
    : {
        ...action,
        descriptionAdditions: [...(action.descriptionAdditions ?? []), descriptionAddition]
      };
}

export function appendWarlockPactBladeWeaponDescriptionAdditions(
  action: WeaponAction,
  selectedInvocationIds: ReadonlySet<ELDRITCH_INVOCATION>
): WeaponAction {
  let nextAction = appendPactOfTheBladeDescription(action);

  if (selectedInvocationIds.has(ELDRITCH_INVOCATION.ELDRITCH_SMITE)) {
    nextAction = appendInvocationSourcedDescriptionAddition(
      nextAction,
      ELDRITCH_INVOCATION.ELDRITCH_SMITE,
      "Eldritch Smite",
      []
    );
  }

  const extraAttackInvocationId = selectedInvocationIds.has(ELDRITCH_INVOCATION.DEVOURING_BLADE)
    ? ELDRITCH_INVOCATION.DEVOURING_BLADE
    : selectedInvocationIds.has(ELDRITCH_INVOCATION.THIRSTING_BLADE)
      ? ELDRITCH_INVOCATION.THIRSTING_BLADE
      : null;

  if (extraAttackInvocationId !== null) {
    nextAction = appendInvocationSourcedDescriptionAddition(
      nextAction,
      extraAttackInvocationId,
      extraAttackInvocationId === ELDRITCH_INVOCATION.DEVOURING_BLADE
        ? "Devouring Blade"
        : "Thirsting Blade",
      []
    );
  }

  if (selectedInvocationIds.has(ELDRITCH_INVOCATION.LIFEDRINKER)) {
    nextAction = appendInvocationSourcedDescriptionAddition(
      nextAction,
      ELDRITCH_INVOCATION.LIFEDRINKER,
      "Lifedrinker",
      []
    );
  }

  return nextAction;
}

export function replaceBaseWeaponDamageType(damageLabel: string, damageTypeLabel: string): string {
  const [baseDamageLabel, ...bonusLabels] = damageLabel.split(" + ");
  const nextBaseDamageLabel = (baseDamageLabel ?? damageLabel).replace(
    /\s+[A-Za-z]+(?:\/[A-Za-z]+)*$/,
    ` ${damageTypeLabel}`
  );

  return [nextBaseDamageLabel, ...bonusLabels].join(" + ");
}

export function getWarlockPactOfTheBladeConjuredItemKeyFromSelectionIds(
  selectionIds: string[]
): string | null {
  const pactBladeSelection = getSelectedPactBladeSelection(selectionIds);

  if (pactBladeSelection?.kind !== "conjured") {
    return null;
  }

  return getOfficial2024BackendItemKeyForWeaponBase(pactBladeSelection.baseWeapon as WEAPON_BASE);
}
