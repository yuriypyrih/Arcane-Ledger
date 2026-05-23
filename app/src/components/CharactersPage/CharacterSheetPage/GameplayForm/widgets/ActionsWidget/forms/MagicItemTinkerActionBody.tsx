import { useEffect, useMemo, useState } from "react";
import { type ActionShapeType } from "../../../../../../ActionShape";
import type { ActionConfirmationToastTrigger } from "../../../../actionConfirmationToast";
import { runWithActionConfirmationToastAsync } from "../../../../actionConfirmationToast";
import {
  artificerChargeMagicItemActionKey,
  artificerDrainMagicItemActionKey,
  artificerTransmuteMagicItemActionKey,
  getArtificerMagicItemTinkerAvailableSpellSlotOptions,
  getArtificerMagicItemTinkerChargeItemOptions,
  getArtificerMagicItemTinkerDrainItemOptions,
  getArtificerMagicItemTinkerTransmuteItemOptions,
  type MagicItemTinkerInventoryOption
} from "../../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import {
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../../../../../../pages/CharactersPage/spellcasting";
import type { Character, ItemRecord } from "../../../../../../../types";
import { ReplicateMagicItemPlanBrowser } from "./ReplicateMagicItemActionBody";
import styles from "./TinkersMagicActionBody.module.css";

export const chargeMagicItemActionFormId = "artificer-charge-magic-item-action-form";
export const drainMagicItemActionFormId = "artificer-drain-magic-item-action-form";

type MagicItemTinkerActionBodyProps = {
  actionKey: string;
  character: Character;
  knownPlanKeys: string[];
  isSubmitting: boolean;
  disabledReason: string | null;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  confirmationTrigger: ActionConfirmationToastTrigger;
  onChargeMagicItem: (stackId: string, spellSlotLevel: number) => Promise<void>;
  onDrainMagicItem: (stackId: string) => Promise<void>;
  onTransmuteMagicItem: (stackId: string, item: ItemRecord) => Promise<void>;
};

function getExpendedSpellSlots(character: Character): number[] {
  return normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    getSpellSlotTotalsForCharacter(character.className, character.level, character.subclassId)
  );
}

function hasExpendedSpellSlot(character: Character, spellSlotLevel: number): boolean {
  return (getExpendedSpellSlots(character)[spellSlotLevel - 1] ?? 0) > 0;
}

function MagicItemTinkerActionBody({
  actionKey,
  character,
  knownPlanKeys,
  isSubmitting,
  disabledReason,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  confirmationTrigger,
  onChargeMagicItem,
  onDrainMagicItem,
  onTransmuteMagicItem
}: MagicItemTinkerActionBodyProps) {
  if (actionKey === artificerChargeMagicItemActionKey) {
    return (
      <ChargeMagicItemActionBody
        character={character}
        disabledReason={disabledReason}
        confirmationTrigger={confirmationTrigger}
        onChargeMagicItem={onChargeMagicItem}
      />
    );
  }

  if (actionKey === artificerDrainMagicItemActionKey) {
    return (
      <DrainMagicItemActionBody
        character={character}
        disabledReason={disabledReason}
        confirmationTrigger={confirmationTrigger}
        onDrainMagicItem={onDrainMagicItem}
      />
    );
  }

  if (actionKey === artificerTransmuteMagicItemActionKey) {
    return (
      <TransmuteMagicItemActionBody
        character={character}
        knownPlanKeys={knownPlanKeys}
        isSubmitting={isSubmitting}
        disabledReason={disabledReason}
        actionShape={actionShape}
        actionShapeAvailable={actionShapeAvailable}
        actionShapeMultiCount={actionShapeMultiCount}
        onTransmuteMagicItem={onTransmuteMagicItem}
      />
    );
  }

  return null;
}

type MagicItemTinkerSharedBodyProps = {
  character: Character;
  disabledReason: string | null;
  confirmationTrigger: ActionConfirmationToastTrigger;
};

type ChargeMagicItemActionBodyProps = MagicItemTinkerSharedBodyProps & {
  onChargeMagicItem: (stackId: string, spellSlotLevel: number) => Promise<void>;
};

function ChargeMagicItemActionBody({
  character,
  disabledReason,
  confirmationTrigger,
  onChargeMagicItem
}: ChargeMagicItemActionBodyProps) {
  const itemOptions = useMemo(
    () => getArtificerMagicItemTinkerChargeItemOptions(character),
    [character]
  );
  const spellSlotOptions = useMemo(
    () => getArtificerMagicItemTinkerAvailableSpellSlotOptions(character),
    [character]
  );
  const [selectedStackId, setSelectedStackId] = useState("");
  const [selectedSpellSlotLevel, setSelectedSpellSlotLevel] = useState("");
  const selectedItem = itemOptions.find((option) => option.stackId === selectedStackId) ?? null;
  const selectedSpellSlot =
    spellSlotOptions.find((option) => String(option.level) === selectedSpellSlotLevel) ?? null;
  const selectedItemIsFull =
    selectedItem !== null && (selectedItem.usesRemaining ?? 0) >= (selectedItem.usesTotal ?? 0);
  const selectedSpellSlotIsSpent = selectedSpellSlot !== null && selectedSpellSlot.remaining <= 0;
  const formWarning = selectedItemIsFull
    ? "That item is already fully charged."
    : selectedSpellSlotIsSpent
      ? "That spell slot level has no slots remaining."
      : null;
  const canSubmit =
    disabledReason === null &&
    selectedItem !== null &&
    selectedSpellSlot !== null &&
    !selectedItemIsFull &&
    !selectedSpellSlotIsSpent;

  useEffect(() => {
    if (
      selectedStackId &&
      !itemOptions.some(
        (option) =>
          option.stackId === selectedStackId &&
          (option.usesRemaining ?? 0) < (option.usesTotal ?? 0)
      )
    ) {
      setSelectedStackId("");
    }
  }, [itemOptions, selectedStackId]);

  useEffect(() => {
    if (
      selectedSpellSlotLevel &&
      !spellSlotOptions.some((option) => String(option.level) === selectedSpellSlotLevel)
    ) {
      setSelectedSpellSlotLevel("");
    }
  }, [selectedSpellSlotLevel, spellSlotOptions]);

  return (
    <form
      id={chargeMagicItemActionFormId}
      className={styles.layout}
      onSubmit={(event) => {
        event.preventDefault();

        if (!canSubmit || !selectedItem || !selectedSpellSlot) {
          return;
        }

        void runWithActionConfirmationToastAsync(confirmationTrigger, () =>
          onChargeMagicItem(selectedItem.stackId, selectedSpellSlot.level)
        ).catch(() => undefined);
      }}
    >
      <div className={styles.magicItemTinkerControlGrid}>
        <MagicItemTinkerSelect
          label="Choose an existing conjured item"
          value={selectedStackId}
          placeholder="Choose an item"
          options={itemOptions}
          getOptionDisabled={(option) => (option.usesRemaining ?? 0) >= (option.usesTotal ?? 0)}
          onChange={setSelectedStackId}
        />
        <label className={styles.field}>
          <span>Spell Slot</span>
          <select
            className={styles.input}
            required
            value={selectedSpellSlotLevel}
            onChange={(event) => setSelectedSpellSlotLevel(event.target.value)}
          >
            <option value="">-</option>
            {spellSlotOptions.map((option) => (
              <option key={option.level} value={option.level} disabled={option.remaining <= 0}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {formWarning ? <p className={styles.warningCard}>{formWarning}</p> : null}
    </form>
  );
}

type DrainMagicItemActionBodyProps = MagicItemTinkerSharedBodyProps & {
  onDrainMagicItem: (stackId: string) => Promise<void>;
};

function DrainMagicItemActionBody({
  character,
  disabledReason,
  confirmationTrigger,
  onDrainMagicItem
}: DrainMagicItemActionBodyProps) {
  const itemOptions = useMemo(
    () => getArtificerMagicItemTinkerDrainItemOptions(character),
    [character]
  );
  const [selectedStackId, setSelectedStackId] = useState("");
  const selectedItem = itemOptions.find((option) => option.stackId === selectedStackId) ?? null;
  const selectedItemCanRestore =
    selectedItem?.spellSlotLevel !== undefined &&
    hasExpendedSpellSlot(character, selectedItem.spellSlotLevel);
  const formWarning =
    selectedItem && !selectedItemCanRestore
      ? `No expended level ${selectedItem.spellSlotLevel} spell slot to restore.`
      : null;
  const canSubmit = disabledReason === null && selectedItem !== null && selectedItemCanRestore;

  useEffect(() => {
    if (
      selectedStackId &&
      !itemOptions.some(
        (option) =>
          option.stackId === selectedStackId &&
          option.spellSlotLevel !== undefined &&
          hasExpendedSpellSlot(character, option.spellSlotLevel)
      )
    ) {
      setSelectedStackId("");
    }
  }, [character, itemOptions, selectedStackId]);

  return (
    <form
      id={drainMagicItemActionFormId}
      className={styles.layout}
      onSubmit={(event) => {
        event.preventDefault();

        if (!canSubmit || !selectedItem) {
          return;
        }

        void runWithActionConfirmationToastAsync(confirmationTrigger, () =>
          onDrainMagicItem(selectedItem.stackId)
        ).catch(() => undefined);
      }}
    >
      <MagicItemTinkerSelect
        label="Choose an existing conjured item"
        value={selectedStackId}
        placeholder="Choose an item"
        options={itemOptions}
        getOptionDisabled={(option) =>
          option.spellSlotLevel === undefined ||
          !hasExpendedSpellSlot(character, option.spellSlotLevel)
        }
        onChange={setSelectedStackId}
      />

      {formWarning ? <p className={styles.warningCard}>{formWarning}</p> : null}
    </form>
  );
}

type TransmuteMagicItemActionBodyProps = {
  character: Character;
  knownPlanKeys: string[];
  isSubmitting: boolean;
  disabledReason: string | null;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  onTransmuteMagicItem: (stackId: string, item: ItemRecord) => Promise<void>;
};

function TransmuteMagicItemActionBody({
  character,
  knownPlanKeys,
  isSubmitting,
  disabledReason,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  onTransmuteMagicItem
}: TransmuteMagicItemActionBodyProps) {
  const itemOptions = useMemo(
    () => getArtificerMagicItemTinkerTransmuteItemOptions(character),
    [character]
  );
  const [selectedStackId, setSelectedStackId] = useState("");
  const selectedItem = itemOptions.find((option) => option.stackId === selectedStackId) ?? null;

  useEffect(() => {
    if (selectedStackId && !itemOptions.some((option) => option.stackId === selectedStackId)) {
      setSelectedStackId("");
    }
  }, [itemOptions, selectedStackId]);

  return (
    <div className={styles.layout}>
      <MagicItemTinkerSelect
        label="Choose an existing conjured item"
        value={selectedStackId}
        placeholder="Choose an item"
        options={itemOptions}
        onChange={setSelectedStackId}
      />

      <ReplicateMagicItemPlanBrowser
        knownPlanKeys={knownPlanKeys}
        isSubmitting={isSubmitting}
        disabledReason={disabledReason}
        actionShape={actionShape}
        actionShapeAvailable={actionShapeAvailable}
        actionShapeMultiCount={actionShapeMultiCount}
        onUseItem={(item) => {
          if (!selectedItem) {
            return Promise.resolve();
          }

          return onTransmuteMagicItem(selectedItem.stackId, item);
        }}
        heading="Transmute Magic Item Plans"
        useButtonLabel="Use Transmute Magic Item"
        tableDisabled={selectedItem === null}
        tableDisabledReason="Choose an existing Replicate Magic Item before selecting a new plan."
      />
    </div>
  );
}

type MagicItemTinkerSelectProps = {
  label: string;
  value: string;
  placeholder: string;
  options: MagicItemTinkerInventoryOption[];
  getOptionDisabled?: (option: MagicItemTinkerInventoryOption) => boolean;
  onChange: (value: string) => void;
};

function MagicItemTinkerSelect({
  label,
  value,
  placeholder,
  options,
  getOptionDisabled,
  onChange
}: MagicItemTinkerSelectProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select
        className={styles.input}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">-</option>
        {options.length <= 0 ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option
            key={option.stackId}
            value={option.stackId}
            disabled={getOptionDisabled?.(option) ?? false}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default MagicItemTinkerActionBody;
