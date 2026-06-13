import { BODY_SIZE } from "../../codex/entries";
import type {
  Character,
  CharacterCustomBackgroundConfig,
  CharacterCustomSpeciesConfig,
  CharacterCustomSpeciesSize,
  CharacterCustomSubclassConfig
} from "../../types";
import { DEFAULT_TEXT_INPUT_MAX_LENGTH } from "../../constants/inputLimits";
import { sanitizeUserInput } from "../../utils/userInputSanitization";
import { CUSTOM_CLASS_NAME, isCustomClassName } from "./customClass";

export const CUSTOM_SUBCLASS_LABEL = "Custom";
export const CUSTOM_SPECIES_NAME = "Custom";
export const CUSTOM_BACKGROUND_NAME = "Custom";

export const CUSTOM_CLASS_NAME_MAX_LENGTH = DEFAULT_TEXT_INPUT_MAX_LENGTH;
export const CUSTOM_SUBCLASS_NAME_MAX_LENGTH = DEFAULT_TEXT_INPUT_MAX_LENGTH;
export const CUSTOM_SPECIES_NAME_MAX_LENGTH = DEFAULT_TEXT_INPUT_MAX_LENGTH;
export const CUSTOM_BACKGROUND_NAME_MAX_LENGTH = DEFAULT_TEXT_INPUT_MAX_LENGTH;

export const CUSTOM_SPECIES_SPEED_MINIMUM = 0;
export const CUSTOM_SPECIES_SPEED_MAXIMUM = 100;
export const CUSTOM_SPECIES_DEFAULT_SPEED = 30;

export const customSpeciesSizeOptions = [
  BODY_SIZE.SMALL,
  BODY_SIZE.MEDIUM,
  BODY_SIZE.LARGE
] as const satisfies readonly CharacterCustomSpeciesSize[];

type CustomMetadataKind = "class" | "subclass" | "species" | "background";

const idPrefixByKind: Record<CustomMetadataKind, string> = {
  class: "custom-class-",
  subclass: "custom-subclass-",
  species: "custom-species-",
  background: "custom-background-"
};

const customSpeciesSizeSet = new Set<string>(customSpeciesSizeOptions);

function clampInteger(value: unknown, minimum: number, maximum: number, fallback: number): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.min(maximum, Math.max(minimum, Math.floor(parsedValue)));
}

function normalizeCustomMetadataId(value: unknown, kind: CustomMetadataKind): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue.startsWith(idPrefixByKind[kind]) ? normalizedValue : undefined;
}

export function createCustomMetadataId(kind: CustomMetadataKind): string {
  const randomSuffix =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `${idPrefixByKind[kind]}${randomSuffix}`;
}

export function normalizeCustomMetadataName(value: unknown, maximumLength: number): string {
  return typeof value === "string" ? sanitizeUserInput(value).slice(0, maximumLength) : "";
}

export function isCustomSubclassId(value: unknown): value is string {
  return normalizeCustomMetadataId(value, "subclass") !== undefined;
}

export function isCustomSpeciesName(value: unknown): boolean {
  return typeof value === "string" && value.trim() === CUSTOM_SPECIES_NAME;
}

export function isCustomBackgroundName(value: unknown): boolean {
  return typeof value === "string" && value.trim() === CUSTOM_BACKGROUND_NAME;
}

export function normalizeCustomSpeciesSize(value: unknown): CharacterCustomSpeciesSize {
  return typeof value === "string" && customSpeciesSizeSet.has(value)
    ? (value as CharacterCustomSpeciesSize)
    : BODY_SIZE.MEDIUM;
}

export function normalizeCustomSpeciesSpeed(value: unknown): number {
  return clampInteger(
    value,
    CUSTOM_SPECIES_SPEED_MINIMUM,
    CUSTOM_SPECIES_SPEED_MAXIMUM,
    CUSTOM_SPECIES_DEFAULT_SPEED
  );
}

export function createDefaultCustomSubclassConfig(className: string): CharacterCustomSubclassConfig {
  return {
    id: createCustomMetadataId("subclass"),
    name: "",
    className
  };
}

export function normalizeCustomSubclassConfig(
  value: unknown,
  options: { className?: string | null } = {}
): CharacterCustomSubclassConfig | undefined {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const id = normalizeCustomMetadataId(record.id, "subclass");
  const className =
    typeof options.className === "string" && options.className.trim()
      ? options.className.trim()
      : typeof record.className === "string"
        ? record.className.trim()
        : "";

  if (!id || !className || isCustomClassName(className)) {
    return undefined;
  }

  return {
    id,
    name: normalizeCustomMetadataName(record.name, CUSTOM_SUBCLASS_NAME_MAX_LENGTH),
    className
  };
}

export function createDefaultCustomSpeciesConfig(): CharacterCustomSpeciesConfig {
  return {
    id: createCustomMetadataId("species"),
    name: "",
    speed: CUSTOM_SPECIES_DEFAULT_SPEED,
    size: BODY_SIZE.MEDIUM
  };
}

export function normalizeCustomSpeciesConfig(
  value: unknown
): CharacterCustomSpeciesConfig | undefined {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const id = normalizeCustomMetadataId(record.id, "species");

  if (!id) {
    return undefined;
  }

  return {
    id,
    name: normalizeCustomMetadataName(record.name, CUSTOM_SPECIES_NAME_MAX_LENGTH),
    speed: normalizeCustomSpeciesSpeed(record.speed),
    size: normalizeCustomSpeciesSize(record.size)
  };
}

export function createDefaultCustomBackgroundConfig(): CharacterCustomBackgroundConfig {
  return {
    id: createCustomMetadataId("background"),
    name: ""
  };
}

export function normalizeCustomBackgroundConfig(
  value: unknown
): CharacterCustomBackgroundConfig | undefined {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const id = normalizeCustomMetadataId(record.id, "background");

  if (!id) {
    return undefined;
  }

  return {
    id,
    name: normalizeCustomMetadataName(record.name, CUSTOM_BACKGROUND_NAME_MAX_LENGTH)
  };
}

export function getCharacterClassDisplayName(
  character: Pick<Character, "className"> & Partial<Pick<Character, "customClass">>
): string {
  return isCustomClassName(character.className)
    ? character.customClass?.name?.trim() || CUSTOM_CLASS_NAME
    : character.className;
}

export function getCharacterSubclassDisplayName(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "subclassId" | "customSubclass">>
): string | null {
  if (
    character.subclassId &&
    character.customSubclass?.id === character.subclassId &&
    character.customSubclass.className === character.className
  ) {
    return character.customSubclass.name.trim() || CUSTOM_SUBCLASS_LABEL;
  }

  return null;
}

export function getCharacterSpeciesDisplayName(
  character: Pick<Character, "species"> & Partial<Pick<Character, "customSpecies">>
): string {
  return isCustomSpeciesName(character.species)
    ? character.customSpecies?.name?.trim() || CUSTOM_SPECIES_NAME
    : character.species;
}

export function getCharacterBackgroundDisplayName(
  character: Pick<Character, "background"> & Partial<Pick<Character, "customBackground">>
): string {
  return isCustomBackgroundName(character.background)
    ? character.customBackground?.name?.trim() || CUSTOM_BACKGROUND_NAME
    : character.background;
}
