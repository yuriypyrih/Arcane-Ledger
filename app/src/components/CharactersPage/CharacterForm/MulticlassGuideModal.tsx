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
        <ol className={styles.steps}>
          <li>
            <strong>Choose your starting class.</strong> Select your primary class and your total
            character level here, then finish creating your character.
          </li>
          <li>
            <strong>Add your other classes.</strong> On your character sheet, find the{" "}
            <strong>Build Section</strong> and press <strong>Edit</strong>. Add your additional
            classes, choose their subclasses, and select any available proficiencies.
          </li>
          <li>
            <strong>Distribute your levels.</strong> Click the <strong>Level</strong> button beside
            your character&apos;s name to open character progression. Split your total character
            level between your classes, then save.
          </li>
        </ol>
        <p className={styles.intro}>
          Any declared classes with zero levels are inactive until you put levels on them.
        </p>
      </OverlayBody>
    </SheetModal>
  );
}

export default MulticlassGuideModal;
