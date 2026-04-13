import {
  CLASS_FEATURE,
  MAGIC_SCHOOL,
  REACTION,
  SPELL_COMPONENT,
  type ReactionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import {
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterWizardFeatureState
} from "../../../../../types";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../traits";
import {
  resolveSpellIdsByName,
  type SubclassRuntimeCharacter,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import { getWizardSavantSpellIdsFromFeatureState } from "../savant";

export const illusionistSubclassId = "wizard-illusionist";
export const wizardIllusionistIllusorySelfReactionId =
  "reaction-wizard-illusionist-illusory-self";
export const wizardIllusionistIllusoryRealityActionKey =
  "wizard-illusionist-illusory-reality";
export const wizardIllusionistIllusoryRealityStatusSourceId =
  "feature-wizard-illusionist-illusory-reality";
const improvedIllusionsName = "Improved Illusions";
const phantasmalCreaturesName = "Phantasmal Creatures";
const illusorySelfName = "Illusory Self";
const illusoryRealityName = "Illusory Reality";
const phantasmalCreaturesUsesTotal = 1;
const illusorySelfUsesTotal = 1;
const illusorySelfFallbackMinimumSlotLevel = 2;
const illusoryRealityDurationRounds = 10;
const illusionistSubclassEntry = getSubclassEntryById(illusionistSubclassId);
const improvedIllusionsAlwaysPreparedSpellIds = resolveSpellIdsByName(["Minor Illusion"]);
const phantasmalCreaturesAlwaysPreparedSpellIds = resolveSpellIdsByName([
  "Summon Beast",
  "Summon Fey"
]);
const phantasmalCreaturesSpellIdSet = new Set(phantasmalCreaturesAlwaysPreparedSpellIds);

type WizardIllusionistCharacter = Pick<SubclassRuntimeCharacter, "className"> &
  Partial<
    Pick<
      SubclassRuntimeCharacter,
      "classFeatureState" | "level" | "spellSlotsExpended" | "statusEntries" | "subclassId"
    >
  >;

function getWizardIllusionistFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = illusionistSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const improvedIllusionsDescription = getWizardIllusionistFeatureDescriptionEntries(
  CLASS_FEATURE.IMPROVED_ILLUSIONS
).slice(0, 1);
const phantasmalCreaturesDescription = getWizardIllusionistFeatureDescriptionEntries(
  CLASS_FEATURE.PHANTASMAL_CREATURES
);
const illusorySelfDescription = getWizardIllusionistFeatureDescriptionEntries(
  CLASS_FEATURE.ILLUSORY_SELF
);
export const wizardIllusionistIllusoryRealityDescription =
  getWizardIllusionistFeatureDescriptionEntries(CLASS_FEATURE.ILLUSORY_REALITY);
const illusorySelfReactionEntry: ReactionEntry = {
  id: wizardIllusionistIllusorySelfReactionId,
  reaction: REACTION.ILLUSORY_SELF,
  name: illusorySelfName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.ILLUSORY_SELF,
  sourceLabel: "Illusionist",
  description: illusorySelfDescription
};

export type WizardIllusionistPhantasmalCreaturesSpellOptionState = {
  usesRemaining: number;
  usesTotal: number;
  disabled: boolean;
  disabledReason?: string;
};

function hasWizardIllusionistFeature(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "subclassId">>,
  minimumLevel: number
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === illusionistSubclassId &&
    (character.level ?? 0) >= minimumLevel
  );
}

function hasWizardIllusionistImprovedIllusionsFeature(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "subclassId">>
): boolean {
  return hasWizardIllusionistFeature(character, 3);
}

function hasWizardIllusionistPhantasmalCreaturesFeature(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "subclassId">>
): boolean {
  return hasWizardIllusionistFeature(character, 6);
}

function hasWizardIllusionistIllusorySelfFeature(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "subclassId">>
): boolean {
  return hasWizardIllusionistFeature(character, 10);
}

function hasWizardIllusionistIllusoryRealityFeature(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "subclassId">>
): boolean {
  return hasWizardIllusionistFeature(character, 14);
}

function getWizardIllusionistAlwaysPreparedSpellIds(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "subclassId">>
): string[] {
  return [
    ...(hasWizardIllusionistImprovedIllusionsFeature(character)
      ? improvedIllusionsAlwaysPreparedSpellIds
      : []),
    ...(hasWizardIllusionistPhantasmalCreaturesFeature(character)
      ? phantasmalCreaturesAlwaysPreparedSpellIds
      : [])
  ];
}

function getWizardIllusionistFeatureState(
  character: Partial<Pick<Character, "classFeatureState">>
): CharacterWizardFeatureState {
  return character.classFeatureState?.wizard ?? {};
}

function clearWizardIllusionistIllusoryRealityStatuses(value: unknown) {
  return normalizeCharacterStatusEntries(value).filter(
    (entry) => entry.sourceId !== wizardIllusionistIllusoryRealityStatusSourceId
  );
}

function normalizeWizardIllusionistUsesExpended(value: unknown, total: number): number {
  const rawValue = Number(value);

  return Number.isFinite(rawValue) ? Math.max(0, Math.min(total, Math.floor(rawValue))) : 0;
}

function getWizardIllusionistSpellSlotsRemaining(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "spellSlotsExpended" | "subclassId">>
): number[] {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level ?? 1,
    character.subclassId
  );
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );

  return spellSlotTotals.map((total, index) => Math.max(0, total - (spellSlotsExpended[index] ?? 0)));
}

function getImprovedIllusionsRange(range: string): string {
  const match = range.match(/^(\d{1,3}(?:,\d{3})*|\d+)\s*feet$/i);

  if (!match) {
    return range;
  }

  const parsedRange = Number(match[1].replace(/,/g, ""));

  if (!Number.isFinite(parsedRange) || parsedRange < 10) {
    return range;
  }

  return `${(parsedRange + 60).toLocaleString("en-US")} feet`;
}

function getImprovedIllusionsComponents(
  components: SpellEntry["components"]
): SpellEntry["components"] {
  return components.includes(SPELL_COMPONENT.V)
    ? components.filter((component) => component !== SPELL_COMPONENT.V)
    : components;
}

function appendImprovedIllusionsSpellDescription(spell: SpellEntry): SpellEntry {
  if (spell.magicSchool !== MAGIC_SCHOOL.ILLUSION) {
    return spell;
  }

  const nextSpell = appendSourcedDescriptionAddition(
    spell,
    improvedIllusionsName,
    improvedIllusionsDescription
  );
  const nextRange = getImprovedIllusionsRange(spell.range);
  const nextComponents = getImprovedIllusionsComponents(spell.components);

  if (nextRange === nextSpell.range && nextComponents === nextSpell.components) {
    return nextSpell;
  }

  return {
    ...nextSpell,
    range: nextRange,
    components: nextComponents
  };
}

function appendPhantasmalCreaturesSpellDescription(spell: SpellEntry): SpellEntry {
  return phantasmalCreaturesSpellIdSet.has(spell.id)
    ? appendSourcedDescriptionAddition(
        spell,
        phantasmalCreaturesName,
        phantasmalCreaturesDescription
      )
    : spell;
}

function transformWizardIllusionistSpell(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "subclassId">>,
  spell: SpellEntry
): SpellEntry {
  const spellWithImprovedIllusions = hasWizardIllusionistImprovedIllusionsFeature(character)
    ? appendImprovedIllusionsSpellDescription(spell)
    : spell;

  return hasWizardIllusionistPhantasmalCreaturesFeature(character)
    ? appendPhantasmalCreaturesSpellDescription(spellWithImprovedIllusions)
    : spellWithImprovedIllusions;
}

export function hasActiveWizardIllusionistIllusoryReality(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "statusEntries" | "subclassId">>
): boolean {
  if (!hasWizardIllusionistIllusoryRealityFeature(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.value === illusoryRealityName &&
      entry.sourceId === wizardIllusionistIllusoryRealityStatusSourceId
  );
}

function getWizardIllusionistIllusoryRealityFeatureAction(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "statusEntries" | "subclassId">>
): FeatureActionCard | null {
  if (!hasWizardIllusionistIllusoryRealityFeature(character)) {
    return null;
  }

  const isActive = hasActiveWizardIllusionistIllusoryReality(character);

  return {
    key: wizardIllusionistIllusoryRealityActionKey,
    name: illusoryRealityName,
    summary: "Make part of your illusion feel real for 10 turns.",
    detail: "Create an Illusory Reality trait in Traits & Conditions.",
    breakdown: isActive
      ? "Illusory Reality is already active and can be refreshed."
      : "Activate Illusory Reality and create a 10-turn trait in Traits & Conditions.",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    isActive,
    description: wizardIllusionistIllusoryRealityDescription,
    drawer: {
      kind: "confirm",
      eyebrow: "Illusionist",
      confirmLabel: "Activate Illusory Reality",
      helperText: "Activating this creates an Illusory Reality trait that lasts for 10 turns."
    },
    execute: {
      kind: "activate",
      label: "Activate Illusory Reality"
    }
  };
}

export function activateWizardIllusionistIllusoryReality(character: Character): Character {
  if (!hasWizardIllusionistIllusoryRealityFeature(character)) {
    return character;
  }

  return {
    ...character,
    statusEntries: [
      ...clearWizardIllusionistIllusoryRealityStatuses(character.statusEntries),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: illusoryRealityName,
        source: "Illusionist",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: illusoryRealityDurationRounds,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: wizardIllusionistIllusoryRealityStatusSourceId
      })
    ]
  };
}

export function getWizardIllusionistPhantasmalCreaturesUsesTotal(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "subclassId">>
): number {
  return hasWizardIllusionistPhantasmalCreaturesFeature(character)
    ? phantasmalCreaturesUsesTotal
    : 0;
}

export function getWizardIllusionistPhantasmalCreaturesUsesRemaining(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "classFeatureState" | "level" | "subclassId">>
): number {
  const usesTotal = getWizardIllusionistPhantasmalCreaturesUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  return Math.max(
    0,
    usesTotal -
      normalizeWizardIllusionistUsesExpended(
        getWizardIllusionistFeatureState(character).phantasmalCreaturesUsesExpended,
        usesTotal
      )
  );
}

export function getWizardIllusionistPhantasmalCreaturesSpellOptionState(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "classFeatureState" | "level" | "subclassId">>,
  spell: Pick<SpellEntry, "id"> | null
): WizardIllusionistPhantasmalCreaturesSpellOptionState | null {
  if (!hasWizardIllusionistPhantasmalCreaturesFeature(character) || !spell) {
    return null;
  }

  if (!phantasmalCreaturesSpellIdSet.has(spell.id)) {
    return null;
  }

  const usesTotal = getWizardIllusionistPhantasmalCreaturesUsesTotal(character);
  const usesRemaining = getWizardIllusionistPhantasmalCreaturesUsesRemaining(character);
  const disabled = usesRemaining <= 0;

  return {
    usesRemaining,
    usesTotal,
    disabled,
    disabledReason: disabled ? "Phantasmal Creatures recharges on a Long Rest." : undefined
  };
}

export function consumeWizardIllusionistPhantasmalCreaturesUse(character: Character): Character {
  const usesRemaining = getWizardIllusionistPhantasmalCreaturesUsesRemaining(character);

  if (usesRemaining <= 0) {
    return character;
  }

  const wizardState = getWizardIllusionistFeatureState(character);
  const usesTotal = getWizardIllusionistPhantasmalCreaturesUsesTotal(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        phantasmalCreaturesUsesExpended: Math.min(
          usesTotal,
          normalizeWizardIllusionistUsesExpended(
            wizardState.phantasmalCreaturesUsesExpended,
            usesTotal
          ) + 1
        )
      }
    }
  };
}

export function getWizardIllusionistIllusorySelfUsesTotal(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "subclassId">>
): number {
  return hasWizardIllusionistIllusorySelfFeature(character) ? illusorySelfUsesTotal : 0;
}

export function getWizardIllusionistIllusorySelfUsesRemaining(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "classFeatureState" | "level" | "subclassId">>
): number {
  const usesTotal = getWizardIllusionistIllusorySelfUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  return Math.max(
    0,
    usesTotal -
      normalizeWizardIllusionistUsesExpended(
        getWizardIllusionistFeatureState(character).illusorySelfUsesExpended,
        usesTotal
      )
  );
}

export function getWizardIllusionistIllusorySelfFallbackSlotLevel(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "spellSlotsExpended" | "subclassId">>
): number | null {
  if (!hasWizardIllusionistIllusorySelfFeature(character)) {
    return null;
  }

  const spellSlotsRemaining = getWizardIllusionistSpellSlotsRemaining(character);

  for (let slotLevel = illusorySelfFallbackMinimumSlotLevel; slotLevel <= 9; slotLevel += 1) {
    if ((spellSlotsRemaining[slotLevel - 1] ?? 0) > 0) {
      return slotLevel;
    }
  }

  return null;
}

export function getWizardIllusionistIllusorySelfFallbackSlotSummary(
  character: Pick<WizardIllusionistCharacter, "className"> &
    Partial<Pick<WizardIllusionistCharacter, "level" | "spellSlotsExpended" | "subclassId">>
): { remaining: number; total: number } {
  if (!hasWizardIllusionistIllusorySelfFeature(character)) {
    return { remaining: 0, total: 0 };
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level ?? 1,
    character.subclassId
  );
  const spellSlotsRemaining = getWizardIllusionistSpellSlotsRemaining(character);

  return spellSlotTotals.reduce(
    (summary, total, index) => {
      const slotLevel = index + 1;

      if (slotLevel < illusorySelfFallbackMinimumSlotLevel) {
        return summary;
      }

      return {
        remaining: summary.remaining + (spellSlotsRemaining[index] ?? 0),
        total: summary.total + total
      };
    },
    { remaining: 0, total: 0 }
  );
}

export function consumeWizardIllusionistIllusorySelfUse(character: Character): Character {
  if (!hasWizardIllusionistIllusorySelfFeature(character)) {
    return character;
  }

  const usesRemaining = getWizardIllusionistIllusorySelfUsesRemaining(character);

  if (usesRemaining > 0) {
    const wizardState = getWizardIllusionistFeatureState(character);
    const usesTotal = getWizardIllusionistIllusorySelfUsesTotal(character);

    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        wizard: {
          ...wizardState,
          illusorySelfUsesExpended: Math.min(
            usesTotal,
            normalizeWizardIllusionistUsesExpended(wizardState.illusorySelfUsesExpended, usesTotal) + 1
          )
        }
      }
    };
  }

  const fallbackSlotLevel = getWizardIllusionistIllusorySelfFallbackSlotLevel(character);

  if (fallbackSlotLevel === null) {
    return character;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level,
    character.subclassId
  );
  const spellSlotsExpended = normalizeSpellSlotsExpended(character.spellSlotsExpended, spellSlotTotals);
  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[fallbackSlotLevel - 1] =
    (nextSpellSlotsExpended[fallbackSlotLevel - 1] ?? 0) + 1;

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function restoreWizardIllusionistPhantasmalCreaturesOnLongRest(
  character: Character
): Character {
  const usesTotal = getWizardIllusionistPhantasmalCreaturesUsesTotal(character);

  if (usesTotal <= 0) {
    return character;
  }

  const wizardState = getWizardIllusionistFeatureState(character);

  if (
    normalizeWizardIllusionistUsesExpended(wizardState.phantasmalCreaturesUsesExpended, usesTotal) <=
    0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        phantasmalCreaturesUsesExpended: 0
      }
    }
  };
}

function restoreWizardIllusionistIllusorySelfUses(character: Character): Character {
  const usesTotal = getWizardIllusionistIllusorySelfUsesTotal(character);

  if (usesTotal <= 0) {
    return character;
  }

  const wizardState = getWizardIllusionistFeatureState(character);

  if (
    normalizeWizardIllusionistUsesExpended(wizardState.illusorySelfUsesExpended, usesTotal) <= 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        illusorySelfUsesExpended: 0
      }
    }
  };
}

export function restoreWizardIllusionistIllusorySelfOnShortRest(character: Character): Character {
  return restoreWizardIllusionistIllusorySelfUses(character);
}

export function restoreWizardIllusionistIllusorySelfOnLongRest(character: Character): Character {
  return restoreWizardIllusionistIllusorySelfUses(character);
}

export const getWizardIllusionistDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  typeof character.level === "number"
    ? {
        featureActions: hasWizardIllusionistIllusoryRealityFeature(character)
          ? [getWizardIllusionistIllusoryRealityFeatureAction(character)].filter(
              (action): action is FeatureActionCard => action !== null
            )
          : [],
        alwaysPreparedSpellIds: getWizardIllusionistAlwaysPreparedSpellIds(character),
        alwaysSpellbookSpellIds: getWizardSavantSpellIdsFromFeatureState({
          className: character.className,
          level: character.level,
          subclassId: character.subclassId,
          classFeatureState: character.classFeatureState
        }),
        transformSpellEntry:
          hasWizardIllusionistImprovedIllusionsFeature(character) ||
          hasWizardIllusionistPhantasmalCreaturesFeature(character)
            ? (spell) => transformWizardIllusionistSpell(character, spell)
            : undefined,
        reactionEntries: hasWizardIllusionistIllusorySelfFeature(character)
          ? [illusorySelfReactionEntry]
          : []
      }
    : {};
