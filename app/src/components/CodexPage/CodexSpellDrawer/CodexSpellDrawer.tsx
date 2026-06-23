import { lazy, Suspense, useState } from "react";
import CellContainer from "../../CellContainer/CellContainer";
import ConcentrationLabel from "../../ConcentrationLabel";
import SpellSubtitle from "../../SpellSubtitle";
import SpellDescriptionContent from "../../SpellDescriptionContent";
import {
  ENTRY_CATEGORIES,
  FEATS,
  KeywordTooltip,
  TRACKER,
  getSpellTrackingState,
  type DivinityEntry,
  type SpellEntry
} from "../../../codex/entries";
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
import {
  resolveKeywordReference,
  type ResolvedKeywordReference
} from "../../../utils/codex/renderCodexRichText";
import { FeatureTrackingBadgeButton } from "../../FeatureDisclosure";
import {
  formatCodexLabel,
  formatCodexList,
  formatSpellCastingTime,
  formatSpellComponents,
  formatSpellHealing,
  getSpellDurationDisplayParts,
  formatWeaponDamage
} from "../../../utils/codex";
import {
  getSpellAttackFormulaCell,
  getSpellSaveFormulaCell
} from "../../../pages/CharactersPage/shared/spellFormulas";
import styles from "./CodexSpellDrawer.module.css";

const CodexDivinityDrawer = lazy(() => import("../CodexDivinityDrawer/CodexDivinityDrawer"));
const CodexFeatDrawer = lazy(() => import("../CodexFeatDrawer/CodexFeatDrawer"));
const KeywordReferenceDrawer = lazy(
  () => import("../../KeywordReferenceDrawer/KeywordReferenceDrawer")
);

type SelectedFeatReference = {
  feat: FEATS;
  label: string;
};

type CodexSpellDrawerProps = {
  spell: SpellEntry;
  onClose: () => void;
  backdropClassName?: string;
};

function hasSpellHealing(spell: Pick<SpellEntry, "healing">): boolean {
  return Array.isArray(spell.healing)
    ? spell.healing.length > 0
    : spell.healing.label.trim().length > 0;
}

function CodexSpellDrawer({ spell, onClose, backdropClassName }: CodexSpellDrawerProps) {
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
  const spellFormulaCells = [
    getSpellSaveFormulaCell(spell),
    getSpellAttackFormulaCell(spell)
  ].filter((cell): cell is NonNullable<typeof cell> => cell !== null);
  const spellTrackingState = getSpellTrackingState(spell);

  function openTrackingKeyword(trackingState: TRACKER, trackingMessage?: string) {
    const resolvedKeyword = resolveKeywordReference(trackingState, undefined, trackingMessage);

    if (resolvedKeyword) {
      setSelectedKeyword(resolvedKeyword);
    }
  }

  return (
    <>
      <SheetDrawer
        titleId="codex-spell-drawer-title"
        onClose={onClose}
        backdropClassName={backdropClassName}
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
              <OverlayTitle id="codex-spell-drawer-title">{spell.name}</OverlayTitle>
            </OverlayTitleRow>
            <OverlaySummary>
              <SpellSubtitle spell={spell} />
            </OverlaySummary>
          </OverlayHeaderContent>
          <div className={styles.headerActions}>
            <FeatureTrackingBadgeButton
              trackingState={spellTrackingState}
              trackingMessage={spell.trackingMessage}
              onClick={openTrackingKeyword}
            />
            <OverlayCloseButton label="Close spell details" onClick={onClose} />
          </div>
        </OverlayHeader>

        <OverlayBody>
          <OverlayDetailsGrid className={styles.spellInfoGrid}>
            <CellContainer
              label="Casting Time"
              content={formatSpellCastingTime(spell.castingTime)}
            />
            <CellContainer label="Range" content={spell.range} />
            <CellContainer
              as="button"
              label="Components"
              content={formatSpellComponents(spell.components, spell.materialSpecified)}
              className={styles.detailButton}
              onClick={() => {
                if (componentsTooltipEntry) {
                  setIsComponentsTooltipOpen(true);
                }
              }}
              type="button"
            />
            <CellContainer
              label="Duration"
              content={
                spellDuration.hasConcentration ? (
                  <span className={styles.concentrationDetailValue}>
                    <ConcentrationLabel iconSize={15} />
                    {spellDuration.detailText ? <span>, {spellDuration.detailText}</span> : null}
                  </span>
                ) : (
                  spellDuration.detailText
                )
              }
            />
            <CellContainer
              label="Spell Lists"
              content={formatCodexList(spell.spellLists) || "None"}
            />
            <CellContainer
              label={
                spell.damage.length > 0 ? "Damage" : hasSpellHealing(spell) ? "Healing" : "Damage"
              }
              content={
                spell.damage.length > 0
                  ? formatWeaponDamage(spell.damage)
                  : formatSpellHealing(spell.healing)
              }
            />
          </OverlayDetailsGrid>

          <SpellDescriptionContent
            description={spell.description}
            className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
            entryClassName={overlayClassNames.descriptionLine}
            strongClassName={overlayClassNames.descriptionStrong}
            linkClassName={styles.inlineLinkButton}
            onOpenKeyword={setSelectedKeyword}
            onOpenSpell={setSelectedSpellReference}
            onOpenDivinity={setSelectedDivinityReference}
            onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
          />
          {spellFormulaCells.length > 0 ? (
            <OverlayDetailsGrid>
              {spellFormulaCells.map((cell) => (
                <CellContainer
                  key={cell.label}
                  className={styles.formulaCell}
                  label={cell.label}
                  content={cell.content}
                  breakdown={cell.breakdown}
                />
              ))}
            </OverlayDetailsGrid>
          ) : null}
        </OverlayBody>
      </SheetDrawer>

      <Suspense fallback={null}>
        {isComponentsTooltipOpen && componentsTooltipEntry ? (
          <KeywordReferenceDrawer
            title={componentsTooltipEntry.title}
            entries={[
              {
                title: componentsTooltipEntry.title,
                description: componentsTooltipEntry.description
              }
            ]}
            badgeLabel="Keyword"
            backdropClassName={backdropClassName}
            onClose={() => setIsComponentsTooltipOpen(false)}
          />
        ) : null}
        {selectedSpellReference ? (
          <CodexSpellDrawer
            spell={selectedSpellReference}
            backdropClassName={backdropClassName}
            onClose={() => setSelectedSpellReference(null)}
          />
        ) : null}
        {selectedDivinityReference ? (
          <CodexDivinityDrawer
            divinity={selectedDivinityReference}
            backdropClassName={backdropClassName}
            onClose={() => setSelectedDivinityReference(null)}
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
            backdropClassName={backdropClassName}
            onClose={() => setSelectedKeyword(null)}
          />
        ) : null}
        {selectedFeatReference ? (
          <CodexFeatDrawer
            feat={selectedFeatReference.feat}
            label={selectedFeatReference.label}
            backdropClassName={backdropClassName}
            onClose={() => setSelectedFeatReference(null)}
          />
        ) : null}
      </Suspense>
    </>
  );
}

export default CodexSpellDrawer;
