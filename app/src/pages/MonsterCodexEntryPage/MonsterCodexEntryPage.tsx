import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { MonsterFeatureRecord, MonsterRecord } from "../../types";
import styles from "./MonsterCodexEntryPage.module.css";
import { useMonsterEntry } from "./useMonsterEntry";

function formatText(value: string | null | undefined, fallback = "Unknown") {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : fallback;
}

function formatNullableNumber(value: number | null | undefined, fallback = "—") {
  return value ?? fallback;
}

function formatList(values: string[] | null | undefined, fallback = "None listed") {
  if (!values || values.length === 0) {
    return fallback;
  }

  return values.join(", ");
}

function formatDelimitedText(value: string | null | undefined, fallback = "None") {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : fallback;
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

function FeatureSection({
  title,
  features
}: {
  title: string;
  features: MonsterFeatureRecord[] | null;
}) {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>{title}</h3>
      </div>
      <div className={styles.featureList}>
        {features.map((feature, index) => (
          <article key={`${title}-${feature.name}-${index}`} className={styles.featureCard}>
            <div className={styles.featureTitleRow}>
              <strong>{feature.name || "Unnamed Feature"}</strong>
              <span className={styles.featureMeta}>
                {feature.attack_bonus !== undefined ? `To Hit ${formatFeatureStat(feature.attack_bonus)}` : null}
                {feature.damage_dice ? `Damage ${feature.damage_dice}` : null}
                {feature.damage_bonus !== undefined ? `Bonus ${formatFeatureStat(feature.damage_bonus)}` : null}
              </span>
            </div>
            <p>{formatText(feature.desc, "No description available.")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatCell({ label, value, save }: { label: string; value: number; save: number | null }) {
  return (
    <div className={styles.statCell}>
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
      <small>Save {formatFeatureStat(save)}</small>
    </div>
  );
}

function MonsterCodexEntryPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { monster, status } = useMonsterEntry(slug);
  const [imageFailed, setImageFailed] = useState(false);
  const backToCodexPath = searchParams.toString().length > 0 ? `/codex?${searchParams}` : "/codex";
  const formattedSpells = useMemo(() => formatSpellList(monster?.spell_list), [monster?.spell_list]);

  return (
    <section className={styles.page}>
      <button type="button" className={styles.backButton} onClick={() => navigate(backToCodexPath)}>
        Go back
      </button>

      {status === "loading" ? (
        <article className={styles.card}>
          <h2>Loading monster...</h2>
          <p>Fetching monster details from the backend.</p>
        </article>
      ) : null}

      {status === "error" ? (
        <article className={styles.card}>
          <h2>Monster unavailable</h2>
          <p>The selected monster could not be loaded.</p>
          <Link to={backToCodexPath} className={styles.linkButton}>
            Back to codex
          </Link>
        </article>
      ) : null}

      {status === "ready" && !monster ? (
        <article className={styles.card}>
          <h2>Monster not found</h2>
          <p>The selected monster could not be found.</p>
          <Link to={backToCodexPath} className={styles.linkButton}>
            Back to codex
          </Link>
        </article>
      ) : null}

      {status === "ready" && monster ? (
        <>
          <article className={styles.hero}>
            <div className={styles.heroHeader}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>Monster Codex</p>
                <h2>{monster.name || "Unknown Monster"}</h2>
                <p className={styles.heroMeta}>
                  {formatText(monster.size)} {formatText(monster.type)}
                  {monster.subtype ? ` (${monster.subtype})` : ""}
                  {" · "}
                  CR {monster.challenge_rating || monster.cr}
                </p>
                <p className={styles.heroSummary}>{formatText(monster.desc, "No description available.")}</p>
              </div>
              <div className={styles.imagePanel}>
                {monster.img_main && !imageFailed ? (
                  <img
                    src={monster.img_main}
                    alt={monster.name}
                    className={styles.image}
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <strong>{monster.name.slice(0, 1) || "?"}</strong>
                    <span>No image available</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.pillRow}>
              <span className={styles.pill}>Type: {formatText(monster.type)}</span>
              <span className={styles.pill}>Alignment: {formatText(monster.alignment)}</span>
              <span className={styles.pill}>Source: {formatText(monster.document__title)}</span>
              <span className={styles.pill}>Slug: {monster.slug}</span>
            </div>
          </article>

          <div className={styles.sectionGrid}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Combat Snapshot</h3>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <span>Armor Class</span>
                  <strong>{formatNullableNumber(monster.armor_class)}</strong>
                  <small>{formatText(monster.armor_desc, "No armor details")}</small>
                </div>
                <div className={styles.infoCard}>
                  <span>Hit Points</span>
                  <strong>{formatNullableNumber(monster.hit_points)}</strong>
                  <small>{formatText(monster.hit_dice, "No hit dice")}</small>
                </div>
                <div className={styles.infoCard}>
                  <span>Speed</span>
                  <strong>{formatSpeed(monster.speed)}</strong>
                  <small>All listed movement types</small>
                </div>
                <div className={styles.infoCard}>
                  <span>Senses</span>
                  <strong>{formatText(monster.senses)}</strong>
                  <small>Perception {formatFeatureStat(monster.perception)}</small>
                </div>
                <div className={styles.infoCard}>
                  <span>Languages</span>
                  <strong>{formatText(monster.languages, "None")}</strong>
                  <small>Group {formatText(monster.group, "None")}</small>
                </div>
                <div className={styles.infoCard}>
                  <span>Page</span>
                  <strong>{formatNullableNumber(monster.page_no)}</strong>
                  <small>{formatText(monster.document__slug)}</small>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Ability Scores</h3>
              </div>
              <div className={styles.statsGrid}>
                <StatCell label="STR" value={monster.strength} save={monster.strength_save} />
                <StatCell label="DEX" value={monster.dexterity} save={monster.dexterity_save} />
                <StatCell label="CON" value={monster.constitution} save={monster.constitution_save} />
                <StatCell label="INT" value={monster.intelligence} save={monster.intelligence_save} />
                <StatCell label="WIS" value={monster.wisdom} save={monster.wisdom_save} />
                <StatCell label="CHA" value={monster.charisma} save={monster.charisma_save} />
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Defenses & Skills</h3>
              </div>
              <div className={styles.stackList}>
                <div className={styles.stackItem}>
                  <span>Skills</span>
                  <strong>{formatSkillMap(monster.skills)}</strong>
                </div>
                <div className={styles.stackItem}>
                  <span>Damage Vulnerabilities</span>
                  <strong>{formatDelimitedText(monster.damage_vulnerabilities)}</strong>
                </div>
                <div className={styles.stackItem}>
                  <span>Damage Resistances</span>
                  <strong>{formatDelimitedText(monster.damage_resistances)}</strong>
                </div>
                <div className={styles.stackItem}>
                  <span>Damage Immunities</span>
                  <strong>{formatDelimitedText(monster.damage_immunities)}</strong>
                </div>
                <div className={styles.stackItem}>
                  <span>Condition Immunities</span>
                  <strong>{formatDelimitedText(monster.condition_immunities)}</strong>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Source & Tags</h3>
              </div>
              <div className={styles.stackList}>
                <div className={styles.stackItem}>
                  <span>Document</span>
                  <strong>{formatText(monster.document__title)}</strong>
                </div>
                <div className={styles.stackItem}>
                  <span>Environments</span>
                  <strong>{formatList(monster.environments)}</strong>
                </div>
                <div className={styles.stackItem}>
                  <span>Spell List</span>
                  <strong>{formattedSpells.length > 0 ? formattedSpells.join(", ") : "None"}</strong>
                </div>
                <div className={styles.stackItem}>
                  <span>Open5e Links</span>
                  <strong>{formatText(monster.v2_converted_path)}</strong>
                </div>
              </div>
            </section>
          </div>

          {monster.special_abilities || monster.actions || monster.bonus_actions || monster.reactions || monster.legendary_actions ? (
            <div className={styles.sectionStack}>
              <FeatureSection title="Special Abilities" features={monster.special_abilities} />
              <FeatureSection title="Actions" features={monster.actions} />
              <FeatureSection title="Bonus Actions" features={monster.bonus_actions} />
              <FeatureSection title="Reactions" features={monster.reactions} />
              {monster.legendary_desc ? (
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3>Legendary Description</h3>
                  </div>
                  <p className={styles.sectionText}>{monster.legendary_desc}</p>
                </section>
              ) : null}
              <FeatureSection title="Legendary Actions" features={monster.legendary_actions} />
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

export default MonsterCodexEntryPage;
