import { bardFeatures } from "../../../codex/classes";
import { getReactionEntryById, CLASS_FEATURE, type DICE, type ReactionEntry } from "../../../codex/entries";
import type { BardFeatureClassObj } from "../../../types";
import type { Character, CharacterBardFeatureState, SkillName, SkillProficiencyEntry } from "../../../types";
import {
  EFFECT_NAME,
  getSkillProficiencyForSkillName,
  isSkillName,
  PROFICIENCY_OVERRIDE_POLICY,
  PROF_LEVEL,
  PROFICIENCY_SOURCE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../types";
import { getFeatAbilityScoreBonusesForCharacter } from "../feats";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../spellcasting";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../traits";
import type {
  FeatureActionCard,
  FeatureActionResource,
  FeatureSkillBonus,
  FeatureSkillProficiencyEntry
} from "./types";

const bardicInspirationActionKey = "bard-bardic-inspiration";
const mantleOfInspirationActionKey = "bard-mantle-of-inspiration";
const mantleOfMajestyActionKey = "bard-mantle-of-majesty";
const collegeOfGlamourSubclassId = "bard-college-of-glamour";
const mantleOfMajestyStatusSourceId = "feature-bard-mantle-of-majesty";
const mantleOfMajestyConcentrationSourceId = "feature-bard-mantle-of-majesty-concentration";
const wordsOfCreationAlwaysPreparedSpellIds = [
  "spell-power-word-heal",
  "spell-power-word-kill"
] as const;
const bardExpertiseLevel2SourceLabel = "Level 2: Expertise";
const bardExpertiseLevel9SourceLabel = "Level 9: Expertise";
const bardExpertiseLevel2SourceKey = "bard-expertise-level-2";
const bardExpertiseLevel9SourceKey = "bard-expertise-level-9";
const bardSourceMetadataSeparator = "::";
type BardExpertiseTier = "level2" | "level9";

function getBardFeatureRow(level: number): BardFeatureClassObj | null {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = bardFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedBardFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return bardFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function hasBardFeature(character: Pick<Character, "className" | "level">, feature: CLASS_FEATURE) {
  if (character.className !== "Bard") {
    return false;
  }

  return getUnlockedBardFeatures(character.level).has(feature);
}

function hasBardLevel2Expertise(character: Pick<Character, "className" | "level">): boolean {
  return character.className === "Bard" && character.level >= 2;
}

function hasBardLevel9Expertise(character: Pick<Character, "className" | "level">): boolean {
  return character.className === "Bard" && character.level >= 9;
}

function hasBeguilingMagicFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasMantleOfInspirationFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasMantleOfMajestyFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function normalizeBardExpertiseSelections(value: unknown): SkillName[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((entry): entry is SkillName => typeof entry === "string" && isSkillName(entry)))]
    .slice(0, 2);
}

function createBardExpertiseSourceStr(sourceLabel: string, sourceKey: string): string {
  return `${sourceLabel}${bardSourceMetadataSeparator}${sourceKey}`;
}

function createBardExpertiseEntry(
  skill: SkillName,
  sourceLabel: string,
  sourceKey: string
): SkillProficiencyEntry | null {
  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: createBardExpertiseSourceStr(sourceLabel, sourceKey),
    proficiency: getSkillProficiencyForSkillName(skill),
    proficiencyLevel: PROF_LEVEL.EXPERT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  };
}

function getAppliedAbilityScoreBonus(
  currentScore: number,
  value: number,
  maxScore?: number | null
): number {
  const normalizedValue = Math.floor(value);

  if (!Number.isFinite(normalizedValue) || normalizedValue === 0) {
    return 0;
  }

  if (maxScore === null || maxScore === undefined) {
    return normalizedValue;
  }

  if (normalizedValue > 0) {
    return Math.max(0, Math.min(normalizedValue, maxScore - currentScore));
  }

  return normalizedValue;
}

function getBardCharismaModifier(
  character: Pick<Character, "abilities" | "level" | "feats">
): number {
  let total = Math.max(1, Math.floor(character.abilities.CHA));

  getFeatAbilityScoreBonusesForCharacter(character)
    .filter((bonus) => bonus.ability === "CHA")
    .sort((left, right) => {
      const leftHasCap = left.maxScore !== null && left.maxScore !== undefined;
      const rightHasCap = right.maxScore !== null && right.maxScore !== undefined;

      if (leftHasCap !== rightHasCap) {
        return leftHasCap ? -1 : 1;
      }

      if (leftHasCap && rightHasCap && left.maxScore !== right.maxScore) {
        return (
          (left.maxScore ?? Number.POSITIVE_INFINITY) -
          (right.maxScore ?? Number.POSITIVE_INFINITY)
        );
      }

      return (left.order ?? 0) - (right.order ?? 0);
    })
    .forEach((bonus) => {
      total += getAppliedAbilityScoreBonus(total, bonus.value, bonus.maxScore);
    });

  return Math.floor((total - 10) / 2);
}

function hasSuperiorInspiration(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasBardFeature(character, CLASS_FEATURE.SUPERIOR_INSPIRATION);
}

function hasFontOfInspiration(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasBardFeature(character, CLASS_FEATURE.FONT_OF_INSPIRATION);
}

function getBardicInspirationBaseUsesTotal(
  character: Pick<Character, "className" | "level" | "abilities" | "classFeatureState" | "feats">
): number {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return 0;
  }

  return Math.max(1, getBardCharismaModifier(character));
}

export function normalizeBardFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): CharacterBardFeatureState {
  const hasBardicInspiration = hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION);
  const hasLevel2Expertise = hasBardLevel2Expertise(character);
  const hasLevel9Expertise = hasBardLevel9Expertise(character);
  const hasBeguilingMagic = hasBeguilingMagicFeature(character);
  const hasMantleOfMajesty = hasMantleOfMajestyFeature(character);

  if (
    !hasBardicInspiration &&
    !hasLevel2Expertise &&
    !hasLevel9Expertise &&
    !hasBeguilingMagic &&
    !hasMantleOfMajesty
  ) {
    return {};
  }

  const record = value && typeof value === "object" ? (value as Partial<CharacterBardFeatureState>) : {};
  const usesExpended = Number(record.bardicInspirationUsesExpended);
  const temporaryTotal = Number(record.bardicInspirationTemporaryTotal);
  const beguilingMagicUsesExpended = Number(record.beguilingMagicUsesExpended);
  const mantleOfMajestyUsesExpended = Number(record.mantleOfMajestyUsesExpended);
  const expertiseRecord =
    record.expertise && typeof record.expertise === "object" ? record.expertise : undefined;

  return {
    bardicInspirationUsesExpended: hasBardicInspiration
      ? Number.isFinite(usesExpended)
        ? Math.max(0, Math.floor(usesExpended))
        : 0
      : undefined,
    bardicInspirationTemporaryTotal: hasBardicInspiration && Number.isFinite(temporaryTotal)
      ? Math.max(0, Math.floor(temporaryTotal))
      : undefined,
    beguilingMagicUsesExpended:
      hasBeguilingMagic && Number.isFinite(beguilingMagicUsesExpended)
        ? Math.max(0, Math.floor(beguilingMagicUsesExpended))
        : hasBeguilingMagic
          ? 0
          : undefined,
    mantleOfMajestyUsesExpended:
      hasMantleOfMajesty && Number.isFinite(mantleOfMajestyUsesExpended)
        ? Math.max(0, Math.floor(mantleOfMajestyUsesExpended))
        : hasMantleOfMajesty
          ? 0
          : undefined,
    expertise:
      hasLevel2Expertise || hasLevel9Expertise
        ? {
            level2: hasLevel2Expertise
              ? normalizeBardExpertiseSelections(expertiseRecord?.level2)
              : undefined,
            level9: hasLevel9Expertise
              ? normalizeBardExpertiseSelections(expertiseRecord?.level9)
              : undefined
          }
        : undefined
  };
}

export function getBardFeatureState(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "feats" | "subclassId">>
): CharacterBardFeatureState {
  return normalizeBardFeatureState(character.classFeatureState?.bard, character);
}

export function getBardExpertiseSelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  tier: BardExpertiseTier
): SkillName[] {
  const bardState = normalizeBardFeatureState(character.classFeatureState?.bard, character);

  if (tier === "level9") {
    return bardState.expertise?.level9 ?? [];
  }

  return bardState.expertise?.level2 ?? [];
}

export function setBardExpertiseSelections(
  character: Character,
  tier: BardExpertiseTier,
  selections: SkillName[]
): Character {
  const bardState = getBardFeatureState(character);
  const normalizedSelections = normalizeBardExpertiseSelections(selections);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        expertise: {
          ...bardState.expertise,
          [tier]: normalizedSelections
        }
      }
    }
  };
}

export function getBardSkillProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSkillProficiencyEntry[] {
  if (!hasBardLevel2Expertise(character)) {
    return [];
  }

  const level2Entries = getBardExpertiseSelections(character, "level2")
    .map((skill) =>
      createBardExpertiseEntry(skill, bardExpertiseLevel2SourceLabel, bardExpertiseLevel2SourceKey)
    )
    .filter((entry): entry is SkillProficiencyEntry => entry !== null);
  const level9Entries = hasBardLevel9Expertise(character)
    ? getBardExpertiseSelections(character, "level9")
        .map((skill) =>
          createBardExpertiseEntry(
            skill,
            bardExpertiseLevel9SourceLabel,
            bardExpertiseLevel9SourceKey
          )
        )
        .filter((entry): entry is SkillProficiencyEntry => entry !== null)
    : [];

  return [...level2Entries, ...level9Entries];
}

export function getBardAlwaysPreparedSpellIds(
  character: Pick<Character, "className" | "level">
): string[] {
  if (!hasBardFeature(character, CLASS_FEATURE.WORDS_OF_CREATION)) {
    return [];
  }

  return [...wordsOfCreationAlwaysPreparedSpellIds];
}

export function getBeguilingMagicUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return hasBeguilingMagicFeature(character) ? 1 : 0;
}

export function getBeguilingMagicUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  const totalUses = getBeguilingMagicUsesTotal(character);
  const bardState = getBardFeatureState(character);

  return Math.max(0, totalUses - (bardState.beguilingMagicUsesExpended ?? 0));
}

export function consumeBeguilingMagicUse(character: Character): Character {
  const totalUses = getBeguilingMagicUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  const bardState = getBardFeatureState(character);
  const currentExpended = Math.max(0, bardState.beguilingMagicUsesExpended ?? 0);

  if (currentExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        beguilingMagicUsesExpended: currentExpended + 1
      }
    }
  };
}

export function restoreBeguilingMagicOnLongRest(character: Character): Character {
  const totalUses = getBeguilingMagicUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  const bardState = getBardFeatureState(character);

  if ((bardState.beguilingMagicUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        beguilingMagicUsesExpended: 0
      }
    }
  };
}

export function consumeBeguilingMagicOrBardicInspiration(character: Character): Character {
  if (getBeguilingMagicUsesTotal(character) <= 0) {
    return character;
  }

  if (getBeguilingMagicUsesRemaining(character) > 0) {
    return consumeBeguilingMagicUse(character);
  }

  return expendBardicInspirationUse(character);
}

export function getMantleOfMajestyUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return hasMantleOfMajestyFeature(character) ? 1 : 0;
}

export function getMantleOfMajestyUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  const totalUses = getMantleOfMajestyUsesTotal(character);
  const bardState = getBardFeatureState(character);

  return Math.max(0, totalUses - (bardState.mantleOfMajestyUsesExpended ?? 0));
}

export function getMantleOfMajestyFallbackSlotLevel(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): number | null {
  const totals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const expended = normalizeSpellSlotsExpended(character.spellSlotsExpended, totals);

  for (let slotLevel = 3; slotLevel <= 9; slotLevel += 1) {
    const remainingSlots = Math.max(
      0,
      (totals[slotLevel - 1] ?? 0) - (expended[slotLevel - 1] ?? 0)
    );

    if (remainingSlots > 0) {
      return slotLevel;
    }
  }

  return null;
}

export function getMantleOfMajestyFallbackSlotSummary(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): { total: number; remaining: number } {
  const totals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const expended = normalizeSpellSlotsExpended(character.spellSlotsExpended, totals);

  return totals.reduce(
    (summary, total, index) => {
      const slotLevel = index + 1;

      if (slotLevel < 3) {
        return summary;
      }

      return {
        total: summary.total + total,
        remaining: summary.remaining + Math.max(0, total - (expended[index] ?? 0))
      };
    },
    { total: 0, remaining: 0 }
  );
}

export function consumeMantleOfMajestyUse(character: Character): Character {
  if (!hasMantleOfMajestyFeature(character) || getMantleOfMajestyUsesRemaining(character) <= 0) {
    return character;
  }

  const bardState = getBardFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        mantleOfMajestyUsesExpended: (bardState.mantleOfMajestyUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restoreMantleOfMajestyOnLongRest(character: Character): Character {
  if (getMantleOfMajestyUsesTotal(character) <= 0) {
    return character;
  }

  const bardState = getBardFeatureState(character);

  if ((bardState.mantleOfMajestyUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        mantleOfMajestyUsesExpended: 0
      }
    }
  };
}

export function hasActiveMantleOfMajesty(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId" | "statusEntries">>
): boolean {
  if (character.className !== "Bard" || character.subclassId !== collegeOfGlamourSubclassId) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.value === "Mantle of Majesty" &&
      entry.sourceId === mantleOfMajestyStatusSourceId
  );
}

export function applyMantleOfMajestyStatus(character: Character): Character {
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) =>
      !(
        (entry.group === STATUS_ENTRY_GROUP.EFFECTS && entry.value === EFFECT_NAME.CONCENTRATION) ||
        (entry.duration.kind === STATUS_DURATION_KIND.LINKED &&
          entry.duration.linkedGroup === STATUS_ENTRY_GROUP.EFFECTS &&
          entry.duration.linkedValue === EFFECT_NAME.CONCENTRATION) ||
        entry.sourceId === mantleOfMajestyStatusSourceId ||
        entry.sourceId === mantleOfMajestyConcentrationSourceId
      )
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: EFFECT_NAME.CONCENTRATION,
        source: "Mantle of Majesty",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 1
        },
        sourceId: mantleOfMajestyConcentrationSourceId
      }),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Mantle of Majesty",
        source: "College of Glamour",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.CONCENTRATION
        },
        sourceId: mantleOfMajestyStatusSourceId
      })
    ]
  };
}

export function getBardReactionEntries(
  character: Pick<Character, "className" | "level">
): ReactionEntry[] {
  if (!hasBardFeature(character, CLASS_FEATURE.COUNTERCHARM)) {
    return [];
  }

  const countercharm = getReactionEntryById("reaction-countercharm");

  return countercharm ? [countercharm] : [];
}

export function getBardSkillBonuses(
  character: Pick<Character, "className" | "level">,
  proficiencyLevel: PROF_LEVEL
): FeatureSkillBonus[] {
  if (!hasBardFeature(character, CLASS_FEATURE.JACK_OF_ALL_TRADES)) {
    return [];
  }

  if (proficiencyLevel !== PROF_LEVEL.NONE) {
    return [];
  }

  return [
    {
      label: "Jack of All Trades",
      value: Math.floor((Math.floor((Math.max(1, Math.min(20, character.level)) - 1) / 4) + 2) / 2)
    }
  ];
}

export function getBardicInspirationDie(
  character: Pick<Character, "className" | "level">
): DICE | null {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return null;
  }

  return getBardFeatureRow(character.level)?.bardicDie ?? null;
}

export function getBardicInspirationUsesTotal(
  character: Pick<Character, "className" | "level" | "abilities" | "classFeatureState" | "feats">
): number {
  const baseTotal = getBardicInspirationBaseUsesTotal(character);
  const bardState = getBardFeatureState(character);

  return Math.max(baseTotal, bardState.bardicInspirationTemporaryTotal ?? 0);
}

export function getBardicInspirationUsesRemaining(
  character: Pick<Character, "className" | "level" | "abilities" | "classFeatureState" | "feats">
): number {
  const totalUses = getBardicInspirationUsesTotal(character);
  const bardState = getBardFeatureState(character);
  return Math.max(0, totalUses - (bardState.bardicInspirationUsesExpended ?? 0));
}

export function expendBardicInspirationUse(character: Character): Character {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return character;
  }

  const bardState = getBardFeatureState(character);
  const totalUses = getBardicInspirationUsesTotal(character);
  const currentExpended = Math.max(0, bardState.bardicInspirationUsesExpended ?? 0);

  if (currentExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        bardicInspirationUsesExpended: currentExpended + 1
      }
    }
  };
}

export function restoreBardicInspirationUse(character: Character): Character {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return character;
  }

  const bardState = getBardFeatureState(character);
  const currentExpended = Math.max(0, bardState.bardicInspirationUsesExpended ?? 0);

  if (currentExpended <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        bardicInspirationUsesExpended: currentExpended - 1
      }
    }
  };
}

export function restoreAllBardicInspirationUses(character: Character): Character {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return character;
  }

  const bardState = getBardFeatureState(character);

  if ((bardState.bardicInspirationUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        bardicInspirationUsesExpended: 0
      }
    }
  };
}

function getBardSpellSlotAvailability(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): {
  totals: number[];
  expended: number[];
  remaining: number[];
  remainingCount: number;
  totalCount: number;
  lowestAvailableLevel: number | null;
} {
  const totals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const expended = normalizeSpellSlotsExpended(character.spellSlotsExpended, totals);
  const remaining = totals.map((total, index) => Math.max(0, total - (expended[index] ?? 0)));
  const remainingCount = remaining.reduce((sum, value) => sum + value, 0);
  const totalCount = totals.reduce((sum, value) => sum + value, 0);
  const lowestAvailableIndex = remaining.findIndex((value) => value > 0);

  return {
    totals,
    expended,
    remaining,
    remainingCount,
    totalCount,
    lowestAvailableLevel: lowestAvailableIndex >= 0 ? lowestAvailableIndex + 1 : null
  };
}

export function getBardFeatureAction(
  character: Pick<
    Character,
    "className" | "level" | "abilities" | "classFeatureState" | "feats" | "spellSlotsExpended"
  >
): FeatureActionCard | null {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return null;
  }

  const bardicDie = getBardicInspirationDie(character);
  const totalUses = getBardicInspirationUsesTotal(character);
  const usesRemaining = getBardicInspirationUsesRemaining(character);
  const bardicDieLabel = bardicDie ? bardicDie.toLowerCase() : "die";
  const fontOfInspirationUnlocked = hasFontOfInspiration(character);
  const spellSlotAvailability = getBardSpellSlotAvailability(character);
  const canSpendSpellSlotForUse =
    fontOfInspirationUnlocked && usesRemaining <= 0 && spellSlotAvailability.remainingCount > 0;
  const spellSlotLabel =
    fontOfInspirationUnlocked && usesRemaining <= 0
      ? `${spellSlotAvailability.remainingCount}/${spellSlotAvailability.totalCount} spell slots`
      : undefined;
  const drawerResources: FeatureActionResource[] = [
    {
      kind: "tracker",
      label: "Uses",
      current: usesRemaining,
      total: totalUses,
      icon: "music",
      cost: 1
    },
    ...(spellSlotLabel
      ? [
          {
            kind: "text" as const,
            label: "Spell Slots",
            value: spellSlotLabel
          }
        ]
      : [])
  ];

  const disabled = usesRemaining <= 0 && !canSpendSpellSlotForUse;
  const disabledReason =
    usesRemaining <= 0
      ? fontOfInspirationUnlocked
        ? "No Bardic Inspiration uses or spell slots remaining."
        : "No Bardic Inspiration uses remaining."
      : undefined;

  return {
    key: bardicInspirationActionKey,
    name: "Bardic Inspiration",
    summary: `Grant a ${bardicDieLabel} inspiration die.`,
    detail:
      "Use a Bonus Action to inspire another creature within 60 feet that can see or hear you.",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal: totalUses,
    hideUsesTrackerOnCard: true,
    usesSupplementaryLabel: spellSlotLabel,
    usesInlineLabel: "Use 1",
    usesInlineIcon: "music",
    description: [
      "Use a Bonus Action to inspire another creature within 60 feet that can see or hear you."
    ],
    drawer: {
      kind: "confirm",
      eyebrow: "Bard",
      confirmLabel: "Use Bardic Inspiration",
      resources: drawerResources
    },
    execute: {
      kind: "activate",
      label: "Use Bardic Inspiration"
    },
    disabled,
    disabledReason
  };
}

export function activateBardicInspiration(character: Character): Character {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return character;
  }

  const bardState = getBardFeatureState(character);
  const usesExpended = bardState.bardicInspirationUsesExpended ?? 0;
  const totalUses = getBardicInspirationUsesTotal(character);

  if (usesExpended < totalUses) {
    return expendBardicInspirationUse(character);
  }

  if (!hasFontOfInspiration(character)) {
    return character;
  }

  const spellSlotAvailability = getBardSpellSlotAvailability(character);

  if (spellSlotAvailability.lowestAvailableLevel === null) {
    return character;
  }

  const spellSlotIndex = spellSlotAvailability.lowestAvailableLevel - 1;
  const nextSpellSlotsExpended = [...spellSlotAvailability.expended];
  nextSpellSlotsExpended[spellSlotIndex] = (nextSpellSlotsExpended[spellSlotIndex] ?? 0) + 1;

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function activateMantleOfInspiration(character: Character): Character {
  if (!hasMantleOfInspirationFeature(character)) {
    return character;
  }

  if (getBardicInspirationUsesRemaining(character) <= 0) {
    return character;
  }

  return expendBardicInspirationUse(character);
}

export function applySuperiorInspirationOnInitiative(character: Character): Character {
  if (
    !hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION) ||
    !hasSuperiorInspiration(character)
  ) {
    return character;
  }

  const bardState = getBardFeatureState(character);
  const effectiveTotal = Math.max(getBardicInspirationBaseUsesTotal(character), 2);
  const currentExpended = Math.max(0, bardState.bardicInspirationUsesExpended ?? 0);
  const currentRemaining = Math.max(0, getBardicInspirationUsesTotal(character) - currentExpended);

  if (currentRemaining >= 2 && (bardState.bardicInspirationTemporaryTotal ?? 0) === effectiveTotal) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        bardicInspirationUsesExpended:
          currentRemaining >= 2 ? currentExpended : Math.max(0, effectiveTotal - 2),
        bardicInspirationTemporaryTotal: effectiveTotal
      }
    }
  };
}

export function applyShortRestToBardFeatures(character: Character): Character {
  if (!hasFontOfInspiration(character)) {
    return character;
  }

  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...getBardFeatureState(character),
        bardicInspirationUsesExpended: 0,
        bardicInspirationTemporaryTotal: undefined
      }
    }
  };
}

export function applyLongRestToBardFeatures(character: Character): Character {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return restoreMantleOfMajestyOnLongRest(restoreBeguilingMagicOnLongRest(character));
  }

  const nextCharacter = {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...getBardFeatureState(character),
        bardicInspirationUsesExpended: 0,
        bardicInspirationTemporaryTotal: undefined
      }
    }
  };

  return restoreMantleOfMajestyOnLongRest(restoreBeguilingMagicOnLongRest(nextCharacter));
}

export function restoreBardicInspirationOnLongRest(character: Character): Character {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...getBardFeatureState(character),
        bardicInspirationUsesExpended: 0,
        bardicInspirationTemporaryTotal: undefined
      }
    }
  };
}

export {
  bardicInspirationActionKey,
  mantleOfInspirationActionKey,
  mantleOfMajestyActionKey,
  mantleOfMajestyStatusSourceId
};
