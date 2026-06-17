import type {
  CampaignPreparedEncounterCreatureRecord,
  CampaignPreparedEncounterRecord,
  PlayerVisibilitySettingsRecord
} from "../models/Campaign.js";

const DEFAULT_PLAYER_VISIBILITY_SETTINGS: PlayerVisibilitySettingsRecord = {
  showVitalityStatus: true,
  showHpBar: false,
  showDeathSaves: false,
  showMonsterType: false,
  showBaseStatBlockDescription: false,
  showDmDescription: false,
  showArmorClass: false,
  showChallengeRating: false,
  showAbilityScoresAndSavingThrows: false,
  showResistancesAndImmunities: false,
  showSkills: false,
  showSenses: false,
  showLanguages: false,
  showActionsAndReactions: false
};

const playerVisibilitySettingKeys = Object.keys(
  DEFAULT_PLAYER_VISIBILITY_SETTINGS
) as (keyof PlayerVisibilitySettingsRecord)[];

export type LiveEncounterCreatureWithEffectiveVisibility =
  CampaignPreparedEncounterCreatureRecord & {
    effectivePlayerVisibilitySettings: PlayerVisibilitySettingsRecord;
    vitalityStatusLabel?: string;
  };

export type PlayerVisibleLiveEncounterCreatureRecord = Omit<
  Partial<CampaignPreparedEncounterCreatureRecord>,
  "id" | "inheritedCreatureEntry" | "name" | "visibilitySettings"
> &
  Pick<CampaignPreparedEncounterCreatureRecord, "id" | "name"> & {
    effectivePlayerVisibilitySettings: PlayerVisibilitySettingsRecord;
    inheritedCreatureEntry?: Record<string, unknown>;
    isMakingDeathSaves?: boolean;
    statBlockNameHidden?: boolean;
    vitalityStatusLabel?: string;
  };

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clonePlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function clonePlainObjectValue(value: unknown) {
  return value === undefined ? undefined : clonePlainObject(value);
}

function normalizeVisibilitySettings(
  value: PlayerVisibilitySettingsRecord | null | undefined
): PlayerVisibilitySettingsRecord | null {
  if (!value || !isObjectRecord(value)) {
    return null;
  }

  const settings = { ...DEFAULT_PLAYER_VISIBILITY_SETTINGS };

  playerVisibilitySettingKeys.forEach((key) => {
    settings[key] = typeof value[key] === "boolean" ? value[key] : settings[key];
  });

  return settings;
}

export function resolveLiveEncounterCreaturePlayerVisibilitySettings(options: {
  campaignVisibilitySettings: PlayerVisibilitySettingsRecord;
  creatureVisibilitySettings?: PlayerVisibilitySettingsRecord | null;
  encounterVisibilitySettings?: PlayerVisibilitySettingsRecord | null;
}): PlayerVisibilitySettingsRecord {
  return {
    ...DEFAULT_PLAYER_VISIBILITY_SETTINGS,
    ...(
      normalizeVisibilitySettings(options.creatureVisibilitySettings) ??
      normalizeVisibilitySettings(options.encounterVisibilitySettings) ??
      normalizeVisibilitySettings(options.campaignVisibilitySettings) ??
      DEFAULT_PLAYER_VISIBILITY_SETTINGS
    )
  };
}

function copyFields(
  source: Record<string, unknown>,
  destination: Record<string, unknown>,
  keys: string[]
) {
  keys.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(source, key) || source[key] === undefined) {
      return;
    }

    destination[key] = clonePlainObjectValue(source[key]);
  });
}

function createPlayerVisibleMonsterRecord(
  value: unknown,
  settings: PlayerVisibilitySettingsRecord
) {
  if (!isObjectRecord(value) || typeof value.key !== "string" || typeof value.name !== "string") {
    return null;
  }

  const monster: Record<string, unknown> = {
    key: settings.showMonsterType ? value.key : "hidden-monster",
    name: settings.showMonsterType ? value.name : "Hidden Monster"
  };

  copyFields(value, monster, ["id", "illustration", "deprecated"]);

  if (settings.showMonsterType) {
    copyFields(value, monster, ["alignment", "category", "size", "subcategory", "type"]);
  }

  if (settings.showBaseStatBlockDescription) {
    copyFields(value, monster, ["desc"]);
  }

  if (settings.showArmorClass) {
    copyFields(value, monster, ["armor_class", "armor_detail"]);
  }

  if (settings.showChallengeRating) {
    copyFields(value, monster, ["challenge_rating", "cr", "experience_points"]);
  }

  if (settings.showAbilityScoresAndSavingThrows) {
    copyFields(value, monster, [
      "ability_scores",
      "modifiers",
      "saving_throws",
      "saving_throws_all"
    ]);
  }

  if (settings.showResistancesAndImmunities) {
    copyFields(value, monster, ["resistances_and_immunities"]);
  }

  if (settings.showSkills) {
    copyFields(value, monster, ["skill_bonuses", "skill_bonuses_all"]);
  }

  if (settings.showSenses) {
    copyFields(value, monster, [
      "blindsight_range",
      "darkvision_range",
      "normal_sight_range",
      "passive_perception",
      "senses_display",
      "tremorsense_range",
      "truesight_range"
    ]);
  }

  if (settings.showLanguages) {
    copyFields(value, monster, ["languages"]);
  }

  if (settings.showActionsAndReactions) {
    copyFields(value, monster, ["actions", "traits"]);
  }

  return monster;
}

function normalizeDeathSaveCount(value: unknown): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.floor(Math.max(0, Math.min(3, parsedValue)));
}

function getDeathSaveTrack(value: unknown) {
  if (!isObjectRecord(value)) {
    return {
      successes: 0,
      failures: 0,
      resolution: null
    };
  }

  return {
    successes: normalizeDeathSaveCount(value.successes),
    failures: normalizeDeathSaveCount(value.failures),
    resolution: value.resolution === "instant-death" ? "instant-death" : null
  };
}

function getCreatureVitalityStatusLabel(creature: CampaignPreparedEncounterCreatureRecord) {
  const currentHitPoints = creature.currentHitPoints;
  const maxHitPoints = Math.max(1, creature.maxHitPoints);
  const deathSaves = getDeathSaveTrack(creature.deathSaves);

  if (currentHitPoints <= 0) {
    if (deathSaves.resolution === "instant-death") {
      return "Instant Death";
    }

    if (deathSaves.failures >= 3) {
      return "Dead";
    }

    if (deathSaves.successes >= 3) {
      return "Stable";
    }

    return "Unconscious";
  }

  return currentHitPoints > maxHitPoints * 0.5 ? "Healthy" : "Blooded";
}

function isCreatureMakingDeathSaves(creature: CampaignPreparedEncounterCreatureRecord) {
  const deathSaves = getDeathSaveTrack(creature.deathSaves);

  return (
    creature.currentHitPoints <= 0 &&
    deathSaves.resolution !== "instant-death" &&
    deathSaves.successes < 3 &&
    deathSaves.failures < 3
  );
}

export function createLiveEncounterCreatureWithEffectivePlayerVisibility(options: {
  campaignVisibilitySettings: PlayerVisibilitySettingsRecord;
  creature: CampaignPreparedEncounterCreatureRecord;
  preparedEncounter: CampaignPreparedEncounterRecord;
}): LiveEncounterCreatureWithEffectiveVisibility {
  const effectivePlayerVisibilitySettings = resolveLiveEncounterCreaturePlayerVisibilitySettings({
    campaignVisibilitySettings: options.campaignVisibilitySettings,
    creatureVisibilitySettings: options.creature.visibilitySettings,
    encounterVisibilitySettings: options.preparedEncounter.visibilitySettings
  });

  return {
    ...clonePlainObject(options.creature),
    effectivePlayerVisibilitySettings
  };
}

export function createPlayerVisibleLiveEncounterCreature(
  creature: LiveEncounterCreatureWithEffectiveVisibility
): PlayerVisibleLiveEncounterCreatureRecord {
  const settings = creature.effectivePlayerVisibilitySettings;
  const visibleCreature: PlayerVisibleLiveEncounterCreatureRecord = {
    id: creature.id,
    name: creature.name,
    effectivePlayerVisibilitySettings: settings
  };
  const inheritedCreatureEntry = createPlayerVisibleMonsterRecord(
    creature.inheritedCreatureEntry,
    settings
  );

  if (settings.showHpBar) {
    visibleCreature.currentHitPoints = creature.currentHitPoints;
    visibleCreature.maxHitPoints = creature.maxHitPoints;
    visibleCreature.temporaryHitPoints = creature.temporaryHitPoints;
  }

  if (settings.showDeathSaves) {
    visibleCreature.deathSaves = clonePlainObjectValue(creature.deathSaves) as
      | LiveEncounterCreatureWithEffectiveVisibility["deathSaves"]
      | undefined;
    visibleCreature.isMakingDeathSaves = isCreatureMakingDeathSaves(creature);
  }

  if (settings.showVitalityStatus) {
    visibleCreature.vitalityStatusLabel = getCreatureVitalityStatusLabel(creature);
  }

  if (settings.showMonsterType && creature.type) {
    visibleCreature.type = creature.type;
  }

  if (settings.showDmDescription && creature.description) {
    visibleCreature.description = creature.description;
  }

  if (inheritedCreatureEntry) {
    visibleCreature.inheritedCreatureEntry = inheritedCreatureEntry;
    visibleCreature.statBlockNameHidden = !settings.showMonsterType;
  }

  return visibleCreature;
}
