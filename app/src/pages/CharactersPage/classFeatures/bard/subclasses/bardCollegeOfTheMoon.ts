import { getSpellEntriesForSpellListClasses } from "../../../../../codex/classes";
import {
  CLASS_FEATURE,
  SPELL_LIST_CLASS,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import {
  blessingOfMoonlightDescription,
  inspiredEclipseDescription,
  shadowOfTheNewMoonDescription
} from "../../../../../codex/subclasses/bard";
import { getAbilityModifierForCharacter } from "../../../abilities";
import type {
  Character,
  CharacterBardFeatureState,
  LanguageProficiencyEntry,
  SkillName,
  SkillProficiencyEntry
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
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
import {
  appendSourcedDescriptionAddition,
  appendUniqueDescriptionAddition
} from "../../../actionModalDescriptions";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../statusEntries";
import { createDefaultFeatureActionDescription } from "../../subclassRuntime";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type {
  FeatureActionCard,
  FeatureLanguageProficiencyEntry,
  FeatureSkillProficiencyEntry
} from "../../types";

export const collegeOfTheMoonSubclassId = "bard-college-of-the-moon";
export const lunarVitalityActionKey = "bard-college-of-the-moon-lunar-vitality";

const moonbeamSpellId = "spell-moonbeam";
const inspiredEclipseStatusSourceId = "feature-bard-inspired-eclipse";
const inspiredEclipseInvisibleStatusSourceId = "feature-bard-inspired-eclipse-invisible";
const bardPrimalLoreSourceLabel = "College of the Moon: Primal Lore";
const bardicInspirationActionKey = "bard-bardic-inspiration";
const lunarVitalitySourceHeading = "Lunar Vitality.";
const vibranceOfTheFullMoonSourceHeading = "Vibrance of the Full Moon.";
const eventidesSplendorVibranceSourceLabel = "Eventide's Splendor / Vibrance of the Full Moon";
const primalLoreSkillOptions = [
  "Animal Handling",
  "Insight",
  "Medicine",
  "Nature",
  "Perception",
  "Survival"
] as const satisfies readonly SkillName[];

type BardMoonCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      "abilities" | "classFeatureState" | "feats" | "level" | "statusEntries" | "subclassId"
    >
  >;

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

function extractFeatureDescriptionSection(
  description: readonly string[],
  heading: string,
  options?: {
    stripHeading?: boolean;
  }
): SpellDescriptionEntry[] {
  const startIndex = description.findIndex((entry) => entry.includes(heading));

  if (startIndex < 0) {
    return [];
  }

  const section: SpellDescriptionEntry[] = [];
  const headingMarker = `<strong>${heading}</strong>`;

  for (let index = startIndex; index < description.length; index += 1) {
    const entry = description[index]!;

    if (index > startIndex && entry.startsWith("<strong>")) {
      break;
    }

    if (options?.stripHeading && index === startIndex && entry.includes(headingMarker)) {
      const strippedEntry = entry.replace(headingMarker, "").trim();

      if (strippedEntry.length > 0) {
        section.push(strippedEntry);
      }

      continue;
    }

    section.push(entry);
  }

  return section;
}

function getMoonFeatureDescriptionStrings(
  character: Partial<Pick<Character, "className" | "level" | "subclassId">>,
  feature: CLASS_FEATURE
): string[] {
  return getFeatureDescriptionForCharacter(character, feature).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

function getLunarVitalityDescription(
  character: Partial<Pick<Character, "className" | "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return extractFeatureDescriptionSection(
    getMoonFeatureDescriptionStrings(character, CLASS_FEATURE.MOONS_INSPIRATION),
    lunarVitalitySourceHeading,
    { stripHeading: true }
  );
}

function getVibranceOfTheFullMoonDescription(
  character: Partial<Pick<Character, "className" | "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return extractFeatureDescriptionSection(
    getMoonFeatureDescriptionStrings(character, CLASS_FEATURE.EVENTIDES_SPLENDOR),
    vibranceOfTheFullMoonSourceHeading,
    { stripHeading: true }
  );
}

function getMoonBardicInspirationBaseUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "feats" | "level">>
): number {
  if (character.className !== "Bard" || !character.abilities) {
    return 0;
  }

  return Math.max(
    1,
    getAbilityModifierForCharacter(
      {
        abilities: character.abilities,
        classFeatureState: character.classFeatureState,
        className: character.className,
        feats: character.feats ?? [],
        level: character.level ?? 1
      },
      "CHA"
    )
  );
}

function getMoonBardicInspirationUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "feats" | "level">>
): number {
  const baseTotal = getMoonBardicInspirationBaseUsesTotal(character);
  const bardState = character.classFeatureState?.bard;

  return Math.max(baseTotal, bardState?.bardicInspirationTemporaryTotal ?? 0);
}

function getMoonBardicInspirationUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "feats" | "level">>
): number {
  const totalUses = getMoonBardicInspirationUsesTotal(character);

  return Math.max(
    0,
    totalUses - (character.classFeatureState?.bard?.bardicInspirationUsesExpended ?? 0)
  );
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
  | "blessingOfMoonlightUsesExpended"
  | "lunarVitalityUsedThisTurn"
  | "primalLoreCantripId"
  | "primalLoreSkill"
> {
  const blessingOfMoonlightUsesExpended = Number(value.blessingOfMoonlightUsesExpended);
  const hasBlessingOfMoonlight = hasBardCollegeOfTheMoonBlessingOfMoonlightFeature(character);
  const hasMoonsInspiration = hasCollegeOfTheMoonMoonsInspiration(character);
  const hasPrimalLore = hasBardCollegeOfTheMoonPrimalLoreFeature(character);

  return {
    blessingOfMoonlightUsesExpended:
      hasBlessingOfMoonlight && Number.isFinite(blessingOfMoonlightUsesExpended)
        ? Math.max(0, Math.floor(blessingOfMoonlightUsesExpended))
        : hasBlessingOfMoonlight
          ? 0
          : undefined,
    lunarVitalityUsedThisTurn: hasMoonsInspiration
      ? value.lunarVitalityUsedThisTurn === true
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

export function shouldAdvanceBardCollegeOfTheMoonFeaturesForNewRound(
  character: BardMoonCharacter
): boolean {
  return Boolean(
    hasCollegeOfTheMoonMoonsInspiration(character) &&
      character.classFeatureState?.bard?.lunarVitalityUsedThisTurn
  );
}

export function clearBardCollegeOfTheMoonTurnState(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  if (!bardState.lunarVitalityUsedThisTurn) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        lunarVitalityUsedThisTurn: false
      }
    }
  };
}

export function activateBardCollegeOfTheMoonLunarVitality(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  if (!hasCollegeOfTheMoonMoonsInspiration(character) || bardState.lunarVitalityUsedThisTurn) {
    return character;
  }

  if (getMoonBardicInspirationUsesRemaining(character) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        bardicInspirationUsesExpended:
          Math.max(0, bardState.bardicInspirationUsesExpended ?? 0) + 1,
        lunarVitalityUsedThisTurn: true
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

  const extraDescriptionEntries = includeShadowOfTheNewMoon
    ? [...inspiredEclipseDescription, ...shadowOfTheNewMoonDescription]
    : [...inspiredEclipseDescription];

  return appendUniqueDescriptionAddition(
    {
      ...action,
      description: action.description?.length
        ? [...action.description]
        : createDefaultFeatureActionDescription(action)
    },
    extraDescriptionEntries
  );
}

function appendBlessingOfMoonlightDescription(spell: SpellEntry): SpellEntry {
  if (spell.id !== moonbeamSpellId) {
    return spell;
  }

  return appendSourcedDescriptionAddition(
    spell,
    "Blessing of Moonlight",
    blessingOfMoonlightDescription
  );
}

function getBardCollegeOfTheMoonLunarVitalityAction(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureActionCard | null {
  if (!hasCollegeOfTheMoonMoonsInspiration(character)) {
    return null;
  }

  const usesRemaining = getMoonBardicInspirationUsesRemaining(character);
  const usesTotal = getMoonBardicInspirationUsesTotal(character);
  const usedThisTurn = character.classFeatureState?.bard?.lunarVitalityUsedThisTurn === true;
  const disabledReason = usedThisTurn
    ? "Lunar Vitality is limited to once per turn."
    : usesRemaining <= 0
      ? "No Bardic Inspiration uses remaining."
      : undefined;

  let action: FeatureActionCard = {
    key: lunarVitalityActionKey,
    name: "Lunar Vitality",
    sourceFeature: CLASS_FEATURE.MOONS_INSPIRATION,
    summary: "Empower spell healing with lunar magic.",
    detail: "Use when one of your spells restores Hit Points to a creature.",
    breakdown: "Once per turn on heal",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal,
    hideUsesTrackerOnCard: true,
    usesInlineLabel: "Use 1",
    usesInlineIcon: "music",
    description: getLunarVitalityDescription(character),
    drawer: {
      kind: "confirm",
      eyebrow: "College of the Moon",
      resources: [
        {
          kind: "text",
          label: "Use",
          value: "1",
          icon: "music"
        }
      ]
    },
    execute: {
      kind: "activate"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };

  if (hasCollegeOfTheMoonEventidesSplendor(character)) {
    const vibranceDescription = getVibranceOfTheFullMoonDescription(character);

    if (vibranceDescription.length > 0) {
      action = appendSourcedDescriptionAddition(
        action,
        eventidesSplendorVibranceSourceLabel,
        vibranceDescription
      );
    }
  }

  return action;
}

export const getBardCollegeOfTheMoonDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  const lunarVitalityAction = getBardCollegeOfTheMoonLunarVitalityAction(character);

  return {
    featureActions: lunarVitalityAction ? [lunarVitalityAction] : [],
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
  };
};
