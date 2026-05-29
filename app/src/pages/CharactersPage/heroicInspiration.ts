import type { Character } from "../../types";

export const HEROIC_INSPIRATION_TITLE = "Heroic Inspiration";

export const HEROIC_INSPIRATION_DESCRIPTION = [
  "You have a special resource that lets you push beyond your limits.",
  "When you fail or dislike the result of a d20 Test (attack roll, ability check, or saving throw), you can spend your Heroic Inspiration to reroll the die. You must use the new result.",
  "You can have only one Heroic Inspiration at a time. If you gain it while you already have it, you can give it to another character.",
  "You gain Heroic Inspiration at the start of each session, when you level up, and at the GM's discretion for notable actions or roleplaying."
] as const;

export function normalizeHeroicInspiration(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  return fallback;
}

export function setHeroicInspirationForCharacter(
  character: Character,
  nextValue: boolean
): Character {
  if (character.heroicInspiration === nextValue) {
    return character;
  }

  return {
    ...character,
    heroicInspiration: nextValue
  };
}

export function restoreHeroicInspirationForCharacter(character: Character): Character {
  return setHeroicInspirationForCharacter(character, true);
}

export function expendHeroicInspirationForCharacter(character: Character): Character {
  return setHeroicInspirationForCharacter(character, false);
}

export function toggleHeroicInspirationForCharacter(character: Character): Character {
  return setHeroicInspirationForCharacter(character, !character.heroicInspiration);
}
