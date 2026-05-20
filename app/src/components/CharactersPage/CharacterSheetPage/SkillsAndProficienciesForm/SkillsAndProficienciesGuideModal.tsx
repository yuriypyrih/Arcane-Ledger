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
import styles from "./SkillsAndProficienciesGuideModal.module.css";

type SkillsAndProficienciesGuideModalProps = {
  onClose: () => void;
};

function SkillsAndProficienciesGuideModal({
  onClose
}: SkillsAndProficienciesGuideModalProps) {
  return (
    <SheetModal titleId="skills-proficiencies-guide-modal-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Skills &amp; Proficiencies</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="skills-proficiencies-guide-modal-title">
              Skills &amp; Proficiencies Guide
            </OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary className={shared.helperText}>
            This section lists your skills, proficiencies, masteries, expertise, and languages.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close skills and proficiencies guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <section className={styles.section}>
          <p className={styles.sectionText}>
            You can manually add or remove some entries. If a skill or proficiency comes from a
            feature, it is locked here; change it from the source feature instead.
          </p>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default SkillsAndProficienciesGuideModal;
