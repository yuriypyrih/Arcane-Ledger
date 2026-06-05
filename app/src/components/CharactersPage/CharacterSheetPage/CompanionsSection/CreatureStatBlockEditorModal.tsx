import { Copy, Plus, Trash2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
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
  createEmptyKeyValueRow,
  createEmptyTraitRow,
  monsterAbilityFieldLabels,
  monsterActionTypeOptions,
  validateAndCreateMonster,
  type ActionRow,
  type KeyValueRow,
  type StatBlockDraft,
  type StatBlockValidation,
  type TraitRow
} from "./CreatureStatBlockEditorModel";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./CompanionsSection.module.css";

type CreatureStatBlockEditorModalProps = {
  monster: MonsterRecord;
  onClose: () => void;
  onSave: (monster: MonsterRecord) => void;
};

const abilityEntries = Object.entries(monsterAbilityFieldLabels) as [MonsterAbilityKey, string][];

function CreatureStatBlockEditorModal({
  monster,
  onClose,
  onSave
}: CreatureStatBlockEditorModalProps) {
  const titleId = useId();
  const [draft, setDraft] = useState<StatBlockDraft>(() => createDraftFromMonster(monster));
  const [validation, setValidation] = useState<StatBlockValidation>(() => ({
    invalidFields: new Set<string>(),
    message: null
  }));
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

  function updateKeyValueRow(
    listKey: "speedRows" | "skillRows",
    rowId: string,
    field: keyof Omit<KeyValueRow, "id">,
    value: string
  ) {
    updateDraft(
      listKey,
      draft[listKey].map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  }

  function addKeyValueRow(listKey: "speedRows" | "skillRows") {
    updateDraft(listKey, [...draft[listKey], createEmptyKeyValueRow()]);
  }

  function removeKeyValueRow(listKey: "speedRows" | "skillRows", rowId: string) {
    const nextRows = draft[listKey].filter((row) => row.id !== rowId);
    updateDraft(listKey, nextRows.length > 0 ? nextRows : [createEmptyKeyValueRow()]);
  }

  function updateTraitRow(rowId: string, field: keyof Omit<TraitRow, "id" | "raw">, value: string) {
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

  function updateActionRow(
    rowId: string,
    field: keyof Omit<ActionRow, "id" | "raw">,
    value: string
  ) {
    updateDraft(
      "actions",
      draft.actions.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  }

  function addActionRow() {
    updateDraft("actions", [...draft.actions, createEmptyActionRow()]);
  }

  function duplicateActionRow(row: ActionRow) {
    updateDraft("actions", [...draft.actions, { ...row, id: createDraftRowId() }]);
  }

  function removeActionRow(rowId: string) {
    updateDraft(
      "actions",
      draft.actions.filter((row) => row.id !== rowId)
    );
  }

  function handleSave() {
    const result = validateAndCreateMonster(monster, draft);

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
          <OverlayTitle id={titleId}>Modify stat block</OverlayTitle>
          <OverlaySummary>Edit creature stat block at your own discretion.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close stat block editor" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.statBlockEditorBody}>
        <section className={styles.statBlockEditorSection}>
          <h4 className={styles.statBlockEditorSectionTitle}>Identity</h4>
          <div className={styles.statBlockEditorGrid}>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Name</span>
              <TextInput
                value={draft.name}
                invalid={validation.invalidFields.has("name")}
                onChange={(event) => updateDraft("name", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Size Key</span>
              <TextInput
                value={draft.sizeKey}
                onChange={(event) => updateDraft("sizeKey", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Size Name</span>
              <TextInput
                value={draft.sizeName}
                onChange={(event) => updateDraft("sizeName", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Type Key</span>
              <TextInput
                value={draft.typeKey}
                onChange={(event) => updateDraft("typeKey", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Type Name</span>
              <TextInput
                value={draft.typeName}
                onChange={(event) => updateDraft("typeName", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Alignment</span>
              <TextInput
                value={draft.alignment}
                onChange={(event) => updateDraft("alignment", event.target.value)}
              />
            </label>
            <label className={styles.statBlockEditorWide}>
              <span className={shared.fieldLabel}>Description</span>
              <TextAreaInput
                value={draft.desc}
                rows={4}
                onChange={(event) => updateDraft("desc", event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className={styles.statBlockEditorSection}>
          <h4 className={styles.statBlockEditorSectionTitle}>Vitals</h4>
          <div className={styles.statBlockEditorGrid}>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Armor Class</span>
              <TextInput
                value={draft.armorClass}
                invalid={validation.invalidFields.has("armorClass")}
                inputMode="numeric"
                onChange={(event) => updateDraft("armorClass", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Armor Detail</span>
              <TextInput
                value={draft.armorDetail}
                onChange={(event) => updateDraft("armorDetail", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Hit Points</span>
              <TextInput
                value={draft.hitPoints}
                invalid={validation.invalidFields.has("hitPoints")}
                inputMode="numeric"
                onChange={(event) => updateDraft("hitPoints", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Hit Dice</span>
              <TextInput
                value={draft.hitDice}
                onChange={(event) => updateDraft("hitDice", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Initiative</span>
              <TextInput
                value={draft.initiativeBonus}
                invalid={validation.invalidFields.has("initiativeBonus")}
                inputMode="numeric"
                onChange={(event) => updateDraft("initiativeBonus", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Proficiency</span>
              <TextInput
                value={draft.proficiencyBonus}
                invalid={validation.invalidFields.has("proficiencyBonus")}
                inputMode="numeric"
                onChange={(event) => updateDraft("proficiencyBonus", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Passive Perception</span>
              <TextInput
                value={draft.passivePerception}
                invalid={validation.invalidFields.has("passivePerception")}
                inputMode="numeric"
                onChange={(event) => updateDraft("passivePerception", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Challenge</span>
              <TextInput
                value={draft.challengeRating}
                onChange={(event) => updateDraft("challengeRating", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>XP</span>
              <TextInput
                value={draft.experiencePoints}
                invalid={validation.invalidFields.has("experiencePoints")}
                inputMode="numeric"
                onChange={(event) => updateDraft("experiencePoints", event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className={styles.statBlockEditorSection}>
          <div className={styles.dynamicRowsHeader}>
            <h4 className={styles.statBlockEditorSectionTitle}>Speed</h4>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => addKeyValueRow("speedRows")}
            >
              <Plus size={15} aria-hidden="true" />
              Add
            </button>
          </div>
          <label className={shared.field}>
            <span className={shared.fieldLabel}>Unit</span>
            <TextInput
              value={draft.speedUnit}
              onChange={(event) => updateDraft("speedUnit", event.target.value)}
            />
          </label>
          {draft.speedRows.map((row) => (
            <div key={row.id} className={styles.dynamicRow}>
              <label className={shared.field}>
                <span className={shared.fieldLabel}>Movement</span>
                <TextInput
                  value={row.key}
                  invalid={validation.invalidFields.has(`speed-${row.id}-key`)}
                  onChange={(event) =>
                    updateKeyValueRow("speedRows", row.id, "key", event.target.value)
                  }
                />
              </label>
              <label className={shared.field}>
                <span className={shared.fieldLabel}>Value</span>
                <TextInput
                  value={row.value}
                  onChange={(event) =>
                    updateKeyValueRow("speedRows", row.id, "value", event.target.value)
                  }
                />
              </label>
              <button
                type="button"
                className={styles.secondaryIconButton}
                aria-label="Remove speed row"
                title="Remove speed row"
                onClick={() => removeKeyValueRow("speedRows", row.id)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </section>

        <section className={styles.statBlockEditorSection}>
          <h4 className={styles.statBlockEditorSectionTitle}>Abilities</h4>
          <div className={styles.statBlockEditorGrid}>
            {abilityEntries.map(([ability, label]) => (
              <label key={ability} className={shared.field}>
                <span className={shared.fieldLabel}>{label}</span>
                <TextInput
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
        </section>

        <section className={styles.statBlockEditorSection}>
          <h4 className={styles.statBlockEditorSectionTitle}>Saves And Skills</h4>
          <div className={styles.statBlockEditorGrid}>
            {abilityEntries.map(([ability, label]) => (
              <label key={ability} className={shared.field}>
                <span className={shared.fieldLabel}>{label} Save</span>
                <TextInput
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
          <div className={styles.dynamicRowsHeader}>
            <h5 className={styles.dynamicRowsTitle}>Skills</h5>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => addKeyValueRow("skillRows")}
            >
              <Plus size={15} aria-hidden="true" />
              Add
            </button>
          </div>
          {draft.skillRows.map((row) => (
            <div key={row.id} className={styles.dynamicRow}>
              <label className={shared.field}>
                <span className={shared.fieldLabel}>Skill</span>
                <TextInput
                  value={row.key}
                  invalid={validation.invalidFields.has(`skill-${row.id}-key`)}
                  onChange={(event) =>
                    updateKeyValueRow("skillRows", row.id, "key", event.target.value)
                  }
                />
              </label>
              <label className={shared.field}>
                <span className={shared.fieldLabel}>Bonus</span>
                <TextInput
                  value={row.value}
                  invalid={validation.invalidFields.has(`skill-${row.id}-value`)}
                  inputMode="numeric"
                  onChange={(event) =>
                    updateKeyValueRow("skillRows", row.id, "value", event.target.value)
                  }
                />
              </label>
              <button
                type="button"
                className={styles.secondaryIconButton}
                aria-label="Remove skill row"
                title="Remove skill row"
                onClick={() => removeKeyValueRow("skillRows", row.id)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </section>

        <section className={styles.statBlockEditorSection}>
          <h4 className={styles.statBlockEditorSectionTitle}>Senses And Languages</h4>
          <div className={styles.statBlockEditorGrid}>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Normal Sight</span>
              <TextInput
                value={draft.normalSightRange}
                invalid={validation.invalidFields.has("normalSightRange")}
                inputMode="numeric"
                onChange={(event) => updateDraft("normalSightRange", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Darkvision</span>
              <TextInput
                value={draft.darkvisionRange}
                invalid={validation.invalidFields.has("darkvisionRange")}
                inputMode="numeric"
                onChange={(event) => updateDraft("darkvisionRange", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Blindsight</span>
              <TextInput
                value={draft.blindsightRange}
                invalid={validation.invalidFields.has("blindsightRange")}
                inputMode="numeric"
                onChange={(event) => updateDraft("blindsightRange", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Tremorsense</span>
              <TextInput
                value={draft.tremorsenseRange}
                invalid={validation.invalidFields.has("tremorsenseRange")}
                inputMode="numeric"
                onChange={(event) => updateDraft("tremorsenseRange", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Truesight</span>
              <TextInput
                value={draft.truesightRange}
                invalid={validation.invalidFields.has("truesightRange")}
                inputMode="numeric"
                onChange={(event) => updateDraft("truesightRange", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Languages</span>
              <TextInput
                value={draft.languages}
                onChange={(event) => updateDraft("languages", event.target.value)}
              />
            </label>
            <label className={styles.statBlockEditorWide}>
              <span className={shared.fieldLabel}>Senses Display</span>
              <TextInput
                value={draft.sensesDisplay}
                onChange={(event) => updateDraft("sensesDisplay", event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className={styles.statBlockEditorSection}>
          <h4 className={styles.statBlockEditorSectionTitle}>Resistances And Immunities</h4>
          <div className={styles.statBlockEditorGrid}>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Vulnerabilities</span>
              <TextInput
                value={draft.damageVulnerabilities}
                onChange={(event) => updateDraft("damageVulnerabilities", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Resistances</span>
              <TextInput
                value={draft.damageResistances}
                onChange={(event) => updateDraft("damageResistances", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Damage Immunities</span>
              <TextInput
                value={draft.damageImmunities}
                onChange={(event) => updateDraft("damageImmunities", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Condition Immunities</span>
              <TextInput
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
                        value={row.name}
                        invalid={validation.invalidFields.has(`action-${row.id}-name`)}
                        onChange={(event) => updateActionRow(row.id, "name", event.target.value)}
                      />
                    </label>
                    <div className={styles.featureRowActions}>
                      <button
                        type="button"
                        className={styles.secondaryIconButton}
                        aria-label={`Duplicate ${row.name || "action"} row`}
                        title="Duplicate row"
                        onClick={() => duplicateActionRow(row)}
                      >
                        <Copy size={16} aria-hidden="true" />
                      </button>
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
                  <div className={styles.featureNumberGrid}>
                    <label className={shared.field}>
                      <span className={shared.fieldLabel}>Type</span>
                      <SelectInput
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
                      <span className={shared.fieldLabel}>Order</span>
                      <TextInput
                        value={row.order}
                        invalid={validation.invalidFields.has(`action-${row.id}-order`)}
                        inputMode="numeric"
                        onChange={(event) => updateActionRow(row.id, "order", event.target.value)}
                      />
                    </label>
                    <label className={shared.field}>
                      <span className={shared.fieldLabel}>Legendary Cost</span>
                      <TextInput
                        value={row.legendaryCost}
                        invalid={validation.invalidFields.has(`action-${row.id}-legendaryCost`)}
                        inputMode="numeric"
                        onChange={(event) =>
                          updateActionRow(row.id, "legendaryCost", event.target.value)
                        }
                      />
                    </label>
                    <label className={shared.field}>
                      <span className={shared.fieldLabel}>Usage Type</span>
                      <TextInput
                        value={row.usageType}
                        onChange={(event) =>
                          updateActionRow(row.id, "usageType", event.target.value)
                        }
                      />
                    </label>
                    <label className={shared.field}>
                      <span className={shared.fieldLabel}>Usage Param</span>
                      <TextInput
                        value={row.usageParam}
                        onChange={(event) =>
                          updateActionRow(row.id, "usageParam", event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <label className={shared.field}>
                    <span className={shared.fieldLabel}>Description</span>
                    <TextAreaInput
                      value={row.desc}
                      rows={4}
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
        <ActionButton onClick={handleSave}>Save stat block</ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default CreatureStatBlockEditorModal;
