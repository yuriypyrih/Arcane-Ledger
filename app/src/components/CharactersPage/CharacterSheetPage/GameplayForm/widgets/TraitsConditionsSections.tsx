import type { CSSProperties } from "react";
import {
  getStatusDurationShortLabel,
  getStatusEntrySourceLabel,
  getStatusEntryTitle
} from "../../../../../pages/CharactersPage/traits";
import type { CharacterStatusEntry } from "../../../../../types";
import styles from "./TraitsConditionsWidget.module.css";

type StatusSection = {
  group: string;
  title: string;
  entries: CharacterStatusEntry[];
};

type TraitsConditionsSectionsProps = {
  sections: StatusSection[];
  onSelectEntry: (entryId: string) => void;
};

function TraitsConditionsSections({
  sections,
  onSelectEntry
}: TraitsConditionsSectionsProps) {
  return (
    <div
      className={styles.sectionStack}
      style={
        {
          "--status-column-count": String(Math.max(4, Math.min(6, sections.length))),
          "--status-tablet-column-count": String(
            sections.length > 4 ? 3 : Math.max(1, sections.length)
          ),
          "--status-mobile-column-count": String(Math.max(1, Math.min(2, sections.length)))
        } as CSSProperties
      }
    >
      {sections.map((section) => (
        <div key={section.group} className={styles.section}>
          <p className={styles.sectionTitle}>{section.title}</p>
          <ul className={styles.list}>
            {section.entries.map((entry) => {
              const shortDurationLabel = getStatusDurationShortLabel(entry.duration);

              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => onSelectEntry(entry.id)}
                  >
                    <span className={styles.buttonText}>
                      <span>{getStatusEntryTitle(entry)}</span>
                      <small>{getStatusEntrySourceLabel(entry)}</small>
                    </span>
                    {shortDurationLabel ? (
                      <strong className={styles.duration}>
                        <span>(</span>
                        {shortDurationLabel}
                        <span>)</span>
                      </strong>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default TraitsConditionsSections;
