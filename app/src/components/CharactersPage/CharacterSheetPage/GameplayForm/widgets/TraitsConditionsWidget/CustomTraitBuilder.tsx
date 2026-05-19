import clsx from "clsx";
import TextInput from "../../../../FormInputs/TextInput";
import TextAreaInput from "../../../../FormInputs/TextAreaInput";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import ModEffectsEditor from "../../../ModEffectsEditor";
import type {
  CharacterCustomTraitRollMode,
  CharacterCustomTraitValueMode
} from "../../../../../../types";
import ManualStatusDurationFields from "./ManualStatusDurationFields";
import { type CustomTraitDraft } from "./customTraitDraft";
import type { ManualStatusDurationType } from "./manualStatusDuration";
import styles from "./CustomTraitBuilder.module.css";

type CustomTraitBuilderProps = {
  draft: CustomTraitDraft;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDurationTypeChange: (value: ManualStatusDurationType) => void;
  onDurationValueChange: (value: number) => void;
  onEffectTargetChange: (effectId: string, value: string) => void;
  onEffectValueChange: (effectId: string, value: string) => void;
  onEffectValueModeChange: (effectId: string, value: CharacterCustomTraitValueMode) => void;
  onEffectRollModeChange: (effectId: string, value: CharacterCustomTraitRollMode) => void;
  onAddEffect: () => void;
  onRemoveEffect: (effectId: string) => void;
};

function CustomTraitBuilder({
  draft,
  onNameChange,
  onDescriptionChange,
  onDurationTypeChange,
  onDurationValueChange,
  onEffectTargetChange,
  onEffectValueChange,
  onEffectValueModeChange,
  onEffectRollModeChange,
  onAddEffect,
  onRemoveEffect
}: CustomTraitBuilderProps) {
  return (
    <div className={styles.stack}>
      <div className={clsx(shared.formGrid, styles.compactFormGrid)}>
        <label className={shared.field}>
          <span className={shared.fieldLabel}>Name</span>
          <TextInput value={draft.name} onChange={(event) => onNameChange(event.target.value)} />
        </label>

        <ManualStatusDurationFields
          durationType={draft.durationType}
          durationValue={draft.durationValue}
          onDurationTypeChange={onDurationTypeChange}
          onDurationValueChange={onDurationValueChange}
        />

        <label className={shared.fieldWide}>
          <span className={shared.fieldLabel}>Description</span>
          <TextAreaInput
            rows={3}
            value={draft.description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </label>
      </div>

      <ModEffectsEditor
        effects={draft.effects}
        onAddEffect={onAddEffect}
        onEffectTargetChange={onEffectTargetChange}
        onEffectValueChange={onEffectValueChange}
        onEffectValueModeChange={onEffectValueModeChange}
        onEffectRollModeChange={onEffectRollModeChange}
        onRemoveEffect={onRemoveEffect}
      />
    </div>
  );
}

export default CustomTraitBuilder;
