import {
  ABILITY_TYPES,
  CLASS_FEATURE,
  DAMAGE_TYPE,
  MAGIC_SCHOOL,
  SPELL_LIST_CLASS,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import { warlockFeatures } from "../../../../../codex/classes";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, CharacterWarlockFeatureState } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getSpellSaveFormulaCell } from "../../../shared/spellFormulas";
import {
  activateTelepathicBond,
  createTelepathicBondFeatureAction,
  getTelepathicBondDurationMinutes
} from "../../shared/telepathicBond";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { DerivedFeatureStatusEntry, FeatureActionCard, FeatureActionFact } from "../../types";

export const greatOldOnePatronSubclassId = "warlock-great-old-one-patron";
export const awakenedMindActionKey = "warlock-great-old-one-patron-awakened-mind";

const awakenedMindName = "Awakened Mind";
export const awakenedMindStatusSourceId = "feature-warlock-great-old-one-patron-awakened-mind";
const clairvoyantCombatantName = "Clairvoyant Combatant";
const eldritchHexName = "Eldritch Hex";
const thoughtShieldName = "Thought Shield";
export const thoughtShieldStatusSourceId =
  "feature-warlock-great-old-one-patron-thought-shield";
const thoughtShieldPsychicResistanceSourceId =
  "feature-warlock-great-old-one-patron-thought-shield-psychic-resistance";
const createThrallName = "Create Thrall";
const psychicSpellsName = "Psychic Spells";
const hexSpellId = "spell-hex";
const summonAberrationSpellId = "spell-summon-aberration";

const greatOldOnePatronSpellIdsByLevel = {
  3: resolveSpellIdsByName([
    "Detect Thoughts",
    "Dissonant Whispers",
    "Phantasmal Force",
    "Hideous Laughter"
  ]),
  5: resolveSpellIdsByName(["Clairvoyance", "Hunger of Hadar"]),
  7: resolveSpellIdsByName(["Confusion", "Summon Aberration"]),
  9: resolveSpellIdsByName(["Modify Memory", "Telekinesis"])
} as const;
const greatOldOnePatronSubclassEntry = getSubclassEntryById(greatOldOnePatronSubclassId);
const greatOldOnePatronSourceLabel = greatOldOnePatronSubclassEntry?.name ?? "Great Old One Patron";

type WarlockGreatOldOnePatronCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      "classFeatureState" | "level" | "spellSlotsExpended" | "statusEntries" | "subclassId"
    >
  >;

function getGreatOldOnePatronFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = greatOldOnePatronSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const awakenedMindDescription = getGreatOldOnePatronFeatureDescriptionEntries(
  CLASS_FEATURE.AWAKENED_MIND
);
const clairvoyantCombatantDescription = getGreatOldOnePatronFeatureDescriptionEntries(
  CLASS_FEATURE.CLAIRVOYANT_COMBATANT
);
const eldritchHexDescription = getGreatOldOnePatronFeatureDescriptionEntries(
  CLASS_FEATURE.ELDRITCH_HEX
);
const thoughtShieldDescription = getGreatOldOnePatronFeatureDescriptionEntries(
  CLASS_FEATURE.THOUGHT_SHIELD
);
const createThrallDescription = getGreatOldOnePatronFeatureDescriptionEntries(
  CLASS_FEATURE.CREATE_THRALL
);
const psychicSpellsDescription = getGreatOldOnePatronFeatureDescriptionEntries(
  CLASS_FEATURE.PSYCHIC_SPELLS
);

function hasWarlockGreatOldOnePatronAwakenedMind(
  character: WarlockGreatOldOnePatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === greatOldOnePatronSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasWarlockGreatOldOnePatronPsychicSpells(
  character: WarlockGreatOldOnePatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === greatOldOnePatronSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasWarlockGreatOldOnePatronClairvoyantCombatant(
  character: WarlockGreatOldOnePatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === greatOldOnePatronSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasWarlockGreatOldOnePatronEldritchHex(
  character: WarlockGreatOldOnePatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === greatOldOnePatronSubclassId &&
    (character.level ?? 0) >= 10
  );
}

function hasWarlockGreatOldOnePatronThoughtShield(
  character: WarlockGreatOldOnePatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === greatOldOnePatronSubclassId &&
    (character.level ?? 0) >= 10
  );
}

function hasWarlockGreatOldOnePatronCreateThrall(
  character: WarlockGreatOldOnePatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === greatOldOnePatronSubclassId &&
    (character.level ?? 0) >= 14
  );
}

function getWarlockGreatOldOnePatronPactMagicSlotLevel(
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

function getWarlockGreatOldOnePatronPactMagicSlotsRemaining(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "spellSlotsExpended">>
): number {
  const pactMagicSlotLevel = getWarlockGreatOldOnePatronPactMagicSlotLevel(character);

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

function getAwakenedMindDescriptionAdditions(
  character: WarlockGreatOldOnePatronCharacter
): ReturnType<typeof createFeatureSourcedDescriptionEntries>[] | undefined {
  return hasWarlockGreatOldOnePatronClairvoyantCombatant(character) &&
    clairvoyantCombatantDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.CLAIRVOYANT_COMBATANT,
          clairvoyantCombatantDescription,
          clairvoyantCombatantName
        )
      ]
    : undefined;
}

function getAwakenedMindFacts(
  character: WarlockGreatOldOnePatronCharacter
): FeatureActionFact[] | undefined {
  if (!hasWarlockGreatOldOnePatronClairvoyantCombatant(character)) {
    return undefined;
  }

  const spellDcFormulaCell = getSpellSaveFormulaCell(
    {
      isAttackSpell: false,
      isSavingThrowSpell: true,
      savingThrowAbility: ABILITY_TYPES.WIS,
      spellLists: [SPELL_LIST_CLASS.WARLOCK]
    },
    character as Character
  );

  return spellDcFormulaCell
    ? [
        {
          label: spellDcFormulaCell.label,
          value: spellDcFormulaCell.content,
          breakdown: spellDcFormulaCell.breakdown,
          fullWidth: true
        }
      ]
    : undefined;
}

export function getWarlockGreatOldOnePatronClairvoyantCombatantUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasWarlockGreatOldOnePatronClairvoyantCombatant(character) ? 1 : 0;
}

export function getWarlockGreatOldOnePatronClairvoyantCombatantUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  const totalUses = getWarlockGreatOldOnePatronClairvoyantCombatantUsesTotal(character);
  const usesExpended = character.classFeatureState?.warlock?.clairvoyantCombatantUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function normalizeWarlockGreatOldOnePatronFeatureState(
  value: Partial<CharacterWarlockFeatureState>,
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): Pick<CharacterWarlockFeatureState, "clairvoyantCombatantUsesExpended"> {
  const clairvoyantCombatantUsesTotal =
    getWarlockGreatOldOnePatronClairvoyantCombatantUsesTotal(character);
  const rawClairvoyantCombatantUsesExpended = Number(value.clairvoyantCombatantUsesExpended);

  return {
    clairvoyantCombatantUsesExpended:
      clairvoyantCombatantUsesTotal > 0 && Number.isFinite(rawClairvoyantCombatantUsesExpended)
        ? Math.max(
            0,
            Math.min(clairvoyantCombatantUsesTotal, Math.floor(rawClairvoyantCombatantUsesExpended))
          )
        : clairvoyantCombatantUsesTotal > 0
          ? 0
          : undefined
  };
}

function spendWarlockGreatOldOnePatronClairvoyantCombatantResource(
  character: Character
): Character {
  if (!hasWarlockGreatOldOnePatronClairvoyantCombatant(character)) {
    return character;
  }

  const usesRemaining = getWarlockGreatOldOnePatronClairvoyantCombatantUsesRemaining(character);

  if (usesRemaining > 0) {
    const warlockState = character.classFeatureState?.warlock ?? {};
    const totalUses = getWarlockGreatOldOnePatronClairvoyantCombatantUsesTotal(character);
    const usesExpended = warlockState.clairvoyantCombatantUsesExpended ?? 0;

    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        warlock: {
          ...warlockState,
          clairvoyantCombatantUsesExpended: Math.min(totalUses, usesExpended + 1)
        }
      }
    };
  }

  const pactMagicSlotsRemaining = getWarlockGreatOldOnePatronPactMagicSlotsRemaining(character);
  const pactMagicSlotLevel = getWarlockGreatOldOnePatronPactMagicSlotLevel(character);

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

export function restoreWarlockGreatOldOnePatronClairvoyantCombatantOnShortRest(
  character: Character
): Character {
  if (!hasWarlockGreatOldOnePatronClairvoyantCombatant(character)) {
    return character;
  }

  const warlockState = character.classFeatureState?.warlock ?? {};

  if ((warlockState.clairvoyantCombatantUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        clairvoyantCombatantUsesExpended: 0
      }
    }
  };
}

export function restoreWarlockGreatOldOnePatronClairvoyantCombatantOnLongRest(
  character: Character
): Character {
  return restoreWarlockGreatOldOnePatronClairvoyantCombatantOnShortRest(character);
}

function spellQualifiesForWarlockGreatOldOnePatronPsychicSpells(
  spell: Pick<SpellEntry, "damage" | "magicSchool" | "spellLists">
): boolean {
  if (!spell.spellLists.includes(SPELL_LIST_CLASS.WARLOCK)) {
    return false;
  }

  return (
    spell.damage.length > 0 ||
    spell.magicSchool === MAGIC_SCHOOL.ENCHANTMENT ||
    spell.magicSchool === MAGIC_SCHOOL.ILLUSION
  );
}

function appendGreatOldOnePatronSpellDescription(
  character: WarlockGreatOldOnePatronCharacter,
  spell: SpellEntry,
  feature: CLASS_FEATURE,
  fallbackSourceName: string,
  descriptionEntries: readonly string[]
): SpellEntry {
  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    feature,
    descriptionEntries,
    fallbackSourceName
  );
}

function appendPsychicSpellsDescription(
  character: WarlockGreatOldOnePatronCharacter,
  spell: SpellEntry
): SpellEntry {
  if (!spellQualifiesForWarlockGreatOldOnePatronPsychicSpells(spell)) {
    return spell;
  }

  return appendGreatOldOnePatronSpellDescription(
    character,
    spell,
    CLASS_FEATURE.PSYCHIC_SPELLS,
    psychicSpellsName,
    psychicSpellsDescription
  );
}

function appendEldritchHexDescription(
  character: WarlockGreatOldOnePatronCharacter,
  spell: SpellEntry
): SpellEntry {
  return spell.id === hexSpellId
    ? appendGreatOldOnePatronSpellDescription(
        character,
        spell,
        CLASS_FEATURE.ELDRITCH_HEX,
        eldritchHexName,
        eldritchHexDescription
      )
    : spell;
}

function appendCreateThrallDescription(
  character: WarlockGreatOldOnePatronCharacter,
  spell: SpellEntry
): SpellEntry {
  return spell.id === summonAberrationSpellId
    ? appendGreatOldOnePatronSpellDescription(
        character,
        spell,
        CLASS_FEATURE.CREATE_THRALL,
        createThrallName,
        createThrallDescription
      )
    : spell;
}

function getWarlockGreatOldOnePatronDerivedStatusEntries(
  character: WarlockGreatOldOnePatronCharacter
): DerivedFeatureStatusEntry[] {
  if (!hasWarlockGreatOldOnePatronThoughtShield(character)) {
    return [];
  }

  return [
    {
      id: thoughtShieldStatusSourceId,
      sourceId: thoughtShieldStatusSourceId,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: thoughtShieldName,
      source: greatOldOnePatronSourceLabel,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      description: thoughtShieldDescription.join("\n\n")
    },
    {
      id: thoughtShieldPsychicResistanceSourceId,
      sourceId: thoughtShieldPsychicResistanceSourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.PSYCHIC,
      source: thoughtShieldName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

function getWarlockGreatOldOnePatronFeatureActions(
  character: WarlockGreatOldOnePatronCharacter
): FeatureActionCard[] {
  if (!hasWarlockGreatOldOnePatronAwakenedMind(character)) {
    return [];
  }

  const awakenedMindAction = createTelepathicBondFeatureAction(character, {
    actionKey: awakenedMindActionKey,
    name: awakenedMindName,
    sourceId: awakenedMindStatusSourceId,
    eyebrow: greatOldOnePatronSourceLabel,
    description: awakenedMindDescription
  });

  return [
    {
      ...awakenedMindAction,
      ...(awakenedMindAction.drawer
        ? {
            drawer: {
              ...awakenedMindAction.drawer,
              descriptionAdditions: getAwakenedMindDescriptionAdditions(character),
              facts: getAwakenedMindFacts(character),
              factsSectionTitle: null
            }
          }
        : {})
    }
  ];
}

export type ActivateWarlockGreatOldOnePatronAwakenedMindOptions = {
  useClairvoyantCombatant?: boolean;
};

export function activateWarlockGreatOldOnePatronAwakenedMind(
  character: Character,
  options: ActivateWarlockGreatOldOnePatronAwakenedMindOptions = {}
): Character {
  if (!hasWarlockGreatOldOnePatronAwakenedMind(character)) {
    return character;
  }

  const nextCharacter = options.useClairvoyantCombatant
    ? spendWarlockGreatOldOnePatronClairvoyantCombatantResource(character)
    : character;

  if (options.useClairvoyantCombatant && nextCharacter === character) {
    return character;
  }

  return activateTelepathicBond(nextCharacter, {
    name: awakenedMindName,
    source: greatOldOnePatronSourceLabel,
    sourceId: awakenedMindStatusSourceId,
    durationMinutes: getTelepathicBondDurationMinutes(character.level)
  });
}

function createWarlockGreatOldOnePatronSource(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}) {
  return createSubclassContributionSource({
    ...input,
    id: `warlock-great-old-one-patron-${input.id}`
  });
}

export function collectWarlockGreatOldOnePatronContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (
    character.className !== "Warlock" ||
    character.subclassId !== greatOldOnePatronSubclassId ||
    (character.level ?? 0) < 3
  ) {
    return [];
  }

  const contributions: FeatureContributionSpec[] = [
    {
      source: createWarlockGreatOldOnePatronSource({
        id: "spells",
        label: "Great Old One Spells",
        entryId: CLASS_FEATURE.GREAT_OLD_ONE_SPELLS
      }),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        character.level ?? 0,
        greatOldOnePatronSpellIdsByLevel
      )
    }
  ];

  if (hasWarlockGreatOldOnePatronAwakenedMind(character)) {
    contributions.push({
      source: createWarlockGreatOldOnePatronSource({
        id: "awakened-mind",
        label: awakenedMindName,
        entryId: CLASS_FEATURE.AWAKENED_MIND
      }),
      actions: getWarlockGreatOldOnePatronFeatureActions(character)
    });
  }

  if (hasWarlockGreatOldOnePatronPsychicSpells(character)) {
    contributions.push({
      source: createWarlockGreatOldOnePatronSource({
        id: "psychic-spells",
        label: psychicSpellsName,
        entryId: CLASS_FEATURE.PSYCHIC_SPELLS
      }),
      spellTransforms: [
        {
          id: "warlock-great-old-one-patron-psychic-spells",
          transform: (spell) => appendPsychicSpellsDescription(character, spell)
        }
      ]
    });
  }

  if (hasWarlockGreatOldOnePatronClairvoyantCombatant(character)) {
    contributions.push({
      source: createWarlockGreatOldOnePatronSource({
        id: "clairvoyant-combatant",
        label: clairvoyantCombatantName,
        entryId: CLASS_FEATURE.CLAIRVOYANT_COMBATANT
      })
    });
  }

  if (hasWarlockGreatOldOnePatronEldritchHex(character)) {
    contributions.push({
      source: createWarlockGreatOldOnePatronSource({
        id: "eldritch-hex",
        label: eldritchHexName,
        entryId: CLASS_FEATURE.ELDRITCH_HEX
      }),
      alwaysPreparedSpellIds: [hexSpellId],
      spellTransforms: [
        {
          id: "warlock-great-old-one-patron-eldritch-hex",
          transform: (spell) => appendEldritchHexDescription(character, spell)
        }
      ]
    });
  }

  if (hasWarlockGreatOldOnePatronThoughtShield(character)) {
    contributions.push({
      source: createWarlockGreatOldOnePatronSource({
        id: "thought-shield",
        label: thoughtShieldName,
        entryId: CLASS_FEATURE.THOUGHT_SHIELD
      }),
      statuses: getWarlockGreatOldOnePatronDerivedStatusEntries(character)
    });
  }

  if (hasWarlockGreatOldOnePatronCreateThrall(character)) {
    contributions.push({
      source: createWarlockGreatOldOnePatronSource({
        id: "create-thrall",
        label: createThrallName,
        entryId: CLASS_FEATURE.CREATE_THRALL
      }),
      spellTransforms: [
        {
          id: "warlock-great-old-one-patron-create-thrall",
          transform: (spell) => appendCreateThrallDescription(character, spell)
        }
      ]
    });
  }

  return contributions;
}

export const getWarlockGreatOldOnePatronDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectWarlockGreatOldOnePatronContributions(character)),
    {
      character: character as Character
    }
  );
