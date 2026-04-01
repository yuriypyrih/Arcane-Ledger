import { rangerFeatures } from "../../../codex/classes";
import {
  CLASS_FEATURE,
  type SpellEntry
} from "../../../codex/entries";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import type {
  Character,
  CharacterRangerFeatureState,
  LanguageProficiencyEntry,
  SkillName,
  SkillProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../types";
import {
  CONDITION_NAME,
  LANGUAGE_PROFICIENCY,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SENSE,
  getSkillProficiencyForSkillName,
  isSkillName,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  WEAPON_PROFICIENCY,
  languageEntries
} from "../../../types";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../combat";
import { getAbilityModifier } from "../gameplay";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../traits";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureLanguageProficiencyEntry,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus,
  FeatureWeaponProficiencyEntry,
  SpeedFeatureContext
} from "./types";
import {
  getWeaponMasteryOptions,
  normalizeWeaponMasterySelections
} from "./weaponMastery";

export const favoredEnemyActionKey = "ranger-favored-enemy";
export const tirelessActionKey = "ranger-tireless";
export const naturesVeilActionKey = "ranger-natures-veil";
const rangerWeaponMasterySource = "Weapon Mastery";
const rangerWeaponMasterySelectionCount = 2;
const huntersMarkSpellId = "spell-hunters-mark";
const rangerDeftExplorerSource = "Deft Explorer";
const rangerExpertiseSource = "Level 9: Expertise";
const rangerRovingSpeedBonusValue = 10;
const rangerRovingSpeedBonusLabel = "Roving";
const rangerFeralSensesSource = "Feral Senses";
const rangerNaturesVeilSource = "Nature's Veil";
const rangerNaturesVeilSourceId = "feature-ranger-natures-veil";
const rangerNaturesVeilDurationRounds = 2;

const rangerLanguageOptions = languageEntries.map((entry) => entry.proficiency);

const rangerWeaponMasteryOptions = getWeaponMasteryOptions();

function dedupe<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function getRangerFeatureRow(level: number) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = rangerFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedRangerFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return rangerFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

export function hasRangerFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Ranger") {
    return false;
  }

  return getUnlockedRangerFeatures(character.level).has(feature);
}

function hasRangerDeftExplorerFeature(character: Pick<Character, "className" | "level">): boolean {
  return hasRangerFeature(character, CLASS_FEATURE.DEFT_EXPLORER);
}

function hasRangerLevel9ExpertiseFeature(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasRangerFeature(character, CLASS_FEATURE.EXPERTISE);
}

function getRangerAdditionalAttackCount(character: Pick<Character, "className" | "level">): number {
  return hasRangerFeature(character, CLASS_FEATURE.EXTRA_ATTACK) ? 1 : 0;
}

function normalizeRangerWeaponMasteries(selections: unknown): WEAPON_PROFICIENCY[] {
  return normalizeWeaponMasterySelections(
    selections,
    rangerWeaponMasteryOptions,
    rangerWeaponMasterySelectionCount
  );
}

function normalizeRangerExpertiseSelection(value: unknown): SkillName | undefined {
  return typeof value === "string" && isSkillName(value) ? value : undefined;
}

function normalizeRangerExpertiseSelections(value: unknown): SkillName[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return dedupe(
    value.filter((entry): entry is SkillName => typeof entry === "string" && isSkillName(entry))
  ).slice(0, 2);
}

function normalizeRangerLanguageSelections(value: unknown): LANGUAGE_PROFICIENCY[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const optionSet = new Set<LANGUAGE_PROFICIENCY>(rangerLanguageOptions);

  return dedupe(
    value.filter(
      (selection): selection is LANGUAGE_PROFICIENCY =>
        typeof selection === "string" && optionSet.has(selection as LANGUAGE_PROFICIENCY)
    )
  ).slice(0, 2);
}

function createRangerExpertiseEntry(
  skill: SkillName,
  sourceLabel: string
): SkillProficiencyEntry | null {
  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: sourceLabel,
    proficiency: getSkillProficiencyForSkillName(skill),
    proficiencyLevel: PROF_LEVEL.EXPERT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  };
}

function getRangerFeatureState(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): CharacterRangerFeatureState {
  return normalizeRangerFeatureState(character.classFeatureState?.ranger, character);
}

export function normalizeRangerFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "abilities">>
): CharacterRangerFeatureState {
  const hasFavoredEnemy = hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY);
  const hasTireless = hasRangerFeature(character, CLASS_FEATURE.TIRELESS);
  const hasNaturesVeil = hasRangerFeature(character, CLASS_FEATURE.NATURES_VEIL);
  const hasWeaponMastery = hasRangerFeature(character, CLASS_FEATURE.WEAPON_MASTERY);
  const hasDeftExplorer = hasRangerDeftExplorerFeature(character);
  const hasLevel9Expertise = hasRangerLevel9ExpertiseFeature(character);
  const additionalAttackCount = getRangerAdditionalAttackCount(character);

  if (
    !hasFavoredEnemy &&
    !hasTireless &&
    !hasNaturesVeil &&
    !hasWeaponMastery &&
    !hasDeftExplorer &&
    !hasLevel9Expertise &&
    additionalAttackCount <= 0
  ) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterRangerFeatureState>) : {};
  const favoredEnemyTotal = hasFavoredEnemy
    ? (getRangerFeatureRow(character.level)?.favoredEnemy ?? 0)
    : 0;
  const tirelessTotal = hasTireless ? getRangerTirelessUsesTotal(character) : 0;
  const naturesVeilTotal = hasNaturesVeil ? getRangerNaturesVeilUsesTotal(character) : 0;
  const deftExplorerExpertise = hasDeftExplorer
    ? normalizeRangerExpertiseSelection(record.deftExplorerExpertise)
    : undefined;
  const level9Expertise = hasLevel9Expertise
    ? normalizeRangerExpertiseSelections(record.expertise).filter(
        (skill) => skill !== deftExplorerExpertise
      )
    : [];

  return {
    favoredEnemyUsesExpended: hasFavoredEnemy
      ? Math.max(
          0,
          Math.min(
            favoredEnemyTotal,
            Number.isFinite(Number(record.favoredEnemyUsesExpended))
              ? Math.floor(Number(record.favoredEnemyUsesExpended))
              : 0
          )
        )
      : undefined,
    tirelessUsesExpended: hasTireless
      ? Math.max(
          0,
          Math.min(
            tirelessTotal,
            Number.isFinite(Number(record.tirelessUsesExpended))
              ? Math.floor(Number(record.tirelessUsesExpended))
              : 0
          )
        )
      : undefined,
    naturesVeilUsesExpended: hasNaturesVeil
      ? Math.max(
          0,
          Math.min(
            naturesVeilTotal,
            Number.isFinite(Number(record.naturesVeilUsesExpended))
              ? Math.floor(Number(record.naturesVeilUsesExpended))
              : 0
          )
        )
      : undefined,
    deftExplorerExpertise,
    deftExplorerLanguages: hasDeftExplorer
      ? normalizeRangerLanguageSelections(record.deftExplorerLanguages)
      : undefined,
    expertise: hasLevel9Expertise ? level9Expertise : undefined,
    extraAttacksRemainingThisTurn:
      additionalAttackCount > 0
        ? Math.max(
            0,
            Math.min(
              additionalAttackCount,
              Number.isFinite(Number(record.extraAttacksRemainingThisTurn))
                ? Math.floor(Number(record.extraAttacksRemainingThisTurn))
                : 0
            )
          )
        : undefined,
    weaponMasteries: hasWeaponMastery
      ? normalizeRangerWeaponMasteries(record.weaponMasteries)
      : undefined
  };
}

export function getRangerAlwaysPreparedSpellIds(
  character: Pick<Character, "className" | "level">
): string[] {
  if (!hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY)) {
    return [];
  }

  return [huntersMarkSpellId];
}

export function getRangerDerivedStatusEntries(
  character: Pick<Character, "className" | "level">
): DerivedFeatureStatusEntry[] {
  if (!hasRangerFeature(character, CLASS_FEATURE.FERAL_SENSES)) {
    return [];
  }

  return [
    {
      id: "feature-ranger-feral-senses",
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.BLINDSIGHT,
      source: rangerFeralSensesSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      sourceId: "feature-ranger-feral-senses",
      rangeFeet: 30
    }
  ];
}

export function getRangerFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY)) {
    const totalUses = getRangerFavoredEnemyUsesTotal(character);
    const usesRemaining = getRangerFavoredEnemyUsesRemaining(character);

    actions.push({
      key: favoredEnemyActionKey,
      name: "Favored Enemy",
      summary: "Cast Hunter's Mark without a spell slot.",
      detail: "Open Hunter's Mark and cast it using your Favored Enemy charge.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      interaction: "select",
      usesRemaining,
      usesTotal: totalUses,
      drawer: {
        kind: "confirm",
        eyebrow: "Ranger",
        confirmLabel: "Open Hunter's Mark"
      },
      execute: {
        kind: "spell",
        spellSource: "fixed",
        effectKind: "favored-enemy",
        spellId: huntersMarkSpellId,
        spellLevel: 1,
        label: "Open Hunter's Mark",
        actionContextText: "Using Favored Enemy",
        actionAvailabilityText: "Cast without expending a spell slot.",
        actionConsumesSpellSlot: false
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "Favored Enemy recharges on a Long Rest." : undefined
    });
  }

  if (hasRangerFeature(character, CLASS_FEATURE.TIRELESS)) {
    const totalUses = getRangerTirelessUsesTotal(character);
    const usesRemaining = getRangerTirelessUsesRemaining(character);
    const wisdomModifier = getRangerTirelessWisdomModifier(character);
    const minimumTemporaryHitPoints = Math.max(1, 1 + wisdomModifier);
    const maximumTemporaryHitPoints = Math.max(1, 8 + wisdomModifier);

    actions.push({
      key: tirelessActionKey,
      name: "Tireless",
      summary: `${minimumTemporaryHitPoints}~${maximumTemporaryHitPoints} Temp HP`,
      detail:
        "Use a Magic action to gain Temporary Hit Points equal to 1d8 plus your Wisdom modifier, minimum of 1.",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal: totalUses,
      drawer: {
        kind: "confirm",
        eyebrow: "Ranger",
        confirmLabel: "Use Tireless"
      },
      execute: {
        kind: "activate",
        label: "Use Tireless",
        effectKind: "tireless"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "Tireless recharges on a Long Rest." : undefined
    });
  }

  if (hasRangerFeature(character, CLASS_FEATURE.NATURES_VEIL)) {
    const totalUses = getRangerNaturesVeilUsesTotal(character);
    const usesRemaining = getRangerNaturesVeilUsesRemaining(character);

    actions.push({
      key: naturesVeilActionKey,
      name: "Nature's Veil",
      summary: "Invisible for 2 turns",
      detail: "Use a Bonus Action to gain the Invisible condition for 2 turns.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal: totalUses,
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "Nature's Veil recharges on a Long Rest." : undefined
    });
  }

  return actions;
}

export function getRangerDeftExplorerExpertiseSelection(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillName | null {
  return getRangerFeatureState(character).deftExplorerExpertise ?? null;
}

export function setRangerDeftExplorerExpertiseSelection(
  character: Character,
  selection: SkillName | null
): Character {
  if (!hasRangerDeftExplorerFeature(character)) {
    return character;
  }

  const rangerState = getRangerFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        deftExplorerExpertise: selection ?? undefined
      }
    }
  };
}

export function getRangerDeftExplorerLanguageSelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): LANGUAGE_PROFICIENCY[] {
  return (getRangerFeatureState(character).deftExplorerLanguages ?? []).filter(
    (selection): selection is LANGUAGE_PROFICIENCY =>
      rangerLanguageOptions.includes(selection as LANGUAGE_PROFICIENCY)
  );
}

export function setRangerDeftExplorerLanguageSelections(
  character: Character,
  selections: LANGUAGE_PROFICIENCY[]
): Character {
  if (!hasRangerDeftExplorerFeature(character)) {
    return character;
  }

  const rangerState = getRangerFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        deftExplorerLanguages: normalizeRangerLanguageSelections(selections)
      }
    }
  };
}

export function getRangerLevel9ExpertiseSelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillName[] {
  return getRangerFeatureState(character).expertise ?? [];
}

export function setRangerLevel9ExpertiseSelections(
  character: Character,
  selections: SkillName[]
): Character {
  if (!hasRangerLevel9ExpertiseFeature(character)) {
    return character;
  }

  const rangerState = getRangerFeatureState(character);
  const deftExplorerExpertise = rangerState.deftExplorerExpertise;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        expertise: normalizeRangerExpertiseSelections(selections).filter(
          (skill) => skill !== deftExplorerExpertise
        )
      }
    }
  };
}

export function getRangerFavoredEnemyUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY)) {
    return 0;
  }

  return getRangerFeatureRow(character.level)?.favoredEnemy ?? 0;
}

export function getRangerFavoredEnemyUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): number {
  const totalUses = getRangerFavoredEnemyUsesTotal(character);
  const usesExpended =
    normalizeRangerFeatureState(character.classFeatureState?.ranger, character)
      .favoredEnemyUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

function getRangerTirelessWisdomModifier(character: Partial<Pick<Character, "abilities">>): number {
  return getAbilityModifier(character.abilities?.WIS ?? 10);
}

export function getRangerTirelessUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "abilities">>
): number {
  if (!hasRangerFeature(character, CLASS_FEATURE.TIRELESS)) {
    return 0;
  }

  return Math.max(1, getRangerTirelessWisdomModifier(character));
}

export function getRangerNaturesVeilUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "abilities">>
): number {
  if (!hasRangerFeature(character, CLASS_FEATURE.NATURES_VEIL)) {
    return 0;
  }

  return Math.max(1, getRangerTirelessWisdomModifier(character));
}

export function getRangerTirelessTemporaryHitPointsFormula(
  character: Partial<Pick<Character, "abilities">>
): string {
  const wisdomModifier = getRangerTirelessWisdomModifier(character);

  if (wisdomModifier === 0) {
    return "1d8";
  }

  return `1d8${wisdomModifier >= 0 ? "+" : ""}${wisdomModifier}`;
}

export function getRangerSpellDamageFormula(
  character: Pick<Character, "className" | "level">,
  spell: Pick<SpellEntry, "id">
): string | null {
  if (
    spell.id !== huntersMarkSpellId ||
    !hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY)
  ) {
    return null;
  }

  return hasRangerFeature(character, CLASS_FEATURE.FOE_SLAYER) ? "1d10" : "1d6";
}

export function getRangerSpellEntry(
  character: Pick<Character, "className" | "level">,
  spell: SpellEntry
): SpellEntry {
  if (spell.id !== huntersMarkSpellId || !hasRangerFeature(character, CLASS_FEATURE.FOE_SLAYER)) {
    return spell;
  }

  return {
    ...spell,
    description: spell.description.map((entry, index) =>
      index === 0 && typeof entry === "string"
        ? entry.replace("extra 1d6 damage", "extra <strong>1d10</strong> damage")
        : entry
    )
  };
}

export function getRangerTirelessUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): number {
  const totalUses = getRangerTirelessUsesTotal(character);
  const usesExpended =
    normalizeRangerFeatureState(character.classFeatureState?.ranger, character)
      .tirelessUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getRangerNaturesVeilUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): number {
  const totalUses = getRangerNaturesVeilUsesTotal(character);
  const usesExpended =
    normalizeRangerFeatureState(character.classFeatureState?.ranger, character)
      .naturesVeilUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function consumeRangerFavoredEnemyUse(character: Character): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);
  const totalUses = getRangerFavoredEnemyUsesTotal(character);
  const usesExpended = rangerState.favoredEnemyUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        favoredEnemyUsesExpended: usesExpended + 1
      }
    }
  };
}

export function consumeRangerTirelessUse(character: Character): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.TIRELESS)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);
  const totalUses = getRangerTirelessUsesTotal(character);
  const usesExpended = rangerState.tirelessUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        tirelessUsesExpended: usesExpended + 1
      }
    }
  };
}

export function consumeRangerNaturesVeilUse(character: Character): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.NATURES_VEIL)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);
  const totalUses = getRangerNaturesVeilUsesTotal(character);
  const usesExpended = rangerState.naturesVeilUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        naturesVeilUsesExpended: usesExpended + 1
      }
    }
  };
}

export function activateRangerNaturesVeil(character: Character): Character {
  const nextCharacter = consumeRangerNaturesVeilUse(character);

  if (nextCharacter === character) {
    return character;
  }

  const nextStatusEntries = [
    ...normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
      (entry) => entry.sourceId !== rangerNaturesVeilSourceId
    ),
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.CONDITIONS,
      value: CONDITION_NAME.INVISIBLE,
      source: rangerNaturesVeilSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: rangerNaturesVeilDurationRounds,
        tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
      },
      sourceId: rangerNaturesVeilSourceId
    })
  ];

  return {
    ...nextCharacter,
    statusEntries: nextStatusEntries
  };
}

export function restoreRangerFavoredEnemyOnLongRest(character: Character): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);

  if ((rangerState.favoredEnemyUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        favoredEnemyUsesExpended: 0
      }
    }
  };
}

export function restoreRangerTirelessOnLongRest(character: Character): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.TIRELESS)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);

  if ((rangerState.tirelessUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        tirelessUsesExpended: 0
      }
    }
  };
}

export function restoreRangerNaturesVeilOnLongRest(character: Character): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.NATURES_VEIL)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);

  if ((rangerState.naturesVeilUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        naturesVeilUsesExpended: 0
      }
    }
  };
}

export function applyLongRestToRangerFeatures(character: Character): Character {
  const restoredCharacter = restoreRangerNaturesVeilOnLongRest(
    restoreRangerTirelessOnLongRest(restoreRangerFavoredEnemyOnLongRest(character))
  );
  const rangerState = getRangerFeatureState(restoredCharacter);

  if ((rangerState.extraAttacksRemainingThisTurn ?? 0) === 0) {
    return restoredCharacter;
  }

  return {
    ...restoredCharacter,
    classFeatureState: {
      ...restoredCharacter.classFeatureState,
      ranger: {
        ...rangerState,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}

export function applyShortRestToRangerFeatures(character: Character): Character {
  const rangerState = getRangerFeatureState(character);

  if ((rangerState.extraAttacksRemainingThisTurn ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}

export function advanceRangerFeaturesForNewRound(character: Character): Character {
  if (getRangerAdditionalAttackCount(character) <= 0) {
    return character;
  }

  const rangerState = getRangerFeatureState(character);

  if ((rangerState.extraAttacksRemainingThisTurn ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}

export function getRangerWeaponMasterySelectionCount(
  character: Pick<Character, "className" | "level">
): number {
  return hasRangerFeature(character, CLASS_FEATURE.WEAPON_MASTERY)
    ? rangerWeaponMasterySelectionCount
    : 0;
}

export function getRangerWeaponMasteryOptions(): WEAPON_PROFICIENCY[] {
  return rangerWeaponMasteryOptions;
}

export function getRangerWeaponAttackMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getRangerFeatureState(character).extraAttacksRemainingThisTurn ?? 0;
}

export function getRangerWeaponMasterySelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): WEAPON_PROFICIENCY[] {
  return (
    normalizeRangerFeatureState(character.classFeatureState?.ranger, character).weaponMasteries ??
    []
  );
}

export function setRangerWeaponMasterySelections(
  character: Character,
  selections: WEAPON_PROFICIENCY[]
): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        weaponMasteries: normalizeRangerWeaponMasteries(selections)
      }
    }
  };
}

export function getRangerWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  return getRangerWeaponMasterySelections(character).map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr: rangerWeaponMasterySource,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT,
        overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
      }) satisfies WeaponProficiencyEntry
  );
}

export function getRangerSkillProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSkillProficiencyEntry[] {
  const entries: FeatureSkillProficiencyEntry[] = [];
  const deftExplorerExpertise = getRangerDeftExplorerExpertiseSelection(character);

  if (deftExplorerExpertise) {
    const entry = createRangerExpertiseEntry(deftExplorerExpertise, rangerDeftExplorerSource);

    if (entry) {
      entries.push(entry);
    }
  }

  getRangerLevel9ExpertiseSelections(character).forEach((skill) => {
    const entry = createRangerExpertiseEntry(skill, rangerExpertiseSource);

    if (entry) {
      entries.push(entry);
    }
  });

  return entries;
}

export function getRangerLanguageProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureLanguageProficiencyEntry[] {
  if (!hasRangerDeftExplorerFeature(character)) {
    return [];
  }

  return getRangerDeftExplorerLanguageSelections(character).map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr: rangerDeftExplorerSource,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT
      }) satisfies LanguageProficiencyEntry
  );
}

export function getRangerSpeedBonuses(
  character: Pick<Character, "className" | "level">,
  context: SpeedFeatureContext
): FeatureSpeedBonus[] {
  if (!hasRangerFeature(character, CLASS_FEATURE.ROVING) || context.wornBodyArmorType === "heavy") {
    return [];
  }

  return [
    {
      label: rangerRovingSpeedBonusLabel,
      value: rangerRovingSpeedBonusValue
    }
  ];
}

export function consumeRangerWeaponAttack(character: Character): Character {
  if (character.className !== "Ranger") {
    return isRoundTrackerResourceAvailable(character.roundTracker, "action")
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
        }
      : character;
  }

  const rangerState = getRangerFeatureState(character);
  const extraAttacksRemaining = rangerState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        ranger: {
          ...rangerState,
          extraAttacksRemainingThisTurn: getRangerAdditionalAttackCount(character)
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
      ranger: {
        ...rangerState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}
