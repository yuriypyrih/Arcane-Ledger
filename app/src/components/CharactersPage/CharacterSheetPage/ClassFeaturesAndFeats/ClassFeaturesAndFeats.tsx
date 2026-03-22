import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import {
  CLASS_FEATURE,
  ENTRY_CATEGORIES,
  FeatureMap,
  KeywordTooltip,
  getFeatureTrackingState,
  hardcodedCodexEntries,
  type ClassEntry,
  type FeatureMapEntry,
  type KeywordTooltipEntry
} from "../../../../codex/entries";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { Character } from "../../../../types";
import { formatCodexLabel } from "../../../../utils/codex";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import InlineToggleButton from "../InlineToggleButton";
import styles from "./ClassFeaturesAndFeats.module.css";

type ClassFeaturesAndFeatsProps = {
  className?: string;
};

type FeatureRow = {
  key: string;
  level: number;
  feature: CLASS_FEATURE;
  details: FeatureMapEntry;
};

type SelectedKeyword = {
  key: string;
  tooltip: KeywordTooltipEntry;
};

const classEntriesByName = new Map<string, ClassEntry>(
  hardcodedCodexEntries
    .filter((entry): entry is ClassEntry => entry.category === ENTRY_CATEGORIES.CLASSES)
    .map((entry) => [entry.name, entry])
);

const inlineMarkupPattern = /<strong>(.*?)<\/strong>|<link:([^>]+)>(.*?)<\/link>/g;

function renderDescriptionLine(
  line: string,
  onOpenKeyword: (keywordKey: string) => void
): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of line.matchAll(inlineMarkupPattern)) {
    const index = match.index ?? 0;

    if (index > cursor) {
      nodes.push(line.slice(cursor, index));
    }

    if (match[1]) {
      nodes.push(<strong key={`${match[1]}-${index}`}>{match[1]}</strong>);
    }

    if (match[2]) {
      const keywordKey = match[2];
      const label = match[3] ?? keywordKey;

      nodes.push(
        KeywordTooltip[keywordKey] ? (
          <button
            key={`${keywordKey}-${index}`}
            type="button"
            className={styles.keywordButton}
            onClick={() => onOpenKeyword(keywordKey)}
          >
            {label}
          </button>
        ) : (
          label
        )
      );
    }

    cursor = index + match[0].length;
  }

  if (cursor < line.length) {
    nodes.push(line.slice(cursor));
  }

  return nodes.length > 0 ? nodes : line;
}

function ClassFeaturesAndFeats({ className }: ClassFeaturesAndFeatsProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFutureFeaturesVisible, setIsFutureFeaturesVisible] = useState(false);
  const [expandedFeatureKeys, setExpandedFeatureKeys] = useState<string[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<SelectedKeyword | null>(null);

  useBodyScrollLock(Boolean(selectedKeyword));

  useEffect(() => {
    if (!selectedKeyword) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedKeyword(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedKeyword]);

  const classEntry = classEntriesByName.get(character.className) ?? null;
  const allFeatures = useMemo<FeatureRow[]>(() => {
    if (!classEntry) {
      return [];
    }

    return classEntry.features.flatMap((featureRow) =>
      featureRow.classFeatures.map((feature, index) => ({
        key: `${featureRow.level}-${feature}-${index}`,
        level: featureRow.level,
        feature,
        details: featureRow.featureOverrides?.[feature] ?? FeatureMap[feature]
      }))
    );
  }, [classEntry]);

  const unlockedFeatures = useMemo(
    () => allFeatures.filter((featureRow) => featureRow.level <= character.level),
    [allFeatures, character.level]
  );
  const futureFeatures = useMemo(
    () => allFeatures.filter((featureRow) => featureRow.level > character.level),
    [allFeatures, character.level]
  );

  useEffect(() => {
    const validFeatureKeys = new Set(allFeatures.map((featureRow) => featureRow.key));

    setExpandedFeatureKeys((current) =>
      current.filter((featureKey) => validFeatureKeys.has(featureKey))
    );
  }, [allFeatures]);

  useEffect(() => {
    if (isExpanded) {
      return;
    }

    setExpandedFeatureKeys([]);
    setIsFutureFeaturesVisible(false);
  }, [isExpanded]);

  function openKeyword(keywordKey: string) {
    const tooltip = KeywordTooltip[keywordKey];

    if (!tooltip) {
      return;
    }

    setSelectedKeyword({
      key: keywordKey,
      tooltip
    });
  }

  function toggleFeature(featureKey: string) {
    setExpandedFeatureKeys((current) =>
      current.includes(featureKey)
        ? current.filter((currentKey) => currentKey !== featureKey)
        : [...current, featureKey]
    );
  }

  function toggleSection() {
    setIsExpanded((current) => !current);
  }

  function renderFeatureList(features: FeatureRow[]) {
    return (
      <ul className={styles.featureList}>
        {features.map((featureRow) => {
          const featureDetails = featureRow.details;
          const trackingKeywordKey = getFeatureTrackingState(featureDetails);
          const trackingLabel =
            trackingKeywordKey === "tracked"
              ? "Tracked"
              : trackingKeywordKey === "semi-tracked"
                ? "Semi Tracked"
                : "Not Tracked";
          const isFeatureExpanded = expandedFeatureKeys.includes(featureRow.key);
          const featurePanelId = `class-feature-panel-${featureRow.key}`;

          return (
            <li key={featureRow.key} className={styles.featureItem}>
              <div className={styles.featureHeadingRow}>
                <button
                  type="button"
                  className={styles.featureToggleButton}
                  onClick={() => toggleFeature(featureRow.key)}
                  aria-expanded={isFeatureExpanded}
                  aria-controls={featurePanelId}
                >
                  <span className={styles.featureHeading}>
                    {`Level ${featureRow.level}: ${formatCodexLabel(featureRow.feature)}`}
                  </span>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={clsx(
                      styles.featureToggleIcon,
                      !isFeatureExpanded && styles.featureToggleIconCollapsed
                    )}
                  />
                </button>
                <button
                  type="button"
                  className={styles.featureTrackingButton}
                  onClick={() => openKeyword(trackingKeywordKey)}
                >
                  {trackingLabel}
                </button>
              </div>

              {isFeatureExpanded ? (
                featureDetails.description.length > 0 ? (
                  <div id={featurePanelId} className={styles.descriptionList}>
                    {featureDetails.description.map((line, index) => (
                      <p key={`${featureRow.key}-line-${index}`} className={styles.descriptionLine}>
                        {renderDescriptionLine(line, openKeyword)}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p id={featurePanelId} className={styles.emptyFeatureText}>
                    Details coming soon.
                  </p>
                )
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <button
        type="button"
        className={styles.sectionToggle}
        onClick={toggleSection}
        aria-expanded={isExpanded}
        aria-controls="class-features-and-feats-content"
      >
        <div>
          <p className={shared.eyebrow}>Build</p>
          <h2 className={shared.title}>Class Features &amp; Feats</h2>
          <p className={shared.helperText}>
            Review unlocked class features and keep feats in one place as we flesh them out.
          </p>
        </div>
        <span className={styles.sectionToggleMeta}>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={clsx(
              styles.sectionToggleIcon,
              !isExpanded && styles.sectionToggleIconCollapsed
            )}
          />
        </span>
      </button>

      {isExpanded ? (
        <div id="class-features-and-feats-content" className={styles.sectionStack}>
          <section className={styles.subsection} aria-labelledby="character-feats-title">
            <h3 id="character-feats-title" className={styles.subsectionTitle}>
              Feats
            </h3>
            <p className={shared.emptyText}>No feats added yet.</p>
          </section>

          <section className={styles.subsection} aria-labelledby="character-class-features-title">
            <h3 id="character-class-features-title" className={styles.subsectionTitle}>
              Class Features
            </h3>

            {unlockedFeatures.length > 0 ? (
              <>
                {renderFeatureList(unlockedFeatures)}

                {futureFeatures.length > 0 ? (
                  <>
                    <InlineToggleButton
                      label={
                        isFutureFeaturesVisible
                          ? "Hide unlockable features"
                          : "Show unlockable features"
                      }
                      expanded={isFutureFeaturesVisible}
                      onClick={() => setIsFutureFeaturesVisible((current) => !current)}
                    />
                    {isFutureFeaturesVisible ? renderFeatureList(futureFeatures) : null}
                  </>
                ) : null}
              </>
            ) : (
              <p className={shared.emptyText}>
                {classEntry
                  ? "No class features are available for this level yet."
                  : "No class feature progression is available for this class yet."}
              </p>
            )}
          </section>
        </div>
      ) : null}

      {selectedKeyword ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedKeyword(null)}
        >
          <aside
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="class-feature-keyword-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Keyword</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="class-feature-keyword-drawer-title">{selectedKeyword.tooltip.title}</h3>
                </div>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedKeyword(null)}
                aria-label={`Close ${selectedKeyword.tooltip.title} reference`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.keywordDrawerBody}>
              {selectedKeyword.tooltip.description.map((line, index) => (
                <p key={`${selectedKeyword.key}-line-${index}`} className={styles.descriptionLine}>
                  {renderDescriptionLine(line, openKeyword)}
                </p>
              ))}
            </div>
          </aside>
        </div>
      ) : null}
    </article>
  );
}

export default ClassFeaturesAndFeats;
