import { useState } from "react";
import {
  createCustomBestiary,
  updateCustomBestiary,
  type CustomBestiaryRecord
} from "../../api/customBestiary";
import CreatureStatBlockEditorModal from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/CreatureStatBlockEditorModal";
import { showToast, useAppDispatch, useAppSelector } from "../../store";
import type { MonsterRecord } from "../../types";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";

type CustomBestiaryEditorModalProps = {
  customCreature?: CustomBestiaryRecord | null;
  onClose: () => void;
  onSaved: (customCreature: CustomBestiaryRecord) => void;
};

function canPublishCustomBestiary(role: string | null | undefined) {
  return role === "keeper" || role === "admin";
}

function CustomBestiaryEditorModal({
  customCreature,
  onClose,
  onSaved
}: CustomBestiaryEditorModalProps) {
  const dispatch = useAppDispatch();
  const authUserRole = useAppSelector((state) => state.auth.user?.role ?? null);
  const canPublish = canPublishCustomBestiary(authUserRole);
  const isEditing = Boolean(customCreature);
  const [isPublic, setIsPublic] = useState(() => Boolean(customCreature?.public));
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(monster: MonsterRecord) {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const input = {
        monster,
        public: canPublish ? isPublic : false
      };
      const { customCreature: savedCustomCreature } =
        isEditing && customCreature
          ? await updateCustomBestiary(customCreature.id, input, { suppressFailureToast: true })
          : await createCustomBestiary(input, { suppressFailureToast: true });

      dispatch(
        showToast({
          text: isEditing ? "Custom creature updated." : "Custom creature created.",
          type: "success"
        })
      );
      onSaved(savedCustomCreature);
    } catch (saveError) {
      dispatch(
        showToast({
          text: getDmToolsApiErrorMessage(saveError, "Unable to save custom creature."),
          type: "error"
        })
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <CreatureStatBlockEditorModal
      monster={customCreature?.monster ?? null}
      publicToggle={{
        checked: canPublish && isPublic,
        disabled: !canPublish || isSaving,
        onChange: setIsPublic
      }}
      saveLabel={isSaving ? "Saving..." : isEditing ? "Save creature" : "Create creature"}
      summary="Build a custom creature stat block from scratch."
      title={isEditing ? "Edit Custom Creature" : "Create Custom Creature"}
      onClose={onClose}
      onSave={(monster) => {
        void handleSave(monster);
      }}
    />
  );
}

export default CustomBestiaryEditorModal;
