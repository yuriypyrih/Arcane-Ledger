import { FastForward, Play } from "lucide-react";
import ActionShape from "../../../ActionShape";
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
import styles from "./GameplayGuideModal.module.css";

type GameplayGuideModalProps = {
  onClose: () => void;
};

function GameplayGuideModal({ onClose }: GameplayGuideModalProps) {
  return (
    <SheetModal titleId="gameplay-guide-modal-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Gameplay</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="gameplay-guide-modal-title">Gameplay Guide</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary className={shared.helperText}>
            The gameplay dashboard helps you track your available actions in and out of combat,
            your round tracker, HP and Temporary HP, Traits &amp; Conditions, and other
            session-facing tools.
          </OverlaySummary>
          <OverlaySummary className={shared.helperText}>
            If your character can cast spells, scroll to the end of the page to reach the
            Spellcasting section.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close gameplay guide" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Combat Shapes</h4>
          <div className={styles.shapeGroupRow}>
            <div className={styles.shapeGroup}>
              <span className={styles.shapeLabel}>Action</span>
              <div className={styles.shapeExamples}>
                <ActionShape shape="action" isSelected size="small" />
                <ActionShape shape="action" isSelected={false} multiCount={1} size="small" />
                <ActionShape shape="action" isSelected={false} size="small" />
              </div>
            </div>
            <div className={styles.shapeGroup}>
              <span className={styles.shapeLabel}>Bonus Action</span>
              <div className={styles.shapeExamples}>
                <ActionShape shape="bonusAction" isSelected size="small" />
                <ActionShape
                  shape="bonusAction"
                  isSelected={false}
                  multiCount={1}
                  size="small"
                />
                <ActionShape shape="bonusAction" isSelected={false} size="small" />
              </div>
            </div>
            <div className={styles.shapeGroup}>
              <span className={styles.shapeLabel}>Reaction</span>
              <div className={styles.shapeExamples}>
                <ActionShape shape="reaction" isSelected size="small" />
                <ActionShape shape="reaction" isSelected={false} multiCount={1} size="small" />
                <ActionShape shape="reaction" isSelected={false} size="small" />
              </div>
            </div>
          </div>
          <p className={styles.sectionText}>
            A full shape means the action is available, a half shape means you still have extra
            uses tied to that action, and an empty shape means it has been spent for this turn.
          </p>
        </section>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Non-Combat Action</h4>
          <div className={styles.inlineExample}>
            <span className={styles.inlineIcon} aria-hidden="true">
              <ActionShape shape="nonCombat" isSelected size="small" />
            </span>
            <p className={styles.sectionText}>
              The blue diamond is typically assigned to actions, very commonly spells, that usually
              do not take place in combat and therefore are mostly visual and not tracked by the
              Round Tracker.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Turn Flow</h4>
          <div className={styles.turnFlowList}>
            <div className={styles.turnFlowItem}>
              <span className={styles.turnFlowIcon} aria-hidden="true">
                <Play size={16} />
              </span>
              <p className={styles.sectionText}>
                To begin your turn, press the start button. This resets your tracked actions and
                counts down effects that depend on round start.
              </p>
            </div>
            <div className={styles.turnFlowItem}>
              <span className={styles.turnFlowIcon} aria-hidden="true">
                <FastForward size={16} />
              </span>
              <p className={styles.sectionText}>
                To finish your turn, press the finish button. This only triggers the end-of-round
                countdowns.
              </p>
            </div>
          </div>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default GameplayGuideModal;
