import { bardFeatures } from "../../../codex/classes";
import { getReactionEntryById, CLASS_FEATURE, type DICE, type ReactionEntry } from "../../../codex/entries";
import type { BardFeatureClassObj } from "../../../types";
import type { Character, CharacterBardFeatureState, SkillName, SkillProficiencyEntry } from "../../../types";
import {
  ALL_SKILLS,
  PROFICIENCY_OVERRIDE_POLICY,
  PROF_LEVEL,
  PROFICIENCY_SOURCE,
  SKILL_PROFICIENCY
} from "../../../types";
import { getFeatAbilityScoreBonusesForCharacter } from "../feats";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../spellcasting";
import type { FeatureActionCard, FeatureSkillBonus, FeatureSkillProficiencyEntry } from "./types";

const bardicInspirationActionKey = "bard-bardic-inspiration";
const wordsOfCreationAlwaysPreparedSpellIds = [
  "spell-power-word-heal",
  "spell-power-word-kill"
] as const;
const bardExpertiseLevel2SourceLabel = "Level 2: Expertise";
const bardExpertiseLevel9SourceLabel = "Level 9: Expertise";
const bardExpertiseLevel2SourceKey = "bard-expertise-level-2";
const bardExpertiseLevel9SourceKey = "bard-expertise-level-9";
const bardSourceMetadataSeparator = "::";
const bardSkillProficiencyBySkillName = new Map<SkillName, SKILL_PROFICIENCY>([
  ["Acrobatics", SKILL_PROFICIENCY.ACROBATICS],
  ["Animal Handling", SKILL_PROFICIENCY.ANIMAL_HANDLING],
  ["Arcana", SKILL_PROFICIENCY.ARCANA],
  ["Athletics", SKILL_PROFICIENCY.ATHLETICS],
  ["Deception", SKILL_PROFICIENCY.DECEPTION],
  ["History", SKILL_PROFICIENCY.HISTORY],
  ["Insight", SKILL_PROFICIENCY.INSIGHT],
  ["Intimidation", SKILL_PROFICIENCY.INTIMIDATION],
  ["Investigation", SKILL_PROFICIENCY.INVESTIGATION],
  ["Medicine", SKILL_PROFICIENCY.MEDICINE],
  ["Nature", SKILL_PROFICIENCY.NATURE],
  ["Perception", SKILL_PROFICIENCY.PERCEPTION],
  ["Performance", SKILL_PROFICIENCY.PERFORMANCE],
  ["Persuasion", SKILL_PROFICIENCY.PERSUASION],
  ["Religion", SKILL_PROFICIENCY.RELIGION],
  ["Sleight of Hand", SKILL_PROFICIENCY.SLEIGHT_OF_HAND],
  ["Stealth", SKILL_PROFICIENCY.STEALTH],
  ["Survival", SKILL_PROFICIENCY.SURVIVAL]
]);

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

function isSkillName(value: string): value is SkillName {
  return (ALL_SKILLS as readonly string[]).includes(value);
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
  const proficiency = bardSkillProficiencyBySkillName.get(skill);

  if (!proficiency) {
    return null;
  }

  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: createBardExpertiseSourceStr(sourceLabel, sourceKey),
    proficiency,
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
  character: Pick<Character, "className" | "level">
): CharacterBardFeatureState {
  const hasBardicInspiration = hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION);
  const hasLevel2Expertise = hasBardLevel2Expertise(character);
  const hasLevel9Expertise = hasBardLevel9Expertise(character);

  if (!hasBardicInspiration && !hasLevel2Expertise && !hasLevel9Expertise) {
    return {};
  }

  const record = value && typeof value === "object" ? (value as Partial<CharacterBardFeatureState>) : {};
  const usesExpended = Number(record.bardicInspirationUsesExpended);
  const temporaryTotal = Number(record.bardicInspirationTemporaryTotal);
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
  character: Pick<Character, "className" | "level" | "abilities" | "classFeatureState" | "feats">
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
  const usesLabelParts = [`${bardicDieLabel}`, `${usesRemaining}/${totalUses} uses`];

  if (fontOfInspirationUnlocked && usesRemaining <= 0) {
    usesLabelParts.push(
      `${spellSlotAvailability.remainingCount}/${spellSlotAvailability.totalCount} spell slots`
    );
  }

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
    actionCost: "bonusAction",
    usesLabel: usesLabelParts.join(" | "),
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
    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        bard: {
          ...bardState,
          bardicInspirationUsesExpended: usesExpended + 1
        }
      }
    };
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

export { bardicInspirationActionKey };
