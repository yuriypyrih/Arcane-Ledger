import { useMemo, useState } from "react";
import CodexDivinityDrawer from "../CodexDivinityDrawer/CodexDivinityDrawer";
import CodexFeatDrawer from "../CodexFeatDrawer/CodexFeatDrawer";
import CodexSpellDrawer from "../CodexSpellDrawer";
import DescriptionContent from "../../DescriptionContent/DescriptionContent";
import {
  FeatureDisclosureRow,
  FeatureTrackingBadgeButton,
  featureDisclosureStyles
} from "../../FeatureDisclosure";
import KeywordReferenceDrawer from "../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import {
  FEATS,
  FEAT_CATEGORY,
  TRACKER,
  type DivinityEntry,
  type SpellEntry
} from "../../../codex/entries";
import { featDefinitions, getFeatCategoryLabel } from "../../../pages/CharactersPage/feats";
import type { ResolvedKeywordReference } from "../../../utils/codex/renderCodexRichText";
import styles from "./FeatCodexList.module.css";
import resultStyles from "../CodexResults/CodexResults.module.css";

type SelectedFeatReference = {
  feat: FEATS;
  label: string;
};

type FeatCodexListProps = {
  query: string;
  featCategoryFilter: FEAT_CATEGORY | null;
};

function FeatCodexList({ query, featCategoryFilter }: FeatCodexListProps) {
  const [expandedFeatKeys, setExpandedFeatKeys] = useState<string[]>([]);
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeywordReference, setSelectedKeywordReference] =
    useState<ResolvedKeywordReference | null>(null);
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );
  const normalizedQuery = query.trim().toLowerCase();
  const visibleFeatDefinitions = useMemo(() => {
    const filteredFeatDefinitions =
      normalizedQuery.length === 0
        ? featDefinitions.filter(
            (definition) => featCategoryFilter === null || definition.category === featCategoryFilter
          )
        : featDefinitions.filter(
            (definition) =>
              (featCategoryFilter === null || definition.category === featCategoryFilter) &&
              definition.label.toLowerCase().includes(normalizedQuery)
          );

    return [...filteredFeatDefinitions].sort((left, right) =>
      left.label.localeCompare(right.label)
    );
  }, [featCategoryFilter, normalizedQuery]);

  function toggleFeatKey(featKey: string) {
    setExpandedFeatKeys((currentKeys) =>
      currentKeys.includes(featKey)
        ? currentKeys.filter((currentKey) => currentKey !== featKey)
        : [...currentKeys, featKey]
    );
  }

  return (
    <>
      <div className={resultStyles.resultsHeader}>
        <h3>Feat Entries</h3>
        <span>
          {visibleFeatDefinitions.length} total{" "}
          {visibleFeatDefinitions.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {visibleFeatDefinitions.length === 0 ? (
        <div className={resultStyles.grid}>
          <article className={resultStyles.card}>
            <h4>No matches</h4>
            <p>Try a different search or switch the category filter.</p>
          </article>
        </div>
      ) : (
        <div className={styles.featList}>
          {visibleFeatDefinitions.map((definition, index) => {
            const featKey = `feat-${definition.feat}`;
            const isExpanded = expandedFeatKeys.includes(featKey);
            const description = definition.description ?? [];
            const trackingState = definition.trackingState ?? TRACKER.NOT_TRACKED;

            return (
              <FeatureDisclosureRow
                key={definition.feat}
                as="article"
                className={styles.featRow}
                title={definition.label}
                isExpanded={isExpanded}
                onToggle={() => toggleFeatKey(featKey)}
                bodyId={`${featKey}-content`}
                bodyClassName={`${featureDisclosureStyles.descriptionList} ${styles.featBody}`}
                trackingButton={
                  <FeatureTrackingBadgeButton
                    trackingState={trackingState}
                    onClick={() => toggleFeatKey(featKey)}
                  />
                }
                showDivider={index > 0}
              >
                <p className={styles.featMeta}>
                  {getFeatCategoryLabel(definition.category)} Feat
                  {definition.prerequisite ? ` | Prerequisite: ${definition.prerequisite}` : ""}
                </p>
                {description.length > 0 ? (
                  <DescriptionContent
                    description={description}
                    className={featureDisclosureStyles.descriptionList}
                    entryClassName={featureDisclosureStyles.descriptionLine}
                    linkClassName={featureDisclosureStyles.inlineLinkButton}
                    onOpenKeyword={setSelectedKeywordReference}
                    onOpenSpell={setSelectedSpellReference}
                    onOpenDivinity={setSelectedDivinityReference}
                    onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                  />
                ) : (
                  <p className={styles.emptyDescription}>No description mounted.</p>
                )}
              </FeatureDisclosureRow>
            );
          })}
        </div>
      )}

      {selectedKeywordReference ? (
        <KeywordReferenceDrawer
          title={selectedKeywordReference.title}
          entries={[
            {
              title: selectedKeywordReference.title,
              description: selectedKeywordReference.description
            }
          ]}
          badgeLabel="Keyword"
          onClose={() => setSelectedKeywordReference(null)}
        />
      ) : null}
      {selectedSpellReference ? (
        <CodexSpellDrawer
          spell={selectedSpellReference}
          onClose={() => setSelectedSpellReference(null)}
        />
      ) : null}
      {selectedDivinityReference ? (
        <CodexDivinityDrawer
          divinity={selectedDivinityReference}
          onClose={() => setSelectedDivinityReference(null)}
        />
      ) : null}
      {selectedFeatReference ? (
        <CodexFeatDrawer
          feat={selectedFeatReference.feat}
          label={selectedFeatReference.label}
          onClose={() => setSelectedFeatReference(null)}
        />
      ) : null}
    </>
  );
}

export default FeatCodexList;
