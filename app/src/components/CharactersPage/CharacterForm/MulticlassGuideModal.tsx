import { useEffect } from "react";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../Overlay";
import styles from "./MulticlassGuideModal.module.css";

type MulticlassGuideModalProps = {
  onClose: () => void;
};

function MulticlassGuideModal({ onClose }: MulticlassGuideModalProps) {
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <SheetModal titleId="multiclass-guide-modal-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Character Creation</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="multiclass-guide-modal-title">Multiclass Guide</OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close multiclass guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <p className={styles.intro}>Arcane Ledger now supports proper multiclassing!</p>
        <p className={styles.sectionText}>
          Combine classes to create the character you have in mind. Here&apos;s how to get started:
        </p>
        <section className={styles.phase} aria-labelledby="multiclass-guide-creation-title">
          <h3 className={styles.phaseTitle} id="multiclass-guide-creation-title">
            On this page
          </h3>
          <ol className={styles.steps}>
            <li>
              <strong>Choose your starting class.</strong> Select your primary class and your total
              character level here, then finish creating your character like you would for mono-class.
            </li>
          </ol>
        </section>
        <section className={styles.phase} aria-labelledby="multiclass-guide-sheet-title">
          <h3 className={styles.phaseTitle} id="multiclass-guide-sheet-title">
            Next: on your character sheet
          </h3>
          <ol className={styles.steps} start={2}>
            <li>
              <strong>Add your other classes.</strong> After creating your character, find the{" "}
              <strong>Build Section</strong> on your character sheet and press <strong>Edit</strong>.
              Add your additional classes, choose their subclasses, and select any available
              proficiencies, then save your changes.
            </li>
            <li>
              <strong>Distribute your levels.</strong> On the same character sheet, click the{" "}
              <strong>Level</strong> button beside your character&apos;s name to open character
              progression. Split your total character level between your classes, then save.
            </li>
          </ol>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default MulticlassGuideModal;
