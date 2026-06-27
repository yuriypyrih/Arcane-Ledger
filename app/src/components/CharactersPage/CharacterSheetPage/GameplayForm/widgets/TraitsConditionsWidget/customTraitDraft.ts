import {
  characterCustomTraitDiceValues,
  type CharacterCustomTraitDiceValue,
  type CharacterCustomTraitEffect,
  type CharacterCustomTraitRollMode,
  type CharacterCustomTraitSkillGroupAbility,
  type CharacterCustomTraitValueMode,
  type CharacterStatusEntry
} from "../../../../../../types/traits";
import type { AbilityKey } from "../../../../../../types/characters";
import { ALL_SKILLS, isSkillName } from "../../../../../../types/skills";
import { WEAPON_COMBAT_TYPE } from "../../../../../../codex/entries/enums";
import { skillGroupsByAbility } from "../../../../../../pages/CharactersPage/skillDefinitions";
import {
  defaultManualStatusDurationDraft,
  getManualStatusDurationDraft,
  type ManualStatusDurationType
} from "./manualStatusDuration";

const abilityKeys: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const skillGroupAbilityKeys: CharacterCustomTraitSkillGroupAbility[] = skillGroupsByAbility
  .map((group) => group.ability)
  .filter((ability): ability is CharacterCustomTraitSkillGroupAbility => ability !== "CON");
const allSavingThrowsTarget = "savingThrows";

export type CustomTraitEffectDraft = {
  id: string;
  target: string;
  value: string;
  valueMode: CharacterCustomTraitValueMode;
  rollMode: CharacterCustomTraitRollMode;
};

export type CustomTraitDraft = {
  name: string;
  description: string;
  durationType: ManualStatusDurationType;
  durationValue: number;
  effects: CustomTraitEffectDraft[];
};

export type CustomTraitTargetOption = {
  value: string;
  label: string;
};

function createDraftId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `custom-trait-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeDraftRollMode(value: CharacterCustomTraitRollMode): CharacterCustomTraitRollMode {
  return value === "advantage" || value === "disadvantage" ? value : "normal";
}

function normalizeDraftValueMode(value: CharacterCustomTraitValueMode): CharacterCustomTraitValueMode {
  return value === "debuff" ? "debuff" : "buff";
}

export function isCustomTraitAbilityValue(value: string): boolean {
  return abilityKeys.includes(value.trim() as AbilityKey);
}

function isCustomTraitDiceValue(value: string): value is CharacterCustomTraitDiceValue {
  return characterCustomTraitDiceValues.includes(value.trim() as CharacterCustomTraitDiceValue);
}

function isCustomTraitSkillGroupAbility(
  value: unknown
): value is CharacterCustomTraitSkillGroupAbility {
  return skillGroupAbilityKeys.includes(value as CharacterCustomTraitSkillGroupAbility);
}

export function isCustomTraitRollModeDisabledTarget(target: string): boolean {
  const trimmedTarget = target.trim();
  return (
    trimmedTarget === "actualMaxHitPoints" ||
    trimmedTarget === "armorClass" ||
    trimmedTarget === "speed" ||
    trimmedTarget === "spellDc"
  );
}

export function doesCustomTraitTargetAllowAbilityValue(target: string): boolean {
  const [type] = target.trim().split(":");
  return (
    type !== "actualMaxHitPoints" &&
    type !== "abilityScore" &&
    type !== "abilityModifier" &&
    type !== "savingThrow" &&
    type !== allSavingThrowsTarget
  );
}

export function doesCustomTraitTargetAllowDiceValue(target: string): boolean {
  const [type] = target.trim().split(":");

  return (
    type === "initiative" ||
    type === "savingThrow" ||
    type === allSavingThrowsTarget ||
    type === "skill" ||
    type === "skillGroup" ||
    type === "spellAttack" ||
    type === "weaponDamage"
  );
}

export const customTraitDiceValueOptions = characterCustomTraitDiceValues.map((value) => ({
  value,
  label: value.replace(/^1d/i, "D")
}));

export function normalizeCustomTraitEffectDraftValueForTarget(
  value: string,
  target: string
): string {
  if (
    (isCustomTraitAbilityValue(value) && !doesCustomTraitTargetAllowAbilityValue(target)) ||
    (isCustomTraitDiceValue(value) && !doesCustomTraitTargetAllowDiceValue(target))
  ) {
    return "0";
  }

  return value;
}

function createRollModeFields(effect: CustomTraitEffectDraft) {
  const rollMode = isCustomTraitRollModeDisabledTarget(effect.target)
    ? "normal"
    : normalizeDraftRollMode(effect.rollMode);

  return rollMode === "normal" ? {} : { rollMode };
}

function createValueModeFields(effect: CustomTraitEffectDraft) {
  const valueMode = normalizeDraftValueMode(effect.valueMode);
  return valueMode === "debuff" ? { valueMode } : {};
}

export const customTraitTargetOptions: CustomTraitTargetOption[] = [
  { value: "actualMaxHitPoints", label: "Actual Max HP" },
  { value: "armorClass", label: "Armor Class" },
  { value: "initiative", label: "Initiative" },
  { value: "passivePerception", label: "Passive Perception" },
  { value: "speed", label: "Speed" },
  ...abilityKeys.map((ability) => ({
    value: `abilityScore:${ability}`,
    label: `${ability} Ability Score`
  })),
  ...abilityKeys.map((ability) => ({
    value: `abilityModifier:${ability}`,
    label: `${ability} Modifier`
  })),
  ...abilityKeys.map((ability) => ({
    value: `savingThrow:${ability}`,
    label: `${ability} Saving Throw`
  })),
  { value: allSavingThrowsTarget, label: "All Saving Throws" },
  ...skillGroupAbilityKeys.map((ability) => ({
    value: `skillGroup:${ability}`,
    label: `${ability} Skills`
  })),
  ...ALL_SKILLS.map((skill) => ({
    value: `skill:${skill}`,
    label: skill
  })),
  { value: "weaponDamage:unarmed", label: "Unarmed Strike" },
  { value: `weaponDamage:${WEAPON_COMBAT_TYPE.MELEE}`, label: "Melee Weapons" },
  { value: `weaponDamage:${WEAPON_COMBAT_TYPE.RANGED}`, label: "Ranged Weapons" },
  { value: "spellAttack", label: "Spell Attack" },
  { value: "spellDc", label: "Spell DC" }
];

export function createCustomTraitEffectDraft(): CustomTraitEffectDraft {
  return {
    id: createDraftId(),
    target: "",
    value: "0",
    valueMode: "buff",
    rollMode: "normal"
  };
}

export function createDefaultCustomTraitDraft(): CustomTraitDraft {
  return {
    name: "",
    description: "",
    durationType: defaultManualStatusDurationDraft.type,
    durationValue: defaultManualStatusDurationDraft.value,
    effects: [createCustomTraitEffectDraft()]
  };
}

export function createCustomTraitEffectDraftFromEntry(
  effect: CharacterCustomTraitEffect
): CustomTraitEffectDraft {
  switch (effect.type) {
    case "actualMaxHitPoints":
    case "armorClass":
    case "initiative":
    case "passivePerception":
    case "speed":
    case "spellAttack":
    case "spellDc":
    case "savingThrows":
      return {
        id: createDraftId(),
        target: effect.type,
        value: String(effect.value),
        valueMode: effect.valueMode ?? "buff",
        rollMode: effect.rollMode ?? "normal"
      };
    case "abilityScore":
    case "abilityModifier":
    case "savingThrow":
      return {
        id: createDraftId(),
        target: `${effect.type}:${effect.ability}`,
        value: String(effect.value),
        valueMode: effect.valueMode ?? "buff",
        rollMode: effect.rollMode ?? "normal"
      };
    case "skill":
      return {
        id: createDraftId(),
        target: `${effect.type}:${effect.skill}`,
        value: String(effect.value),
        valueMode: effect.valueMode ?? "buff",
        rollMode: effect.rollMode ?? "normal"
      };
    case "skillGroup":
      return {
        id: createDraftId(),
        target: `${effect.type}:${effect.ability}`,
        value: String(effect.value),
        valueMode: effect.valueMode ?? "buff",
        rollMode: effect.rollMode ?? "normal"
      };
    case "weaponDamage":
      return {
        id: createDraftId(),
        target: `${effect.type}:${effect.attackKind}`,
        value: String(effect.value),
        valueMode: effect.valueMode ?? "buff",
        rollMode: effect.rollMode ?? "normal"
      };
    default:
      return createCustomTraitEffectDraft();
  }
}

export function createCustomTraitDraftFromStatusEntry(
  entry: CharacterStatusEntry & { customEffects: CharacterCustomTraitEffect[] }
): CustomTraitDraft {
  const durationDraft = getManualStatusDurationDraft(entry.duration);
  const effectDrafts = entry.customEffects.map(createCustomTraitEffectDraftFromEntry);

  return {
    name: String(entry.value).trim(),
    description: entry.description ?? "",
    durationType: durationDraft.type,
    durationValue: durationDraft.value,
    effects: effectDrafts.length > 0 ? effectDrafts : [createCustomTraitEffectDraft()]
  };
}

export function parseCustomTraitEffectDraft(
  draft: CustomTraitEffectDraft
): CharacterCustomTraitEffect | null {
  const trimmedTarget = draft.target.trim();
  const rollMode = isCustomTraitRollModeDisabledTarget(trimmedTarget)
    ? "normal"
    : normalizeDraftRollMode(draft.rollMode);
  const trimmedValue = draft.value.trim();
  const valueAsAbility = isCustomTraitAbilityValue(trimmedValue)
    ? (trimmedValue as AbilityKey)
    : null;
  const valueAsDice = isCustomTraitDiceValue(trimmedValue) ? trimmedValue : null;
  const numericValue = trimmedValue.length > 0 ? Number(trimmedValue) : 0;
  const normalizedValue = valueAsAbility ?? valueAsDice ?? Math.trunc(numericValue);
  const rollModeFields = createRollModeFields(draft);
  const valueModeFields = createValueModeFields(draft);

  if (
    !trimmedTarget ||
    (valueAsAbility === null && valueAsDice === null && !Number.isFinite(numericValue)) ||
    (typeof normalizedValue === "number" && normalizedValue === 0 && rollMode === "normal") ||
    (valueAsAbility !== null && !doesCustomTraitTargetAllowAbilityValue(trimmedTarget)) ||
    (valueAsDice !== null && !doesCustomTraitTargetAllowDiceValue(trimmedTarget))
  ) {
    return null;
  }

  if (trimmedTarget === "armorClass") {
    return { type: "armorClass", value: normalizedValue, ...valueModeFields };
  }

  if (trimmedTarget === "actualMaxHitPoints" && typeof normalizedValue === "number") {
    return { type: "actualMaxHitPoints", value: normalizedValue, ...valueModeFields };
  }

  if (trimmedTarget === "initiative") {
    return { type: "initiative", value: normalizedValue, ...valueModeFields, ...rollModeFields };
  }

  if (trimmedTarget === "passivePerception") {
    return {
      type: "passivePerception",
      value: normalizedValue,
      ...valueModeFields,
      ...rollModeFields
    };
  }

  if (trimmedTarget === "speed") {
    return { type: "speed", value: normalizedValue, ...valueModeFields };
  }

  if (trimmedTarget === "spellAttack") {
    return { type: "spellAttack", value: normalizedValue, ...valueModeFields, ...rollModeFields };
  }

  if (trimmedTarget === "spellDc") {
    return { type: "spellDc", value: normalizedValue, ...valueModeFields };
  }

  if (trimmedTarget === allSavingThrowsTarget) {
    return { type: "savingThrows", value: normalizedValue, ...valueModeFields, ...rollModeFields };
  }

  const [type, rawDetail] = trimmedTarget.split(":");

  if (
    type === "abilityScore" &&
    abilityKeys.includes(rawDetail as AbilityKey) &&
    typeof normalizedValue === "number"
  ) {
    return {
      type: "abilityScore",
      ability: rawDetail as AbilityKey,
      value: normalizedValue,
      ...valueModeFields,
      ...rollModeFields
    };
  }

  if (
    type === "abilityModifier" &&
    abilityKeys.includes(rawDetail as AbilityKey) &&
    typeof normalizedValue === "number"
  ) {
    return {
      type: "abilityModifier",
      ability: rawDetail as AbilityKey,
      value: normalizedValue,
      ...valueModeFields,
      ...rollModeFields
    };
  }

  if (
    type === "savingThrow" &&
    abilityKeys.includes(rawDetail as AbilityKey)
  ) {
    return {
      type: "savingThrow",
      ability: rawDetail as AbilityKey,
      value: normalizedValue,
      ...valueModeFields,
      ...rollModeFields
    };
  }

  if (type === "skill" && isSkillName(rawDetail)) {
    return {
      type: "skill",
      skill: rawDetail,
      value: normalizedValue,
      ...valueModeFields,
      ...rollModeFields
    };
  }

  if (type === "skillGroup" && isCustomTraitSkillGroupAbility(rawDetail)) {
    return {
      type: "skillGroup",
      ability: rawDetail,
      value: normalizedValue,
      ...valueModeFields,
      ...rollModeFields
    };
  }

  if (
    type === "weaponDamage" &&
    ["unarmed", WEAPON_COMBAT_TYPE.MELEE, WEAPON_COMBAT_TYPE.RANGED].includes(rawDetail)
  ) {
    return {
      type: "weaponDamage",
      attackKind: rawDetail as Extract<
        CharacterCustomTraitEffect,
        { type: "weaponDamage" }
      >["attackKind"],
      value: normalizedValue,
      ...valueModeFields,
      ...rollModeFields
    };
  }

  return null;
}

export function isCustomTraitEffectDraftEmpty(draft: CustomTraitEffectDraft): boolean {
  const numericValue = draft.value.trim().length > 0 ? Number(draft.value) : 0;
  const rollMode = isCustomTraitRollModeDisabledTarget(draft.target)
    ? "normal"
    : normalizeDraftRollMode(draft.rollMode);

  return (
    !isCustomTraitAbilityValue(draft.value) &&
    Number.isFinite(numericValue) &&
    Math.trunc(numericValue) === 0 &&
    rollMode === "normal"
  );
}

export function isCustomTraitDraftValid(draft: CustomTraitDraft): boolean {
  return (
    draft.name.trim().length > 0 &&
    draft.effects.length > 0 &&
    draft.effects.every(
      (effect) =>
        isCustomTraitEffectDraftEmpty(effect) || parseCustomTraitEffectDraft(effect) !== null
    )
  );
}
