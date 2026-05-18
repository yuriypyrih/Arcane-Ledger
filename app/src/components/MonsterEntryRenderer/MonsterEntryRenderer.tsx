import type { MonsterRecord } from "../../types";
import { renderCodexRichText } from "../../utils/codex/renderCodexRichText";
import AbilitySavingThrowCards from "../CharactersPage/CharacterSheetPage/StatsForm/AbilitySavingThrowCards";
import { buildMonsterAbilitySavingThrowCards } from "./monsterAbilitySavingThrowCards";
import {
  buildMonsterActionGroups,
  buildMonsterDetailRows,
  formatMonsterFeatureMeta,
  formatMonsterSpeed,
  formatMonsterTitleMeta,
  formatMonsterValueWithNote,
  getKnownMonsterText,
  type MonsterActionGroup
} from "./monsterEntryFormatting";
import styles from "./MonsterEntryRenderer.module.css";

type MonsterEntryRendererProps = {
  monster: MonsterRecord;
  className?: string;
  headingId?: string;
  showHeading?: boolean;
  surface?: "card" | "plain";
};

function FeatureGroup({ title, description, features }: MonsterActionGroup) {
  const groupDescription = getKnownMonsterText(description);

  if ((!features || features.length === 0) && !groupDescription) {
    return null;
  }

  return (
    <section className={styles.featureGroup}>
      <div className={styles.groupHeader}>
        <h3>{title}</h3>
        {groupDescription ? (
          <p className={styles.groupDescription}>{renderCodexRichText(groupDescription)}</p>
        ) : null}
      </div>
      {features?.length ? (
        <div className={styles.featureList}>
          {features.map((feature, index) => {
            const featureMeta = formatMonsterFeatureMeta(feature);
            const descriptionText = getKnownMonsterText(feature.desc);

            return (
              <article key={`${title}-${feature.name}-${index}`} className={styles.featureCard}>
                <div className={styles.featureTitleRow}>
                  <strong>{getKnownMonsterText(feature.name) ?? "Unnamed Feature"}</strong>
                  {featureMeta ? <span className={styles.featureMeta}>{featureMeta}</span> : null}
                </div>
                {descriptionText ? <p>{renderCodexRichText(descriptionText)}</p> : null}
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

function MonsterEntryRenderer({
  monster,
  className,
  headingId,
  showHeading = true,
  surface = "card"
}: MonsterEntryRendererProps) {
  const titleMeta = formatMonsterTitleMeta(monster);
  const description = getKnownMonsterText(monster.desc);
  const speed = formatMonsterSpeed(monster.speed);
  const detailRows = buildMonsterDetailRows(monster);
  const abilitySavingThrowCards = buildMonsterAbilitySavingThrowCards(monster);
  const actionGroups = buildMonsterActionGroups(monster);
  const shouldRenderIntro = showHeading || description;

  return (
    <article
      className={`${styles.entry} ${surface === "plain" ? styles.entryPlain : ""}${
        className ? ` ${className}` : ""
      }`.trim()}
    >
      {shouldRenderIntro ? (
        <section className={styles.section}>
          {showHeading ? (
            <h2 id={headingId}>{getKnownMonsterText(monster.name) ?? "Unknown Monster"}</h2>
          ) : null}
          {showHeading && titleMeta ? <p className={styles.subtitle}>{titleMeta}</p> : null}
          {description ? (
            <p className={styles.description}>{renderCodexRichText(description)}</p>
          ) : null}
        </section>
      ) : null}

      <section className={styles.section}>
        <div className={styles.inlineRows}>
          <InlineRow
            label="Armor Class"
            value={formatMonsterValueWithNote(monster.armor_class, monster.armor_desc)}
          />
          <InlineRow
            label="Hit Points"
            value={formatMonsterValueWithNote(monster.hit_points, monster.hit_dice)}
          />
          <InlineRow label="Speed" value={speed} />
        </div>
      </section>

      <section className={styles.section}>
        <AbilitySavingThrowCards cards={abilitySavingThrowCards} />
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
