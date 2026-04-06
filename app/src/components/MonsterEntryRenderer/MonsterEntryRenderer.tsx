import { Pentagon } from "lucide-react";
import type { MonsterFeatureRecord, MonsterRecord, MonsterSpeedValue } from "../../types";
import statsStyles from "../CharactersPage/CharacterSheetPage/StatsForm/StatsForm.module.css";
import styles from "./MonsterEntryRenderer.module.css";

type MonsterEntryRendererProps = {
  monster: MonsterRecord;
  className?: string;
  headingId?: string;
};

type ActionGroupConfig = {
  title: string;
  features: MonsterFeatureRecord[] | null;
  description?: string | null;
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

function getKnownText(value: string | null | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  return normalizedValue.toLowerCase() === "unknown" ? null : normalizedValue;
}

function formatFeatureStat(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value}`;
}

function formatAbilityScore(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return {
      score: "—",
      modifier: "—"
    };
  }

  const modifier = Math.floor((value - 10) / 2);
  return {
    score: String(value),
    modifier: formatFeatureStat(modifier)
  };
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

function formatSpeed(speed: MonsterRecord["speed"] | null | undefined) {
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

function formatSkillMap(skills: MonsterRecord["skills"] | null | undefined) {
  if (!skills || Object.keys(skills).length === 0) {
    return null;
  }

  return Object.entries(skills)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key} ${value >= 0 ? "+" : ""}${value}`)
    .join(", ");
}

function formatFeatureMeta(feature: MonsterFeatureRecord) {
  const details: string[] = [];

  if (feature.attack_bonus !== undefined) {
    details.push(`Hit ${formatFeatureStat(feature.attack_bonus)}`);
  }

  if (feature.damage_dice) {
    const damageSuffix =
      feature.damage_bonus !== undefined ? ` ${formatFeatureStat(feature.damage_bonus)}` : "";
    details.push(`Damage ${feature.damage_dice}${damageSuffix}`);
  } else if (feature.damage_bonus !== undefined) {
    details.push(`Bonus ${formatFeatureStat(feature.damage_bonus)}`);
  }

  return details.join(" · ");
}

function formatSourceMeta(monster: MonsterRecord) {
  const sourceSlug = getKnownText(monster.document__slug);
  const sourceTitle = getKnownText(monster.document__title);
  const sourceLabel =
    sourceSlug && sourceTitle
      ? `${sourceSlug}: ${sourceTitle}`
      : sourceSlug ?? sourceTitle;

  if (!sourceLabel) {
    return null;
  }

  return monster.page_no !== null && monster.page_no !== undefined
    ? `${sourceLabel}, page: ${monster.page_no}`
    : sourceLabel;
}

function formatTitleMeta(monster: MonsterRecord) {
  const size = getKnownText(monster.size);
  const type = getKnownText(monster.type);
  const subtype = getKnownText(monster.subtype);
  const alignment = getKnownText(monster.alignment);
  const sourceMeta = formatSourceMeta(monster);
  const creatureType = [size, type].filter(Boolean).join(" ");
  const creatureLabel = subtype && creatureType ? `${creatureType} (${subtype})` : creatureType || subtype;
  const mainLabel = [creatureLabel || null, alignment].filter(Boolean).join(", ");

  if (sourceMeta && mainLabel) {
    return `${mainLabel} (${sourceMeta})`;
  }

  return mainLabel || sourceMeta || "";
}

function formatValueWithNote(
  value: string | number | null | undefined,
  note?: string | null
) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const formattedValue = String(value);
  const formattedNote = getKnownText(note);

  return formattedNote ? `${formattedValue} (${formattedNote})` : formattedValue;
}

function formatSenses(monster: MonsterRecord) {
  const senses = getKnownText(monster.senses);
  const passivePerception =
    monster.perception !== null && monster.perception !== undefined
      ? `passive Perception ${10 + monster.perception}`
      : null;

  if (senses && passivePerception && senses.toLowerCase().includes("passive perception")) {
    return senses;
  }

  return [senses, passivePerception].filter(Boolean).join(", ");
}

function formatChallengeRating(monster: MonsterRecord) {
  const challengeRating = getKnownText(monster.challenge_rating) ?? String(monster.cr);
  const xp = CR_XP_BY_VALUE.get(monster.cr);

  return xp ? `${challengeRating} (${xpFormatter.format(xp)} XP)` : challengeRating;
}

function FeatureGroup({ title, description, features }: ActionGroupConfig) {
  const groupDescription = getKnownText(description);

  if ((!features || features.length === 0) && !groupDescription) {
    return null;
  }

  return (
    <section className={styles.featureGroup}>
      <div className={styles.groupHeader}>
        <h3>{title}</h3>
        {groupDescription ? <p className={styles.groupDescription}>{groupDescription}</p> : null}
      </div>
      {features?.length ? (
        <div className={styles.featureList}>
          {features.map((feature, index) => {
            const featureMeta = formatFeatureMeta(feature);
            const descriptionText = getKnownText(feature.desc);

            return (
              <article key={`${title}-${feature.name}-${index}`} className={styles.featureCard}>
                <div className={styles.featureTitleRow}>
                  <strong>{getKnownText(feature.name) ?? "Unnamed Feature"}</strong>
                  {featureMeta ? <span className={styles.featureMeta}>{featureMeta}</span> : null}
                </div>
                {descriptionText ? <p>{descriptionText}</p> : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function InlineRow({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <p className={styles.inlineRow}>
      <strong>{label}:</strong>
      <span>{value}</span>
    </p>
  );
}

function AbilityCell({
  label,
  value,
  save
}: {
  label: string;
  value: number | null | undefined;
  save: number | null;
}) {
  const ability = formatAbilityScore(value);
  const hasSavingThrowProficiency = save !== null && save !== undefined;
  const resolvedSavingThrow = hasSavingThrowProficiency
    ? formatFeatureStat(save)
    : ability.modifier;

  return (
    <div className={`${statsStyles.modifierCard} ${styles.abilityCard}`}>
      <div className={statsStyles.modifierLabelRow}>
        <span className={statsStyles.modifierLabel}>{label}</span>
        <span className={statsStyles.scoreBadge} aria-label={`${label} score ${ability.score}`}>
          <Pentagon size={28} className={statsStyles.scoreBadgeIcon} aria-hidden="true" />
          <span className={statsStyles.scoreBadgeValue}>{ability.score}</span>
        </span>
      </div>
      <div className={`${statsStyles.combinedValueRow} ${styles.abilityValuesRow}`}>
        <div className={styles.abilityValueStack}>
          <span className={styles.abilityValueLabel}>MOD</span>
          <strong>{ability.modifier}</strong>
        </div>
        <span className={statsStyles.combinedValueDivider} aria-hidden="true" />
        <div className={styles.abilityValueStack}>
          <span className={styles.abilityValueLabel}>SAVE</span>
          <strong
            className={hasSavingThrowProficiency ? styles.abilityValueProficient : undefined}
          >
            {resolvedSavingThrow}
          </strong>
        </div>
      </div>
    </div>
  );
}

function MonsterEntryRenderer({ monster, className, headingId }: MonsterEntryRendererProps) {
  const titleMeta = formatTitleMeta(monster);
  const description = getKnownText(monster.desc);
  const speed = formatSpeed(monster.speed);
  const detailRows = [
    {
      label: "Skills",
      value: formatSkillMap(monster.skills)
    },
    {
      label: "Damage Vulnerabilities",
      value: getKnownText(monster.damage_vulnerabilities)
    },
    {
      label: "Damage Resistances",
      value: getKnownText(monster.damage_resistances)
    },
    {
      label: "Damage Immunities",
      value: getKnownText(monster.damage_immunities)
    },
    {
      label: "Condition Immunities",
      value: getKnownText(monster.condition_immunities)
    },
    {
      label: "Senses",
      value: formatSenses(monster) || null
    },
    {
      label: "Languages",
      value: getKnownText(monster.languages) ?? "None"
    },
    {
      label: "CR",
      value: formatChallengeRating(monster)
    }
  ].filter((row) => Boolean(row.value));
  const actionGroups: ActionGroupConfig[] = [
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
      Boolean(group.features && group.features.length > 0) || Boolean(getKnownText(group.description))
  );

  return (
    <article className={`${styles.entry}${className ? ` ${className}` : ""}`}>
      <section className={styles.section}>
        <h2 id={headingId}>{getKnownText(monster.name) ?? "Unknown Monster"}</h2>
        {titleMeta ? <p className={styles.subtitle}>{titleMeta}</p> : null}
        {description ? <p className={styles.description}>{description}</p> : null}
      </section>

      <section className={styles.section}>
        <div className={styles.inlineRows}>
          <InlineRow
            label="Armor Class"
            value={formatValueWithNote(monster.armor_class, monster.armor_desc)}
          />
          <InlineRow
            label="Hit Points"
            value={formatValueWithNote(monster.hit_points, monster.hit_dice)}
          />
          <InlineRow label="Speed" value={speed} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.abilityGrid}>
          <AbilityCell label="STR" value={monster.strength} save={monster.strength_save} />
          <AbilityCell label="DEX" value={monster.dexterity} save={monster.dexterity_save} />
          <AbilityCell label="CON" value={monster.constitution} save={monster.constitution_save} />
          <AbilityCell label="INT" value={monster.intelligence} save={monster.intelligence_save} />
          <AbilityCell label="WIS" value={monster.wisdom} save={monster.wisdom_save} />
          <AbilityCell label="CHA" value={monster.charisma} save={monster.charisma_save} />
        </div>
      </section>

      {detailRows.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.inlineRows}>
            {detailRows.map((row) => (
              <InlineRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </section>
      ) : null}

      {actionGroups.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.featureGroups}>
            {actionGroups.map((group) => (
              <FeatureGroup
                key={group.title}
                title={group.title}
                description={group.description}
                features={group.features}
              />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

export default MonsterEntryRenderer;
