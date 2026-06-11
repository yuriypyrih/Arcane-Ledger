import type { MonsterActionRecord, MonsterRecord, MonsterTraitRecord } from "../../types";
import {
  getMonsterChallengeRatingNumber,
  getMonsterSizeName,
  getMonsterSourceKey,
  getMonsterSourceTitle,
  getMonsterSpeed,
  getMonsterTypeName
} from "../../utils/monsters";
import { normalizeNullableText } from "../../utils/normalize";

export type MonsterFeatureDisplayRecord = MonsterActionRecord | MonsterTraitRecord;

export type MonsterActionGroup = {
  title: string;
  features: MonsterFeatureDisplayRecord[] | null;
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
    return "-";
  }

  return `${value >= 0 ? "+" : ""}${value}`;
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

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

export function formatMonsterSpeed(monster: Pick<MonsterRecord, "speed" | "speed_all">) {
  const speed = getMonsterSpeed(monster);

  if (!speed || Object.keys(speed).length === 0) {
    return null;
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

      if (formattedValue.length === 0) {
        return [normalizedKey];
      }

      return [`${normalizedKey} ${formattedValue}`];
    })
    .join(", ");
}

function formatMonsterNumberMap(map: Record<string, number | null | undefined> | null | undefined) {
  if (!map || Object.keys(map).length === 0) {
    return null;
  }

  return Object.entries(map)
    .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key} ${formatMonsterFeatureStat(value)}`)
    .join(", ");
}

function formatUsageLimit(action: MonsterActionRecord) {
  const usageLimits = action.usage_limits;

  if (!usageLimits) {
    return null;
  }

  const type = normalizeNullableText(usageLimits.type)?.replace(/_/g, " ").toLowerCase();
  const param = usageLimits.param;
  const paramText =
    typeof param === "number" || typeof param === "string" ? String(param).trim() : "";

  return [paramText, type].filter(Boolean).join(" ");
}

function formatAttackMeta(action: MonsterActionRecord) {
  const firstAttack = action.attacks?.find((attack) => typeof attack.to_hit_mod === "number");

  if (!firstAttack) {
    return null;
  }

  return `Hit ${formatMonsterFeatureStat(firstAttack.to_hit_mod)}`;
}

export function formatMonsterFeatureMeta(feature: MonsterFeatureDisplayRecord) {
  const details: string[] = [];

  if ("legendary_action_cost" in feature && typeof feature.legendary_action_cost === "number") {
    details.push(`${feature.legendary_action_cost} legendary`);
  }

  if ("usage_limits" in feature) {
    const usageLimit = formatUsageLimit(feature);

    if (usageLimit) {
      details.push(usageLimit);
    }

    const attackMeta = formatAttackMeta(feature);

    if (attackMeta) {
      details.push(attackMeta);
    }

    if (typeof feature.attack_bonus === "number") {
      details.push(`Hit ${formatMonsterFeatureStat(feature.attack_bonus)}`);
    }

    if (typeof feature.damage_dice === "string" && feature.damage_dice.trim()) {
      details.push(`Damage ${feature.damage_dice.trim()}`);
    }
  }

  return details.join(" - ");
}

function formatMonsterSourceMeta(monster: MonsterRecord) {
  const sourceKey = getMonsterSourceKey(monster);
  const sourceTitle = getMonsterSourceTitle(monster);
  const sourceLabel =
    sourceKey && sourceTitle ? `${sourceKey}: ${sourceTitle}` : (sourceKey ?? sourceTitle);

  if (!sourceLabel) {
    return null;
  }

  return typeof monster.page_no === "number" && Number.isFinite(monster.page_no)
    ? `${sourceLabel}, page: ${monster.page_no}`
    : sourceLabel;
}

export function formatMonsterTitleMeta(monster: MonsterRecord) {
  const size = getKnownMonsterText(getMonsterSizeName(monster));
  const type = getKnownMonsterText(getMonsterTypeName(monster));
  const subtype = getKnownMonsterText(monster.subcategory);
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

function formatSenseRange(label: string, value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return `${label} ${value} ft.`;
}

function formatMonsterSenses(monster: MonsterRecord) {
  const legacySenses = getKnownMonsterText(monster.senses_display);

  if (legacySenses) {
    return legacySenses;
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

function formatMonsterChallengeRating(monster: MonsterRecord) {
  const challengeRating =
    monster.challenge_rating !== null && monster.challenge_rating !== undefined
      ? String(monster.challenge_rating)
      : null;
  const normalizedChallengeRating = getKnownMonsterText(challengeRating) ?? "-";

  if (/\bxp\b/i.test(normalizedChallengeRating)) {
    return normalizedChallengeRating;
  }

  if (typeof monster.experience_points === "number" && Number.isFinite(monster.experience_points)) {
    return `${normalizedChallengeRating} (${xpFormatter.format(monster.experience_points)} XP)`;
  }

  const xp = CR_XP_BY_VALUE.get(getMonsterChallengeRatingNumber(monster) ?? -1);

  return xp ? `${normalizedChallengeRating} (${xpFormatter.format(xp)} XP)` : normalizedChallengeRating;
}

function formatResistanceDisplay(
  monster: MonsterRecord,
  key: keyof NonNullable<MonsterRecord["resistances_and_immunities"]>
) {
  const value = monster.resistances_and_immunities?.[key];

  return typeof value === "string" ? getKnownMonsterText(value) : null;
}

function getActionGroupFeatures(monster: MonsterRecord, actionType: MonsterActionRecord["action_type"]) {
  const actions = monster.actions ?? [];

  return actions
    .filter((action) => action.action_type === actionType)
    .sort((left, right) => {
      const leftOrder =
        typeof left.order_in_statblock === "number" && Number.isFinite(left.order_in_statblock)
          ? left.order_in_statblock
          : 999;
      const rightOrder =
        typeof right.order_in_statblock === "number" && Number.isFinite(right.order_in_statblock)
          ? right.order_in_statblock
          : 999;

      return leftOrder - rightOrder || String(left.name ?? "").localeCompare(String(right.name ?? ""));
    });
}

export function buildMonsterDetailRows(monster: MonsterRecord): MonsterDetailRow[] {
  return [
    {
      label: "Initiative",
      value:
        typeof monster.initiative_bonus === "number" && Number.isFinite(monster.initiative_bonus)
          ? formatMonsterFeatureStat(monster.initiative_bonus)
          : ""
    },
    {
      label: "Proficiency Bonus",
      value:
        typeof monster.proficiency_bonus === "number" && Number.isFinite(monster.proficiency_bonus)
          ? formatMonsterFeatureStat(monster.proficiency_bonus)
          : ""
    },
    {
      label: "Skills",
      value: formatMonsterNumberMap(monster.skill_bonuses) ?? ""
    },
    {
      label: "Damage Vulnerabilities",
      value: formatResistanceDisplay(monster, "damage_vulnerabilities_display") ?? ""
    },
    {
      label: "Damage Resistances",
      value: formatResistanceDisplay(monster, "damage_resistances_display") ?? ""
    },
    {
      label: "Damage Immunities",
      value: formatResistanceDisplay(monster, "damage_immunities_display") ?? ""
    },
    {
      label: "Condition Immunities",
      value: formatResistanceDisplay(monster, "condition_immunities_display") ?? ""
    },
    {
      label: "Senses",
      value: formatMonsterSenses(monster)
    },
    {
      label: "Languages",
      value: monster.languages ? (getKnownMonsterText(monster.languages.as_string) ?? "None") : ""
    },
    {
      label: "CR",
      value:
        monster.challenge_rating !== null && monster.challenge_rating !== undefined
          ? formatMonsterChallengeRating(monster)
          : ""
    }
  ].filter((row) => Boolean(row.value));
}

export function buildMonsterActionGroups(monster: MonsterRecord): MonsterActionGroup[] {
  return [
    {
      title: "Traits",
      features: monster.traits?.length ? monster.traits : null
    },
    {
      title: "Actions",
      features: getActionGroupFeatures(monster, "ACTION")
    },
    {
      title: "Bonus Actions",
      features: getActionGroupFeatures(monster, "BONUS_ACTION")
    },
    {
      title: "Reactions",
      features: getActionGroupFeatures(monster, "REACTION")
    },
    {
      title: "Legendary Actions",
      features: getActionGroupFeatures(monster, "LEGENDARY_ACTION")
    }
  ].filter((group) => Boolean(group.features && group.features.length > 0));
}
