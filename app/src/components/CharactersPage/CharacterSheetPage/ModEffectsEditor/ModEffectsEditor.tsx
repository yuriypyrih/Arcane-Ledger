import { Plus } from "lucide-react";
import type { CharacterCustomTraitRollMode, CharacterCustomTraitValueMode } from "../../../../types";
import CustomTraitEffectEditorRow, {
  CustomTraitEffectRollModeToggle,
  CustomTraitEffectValueModeToggle
} from "../GameplayForm/widgets/TraitsConditionsWidget/CustomTraitEffectEditorRow";
import SheetActionButton from "../SheetActionButton";
import {
  customTraitTargetOptions,
  isCustomTraitEffectDraftEmpty,
  type CustomTraitEffectDraft
} from "../GameplayForm/widgets/TraitsConditionsWidget/customTraitDraft";
import styles from "../GameplayForm/widgets/TraitsConditionsWidget/CustomTraitBuilder.module.css";

type ModEffectsEditorProps = {
  effects: CustomTraitEffectDraft[];
  maxEffects?: number;
  onAddEffect: () => void;
  onEffectTargetChange: (effectId: string, value: string) => void;
  onEffectValueChange: (effectId: string, value: string) => void;
  onEffectValueModeChange: (effectId: string, value: CharacterCustomTraitValueMode) => void;
  onEffectRollModeChange: (effectId: string, value: CharacterCustomTraitRollMode) => void;
  onRemoveEffect: (effectId: string) => void;
};

function ModEffectsEditor({
  effects,
  maxEffects = Number.POSITIVE_INFINITY,
  onAddEffect,
  onEffectTargetChange,
  onEffectValueChange,
  onEffectValueModeChange,
  onEffectRollModeChange,
  onRemoveEffect
}: ModEffectsEditorProps) {
  const isAtEffectLimit = effects.length >= maxEffects;

  return (
    <section className={styles.effectsSection}>
      <div className={styles.effectsHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Effects</p>
          <h4 className={styles.sectionTitle}>Bonus Targets</h4>
        </div>

        <SheetActionButton
          className={styles.addEffectButton}
          disabled={isAtEffectLimit}
          onClick={onAddEffect}
          title={isAtEffectLimit ? `Maximum ${maxEffects} effects per item.` : undefined}
        >
          <Plus size={16} aria-hidden="true" />
          <span>{isAtEffectLimit ? `${maxEffects} max` : "Effect"}</span>
        </SheetActionButton>
      </div>

      <div className={styles.effectsList}>
        {effects.map((effect, index) => {
          const isOnlyEffect = effects.length === 1;
          const isRemoveDisabled = isOnlyEffect && isCustomTraitEffectDraftEmpty(effect);

          return (
            <div key={effect.id} className={styles.effectCard}>
              <div className={styles.effectCardHeader}>
                <p className={styles.effectIndex}>{`Effect ${index + 1}`}</p>
                <div className={styles.effectModeControls}>
                  <CustomTraitEffectValueModeToggle
                    effect={effect}
                    onValueModeChange={(value) => onEffectValueModeChange(effect.id, value)}
                  />
                  <CustomTraitEffectRollModeToggle
                    effect={effect}
                    onRollModeChange={(value) => onEffectRollModeChange(effect.id, value)}
                  />
                </div>
              </div>
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
  );
}

export default ModEffectsEditor;
