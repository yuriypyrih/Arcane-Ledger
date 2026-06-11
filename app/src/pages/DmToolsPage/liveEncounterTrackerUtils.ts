import type {
  CampaignLiveEncounterTrackerCreaturePayloadRecord,
  CampaignLiveEncounterTrackerCreatureStatBlockRecord,
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerParticipantRefRecord,
  CampaignLiveEncounterTrackerRecord,
  CampaignLiveEncounterTrackerUpdateInput
} from "../../api/campaigns";
import { isLegacyMonsterRecord, normalizeMonsterRecord } from "../../utils/monsters";

export type LiveEncounterTrackerListKey = "partyMembers" | "creatures" | "initiativeOrder";

export function toLiveEncounterParticipantRef(
  participant: CampaignLiveEncounterTrackerParticipantRecord
): CampaignLiveEncounterTrackerParticipantRefRecord {
  if (participant.kind === "party-member") {
    return {
      participantId: participant.participantId,
      kind: "party-member",
      characterId: participant.characterId
    };
  }

  return {
    participantId: participant.participantId,
    kind: "creature",
    creatureId: participant.creatureId
  };
}

export function toLiveEncounterTrackerUpdateInput(
  tracker: CampaignLiveEncounterTrackerRecord
): CampaignLiveEncounterTrackerUpdateInput {
  return {
    activeParticipantId: tracker.activeParticipantId,
    roundNumber: tracker.roundNumber,
    partyMembers: tracker.partyMembers.map(toLiveEncounterParticipantRef),
    creatures: tracker.creatures.map(toLiveEncounterParticipantRef),
    initiativeOrder: tracker.initiativeOrder.map(toLiveEncounterParticipantRef),
    revision: tracker.revision
  };
}

const liveEncounterMonsterFieldKeys = [
  "ability_scores",
  "actions",
  "alignment",
  "armor_class",
  "armor_detail",
  "blindsight_range",
  "category",
  "challenge_rating",
  "cr",
  "darkvision_range",
  "deprecated",
  "desc",
  "experience_points",
  "hit_dice",
  "hit_points",
  "id",
  "illustration",
  "initiative_bonus",
  "languages",
  "modifiers",
  "normal_sight_range",
  "passive_perception",
  "proficiency_bonus",
  "resistances_and_immunities",
  "saving_throws",
  "saving_throws_all",
  "senses_display",
  "size",
  "skill_bonuses",
  "skill_bonuses_all",
  "speed",
  "speed_all",
  "subcategory",
  "traits",
  "tremorsense_range",
  "truesight_range",
  "type"
] as const;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeLiveEncounterMonsterRecord(
  value: unknown
): CampaignLiveEncounterTrackerCreatureStatBlockRecord | undefined {
  const normalizedMonster = normalizeMonsterRecord(value);

  if (!normalizedMonster) {
    return undefined;
  }

  if (isLegacyMonsterRecord(value)) {
    return normalizedMonster;
  }

  const source = isObjectRecord(value) ? value : {};
  const monster: Record<string, unknown> = {
    key: normalizedMonster.key,
    name: normalizedMonster.name
  };

  liveEncounterMonsterFieldKeys.forEach((key) => {
    if (
      Object.prototype.hasOwnProperty.call(source, key) &&
      normalizedMonster[key] !== undefined
    ) {
      monster[key] = normalizedMonster[key];
    }
  });

  return monster as CampaignLiveEncounterTrackerCreatureStatBlockRecord;
}

function normalizeLiveEncounterCreatureRecord(
  creature: CampaignLiveEncounterTrackerCreaturePayloadRecord
): CampaignLiveEncounterTrackerCreaturePayloadRecord {
  const inheritedCreatureEntry = normalizeLiveEncounterMonsterRecord(
    creature.inheritedCreatureEntry
  );
  const {
    inheritedCreatureEntry: _unusedInheritedCreatureEntry,
    inheritedCreatureEntryModified: _unusedInheritedCreatureEntryModified,
    ...baseCreature
  } = creature;

  return {
    ...baseCreature,
    ...(inheritedCreatureEntry ? { inheritedCreatureEntry } : {}),
    ...(inheritedCreatureEntry && creature.inheritedCreatureEntryModified === true
      ? { inheritedCreatureEntryModified: true }
      : {})
  };
}

function normalizeLiveEncounterParticipant(
  participant: CampaignLiveEncounterTrackerParticipantRecord
): CampaignLiveEncounterTrackerParticipantRecord {
  if (participant.kind !== "creature") {
    return participant;
  }

  return {
    ...participant,
    creature: normalizeLiveEncounterCreatureRecord(participant.creature)
  };
}

export function normalizeLiveEncounterTracker(
  tracker: CampaignLiveEncounterTrackerRecord
): CampaignLiveEncounterTrackerRecord {
  return {
    ...tracker,
    creatures: tracker.creatures.map((participant) => ({
      ...participant,
      creature: normalizeLiveEncounterCreatureRecord(participant.creature)
    })),
    initiativeOrder: tracker.initiativeOrder.map(normalizeLiveEncounterParticipant)
  };
}

export function withLiveEncounterTrackerRevision(
  tracker: CampaignLiveEncounterTrackerRecord,
  savedTracker: CampaignLiveEncounterTrackerRecord
): CampaignLiveEncounterTrackerRecord {
  return {
    ...tracker,
    revision: savedTracker.revision,
    updatedAt: savedTracker.updatedAt
  };
}
