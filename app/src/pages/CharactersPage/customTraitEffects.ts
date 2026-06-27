import { WEAPON_COMBAT_TYPE } from "../../codex/entries/enums";
import {
  EFFECT_NAME,
  characterCustomTraitDiceValues,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type CharacterCustomTraitDiceValue,
  type CharacterCustomTraitEffect,
  type CharacterCustomTraitEffectValue,
  type CharacterCustomTraitRollMode,
  type CharacterCustomTraitSkillGroupAbility,
  type CharacterCustomTraitValueMode,
  type CharacterStatusEntry,
} from "../../types/traits";
import type { AbilityKey } from "../../types/characters";
import { isSkillName, type SkillName } from "../../types/skills";
import { skillGroupsByAbility } from "./skillDefinitions";

const abilityKeys: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const skillGroupAbilityKeys: CharacterCustomTraitSkillGroupAbility[] = skillGroupsByAbility
  .map((group) => group.ability)
  .filter((ability): ability is CharacterCustomTraitSkillGroupAbility => ability !== "CON");
const skillGroupAbilityValues = new Set<CharacterCustomTraitSkillGroupAbility>(
  skillGroupAbilityKeys
);
const skillGroupAbilityBySkill = new Map<SkillName, CharacterCustomTraitSkillGroupAbility>(
  skillGroupsByAbility.flatMap((group) =>
    group.ability === "CON"
      ? []
      : group.skills.map((skill) => [
          skill,
          group.ability as CharacterCustomTraitSkillGroupAbility
        ] as [SkillName, CharacterCustomTraitSkillGroupAbility])
  )
);
const customTraitEffectTypes = new Set<CharacterCustomTraitEffect["type"]>([
  "actualMaxHitPoints",
  "armorClass",
  "initiative",
  "passivePerception",
  "speed",
  "spellAttack",
  "spellDc",
  "abilityScore",
  "abilityModifier",
  "savingThrow",
  "savingThrows",
  "skill",
  "skillGroup",
  "weaponDamage"
]);
const customTraitWeaponDamageKinds = new Set<
  Extract<CharacterCustomTraitEffect, { type: "weaponDamage" }>["attackKind"]
>(["unarmed", WEAPON_COMBAT_TYPE.MELEE, WEAPON_COMBAT_TYPE.RANGED]);
const customTraitRollModes = new Set<CharacterCustomTraitRollMode>([
  "normal",
  "advantage",
  "disadvantage"
]);
const customTraitValueModes = new Set<CharacterCustomTraitValueMode>(["buff", "debuff"]);

export type CustomTraitFlatBonus = {
  label: string;
  value: number;
  formula?: string;
  formulaMultiplier?: 1 | -1;
  abilityModifierSource?: AbilityKey;
  abilityModifierMultiplier?: 1 | -1;
  formulaSourceLabel?: string;
};

export type CustomTraitEffectSource = {
  label: string;
  effects: CharacterCustomTraitEffect[];
};

export type CustomTraitRollIndicator = {
  label: string;
  tone: "advantage" | "disadvantage";
  source: string;
};

export type CustomTraitBonusInput =
  | CharacterStatusEntry[]
  | {
      statusEntries?: CharacterStatusEntry[];
      effectSources?: CustomTraitEffectSource[];
    }
  | undefined;

function normalizeCustomTraitRollMode(value: unknown): CharacterCustomTraitRollMode {
  return customTraitRollModes.has(value as CharacterCustomTraitRollMode)
    ? (value as CharacterCustomTraitRollMode)
    : "normal";
}

function normalizeCustomTraitValueMode(value: unknown): CharacterCustomTraitValueMode {
  return customTraitValueModes.has(value as CharacterCustomTraitValueMode)
    ? (value as CharacterCustomTraitValueMode)
    : "buff";
}

function normalizeCustomTraitEffectValue(
  value: unknown,
  options: {
    allowAbilityValue: boolean;
    allowDiceValue: boolean;
    allowZero: boolean;
  }
): CharacterCustomTraitEffectValue | null {
  if (options.allowAbilityValue && isAbilityKey(value)) {
    return value;
  }

  if (options.allowDiceValue && isCharacterCustomTraitDiceValue(value)) {
    return value;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const normalizedValue = Math.trunc(value);
  return normalizedValue === 0 && !options.allowZero ? null : normalizedValue;
}

function isAbilityKey(value: unknown): value is AbilityKey {
  return typeof value === "string" && abilityKeys.includes(value as AbilityKey);
}

function isCustomTraitSkillGroupAbility(
  value: unknown
): value is CharacterCustomTraitSkillGroupAbility {
  return skillGroupAbilityValues.has(value as CharacterCustomTraitSkillGroupAbility);
}

export function isCharacterCustomTraitDiceValue(
  value: unknown
): value is CharacterCustomTraitDiceValue {
  return (
    typeof value === "string" &&
    characterCustomTraitDiceValues.includes(value as CharacterCustomTraitDiceValue)
  );
}

function createValueModeFields(valueMode: CharacterCustomTraitValueMode) {
  return valueMode === "debuff" ? { valueMode } : {};
}

function isRollModeDisabledEffectType(type: CharacterCustomTraitEffect["type"]): boolean {
  return (
    type === "actualMaxHitPoints" ||
    type === "armorClass" ||
    type === "speed" ||
    type === "spellDc"
  );
}

function isAbilityValueAllowedEffectType(type: CharacterCustomTraitEffect["type"]): boolean {
  return (
    type !== "actualMaxHitPoints" &&
    type !== "abilityScore" &&
    type !== "abilityModifier" &&
    type !== "savingThrow" &&
    type !== "savingThrows"
  );
}

function isDiceValueAllowedEffectType(type: CharacterCustomTraitEffect["type"]): boolean {
  return (
    type === "initiative" ||
    type === "savingThrow" ||
    type === "savingThrows" ||
    type === "skill" ||
    type === "skillGroup" ||
    type === "spellAttack" ||
    type === "weaponDamage"
  );
}

function normalizeCharacterCustomTraitEffect(value: unknown): CharacterCustomTraitEffect | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<CharacterCustomTraitEffect>;

  if (!customTraitEffectTypes.has(record.type as CharacterCustomTraitEffect["type"])) {
    return null;
  }

  const effectType = record.type as CharacterCustomTraitEffect["type"];
  const rollMode = isRollModeDisabledEffectType(effectType)
    ? "normal"
    : normalizeCustomTraitRollMode(record.rollMode);
  const valueMode = normalizeCustomTraitValueMode(record.valueMode);
  const normalizedValue = normalizeCustomTraitEffectValue(record.value, {
    allowAbilityValue: isAbilityValueAllowedEffectType(effectType),
    allowDiceValue: isDiceValueAllowedEffectType(effectType),
    allowZero: rollMode !== "normal"
  });

  if (normalizedValue === null) {
    return null;
  }

  const rollModeFields = rollMode === "normal" ? {} : { rollMode };
  const valueModeFields = createValueModeFields(valueMode);

  switch (record.type) {
    case "actualMaxHitPoints":
      return typeof normalizedValue === "number"
        ? {
            type: "actualMaxHitPoints",
            value: normalizedValue,
            ...valueModeFields
          }
        : null;
    case "armorClass":
    case "initiative":
    case "passivePerception":
    case "speed":
    case "spellAttack":
    case "spellDc":
    case "savingThrows":
      return {
        type: record.type,
        value: normalizedValue,
        ...valueModeFields,
        ...rollModeFields
      };
    case "abilityScore":
    case "abilityModifier":
      return isAbilityKey(record.ability)
        ? {
            type: record.type,
            ability: record.ability,
            value: normalizedValue as number,
            ...valueModeFields,
            ...rollModeFields
          }
        : null;
    case "savingThrow":
      return isAbilityKey(record.ability)
        ? {
            type: record.type,
            ability: record.ability,
            value: normalizedValue,
            ...valueModeFields,
            ...rollModeFields
          }
        : null;
    case "skill":
      return isSkillName(record.skill)
        ? {
            type: "skill",
            skill: record.skill,
            value: normalizedValue,
            ...valueModeFields,
            ...rollModeFields
          }
        : null;
    case "skillGroup":
      return isCustomTraitSkillGroupAbility(record.ability)
        ? {
            type: "skillGroup",
            ability: record.ability,
            value: normalizedValue,
            ...valueModeFields,
            ...rollModeFields
          }
        : null;
    case "weaponDamage":
      return customTraitWeaponDamageKinds.has(
        record.attackKind as Extract<
          CharacterCustomTraitEffect,
          { type: "weaponDamage" }
        >["attackKind"]
      )
        ? {
            type: "weaponDamage",
            attackKind: record.attackKind as Extract<
              CharacterCustomTraitEffect,
              { type: "weaponDamage" }
            >["attackKind"],
            value: normalizedValue,
            ...valueModeFields,
            ...rollModeFields
          }
        : null;
    default:
      return null;
  }
}

function mapCustomTraitBonuses(
  input: CustomTraitBonusInput,
  predicate: (effect: CharacterCustomTraitEffect) => boolean
): CustomTraitFlatBonus[] {
  const statusEntries = Array.isArray(input) ? input : input?.statusEntries;
  const effectSources = Array.isArray(input) ? [] : (input?.effectSources ?? []);
  const statusBonuses = (statusEntries ?? []).flatMap((entry) => {
    if (entry.disabled || !isCustomFeatureTraitStatusEntry(entry)) {
      return [];
    }

    const label = String(entry.value).trim() || entry.source;

    return entry.customEffects
      .filter(predicate)
      .map((effect) => createCustomTraitFlatBonus(label, effect))
      .filter((effect): effect is CustomTraitFlatBonus => effect !== null);
  });

  return [
    ...statusBonuses,
    ...effectSources.flatMap((source) =>
      source.effects
        .filter(predicate)
        .map((effect) => createCustomTraitFlatBonus(source.label, effect))
        .filter((effect): effect is CustomTraitFlatBonus => effect !== null)
    )
  ];
}

function mapCustomTraitRollIndicators(
  input: CustomTraitBonusInput,
  predicate: (effect: CharacterCustomTraitEffect) => boolean
): CustomTraitRollIndicator[] {
  return mapCustomTraitEffectSources(input, predicate).flatMap(({ label, effect }) => {
    if (effect.rollMode !== "advantage" && effect.rollMode !== "disadvantage") {
      return [];
    }

    return [
      {
        label: effect.rollMode === "advantage" ? "Advantage" : "Disadvantage",
        tone: effect.rollMode,
        source: label
      }
    ];
  });
}

function mapCustomTraitEffectSources(
  input: CustomTraitBonusInput,
  predicate: (effect: CharacterCustomTraitEffect) => boolean
): Array<{ label: string; effect: CharacterCustomTraitEffect }> {
  const statusEntries = Array.isArray(input) ? input : input?.statusEntries;
  const effectSources = Array.isArray(input) ? [] : (input?.effectSources ?? []);
  const statusEffects = (statusEntries ?? []).flatMap((entry) => {
    if (entry.disabled || !isCustomFeatureTraitStatusEntry(entry)) {
      return [];
    }

    const label = String(entry.value).trim() || entry.source;
    return entry.customEffects.filter(predicate).map((effect) => ({ label, effect }));
  });

  return [
    ...statusEffects,
    ...effectSources.flatMap((source) =>
      source.effects.filter(predicate).map((effect) => ({ label: source.label, effect }))
    )
  ];
}

export function normalizeCharacterCustomTraitEffects(value: unknown): CharacterCustomTraitEffect[] {
  return Array.isArray(value)
    ? value
        .map((entry) => normalizeCharacterCustomTraitEffect(entry))
        .filter((entry): entry is CharacterCustomTraitEffect => entry !== null)
    : [];
}

export function isCustomFeatureTraitStatusEntry(
  entry: Pick<CharacterStatusEntry, "customEffects" | "group" | "sourceType" | "value">
): entry is CharacterStatusEntry & {
  customEffects: CharacterCustomTraitEffect[];
} {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.MANUAL &&
    entry.value !== EFFECT_NAME.CONCENTRATION &&
    Array.isArray(entry.customEffects)
  );
}

export function getCustomTraitArmorClassBonuses(
  statusEntries: CustomTraitBonusInput
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(statusEntries, (effect) => effect.type === "armorClass");
}

export function getCustomTraitActualMaxHitPointBonuses(
  statusEntries: CustomTraitBonusInput
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(statusEntries, (effect) => effect.type === "actualMaxHitPoints");
}

export function getCustomTraitInitiativeBonuses(
  statusEntries: CustomTraitBonusInput
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(statusEntries, (effect) => effect.type === "initiative");
}

export function getCustomTraitPassivePerceptionBonuses(
  statusEntries: CustomTraitBonusInput
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(statusEntries, (effect) => effect.type === "passivePerception");
}

export function getCustomTraitSpeedBonuses(
  statusEntries: CustomTraitBonusInput
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(statusEntries, (effect) => effect.type === "speed");
}

export function getCustomTraitSpellAttackBonuses(
  statusEntries: CustomTraitBonusInput
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(statusEntries, (effect) => effect.type === "spellAttack");
}

export function getCustomTraitSpellDcBonuses(
  statusEntries: CustomTraitBonusInput
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(statusEntries, (effect) => effect.type === "spellDc");
}

export function getCustomTraitAbilityScoreBonuses(
  statusEntries: CustomTraitBonusInput,
  ability: AbilityKey
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(
    statusEntries,
    (effect) => effect.type === "abilityScore" && effect.ability === ability
  );
}

export function getCustomTraitAbilityModifierBonuses(
  statusEntries: CustomTraitBonusInput,
  ability: AbilityKey
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(
    statusEntries,
    (effect) => effect.type === "abilityModifier" && effect.ability === ability
  );
}

export function getCustomTraitSavingThrowBonuses(
  statusEntries: CustomTraitBonusInput,
  ability: AbilityKey
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(
    statusEntries,
    (effect) =>
      effect.type === "savingThrows" ||
      (effect.type === "savingThrow" && effect.ability === ability)
  );
}

function doesCustomTraitEffectApplyToSkill(
  effect: CharacterCustomTraitEffect,
  skill: SkillName
): boolean {
  if (effect.type === "skill") {
    return effect.skill === skill;
  }

  return effect.type === "skillGroup" && effect.ability === skillGroupAbilityBySkill.get(skill);
}

export function getCustomTraitSkillBonuses(
  statusEntries: CustomTraitBonusInput,
  skill: SkillName
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(
    statusEntries,
    (effect) => doesCustomTraitEffectApplyToSkill(effect, skill)
  );
}

export function getCustomTraitWeaponDamageBonuses(
  statusEntries: CustomTraitBonusInput,
  context: {
    attackKind: "weapon" | "unarmed";
    combatType?: WEAPON_COMBAT_TYPE | null;
  }
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(statusEntries, (effect) => {
    if (effect.type !== "weaponDamage") {
      return false;
    }

    if (effect.attackKind === "unarmed") {
      return context.attackKind === "unarmed";
    }

    return context.attackKind === "weapon" && context.combatType === effect.attackKind;
  });
}

export function getCustomTraitInitiativeRollIndicators(
  statusEntries: CustomTraitBonusInput
): CustomTraitRollIndicator[] {
  return mapCustomTraitRollIndicators(statusEntries, (effect) => effect.type === "initiative");
}

export function getCustomTraitPassivePerceptionRollIndicators(
  statusEntries: CustomTraitBonusInput
): CustomTraitRollIndicator[] {
  return mapCustomTraitRollIndicators(
    statusEntries,
    (effect) => effect.type === "passivePerception"
  );
}

export function getCustomTraitAbilityCheckRollIndicators(
  statusEntries: CustomTraitBonusInput,
  ability: AbilityKey
): CustomTraitRollIndicator[] {
  return mapCustomTraitRollIndicators(
    statusEntries,
    (effect) =>
      (effect.type === "abilityScore" || effect.type === "abilityModifier") &&
      effect.ability === ability
  );
}

export function getCustomTraitSavingThrowRollIndicators(
  statusEntries: CustomTraitBonusInput,
  ability: AbilityKey
): CustomTraitRollIndicator[] {
  return mapCustomTraitRollIndicators(
    statusEntries,
    (effect) =>
      effect.type === "savingThrows" ||
      (effect.type === "savingThrow" && effect.ability === ability)
  );
}

export function getCustomTraitSkillRollIndicators(
  statusEntries: CustomTraitBonusInput,
  skill: SkillName
): CustomTraitRollIndicator[] {
  return mapCustomTraitRollIndicators(
    statusEntries,
    (effect) => doesCustomTraitEffectApplyToSkill(effect, skill)
  );
}

export function getCustomTraitWeaponAttackRollIndicators(
  statusEntries: CustomTraitBonusInput,
  context: {
    attackKind: "weapon" | "unarmed";
    combatType?: WEAPON_COMBAT_TYPE | null;
  }
): CustomTraitRollIndicator[] {
  return mapCustomTraitRollIndicators(statusEntries, (effect) => {
    if (effect.type !== "weaponDamage") {
      return false;
    }

    if (effect.attackKind === "unarmed") {
      return context.attackKind === "unarmed";
    }

    return context.attackKind === "weapon" && context.combatType === effect.attackKind;
  });
}

export function getCustomTraitSpellAttackRollIndicators(
  statusEntries: CustomTraitBonusInput
): CustomTraitRollIndicator[] {
  return mapCustomTraitRollIndicators(statusEntries, (effect) => effect.type === "spellAttack");
}

export function formatCharacterCustomTraitEffectTargetLabel(
  effect: CharacterCustomTraitEffect
): string {
  switch (effect.type) {
    case "actualMaxHitPoints":
      return "Actual Max HP";
    case "armorClass":
      return "Armor Class";
    case "initiative":
      return "Initiative";
    case "passivePerception":
      return "Passive Perception";
    case "speed":
      return "Speed";
    case "spellAttack":
      return "Spell Attack";
    case "spellDc":
      return "Spell DC";
    case "abilityScore":
      return `${effect.ability} Ability Score`;
    case "abilityModifier":
      return `${effect.ability} Modifier`;
    case "savingThrow":
      return `${effect.ability} Saving Throw`;
    case "savingThrows":
      return "All Saving Throws";
    case "skill":
      return effect.skill;
    case "skillGroup":
      return `${effect.ability} Skills`;
    case "weaponDamage":
      return effect.attackKind === "unarmed"
        ? "Unarmed Strike"
        : effect.attackKind === WEAPON_COMBAT_TYPE.MELEE
          ? "Melee Weapons"
          : "Ranged Weapons";
    default:
      return "Effect";
  }
}

function getCustomTraitEffectValueMultiplier(
  effect: Pick<CharacterCustomTraitEffect, "valueMode">
): 1 | -1 {
  return effect.valueMode === "debuff" ? -1 : 1;
}

function createCustomTraitFlatBonus(
  label: string,
  effect: CharacterCustomTraitEffect
): CustomTraitFlatBonus | null {
  const multiplier = getCustomTraitEffectValueMultiplier(effect);

  if (typeof effect.value === "number") {
    const value = Math.trunc(effect.value) * multiplier;
    return value === 0 ? null : { label, value, formulaSourceLabel: label };
  }

  if (isCharacterCustomTraitDiceValue(effect.value)) {
    return {
      label,
      value: 0,
      formula: effect.value,
      formulaMultiplier: multiplier,
      formulaSourceLabel: label
    };
  }

  return {
    label,
    value: 0,
    abilityModifierSource: effect.value,
    abilityModifierMultiplier: multiplier,
    formulaSourceLabel: label
  };
}

export function formatCustomTraitBonusFormulaTerm(
  bonus: Pick<
    CustomTraitFlatBonus,
    | "abilityModifierSource"
    | "formula"
    | "formulaMultiplier"
    | "formulaSourceLabel"
    | "value"
  >
): string | null {
  const sourceLabel = bonus.formulaSourceLabel?.trim();

  if (!sourceLabel) {
    return null;
  }

  const formula = bonus.formula?.trim();

  if (formula) {
    const formulaSign = bonus.formulaMultiplier === -1 ? "-" : "+";
    return `${formulaSign}${formula} (${sourceLabel})`;
  }

  const value = Math.trunc(bonus.value);
  if (value === 0) {
    return null;
  }

  const valueLabel = `${value >= 0 ? "+" : "-"}${Math.abs(value)}`;
  const abilityLabel = bonus.abilityModifierSource ? ` ${bonus.abilityModifierSource}` : "";

  return `${valueLabel}${abilityLabel} (${sourceLabel})`;
}

export function formatCustomTraitBonusRollFormulaTerm(
  bonus: Pick<CustomTraitFlatBonus, "formula" | "formulaMultiplier">
): string | null {
  const formula = bonus.formula?.trim();

  if (!formula) {
    return null;
  }

  return `${bonus.formulaMultiplier === -1 ? "-" : "+"}${formula}`;
}

export function formatCharacterCustomTraitEffectValue(
  effect: Pick<CharacterCustomTraitEffect, "value" | "valueMode">
): string {
  const multiplier = getCustomTraitEffectValueMultiplier(effect);

  if (typeof effect.value === "number") {
    const value = Math.trunc(effect.value) * multiplier;
    return value >= 0 ? `+${value}` : String(value);
  }

  if (isCharacterCustomTraitDiceValue(effect.value)) {
    return multiplier === -1 ? `-${effect.value}` : `+${effect.value}`;
  }

  return multiplier === -1 ? `-${effect.value}` : `+${effect.value}`;
}

function formatCharacterCustomTraitRollMode(effect: CharacterCustomTraitEffect): string | null {
  if (effect.rollMode === "advantage") {
    return "Advantage";
  }

  if (effect.rollMode === "disadvantage") {
    return "Disadvantage";
  }

  return null;
}

export function formatCharacterCustomTraitEffectSummary(
  effect: CharacterCustomTraitEffect
): string {
  const parts = [
    typeof effect.value === "number" && effect.value === 0
      ? null
      : formatCharacterCustomTraitEffectValue(effect),
    formatCharacterCustomTraitRollMode(effect)
  ].filter((entry): entry is string => Boolean(entry));

  return `${formatCharacterCustomTraitEffectTargetLabel(effect)}: ${parts.join(", ") || "+0"}`;
}
