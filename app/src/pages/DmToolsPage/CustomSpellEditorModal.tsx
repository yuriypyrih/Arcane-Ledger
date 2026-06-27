import { Plus, Save } from "lucide-react";
import { type FormEvent, useId, useMemo, useState } from "react";
import {
  createCustomSpell,
  updateCustomSpell,
  type CustomSpellRecord
} from "../../api/customSpells";
import ActionButton from "../../components/ActionButton";
import ModEffectsEditor from "../../components/CharactersPage/CharacterSheetPage/ModEffectsEditor";
import NumberInput from "../../components/CharactersPage/FormInputs/NumberInput";
import SelectInput from "../../components/CharactersPage/FormInputs/SelectInput";
import TextAreaInput from "../../components/CharactersPage/FormInputs/TextAreaInput";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../components/Overlay";
import {
  ACTION_TYPE,
  MAGIC_SCHOOL,
  SPELL_COMPONENT,
  SPELL_LIST_CLASS
} from "../../codex/entries/enums";
import { showToast, useAppDispatch, useAppSelector } from "../../store";
import { formatCodexLabel } from "../../utils/codex/formatCodexLabel";
import {
  createCustomTraitEffectDraft,
  isCustomTraitRollModeDisabledTarget,
  normalizeCustomTraitEffectDraftValueForTarget
} from "../../components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/TraitsConditionsWidget/customTraitDraft";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import {
  CUSTOM_SPELL_DESCRIPTION_MAX_LENGTH,
  CUSTOM_SPELL_EFFECT_LIMIT,
  CUSTOM_SPELL_MATERIAL_MAX_LENGTH,
  CUSTOM_SPELL_NAME_MAX_LENGTH,
  CUSTOM_SPELL_RANGE_MAX_LENGTH,
  createCustomSpellDraftFromRecord,
  createDefaultCustomSpellDraft,
  isCustomSpellDraftValid,
  isCustomSpellDurationInstantaneous,
  parseCustomSpellDraft,
  setCustomSpellDraftEffectRollMode,
  setCustomSpellDraftEffectTarget,
  setCustomSpellDraftEffectValue,
  setCustomSpellDraftEffectValueMode,
  type CustomSpellDraft,
  type CustomSpellDurationMode
} from "./customSpellDraft";
import styles from "./DmToolsPage.module.css";

type CustomSpellEditorModalProps = {
  customSpell?: CustomSpellRecord | null;
  onClose: () => void;
  onSaved: (customSpell: CustomSpellRecord) => void;
};

const durationOptions: Array<{ label: string; value: CustomSpellDurationMode }> = [
  { label: "Instantaneous", value: "instantaneous" },
  { label: "Rounds", value: "rounds" },
  { label: "Minutes", value: "minutes" },
  { label: "Hours", value: "hours" },
  { label: "Days", value: "days" },
  { label: "Concentration: Rounds", value: "concentration-rounds" },
  { label: "Concentration: Minutes", value: "concentration-minutes" },
  { label: "Concentration: Hours", value: "concentration-hours" },
  { label: "Concentration: Days", value: "concentration-days" },
  { label: "Infinite", value: "infinite" }
];

function toggleArrayValue<TValue extends string>(values: TValue[], value: TValue, checked: boolean) {
  if (checked) {
    return values.includes(value) ? values : [...values, value];
  }

  return values.filter((entry) => entry !== value);
}

function getValidationMessage(draft: CustomSpellDraft) {
  if (!draft.name.trim()) {
    return "Spell name is required.";
  }

  if (!draft.range.trim()) {
    return "Range is required.";
  }

  return "Complete the highlighted custom spell fields.";
}

function RequiredFieldLabel({ children }: { children: string }) {
  return (
    <span className={styles.modalFieldLabel}>
      {children}
      <span className={styles.requiredFieldMarker} aria-hidden="true">
        *
      </span>
    </span>
  );
}

function canPublishCustomSpells(role: string | null | undefined) {
  return role === "keeper" || role === "admin";
}

function CustomSpellEditorModal({ customSpell, onClose, onSaved }: CustomSpellEditorModalProps) {
  const titleId = useId();
  const dispatch = useAppDispatch();
  const authUserRole = useAppSelector((state) => state.auth.user?.role ?? null);
  const [draft, setDraft] = useState<CustomSpellDraft>(() =>
    customSpell ? createCustomSpellDraftFromRecord(customSpell) : createDefaultCustomSpellDraft()
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(customSpell);
  const isDurationInstantaneous = isCustomSpellDurationInstantaneous(draft);
  const canPublish = canPublishCustomSpells(authUserRole);
  const canSubmit = useMemo(() => isCustomSpellDraftValid(draft) && !isSaving, [draft, isSaving]);

  function updateDraft(updater: (current: CustomSpellDraft) => CustomSpellDraft) {
    setDraft((current) => {
      const nextDraft = updater(current);

      return isCustomSpellDurationInstantaneous(nextDraft)
        ? {
            ...nextDraft,
            effects: [createCustomTraitEffectDraft()]
          }
        : nextDraft;
    });
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = parseCustomSpellDraft(canPublish ? draft : { ...draft, public: false });

    if (!input || !canSubmit) {
      setError(getValidationMessage(draft));
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const { customSpell: savedCustomSpell } = isEditing
        ? await updateCustomSpell(customSpell?.id ?? "", input, { suppressFailureToast: true })
        : await createCustomSpell(input, { suppressFailureToast: true });

      dispatch(
        showToast({
          text: isEditing ? "Custom spell updated." : "Custom spell created.",
          type: "success"
        })
      );
      onSaved(savedCustomSpell);
    } catch (saveError) {
      setError(getDmToolsApiErrorMessage(saveError, "Unable to save custom spell."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      isBusy={isSaving}
      busyLabel="Saving custom spell"
      size="large"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>
            {isEditing ? "Edit Custom Spell" : "Create Custom Spell"}
          </OverlayTitle>
          <OverlaySummary>Define the spell entry characters can later bake into their sheets.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close custom spell editor"
          disabled={isSaving}
          onClick={onClose}
        />
      </OverlayHeader>

      <form onSubmit={handleSubmit}>
        <OverlayBody>
          <div className={styles.customSpellEditorGrid}>
            <label className={styles.modalField}>
              <RequiredFieldLabel>Name</RequiredFieldLabel>
              <TextInput
                autoFocus
                disabled={isSaving}
                maxLength={CUSTOM_SPELL_NAME_MAX_LENGTH}
                value={draft.name}
                onChange={(event) =>
                  updateDraft((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>

            <label className={styles.customSpellPublicToggle}>
              <input
                type="checkbox"
                checked={canPublish && draft.public}
                disabled={isSaving || !canPublish}
                onChange={(event) =>
                  updateDraft((current) => ({ ...current, public: event.target.checked }))
                }
              />
              <span>Public</span>
            </label>

            <label className={styles.modalField}>
              <span className={styles.modalFieldLabel}>Level</span>
              <SelectInput
                disabled={isSaving}
                value={draft.spellLevel}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    spellLevel: Number(event.target.value)
                  }))
                }
              >
                {Array.from({ length: 10 }, (_, level) => (
                  <option key={level} value={level}>
                    {level === 0 ? "Cantrip" : `Level ${level}`}
                  </option>
                ))}
              </SelectInput>
            </label>

            <label className={styles.modalField}>
              <span className={styles.modalFieldLabel}>School</span>
              <SelectInput
                disabled={isSaving}
                value={draft.magicSchool}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    magicSchool: event.target.value as MAGIC_SCHOOL
                  }))
                }
              >
                {Object.values(MAGIC_SCHOOL).map((school) => (
                  <option key={school} value={school}>
                    {formatCodexLabel(school)}
                  </option>
                ))}
              </SelectInput>
            </label>

            <label className={styles.modalField}>
              <span className={styles.modalFieldLabel}>Casting Time</span>
              <SelectInput
                disabled={isSaving}
                value={draft.castingTime}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    castingTime: event.target.value as ACTION_TYPE
                  }))
                }
              >
                {Object.values(ACTION_TYPE).map((castingTime) => (
                  <option key={castingTime} value={castingTime}>
                    {formatCodexLabel(castingTime)}
                  </option>
                ))}
              </SelectInput>
            </label>

            <label className={styles.modalField}>
              <RequiredFieldLabel>Range</RequiredFieldLabel>
              <TextInput
                disabled={isSaving}
                maxLength={CUSTOM_SPELL_RANGE_MAX_LENGTH}
                value={draft.range}
                onChange={(event) =>
                  updateDraft((current) => ({ ...current, range: event.target.value }))
                }
              />
            </label>

            <label className={styles.modalField}>
              <span className={styles.modalFieldLabel}>Duration</span>
              <SelectInput
                disabled={isSaving}
                value={draft.durationMode}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    durationMode: event.target.value as CustomSpellDurationMode
                  }))
                }
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>

            {!isDurationInstantaneous && draft.durationMode !== "infinite" ? (
              <label className={styles.modalField}>
                <RequiredFieldLabel>Duration Value</RequiredFieldLabel>
                <NumberInput
                  disabled={isSaving}
                  min={1}
                  max={999}
                  value={draft.durationValue}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      durationValue: Number(event.target.value)
                    }))
                  }
                />
              </label>
            ) : null}

          </div>

          <section className={styles.customSpellEditorSection}>
            <span className={styles.modalFieldLabel}>Components</span>
            <div className={styles.checkboxGrid}>
              {Object.values(SPELL_COMPONENT).map((component) => (
                <label key={component} className={styles.checkboxPill}>
                  <input
                    type="checkbox"
                    checked={draft.components.includes(component)}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateDraft((current) => ({
                        ...current,
                        components: toggleArrayValue(
                          current.components,
                          component,
                          event.target.checked
                        )
                      }))
                    }
                  />
                  <span>{component}</span>
                </label>
              ))}
            </div>

            {draft.components.includes(SPELL_COMPONENT.M) ? (
              <label className={styles.modalField}>
                <span className={styles.modalFieldLabel}>Material Text</span>
                <TextInput
                  disabled={isSaving}
                  maxLength={CUSTOM_SPELL_MATERIAL_MAX_LENGTH}
                  value={draft.materialSpecified}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      materialSpecified: event.target.value
                    }))
                  }
                />
              </label>
            ) : null}
          </section>

          <section className={styles.customSpellEditorSection}>
            <span className={styles.modalFieldLabel}>Spell Lists</span>
            <div className={styles.checkboxGrid}>
              {Object.values(SPELL_LIST_CLASS).map((spellList) => (
                <label key={spellList} className={styles.checkboxPill}>
                  <input
                    type="checkbox"
                    checked={draft.spellLists.includes(spellList)}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateDraft((current) => ({
                        ...current,
                        spellLists: toggleArrayValue(
                          current.spellLists,
                          spellList,
                          event.target.checked
                        )
                      }))
                    }
                  />
                  <span>{formatCodexLabel(spellList)}</span>
                </label>
              ))}
            </div>
          </section>

          <section className={styles.customSpellEditorSection}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={draft.ritual}
                disabled={isSaving}
                onChange={(event) =>
                  updateDraft((current) => ({ ...current, ritual: event.target.checked }))
                }
              />
              <span>Ritual</span>
            </label>
          </section>

          <label className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Description</span>
            <TextAreaInput
              disabled={isSaving}
              maxLength={CUSTOM_SPELL_DESCRIPTION_MAX_LENGTH}
              rows={7}
              value={draft.description}
              onChange={(event) =>
                updateDraft((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>

          {!isDurationInstantaneous ? (
            <section className={styles.customSpellEditorSection}>
              <ModEffectsEditor
                effects={draft.effects}
                maxEffects={CUSTOM_SPELL_EFFECT_LIMIT}
                onAddEffect={() =>
                  updateDraft((current) => ({
                    ...current,
                    effects:
                      current.effects.length >= CUSTOM_SPELL_EFFECT_LIMIT
                        ? current.effects
                        : [...current.effects, createCustomTraitEffectDraft()]
                  }))
                }
                onEffectTargetChange={(effectId, value) =>
                  updateDraft((current) =>
                    setCustomSpellDraftEffectTarget(
                      current,
                      effectId,
                      value,
                      normalizeCustomTraitEffectDraftValueForTarget,
                      isCustomTraitRollModeDisabledTarget
                    )
                  )
                }
                onEffectValueChange={(effectId, value) =>
                  updateDraft((current) => setCustomSpellDraftEffectValue(current, effectId, value))
                }
                onEffectValueModeChange={(effectId, value) =>
                  updateDraft((current) =>
                    setCustomSpellDraftEffectValueMode(current, effectId, value)
                  )
                }
                onEffectRollModeChange={(effectId, value) =>
                  updateDraft((current) =>
                    setCustomSpellDraftEffectRollMode(current, effectId, value)
                  )
                }
                onRemoveEffect={(effectId) =>
                  updateDraft((current) => ({
                    ...current,
                    effects:
                      current.effects.length === 1
                        ? [createCustomTraitEffectDraft()]
                        : current.effects.filter((effect) => effect.id !== effectId)
                  }))
                }
              />
            </section>
          ) : null}

          {error ? <p className={styles.modalError}>{error}</p> : null}
        </OverlayBody>

        <OverlayFooter>
          <div className={styles.modalFooterActions}>
            <ActionButton
              type="submit"
              icon={isEditing ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
              disabled={!canSubmit}
              loading={isSaving}
              loadingLabel="Saving custom spell"
              fullWidth
            >
              {isEditing ? "Save Custom Spell" : "Create Custom Spell"}
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default CustomSpellEditorModal;
