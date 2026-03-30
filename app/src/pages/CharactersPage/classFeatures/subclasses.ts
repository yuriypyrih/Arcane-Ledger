import { getReactionEntryById, type ReactionEntry, type SpellEntry } from "../../../codex/entries";
import { getSelectedSubclassForCharacter } from "../subclasses";
import type { Character } from "../../../types";
import type {
  AbilityCheckIndicatorMap,
  CoreStatIndicatorMap,
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureAbilityScoreBonus,
  FeatureArmorProficiencyEntry,
  FeatureIndicator,
  FeatureLanguageProficiencyEntry,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SkillIndicatorMap
} from "./types";

export type SubclassDerivedFeatureState = {
  featureActions?: FeatureActionCard[];
  featureActionOptions?: Partial<Record<string, FeatureActionOptionCard[]>>;
  savingThrowIndicators?: SavingThrowIndicatorMap;
  abilityCheckIndicators?: AbilityCheckIndicatorMap;
  coreStatIndicators?: CoreStatIndicatorMap;
  skillIndicators?: SkillIndicatorMap;
  weaponAttackIndicators?: FeatureIndicator[];
  speedBonuses?: FeatureSpeedBonus[];
  abilityScoreBonuses?: FeatureAbilityScoreBonus[];
  cantripLimitBonus?: number;
  cantripDamageBonus?: number;
  weaponProficiencyEntries?: FeatureWeaponProficiencyEntry[];
  skillProficiencyEntries?: FeatureSkillProficiencyEntry[];
  savingThrowProficiencyEntries?: FeatureSavingThrowProficiencyEntry[];
  armorProficiencyEntries?: FeatureArmorProficiencyEntry[];
  languageProficiencyEntries?: FeatureLanguageProficiencyEntry[];
  alwaysPreparedSpellIds?: string[];
  derivedStatusEntries?: DerivedFeatureStatusEntry[];
  reactionEntries?: ReactionEntry[];
  spellDamageFormulaOverrides?: Record<string, string>;
  transformSpellEntry?: (spell: SpellEntry) => SpellEntry;
};

type SubclassRuntimeResolver = (
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
) => SubclassDerivedFeatureState;

const pathOfTheBerserkerSubclassId = "barbarian-path-of-the-berserker";

function getBerserkerReactionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry[] {
  if (
    character.className !== "Barbarian" ||
    character.subclassId !== pathOfTheBerserkerSubclassId ||
    (character.level ?? 0) < 10
  ) {
    return [];
  }

  const retaliation = getReactionEntryById("reaction-berserker-retaliation");

  return retaliation ? [retaliation] : [];
}

const subclassRuntimeResolvers: Record<string, SubclassRuntimeResolver> = {
  [pathOfTheBerserkerSubclassId]: (character) => ({
    reactionEntries: getBerserkerReactionEntries(character)
  })
};

export function getSubclassDerivedFeatureState(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SubclassDerivedFeatureState {
  const subclass = getSelectedSubclassForCharacter(character);

  if (!subclass) {
    return {};
  }

  const runtimeResolver =
    subclassRuntimeResolvers[subclass.runtimeHookId ?? subclass.id] ??
    subclassRuntimeResolvers[subclass.id];

  return runtimeResolver ? runtimeResolver(character) : {};
}
