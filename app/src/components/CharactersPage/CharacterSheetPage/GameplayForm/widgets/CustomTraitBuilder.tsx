import { Plus } from "lucide-react";
import TextInput from "../../../FormInputs/TextInput";
import TextAreaInput from "../../../FormInputs/TextAreaInput";
import SelectInput from "../../../FormInputs/SelectInput";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import {
  durationPresetOptions,
  isRoundDurationPreset,
  statusRoundTickOptions
} from "../../../../../pages/CharactersPage/traits";
import {
  STATUS_DURATION_PRESET,
  STATUS_DURATION_ROUND_TICK
} from "../../../../../types";
import CustomTraitEffectEditorRow from "./CustomTraitEffectEditorRow";
import {
  customTraitTargetOptions,
  type CustomTraitDraft
} from "./customTraitDraft";
import styles from "./CustomTraitBuilder.module.css";

type CustomTraitBuilderProps = {
  draft: CustomTraitDraft;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDurationPresetChange: (preset: STATUS_DURATION_PRESET) => void;
  onRoundTickOnChange: (tickOn: STATUS_DURATION_ROUND_TICK) => void;
  onEffectTargetChange: (effectId: string, value: string) => void;
  onEffectValueChange: (effectId: string, value: string) => void;
  onAddEffect: () => void;
  onRemoveEffect: (effectId: string) => void;
};

function CustomTraitBuilder({
  draft,
  onNameChange,
  onDescriptionChange,
  onDurationPresetChange,
  onRoundTickOnChange,
  onEffectTargetChange,
  onEffectValueChange,
  onAddEffect,
  onRemoveEffect
}: CustomTraitBuilderProps) {
  const showRoundTickSelector = isRoundDurationPreset(draft.durationPreset);

  return (
    <div className={styles.stack}>
      <div className={shared.formGrid}>
        <label className={shared.field}>
          <span className={shared.fieldLabel}>Name</span>
          <TextInput value={draft.name} onChange={(event) => onNameChange(event.target.value)} />
        </label>

        <label className={shared.field}>
          <span className={shared.fieldLabel}>Duration</span>
          <SelectInput
            value={draft.durationPreset}
            onChange={(event) =>
              onDurationPresetChange(event.target.value as STATUS_DURATION_PRESET)
            }
          >
            {durationPresetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </label>

        <label className={shared.fieldWide}>
          <span className={shared.fieldLabel}>Description</span>
          <TextAreaInput
            rows={4}
            value={draft.description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </label>

        {showRoundTickSelector ? (
          <label className={shared.field}>
            <span className={shared.fieldLabel}>Round Tick</span>
            <SelectInput
              value={draft.roundTickOn}
              onChange={(event) =>
                onRoundTickOnChange(event.target.value as STATUS_DURATION_ROUND_TICK)
              }
            >
              {statusRoundTickOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </label>
        ) : null}
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
          {draft.effects.map((effect, index) => (
            <div key={effect.id} className={styles.effectCard}>
              <p className={styles.effectIndex}>{`Effect ${index + 1}`}</p>
              <CustomTraitEffectEditorRow
                effect={effect}
                targetOptions={customTraitTargetOptions}
                canRemove={draft.effects.length > 1}
                onTargetChange={(value) => onEffectTargetChange(effect.id, value)}
                onValueChange={(value) => onEffectValueChange(effect.id, value)}
                onRemove={() => onRemoveEffect(effect.id)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CustomTraitBuilder;
