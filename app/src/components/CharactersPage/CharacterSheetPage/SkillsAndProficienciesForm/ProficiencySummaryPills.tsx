import {
  getProficiencyLabel,
  type ProficiencyDisplayEntry
} from "../../../../pages/CharactersPage/proficiency";
import SheetSurface from "../SheetSurface";
import styles from "./SkillsAndProficienciesForm.module.css";
import type { ProficiencySummarySection } from "./proficiencySummarySections";

type ProficiencySummaryPillsProps = {
  sections: ProficiencySummarySection[];
  emptyClassName?: string;
  emptyText?: string;
  onEntryClick?: (entry: ProficiencyDisplayEntry) => void;
};

function formatSourceLabels(sourceLabels: string[]): string {
  const labels = [...new Set(sourceLabels.map((label) => label.trim()).filter(Boolean))];

  return labels.length > 0 ? labels.join(", ") : "Manual";
}

function ProficiencySummaryPills({
  sections,
  emptyClassName,
  emptyText = "No proficiencies assigned",
  onEntryClick
}: ProficiencySummaryPillsProps) {
  if (sections.length === 0) {
    return <p className={emptyClassName}>{emptyText}</p>;
  }

  return (
    <>
      {sections.map((section) => (
        <div key={section.title} className={styles.proficiencySubsection}>
          <p className={styles.skillGroupSubtitle}>{section.title}</p>
          <ul className={styles.proficiencyPillGrid}>
            {section.entries.map((entry) => {
              const label = getProficiencyLabel(entry.proficiency);
              const sourceLabels = formatSourceLabels(entry.sourceLabels);
              const isInteractive = typeof onEntryClick === "function";
              const content = (
                <>
                  <span>{label}</span>
                  <small>{sourceLabels}</small>
                </>
              );

              return (
                <SheetSurface
                  as="li"
                  key={`${section.title}:${entry.proficiency}:${entry.sourceLabels.join("|")}:${entry.proficiencyLevel}`}
                  borderSize="md"
                  hoverBorder={isInteractive}
                  className={styles.proficiencyPill}
                >
                  {isInteractive ? (
                    <button
                      type="button"
                      className={styles.proficiencyPillButton}
                      onClick={() => onEntryClick?.(entry)}
                    >
                      {content}
                    </button>
                  ) : (
                    <div className={styles.proficiencyPillContent}>{content}</div>
                  )}
                </SheetSurface>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

export default ProficiencySummaryPills;
