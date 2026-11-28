import { useState } from "react";
import type { EncounterTemplateCreatureRecord } from "../../api/encounterTemplates";
import ActionButton from "../../components/ActionButton";
import { createEmptyMonsterRecord } from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/CreatureStatBlockEditorModel";
import {
  DEFENSE_FIELDS,
  getCreatureDefenseEntries,
  getDefenseOptions,
  type DefenseFieldKey
} from "./creatureDefenses";
import DefenseEntryPicker from "./DefenseEntryPicker";
import styles from "./CreatureDefensesEditor.module.css";

type CreatureDefensesEditorProps = {
  creature: EncounterTemplateCreatureRecord;
  onUpdate: (
    update: (creature: EncounterTemplateCreatureRecord) => EncounterTemplateCreatureRecord
  ) => void | Promise<void>;
};

type DefensesDraft = Record<DefenseFieldKey, string[]>;

function optionalText(entries: string[]) {
  return entries.length > 0 ? entries.join(", ") : null;
}

/**
 * GM-only: edit this creature's damage and status defenses right in the tracker. Like the stat block
 * editor, each list is saved as text. A creature without a stat block gets a minimal custom one.
 */
function CreatureDefensesEditor({ creature, onUpdate }: CreatureDefensesEditorProps) {
  const saved = getCreatureDefenseEntries(creature);
  const [draft, setDraft] = useState<DefensesDraft>(saved);
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = DEFENSE_FIELDS.some(({ key }) => draft[key].join(",") !== saved[key].join(","));

  async function save() {
    setIsSaving(true);

    try {
      await onUpdate((current) => {
        const baseEntry = current.inheritedCreatureEntry ?? {
          ...createEmptyMonsterRecord(),
          key: `custom-${current.id}`,
          name: current.name
        };

        return {
          ...current,
          inheritedCreatureEntry: {
            ...baseEntry,
            resistances_and_immunities: {
              ...(baseEntry.resistances_and_immunities ?? {}),
              condition_immunities_display: optionalText(draft.conditionImmunities),
              condition_immunities: [],
              damage_immunities_display: optionalText(draft.damageImmunities),
              damage_immunities: [],
              damage_resistances_display: optionalText(draft.damageResistances),
              damage_resistances: [],
              damage_vulnerabilities_display: optionalText(draft.damageVulnerabilities),
              damage_vulnerabilities: []
            }
          },
          ...(current.inheritedCreatureEntry ? { inheritedCreatureEntryModified: true } : {})
        };
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <details
      className={styles.details}
      open={DEFENSE_FIELDS.some(({ key }) => saved[key].length > 0)}
    >
      <summary className={styles.summary}>Resistances &amp; immunities</summary>
      <div className={styles.fields}>
        {DEFENSE_FIELDS.map(({ key, kind, label }) => (
          <DefenseEntryPicker
            key={key}
            label={label}
            options={getDefenseOptions(kind)}
            selected={draft[key]}
            onChange={(selected) => setDraft((current) => ({ ...current, [key]: selected }))}
          />
        ))}
        <ActionButton
          fullWidth={false}
          size="sm"
          disabled={!isDirty}
          loading={isSaving}
          onClick={() => void save()}
        >
          Save
        </ActionButton>
      </div>
    </details>
  );
}

export default CreatureDefensesEditor;
