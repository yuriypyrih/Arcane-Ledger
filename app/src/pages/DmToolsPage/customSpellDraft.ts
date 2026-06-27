import type { CustomSpellInput, CustomSpellRecord } from "../../api/customSpells";
import {
  ACTION_TYPE,
  DURATION,
  MAGIC_SCHOOL,
  SPELL_COMPONENT,
  SPELL_LIST_CLASS
} from "../../codex/entries/enums";
import type {
  CharacterCustomTraitEffect,
  CharacterCustomTraitRollMode,
  CharacterCustomTraitValueMode
} from "../../types";
import { sanitizeUserInput } from "../../utils/userInputSanitization";
import {
  createCustomTraitEffectDraft,
  createCustomTraitEffectDraftFromEntry,
  isCustomTraitEffectDraftEmpty,
  parseCustomTraitEffectDraft,
  type CustomTraitEffectDraft
} from "../../components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/TraitsConditionsWidget/customTraitDraft";

export const CUSTOM_SPELL_NAME_MAX_LENGTH = 128;
export const CUSTOM_SPELL_RANGE_MAX_LENGTH = 128;
export const CUSTOM_SPELL_MATERIAL_MAX_LENGTH = 500;
export const CUSTOM_SPELL_DESCRIPTION_MAX_LENGTH = 10000;
export const CUSTOM_SPELL_EFFECT_LIMIT = 5;

export type CustomSpellDurationMode =
  | "instantaneous"
  | "rounds"
  | "minutes"
  | "hours"
  | "days"
  | "concentration-rounds"
  | "concentration-minutes"
  | "concentration-hours"
  | "concentration-days"
  | "infinite";

export type CustomSpellDraft = {
  castingTime: ACTION_TYPE;
  components: SPELL_COMPONENT[];
  description: string;
  durationMode: CustomSpellDurationMode;
  durationText: string;
  durationValue: number;
  effects: CustomTraitEffectDraft[];
  magicSchool: MAGIC_SCHOOL;
  materialSpecified: string;
  name: string;
  public: boolean;
  range: string;
  ritual: boolean;
  spellLevel: number;
  spellLists: SPELL_LIST_CLASS[];
};

const DURATION_MODE_UNITS: Partial<Record<CustomSpellDurationMode, string>> = {
  rounds: "round",
  minutes: "minute",
  hours: "hour",
  days: "day",
  "concentration-rounds": "round",
  "concentration-minutes": "minute",
  "concentration-hours": "hour",
  "concentration-days": "day"
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

function parseDurationText(value: string): { mode: CustomSpellDurationMode; value: number } | null {
  const match = value.trim().toLowerCase().match(/^(\d+)\s+(round|minute|hour|day)s?$/);

  if (!match) {
    return null;
  }

  const unit = match[2];
  const parsedValue = clampInteger(match[1], 1, 999, 1);

  if (unit === "round") {
    return { mode: "rounds", value: parsedValue };
  }

  if (unit === "minute") {
    return { mode: "minutes", value: parsedValue };
  }

  if (unit === "hour") {
    return { mode: "hours", value: parsedValue };
  }

  return { mode: "days", value: parsedValue };
}

function getDurationDraftFromParts(duration: readonly string[]): Pick<
  CustomSpellDraft,
  "durationMode" | "durationText" | "durationValue"
> {
  if (duration.length === 0 || duration.every((part) => part.toLowerCase() === "instantaneous")) {
    return {
      durationMode: "instantaneous",
      durationText: "",
      durationValue: 1
    };
  }

  const isConcentration = duration[0] === DURATION.CONCENTRATION;
  const textPart = isConcentration ? duration[1] ?? "" : duration[0] ?? "";
  const parsedDuration = parseDurationText(textPart);

  if (textPart.toLowerCase() === "infinite") {
    return {
      durationMode: "infinite",
      durationText: "",
      durationValue: 1
    };
  }

  if (!parsedDuration) {
    return {
      durationMode: "infinite",
      durationText: "",
      durationValue: 1
    };
  }

  return {
    durationMode: isConcentration
      ? (`concentration-${parsedDuration.mode}` as CustomSpellDurationMode)
      : parsedDuration.mode,
    durationText: "",
    durationValue: parsedDuration.value
  };
}

function createDurationParts(draft: Pick<CustomSpellDraft, "durationMode" | "durationText" | "durationValue">) {
  if (draft.durationMode === "instantaneous") {
    return ["Instantaneous"];
  }

  if (draft.durationMode === "infinite") {
    return ["Infinite"];
  }

  const durationValue = clampInteger(draft.durationValue, 1, 999, 1);
  const unit = DURATION_MODE_UNITS[draft.durationMode] ?? "minute";
  const durationText = `${durationValue} ${unit}${durationValue === 1 ? "" : "s"}`;

  return draft.durationMode.startsWith("concentration-")
    ? [DURATION.CONCENTRATION, durationText]
    : [durationText];
}

function getParsedCustomSpellEffects(draft: CustomSpellDraft): CharacterCustomTraitEffect[] {
  if (isCustomSpellDurationInstantaneous(draft)) {
    return [];
  }

  return draft.effects
    .filter((effect) => !isCustomTraitEffectDraftEmpty(effect))
    .map((effect) => parseCustomTraitEffectDraft(effect))
    .filter((effect): effect is CharacterCustomTraitEffect => effect !== null);
}

export function createDefaultCustomSpellDraft(): CustomSpellDraft {
  return {
    castingTime: ACTION_TYPE.ACTION,
    components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
    description: "",
    durationMode: "instantaneous",
    durationText: "",
    durationValue: 1,
    effects: [createCustomTraitEffectDraft()],
    magicSchool: MAGIC_SCHOOL.EVOCATION,
    materialSpecified: "",
    name: "",
    public: false,
    range: "Self",
    ritual: false,
    spellLevel: 0,
    spellLists: []
  };
}

export function createCustomSpellDraftFromRecord(record: CustomSpellRecord): CustomSpellDraft {
  const spell = record.spell;
  const durationDraft = getDurationDraftFromParts(spell.duration);
  const effects = record.customEffects?.map(createCustomTraitEffectDraftFromEntry) ?? [];

  return {
    castingTime: (spell.castingTime[0] as ACTION_TYPE | undefined) ?? ACTION_TYPE.ACTION,
    components: spell.components,
    description: spell.description
      .map((entry) => (typeof entry === "string" ? entry : entry.items.join("\n")))
      .join("\n\n"),
    durationMode: durationDraft.durationMode,
    durationText: durationDraft.durationText,
    durationValue: durationDraft.durationValue,
    effects: effects.length > 0 ? effects : [createCustomTraitEffectDraft()],
    magicSchool: spell.magicSchool,
    materialSpecified: spell.materialSpecified ?? "",
    name: spell.name,
    public: Boolean(record.public),
    range: spell.range,
    ritual: Boolean(spell.ritual),
    spellLevel: spell.spellLevel,
    spellLists: spell.spellLists
  };
}

export function isCustomSpellDurationInstantaneous(
  draft: Pick<CustomSpellDraft, "durationMode">
): boolean {
  return draft.durationMode === "instantaneous";
}

export function isCustomSpellDraftValid(draft: CustomSpellDraft): boolean {
  const name = normalizeDraftText(draft.name, CUSTOM_SPELL_NAME_MAX_LENGTH);
  const range = normalizeDraftText(draft.range, CUSTOM_SPELL_RANGE_MAX_LENGTH);
  const hasInvalidEffect = draft.effects.some(
    (effect) => !isCustomTraitEffectDraftEmpty(effect) && parseCustomTraitEffectDraft(effect) === null
  );

  return (
    Boolean(name) &&
    Boolean(range) &&
    !hasInvalidEffect
  );
}

export function parseCustomSpellDraft(draft: CustomSpellDraft): CustomSpellInput | null {
  if (!isCustomSpellDraftValid(draft)) {
    return null;
  }

  const components = Array.from(new Set(draft.components));
  const materialSpecified = components.includes(SPELL_COMPONENT.M)
    ? normalizeDraftText(draft.materialSpecified, CUSTOM_SPELL_MATERIAL_MAX_LENGTH)
    : "";

  return {
    castingTime: [draft.castingTime],
    components,
    customEffects: getParsedCustomSpellEffects(draft),
    description: [
      normalizeDraftText(draft.description, CUSTOM_SPELL_DESCRIPTION_MAX_LENGTH, true)
    ].filter(Boolean),
    duration: createDurationParts(draft),
    magicSchool: draft.magicSchool,
    materialSpecified: materialSpecified || undefined,
    name: normalizeDraftText(draft.name, CUSTOM_SPELL_NAME_MAX_LENGTH),
    public: draft.public,
    range: normalizeDraftText(draft.range, CUSTOM_SPELL_RANGE_MAX_LENGTH),
    ritual: draft.ritual,
    spellLevel: clampInteger(draft.spellLevel, 0, 9, 0),
    spellLists: Array.from(new Set(draft.spellLists))
  };
}

export function setCustomSpellDraftEffectTarget(
  draft: CustomSpellDraft,
  effectId: string,
  target: string,
  normalizeValueForTarget: (value: string, target: string) => string,
  isRollModeDisabledTarget: (target: string) => boolean
): CustomSpellDraft {
  return {
    ...draft,
    effects: draft.effects.map((effect) =>
      effect.id === effectId
        ? {
            ...effect,
            target,
            value: normalizeValueForTarget(effect.value, target),
            rollMode: isRollModeDisabledTarget(target) ? "normal" : effect.rollMode
          }
        : effect
    )
  };
}

export function setCustomSpellDraftEffectValue(
  draft: CustomSpellDraft,
  effectId: string,
  value: string
): CustomSpellDraft {
  return {
    ...draft,
    effects: draft.effects.map((effect) => (effect.id === effectId ? { ...effect, value } : effect))
  };
}

export function setCustomSpellDraftEffectValueMode(
  draft: CustomSpellDraft,
  effectId: string,
  valueMode: CharacterCustomTraitValueMode
): CustomSpellDraft {
  return {
    ...draft,
    effects: draft.effects.map((effect) =>
      effect.id === effectId ? { ...effect, valueMode } : effect
    )
  };
}

export function setCustomSpellDraftEffectRollMode(
  draft: CustomSpellDraft,
  effectId: string,
  rollMode: CharacterCustomTraitRollMode
): CustomSpellDraft {
  return {
    ...draft,
    effects: draft.effects.map((effect) =>
      effect.id === effectId ? { ...effect, rollMode } : effect
    )
  };
}
