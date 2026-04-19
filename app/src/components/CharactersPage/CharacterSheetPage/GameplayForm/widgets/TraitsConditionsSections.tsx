import clsx from "clsx";
import type { CSSProperties } from "react";
import ActionShape from "../../../../ActionShape";
import ConcentrationLabel from "../../../../ConcentrationLabel";
import {
  getStatusDurationTickOn,
  getStatusDurationShortLabel,
  getStatusEntrySourceLabel,
  getStatusEntryTitle
} from "../../../../../pages/CharactersPage/traits";
import type { CharacterStatusEntry } from "../../../../../types";
import { EFFECT_NAME, STATUS_DURATION_ROUND_TICK, STATUS_ENTRY_GROUP } from "../../../../../types";
import styles from "./TraitsConditionsSections.module.css";

type StatusSection = {
  group: string;
  title: string;
  entries: CharacterStatusEntry[];
};

type TraitsConditionsSectionsProps = {
  sections: StatusSection[];
  reactionAvailable: boolean;
  onSelectEntry: (entryId: string) => void;
};

const durationPillTruncationThreshold = 18;
const durationPillTruncatedLength = 15;

function getTraitPillDurationLabel(durationLabel: string): string {
  return durationLabel.length >= durationPillTruncationThreshold
    ? `${durationLabel.slice(0, durationPillTruncatedLength).trimEnd()}..`
    : durationLabel;
}

function TraitsConditionsSections({
  sections,
  reactionAvailable,
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
              const traitPillDurationLabel = shortDurationLabel
                ? getTraitPillDurationLabel(shortDurationLabel)
                : null;
              const isDurationTruncated =
                shortDurationLabel !== null && traitPillDurationLabel !== shortDurationLabel;
              const isReactionEntry = entry.group === STATUS_ENTRY_GROUP.REACTIONS;
              const roundTickOn = getStatusDurationTickOn(entry.duration);
              const roundPrefix = roundTickOn === STATUS_DURATION_ROUND_TICK.ROUND_START ? "<" : "";
              const roundSuffix = roundTickOn === STATUS_DURATION_ROUND_TICK.ROUND_END ? ">" : "";

              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={clsx(styles.button, entry.disabled && styles.buttonDisabled)}
                    onClick={() => {
                      if (entry.disabled) {
                        return;
                      }

                      onSelectEntry(entry.id);
                    }}
                    disabled={entry.disabled === true}
                  >
                    <span className={styles.buttonText}>
                      <span>
                        {entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
                        entry.value === EFFECT_NAME.CONCENTRATION ? (
                          <ConcentrationLabel iconSize={14} />
                        ) : (
                          getStatusEntryTitle(entry)
                        )}
                      </span>
                      <small>{getStatusEntrySourceLabel(entry)}</small>
                    </span>
                    {shortDurationLabel || isReactionEntry ? (
                      <span className={styles.buttonMeta}>
                        {traitPillDurationLabel ? (
                          <strong
                            className={styles.duration}
                            title={isDurationTruncated ? shortDurationLabel : undefined}
                          >
                            {roundPrefix ? <span>{roundPrefix}</span> : null}
                            <span>(</span>
                            {traitPillDurationLabel}
                            <span>)</span>
                            {roundSuffix ? <span>{roundSuffix}</span> : null}
                          </strong>
                        ) : null}
                        {isReactionEntry ? (
                          <span className={styles.reactionBadge} aria-hidden="true">
                            <ActionShape
                              shape="reaction"
                              isSelected={reactionAvailable}
                              size="small"
                            />
                          </span>
                        ) : null}
                      </span>
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
