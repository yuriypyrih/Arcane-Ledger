import { useMemo, useState } from "react";
import type { DivinityEntry, FEATS, SpellEntry } from "../../../../codex/entries";
import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import { getFeatDefinition } from "../../../../pages/CharactersPage/feats";
import DescriptionContent from "../../../DescriptionContent/DescriptionContent";
import CodexDivinityDrawer from "../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../../../CodexPage/CodexSpellDrawer/CodexSpellDrawer";
import { FeatureTrackingBadgeButton } from "../../../FeatureDisclosure";
import KeywordReferenceDrawer from "../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer,
  overlayClassNames
} from "../../../Overlay";
import {
  resolveKeywordReference,
  type ResolvedKeywordReference
} from "../../../../utils/codex/renderCodexRichText";
import styles from "./ClassFeaturesAndFeats.module.css";

type EldritchInvocationReferenceDrawerProps = {
  option: WarlockEldritchInvocationOption;
  onClose: () => void;
  backdropClassName?: string;
};

function EldritchInvocationReferenceDrawer({
  option,
  onClose,
  backdropClassName
}: EldritchInvocationReferenceDrawerProps) {
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const [selectedFeat, setSelectedFeat] = useState<FEATS | null>(null);
  const selectedFeatDefinition = useMemo(
    () => (selectedFeat ? getFeatDefinition(selectedFeat) : null),
    [selectedFeat]
  );
  const linkedReferenceBackdropClassName = styles.linkedReferenceDrawerBackdrop;

  function openTrackingKeyword() {
    const resolvedKeyword = resolveKeywordReference(option.invocation.trackingState);

    if (resolvedKeyword) {
      setSelectedKeyword(resolvedKeyword);
    }
  }

  return (
    <>
      <SheetDrawer
        titleId="eldritch-invocation-reference-drawer-title"
        onClose={onClose}
        onEscape={() => {
          if (selectedKeyword) {
            setSelectedKeyword(null);
            return;
          }

          if (selectedDivinityReference) {
            setSelectedDivinityReference(null);
            return;
          }

          if (selectedSpellReference) {
            setSelectedSpellReference(null);
            return;
          }

          if (selectedFeat) {
            setSelectedFeat(null);
            return;
          }

          onClose();
        }}
        backdropClassName={backdropClassName}
      >
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayBadge>Eldritch Invocation</OverlayBadge>
            <OverlayTitleRow>
              <OverlayTitle id="eldritch-invocation-reference-drawer-title">
                {option.invocation.name}
              </OverlayTitle>
            </OverlayTitleRow>
          </OverlayHeaderContent>
          <div className={styles.invocationDrawerHeaderActions}>
            <FeatureTrackingBadgeButton
              trackingState={option.invocation.trackingState}
              onClick={openTrackingKeyword}
            />
            <OverlayCloseButton label="Close eldritch invocation" onClick={onClose} />
          </div>
        </OverlayHeader>

        <OverlayBody className={styles.keywordDrawerBody}>
          <DescriptionContent
            description={option.invocation.description}
            className={overlayClassNames.descriptionList}
            entryClassName={overlayClassNames.descriptionLine}
            strongClassName={overlayClassNames.descriptionStrong}
            linkClassName={styles.inlineLinkButton}
            onOpenKeyword={setSelectedKeyword}
            onOpenSpell={setSelectedSpellReference}
            onOpenDivinity={setSelectedDivinityReference}
            onOpenFeat={setSelectedFeat}
          />
        </OverlayBody>
      </SheetDrawer>

      {selectedSpellReference ? (
        <CodexSpellDrawer
          spell={selectedSpellReference}
          backdropClassName={linkedReferenceBackdropClassName}
          onClose={() => setSelectedSpellReference(null)}
        />
      ) : null}
      {selectedDivinityReference ? (
        <CodexDivinityDrawer
          divinity={selectedDivinityReference}
          backdropClassName={linkedReferenceBackdropClassName}
          onClose={() => setSelectedDivinityReference(null)}
        />
      ) : null}
      {selectedKeyword ? (
        <KeywordReferenceDrawer
          title={selectedKeyword.title}
          entries={[
            {
              title: selectedKeyword.title,
              description: selectedKeyword.description
            }
          ]}
          badgeLabel="Keyword"
          backdropClassName={linkedReferenceBackdropClassName}
          onClose={() => setSelectedKeyword(null)}
        />
      ) : null}
      {selectedFeatDefinition ? (
        <KeywordReferenceDrawer
          title={selectedFeatDefinition.label}
          badgeLabel="Feat"
          entries={[
            {
              title: selectedFeatDefinition.label,
              description: selectedFeatDefinition.description
            }
          ]}
          backdropClassName={linkedReferenceBackdropClassName}
          onClose={() => setSelectedFeat(null)}
        />
      ) : null}
    </>
  );
}

export default EldritchInvocationReferenceDrawer;
