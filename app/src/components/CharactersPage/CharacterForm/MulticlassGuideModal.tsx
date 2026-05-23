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
        <section className={styles.section}>
          <p className={styles.sectionText}>
            We know how much you all love a good multiclass character. And while Arcane Ledger does
            not provide conventional multiclassing as a direct character-creation path, there are
            several ways to emulate it depending on the tactic behind your build.
          </p>
          <p className={styles.sectionText}>
            If you are mostly going vertical, choose your primary class and use edits, custom
            traits, and custom features to add the dip or flavor you need. The app gives you a lot
            of room to tune the sheet around the exact parts of another class you want to represent.
          </p>
          <p className={styles.sectionText}>
            If you are going horizontal and spreading levels across many classes, Custom is usually
            the better starting point. It removes predefined class-feature baggage, keeps the core
            sheet tools unrestricted, and leaves the build in your hands. Multiclass-style play
            works best once you are comfortable with Arcane Ledger customization and modding.
          </p>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default MulticlassGuideModal;
