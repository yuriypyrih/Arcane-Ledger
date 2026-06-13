import type { SpellDescriptionEntry } from "../../codex/entries";
import type {
  Character,
  CharacterCustomAction,
  CharacterCustomActionCharges,
  CharacterCustomActionEconomy,
  CharacterStatusDuration
} from "../../types";
import { DEFAULT_TEXT_INPUT_MAX_LENGTH } from "../../constants/inputLimits";
import {
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../types";
import { sanitizeUserInput } from "../../utils/userInputSanitization";
import { isObjectRecord } from "../../utils/normalize";
import { ACTION_CARD_THEME } from "./actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE, type EconomyType } from "./actionEconomy";
import { createChargesCardUsage } from "./classFeatures/cardUsage";
import type { FeatureActionCard } from "./classFeatures/types";
import { normalizeCharacterCustomTraitEffects } from "./customTraitEffects";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries,
  resolveCharacterStatusEntries
} from "./statusEntries";

export const CUSTOM_ACTION_NAME_MAX_LENGTH = DEFAULT_TEXT_INPUT_MAX_LENGTH;
export const CUSTOM_ACTION_DESCRIPTION_MAX_LENGTH = 1000;
export const CUSTOM_ACTION_CHARGES_MAX = 10;
export const customActionKeyPrefix = "custom-action-";
export const customActionStatusSourceIdPrefix = "custom-action:";

const customActionEconomies = new Set<CharacterCustomActionEconomy>([
  "action",
  "bonus_action",
  "reaction",
  "long_action",
  "non_action"
]);

function clampInteger(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Math.floor(Number(value));

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, parsed));
}

function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function normalizeCustomActionText(
  value: unknown,
  maxLength: number,
  options: { multiline?: boolean } = {}
): string {
  if (typeof value !== "string") {
    return "";
  }

  return truncateText(sanitizeUserInput(value, options), maxLength);
}

function createCustomActionId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `custom-action-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeCustomActionEconomy(value: unknown): CharacterCustomActionEconomy {
  return customActionEconomies.has(value as CharacterCustomActionEconomy)
    ? (value as CharacterCustomActionEconomy)
    : "action";
}

function normalizeCustomActionDuration(value: unknown): CharacterStatusDuration {
  if (!isObjectRecord(value)) {
    return { kind: STATUS_DURATION_KIND.INFINITE };
  }

  switch (value.kind) {
    case STATUS_DURATION_KIND.ROUNDS:
      return {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: clampInteger(value.amount, 1, 30, 1),
        tickOn:
          value.tickOn === STATUS_DURATION_ROUND_TICK.ROUND_END
            ? STATUS_DURATION_ROUND_TICK.ROUND_END
            : STATUS_DURATION_ROUND_TICK.ROUND_START
      };
    case STATUS_DURATION_KIND.MINUTES:
    case STATUS_DURATION_KIND.HOURS:
    case STATUS_DURATION_KIND.DAYS:
      return {
        kind: value.kind,
        amount: clampInteger(value.amount, 1, 30, 1)
      };
    case STATUS_DURATION_KIND.SHORT_REST:
      return { kind: STATUS_DURATION_KIND.SHORT_REST };
    case STATUS_DURATION_KIND.LONG_REST:
      return { kind: STATUS_DURATION_KIND.LONG_REST };
    case STATUS_DURATION_KIND.INFINITE:
    default:
      return { kind: STATUS_DURATION_KIND.INFINITE };
  }
}

function normalizeCustomActionCharges(value: unknown): CharacterCustomActionCharges | undefined {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const max = clampInteger(value.max, 1, CUSTOM_ACTION_CHARGES_MAX, 1);

  return {
    current: clampInteger(value.current, 0, max, max),
    max,
    shortRestRecovery: clampInteger(value.shortRestRecovery, 0, max, 0),
    longRestRecovery: clampInteger(value.longRestRecovery, 0, max, 1)
  };
}

function normalizeCustomAction(value: unknown, fallbackId: string): CharacterCustomAction | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const name = normalizeCustomActionText(value.name, CUSTOM_ACTION_NAME_MAX_LENGTH);
  const charges = normalizeCustomActionCharges(value.charges);

  if (!name) {
    return null;
  }

  const customEffects = normalizeCharacterCustomTraitEffects(value.customEffects);

  return {
    id:
      typeof value.id === "string" && value.id.trim().length > 0
        ? sanitizeUserInput(value.id)
        : fallbackId,
    name,
    description: normalizeCustomActionText(value.description, CUSTOM_ACTION_DESCRIPTION_MAX_LENGTH, {
      multiline: true
    }),
    economy: normalizeCustomActionEconomy(value.economy),
    ...(customEffects.length > 0
      ? {
          duration: normalizeCustomActionDuration(value.duration),
          customEffects
        }
      : {}),
    ...(charges ? { charges } : {})
  };
}

export function normalizeCharacterCustomActions(value: unknown): CharacterCustomAction[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const usedIds = new Set<string>();

  return value.reduce<CharacterCustomAction[]>((entries, entry, index) => {
    const normalizedEntry = normalizeCustomAction(entry, `custom-action-${index + 1}`);

    if (!normalizedEntry) {
      return entries;
    }

    const baseId = normalizedEntry.id || createCustomActionId();
    let nextId = baseId;
    let suffix = 2;

    while (usedIds.has(nextId)) {
      nextId = `${baseId}-${suffix}`;
      suffix += 1;
    }

    usedIds.add(nextId);
    entries.push({ ...normalizedEntry, id: nextId });
    return entries;
  }, []);
}

export function createDefaultCharacterCustomAction(): CharacterCustomAction {
  return {
    id: createCustomActionId(),
    name: "",
    description: "",
    economy: "action"
  };
}

export function createDefaultCustomActionCharges(): CharacterCustomActionCharges {
  return {
    current: 1,
    max: 1,
    shortRestRecovery: 0,
    longRestRecovery: 1
  };
}

export function getCustomActionStatusSourceId(actionId: string): string {
  return `${customActionStatusSourceIdPrefix}${actionId}`;
}

export function isCustomActionKey(actionKey: string): boolean {
  return actionKey.startsWith(customActionKeyPrefix);
}

export function getCustomActionIdFromActionKey(actionKey: string): string | null {
  return isCustomActionKey(actionKey) ? actionKey.slice(customActionKeyPrefix.length) : null;
}

export function getCustomActionEconomyType(economy: CharacterCustomActionEconomy): EconomyType {
  switch (economy) {
    case "bonus_action":
      return ECONOMY_TYPE.BONUS_ACTION;
    case "reaction":
      return ECONOMY_TYPE.REACTION;
    case "long_action":
      return ECONOMY_TYPE.NON_COMBAT;
    case "non_action":
      return ECONOMY_TYPE.FREE;
    case "action":
    default:
      return ECONOMY_TYPE.ACTION;
  }
}

export function hasActiveCustomActionTrait(
  character: Pick<Character, "statusEntries">,
  actionId: string
): boolean {
  const sourceId = getCustomActionStatusSourceId(actionId);

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => !entry.disabled && entry.sourceId === sourceId
  );
}

function getCustomActionDisabledReason(character: Character, action: CharacterCustomAction) {
  if (
    action.customEffects &&
    action.customEffects.length > 0 &&
    hasActiveCustomActionTrait(character, action.id)
  ) {
    return "This custom action is already active in Traits & Conditions.";
  }

  if (action.charges && action.charges.current <= 0) {
    return "No custom action charges remain.";
  }

  return undefined;
}

function createCustomActionDescription(action: CharacterCustomAction): SpellDescriptionEntry[] {
  return action.description ? [action.description] : [];
}

export function getCustomActionCardsForCharacter(character: Character): FeatureActionCard[] {
  return normalizeCharacterCustomActions(character.customActions).map((action) => {
    const disabledReason = getCustomActionDisabledReason(character, action);
    const charges = action.charges;

    return {
      key: `${customActionKeyPrefix}${action.id}`,
      name: action.name,
      cardTheme: ACTION_CARD_THEME.FEATURE,
      summary: action.description || "Custom action.",
      detail: action.description || "Custom action.",
      breakdown: "Custom Action",
      economyType: getCustomActionEconomyType(action.economy),
      actionCategory: ACTION_CATEGORY.FEATURE,
      consumesEconomyOnActivate: true,
      usesRemaining: charges?.current,
      usesTotal: charges?.max,
      cardUsage: charges ? createChargesCardUsage(charges.current, charges.max) : undefined,
      disabled: disabledReason !== undefined,
      disabledReason,
      description: createCustomActionDescription(action),
      facts: [],
      drawer: {
        kind: "confirm",
        eyebrow: "Custom Action",
        description: createCustomActionDescription(action),
        blockedReason: disabledReason,
        facts: []
      },
      execute: {
        kind: "activate"
      }
    };
  });
}

function spendCustomActionCharge(action: CharacterCustomAction): CharacterCustomAction {
  if (!action.charges) {
    return action;
  }

  return {
    ...action,
    charges: {
      ...action.charges,
      current: Math.max(0, action.charges.current - 1)
    }
  };
}

export function activateCustomActionForCharacter(character: Character, actionKey: string): Character {
  const actionId = getCustomActionIdFromActionKey(actionKey);

  if (!actionId) {
    return character;
  }

  const customActions = normalizeCharacterCustomActions(character.customActions);
  const customAction = customActions.find((entry) => entry.id === actionId);

  if (!customAction || getCustomActionDisabledReason(character, customAction)) {
    return character;
  }

  const nextCustomActions = customActions.map((entry) =>
    entry.id === actionId ? spendCustomActionCharge(entry) : entry
  );

  if (!customAction.customEffects || customAction.customEffects.length <= 0) {
    return {
      ...character,
      customActions: nextCustomActions
    };
  }

  return {
    ...character,
    customActions: nextCustomActions,
    statusEntries: [
      ...resolveCharacterStatusEntries(character.statusEntries),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: customAction.name,
        source: "Custom Action",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        sourceId: getCustomActionStatusSourceId(customAction.id),
        duration: customAction.duration ?? { kind: STATUS_DURATION_KIND.INFINITE },
        description: customAction.description,
        customEffects: customAction.customEffects
      })
    ]
  };
}

export type CustomActionRestRecoveryEntry = {
  id: string;
  name: string;
  current: number;
  total: number;
  recovery: number;
};

export function getCustomActionRestRecoveryEntries(
  character: Character,
  restType: "short" | "long"
): CustomActionRestRecoveryEntry[] {
  return normalizeCharacterCustomActions(character.customActions).flatMap((action) => {
    const charges = action.charges;

    if (!charges) {
      return [];
    }

    const recovery = restType === "short" ? charges.shortRestRecovery : charges.longRestRecovery;

    if (recovery <= 0 || charges.current >= charges.max) {
      return [];
    }

    return [
      {
        id: action.id,
        name: action.name,
        current: charges.current,
        total: charges.max,
        recovery
      }
    ];
  });
}

export function restoreCustomActionChargesForRest(
  character: Character,
  actionId: string,
  restType: "short" | "long"
): Character {
  const customActions = normalizeCharacterCustomActions(character.customActions);
  let changed = false;

  const nextCustomActions = customActions.map((action) => {
    if (action.id !== actionId || !action.charges) {
      return action;
    }

    const recovery =
      restType === "short" ? action.charges.shortRestRecovery : action.charges.longRestRecovery;

    if (recovery <= 0 || action.charges.current >= action.charges.max) {
      return action;
    }

    changed = true;

    return {
      ...action,
      charges: {
        ...action.charges,
        current: Math.min(action.charges.max, action.charges.current + recovery)
      }
    };
  });

  return changed
    ? {
        ...character,
        customActions: nextCustomActions
      }
    : character;
}
