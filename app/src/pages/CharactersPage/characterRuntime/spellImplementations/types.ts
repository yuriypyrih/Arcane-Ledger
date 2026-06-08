import type { SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import type { FeatureContributionSource } from "../../featureContributions";

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

export type SpellImplementationRollResult = {
  total: number;
};

export type SpellImplementationRollEffect = {
  id: string;
  title: string;
  formula: string;
  formulaDisplay?: string;
  description?: string;
  applyResolvedResult?: (
    character: Character,
    result: SpellImplementationRollResult
  ) => Character;
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

export type SpellImplementationRollEffectsContext = SpellImplementationApplyContext;

export type SpellImplementation = {
  spellId: string;
  getCastOptions?: (
    context: SpellImplementationCastOptionsContext
  ) => SpellImplementationCastOption[];
  applyOnCast?: (context: SpellImplementationApplyContext) => Character;
  getRollEffects?: (
    context: SpellImplementationRollEffectsContext
  ) => SpellImplementationRollEffect[];
};

export type SpellImplementationContributionSpec = {
  source: FeatureContributionSource & {
    type: "spell";
  };
  spellId: string;
  getCastOptions?: SpellImplementation["getCastOptions"];
  applyOnCast?: SpellImplementation["applyOnCast"];
  getRollEffects?: SpellImplementation["getRollEffects"];
};
