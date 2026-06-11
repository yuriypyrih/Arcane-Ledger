import type { MonsterRecord } from "../../types";
import { renderCodexRichText } from "../../utils/codex/renderCodexRichText";
import { isDeprecatedMonsterRecord } from "../../utils/monsters";
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
  type MonsterActionGroup,
  type MonsterDetailRow
} from "./monsterEntryFormatting";
import styles from "./MonsterEntryRenderer.module.css";

type MonsterEntryRendererProps = {
  actionGroups?: MonsterActionGroup[];
  monster: MonsterRecord;
  className?: string;
  detailRows?: MonsterDetailRow[];
  headingTag?: string;
  headingId?: string;
  showHeading?: boolean;
  surface?: "card" | "plain";
  vitalRows?: MonsterDetailRow[];
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

function DescriptionBlock({ description }: { description: string }) {
  const paragraphs = description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <div className={styles.descriptionStack}>
      {paragraphs.map((paragraph, index) => (
        <p key={`monster-description-${index}`} className={styles.description}>
          {renderCodexRichText(paragraph)}
        </p>
      ))}
    </div>
  );
}

function MonsterEntryRenderer({
  actionGroups: providedActionGroups,
  monster,
  className,
  detailRows: providedDetailRows,
  headingTag,
  headingId,
  showHeading = true,
  surface = "card",
  vitalRows = []
}: MonsterEntryRendererProps) {
  const titleMeta = formatMonsterTitleMeta(monster);
  const description = getKnownMonsterText(monster.desc);
  const speed = formatMonsterSpeed(monster);
  const detailRows = providedDetailRows ?? buildMonsterDetailRows(monster);
  const abilitySavingThrowCards = buildMonsterAbilitySavingThrowCards(monster);
  const actionGroups = providedActionGroups ?? buildMonsterActionGroups(monster);
  const shouldRenderIntro = showHeading || description;
  const isDeprecated = isDeprecatedMonsterRecord(monster);
  const coreRows = [
    {
      label: "Armor Class",
      value: formatMonsterValueWithNote(monster.armor_class, monster.armor_detail)
    },
    {
      label: "Hit Points",
      value: formatMonsterValueWithNote(monster.hit_points, monster.hit_dice)
    },
    {
      label: "Speed",
      value: speed
    },
    ...vitalRows
  ].filter((row) => Boolean(row.value));

  return (
    <article
      className={`${styles.entry} ${surface === "plain" ? styles.entryPlain : ""}${
        className ? ` ${className}` : ""
      }`.trim()}
    >
      {shouldRenderIntro ? (
        <section className={styles.section}>
          {showHeading ? (
            headingTag ? (
              <div className={styles.headingRow}>
                <h2 id={headingId}>{getKnownMonsterText(monster.name) ?? "Unknown Monster"}</h2>
                <span className={styles.headingTag}>{headingTag}</span>
              </div>
            ) : (
              <h2 id={headingId}>{getKnownMonsterText(monster.name) ?? "Unknown Monster"}</h2>
            )
          ) : null}
          {showHeading && titleMeta ? <p className={styles.subtitle}>{titleMeta}</p> : null}
          {description ? <DescriptionBlock description={description} /> : null}
        </section>
      ) : null}

      {isDeprecated ? (
        <p className={styles.deprecatedNotice}>
          This stat block uses a deprecated monster schema. Delete and recreate this creature to
          refresh the stat block.
        </p>
      ) : null}

      {coreRows.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.inlineRows}>
            {coreRows.map((row) => (
              <InlineRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </section>
      ) : null}

      {abilitySavingThrowCards.length > 0 ? (
        <section className={styles.section}>
          <AbilitySavingThrowCards cards={abilitySavingThrowCards} />
        </section>
      ) : null}

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
