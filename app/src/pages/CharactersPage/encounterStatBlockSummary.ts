import {
  CONDITION_NAME,
  CUSTOM_LANGUAGE_PREFIX,
  EFFECT_NAME,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type AbilityKey,
  type CharacterStatusEntry,
  type HydratedCharacter,
  type PortableEncounterStatBlock
} from "../../types";
import { formatCodexLabel } from "../../utils/codex";
import { getSavingThrowLevelFromEntries } from "./proficiencyResolvers";
import { getProficiencyMultiplier } from "./shared";

export const ENCOUNTER_STAT_BLOCK_VERSION = 1;

const abilityKeys: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const savingThrowProficiencyByAbility: Record<AbilityKey, SAVING_THROW_PROFICIENCY> = {
  STR: SAVING_THROW_PROFICIENCY.STR,
  DEX: SAVING_THROW_PROFICIENCY.DEX,
  CON: SAVING_THROW_PROFICIENCY.CON,
  INT: SAVING_THROW_PROFICIENCY.INT,
  WIS: SAVING_THROW_PROFICIENCY.WIS,
  CHA: SAVING_THROW_PROFICIENCY.CHA
};

function compactLabels(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value.length > 0)
    )
  ].sort((left, right) => left.localeCompare(right));
}

function formatSignedNumber(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function getProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function readDisplayInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/[+-]?\d+/);

  return match ? Number.parseInt(match[0] ?? "", 10) : null;
}

function readDisplayString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function getSavingThrowTotal(
  character: HydratedCharacter,
  ability: AbilityKey,
  proficiencyBonus: number
): number {
  const abilityModifier = getAbilityModifier(character.abilities[ability] ?? 10);
  const savingThrowLevel = getSavingThrowLevelFromEntries(
    character.savingThrowProficiencies,
    savingThrowProficiencyByAbility[ability]
  );

  return abilityModifier + proficiencyBonus * getProficiencyMultiplier(savingThrowLevel);
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
  statusEntries: CharacterStatusEntry[] | undefined,
  groups: STATUS_ENTRY_GROUP[],
  predicate?: (entry: CharacterStatusEntry) => boolean
): string[] {
  const groupSet = new Set(groups);

  return compactLabels(
    (statusEntries ?? [])
      .filter((entry) => !entry.disabled && groupSet.has(entry.group))
      .filter((entry) => (predicate ? predicate(entry) : true))
      .map(getStatusEntryLabel)
  );
}

function formatLanguageLabel(proficiency: string): string {
  if (proficiency.startsWith(CUSTOM_LANGUAGE_PREFIX)) {
    return proficiency.slice(CUSTOM_LANGUAGE_PREFIX.length).trim() || "Custom language";
  }

  return formatCodexLabel(proficiency);
}

function getLanguageLabels(character: HydratedCharacter): string[] {
  return compactLabels(
    character.languageProficiencies
      .filter((entry) => entry.proficiencyLevel !== PROF_LEVEL.NONE)
      .map((entry) => formatLanguageLabel(String(entry.proficiency)))
  );
}

function getEncounterStatusEntries(character: HydratedCharacter): CharacterStatusEntry[] {
  return character.statusEntries ?? [];
}

function isEncounterFeatureTraitEntry(entry: CharacterStatusEntry): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.value !== EFFECT_NAME.CONCENTRATION &&
    entry.sourceType !== STATUS_ENTRY_SOURCE_TYPE.FEAT
  );
}

function getFeatureReactionLabels(character: HydratedCharacter): string[] {
  const labels: string[] = [];
  const className = character.className.trim().toLowerCase();

  if (className === "artificer" && character.level >= 7) {
    labels.push("Flash of Genius");
  }

  if (className === "bard" && character.level >= 7) {
    labels.push("Countercharm");
  }

  if (className === "monk") {
    if (character.level >= 3) {
      labels.push("Deflect Attacks");
    }

    if (character.level >= 4) {
      labels.push("Slow Fall");
    }
  }

  if (className === "rogue" && character.level >= 5) {
    labels.push("Uncanny Dodge");
  }

  return labels;
}

function getReactionLabels(character: HydratedCharacter, statusEntries: CharacterStatusEntry[]) {
  return compactLabels([
    ...getStatusLabels(statusEntries, [STATUS_ENTRY_GROUP.REACTIONS]),
    ...getFeatureReactionLabels(character)
  ]);
}

export function createEncounterStatBlockSummary(
  character: HydratedCharacter
): PortableEncounterStatBlock {
  const proficiencyBonus = getProficiencyBonus(character.level);
  const dexterityModifier = getAbilityModifier(character.abilities.DEX ?? 10);
  const wisdomModifier = getAbilityModifier(character.abilities.WIS ?? 10);
  const armorClass = readDisplayInteger(character.coreStats?.armorClass) ?? 10 + dexterityModifier;
  const passivePerception =
    readDisplayInteger(character.coreStats?.passivePerception) ?? 10 + wisdomModifier;
  const sync = character.storageMetadata?.sync;
  const encounterStatusEntries = getEncounterStatusEntries(character);

  return {
    version: ENCOUNTER_STAT_BLOCK_VERSION,
    name: character.name,
    typeLabel: [character.className, character.species]
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .join(" "),
    alignment: character.alignment,
    level: character.level,
    className: character.className,
    species: character.species,
    armorClass,
    initiative: readDisplayString(character.coreStats?.initiative) ?? formatSignedNumber(dexterityModifier),
    speed: readDisplayString(character.coreStats?.speed) ?? "30 ft",
    proficiencyBonus,
    hitPoints: character.hitPoints,
    currentHitPoints: character.currentHitPoints,
    temporaryHitPoints: character.temporaryHitPoints,
    ...(character.temporaryHitPointsSource
      ? { temporaryHitPointsSource: character.temporaryHitPointsSource }
      : {}),
    magicTemporaryHitPoints: character.magicTemporaryHitPoints,
    ...(character.magicTemporaryHitPointsSource
      ? { magicTemporaryHitPointsSource: character.magicTemporaryHitPointsSource }
      : {}),
    immunities: getStatusLabels(encounterStatusEntries, [STATUS_ENTRY_GROUP.IMMUNITIES]),
    resistances: getStatusLabels(encounterStatusEntries, [STATUS_ENTRY_GROUP.RESISTANCES]),
    vulnerabilities: getStatusLabels(encounterStatusEntries, [STATUS_ENTRY_GROUP.VULNERABILITIES]),
    senses: getStatusLabels(encounterStatusEntries, [STATUS_ENTRY_GROUP.SENSES]),
    passivePerception,
    languages: getLanguageLabels(character),
    abilities: abilityKeys.reduce(
      (abilities, ability) => {
        const score = character.abilities[ability] ?? 10;

        return {
          ...abilities,
          [ability]: {
            score,
            modifier: getAbilityModifier(score),
            save: getSavingThrowTotal(character, ability, proficiencyBonus)
          }
        };
      },
      {} as PortableEncounterStatBlock["abilities"]
    ),
    featureTraits: getStatusLabels(
      encounterStatusEntries,
      [STATUS_ENTRY_GROUP.EFFECTS],
      isEncounterFeatureTraitEntry
    ),
    reactions: getReactionLabels(character, encounterStatusEntries),
    generatedAt: new Date().toISOString(),
    ...(sync?.localRevision ? { sourceLocalRevision: sync.localRevision } : {}),
    ...(sync?.remoteRevision ? { sourceRemoteRevision: sync.remoteRevision } : {})
  };
}
