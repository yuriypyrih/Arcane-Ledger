import clsx from "clsx";
import { Check, Plus } from "lucide-react";
import ActionButton from "../../../../../ActionButton";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../../../Overlay";
import CustomTraitBuilder from "./CustomTraitBuilder";
import type { CustomTraitDraft } from "./customTraitDraft";
import type { ManualStatusDurationType } from "./manualStatusDuration";
import styles from "./TraitEditorModal.module.css";

type CustomTraitEditorModalProps = {
  isEditingCustomTrait: boolean;
  customTraitDraft: CustomTraitDraft;
  createDisabled: boolean;
  onCustomTraitNameChange: (value: string) => void;
  onCustomTraitDescriptionChange: (value: string) => void;
  onCustomTraitDurationTypeChange: (value: ManualStatusDurationType) => void;
  onCustomTraitDurationValueChange: (value: number) => void;
  onCustomTraitEffectTargetChange: (effectId: string, value: string) => void;
  onCustomTraitEffectValueChange: (effectId: string, value: string) => void;
  onAddCustomTraitEffect: () => void;
  onRemoveCustomTraitEffect: (effectId: string) => void;
  onCreate: () => void;
  onClose: () => void;
};

function CustomTraitEditorModal({
  isEditingCustomTrait,
  customTraitDraft,
  createDisabled,
  onCustomTraitNameChange,
  onCustomTraitDescriptionChange,
  onCustomTraitDurationTypeChange,
  onCustomTraitDurationValueChange,
  onCustomTraitEffectTargetChange,
  onCustomTraitEffectValueChange,
  onAddCustomTraitEffect,
  onRemoveCustomTraitEffect,
  onCreate,
  onClose
}: CustomTraitEditorModalProps) {
  return (
    <SheetModal
      titleId="custom-trait-modal-title"
      onClose={onClose}
      size="medium"
      panelClassName={styles.modalPanelExpanded}
    >
      <OverlayHeader className={styles.header}>
        <OverlayHeaderContent className={styles.headerContent}>
          <OverlayTitleRow className={styles.titleRow}>
            <OverlayTitle id="custom-trait-modal-title">Custom Feature Trait</OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close custom feature trait editor" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={clsx(styles.body, styles.bodyExpanded)}>
        <CustomTraitBuilder
          draft={customTraitDraft}
          onNameChange={onCustomTraitNameChange}
          onDescriptionChange={onCustomTraitDescriptionChange}
          onDurationTypeChange={onCustomTraitDurationTypeChange}
          onDurationValueChange={onCustomTraitDurationValueChange}
          onEffectTargetChange={onCustomTraitEffectTargetChange}
          onEffectValueChange={onCustomTraitEffectValueChange}
          onAddEffect={onAddCustomTraitEffect}
          onRemoveEffect={onRemoveCustomTraitEffect}
        />
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <ActionButton
          className={styles.createButton}
          onClick={onCreate}
          disabled={createDisabled}
          icon={
            isEditingCustomTrait ? (
              <Check size={18} aria-hidden="true" />
            ) : (
              <Plus size={18} aria-hidden="true" />
            )
          }
        >
          {isEditingCustomTrait ? "Save Trait" : "Create"}
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default CustomTraitEditorModal;
