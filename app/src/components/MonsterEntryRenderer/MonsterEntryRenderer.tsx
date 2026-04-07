import { Pentagon } from "lucide-react";
import type { MonsterRecord } from "../../types";
import statsStyles from "../CharactersPage/CharacterSheetPage/StatsForm/StatsForm.module.css";
import {
  buildMonsterActionGroups,
  buildMonsterDetailRows,
  formatMonsterAbilityScore,
  formatMonsterFeatureMeta,
  formatMonsterFeatureStat,
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
        {groupDescription ? <p className={styles.groupDescription}>{groupDescription}</p> : null}
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
  const ability = formatMonsterAbilityScore(value);
  const hasSavingThrowProficiency = save !== null && save !== undefined;
  const resolvedSavingThrow = hasSavingThrowProficiency
    ? formatMonsterFeatureStat(save)
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
  const titleMeta = formatMonsterTitleMeta(monster);
  const description = getKnownMonsterText(monster.desc);
  const speed = formatMonsterSpeed(monster.speed);
  const detailRows = buildMonsterDetailRows(monster);
  const actionGroups = buildMonsterActionGroups(monster);

  return (
    <article className={`${styles.entry}${className ? ` ${className}` : ""}`}>
      <section className={styles.section}>
        <h2 id={headingId}>{getKnownMonsterText(monster.name) ?? "Unknown Monster"}</h2>
        {titleMeta ? <p className={styles.subtitle}>{titleMeta}</p> : null}
        {description ? <p className={styles.description}>{description}</p> : null}
      </section>

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
