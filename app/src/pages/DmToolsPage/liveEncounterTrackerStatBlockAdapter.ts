import type {
  MonsterActionGroup,
  MonsterDetailRow
} from "../../components/MonsterEntryRenderer/monsterEntryFormatting";
import type { AbilityKey, MonsterFeatureRecord, MonsterRecord, PortableEncounterStatBlock } from "../../types";

type EncounterStatBlockRendererModel = {
  actionGroups: MonsterActionGroup[];
  detailRows: MonsterDetailRow[];
  monster: MonsterRecord;
};

const abilityFieldByKey: Record<
  AbilityKey,
  {
    score: keyof Pick<
      MonsterRecord,
      "charisma" | "constitution" | "dexterity" | "intelligence" | "strength" | "wisdom"
    >;
    save: keyof Pick<
      MonsterRecord,
      | "charisma_save"
      | "constitution_save"
      | "dexterity_save"
      | "intelligence_save"
      | "strength_save"
      | "wisdom_save"
    >;
  }
> = {
  STR: { score: "strength", save: "strength_save" },
  DEX: { score: "dexterity", save: "dexterity_save" },
  CON: { score: "constitution", save: "constitution_save" },
  INT: { score: "intelligence", save: "intelligence_save" },
  WIS: { score: "wisdom", save: "wisdom_save" },
  CHA: { score: "charisma", save: "charisma_save" }
};

function formatSigned(value: number | string | null | undefined) {
  if (typeof value === "string") {
    return value.trim() || "-";
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return value >= 0 ? `+${value}` : value.toString();
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "";
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

function toSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "party-member";
}

function toFeatureRecords(labels: string[]): MonsterFeatureRecord[] | null {
  if (labels.length === 0) {
    return null;
  }

  return labels.map((label) => ({
    name: label,
    desc: ""
  }));
}

function buildDetailRows(statBlock: PortableEncounterStatBlock): MonsterDetailRow[] {
  const passivePerception =
    Number.isFinite(statBlock.passivePerception) && statBlock.passivePerception > 0
      ? `passive Perception ${statBlock.passivePerception}`
      : "";
  const senses = [formatList(statBlock.senses), passivePerception].filter(Boolean).join(", ");
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
    { label: "Level", value: statBlock.level.toString() },
    { label: "Initiative", value: formatSigned(statBlock.initiative) },
    { label: "Proficiency Bonus", value: formatSigned(statBlock.proficiencyBonus) },
    temporaryHitPoints,
    magicTemporaryHitPoints,
    { label: "Damage Vulnerabilities", value: formatList(statBlock.vulnerabilities) },
    { label: "Damage Resistances", value: formatList(statBlock.resistances) },
    { label: "Damage Immunities", value: formatList(statBlock.immunities) },
    { label: "Senses", value: senses },
    { label: "Languages", value: formatList(statBlock.languages) || "None" }
  ].filter((row): row is MonsterDetailRow => Boolean(row?.value));
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
  const monster: MonsterRecord = {
    id: `encounter-stat-block-${toSlug(statBlock.name)}`,
    slug: `encounter-stat-block-${toSlug(statBlock.name)}`,
    desc: "",
    name: statBlock.name,
    size: "Player Character",
    type: typeLabel,
    subtype: "",
    group: null,
    alignment: statBlock.alignment,
    armor_class: statBlock.armorClass,
    armor_desc: null,
    hit_points: statBlock.hitPoints,
    hit_dice: `current ${statBlock.currentHitPoints}/${statBlock.hitPoints}`,
    speed: statBlock.speed ? { walk: statBlock.speed } : {},
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    strength_save: null,
    dexterity_save: null,
    constitution_save: null,
    intelligence_save: null,
    wisdom_save: null,
    charisma_save: null,
    perception: null,
    skills: {},
    damage_vulnerabilities: formatList(statBlock.vulnerabilities),
    damage_resistances: formatList(statBlock.resistances),
    damage_immunities: formatList(statBlock.immunities),
    condition_immunities: "",
    senses: formatList(statBlock.senses),
    languages: formatList(statBlock.languages),
    challenge_rating: "Character",
    cr: 0,
    actions: null,
    bonus_actions: null,
    reactions: null,
    legendary_desc: null,
    legendary_actions: null,
    special_abilities: null,
    spell_list: [],
    page_no: null,
    environments: [],
    img_main: null,
    document__slug: "",
    document__title: "",
    document__license_url: "",
    document__url: "",
    v2_converted_path: ""
  };

  Object.entries(abilityFieldByKey).forEach(([abilityKey, fields]) => {
    const ability = statBlock.abilities[abilityKey as AbilityKey];

    monster[fields.score] = ability.score;
    monster[fields.save] = ability.save !== ability.modifier ? ability.save : null;
  });

  return {
    actionGroups: buildActionGroups(statBlock),
    detailRows: buildDetailRows(statBlock),
    monster
  };
}
