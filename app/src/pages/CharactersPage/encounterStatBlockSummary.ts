import { DAMAGE_TYPE } from "../../codex/entries";
import {
  CONDITION_NAME,
  CUSTOM_LANGUAGE_PREFIX,
  EFFECT_NAME,
  PROF_LEVEL,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type CharacterStatusEntry,
  type HydratedCharacter,
  type PortableEncounterStatBlock
} from "../../types";
import { formatCodexLabel } from "../../utils/codex";
import { abilityKeys } from "./constants";
import { getCharacterRuntime, type CharacterRuntime } from "./characterRuntime/characterRuntime";
import type { CharacterCombatSummaryCoreStats } from "./characterRuntime/combatSummaryCoreStats";
import { getCharacterClassDisplayName, getCharacterSpeciesDisplayName } from "./customOrigins";
import type { SkillRow } from "./skills";

export const ENCOUNTER_STAT_BLOCK_VERSION = 1;

const conditionValues = new Set<string>(Object.values(CONDITION_NAME));
const damageTypeValues = new Set<string>(Object.values(DAMAGE_TYPE));

function compactLabels(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value.length > 0)
    )
  ].sort((left, right) => left.localeCompare(right));
}

function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function formatLanguageLabel(proficiency: string): string {
  if (proficiency.startsWith(CUSTOM_LANGUAGE_PREFIX)) {
    return proficiency.slice(CUSTOM_LANGUAGE_PREFIX.length).trim() || "Custom language";
  }

  return formatCodexLabel(proficiency);
}

function getStatusEntryLabel(entry: CharacterStatusEntry): string {
  const value = String(entry.value);
  const label =
    entry.group === STATUS_ENTRY_GROUP.CONDITIONS && entry.value === CONDITION_NAME.EXHAUSTION
      ? `Exhaustion ${entry.conditionLevel ?? 1}`
      : entry.group === STATUS_ENTRY_GROUP.RESISTANCES ||
          entry.group === STATUS_ENTRY_GROUP.VULNERABILITIES ||
          entry.group === STATUS_ENTRY_GROUP.IMMUNITIES
        ? formatCodexLabel(value)
        : value;

  return entry.group === STATUS_ENTRY_GROUP.SENSES && typeof entry.rangeFeet === "number"
    ? `${label} ${entry.rangeFeet} ft`
    : label;
}

function getStatusLabels(
  statusEntries: CharacterStatusEntry[],
  predicate?: (entry: CharacterStatusEntry) => boolean
): string[] {
  return compactLabels(
    statusEntries
      .filter((entry) => !entry.disabled)
      .filter((entry) => (predicate ? predicate(entry) : true))
      .map(getStatusEntryLabel)
  );
}

function isDamageStatusEntry(entry: CharacterStatusEntry): boolean {
  return damageTypeValues.has(String(entry.value));
}

function isConditionStatusEntry(entry: CharacterStatusEntry): boolean {
  return conditionValues.has(String(entry.value));
}

function isEncounterFeatureTraitEntry(entry: CharacterStatusEntry): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.value !== EFFECT_NAME.CONCENTRATION &&
    entry.sourceType !== STATUS_ENTRY_SOURCE_TYPE.FEAT
  );
}

function getEncounterLanguageLabels(runtime: CharacterRuntime): string[] {
  return compactLabels(
    runtime.proficiency.collections.languageProficiencies
      .filter((entry) => entry.proficiencyLevel !== PROF_LEVEL.NONE)
      .map((entry) => formatLanguageLabel(String(entry.proficiency)))
  );
}

function hasSnapshotWorthySkillBonus(row: SkillRow): boolean {
  return row.bonusEntries.some((entry) => entry.label !== "Exhaustion");
}

function getEncounterSkills(runtime: CharacterRuntime): Record<string, number> {
  const combatSummary = runtime.combatSummary;
  const skills: Record<string, number> = {};

  combatSummary.skills.rowsByAbility.forEach((group) => {
    group.rows.forEach((row) => {
      if (row.proficiencyMultiplier <= 0 && !hasSnapshotWorthySkillBonus(row)) {
        return;
      }

      skills[row.name] = row.totalModifier;
    });
  });

  return skills;
}

function getCoreStatCardValue(
  cards: ReturnType<typeof getCharacterRuntime>["combatSummary"]["coreStats"]["cards"],
  key: string,
  fallback: string
): string {
  return cards.find((card) => card.key === key)?.value ?? fallback;
}

function formatSpeedValue(value: number | null): string | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? `${value} ft` : null;
}

function formatEncounterSpeed(coreStats: CharacterCombatSummaryCoreStats): string {
  const movement = coreStats.movementSpeedBreakdowns;
  const walkSpeed = formatSpeedValue(movement.walk.total) ?? `${coreStats.speed} ft`;
  const specialMovement = (["climb", "swim", "fly", "burrow"] as const).flatMap((type) => {
    const breakdown = movement[type];
    const speed = formatSpeedValue(breakdown.total);

    return breakdown.isModified && speed ? [`${type} ${speed}`] : [];
  });

  return [walkSpeed, ...specialMovement, ...(coreStats.canHover ? ["can hover"] : [])].join(", ");
}

function createEncounterAbilities(
  character: HydratedCharacter,
  runtime: CharacterRuntime
): PortableEncounterStatBlock["abilities"] {
  const abilityCards = new Map(
    runtime.combatSummary.abilities.abilitySavingThrowCards.map((card) => [card.ability, card])
  );

  return abilityKeys.reduce(
    (abilities, ability) => {
      const card = abilityCards.get(ability);
      const score = card?.score ?? character.abilities[ability] ?? 10;
      const modifier = card?.modifierValue ?? getAbilityModifier(score);

      return {
        ...abilities,
        [ability]: {
          score,
          modifier,
          save: card?.totalSavingThrowValue ?? modifier
        }
      };
    },
    {} as PortableEncounterStatBlock["abilities"]
  );
}

export function createEncounterStatBlockSummary(
  character: HydratedCharacter
): PortableEncounterStatBlock {
  const runtime = getCharacterRuntime(character);
  const { combatSummary } = runtime;
  const coreStats = combatSummary.coreStats;
  const hitPoints = combatSummary.hitPoints;
  const defenses = combatSummary.defenses;
  const sync = character.storageMetadata?.sync;
  const className = getCharacterClassDisplayName(character);
  const species = getCharacterSpeciesDisplayName(character);

  return {
    version: ENCOUNTER_STAT_BLOCK_VERSION,
    name: character.name,
    typeLabel: [className, species]
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .join(" "),
    alignment: character.alignment,
    level: character.level,
    className,
    species,
    armorClass: coreStats.armorClassResolution.activeFormula.breakdown.total,
    initiative: getCoreStatCardValue(coreStats.cards, "initiative", "+0"),
    speed: formatEncounterSpeed(coreStats),
    proficiencyBonus: coreStats.proficiencyBonus,
    hitPoints: hitPoints.effectiveMaxHitPoints,
    currentHitPoints: hitPoints.normalizedCurrentHitPoints,
    temporaryHitPoints: hitPoints.temporaryHitPoints,
    ...(character.temporaryHitPointsSource
      ? { temporaryHitPointsSource: character.temporaryHitPointsSource }
      : {}),
    magicTemporaryHitPoints: hitPoints.magicTemporaryHitPoints,
    ...(character.magicTemporaryHitPointsSource
      ? { magicTemporaryHitPointsSource: character.magicTemporaryHitPointsSource }
      : {}),
    immunities: getStatusLabels(defenses.immunities, isDamageStatusEntry),
    conditionImmunities: getStatusLabels(defenses.immunities, isConditionStatusEntry),
    resistances: getStatusLabels(defenses.resistances),
    vulnerabilities: getStatusLabels(defenses.vulnerabilities),
    senses: getStatusLabels(defenses.senses),
    passivePerception: coreStats.passivePerception,
    languages: getEncounterLanguageLabels(runtime),
    skills: getEncounterSkills(runtime),
    abilities: createEncounterAbilities(character, runtime),
    featureTraits: getStatusLabels(defenses.effects, isEncounterFeatureTraitEntry),
    reactions: getStatusLabels(defenses.reactions),
    generatedAt: new Date().toISOString(),
    ...(sync?.localRevision ? { sourceLocalRevision: sync.localRevision } : {}),
    ...(sync?.remoteRevision ? { sourceRemoteRevision: sync.remoteRevision } : {})
  };
}
