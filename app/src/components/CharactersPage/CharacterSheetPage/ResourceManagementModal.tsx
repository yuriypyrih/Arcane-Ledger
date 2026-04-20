import clsx from "clsx";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../Overlay";
import sheetStyles from "../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./ResourceManagementModal.module.css";

const RESOURCE_MANAGEMENT_DESCRIPTION =
  "Here you can manually adjust your resources outside of the app internal logic.";

type ResourceManagementModalProps = {
  titleId: string;
  title: string;
  closeLabel: string;
  onClose: () => void;
  onUseOne: () => void;
  onResetOne: () => void;
  onResetAll: () => void;
  useOneDisabled?: boolean;
  resetOneDisabled?: boolean;
  resetAllDisabled?: boolean;
};

function ResourceManagementModal({
  titleId,
  title,
  closeLabel,
  onClose,
  onUseOne,
  onResetOne,
  onResetAll,
  useOneDisabled = false,
  resetOneDisabled = false,
  resetAllDisabled = false
}: ResourceManagementModalProps) {
  return (
    <SheetModal titleId={titleId} onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>RESOURCE MANAGEMENT</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id={titleId}>{title}</OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label={closeLabel} onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <p className={styles.description}>{RESOURCE_MANAGEMENT_DESCRIPTION}</p>
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <div className={styles.footerActions}>
          <button
            type="button"
            className={clsx(sheetStyles.castButton, styles.footerButton)}
            onClick={onUseOne}
            disabled={useOneDisabled}
            aria-label={`Use 1 ${title}`}
          >
            Use 1
          </button>
          <button
            type="button"
            className={clsx(sheetStyles.castButton, styles.footerButton)}
            onClick={onResetOne}
            disabled={resetOneDisabled}
            aria-label={`Reset 1 ${title}`}
          >
            Reset 1
          </button>
          <button
            type="button"
            className={clsx(sheetStyles.castButton, styles.footerButton)}
            onClick={onResetAll}
            disabled={resetAllDisabled}
            aria-label={`Reset all ${title}`}
          >
            Reset All
          </button>
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

export default ResourceManagementModal;
