import { Save, X } from "lucide-react";
import ActionButton from "../../../ActionButton";
import type { AbilityKey } from "../../../../types";
import type { AbilitiesDraft } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import AbilityScoresEditorContent from "./AbilityScoresEditorContent";
import styles from "./AbilityScoresModal.module.css";

type AbilityScoresModalProps = {
  isOpen: boolean;
  draft: AbilitiesDraft;
  pointBuyRemaining: number | null;
  canSave: boolean;
  onClose: () => void;
  onSave: () => void;
  onSetAttributeMode: (attributeMode: AbilitiesDraft["attributeMode"]) => void;
  onUpdateAbilityScore: (ability: AbilityKey, value: string) => void;
};

function AbilityScoresModal({
  isOpen,
  draft,
  pointBuyRemaining,
  canSave,
  onClose,
  onSave,
  onSetAttributeMode,
  onUpdateAbilityScore
}: AbilityScoresModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <SheetModal
      titleId="ability-scores-modal-title"
      onClose={onClose}
      size="small"
      panelClassName={styles.abilityEditorModal}
    >
      <OverlayHeader>
        <OverlayHeaderContent className={styles.modalHeading}>
          <OverlayTitle id="ability-scores-modal-title">Edit Ability Modifiers</OverlayTitle>
          <OverlaySummary className={shared.helperText}>
            Update your base ability scores using Point Buy or Custom values.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close ability score editor" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.modalBody}>
        <AbilityScoresEditorContent
          attributeMode={draft.attributeMode}
          abilities={draft.abilities}
          pointBuyRemaining={pointBuyRemaining}
          onSetAttributeMode={onSetAttributeMode}
          onUpdateAbilityScore={onUpdateAbilityScore}
        />
      </OverlayBody>

      <OverlayFooter>
        <div className={styles.footerActions}>
          <ActionButton onClick={onSave} icon={<Save size={16} />} disabled={!canSave}>
            Save
          </ActionButton>
          <ActionButton variant="GHOST" onClick={onClose} icon={<X size={16} />}>
            Cancel
          </ActionButton>
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

export default AbilityScoresModal;
