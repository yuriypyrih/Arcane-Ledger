import { useState } from "react";
import ConcentrationLabel from "../../ConcentrationLabel";
import SpellSubtitle from "../../SpellSubtitle";
import SpellDescriptionContent from "../../SpellDescriptionContent";
import { ENTRY_CATEGORIES, KeywordTooltip, type SpellEntry } from "../../../codex/entries";
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
import {
  formatCodexLabel,
  formatCodexList,
  formatSpellCastingTime,
  formatSpellComponents,
  getSpellDurationDisplayParts,
  formatWeaponDamage,
  renderCodexInlineText
} from "../../../utils/codex";
import styles from "./CodexSpellDrawer.module.css";

type CodexSpellDrawerProps = {
  spell: SpellEntry;
  onClose: () => void;
};

function CodexSpellDrawer({ spell, onClose }: CodexSpellDrawerProps) {
  const [isComponentsTooltipOpen, setIsComponentsTooltipOpen] = useState(false);
  const componentsTooltipEntry = KeywordTooltip.components ?? null;
  const spellDuration = getSpellDurationDisplayParts(spell.duration);

  return (
    <>
      <SheetDrawer
        titleId="codex-spell-drawer-title"
        onClose={onClose}
        onEscape={() => {
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
                <div className={styles.tooltipDescription}>
                  {componentsTooltipEntry.description.map((line, index) => (
                    <p key={`components-${index}`}>{renderCodexInlineText(line)}</p>
                  ))}
                </div>
              </article>
            ) : null}
        </SheetModal>
      ) : null}
    </>
  );
}

export default CodexSpellDrawer;
