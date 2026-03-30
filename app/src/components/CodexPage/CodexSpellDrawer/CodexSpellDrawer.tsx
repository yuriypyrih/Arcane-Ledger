import { useState } from "react";
import ConcentrationLabel from "../../ConcentrationLabel";
import DescriptionContent from "../../DescriptionContent/DescriptionContent";
import SpellSubtitle from "../../SpellSubtitle";
import SpellDescriptionContent from "../../SpellDescriptionContent";
import {
  ENTRY_CATEGORIES,
  FEATS,
  KeywordTooltip,
  type DivinityEntry,
  type SpellEntry
} from "../../../codex/entries";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayDetailCard,
  OverlayDetailLabel,
  OverlayDetailsGrid,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitleRow,
  SheetDrawer,
  SheetModal,
  overlayClassNames
} from "../../Overlay";
import KeywordReferenceDrawer from "../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import type { ResolvedKeywordReference } from "../../../utils/codex/renderCodexRichText";
import {
  formatCodexLabel,
  formatCodexList,
  formatSpellCastingTime,
  formatSpellComponents,
  getSpellDurationDisplayParts,
  formatWeaponDamage
} from "../../../utils/codex";
import CodexDivinityDrawer from "../CodexDivinityDrawer/CodexDivinityDrawer";
import CodexFeatDrawer from "../CodexFeatDrawer/CodexFeatDrawer";
import styles from "./CodexSpellDrawer.module.css";

type SelectedFeatReference = {
  feat: FEATS;
  label: string;
};

type CodexSpellDrawerProps = {
  spell: SpellEntry;
  onClose: () => void;
};

function CodexSpellDrawer({ spell, onClose }: CodexSpellDrawerProps) {
  const [isComponentsTooltipOpen, setIsComponentsTooltipOpen] = useState(false);
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );
  const componentsTooltipEntry = KeywordTooltip.components ?? null;
  const spellDuration = getSpellDurationDisplayParts(spell.duration);

  return (
    <>
      <SheetDrawer
        titleId="codex-spell-drawer-title"
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

          if (isComponentsTooltipOpen) {
            setIsComponentsTooltipOpen(false);
            return;
          }

          onClose();
        }}
      >
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayBadge>{formatCodexLabel(ENTRY_CATEGORIES.SPELLS)}</OverlayBadge>
            <OverlayTitleRow>
              <h3 id="codex-spell-drawer-title">{spell.name}</h3>
            </OverlayTitleRow>
            <OverlaySummary>
              <SpellSubtitle spell={spell} />
            </OverlaySummary>
          </OverlayHeaderContent>
          <OverlayCloseButton label="Close spell details" onClick={onClose} />
        </OverlayHeader>

        <OverlayBody>
          <OverlayDetailsGrid>
            <OverlayDetailCard>
              <OverlayDetailLabel>Casting Time</OverlayDetailLabel>
              <strong>{formatSpellCastingTime(spell.castingTime)}</strong>
            </OverlayDetailCard>
            <OverlayDetailCard>
              <OverlayDetailLabel>Range</OverlayDetailLabel>
              <strong>{spell.range}</strong>
            </OverlayDetailCard>
            <OverlayDetailCard
              as="button"
              className={styles.detailButton}
              onClick={() => {
                if (componentsTooltipEntry) {
                  setIsComponentsTooltipOpen(true);
                }
              }}
              type="button"
            >
              <OverlayDetailLabel>Components</OverlayDetailLabel>
              <strong>{formatSpellComponents(spell.components)}</strong>
            </OverlayDetailCard>
            <OverlayDetailCard>
              <OverlayDetailLabel>Duration</OverlayDetailLabel>
              <strong className={styles.concentrationDetailValue}>
                {spellDuration.hasConcentration ? (
                  <>
                    <ConcentrationLabel iconSize={15} />
                    {spellDuration.detailText ? <span>, {spellDuration.detailText}</span> : null}
                  </>
                ) : (
                  spellDuration.detailText
                )}
              </strong>
            </OverlayDetailCard>
            <OverlayDetailCard>
              <OverlayDetailLabel>Spell Lists</OverlayDetailLabel>
              <strong>{formatCodexList(spell.spellLists) || "None"}</strong>
            </OverlayDetailCard>
            <OverlayDetailCard>
              <OverlayDetailLabel>Damage</OverlayDetailLabel>
              <strong>{formatWeaponDamage(spell.damage)}</strong>
            </OverlayDetailCard>
          </OverlayDetailsGrid>

          <SpellDescriptionContent
            description={spell.description}
            className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
            entryClassName={overlayClassNames.descriptionLine}
            linkClassName={styles.inlineLinkButton}
            onOpenKeyword={setSelectedKeyword}
            onOpenSpell={setSelectedSpellReference}
            onOpenDivinity={setSelectedDivinityReference}
            onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
          />
        </OverlayBody>
      </SheetDrawer>

      {isComponentsTooltipOpen ? (
        <SheetModal
          titleId="codex-spell-components-title"
          onClose={() => setIsComponentsTooltipOpen(false)}
          backdropClassName={styles.modalBackdrop}
          panelClassName={styles.modal}
        >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Spell Reference</p>
                <h3 id="codex-spell-components-title">
                  {componentsTooltipEntry?.title ?? "Components"}
                </h3>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsComponentsTooltipOpen(false)}
                aria-label="Close components tooltip"
                >
                  ×
                </button>
              </div>
              {componentsTooltipEntry ? (
              <article className={styles.tooltipCard}>
                <DescriptionContent
                  description={componentsTooltipEntry.description}
                  className={styles.tooltipDescription}
                  entryClassName={overlayClassNames.descriptionLine}
                  linkClassName={styles.inlineLinkButton}
                  onOpenKeyword={setSelectedKeyword}
                  onOpenSpell={setSelectedSpellReference}
                  onOpenDivinity={setSelectedDivinityReference}
                  onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                />
              </article>
            ) : null}
        </SheetModal>
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

export default CodexSpellDrawer;
