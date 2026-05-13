import clsx from "clsx";
import { ChevronsUp } from "lucide-react";
import type { CSSProperties } from "react";
import ActionShape from "../../../../../ActionShape";
import ConcentrationLabel from "../../../../../ConcentrationLabel";
import {
  getStatusDurationTickOn,
  getStatusDurationShortLabel,
  getStatusEntrySourceLabel,
  getStatusEntryTitle,
  hasStatusEntryDescriptionAdditions
} from "../../../../../../pages/CharactersPage/traits";
import type { CharacterStatusEntry } from "../../../../../../types";
import {
  EFFECT_NAME,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP
} from "../../../../../../types";
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

type StatusLayoutStyle = CSSProperties & {
  "--status-rendered-column-count": number;
};

function splitStatusSectionsIntoColumns(
  sections: StatusSection[],
  breakpointCap: number
): StatusSection[][] {
  const columnCount = Math.max(1, breakpointCap);
  const columns = Array.from({ length: columnCount }, () => ({
    sections: [] as StatusSection[],
    itemCount: 0
  }));
  const featureSection = sections.find((section) => section.group === STATUS_ENTRY_GROUP.EFFECTS);
  const allocatableSections = sections
    .map((section, originalIndex) => ({ section, originalIndex }))
    .filter(({ section }) => section.group !== STATUS_ENTRY_GROUP.EFFECTS)
    .sort((left, right) => {
      const entryCountDelta = right.section.entries.length - left.section.entries.length;

      return entryCountDelta !== 0 ? entryCountDelta : left.originalIndex - right.originalIndex;
    });

  if (featureSection) {
    columns[0].sections.push(featureSection);
    columns[0].itemCount += featureSection.entries.length;
  }

  for (const { section } of allocatableSections) {
    let targetColumnIndex = 0;

    columns.forEach((column, columnIndex) => {
      const targetColumn = columns[targetColumnIndex];

      if (column.itemCount < targetColumn.itemCount) {
        targetColumnIndex = columnIndex;
      }
    });

    columns[targetColumnIndex].sections.push(section);
    columns[targetColumnIndex].itemCount += section.entries.length;
  }

  return columns.map((column) => column.sections);
}

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
  const sectionLayouts = [
    {
      key: "xl",
      className: styles.layoutXl,
      columns: splitStatusSectionsIntoColumns(sections, 5)
    },
    {
      key: "lg",
      className: styles.layoutLg,
      columns: splitStatusSectionsIntoColumns(sections, 5)
    },
    {
      key: "md",
      className: styles.layoutMd,
      columns: splitStatusSectionsIntoColumns(sections, 4)
    },
    {
      key: "sm",
      className: styles.layoutSm,
      columns: splitStatusSectionsIntoColumns(sections, 3)
    },
    {
      key: "xs",
      className: styles.layoutXs,
      columns: splitStatusSectionsIntoColumns(sections, 2)
    }
  ];

  function renderSection(section: StatusSection) {
    return (
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
            const hasDescriptionAdditions = hasStatusEntryDescriptionAdditions(entry);

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
                    <span className={styles.buttonTitle}>
                      {entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
                      entry.value === EFFECT_NAME.CONCENTRATION ? (
                        <span className={styles.buttonTitleText}>
                          <ConcentrationLabel iconSize={14} />
                        </span>
                      ) : (
                        <span className={styles.buttonTitleText}>{getStatusEntryTitle(entry)}</span>
                      )}
                      {hasDescriptionAdditions ? (
                        <span
                          className={styles.modifiedIcon}
                          title="Additional trait rules"
                          aria-label="Additional trait rules"
                        >
                          <ChevronsUp size={14} aria-hidden="true" />
                        </span>
                      ) : null}
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
    );
  }

  return (
    <div className={styles.sectionStack}>
      {sectionLayouts.map((layout) => (
        <div
          key={layout.key}
          className={clsx(styles.layout, layout.className)}
          style={{ "--status-rendered-column-count": layout.columns.length } as StatusLayoutStyle}
        >
          {layout.columns.map((column, columnIndex) => (
            <div key={`${layout.key}-${columnIndex}`} className={styles.column}>
              {column.map(renderSection)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default TraitsConditionsSections;
