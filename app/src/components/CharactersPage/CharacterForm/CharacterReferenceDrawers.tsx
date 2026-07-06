import { useEffect, useMemo, useState } from "react";
import {
  FEATS,
  TRACKER,
  type BackgroundEntry,
  type ClassEntry,
  type DivinityEntry,
  type SpeciesEntry,
  type SpellEntry,
  type SubclassEntry
} from "../../../codex/entries";
import { formatCodexLabel } from "../../../utils/codex";
import {
  renderCodexRichText,
  resolveKeywordReference,
  type RenderCodexRichTextOptions,
  type ResolvedKeywordReference
} from "../../../utils/codex/renderCodexRichText";
import DescriptionContent from "../../DescriptionContent/DescriptionContent";
import {
  LazyCodexDivinityDrawer as CodexDivinityDrawer,
  LazyCodexFeatDrawer as CodexFeatDrawer,
  LazyCodexSpellDrawer as CodexSpellDrawer
} from "../../CodexPage/LazyCodexReferenceDrawers";
import {
  BackgroundEntryOverview,
  ClassEntryOverview
} from "../../CodexPage/EntryOverviewContent/EntryOverviewContent";
import { FeatureTrackingBadgeButton, featureDisclosureStyles } from "../../FeatureDisclosure";
import KeywordReferenceDrawer from "../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer,
  overlayClassNames
} from "../../Overlay";
import SpeciesReferenceDrawer from "../CharacterSheetPage/ClassFeaturesAndFeats/SpeciesReferenceDrawer";
import styles from "./CharacterReferenceDrawers.module.css";

export type CharacterReferenceDrawerKind = "class" | "subclass" | "species" | "background";

type CharacterReferenceDrawersProps = {
  activeReference: CharacterReferenceDrawerKind | null;
  backgroundEntry: BackgroundEntry | null;
  classEntry: ClassEntry | null;
  onClose: () => void;
  speciesEntry: SpeciesEntry | null;
  subclassEntry: SubclassEntry | null;
};

type ClassReferenceDrawerProps = {
  entry: ClassEntry;
  onClose: () => void;
  richTextOptions: RenderCodexRichTextOptions;
};

type BackgroundReferenceDrawerProps = {
  entry: BackgroundEntry;
  onClose: () => void;
  richTextOptions: RenderCodexRichTextOptions;
};

type SubclassReferenceDrawerProps = {
  entry: SubclassEntry;
  onClose: () => void;
  richTextOptions: RenderCodexRichTextOptions;
};

type SelectedFeatReference = {
  feat: FEATS;
  label?: string;
};

function ClassReferenceDrawer({ entry, onClose, richTextOptions }: ClassReferenceDrawerProps) {
  return (
    <SheetDrawer titleId="character-class-reference-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayBadge>Class</OverlayBadge>
          <OverlayTitleRow>
            <OverlayTitle id="character-class-reference-title">{entry.name}</OverlayTitle>
          </OverlayTitleRow>
          {entry.summary.trim().length > 0 ? (
            <OverlaySummary>{renderCodexRichText(entry.summary, richTextOptions)}</OverlaySummary>
          ) : null}
        </OverlayHeaderContent>
        <OverlayCloseButton label={`Close ${entry.name} reference`} onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.drawerBody}>
        <ClassEntryOverview entry={entry} {...richTextOptions} />
      </OverlayBody>
    </SheetDrawer>
  );
}

function BackgroundReferenceDrawer({
  entry,
  onClose,
  richTextOptions
}: BackgroundReferenceDrawerProps) {
  return (
    <SheetDrawer titleId="character-background-reference-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayBadge>Background</OverlayBadge>
          <OverlayTitleRow>
            <OverlayTitle id="character-background-reference-title">{entry.name}</OverlayTitle>
          </OverlayTitleRow>
          {entry.summary.trim().length > 0 ? (
            <OverlaySummary>{renderCodexRichText(entry.summary, richTextOptions)}</OverlaySummary>
          ) : null}
        </OverlayHeaderContent>
        <OverlayCloseButton label={`Close ${entry.name} reference`} onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.drawerBody}>
        {entry.description.trim().length > 0 ? (
          <DescriptionContent
            description={[entry.description]}
            className={overlayClassNames.descriptionList}
            entryClassName={overlayClassNames.descriptionLine}
            {...richTextOptions}
          />
        ) : null}
        <BackgroundEntryOverview entry={entry} {...richTextOptions} />
      </OverlayBody>
    </SheetDrawer>
  );
}

function SubclassReferenceDrawer({ entry, onClose, richTextOptions }: SubclassReferenceDrawerProps) {
  const featureRows = useMemo(
    () => [...entry.features].filter((row) => row.classFeatures.length > 0),
    [entry.features]
  );

  return (
    <SheetDrawer titleId="character-subclass-reference-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayBadge>Subclass</OverlayBadge>
          <OverlayTitleRow>
            <OverlayTitle id="character-subclass-reference-title">{entry.name}</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary>{entry.className} subclass</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label={`Close ${entry.name} reference`} onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.drawerBody}>
        <div className={styles.subclassIntro}>
          {entry.tagline ? (
            <p className={styles.subclassTagline}>
              {renderCodexRichText(entry.tagline, richTextOptions)}
            </p>
          ) : null}
          {entry.summary ? (
            <p className={styles.description}>
              {renderCodexRichText(entry.summary, richTextOptions)}
            </p>
          ) : null}
        </div>

        {featureRows.length > 0 ? (
          <div className={styles.progressionScroll}>
            <table className={styles.progressionTable}>
              <thead>
                <tr>
                  <th scope="col">Level</th>
                  <th scope="col">New Features</th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map((row) => (
                  <tr key={row.level}>
                    <th className={styles.levelCell} scope="row">
                      {row.level}
                    </th>
                    <td className={styles.featureCell}>
                      {row.classFeatures.map((feature) => formatCodexLabel(feature)).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.description}>No subclass feature progression is available.</p>
        )}
      </OverlayBody>
    </SheetDrawer>
  );
}

function CharacterReferenceDrawers({
  activeReference,
  backgroundEntry,
  classEntry,
  onClose,
  speciesEntry,
  subclassEntry
}: CharacterReferenceDrawersProps) {
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const [selectedFeatReference, setSelectedFeatReference] =
    useState<SelectedFeatReference | null>(null);
  const linkedReferenceBackdropClassName = styles.linkedReferenceBackdrop;
  const richTextOptions: RenderCodexRichTextOptions = {
    linkClassName: featureDisclosureStyles.inlineLinkButton,
    strongClassName: overlayClassNames.descriptionStrong,
    onOpenKeyword: setSelectedKeyword,
    onOpenSpell: setSelectedSpellReference,
    onOpenDivinity: setSelectedDivinityReference,
    onOpenFeat: (feat, label) => setSelectedFeatReference({ feat, label })
  };

  useEffect(() => {
    setSelectedSpellReference(null);
    setSelectedDivinityReference(null);
    setSelectedKeyword(null);
    setSelectedFeatReference(null);
  }, [activeReference]);

  function openKeyword(keywordKey: string, title?: string, trackingMessage?: string) {
    const resolvedKeyword = resolveKeywordReference(keywordKey, title, trackingMessage);

    if (!resolvedKeyword) {
      return;
    }

    setSelectedKeyword(resolvedKeyword);
  }

  function renderTrackingButton(trackingState: TRACKER, trackingMessage?: string) {
    return (
      <FeatureTrackingBadgeButton
        trackingState={trackingState}
        trackingMessage={trackingMessage}
        onClick={(nextTrackingState, nextTrackingMessage) =>
          openKeyword(nextTrackingState, undefined, nextTrackingMessage)
        }
      />
    );
  }

  return (
    <>
      {activeReference === "class" && classEntry ? (
        <ClassReferenceDrawer
          entry={classEntry}
          onClose={onClose}
          richTextOptions={richTextOptions}
        />
      ) : null}

      {activeReference === "background" && backgroundEntry ? (
        <BackgroundReferenceDrawer
          entry={backgroundEntry}
          onClose={onClose}
          richTextOptions={richTextOptions}
        />
      ) : null}

      {activeReference === "subclass" && subclassEntry ? (
        <SubclassReferenceDrawer
          entry={subclassEntry}
          onClose={onClose}
          richTextOptions={richTextOptions}
        />
      ) : null}

      {activeReference === "species" && speciesEntry ? (
        <SpeciesReferenceDrawer
          speciesEntry={speciesEntry}
          onClose={onClose}
          renderTrackingButton={renderTrackingButton}
          onOpenKeyword={openKeyword}
          onOpenFeatReference={(feat) => setSelectedFeatReference({ feat })}
          onOpenSpellReference={setSelectedSpellReference}
          onOpenDivinityReference={setSelectedDivinityReference}
        />
      ) : null}

      {selectedSpellReference ? (
        <CodexSpellDrawer
          spell={selectedSpellReference}
          backdropClassName={linkedReferenceBackdropClassName}
          stacked
          onClose={() => setSelectedSpellReference(null)}
        />
      ) : null}
      {selectedDivinityReference ? (
        <CodexDivinityDrawer
          divinity={selectedDivinityReference}
          backdropClassName={linkedReferenceBackdropClassName}
          stacked
          onClose={() => setSelectedDivinityReference(null)}
        />
      ) : null}
      {selectedFeatReference ? (
        <CodexFeatDrawer
          feat={selectedFeatReference.feat}
          label={selectedFeatReference.label}
          backdropClassName={linkedReferenceBackdropClassName}
          stacked
          onClose={() => setSelectedFeatReference(null)}
        />
      ) : null}
      {selectedKeyword ? (
        <KeywordReferenceDrawer
          title={selectedKeyword.title}
          entries={[
            {
              title: selectedKeyword.title,
              description: selectedKeyword.description,
              trackingMessage: selectedKeyword.trackingMessage
            }
          ]}
          badgeLabel="Keyword"
          backdropClassName={linkedReferenceBackdropClassName}
          stacked
          onClose={() => setSelectedKeyword(null)}
        />
      ) : null}
    </>
  );
}

export default CharacterReferenceDrawers;
