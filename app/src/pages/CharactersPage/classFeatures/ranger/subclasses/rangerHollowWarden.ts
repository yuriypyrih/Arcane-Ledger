import { ABILITY_TYPES, CLASS_FEATURE, SPELL_LIST_CLASS } from "../../../../../codex/entries/enums";
import type { SpellDescriptionEntry } from "../../../../../codex/entries";
import type { AbilityKey, Character, CharacterStatusEntrySpellFormula } from "../../../../../types";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import type { WeaponAction } from "../../../gameplay";
import {
  appendDescriptionAddition,
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import { getClassLevel, getClassSubclassId, hasCharacterClass } from "../../../multiclassState";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getSpellSaveFormulaCell } from "../../../shared/spellFormulas";
import {
  createCharacterStatusEntry,
  hasStatusCondition,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import {
  createFeatureActionCardCost,
  createNamedResourceCardUsage,
  createNamedUsageHeaderTags
} from "../../cardUsage";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeCharacter,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import {
  consumeRangerFavoredEnemyUse,
  getRangerFavoredEnemyUsesRemaining,
  getRangerFavoredEnemyUsesTotal
} from "../ranger";

const hollowWardenSubclassId = "ranger-hollow-warden";
const wrathOfTheWildName = "Wrath of the Wild";
export const wrathOfTheWildActionKey = "ranger-hollow-warden-wrath-of-the-wild";
export const wrathOfTheWildStatusSourceId = "feature-ranger-hollow-warden-wrath-of-the-wild";
const hollowWardenSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Wrathful Smite"]),
  5: resolveSpellIdsByName(["Alter Self"]),
  9: resolveSpellIdsByName(["Phantom Steed"]),
  13: resolveSpellIdsByName(["Dominate Beast"]),
  17: resolveSpellIdsByName(["Steel Wind Strike"])
};
type HollowWardenCharacter = SubclassRuntimeCharacter &
  Partial<Pick<Character, "currentHitPoints" | "deathSaves">>;

export function hasHollowWardenFeatures(
  character: SubclassRuntimeCharacter,
  minimumLevel = 3
): boolean {
  return (
    hasCharacterClass(character, "Ranger") &&
    getClassSubclassId(character, "Ranger") === hollowWardenSubclassId &&
    getClassLevel(character, "Ranger") >= minimumLevel
  );
}

function hasHungeringMight(character: SubclassRuntimeCharacter): boolean {
  return hasHollowWardenFeatures(character) && getClassLevel(character, "Ranger") >= 7;
}

export function getRangerHungeringMightSavingThrowDescriptionAdditions(
  character: SubclassRuntimeCharacter,
  ability: AbilityKey
): SpellDescriptionEntry[][] {
  if (ability !== "CON" || !hasHungeringMight(character)) return [];

  return [
    createFeatureSourcedDescriptionEntries(
      character,
      CLASS_FEATURE.HUNGERING_MIGHT,
      getFeatureDescriptionForCharacter(character, CLASS_FEATURE.HUNGERING_MIGHT).slice(0, 1)
    )
  ];
}

function canMaintainWrathOfTheWild(character: HollowWardenCharacter): boolean {
  return (
    hasHollowWardenFeatures(character) &&
    !hasStatusCondition(character.statusEntries, CONDITION_NAME.INCAPACITATED) &&
    !(character.currentHitPoints === 0 && (character.deathSaves?.failures ?? 0) >= 3)
  );
}

function getAncientArmorBonus(character: SubclassRuntimeCharacter): number {
  return getClassLevel(character, "Ranger") >= 11 ? 2 : 1;
}

export function hasActiveWrathOfTheWild(character: SubclassRuntimeCharacter): boolean {
  return (
    canMaintainWrathOfTheWild(character) &&
    normalizeCharacterStatusEntries(character.statusEntries).some(
      (entry) => !entry.disabled && entry.sourceId === wrathOfTheWildStatusSourceId
    )
  );
}

export function getWrathOfTheWildDescriptionAdditions(
  character: SubclassRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasHollowWardenFeatures(character, 11)) return [];
  return [
    createFeatureSourcedDescriptionEntries(
      character,
      CLASS_FEATURE.ROT_AND_VIOLENCE,
      getFeatureDescriptionForCharacter(character, CLASS_FEATURE.ROT_AND_VIOLENCE)
    )
  ];
}

export function getWrathOfTheWildSpellFormulas(
  character: SubclassRuntimeCharacter
): CharacterStatusEntrySpellFormula[] {
  const formula = getSpellSaveFormulaCell(
    {
      isSavingThrowSpell: true,
      savingThrowAbility: ABILITY_TYPES.WIS,
      spellLists: [SPELL_LIST_CLASS.RANGER]
    },
    character as Character,
    "WIS"
  );
  return formula ? [formula] : [];
}

function getWrathOfTheWildAction(character: SubclassRuntimeCharacter): FeatureActionCard {
  const usesRemaining = getRangerFavoredEnemyUsesRemaining(character as Character);
  const usesTotal = getRangerFavoredEnemyUsesTotal(character as Character);
  const armorClassBonus = getAncientArmorBonus(character);
  const cost = createFeatureActionCardCost({ amountText: "1", resourceLabel: "Favored Enemy" });
  const disabledReason = !canMaintainWrathOfTheWild(character)
    ? "You can't transform while Incapacitated or dead."
    : usesRemaining <= 0
      ? "Favored Enemy recharges on a Long Rest."
      : undefined;

  return {
    key: wrathOfTheWildActionKey,
    name: wrathOfTheWildName,
    sourceFeature: CLASS_FEATURE.WRATH_OF_THE_WILD,
    summary: `Transform for 10 turns and gain +${armorClassBonus} AC.`,
    detail: "Spend one Favored Enemy use to take on a monstrous form.",
    breakdown: `+${armorClassBonus} AC | 10 turns`,
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    cardUsage: createNamedResourceCardUsage(cost),
    headerTags: createNamedUsageHeaderTags(cost, usesRemaining, usesTotal),
    usesRemaining,
    usesTotal,
    isActive: hasActiveWrathOfTheWild(character),
    description: getFeatureDescriptionForCharacter(character, CLASS_FEATURE.WRATH_OF_THE_WILD),
    facts: getWrathOfTheWildSpellFormulas(character).map((formula) => ({
      label: formula.label,
      value: formula.content,
      breakdown: formula.breakdown,
      fullWidth: true
    })),
    drawer: { kind: "confirm", eyebrow: "Hollow Warden" },
    execute: { kind: "activate" },
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function activateRangerWrathOfTheWild(character: Character): Character {
  if (!canMaintainWrathOfTheWild(character)) return character;
  const nextCharacter = consumeRangerFavoredEnemyUse(character);
  if (nextCharacter === character) return character;

  return {
    ...nextCharacter,
    statusEntries: [
      ...normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
        (entry) => entry.sourceId !== wrathOfTheWildStatusSourceId
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: wrathOfTheWildName,
        source: wrathOfTheWildName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        sourceId: wrathOfTheWildStatusSourceId,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 10,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        spellFormulas: getWrathOfTheWildSpellFormulas(character)
      })
    ]
  };
}

export function reconcileRangerWrathOfTheWildStatus(character: Character): Character {
  const currentStatusEntries = character.statusEntries ?? [];
  if (
    !currentStatusEntries.some((entry) => entry.sourceId === wrathOfTheWildStatusSourceId) ||
    canMaintainWrathOfTheWild(character)
  ) {
    return character;
  }
  return {
    ...character,
    statusEntries: currentStatusEntries.filter(
      (entry) => entry.sourceId !== wrathOfTheWildStatusSourceId
    )
  };
}

function collectHollowWardenContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasHollowWardenFeatures(character)) return [];

  const contributions: FeatureContributionSpec[] = [
    {
      source: createSubclassContributionSource({
        id: "ranger-hollow-warden-spells",
        label: "Hollow Warden Spells",
        entryId: CLASS_FEATURE.HOLLOW_WARDEN_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        getClassLevel(character, "Ranger"),
        hollowWardenSpellIdsByLevel
      )
    },
    {
      source: createSubclassContributionSource({
        id: wrathOfTheWildActionKey,
        label: wrathOfTheWildName,
        entryId: CLASS_FEATURE.WRATH_OF_THE_WILD
      }),
      actions: [getWrathOfTheWildAction(character)],
      armorClassBonuses: [
        {
          id: "ranger-hollow-warden-ancient-armor",
          getBonuses: () =>
            hasActiveWrathOfTheWild(character)
              ? [
                  {
                    label: wrathOfTheWildName,
                    value: getAncientArmorBonus(character)
                  }
                ]
              : []
        }
      ]
    }
  ];

  if (hasHungeringMight(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "ranger-hollow-warden-hungering-might",
        label: "Hungering Might",
        entryId: CLASS_FEATURE.HUNGERING_MIGHT
      }),
      savingThrowBonuses: [
        {
          id: "ranger-hollow-warden-hungering-might-con-save",
          getBonuses: (ability) =>
            ability === "CON"
              ? [
                  {
                    label: "WIS Modifier (Hungering Might)",
                    abilityModifierSource: "WIS",
                    minimumValue: 1
                  }
                ]
              : []
        }
      ],
      featureActionTransforms: [
        {
          id: "ranger-hollow-warden-hungering-might-description",
          transform: (action) =>
            action.key === wrathOfTheWildActionKey
              ? appendFeatureSourcedDescriptionAddition(
                  action,
                  character,
                  CLASS_FEATURE.HUNGERING_MIGHT,
                  getFeatureDescriptionForCharacter(character, CLASS_FEATURE.HUNGERING_MIGHT).slice(
                    1
                  )
                )
              : action
        }
      ]
    });
  }

  if (hasHollowWardenFeatures(character, 11)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "ranger-hollow-warden-rot-and-violence",
        label: "Rot and Violence",
        entryId: CLASS_FEATURE.ROT_AND_VIOLENCE
      }),
      featureActionTransforms: [
        {
          id: "ranger-hollow-warden-rot-and-violence-description",
          transform: (action) =>
            action.key === wrathOfTheWildActionKey
              ? getWrathOfTheWildDescriptionAdditions(character).reduce(
                  (nextAction, addition) => appendDescriptionAddition(nextAction, addition),
                  action
                )
              : action
        }
      ]
    });
  }

  if (hasHollowWardenFeatures(character, 15)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "ranger-hollow-warden-ancient-might",
        label: "Ancient Might",
        entryId: CLASS_FEATURE.ANCIENT_MIGHT
      }),
      weaponActionTransforms: [
        {
          id: "ranger-hollow-warden-ominous-strikes-description",
          transform: (_character, action) =>
            appendFeatureSourcedDescriptionAddition(
              action as WeaponAction,
              character,
              CLASS_FEATURE.ANCIENT_MIGHT,
              getFeatureDescriptionForCharacter(character, CLASS_FEATURE.ANCIENT_MIGHT).slice(0, 1)
            )
        }
      ]
    });
  }

  return contributions;
}

export const getRangerHollowWardenDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectHollowWardenContributions),
    { character: character as Character }
  );
