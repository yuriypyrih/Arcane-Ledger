import { Plus } from "lucide-react";
import TextInput from "../../../../FormInputs/TextInput";
import TextAreaInput from "../../../../FormInputs/TextAreaInput";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import CustomTraitEffectEditorRow from "./CustomTraitEffectEditorRow";
import ManualStatusDurationFields from "./ManualStatusDurationFields";
import {
  customTraitTargetOptions,
  isCustomTraitEffectDraftEmpty,
  type CustomTraitDraft
} from "./customTraitDraft";
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
  onAddEffect,
  onRemoveEffect
}: CustomTraitBuilderProps) {
  return (
    <div className={styles.stack}>
      <div className={shared.formGrid}>
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
            rows={4}
            value={draft.description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </label>
      </div>

      <section className={styles.effectsSection}>
        <div className={styles.effectsHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Effects</p>
            <h4 className={styles.sectionTitle}>Bonus Targets</h4>
          </div>

          <button type="button" className={styles.addEffectButton} onClick={onAddEffect}>
            <Plus size={16} aria-hidden="true" />
            <span>Effect</span>
          </button>
        </div>

        <div className={styles.effectsList}>
          {draft.effects.map((effect, index) => {
            const isOnlyEffect = draft.effects.length === 1;
            const isRemoveDisabled = isOnlyEffect && isCustomTraitEffectDraftEmpty(effect);

            return (
              <div key={effect.id} className={styles.effectCard}>
                <p className={styles.effectIndex}>{`Effect ${index + 1}`}</p>
                <CustomTraitEffectEditorRow
                  effect={effect}
                  targetOptions={customTraitTargetOptions}
                  removeDisabled={isRemoveDisabled}
                  removeLabel={isOnlyEffect ? "Clear effect" : "Remove effect"}
                  onTargetChange={(value) => onEffectTargetChange(effect.id, value)}
                  onValueChange={(value) => onEffectValueChange(effect.id, value)}
                  onRemove={() => onRemoveEffect(effect.id)}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default CustomTraitBuilder;
