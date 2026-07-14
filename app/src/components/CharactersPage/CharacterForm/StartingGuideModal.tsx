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
          Choose a class based on how you want your character to approach adventure. Your class
          shapes your abilities, actions, spellcasting, and the choices available as you level up.
          Your subclass adds a more focused path, though many classes choose one at level 3. Use the
          book button beside the class and subclass fields for a quick reference, or explore the full
          progression in the Compendium.
        </GuideItem>

        <GuideItem icon={BookUser} title="Choose Your Origin">
          Choose a species for traits that shape how your character moves through the world, such as
          senses, resilience, speed, and special abilities. Choose a background to reflect the life
          they lived before adventure, adding useful details to the sheet and a foundation for their
          story.
        </GuideItem>

        <GuideItem icon={NotebookPen} title="Finish the Sheet">
          Put your strongest ability score where your class will use it most. Then use Build Setup to
          choose skills, equipment, and other starting options. If something is missing, you can
          adjust the sheet later.
        </GuideItem>
      </OverlayBody>
    </SheetModal>
  );
}

export default StartingGuideModal;
