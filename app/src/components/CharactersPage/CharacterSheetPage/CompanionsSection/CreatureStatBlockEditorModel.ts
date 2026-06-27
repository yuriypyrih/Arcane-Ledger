import type {
  MonsterAbilityKey,
  MonsterAbilityMap,
  MonsterActionRecord,
  MonsterActionType,
  MonsterRecord,
  MonsterSpeedMap,
  MonsterTraitRecord
} from "../../../../types";
import { monsterAbilityKeys } from "../../../../utils/monsters";

export type TraitRow = {
  id: string;
  name: string;
  desc: string;
};

export type ActionRow = {
  id: string;
  name: string;
  desc: string;
  actionType: string;
};

export type StatBlockDraft = {
  name: string;
  desc: string;
  sizeKey: string;
  typeKey: string;
  alignment: string;
  armorClass: string;
  armorDetail: string;
  hitPoints: string;
  hitDice: string;
  initiativeBonus: string;
  proficiencyBonus: string;
  passivePerception: string;
  challengeRating: string;
  experiencePoints: string;
  speed: string;
  abilityScores: Record<MonsterAbilityKey, string>;
  savingThrows: Record<MonsterAbilityKey, string>;
  skills: string;
  senses: string;
  languages: string;
  damageVulnerabilities: string;
  damageResistances: string;
  damageImmunities: string;
  conditionImmunities: string;
  traits: TraitRow[];
  actions: ActionRow[];
};

export type StatBlockValidation = {
  invalidFields: Set<string>;
  message: string | null;
};

export type StatBlockReferenceOption = {
  key: string;
  name: string;
};

let draftRowId = 0;

export const monsterSizeOptions: StatBlockReferenceOption[] = [
  { key: "tiny", name: "Tiny" },
  { key: "small", name: "Small" },
  { key: "medium", name: "Medium" },
  { key: "large", name: "Large" },
  { key: "huge", name: "Huge" },
  { key: "gargantuan", name: "Gargantuan" },
  { key: "titanic", name: "Titanic" },
  { key: "huge-or-smaller", name: "Huge or smaller" }
];

export const monsterAlignmentOptions = [
  "Unaligned",
  "Any alignment",
  "Lawful good",
  "Neutral good",
  "Chaotic good",
  "Lawful neutral",
  "Neutral",
  "Chaotic neutral",
  "Lawful evil",
  "Neutral evil",
  "Chaotic evil",
  "Any good alignment",
  "Any evil alignment",
  "Any lawful alignment",
  "Any chaotic alignment",
  "Any non-good alignment",
  "Any non-lawful alignment"
] as const;

export const monsterAbilityFieldLabels: Record<MonsterAbilityKey, string> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA"
};

export const monsterActionTypeOptions = [
  ["ACTION", "Action"],
  ["BONUS_ACTION", "Bonus Action"],
  ["REACTION", "Reaction"],
  ["LEGENDARY_ACTION", "Legendary Action"]
] as const;

export function createDraftRowId() {
  draftRowId += 1;
  return `stat-block-row-${draftRowId}`;
}

export function createEmptyTraitRow(): TraitRow {
  return {
    id: createDraftRowId(),
    name: "",
    desc: ""
  };
}

export function createEmptyActionRow(actionType: MonsterActionType = "ACTION"): ActionRow {
  return {
    id: createDraftRowId(),
    name: "",
    desc: "",
    actionType
  };
}

function draftText(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function optionalText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function getReferenceKey(reference: MonsterRecord["size"] | MonsterRecord["type"]) {
  return typeof reference?.key === "string" ? reference.key : "";
}

function createAbilityDraft(source: MonsterAbilityMap | null | undefined, fallback = "") {
  return monsterAbilityKeys.reduce<Record<MonsterAbilityKey, string>>((draft, ability) => {
    draft[ability] = draftText(source?.[ability] ?? fallback);
    return draft;
  }, {} as Record<MonsterAbilityKey, string>);
}

function createTraitRows(traits: MonsterTraitRecord[] | null | undefined): TraitRow[] {
  return (traits ?? []).map((trait) => ({
    id: createDraftRowId(),
    name: draftText(trait.name),
    desc: draftText(trait.desc)
  }));
}

function createActionRows(actions: MonsterActionRecord[] | null | undefined): ActionRow[] {
  return (actions ?? []).map((action) => ({
    id: createDraftRowId(),
    name: draftText(action.name),
    desc: draftText(action.desc),
    actionType: draftText(action.action_type) || "ACTION"
  }));
}

function formatSigned(value: number) {
  return value >= 0 ? `+${value}` : String(value);
}

function createSkillDisplay(monster: MonsterRecord) {
  const displayValue = monster.skill_bonuses_display;

  if (typeof displayValue === "string" && displayValue.trim()) {
    return displayValue;
  }

  return Object.entries(monster.skill_bonuses ?? {})
    .filter((entry): entry is [string, number] => typeof entry[1] === "number")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([skill, bonus]) => `${skill} ${formatSigned(bonus)}`)
    .join(", ");
}

function formatMovementValue(
  value: boolean | number | string | null | undefined,
  unit: string | null
) {
  if (value === null || value === undefined || value === false || value === 0) {
    return null;
  }

  if (value === true) {
    return "";
  }

  if (typeof value === "number") {
    return unit === "feet" || !unit ? `${value} ft.` : `${value} ${unit}`;
  }

  return value.trim() || null;
}

function createSpeedDisplay(speed: MonsterSpeedMap | null | undefined) {
  if (!speed) {
    return "";
  }

  const unit = typeof speed.unit === "string" ? speed.unit : "feet";

  return Object.entries(speed)
    .flatMap(([key, value]) => {
      const normalizedKey = key.trim().toLowerCase();

      if (normalizedKey === "unit" || normalizedKey === "hover") {
        return [];
      }

      const formattedValue = formatMovementValue(value, unit);

      if (formattedValue === null) {
        return [];
      }

      if (normalizedKey === "walk" || normalizedKey === "speed") {
        return [formattedValue];
      }

      return [`${normalizedKey} ${formattedValue}`];
    })
    .join(", ");
}

function formatSenseRange(label: string, value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return `${label} ${value} ft.`;
}

function createSensesDisplay(monster: MonsterRecord) {
  if (typeof monster.senses_display === "string" && monster.senses_display.trim()) {
    return monster.senses_display;
  }

  return [
    formatSenseRange("blindsight", monster.blindsight_range),
    formatSenseRange("darkvision", monster.darkvision_range),
    formatSenseRange("tremorsense", monster.tremorsense_range),
    formatSenseRange("truesight", monster.truesight_range),
    typeof monster.passive_perception === "number" && Number.isFinite(monster.passive_perception)
      ? `passive Perception ${monster.passive_perception}`
      : null
  ]
    .filter(Boolean)
    .join(", ");
}

function parseNullableInteger(
  value: string,
  fieldName: string,
  invalidFields: Set<string>,
  min = -999,
  max = 99999
) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);

  if (!Number.isInteger(parsedValue) || parsedValue < min || parsedValue > max) {
    invalidFields.add(fieldName);
    return null;
  }

  return parsedValue;
}

function parseNumberOrText(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : trimmedValue;
}

function parseAbilityScores(draft: StatBlockDraft, invalidFields: Set<string>) {
  return monsterAbilityKeys.reduce<MonsterAbilityMap>((scores, ability) => {
    const parsedValue = parseNullableInteger(
      draft.abilityScores[ability],
      `ability-${ability}`,
      invalidFields,
      0,
      99
    );

    if (parsedValue !== null) {
      scores[ability] = parsedValue;
    }

    return scores;
  }, {});
}

function parseSavingThrows(draft: StatBlockDraft, invalidFields: Set<string>) {
  return monsterAbilityKeys.reduce<MonsterAbilityMap>((saves, ability) => {
    const parsedValue = parseNullableInteger(
      draft.savingThrows[ability],
      `save-${ability}`,
      invalidFields
    );

    if (parsedValue !== null) {
      saves[ability] = parsedValue;
    }

    return saves;
  }, {});
}

function parseTraitRows(rows: TraitRow[], invalidFields: Set<string>) {
  const parsedTraits = rows.reduce<MonsterTraitRecord[]>((traits, row) => {
    const name = row.name.trim();
    const desc = row.desc.trim();

    if (!name && !desc) {
      return traits;
    }

    if (!name) {
      invalidFields.add(`trait-${row.id}-name`);
    }

    traits.push({
      name,
      desc
    });

    return traits;
  }, []);

  return parsedTraits.length > 0 ? parsedTraits : null;
}

function parseActionRows(rows: ActionRow[], invalidFields: Set<string>) {
  const parsedActions = rows.reduce<MonsterActionRecord[]>((actions, row, index) => {
    const name = row.name.trim();
    const desc = row.desc.trim();
    const actionType = row.actionType.trim() || "ACTION";

    if (!name && !desc) {
      return actions;
    }

    if (!name) {
      invalidFields.add(`action-${row.id}-name`);
    }

    actions.push({
      name,
      desc,
      attacks: [],
      action_type: actionType,
      order_in_statblock: index + 1,
      legendary_action_cost: null,
      limited_to_form: null,
      usage_limits: null
    });

    return actions;
  }, []);

  return parsedActions.length > 0 ? parsedActions : null;
}

function getAbilityModifier(score: number | null | undefined) {
  return typeof score === "number" ? Math.floor((score - 10) / 2) : null;
}

function createAbilityModifiers(abilityScores: MonsterAbilityMap) {
  return monsterAbilityKeys.reduce<MonsterAbilityMap>((modifiers, ability) => {
    const modifier = getAbilityModifier(abilityScores[ability]);

    if (modifier !== null) {
      modifiers[ability] = modifier;
    }

    return modifiers;
  }, {});
}

function createSavingThrowsAll(abilityScores: MonsterAbilityMap, savingThrows: MonsterAbilityMap) {
  const modifiers = createAbilityModifiers(abilityScores);

  return monsterAbilityKeys.reduce<MonsterAbilityMap>((allSaves, ability) => {
    const total = savingThrows[ability] ?? modifiers[ability] ?? null;

    if (total !== null) {
      allSaves[ability] = total;
    }

    return allSaves;
  }, {});
}

export function createEmptyMonsterRecord(): MonsterRecord {
  return {
    key: "custom-bestiary-draft",
    name: "",
    desc: null,
    size: null,
    type: null,
    alignment: null,
    armor_class: null,
    armor_detail: null,
    hit_points: null,
    hit_dice: null,
    speed: null,
    speed_all: null,
    ability_scores: {},
    modifiers: {},
    saving_throws: {},
    saving_throws_all: {},
    skill_bonuses: {},
    skill_bonuses_all: {},
    passive_perception: null,
    senses_display: null,
    languages: {
      as_string: null
    },
    resistances_and_immunities: {
      damage_vulnerabilities_display: null,
      damage_vulnerabilities: [],
      damage_resistances_display: null,
      damage_resistances: [],
      damage_immunities_display: null,
      damage_immunities: [],
      condition_immunities_display: null,
      condition_immunities: []
    },
    challenge_rating: null,
    experience_points: null,
    initiative_bonus: null,
    proficiency_bonus: null,
    actions: null,
    traits: null,
    document: {
      display_name: "Custom Bestiary",
      key: "custom-bestiary",
      name: "Custom Bestiary"
    },
    illustration: null
  };
}

export function createDraftFromMonster(monster: MonsterRecord): StatBlockDraft {
  const speed = monster.speed ?? monster.speed_all ?? {};
  const resistances = monster.resistances_and_immunities ?? {};

  return {
    name: monster.name,
    desc: draftText(monster.desc),
    sizeKey: getReferenceKey(monster.size),
    typeKey: getReferenceKey(monster.type),
    alignment: draftText(monster.alignment),
    armorClass: draftText(monster.armor_class),
    armorDetail: draftText(monster.armor_detail),
    hitPoints: draftText(monster.hit_points),
    hitDice: draftText(monster.hit_dice),
    initiativeBonus: draftText(monster.initiative_bonus),
    proficiencyBonus: draftText(monster.proficiency_bonus),
    passivePerception: draftText(monster.passive_perception),
    challengeRating: draftText(monster.challenge_rating),
    experiencePoints: draftText(monster.experience_points),
    speed: createSpeedDisplay(speed),
    abilityScores: createAbilityDraft(monster.ability_scores),
    savingThrows: createAbilityDraft(monster.saving_throws),
    skills: createSkillDisplay(monster),
    senses: createSensesDisplay(monster),
    languages: draftText(monster.languages?.as_string),
    damageVulnerabilities: draftText(resistances.damage_vulnerabilities_display),
    damageResistances: draftText(resistances.damage_resistances_display),
    damageImmunities: draftText(resistances.damage_immunities_display),
    conditionImmunities: draftText(resistances.condition_immunities_display),
    traits: createTraitRows(monster.traits),
    actions: createActionRows(monster.actions)
  };
}

export function validateAndCreateMonster(
  monster: MonsterRecord,
  draft: StatBlockDraft,
  options: {
    sizeOptions?: StatBlockReferenceOption[];
    typeOptions?: StatBlockReferenceOption[];
  } = {}
): { monster: MonsterRecord | null; validation: StatBlockValidation } {
  const invalidFields = new Set<string>();
  const name = draft.name.trim();
  const size = options.sizeOptions?.find((option) => option.key === draft.sizeKey);
  const type = options.typeOptions?.find((option) => option.key === draft.typeKey);

  if (!name) {
    invalidFields.add("name");
  }

  const abilityScores = parseAbilityScores(draft, invalidFields);
  const savingThrows = parseSavingThrows(draft, invalidFields);
  const traits = parseTraitRows(draft.traits, invalidFields);
  const actions = parseActionRows(draft.actions, invalidFields);
  const speedText = optionalText(draft.speed);
  const nextMonster: MonsterRecord = {
    ...monster,
    name,
    desc: optionalText(draft.desc),
    size: size
      ? {
          key: size.key,
          name: size.name
        }
      : null,
    type: type
      ? {
          key: type.key,
          name: type.name
        }
      : null,
    alignment: optionalText(draft.alignment),
    armor_class: parseNumberOrText(draft.armorClass),
    armor_detail: optionalText(draft.armorDetail),
    hit_points: parseNumberOrText(draft.hitPoints),
    hit_dice: optionalText(draft.hitDice),
    initiative_bonus: parseNullableInteger(
      draft.initiativeBonus,
      "initiativeBonus",
      invalidFields
    ),
    proficiency_bonus: parseNullableInteger(
      draft.proficiencyBonus,
      "proficiencyBonus",
      invalidFields,
      0,
      99
    ),
    passive_perception: parseNullableInteger(
      draft.passivePerception,
      "passivePerception",
      invalidFields,
      0,
      999
    ),
    challenge_rating: parseNumberOrText(draft.challengeRating),
    experience_points: parseNullableInteger(
      draft.experiencePoints,
      "experiencePoints",
      invalidFields,
      0,
      999999
    ),
    speed: speedText
      ? {
          unit: "feet",
          walk: speedText
        }
      : null,
    speed_all: speedText
      ? {
          unit: "feet",
          walk: speedText
        }
      : null,
    ability_scores: abilityScores,
    modifiers: createAbilityModifiers(abilityScores),
    saving_throws: savingThrows,
    saving_throws_all: createSavingThrowsAll(abilityScores, savingThrows),
    skill_bonuses: {},
    skill_bonuses_all: {},
    skill_bonuses_display: optionalText(draft.skills),
    senses_display: optionalText(draft.senses),
    normal_sight_range: null,
    darkvision_range: null,
    blindsight_range: null,
    tremorsense_range: null,
    truesight_range: null,
    languages: {
      ...(monster.languages ?? {}),
      as_string: optionalText(draft.languages)
    },
    resistances_and_immunities: {
      ...(monster.resistances_and_immunities ?? {}),
      damage_vulnerabilities_display: optionalText(draft.damageVulnerabilities),
      damage_vulnerabilities: [],
      damage_resistances_display: optionalText(draft.damageResistances),
      damage_resistances: [],
      damage_immunities_display: optionalText(draft.damageImmunities),
      damage_immunities: [],
      condition_immunities_display: optionalText(draft.conditionImmunities),
      condition_immunities: []
    },
    traits,
    actions
  };

  return {
    monster: invalidFields.size > 0 ? null : nextMonster,
    validation: {
      invalidFields,
      message: invalidFields.size > 0 ? "Fix highlighted stat block fields." : null
    }
  };
}
