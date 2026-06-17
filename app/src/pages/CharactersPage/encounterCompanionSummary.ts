import type {
  CharacterCompanion,
  HydratedCharacter,
  MonsterRecord,
  PortableEncounterCompanionSummary
} from "../../types";

const companionMonsterFieldKeys = [
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

function createCompanionMonsterSummary(monster: MonsterRecord | undefined): MonsterRecord | undefined {
  if (!monster?.key || !monster.name) {
    return undefined;
  }

  const source = monster as Record<string, unknown>;
  const summary: Record<string, unknown> = {
    key: monster.key,
    name: monster.name
  };

  companionMonsterFieldKeys.forEach((key) => {
    if (source[key] !== undefined) {
      summary[key] = source[key];
    }
  });

  return summary as MonsterRecord;
}

function createEncounterCompanionSummary(
  companion: CharacterCompanion
): PortableEncounterCompanionSummary {
  const inheritedCreatureEntry = createCompanionMonsterSummary(companion.inheritedCreatureEntry);

  return {
    id: companion.id,
    name: companion.name,
    description: companion.description,
    type: companion.type,
    separateInitiative: companion.separateInitiative === true,
    maxHitPoints: companion.maxHitPoints,
    currentHitPoints: companion.currentHitPoints,
    temporaryHitPoints: companion.temporaryHitPoints,
    ...(companion.temporaryHitPointsSource
      ? { temporaryHitPointsSource: companion.temporaryHitPointsSource }
      : {}),
    ...(companion.deathSaves ? { deathSaves: companion.deathSaves } : {}),
    ...(inheritedCreatureEntry ? { inheritedCreatureEntry } : {}),
    ...(inheritedCreatureEntry && companion.inheritedCreatureEntryModified === true
      ? { inheritedCreatureEntryModified: true }
      : {})
  };
}

export function createEncounterCompanionSummaries(
  character: HydratedCharacter
): PortableEncounterCompanionSummary[] {
  return (character.companions ?? []).map(createEncounterCompanionSummary);
}
