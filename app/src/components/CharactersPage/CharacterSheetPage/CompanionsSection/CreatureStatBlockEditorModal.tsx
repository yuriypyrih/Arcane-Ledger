import { Copy, Plus, Trash2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { MONSTER_TYPE_OPTIONS } from "../../../../constants/monsters";
import ActionButton from "../../../ActionButton";
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
import SelectInput from "../../FormInputs/SelectInput";
import TextAreaInput from "../../FormInputs/TextAreaInput";
import TextInput from "../../FormInputs/TextInput";
import type { MonsterAbilityKey, MonsterRecord } from "../../../../types";
import {
  createDraftFromMonster,
  createDraftRowId,
  createEmptyActionRow,
  createEmptyMonsterRecord,
  createEmptyTraitRow,
  monsterAbilityFieldLabels,
  monsterActionTypeOptions,
  monsterAlignmentOptions,
  monsterSizeOptions,
  validateAndCreateMonster,
  type ActionRow,
  type StatBlockDraft,
  type StatBlockReferenceOption,
  type StatBlockValidation,
  type TraitRow
} from "./CreatureStatBlockEditorModel";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./CompanionsSection.module.css";

type PublicToggleConfig = {
  checked: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onChange: (checked: boolean) => void;
};

type CreatureStatBlockEditorModalProps = {
  monster?: MonsterRecord | null;
  onClose: () => void;
  onSave: (monster: MonsterRecord) => void;
  publicToggle?: PublicToggleConfig;
  saveLabel?: string;
  summary?: string;
  title?: string;
};

const abilityEntries = Object.entries(monsterAbilityFieldLabels) as [MonsterAbilityKey, string][];

function toReferenceKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const baseMonsterTypeOptions: StatBlockReferenceOption[] = MONSTER_TYPE_OPTIONS.map((typeName) => ({
  key: toReferenceKey(typeName),
  name: typeName
}));

function getReferenceName(reference: MonsterRecord["size"] | MonsterRecord["type"]) {
  return typeof reference?.name === "string"
    ? reference.name
    : typeof reference?.display_name === "string"
      ? reference.display_name
      : "";
}

function appendExtraReferenceOption(
  options: StatBlockReferenceOption[],
  key: string,
  name: string
) {
  if (!key || options.some((option) => option.key === key)) {
    return options;
  }

  return [...options, { key, name: name || key }];
}

function RequiredFieldLabel({ children }: { children: string }) {
  return (
    <>
      {children}
      <span className={styles.statBlockRequiredMarker} aria-hidden="true">
        *
      </span>
    </>
  );
}

function CreatureStatBlockEditorModal({
  monster,
  onClose,
  onSave,
  publicToggle,
  saveLabel = "Save stat block",
  summary = "Edit creature stat block at your own discretion.",
  title = "Modify stat block"
}: CreatureStatBlockEditorModalProps) {
  const titleId = useId();
  const baseMonster = useMemo(() => monster ?? createEmptyMonsterRecord(), [monster]);
  const [draft, setDraft] = useState<StatBlockDraft>(() => createDraftFromMonster(baseMonster));
  const [validation, setValidation] = useState<StatBlockValidation>(() => ({
    invalidFields: new Set<string>(),
    message: null
  }));
  const sizeOptions = useMemo(
    () =>
      appendExtraReferenceOption(
        monsterSizeOptions,
        draft.sizeKey,
        getReferenceName(baseMonster.size)
      ),
    [baseMonster.size, draft.sizeKey]
  );
  const typeOptions = useMemo(
    () =>
      appendExtraReferenceOption(
        baseMonsterTypeOptions,
        draft.typeKey,
        getReferenceName(baseMonster.type)
      ),
    [baseMonster.type, draft.typeKey]
  );
  const alignmentOptions = useMemo(() => {
    const knownAlignments = new Set<string>(monsterAlignmentOptions.map((value) => value));

    return draft.alignment && !knownAlignments.has(draft.alignment)
      ? [...monsterAlignmentOptions, draft.alignment]
      : monsterAlignmentOptions;
  }, [draft.alignment]);
  const actionTypeOptions = useMemo(() => {
    const knownValues = new Set<string>(monsterActionTypeOptions.map(([value]) => value));
    const customValues = draft.actions
      .map((row) => row.actionType)
      .filter((value) => value && !knownValues.has(value));

    return [
      ...monsterActionTypeOptions,
      ...Array.from(new Set(customValues)).map((value) => [value, value] as const)
    ];
  }, [draft.actions]);

  function clearValidation() {
    setValidation({ invalidFields: new Set<string>(), message: null });
  }

  function updateDraft<Key extends keyof StatBlockDraft>(key: Key, value: StatBlockDraft[Key]) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value
    }));
    clearValidation();
  }

  function updateAbilityField(
    group: "abilityScores" | "savingThrows",
    ability: MonsterAbilityKey,
    value: string
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [group]: {
        ...currentDraft[group],
        [ability]: value
      }
    }));
    clearValidation();
  }

  function updateTraitRow(rowId: string, field: keyof Omit<TraitRow, "id">, value: string) {
    updateDraft(
      "traits",
      draft.traits.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  }

  function addTraitRow() {
    updateDraft("traits", [...draft.traits, createEmptyTraitRow()]);
  }

  function duplicateTraitRow(row: TraitRow) {
    updateDraft("traits", [...draft.traits, { ...row, id: createDraftRowId() }]);
  }

  function removeTraitRow(rowId: string) {
    updateDraft(
      "traits",
      draft.traits.filter((row) => row.id !== rowId)
    );
  }

  function updateActionRow(rowId: string, field: keyof Omit<ActionRow, "id">, value: string) {
    updateDraft(
      "actions",
      draft.actions.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  }

  function addActionRow() {
    updateDraft("actions", [...draft.actions, createEmptyActionRow()]);
  }

  function removeActionRow(rowId: string) {
    updateDraft(
      "actions",
      draft.actions.filter((row) => row.id !== rowId)
    );
  }

  function handleSave() {
    const result = validateAndCreateMonster(baseMonster, draft, {
      sizeOptions,
      typeOptions
    });

    setValidation(result.validation);

    if (!result.monster) {
      return;
    }

    onSave(result.monster);
  }

  return (
    <SheetModal titleId={titleId} onClose={onClose} size="large">
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>{title}</OverlayTitle>
          <OverlaySummary>{summary}</OverlaySummary>
        </OverlayHeaderContent>
        <div className={styles.statBlockEditorHeaderActions}>
          {publicToggle ? (
            <label
              className={[
                styles.statBlockPublicToggle,
                publicToggle.disabled ? styles.statBlockPublicToggleDisabled : ""
              ]
                .join(" ")
                .trim()}
              data-tooltip={publicToggle.disabledReason}
              aria-disabled={publicToggle.disabled}
            >
              <input
                type="checkbox"
                checked={publicToggle.checked}
                disabled={publicToggle.disabled}
                onChange={(event) => publicToggle.onChange(event.target.checked)}
              />
              <span>Public</span>
            </label>
          ) : null}
          <OverlayCloseButton label="Close stat block editor" onClick={onClose} />
        </div>
      </OverlayHeader>

      <OverlayBody className={styles.statBlockEditorBody}>
        <section className={styles.statBlockEditorSection}>
          <h4 className={styles.statBlockEditorSectionTitle}>Identity</h4>
          <div className={styles.statBlockEditorGrid}>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>
                <RequiredFieldLabel>Name</RequiredFieldLabel>
              </span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.name}
                invalid={validation.invalidFields.has("name")}
                onChange={(event) => updateDraft("name", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Size</span>
              <SelectInput
                compact
                value={draft.sizeKey}
                onChange={(event) => updateDraft("sizeKey", event.target.value)}
              >
                <option value="">-</option>
                {sizeOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.name}
                  </option>
                ))}
              </SelectInput>
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Type</span>
              <SelectInput
                compact
                value={draft.typeKey}
                onChange={(event) => updateDraft("typeKey", event.target.value)}
              >
                <option value="">-</option>
                {typeOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.name}
                  </option>
                ))}
              </SelectInput>
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Alignment</span>
              <SelectInput
                compact
                value={draft.alignment}
                onChange={(event) => updateDraft("alignment", event.target.value)}
              >
                <option value="">-</option>
                {alignmentOptions.map((alignment) => (
                  <option key={alignment} value={alignment}>
                    {alignment}
                  </option>
                ))}
              </SelectInput>
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Challenge</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.challengeRating}
                onChange={(event) => updateDraft("challengeRating", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>XP</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.experiencePoints}
                invalid={validation.invalidFields.has("experiencePoints")}
                inputMode="numeric"
                onChange={(event) => updateDraft("experiencePoints", event.target.value)}
              />
            </label>
            <label className={styles.statBlockEditorWide}>
              <span className={shared.fieldLabel}>Description</span>
              <TextAreaInput
                className={styles.statBlockCompactTextArea}
                value={draft.desc}
                rows={3}
                onChange={(event) => updateDraft("desc", event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className={styles.statBlockEditorSection}>
          <h4 className={styles.statBlockEditorSectionTitle}>Stats</h4>
          <div className={styles.statBlockEditorGrid}>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Armor Class</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.armorClass}
                onChange={(event) => updateDraft("armorClass", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Armor Detail</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.armorDetail}
                onChange={(event) => updateDraft("armorDetail", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Hit Points</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.hitPoints}
                onChange={(event) => updateDraft("hitPoints", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Hit Dice</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.hitDice}
                onChange={(event) => updateDraft("hitDice", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Speed</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.speed}
                onChange={(event) => updateDraft("speed", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Initiative</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.initiativeBonus}
                invalid={validation.invalidFields.has("initiativeBonus")}
                inputMode="numeric"
                onChange={(event) => updateDraft("initiativeBonus", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Proficiency</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.proficiencyBonus}
                invalid={validation.invalidFields.has("proficiencyBonus")}
                inputMode="numeric"
                onChange={(event) => updateDraft("proficiencyBonus", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Passive Perception</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.passivePerception}
                invalid={validation.invalidFields.has("passivePerception")}
                inputMode="numeric"
                onChange={(event) => updateDraft("passivePerception", event.target.value)}
              />
            </label>
          </div>

          <div className={styles.statBlockAbilityGrid}>
            {abilityEntries.map(([ability, label]) => (
              <label key={ability} className={shared.field}>
                <span className={shared.fieldLabel}>{label}</span>
                <TextInput
                  className={styles.statBlockCompactInput}
                  value={draft.abilityScores[ability]}
                  invalid={validation.invalidFields.has(`ability-${ability}`)}
                  inputMode="numeric"
                  onChange={(event) =>
                    updateAbilityField("abilityScores", ability, event.target.value)
                  }
                />
              </label>
            ))}
          </div>

          <div className={styles.statBlockAbilityGrid}>
            {abilityEntries.map(([ability, label]) => (
              <label key={`${ability}-save`} className={shared.field}>
                <span className={shared.fieldLabel}>{label} Save</span>
                <TextInput
                  className={styles.statBlockCompactInput}
                  value={draft.savingThrows[ability]}
                  invalid={validation.invalidFields.has(`save-${ability}`)}
                  inputMode="numeric"
                  placeholder="-"
                  onChange={(event) =>
                    updateAbilityField("savingThrows", ability, event.target.value)
                  }
                />
              </label>
            ))}
          </div>

          <div className={styles.statBlockEditorGrid}>
            <label className={styles.statBlockEditorWide}>
              <span className={shared.fieldLabel}>Skills</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.skills}
                onChange={(event) => updateDraft("skills", event.target.value)}
              />
            </label>
            <label className={styles.statBlockEditorWide}>
              <span className={shared.fieldLabel}>Senses</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.senses}
                onChange={(event) => updateDraft("senses", event.target.value)}
              />
            </label>
            <label className={styles.statBlockEditorWide}>
              <span className={shared.fieldLabel}>Languages</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.languages}
                onChange={(event) => updateDraft("languages", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Vulnerabilities</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.damageVulnerabilities}
                onChange={(event) => updateDraft("damageVulnerabilities", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Resistances</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.damageResistances}
                onChange={(event) => updateDraft("damageResistances", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Damage Immunities</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.damageImmunities}
                onChange={(event) => updateDraft("damageImmunities", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Condition Immunities</span>
              <TextInput
                className={styles.statBlockCompactInput}
                value={draft.conditionImmunities}
                onChange={(event) => updateDraft("conditionImmunities", event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className={styles.statBlockEditorSection}>
          <div className={styles.dynamicRowsHeader}>
            <h4 className={styles.statBlockEditorSectionTitle}>Traits</h4>
            <button type="button" className={styles.secondaryButton} onClick={addTraitRow}>
              <Plus size={15} aria-hidden="true" />
              Add
            </button>
          </div>
          <div className={styles.featureRows}>
            {draft.traits.length > 0 ? (
              draft.traits.map((row) => (
                <div key={row.id} className={styles.featureRow}>
                  <div className={styles.featureRowHeader}>
                    <label className={shared.field}>
                      <span className={shared.fieldLabel}>Name</span>
                      <TextInput
                        className={styles.statBlockCompactInput}
                        value={row.name}
                        invalid={validation.invalidFields.has(`trait-${row.id}-name`)}
                        onChange={(event) => updateTraitRow(row.id, "name", event.target.value)}
                      />
                    </label>
                    <div className={styles.featureRowActions}>
                      <button
                        type="button"
                        className={styles.secondaryIconButton}
                        aria-label={`Duplicate ${row.name || "trait"} row`}
                        title="Duplicate row"
                        onClick={() => duplicateTraitRow(row)}
                      >
                        <Copy size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={styles.secondaryIconButton}
                        aria-label={`Remove ${row.name || "trait"} row`}
                        title="Remove row"
                        onClick={() => removeTraitRow(row.id)}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <label className={shared.field}>
                    <span className={shared.fieldLabel}>Description</span>
                    <TextAreaInput
                      className={styles.statBlockCompactTextArea}
                      value={row.desc}
                      rows={3}
                      onChange={(event) => updateTraitRow(row.id, "desc", event.target.value)}
                    />
                  </label>
                </div>
              ))
            ) : (
              <p className={shared.emptyText}>No traits.</p>
            )}
          </div>
        </section>

        <section className={styles.statBlockEditorSection}>
          <div className={styles.dynamicRowsHeader}>
            <h4 className={styles.statBlockEditorSectionTitle}>Actions</h4>
            <button type="button" className={styles.secondaryButton} onClick={addActionRow}>
              <Plus size={15} aria-hidden="true" />
              Add
            </button>
          </div>
          <div className={styles.featureRows}>
            {draft.actions.length > 0 ? (
              draft.actions.map((row) => (
                <div key={row.id} className={styles.featureRow}>
                  <div className={styles.featureRowHeader}>
                    <label className={shared.field}>
                      <span className={shared.fieldLabel}>Name</span>
                      <TextInput
                        className={styles.statBlockCompactInput}
                        value={row.name}
                        invalid={validation.invalidFields.has(`action-${row.id}-name`)}
                        onChange={(event) => updateActionRow(row.id, "name", event.target.value)}
                      />
                    </label>
                    <div className={styles.featureRowActions}>
                      <button
                        type="button"
                        className={styles.secondaryIconButton}
                        aria-label={`Remove ${row.name || "action"} row`}
                        title="Remove row"
                        onClick={() => removeActionRow(row.id)}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <label className={shared.field}>
                    <span className={shared.fieldLabel}>Type</span>
                    <SelectInput
                      compact
                      value={row.actionType}
                      onChange={(event) =>
                        updateActionRow(row.id, "actionType", event.target.value)
                      }
                    >
                      {actionTypeOptions.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </SelectInput>
                  </label>
                  <label className={shared.field}>
                    <span className={shared.fieldLabel}>Description</span>
                    <TextAreaInput
                      className={styles.statBlockCompactTextArea}
                      value={row.desc}
                      rows={3}
                      onChange={(event) => updateActionRow(row.id, "desc", event.target.value)}
                    />
                  </label>
                </div>
              ))
            ) : (
              <p className={shared.emptyText}>No actions.</p>
            )}
          </div>
        </section>

        {validation.message ? <p className={styles.notice}>{validation.message}</p> : null}
      </OverlayBody>

      <OverlayFooter className={styles.statBlockEditorFooter}>
        <ActionButton variant="OUTLINE" onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton onClick={handleSave}>{saveLabel}</ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default CreatureStatBlockEditorModal;
