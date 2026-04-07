import { getSpellEntriesForSpellListClasses } from "../../../../../codex/classes";
import { SPELL_LIST_CLASS, type SpellEntry } from "../../../../../codex/entries";
import {
  blessingOfMoonlightDescription,
  inspiredEclipseDescription,
  shadowOfTheNewMoonDescription
} from "../../../../../codex/subclasses/bard";
import type {
  Character,
  CharacterBardFeatureState,
  LanguageProficiencyEntry,
  SkillName,
  SkillProficiencyEntry
} from "../../../../../types";
import {
  CONDITION_NAME,
  LANGUAGE_PROFICIENCY,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  getSkillProficiencyForSkillName
} from "../../../../../types";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../traits";
import { createDefaultFeatureActionDescription } from "../../subclassRuntime";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type {
  FeatureActionCard,
  FeatureLanguageProficiencyEntry,
  FeatureSkillProficiencyEntry
} from "../../types";

export const collegeOfTheMoonSubclassId = "bard-college-of-the-moon";

const moonbeamSpellId = "spell-moonbeam";
const inspiredEclipseStatusSourceId = "feature-bard-inspired-eclipse";
const inspiredEclipseInvisibleStatusSourceId = "feature-bard-inspired-eclipse-invisible";
const bardPrimalLoreSourceLabel = "College of the Moon: Primal Lore";
const bardicInspirationActionKey = "bard-bardic-inspiration";
const primalLoreSkillOptions = [
  "Animal Handling",
  "Insight",
  "Medicine",
  "Nature",
  "Perception",
  "Survival"
] as const satisfies readonly SkillName[];

type BardMoonCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "classFeatureState" | "statusEntries">>;

function isPrimalLoreSkill(value: unknown): value is (typeof primalLoreSkillOptions)[number] {
  return primalLoreSkillOptions.some((skill) => skill === value);
}

function hasCollegeOfTheMoonMoonsInspiration(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasCollegeOfTheMoonBlessingOfMoonlight(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasCollegeOfTheMoonEventidesSplendor(
  character: Parameters<SubclassRuntimeResolver>[0]
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 14
  );
}

export function hasBardCollegeOfTheMoonPrimalLoreFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasCollegeOfTheMoonMoonsInspiration(character);
}

export function hasBardCollegeOfTheMoonBlessingOfMoonlightFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasCollegeOfTheMoonBlessingOfMoonlight(character);
}

export function normalizeBardCollegeOfTheMoonPrimalLoreCantripId(
  value: unknown
): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export function normalizeBardCollegeOfTheMoonPrimalLoreSkill(
  value: unknown
): SkillName | undefined {
  return typeof value === "string" && isPrimalLoreSkill(value) ? (value as SkillName) : undefined;
}

export function normalizeBardCollegeOfTheMoonFeatureState(
  value: Partial<CharacterBardFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<
  CharacterBardFeatureState,
  "blessingOfMoonlightUsesExpended" | "primalLoreCantripId" | "primalLoreSkill"
> {
  const blessingOfMoonlightUsesExpended = Number(value.blessingOfMoonlightUsesExpended);
  const hasBlessingOfMoonlight = hasBardCollegeOfTheMoonBlessingOfMoonlightFeature(character);
  const hasPrimalLore = hasBardCollegeOfTheMoonPrimalLoreFeature(character);

  return {
    blessingOfMoonlightUsesExpended:
      hasBlessingOfMoonlight && Number.isFinite(blessingOfMoonlightUsesExpended)
        ? Math.max(0, Math.floor(blessingOfMoonlightUsesExpended))
        : hasBlessingOfMoonlight
          ? 0
          : undefined,
    primalLoreCantripId: hasPrimalLore
      ? normalizeBardCollegeOfTheMoonPrimalLoreCantripId(value.primalLoreCantripId)
      : undefined,
    primalLoreSkill: hasPrimalLore
      ? normalizeBardCollegeOfTheMoonPrimalLoreSkill(value.primalLoreSkill)
      : undefined
  };
}

export function getBardCollegeOfTheMoonPrimalLoreCantripOptions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): SpellEntry[] {
  if (!hasBardCollegeOfTheMoonPrimalLoreFeature(character)) {
    return [];
  }

  return getSpellEntriesForSpellListClasses([SPELL_LIST_CLASS.DRUID]).filter(
    (spell) => spell.spellLevel === 0
  );
}

export function getBardCollegeOfTheMoonPrimalLoreCantripId(
  character: BardMoonCharacter
): string | null {
  if (!hasBardCollegeOfTheMoonPrimalLoreFeature(character)) {
    return null;
  }

  const availableSpellIds = new Set(
    getBardCollegeOfTheMoonPrimalLoreCantripOptions({
      className: character.className,
      level: character.level ?? 0,
      subclassId: character.subclassId
    }).map((spell) => spell.id)
  );
  const selectedSpellId = character.classFeatureState?.bard?.primalLoreCantripId;

  return selectedSpellId && availableSpellIds.has(selectedSpellId) ? selectedSpellId : null;
}

export function getBardCollegeOfTheMoonPrimalLoreSkillOptions(): SkillName[] {
  return [...primalLoreSkillOptions];
}

export function getBardCollegeOfTheMoonPrimalLoreSkillSelection(
  character: BardMoonCharacter
): SkillName | null {
  if (!hasBardCollegeOfTheMoonPrimalLoreFeature(character)) {
    return null;
  }

  return character.classFeatureState?.bard?.primalLoreSkill ?? null;
}

export function setBardCollegeOfTheMoonPrimalLoreCantripId(
  character: Character,
  bardState: CharacterBardFeatureState,
  spellId: string | null
): Character {
  if (!hasBardCollegeOfTheMoonPrimalLoreFeature(character)) {
    return character;
  }

  const availableSpellIds = new Set(
    getBardCollegeOfTheMoonPrimalLoreCantripOptions(character).map((spell) => spell.id)
  );
  const nextSpellId =
    typeof spellId === "string" && availableSpellIds.has(spellId) ? spellId : undefined;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        primalLoreCantripId: nextSpellId
      }
    }
  };
}

export function setBardCollegeOfTheMoonPrimalLoreSkillSelection(
  character: Character,
  bardState: CharacterBardFeatureState,
  skill: SkillName | null
): Character {
  if (!hasBardCollegeOfTheMoonPrimalLoreFeature(character)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        primalLoreSkill: skill && isPrimalLoreSkill(skill) ? skill : undefined
      }
    }
  };
}

function createBardCollegeOfTheMoonPrimalLoreSkillEntry(
  skill: SkillName
): SkillProficiencyEntry | null {
  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: bardPrimalLoreSourceLabel,
    proficiency: getSkillProficiencyForSkillName(skill),
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  };
}

export function getBardCollegeOfTheMoonSkillProficiencyEntries(
  character: BardMoonCharacter
): FeatureSkillProficiencyEntry[] {
  if (!hasBardCollegeOfTheMoonPrimalLoreFeature(character)) {
    return [];
  }

  return [getBardCollegeOfTheMoonPrimalLoreSkillSelection(character)]
    .filter((skill): skill is SkillName => skill !== null)
    .map((skill) => createBardCollegeOfTheMoonPrimalLoreSkillEntry(skill))
    .filter((entry): entry is SkillProficiencyEntry => entry !== null);
}

export function getBardCollegeOfTheMoonLanguageProficiencyEntries(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureLanguageProficiencyEntry[] {
  if (!hasBardCollegeOfTheMoonPrimalLoreFeature(character)) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: bardPrimalLoreSourceLabel,
      proficiency: LANGUAGE_PROFICIENCY.DRUIDIC,
      proficiencyLevel: PROF_LEVEL.PROFICIENT
    } satisfies LanguageProficiencyEntry
  ];
}

export function getBardCollegeOfTheMoonAlwaysPreparedSpellIds(
  character: BardMoonCharacter
): string[] {
  const primalLoreCantripId = getBardCollegeOfTheMoonPrimalLoreCantripId(character);

  return primalLoreCantripId ? [primalLoreCantripId] : [];
}

export function getBardCollegeOfTheMoonBlessingOfMoonlightUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasBardCollegeOfTheMoonBlessingOfMoonlightFeature(character) ? 1 : 0;
}

export function getBardCollegeOfTheMoonBlessingOfMoonlightUsesRemaining(
  character: BardMoonCharacter
): number {
  const totalUses = getBardCollegeOfTheMoonBlessingOfMoonlightUsesTotal(character);
  const bardState = character.classFeatureState?.bard;

  return Math.max(0, totalUses - (bardState?.blessingOfMoonlightUsesExpended ?? 0));
}

export function consumeBardCollegeOfTheMoonBlessingOfMoonlightUse(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  const totalUses = getBardCollegeOfTheMoonBlessingOfMoonlightUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  const currentExpended = Math.max(0, bardState.blessingOfMoonlightUsesExpended ?? 0);

  if (currentExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        blessingOfMoonlightUsesExpended: currentExpended + 1
      }
    }
  };
}

export function restoreBardCollegeOfTheMoonBlessingOfMoonlightOnLongRest(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  const totalUses = getBardCollegeOfTheMoonBlessingOfMoonlightUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  if ((bardState.blessingOfMoonlightUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        blessingOfMoonlightUsesExpended: 0
      }
    }
  };
}

export function applyBardCollegeOfTheMoonInspiredEclipseStatus(character: Character): Character {
  if (!hasCollegeOfTheMoonMoonsInspiration(character)) {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) =>
      entry.sourceId !== inspiredEclipseStatusSourceId &&
      entry.sourceId !== inspiredEclipseInvisibleStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Inspired Eclipse",
        source: "College of the Moon",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 1,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
        },
        sourceId: inspiredEclipseStatusSourceId
      }),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.CONDITIONS,
        value: CONDITION_NAME.INVISIBLE,
        source: "Inspired Eclipse",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: "Inspired Eclipse"
        },
        sourceId: inspiredEclipseInvisibleStatusSourceId
      })
    ]
  };
}

function appendInspiredEclipseDescription(
  action: FeatureActionCard,
  includeShadowOfTheNewMoon = false
): FeatureActionCard {
  if (action.key !== bardicInspirationActionKey) {
    return action;
  }

  const description = action.description?.length
    ? [...action.description]
    : createDefaultFeatureActionDescription(action);
  const extraDescriptionEntries = includeShadowOfTheNewMoon
    ? [...inspiredEclipseDescription, ...shadowOfTheNewMoonDescription]
    : [...inspiredEclipseDescription];

  if (
    description.some(
      (entry) =>
        typeof entry === "string" &&
        extraDescriptionEntries.some((descriptionEntry) => descriptionEntry === entry)
    )
  ) {
    const missingEntries = extraDescriptionEntries.filter(
      (descriptionEntry) =>
        !description.some((entry) => typeof entry === "string" && entry === descriptionEntry)
    );

    return missingEntries.length > 0
      ? {
          ...action,
          description: [...description, ...missingEntries]
        }
      : action;
  }

  return {
    ...action,
    description: [...description, ...extraDescriptionEntries]
  };
}

function appendBlessingOfMoonlightDescription(spell: SpellEntry): SpellEntry {
  if (spell.id !== moonbeamSpellId) {
    return spell;
  }

  const hasBlessingDescription = spell.description.some(
    (entry) =>
      typeof entry === "string" &&
      blessingOfMoonlightDescription.some((descriptionEntry: string) => descriptionEntry === entry)
  );

  if (hasBlessingDescription) {
    return spell;
  }

  return {
    ...spell,
    description: [...spell.description, ...blessingOfMoonlightDescription]
  };
}

export const getBardCollegeOfTheMoonDerivedFeatureState: SubclassRuntimeResolver = (character) => ({
  transformFeatureAction: hasCollegeOfTheMoonMoonsInspiration(character)
    ? (action) =>
        appendInspiredEclipseDescription(action, hasCollegeOfTheMoonEventidesSplendor(character))
    : undefined,
  alwaysPreparedSpellIds:
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 6
      ? [moonbeamSpellId]
      : [],
  transformSpellEntry: hasCollegeOfTheMoonBlessingOfMoonlight(character)
    ? appendBlessingOfMoonlightDescription
    : undefined
});
