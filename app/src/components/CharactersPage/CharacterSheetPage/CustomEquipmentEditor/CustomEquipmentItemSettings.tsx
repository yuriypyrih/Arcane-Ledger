import { useMemo } from "react";
import NumberInput from "../../FormInputs/NumberInput";
import SelectInput from "../../FormInputs/SelectInput";
import TextInput from "../../FormInputs/TextInput";
import { spellEntries } from "../../../../codex/spells";
import type { SpellEntry } from "../../../../codex/entries";
import type {
  CharacterInventoryConjuredDuration,
  CharacterInventoryConjuredSource,
  CharacterInventoryItem,
  CharacterInventoryStoredSpellMode
} from "../../../../types";
import {
  getInventoryItemConjuredSource,
  INVENTORY_CONJURED_DURATION_DEATH,
  INVENTORY_CONJURED_DURATION_LONG_REST,
  INVENTORY_CONJURED_DURATION_SHORT_REST,
  INVENTORY_CONJURED_SOURCE_ADVENTURERS_ATLAS,
  INVENTORY_CONJURED_SOURCE_EXPERIMENTAL_ELIXIR,
  INVENTORY_CONJURED_SOURCE_MANUAL,
  INVENTORY_CONJURED_SOURCE_PACT_OF_THE_BLADE,
  INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM,
  INVENTORY_CONJURED_SOURCE_TINKERS_MAGIC,
  INVENTORY_REFILLABLE_LIMIT,
  INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES,
  INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES_DESTRUCTIBLE,
  INVENTORY_STORED_SPELL_MODE_DEFAULT
} from "../../../../pages/CharactersPage/inventoryItems";
import { formatCodexList } from "../../../../utils/codex";
import RadioContainerOption from "../RadioContainerOption";
import {
  isChargeConsumingStoredSpellMode,
  isCustomEquipmentItemSettingsConjuredLocked,
  normalizeItemSettingPositiveInteger,
  type CustomEquipmentItemSettingsDraft
} from "./customEquipmentItemSettingsModel";
import styles from "./CustomEquipmentEditor.module.css";

type CustomEquipmentItemSettingsProps = {
  initialStack?: CharacterInventoryItem | null;
  draft: CustomEquipmentItemSettingsDraft;
  onChange: (patch: Partial<CustomEquipmentItemSettingsDraft>) => void;
};

const maxDropdownSpellOptions = 50;
const conjuredDurationOptions: Array<{
  value: CharacterInventoryConjuredDuration;
  label: string;
}> = [
  { value: INVENTORY_CONJURED_DURATION_DEATH, label: "On Death" },
  { value: INVENTORY_CONJURED_DURATION_SHORT_REST, label: "Until Short Rest" },
  { value: INVENTORY_CONJURED_DURATION_LONG_REST, label: "Until Long Rest" }
];
const conjuredSourceOptions: Array<{
  value: CharacterInventoryConjuredSource;
  label: string;
}> = [
  { value: INVENTORY_CONJURED_SOURCE_MANUAL, label: "Manual" },
  {
    value: INVENTORY_CONJURED_SOURCE_ADVENTURERS_ATLAS,
    label: "Cartographer: Adventurer's Atlas"
  },
  { value: INVENTORY_CONJURED_SOURCE_EXPERIMENTAL_ELIXIR, label: "Experimental Elixir" },
  { value: INVENTORY_CONJURED_SOURCE_TINKERS_MAGIC, label: "Tinker's Magic" },
  { value: INVENTORY_CONJURED_SOURCE_REPLICATE_MAGIC_ITEM, label: "Replicate Magic Item" },
  { value: INVENTORY_CONJURED_SOURCE_PACT_OF_THE_BLADE, label: "Pact of the Blade" }
];
const storedSpellModeOptions: Array<{
  value: CharacterInventoryStoredSpellMode;
  label: string;
}> = [
  { value: INVENTORY_STORED_SPELL_MODE_DEFAULT, label: "Default" },
  { value: INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES, label: "Consume Charges" },
  {
    value: INVENTORY_STORED_SPELL_MODE_CONSUME_CHARGES_DESTRUCTIBLE,
    label: "Consume Charges, Destructible"
  }
];

function matchesSpellSearch(spell: SpellEntry, searchText: string): boolean {
  const normalizedSearch = searchText.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  const searchableText = [
    spell.name,
    `level ${spell.spellLevel}`,
    spell.spellLevel === 0 ? "cantrip" : null,
    formatCodexList(spell.spellLists)
  ]
    .filter((entry): entry is string => Boolean(entry))
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedSearch);
}

function getLimitedSpellOptions(searchText: string, selectedSpellId: string): SpellEntry[] {
  const filteredOptions = spellEntries.filter((spell) => matchesSpellSearch(spell, searchText));
  const selectedSpell = selectedSpellId
    ? (spellEntries.find((spell) => spell.id === selectedSpellId) ?? null)
    : null;
  const limitedOptions = filteredOptions.slice(0, maxDropdownSpellOptions);

  if (selectedSpell && !limitedOptions.some((spell) => spell.id === selectedSpell.id)) {
    return [selectedSpell, ...limitedOptions].slice(0, maxDropdownSpellOptions);
  }

  return limitedOptions;
}

function CustomEquipmentItemSettings({
  initialStack,
  draft,
  onChange
}: CustomEquipmentItemSettingsProps) {
  const spellOptions = useMemo(
    () => getLimitedSpellOptions(draft.storedSpellSearch, draft.storedSpellId),
    [draft.storedSpellId, draft.storedSpellSearch]
  );
  const lockedConjured = isCustomEquipmentItemSettingsConjuredLocked(initialStack);
  const conjuredSource =
    getInventoryItemConjuredSource(initialStack) ?? INVENTORY_CONJURED_SOURCE_MANUAL;
  const storedSpellRequiresCharges = isChargeConsumingStoredSpellMode(draft.storedSpellMode);
  const chargesLocked = draft.storedSpellEnabled && storedSpellRequiresCharges;

  function setStoredSpellMode(mode: CharacterInventoryStoredSpellMode) {
    onChange({
      storedSpellMode: mode,
      ...(isChargeConsumingStoredSpellMode(mode)
        ? {
            chargesEnabled: true,
            chargesTotal: normalizeItemSettingPositiveInteger(draft.chargesTotal, 1),
            storedSpellChargeCost: normalizeItemSettingPositiveInteger(draft.storedSpellChargeCost, 1)
          }
        : {})
    });
  }

  return (
    <section className={styles.customEquipmentSection}>
      <div className={styles.customEquipmentSectionHeader}>
        <p className={styles.customEquipmentSectionTitle}>Additional Utility</p>
      </div>

      <div className={styles.customEquipmentSettingsStack}>
        <div className={styles.customEquipmentSettingsOption}>
          <RadioContainerOption
            header="Charges"
            subheader="Track a refillable item charge maximum."
            selected={draft.chargesEnabled}
            disabled={chargesLocked}
            onSelect={() => onChange({ chargesEnabled: !draft.chargesEnabled })}
            indicatorType="checkbox"
            className={styles.customEquipmentChoiceOption}
          />
          {draft.chargesEnabled ? (
            <div className={styles.customEquipmentSettingsFields}>
              <label className={styles.customEquipmentField}>
                <span>Maximum Charges</span>
                <NumberInput
                  min={1}
                  max={INVENTORY_REFILLABLE_LIMIT}
                  value={draft.chargesTotal}
                  onChange={(event) =>
                    onChange({
                      chargesTotal: normalizeItemSettingPositiveInteger(
                        event.target.valueAsNumber,
                        draft.chargesTotal
                      )
                    })
                  }
                />
              </label>
            </div>
          ) : null}
        </div>

        <div className={styles.customEquipmentSettingsOption}>
          <RadioContainerOption
            header="Conjured"
            subheader={
              lockedConjured ? "Managed by a class feature." : "Mark this item as conjured."
            }
            selected={draft.conjuredEnabled || lockedConjured}
            disabled={lockedConjured}
            onSelect={() => onChange({ conjuredEnabled: !draft.conjuredEnabled })}
            indicatorType="checkbox"
            className={styles.customEquipmentChoiceOption}
          />
          {draft.conjuredEnabled || lockedConjured ? (
            <div className={styles.customEquipmentSettingsFields}>
              <div className={styles.customEquipmentFormGrid}>
                <label className={styles.customEquipmentField}>
                  <span>Source</span>
                  <SelectInput
                    value={lockedConjured ? conjuredSource : INVENTORY_CONJURED_SOURCE_MANUAL}
                    disabled
                  >
                    {conjuredSourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </label>
                <label className={styles.customEquipmentField}>
                  <span>Vanishes</span>
                  <SelectInput
                    value={draft.conjuredDuration}
                    disabled={lockedConjured}
                    onChange={(event) =>
                      onChange({
                        conjuredDuration: event.target.value as CharacterInventoryConjuredDuration
                      })
                    }
                  >
                    {conjuredDurationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </label>
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.customEquipmentSettingsOption}>
          <RadioContainerOption
            header="Spellcasting Focus"
            subheader="Display this item with spellcasting focus equipment."
            selected={draft.spellcastingFocusEnabled}
            onSelect={() =>
              onChange({ spellcastingFocusEnabled: !draft.spellcastingFocusEnabled })
            }
            indicatorType="checkbox"
            className={styles.customEquipmentChoiceOption}
          />
        </div>

        <div className={styles.customEquipmentSettingsOption}>
          <RadioContainerOption
            header="Spell"
            subheader="Open and cast a stored spell from this item."
            selected={draft.storedSpellEnabled}
            onSelect={() =>
              onChange({
                storedSpellEnabled: !draft.storedSpellEnabled,
                ...(!draft.storedSpellEnabled && storedSpellRequiresCharges
                  ? { chargesEnabled: true }
                  : {})
              })
            }
            indicatorType="checkbox"
            className={styles.customEquipmentChoiceOption}
          />
          {draft.storedSpellEnabled ? (
            <div className={styles.customEquipmentSettingsFields}>
              <div className={styles.customEquipmentFormGrid}>
                <label className={styles.customEquipmentField}>
                  <span>Search Spells</span>
                  <TextInput
                    value={draft.storedSpellSearch}
                    onChange={(event) => onChange({ storedSpellSearch: event.target.value })}
                  />
                </label>
                <label className={styles.customEquipmentField}>
                  <span>Stored Spell</span>
                  <SelectInput
                    value={draft.storedSpellId}
                    onChange={(event) => onChange({ storedSpellId: event.target.value })}
                  >
                    <option value="">-</option>
                    {spellOptions.map((spell) => (
                      <option key={spell.id} value={spell.id}>
                        {spell.name}
                      </option>
                    ))}
                  </SelectInput>
                </label>
              </div>
              <div className={styles.customEquipmentFormGrid}>
                <label className={styles.customEquipmentField}>
                  <span>Spell Use</span>
                  <SelectInput
                    value={draft.storedSpellMode}
                    onChange={(event) =>
                      setStoredSpellMode(event.target.value as CharacterInventoryStoredSpellMode)
                    }
                  >
                    {storedSpellModeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </label>
                {storedSpellRequiresCharges ? (
                  <label className={styles.customEquipmentField}>
                    <span>Charge Cost</span>
                    <NumberInput
                      min={1}
                      max={INVENTORY_REFILLABLE_LIMIT}
                      value={draft.storedSpellChargeCost}
                      onChange={(event) =>
                        onChange({
                          storedSpellChargeCost: normalizeItemSettingPositiveInteger(
                            event.target.valueAsNumber,
                            draft.storedSpellChargeCost
                          )
                        })
                      }
                    />
                  </label>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default CustomEquipmentItemSettings;
