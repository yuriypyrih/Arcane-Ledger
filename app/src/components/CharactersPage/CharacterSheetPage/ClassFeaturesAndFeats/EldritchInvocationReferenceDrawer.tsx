import { useMemo, useState } from "react";
import type { DivinityEntry, FEATS, SpellEntry } from "../../../../codex/entries";
import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import { getFeatDefinition } from "../../../../pages/CharactersPage/feats";
import type { ResolvedKeywordReference } from "../../../../utils/codex/renderCodexRichText";
import DescriptionContent from "../../../DescriptionContent/DescriptionContent";
import CodexDivinityDrawer from "../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../../../CodexPage/CodexSpellDrawer/CodexSpellDrawer";
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
          <OverlayCloseButton label="Close eldritch invocation" onClick={onClose} />
        </OverlayHeader>

        <OverlayBody className={styles.keywordDrawerBody}>
          {option.displaySubtitle && !option.isPlaceholder ? (
            <p className={styles.featReferenceSummary}>{`Choice: ${option.displaySubtitle}`}</p>
          ) : null}
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
          onClose={() => setSelectedSpellReference(null)}
        />
      ) : null}
      {selectedDivinityReference ? (
        <CodexDivinityDrawer
          divinity={selectedDivinityReference}
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
          onClose={() => setSelectedFeat(null)}
        />
      ) : null}
    </>
  );
}

export default EldritchInvocationReferenceDrawer;
