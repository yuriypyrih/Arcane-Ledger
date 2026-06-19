import { useEffect, useState } from "react";
import { getSpellEntryById } from "../../../../codex/spells";
import type { Character } from "../../../../types";
import { ACTION_CATEGORY } from "../../../../pages/CharactersPage/actionEconomy";
import {
  normalizeRoundTracker,
  type RoundTrackerResource
} from "../../../../pages/CharactersPage/combat";
import { applySpellCastFeatureEffectsForCharacter } from "../../../../pages/CharactersPage/classFeatures";
import { applyFeatureSpellCastEffectsForCharacter } from "../../../../pages/CharactersPage/feats/runtime";
import {
  consumeSharedEconomyMultiForCharacterAction,
  createEconomyMultiContextForSpell
} from "../../../../pages/CharactersPage/classFeatures/economyMulti";
import {
  applySpellImplementationForCharacter,
  getSpellImplementationStatusOptionsForCharacter,
  type SpellImplementationCastSource,
  type SpellImplementationOptionValues
} from "../../../../pages/CharactersPage/characterRuntime/spellImplementations";
import {
  createInventoryItemFromContainerContent,
  findInventoryItemStackById,
  getInventoryContainerContents,
  getInventoryItemStoredSpell,
  getInventoryItemStoredSpellIds,
  getInventoryItemUseState,
  removeOneContainerContentItemByIndex,
  removeOneInventoryItemCopyById,
  useContainerContentItemChargeByIndex as spendContainerContentItemChargeByIndex,
  useInventoryItemChargeById as spendInventoryItemChargeById
} from "../../../../pages/CharactersPage/inventoryItems";
import { getEffectiveInventoryItemRecord } from "../../../../pages/CharactersPage/itemMods";
import { applySpellDurationToStatusEntries } from "../../../../pages/CharactersPage/statusEntries";
import type {
  PersistCharacterOptions,
  PersistCharacterUpdater
} from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import CharacterSpellDrawer from "../SpellCastingForm/CharacterSpellDrawer";
import { getSpellActionPathStates, getSpellActionPathWarning } from "../spellActionPaths";
import { consumeRoundTrackerResourceForCharacter } from "../GameplayForm/gameplayStateUtils";
import { getActionShapeForEconomyType } from "../GameplayForm/gameplayWidgetUtils";
import styles from "./EquipmentForm.module.css";

export type SelectedInventoryStoredSpellState = {
  spellId: string;
  source: "inventory" | "container";
  stackId?: string;
  containerStackId?: string;
  contentIndex?: number;
};

type EquipmentStoredSpellDrawerProps = {
  character: Character;
  selectedStoredSpell: SelectedInventoryStoredSpellState | null;
  onClose: () => void;
  onPersistCharacter: PersistCharacterUpdater;
  persistOptions: PersistCharacterOptions;
};

const emptySpellSlots: number[] = [];

function getInventoryStackForStoredSpellState(
  inventoryItems: Character["inventoryItems"],
  state: SelectedInventoryStoredSpellState | null
) {
  if (!state) {
    return null;
  }

  if (state.source === "container") {
    if (!state.containerStackId || state.contentIndex === undefined) {
      return null;
    }

    const containerStack = findInventoryItemStackById(inventoryItems, state.containerStackId);
    const content = getInventoryContainerContents(containerStack)[state.contentIndex] ?? null;

    return content
      ? createInventoryItemFromContainerContent(state.containerStackId, content, state.contentIndex)
      : null;
  }

  return state.stackId ? findInventoryItemStackById(inventoryItems, state.stackId) : null;
}

function spendStoredSpellItemCharges(
  inventoryItems: Character["inventoryItems"],
  state: SelectedInventoryStoredSpellState,
  chargeCost: number,
  destructible: boolean
): Character["inventoryItems"] {
  const nextInventoryItems =
    state.source === "container" && state.containerStackId && state.contentIndex !== undefined
      ? spendContainerContentItemChargeByIndex(
          inventoryItems,
          state.containerStackId,
          state.contentIndex,
          chargeCost
        )
      : state.stackId
        ? spendInventoryItemChargeById(inventoryItems, state.stackId, chargeCost)
        : inventoryItems;

  if (!destructible) {
    return nextInventoryItems;
  }

  const targetStack = getInventoryStackForStoredSpellState(nextInventoryItems, state);
  const targetUseState = getInventoryItemUseState(targetStack);

  if (!targetUseState || targetUseState.remaining > 0) {
    return nextInventoryItems;
  }

  return state.source === "container" && state.containerStackId && state.contentIndex !== undefined
    ? removeOneContainerContentItemByIndex(
        nextInventoryItems,
        state.containerStackId,
        state.contentIndex
      )
    : state.stackId
      ? removeOneInventoryItemCopyById(nextInventoryItems, state.stackId)
      : nextInventoryItems;
}

function EquipmentStoredSpellDrawer({
  character,
  selectedStoredSpell,
  onClose,
  onPersistCharacter,
  persistOptions
}: EquipmentStoredSpellDrawerProps) {
  const [selectedSpellSlotLevel, setSelectedSpellSlotLevel] = useState(1);
  const activeStack = getInventoryStackForStoredSpellState(
    character.inventoryItems,
    selectedStoredSpell
  );
  const activeStoredSpell = getInventoryItemStoredSpell(activeStack);
  const activeStoredSpellIds = getInventoryItemStoredSpellIds(activeStack);
  const activeSpellEntry =
    activeStoredSpell &&
    selectedStoredSpell &&
    activeStoredSpellIds.includes(selectedStoredSpell.spellId)
      ? getSpellEntryById(selectedStoredSpell.spellId)
      : null;
  const activeUseState = getInventoryItemUseState(activeStack);
  const consumesCharges = activeStoredSpell !== null && activeStoredSpell.mode !== "default";
  const chargeCost = Math.max(1, activeStoredSpell?.chargeCost ?? 1);
  const chargeWarning =
    consumesCharges && (!activeUseState || activeUseState.remaining < chargeCost)
      ? "Not enough item charges."
      : null;
  const actionPathStates = activeSpellEntry
    ? getSpellActionPathStates(character, activeSpellEntry, normalizeRoundTracker(character.roundTracker))
    : [];
  const actionWarning = chargeWarning ?? getSpellActionPathWarning(actionPathStates);
  const actionPaths = actionPathStates
    .map((path) => {
      const actionShape = getActionShapeForEconomyType(path.economyType);

      return actionShape
        ? {
            id: path.id,
            actionLabel: "Cast Spell",
            actionShape,
            actionShapeAvailable: path.shapeState.isAvailable,
            actionShapeMultiCount: path.shapeState.multiCount,
            disabledReason: chargeWarning ?? path.shapeState.disabledReason,
            roundTrackerResourceOverride: path.roundTrackerResource,
            spellImplementationCastSource: path.spellImplementationCastSource,
            forcedSpellImplementationOptions: path.forcedSpellImplementationOptions,
            spellCastEffectIds: path.spellCastEffectIds
          }
        : null;
    })
    .filter((path): path is NonNullable<typeof path> => path !== null);
  const itemName = activeStack
    ? (getEffectiveInventoryItemRecord(activeStack).name ?? "item")
    : "item";
  const availabilityText =
    consumesCharges && activeUseState
      ? `${activeUseState.remaining}/${activeUseState.total} charges available. Item spells can't be upcast.`
      : "Cast through this item without expending a spell slot. Item spells can't be upcast.";

  useEffect(() => {
    if (activeSpellEntry) {
      setSelectedSpellSlotLevel(Math.max(1, activeSpellEntry.spellLevel));
    }
  }, [activeSpellEntry]);

  useEffect(() => {
    if (selectedStoredSpell && !activeSpellEntry) {
      onClose();
    }
  }, [activeSpellEntry, onClose, selectedStoredSpell]);

  function castStoredSpell(options?: {
    roundTrackerResourceOverride?: RoundTrackerResource | null;
    spellCastEffectIds?: string[];
    spellActionPathId?: string | null;
    spellImplementationCastSource?: SpellImplementationCastSource;
    spellImplementationOptions?: SpellImplementationOptionValues;
  }) {
    if (!selectedStoredSpell || !activeSpellEntry) {
      return;
    }

    const spell = activeSpellEntry;
    const selectedActionPath =
      options?.roundTrackerResourceOverride !== undefined
        ? (actionPathStates.find(
            (path) => path.roundTrackerResource === options.roundTrackerResourceOverride
          ) ?? null)
        : (actionPathStates[0] ?? null);
    const roundTrackerResource =
      options?.roundTrackerResourceOverride ?? selectedActionPath?.roundTrackerResource ?? null;
    const sharedEconomyContext = selectedActionPath
      ? {
          economyType: selectedActionPath.economyType,
          actionCategory: ACTION_CATEGORY.MAGIC,
          spellLevel: spell.spellLevel
        }
      : createEconomyMultiContextForSpell(spell);

    onPersistCharacter((currentCharacter) => {
      const targetStack = getInventoryStackForStoredSpellState(
        currentCharacter.inventoryItems,
        selectedStoredSpell
      );
      const storedSpell = getInventoryItemStoredSpell(targetStack);
      const storedSpellIds = getInventoryItemStoredSpellIds(targetStack);

      if (!targetStack || !storedSpell || !storedSpellIds.includes(spell.id)) {
        return currentCharacter;
      }

      const shouldSpendCharges = storedSpell.mode !== "default";
      const storedSpellChargeCost = Math.max(1, storedSpell.chargeCost);
      const useState = getInventoryItemUseState(targetStack);

      if (shouldSpendCharges && (!useState || useState.remaining < storedSpellChargeCost)) {
        return currentCharacter;
      }

      const nextCharacterWithSpellImplementation = applySpellImplementationForCharacter({
        character: currentCharacter,
        spell,
        spellSlotLevel: spell.spellLevel > 0 ? spell.spellLevel : null,
        sourceSpellSlotLevel: null,
        castSource: options?.spellImplementationCastSource ?? "standard",
        options: options?.spellImplementationOptions ?? {}
      });
      const nextCharacterWithSpellDuration = {
        ...nextCharacterWithSpellImplementation,
        statusEntries: applySpellDurationToStatusEntries(
          nextCharacterWithSpellImplementation.statusEntries,
          spell,
          {
            ...getSpellImplementationStatusOptionsForCharacter({
              character: nextCharacterWithSpellImplementation,
              spell,
              spellSlotLevel: spell.spellLevel > 0 ? spell.spellLevel : null,
              sourceSpellSlotLevel: null,
              castSource: options?.spellImplementationCastSource ?? "standard",
              options: options?.spellImplementationOptions ?? {}
            }),
            sourceSpellSlotLevel: null
          }
        )
      };
      const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
        nextCharacterWithSpellDuration,
        spell
      );
      const nextCharacterWithFeatCastEffects = applyFeatureSpellCastEffectsForCharacter(
        nextCharacterWithSpellCastEffects,
        spell,
        options?.spellCastEffectIds,
        {
          spellSlotLevel: spell.spellLevel > 0 ? spell.spellLevel : null,
          castSource: options?.spellImplementationCastSource ?? "standard",
          options: options?.spellImplementationOptions ?? {},
          spellActionPathId: options?.spellActionPathId ?? null
        }
      );

      if (!nextCharacterWithFeatCastEffects) {
        return currentCharacter;
      }

      const nextCharacterWithSharedMulti = roundTrackerResource
        ? consumeSharedEconomyMultiForCharacterAction(
            nextCharacterWithFeatCastEffects,
            sharedEconomyContext
          )
        : nextCharacterWithFeatCastEffects;
      const nextCharacterWithEconomy =
        roundTrackerResource && nextCharacterWithSharedMulti === nextCharacterWithFeatCastEffects
          ? consumeRoundTrackerResourceForCharacter(
              nextCharacterWithSharedMulti,
              roundTrackerResource
            )
          : nextCharacterWithSharedMulti;
      const nextInventoryItems = shouldSpendCharges
        ? spendStoredSpellItemCharges(
            nextCharacterWithEconomy.inventoryItems,
            selectedStoredSpell,
            storedSpellChargeCost,
            storedSpell.mode === "consume-charges-destructible"
          )
        : nextCharacterWithEconomy.inventoryItems;

      return {
        ...nextCharacterWithEconomy,
        inventoryItems: nextInventoryItems
      };
    }, persistOptions);

    onClose();
  }

  return activeSpellEntry ? (
    <CharacterSpellDrawer
      character={character}
      spell={activeSpellEntry}
      mode="standard"
      spellSlotTotals={emptySpellSlots}
      spellSlotsRemaining={emptySpellSlots}
      selectedSpellSlotLevel={selectedSpellSlotLevel}
      onSelectedSpellSlotLevelChange={setSelectedSpellSlotLevel}
      onClose={onClose}
      onAction={castStoredSpell}
      actionLabel="Cast Spell"
      actionConsumesSpellSlot={false}
      minimumActionSpellSlotLevel={Math.max(1, activeSpellEntry.spellLevel)}
      actionContextText={`Using ${itemName}`}
      actionAvailabilityText={availabilityText}
      actionWarning={actionWarning}
      actionDisabled={chargeWarning !== null}
      actionPaths={actionPaths}
      backdropClassName={styles.equipmentStoredSpellBackdrop}
    />
  ) : null;
}

export default EquipmentStoredSpellDrawer;
