import {
  CLASS_FEATURE,
  MAGIC_SCHOOL,
  type SpellEntry
} from "../../../../../codex/entries";
import { divineForeknowledgeDescription } from "../../../../../codex/subclasses/cleric";
import type {
  Character,
  CharacterClericFeatureState,
  SavingThrowProficiencyEntry,
  SkillProficiencyEntry,
  ToolProficiencyEntry
} from "../../../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  SKILL,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  type SkillName
} from "../../../../../types";
import {
  artisanToolProficiencies,
  type ToolProficiency
} from "../../../proficiencyOptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import {
  getSavingThrowLevelFromEntries,
  getSkillProficiencyForName
} from "../../../proficiencyResolvers";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellSlots";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import { getPreparedSpellIdsByLevel, type SubclassRuntimeResolver } from "../../subclassRuntime";
import type {
  AbilityCheckIndicatorMap,
  CoreStatIndicatorMap,
  FeatureActionCard,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillProficiencyEntry,
  FeatureToolProficiencyEntry,
  SavingThrowIndicatorMap,
  SkillIndicatorMap
} from "../../types";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { normalizeClericBaseFeatureState } from "../clericFeatureState";

export const knowledgeDomainSubclassId = "cleric-knowledge-domain";
export const divineForeknowledgeActionKey = "cleric-divine-foreknowledge";

const blessingsOfKnowledgeSource = "Blessings of Knowledge";
const mindMagicSource = "Mind Magic";
const unfetteredMindSource = "Unfettered Mind";
const divineForeknowledgeSource = "Divine Foreknowledge";
const divineForeknowledgeStatusSourceId = "feature-cleric-divine-foreknowledge";
const knowledgeDomainBlessingsSkillOptions = [
  SKILL.ARCANA,
  SKILL.HISTORY,
  SKILL.NATURE,
  SKILL.RELIGION
] as const;
const knowledgeDomainBlessingsToolOptions = [...artisanToolProficiencies] as const;
const divineForeknowledgeAdvantageIndicator = {
  label: "Advantage",
  tone: "advantage" as const,
  source: divineForeknowledgeSource
};
const abilitySavingThrowProficiencies = [
  SAVING_THROW_PROFICIENCY.STR,
  SAVING_THROW_PROFICIENCY.DEX,
  SAVING_THROW_PROFICIENCY.CON,
  SAVING_THROW_PROFICIENCY.INT,
  SAVING_THROW_PROFICIENCY.WIS,
  SAVING_THROW_PROFICIENCY.CHA
] as const;
const knowledgeDomainSpellIdsByLevel = {
  3: [
    "spell-command",
    "spell-comprehend-languages",
    "spell-detect-magic",
    "spell-detect-thoughts",
    "spell-identify",
    "spell-mind-spike"
  ],
  5: ["spell-dispel-magic", "spell-nondetection", "spell-tongues"],
  7: ["spell-arcane-eye", "spell-banishment", "spell-confusion"],
  9: ["spell-legend-lore", "spell-scrying", "spell-synaptic-static"]
} as const;

function normalizeKnowledgeDomainClericFeatureState(
  value: unknown,
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "savingThrowProficiencies">>
): CharacterClericFeatureState {
  const normalizedCharacter = {
    ...character,
    level: character.level ?? 1
  };
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterClericFeatureState>) : {};

  return {
    ...normalizeClericBaseFeatureState(record, normalizedCharacter),
    ...normalizeClericKnowledgeDomainFeatureState(record, normalizedCharacter)
  };
}

export function hasClericKnowledgeDomainFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  minimumLevel: number
): boolean {
  return (
    character.className === "Cleric" &&
    character.subclassId === knowledgeDomainSubclassId &&
    (character.level ?? 0) >= minimumLevel
  );
}

function hasClericKnowledgeDomainBlessingsOfKnowledgeFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasClericKnowledgeDomainFeature(character, 3);
}

export function hasClericKnowledgeDomainMindMagicFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasClericKnowledgeDomainFeature(character, 3);
}

function hasClericKnowledgeDomainUnfetteredMindFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasClericKnowledgeDomainFeature(character, 6);
}

function hasClericKnowledgeDomainDivineForeknowledgeFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasClericKnowledgeDomainFeature(character, 17);
}

function isKnowledgeDomainBlessingsSkill(skill: SkillName): boolean {
  return knowledgeDomainBlessingsSkillOptions.some((option) => option === skill);
}

function createKnowledgeDomainSkillEntries(skill: SkillName): SkillProficiencyEntry[] {
  const proficiency = getSkillProficiencyForName(skill);

  if (!proficiency) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: blessingsOfKnowledgeSource,
      proficiency,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies SkillProficiencyEntry,
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: blessingsOfKnowledgeSource,
      proficiency,
      proficiencyLevel: PROF_LEVEL.EXPERT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies SkillProficiencyEntry
  ];
}

function isKnowledgeDomainBlessingsTool(tool: ToolProficiency): boolean {
  return knowledgeDomainBlessingsToolOptions.some((option) => option === tool);
}

function createKnowledgeDomainToolEntries(tool: ToolProficiency): ToolProficiencyEntry[] {
  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: blessingsOfKnowledgeSource,
      proficiency: tool,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies ToolProficiencyEntry
  ];
}

function getSavingThrowEntriesExcludingUnfetteredMind(
  character: Partial<Pick<Character, "savingThrowProficiencies">>
): SavingThrowProficiencyEntry[] {
  return (character.savingThrowProficiencies ?? []).filter(
    (entry) => entry.sourceStr !== unfetteredMindSource
  );
}

function getUnfetteredMindAvailableSavingThrows(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "level" | "subclassId" | "classFeatureState" | "savingThrowProficiencies">
    >
): SAVING_THROW_PROFICIENCY[] {
  if (!hasClericKnowledgeDomainUnfetteredMindFeature(character)) {
    return [];
  }

  const baseSavingThrowEntries = getSavingThrowEntriesExcludingUnfetteredMind(character);
  const hasExistingIntSavingThrow =
    getSavingThrowLevelFromEntries(baseSavingThrowEntries, SAVING_THROW_PROFICIENCY.INT) !==
    PROF_LEVEL.NONE;

  if (!hasExistingIntSavingThrow) {
    return [SAVING_THROW_PROFICIENCY.INT];
  }

  return abilitySavingThrowProficiencies.filter(
    (proficiency) =>
      getSavingThrowLevelFromEntries(baseSavingThrowEntries, proficiency) === PROF_LEVEL.NONE
  );
}

export function normalizeClericKnowledgeDomainFeatureState(
  value: Partial<CharacterClericFeatureState>,
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "savingThrowProficiencies">>
): Pick<
  CharacterClericFeatureState,
  | "knowledgeBlessingsSkills"
  | "knowledgeBlessingsTool"
  | "unfetteredMindSavingThrow"
  | "divineForeknowledgeUsesExpended"
> {
  const hasBlessingsOfKnowledge = hasClericKnowledgeDomainBlessingsOfKnowledgeFeature(character);
  const hasUnfetteredMind = hasClericKnowledgeDomainUnfetteredMindFeature(character);
  const hasDivineForeknowledge = hasClericKnowledgeDomainDivineForeknowledgeFeature(character);

  return {
    knowledgeBlessingsSkills: hasBlessingsOfKnowledge
      ? Array.from(
          new Set(
            (Array.isArray(value.knowledgeBlessingsSkills) ? value.knowledgeBlessingsSkills : []).filter(
              (skill): skill is SkillName =>
                typeof skill === "string" &&
                knowledgeDomainBlessingsSkillOptions.some((option) => option === skill)
            )
          )
        ).slice(0, 2)
      : undefined,
    knowledgeBlessingsTool:
      hasBlessingsOfKnowledge &&
      typeof value.knowledgeBlessingsTool === "string" &&
      knowledgeDomainBlessingsToolOptions.some((tool) => tool === value.knowledgeBlessingsTool)
        ? value.knowledgeBlessingsTool
        : undefined,
    unfetteredMindSavingThrow:
      hasUnfetteredMind &&
      abilitySavingThrowProficiencies.some(
        (proficiency) => proficiency === value.unfetteredMindSavingThrow
      )
        ? value.unfetteredMindSavingThrow
        : undefined,
    divineForeknowledgeUsesExpended: hasDivineForeknowledge
      ? Math.max(
          0,
          Math.min(
            1,
            Number.isFinite(Number(value.divineForeknowledgeUsesExpended))
              ? Math.floor(Number(value.divineForeknowledgeUsesExpended))
              : 0
          )
        )
      : undefined
  };
}

export function getKnowledgeDomainBlessingsSkillSelections(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "classFeatureState" | "subclassId">>
): SkillName[] {
  if (!hasClericKnowledgeDomainBlessingsOfKnowledgeFeature(character)) {
    return [];
  }

  return (
    normalizeKnowledgeDomainClericFeatureState(character.classFeatureState?.cleric, character)
      .knowledgeBlessingsSkills ?? []
  );
}

export function getKnowledgeDomainBlessingsToolSelection(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "classFeatureState" | "subclassId">>
): ToolProficiency | null {
  if (!hasClericKnowledgeDomainBlessingsOfKnowledgeFeature(character)) {
    return null;
  }

  return (
    normalizeKnowledgeDomainClericFeatureState(character.classFeatureState?.cleric, character)
      .knowledgeBlessingsTool ?? null
  );
}

export function setKnowledgeDomainBlessingsSkillSelections(
  character: Character,
  selections: SkillName[]
): Character {
  if (!hasClericKnowledgeDomainBlessingsOfKnowledgeFeature(character)) {
    return character;
  }

  const clericState = normalizeKnowledgeDomainClericFeatureState(
    character.classFeatureState?.cleric,
    character
  );
  const nextSelections = Array.from(
    new Set(selections.filter(isKnowledgeDomainBlessingsSkill))
  ).slice(0, 2);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        knowledgeBlessingsSkills: nextSelections
      }
    }
  };
}

export function setKnowledgeDomainBlessingsToolSelection(
  character: Character,
  selection: ToolProficiency | null
): Character {
  if (!hasClericKnowledgeDomainBlessingsOfKnowledgeFeature(character)) {
    return character;
  }

  const clericState = normalizeKnowledgeDomainClericFeatureState(
    character.classFeatureState?.cleric,
    character
  );
  const nextSelection = selection && isKnowledgeDomainBlessingsTool(selection) ? selection : undefined;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        knowledgeBlessingsTool: nextSelection
      }
    }
  };
}

export function getKnowledgeDomainSkillProficiencyEntries(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "classFeatureState" | "subclassId">>
): FeatureSkillProficiencyEntry[] {
  if (!hasClericKnowledgeDomainBlessingsOfKnowledgeFeature(character)) {
    return [];
  }

  return getKnowledgeDomainBlessingsSkillSelections(character).flatMap((skill) =>
    createKnowledgeDomainSkillEntries(skill)
  );
}

export function getKnowledgeDomainToolProficiencyEntries(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "classFeatureState" | "subclassId">>
): FeatureToolProficiencyEntry[] {
  const tool = getKnowledgeDomainBlessingsToolSelection(character);

  return tool ? createKnowledgeDomainToolEntries(tool) : [];
}

export function canUseClericKnowledgeDomainMindMagicForSpell(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: Pick<SpellEntry, "magicSchool"> | null,
  isPrepared: boolean
): boolean {
  return (
    isPrepared &&
    spell !== null &&
    spell.magicSchool === MAGIC_SCHOOL.DIVINATION &&
    hasClericKnowledgeDomainMindMagicFeature(character)
  );
}

export function getClericKnowledgeDomainMindMagicSpellEntry(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  spell: SpellEntry,
  isPrepared: boolean
): SpellEntry {
  if (!canUseClericKnowledgeDomainMindMagicForSpell(character, spell, isPrepared)) {
    return spell;
  }

  const descriptionEntries = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.MIND_MAGIC);

  return descriptionEntries.length > 0
    ? appendSourcedDescriptionAddition(spell, mindMagicSource, descriptionEntries)
    : spell;
}

export function isKnowledgeDomainUnfetteredMindLockedToInt(
  character: Pick<Character, "className"> &
    Partial<
      Pick<
        Character,
        "level" | "savingThrowProficiencies" | "subclassId" | "classFeatureState"
      >
    >
): boolean {
  return (
    hasClericKnowledgeDomainUnfetteredMindFeature(character) &&
    getUnfetteredMindAvailableSavingThrows(character)[0] === SAVING_THROW_PROFICIENCY.INT &&
    getUnfetteredMindAvailableSavingThrows(character).length === 1
  );
}

export function getKnowledgeDomainUnfetteredMindSavingThrowSelection(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "level" | "classFeatureState" | "savingThrowProficiencies" | "subclassId">
    >
): SAVING_THROW_PROFICIENCY | null {
  if (!hasClericKnowledgeDomainUnfetteredMindFeature(character)) {
    return null;
  }

  const availableSavingThrows = getUnfetteredMindAvailableSavingThrows(character);

  if (availableSavingThrows.length === 0) {
    return null;
  }

  if (isKnowledgeDomainUnfetteredMindLockedToInt(character)) {
    return SAVING_THROW_PROFICIENCY.INT;
  }

  const savedSelection = normalizeKnowledgeDomainClericFeatureState(
    character.classFeatureState?.cleric,
    character
  ).unfetteredMindSavingThrow;

  return savedSelection && availableSavingThrows.includes(savedSelection)
    ? savedSelection
    : availableSavingThrows[0];
}

export function getKnowledgeDomainUnfetteredMindSavingThrowOptions(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "level" | "savingThrowProficiencies" | "subclassId" | "classFeatureState">
    >
): SAVING_THROW_PROFICIENCY[] {
  return getUnfetteredMindAvailableSavingThrows(character);
}

export function setKnowledgeDomainUnfetteredMindSavingThrowSelection(
  character: Character,
  proficiency: SAVING_THROW_PROFICIENCY | null
): Character {
  if (!hasClericKnowledgeDomainUnfetteredMindFeature(character)) {
    return character;
  }

  const clericState = normalizeKnowledgeDomainClericFeatureState(
    character.classFeatureState?.cleric,
    character
  );
  const availableSavingThrows = getUnfetteredMindAvailableSavingThrows(character);
  const lockedToInt = isKnowledgeDomainUnfetteredMindLockedToInt(character);
  const nextSelection = lockedToInt
    ? undefined
    : proficiency && availableSavingThrows.includes(proficiency)
      ? proficiency
      : undefined;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        unfetteredMindSavingThrow: nextSelection
      }
    }
  };
}

export function getKnowledgeDomainSavingThrowProficiencyEntries(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "level" | "classFeatureState" | "savingThrowProficiencies" | "subclassId">
    >
): FeatureSavingThrowProficiencyEntry[] {
  const proficiency = getKnowledgeDomainUnfetteredMindSavingThrowSelection(character);

  if (!proficiency) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: unfetteredMindSource,
      proficiency,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies SavingThrowProficiencyEntry
  ];
}

export function getDivineForeknowledgeUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasClericKnowledgeDomainDivineForeknowledgeFeature(character) ? 1 : 0;
}

export function getDivineForeknowledgeUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "classFeatureState" | "subclassId">>
): number {
  const totalUses = getDivineForeknowledgeUsesTotal(character);
  const clericState = normalizeKnowledgeDomainClericFeatureState(
    character.classFeatureState?.cleric,
    character
  );

  return Math.max(0, totalUses - (clericState.divineForeknowledgeUsesExpended ?? 0));
}

export function getDivineForeknowledgeFallbackSlotLevel(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "spellSlotsExpended">>
): number | null {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level ?? 1);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );

  for (let slotLevel = 6; slotLevel <= 9; slotLevel += 1) {
    const remainingSlots = Math.max(
      0,
      (spellSlotTotals[slotLevel - 1] ?? 0) - (spellSlotsExpended[slotLevel - 1] ?? 0)
    );

    if (remainingSlots > 0) {
      return slotLevel;
    }
  }

  return null;
}

export function getDivineForeknowledgeFallbackSlotSummary(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "spellSlotsExpended">>
): { total: number; remaining: number } {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level ?? 1);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );

  return spellSlotTotals.reduce(
    (summary, total, index) => {
      const slotLevel = index + 1;

      if (slotLevel < 6) {
        return summary;
      }

      return {
        total: summary.total + total,
        remaining: summary.remaining + Math.max(0, total - (spellSlotsExpended[index] ?? 0))
      };
    },
    { total: 0, remaining: 0 }
  );
}

export function hasActiveDivineForeknowledge(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId" | "statusEntries">>
): boolean {
  if (!hasClericKnowledgeDomainDivineForeknowledgeFeature(character)) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.value === divineForeknowledgeSource &&
      entry.sourceId === divineForeknowledgeStatusSourceId
  );
}

export function getKnowledgeDomainFeatureActions(
  character: Pick<Character, "className"> &
    Partial<
      Pick<
        Character,
        "level" | "classFeatureState" | "spellSlotsExpended" | "statusEntries" | "subclassId"
      >
    >
): FeatureActionCard[] {
  if (!hasClericKnowledgeDomainDivineForeknowledgeFeature(character)) {
    return [];
  }

  const usesRemaining = getDivineForeknowledgeUsesRemaining(character);
  const usesTotal = getDivineForeknowledgeUsesTotal(character);
  const fallbackSlotLevel = getDivineForeknowledgeFallbackSlotLevel(character);
  const fallbackSlotSummary = getDivineForeknowledgeFallbackSlotSummary(character);
  const hasFallbackSlot = fallbackSlotLevel !== null;
  const isActive = hasActiveDivineForeknowledge(character);

  return [
    {
      key: divineForeknowledgeActionKey,
      name: "Divine Foreknowledge",
      summary: "Gain advantage on skills and saving throws.",
      detail: "Expand your mind to the future for 1 hour.",
      breakdown: "Skill/save advantage",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesRemaining,
      usesTotal,
      usesInlineLabel: usesRemaining <= 0 && hasFallbackSlot ? "| Use 6+ Spell Slot" : undefined,
      description: [...divineForeknowledgeDescription],
      drawer: {
        kind: "confirm",
        eyebrow: "Knowledge Domain",
        confirmLabel: "Activate Divine Foreknowledge",
        resources: [
          {
            kind: "tracker",
            label: "Uses",
            current: usesRemaining,
            total: usesTotal,
            cost: 1
          },
          ...(fallbackSlotSummary.total > 0
            ? [
                {
                  kind: "text" as const,
                  label: "Level 6+ Slots",
                  value: `${fallbackSlotSummary.remaining}/${fallbackSlotSummary.total}`
                }
              ]
            : [])
        ]
      },
      execute: {
        kind: "activate",
        label: "Activate Divine Foreknowledge"
      },
      isActive,
      disabled: isActive || (usesRemaining <= 0 && !hasFallbackSlot),
      disabledReason: isActive
        ? "Divine Foreknowledge is already active."
        : usesRemaining <= 0 && !hasFallbackSlot
          ? "No Divine Foreknowledge use or level 6+ spell slots remaining."
          : undefined
    }
  ];
}

export function applyDivineForeknowledgeStatus(character: Character): Character {
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== divineForeknowledgeStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: divineForeknowledgeSource,
        source: "Knowledge Domain",
        duration: {
          kind: STATUS_DURATION_KIND.HOURS,
          amount: 1
        },
        sourceId: divineForeknowledgeStatusSourceId
      })
    ]
  };
}

export function activateClericDivineForeknowledge(character: Character): Character {
  if (
    !hasClericKnowledgeDomainDivineForeknowledgeFeature(character) ||
    hasActiveDivineForeknowledge(character)
  ) {
    return character;
  }

  const usesRemaining = getDivineForeknowledgeUsesRemaining(character);
  let nextCharacter = character;

  if (usesRemaining > 0) {
    const clericState = normalizeKnowledgeDomainClericFeatureState(
      character.classFeatureState?.cleric,
      character
    );

    nextCharacter = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        cleric: {
          ...clericState,
          divineForeknowledgeUsesExpended: (clericState.divineForeknowledgeUsesExpended ?? 0) + 1
        }
      }
    };
  } else {
    const fallbackSlotLevel = getDivineForeknowledgeFallbackSlotLevel(character);

    if (fallbackSlotLevel === null) {
      return character;
    }

    const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
    const spellSlotsExpended = normalizeSpellSlotsExpended(
      character.spellSlotsExpended,
      spellSlotTotals
    );
    const nextSpellSlotsExpended = [...spellSlotsExpended];
    nextSpellSlotsExpended[fallbackSlotLevel - 1] =
      (nextSpellSlotsExpended[fallbackSlotLevel - 1] ?? 0) + 1;

    nextCharacter = {
      ...character,
      spellSlotsExpended: nextSpellSlotsExpended
    };
  }

  return applyDivineForeknowledgeStatus(nextCharacter);
}

export function getKnowledgeDomainSkillIndicators(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): SkillIndicatorMap {
  if (!hasActiveDivineForeknowledge(character)) {
    return {};
  }

  return Object.fromEntries(
    Object.values(SKILL).map((skill) => [skill, [divineForeknowledgeAdvantageIndicator]])
  ) as SkillIndicatorMap;
}

export function getKnowledgeDomainSavingThrowIndicators(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): SavingThrowIndicatorMap {
  if (!hasActiveDivineForeknowledge(character)) {
    return {};
  }

  return {
    STR: [divineForeknowledgeAdvantageIndicator],
    DEX: [divineForeknowledgeAdvantageIndicator],
    CON: [divineForeknowledgeAdvantageIndicator],
    INT: [divineForeknowledgeAdvantageIndicator],
    WIS: [divineForeknowledgeAdvantageIndicator],
    CHA: [divineForeknowledgeAdvantageIndicator]
  };
}

export function getKnowledgeDomainAbilityCheckIndicators(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): AbilityCheckIndicatorMap {
  if (!hasActiveDivineForeknowledge(character)) {
    return {};
  }

  return {
    STR: [divineForeknowledgeAdvantageIndicator],
    DEX: [divineForeknowledgeAdvantageIndicator],
    CON: [divineForeknowledgeAdvantageIndicator],
    INT: [divineForeknowledgeAdvantageIndicator],
    WIS: [divineForeknowledgeAdvantageIndicator],
    CHA: [divineForeknowledgeAdvantageIndicator]
  };
}

export function getKnowledgeDomainCoreStatIndicators(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): CoreStatIndicatorMap {
  if (!hasActiveDivineForeknowledge(character)) {
    return {};
  }

  return {
    initiative: [divineForeknowledgeAdvantageIndicator]
  };
}

export function restoreClericDivineForeknowledgeOnLongRest(character: Character): Character {
  if (!hasClericKnowledgeDomainDivineForeknowledgeFeature(character)) {
    return character;
  }

  const clericState = normalizeKnowledgeDomainClericFeatureState(
    character.classFeatureState?.cleric,
    character
  );

  if ((clericState.divineForeknowledgeUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        divineForeknowledgeUsesExpended: 0
      }
    }
  };
}

export const getClericKnowledgeDomainDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (!hasClericKnowledgeDomainFeature(character, 3)) {
    return {};
  }

  return {
    featureActions: getKnowledgeDomainFeatureActions(character),
    skillProficiencyEntries: getKnowledgeDomainSkillProficiencyEntries(character),
    toolProficiencyEntries: getKnowledgeDomainToolProficiencyEntries(character),
    savingThrowProficiencyEntries: getKnowledgeDomainSavingThrowProficiencyEntries(character),
    skillIndicators: getKnowledgeDomainSkillIndicators(character),
    savingThrowIndicators: getKnowledgeDomainSavingThrowIndicators(character),
    abilityCheckIndicators: getKnowledgeDomainAbilityCheckIndicators(character),
    coreStatIndicators: getKnowledgeDomainCoreStatIndicators(character),
    alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
      character.level ?? 0,
      knowledgeDomainSpellIdsByLevel
    )
  };
};
