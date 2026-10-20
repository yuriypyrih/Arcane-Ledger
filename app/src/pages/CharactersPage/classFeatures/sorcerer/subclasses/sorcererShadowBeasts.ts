import type { SpellEntry } from "../../../../../codex/entries";
import { ACTION_TYPE, CLASS_FEATURE, SPELL_COMPONENT } from "../../../../../codex/entries/enums";
import type { Character, CharacterCompanion } from "../../../../../types";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import {
  createSubclassContributionSource,
  type FeatureContributionSpec
} from "../../../featureContributions";
import {
  getSpellConcentrationDuration,
  getSpellNonConcentrationDuration,
  pruneLinkedStatusEntries
} from "../../../statusEntries";
import {
  createFeatureActionCardCost,
  createNamedResourceCardUsage,
  createNamedUsageHeaderTags
} from "../../cardUsage";
import {
  getFeatureDescriptionForCharacter,
  getFeatureDescriptionMetadataForCharacter
} from "../../featureDescriptions";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import { getSorceryPointsRemaining, getSorceryPointsTotal, spendSorceryPoints } from "../sorcerer";

export const shadowBeastsActionKey = "sorcerer-beasts-of-ill-omen";
export const shadowBeastsWithoutConcentrationOptionId = "beasts-of-ill-omen-without-concentration";
export const shadowBeastsSpellId = "spell-summon-beast";
const shadowBeastsName = "Beasts of Ill Omen";
const shadowBeastsSorceryPointCost = 3;

export function hasShadowBeasts(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.BEASTS_OF_ILL_OMEN) !== null
  );
}

export function canCastShadowBeasts(character: SubclassRuntimeCharacter): boolean {
  return (
    hasShadowBeasts(character) &&
    getSorceryPointsRemaining({ ...character, level: character.level ?? 1 }) >=
      shadowBeastsSorceryPointCost
  );
}

export function spendShadowBeastsSorceryPoints(character: Character): Character {
  return canCastShadowBeasts(character)
    ? spendSorceryPoints(character, shadowBeastsSorceryPointCost)
    : character;
}

export function getShadowBeastsSpellEntry(character: Character, spell: SpellEntry): SpellEntry {
  return appendFeatureSourcedDescriptionAddition(
    {
      ...spell,
      castingTime: [ACTION_TYPE.BONUS_ACTION],
      components: spell.components.filter((component) => component !== SPELL_COMPONENT.M),
      materialSpecified: undefined
    },
    character,
    CLASS_FEATURE.BEASTS_OF_ILL_OMEN,
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.BEASTS_OF_ILL_OMEN)
  );
}

export function getShadowBeastsCastSpell(
  spell: SpellEntry,
  withoutConcentration: boolean
): SpellEntry {
  return withoutConcentration ? { ...spell, duration: ["1 minute"] } : spell;
}

export function endPreviousShadowBeastsCast(character: Character): Character {
  return {
    ...character,
    statusEntries: pruneLinkedStatusEntries(
      (character.statusEntries ?? []).filter((entry) => entry.sourceSpellId !== shadowBeastsSpellId)
    ),
    companions: character.companions.filter((companion) => companion.source !== shadowBeastsName)
  };
}

export function prepareShadowBeastsSummons(
  spell: SpellEntry,
  companions: CharacterCompanion[]
): CharacterCompanion[] {
  const duration =
    getSpellConcentrationDuration(spell.duration) ??
    getSpellNonConcentrationDuration(spell.duration);
  return companions.map((companion) => ({
    ...companion,
    source: shadowBeastsName,
    ...(duration ? { duration } : {})
  }));
}

export function collectShadowBeastsContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasShadowBeasts(character)) return [];
  const description = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.BEASTS_OF_ILL_OMEN
  );
  const cost = createFeatureActionCardCost({
    amountText: String(shadowBeastsSorceryPointCost),
    icon: "sparkles"
  });
  const available = canCastShadowBeasts(character);
  const resourceCharacter = { ...character, level: character.level ?? 1 };
  return [
    {
      source: createSubclassContributionSource({
        id: shadowBeastsActionKey,
        label: shadowBeastsName,
        entryId: CLASS_FEATURE.BEASTS_OF_ILL_OMEN
      }),
      actions: [
        {
          key: shadowBeastsActionKey,
          name: shadowBeastsName,
          sourceFeature: CLASS_FEATURE.BEASTS_OF_ILL_OMEN,
          cardTheme: ACTION_CARD_THEME.MAGIC,
          summary: "Cast Summon Beast using Sorcery Points.",
          detail:
            "Spend 3 Sorcery Points to cast Summon Beast without a spell slot or Material components.",
          breakdown: "Cast Summon Beast",
          economyType: ECONOMY_TYPE.BONUS_ACTION,
          actionCategory: ACTION_CATEGORY.MAGIC,
          cardUsage: createNamedResourceCardUsage(cost),
          headerTags: createNamedUsageHeaderTags(
            cost,
            getSorceryPointsRemaining(resourceCharacter),
            getSorceryPointsTotal(resourceCharacter),
            { icon: "sparkles" }
          ),
          description,
          drawer: { kind: "confirm", description, confirmLabel: "Open Summon Beast" },
          execute: {
            kind: "spell",
            spellSource: "fixed",
            effectKind: "beasts-of-ill-omen",
            spellId: shadowBeastsSpellId,
            spellLevel: 2,
            label: "Open Summon Beast",
            actionContextText: "Using Beasts of Ill Omen",
            actionAvailabilityText:
              "Spend 3 Sorcery Points instead of a spell slot. No Material components required.",
            actionConsumesSpellSlot: false,
            spellcastingAbilityOverride: "CHA"
          },
          disabled: !available,
          disabledReason: available ? undefined : "Requires 3 Sorcery Points."
        }
      ]
    }
  ];
}
