import { bardFeatures } from "../../../../codex/classes";
import {
  getReactionEntryById,
  CLASS_FEATURE,
  type DICE,
  type ReactionEntry,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../codex/entries";
import type { BardFeatureClassObj } from "../../../../types";
import type {
  Character,
  CharacterBardFeatureState,
  SkillName,
  SkillProficiencyEntry
} from "../../../../types";
import {
  getSkillProficiencyForSkillName,
  isSkillName,
  PROFICIENCY_OVERRIDE_POLICY,
  PROF_LEVEL,
  PROFICIENCY_SOURCE
} from "../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../actionModalDescriptions";
import { getFeatAbilityScoreBonusesForCharacter } from "../../feats/runtime";
import { getBackgroundAbilityScoreBonusesForCharacter } from "../../backgrounds";
import {
  createFeatureActionCardCost,
  markUsageHeaderTagsAsFallback,
  createNamedResourceCardUsage,
  createNamedResourceOrResourceCardUsage,
  createNamedUsageHeaderTags
} from "../cardUsage";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../spellcasting";
import {
  ACTION_CATEGORY,
  ECONOMY_TYPE,
  getRoundTrackerResourceForEconomyType
} from "../../actionEconomy";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../../combat";
import type {
  FeatureArmorProficiencyEntry,
  FeatureActionCard,
  FeatureLanguageProficiencyEntry,
  FeatureSkillBonus,
  FeatureSkillProficiencyEntry,
  FeatureWeaponProficiencyEntry,
  WeaponAttackConsumptionContext
} from "../types";
import * as danceSubclass from "./subclasses/bardCollegeOfDance";
import * as glamourSubclass from "./subclasses/bardCollegeOfGlamour";
import * as loreSubclass from "./subclasses/bardCollegeOfLore";
import * as moonSubclass from "./subclasses/bardCollegeOfTheMoon";
import * as valorSubclass from "./subclasses/bardCollegeOfValor";

const bardicInspirationActionKey = "bard-bardic-inspiration";
const lunarVitalityActionKey = moonSubclass.lunarVitalityActionKey;
const mantleOfInspirationActionKey = glamourSubclass.mantleOfInspirationActionKey;
const mantleOfMajestyActionKey = glamourSubclass.mantleOfMajestyActionKey;
const unbreakableMajestyActionKey = glamourSubclass.unbreakableMajestyActionKey;
const mantleOfMajestyStatusSourceId = glamourSubclass.mantleOfMajestyStatusSourceId;
const unbreakableMajestyStatusSourceId = glamourSubclass.unbreakableMajestyStatusSourceId;
const wordsOfCreationAlwaysPreparedSpellIds: string[] = [
  "spell-power-word-heal",
  "spell-power-word-kill"
];
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
  character: Pick<Character, "abilities" | "level" | "feats"> &
    Partial<Pick<Character, "background" | "backgroundChoices">>
): number {
  let total = Math.max(1, Math.floor(character.abilities.CHA));

  [
    ...getBackgroundAbilityScoreBonusesForCharacter(character),
    ...getFeatAbilityScoreBonusesForCharacter(character)
  ]
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

function hasWordsOfCreation(character: Pick<Character, "className" | "level">): boolean {
  return hasBardFeature(character, CLASS_FEATURE.WORDS_OF_CREATION);
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
  const hasGlamourSubclassState =
    glamourSubclass.hasBardCollegeOfGlamourBeguilingMagicFeature(character) ||
    glamourSubclass.hasBardCollegeOfGlamourMantleOfMajestyFeature(character) ||
    glamourSubclass.hasBardCollegeOfGlamourUnbreakableMajestyFeature(character);
  const hasDanceSubclassState =
    danceSubclass.hasBardCollegeOfDanceDazzlingFootworkFeature(character);
  const hasLoreSubclassState =
    loreSubclass.hasBardCollegeOfLoreBonusProficienciesFeature(character) ||
    loreSubclass.hasBardCollegeOfLoreMagicalDiscoveriesFeature(character);
  const hasMoonSubclassState =
    moonSubclass.hasBardCollegeOfTheMoonPrimalLoreFeature(character) ||
    moonSubclass.hasBardCollegeOfTheMoonBlessingOfMoonlightFeature(character);
  const hasValorSubclassState =
    valorSubclass.hasBardCollegeOfValorMartialTrainingFeature(character) ||
    valorSubclass.hasBardCollegeOfValorExtraAttackFeature(character) ||
    valorSubclass.hasBardCollegeOfValorBattleMagicFeature(character);

  if (
    !hasBardicInspiration &&
    !hasLevel2Expertise &&
    !hasLevel9Expertise &&
    !hasDanceSubclassState &&
    !hasGlamourSubclassState &&
    !hasLoreSubclassState &&
    !hasMoonSubclassState &&
    !hasValorSubclassState
  ) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterBardFeatureState>) : {};
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
    bardicInspirationTemporaryTotal:
      hasBardicInspiration && Number.isFinite(temporaryTotal)
        ? Math.max(0, Math.floor(temporaryTotal))
        : undefined,
    ...danceSubclass.normalizeBardCollegeOfDanceFeatureState(record, character),
    ...glamourSubclass.normalizeBardCollegeOfGlamourFeatureState(record, character),
    ...loreSubclass.normalizeBardCollegeOfLoreFeatureState(record, character),
    ...moonSubclass.normalizeBardCollegeOfTheMoonFeatureState(record, character),
    ...valorSubclass.normalizeBardCollegeOfValorFeatureState(record, character),
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
  return loreSubclass.getBardCollegeOfLoreBonusProficiencySelections(character);
}

export function getBardMagicalDiscoveriesSpellOptions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): SpellEntry[] {
  return loreSubclass.getBardCollegeOfLoreMagicalDiscoveriesSpellOptions(character);
}

export function getBardMagicalDiscoveriesSpellIds(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): string[] {
  return loreSubclass.getBardCollegeOfLoreMagicalDiscoveriesSpellIds(character);
}

export function getBardPrimalLoreCantripOptions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): SpellEntry[] {
  return moonSubclass.getBardCollegeOfTheMoonPrimalLoreCantripOptions(character);
}

export function getBardPrimalLoreCantripId(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): string | null {
  return moonSubclass.getBardCollegeOfTheMoonPrimalLoreCantripId(character);
}

export function getBardPrimalLoreSkillOptions(): SkillName[] {
  return moonSubclass.getBardCollegeOfTheMoonPrimalLoreSkillOptions();
}

export function getBardPrimalLoreSkillSelection(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): SkillName | null {
  return moonSubclass.getBardCollegeOfTheMoonPrimalLoreSkillSelection(character);
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
  return loreSubclass.setBardCollegeOfLoreBonusProficiencySelections(
    character,
    getBardFeatureState(character),
    selections
  );
}

export function setBardMagicalDiscoveriesSpellIds(
  character: Character,
  spellIds: string[]
): Character {
  return loreSubclass.setBardCollegeOfLoreMagicalDiscoveriesSpellIds(
    character,
    getBardFeatureState(character),
    spellIds
  );
}

export function setBardPrimalLoreCantripId(
  character: Character,
  spellId: string | null
): Character {
  return moonSubclass.setBardCollegeOfTheMoonPrimalLoreCantripId(
    character,
    getBardFeatureState(character),
    spellId
  );
}

export function setBardPrimalLoreSkillSelection(
  character: Character,
  skill: SkillName | null
): Character {
  return moonSubclass.setBardCollegeOfTheMoonPrimalLoreSkillSelection(
    character,
    getBardFeatureState(character),
    skill
  );
}

export function getBardSkillProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureSkillProficiencyEntry[] {
  if (!hasBardLevel2Expertise(character)) {
    return loreSubclass.getBardCollegeOfLoreSkillProficiencyEntries(character);
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

  const loreEntries = loreSubclass.getBardCollegeOfLoreSkillProficiencyEntries(character);
  const primalLoreEntries = moonSubclass.getBardCollegeOfTheMoonSkillProficiencyEntries(character);

  return [...level2Entries, ...level9Entries, ...loreEntries, ...primalLoreEntries];
}

export function getBardLanguageProficiencyEntries(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureLanguageProficiencyEntry[] {
  return moonSubclass.getBardCollegeOfTheMoonLanguageProficiencyEntries(character);
}

export function getBardWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureWeaponProficiencyEntry[] {
  return valorSubclass.getBardCollegeOfValorWeaponProficiencyEntries(character);
}

export function getBardArmorProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureArmorProficiencyEntry[] {
  return valorSubclass.getBardCollegeOfValorArmorProficiencyEntries(character);
}

export function getBardWeaponAttackMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return valorSubclass.getBardCollegeOfValorWeaponAttackMultiCount(character);
}

export function hasBardBattleMagicBonusAttackAvailable(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): boolean {
  return valorSubclass.hasBardCollegeOfValorBattleMagicBonusAttackAvailable(character);
}

export function getBardCollegeOfDanceUnarmedStrikeMultiCount(
  character: Pick<Character, "className"> &
    Partial<
      Pick<
        Character,
        | "level"
        | "subclassId"
        | "classFeatureState"
        | "equipment"
        | "inventoryItems"
        | "customEquipment"
      >
    >
): number {
  return danceSubclass.getBardCollegeOfDanceUnarmedStrikeMultiCount(character);
}

export function applyBardBattleMagicAfterSpellCast(
  character: Character,
  spell: Pick<SpellEntry, "castingTime">
): Character {
  return valorSubclass.applyBardCollegeOfValorBattleMagicAfterSpellCast(
    character,
    getBardFeatureState(character),
    spell
  );
}

export function canUseBardValorActionCantripReplacement(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "roundTracker"> &
    Partial<Pick<Character, "subclassId">>,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  return valorSubclass.canUseBardCollegeOfValorActionCantripReplacement(
    character,
    getBardFeatureState(character),
    spell
  );
}

export function consumeBardWeaponAttack(
  character: Character,
  action: WeaponAttackConsumptionContext
): Character {
  const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);

  if (character.className !== "Bard") {
    return roundTrackerResource &&
      isRoundTrackerResourceAvailable(character.roundTracker, roundTrackerResource)
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, roundTrackerResource)
        }
      : character;
  }

  const bardState = getBardFeatureState(character);
  const characterAfterDanceAgileStrike = danceSubclass.consumeBardCollegeOfDanceAgileStrike(
    character,
    bardState,
    action
  );

  if (characterAfterDanceAgileStrike !== character) {
    return characterAfterDanceAgileStrike;
  }

  return valorSubclass.consumeBardCollegeOfValorWeaponAttack(character, bardState, action);
}

export function consumeBardValorActionCantrip(character: Character): Character {
  return valorSubclass.consumeBardCollegeOfValorActionCantrip(
    character,
    getBardFeatureState(character)
  );
}

export function getBardAlwaysPreparedSpellIds(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): string[] {
  return [
    ...new Set([
      ...(hasBardFeature(character, CLASS_FEATURE.WORDS_OF_CREATION)
        ? [...wordsOfCreationAlwaysPreparedSpellIds]
        : []),
      ...getBardMagicalDiscoveriesSpellIds(character),
      ...moonSubclass.getBardCollegeOfTheMoonAlwaysPreparedSpellIds(character)
    ])
  ];
}

export function getBardSpellEntry(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  spell: SpellEntry
): SpellEntry {
  if (!hasWordsOfCreation(character) || !wordsOfCreationAlwaysPreparedSpellIds.includes(spell.id)) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.WORDS_OF_CREATION,
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.WORDS_OF_CREATION),
    "Words of Creation"
  );
}

export function getBeguilingMagicUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return glamourSubclass.getBardCollegeOfGlamourBeguilingMagicUsesTotal(character);
}

export function getBeguilingMagicUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return glamourSubclass.getBardCollegeOfGlamourBeguilingMagicUsesRemaining(character);
}

export function getBlessingOfMoonlightUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return moonSubclass.getBardCollegeOfTheMoonBlessingOfMoonlightUsesTotal(character);
}

export function getBlessingOfMoonlightUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return moonSubclass.getBardCollegeOfTheMoonBlessingOfMoonlightUsesRemaining(character);
}

export function consumeBlessingOfMoonlightUse(character: Character): Character {
  return moonSubclass.consumeBardCollegeOfTheMoonBlessingOfMoonlightUse(
    character,
    getBardFeatureState(character)
  );
}

export function restoreBlessingOfMoonlightOnLongRest(character: Character): Character {
  return moonSubclass.restoreBardCollegeOfTheMoonBlessingOfMoonlightOnLongRest(
    character,
    getBardFeatureState(character)
  );
}

export function consumeBeguilingMagicUse(character: Character): Character {
  return glamourSubclass.consumeBardCollegeOfGlamourBeguilingMagicUse(
    character,
    getBardFeatureState(character)
  );
}

export function restoreBeguilingMagicOnLongRest(character: Character): Character {
  return glamourSubclass.restoreBardCollegeOfGlamourBeguilingMagicOnLongRest(
    character,
    getBardFeatureState(character)
  );
}

export function consumeBeguilingMagicOrBardicInspiration(character: Character): Character {
  return glamourSubclass.consumeBardCollegeOfGlamourBeguilingMagicOrBardicInspiration(character);
}

export function getMantleOfMajestyUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return glamourSubclass.getBardCollegeOfGlamourMantleOfMajestyUsesTotal(character);
}

export function getMantleOfMajestyUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return glamourSubclass.getBardCollegeOfGlamourMantleOfMajestyUsesRemaining(character);
}

export function getMantleOfMajestyFallbackSlotLevel(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): number | null {
  return glamourSubclass.getBardCollegeOfGlamourMantleOfMajestyFallbackSlotLevel(character);
}

export function getMantleOfMajestyFallbackSlotSummary(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): { total: number; remaining: number } {
  return glamourSubclass.getBardCollegeOfGlamourMantleOfMajestyFallbackSlotSummary(character);
}

export function consumeMantleOfMajestyUse(character: Character): Character {
  return glamourSubclass.consumeBardCollegeOfGlamourMantleOfMajestyUse(
    character,
    getBardFeatureState(character)
  );
}

export function restoreMantleOfMajestyOnLongRest(character: Character): Character {
  return glamourSubclass.restoreBardCollegeOfGlamourMantleOfMajestyOnLongRest(
    character,
    getBardFeatureState(character)
  );
}

export function getUnbreakableMajestyUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return glamourSubclass.getBardCollegeOfGlamourUnbreakableMajestyUsesTotal(character);
}

export function getUnbreakableMajestyUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return glamourSubclass.getBardCollegeOfGlamourUnbreakableMajestyUsesRemaining(character);
}

export function consumeUnbreakableMajestyUse(character: Character): Character {
  return glamourSubclass.consumeBardCollegeOfGlamourUnbreakableMajestyUse(
    character,
    getBardFeatureState(character)
  );
}

export function restoreUnbreakableMajestyOnShortRest(character: Character): Character {
  return glamourSubclass.restoreBardCollegeOfGlamourUnbreakableMajestyOnShortRest(
    character,
    getBardFeatureState(character)
  );
}

export function restoreUnbreakableMajestyOnLongRest(character: Character): Character {
  return glamourSubclass.restoreBardCollegeOfGlamourUnbreakableMajestyOnLongRest(
    character,
    getBardFeatureState(character)
  );
}

export function hasActiveMantleOfMajesty(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId" | "statusEntries">>
): boolean {
  return glamourSubclass.hasActiveBardCollegeOfGlamourMantleOfMajesty(character);
}

export function hasActiveUnbreakableMajesty(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId" | "statusEntries">>
): boolean {
  return glamourSubclass.hasActiveBardCollegeOfGlamourUnbreakableMajesty(character);
}

export function applyMantleOfMajestyStatus(character: Character): Character {
  return glamourSubclass.applyBardCollegeOfGlamourMantleOfMajestyStatus(character);
}

export function applyUnbreakableMajestyStatus(character: Character): Character {
  return glamourSubclass.applyBardCollegeOfGlamourUnbreakableMajestyStatus(character);
}

export function activateUnbreakableMajesty(character: Character): Character {
  return glamourSubclass.activateBardCollegeOfGlamourUnbreakableMajesty(character);
}

export function applyInspiredEclipseStatus(character: Character): Character {
  return moonSubclass.applyBardCollegeOfTheMoonInspiredEclipseStatus(character);
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
    !valorSubclass.shouldAdvanceBardCollegeOfValorFeaturesForNewRound(character) &&
    !danceSubclass.shouldAdvanceBardCollegeOfDanceFeaturesForNewRound(character) &&
    !moonSubclass.shouldAdvanceBardCollegeOfTheMoonFeaturesForNewRound(character)
  ) {
    return character;
  }

  return clearBardTurnState(character);
}

function clearBardTurnState(character: Character): Character {
  const characterAfterDanceReset = danceSubclass.clearBardCollegeOfDanceTurnState(
    character,
    getBardFeatureState(character)
  );
  const characterAfterMoonReset = moonSubclass.clearBardCollegeOfTheMoonTurnState(
    characterAfterDanceReset,
    getBardFeatureState(characterAfterDanceReset)
  );

  return valorSubclass.clearBardCollegeOfValorTurnState(
    characterAfterMoonReset,
    getBardFeatureState(characterAfterMoonReset)
  );
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

function getBardicInspirationDrawerDescription(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
) {
  const baseDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.BARDIC_INSPIRATION
  );

  if (!hasFontOfInspiration(character)) {
    return {
      description: baseDescription,
      descriptionAdditions: [] as SpellDescriptionEntry[][]
    };
  }

  const describedAction = appendFeatureSourcedDescriptionAddition(
    {
      description: baseDescription,
      descriptionAdditions: [] as SpellDescriptionEntry[][]
    },
    character,
    CLASS_FEATURE.FONT_OF_INSPIRATION,
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.FONT_OF_INSPIRATION),
    "Font of Inspiration"
  );

  return {
    description: describedAction.description ?? [],
    descriptionAdditions: describedAction.descriptionAdditions ?? []
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
  const hasFallbackSpellSlot =
    fontOfInspirationUnlocked && spellSlotAvailability.remainingCount > 0;
  const bardicInspirationDrawerDescription = getBardicInspirationDrawerDescription(character);
  const disabled = usesRemaining <= 0 && !hasFallbackSpellSlot;
  const disabledReason = disabled
    ? fontOfInspirationUnlocked
      ? "No Bardic Inspiration uses or spell slots remaining."
      : "No Bardic Inspiration uses remaining."
    : undefined;
  const cardUsage = fontOfInspirationUnlocked
    ? createNamedResourceOrResourceCardUsage(
        createFeatureActionCardCost({
          amountText: "1",
          icon: "music"
        }),
        createFeatureActionCardCost({
          amountText: "1+",
          resourceLabel: "Spell Slot"
        })
      )
    : createNamedResourceCardUsage(
        createFeatureActionCardCost({
          amountText: "1",
          icon: "music"
        })
      );
  const headerTags = [
    ...createNamedUsageHeaderTags(
      createFeatureActionCardCost({
        amountText: "1",
        icon: "music"
      }),
      usesRemaining,
      totalUses,
      {
        icon: "music"
      }
    ),
    ...(fontOfInspirationUnlocked
      ? markUsageHeaderTagsAsFallback(
          createNamedUsageHeaderTags(
            createFeatureActionCardCost({
              amountText: "1+",
              resourceLabel: "Spell Slot"
            }),
            spellSlotAvailability.remainingCount,
            spellSlotAvailability.totalCount,
            {
              label: "Spell Slots"
            }
          )
        )
      : [])
  ];

  return {
    key: bardicInspirationActionKey,
    name: "Bardic Inspiration",
    sourceFeature: CLASS_FEATURE.BARDIC_INSPIRATION,
    summary: `Grant a ${bardicDieLabel} inspiration die.`,
    detail:
      "Use a Bonus Action to inspire another creature within 60 feet that can see or hear you.",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    cardUsage,
    usesRemaining,
    usesTotal: totalUses,
    hideUsesTrackerOnCard: true,
    headerTags,
    drawer: {
      kind: "confirm",
      eyebrow: "Bard",
      description: bardicInspirationDrawerDescription.description,
      descriptionAdditions: bardicInspirationDrawerDescription.descriptionAdditions
    },
    execute: {
      kind: "activate"
    },
    disabled,
    disabledReason
  };
}

export function activateBardicInspiration(
  character: Character,
  fallbackSpellSlotLevel?: number
): Character {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return character;
  }

  const bardState = getBardFeatureState(character);
  const usesExpended = bardState.bardicInspirationUsesExpended ?? 0;
  const totalUses = getBardicInspirationUsesTotal(character);

  if (usesExpended < totalUses) {
    const nextCharacter = expendBardicInspirationUse(character);

    return danceSubclass.grantBardCollegeOfDanceAgileStrikes(
      nextCharacter,
      getBardFeatureState(nextCharacter)
    );
  }

  if (!hasFontOfInspiration(character)) {
    return character;
  }

  const spellSlotAvailability = getBardSpellSlotAvailability(character);

  if (spellSlotAvailability.lowestAvailableLevel === null) {
    return character;
  }

  const requestedSlotLevel =
    fallbackSpellSlotLevel !== undefined &&
    Number.isInteger(fallbackSpellSlotLevel) &&
    fallbackSpellSlotLevel >= 1 &&
    fallbackSpellSlotLevel <= spellSlotAvailability.remaining.length
      ? fallbackSpellSlotLevel
      : null;
  const spellSlotLevel =
    requestedSlotLevel !== null
      ? (spellSlotAvailability.remaining[requestedSlotLevel - 1] ?? 0) > 0
        ? requestedSlotLevel
        : null
      : spellSlotAvailability.lowestAvailableLevel;

  if (spellSlotLevel === null) {
    return character;
  }

  const spellSlotIndex = spellSlotLevel - 1;
  const nextSpellSlotsExpended = [...spellSlotAvailability.expended];
  nextSpellSlotsExpended[spellSlotIndex] = (nextSpellSlotsExpended[spellSlotIndex] ?? 0) + 1;

  const nextCharacter = {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };

  return danceSubclass.grantBardCollegeOfDanceAgileStrikes(
    nextCharacter,
    getBardFeatureState(nextCharacter)
  );
}

export function activateBardCollegeOfDanceInspiringMovement(character: Character): Character {
  if (
    !hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION) ||
    !danceSubclass.hasBardCollegeOfDanceInspiringMovementFeature(character)
  ) {
    return character;
  }

  if (getBardicInspirationUsesRemaining(character) <= 0) {
    return character;
  }

  const nextCharacter = expendBardicInspirationUse(character);

  return danceSubclass.grantBardCollegeOfDanceAgileStrikes(
    nextCharacter,
    getBardFeatureState(nextCharacter)
  );
}

export function activateBardCollegeOfTheMoonLunarVitality(character: Character): Character {
  return moonSubclass.activateBardCollegeOfTheMoonLunarVitality(
    character,
    getBardFeatureState(character)
  );
}

export function activateMantleOfInspiration(character: Character): Character {
  return glamourSubclass.activateBardCollegeOfGlamourMantleOfInspiration(character);
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
  lunarVitalityActionKey,
  mantleOfInspirationActionKey,
  mantleOfMajestyActionKey,
  unbreakableMajestyActionKey,
  mantleOfMajestyStatusSourceId,
  unbreakableMajestyStatusSourceId
};
