import { useId } from "react";
import {
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../../Overlay";
import styles from "./DiceRollerSettingsModal.module.css";

type DiceRollerSettingsModalProps = {
  actionName: string;
  onClose: () => void;
};

function DiceRollerSettingsModal({
  actionName,
  onClose
}: DiceRollerSettingsModalProps) {
  const titleId = useId().replace(/:/g, "");

  return (
    <SheetModal titleId={titleId} onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Dice Roller</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id={titleId}>Roll Settings</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary>{`Settings for ${actionName} will land here.`}</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close dice roller settings" onClick={onClose} />
      </OverlayHeader>

      <div className={styles.body}>
        <p className={styles.placeholder}>WIP</p>
      </div>
    </SheetModal>
  );
}

export default DiceRollerSettingsModal;
