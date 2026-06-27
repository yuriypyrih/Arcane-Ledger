import { useMemo, useState } from "react";
import {
  createCustomItem,
  updateCustomItem,
  type CustomItemRecord
} from "../../api/customItems";
import CustomEquipmentEditor, {
  type CustomEquipmentEditorSavePayload
} from "../../components/CharactersPage/CharacterSheetPage/CustomEquipmentEditor/CustomEquipmentEditor";
import {
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../components/Overlay";
import { createCharacterInventoryItemFromCustomSource } from "../CharactersPage/inventoryItems";
import { showToast, useAppDispatch, useAppSelector } from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import styles from "./DmToolsPage.module.css";

type CustomItemEditorModalProps = {
  customItem?: CustomItemRecord | null;
  onClose: () => void;
  onSaved: (customItem: CustomItemRecord) => void;
};

function canPublishCustomItems(role: string | null | undefined) {
  return role === "keeper" || role === "admin";
}

function CustomItemEditorModal({ customItem, onClose, onSaved }: CustomItemEditorModalProps) {
  const dispatch = useAppDispatch();
  const authUserRole = useAppSelector((state) => state.auth.user?.role ?? null);
  const canPublish = canPublishCustomItems(authUserRole);
  const isEditing = Boolean(customItem);
  const [isPublic, setIsPublic] = useState(() => Boolean(customItem?.public));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialStack = useMemo(
    () =>
      customItem
        ? createCharacterInventoryItemFromCustomSource(customItem, {
            id: `custom-item-editor-${customItem.id}`
          })
        : null,
    [customItem]
  );

  async function handleSave(payload: CustomEquipmentEditorSavePayload) {
    if (isSaving) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const input = {
        item: payload.item,
        mods: payload.mods,
        public: canPublish ? isPublic : false,
        settings: payload.settings
      };
      const { customItem: savedCustomItem } =
        isEditing && customItem
          ? await updateCustomItem(customItem.id, input, { suppressFailureToast: true })
          : await createCustomItem(input, { suppressFailureToast: true });

      dispatch(
        showToast({
          text: isEditing ? "Custom item updated." : "Custom item created.",
          type: "success"
        })
      );
      onSaved(savedCustomItem);
    } catch (saveError) {
      setError(getDmToolsApiErrorMessage(saveError, "Unable to save custom item."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SheetModal
      titleId="custom-item-editor-title"
      onClose={onClose}
      isBusy={isSaving}
      busyLabel="Saving custom item"
      size="medium"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id="custom-item-editor-title">
            {isEditing ? "Edit Custom Item" : "Create Custom Item"}
          </OverlayTitle>
          <OverlaySummary>
            Build an item with the same controls used by character inventory custom equipment.
          </OverlaySummary>
        </OverlayHeaderContent>
        <div className={styles.customObjectModalHeaderActions}>
          <label className={styles.customObjectPublicToggle}>
            <input
              type="checkbox"
              checked={canPublish && isPublic}
              disabled={isSaving || !canPublish}
              onChange={(event) => setIsPublic(event.target.checked)}
            />
            <span>Public</span>
          </label>
          <OverlayCloseButton
            label="Close custom item editor"
            disabled={isSaving}
            onClick={onClose}
          />
        </div>
      </OverlayHeader>

      <CustomEquipmentEditor
        mode={isEditing ? "edit" : "create"}
        externalError={error}
        initialStack={initialStack}
        isSaving={isSaving}
        onCancel={onClose}
        onSave={handleSave}
      />
    </SheetModal>
  );
}

export default CustomItemEditorModal;
