import { type AbilityKey, type CharacterCustomTraitEffect } from "../../../../../../types";
import { WEAPON_COMBAT_TYPE } from "../../../../../../codex/entries";
import {
  defaultManualStatusDurationDraft,
  type ManualStatusDurationType
} from "./manualStatusDuration";

const abilityKeys: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

export type CustomTraitMode = "quick-add" | "custom-trait";

export type CustomTraitEffectDraft = {
  id: string;
  target: string;
  value: string;
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

export const customTraitTargetOptions: CustomTraitTargetOption[] = [
  { value: "armorClass", label: "Armor Class" },
  { value: "initiative", label: "Initiative" },
  { value: "passivePerception", label: "Passive Perception" },
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
  { value: "weaponDamage:unarmed", label: "Unarmed Strike" },
  { value: `weaponDamage:${WEAPON_COMBAT_TYPE.MELEE}`, label: "Melee Weapons" },
  { value: `weaponDamage:${WEAPON_COMBAT_TYPE.RANGED}`, label: "Ranged Weapons" }
];

export function createCustomTraitEffectDraft(): CustomTraitEffectDraft {
  return {
    id: createDraftId(),
    target: "",
    value: ""
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

export function parseCustomTraitEffectDraft(
  draft: CustomTraitEffectDraft
): CharacterCustomTraitEffect | null {
  const trimmedTarget = draft.target.trim();
  const numericValue = Number(draft.value);

  if (!trimmedTarget || !Number.isFinite(numericValue) || Math.trunc(numericValue) === 0) {
    return null;
  }

  if (trimmedTarget === "armorClass") {
    return { type: "armorClass", value: Math.trunc(numericValue) };
  }

  if (trimmedTarget === "initiative") {
    return { type: "initiative", value: Math.trunc(numericValue) };
  }

  if (trimmedTarget === "passivePerception") {
    return { type: "passivePerception", value: Math.trunc(numericValue) };
  }

  const [type, rawDetail] = trimmedTarget.split(":");

  if (type === "abilityScore" && abilityKeys.includes(rawDetail as AbilityKey)) {
    return {
      type: "abilityScore",
      ability: rawDetail as AbilityKey,
      value: Math.trunc(numericValue)
    };
  }

  if (type === "abilityModifier" && abilityKeys.includes(rawDetail as AbilityKey)) {
    return {
      type: "abilityModifier",
      ability: rawDetail as AbilityKey,
      value: Math.trunc(numericValue)
    };
  }

  if (type === "savingThrow" && abilityKeys.includes(rawDetail as AbilityKey)) {
    return {
      type: "savingThrow",
      ability: rawDetail as AbilityKey,
      value: Math.trunc(numericValue)
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
      value: Math.trunc(numericValue)
    };
  }

  return null;
}

export function isCustomTraitDraftValid(draft: CustomTraitDraft): boolean {
  return (
    draft.name.trim().length > 0 &&
    draft.description.trim().length > 0 &&
    draft.effects.length > 0 &&
    draft.effects.every((effect) => parseCustomTraitEffectDraft(effect) !== null)
  );
}
