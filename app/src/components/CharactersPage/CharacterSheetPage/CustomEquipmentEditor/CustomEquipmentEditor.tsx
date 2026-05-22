import clsx from "clsx";
import { Check, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import NumberInput from "../../FormInputs/NumberInput";
import SelectInput from "../../FormInputs/SelectInput";
import TextAreaInput from "../../FormInputs/TextAreaInput";
import TextInput from "../../FormInputs/TextInput";
import ActionButton from "../../../ActionButton";
import { OverlayBody, OverlayFooter } from "../../../Overlay";
import ModEffectsEditor from "../ModEffectsEditor";
import RadioContainerOption from "../RadioContainerOption";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import CustomEquipmentItemSettings from "./CustomEquipmentItemSettings";
import {
  createCustomEquipmentItemSettingsDraft,
  parseCustomEquipmentItemSettingsDraft,
  type CustomEquipmentItemSettingsDraft
} from "./customEquipmentItemSettingsModel";
import {
  CURRENCY_TYPE,
  DAMAGE_TYPE,
  DICE,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  type EquipmentCost,
  type WeaponDamage,
  type WeaponDamageAmount
} from "../../../../codex/entries";
import type {
  AbilityKey,
  CharacterInventoryItem,
  CharacterItemModCategory,
  CharacterItemMods,
  CharacterCustomTraitValueMode,
  CustomArmorType,
  ItemRecord
} from "../../../../types";
import {
  createCustomTraitEffectDraft,
  createCustomTraitEffectDraftFromEntry,
  doesCustomTraitTargetAllowAbilityValue,
  isCustomTraitAbilityValue,
  isCustomTraitRollModeDisabledTarget,
  parseCustomTraitEffectDraft,
  type CustomTraitEffectDraft
} from "../GameplayForm/widgets/TraitsConditionsWidget/customTraitDraft";
import {
  createCustomItemRecordFromMods,
  getEffectiveInventoryItemRecord,
  getItemModsCategory,
  inferItemModCategory,
  normalizeCharacterItemMods
} from "../../../../pages/CharactersPage/itemMods";
import {
  getAdaptedItemWeapon,
  getItemArmorType,
  getItemWeightValue,
  ITEM_MOD_EFFECT_LIMIT,
  isInventoryContainerItem,
  isItemEquipmentPackRecord,
  isPactOfTheBladeInventoryItem,
  isItemShieldRecord,
  type InventoryItemSettingsSavePayload
} from "../../../../pages/CharactersPage/inventoryItems";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { formatCodexLabel } from "../../../../utils/codex";
import { parseItemCost } from "../../../../utils/items/cost";
import { sanitizeUserInput } from "../../../../utils/userInputSanitization";
import styles from "./CustomEquipmentEditor.module.css";

export type CustomEquipmentEditorSavePayload = {
  item: ItemRecord;
  mods: CharacterItemMods;
  settings: InventoryItemSettingsSavePayload;
};

type CustomEquipmentEditorProps = {
  mode: "create" | "edit";
  initialStack?: CharacterInventoryItem | null;
  onCancel: () => void;
  onSave: (payload: CustomEquipmentEditorSavePayload) => void;
};

type DamageRowDraft = {
  id: string;
  amount: string;
  damageType: DAMAGE_TYPE;
};

type EquipmentModsDraft = {
  category: CharacterItemModCategory;
  name: string;
  description: string;
  costAmount: number;
  costCurrency: CURRENCY_TYPE;
  weight: number;
  isMagicItem: boolean;
  requiresAttunement: boolean;
  baseWeapon: WEAPON_BASE;
  training: WEAPON_TRAINING;
  combat: WEAPON_COMBAT_TYPE;
  damage: DamageRowDraft[];
  properties: WEAPON_PROPERTY[];
  mastery: WEAPON_MASTERY | "";
  rangeNormal: number;
  rangeLong: number;
  ammunition: string;
  versatileDamage: DamageRowDraft[];
  armorType: CustomArmorType;
  armorClass: number;
  effects: CustomTraitEffectDraft[];
};

const categoryOptions: Array<{ value: CharacterItemModCategory; label: string }> = [
  { value: "weapon", label: "Weapon" },
  { value: "armor", label: "Armor" },
  { value: "general", label: "General" }
];
const armorTypeOptions: CustomArmorType[] = ["light", "medium", "heavy", "shield"];
const currencyOptions = Object.values(CURRENCY_TYPE);
const weaponBaseOptions = Object.values(WEAPON_BASE);
const weaponTrainingOptions = Object.values(WEAPON_TRAINING);
const weaponCombatOptions = Object.values(WEAPON_COMBAT_TYPE);
const weaponMasteryOptions = Object.values(WEAPON_MASTERY);
const weaponPropertyOptions = Object.values(WEAPON_PROPERTY);
const damageTypeOptions = Object.values(DAMAGE_TYPE);
const abilityDamageAmountOptions: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const flatDamageAmountOptions = Array.from({ length: 10 }, (_, index) => index + 1);
const damageAmountOptions: Array<{ value: string; label: string }> = [
  ...Object.values(DICE).map((die) => ({ value: die, label: die })),
  ...abilityDamageAmountOptions.map((ability) => ({ value: ability, label: `${ability} mod` })),
  ...flatDamageAmountOptions.map((amount) => ({
    value: String(amount),
    label: String(amount)
  }))
];
const defaultCost: EquipmentCost = {
  amount: 0,
  currency: CURRENCY_TYPE.GP
};

function createDraftId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `custom-item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createDamageRowDraft(
  amount: WeaponDamageAmount | string = DICE.D6,
  damageType = DAMAGE_TYPE.SLASHING
): DamageRowDraft {
  return {
    id: createDraftId(),
    amount: String(amount).toUpperCase(),
    damageType
  };
}

function parseDamageAmount(value: string): WeaponDamageAmount | null {
  const normalizedValue = value.trim().toUpperCase();

  if (Object.values(DICE).includes(normalizedValue as DICE)) {
    return normalizedValue as DICE;
  }

  if (abilityDamageAmountOptions.includes(normalizedValue as AbilityKey)) {
    return normalizedValue as AbilityKey;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? Math.floor(parsedValue) : null;
}

function normalizeDamageRows(rows: DamageRowDraft[]): WeaponDamage | null {
  const damage = rows
    .map((row) => {
      const amount = parseDamageAmount(row.amount);

      return amount ? ([amount, [row.damageType]] as WeaponDamage[number]) : null;
    })
    .filter((entry): entry is WeaponDamage[number] => entry !== null);

  return damage.length > 0 ? damage : null;
}

function createDamageRowsFromDamage(damage: WeaponDamage | null | undefined): DamageRowDraft[] {
  const rows =
    damage?.map(([amount, damageType]) =>
      createDamageRowDraft(amount, Array.isArray(damageType) ? damageType[0] : damageType)
    ) ?? [];

  return rows.length > 0 ? rows : [createDamageRowDraft()];
}

function normalizeNumericInput(value: number, fallback: number, max = 999999999): number {
  return Math.round(clampNumber(value, 0, max, fallback) * 100) / 100;
}

function getWeightDraft(item: ItemRecord | null, mods: CharacterItemMods | undefined): number {
  if (mods?.weight !== undefined && mods.weight !== null) {
    return mods.weight;
  }

  return getItemWeightValue(item ?? { weight: "1" }) ?? 1;
}

function getCostDraft(item: ItemRecord | null, mods: CharacterItemMods | undefined): EquipmentCost {
  return mods?.cost ?? parseItemCost(item?.cost) ?? defaultCost;
}

function inferWeaponBase(item: ItemRecord | null, mods: CharacterItemMods | undefined): WEAPON_BASE {
  if (mods?.weapon?.baseWeapon) {
    return mods.weapon.baseWeapon;
  }

  const weaponName = item?.weapon?.name?.trim();

  if (!weaponName) {
    return WEAPON_BASE.DAGGER;
  }

  return (
    weaponBaseOptions.find((baseWeapon) => formatCodexLabel(baseWeapon) === weaponName) ??
    WEAPON_BASE.DAGGER
  );
}

function getInitialCategory(
  mode: "create" | "edit",
  initialStack: CharacterInventoryItem | null | undefined
): CharacterItemModCategory {
  if (mode === "create") {
    return "weapon";
  }

  return initialStack
    ? getItemModsCategory(initialStack)
    : inferItemModCategory({ id: "", name: "", key: "" });
}

function createDraft(
  mode: "create" | "edit",
  initialStack?: CharacterInventoryItem | null
): EquipmentModsDraft {
  const mods = normalizeCharacterItemMods(initialStack?.mods);
  const item = initialStack ? getEffectiveInventoryItemRecord(initialStack) : null;
  const category = mods?.baseCategory ?? getInitialCategory(mode, initialStack);
  const cost = getCostDraft(item, mods);
  const adaptedWeapon = item ? getAdaptedItemWeapon(item) : null;
  const armorType = mods?.armor?.armorType ?? (item && isItemShieldRecord(item) ? "shield" : null);
  const resolvedArmorType = armorType ?? (item ? getItemArmorType(item) : null) ?? "light";
  const armorClass =
    mods?.armor?.armorClass ??
    (resolvedArmorType === "shield" ? 2 : item?.armor?.ac_base) ??
    (resolvedArmorType === "shield" ? 2 : 11);
  const effectDrafts =
    mods?.effects?.slice(0, ITEM_MOD_EFFECT_LIMIT).map(createCustomTraitEffectDraftFromEntry) ?? [];

  return {
    category,
    name: mods?.name ?? item?.name ?? "",
    description: mods?.description ?? item?.desc ?? "",
    costAmount: cost.amount,
    costCurrency: cost.currency,
    weight: getWeightDraft(item, mods),
    isMagicItem: mods?.isMagicItem ?? item?.is_magic_item === true,
    requiresAttunement: mods?.requiresAttunement ?? item?.requires_attunement === true,
    baseWeapon: inferWeaponBase(item, mods),
    training: mods?.weapon?.training ?? adaptedWeapon?.type.training ?? WEAPON_TRAINING.SIMPLE,
    combat: mods?.weapon?.combat ?? adaptedWeapon?.type.combat ?? WEAPON_COMBAT_TYPE.MELEE,
    damage: createDamageRowsFromDamage(mods?.weapon?.damage ?? adaptedWeapon?.damage),
    properties: mods?.weapon?.properties ?? adaptedWeapon?.properties ?? [],
    mastery: mods?.weapon?.mastery ?? adaptedWeapon?.mastery ?? "",
    rangeNormal: mods?.weapon?.range?.normal ?? 20,
    rangeLong: mods?.weapon?.range?.long ?? 60,
    ammunition: mods?.weapon?.range?.ammunition ?? "",
    versatileDamage: createDamageRowsFromDamage(
      mods?.weapon?.versatileDamage ?? adaptedWeapon?.versatileDamage ?? [[DICE.D8, DAMAGE_TYPE.SLASHING]]
    ),
    armorType: resolvedArmorType,
    armorClass,
    effects: effectDrafts.length > 0 ? effectDrafts : [createCustomTraitEffectDraft()]
  };
}

function getCustomItemId(initialStack: CharacterInventoryItem | null | undefined) {
  return initialStack?.item.id || initialStack?.id || `custom-item-${createDraftId()}`;
}

function CustomEquipmentEditor({
  mode,
  initialStack,
  onCancel,
  onSave
}: CustomEquipmentEditorProps) {
  const [draft, setDraft] = useState<EquipmentModsDraft>(() => createDraft(mode, initialStack));
  const [settingsDraft, setSettingsDraft] = useState<CustomEquipmentItemSettingsDraft>(() =>
    createCustomEquipmentItemSettingsDraft(initialStack)
  );
  const [formError, setFormError] = useState("");
  const selectedCategory = draft.category;
  const hasRangeFields =
    draft.properties.includes(WEAPON_PROPERTY.RANGE) ||
    draft.properties.includes(WEAPON_PROPERTY.THROWN) ||
    draft.properties.includes(WEAPON_PROPERTY.AMMUNITION);
  const hasVersatileFields = draft.properties.includes(WEAPON_PROPERTY.VERSATILE);
  const showCategorySelector = mode === "create";
  const initialItem = initialStack ? getEffectiveInventoryItemRecord(initialStack) : null;
  const isContainerOrPackEdit =
    mode === "edit" &&
    initialStack !== null &&
    initialStack !== undefined &&
    (isInventoryContainerItem(initialStack) ||
      isItemEquipmentPackRecord(initialStack.item) ||
      (initialItem !== null && isItemEquipmentPackRecord(initialItem)));
  const canEditBaseArchetype =
    mode === "edit" &&
    initialStack !== null &&
    initialStack !== undefined &&
    !isContainerOrPackEdit &&
    !isPactOfTheBladeInventoryItem(initialStack);
  const [isBaseArchetypeEditingEnabled, setIsBaseArchetypeEditingEnabled] = useState(false);

  useEffect(() => {
    setDraft(createDraft(mode, initialStack));
    setSettingsDraft(createCustomEquipmentItemSettingsDraft(initialStack));
    setFormError("");
    setIsBaseArchetypeEditingEnabled(false);
  }, [initialStack, mode]);

  function patchDraft(patch: Partial<EquipmentModsDraft>) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      ...patch
    }));
  }

  function patchSettingsDraft(patch: Partial<CustomEquipmentItemSettingsDraft>) {
    setSettingsDraft((currentDraft) => ({
      ...currentDraft,
      ...patch
    }));
  }

  function updateDamageRow(rowId: string, patch: Partial<DamageRowDraft>) {
    patchDraft({
      damage: draft.damage.map((row) => (row.id === rowId ? { ...row, ...patch } : row))
    });
  }

  function updateVersatileDamageRow(rowId: string, patch: Partial<DamageRowDraft>) {
    patchDraft({
      versatileDamage: draft.versatileDamage.map((row) =>
        row.id === rowId ? { ...row, ...patch } : row
      )
    });
  }

  function toggleProperty(property: WEAPON_PROPERTY) {
    const propertySet = new Set(draft.properties);

    if (propertySet.has(property)) {
      propertySet.delete(property);
    } else {
      propertySet.add(property);
    }

    patchDraft({ properties: [...propertySet] });
  }

  function handleEffectTargetChange(effectId: string, value: string) {
    patchDraft({
      effects: draft.effects.map((effect) =>
        effect.id === effectId
          ? {
              ...effect,
              target: value,
              value:
                isCustomTraitAbilityValue(effect.value) &&
                !doesCustomTraitTargetAllowAbilityValue(value)
                  ? "0"
                  : effect.value,
              rollMode: isCustomTraitRollModeDisabledTarget(value) ? "normal" : effect.rollMode
            }
          : effect
      )
    });
  }

  function handleEffectValueChange(effectId: string, value: string) {
    patchDraft({
      effects: draft.effects.map((effect) =>
        effect.id === effectId ? { ...effect, value } : effect
      )
    });
  }

  function handleEffectValueModeChange(effectId: string, value: CharacterCustomTraitValueMode) {
    patchDraft({
      effects: draft.effects.map((effect) =>
        effect.id === effectId ? { ...effect, valueMode: value } : effect
      )
    });
  }

  function handleEffectRollModeChange(
    effectId: string,
    value: CustomTraitEffectDraft["rollMode"]
  ) {
    patchDraft({
      effects: draft.effects.map((effect) =>
        effect.id === effectId
          ? {
              ...effect,
              rollMode: isCustomTraitRollModeDisabledTarget(effect.target) ? "normal" : value
            }
          : effect
      )
    });
  }

  function handleRemoveEffect(effectId: string) {
    if (draft.effects.length === 1) {
      patchDraft({ effects: [createCustomTraitEffectDraft()] });
      return;
    }

    patchDraft({ effects: draft.effects.filter((effect) => effect.id !== effectId) });
  }

  function buildMods(): CharacterItemMods | null {
    const name = sanitizeUserInput(draft.name).trim();

    if (!name) {
      setFormError("Name is required.");
      return null;
    }

    const damage = normalizeDamageRows(draft.damage);

    if (selectedCategory === "weapon" && !damage) {
      setFormError("At least one valid damage row is required.");
      return null;
    }

    const effects = draft.effects
      .map(parseCustomTraitEffectDraft)
      .filter((effect): effect is NonNullable<typeof effect> => effect !== null)
      .slice(0, ITEM_MOD_EFFECT_LIMIT);
    const mods: CharacterItemMods = {
      baseCategory: selectedCategory,
      isCustom: mode === "create" || initialStack?.mods?.isCustom === true,
      name,
      description: sanitizeUserInput(draft.description),
      cost: {
        amount: Math.floor(clampNumber(draft.costAmount, 0, 999999999, 0)),
        currency: draft.costCurrency
      },
      weight: normalizeNumericInput(draft.weight, 1),
      isMagicItem: draft.isMagicItem,
      requiresAttunement: draft.requiresAttunement,
      effects
    };

    if (selectedCategory === "weapon") {
      mods.weapon = {
        baseWeapon: draft.baseWeapon,
        training: draft.training,
        combat: draft.combat,
        damage: damage ?? [[DICE.D6, [DAMAGE_TYPE.SLASHING]]],
        properties: draft.properties,
        mastery: draft.mastery || undefined,
        range: hasRangeFields
          ? {
              normal: Math.floor(clampNumber(draft.rangeNormal, 1, 9999, 20)),
              long: Math.floor(clampNumber(draft.rangeLong, 1, 9999, 60)),
              ...(sanitizeUserInput(draft.ammunition).trim()
                ? { ammunition: sanitizeUserInput(draft.ammunition).trim() }
                : {})
            }
          : undefined,
        versatileDamage: hasVersatileFields
          ? (normalizeDamageRows(draft.versatileDamage) ?? undefined)
          : undefined
      };
    }

    if (selectedCategory === "armor") {
      mods.armor = {
        armorType: draft.armorType,
        armorClass: Math.floor(clampNumber(draft.armorClass, 0, 30, draft.armorType === "shield" ? 2 : 11))
      };
    }

    return normalizeCharacterItemMods(mods) ?? null;
  }

  function handleSubmit() {
    const mods = buildMods();

    if (!mods) {
      return;
    }

    const settingsResult = isContainerOrPackEdit
      ? {
          settings: {
            chargesTotal: initialStack?.chargesTotal,
            storedSpell: initialStack?.storedSpell,
            featureTags: initialStack?.featureTags,
            conjuredSource: initialStack?.conjuredSource,
            conjuredDuration: initialStack?.conjuredDuration
          },
          error: null
        }
      : parseCustomEquipmentItemSettingsDraft(settingsDraft, initialStack);

    if (settingsResult.settings === null) {
      setFormError(settingsResult.error);
      return;
    }

    onSave({
      item: createCustomItemRecordFromMods(getCustomItemId(initialStack), mods),
      mods,
      settings: settingsResult.settings
    });
  }

  return (
    <>
      <OverlayBody className={styles.customEquipmentEditorBody}>
        {showCategorySelector ? (
          <div className={styles.customEquipmentCategoryGrid} aria-label="Equipment category">
            {categoryOptions.map((option) => (
              <RadioContainerOption
                key={option.value}
                name="custom-equipment-category"
                header={option.label}
                selected={selectedCategory === option.value}
                onSelect={() => patchDraft({ category: option.value })}
                className={styles.customEquipmentChoiceOption}
              />
            ))}
          </div>
        ) : null}

        {mode === "edit" ? (
          <div className={styles.customEquipmentArchetypeRow}>
            <label className={styles.customEquipmentField}>
              <span>Base Archetype</span>
              <SelectInput
                value={selectedCategory}
                disabled={!isBaseArchetypeEditingEnabled}
                onChange={(event) =>
                  patchDraft({ category: event.target.value as CharacterItemModCategory })
                }
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
            {canEditBaseArchetype && !isBaseArchetypeEditingEnabled ? (
              <button
                type="button"
                className={styles.customEquipmentArchetypeEditButton}
                onClick={() => setIsBaseArchetypeEditingEnabled(true)}
              >
                Edit base archetype
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={styles.customEquipmentFormStack}>
          <div className={styles.customEquipmentNameRow}>
            <label className={styles.customEquipmentField}>
              <span>Name</span>
              <TextInput
                value={draft.name}
                onChange={(event) => patchDraft({ name: event.target.value })}
              />
            </label>

            <div className={styles.customEquipmentCheckboxRow}>
              <label className={styles.customEquipmentCheckbox}>
                <input
                  type="checkbox"
                  checked={draft.isMagicItem}
                  onChange={(event) => patchDraft({ isMagicItem: event.target.checked })}
                />
                <span>Magic</span>
              </label>
              <label className={styles.customEquipmentCheckbox}>
                <input
                  type="checkbox"
                  checked={draft.requiresAttunement}
                  onChange={(event) => patchDraft({ requiresAttunement: event.target.checked })}
                />
                <span>Attunement</span>
              </label>
            </div>
          </div>

          <div className={styles.customEquipmentCostRow}>
            <label className={styles.customEquipmentField}>
              <span>Cost</span>
              <NumberInput
                min={0}
                value={draft.costAmount}
                onChange={(event) =>
                  patchDraft({
                    costAmount: Math.floor(clampNumber(event.target.valueAsNumber, 0, 999999999, 0))
                  })
                }
              />
            </label>
            <label className={styles.customEquipmentField}>
              <span>Currency</span>
              <SelectInput
                value={draft.costCurrency}
                onChange={(event) =>
                  patchDraft({ costCurrency: event.target.value as CURRENCY_TYPE })
                }
              >
                {currencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </SelectInput>
            </label>
            <label className={styles.customEquipmentField}>
              <span>Weight (lb)</span>
              <NumberInput
                min={0}
                step={0.1}
                value={draft.weight}
                onChange={(event) =>
                  patchDraft({ weight: normalizeNumericInput(event.target.valueAsNumber, draft.weight) })
                }
              />
            </label>
          </div>

          <label className={styles.customEquipmentField}>
            <span>Description</span>
            <TextAreaInput
              rows={3}
              className={styles.customEquipmentCompactTextarea}
              value={draft.description}
              onChange={(event) => patchDraft({ description: event.target.value })}
            />
          </label>
        </div>

        <div className={styles.customEquipmentDivider} />

        {selectedCategory === "weapon" ? (
          <div className={styles.customEquipmentFormStack}>
            <div className={styles.customEquipmentThreeColumnRow}>
              <label className={styles.customEquipmentField}>
                <span>Base Weapon</span>
                <SelectInput
                  value={draft.baseWeapon}
                  onChange={(event) =>
                    patchDraft({ baseWeapon: event.target.value as WEAPON_BASE })
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
                  value={draft.training}
                  onChange={(event) =>
                    patchDraft({ training: event.target.value as WEAPON_TRAINING })
                  }
                >
                  {weaponTrainingOptions.map((training) => (
                    <option key={training} value={training}>
                      {formatCodexLabel(training)}
                    </option>
                  ))}
                </SelectInput>
              </label>
              <label className={styles.customEquipmentField}>
                <span>Combat</span>
                <SelectInput
                  value={draft.combat}
                  onChange={(event) =>
                    patchDraft({ combat: event.target.value as WEAPON_COMBAT_TYPE })
                  }
                >
                  {weaponCombatOptions.map((combat) => (
                    <option key={combat} value={combat}>
                      {formatCodexLabel(combat)}
                    </option>
                  ))}
                </SelectInput>
              </label>
              <label className={styles.customEquipmentField}>
                <span>Mastery</span>
                <SelectInput
                  value={draft.mastery}
                  onChange={(event) =>
                    patchDraft({ mastery: event.target.value as WEAPON_MASTERY | "" })
                  }
                >
                  <option value="">None</option>
                  {weaponMasteryOptions.map((mastery) => (
                    <option key={mastery} value={mastery}>
                      {formatCodexLabel(mastery)}
                    </option>
                  ))}
                </SelectInput>
              </label>
            </div>

            <section className={styles.customEquipmentSection}>
              <div className={styles.customEquipmentSectionHeader}>
                <p className={styles.customEquipmentSectionTitle}>Properties</p>
              </div>
              <div className={styles.customPropertyGrid}>
                {weaponPropertyOptions.map((property) => {
                  const isActive = draft.properties.includes(property);

                  return (
                    <RadioContainerOption
                      key={property}
                      header={formatCodexLabel(property)}
                      selected={isActive}
                      onSelect={() => toggleProperty(property)}
                      indicatorType="checkbox"
                      className={clsx(
                        styles.customEquipmentChoiceOption,
                        styles.customPropertyOption
                      )}
                    />
                  );
                })}
              </div>
            </section>

            <section className={styles.customEquipmentSection}>
              <div className={styles.customEquipmentSectionHeader}>
                <p className={styles.customEquipmentSectionTitle}>Damage</p>
                <button
                  type="button"
                  className={clsx(shared.editButton, styles.customEquipmentInlineButton)}
                  onClick={() => patchDraft({ damage: [...draft.damage, createDamageRowDraft()] })}
                >
                  <Plus size={15} aria-hidden="true" />
                  Add
                </button>
              </div>
              <div className={styles.customDamageList}>
                {draft.damage.map((row) => (
                  <div key={row.id} className={styles.customDamageRow}>
                    <label className={styles.customEquipmentField}>
                      <span>Amount</span>
                      <SelectInput
                        value={row.amount}
                        onChange={(event) =>
                          updateDamageRow(row.id, { amount: event.target.value })
                        }
                      >
                        {damageAmountOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </SelectInput>
                    </label>
                    <label className={styles.customEquipmentField}>
                      <span>Type</span>
                      <SelectInput
                        value={row.damageType}
                        onChange={(event) =>
                          updateDamageRow(row.id, {
                            damageType: event.target.value as DAMAGE_TYPE
                          })
                        }
                      >
                        {damageTypeOptions.map((damageType) => (
                          <option key={damageType} value={damageType}>
                            {formatCodexLabel(damageType)}
                          </option>
                        ))}
                      </SelectInput>
                    </label>
                    <button
                      type="button"
                      className={styles.customDamageRemoveButton}
                      disabled={draft.damage.length === 1}
                      onClick={() =>
                        patchDraft({ damage: draft.damage.filter((entry) => entry.id !== row.id) })
                      }
                      aria-label="Remove damage row"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {hasRangeFields ? (
              <section className={styles.customEquipmentSection}>
                <p className={styles.customEquipmentSectionTitle}>Range</p>
                <div className={styles.customEquipmentFormGrid}>
                  <label className={styles.customEquipmentField}>
                    <span>Normal</span>
                    <NumberInput
                      min={1}
                      value={draft.rangeNormal}
                      onChange={(event) =>
                        patchDraft({
                          rangeNormal: Math.floor(clampNumber(event.target.valueAsNumber, 1, 9999, 20))
                        })
                      }
                    />
                  </label>
                  <label className={styles.customEquipmentField}>
                    <span>Long</span>
                    <NumberInput
                      min={1}
                      value={draft.rangeLong}
                      onChange={(event) =>
                        patchDraft({
                          rangeLong: Math.floor(clampNumber(event.target.valueAsNumber, 1, 9999, 60))
                        })
                      }
                    />
                  </label>
                  <label className={styles.customEquipmentField}>
                    <span>Ammunition</span>
                    <TextInput
                      value={draft.ammunition}
                      onChange={(event) => patchDraft({ ammunition: event.target.value })}
                    />
                  </label>
                </div>
              </section>
            ) : null}

            {hasVersatileFields ? (
              <section className={styles.customEquipmentSection}>
                <div className={styles.customEquipmentSectionHeader}>
                  <p className={styles.customEquipmentSectionTitle}>Versatile Damage</p>
                  <button
                    type="button"
                    className={clsx(shared.editButton, styles.customEquipmentInlineButton)}
                    onClick={() =>
                      patchDraft({
                        versatileDamage: [...draft.versatileDamage, createDamageRowDraft()]
                      })
                    }
                  >
                    <Plus size={15} aria-hidden="true" />
                    Add
                  </button>
                </div>
                <div className={styles.customDamageList}>
                  {draft.versatileDamage.map((row) => (
                    <div key={row.id} className={styles.customDamageRow}>
                      <label className={styles.customEquipmentField}>
                        <span>Amount</span>
                        <SelectInput
                          value={row.amount}
                          onChange={(event) =>
                            updateVersatileDamageRow(row.id, { amount: event.target.value })
                          }
                        >
                          {damageAmountOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </SelectInput>
                      </label>
                      <label className={styles.customEquipmentField}>
                        <span>Type</span>
                        <SelectInput
                          value={row.damageType}
                          onChange={(event) =>
                            updateVersatileDamageRow(row.id, {
                              damageType: event.target.value as DAMAGE_TYPE
                            })
                          }
                        >
                          {damageTypeOptions.map((damageType) => (
                            <option key={damageType} value={damageType}>
                              {formatCodexLabel(damageType)}
                            </option>
                          ))}
                        </SelectInput>
                      </label>
                      <button
                        type="button"
                        className={styles.customDamageRemoveButton}
                        disabled={draft.versatileDamage.length === 1}
                        onClick={() =>
                          patchDraft({
                            versatileDamage: draft.versatileDamage.filter(
                              (entry) => entry.id !== row.id
                            )
                          })
                        }
                        aria-label="Remove versatile damage row"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {selectedCategory === "armor" ? (
          <div className={styles.customEquipmentFormGrid}>
            <label className={styles.customEquipmentField}>
              <span>Type</span>
              <SelectInput
                value={draft.armorType}
                onChange={(event) =>
                  patchDraft({
                    armorType: event.target.value as CustomArmorType,
                    armorClass: event.target.value === "shield" ? 2 : draft.armorClass
                  })
                }
              >
                {armorTypeOptions.map((armorType) => (
                  <option key={armorType} value={armorType}>
                    {formatCodexLabel(armorType)}
                  </option>
                ))}
              </SelectInput>
            </label>
            <label className={styles.customEquipmentField}>
              <span>{draft.armorType === "shield" ? "AC Bonus" : "Armor Class"}</span>
              <NumberInput
                min={0}
                max={30}
                value={draft.armorClass}
                onChange={(event) =>
                  patchDraft({
                    armorClass: Math.floor(
                      clampNumber(event.target.valueAsNumber, 0, 30, draft.armorType === "shield" ? 2 : 11)
                    )
                  })
                }
              />
            </label>
          </div>
        ) : null}

        {selectedCategory !== "general" && !isContainerOrPackEdit ? (
          <div className={styles.customEquipmentDivider} />
        ) : null}

        {!isContainerOrPackEdit ? (
          <>
            <CustomEquipmentItemSettings
              initialStack={initialStack}
              draft={settingsDraft}
              onChange={patchSettingsDraft}
            />

            <div className={styles.customEquipmentDivider} />

            <ModEffectsEditor
              effects={draft.effects}
              maxEffects={ITEM_MOD_EFFECT_LIMIT}
              onAddEffect={() =>
                patchDraft({
                  effects:
                    draft.effects.length >= ITEM_MOD_EFFECT_LIMIT
                      ? draft.effects
                      : [...draft.effects, createCustomTraitEffectDraft()]
                })
              }
              onEffectTargetChange={handleEffectTargetChange}
              onEffectValueChange={handleEffectValueChange}
              onEffectValueModeChange={handleEffectValueModeChange}
              onEffectRollModeChange={handleEffectRollModeChange}
              onRemoveEffect={handleRemoveEffect}
            />
          </>
        ) : null}
      </OverlayBody>

      <OverlayFooter className={styles.customEquipmentEditorFooter}>
        {formError ? <p className={styles.customEquipmentError}>{formError}</p> : null}
        <div className={styles.customEquipmentActionRow}>
          <ActionButton
            actionType="INFO"
            variant="OUTLINE"
            className={styles.customEquipmentFooterButton}
            onClick={onCancel}
            icon={<X size={16} aria-hidden="true" />}
          >
            Cancel
          </ActionButton>
          <ActionButton
            className={styles.customEquipmentFooterButton}
            onClick={handleSubmit}
            icon={<Check size={16} aria-hidden="true" />}
          >
            Save
          </ActionButton>
        </div>
      </OverlayFooter>
    </>
  );
}

export default CustomEquipmentEditor;
