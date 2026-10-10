import ActionButton from "../../../../../ActionButton";
import ActionShape from "../../../../../ActionShape";
import d20Icon from "../../../../../../assets/svg/d20.svg";
import DiceRollerSettingsButton from "../DiceRollerSettingsButton";
import styles from "./ReactionRollFooter.module.css";

type ReactionRollFooterProps = {
  actionName: string;
  reactionAvailable: boolean;
  disabled: boolean;
  onTakeReaction: () => void;
};

function ReactionRollFooter({
  actionName,
  reactionAvailable,
  disabled,
  onTakeReaction
}: ReactionRollFooterProps) {
  return (
    <div className={styles.footerActions}>
      <ActionButton
        className={styles.rollButton}
        onClick={onTakeReaction}
        disabled={disabled}
        icon={<img src={d20Icon} alt="" className={styles.rollButtonIcon} />}
        trailingBadge={
          <ActionShape
            shape="reaction"
            isSelected={reactionAvailable}
            className={styles.actionShape}
            aria-label="Reaction action state"
          />
        }
      >
        Take Reaction
      </ActionButton>
      <DiceRollerSettingsButton
        actionName={actionName}
        className={styles.settingsButton}
        ariaLabel="Open dice roller settings"
      />
    </div>
  );
}

export default ReactionRollFooter;
