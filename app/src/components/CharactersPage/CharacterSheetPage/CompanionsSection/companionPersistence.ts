import type { Character, CharacterCompanion } from "../../../../types";

export function upsertCharacterCompanion(
  character: Character,
  nextCompanion: CharacterCompanion
): Character {
  const currentCompanions = character.companions ?? [];
  const hasExistingCompanion = currentCompanions.some(
    (companion) => companion.id === nextCompanion.id
  );

  return {
    ...character,
    companions: hasExistingCompanion
      ? currentCompanions.map((companion) =>
          companion.id === nextCompanion.id ? nextCompanion : companion
        )
      : [...currentCompanions, nextCompanion]
  };
}

export function removeCharacterCompanion(character: Character, companionId: string): Character {
  return {
    ...character,
    companions: (character.companions ?? []).filter((companion) => companion.id !== companionId)
  };
}
