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
import TextAreaInput from "../../FormInputs/TextAreaInput";
import TextInput from "../../FormInputs/TextInput";
import type { MonsterFeatureRecord, MonsterRecord, MonsterSpeedValue } from "../../../../types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./CompanionsSection.module.css";

type KeyValueRow = {
  id: string;
  key: string;
  value: string;
};

type FeatureRow = {
  id: string;
  name: string;
  desc: string;
  attackBonus: string;
  damageDice: string;
  damageBonus: string;
};

type FeatureListKey =
  | "specialAbilities"
  | "actions"
  | "bonusActions"
  | "reactions"
  | "legendaryActions";

type StatBlockDraft = {
  name: string;
  desc: string;
  size: string;
  type: string;
  subtype: string;
  group: string;
  alignment: string;
  armorClass: string;
  armorDesc: string;
  hitPoints: string;
  hitDice: string;
  speedRows: KeyValueRow[];
  strength: string;
  dexterity: string;
  constitution: string;
  intelligence: string;
  wisdom: string;
  charisma: string;
  strengthSave: string;
  dexteritySave: string;
  constitutionSave: string;
  intelligenceSave: string;
  wisdomSave: string;
  charismaSave: string;
  perception: string;
  skillRows: KeyValueRow[];
  damageVulnerabilities: string;
  damageResistances: string;
  damageImmunities: string;
  conditionImmunities: string;
  senses: string;
  languages: string;
  challengeRating: string;
  cr: string;
  legendaryDesc: string;
  specialAbilities: FeatureRow[];
  actions: FeatureRow[];
  bonusActions: FeatureRow[];
  reactions: FeatureRow[];
  legendaryActions: FeatureRow[];
};

type StatBlockValidation = {
  invalidFields: Set<string>;
  message: string | null;
};

type CreatureStatBlockEditorModalProps = {
  monster: MonsterRecord;
  onClose: () => void;
  onSave: (monster: MonsterRecord) => void;
};

const featureListLabels: Record<FeatureListKey, string> = {
  specialAbilities: "Special abilities",
  actions: "Actions",
  bonusActions: "Bonus actions",
  reactions: "Reactions",
  legendaryActions: "Legendary actions"
};

const abilityFields = [
  ["strength", "STR"],
  ["dexterity", "DEX"],
  ["constitution", "CON"],
  ["intelligence", "INT"],
  ["wisdom", "WIS"],
  ["charisma", "CHA"]
] as const;

const saveFields = [
  ["strengthSave", "STR Save"],
  ["dexteritySave", "DEX Save"],
  ["constitutionSave", "CON Save"],
  ["intelligenceSave", "INT Save"],
  ["wisdomSave", "WIS Save"],
  ["charismaSave", "CHA Save"]
] as const;

let draftRowId = 0;

function createDraftRowId() {
  draftRowId += 1;
  return `stat-block-row-${draftRowId}`;
}

function numericDraftValue(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function createKeyValueRows(entries: [string, MonsterSpeedValue | number][]) {
  if (entries.length === 0) {
    return [createEmptyKeyValueRow()];
  }

  return entries.map(([key, value]) => ({
    id: createDraftRowId(),
    key,
    value: String(value)
  }));
}

function createFeatureRows(features: MonsterFeatureRecord[] | null) {
  if (!features || features.length === 0) {
    return [];
  }

  return features.map((feature) => ({
    id: createDraftRowId(),
    name: feature.name,
    desc: feature.desc,
    attackBonus: numericDraftValue(feature.attack_bonus),
    damageDice: feature.damage_dice ?? "",
    damageBonus: numericDraftValue(feature.damage_bonus)
  }));
}

function createEmptyKeyValueRow(): KeyValueRow {
  return {
    id: createDraftRowId(),
    key: "",
    value: ""
  };
}

function createEmptyFeatureRow(): FeatureRow {
  return {
    id: createDraftRowId(),
    name: "",
    desc: "",
    attackBonus: "",
    damageDice: "",
    damageBonus: ""
  };
}

function createDraftFromMonster(monster: MonsterRecord): StatBlockDraft {
  return {
    name: monster.name,
    desc: monster.desc,
    size: monster.size,
    type: monster.type,
    subtype: monster.subtype,
    group: monster.group ?? "",
    alignment: monster.alignment,
    armorClass: String(monster.armor_class),
    armorDesc: monster.armor_desc ?? "",
    hitPoints: String(monster.hit_points),
    hitDice: monster.hit_dice,
    speedRows: createKeyValueRows(Object.entries(monster.speed)),
    strength: String(monster.strength),
    dexterity: String(monster.dexterity),
    constitution: String(monster.constitution),
    intelligence: String(monster.intelligence),
    wisdom: String(monster.wisdom),
    charisma: String(monster.charisma),
    strengthSave: numericDraftValue(monster.strength_save),
    dexteritySave: numericDraftValue(monster.dexterity_save),
    constitutionSave: numericDraftValue(monster.constitution_save),
    intelligenceSave: numericDraftValue(monster.intelligence_save),
    wisdomSave: numericDraftValue(monster.wisdom_save),
    charismaSave: numericDraftValue(monster.charisma_save),
    perception: numericDraftValue(monster.perception),
    skillRows: createKeyValueRows(Object.entries(monster.skills)),
    damageVulnerabilities: monster.damage_vulnerabilities,
    damageResistances: monster.damage_resistances,
    damageImmunities: monster.damage_immunities,
    conditionImmunities: monster.condition_immunities,
    senses: monster.senses,
    languages: monster.languages,
    challengeRating: monster.challenge_rating,
    cr: String(monster.cr),
    legendaryDesc: monster.legendary_desc ?? "",
    specialAbilities: createFeatureRows(monster.special_abilities),
    actions: createFeatureRows(monster.actions),
    bonusActions: createFeatureRows(monster.bonus_actions),
    reactions: createFeatureRows(monster.reactions),
    legendaryActions: createFeatureRows(monster.legendary_actions)
  };
}

function parseRequiredInteger(
  value: string,
  fieldName: string,
  invalidFields: Set<string>,
  min = 0,
  max = 999
) {
  const trimmedValue = value.trim();
  const parsedValue = Number(trimmedValue);

  if (
    trimmedValue.length === 0 ||
    !Number.isInteger(parsedValue) ||
    parsedValue < min ||
    parsedValue > max
  ) {
    invalidFields.add(fieldName);
    return 0;
  }

  return parsedValue;
}

function parseNullableInteger(
  value: string,
  fieldName: string,
  invalidFields: Set<string>,
  min = -999,
  max = 999
) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);

  if (!Number.isInteger(parsedValue) || parsedValue < min || parsedValue > max) {
    invalidFields.add(fieldName);
    return null;
  }

  return parsedValue;
}

function parseRequiredNumber(
  value: string,
  fieldName: string,
  invalidFields: Set<string>,
  min = 0,
  max = 999
) {
  const trimmedValue = value.trim();
  const parsedValue = Number(trimmedValue);

  if (
    trimmedValue.length === 0 ||
    !Number.isFinite(parsedValue) ||
    parsedValue < min ||
    parsedValue > max
  ) {
    invalidFields.add(fieldName);
    return 0;
  }

  return parsedValue;
}

function parseSpeedValue(value: string): MonsterSpeedValue {
  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.toLowerCase();

  if (!trimmedValue || normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : trimmedValue;
}

function parseSpeedRows(rows: KeyValueRow[], invalidFields: Set<string>) {
  return rows.reduce<Record<string, MonsterSpeedValue>>((speed, row) => {
    const key = row.key.trim();
    const value = row.value.trim();

    if (!key && !value) {
      return speed;
    }

    if (!key) {
      invalidFields.add(`speed-${row.id}-key`);
      return speed;
    }

    speed[key] = parseSpeedValue(value);
    return speed;
  }, {});
}

function parseSkillRows(rows: KeyValueRow[], invalidFields: Set<string>) {
  return rows.reduce<Record<string, number>>((skills, row) => {
    const key = row.key.trim();
    const value = row.value.trim();

    if (!key && !value) {
      return skills;
    }

    if (!key) {
      invalidFields.add(`skill-${row.id}-key`);
      return skills;
    }

    const parsedValue = Number(value);

    if (!value || !Number.isInteger(parsedValue)) {
      invalidFields.add(`skill-${row.id}-value`);
      return skills;
    }

    skills[key] = parsedValue;
    return skills;
  }, {});
}

function parseFeatureRows(rows: FeatureRow[], listKey: FeatureListKey, invalidFields: Set<string>) {
  const parsedRows = rows.reduce<MonsterFeatureRecord[]>((features, row) => {
    const name = row.name.trim();
    const desc = row.desc.trim();
    const attackBonus = row.attackBonus.trim();
    const damageDice = row.damageDice.trim();
    const damageBonus = row.damageBonus.trim();
    const hasContent = Boolean(name || desc || attackBonus || damageDice || damageBonus);

    if (!hasContent) {
      return features;
    }

    if (!name) {
      invalidFields.add(`${listKey}-${row.id}-name`);
    }

    const parsedAttackBonus = parseNullableInteger(
      attackBonus,
      `${listKey}-${row.id}-attackBonus`,
      invalidFields
    );
    const parsedDamageBonus = parseNullableInteger(
      damageBonus,
      `${listKey}-${row.id}-damageBonus`,
      invalidFields
    );

    features.push({
      name,
      desc,
      ...(parsedAttackBonus !== null ? { attack_bonus: parsedAttackBonus } : {}),
      ...(damageDice ? { damage_dice: damageDice } : {}),
      ...(parsedDamageBonus !== null ? { damage_bonus: parsedDamageBonus } : {})
    });

    return features;
  }, []);

  return parsedRows.length > 0 ? parsedRows : null;
}

function optionalText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function validateAndCreateMonster(
  monster: MonsterRecord,
  draft: StatBlockDraft
): { monster: MonsterRecord | null; validation: StatBlockValidation } {
  const invalidFields = new Set<string>();
  const name = draft.name.trim();

  if (!name) {
    invalidFields.add("name");
  }

  const nextMonster: MonsterRecord = {
    ...monster,
    name,
    desc: draft.desc.trim(),
    size: draft.size.trim(),
    type: draft.type.trim(),
    subtype: draft.subtype.trim(),
    group: optionalText(draft.group),
    alignment: draft.alignment.trim(),
    armor_class: parseRequiredInteger(draft.armorClass, "armorClass", invalidFields, 0, 999),
    armor_desc: optionalText(draft.armorDesc),
    hit_points: parseRequiredInteger(draft.hitPoints, "hitPoints", invalidFields, 1, 9999),
    hit_dice: draft.hitDice.trim(),
    speed: parseSpeedRows(draft.speedRows, invalidFields),
    strength: parseRequiredInteger(draft.strength, "strength", invalidFields, 0, 99),
    dexterity: parseRequiredInteger(draft.dexterity, "dexterity", invalidFields, 0, 99),
    constitution: parseRequiredInteger(draft.constitution, "constitution", invalidFields, 0, 99),
    intelligence: parseRequiredInteger(draft.intelligence, "intelligence", invalidFields, 0, 99),
    wisdom: parseRequiredInteger(draft.wisdom, "wisdom", invalidFields, 0, 99),
    charisma: parseRequiredInteger(draft.charisma, "charisma", invalidFields, 0, 99),
    strength_save: parseNullableInteger(draft.strengthSave, "strengthSave", invalidFields),
    dexterity_save: parseNullableInteger(draft.dexteritySave, "dexteritySave", invalidFields),
    constitution_save: parseNullableInteger(
      draft.constitutionSave,
      "constitutionSave",
      invalidFields
    ),
    intelligence_save: parseNullableInteger(
      draft.intelligenceSave,
      "intelligenceSave",
      invalidFields
    ),
    wisdom_save: parseNullableInteger(draft.wisdomSave, "wisdomSave", invalidFields),
    charisma_save: parseNullableInteger(draft.charismaSave, "charismaSave", invalidFields),
    perception: parseNullableInteger(draft.perception, "perception", invalidFields),
    skills: parseSkillRows(draft.skillRows, invalidFields),
    damage_vulnerabilities: draft.damageVulnerabilities.trim(),
    damage_resistances: draft.damageResistances.trim(),
    damage_immunities: draft.damageImmunities.trim(),
    condition_immunities: draft.conditionImmunities.trim(),
    senses: draft.senses.trim(),
    languages: draft.languages.trim(),
    challenge_rating: draft.challengeRating.trim(),
    cr: parseRequiredNumber(draft.cr, "cr", invalidFields, 0, 999),
    legendary_desc: optionalText(draft.legendaryDesc),
    special_abilities: parseFeatureRows(draft.specialAbilities, "specialAbilities", invalidFields),
    actions: parseFeatureRows(draft.actions, "actions", invalidFields),
    bonus_actions: parseFeatureRows(draft.bonusActions, "bonusActions", invalidFields),
    reactions: parseFeatureRows(draft.reactions, "reactions", invalidFields),
    legendary_actions: parseFeatureRows(draft.legendaryActions, "legendaryActions", invalidFields)
  };

  return {
    monster: invalidFields.size > 0 ? null : nextMonster,
    validation: {
      invalidFields,
      message: invalidFields.size > 0 ? "Fix highlighted stat block fields." : null
    }
  };
}

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
  const featureListEntries = useMemo(
    () => Object.entries(featureListLabels) as [FeatureListKey, string][],
    []
  );

  function updateDraft<Key extends keyof StatBlockDraft>(key: Key, value: StatBlockDraft[Key]) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value
    }));
    setValidation({ invalidFields: new Set<string>(), message: null });
  }

  function updateKeyValueRow(
    listKey: "speedRows" | "skillRows",
    rowId: string,
    field: "key" | "value",
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

  function updateFeatureRow(
    listKey: FeatureListKey,
    rowId: string,
    field: keyof Omit<FeatureRow, "id">,
    value: string
  ) {
    updateDraft(
      listKey,
      draft[listKey].map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  }

  function addFeatureRow(listKey: FeatureListKey) {
    updateDraft(listKey, [...draft[listKey], createEmptyFeatureRow()]);
  }

  function duplicateFeatureRow(listKey: FeatureListKey, row: FeatureRow) {
    updateDraft(listKey, [
      ...draft[listKey],
      {
        ...row,
        id: createDraftRowId()
      }
    ]);
  }

  function removeFeatureRow(listKey: FeatureListKey, rowId: string) {
    updateDraft(
      listKey,
      draft[listKey].filter((row) => row.id !== rowId)
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
          <OverlaySummary>
            Edit this saved creature snapshot only. Edit with caution as invalid values will be
            ignored during save.
          </OverlaySummary>
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
              <span className={shared.fieldLabel}>Size</span>
              <TextInput
                value={draft.size}
                onChange={(event) => updateDraft("size", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Type</span>
              <TextInput
                value={draft.type}
                onChange={(event) => updateDraft("type", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Subtype</span>
              <TextInput
                value={draft.subtype}
                onChange={(event) => updateDraft("subtype", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Group</span>
              <TextInput
                value={draft.group}
                onChange={(event) => updateDraft("group", event.target.value)}
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
              <span className={shared.fieldLabel}>Armor Description</span>
              <TextInput
                value={draft.armorDesc}
                onChange={(event) => updateDraft("armorDesc", event.target.value)}
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
          </div>

          <div className={styles.dynamicRows}>
            <div className={styles.dynamicRowsHeader}>
              <h5 className={styles.dynamicRowsTitle}>Speed</h5>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => addKeyValueRow("speedRows")}
              >
                <Plus size={15} aria-hidden="true" />
                Add
              </button>
            </div>
            {draft.speedRows.map((row) => (
              <div key={row.id} className={styles.dynamicRow}>
                <label className={shared.field}>
                  <span className={shared.fieldLabel}>Key</span>
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
          </div>
        </section>

        <section className={styles.statBlockEditorSection}>
          <h4 className={styles.statBlockEditorSectionTitle}>Abilities</h4>
          <div className={styles.statBlockEditorGrid}>
            {abilityFields.map(([field, label]) => (
              <label key={field} className={shared.field}>
                <span className={shared.fieldLabel}>{label}</span>
                <TextInput
                  value={draft[field]}
                  invalid={validation.invalidFields.has(field)}
                  inputMode="numeric"
                  onChange={(event) => updateDraft(field, event.target.value)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className={styles.statBlockEditorSection}>
          <h4 className={styles.statBlockEditorSectionTitle}>Saves and skills</h4>
          <div className={styles.statBlockEditorGrid}>
            {saveFields.map(([field, label]) => (
              <label key={field} className={shared.field}>
                <span className={shared.fieldLabel}>{label}</span>
                <TextInput
                  value={draft[field]}
                  invalid={validation.invalidFields.has(field)}
                  inputMode="numeric"
                  placeholder="-"
                  onChange={(event) => updateDraft(field, event.target.value)}
                />
              </label>
            ))}
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Perception</span>
              <TextInput
                value={draft.perception}
                invalid={validation.invalidFields.has("perception")}
                inputMode="numeric"
                placeholder="-"
                onChange={(event) => updateDraft("perception", event.target.value)}
              />
            </label>
          </div>

          <div className={styles.dynamicRows}>
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
          </div>
        </section>

        <section className={styles.statBlockEditorSection}>
          <h4 className={styles.statBlockEditorSectionTitle}>Text details</h4>
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
              <span className={shared.fieldLabel}>Immunities</span>
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
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Senses</span>
              <TextInput
                value={draft.senses}
                onChange={(event) => updateDraft("senses", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Languages</span>
              <TextInput
                value={draft.languages}
                onChange={(event) => updateDraft("languages", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Challenge Label</span>
              <TextInput
                value={draft.challengeRating}
                onChange={(event) => updateDraft("challengeRating", event.target.value)}
              />
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>CR Number</span>
              <TextInput
                value={draft.cr}
                invalid={validation.invalidFields.has("cr")}
                inputMode="decimal"
                onChange={(event) => updateDraft("cr", event.target.value)}
              />
            </label>
            <label className={styles.statBlockEditorWide}>
              <span className={shared.fieldLabel}>Legendary Description</span>
              <TextAreaInput
                value={draft.legendaryDesc}
                rows={3}
                onChange={(event) => updateDraft("legendaryDesc", event.target.value)}
              />
            </label>
          </div>
        </section>

        {featureListEntries.map(([listKey, label]) => (
          <section key={listKey} className={styles.statBlockEditorSection}>
            <div className={styles.dynamicRowsHeader}>
              <h4 className={styles.statBlockEditorSectionTitle}>{label}</h4>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => addFeatureRow(listKey)}
              >
                <Plus size={15} aria-hidden="true" />
                Add
              </button>
            </div>
            <div className={styles.featureRows}>
              {draft[listKey].length > 0 ? (
                draft[listKey].map((row) => (
                  <div key={row.id} className={styles.featureRow}>
                    <div className={styles.featureRowHeader}>
                      <label className={shared.field}>
                        <span className={shared.fieldLabel}>Name</span>
                        <TextInput
                          value={row.name}
                          invalid={validation.invalidFields.has(`${listKey}-${row.id}-name`)}
                          onChange={(event) =>
                            updateFeatureRow(listKey, row.id, "name", event.target.value)
                          }
                        />
                      </label>
                      <div className={styles.featureRowActions}>
                        <button
                          type="button"
                          className={styles.secondaryIconButton}
                          aria-label={`Duplicate ${row.name || label} row`}
                          title="Duplicate row"
                          onClick={() => duplicateFeatureRow(listKey, row)}
                        >
                          <Copy size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryIconButton}
                          aria-label={`Remove ${row.name || label} row`}
                          title="Remove row"
                          onClick={() => removeFeatureRow(listKey, row.id)}
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
                        onChange={(event) =>
                          updateFeatureRow(listKey, row.id, "desc", event.target.value)
                        }
                      />
                    </label>
                    <div className={styles.featureNumberGrid}>
                      <label className={shared.field}>
                        <span className={shared.fieldLabel}>Attack Bonus</span>
                        <TextInput
                          value={row.attackBonus}
                          invalid={validation.invalidFields.has(`${listKey}-${row.id}-attackBonus`)}
                          inputMode="numeric"
                          placeholder="-"
                          onChange={(event) =>
                            updateFeatureRow(listKey, row.id, "attackBonus", event.target.value)
                          }
                        />
                      </label>
                      <label className={shared.field}>
                        <span className={shared.fieldLabel}>Damage Dice</span>
                        <TextInput
                          value={row.damageDice}
                          placeholder="1d6 + 2"
                          onChange={(event) =>
                            updateFeatureRow(listKey, row.id, "damageDice", event.target.value)
                          }
                        />
                      </label>
                      <label className={shared.field}>
                        <span className={shared.fieldLabel}>Damage Bonus</span>
                        <TextInput
                          value={row.damageBonus}
                          invalid={validation.invalidFields.has(`${listKey}-${row.id}-damageBonus`)}
                          inputMode="numeric"
                          placeholder="-"
                          onChange={(event) =>
                            updateFeatureRow(listKey, row.id, "damageBonus", event.target.value)
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))
              ) : (
                <p className={shared.emptyText}>No {label.toLowerCase()}.</p>
              )}
            </div>
          </section>
        ))}

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
