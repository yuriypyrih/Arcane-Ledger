import {
  ELDRITCH_INVOCATION,
  getEldritchInvocationEntryById,
  getSpellEntryById,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import type { Character, CharacterWarlockFeatureState } from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import {
  appendSourcedDescriptionAddition,
  createSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import {
  compileFeatureContributions,
  getFeatureDescriptionAdditions,
  getFeatureSpellDamageBonuses,
  type FeatureContributionSpec
} from "../../../featureContributions";
import {
  findFamiliarSpellId,
  giftOfTheDepthsActionKey,
  getWarlockInvocationSpellActions,
  pactOfTheChainActionKey
} from "../warlockInvocationSpellActions";
import { getWarlockGazeOfTwoMindsAction } from "./actions";
import { getWarlockPactTomeSpellIdsFromChoiceValues } from "./pactTome";
import { parseWarlockInvocationSelectionId } from "./selectionIds";
import { getWarlockInvocationDerivedStatusEntries } from "./statuses";
import { getWarlockUsesRemaining } from "./uses";

export type WarlockInvocationContributionCharacter = Pick<Character, "className" | "level"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "cantripIds"
      | "classFeatureState"
      | "inventoryItems"
      | "spellSlotsExpended"
      | "statusEntries"
    >
  >;

const giftOfTheDepthsUsesTotal = 1;
const eldritchSpearRangeDescription =
  "When you cast that spell, its range increases by a number of feet equal to 30 times your Warlock level.";
const repellingBlastPushDescription =
  "When you hit a Large or smaller creature with that cantrip, you can push the creature up to 10 feet straight away from you.";
const pactOfTheChainSpecialFormsDescription =
  "When you cast the spell, you choose one of the normal forms for your familiar or one of the following special forms: Imp, Pseudodragon, Quasit, Skeleton, Slaad Tadpole, Sphinx of Wonder, Sprite, or Venomous Snake.";
const pactOfTheChainFamiliarAttackDescription =
  "Additionally, when you take the Attack action, you can forgo one of your own attacks to allow your familiar to make one attack of its own with its Reaction.";

function clampWarlockLevel(level: number): number {
  return Math.max(1, Math.min(20, Math.floor(level)));
}

function getWarlockFeatureState(
  character: WarlockInvocationContributionCharacter
): CharacterWarlockFeatureState {
  return character.classFeatureState?.warlock ?? {};
}

export function getWarlockInvocationSelectionIdsFromCharacter(
  character: WarlockInvocationContributionCharacter
): string[] {
  return getWarlockFeatureState(character).eldritchInvocationIds ?? [];
}

export function getWarlockSelectedInvocationIdsFromCharacter(
  character: WarlockInvocationContributionCharacter
): Set<ELDRITCH_INVOCATION> {
  return new Set(
    getWarlockInvocationSelectionIdsFromCharacter(character)
      .map((selectionId) => parseWarlockInvocationSelectionId(selectionId).invocationId)
      .filter((invocationId): invocationId is ELDRITCH_INVOCATION => invocationId !== null)
  );
}

export function getWarlockInvocationChoiceValuesForCharacter(
  character: WarlockInvocationContributionCharacter,
  invocationId: ELDRITCH_INVOCATION
): string[] {
  return getWarlockInvocationSelectionIdsFromCharacter(character)
    .map(parseWarlockInvocationSelectionId)
    .filter(
      (
        selection
      ): selection is {
        invocationId: ELDRITCH_INVOCATION;
        choiceValue: string;
      } =>
        selection.invocationId === invocationId &&
        typeof selection.choiceValue === "string" &&
        selection.choiceValue.length > 0
    )
    .map((selection) => selection.choiceValue);
}

export function getWarlockPactTomeSpellIdsFromCharacter(
  character: WarlockInvocationContributionCharacter
): string[] {
  return getWarlockPactTomeSpellIdsFromChoiceValues(
    getWarlockInvocationChoiceValuesForCharacter(
      character,
      ELDRITCH_INVOCATION.PACT_OF_THE_TOME
    )
  );
}

function getWarlockGiftOfTheDepthsUsesRemaining(
  character: WarlockInvocationContributionCharacter,
  selectedInvocationIds: ReadonlySet<ELDRITCH_INVOCATION>
): number {
  if (!selectedInvocationIds.has(ELDRITCH_INVOCATION.GIFT_OF_THE_DEPTHS)) {
    return 0;
  }

  return getWarlockUsesRemaining(
    getWarlockFeatureState(character),
    "giftOfTheDepthsUsesExpended",
    giftOfTheDepthsUsesTotal
  );
}

function getWarlockEldritchSpearDescription(
  character: Pick<Character, "level">
): SpellDescriptionEntry[] {
  const invocation = getEldritchInvocationEntryById(ELDRITCH_INVOCATION.ELDRITCH_SPEAR);
  const descriptionEntry = invocation?.description.find(
    (entry): entry is string =>
      typeof entry === "string" && entry.includes(eldritchSpearRangeDescription)
  );
  const rangeDescription = descriptionEntry
    ? descriptionEntry.slice(
        descriptionEntry.indexOf(eldritchSpearRangeDescription),
        descriptionEntry.indexOf(eldritchSpearRangeDescription) +
          eldritchSpearRangeDescription.length
      )
    : eldritchSpearRangeDescription;
  const rangeIncreaseFeet = clampWarlockLevel(character.level) * 30;

  return [`${rangeDescription} <strong>(${rangeIncreaseFeet} ft)</strong>`];
}

function getWarlockRepellingBlastDescription(): SpellDescriptionEntry[] {
  const invocation = getEldritchInvocationEntryById(ELDRITCH_INVOCATION.REPELLING_BLAST);
  const descriptionEntry = invocation?.description.find(
    (entry): entry is string =>
      typeof entry === "string" && entry.includes(repellingBlastPushDescription)
  );
  const pushDescription = descriptionEntry
    ? descriptionEntry.slice(
        descriptionEntry.indexOf(repellingBlastPushDescription),
        descriptionEntry.indexOf(repellingBlastPushDescription) +
          repellingBlastPushDescription.length
      )
    : repellingBlastPushDescription;

  return [pushDescription];
}

function getWarlockPactOfTheChainFindFamiliarDescription(): SpellDescriptionEntry[] {
  const invocation = getEldritchInvocationEntryById(ELDRITCH_INVOCATION.PACT_OF_THE_CHAIN);
  const descriptionEntries = invocation?.description ?? [];
  const specialFormsDescription =
    descriptionEntries.find(
      (entry): entry is string =>
        typeof entry === "string" && entry.includes(pactOfTheChainSpecialFormsDescription)
    ) ?? pactOfTheChainSpecialFormsDescription;
  const familiarAttackDescription =
    descriptionEntries.find(
      (entry): entry is string =>
        typeof entry === "string" && entry.includes(pactOfTheChainFamiliarAttackDescription)
    ) ?? pactOfTheChainFamiliarAttackDescription;

  return [specialFormsDescription, familiarAttackDescription];
}

function getWarlockInvestmentOfTheChainMasterDescription(): SpellDescriptionEntry[] {
  const invocation = getEldritchInvocationEntryById(
    ELDRITCH_INVOCATION.INVESTMENT_OF_THE_CHAIN_MASTER
  );

  return (
    invocation?.description ?? [
      "When you cast Find Familiar, you infuse the summoned familiar with a measure of your eldritch power."
    ]
  );
}

function getWarlockInvestmentOfTheChainMasterDescriptionAdditions(
  selectedInvocationIds: ReadonlySet<ELDRITCH_INVOCATION>
): SpellDescriptionEntry[][] {
  if (!selectedInvocationIds.has(ELDRITCH_INVOCATION.INVESTMENT_OF_THE_CHAIN_MASTER)) {
    return [];
  }

  const invocation = getEldritchInvocationEntryById(
    ELDRITCH_INVOCATION.INVESTMENT_OF_THE_CHAIN_MASTER
  );
  const descriptionEntries = createSourcedDescriptionEntries(
    invocation?.name ?? "Investment of the Chain Master",
    getWarlockInvestmentOfTheChainMasterDescription()
  );

  return descriptionEntries.length > 0 ? [descriptionEntries] : [];
}

function createWarlockInvocationContributionSource(
  invocationId: ELDRITCH_INVOCATION,
  fallbackLabel: string
) {
  const invocation = getEldritchInvocationEntryById(invocationId);

  return {
    type: "invocation" as const,
    id: `warlock-invocation-${invocationId}`,
    entryId: invocationId,
    label: invocation?.name ?? fallbackLabel
  };
}

function createSpellGrant(spell: SpellEntry, sourceLabel: string) {
  return {
    kind:
      spell.spellLevel === 0
        ? ("always-prepared-cantrip" as const)
        : ("always-prepared-spell" as const),
    spell,
    sourceLabel
  };
}

export function collectWarlockInvocationContributions(
  character: WarlockInvocationContributionCharacter
): FeatureContributionSpec[] {
  if (character.className !== "Warlock") {
    return [];
  }

  const selectedInvocationIds = getWarlockSelectedInvocationIdsFromCharacter(character);
  const contributions: FeatureContributionSpec[] = [];

  if (selectedInvocationIds.has(ELDRITCH_INVOCATION.GIFT_OF_THE_DEPTHS)) {
    contributions.push({
      source: createWarlockInvocationContributionSource(
        ELDRITCH_INVOCATION.GIFT_OF_THE_DEPTHS,
        "Gift of the Depths"
      ),
      resources: [
        {
          id: "warlock-invocation-gift-of-the-depths",
          label: "Gift of the Depths",
          remaining: getWarlockGiftOfTheDepthsUsesRemaining(character, selectedInvocationIds),
          total: giftOfTheDepthsUsesTotal,
          recovery: "longRest"
        }
      ],
      speedBonuses: [
        {
          label: "Gift of the Depths",
          movementType: "swim",
          value: 0,
          setBaseFromWalkMultiplier: 1
        }
      ]
    });
  }

  contributions.push({
    source: {
      type: "invocation",
      id: "warlock-invocations-runtime",
      label: "Eldritch Invocations"
    },
    actions: [
      ...getWarlockInvocationSpellActions(
        selectedInvocationIds,
        {
          [giftOfTheDepthsActionKey]: {
            usesRemaining: getWarlockGiftOfTheDepthsUsesRemaining(
              character,
              selectedInvocationIds
            ),
            usesTotal: giftOfTheDepthsUsesTotal,
            disabledReason: "Gift of the Depths recharges on a Long Rest."
          }
        },
        {
          [pactOfTheChainActionKey]:
            getWarlockInvestmentOfTheChainMasterDescriptionAdditions(selectedInvocationIds)
        }
      ),
      ...(selectedInvocationIds.has(ELDRITCH_INVOCATION.GAZE_OF_TWO_MINDS)
        ? [getWarlockGazeOfTwoMindsAction(character)]
        : [])
    ],
    statuses: getWarlockInvocationDerivedStatusEntries(selectedInvocationIds),
    descriptionAdditions: [
      ...(selectedInvocationIds.has(ELDRITCH_INVOCATION.ELDRITCH_MIND)
        ? [
            {
              id: "warlock-invocation-eldritch-mind-con-save",
              target: "stat" as const,
              targetKey: "savingThrow:CON",
              sourceLabel:
                getEldritchInvocationEntryById(ELDRITCH_INVOCATION.ELDRITCH_MIND)?.name ??
                "Eldritch Mind",
              descriptionEntries:
                getEldritchInvocationEntryById(ELDRITCH_INVOCATION.ELDRITCH_MIND)?.description ??
                [
                  "You have Advantage on Constitution saving throws that you make to maintain Concentration."
                ]
            }
          ]
        : [])
    ],
    spellTransforms: [
      {
        id: "warlock-invocation-spell-descriptions",
        transform: (spell) => {
          const eldritchSpearCantripIds = new Set(
            getWarlockInvocationChoiceValuesForCharacter(
              character,
              ELDRITCH_INVOCATION.ELDRITCH_SPEAR
            )
          );
          const repellingBlastCantripIds = new Set(
            getWarlockInvocationChoiceValuesForCharacter(
              character,
              ELDRITCH_INVOCATION.REPELLING_BLAST
            )
          );
          let nextSpell = spell;

          if (spell.spellLevel === 0 && eldritchSpearCantripIds.has(nextSpell.id)) {
            const invocation = getEldritchInvocationEntryById(
              ELDRITCH_INVOCATION.ELDRITCH_SPEAR
            );

            nextSpell = appendSourcedDescriptionAddition(
              nextSpell,
              invocation?.name ?? "Eldritch Spear",
              getWarlockEldritchSpearDescription(character)
            );
          }

          if (spell.spellLevel === 0 && repellingBlastCantripIds.has(nextSpell.id)) {
            const invocation = getEldritchInvocationEntryById(
              ELDRITCH_INVOCATION.REPELLING_BLAST
            );

            nextSpell = appendSourcedDescriptionAddition(
              nextSpell,
              invocation?.name ?? "Repelling Blast",
              getWarlockRepellingBlastDescription()
            );
          }

          if (nextSpell.id === findFamiliarSpellId) {
            if (selectedInvocationIds.has(ELDRITCH_INVOCATION.PACT_OF_THE_CHAIN)) {
              const invocation = getEldritchInvocationEntryById(
                ELDRITCH_INVOCATION.PACT_OF_THE_CHAIN
              );

              nextSpell = appendSourcedDescriptionAddition(
                nextSpell,
                invocation?.name ?? "Pact of the Chain",
                getWarlockPactOfTheChainFindFamiliarDescription()
              );
            }

            if (selectedInvocationIds.has(ELDRITCH_INVOCATION.INVESTMENT_OF_THE_CHAIN_MASTER)) {
              const invocation = getEldritchInvocationEntryById(
                ELDRITCH_INVOCATION.INVESTMENT_OF_THE_CHAIN_MASTER
              );

              nextSpell = appendSourcedDescriptionAddition(
                nextSpell,
                invocation?.name ?? "Investment of the Chain Master",
                getWarlockInvestmentOfTheChainMasterDescription()
              );
            }
          }

          return nextSpell;
        }
      }
    ],
    spellDamageBonuses: [
      {
        id: "warlock-invocation-agonizing-blast",
        getBonuses: ({ character: bonusCharacter, spell }) => {
          const agonizingBlastCantripIds = new Set(
            getWarlockInvocationChoiceValuesForCharacter(
              character,
              ELDRITCH_INVOCATION.AGONIZING_BLAST
            )
          );

          if (
            spell.spellLevel !== 0 ||
            spell.damage.length === 0 ||
            !agonizingBlastCantripIds.has(spell.id)
          ) {
            return [];
          }

          const charismaModifier = getAbilityModifierForCharacter(bonusCharacter, "CHA");

          return charismaModifier === 0
            ? []
            : [
                {
                  label: "Agonizing Blast",
                  value: charismaModifier,
                  abilityModifierSource: "CHA" as const
                }
              ];
        }
      }
    ],
    spellGrants: [
      ...(selectedInvocationIds.has(ELDRITCH_INVOCATION.PACT_OF_THE_CHAIN)
        ? [getSpellEntryById(findFamiliarSpellId)]
        : []),
      ...getWarlockPactTomeSpellIdsFromCharacter(character).map(getSpellEntryById)
    ]
      .filter((spell): spell is SpellEntry => spell !== null)
      .map((spell) => createSpellGrant(spell, "Eldritch Invocations"))
  });

  return contributions;
}

export function collectWarlockInvocationContributionState(
  character: WarlockInvocationContributionCharacter
) {
  return compileFeatureContributions(collectWarlockInvocationContributions(character));
}

export function getWarlockInvocationStatDescriptionAdditions(
  character: WarlockInvocationContributionCharacter,
  targetKey: string
): SpellDescriptionEntry[][] {
  return getFeatureDescriptionAdditions(
    collectWarlockInvocationContributionState(character),
    "stat",
    {
      character: character as Character,
      targetKey
    }
  );
}

export function getWarlockInvocationSpellDamageBonuses(
  character: WarlockInvocationContributionCharacter,
  spell: Parameters<typeof getFeatureSpellDamageBonuses>[1]["spell"]
) {
  return getFeatureSpellDamageBonuses(collectWarlockInvocationContributionState(character), {
    character: character as Character,
    spell
  });
}
