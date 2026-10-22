import type { Character, CharacterRogueFeatureState } from "../../../../../types";
import { ACTION_TYPE, CLASS_FEATURE, REACTION } from "../../../../../codex/entries/enums";
import type { SpellEntry } from "../../../../../codex/entries";
import { getClassLevel, getClassSubclassId, isSpellFromClass } from "../../../multiclassState";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import {
  createSubclassContributionSource,
  type FeatureContributionSpec,
  type FeatureSpellCastEffectContribution
} from "../../../featureContributions";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import { rogueSneakAttackActionKey } from "../actionKeys";

export const phantomSoulTrinketReactionId = "reaction-phantom-gaining-soul-trinkets";
export const phantomSpiritQueryEffectId = "rogue-phantom-spirit-query";
export const phantomAugurySpellId = "spell-augury";

export function hasPhantomTokens(character: SubclassRuntimeCharacter): boolean {
  return (
    getClassSubclassId(character, "Rogue") === "rogue-phantom" &&
    getClassLevel(character, "Rogue") >= 9
  );
}

export function getPhantomSoulTrinketsMaximum(character: SubclassRuntimeCharacter): number {
  if (!hasPhantomTokens(character)) return 0;
  const level = getClassLevel(character, "Rogue");
  return level >= 17 ? 4 : level >= 13 ? 3 : 2;
}

export function normalizePhantomSoulTrinkets(
  value: unknown,
  character: SubclassRuntimeCharacter
): number | undefined {
  if (!hasPhantomTokens(character)) return undefined;
  const count = value === undefined || value === null ? 2 : Number(value);
  return Math.max(
    0,
    Math.min(
      getPhantomSoulTrinketsMaximum(character),
      Number.isFinite(count) ? Math.floor(count) : 2
    )
  );
}

export function getPhantomSoulTrinketsRemaining(character: SubclassRuntimeCharacter): number {
  return (
    normalizePhantomSoulTrinkets(
      character.classFeatureState?.rogue?.phantomSoulTrinkets,
      character
    ) ?? 0
  );
}

function setSoulTrinkets(character: Character, count: number): Character {
  const normalized = normalizePhantomSoulTrinkets(count, character);
  if (normalized === undefined || normalized === getPhantomSoulTrinketsRemaining(character))
    return character;
  return replaceClassFeatureState(character, "rogue", {
    ...character.classFeatureState?.rogue,
    phantomSoulTrinkets: normalized
  });
}

export function gainPhantomSoulTrinket(character: Character): Character {
  return setSoulTrinkets(character, getPhantomSoulTrinketsRemaining(character) + 1);
}

export function spendPhantomSoulTrinket(character: Character): Character {
  return setSoulTrinkets(character, getPhantomSoulTrinketsRemaining(character) - 1);
}

export function restoreAllPhantomSoulTrinkets(character: Character): Character {
  return setSoulTrinkets(character, getPhantomSoulTrinketsMaximum(character));
}

export function restorePhantomSoulTrinketsOnLongRest(character: Character): Character {
  return setSoulTrinkets(character, Math.max(2, getPhantomSoulTrinketsRemaining(character)));
}

export function getPhantomTokensState(
  record: Partial<CharacterRogueFeatureState>,
  character: SubclassRuntimeCharacter
) {
  return {
    phantomSoulTrinkets: normalizePhantomSoulTrinkets(record.phantomSoulTrinkets, character)
  };
}

export function getPhantomLifeEssenceDescription(character: SubclassRuntimeCharacter) {
  return getPhantomSoulTrinketsRemaining(character) > 0
    ? createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.TOKENS_OF_THE_DEPARTED,
        getFeatureDescriptionForCharacter(character, CLASS_FEATURE.TOKENS_OF_THE_DEPARTED).slice(
          2,
          3
        )
      )
    : [];
}

export function isPhantomSpiritQuerySpell(
  character: SubclassRuntimeCharacter,
  spell: Pick<SpellEntry, "id">
): boolean {
  return (
    hasPhantomTokens(character) &&
    isSpellFromClass(character, "Rogue") &&
    spell.id === phantomAugurySpellId
  );
}

export function canUsePhantomSpiritQuery(
  character: SubclassRuntimeCharacter,
  spell: Pick<SpellEntry, "id">
): boolean {
  return (
    isPhantomSpiritQuerySpell(character, spell) && getPhantomSoulTrinketsRemaining(character) > 0
  );
}

export function getPhantomSpiritQuerySpellcastingAbility(
  character: SubclassRuntimeCharacter,
  spellId: string
) {
  return isPhantomSpiritQuerySpell(character, { id: spellId }) ? ("CON" as const) : null;
}

export function getPhantomSpiritQueryCastEffects(
  character: Character
): FeatureSpellCastEffectContribution[] {
  return hasPhantomTokens(character)
    ? [
        {
          id: phantomSpiritQueryEffectId,
          apply: (current, context) =>
            canUsePhantomSpiritQuery(current, context.spell)
              ? spendPhantomSoulTrinket(current)
              : current
        }
      ]
    : [];
}

export function collectPhantomTokensContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasPhantomTokens(character)) return [];
  const description = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.TOKENS_OF_THE_DEPARTED
  );
  return [
    {
      source: createSubclassContributionSource({
        id: "rogue-phantom-tokens",
        label: "Tokens of the Departed",
        entryId: CLASS_FEATURE.TOKENS_OF_THE_DEPARTED
      }),
      savingThrowIndicators:
        getPhantomSoulTrinketsRemaining(character) > 0
          ? {
              CON: [
                {
                  label: "Advantage",
                  tone: "advantage",
                  source: "Tokens of the Departed: Life Essence"
                }
              ]
            }
          : {},
      alwaysPreparedSpellIds: [phantomAugurySpellId],
      alwaysPreparedSpellSources: { [phantomAugurySpellId]: ["Tokens of the Departed"] },
      spellTransforms: [
        {
          id: "rogue-phantom-spirit-query",
          transform: (spell) =>
            isPhantomSpiritQuerySpell(character, spell)
              ? appendFeatureSourcedDescriptionAddition(
                  {
                    ...spell,
                    castingTime: [ACTION_TYPE.ACTION],
                    components: [],
                    materialSpecified: undefined,
                    ritual: false
                  },
                  character,
                  CLASS_FEATURE.TOKENS_OF_THE_DEPARTED,
                  description.slice(3, 4)
                )
              : spell
        }
      ],
      featureActionTransforms: [
        {
          id: "rogue-phantom-deaths-knell",
          transform: (action) =>
            action.key === rogueSneakAttackActionKey
              ? appendFeatureSourcedDescriptionAddition(
                  action,
                  character,
                  CLASS_FEATURE.TOKENS_OF_THE_DEPARTED,
                  description.slice(1, 2)
                )
              : action
        }
      ],
      reactions: [
        {
          id: phantomSoulTrinketReactionId,
          reaction: REACTION.GAINING_SOUL_TRINKETS,
          name: "Gaining Additional Soul Trinkets",
          sourceType: "feature",
          sourceFeature: CLASS_FEATURE.TOKENS_OF_THE_DEPARTED,
          sourceLabel: "Tokens of the Departed",
          description: description
            .slice(4, 5)
            .filter((entry): entry is string => typeof entry === "string")
        }
      ]
    }
  ];
}
