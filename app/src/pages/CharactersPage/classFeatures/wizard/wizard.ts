import { wizardFeatures, type WizardFeatureClassObj } from "../../../../codex/classes";
import { CLASS_FEATURE, getSpellEntryById, type SpellEntry } from "../../../../codex/entries";
import type {
  Character,
  CharacterWizardFeatureState,
  SkillName,
  SkillProficiencyEntry
} from "../../../../types";
import {
  getSkillProficiencyForSkillName,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SKILL
} from "../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import {
  getPreparedSpellSelectionOptionsForCharacter,
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../spellcasting";
import type {
  FeatureActionCard,
  FeatureSkillProficiencyEntry,
  WeaponAttackConsumptionContext
} from "../types";
import {
  getWizardSavantSelectionCount,
  hasWizardSavantFeature,
  normalizeWizardSavantSpellIds
} from "./savant";
import {
  advanceWizardSubclassFeaturesForNewRound,
  activateWizardSubclassFeatureAction,
  applyWizardSubclassFeaturesAfterSpellCast,
  getWizardSubclassSpellbookSpellEntry,
  restoreWizardSubclassFeaturesOnArcaneRecovery,
  restoreWizardSubclassFeaturesOnShortRest,
  restoreWizardSubclassFeaturesOnLongRest
} from "./subclasses";
import {
  canUseWizardBladesingerActionCantripReplacement,
  consumeWizardBladesingerActionCantrip,
  consumeWizardBladesingerWeaponAttack,
  getWizardBladesongUsesTotal,
  hasWizardBladesingerSpellcastWeaponBonusActionAvailable,
  getWizardBladesingerWeaponAttackMultiCount,
  normalizeWizardBladesingerFeatureState
} from "./subclasses/wizardBladesinger";
import {
  getWizardIllusionistIllusorySelfUsesTotal,
  getWizardIllusionistPhantasmalCreaturesUsesTotal
} from "./subclasses/wizardIllusionist";
import { normalizeWizardDivinerPortentRolls } from "./subclasses/wizardDivinerPortent";

const arcaneRecoveryUsesTotal = 1;
const wizardScholarSource = "Scholar";
const wizardSpellMasteryLevels = [1, 2] as const;
const wizardSignatureSpellLevel = 3;
const wizardSignatureSpellSelectionCount = 2;
const wizardSavantMaxSelectionCount = getWizardSavantSelectionCount(20);
const wizardScholarSkillOptions: SkillName[] = [
  SKILL.ARCANA,
  SKILL.HISTORY,
  SKILL.INVESTIGATION,
  SKILL.MEDICINE,
  SKILL.NATURE,
  SKILL.RELIGION
];

export const arcaneRecoveryActionKey = "wizard-arcane-recovery";

export type ArcaneRecoverySlotLevel = 1 | 2 | 3 | 4 | 5;
export type ArcaneRecoverySelection = Partial<Record<ArcaneRecoverySlotLevel, number>>;
export type WizardSpellMasteryLevel = (typeof wizardSpellMasteryLevels)[number];

function clampWizardLevel(level: number): number {
  return Math.max(1, Math.min(20, Math.floor(level)));
}

function getWizardFeatureRow(level: number): WizardFeatureClassObj | null {
  const normalizedLevel = clampWizardLevel(level);
  const matchingRows = wizardFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function getUnlockedWizardFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = clampWizardLevel(level);

  return wizardFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function getWizardFeatureState(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "classFeatureState" | "subclassId">>
): CharacterWizardFeatureState {
  return normalizeWizardFeatureState(character.classFeatureState?.wizard, character);
}

function normalizeWizardScholarSelection(value: unknown): SkillName | undefined {
  return typeof value === "string" &&
    wizardScholarSkillOptions.some((skillName) => skillName === value)
    ? (value as SkillName)
    : undefined;
}

function createWizardScholarEntry(skill: SkillName): SkillProficiencyEntry | null {
  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: wizardScholarSource,
    proficiency: getSkillProficiencyForSkillName(skill),
    proficiencyLevel: PROF_LEVEL.EXPERT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  };
}

function normalizeWizardSpellMasterySpellIds(
  value: unknown
): Partial<Record<WizardSpellMasteryLevel, string>> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const record = value as Partial<Record<WizardSpellMasteryLevel, unknown>>;
  const normalized: Partial<Record<WizardSpellMasteryLevel, string>> = {};

  wizardSpellMasteryLevels.forEach((spellLevel) => {
    const spellId = record[spellLevel];

    if (typeof spellId === "string" && spellId.trim().length > 0) {
      normalized[spellLevel] = spellId;
    }
  });

  return normalized;
}

function normalizeWizardSignatureSpellIds(value: unknown): string[] {
  return normalizeWizardTrackedSpellIds(value, wizardSignatureSpellSelectionCount);
}

function normalizeWizardTrackedSpellIds(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((entry): entry is string => typeof entry === "string"))].slice(
    0,
    limit
  );
}

function getWizardPreparedSpellSelectionOptions(character: Pick<Character, "className" | "level">) {
  return getPreparedSpellSelectionOptionsForCharacter(character.className, character.level);
}

function isWizardSpellMasterySpellIdValid(
  character: Pick<Character, "className" | "level" | "spellbookSpellIds" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>,
  spellLevel: WizardSpellMasteryLevel,
  spellId: string | undefined
): spellId is string {
  if (!spellId) {
    return false;
  }

  const spellbookSpellIdSet = new Set([
    ...(Array.isArray(character.spellbookSpellIds)
      ? character.spellbookSpellIds.filter((entry): entry is string => typeof entry === "string")
      : []),
    ...getWizardAlwaysSpellbookSpellIds(character)
  ]);

  if (!spellbookSpellIdSet.has(spellId)) {
    return false;
  }

  const spell = getSpellEntryById(spellId);

  if (!spell || getSpellLevel(spell) !== spellLevel) {
    return false;
  }

  const availableSpellIds = new Set(
    getWizardPreparedSpellSelectionOptions(character).map((entry) => entry.id)
  );

  return availableSpellIds.has(spellId);
}

function isWizardSignatureSpellIdValid(
  character: Pick<Character, "className" | "level" | "spellbookSpellIds" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>,
  spellId: string | undefined
): spellId is string {
  if (!spellId) {
    return false;
  }

  const spellbookSpellIdSet = new Set([
    ...(Array.isArray(character.spellbookSpellIds)
      ? character.spellbookSpellIds.filter((entry): entry is string => typeof entry === "string")
      : []),
    ...getWizardAlwaysSpellbookSpellIds(character)
  ]);

  if (!spellbookSpellIdSet.has(spellId)) {
    return false;
  }

  const spell = getSpellEntryById(spellId);

  if (!spell || getSpellLevel(spell) !== wizardSignatureSpellLevel) {
    return false;
  }

  const availableSpellIds = new Set(
    getWizardPreparedSpellSelectionOptions(character).map((entry) => entry.id)
  );

  return availableSpellIds.has(spellId);
}

function getArcaneRecoveryEligibleExpendedSlotCount(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): number {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );

  return spellSlotsExpended
    .slice(0, 5)
    .reduce((total, expendedAtLevel) => total + expendedAtLevel, 0);
}

function normalizeArcaneRecoverySelection(
  value: ArcaneRecoverySelection,
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): ArcaneRecoverySelection {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const normalizedSelection: ArcaneRecoverySelection = {};

  ([1, 2, 3, 4, 5] as const).forEach((slotLevel) => {
    const rawValue = Number(value[slotLevel]);
    const safeValue = Number.isFinite(rawValue) ? Math.max(0, Math.floor(rawValue)) : 0;
    const maxValue = spellSlotsExpended[slotLevel - 1] ?? 0;

    if (safeValue > 0 && maxValue > 0) {
      normalizedSelection[slotLevel] = Math.min(maxValue, safeValue);
    }
  });

  return normalizedSelection;
}

export function hasWizardFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Wizard") {
    return false;
  }

  return getUnlockedWizardFeatures(character.level).has(feature);
}

export function normalizeWizardFeatureState(
  record: CharacterWizardFeatureState | undefined,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): CharacterWizardFeatureState {
  if (character.className !== "Wizard") {
    return {};
  }

  const hasArcaneRecovery = hasWizardFeature(character, CLASS_FEATURE.ARCANE_RECOVERY);
  const hasScholar = hasWizardFeature(character, CLASS_FEATURE.SCHOLAR);
  const hasSpellMastery = hasWizardFeature(character, CLASS_FEATURE.SPELL_MASTERY);
  const hasSignatureSpells = hasWizardFeature(character, CLASS_FEATURE.SIGNATURE_SPELLS);
  const bladesongUsesTotal = getWizardBladesongUsesTotal(character);
  const phantasmalCreaturesUsesTotal = getWizardIllusionistPhantasmalCreaturesUsesTotal(character);
  const illusorySelfUsesTotal = getWizardIllusionistIllusorySelfUsesTotal(character);
  const rawArcaneRecoveryUsesExpended = Number(record?.arcaneRecoveryUsesExpended);
  const rawBladesongUsesExpended = Number(record?.bladesongUsesExpended);
  const rawPhantasmalCreaturesUsesExpended = Number(record?.phantasmalCreaturesUsesExpended);
  const rawIllusorySelfUsesExpended = Number(record?.illusorySelfUsesExpended);

  return {
    arcaneRecoveryUsesExpended:
      hasArcaneRecovery && Number.isFinite(rawArcaneRecoveryUsesExpended)
        ? Math.max(0, Math.min(arcaneRecoveryUsesTotal, Math.floor(rawArcaneRecoveryUsesExpended)))
        : 0,
    bladesongUsesExpended: Number.isFinite(rawBladesongUsesExpended)
      ? Math.max(
          0,
          Math.min(
            bladesongUsesTotal > 0 ? bladesongUsesTotal : Math.floor(rawBladesongUsesExpended),
            Math.floor(rawBladesongUsesExpended)
          )
        )
      : 0,
    ...normalizeWizardBladesingerFeatureState(record ?? {}, character),
    scholar: hasScholar ? normalizeWizardScholarSelection(record?.scholar) : undefined,
    savantSpellIds:
      character.subclassId === undefined
        ? normalizeWizardTrackedSpellIds(record?.savantSpellIds, wizardSavantMaxSelectionCount)
        : hasWizardSavantFeature(character)
          ? normalizeWizardSavantSpellIds(record?.savantSpellIds, character)
          : undefined,
    phantasmalCreaturesUsesExpended:
      phantasmalCreaturesUsesTotal > 0 && Number.isFinite(rawPhantasmalCreaturesUsesExpended)
        ? Math.max(
            0,
            Math.min(phantasmalCreaturesUsesTotal, Math.floor(rawPhantasmalCreaturesUsesExpended))
          )
        : 0,
    illusorySelfUsesExpended:
      illusorySelfUsesTotal > 0 && Number.isFinite(rawIllusorySelfUsesExpended)
        ? Math.max(0, Math.min(illusorySelfUsesTotal, Math.floor(rawIllusorySelfUsesExpended)))
        : 0,
    spellMasterySpellIds: hasSpellMastery
      ? normalizeWizardSpellMasterySpellIds(record?.spellMasterySpellIds)
      : undefined,
    signatureSpellIds: hasSignatureSpells
      ? normalizeWizardSignatureSpellIds(record?.signatureSpellIds)
      : undefined,
    expendedSignatureSpellIds: hasSignatureSpells
      ? normalizeWizardSignatureSpellIds(record?.expendedSignatureSpellIds)
      : undefined,
    portentRolls: normalizeWizardDivinerPortentRolls(record?.portentRolls, character)
  };
}

export function getWizardScholarSelection(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillName | null {
  return getWizardFeatureState(character).scholar ?? null;
}

export function setWizardScholarSelection(
  character: Character,
  selection: SkillName | null
): Character {
  if (!hasWizardFeature(character, CLASS_FEATURE.SCHOLAR)) {
    return character;
  }

  const wizardState = getWizardFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        scholar: normalizeWizardScholarSelection(selection) ?? undefined
      }
    }
  };
}

export function getWizardSkillProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSkillProficiencyEntry[] {
  const scholarSelection = getWizardScholarSelection(character);

  if (!scholarSelection) {
    return [];
  }

  const entry = createWizardScholarEntry(scholarSelection);

  return entry ? [entry] : [];
}

export function getWizardSavantSpellIds(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "classFeatureState" | "subclassId">>
): string[] {
  if (!hasWizardSavantFeature(character)) {
    return [];
  }

  return normalizeWizardSavantSpellIds(getWizardFeatureState(character).savantSpellIds, character);
}

export function getWizardAlwaysSpellbookSpellIds(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "classFeatureState" | "subclassId">>
): string[] {
  return getWizardSavantSpellIds(character);
}

export function setWizardSavantSpellIds(character: Character, spellIds: string[]): Character {
  if (!hasWizardSavantFeature(character)) {
    return character;
  }

  const wizardState = getWizardFeatureState(character);
  const normalizedSpellIds = normalizeWizardSavantSpellIds(spellIds, character);
  const savantSpellIdSet = new Set(normalizedSpellIds);
  const nextSpellbookSpellIds = Array.isArray(character.spellbookSpellIds)
    ? character.spellbookSpellIds.filter((spellId) => !savantSpellIdSet.has(spellId))
    : [];

  return {
    ...character,
    spellbookSpellIds: nextSpellbookSpellIds,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        savantSpellIds: normalizedSpellIds
      }
    }
  };
}

export function getWizardSpellMasterySelection(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds"> &
    Partial<Pick<Character, "subclassId">>,
  spellLevel: WizardSpellMasteryLevel
): string | null {
  if (!hasWizardFeature(character, CLASS_FEATURE.SPELL_MASTERY)) {
    return null;
  }

  const spellId = getWizardFeatureState(character).spellMasterySpellIds?.[spellLevel];

  return isWizardSpellMasterySpellIdValid(character, spellLevel, spellId) ? spellId : null;
}

export function getWizardSpellMasterySpellIds(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds"> &
    Partial<Pick<Character, "subclassId">>
): string[] {
  if (!hasWizardFeature(character, CLASS_FEATURE.SPELL_MASTERY)) {
    return [];
  }

  return wizardSpellMasteryLevels.flatMap((spellLevel) => {
    const spellId = getWizardSpellMasterySelection(character, spellLevel);
    return spellId ? [spellId] : [];
  });
}

export function setWizardSpellMasterySelection(
  character: Character,
  spellLevel: WizardSpellMasteryLevel,
  spellId: string | null
): Character {
  if (!hasWizardFeature(character, CLASS_FEATURE.SPELL_MASTERY)) {
    return character;
  }

  const wizardState = getWizardFeatureState(character);
  const currentSelections = normalizeWizardSpellMasterySpellIds(wizardState.spellMasterySpellIds);
  const nextSelections = { ...currentSelections };

  if (spellId === null) {
    delete nextSelections[spellLevel];
  } else {
    const spell = getSpellEntryById(spellId);

    if (!spell || getSpellLevel(spell) !== spellLevel) {
      return character;
    }

    nextSelections[spellLevel] = spellId;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        spellMasterySpellIds: nextSelections
      }
    }
  };
}

export function syncWizardSpellMasterySelectionsToSpellbook(character: Character): Character {
  if (!hasWizardFeature(character, CLASS_FEATURE.SPELL_MASTERY)) {
    return character;
  }

  const level1Selection = getWizardSpellMasterySelection(character, 1);
  const level2Selection = getWizardSpellMasterySelection(character, 2);
  const wizardState = getWizardFeatureState(character);
  const currentSelections = normalizeWizardSpellMasterySpellIds(wizardState.spellMasterySpellIds);

  if (
    (currentSelections[1] ?? null) === level1Selection &&
    (currentSelections[2] ?? null) === level2Selection
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        spellMasterySpellIds: {
          ...(level1Selection ? { 1: level1Selection } : {}),
          ...(level2Selection ? { 2: level2Selection } : {})
        }
      }
    }
  };
}

export function getWizardAlwaysPreparedSpellIds(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds"> &
    Partial<Pick<Character, "subclassId">>
): string[] {
  return [...getWizardSpellMasterySpellIds(character), ...getWizardSignatureSpellIds(character)];
}

export function getWizardSignatureSpellIds(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds"> &
    Partial<Pick<Character, "subclassId">>
): string[] {
  if (!hasWizardFeature(character, CLASS_FEATURE.SIGNATURE_SPELLS)) {
    return [];
  }

  return normalizeWizardSignatureSpellIds(
    getWizardFeatureState(character).signatureSpellIds
  ).filter((spellId): spellId is string => isWizardSignatureSpellIdValid(character, spellId));
}

export function setWizardSignatureSpellIds(character: Character, spellIds: string[]): Character {
  if (!hasWizardFeature(character, CLASS_FEATURE.SIGNATURE_SPELLS)) {
    return character;
  }

  const wizardState = getWizardFeatureState(character);
  const normalizedSpellIds = normalizeWizardSignatureSpellIds(spellIds);
  const nextExpendedIds = normalizeWizardSignatureSpellIds(
    wizardState.expendedSignatureSpellIds
  ).filter((spellId) => normalizedSpellIds.includes(spellId));

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        signatureSpellIds: normalizedSpellIds,
        expendedSignatureSpellIds: nextExpendedIds
      }
    }
  };
}

export function getWizardExpendedSignatureSpellIds(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds"> &
    Partial<Pick<Character, "subclassId">>
): string[] {
  const signatureSpellIdSet = new Set(getWizardSignatureSpellIds(character));
  return normalizeWizardSignatureSpellIds(
    getWizardFeatureState(character).expendedSignatureSpellIds
  ).filter((spellId) => signatureSpellIdSet.has(spellId));
}

export function hasWizardSignatureSpellFreeCastAvailable(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds"> &
    Partial<Pick<Character, "subclassId">>,
  spellId: string
): boolean {
  const signatureSpellIds = getWizardSignatureSpellIds(character);

  if (!signatureSpellIds.includes(spellId)) {
    return false;
  }

  return !getWizardExpendedSignatureSpellIds(character).includes(spellId);
}

export function consumeWizardSignatureSpellFreeCast(
  character: Character,
  spellId: string
): Character {
  if (!hasWizardSignatureSpellFreeCastAvailable(character, spellId)) {
    return character;
  }

  const wizardState = getWizardFeatureState(character);
  const expendedIds = getWizardExpendedSignatureSpellIds(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        expendedSignatureSpellIds: [...expendedIds, spellId]
      }
    }
  };
}

export function restoreWizardSignatureSpellsOnShortRest(character: Character): Character {
  if (!hasWizardFeature(character, CLASS_FEATURE.SIGNATURE_SPELLS)) {
    return character;
  }

  const wizardState = getWizardFeatureState(character);

  if ((wizardState.expendedSignatureSpellIds ?? []).length === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        expendedSignatureSpellIds: []
      }
    }
  };
}

export function restoreWizardSignatureSpellsOnLongRest(character: Character): Character {
  return restoreWizardSignatureSpellsOnShortRest(character);
}

export function syncWizardSignatureSpellsToSpellbook(character: Character): Character {
  if (!hasWizardFeature(character, CLASS_FEATURE.SIGNATURE_SPELLS)) {
    return character;
  }

  const validSelectionIds = getWizardSignatureSpellIds(character);
  const validExpendedIds = getWizardExpendedSignatureSpellIds(character);
  const wizardState = getWizardFeatureState(character);
  const currentSelectionIds = normalizeWizardSignatureSpellIds(wizardState.signatureSpellIds);
  const currentExpendedIds = normalizeWizardSignatureSpellIds(
    wizardState.expendedSignatureSpellIds
  );

  if (
    currentSelectionIds.length === validSelectionIds.length &&
    currentSelectionIds.every((spellId, index) => spellId === validSelectionIds[index]) &&
    currentExpendedIds.length === validExpendedIds.length &&
    currentExpendedIds.every((spellId, index) => spellId === validExpendedIds[index])
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        signatureSpellIds: validSelectionIds,
        expendedSignatureSpellIds: validExpendedIds
      }
    }
  };
}

export function applyShortRestToWizardFeatures(character: Character): Character {
  return restoreWizardSubclassFeaturesOnShortRest(
    restoreWizardSignatureSpellsOnShortRest(character)
  );
}

export function applyLongRestToWizardFeatures(character: Character): Character {
  return restoreWizardSubclassFeaturesOnLongRest(
    restoreWizardSignatureSpellsOnLongRest(restoreArcaneRecoveryOnLongRest(character))
  );
}

export function advanceWizardFeaturesForNewRound(character: Character): Character {
  return advanceWizardSubclassFeaturesForNewRound(character);
}

export function applyWizardFeaturesAfterSpellCast(
  character: Character,
  spell: Pick<SpellEntry, "castingTime" | "magicSchool" | "spellLevel">,
  spellSlotLevel: number | null | undefined
): Character {
  return applyWizardSubclassFeaturesAfterSpellCast(character, spell, spellSlotLevel);
}

export function getWizardSpellbookSpellEntry(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "classFeatureState">>,
  spell: SpellEntry
): SpellEntry {
  return getWizardSubclassSpellbookSpellEntry(character, spell);
}

export function getArcaneRecoveryUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasWizardFeature(character, CLASS_FEATURE.ARCANE_RECOVERY) ? arcaneRecoveryUsesTotal : 0;
}

export function getWizardWeaponAttackMultiCount(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  return getWizardBladesingerWeaponAttackMultiCount(character);
}

export function canUseWizardActionCantripReplacement(
  character: Pick<Character, "className" | "roundTracker"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  return canUseWizardBladesingerActionCantripReplacement(character, spell);
}

export function hasWizardSpellcastWeaponBonusActionAvailable(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): boolean {
  return hasWizardBladesingerSpellcastWeaponBonusActionAvailable(character);
}

export function consumeWizardWeaponAttack(
  character: Character,
  action: WeaponAttackConsumptionContext
): Character {
  return consumeWizardBladesingerWeaponAttack(character, action);
}

export function consumeWizardActionCantrip(character: Character): Character {
  return consumeWizardBladesingerActionCantrip(character);
}

export function getArcaneRecoveryUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getArcaneRecoveryUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  return Math.max(
    0,
    totalUses - (getWizardFeatureState(character).arcaneRecoveryUsesExpended ?? 0)
  );
}

export function getArcaneRecoveryRecoveryLevelLimit(
  character: Pick<Character, "className" | "level">
): number {
  return hasWizardFeature(character, CLASS_FEATURE.ARCANE_RECOVERY)
    ? Math.max(0, Math.ceil(clampWizardLevel(character.level) / 2))
    : 0;
}

export function getArcaneRecoverySelectionLevelTotal(selection: ArcaneRecoverySelection): number {
  return ([1, 2, 3, 4, 5] as const).reduce(
    (total, slotLevel) => total + (selection[slotLevel] ?? 0) * slotLevel,
    0
  );
}

export function getWizardFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended">
): FeatureActionCard[] {
  if (!hasWizardFeature(character, CLASS_FEATURE.ARCANE_RECOVERY)) {
    return [];
  }

  const usesRemaining = getArcaneRecoveryUsesRemaining(character);
  const usesTotal = getArcaneRecoveryUsesTotal(character);
  const eligibleExpendedSlotCount = getArcaneRecoveryEligibleExpendedSlotCount(character);
  const disabledReason =
    usesRemaining <= 0
      ? "Arcane Recovery recharges on a Long Rest."
      : eligibleExpendedSlotCount <= 0
        ? "No expended spell slots of level 1-5 to recover."
        : undefined;

  return [
    {
      key: arcaneRecoveryActionKey,
      name: "Arcane Recovery",
      sourceFeature: CLASS_FEATURE.ARCANE_RECOVERY,
      summary: "Recover expended spell slots.",
      detail:
        "Recover expended spell slots with a combined level up to half your Wizard level, rounded up. Slots recovered this way must be level 5 or lower.",
      breakdown: "Recover spell slots",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      drawer: {
        kind: "custom-form",
        eyebrow: "Wizard",
        formKind: "arcane-recovery"
      },
      execute: {
        kind: "custom-form",
        formKind: "arcane-recovery"
      },
      disabled: Boolean(disabledReason),
      disabledReason
    }
  ];
}

export function activateWizardFeatureAction(
  character: Character,
  actionKey: string
): Character | null {
  if (actionKey === arcaneRecoveryActionKey) {
    return character;
  }

  return activateWizardSubclassFeatureAction(character, actionKey);
}

export function activateArcaneRecovery(
  character: Character,
  selection: ArcaneRecoverySelection
): Character {
  if (!hasWizardFeature(character, CLASS_FEATURE.ARCANE_RECOVERY)) {
    return character;
  }

  const usesRemaining = getArcaneRecoveryUsesRemaining(character);

  if (usesRemaining <= 0) {
    return character;
  }

  const normalizedSelection = normalizeArcaneRecoverySelection(selection, character);
  const recoveryLimit = getArcaneRecoveryRecoveryLevelLimit(character);
  const recoveredSlotLevels = ([1, 2, 3, 4, 5] as const).reduce(
    (total, slotLevel) => total + (normalizedSelection[slotLevel] ?? 0) * slotLevel,
    0
  );

  if (recoveredSlotLevels <= 0 || recoveredSlotLevels > recoveryLimit) {
    return character;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const nextSpellSlotsExpended = [...spellSlotsExpended];

  for (const slotLevel of [1, 2, 3, 4, 5] as const) {
    const recoveredCount = normalizedSelection[slotLevel] ?? 0;

    if (recoveredCount <= 0) {
      continue;
    }

    const currentExpended = nextSpellSlotsExpended[slotLevel - 1] ?? 0;

    if (recoveredCount > currentExpended) {
      return character;
    }

    nextSpellSlotsExpended[slotLevel - 1] = currentExpended - recoveredCount;
  }

  const wizardState = getWizardFeatureState(character);

  return restoreWizardSubclassFeaturesOnArcaneRecovery({
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        arcaneRecoveryUsesExpended: Math.min(
          arcaneRecoveryUsesTotal,
          (wizardState.arcaneRecoveryUsesExpended ?? 0) + 1
        )
      }
    }
  });
}

export function restoreArcaneRecoveryOnLongRest(character: Character): Character {
  if (!hasWizardFeature(character, CLASS_FEATURE.ARCANE_RECOVERY)) {
    return character;
  }

  const wizardState = getWizardFeatureState(character);

  if ((wizardState.arcaneRecoveryUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        arcaneRecoveryUsesExpended: 0
      }
    }
  };
}

export function getWizardFeatureRowForCharacter(
  character: Pick<Character, "className" | "level">
): WizardFeatureClassObj | null {
  return character.className === "Wizard" ? getWizardFeatureRow(character.level) : null;
}
