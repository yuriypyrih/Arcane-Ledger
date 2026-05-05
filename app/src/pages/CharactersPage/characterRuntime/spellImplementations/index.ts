import {
  applyMageArmorSpellImplementation,
  mageArmorSpellId
} from "./mageArmor";
import type { Character } from "../../../../types";
import type {
  SpellCastImplementation,
  SpellCastImplementationContext,
  SpellCastImplementationModifier,
  SpellCastImplementationOptions
} from "./types";

export type {
  SpellCastImplementation,
  SpellCastImplementationContext,
  SpellCastImplementationModifier,
  SpellCastImplementationOptions
} from "./types";
export {
  getMageArmorArmorClassModes,
  hasMageArmorSelfStatus,
  isMageArmorSelfStatusEntry,
  mageArmorSpellId,
  mageArmorStatusSourceId,
  mageArmorStatusValue
} from "./mageArmor";

type ApplySpellImplementationForCharacterContext = Omit<
  SpellCastImplementationContext,
  "options"
> & {
  options?: SpellCastImplementationOptions;
  modifiers?: SpellCastImplementationModifier[];
};

const spellCastImplementations: Record<string, SpellCastImplementation> = {
  [mageArmorSpellId]: applyMageArmorSpellImplementation
};

function resolveSpellCastImplementation(
  context: SpellCastImplementationContext,
  modifiers: SpellCastImplementationModifier[]
): SpellCastImplementation | null {
  const baseImplementation = spellCastImplementations[context.spell.id] ?? null;

  return modifiers.reduce<SpellCastImplementation | null>(
    (implementation, modifier) => modifier(implementation, context),
    baseImplementation
  );
}

export function applySpellImplementationForCharacter({
  character,
  spell,
  options,
  modifiers = []
}: ApplySpellImplementationForCharacterContext): Character {
  const implementationContext: SpellCastImplementationContext = {
    character,
    spell,
    options: options ?? {}
  };
  const implementation = resolveSpellCastImplementation(implementationContext, modifiers);

  return implementation ? implementation(implementationContext) : character;
}
