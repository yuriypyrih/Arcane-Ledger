import { bardFeatures, getSpellEntriesForSpellListClasses } from "../../../../codex/classes";
import {
  getReactionEntryById,
  ACTION_TYPE,
  CLASS_FEATURE,
  SPELL_LIST_CLASS,
  type DICE,
  type ReactionEntry,
  type SpellEntry
} from "../../../../codex/entries";
import type { BardFeatureClassObj } from "../../../../types";
import type {
  ArmorProficiencyEntry,
  Character,
  CharacterBardFeatureState,
  LanguageProficiencyEntry,
  SkillName,
  SkillProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../../types";
import {
  ARMOR_PROFICIENCY,
  CONDITION_NAME,
  EFFECT_NAME,
  LANGUAGE_PROFICIENCY,
  getSkillProficiencyForSkillName,
  isSkillName,
  PROFICIENCY_OVERRIDE_POLICY,
  PROF_LEVEL,
  PROFICIENCY_SOURCE,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  WEAPON_PROFICIENCY
} from "../../../../types";
import { getFeatAbilityScoreBonusesForCharacter } from "../../feats";
import {
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../spellcasting";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../../combat";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../traits";
import type {
  FeatureArmorProficiencyEntry,
  FeatureActionCard,
  FeatureActionResource,
  FeatureLanguageProficiencyEntry,
  FeatureSkillBonus,
  FeatureSkillProficiencyEntry,
  FeatureWeaponProficiencyEntry
} from "../types";

const bardicInspirationActionKey = "bard-bardic-inspiration";
const mantleOfInspirationActionKey = "bard-mantle-of-inspiration";
const mantleOfMajestyActionKey = "bard-mantle-of-majesty";
const unbreakableMajestyActionKey = "bard-unbreakable-majesty";
const collegeOfGlamourSubclassId = "bard-college-of-glamour";
const collegeOfTheMoonSubclassId = "bard-college-of-the-moon";
const collegeOfValorSubclassId = "bard-college-of-valor";
const mantleOfMajestyStatusSourceId = "feature-bard-mantle-of-majesty";
const mantleOfMajestyConcentrationSourceId = "feature-bard-mantle-of-majesty-concentration";
const unbreakableMajestyStatusSourceId = "feature-bard-unbreakable-majesty";
const inspiredEclipseStatusSourceId = "feature-bard-inspired-eclipse";
const inspiredEclipseInvisibleStatusSourceId = "feature-bard-inspired-eclipse-invisible";
const wordsOfCreationAlwaysPreparedSpellIds = [
  "spell-power-word-heal",
  "spell-power-word-kill"
] as const;
const bardExpertiseLevel2SourceLabel = "Level 2: Expertise";
const bardExpertiseLevel9SourceLabel = "Level 9: Expertise";
const bardLoreBonusProficienciesSourceLabel = "College of Lore: Bonus Proficiencies";
const bardPrimalLoreSourceLabel = "College of the Moon: Primal Lore";
const bardValorMartialTrainingSourceLabel = "College of Valor: Martial Training";
const bardExpertiseLevel2SourceKey = "bard-expertise-level-2";
const bardExpertiseLevel9SourceKey = "bard-expertise-level-9";
const bardSourceMetadataSeparator = "::";
const primalLoreSkillOptions = [
  "Animal Handling",
  "Insight",
  "Medicine",
  "Nature",
  "Perception",
  "Survival"
] as const satisfies readonly SkillName[];
type BardExpertiseTier = "level2" | "level9";

function isPrimalLoreSkill(value: unknown): value is (typeof primalLoreSkillOptions)[number] {
  return primalLoreSkillOptions.some((skill) => skill === value);
}

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

function hasCollegeOfValorMartialTrainingFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfValorSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasCollegeOfValorExtraAttackFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfValorSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasCollegeOfValorBattleMagicFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfValorSubclassId &&
    (character.level ?? 0) >= 14
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

function hasLoreBonusProficienciesFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === "bard-college-of-lore" &&
    (character.level ?? 0) >= 3
  );
}

function hasMoonsInspirationFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasMagicalDiscoveriesFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === "bard-college-of-lore" &&
    (character.level ?? 0) >= 6
  );
}

function hasPrimalLoreFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasBlessingOfMoonlightFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasUnbreakableMajestyFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 14
  );
}

function normalizeBardExpertiseSelections(value: unknown): SkillName[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value.filter((entry): entry is SkillName => typeof entry === "string" && isSkillName(entry))
    )
  ].slice(0, 2);
}

function normalizeBardLoreBonusProficienciesSelections(value: unknown): SkillName[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value.filter((entry): entry is SkillName => typeof entry === "string" && isSkillName(entry))
    )
  ].slice(0, 3);
}

function normalizeBardMagicalDiscoveriesSpellIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    )
  ].slice(0, 2);
}

function normalizeBardPrimalLoreCantripId(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function normalizeBardPrimalLoreSkill(value: unknown): SkillName | undefined {
  return typeof value === "string" && isPrimalLoreSkill(value) ? (value as SkillName) : undefined;
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

function createBardLoreBonusProficiencyEntry(skill: SkillName): SkillProficiencyEntry | null {
  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: bardLoreBonusProficienciesSourceLabel,
    proficiency: getSkillProficiencyForSkillName(skill),
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  };
}

function createBardPrimalLoreSkillEntry(skill: SkillName): SkillProficiencyEntry | null {
  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: bardPrimalLoreSourceLabel,
    proficiency: getSkillProficiencyForSkillName(skill),
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
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
          (left.maxScore ?? Number.POSITIVE_INFINITY) - (right.maxScore ?? Number.POSITIVE_INFINITY)
        );
      }

      return (left.order ?? 0) - (right.order ?? 0);
    })
    .forEach((bonus) => {
      total += getAppliedAbilityScoreBonus(total, bonus.value, bonus.maxScore);
    });

  return Math.floor((total - 10) / 2);
}

function hasSuperiorInspiration(character: Pick<Character, "className" | "level">): boolean {
  return hasBardFeature(character, CLASS_FEATURE.SUPERIOR_INSPIRATION);
}

function hasFontOfInspiration(character: Pick<Character, "className" | "level">): boolean {
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
  const hasBlessingOfMoonlight = hasBlessingOfMoonlightFeature(character);
  const hasMantleOfMajesty = hasMantleOfMajestyFeature(character);
  const hasUnbreakableMajesty = hasUnbreakableMajestyFeature(character);
  const hasLoreBonusProficiencies = hasLoreBonusProficienciesFeature(character);
  const hasMagicalDiscoveries = hasMagicalDiscoveriesFeature(character);
  const hasPrimalLore = hasPrimalLoreFeature(character);
  const hasValorMartialTraining = hasCollegeOfValorMartialTrainingFeature(character);
  const hasValorExtraAttack = hasCollegeOfValorExtraAttackFeature(character);
  const hasValorBattleMagic = hasCollegeOfValorBattleMagicFeature(character);

  if (
    !hasBardicInspiration &&
    !hasLevel2Expertise &&
    !hasLevel9Expertise &&
    !hasBeguilingMagic &&
    !hasBlessingOfMoonlight &&
    !hasMantleOfMajesty &&
    !hasUnbreakableMajesty &&
    !hasLoreBonusProficiencies &&
    !hasMagicalDiscoveries &&
    !hasPrimalLore &&
    !hasValorMartialTraining &&
    !hasValorExtraAttack &&
    !hasValorBattleMagic
  ) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterBardFeatureState>) : {};
  const usesExpended = Number(record.bardicInspirationUsesExpended);
  const temporaryTotal = Number(record.bardicInspirationTemporaryTotal);
  const beguilingMagicUsesExpended = Number(record.beguilingMagicUsesExpended);
  const blessingOfMoonlightUsesExpended = Number(record.blessingOfMoonlightUsesExpended);
  const mantleOfMajestyUsesExpended = Number(record.mantleOfMajestyUsesExpended);
  const unbreakableMajestyUsesExpended = Number(record.unbreakableMajestyUsesExpended);
  const loreBonusProficienciesSelections = normalizeBardLoreBonusProficienciesSelections(
    record.loreBonusProficiencies
  );
  const magicalDiscoveriesSpellIds = normalizeBardMagicalDiscoveriesSpellIds(
    record.magicalDiscoveriesSpellIds
  );
  const primalLoreCantripId = normalizeBardPrimalLoreCantripId(record.primalLoreCantripId);
  const primalLoreSkill = normalizeBardPrimalLoreSkill(record.primalLoreSkill);
  const extraAttacksRemainingThisTurn = Number(record.extraAttacksRemainingThisTurn);
  const expertiseRecord =
    record.expertise && typeof record.expertise === "object" ? record.expertise : undefined;

  return {
    bardicInspirationUsesExpended: hasBardicInspiration
      ? Number.isFinite(usesExpended)
        ? Math.max(0, Math.floor(usesExpended))
        : 0
      : undefined,
    bardicInspirationTemporaryTotal:
      hasBardicInspiration && Number.isFinite(temporaryTotal)
        ? Math.max(0, Math.floor(temporaryTotal))
        : undefined,
    beguilingMagicUsesExpended:
      hasBeguilingMagic && Number.isFinite(beguilingMagicUsesExpended)
        ? Math.max(0, Math.floor(beguilingMagicUsesExpended))
        : hasBeguilingMagic
          ? 0
          : undefined,
    blessingOfMoonlightUsesExpended:
      hasBlessingOfMoonlight && Number.isFinite(blessingOfMoonlightUsesExpended)
        ? Math.max(0, Math.floor(blessingOfMoonlightUsesExpended))
        : hasBlessingOfMoonlight
          ? 0
          : undefined,
    mantleOfMajestyUsesExpended:
      hasMantleOfMajesty && Number.isFinite(mantleOfMajestyUsesExpended)
        ? Math.max(0, Math.floor(mantleOfMajestyUsesExpended))
        : hasMantleOfMajesty
          ? 0
          : undefined,
    unbreakableMajestyUsesExpended:
      hasUnbreakableMajesty && Number.isFinite(unbreakableMajestyUsesExpended)
        ? Math.max(0, Math.floor(unbreakableMajestyUsesExpended))
        : hasUnbreakableMajesty
          ? 0
          : undefined,
    loreBonusProficiencies: hasLoreBonusProficiencies
      ? loreBonusProficienciesSelections
      : undefined,
    magicalDiscoveriesSpellIds: hasMagicalDiscoveries ? magicalDiscoveriesSpellIds : undefined,
    primalLoreCantripId: hasPrimalLore ? primalLoreCantripId : undefined,
    primalLoreSkill: hasPrimalLore ? primalLoreSkill : undefined,
    extraAttacksRemainingThisTurn: hasValorExtraAttack
      ? Number.isFinite(extraAttacksRemainingThisTurn)
        ? Math.max(0, Math.min(1, Math.floor(extraAttacksRemainingThisTurn)))
        : 0
      : undefined,
    valorCantripReplacementUsedThisTurn: hasValorExtraAttack
      ? Boolean(record.valorCantripReplacementUsedThisTurn)
      : undefined,
    battleMagicBonusAttackAvailable: hasValorBattleMagic
      ? Boolean(record.battleMagicBonusAttackAvailable)
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

export function getBardLoreBonusProficiencySelections(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): SkillName[] {
  return getBardFeatureState(character).loreBonusProficiencies ?? [];
}

export function getBardMagicalDiscoveriesSpellOptions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): SpellEntry[] {
  if (!hasMagicalDiscoveriesFeature(character)) {
    return [];
  }

  const highestSlotLevel = getSpellSlotTotalsForCharacter(
    character.className,
    character.level
  ).reduce((highestLevel, totalSlots, index) => (totalSlots > 0 ? index + 1 : highestLevel), 0);

  return getSpellEntriesForSpellListClasses([
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WIZARD
  ]).filter((spell) => {
    const spellLevel = getSpellLevel(spell);
    return spellLevel === 0 || spellLevel <= highestSlotLevel;
  });
}

export function getBardMagicalDiscoveriesSpellIds(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): string[] {
  if (!hasMagicalDiscoveriesFeature(character)) {
    return [];
  }

  const availableSpellIds = new Set(
    getBardMagicalDiscoveriesSpellOptions(character).map((spell) => spell.id)
  );

  return (getBardFeatureState(character).magicalDiscoveriesSpellIds ?? []).filter((spellId) =>
    availableSpellIds.has(spellId)
  );
}

export function getBardPrimalLoreCantripOptions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): SpellEntry[] {
  if (!hasPrimalLoreFeature(character)) {
    return [];
  }

  return getSpellEntriesForSpellListClasses([SPELL_LIST_CLASS.DRUID]).filter(
    (spell) => getSpellLevel(spell) === 0
  );
}

export function getBardPrimalLoreCantripId(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): string | null {
  if (!hasPrimalLoreFeature(character)) {
    return null;
  }

  const availableSpellIds = new Set(
    getBardPrimalLoreCantripOptions(character).map((spell) => spell.id)
  );
  const selectedSpellId = getBardFeatureState(character).primalLoreCantripId;

  return selectedSpellId && availableSpellIds.has(selectedSpellId) ? selectedSpellId : null;
}

export function getBardPrimalLoreSkillOptions(): SkillName[] {
  return [...primalLoreSkillOptions];
}

export function getBardPrimalLoreSkillSelection(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): SkillName | null {
  if (!hasPrimalLoreFeature(character)) {
    return null;
  }

  return getBardFeatureState(character).primalLoreSkill ?? null;
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

export function setBardLoreBonusProficiencySelections(
  character: Character,
  selections: SkillName[]
): Character {
  const bardState = getBardFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        loreBonusProficiencies: normalizeBardLoreBonusProficienciesSelections(selections)
      }
    }
  };
}

export function setBardMagicalDiscoveriesSpellIds(
  character: Character,
  spellIds: string[]
): Character {
  if (!hasMagicalDiscoveriesFeature(character)) {
    return character;
  }

  const bardState = getBardFeatureState(character);
  const availableSpellIds = new Set(
    getBardMagicalDiscoveriesSpellOptions(character).map((spell) => spell.id)
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        magicalDiscoveriesSpellIds: normalizeBardMagicalDiscoveriesSpellIds(spellIds).filter(
          (spellId) => availableSpellIds.has(spellId)
        )
      }
    }
  };
}

export function setBardPrimalLoreCantripId(
  character: Character,
  spellId: string | null
): Character {
  if (!hasPrimalLoreFeature(character)) {
    return character;
  }

  const bardState = getBardFeatureState(character);
  const availableSpellIds = new Set(
    getBardPrimalLoreCantripOptions(character).map((spell) => spell.id)
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

export function setBardPrimalLoreSkillSelection(
  character: Character,
  skill: SkillName | null
): Character {
  if (!hasPrimalLoreFeature(character)) {
    return character;
  }

  const bardState = getBardFeatureState(character);

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

export function getBardSkillProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureSkillProficiencyEntry[] {
  if (!hasBardLevel2Expertise(character)) {
    return hasLoreBonusProficienciesFeature(character)
      ? getBardLoreBonusProficiencySelections(character)
          .map((skill) => createBardLoreBonusProficiencyEntry(skill))
          .filter((entry): entry is SkillProficiencyEntry => entry !== null)
      : [];
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

  const loreEntries = hasLoreBonusProficienciesFeature(character)
    ? getBardLoreBonusProficiencySelections(character)
        .map((skill) => createBardLoreBonusProficiencyEntry(skill))
        .filter((entry): entry is SkillProficiencyEntry => entry !== null)
    : [];
  const primalLoreEntries = hasPrimalLoreFeature(character)
    ? [getBardPrimalLoreSkillSelection(character)]
        .filter((skill): skill is SkillName => skill !== null)
        .map((skill) => createBardPrimalLoreSkillEntry(skill))
        .filter((entry): entry is SkillProficiencyEntry => entry !== null)
    : [];

  return [...level2Entries, ...level9Entries, ...loreEntries, ...primalLoreEntries];
}

export function getBardLanguageProficiencyEntries(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureLanguageProficiencyEntry[] {
  if (!hasPrimalLoreFeature(character)) {
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

export function getBardWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureWeaponProficiencyEntry[] {
  if (!hasCollegeOfValorMartialTrainingFeature(character)) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: bardValorMartialTrainingSourceLabel,
      proficiency: WEAPON_PROFICIENCY.MARTIAL,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies WeaponProficiencyEntry
  ];
}

export function getBardArmorProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureArmorProficiencyEntry[] {
  if (!hasCollegeOfValorMartialTrainingFeature(character)) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: bardValorMartialTrainingSourceLabel,
      proficiency: ARMOR_PROFICIENCY.MEDIUM,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies ArmorProficiencyEntry,
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: bardValorMartialTrainingSourceLabel,
      proficiency: ARMOR_PROFICIENCY.SHIELD,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies ArmorProficiencyEntry
  ];
}

function getBardAdditionalAttackCount(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return hasCollegeOfValorExtraAttackFeature(character) ? 1 : 0;
}

export function getBardWeaponAttackMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  if (getBardAdditionalAttackCount(character) <= 0) {
    return 0;
  }

  return getBardFeatureState(character).extraAttacksRemainingThisTurn ?? 0;
}

export function hasBardBattleMagicBonusAttackAvailable(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    hasCollegeOfValorBattleMagicFeature(character) &&
    getBardFeatureState(character).battleMagicBonusAttackAvailable === true
  );
}

function canGainBardBattleMagicFromSpell(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  spell: Pick<SpellEntry, "castingTime">
): boolean {
  return (
    hasCollegeOfValorBattleMagicFeature(character) && spell.castingTime.includes(ACTION_TYPE.ACTION)
  );
}

export function applyBardBattleMagicAfterSpellCast(
  character: Character,
  spell: Pick<SpellEntry, "castingTime">
): Character {
  if (!canGainBardBattleMagicFromSpell(character, spell)) {
    return character;
  }

  const bardState = getBardFeatureState(character);

  if (bardState.battleMagicBonusAttackAvailable) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        battleMagicBonusAttackAvailable: true
      }
    }
  };
}

function isValorActionCantrip(spell: Pick<SpellEntry, "castingTime" | "spellLevel">): boolean {
  return spell.spellLevel === 0 && spell.castingTime.includes(ACTION_TYPE.ACTION);
}

export function canUseBardValorActionCantripReplacement(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "roundTracker"> &
    Partial<Pick<Character, "subclassId">>,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  if (!hasCollegeOfValorExtraAttackFeature(character) || !isValorActionCantrip(spell)) {
    return false;
  }

  const bardState = getBardFeatureState(character);

  if (bardState.valorCantripReplacementUsedThisTurn) {
    return false;
  }

  return (
    isRoundTrackerResourceAvailable(character.roundTracker, "action") ||
    (bardState.extraAttacksRemainingThisTurn ?? 0) > 0
  );
}

export function consumeBardWeaponAttack(
  character: Character,
  action?: {
    attackKind: "weapon" | "unarmed";
  }
): Character {
  if (character.className !== "Bard") {
    return isRoundTrackerResourceAvailable(character.roundTracker, "action")
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
        }
      : character;
  }

  const bardState = getBardFeatureState(character);
  const extraAttacksRemaining = bardState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");
  const canUseBattleMagicBonusAttack =
    action?.attackKind === "weapon" &&
    bardState.battleMagicBonusAttackAvailable === true &&
    isRoundTrackerResourceAvailable(character.roundTracker, "bonusAction");

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        bard: {
          ...bardState,
          extraAttacksRemainingThisTurn: getBardAdditionalAttackCount(character)
        }
      }
    };
  }

  if (extraAttacksRemaining <= 0) {
    if (!canUseBattleMagicBonusAttack) {
      return character;
    }

    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "bonusAction"),
      classFeatureState: {
        ...character.classFeatureState,
        bard: {
          ...bardState,
          battleMagicBonusAttackAvailable: false
        }
      }
    };
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}

export function consumeBardValorActionCantrip(character: Character): Character {
  if (!hasCollegeOfValorExtraAttackFeature(character)) {
    return character;
  }

  const bardState = getBardFeatureState(character);

  if (bardState.valorCantripReplacementUsedThisTurn) {
    return character;
  }

  const extraAttacksRemaining = bardState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        bard: {
          ...bardState,
          extraAttacksRemainingThisTurn: getBardAdditionalAttackCount(character),
          valorCantripReplacementUsedThisTurn: true
        }
      }
    };
  }

  if (extraAttacksRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1,
        valorCantripReplacementUsedThisTurn: true
      }
    }
  };
}

export function getBardAlwaysPreparedSpellIds(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): string[] {
  const primalLoreCantripId = getBardPrimalLoreCantripId(character);

  return [
    ...new Set([
      ...(hasBardFeature(character, CLASS_FEATURE.WORDS_OF_CREATION)
        ? [...wordsOfCreationAlwaysPreparedSpellIds]
        : []),
      ...getBardMagicalDiscoveriesSpellIds(character),
      ...(primalLoreCantripId ? [primalLoreCantripId] : [])
    ])
  ];
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

export function getBlessingOfMoonlightUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return hasBlessingOfMoonlightFeature(character) ? 1 : 0;
}

export function getBlessingOfMoonlightUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  const totalUses = getBlessingOfMoonlightUsesTotal(character);
  const bardState = getBardFeatureState(character);

  return Math.max(0, totalUses - (bardState.blessingOfMoonlightUsesExpended ?? 0));
}

export function consumeBlessingOfMoonlightUse(character: Character): Character {
  const totalUses = getBlessingOfMoonlightUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  const bardState = getBardFeatureState(character);
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

export function restoreBlessingOfMoonlightOnLongRest(character: Character): Character {
  const totalUses = getBlessingOfMoonlightUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  const bardState = getBardFeatureState(character);

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

export function getUnbreakableMajestyUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return hasUnbreakableMajestyFeature(character) ? 1 : 0;
}

export function getUnbreakableMajestyUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  const totalUses = getUnbreakableMajestyUsesTotal(character);
  const bardState = getBardFeatureState(character);

  return Math.max(0, totalUses - (bardState.unbreakableMajestyUsesExpended ?? 0));
}

export function consumeUnbreakableMajestyUse(character: Character): Character {
  if (
    !hasUnbreakableMajestyFeature(character) ||
    getUnbreakableMajestyUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const bardState = getBardFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        unbreakableMajestyUsesExpended: (bardState.unbreakableMajestyUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restoreUnbreakableMajestyOnShortRest(character: Character): Character {
  if (getUnbreakableMajestyUsesTotal(character) <= 0) {
    return character;
  }

  const bardState = getBardFeatureState(character);

  if ((bardState.unbreakableMajestyUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        unbreakableMajestyUsesExpended: 0
      }
    }
  };
}

export function restoreUnbreakableMajestyOnLongRest(character: Character): Character {
  return restoreUnbreakableMajestyOnShortRest(character);
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

export function hasActiveUnbreakableMajesty(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId" | "statusEntries">>
): boolean {
  if (character.className !== "Bard" || character.subclassId !== collegeOfGlamourSubclassId) {
    return false;
  }

  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.value === "Unbreakable Majesty" &&
      entry.sourceId === unbreakableMajestyStatusSourceId
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
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 10,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
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

export function applyUnbreakableMajestyStatus(character: Character): Character {
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== unbreakableMajestyStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Unbreakable Majesty",
        source: "College of Glamour",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 10,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: unbreakableMajestyStatusSourceId
      })
    ]
  };
}

export function activateUnbreakableMajesty(character: Character): Character {
  if (
    getUnbreakableMajestyUsesRemaining(character) <= 0 ||
    hasActiveUnbreakableMajesty(character)
  ) {
    return character;
  }

  return applyUnbreakableMajestyStatus(consumeUnbreakableMajestyUse(character));
}

export function applyInspiredEclipseStatus(character: Character): Character {
  if (!hasMoonsInspirationFeature(character)) {
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

export function advanceBardFeaturesForNewRound(character: Character): Character {
  if (
    getBardAdditionalAttackCount(character) <= 0 &&
    !hasCollegeOfValorBattleMagicFeature(character)
  ) {
    return character;
  }

  const bardState = getBardFeatureState(character);

  if (
    (bardState.extraAttacksRemainingThisTurn ?? 0) === 0 &&
    !bardState.valorCantripReplacementUsedThisTurn &&
    !bardState.battleMagicBonusAttackAvailable
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        extraAttacksRemainingThisTurn: 0,
        valorCantripReplacementUsedThisTurn: false,
        battleMagicBonusAttackAvailable: false
      }
    }
  };
}

function clearBardTurnState(character: Character): Character {
  const bardState = getBardFeatureState(character);

  if (
    (bardState.extraAttacksRemainingThisTurn ?? 0) === 0 &&
    !bardState.valorCantripReplacementUsedThisTurn &&
    !bardState.battleMagicBonusAttackAvailable
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        extraAttacksRemainingThisTurn: 0,
        valorCantripReplacementUsedThisTurn: false,
        battleMagicBonusAttackAvailable: false
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
      label: "Use Bardic Inspiration",
      effectKind: "bardic-inspiration-roll"
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

  if (
    currentRemaining >= 2 &&
    (bardState.bardicInspirationTemporaryTotal ?? 0) === effectiveTotal
  ) {
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

export function restoreBardicInspirationOnShortRest(character: Character): Character {
  if (
    !hasFontOfInspiration(character) ||
    !hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)
  ) {
    return character;
  }

  const bardState = getBardFeatureState(character);

  if (
    (bardState.bardicInspirationUsesExpended ?? 0) <= 0 &&
    bardState.bardicInspirationTemporaryTotal === undefined
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        bardicInspirationUsesExpended: 0,
        bardicInspirationTemporaryTotal: undefined
      }
    }
  };
}

export function applyShortRestToBardFeatures(character: Character): Character {
  const restoredBardicInspiration = restoreBardicInspirationOnShortRest(character);

  return clearBardTurnState(restoreUnbreakableMajestyOnShortRest(restoredBardicInspiration));
}

export function applyLongRestToBardFeatures(character: Character): Character {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return clearBardTurnState(
      restoreUnbreakableMajestyOnLongRest(
        restoreMantleOfMajestyOnLongRest(
          restoreBlessingOfMoonlightOnLongRest(restoreBeguilingMagicOnLongRest(character))
        )
      )
    );
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

  return restoreUnbreakableMajestyOnLongRest(
    restoreMantleOfMajestyOnLongRest(
      clearBardTurnState(
        restoreBlessingOfMoonlightOnLongRest(restoreBeguilingMagicOnLongRest(nextCharacter))
      )
    )
  );
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
  unbreakableMajestyActionKey,
  mantleOfMajestyStatusSourceId,
  unbreakableMajestyStatusSourceId
};
