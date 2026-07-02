import {
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import CustomEquipmentEditor, {
  type CustomEquipmentEditorSavePayload
} from "../CustomEquipmentEditor";
import styles from "./MasterChestModal.module.css";

type MasterChestCustomEquipmentModalProps = {
  onClose: () => void;
  onSave: (payload: CustomEquipmentEditorSavePayload) => void;
};

function MasterChestCustomEquipmentModal({ onClose, onSave }: MasterChestCustomEquipmentModalProps) {
  return (
    <SheetModal
      titleId="master-chest-custom-equipment-title"
      onClose={onClose}
      size="medium"
      backdropClassName={styles.customEquipmentModalBackdrop}
      panelClassName={styles.customEquipmentModal}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id="master-chest-custom-equipment-title">
            Create custom equipment
          </OverlayTitle>
          <OverlaySummary>Create a custom item and add one copy to the master chest draft.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close custom equipment modal" onClick={onClose} />
      </OverlayHeader>

      <CustomEquipmentEditor mode="create" onCancel={onClose} onSave={onSave} />
    </SheetModal>
  );
}

export default MasterChestCustomEquipmentModal;
