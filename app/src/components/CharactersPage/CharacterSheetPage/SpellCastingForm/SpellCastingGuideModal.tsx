import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../Overlay";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./SpellCastingGuideModal.module.css";

type SpellCastingGuideModalProps = {
  onClose: () => void;
};

function SpellCastingGuideModal({ onClose }: SpellCastingGuideModalProps) {
  return (
    <SheetModal titleId="spellcasting-guide-modal-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Spellcasting</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="spellcasting-guide-modal-title">Spellcasting Guide</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary className={shared.helperText}>
            Spellcasting keeps your slots, cantrips, prepared or known spells, rituals, and
            feature-granted casting options together.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close spellcasting guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <section className={styles.section}>
          <div className={styles.spellSlotLabel}>
            <span>Spell Slots</span>
            <span className={styles.spellSlotSquares} aria-hidden="true">
              <span className={styles.spellSlotSquare} />
              <span className={styles.spellSlotSquare} />
              <span className={styles.spellSlotSquare} />
            </span>
          </div>
          <p className={styles.sectionText}>
            Spell slots are the fuel for casting spells. Spent slots are regained on a Long Rest.
          </p>
        </section>

        <section className={styles.section}>
          <span className={styles.alwaysPreparedPill}>Always Prepared</span>
          <p className={styles.sectionText}>
            Granted by a class, species, feat, or feature. These spells stay prepared automatically
            and do not count against your prepared-spell limit.
          </p>
        </section>

        <section className={styles.section}>
          <span className={styles.ritualPill}>Ritual</span>
          <p className={styles.sectionText}>
            This spell can be cast as a ritual when your character has access to that ritual path.
            Ritual casting does not spend a spell slot, but it follows the ritual rules shown in the
            spell drawer.
          </p>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default SpellCastingGuideModal;
