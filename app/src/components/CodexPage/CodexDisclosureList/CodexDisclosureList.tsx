import { useState, type ReactNode } from "react";
import CodexDivinityDrawer from "../CodexDivinityDrawer/CodexDivinityDrawer";
import CodexFeatDrawer from "../CodexFeatDrawer/CodexFeatDrawer";
import CodexSpellDrawer from "../CodexSpellDrawer";
import DescriptionContent from "../../DescriptionContent/DescriptionContent";
import {
  FeatureDisclosureContentStack,
  FeatureDisclosureRow,
  FeatureTrackingBadgeButton,
  featureDisclosureStyles
} from "../../FeatureDisclosure";
import KeywordReferenceDrawer from "../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import {
  ENTRY_CATEGORIES,
  FEATS,
  TRACKER,
  type BackgroundEntry,
  type CodexEntry,
  type CodexStatus,
  type DivinityEntry,
  type SpeciesEntry,
  type SpellEntry
} from "../../../codex/entries";
import {
  resolveKeywordReference,
  type ResolvedKeywordReference
} from "../../../utils/codex/renderCodexRichText";
import {
  formatBackgroundAbilityScoreOptions,
  formatBackgroundEquipmentOptions,
  formatBackgroundOriginFeat,
  formatBackgroundProficiencies
} from "../backgroundPresentation";
import styles from "../FeatCodexList/FeatCodexList.module.css";
import resultStyles from "../CodexResults/CodexResults.module.css";

type SelectedFeatReference = {
  feat: FEATS;
  label: string;
};

type CodexDisclosureCategory = ENTRY_CATEGORIES.BACKGROUNDS | ENTRY_CATEGORIES.SPECIES;

type CodexDisclosureListProps = {
  entries: CodexEntry[];
  status: CodexStatus;
  category: CodexDisclosureCategory;
};

function isBackgroundEntry(entry: CodexEntry): entry is BackgroundEntry {
  return entry.category === ENTRY_CATEGORIES.BACKGROUNDS;
}

function isSpeciesEntry(entry: CodexEntry): entry is SpeciesEntry {
  return entry.category === ENTRY_CATEGORIES.SPECIES;
}

function DetailLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className={featureDisclosureStyles.descriptionLine}>
      <strong>{label}.</strong> {children}
    </p>
  );
}

function getListTitle(category: CodexDisclosureCategory): string {
  return category === ENTRY_CATEGORIES.BACKGROUNDS ? "Background Entries" : "Species Entries";
}

function getEntryTrackingState(entry: BackgroundEntry | SpeciesEntry): TRACKER {
  return entry.category === ENTRY_CATEGORIES.BACKGROUNDS
    ? TRACKER.TRACKED
    : (entry.trackingState ?? TRACKER.NOT_TRACKED);
}

function getEntryTrackingMessage(entry: BackgroundEntry | SpeciesEntry): string | undefined {
  return entry.category === ENTRY_CATEGORIES.SPECIES ? entry.trackingMessage : undefined;
}

function getStatusLabel(category: CodexDisclosureCategory): string {
  return category === ENTRY_CATEGORIES.BACKGROUNDS ? "backgrounds" : "species";
}

function renderEntryTitle(entry: BackgroundEntry | SpeciesEntry): ReactNode {
  return entry.name;
}

function renderBackgroundSource(entry: BackgroundEntry | SpeciesEntry): ReactNode {
  if (entry.category !== ENTRY_CATEGORIES.BACKGROUNDS) {
    return null;
  }

  return (
    <span className={styles.entrySource} aria-label={`Source: ${entry.source}`}>
      {entry.source}
    </span>
  );
}

function CodexDisclosureList({ entries, status, category }: CodexDisclosureListProps) {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeywordReference, setSelectedKeywordReference] =
    useState<ResolvedKeywordReference | null>(null);
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );
  const categoryEntries = entries.filter((entry): entry is BackgroundEntry | SpeciesEntry =>
    category === ENTRY_CATEGORIES.BACKGROUNDS ? isBackgroundEntry(entry) : isSpeciesEntry(entry)
  );
  const listTitle = getListTitle(category);
  const statusLabel = getStatusLabel(category);

  function toggleEntryKey(entryKey: string) {
    setExpandedKeys((currentKeys) =>
      currentKeys.includes(entryKey)
        ? currentKeys.filter((currentKey) => currentKey !== entryKey)
        : [...currentKeys, entryKey]
    );
  }

  function openTrackingReference(trackingState: TRACKER, trackingMessage?: string) {
    const reference = resolveKeywordReference(trackingState, undefined, trackingMessage);

    if (!reference) {
      return;
    }

    setSelectedKeywordReference(reference);
  }

  function renderEntryBody(entry: BackgroundEntry | SpeciesEntry) {
    if (entry.category === ENTRY_CATEGORIES.BACKGROUNDS) {
      const originFeatLabel = formatBackgroundOriginFeat(entry);

      return (
        <>
          <DetailLine label="Ability Scores">
            {formatBackgroundAbilityScoreOptions(entry)}
          </DetailLine>
          <DetailLine label="Feat">
            <button
              type="button"
              className={featureDisclosureStyles.inlineLinkButton}
              onClick={() =>
                setSelectedFeatReference({ feat: entry.originFeat, label: originFeatLabel })
              }
            >
              {originFeatLabel}
            </button>
          </DetailLine>
          <DetailLine label="Skill + Tool Proficiencies">
            {formatBackgroundProficiencies(entry)}
          </DetailLine>
          <DetailLine label="Equipment">{formatBackgroundEquipmentOptions(entry)}</DetailLine>
        </>
      );
    }

    return (
      <>
        <DescriptionContent
          description={entry.description}
          className={featureDisclosureStyles.descriptionList}
          entryClassName={featureDisclosureStyles.descriptionLine}
          linkClassName={featureDisclosureStyles.inlineLinkButton}
          onOpenKeyword={setSelectedKeywordReference}
          onOpenSpell={setSelectedSpellReference}
          onOpenDivinity={setSelectedDivinityReference}
          onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
        />
      </>
    );
  }

  return (
    <>
      <div className={resultStyles.resultsHeader}>
        <h3>{listTitle}</h3>
        <span>
          {categoryEntries.length} total {categoryEntries.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {status === "loading" ? (
        <div className={resultStyles.grid}>
          <article className={resultStyles.card}>
            <h4>Loading compendium...</h4>
            <p>Loading {statusLabel}.</p>
          </article>
        </div>
      ) : null}

      {status === "error" ? (
        <div className={resultStyles.grid}>
          <article className={resultStyles.card}>
            <h4>Compendium unavailable</h4>
            <p>Compendium entries could not be loaded.</p>
          </article>
        </div>
      ) : null}

      {status === "ready" && categoryEntries.length === 0 ? (
        <div className={resultStyles.grid}>
          <article className={resultStyles.card}>
            <h4>No matches</h4>
            <p>Try a different search or switch the category filter.</p>
          </article>
        </div>
      ) : null}

      {status === "ready" && categoryEntries.length > 0 ? (
        <div className={styles.featList}>
          {categoryEntries.map((entry, index) => {
            const entryKey = `${entry.category.toLowerCase()}-${entry.id}`;
            const isExpanded = expandedKeys.includes(entryKey);

            return (
              <FeatureDisclosureRow
                key={entry.id}
                as="article"
                className={styles.featRow}
                title={renderEntryTitle(entry)}
                isExpanded={isExpanded}
                onToggle={() => toggleEntryKey(entryKey)}
                bodyId={`${entryKey}-content`}
                trackingButton={
                  <FeatureTrackingBadgeButton
                    trackingState={getEntryTrackingState(entry)}
                    trackingMessage={getEntryTrackingMessage(entry)}
                    onClick={openTrackingReference}
                  />
                }
                endMeta={renderBackgroundSource(entry)}
                toggleIconPlacement={
                  entry.category === ENTRY_CATEGORIES.BACKGROUNDS ? "end" : "inline"
                }
                showDivider={index > 0}
              >
                <FeatureDisclosureContentStack>
                  {renderEntryBody(entry)}
                </FeatureDisclosureContentStack>
              </FeatureDisclosureRow>
            );
          })}
        </div>
      ) : null}

      {selectedKeywordReference ? (
        <KeywordReferenceDrawer
          title={selectedKeywordReference.title}
          entries={[
            {
              title: selectedKeywordReference.title,
              description: selectedKeywordReference.description,
              trackingMessage: selectedKeywordReference.trackingMessage
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

export default CodexDisclosureList;
