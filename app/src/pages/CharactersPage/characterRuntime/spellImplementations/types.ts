import type { SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";

export type SpellImplementationCastSource =
  | "standard"
  | "fixed-feature"
  | "divine-intervention"
  | "mystic-arcanum"
  | "reaction";

export type SpellImplementationOptionValues = Record<string, boolean>;

export type SpellImplementationCastOption = {
  id: string;
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
};

export type SpellImplementationCastOptionsContext = {
  character: Character;
  spell: SpellEntry;
  castSource: SpellImplementationCastSource;
  forcedOptions?: SpellImplementationOptionValues;
};

export type SpellImplementationApplyContext = {
  character: Character;
  spell: SpellEntry;
  spellSlotLevel: number | null;
  castSource: SpellImplementationCastSource;
  options: SpellImplementationOptionValues;
};

export type SpellImplementation = {
  spellId: string;
  getCastOptions?: (
    context: SpellImplementationCastOptionsContext
  ) => SpellImplementationCastOption[];
  applyOnCast?: (context: SpellImplementationApplyContext) => Character;
};
