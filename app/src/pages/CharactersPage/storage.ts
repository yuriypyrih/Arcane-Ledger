import type { Character, CharacterDraft } from "../../types";
import {
  CHARACTERS_STORAGE_KEY,
  alignmentGrid,
  createDefaultAbilities,
  createEmptyCharacter
} from "./constants";

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, parsedValue));
}

function normalizeCharacter(value: unknown): Character | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<Character>;
  const id = Number(record.id);

  if (!Number.isFinite(id)) {
    return null;
  }

  const defaults = createEmptyCharacter();
  const normalizedHitPoints = clampNumber(record.hitPoints, 1, 999, defaults.hitPoints);

  return {
    id,
    name: typeof record.name === "string" ? record.name : defaults.name,
    species: typeof record.species === "string" ? record.species : defaults.species,
    role: typeof record.role === "string" ? record.role : defaults.role,
    level: clampNumber(record.level, 1, 20, defaults.level),
    hitPoints: normalizedHitPoints,
    currentHitPoints: clampNumber(
      record.currentHitPoints,
      0,
      normalizedHitPoints,
      normalizedHitPoints
    ),
    attributeMode:
      record.attributeMode === "pointBuy" || record.attributeMode === "custom"
        ? record.attributeMode
        : defaults.attributeMode,
    abilities: {
      ...createDefaultAbilities(),
      ...(record.abilities ?? {})
    },
    alignment: (alignmentGrid.flat() as string[]).includes(record.alignment ?? "")
      ? (record.alignment as Character["alignment"])
      : defaults.alignment,
    background: typeof record.background === "string" ? record.background : defaults.background,
    skills: Array.isArray(record.skills)
      ? record.skills.filter((skill): skill is string => typeof skill === "string")
      : defaults.skills,
    equipment: Array.isArray(record.equipment)
      ? record.equipment.filter((item): item is string => typeof item === "string")
      : defaults.equipment
  };
}

export function loadCharacters(): Character[] {
  if (typeof window === "undefined") {
    return [];
  }

  const serializedCharacters = window.localStorage.getItem(CHARACTERS_STORAGE_KEY);

  if (!serializedCharacters) {
    return [];
  }

  try {
    const parsedCharacters = JSON.parse(serializedCharacters) as unknown;
    if (!Array.isArray(parsedCharacters)) {
      return [];
    }

    return parsedCharacters
      .map((character) => normalizeCharacter(character))
      .filter((character): character is Character => character !== null);
  } catch {
    return [];
  }
}

export function saveCharacters(characters: Character[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(characters));
}

export function findCharacter(characterId: number): Character | undefined {
  return loadCharacters().find((character) => character.id === characterId);
}

export function upsertCharacter(draft: CharacterDraft, characterId?: number): Character {
  const characters = loadCharacters();
  const nextCharacter: Character = {
    id: characterId ?? Date.now(),
    ...draft
  };

  const nextCharacters =
    characterId === undefined
      ? [nextCharacter, ...characters]
      : characters.some((character) => character.id === characterId)
        ? characters.map((character) =>
            character.id === characterId ? nextCharacter : character
          )
        : [nextCharacter, ...characters];

  saveCharacters(nextCharacters);
  return nextCharacter;
}
