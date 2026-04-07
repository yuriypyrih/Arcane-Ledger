import { useState } from "react";
import CellContainer from "../../CellContainer/CellContainer";
import SpellDescriptionContent from "../../SpellDescriptionContent";
import { FEATS, type DivinityEntry, type SpellEntry } from "../../../codex/entries";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayDetailsGrid,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer,
  overlayClassNames
} from "../../Overlay";
import { getClericResolvedDivinityDisplay } from "../../../pages/CharactersPage/classFeatures/cleric/cleric";
import type { ResolvedKeywordReference } from "../../../utils/codex/renderCodexRichText";
import type { Character } from "../../../types";
import {
  formatCodexLabel,
  formatDivinitySubtitle,
  formatDivinityValue,
  formatSpellCastingTime
} from "../../../utils/codex";
import CodexFeatDrawer from "../CodexFeatDrawer/CodexFeatDrawer";
import CodexSpellDrawer from "../CodexSpellDrawer/CodexSpellDrawer";
import KeywordReferenceDrawer from "../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import styles from "./CodexDivinityDrawer.module.css";

type SelectedFeatReference = {
  feat: FEATS;
  label: string;
};

type CodexDivinityDrawerProps = {
  divinity: DivinityEntry;
  character?: Pick<Character, "className" | "level" | "abilities" | "feats">;
  onClose: () => void;
};

function CodexDivinityDrawer({ divinity, character, onClose }: CodexDivinityDrawerProps) {
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );
  const resolvedDisplay = character
    ? getClericResolvedDivinityDisplay(character, divinity)
    : {
        damage: divinity.damage ?? null,
        healing: divinity.healing ?? null,
        description: divinity.description
      };
  const primaryValue = resolvedDisplay.damage ?? resolvedDisplay.healing;

  return (
    <>
      <SheetDrawer
        titleId="codex-divinity-drawer-title"
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

          if (selectedSpellReference) {
            setSelectedSpellReference(null);
            return;
          }

          onClose();
        }}
      >
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayBadge>{formatCodexLabel("DIVINITY")}</OverlayBadge>
            <OverlayTitleRow>
              <OverlayTitle id="codex-divinity-drawer-title">{divinity.name}</OverlayTitle>
            </OverlayTitleRow>
            <OverlaySummary>{formatDivinitySubtitle(divinity)}</OverlaySummary>
          </OverlayHeaderContent>
          <OverlayCloseButton label="Close divinity details" onClick={onClose} />
        </OverlayHeader>

        <OverlayBody>
          <OverlayDetailsGrid>
            <CellContainer
              label="Casting Time"
              content={formatSpellCastingTime(divinity.castingTime)}
            />
            <CellContainer label="Range" content={divinity.range} />
            <CellContainer label="Duration" content={divinity.duration} />
            <CellContainer
              label="Damage"
              content={primaryValue ? formatDivinityValue(primaryValue) : "-"}
            />
          </OverlayDetailsGrid>

          <SpellDescriptionContent
            description={resolvedDisplay.description}
            className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
            entryClassName={overlayClassNames.descriptionLine}
            strongClassName={overlayClassNames.descriptionStrong}
            linkClassName={styles.inlineLinkButton}
            onOpenKeyword={setSelectedKeyword}
            onOpenSpell={setSelectedSpellReference}
            onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
          />
        </OverlayBody>
      </SheetDrawer>

      {selectedSpellReference ? (
        <CodexSpellDrawer
          spell={selectedSpellReference}
          onClose={() => setSelectedSpellReference(null)}
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

export default CodexDivinityDrawer;
