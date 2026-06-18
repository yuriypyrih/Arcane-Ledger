import type { SpellImplementation } from "./types";
import { shillelaghSpellImplementations } from "./shillelagh";
import { trueStrikeSpellImplementations } from "./trueStrike";

export const spellImplementations0: SpellImplementation[] = [
  ...shillelaghSpellImplementations,
  ...trueStrikeSpellImplementations
];
