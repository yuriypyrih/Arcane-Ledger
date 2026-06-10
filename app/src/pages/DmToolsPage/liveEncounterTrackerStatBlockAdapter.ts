import type {
  MonsterActionGroup,
  MonsterDetailRow
} from "../../components/MonsterEntryRenderer/monsterEntryFormatting";
import type {
  AbilityKey,
  MonsterRecord,
  MonsterTraitRecord,
  PortableEncounterStatBlock
} from "../../types";
import { skillGroupsByAbility } from "../CharactersPage/skillDefinitions";

type EncounterStatBlockRendererModel = {
  actionGroups: MonsterActionGroup[];
  detailRows: MonsterDetailRow[];
  monster: MonsterRecord;
  vitalRows: MonsterDetailRow[];
};

const monsterAbilityKeyByAbility: Record<AbilityKey, string> = {
  STR: "strength",
  DEX: "dexterity",
  CON: "constitution",
  INT: "intelligence",
  WIS: "wisdom",
  CHA: "charisma"
};

const skillAbilityByName: Map<string, AbilityKey> = new Map(
  skillGroupsByAbility.flatMap((group) => group.skills.map((skill) => [skill, group.ability]))
);

function formatSigned(value: number | string | null | undefined) {
  if (typeof value === "string") {
    return value.trim() || "-";
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return value >= 0 ? `+${value}` : value.toString();
}

function formatList(values: readonly string[] | null | undefined) {
  return values && values.length > 0 ? values.join(", ") : "";
}

function formatOptionalHitPoints(
  value: number,
  source: string | undefined,
  label: string
): MonsterDetailRow | null {
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return {
    label,
    value: source ? `${value} (${source})` : value.toString()
  };
}

function formatMemberSkills(statBlock: PortableEncounterStatBlock) {
  const skills = statBlock.skills ?? {};
  const displayedSkills = Object.entries(skills)
    .flatMap(([skillName, total]) => {
      const ability = skillAbilityByName.get(skillName);
      const abilityModifier = ability ? statBlock.abilities[ability]?.modifier : null;

      if (
        !Number.isFinite(total) ||
        typeof abilityModifier !== "number" ||
        total <= abilityModifier
      ) {
        return [];
      }

      return [`${skillName} ${formatSigned(total)}`];
    })
    .sort((left, right) => left.localeCompare(right));

  return displayedSkills.join(", ");
}

function toSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "party-member";
}

function toFeatureRecords(labels: string[]): MonsterTraitRecord[] | null {
  if (labels.length === 0) {
    return null;
  }

  return labels.map((label) => ({
    name: label,
    desc: ""
  }));
}

function buildDetailRows(statBlock: PortableEncounterStatBlock): MonsterDetailRow[] {
  const temporaryHitPoints = formatOptionalHitPoints(
    statBlock.temporaryHitPoints,
    statBlock.temporaryHitPointsSource,
    "Temporary HP"
  );
  const magicTemporaryHitPoints = formatOptionalHitPoints(
    statBlock.magicTemporaryHitPoints,
    statBlock.magicTemporaryHitPointsSource,
    "Magic Temporary HP"
  );

  return [
    { label: "Skills", value: formatMemberSkills(statBlock) },
    temporaryHitPoints,
    magicTemporaryHitPoints,
    { label: "Damage Vulnerabilities", value: formatList(statBlock.vulnerabilities) },
    { label: "Damage Resistances", value: formatList(statBlock.resistances) },
    { label: "Damage Immunities", value: formatList(statBlock.immunities) },
    { label: "Condition Immunities", value: formatList(statBlock.conditionImmunities) },
    { label: "Senses", value: formatList(statBlock.senses) },
    { label: "Languages", value: formatList(statBlock.languages) || "None" }
  ].filter((row): row is MonsterDetailRow => Boolean(row?.value));
}

function buildVitalRows(statBlock: PortableEncounterStatBlock): MonsterDetailRow[] {
  return [
    { label: "Initiative", value: formatSigned(statBlock.initiative) },
    {
      label: "Passive Perception",
      value:
        Number.isFinite(statBlock.passivePerception) && statBlock.passivePerception > 0
          ? statBlock.passivePerception.toString()
          : ""
    }
  ].filter((row) => row.value.length > 0);
}

function formatAlignmentWithLevel(statBlock: PortableEncounterStatBlock): string {
  return [statBlock.alignment, `Level ${statBlock.level}`]
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0)
    .join(", ");
}

function buildActionGroups(statBlock: PortableEncounterStatBlock): MonsterActionGroup[] {
  return [
    {
      title: "Feature Traits",
      features: toFeatureRecords(statBlock.featureTraits ?? [])
    },
    {
      title: "Reactions",
      features: toFeatureRecords(statBlock.reactions)
    }
  ].filter((group) => group.features !== null);
}

export function createEncounterStatBlockRendererModel(
  statBlock: PortableEncounterStatBlock
): EncounterStatBlockRendererModel {
  const typeLabel =
    statBlock.typeLabel ||
    [statBlock.species, statBlock.className].filter(Boolean).join(" ") ||
    "Party Member";
  const abilityScores = Object.fromEntries(
    Object.entries(monsterAbilityKeyByAbility).map(([abilityKey, monsterAbility]) => [
      monsterAbility,
      statBlock.abilities[abilityKey as AbilityKey].score
    ])
  );
  const modifiers = Object.fromEntries(
    Object.entries(monsterAbilityKeyByAbility).map(([abilityKey, monsterAbility]) => [
      monsterAbility,
      statBlock.abilities[abilityKey as AbilityKey].modifier
    ])
  );
  const savingThrows = Object.fromEntries(
    Object.entries(monsterAbilityKeyByAbility).flatMap(([abilityKey, monsterAbility]) => {
      const ability = statBlock.abilities[abilityKey as AbilityKey];

      return ability.save !== ability.modifier ? [[monsterAbility, ability.save]] : [];
    })
  );
  const savingThrowsAll = Object.fromEntries(
    Object.entries(monsterAbilityKeyByAbility).map(([abilityKey, monsterAbility]) => [
      monsterAbility,
      statBlock.abilities[abilityKey as AbilityKey].save
    ])
  );
  const speedValue = Number(statBlock.speed);
  const monster: MonsterRecord = {
    id: `encounter-stat-block-${toSlug(statBlock.name)}`,
    key: `encounter-stat-block-${toSlug(statBlock.name)}`,
    desc: "",
    name: statBlock.name,
    size: null,
    type: {
      key: "party-member",
      name: typeLabel
    },
    subcategory: null,
    category: "Party Member",
    alignment: formatAlignmentWithLevel(statBlock),
    armor_class: statBlock.armorClass,
    armor_detail: null,
    hit_points: statBlock.hitPoints,
    hit_dice: `current ${statBlock.currentHitPoints}/${statBlock.hitPoints}`,
    speed: Number.isFinite(speedValue) ? { walk: speedValue, unit: "feet" } : null,
    ability_scores: abilityScores,
    modifiers,
    saving_throws: savingThrows,
    saving_throws_all: savingThrowsAll,
    passive_perception: statBlock.passivePerception,
    skill_bonuses: statBlock.skills ?? {},
    skill_bonuses_all: statBlock.skills ?? {},
    senses_display: formatList(statBlock.senses),
    languages: {
      as_string: formatList(statBlock.languages)
    },
    resistances_and_immunities: {
      damage_vulnerabilities_display: formatList(statBlock.vulnerabilities),
      damage_vulnerabilities: [],
      damage_resistances_display: formatList(statBlock.resistances),
      damage_resistances: [],
      damage_immunities_display: formatList(statBlock.immunities),
      damage_immunities: [],
      condition_immunities_display: formatList(statBlock.conditionImmunities),
      condition_immunities: []
    },
    challenge_rating: "Character",
    actions: null,
    traits: null,
    document: null,
    illustration: null
  };

  return {
    actionGroups: buildActionGroups(statBlock),
    detailRows: buildDetailRows(statBlock),
    monster,
    vitalRows: buildVitalRows(statBlock)
  };
}
