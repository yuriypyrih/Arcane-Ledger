import type { Character } from "../../src/types";
import { normalizeCharacter } from "../../src/pages/CharactersPage/storage";
import { portableSheet } from "./portable";

export function characterFixture(overrides: Partial<Character> = {}): Character {
  const character = normalizeCharacter(portableSheet());
  if (!character) throw new Error("The saved character fixture is invalid");
  const normalized = normalizeCharacter({ ...character, ...overrides });
  if (!normalized) throw new Error("The character overrides are invalid");
  return normalized;
}
