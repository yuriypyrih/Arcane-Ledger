import type { SpellEntry } from "../../../../codex/entries";
import type { Character, CharacterStatusSpellTarget, SkillName } from "../../../../types";
import type { FeatureContributionSource } from "../../featureContributions";

export type SpellImplementationCastSource =
  | "standard"
  | "fixed-feature"
  | "divine-intervention"
  | "mystic-arcanum"
  | "reaction";

export type SpellImplementationOptionValue = boolean | string;
export type SpellImplementationOptionValues = Record<string, SpellImplementationOptionValue>;

export type SpellImplementationCastOptionChoice = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SpellImplementationCastOption = {
  id: string;
  label: string;
  defaultChecked?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  choicePresentation?: "segmented" | "select";
  choices?: SpellImplementationCastOptionChoice[];
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
  sourceSpellSlotLevel: number | null;
  castSource: SpellImplementationCastSource;
  options: SpellImplementationOptionValues;
};

export type SpellImplementationRollEffectsContext = SpellImplementationApplyContext;

export type SpellImplementationStatusOptions = {
  sourceSpellTarget?: CharacterStatusSpellTarget | null;
  sourceSpellSkill?: SkillName | null;
};

export type SpellImplementationStatusOptionsContext = SpellImplementationApplyContext;

export type SpellImplementation = {
  spellId: string;
  getCastOptions?: (
    context: SpellImplementationCastOptionsContext
  ) => SpellImplementationCastOption[];
  applyOnCast?: (context: SpellImplementationApplyContext) => Character;
  getRollEffects?: (
    context: SpellImplementationRollEffectsContext
  ) => SpellImplementationRollEffect[];
  getStatusOptions?: (
    context: SpellImplementationStatusOptionsContext
  ) => SpellImplementationStatusOptions;
};

export type SpellImplementationContributionSpec = {
  source: FeatureContributionSource & {
    type: "spell";
  };
  spellId: string;
  getCastOptions?: SpellImplementation["getCastOptions"];
  applyOnCast?: SpellImplementation["applyOnCast"];
  getRollEffects?: SpellImplementation["getRollEffects"];
  getStatusOptions?: SpellImplementation["getStatusOptions"];
};
