import CellContainer from "../../../../../CellContainer/CellContainer";
import type { FeatureActionFact } from "../../../../../../pages/CharactersPage/classFeatures";
import styles from "./GameplayActionDrawer.module.css";

type FeatureActionFactsProps = {
  title: string;
  facts: FeatureActionFact[];
  sectionTitle?: string | null;
};

function getToneClassName(tone: FeatureActionFact["tone"]) {
  if (tone === "danger") {
    return styles.factValueDanger;
  }

  if (tone === "accent") {
    return styles.factValueAccent;
  }

  return "";
}

function FeatureActionFacts({ title, facts, sectionTitle = "Details" }: FeatureActionFactsProps) {
  if (facts.length <= 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      {sectionTitle ? <h4 className={styles.sectionTitle}>{sectionTitle}</h4> : null}
      <div className={styles.factGrid}>
        {facts.map((fact, index) => (
          <CellContainer
            key={`${title}-fact-${index}`}
            label={fact.label}
            content={fact.value}
            breakdown={fact.breakdown}
            className={fact.fullWidth ? styles.factFullWidth : undefined}
            contentClassName={getToneClassName(fact.tone)}
            breakdownClassName={styles.factBreakdown}
          />
        ))}
      </div>
    </section>
  );
}

export default FeatureActionFacts;
