import type { MonsterFeatureRecord, MonsterRecord, MonsterSpeedValue } from "../../types";
import { normalizeNullableText } from "../../utils/normalize";

export type MonsterActionGroup = {
  title: string;
  features: MonsterFeatureRecord[] | null;
  description?: string | null;
};

export type MonsterDetailRow = {
  label: string;
  value: string;
};

const CR_XP_BY_VALUE = new Map<number, number>([
  [0, 10],
  [0.125, 25],
  [0.25, 50],
  [0.5, 100],
  [1, 200],
  [2, 450],
  [3, 700],
  [4, 1100],
  [5, 1800],
  [6, 2300],
  [7, 2900],
  [8, 3900],
  [9, 5000],
  [10, 5900],
  [11, 7200],
  [12, 8400],
  [13, 10000],
  [14, 11500],
  [15, 13000],
  [16, 15000],
  [17, 18000],
  [18, 20000],
  [19, 22000],
  [20, 25000],
  [21, 33000],
  [22, 41000],
  [23, 50000],
  [24, 62000],
  [25, 75000],
  [26, 90000],
  [27, 105000],
  [28, 120000],
  [29, 135000],
  [30, 155000]
]);

const xpFormatter = new Intl.NumberFormat("en-US");

export function getKnownMonsterText(value: string | null | undefined) {
  const normalizedValue = normalizeNullableText(value);

  if (!normalizedValue) {
    return null;
  }

  return normalizedValue.toLowerCase() === "unknown" ? null : normalizedValue;
}

export function formatMonsterFeatureStat(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value}`;
}

function formatMovementValue(value: MonsterSpeedValue) {
  if (typeof value === "boolean") {
    return value ? "" : null;
  }

  if (typeof value === "number") {
    return `${value} ft.`;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

export function formatMonsterSpeed(speed: MonsterRecord["speed"] | null | undefined) {
  if (!speed || Object.keys(speed).length === 0) {
    return null;
  }

  return Object.entries(speed)
    .flatMap(([key, value]) => {
      const formattedValue = formatMovementValue(value);

      if (formattedValue === null) {
        return [];
      }

      const normalizedKey = key.trim().toLowerCase();

      if (normalizedKey === "walk" || normalizedKey === "speed") {
        return [formattedValue];
      }

      if (formattedValue.length === 0) {
        return [normalizedKey];
      }

      return [`${normalizedKey} ${formattedValue}`];
    })
    .join(", ");
}

function formatMonsterSkillMap(skills: MonsterRecord["skills"] | null | undefined) {
  if (!skills || Object.keys(skills).length === 0) {
    return null;
  }

  return Object.entries(skills)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key} ${value >= 0 ? "+" : ""}${value}`)
    .join(", ");
}

export function formatMonsterFeatureMeta(feature: MonsterFeatureRecord) {
  const details: string[] = [];

  if (feature.attack_bonus !== undefined) {
    details.push(`Hit ${formatMonsterFeatureStat(feature.attack_bonus)}`);
  }

  if (feature.damage_dice) {
    const damageSuffix =
      feature.damage_bonus !== undefined
        ? ` ${formatMonsterFeatureStat(feature.damage_bonus)}`
        : "";
    details.push(`Damage ${feature.damage_dice}${damageSuffix}`);
  } else if (feature.damage_bonus !== undefined) {
    details.push(`Bonus ${formatMonsterFeatureStat(feature.damage_bonus)}`);
  }

  return details.join(" · ");
}

function formatMonsterSourceMeta(monster: MonsterRecord) {
  const sourceSlug = getKnownMonsterText(monster.document__slug);
  const sourceTitle = getKnownMonsterText(monster.document__title);
  const sourceLabel =
    sourceSlug && sourceTitle ? `${sourceSlug}: ${sourceTitle}` : (sourceSlug ?? sourceTitle);

  if (!sourceLabel) {
    return null;
  }

  return monster.page_no !== null && monster.page_no !== undefined
    ? `${sourceLabel}, page: ${monster.page_no}`
    : sourceLabel;
}

export function formatMonsterTitleMeta(monster: MonsterRecord) {
  const size = getKnownMonsterText(monster.size);
  const type = getKnownMonsterText(monster.type);
  const subtype = getKnownMonsterText(monster.subtype);
  const alignment = getKnownMonsterText(monster.alignment);
  const sourceMeta = formatMonsterSourceMeta(monster);
  const creatureType = [size, type].filter(Boolean).join(" ");
  const creatureLabel =
    subtype && creatureType ? `${creatureType} (${subtype})` : creatureType || subtype;
  const mainLabel = [creatureLabel || null, alignment].filter(Boolean).join(", ");

  if (sourceMeta && mainLabel) {
    return `${mainLabel} (${sourceMeta})`;
  }

  return mainLabel || sourceMeta || "";
}

export function formatMonsterValueWithNote(
  value: string | number | null | undefined,
  note?: string | null
) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const formattedValue = String(value);
  const formattedNote = getKnownMonsterText(note);

  return formattedNote ? `${formattedValue} (${formattedNote})` : formattedValue;
}

function formatMonsterSenses(monster: MonsterRecord) {
  const senses = getKnownMonsterText(monster.senses);
  const passivePerception =
    monster.perception !== null && monster.perception !== undefined
      ? `passive Perception ${10 + monster.perception}`
      : null;

  if (senses && passivePerception && senses.toLowerCase().includes("passive perception")) {
    return senses;
  }

  return [senses, passivePerception].filter(Boolean).join(", ");
}

function formatMonsterChallengeRating(monster: MonsterRecord) {
  const challengeRating = getKnownMonsterText(monster.challenge_rating) ?? String(monster.cr);

  if (/\bxp\b/i.test(challengeRating)) {
    return challengeRating;
  }

  const xp = CR_XP_BY_VALUE.get(monster.cr);

  return xp ? `${challengeRating} (${xpFormatter.format(xp)} XP)` : challengeRating;
}

export function buildMonsterDetailRows(monster: MonsterRecord): MonsterDetailRow[] {
  return [
    {
      label: "Skills",
      value: formatMonsterSkillMap(monster.skills) ?? ""
    },
    {
      label: "Damage Vulnerabilities",
      value: getKnownMonsterText(monster.damage_vulnerabilities) ?? ""
    },
    {
      label: "Damage Resistances",
      value: getKnownMonsterText(monster.damage_resistances) ?? ""
    },
    {
      label: "Damage Immunities",
      value: getKnownMonsterText(monster.damage_immunities) ?? ""
    },
    {
      label: "Condition Immunities",
      value: getKnownMonsterText(monster.condition_immunities) ?? ""
    },
    {
      label: "Senses",
      value: formatMonsterSenses(monster)
    },
    {
      label: "Languages",
      value: getKnownMonsterText(monster.languages) ?? "None"
    },
    {
      label: "CR",
      value: formatMonsterChallengeRating(monster)
    }
  ].filter((row) => Boolean(row.value));
}

export function buildMonsterActionGroups(monster: MonsterRecord): MonsterActionGroup[] {
  return [
    {
      title: "Special Abilities",
      features: monster.special_abilities
    },
    {
      title: "Actions",
      features: monster.actions
    },
    {
      title: "Legendary Actions",
      features: monster.legendary_actions,
      description: monster.legendary_desc
    },
    {
      title: "Bonus Actions",
      features: monster.bonus_actions
    },
    {
      title: "Reactions",
      features: monster.reactions
    }
  ].filter(
    (group) =>
      Boolean(group.features && group.features.length > 0) ||
      Boolean(getKnownMonsterText(group.description))
  );
}
