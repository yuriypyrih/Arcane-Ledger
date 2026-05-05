import type { SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";

export type SpellCastImplementationOptions = {
  castMageArmorOnSelf?: boolean;
};

export type SpellCastImplementationContext = {
  character: Character;
  spell: SpellEntry;
  options: SpellCastImplementationOptions;
};

export type SpellCastImplementation = (context: SpellCastImplementationContext) => Character;

export type SpellCastImplementationModifier = (
  implementation: SpellCastImplementation | null,
  context: SpellCastImplementationContext
) => SpellCastImplementation | null;
