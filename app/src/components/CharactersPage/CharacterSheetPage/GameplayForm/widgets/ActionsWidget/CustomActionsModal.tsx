import { useId } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { CharacterCustomAction } from "../../../../../../types";
import ActionButton from "../../../../../ActionButton";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../../../Overlay";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./CustomActionsModal.module.css";

type CustomActionsModalProps = {
  actions: readonly CharacterCustomAction[];
  isEditorOpen: boolean;
  onAdd: () => void;
  onEdit: (action: CharacterCustomAction) => void;
  onDelete: (actionId: string) => void;
  onClose: () => void;
};

function CustomActionsModal({
  actions,
  isEditorOpen,
  onAdd,
  onEdit,
  onDelete,
  onClose
}: CustomActionsModalProps) {
  const titleId = useId();

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      onEscape={isEditorOpen ? () => undefined : onClose}
      backdropClassName={styles.backdrop}
      size="small"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Gameplay</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id={titleId}>Custom Actions</OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close custom actions" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        {actions.length === 0 ? (
          <p className={shared.emptyText}>No custom actions yet.</p>
        ) : (
          <ul className={styles.actionList}>
            {actions.map((action) => (
              <li key={action.id} className={styles.actionRow}>
                <span className={styles.actionName}>{action.name}</span>
                <span className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => onEdit(action)}
                    aria-label={`Edit ${action.name}`}
                    title={`Edit ${action.name}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => onDelete(action.id)}
                    aria-label={`Delete ${action.name}`}
                    title={`Delete ${action.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <ActionButton className={styles.addButton} icon={<Plus size={18} />} onClick={onAdd}>
          Add Custom Action
        </ActionButton>
      </OverlayBody>
    </SheetModal>
  );
}

export default CustomActionsModal;
