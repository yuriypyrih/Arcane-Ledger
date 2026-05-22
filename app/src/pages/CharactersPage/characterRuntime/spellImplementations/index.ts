import type { Character } from "../../../../types";
import type {
  SpellImplementation,
  SpellImplementationApplyContext,
  SpellImplementationCastOption,
  SpellImplementationCastOptionsContext,
  SpellImplementationCastSource,
  SpellImplementationOptionValues
} from "./types";
import { spellImplementations0 } from "./spells0";
import { spellImplementations1 } from "./spells1";
import { spellImplementations2 } from "./spells2";
import { spellImplementations3 } from "./spells3";
import { spellImplementations4 } from "./spells4";
import { spellImplementations5 } from "./spells5";
import { spellImplementations6 } from "./spells6";
import { spellImplementations7 } from "./spells7";
import { spellImplementations8 } from "./spells8";
import { spellImplementations9 } from "./spells9";

export type {
  SpellImplementation,
  SpellImplementationApplyContext,
  SpellImplementationCastOption,
  SpellImplementationCastOptionsContext,
  SpellImplementationCastSource,
  SpellImplementationOptionValues
} from "./types";
export {
  applyFalseLifeTemporaryHitPointsToCharacter,
  falseLifeSpellId,
  falseLifeTemporaryHitPointsSource,
  fiendishVigorTemporaryHitPointsSource,
  getFalseLifeTemporaryHitPointsBonus,
  getFalseLifeTemporaryHitPointsFormula,
  getFalseLifeTemporaryHitPointsFormulaDisplay,
  getFalseLifeTemporaryHitPointsFromRoll
} from "./falseLife";
export {
  mageArmorCastOnSelfOptionId,
  getMageArmorArmorClassModes,
  hasMageArmorSelfStatus,
  isMageArmorSelfStatusEntry,
  mageArmorSpellId,
  mageArmorStatusSourceId,
  mageArmorStatusValue
} from "./spells1";

type ApplySpellImplementationForCharacterContext = Pick<
  SpellImplementationApplyContext,
  "character" | "spell"
> & {
  spellSlotLevel?: number | null;
  castSource?: SpellImplementationCastSource;
  options?: SpellImplementationOptionValues;
};

const spellImplementations = [
  ...spellImplementations0,
  ...spellImplementations1,
  ...spellImplementations2,
  ...spellImplementations3,
  ...spellImplementations4,
  ...spellImplementations5,
  ...spellImplementations6,
  ...spellImplementations7,
  ...spellImplementations8,
  ...spellImplementations9
];

const spellImplementationsById = new Map<string, SpellImplementation>(
  spellImplementations.map((implementation) => [implementation.spellId, implementation])
);

export function getSpellImplementation(spellId: string): SpellImplementation | null {
  return spellImplementationsById.get(spellId) ?? null;
}

export function getSpellCastOptionsForCharacter(
  context: SpellImplementationCastOptionsContext
): SpellImplementationCastOption[] {
  return getSpellImplementation(context.spell.id)?.getCastOptions?.(context) ?? [];
}

export function createDefaultSpellImplementationOptionValues(
  options: readonly SpellImplementationCastOption[]
): SpellImplementationOptionValues {
  return Object.fromEntries(
    options.map((option) => [option.id, option.defaultChecked === true])
  );
}

export function applySpellImplementationForCharacter({
  character,
  spell,
  spellSlotLevel = null,
  castSource = "standard",
  options = {}
}: ApplySpellImplementationForCharacterContext): Character {
  const implementation = getSpellImplementation(spell.id);

  if (!implementation?.applyOnCast) {
    return character;
  }

  return implementation.applyOnCast({
    character,
    spell,
    spellSlotLevel,
    castSource,
    options
  });
}
