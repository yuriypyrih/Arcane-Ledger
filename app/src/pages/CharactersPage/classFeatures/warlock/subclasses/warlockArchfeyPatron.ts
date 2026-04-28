import { getSubclassEntryById } from "../../../../../codex/subclasses";
import {
  ACTION_TYPE,
  CLASS_FEATURE,
  MAGIC_SCHOOL,
  REACTION,
  type ReactionEntry,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import type { Character, CharacterWarlockFeatureState } from "../../../../../types";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import { warlockFeatures } from "../../../../../codex/classes";
import type { DerivedFeatureStatusEntry } from "../../types";

export const archfeyPatronSubclassId = "warlock-archfey-patron";
export const mistyEscapeReactionId = "reaction-warlock-archfey-misty-escape";
export const beguilingDefenseReactionId = "reaction-warlock-archfey-beguiling-defense";

const mistyStepSpellId = "spell-misty-step";
const stepsOfTheFeyName = "Steps of the Fey";
const mistyEscapeName = "Misty Escape";
const beguilingDefensesName = "Beguiling Defenses";
const beguilingDefenseName = "Beguiling Defense";
const bewitchingMagicName = "Bewitching Magic";
const mistyEscapeReactionDescription =
  "You can cast Misty Step as a Reaction in response to taking damage.";
const beguilingDefensesCharmedImmunitySourceId =
  "feature-warlock-archfey-beguiling-defenses-charmed";
const archfeyPatronSpellIdsByLevel = {
  3: resolveSpellIdsByName([
    "Calm Emotions",
    "Faerie Fire",
    "Misty Step",
    "Phantasmal Force",
    "Sleep"
  ]),
  5: resolveSpellIdsByName(["Blink", "Plant Growth"]),
  7: resolveSpellIdsByName(["Dominate Beast", "Greater Invisibility"]),
  9: resolveSpellIdsByName(["Dominate Person", "Seeming"])
} as const;
const archfeyPatronSubclassEntry = getSubclassEntryById(archfeyPatronSubclassId);
const archfeyPatronSourceLabel = archfeyPatronSubclassEntry?.name ?? "Archfey Patron";

function getArchfeyPatronFeatureDescriptionEntries(
  feature: CLASS_FEATURE
): SpellDescriptionEntry[] {
  const featureRow = archfeyPatronSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return featureRow?.featureOverrides?.[feature]?.description ?? [];
}

const stepsOfTheFeyDescription = getArchfeyPatronFeatureDescriptionEntries(
  CLASS_FEATURE.STEPS_OF_THE_FEY
);
const mistyEscapeDescription = getArchfeyPatronFeatureDescriptionEntries(
  CLASS_FEATURE.MISTY_ESCAPE
);
const beguilingDefensesDescription = getArchfeyPatronFeatureDescriptionEntries(
  CLASS_FEATURE.BEGUILING_DEFENSES
);
const bewitchingMagicDescription = getArchfeyPatronFeatureDescriptionEntries(
  CLASS_FEATURE.BEWITCHING_MAGIC
);

function getWarlockArchfeyPatronPactMagicSlotLevel(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): number {
  if (character.className !== "Warlock") {
    return 0;
  }

  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(character.level ?? 1)));
  const matchingRows = warlockFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);
  const featureRow = matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;

  return featureRow?.slotLevel ?? 0;
}

function getWarlockArchfeyPatronPactMagicSlotsRemaining(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "spellSlotsExpended">>
): number {
  const pactMagicSlotLevel = getWarlockArchfeyPatronPactMagicSlotLevel(character);

  if (pactMagicSlotLevel <= 0) {
    return 0;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level ?? 1);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const pactMagicSlotTotal = spellSlotTotals[pactMagicSlotLevel - 1] ?? 0;
  const pactMagicSlotsExpended = spellSlotsExpended[pactMagicSlotLevel - 1] ?? 0;

  return Math.max(0, pactMagicSlotTotal - pactMagicSlotsExpended);
}

function appendArchfeyPatronDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: SpellEntry,
  feature: CLASS_FEATURE,
  fallbackSourceName: string,
  descriptionEntries: readonly SpellDescriptionEntry[]
): SpellEntry {
  if (spell.id !== mistyStepSpellId || descriptionEntries.length === 0) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    feature,
    descriptionEntries,
    fallbackSourceName
  );
}

function appendStepsOfTheFeyDescription(
  spell: SpellEntry,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellEntry {
  return appendArchfeyPatronDescription(
    character,
    spell,
    CLASS_FEATURE.STEPS_OF_THE_FEY,
    stepsOfTheFeyName,
    stepsOfTheFeyDescription
  );
}

function appendMistyEscapeDescription(
  spell: SpellEntry,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellEntry {
  return appendArchfeyPatronDescription(
    character,
    spell,
    CLASS_FEATURE.MISTY_ESCAPE,
    mistyEscapeName,
    mistyEscapeDescription
  );
}

function appendBewitchingMagicDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: SpellEntry
): SpellEntry {
  if (
    bewitchingMagicDescription.length === 0 ||
    (spell.id !== mistyStepSpellId &&
      (spell.castingTime.length !== 1 ||
        spell.castingTime[0] !== ACTION_TYPE.ACTION ||
        (spell.magicSchool !== MAGIC_SCHOOL.ENCHANTMENT &&
          spell.magicSchool !== MAGIC_SCHOOL.ILLUSION)))
  ) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.BEWITCHING_MAGIC,
    bewitchingMagicDescription,
    bewitchingMagicName
  );
}

export function hasWarlockArchfeyPatronStepsOfTheFeyFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === archfeyPatronSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasWarlockArchfeyPatronMistyEscapeFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === archfeyPatronSubclassId &&
    (character.level ?? 0) >= 6
  );
}

export function hasWarlockArchfeyPatronBeguilingDefensesFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === archfeyPatronSubclassId &&
    (character.level ?? 0) >= 10
  );
}

export function hasWarlockArchfeyPatronBewitchingMagicFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === archfeyPatronSubclassId &&
    (character.level ?? 0) >= 14
  );
}

export function getWarlockArchfeyPatronStepsOfTheFeyUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  if (!hasWarlockArchfeyPatronStepsOfTheFeyFeature(character)) {
    return 0;
  }

  return Math.max(1, getAbilityModifierForCharacter(character, "CHA"));
}

export function getWarlockArchfeyPatronStepsOfTheFeyUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  const totalUses = getWarlockArchfeyPatronStepsOfTheFeyUsesTotal(character);
  const usesExpended = character.classFeatureState?.warlock?.stepsOfTheFeyUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getWarlockArchfeyPatronBeguilingDefenseUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasWarlockArchfeyPatronBeguilingDefensesFeature(character) ? 1 : 0;
}

export function getWarlockArchfeyPatronBeguilingDefenseUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  const totalUses = getWarlockArchfeyPatronBeguilingDefenseUsesTotal(character);
  const usesExpended = character.classFeatureState?.warlock?.beguilingDefenseUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function normalizeWarlockArchfeyPatronFeatureState(
  value: Partial<CharacterWarlockFeatureState>,
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): Pick<
  CharacterWarlockFeatureState,
  "beguilingDefenseUsesExpended" | "stepsOfTheFeyUsesExpended"
> {
  const stepsOfTheFeyUsesTotal = getWarlockArchfeyPatronStepsOfTheFeyUsesTotal(character);
  const beguilingDefenseUsesTotal = getWarlockArchfeyPatronBeguilingDefenseUsesTotal(character);
  const rawStepsOfTheFeyUsesExpended = Number(value.stepsOfTheFeyUsesExpended);
  const rawBeguilingDefenseUsesExpended = Number(value.beguilingDefenseUsesExpended);

  return {
    stepsOfTheFeyUsesExpended:
      stepsOfTheFeyUsesTotal > 0 && Number.isFinite(rawStepsOfTheFeyUsesExpended)
        ? Math.max(0, Math.min(stepsOfTheFeyUsesTotal, Math.floor(rawStepsOfTheFeyUsesExpended)))
        : stepsOfTheFeyUsesTotal > 0
          ? 0
          : undefined,
    beguilingDefenseUsesExpended:
      beguilingDefenseUsesTotal > 0 && Number.isFinite(rawBeguilingDefenseUsesExpended)
        ? Math.max(
            0,
            Math.min(beguilingDefenseUsesTotal, Math.floor(rawBeguilingDefenseUsesExpended))
          )
        : beguilingDefenseUsesTotal > 0
          ? 0
          : undefined
  };
}

export function consumeWarlockArchfeyPatronStepsOfTheFeyUse(character: Character): Character {
  if (!hasWarlockArchfeyPatronStepsOfTheFeyFeature(character)) {
    return character;
  }

  const totalUses = getWarlockArchfeyPatronStepsOfTheFeyUsesTotal(character);
  const warlockState = character.classFeatureState?.warlock ?? {};
  const usesExpended = warlockState.stepsOfTheFeyUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        stepsOfTheFeyUsesExpended: usesExpended + 1
      }
    }
  };
}

export function restoreWarlockArchfeyPatronStepsOfTheFeyOnLongRest(
  character: Character
): Character {
  if (!hasWarlockArchfeyPatronStepsOfTheFeyFeature(character)) {
    return character;
  }

  const warlockState = character.classFeatureState?.warlock ?? {};

  if ((warlockState.stepsOfTheFeyUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        stepsOfTheFeyUsesExpended: 0
      }
    }
  };
}

export function restoreWarlockArchfeyPatronBeguilingDefenseOnLongRest(
  character: Character
): Character {
  if (!hasWarlockArchfeyPatronBeguilingDefensesFeature(character)) {
    return character;
  }

  const warlockState = character.classFeatureState?.warlock ?? {};

  if ((warlockState.beguilingDefenseUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        beguilingDefenseUsesExpended: 0
      }
    }
  };
}

export function consumeWarlockArchfeyPatronBeguilingDefenseUse(character: Character): Character {
  if (!hasWarlockArchfeyPatronBeguilingDefensesFeature(character)) {
    return character;
  }

  const usesRemaining = getWarlockArchfeyPatronBeguilingDefenseUsesRemaining(character);

  if (usesRemaining > 0) {
    const warlockState = character.classFeatureState?.warlock ?? {};
    const totalUses = getWarlockArchfeyPatronBeguilingDefenseUsesTotal(character);
    const usesExpended = warlockState.beguilingDefenseUsesExpended ?? 0;

    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        warlock: {
          ...warlockState,
          beguilingDefenseUsesExpended: Math.min(totalUses, usesExpended + 1)
        }
      }
    };
  }

  const pactMagicSlotsRemaining = getWarlockArchfeyPatronPactMagicSlotsRemaining(character);
  const pactMagicSlotLevel = getWarlockArchfeyPatronPactMagicSlotLevel(character);

  if (pactMagicSlotsRemaining <= 0 || pactMagicSlotLevel <= 0) {
    return character;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[pactMagicSlotLevel - 1] =
    (nextSpellSlotsExpended[pactMagicSlotLevel - 1] ?? 0) + 1;

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function restoreWarlockArchfeyPatronFeaturesOnLongRest(character: Character): Character {
  return restoreWarlockArchfeyPatronBeguilingDefenseOnLongRest(
    restoreWarlockArchfeyPatronStepsOfTheFeyOnLongRest(character)
  );
}

const mistyEscapeReactionEntry: ReactionEntry = {
  id: mistyEscapeReactionId,
  reaction: REACTION.MISTY_ESCAPE,
  name: mistyEscapeName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.MISTY_ESCAPE,
  sourceLabel: archfeyPatronSourceLabel,
  description: [mistyEscapeReactionDescription]
};
const beguilingDefenseReactionEntry: ReactionEntry = {
  id: beguilingDefenseReactionId,
  reaction: REACTION.BEGUILING_DEFENSE,
  name: beguilingDefenseName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.BEGUILING_DEFENSES,
  sourceLabel: archfeyPatronSourceLabel,
  description: [...beguilingDefensesDescription]
};

function getWarlockArchfeyPatronDerivedStatusEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): DerivedFeatureStatusEntry[] {
  if (!hasWarlockArchfeyPatronBeguilingDefensesFeature(character)) {
    return [];
  }

  return [
    {
      id: beguilingDefensesCharmedImmunitySourceId,
      sourceId: beguilingDefensesCharmedImmunitySourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.CHARMED,
      source: beguilingDefensesName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

export function getWarlockArchfeyPatronMistyEscapeReactionSpell(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: SpellEntry
): SpellEntry {
  const transformedSpell = appendMistyEscapeDescription(
    appendStepsOfTheFeyDescription(spell, character),
    character
  );

  return transformedSpell.id === mistyStepSpellId
    ? {
        ...transformedSpell,
        castingTime: [ACTION_TYPE.REACTION]
      }
    : transformedSpell;
}

function getWarlockArchfeyPatronTransformedSpell(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: SpellEntry
): SpellEntry {
  const nextSpell = hasWarlockArchfeyPatronMistyEscapeFeature(character)
    ? appendMistyEscapeDescription(appendStepsOfTheFeyDescription(spell, character), character)
    : appendStepsOfTheFeyDescription(spell, character);

  return hasWarlockArchfeyPatronBewitchingMagicFeature(character)
    ? appendBewitchingMagicDescription(character, nextSpell)
    : nextSpell;
}

export type WarlockArchfeyPatronFeatureReactionSpellDefinition = {
  spellId: string;
  transformSpellEntry: (
    character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
    spell: SpellEntry
  ) => SpellEntry;
};

export function getWarlockArchfeyPatronFeatureReactionSpellDefinition(
  reactionEntryId: string
): WarlockArchfeyPatronFeatureReactionSpellDefinition | null {
  return reactionEntryId === mistyEscapeReactionId
    ? {
        spellId: mistyStepSpellId,
        transformSpellEntry: getWarlockArchfeyPatronMistyEscapeReactionSpell
      }
    : null;
}

export const getWarlockArchfeyPatronDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Warlock" &&
  character.subclassId === archfeyPatronSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          archfeyPatronSpellIdsByLevel
        ),
        reactionEntries: hasWarlockArchfeyPatronMistyEscapeFeature(character)
          ? [
              mistyEscapeReactionEntry,
              ...(hasWarlockArchfeyPatronBeguilingDefensesFeature(character)
                ? [beguilingDefenseReactionEntry]
                : [])
            ]
          : hasWarlockArchfeyPatronBeguilingDefensesFeature(character)
            ? [beguilingDefenseReactionEntry]
            : [],
        derivedStatusEntries: getWarlockArchfeyPatronDerivedStatusEntries(character),
        transformSpellEntry: (spell) => getWarlockArchfeyPatronTransformedSpell(character, spell)
      }
    : {};
