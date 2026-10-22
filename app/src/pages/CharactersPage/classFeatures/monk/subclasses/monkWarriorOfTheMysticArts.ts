import type { SpellEntry } from "../../../../../codex/entries";
import { ACTION_TYPE, CLASS_FEATURE } from "../../../../../codex/entries/enums";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { shouldTrackRoundScopedResources } from "../../../combat";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import type { WeaponAction } from "../../../gameplay";
import { getClassLevel, getClassSubclassId } from "../../../multiclassState";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter, SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureEconomyMultiAccessRule } from "../../types";
import { getMonkFlurryOfBlowsAttackMultiCount } from "../monk";

export const warriorOfTheMysticArtsSubclassId = "monk-warrior-of-the-mystic-arts";
export const mysticArtsFlurrySpellPathId = "monk-mystic-arts-flurry";

function hasMysticArtsFeature(
  character: SubclassRuntimeCharacter,
  feature: CLASS_FEATURE
): boolean {
  const row = getSubclassEntryById(warriorOfTheMysticArtsSubclassId)?.features.find((entry) =>
    entry.classFeatures.includes(feature)
  );
  return (
    getClassSubclassId(character, "Monk") === warriorOfTheMysticArtsSubclassId &&
    row !== undefined &&
    getClassLevel(character, "Monk") >= row.level
  );
}

function hasActionCastingTime(spell: Pick<SpellEntry, "castingTime" | "spellLevel">): boolean {
  return (
    spell.castingTime.includes(ACTION_TYPE.ACTION) &&
    !spell.castingTime.includes(ACTION_TYPE.BONUS_ACTION) &&
    !spell.castingTime.includes(ACTION_TYPE.REACTION)
  );
}

export function canReplaceMysticArtsStrikeWithCantrip(
  character: SubclassRuntimeCharacter,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  return (
    hasMysticArtsFeature(character, CLASS_FEATURE.MYSTIC_FIGHTING_STYLE) &&
    spell.spellLevel === 0 &&
    hasActionCastingTime(spell)
  );
}

export function getMysticArtsCantripAccessRules(
  character: SubclassRuntimeCharacter
): FeatureEconomyMultiAccessRule[] {
  return hasMysticArtsFeature(character, CLASS_FEATURE.MYSTIC_FIGHTING_STYLE)
    ? [
        {
          economyTypes: [ECONOMY_TYPE.ACTION],
          actionCategories: [ACTION_CATEGORY.MAGIC],
          spellLevels: [0],
          spellCastingTimes: [ACTION_TYPE.ACTION],
          maxAccessible: "all"
        }
      ]
    : [];
}

export function canReplaceMysticArtsStrikesWithSpell(
  character: SubclassRuntimeCharacter,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  return (
    hasMysticArtsFeature(character, CLASS_FEATURE.IMPROVED_MYSTIC_FIGHTING_STYLE) &&
    (spell.spellLevel === 1 || spell.spellLevel === 2) &&
    hasActionCastingTime(spell)
  );
}

export function appendMysticArtsSpellDescription(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  return canReplaceMysticArtsStrikesWithSpell(character, spell)
    ? appendFeatureSourcedDescriptionAddition(
        spell,
        character,
        CLASS_FEATURE.IMPROVED_MYSTIC_FIGHTING_STYLE,
        getFeatureDescriptionForCharacter(character, CLASS_FEATURE.IMPROVED_MYSTIC_FIGHTING_STYLE),
        "Improved Mystic Fighting Style"
      )
    : spell;
}

type MysticArtsEconomyCharacter = Pick<
  Character,
  "className" | "level" | "classFeatureState" | "roundTracker"
> &
  Partial<Pick<Character, "subclassId">>;

export function hasMysticArtsFlurrySpellPath(
  character: MysticArtsEconomyCharacter,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  return (
    canReplaceMysticArtsStrikesWithSpell(character, spell) &&
    shouldTrackRoundScopedResources(character.roundTracker) &&
    getMonkFlurryOfBlowsAttackMultiCount(character) > 0
  );
}

/** The pool engine owns payment; this subclass only declares eligibility and cost. */
export function getMysticArtsSpellAccessRules(
  character: SubclassRuntimeCharacter,
  economyType: typeof ECONOMY_TYPE.ACTION | typeof ECONOMY_TYPE.BONUS_ACTION
): FeatureEconomyMultiAccessRule[] {
  if (!hasMysticArtsFeature(character, CLASS_FEATURE.IMPROVED_MYSTIC_FIGHTING_STYLE)) return [];
  return [
    {
      economyTypes: [economyType],
      actionCategories: [ACTION_CATEGORY.MAGIC],
      spellLevels: [1, 2],
      spellCastingTimes: [ACTION_TYPE.ACTION],
      ...(economyType === ECONOMY_TYPE.BONUS_ACTION
        ? { spellActionPathIds: [mysticArtsFlurrySpellPathId] }
        : {}),
      cost: 2,
      maxAccessible: "all"
    }
  ];
}

function collectMysticArtsContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  const contributions: FeatureContributionSpec[] = [];
  if (hasMysticArtsFeature(character, CLASS_FEATURE.FOCUSED_STRIKE)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "monk-mystic-arts-focused-strike",
        label: "Focused Strike",
        entryId: CLASS_FEATURE.FOCUSED_STRIKE
      }),
      weaponActionTransforms: [
        {
          id: "monk-mystic-arts-focused-strike-description",
          transform: (_character, value) => {
            const action = value as WeaponAction;
            return action.key === "unarmed-strike" && action.attackKind === "unarmed"
              ? appendFeatureSourcedDescriptionAddition(
                  action,
                  character,
                  CLASS_FEATURE.FOCUSED_STRIKE,
                  getFeatureDescriptionForCharacter(character, CLASS_FEATURE.FOCUSED_STRIKE),
                  "Focused Strike"
                )
              : action;
          }
        }
      ]
    });
  }
  if (hasMysticArtsFeature(character, CLASS_FEATURE.IMPROVED_MYSTIC_FIGHTING_STYLE)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "monk-mystic-arts-improved-mystic-fighting-style",
        label: "Improved Mystic Fighting Style",
        entryId: CLASS_FEATURE.IMPROVED_MYSTIC_FIGHTING_STYLE
      }),
      spellTransforms: [
        {
          id: "monk-mystic-arts-improved-mystic-fighting-style-spell-description",
          transform: (spell) => appendMysticArtsSpellDescription(character, spell)
        }
      ],
      featureActionTransforms: [
        {
          id: "monk-mystic-arts-improved-mystic-fighting-style-description",
          transform: (action) =>
            action.key === "monk-flurry-of-blows"
              ? appendFeatureSourcedDescriptionAddition(
                  action,
                  character,
                  CLASS_FEATURE.IMPROVED_MYSTIC_FIGHTING_STYLE,
                  getFeatureDescriptionForCharacter(
                    character,
                    CLASS_FEATURE.IMPROVED_MYSTIC_FIGHTING_STYLE
                  ),
                  "Improved Mystic Fighting Style"
                )
              : action
        }
      ]
    });
  }
  return contributions;
}

export const getMonkWarriorOfTheMysticArtsDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectMysticArtsContributions),
    { character: character as Character }
  );
