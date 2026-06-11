import { Play, Square, Swords } from "lucide-react";
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
            The gameplay dashboard helps you track your available actions in and out of combat, your
            round tracker, HP and Temporary HP, Traits &amp; Conditions, and other session-facing
            tools.
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
                <ActionShape shape="bonusAction" isSelected={false} multiCount={1} size="small" />
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
            A full shape means the action is available, a half shape means you still have extra uses
            tied to that action, and an empty shape means it has been spent for this turn.
          </p>
          <p className={`${styles.sectionText} ${styles.inlineShapeText}`}>
            <ActionShape
              shape="nonCombat"
              isSelected
              size="small"
              aria-label="Blue diamond outside-turn action"
              className={styles.inlineShapeIcon}
            />
            <span>
              A blue diamond marks an action, commonly a spell, that takes longer to resolve and
              therefore typically happens outside of turn-based events.
            </span>
          </p>
        </section>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Turn Flow</h4>
          <div className={styles.turnFlowList}>
            <div className={styles.turnFlowItem}>
              <span
                className={`${styles.turnFlowIcon} ${styles.turnFlowIconStart}`}
                aria-hidden="true"
              >
                <Play size={18} strokeWidth={2} />
              </span>
              <p className={styles.sectionText}>
                Start round resets your tracked action, bonus action, and reaction, then advances
                effects that count down at the start of your turn.
              </p>
            </div>
            <div className={styles.turnFlowItem}>
              <span
                className={`${styles.turnFlowIcon} ${styles.turnFlowIconEnd}`}
                aria-hidden="true"
              >
                <Square size={18} strokeWidth={2} />
              </span>
              <p className={styles.sectionText}>
                End round finishes your turn and advances effects that count down at the end of your
                turn.
              </p>
            </div>
            <div className={styles.turnFlowItem}>
              <span
                className={`${styles.turnFlowIcon} ${styles.turnFlowIconCombat}`}
                aria-hidden="true"
              >
                <Swords size={17} />
              </span>
              <p className={styles.sectionText}>
                Combat controls whether round resources are tracked. To start combat you can do so
                either by rolling initiative, pressing Round Start, or manually pressing the button.
                To end combat you have to do always manually.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Live Encounter</h4>
          <p className={styles.sectionText}>
            When your character is in a party, the Party control can switch Gameplay into a shared
            party view with group information and the live encounter tracker when one is active.
            Syncing your character publishes your latest sheet state, so the rest of the party sees
            the live version after they refresh their encounter tracker.
          </p>
        </section>
      </OverlayBody>
    </SheetModal>
  );
}

export default GameplayGuideModal;
