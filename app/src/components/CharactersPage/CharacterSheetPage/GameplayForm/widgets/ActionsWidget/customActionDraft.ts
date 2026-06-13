import type {
  CharacterCustomAction,
  CharacterCustomActionChargeMaxMode,
  CharacterCustomActionEconomy,
  CharacterCustomTraitEffect,
  CharacterCustomTraitRollMode,
  CharacterCustomTraitValueMode
} from "../../../../../../types";
import { sanitizeUserInput } from "../../../../../../utils/userInputSanitization";
import {
  createDefaultCharacterCustomAction,
  createDefaultCustomActionCharges,
  CUSTOM_ACTION_CHARGES_MAX,
  CUSTOM_ACTION_DESCRIPTION_MAX_LENGTH,
  CUSTOM_ACTION_NAME_MAX_LENGTH
} from "../../../../../../pages/CharactersPage/customActions";
import {
  createCustomTraitEffectDraft,
  createCustomTraitEffectDraftFromEntry,
  doesCustomTraitTargetAllowAbilityValue,
  isCustomTraitAbilityValue,
  isCustomTraitEffectDraftEmpty,
  isCustomTraitRollModeDisabledTarget,
  parseCustomTraitEffectDraft,
  type CustomTraitEffectDraft
} from "../TraitsConditionsWidget/customTraitDraft";
import {
  createManualStatusDuration,
  defaultManualStatusDurationDraft,
  getManualStatusDurationDraft,
  type ManualStatusDurationType
} from "../TraitsConditionsWidget/manualStatusDuration";

export type CustomActionDraft = {
  id: string;
  name: string;
  description: string;
  economy: CharacterCustomActionEconomy;
  hasEffects: boolean;
  durationType: ManualStatusDurationType;
  durationValue: number;
  effects: CustomTraitEffectDraft[];
  hasCharges: boolean;
  chargesCurrent: number;
  chargesMax: number;
  chargesMaxMode: CharacterCustomActionChargeMaxMode;
  shortRestRecovery: number;
  longRestRecovery: number;
};

function clampInteger(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Math.floor(Number(value));

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, parsed));
}

function normalizeDraftText(value: string, maxLength: number, multiline = false): string {
  const sanitized = sanitizeUserInput(value, { multiline });
  return sanitized.length > maxLength ? sanitized.slice(0, maxLength) : sanitized;
}

function normalizeChargeMaxMode(
  value: CharacterCustomAction["charges"]
): CharacterCustomActionChargeMaxMode {
  return value?.maxMode === "proficiency_bonus" ? "proficiency_bonus" : "fixed";
}

function getActionChargesMax(
  charges: CharacterCustomAction["charges"],
  proficiencyBonus: number | undefined
): number {
  const fallbackMax = clampInteger(charges?.max, 1, CUSTOM_ACTION_CHARGES_MAX, 1);

  if (charges?.maxMode !== "proficiency_bonus" || proficiencyBonus === undefined) {
    return fallbackMax;
  }

  return clampInteger(proficiencyBonus, 1, CUSTOM_ACTION_CHARGES_MAX, fallbackMax);
}

export function getCustomActionDraftChargesMax(
  draft: Pick<CustomActionDraft, "chargesMax" | "chargesMaxMode">,
  proficiencyBonus: number
): number {
  const fallbackMax = clampInteger(draft.chargesMax, 1, CUSTOM_ACTION_CHARGES_MAX, 1);

  if (draft.chargesMaxMode !== "proficiency_bonus") {
    return fallbackMax;
  }

  return clampInteger(proficiencyBonus, 1, CUSTOM_ACTION_CHARGES_MAX, fallbackMax);
}

function getParsedCustomActionEffects(draft: CustomActionDraft): CharacterCustomTraitEffect[] {
  if (!draft.hasEffects) {
    return [];
  }

  return draft.effects
    .filter((effect) => !isCustomTraitEffectDraftEmpty(effect))
    .map((effect) => parseCustomTraitEffectDraft(effect))
    .filter((effect): effect is CharacterCustomTraitEffect => effect !== null);
}

export function createDefaultCustomActionDraft(): CustomActionDraft {
  const action = createDefaultCharacterCustomAction();
  const charges = createDefaultCustomActionCharges();

  return {
    id: action.id,
    name: "",
    description: "",
    economy: "action",
    hasEffects: false,
    durationType: defaultManualStatusDurationDraft.type,
    durationValue: defaultManualStatusDurationDraft.value,
    effects: [createCustomTraitEffectDraft()],
    hasCharges: false,
    chargesCurrent: charges.current,
    chargesMax: charges.max,
    chargesMaxMode: normalizeChargeMaxMode(charges),
    shortRestRecovery: charges.shortRestRecovery,
    longRestRecovery: charges.longRestRecovery
  };
}

export function createCustomActionDraftFromEntry(
  action: CharacterCustomAction,
  proficiencyBonus?: number
): CustomActionDraft {
  const duration = getManualStatusDurationDraft(action.duration);
  const charges = action.charges ?? createDefaultCustomActionCharges();
  const chargesMax = getActionChargesMax(charges, proficiencyBonus);
  const effects = action.customEffects?.map(createCustomTraitEffectDraftFromEntry) ?? [];

  return {
    id: action.id,
    name: action.name,
    description: action.description,
    economy: action.economy,
    hasEffects: effects.length > 0,
    durationType: duration.type,
    durationValue: duration.value,
    effects: effects.length > 0 ? effects : [createCustomTraitEffectDraft()],
    hasCharges: action.charges !== undefined,
    chargesCurrent: clampInteger(charges.current, 0, chargesMax, chargesMax),
    chargesMax: charges.max,
    chargesMaxMode: normalizeChargeMaxMode(charges),
    shortRestRecovery: clampInteger(charges.shortRestRecovery, 0, chargesMax, 0),
    longRestRecovery: clampInteger(charges.longRestRecovery, 0, chargesMax, 1)
  };
}

export function isCustomActionDraftValid(
  draft: CustomActionDraft,
  proficiencyBonus?: number
): boolean {
  const name = normalizeDraftText(draft.name, CUSTOM_ACTION_NAME_MAX_LENGTH);
  const parsedEffects = getParsedCustomActionEffects(draft);

  if (!name) {
    return false;
  }

  if (
    draft.hasEffects &&
    (parsedEffects.length <= 0 ||
      draft.effects.some(
        (effect) => !isCustomTraitEffectDraftEmpty(effect) && !parseCustomTraitEffectDraft(effect)
      ))
  ) {
    return false;
  }

  if (!draft.hasCharges) {
    return true;
  }

  const chargesMax =
    draft.chargesMaxMode === "proficiency_bonus" && proficiencyBonus !== undefined
      ? getCustomActionDraftChargesMax(draft, proficiencyBonus)
      : clampInteger(draft.chargesMax, 1, CUSTOM_ACTION_CHARGES_MAX, 1);
  const chargesCurrent = clampInteger(draft.chargesCurrent, 0, chargesMax, chargesMax);
  const shortRestRecovery = clampInteger(draft.shortRestRecovery, 0, chargesMax, 0);
  const longRestRecovery = clampInteger(draft.longRestRecovery, 0, chargesMax, 1);

  return (
    chargesMax >= 1 &&
    chargesCurrent >= 0 &&
    shortRestRecovery >= 0 &&
    longRestRecovery >= 0
  );
}

export function parseCustomActionDraft(
  draft: CustomActionDraft,
  proficiencyBonus?: number
): CharacterCustomAction | null {
  if (!isCustomActionDraftValid(draft, proficiencyBonus)) {
    return null;
  }

  const parsedEffects = getParsedCustomActionEffects(draft);
  const storedChargesMax =
    draft.chargesMaxMode === "proficiency_bonus"
      ? CUSTOM_ACTION_CHARGES_MAX
      : clampInteger(draft.chargesMax, 1, CUSTOM_ACTION_CHARGES_MAX, 1);
  const effectiveChargesMax =
    draft.chargesMaxMode === "proficiency_bonus" && proficiencyBonus !== undefined
      ? getCustomActionDraftChargesMax(
          { chargesMax: storedChargesMax, chargesMaxMode: draft.chargesMaxMode },
          proficiencyBonus
        )
      : storedChargesMax;

  return {
    id: draft.id,
    name: normalizeDraftText(draft.name, CUSTOM_ACTION_NAME_MAX_LENGTH),
    description: normalizeDraftText(
      draft.description,
      CUSTOM_ACTION_DESCRIPTION_MAX_LENGTH,
      true
    ),
    economy: draft.economy,
    ...(draft.hasEffects
      ? {
          duration: createManualStatusDuration(draft.durationType, draft.durationValue),
          customEffects: parsedEffects
        }
      : {}),
    ...(draft.hasCharges
      ? {
          charges: {
            current: clampInteger(
              draft.chargesCurrent,
              0,
              effectiveChargesMax,
              effectiveChargesMax
            ),
            max: storedChargesMax,
            ...(draft.chargesMaxMode === "proficiency_bonus"
              ? { maxMode: draft.chargesMaxMode }
              : {}),
            shortRestRecovery: clampInteger(draft.shortRestRecovery, 0, effectiveChargesMax, 0),
            longRestRecovery: clampInteger(draft.longRestRecovery, 0, effectiveChargesMax, 1)
          }
        }
      : {})
  };
}

export function updateCustomActionDraftEffectTarget(
  draft: CustomActionDraft,
  effectId: string,
  value: string
): CustomActionDraft {
  return {
    ...draft,
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
  };
}

export function updateCustomActionDraftEffectValueMode(
  draft: CustomActionDraft,
  effectId: string,
  value: CharacterCustomTraitValueMode
): CustomActionDraft {
  return {
    ...draft,
    effects: draft.effects.map((effect) =>
      effect.id === effectId ? { ...effect, valueMode: value } : effect
    )
  };
}

export function updateCustomActionDraftEffectRollMode(
  draft: CustomActionDraft,
  effectId: string,
  value: CharacterCustomTraitRollMode
): CustomActionDraft {
  return {
    ...draft,
    effects: draft.effects.map((effect) =>
      effect.id === effectId
        ? {
            ...effect,
            rollMode: isCustomTraitRollModeDisabledTarget(effect.target) ? "normal" : value
          }
        : effect
    )
  };
}

export function removeCustomActionDraftEffect(
  draft: CustomActionDraft,
  effectId: string
): CustomActionDraft {
  if (draft.effects.length <= 1) {
    return {
      ...draft,
      effects: draft.effects.map((effect) =>
        effect.id === effectId
          ? {
              ...effect,
              target: "",
              value: "0",
              valueMode: "buff",
              rollMode: "normal"
            }
          : effect
      )
    };
  }

  return {
    ...draft,
    effects: draft.effects.filter((effect) => effect.id !== effectId)
  };
}
