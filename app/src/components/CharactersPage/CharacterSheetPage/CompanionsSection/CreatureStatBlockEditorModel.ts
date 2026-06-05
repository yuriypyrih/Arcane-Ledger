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

export type KeyValueRow = {
  id: string;
  key: string;
  value: string;
};

export type TraitRow = {
  id: string;
  name: string;
  desc: string;
  raw?: MonsterTraitRecord;
};

export type ActionRow = {
  id: string;
  name: string;
  desc: string;
  actionType: string;
  order: string;
  legendaryCost: string;
  usageType: string;
  usageParam: string;
  raw?: MonsterActionRecord;
};

export type StatBlockDraft = {
  name: string;
  desc: string;
  sizeKey: string;
  sizeName: string;
  typeKey: string;
  typeName: string;
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
  speedUnit: string;
  speedRows: KeyValueRow[];
  abilityScores: Record<MonsterAbilityKey, string>;
  savingThrows: Record<MonsterAbilityKey, string>;
  skillRows: KeyValueRow[];
  normalSightRange: string;
  darkvisionRange: string;
  blindsightRange: string;
  tremorsenseRange: string;
  truesightRange: string;
  sensesDisplay: string;
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

let draftRowId = 0;

export function createDraftRowId() {
  draftRowId += 1;
  return `stat-block-row-${draftRowId}`;
}

export function createEmptyKeyValueRow(): KeyValueRow {
  return {
    id: createDraftRowId(),
    key: "",
    value: ""
  };
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
    actionType,
    order: "",
    legendaryCost: "",
    usageType: "",
    usageParam: ""
  };
}

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

function getReferenceName(reference: MonsterRecord["size"] | MonsterRecord["type"]) {
  return typeof reference?.name === "string"
    ? reference.name
    : typeof reference?.display_name === "string"
      ? reference.display_name
      : "";
}

function createAbilityDraft(source: MonsterAbilityMap | null | undefined, fallback = "") {
  return monsterAbilityKeys.reduce<Record<MonsterAbilityKey, string>>((draft, ability) => {
    draft[ability] = draftText(source?.[ability] ?? fallback);
    return draft;
  }, {} as Record<MonsterAbilityKey, string>);
}

function createKeyValueRows(
  source: Record<string, unknown> | null | undefined,
  ignoredKeys: string[] = []
) {
  const ignoredKeySet = new Set(ignoredKeys);
  const rows = Object.entries(source ?? {})
    .filter(([key, value]) => !ignoredKeySet.has(key) && value !== null && value !== undefined)
    .map(([key, value]) => ({
      id: createDraftRowId(),
      key,
      value: String(value)
    }));

  return rows.length > 0 ? rows : [createEmptyKeyValueRow()];
}

function createTraitRows(traits: MonsterTraitRecord[] | null | undefined): TraitRow[] {
  return (traits ?? []).map((trait) => ({
    id: createDraftRowId(),
    name: draftText(trait.name),
    desc: draftText(trait.desc),
    raw: trait
  }));
}

function createActionRows(actions: MonsterActionRecord[] | null | undefined): ActionRow[] {
  return (actions ?? []).map((action) => ({
    id: createDraftRowId(),
    name: draftText(action.name),
    desc: draftText(action.desc),
    actionType: draftText(action.action_type) || "ACTION",
    order: draftText(action.order_in_statblock),
    legendaryCost: draftText(action.legendary_action_cost),
    usageType: draftText(action.usage_limits?.type),
    usageParam: draftText(action.usage_limits?.param),
    raw: action
  }));
}

function parseRequiredInteger(
  value: string,
  fieldName: string,
  invalidFields: Set<string>,
  min = 0,
  max = 9999
) {
  const trimmedValue = value.trim();
  const parsedValue = Number(trimmedValue);

  if (
    trimmedValue.length === 0 ||
    !Number.isInteger(parsedValue) ||
    parsedValue < min ||
    parsedValue > max
  ) {
    invalidFields.add(fieldName);
    return 0;
  }

  return parsedValue;
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

function parseSpeedValue(value: string): boolean | number | string | null {
  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.toLowerCase();

  if (!trimmedValue) {
    return null;
  }

  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : trimmedValue;
}

function parseAbilityScores(draft: StatBlockDraft, invalidFields: Set<string>) {
  return monsterAbilityKeys.reduce<Required<MonsterAbilityMap>>((scores, ability) => {
    scores[ability] = parseRequiredInteger(
      draft.abilityScores[ability],
      `ability-${ability}`,
      invalidFields,
      0,
      99
    );
    return scores;
  }, {} as Required<MonsterAbilityMap>);
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

function parseKeyValueNumberRows(
  rows: KeyValueRow[],
  listName: string,
  invalidFields: Set<string>
) {
  return rows.reduce<Record<string, number | null | undefined>>((values, row) => {
    const key = row.key.trim();
    const value = row.value.trim();

    if (!key && !value) {
      return values;
    }

    if (!key) {
      invalidFields.add(`${listName}-${row.id}-key`);
      return values;
    }

    const parsedValue = Number(value);

    if (!value || !Number.isInteger(parsedValue)) {
      invalidFields.add(`${listName}-${row.id}-value`);
      return values;
    }

    values[key] = parsedValue;
    return values;
  }, {});
}

function parseSpeedRows(draft: StatBlockDraft, invalidFields: Set<string>): MonsterSpeedMap {
  return draft.speedRows.reduce<MonsterSpeedMap>(
    (speed, row) => {
      const key = row.key.trim();
      const value = row.value.trim();

      if (!key && !value) {
        return speed;
      }

      if (!key) {
        invalidFields.add(`speed-${row.id}-key`);
        return speed;
      }

      speed[key] = parseSpeedValue(value);
      return speed;
    },
    { unit: optionalText(draft.speedUnit) }
  );
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
      ...(row.raw ?? {}),
      name,
      desc
    });

    return traits;
  }, []);

  return parsedTraits.length > 0 ? parsedTraits : null;
}

function parseActionRows(rows: ActionRow[], invalidFields: Set<string>) {
  const parsedActions = rows.reduce<MonsterActionRecord[]>((actions, row) => {
    const name = row.name.trim();
    const desc = row.desc.trim();
    const actionType = row.actionType.trim() || "ACTION";
    const order = parseNullableInteger(row.order, `action-${row.id}-order`, invalidFields);
    const legendaryCost = parseNullableInteger(
      row.legendaryCost,
      `action-${row.id}-legendaryCost`,
      invalidFields,
      0,
      999
    );
    const usageType = optionalText(row.usageType);
    const usageParamText = row.usageParam.trim();
    const usageParamNumber = Number(usageParamText);
    const usageParam =
      usageParamText && Number.isFinite(usageParamNumber) ? usageParamNumber : optionalText(row.usageParam);
    const hasContent = Boolean(name || desc || actionType || row.order || row.legendaryCost);

    if (!hasContent) {
      return actions;
    }

    if (!name) {
      invalidFields.add(`action-${row.id}-name`);
    }

    actions.push({
      ...(row.raw ?? {}),
      name,
      desc,
      action_type: actionType,
      order_in_statblock: order,
      legendary_action_cost: legendaryCost,
      usage_limits:
        usageType || usageParam !== null
          ? {
              ...(row.raw?.usage_limits ?? {}),
              type: usageType,
              param: usageParam
            }
          : null
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
    modifiers[ability] = getAbilityModifier(abilityScores[ability]);
    return modifiers;
  }, {});
}

function createSavingThrowsAll(abilityScores: MonsterAbilityMap, savingThrows: MonsterAbilityMap) {
  const modifiers = createAbilityModifiers(abilityScores);

  return monsterAbilityKeys.reduce<MonsterAbilityMap>((allSaves, ability) => {
    allSaves[ability] = savingThrows[ability] ?? modifiers[ability] ?? null;
    return allSaves;
  }, {});
}

export function createDraftFromMonster(monster: MonsterRecord): StatBlockDraft {
  const speed = monster.speed ?? monster.speed_all ?? {};
  const resistances = monster.resistances_and_immunities ?? {};

  return {
    name: monster.name,
    desc: draftText(monster.desc),
    sizeKey: getReferenceKey(monster.size),
    sizeName: getReferenceName(monster.size),
    typeKey: getReferenceKey(monster.type),
    typeName: getReferenceName(monster.type),
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
    speedUnit: draftText(speed.unit),
    speedRows: createKeyValueRows(speed, ["unit"]),
    abilityScores: createAbilityDraft(monster.ability_scores),
    savingThrows: createAbilityDraft(monster.saving_throws),
    skillRows: createKeyValueRows(monster.skill_bonuses),
    normalSightRange: draftText(monster.normal_sight_range),
    darkvisionRange: draftText(monster.darkvision_range),
    blindsightRange: draftText(monster.blindsight_range),
    tremorsenseRange: draftText(monster.tremorsense_range),
    truesightRange: draftText(monster.truesight_range),
    sensesDisplay: draftText(monster.senses_display),
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
  draft: StatBlockDraft
): { monster: MonsterRecord | null; validation: StatBlockValidation } {
  const invalidFields = new Set<string>();
  const name = draft.name.trim();

  if (!name) {
    invalidFields.add("name");
  }

  const abilityScores = parseAbilityScores(draft, invalidFields);
  const savingThrows = parseSavingThrows(draft, invalidFields);
  const skillBonuses = parseKeyValueNumberRows(draft.skillRows, "skill", invalidFields);
  const speed = parseSpeedRows(draft, invalidFields);
  const traits = parseTraitRows(draft.traits, invalidFields);
  const actions = parseActionRows(draft.actions, invalidFields);
  const nextMonster: MonsterRecord = {
    ...monster,
    name,
    desc: optionalText(draft.desc),
    size: {
      ...(monster.size ?? {}),
      key: optionalText(draft.sizeKey),
      name: optionalText(draft.sizeName)
    },
    type: {
      ...(monster.type ?? {}),
      key: optionalText(draft.typeKey),
      name: optionalText(draft.typeName)
    },
    alignment: optionalText(draft.alignment),
    armor_class: parseRequiredInteger(draft.armorClass, "armorClass", invalidFields, 0, 999),
    armor_detail: optionalText(draft.armorDetail),
    hit_points: parseRequiredInteger(draft.hitPoints, "hitPoints", invalidFields, 1, 99999),
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
    challenge_rating: optionalText(draft.challengeRating),
    experience_points: parseNullableInteger(
      draft.experiencePoints,
      "experiencePoints",
      invalidFields,
      0,
      999999
    ),
    speed,
    speed_all: {
      ...(monster.speed_all ?? {}),
      ...speed
    },
    ability_scores: abilityScores,
    modifiers: createAbilityModifiers(abilityScores),
    saving_throws: savingThrows,
    saving_throws_all: createSavingThrowsAll(abilityScores, savingThrows),
    skill_bonuses: skillBonuses,
    skill_bonuses_all: {
      ...(monster.skill_bonuses_all ?? {}),
      ...skillBonuses
    },
    normal_sight_range: parseNullableInteger(
      draft.normalSightRange,
      "normalSightRange",
      invalidFields,
      0,
      9999
    ),
    darkvision_range: parseNullableInteger(
      draft.darkvisionRange,
      "darkvisionRange",
      invalidFields,
      0,
      9999
    ),
    blindsight_range: parseNullableInteger(
      draft.blindsightRange,
      "blindsightRange",
      invalidFields,
      0,
      9999
    ),
    tremorsense_range: parseNullableInteger(
      draft.tremorsenseRange,
      "tremorsenseRange",
      invalidFields,
      0,
      9999
    ),
    truesight_range: parseNullableInteger(
      draft.truesightRange,
      "truesightRange",
      invalidFields,
      0,
      9999
    ),
    senses_display: optionalText(draft.sensesDisplay),
    languages: {
      ...(monster.languages ?? {}),
      as_string: optionalText(draft.languages)
    },
    resistances_and_immunities: {
      ...(monster.resistances_and_immunities ?? {}),
      damage_vulnerabilities_display: optionalText(draft.damageVulnerabilities),
      damage_resistances_display: optionalText(draft.damageResistances),
      damage_immunities_display: optionalText(draft.damageImmunities),
      condition_immunities_display: optionalText(draft.conditionImmunities)
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
