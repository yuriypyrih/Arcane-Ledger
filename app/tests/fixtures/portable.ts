import type { PortableCharacterSheet } from "../../src/types/characterSheets";
import fixture from "../../../fixtures/characters/fighter.json" with { type: "json" };
/** Synthetic saved sheet shared with real API and browser tests. */
export function portableSheet(
  overrides: Partial<PortableCharacterSheet> = {}
): PortableCharacterSheet {
  return { ...(structuredClone(fixture) as PortableCharacterSheet), ...overrides };
}
