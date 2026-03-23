import clsx from "clsx";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import NumberInput from "../../FormInputs/NumberInput";
import SelectInput from "../../FormInputs/SelectInput";
import TextAreaInput from "../../FormInputs/TextAreaInput";
import TextInput from "../../FormInputs/TextInput";
import {
  CURRENCY_TYPE,
  DAMAGE_TYPE,
  DICE,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  type WeaponDamageAmount
} from "../../../../codex/entries";
import type {
  CharacterCustomEquipment,
  CharacterCustomItem,
  CharacterCustomWeapon
} from "../../../../types";
import { createCustomEquipmentId } from "../../../../pages/CharactersPage/customEquipment";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { formatCodexLabel } from "../../../../utils/codex";
import styles from "../EquipmentForm/EquipmentForm.module.css";

type CustomEquipmentEditorProps = {
  mode: "create" | "edit";
  initialEquipment?: CharacterCustomEquipment | null;
  onCancel: () => void;
  onSave: (equipment: CharacterCustomEquipment) => void;
};

type CustomEquipmentTab = "weapon" | "armor" | "item";

type DamageRowDraft = {
  id: string;
  amount: string;
  damageType: DAMAGE_TYPE;
};

type WeaponDraft = {
  id: string;
  onHand: boolean;
  name: string;
  description: string;
  baseWeapon: WEAPON_BASE;
  training: WEAPON_TRAINING;
  combat: WEAPON_COMBAT_TYPE;
  damage: DamageRowDraft[];
  properties: WEAPON_PROPERTY[];
  mastery: WEAPON_MASTERY | "";
  costAmount: number;
  costCurrency: CURRENCY_TYPE;
  weight: number;
  rangeNormal: number;
  rangeLong: number;
  ammunition: string;
  versatileDamage: DamageRowDraft[];
};

type ItemDraft = {
  id: string;
  name: string;
  description: string;
  costAmount: number;
  costCurrency: CURRENCY_TYPE;
  weight: number;
};

const currencyOptions = Object.values(CURRENCY_TYPE);
const weaponBaseOptions = Object.values(WEAPON_BASE);
const weaponTrainingOptions = Object.values(WEAPON_TRAINING);
const weaponCombatOptions = Object.values(WEAPON_COMBAT_TYPE);
const weaponMasteryOptions = Object.values(WEAPON_MASTERY);
const weaponPropertyOptions = Object.values(WEAPON_PROPERTY);
const damageTypeOptions = Object.values(DAMAGE_TYPE);
const damageAmountOptions = Object.values(DICE);

function createDamageRowDraft(
  amount: WeaponDamageAmount | string = DICE.D6,
  damageType = DAMAGE_TYPE.SLASHING
): DamageRowDraft {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    amount: String(amount).toUpperCase(),
    damageType
  };
}

function createWeaponDraft(initialEquipment?: CharacterCustomEquipment | null): WeaponDraft {
  if (initialEquipment?.kind === "weapon") {
    return {
      id: initialEquipment.id,
      onHand: initialEquipment.onHand,
      name: initialEquipment.name,
      description: initialEquipment.description,
      baseWeapon: initialEquipment.baseWeapon,
      training: initialEquipment.type.training,
      combat: initialEquipment.type.combat,
      damage: initialEquipment.damage.map(([amount, damageType]) =>
        createDamageRowDraft(amount, damageType)
      ),
      properties: [...initialEquipment.properties],
      mastery: initialEquipment.mastery ?? "",
      costAmount: initialEquipment.cost.amount,
      costCurrency: initialEquipment.cost.currency,
      weight: initialEquipment.weight ?? 1,
      rangeNormal: initialEquipment.range?.normal ?? 20,
      rangeLong: initialEquipment.range?.long ?? 60,
      ammunition: initialEquipment.range?.ammunition ?? "",
      versatileDamage: initialEquipment.versatileDamage?.map(([amount, damageType]) =>
        createDamageRowDraft(amount, damageType)
      ) ?? [createDamageRowDraft(DICE.D8, DAMAGE_TYPE.SLASHING)]
    };
  }

  return {
    id: createCustomEquipmentId(),
    onHand: false,
    name: "",
    description: "",
    baseWeapon: WEAPON_BASE.DAGGER,
    training: WEAPON_TRAINING.SIMPLE,
    combat: WEAPON_COMBAT_TYPE.MELEE,
    damage: [createDamageRowDraft(DICE.D6, DAMAGE_TYPE.SLASHING)],
    properties: [],
    mastery: "",
    costAmount: 0,
    costCurrency: CURRENCY_TYPE.GP,
    weight: 1,
    rangeNormal: 20,
    rangeLong: 60,
    ammunition: "",
    versatileDamage: [createDamageRowDraft(DICE.D8, DAMAGE_TYPE.SLASHING)]
  };
}

function createItemDraft(initialEquipment?: CharacterCustomEquipment | null): ItemDraft {
  if (initialEquipment?.kind === "item") {
    return {
      id: initialEquipment.id,
      name: initialEquipment.name,
      description: initialEquipment.description,
      costAmount: initialEquipment.cost.amount,
      costCurrency: initialEquipment.cost.currency,
      weight: initialEquipment.weight ?? 1
    };
  }

  return {
    id: createCustomEquipmentId(),
    name: "",
    description: "",
    costAmount: 0,
    costCurrency: CURRENCY_TYPE.GP,
    weight: 1
  };
}

function getInitialTab(initialEquipment?: CharacterCustomEquipment | null): CustomEquipmentTab {
  if (initialEquipment?.kind === "item") {
    return "item";
  }

  if (initialEquipment?.kind === "armor") {
    return "armor";
  }

  return "weapon";
}

function parseDamageAmount(value: string): WeaponDamageAmount | null {
  const normalizedValue = value.trim().toUpperCase();

  if (normalizedValue.startsWith("D")) {
    return normalizedValue as DICE;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return Math.floor(parsedValue);
}

function getDamageAmountOptions(currentValue: string): string[] {
  const normalizedValue = currentValue.trim().toUpperCase();

  if (!normalizedValue) {
    return damageAmountOptions;
  }

  if (damageAmountOptions.includes(normalizedValue as DICE)) {
    return damageAmountOptions;
  }

  const parsedValue = Number(normalizedValue);

  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return [normalizedValue, ...damageAmountOptions];
  }

  return damageAmountOptions;
}

function normalizeDamageRows(rows: DamageRowDraft[]): CharacterCustomWeapon["damage"] | null {
  const normalizedDamage = rows
    .map((row) => {
      const amount = parseDamageAmount(row.amount);

      if (!amount) {
        return null;
      }

      return [amount, row.damageType] as const;
    })
    .filter(
      (damageEntry): damageEntry is CharacterCustomWeapon["damage"][number] => damageEntry !== null
    );

  return normalizedDamage.length > 0 ? normalizedDamage : null;
}

function normalizeNumericInput(value: number, fallback: number): number {
  return Math.round(clampNumber(value, 0, 999999999, fallback) * 100) / 100;
}

function CustomEquipmentEditor({
  mode,
  initialEquipment,
  onCancel,
  onSave
}: CustomEquipmentEditorProps) {
  const [activeTab, setActiveTab] = useState<CustomEquipmentTab>(() =>
    getInitialTab(initialEquipment)
  );
  const [weaponDraft, setWeaponDraft] = useState<WeaponDraft>(() =>
    createWeaponDraft(initialEquipment)
  );
  const [itemDraft, setItemDraft] = useState<ItemDraft>(() => createItemDraft(initialEquipment));
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(getInitialTab(initialEquipment));
    setWeaponDraft(createWeaponDraft(initialEquipment));
    setItemDraft(createItemDraft(initialEquipment));
    setFormError(null);
  }, [initialEquipment, mode]);

  const showsRangeFields = useMemo(
    () =>
      weaponDraft.properties.some((property) =>
        [WEAPON_PROPERTY.AMMUNITION, WEAPON_PROPERTY.THROWN, WEAPON_PROPERTY.RANGE].includes(
          property
        )
      ),
    [weaponDraft.properties]
  );
  const showsVersatileFields = weaponDraft.properties.includes(WEAPON_PROPERTY.VERSATILE);
  const isArmorTabDisabled = true;

  function toggleWeaponProperty(property: WEAPON_PROPERTY) {
    setWeaponDraft((currentDraft) => ({
      ...currentDraft,
      properties: currentDraft.properties.includes(property)
        ? currentDraft.properties.filter((currentProperty) => currentProperty !== property)
        : [...currentDraft.properties, property]
    }));
  }

  function addDamageRow(target: "damage" | "versatileDamage") {
    setWeaponDraft((currentDraft) => ({
      ...currentDraft,
      [target]: [...currentDraft[target], createDamageRowDraft()]
    }));
  }

  function removeDamageRow(target: "damage" | "versatileDamage", rowId: string) {
    setWeaponDraft((currentDraft) => ({
      ...currentDraft,
      [target]:
        currentDraft[target].length > 1
          ? currentDraft[target].filter((row) => row.id !== rowId)
          : currentDraft[target]
    }));
  }

  function updateDamageRow(
    target: "damage" | "versatileDamage",
    rowId: string,
    field: "amount" | "damageType",
    value: string
  ) {
    setWeaponDraft((currentDraft) => ({
      ...currentDraft,
      [target]: currentDraft[target].map((row) =>
        row.id === rowId
          ? { ...row, [field]: field === "amount" ? value.toUpperCase() : value }
          : row
      )
    }));
  }

  function saveWeapon() {
    const normalizedName = weaponDraft.name.trim();
    const normalizedDamage = normalizeDamageRows(weaponDraft.damage);

    if (!normalizedName) {
      setFormError("A custom weapon needs a name.");
      return;
    }

    if (!normalizedDamage) {
      setFormError("Add at least one valid damage entry.");
      return;
    }

    if (showsRangeFields) {
      const normalizedRangeNormal = Math.floor(clampNumber(weaponDraft.rangeNormal, 1, 9999, 20));
      const normalizedRangeLong = Math.floor(
        clampNumber(weaponDraft.rangeLong, normalizedRangeNormal, 9999, 60)
      );

      if (normalizedRangeLong < normalizedRangeNormal) {
        setFormError("The long range must be greater than or equal to the normal range.");
        return;
      }
    }

    if (showsVersatileFields) {
      const normalizedVersatileDamage = normalizeDamageRows(weaponDraft.versatileDamage);

      if (!normalizedVersatileDamage) {
        setFormError("Versatile weapons need at least one valid alternate damage entry.");
        return;
      }
    }

    onSave({
      id: weaponDraft.id,
      kind: "weapon",
      onHand: weaponDraft.onHand,
      name: normalizedName,
      description: weaponDraft.description.trim(),
      baseWeapon: weaponDraft.baseWeapon,
      type: {
        training: weaponDraft.training,
        combat: weaponDraft.combat
      },
      damage: normalizedDamage,
      properties: [...weaponDraft.properties],
      mastery: weaponDraft.mastery || undefined,
      cost: {
        amount: Math.floor(clampNumber(weaponDraft.costAmount, 0, 999999999, 0)),
        currency: weaponDraft.costCurrency
      },
      weight: normalizeNumericInput(weaponDraft.weight, 1),
      range: showsRangeFields
        ? {
            normal: Math.floor(clampNumber(weaponDraft.rangeNormal, 1, 9999, 20)),
            long: Math.floor(clampNumber(weaponDraft.rangeLong, weaponDraft.rangeNormal, 9999, 60)),
            ...(weaponDraft.ammunition.trim() ? { ammunition: weaponDraft.ammunition.trim() } : {})
          }
        : undefined,
      versatileDamage: showsVersatileFields
        ? (normalizeDamageRows(weaponDraft.versatileDamage) ?? undefined)
        : undefined
    });
  }

  function saveItem() {
    const normalizedName = itemDraft.name.trim();
    const normalizedDescription = itemDraft.description.trim();

    if (!normalizedName) {
      setFormError("A custom item needs a name.");
      return;
    }

    if (!normalizedDescription) {
      setFormError("A custom item needs a description.");
      return;
    }

    onSave({
      id: itemDraft.id,
      kind: "item",
      name: normalizedName,
      description: normalizedDescription,
      cost: {
        amount: Math.floor(clampNumber(itemDraft.costAmount, 0, 999999999, 0)),
        currency: itemDraft.costCurrency
      },
      weight: normalizeNumericInput(itemDraft.weight, 1)
    } satisfies CharacterCustomItem);
  }

  function handleSave() {
    setFormError(null);

    if (activeTab === "weapon") {
      saveWeapon();
      return;
    }

    if (activeTab === "item") {
      saveItem();
      return;
    }

    setFormError("Custom armor creation is not available yet.");
  }

  return (
    <div className={styles.customEquipmentEditor}>
      <div className={styles.customEquipmentEditorBody}>
        <div
          className={styles.customEquipmentTabRow}
          role="tablist"
          aria-label="Custom equipment types"
        >
          {(["weapon", "armor", "item"] as const).map((tab) => {
            const isDisabled = tab === "armor" && isArmorTabDisabled;

            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                disabled={isDisabled}
                className={clsx(
                  styles.customEquipmentTabButton,
                  activeTab === tab && styles.customEquipmentTabButtonActive,
                  isDisabled && styles.customEquipmentTabButtonDisabled
                )}
                onClick={() => {
                  if (!isDisabled) {
                    setActiveTab(tab);
                    setFormError(null);
                  }
                }}
              >
                {tab === "item" ? "Item" : tab === "weapon" ? "Weapon" : "Armor"}
              </button>
            );
          })}
        </div>

        {activeTab === "armor" ? (
          <div className={styles.customEquipmentDisabledState}>
            <p>
              Custom armor is temporarily disabled while the armor refactor is still in progress.
            </p>
          </div>
        ) : null}

        {activeTab === "weapon" ? (
          <div className={styles.customEquipmentFormStack}>
            <label className={styles.customEquipmentField}>
              <span>Name</span>
              <TextInput
                value={weaponDraft.name}
                onChange={(event) =>
                  setWeaponDraft((currentDraft) => ({
                    ...currentDraft,
                    name: event.target.value
                  }))
                }
              />
            </label>

            <div className={styles.customEquipmentThreeColumnRow}>
              <label className={styles.customEquipmentField}>
                <span>Base weapon</span>
                <SelectInput
                  value={weaponDraft.baseWeapon}
                  onChange={(event) =>
                    setWeaponDraft((currentDraft) => ({
                      ...currentDraft,
                      baseWeapon: event.target.value as WEAPON_BASE
                    }))
                  }
                >
                  {weaponBaseOptions.map((baseWeapon) => (
                    <option key={baseWeapon} value={baseWeapon}>
                      {formatCodexLabel(baseWeapon)}
                    </option>
                  ))}
                </SelectInput>
              </label>
              <label className={styles.customEquipmentField}>
                <span>Training</span>
                <SelectInput
                  value={weaponDraft.training}
                  onChange={(event) =>
                    setWeaponDraft((currentDraft) => ({
                      ...currentDraft,
                      training: event.target.value as WEAPON_TRAINING
                    }))
                  }
                >
                  {weaponTrainingOptions.map((training) => (
                    <option key={training} value={training}>
                      {training}
                    </option>
                  ))}
                </SelectInput>
              </label>
              <label className={styles.customEquipmentField}>
                <span>Combat</span>
                <SelectInput
                  value={weaponDraft.combat}
                  onChange={(event) =>
                    setWeaponDraft((currentDraft) => ({
                      ...currentDraft,
                      combat: event.target.value as WEAPON_COMBAT_TYPE
                    }))
                  }
                >
                  {weaponCombatOptions.map((combat) => (
                    <option key={combat} value={combat}>
                      {combat}
                    </option>
                  ))}
                </SelectInput>
              </label>
              <label className={styles.customEquipmentField}>
                <span>Mastery</span>
                <SelectInput
                  value={weaponDraft.mastery}
                  onChange={(event) =>
                    setWeaponDraft((currentDraft) => ({
                      ...currentDraft,
                      mastery: event.target.value as WEAPON_MASTERY | ""
                    }))
                  }
                >
                  <option value="">None</option>
                  {weaponMasteryOptions.map((mastery) => (
                    <option key={mastery} value={mastery}>
                      {mastery}
                    </option>
                  ))}
                </SelectInput>
              </label>
            </div>

            <section className={styles.customEquipmentSection}>
              <div className={styles.customEquipmentSectionHeader}>
                <div>
                  <p className={styles.customEquipmentSectionTitle}>Properties</p>
                  <p className={styles.customEquipmentSectionDescription}>
                    Toggle any properties that apply to this weapon.
                  </p>
                </div>
              </div>

              <div className={styles.customPropertyGrid}>
                {weaponPropertyOptions.map((property) => (
                  <button
                    key={property}
                    type="button"
                    className={clsx(
                      styles.customPropertyButton,
                      weaponDraft.properties.includes(property) && styles.customPropertyButtonActive
                    )}
                    onClick={() => toggleWeaponProperty(property)}
                  >
                    {property}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.customEquipmentSection}>
              <div className={styles.customEquipmentSectionHeader}>
                <div>
                  <p className={styles.customEquipmentSectionTitle}>Damage</p>
                  <p className={styles.customEquipmentSectionDescription}>
                    Add one row for each damage die or damage instance this weapon deals.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.customEquipmentInlineButton}
                  onClick={() => addDamageRow("damage")}
                >
                  <Plus size={14} aria-hidden="true" />
                  Add damage
                </button>
              </div>

              <div className={styles.customDamageList}>
                {weaponDraft.damage.map((damageRow) => (
                  <div key={damageRow.id} className={styles.customDamageRow}>
                    <label className={styles.customEquipmentField}>
                      <span>Amount</span>
                      <SelectInput
                        value={damageRow.amount}
                        onChange={(event) =>
                          updateDamageRow("damage", damageRow.id, "amount", event.target.value)
                        }
                      >
                        {getDamageAmountOptions(damageRow.amount).map((amount) => (
                          <option key={amount} value={amount}>
                            {amount}
                          </option>
                        ))}
                      </SelectInput>
                    </label>
                    <label className={styles.customEquipmentField}>
                      <span>Damage type</span>
                      <SelectInput
                        value={damageRow.damageType}
                        onChange={(event) =>
                          updateDamageRow("damage", damageRow.id, "damageType", event.target.value)
                        }
                      >
                        {damageTypeOptions.map((damageType) => (
                          <option key={damageType} value={damageType}>
                            {damageType}
                          </option>
                        ))}
                      </SelectInput>
                    </label>
                    <button
                      type="button"
                      className={styles.customDamageRemoveButton}
                      onClick={() => removeDamageRow("damage", damageRow.id)}
                      disabled={weaponDraft.damage.length <= 1}
                      aria-label="Remove damage row"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {showsRangeFields ? (
              <section className={styles.customEquipmentSection}>
                <div className={styles.customEquipmentSectionHeader}>
                  <div>
                    <p className={styles.customEquipmentSectionTitle}>Range</p>
                    <p className={styles.customEquipmentSectionDescription}>
                      Required when the weapon uses `Range`, `Thrown`, or `Ammunition`.
                    </p>
                  </div>
                </div>

                <div className={styles.customEquipmentFormGrid}>
                  <label className={styles.customEquipmentField}>
                    <span>Normal range</span>
                    <NumberInput
                      min={1}
                      value={weaponDraft.rangeNormal}
                      onChange={(event) =>
                        setWeaponDraft((currentDraft) => ({
                          ...currentDraft,
                          rangeNormal: Math.floor(clampNumber(event.target.value, 1, 9999, 20))
                        }))
                      }
                    />
                  </label>
                  <label className={styles.customEquipmentField}>
                    <span>Long range</span>
                    <NumberInput
                      min={weaponDraft.rangeNormal}
                      value={weaponDraft.rangeLong}
                      onChange={(event) =>
                        setWeaponDraft((currentDraft) => ({
                          ...currentDraft,
                          rangeLong: Math.floor(
                            clampNumber(event.target.value, currentDraft.rangeNormal, 9999, 60)
                          )
                        }))
                      }
                    />
                  </label>
                  <label className={styles.customEquipmentField}>
                    <span>Ammunition label (Optional)</span>
                    <TextInput
                      value={weaponDraft.ammunition}
                      onChange={(event) =>
                        setWeaponDraft((currentDraft) => ({
                          ...currentDraft,
                          ammunition: event.target.value
                        }))
                      }
                      placeholder="Arrow"
                    />
                  </label>
                </div>
              </section>
            ) : null}

            {showsVersatileFields ? (
              <section className={styles.customEquipmentSection}>
                <div className={styles.customEquipmentSectionHeader}>
                  <div>
                    <p className={styles.customEquipmentSectionTitle}>Versatile damage</p>
                    <p className={styles.customEquipmentSectionDescription}>
                      Add the alternate damage used when the weapon is wielded differently.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.customEquipmentInlineButton}
                    onClick={() => addDamageRow("versatileDamage")}
                  >
                    <Plus size={14} aria-hidden="true" />
                    Add row
                  </button>
                </div>

                <div className={styles.customDamageList}>
                  {weaponDraft.versatileDamage.map((damageRow) => (
                    <div key={damageRow.id} className={styles.customDamageRow}>
                      <label className={styles.customEquipmentField}>
                        <span>Amount</span>
                        <SelectInput
                          value={damageRow.amount}
                          onChange={(event) =>
                            updateDamageRow(
                              "versatileDamage",
                              damageRow.id,
                              "amount",
                              event.target.value
                            )
                          }
                        >
                          {getDamageAmountOptions(damageRow.amount).map((amount) => (
                            <option key={amount} value={amount}>
                              {amount}
                            </option>
                          ))}
                        </SelectInput>
                      </label>
                      <label className={styles.customEquipmentField}>
                        <span>Damage type</span>
                        <SelectInput
                          value={damageRow.damageType}
                          onChange={(event) =>
                            updateDamageRow(
                              "versatileDamage",
                              damageRow.id,
                              "damageType",
                              event.target.value
                            )
                          }
                        >
                          {damageTypeOptions.map((damageType) => (
                            <option key={damageType} value={damageType}>
                              {damageType}
                            </option>
                          ))}
                        </SelectInput>
                      </label>
                      <button
                        type="button"
                        className={styles.customDamageRemoveButton}
                        onClick={() => removeDamageRow("versatileDamage", damageRow.id)}
                        disabled={weaponDraft.versatileDamage.length <= 1}
                        aria-label="Remove versatile damage row"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <div className={styles.customEquipmentFormGrid}>
              <label className={styles.customEquipmentField}>
                <span>Cost</span>
                <div className={styles.customEquipmentInlineFieldRow}>
                  <NumberInput
                    min={0}
                    value={weaponDraft.costAmount}
                    onChange={(event) =>
                      setWeaponDraft((currentDraft) => ({
                        ...currentDraft,
                        costAmount: Math.floor(clampNumber(event.target.value, 0, 999999999, 0))
                      }))
                    }
                  />
                  <SelectInput
                    value={weaponDraft.costCurrency}
                    onChange={(event) =>
                      setWeaponDraft((currentDraft) => ({
                        ...currentDraft,
                        costCurrency: event.target.value as CURRENCY_TYPE
                      }))
                    }
                  >
                    {currencyOptions.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </SelectInput>
                </div>
              </label>
              <label className={styles.customEquipmentField}>
                <span>Weight (lb.)</span>
                <NumberInput
                  min={0}
                  step="0.25"
                  value={weaponDraft.weight}
                  onChange={(event) =>
                    setWeaponDraft((currentDraft) => ({
                      ...currentDraft,
                      weight: normalizeNumericInput(Number(event.target.value), currentDraft.weight)
                    }))
                  }
                />
              </label>
            </div>

            <label className={styles.customEquipmentField}>
              <span>Description (Optional)</span>
              <TextAreaInput
                rows={2}
                className={styles.customEquipmentCompactTextarea}
                value={weaponDraft.description}
                onChange={(event) =>
                  setWeaponDraft((currentDraft) => ({
                    ...currentDraft,
                    description: event.target.value
                  }))
                }
              />
            </label>
          </div>
        ) : null}

        {activeTab === "item" ? (
          <div className={styles.customEquipmentFormStack}>
            <div className={styles.customEquipmentFormGrid}>
              <label className={styles.customEquipmentField}>
                <span>Name</span>
                <TextInput
                  value={itemDraft.name}
                  onChange={(event) =>
                    setItemDraft((currentDraft) => ({
                      ...currentDraft,
                      name: event.target.value
                    }))
                  }
                />
              </label>
              <label className={styles.customEquipmentField}>
                <span>Weight (lb.)</span>
                <NumberInput
                  min={0}
                  step="0.25"
                  value={itemDraft.weight}
                  onChange={(event) =>
                    setItemDraft((currentDraft) => ({
                      ...currentDraft,
                      weight: normalizeNumericInput(Number(event.target.value), currentDraft.weight)
                    }))
                  }
                />
              </label>
            </div>

            <label className={styles.customEquipmentField}>
              <span>Cost</span>
              <div className={styles.customEquipmentInlineFieldRow}>
                <NumberInput
                  min={0}
                  value={itemDraft.costAmount}
                  onChange={(event) =>
                    setItemDraft((currentDraft) => ({
                      ...currentDraft,
                      costAmount: Math.floor(clampNumber(event.target.value, 0, 999999999, 0))
                    }))
                  }
                />
                <SelectInput
                  value={itemDraft.costCurrency}
                  onChange={(event) =>
                    setItemDraft((currentDraft) => ({
                      ...currentDraft,
                      costCurrency: event.target.value as CURRENCY_TYPE
                    }))
                  }
                >
                  {currencyOptions.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </SelectInput>
              </div>
            </label>

            <label className={styles.customEquipmentField}>
              <span>Description</span>
              <TextAreaInput
                rows={3}
                className={styles.customEquipmentCompactTextarea}
                value={itemDraft.description}
                onChange={(event) =>
                  setItemDraft((currentDraft) => ({
                    ...currentDraft,
                    description: event.target.value
                  }))
                }
              />
            </label>
          </div>
        ) : null}
      </div>

      <div className={styles.customEquipmentEditorFooter}>
        {formError ? <p className={styles.customEquipmentError}>{formError}</p> : null}

        <div className={styles.customEquipmentActionRow}>
          <button
            type="button"
            className={styles.customEquipmentSecondaryButton}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.customEquipmentPrimaryButton}
            onClick={handleSave}
            disabled={activeTab === "armor"}
          >
            {mode === "edit" ? "Save changes" : "Create custom equipment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomEquipmentEditor;
