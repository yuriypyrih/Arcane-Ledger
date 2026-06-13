import clsx from "clsx";
import { Check, Plus } from "lucide-react";
import ActionButton from "../../../../../ActionButton";
import NumberInput from "../../../../FormInputs/NumberInput";
import SelectInput from "../../../../FormInputs/SelectInput";
import TextAreaInput from "../../../../FormInputs/TextAreaInput";
import TextInput from "../../../../FormInputs/TextInput";
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
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import ModEffectsEditor from "../../../ModEffectsEditor";
import type {
  CharacterCustomActionEconomy,
  CharacterCustomTraitRollMode,
  CharacterCustomTraitValueMode
} from "../../../../../../types";
import {
  CUSTOM_ACTION_CHARGES_MAX,
  CUSTOM_ACTION_DESCRIPTION_MAX_LENGTH,
  CUSTOM_ACTION_NAME_MAX_LENGTH
} from "../../../../../../pages/CharactersPage/customActions";
import ManualStatusDurationFields from "../TraitsConditionsWidget/ManualStatusDurationFields";
import { getCustomActionDraftChargesMax, type CustomActionDraft } from "./customActionDraft";
import type { ManualStatusDurationType } from "../TraitsConditionsWidget/manualStatusDuration";
import styles from "./CustomActionsModal.module.css";

const customActionEconomyOptions: Array<{
  value: CharacterCustomActionEconomy;
  label: string;
}> = [
  { value: "action", label: "Action" },
  { value: "bonus_action", label: "Bonus Action" },
  { value: "reaction", label: "Reaction" },
  { value: "long_action", label: "Long Action" },
  { value: "non_action", label: "Non Action" }
];

type CustomActionEditorModalProps = {
  draft: CustomActionDraft;
  isEditing: boolean;
  createDisabled: boolean;
  proficiencyBonus: number;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onEconomyChange: (value: CharacterCustomActionEconomy) => void;
  onHasEffectsChange: (value: boolean) => void;
  onDurationTypeChange: (value: ManualStatusDurationType) => void;
  onDurationValueChange: (value: number) => void;
  onEffectTargetChange: (effectId: string, value: string) => void;
  onEffectValueChange: (effectId: string, value: string) => void;
  onEffectValueModeChange: (effectId: string, value: CharacterCustomTraitValueMode) => void;
  onEffectRollModeChange: (effectId: string, value: CharacterCustomTraitRollMode) => void;
  onAddEffect: () => void;
  onRemoveEffect: (effectId: string) => void;
  onHasChargesChange: (value: boolean) => void;
  onChargesCurrentChange: (value: number) => void;
  onChargesMaxModeChange: (value: boolean) => void;
  onChargesMaxChange: (value: number) => void;
  onShortRestRecoveryChange: (value: number) => void;
  onLongRestRecoveryChange: (value: number) => void;
  onCreate: () => void;
  onClose: () => void;
};

function CustomActionEditorModal({
  draft,
  isEditing,
  createDisabled,
  proficiencyBonus,
  onNameChange,
  onDescriptionChange,
  onEconomyChange,
  onHasEffectsChange,
  onDurationTypeChange,
  onDurationValueChange,
  onEffectTargetChange,
  onEffectValueChange,
  onEffectValueModeChange,
  onEffectRollModeChange,
  onAddEffect,
  onRemoveEffect,
  onHasChargesChange,
  onChargesCurrentChange,
  onChargesMaxModeChange,
  onChargesMaxChange,
  onShortRestRecoveryChange,
  onLongRestRecoveryChange,
  onCreate,
  onClose
}: CustomActionEditorModalProps) {
  const isProficiencyBonusMax = draft.chargesMaxMode === "proficiency_bonus";
  const chargeInputMax = getCustomActionDraftChargesMax(draft, proficiencyBonus);

  return (
    <SheetModal
      titleId="custom-action-editor-title"
      onClose={onClose}
      size="medium"
      panelClassName={styles.editorPanel}
      backdropClassName={styles.editorBackdrop}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitleRow>
            <OverlayTitle id="custom-action-editor-title">
              {isEditing ? "Edit Custom Action" : "Add Custom Action"}
            </OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close custom action editor" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.editorBody}>
        <div className={clsx(shared.formGrid, styles.editorGrid)}>
          <label className={shared.field}>
            <span className={shared.fieldLabel}>Name</span>
            <TextInput
              value={draft.name}
              maxLength={CUSTOM_ACTION_NAME_MAX_LENGTH}
              onChange={(event) => onNameChange(event.target.value)}
            />
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Economy</span>
            <SelectInput
              value={draft.economy}
              onChange={(event) =>
                onEconomyChange(event.target.value as CharacterCustomActionEconomy)
              }
            >
              {customActionEconomyOptions.map((option) => (
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
              maxLength={CUSTOM_ACTION_DESCRIPTION_MAX_LENGTH}
              onChange={(event) => onDescriptionChange(event.target.value)}
            />
          </label>
        </div>

        <section className={styles.editorSection}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={draft.hasEffects}
              onChange={(event) => onHasEffectsChange(event.target.checked)}
            />
            <span>Targets/Effects upon Use</span>
          </label>

          {draft.hasEffects ? (
            <div className={styles.sectionStack}>
              <div className={clsx(shared.formGrid, styles.durationGrid)}>
                <ManualStatusDurationFields
                  durationType={draft.durationType}
                  durationValue={draft.durationValue}
                  onDurationTypeChange={onDurationTypeChange}
                  onDurationValueChange={onDurationValueChange}
                />
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
          ) : null}
        </section>

        <section className={styles.editorSection}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={draft.hasCharges}
              onChange={(event) => onHasChargesChange(event.target.checked)}
            />
            <span>Charges</span>
          </label>

          {draft.hasCharges ? (
            <>
              <div className={clsx(shared.formGrid, styles.chargeGrid)}>
                <label className={shared.field}>
                  <span className={shared.fieldLabel}>Current</span>
                  <NumberInput
                    min={0}
                    max={chargeInputMax}
                    value={draft.chargesCurrent}
                    onChange={(event) => onChargesCurrentChange(Number(event.target.value))}
                  />
                </label>

                <div className={shared.field}>
                  <span className={styles.maxFieldHeader}>
                    <span className={shared.fieldLabel}>MAX (10)</span>
                    <label className={styles.inlineCheckbox}>
                      <input
                        type="checkbox"
                        checked={isProficiencyBonusMax}
                        onChange={(event) => onChargesMaxModeChange(event.target.checked)}
                      />
                      <span>Prof. Bonus</span>
                    </label>
                  </span>
                  {isProficiencyBonusMax ? (
                    <TextInput value="Equal to Prof. Bonus" readOnly disabled />
                  ) : (
                    <NumberInput
                      min={1}
                      max={CUSTOM_ACTION_CHARGES_MAX}
                      value={draft.chargesMax}
                      onChange={(event) => onChargesMaxChange(Number(event.target.value))}
                    />
                  )}
                </div>

                <label className={shared.field}>
                  <span className={shared.fieldLabel}>Short Rest</span>
                  <NumberInput
                    min={0}
                    max={chargeInputMax}
                    value={draft.shortRestRecovery}
                    onChange={(event) => onShortRestRecoveryChange(Number(event.target.value))}
                  />
                </label>

                <label className={shared.field}>
                  <span className={shared.fieldLabel}>Long Rest</span>
                  <NumberInput
                    min={0}
                    max={chargeInputMax}
                    value={draft.longRestRecovery}
                    onChange={(event) => onLongRestRecoveryChange(Number(event.target.value))}
                  />
                </label>
              </div>
              <p className={styles.chargeHint}>
                It is okay to type 10 (or more) if you do not know the max charges. The value will
                be corrected on save.
              </p>
            </>
          ) : null}
        </section>
      </OverlayBody>

      <OverlayFooter className={styles.editorFooter}>
        <ActionButton
          className={styles.saveButton}
          disabled={createDisabled}
          onClick={onCreate}
          icon={
            isEditing ? (
              <Check size={18} aria-hidden="true" />
            ) : (
              <Plus size={18} aria-hidden="true" />
            )
          }
        >
          {isEditing ? "Save Action" : "Create Action"}
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default CustomActionEditorModal;
