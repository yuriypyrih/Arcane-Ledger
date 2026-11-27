import { useState } from "react";
import type { EncounterTemplateCreatureRecord } from "../../api/encounterTemplates";
import ActionButton from "../../components/ActionButton";
import { createEmptyMonsterRecord } from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/CreatureStatBlockEditorModel";
import styles from "./CreatureDefensesEditor.module.css";

type CreatureDefensesEditorProps = {
  creature: EncounterTemplateCreatureRecord;
  onUpdate: (
    update: (creature: EncounterTemplateCreatureRecord) => EncounterTemplateCreatureRecord
  ) => void | Promise<void>;
};

type DefensesDraft = {
  conditionImmunities: string;
  damageImmunities: string;
  damageResistances: string;
  damageVulnerabilities: string;
};

const FIELDS: { hint: string; key: keyof DefensesDraft; label: string }[] = [
  { hint: "fire, cold", key: "damageResistances", label: "Resistances" },
  { hint: "poison", key: "damageImmunities", label: "Damage immunities" },
  { hint: "radiant", key: "damageVulnerabilities", label: "Vulnerabilities" },
  {
    hint: "charmed, frightened",
    key: "conditionImmunities",
    label: "Condition (status) immunities"
  }
];

function referenceNames(references: unknown) {
  return Array.isArray(references)
    ? references
        .map((entry) =>
          entry && typeof entry === "object" ? (entry as { name?: unknown }).name : null
        )
        .filter((name): name is string => typeof name === "string")
        .join(", ")
    : "";
}

function toText(display: unknown, references: unknown) {
  return typeof display === "string" && display.trim() ? display : referenceNames(references);
}

function toDraft(creature: EncounterTemplateCreatureRecord): DefensesDraft {
  const defenses = creature.inheritedCreatureEntry?.resistances_and_immunities;

  return {
    conditionImmunities: toText(
      defenses?.condition_immunities_display,
      defenses?.condition_immunities
    ),
    damageImmunities: toText(defenses?.damage_immunities_display, defenses?.damage_immunities),
    damageResistances: toText(defenses?.damage_resistances_display, defenses?.damage_resistances),
    damageVulnerabilities: toText(
      defenses?.damage_vulnerabilities_display,
      defenses?.damage_vulnerabilities
    )
  };
}

function optionalText(value: string) {
  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

/**
 * GM-only: edit this creature's damage and status defenses right in the tracker. Like the stat block
 * editor, each list is saved as text. A creature without a stat block gets a minimal custom one.
 */
function CreatureDefensesEditor({ creature, onUpdate }: CreatureDefensesEditorProps) {
  const saved = toDraft(creature);
  const [draft, setDraft] = useState<DefensesDraft>(saved);
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = FIELDS.some(({ key }) => draft[key] !== saved[key]);

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
    <details className={styles.details} open={FIELDS.some(({ key }) => saved[key])}>
      <summary className={styles.summary}>Resistances &amp; immunities</summary>
      <div className={styles.fields}>
        {FIELDS.map(({ hint, key, label }) => (
          <label key={key} className={styles.field}>
            {label}
            <input
              className={styles.input}
              type="text"
              placeholder={hint}
              value={draft[key]}
              maxLength={200}
              onChange={(event) =>
                setDraft((current) => ({ ...current, [key]: event.target.value }))
              }
            />
          </label>
        ))}
        <p className={styles.hint}>
          Separate entries with commas. Leave a field empty to clear it.
        </p>
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
