import type { MonsterFeatureRecord, MonsterRecord } from "../../types";
import styles from "./MonsterEntryRenderer.module.css";

type MonsterEntryRendererProps = {
  monster: MonsterRecord;
  className?: string;
};

type ActionGroupConfig = {
  title: string;
  features: MonsterFeatureRecord[] | null;
  description?: string | null;
};

function formatText(value: string | null | undefined, fallback = "Unknown") {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : fallback;
}

function formatNullableNumber(value: number | null | undefined, fallback = "—") {
  return value ?? fallback;
}

function formatDelimitedText(value: string | null | undefined, fallback = "None") {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : fallback;
}

function formatList(values: string[] | null | undefined, fallback = "None listed") {
  if (!values || values.length === 0) {
    return fallback;
  }

  return values.join(", ");
}

function formatSpeed(speed: MonsterRecord["speed"] | null | undefined) {
  if (!speed || Object.keys(speed).length === 0) {
    return "Unknown";
  }

  return Object.entries(speed)
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        return value ? key : `${key}: false`;
      }

      return `${key}: ${value}`;
    })
    .join(", ");
}

function formatSkillMap(skills: MonsterRecord["skills"] | null | undefined) {
  if (!skills || Object.keys(skills).length === 0) {
    return "None";
  }

  return Object.entries(skills)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}: ${value >= 0 ? "+" : ""}${value}`)
    .join(", ");
}

function formatSpellList(spellList: string[] | null | undefined) {
  if (!spellList || spellList.length === 0) {
    return [];
  }

  return spellList.map((spellUrl) => {
    const urlParts = spellUrl.split("/").filter(Boolean);
    const slug = urlParts[urlParts.length - 1] ?? spellUrl;
    return slug
      .split("-")
      .map((part: string) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(" ");
  });
}

function formatFeatureStat(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value}`;
}

function formatAbilityScore(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  const modifier = Math.floor((value - 10) / 2);
  return `${value} (${formatFeatureStat(modifier)})`;
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

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function formatSourceLine(monster: MonsterRecord) {
  return `Source: ${monster.document__slug} (${monster.document__title}, Page: ${
    monster.page_no ?? "Unknown"
  })`;
}

function FeatureGroup({ title, description, features }: ActionGroupConfig) {
  const groupDescription = description?.trim();

  if ((!features || features.length === 0) && !groupDescription) {
    return null;
  }

  return (
    <section className={styles.featureGroup}>
      <div className={styles.groupHeader}>
        <h4>{title}</h4>
        {groupDescription ? <p className={styles.groupDescription}>{groupDescription}</p> : null}
      </div>
      {features?.length ? (
        <div className={styles.featureList}>
          {features.map((feature, index) => {
            const featureMeta = formatFeatureMeta(feature);

            return (
              <article key={`${title}-${feature.name}-${index}`} className={styles.featureCard}>
                <div className={styles.featureTitleRow}>
                  <strong>{feature.name || "Unnamed Feature"}</strong>
                  {featureMeta ? <span className={styles.featureMeta}>{featureMeta}</span> : null}
                </div>
                <p>{formatText(feature.desc, "No description available.")}</p>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function CoreStat({
  label,
  value,
  note
}: {
  label: string;
  value: string | number;
  note?: string | null;
}) {
  return (
    <div className={styles.coreStat}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
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
  return (
    <div className={styles.abilityCell}>
      <span>{label}</span>
      <strong>{formatAbilityScore(value)}</strong>
      <small>Save {formatFeatureStat(save)}</small>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MonsterEntryRenderer({ monster, className }: MonsterEntryRendererProps) {
  const spellList = formatSpellList(monster.spell_list);
  const detailItems = [
    {
      label: "Group",
      value: monster.group,
      show: hasText(monster.group)
    },
    {
      label: "Environments",
      value: formatList(monster.environments),
      show: monster.environments.length > 0
    },
    {
      label: "Skills",
      value: formatSkillMap(monster.skills),
      show: Object.keys(monster.skills).length > 0
    },
    {
      label: "Damage Vulnerabilities",
      value: formatDelimitedText(monster.damage_vulnerabilities),
      show: hasText(monster.damage_vulnerabilities)
    },
    {
      label: "Damage Resistances",
      value: formatDelimitedText(monster.damage_resistances),
      show: hasText(monster.damage_resistances)
    },
    {
      label: "Damage Immunities",
      value: formatDelimitedText(monster.damage_immunities),
      show: hasText(monster.damage_immunities)
    },
    {
      label: "Condition Immunities",
      value: formatDelimitedText(monster.condition_immunities),
      show: hasText(monster.condition_immunities)
    },
    {
      label: "Spell List",
      value: spellList.join(", "),
      show: spellList.length > 0
    }
  ].filter((item): item is { label: string; value: string; show: true } => item.show);
  const actionGroups: ActionGroupConfig[] = [
    {
      title: "Actions",
      features: monster.actions
    },
    {
      title: "Bonus Actions",
      features: monster.bonus_actions
    },
    {
      title: "Reactions",
      features: monster.reactions
    },
    {
      title: "Special Abilities",
      features: monster.special_abilities
    },
    {
      title: "Legendary Actions",
      features: monster.legendary_actions,
      description: monster.legendary_desc
    }
  ].filter((group) => (group.features && group.features.length > 0) || hasText(group.description));

  return (
    <div className={`${styles.entry}${className ? ` ${className}` : ""}`}>
      <section className={styles.section}>
        <div className={styles.heroHeader}>
          <div className={styles.titleBlock}>
            <p className={styles.eyebrow}>Monster Codex</p>
            <h2>{monster.name || "Unknown Monster"}</h2>
            <p className={styles.subtitle}>
              {formatText(monster.size)} {formatText(monster.type)}
              {monster.subtype ? ` (${monster.subtype})` : ""}
              {" · "}
              {formatText(monster.alignment)}
            </p>
          </div>
          <div className={styles.challengeBadge}>
            <span>CR</span>
            <strong>{monster.challenge_rating || monster.cr}</strong>
          </div>
        </div>

        <div className={styles.subtleDivider} />

        <p className={styles.description}>{formatText(monster.desc, "No description available.")}</p>

        <div className={styles.subtleDivider} />

        <div className={styles.metaBlock}>
          <p className={styles.sourceLine}>{formatSourceLine(monster)}</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Core Stats</h3>
        </div>

        <div className={styles.coreStatGrid}>
          <CoreStat
            label="Armor Class"
            value={formatNullableNumber(monster.armor_class)}
            note={hasText(monster.armor_desc) ? monster.armor_desc : null}
          />
          <CoreStat
            label="Hit Points"
            value={formatNullableNumber(monster.hit_points)}
            note={hasText(monster.hit_dice) ? monster.hit_dice : null}
          />
          <CoreStat label="Speed" value={formatSpeed(monster.speed)} />
          <CoreStat
            label="Senses"
            value={formatText(monster.senses)}
            note={monster.perception !== null ? `Perception ${formatFeatureStat(monster.perception)}` : null}
          />
          <CoreStat label="Languages" value={formatText(monster.languages, "None")} />
        </div>

        <div className={styles.subtleDivider} />

        <div className={styles.abilityGrid}>
          <AbilityCell label="STR" value={monster.strength} save={monster.strength_save} />
          <AbilityCell label="DEX" value={monster.dexterity} save={monster.dexterity_save} />
          <AbilityCell label="CON" value={monster.constitution} save={monster.constitution_save} />
          <AbilityCell label="INT" value={monster.intelligence} save={monster.intelligence_save} />
          <AbilityCell label="WIS" value={monster.wisdom} save={monster.wisdom_save} />
          <AbilityCell label="CHA" value={monster.charisma} save={monster.charisma_save} />
        </div>

        {detailItems.length > 0 ? (
          <>
            <div className={styles.subtleDivider} />
            <div className={styles.detailGrid}>
              {detailItems.map((item) => (
                <DetailItem key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </>
        ) : null}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Abilities & Actions</h3>
        </div>

        {actionGroups.length > 0 ? (
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
        ) : (
          <p className={styles.emptyText}>No actions listed.</p>
        )}
      </section>
    </div>
  );
}

export default MonsterEntryRenderer;
