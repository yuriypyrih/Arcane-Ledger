import clsx from "clsx";
import ActionShape from "../../../../../ActionShape";
import d20Icon from "../../../../../../assets/svg/d20.svg";
import sheetStyles from "../../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import DiceRollerSettingsButton from "../DiceRollerSettingsButton";
import styles from "./ReactionRollFooter.module.css";

type ReactionRollFooterProps = {
  actionName: string;
  disabled: boolean;
  onTakeReaction: () => void;
};

function ReactionRollFooter({ actionName, disabled, onTakeReaction }: ReactionRollFooterProps) {
  return (
    <div className={styles.footerActions}>
      <button
        type="button"
        className={clsx(sheetStyles.castButton, styles.rollButton)}
        onClick={onTakeReaction}
        disabled={disabled}
      >
        <span className={styles.rollButtonContent}>
          <img src={d20Icon} alt="" className={styles.rollButtonIcon} />
          <span>Take Reaction</span>
          <ActionShape
            shape="reaction"
            isSelected={!disabled}
            className={styles.actionShape}
            aria-label="Reaction action state"
          />
        </span>
      </button>
      <DiceRollerSettingsButton
        actionName={actionName}
        className={clsx(sheetStyles.castButton, styles.settingsButton)}
        ariaLabel="Open dice roller settings"
      />
    </div>
  );
}

export default ReactionRollFooter;
