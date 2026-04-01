import { useState } from "react";
import { FEATS, type DivinityEntry, type SpellEntry } from "../../../codex/entries";
import { getFeatCategoryLabel, getFeatDefinition } from "../../../pages/CharactersPage/feats";
import type { ResolvedKeywordReference } from "../../../utils/codex/renderCodexRichText";
import DescriptionContent from "../../DescriptionContent/DescriptionContent";
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
import CodexDivinityDrawer from "../CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../CodexSpellDrawer/CodexSpellDrawer";
import styles from "./CodexFeatDrawer.module.css";

type SelectedFeatReference = {
  feat: FEATS;
  label: string;
};

type CodexFeatDrawerProps = {
  feat: FEATS;
  label?: string;
  onClose: () => void;
};

function CodexFeatDrawer({ feat, label, onClose }: CodexFeatDrawerProps) {
  const featDefinition = getFeatDefinition(feat);
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );

  if (!featDefinition) {
    return null;
  }

  return (
    <>
      <SheetDrawer
        titleId="codex-feat-drawer-title"
        onClose={onClose}
        onEscape={() => {
          if (selectedFeatReference) {
            setSelectedFeatReference(null);
            return;
          }

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

          onClose();
        }}
      >
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayBadge>Feat</OverlayBadge>
            <OverlayTitleRow>
              <OverlayTitle id="codex-feat-drawer-title">
                {label ?? featDefinition.label}
              </OverlayTitle>
            </OverlayTitleRow>
            <OverlaySummary>
              {getFeatCategoryLabel(featDefinition.category)} Feat
              {featDefinition.prerequisite ? ` • Prerequisite: ${featDefinition.prerequisite}` : ""}
            </OverlaySummary>
          </OverlayHeaderContent>
          <OverlayCloseButton label={`Close ${featDefinition.label} details`} onClick={onClose} />
        </OverlayHeader>

        <OverlayBody>
          <DescriptionContent
            description={featDefinition.description}
            className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
            entryClassName={overlayClassNames.descriptionLine}
            strongClassName={overlayClassNames.descriptionStrong}
            linkClassName={styles.inlineLinkButton}
            onOpenKeyword={setSelectedKeyword}
            onOpenSpell={setSelectedSpellReference}
            onOpenDivinity={setSelectedDivinityReference}
            onOpenFeat={(nextFeat, nextLabel) =>
              setSelectedFeatReference({ feat: nextFeat, label: nextLabel })
            }
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

export default CodexFeatDrawer;
