import {
  BookUser,
  MessageCircleQuestionMark,
  NotebookPen,
  Swords,
  type LucideIcon
} from "lucide-react";
import type { ReactNode } from "react";
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
} from "../../Overlay";
import styles from "./StartingGuideModal.module.css";

type StartingGuideModalProps = {
  onClose: () => void;
};

type GuideItemProps = {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
};

function GuideItem({ children, icon: Icon, title }: GuideItemProps) {
  return (
    <section className={styles.guideItem}>
      <span className={styles.guideIcon} aria-hidden="true">
        <Icon size={18} strokeWidth={2.1} />
      </span>
      <div className={styles.guideContent}>
        <h4 className={styles.guideTitle}>{title}</h4>
        <p className={styles.guideText}>{children}</p>
      </div>
    </section>
  );
}

function StartingGuideModal({ onClose }: StartingGuideModalProps) {
  return (
    <SheetModal titleId="starting-guide-modal-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Character Creation</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="starting-guide-modal-title">Starting Guide</OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close starting guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <GuideItem icon={MessageCircleQuestionMark} title="Ask the Table First">
          Before choosing anything, check with your GM about the setting, starting level, allowed
          source material, stat method, house rules, and party needs.
        </GuideItem>

        <GuideItem icon={Swords} title="Pick Your Class">
          Your class is the main engine of the sheet: how you solve problems, spend turns, and grow
          over levels. Your subclass sharpens that identity, though many characters choose it at
          level 3. Use the book button beside class and subclass fields for a quick reference, or
          read the full progression in the Classes section of the Compendium.
        </GuideItem>

        <GuideItem icon={BookUser} title="Choose Your Origin">
          Species gives traits such as speed, senses, resistances, and special abilities. Background
          explains who shaped you before adventuring and enchances your character sheet further.
        </GuideItem>

        <GuideItem icon={NotebookPen} title="Finish the Sheet">
          Customize the character sheet around what your character needs. Put your strongest ability
          score where your class uses it most, then use the build setup step to choose equipment,
          skills, and other starting options. If something is not available during creation, no
          worries, you can add it after the character is finalized.
        </GuideItem>
      </OverlayBody>
    </SheetModal>
  );
}

export default StartingGuideModal;
