import type {
  CampaignLiveEncounterTrackerCreaturePayloadRecord,
  CampaignLiveEncounterTrackerCreatureRecord,
  CampaignLiveEncounterTrackerCreatureStatBlockRecord,
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerRecord,
  PlayerVisibilitySettings
} from "../../api/campaigns";
import {
  getDeathSaveStatusLabel,
  normalizeDeathSaveTrack
} from "../CharactersPage/deathSaves";

const DEFAULT_PLAYER_VISIBILITY_SETTINGS: PlayerVisibilitySettings = {
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

function clonePlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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

    destination[key] = clonePlainObject(source[key]);
  });
}

function getCreatureVisibilitySettings(
  creature: CampaignLiveEncounterTrackerCreaturePayloadRecord
) {
  return {
    ...DEFAULT_PLAYER_VISIBILITY_SETTINGS,
    ...creature.effectivePlayerVisibilitySettings
  };
}

function createPlayerVisibleMonsterRecord(
  value: CampaignLiveEncounterTrackerCreaturePayloadRecord["inheritedCreatureEntry"],
  settings: PlayerVisibilitySettings
): CampaignLiveEncounterTrackerCreatureStatBlockRecord | undefined {
  if (!value?.key || !value.name) {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const monster: Record<string, unknown> = {
    key: settings.showMonsterType ? value.key : "hidden-monster",
    name: settings.showMonsterType ? value.name : "Hidden Monster"
  };

  copyFields(source, monster, ["id", "illustration", "deprecated"]);

  if (settings.showMonsterType) {
    copyFields(source, monster, ["alignment", "category", "size", "subcategory", "type"]);
  }

  if (settings.showBaseStatBlockDescription) {
    copyFields(source, monster, ["desc"]);
  }

  if (settings.showArmorClass) {
    copyFields(source, monster, ["armor_class", "armor_detail"]);
  }

  if (settings.showChallengeRating) {
    copyFields(source, monster, ["challenge_rating", "cr", "experience_points"]);
  }

  if (settings.showAbilityScoresAndSavingThrows) {
    copyFields(source, monster, [
      "ability_scores",
      "modifiers",
      "saving_throws",
      "saving_throws_all"
    ]);
  }

  if (settings.showResistancesAndImmunities) {
    copyFields(source, monster, ["resistances_and_immunities"]);
  }

  if (settings.showSkills) {
    copyFields(source, monster, ["skill_bonuses", "skill_bonuses_all"]);
  }

  if (settings.showSenses) {
    copyFields(source, monster, [
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
    copyFields(source, monster, ["languages"]);
  }

  if (settings.showActionsAndReactions) {
    copyFields(source, monster, ["actions", "traits"]);
  }

  return monster as CampaignLiveEncounterTrackerCreatureStatBlockRecord;
}

function getCreatureVitalityStatusLabel(
  creature: CampaignLiveEncounterTrackerCreaturePayloadRecord
) {
  if (creature.vitalityStatusLabel) {
    return creature.vitalityStatusLabel;
  }

  return typeof creature.currentHitPoints === "number" &&
    typeof creature.maxHitPoints === "number"
    ? getDeathSaveStatusLabel(
        creature.currentHitPoints,
        Math.max(1, creature.maxHitPoints),
        normalizeDeathSaveTrack(creature.deathSaves)
      )
    : undefined;
}

function isCreatureMakingDeathSaves(creature: CampaignLiveEncounterTrackerCreaturePayloadRecord) {
  const deathSaves = normalizeDeathSaveTrack(creature.deathSaves);

  return (
    typeof creature.currentHitPoints === "number" &&
    creature.currentHitPoints <= 0 &&
    deathSaves.resolution !== "instant-death" &&
    deathSaves.successes < 3 &&
    deathSaves.failures < 3
  );
}

function createPlayerVisibleLiveEncounterCreature(
  creature: CampaignLiveEncounterTrackerCreaturePayloadRecord
): CampaignLiveEncounterTrackerCreaturePayloadRecord {
  const settings = getCreatureVisibilitySettings(creature);
  const inheritedCreatureEntry = createPlayerVisibleMonsterRecord(
    creature.inheritedCreatureEntry,
    settings
  );
  const visibleCreature: CampaignLiveEncounterTrackerCreaturePayloadRecord = {
    id: creature.id,
    name: creature.name,
    effectivePlayerVisibilitySettings: settings
  };

  if (settings.showHpBar) {
    visibleCreature.currentHitPoints = creature.currentHitPoints;
    visibleCreature.maxHitPoints = creature.maxHitPoints;
    visibleCreature.temporaryHitPoints = creature.temporaryHitPoints;
  }

  if (settings.showDeathSaves) {
    visibleCreature.deathSaves = creature.deathSaves;
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

function createPlayerVisibleLiveEncounterCreatureParticipant(
  participant: CampaignLiveEncounterTrackerCreatureRecord
): CampaignLiveEncounterTrackerCreatureRecord {
  return {
    ...participant,
    creature: createPlayerVisibleLiveEncounterCreature(participant.creature)
  };
}

function createPlayerVisibleLiveEncounterParticipant(
  participant: CampaignLiveEncounterTrackerParticipantRecord
): CampaignLiveEncounterTrackerParticipantRecord {
  return participant.kind === "creature"
    ? createPlayerVisibleLiveEncounterCreatureParticipant(participant)
    : participant;
}

export function createPlayerVisibleLiveEncounterTracker(
  tracker: CampaignLiveEncounterTrackerRecord
): CampaignLiveEncounterTrackerRecord {
  if (tracker.status.state !== "valid") {
    return tracker;
  }

  return {
    ...tracker,
    creatures: tracker.creatures.map(createPlayerVisibleLiveEncounterCreatureParticipant),
    initiativeOrder: tracker.initiativeOrder.map(createPlayerVisibleLiveEncounterParticipant)
  };
}
