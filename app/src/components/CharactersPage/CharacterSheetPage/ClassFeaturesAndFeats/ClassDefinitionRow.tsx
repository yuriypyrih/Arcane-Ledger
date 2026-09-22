import { Trash2 } from "lucide-react";
import type {
  Character,
  CharacterClassEntry,
  CharacterCustomHitDie,
  CharacterCustomClassConfig
} from "../../../../types";
import { classOptions } from "../../../../pages/CharactersPage/proficiencyClassData";
import { getSubclassOptionsForClassName } from "../../../../pages/CharactersPage/subclasses";
import {
  createDefaultCustomSubclassConfig,
  CUSTOM_SUBCLASS_LABEL,
  CUSTOM_SUBCLASS_NAME_MAX_LENGTH,
  CUSTOM_CLASS_NAME_MAX_LENGTH
} from "../../../../pages/CharactersPage/customOrigins";
import { getCharacterClassRulesConfig } from "../../../../pages/CharactersPage/customClass";
import { getClassEditorCharacter } from "../../../../pages/CharactersPage/multiclass";
import {
  createDeclaredClass,
  removeDeclaredClass,
  setEntryRulesEnforced,
  type ClassDefinitionsDraft
} from "../../../../pages/CharactersPage/classDefinitions";
import ActionButton from "../../../ActionButton";
import SelectInput from "../../FormInputs/SelectInput";
import TextInput from "../../FormInputs/TextInput";
import ClassTrainingChoices from "./ClassTrainingChoices";
import styles from "./ClassDefinitionsEditor.module.css";

type Props = {
  character: Character;
  preview: Character;
  draft: ClassDefinitionsDraft;
  entry: CharacterClassEntry;
  index: number;
  rulesEnforced: boolean;
  onChange: (draft: ClassDefinitionsDraft) => void;
};

export default function ClassDefinitionRow({
  character,
  preview,
  draft,
  entry,
  index,
  rulesEnforced,
  onChange
}: Props) {
  const primary = entry.id === draft.progression.startingClassId;
  const custom = entry.className === "Custom";
  const name = entry.customClass?.name || entry.className || "New multiclass";
  const rules = getCharacterClassRulesConfig(getClassEditorCharacter(character, entry));
  const subclasses = getSubclassOptionsForClassName(entry.className);
  function update(next: CharacterClassEntry) {
    onChange({
      ...draft,
      progression: {
        ...draft.progression,
        classes: draft.progression.classes.map((item) => (item.id === entry.id ? next : item))
      }
    });
  }
  function patch(value: Partial<CharacterClassEntry>) {
    update({ ...entry, ...value });
  }
  return (
    <section className={styles.card} aria-label={`${name} class options`}>
      <div className={styles.identity}>
        <span>{primary ? "Starting class" : `Additional class ${index}`}</span>
        <span>Level {entry.level}</span>
      </div>
      <div className={`${styles.selectors} ${!primary ? styles.removable : ""}`}>
        <label className={styles.field}>
          <span>Class</span>
          <SelectInput
            compact
            aria-label={primary ? "Primary class" : `Multiclass ${index} class`}
            disabled={primary}
            value={entry.className}
            onChange={(event) => {
              if (entry.className !== event.target.value) {
                const next = createDeclaredClass(event.target.value, entry.level);
                update(setEntryRulesEnforced(character, next, rulesEnforced));
              }
            }}
          >
            <option value="" disabled>
              Choose class
            </option>
            {[...new Set([...classOptions, "Custom"])].map((className) => (
              <option
                key={className}
                value={className}
                disabled={
                  className !== "Custom" &&
                  draft.progression.classes.some(
                    (item) => item.id !== entry.id && item.className === className
                  )
                }
              >
                {className}
              </option>
            ))}
          </SelectInput>
        </label>
        <label className={styles.field}>
          <span>Subclass</span>
          <SelectInput
            compact
            aria-label={`${name} subclass`}
            disabled={custom || !entry.className}
            value={
              entry.subclassId
                ? entry.customSubclass?.id === entry.subclassId
                  ? "__custom"
                  : entry.subclassId
                : ""
            }
            onChange={(event) => {
              if (event.target.value === "__custom") {
                const customSubclass =
                  entry.customSubclass ?? createDefaultCustomSubclassConfig(entry.className);
                patch({ subclassId: customSubclass.id, customSubclass });
              } else
                patch({ subclassId: event.target.value || undefined, customSubclass: undefined });
            }}
          >
            <option value="">{custom ? "No subclass options" : "Select a subclass"}</option>
            {subclasses.map((subclass) => (
              <option key={subclass.id} value={subclass.id}>
                {subclass.name}
              </option>
            ))}
            {!custom ? <option value="__custom">{CUSTOM_SUBCLASS_LABEL}</option> : null}
          </SelectInput>
        </label>
        {!primary ? (
          <ActionButton
            variant="GHOST"
            actionType="ERROR"
            size="sm"
            fullWidth={false}
            iconOnly
            className={styles.remove}
            icon={<Trash2 size={16} aria-hidden="true" />}
            aria-label={`Remove ${name}`}
            onClick={() =>
              onChange({ ...draft, progression: removeDeclaredClass(draft.progression, entry.id) })
            }
          />
        ) : null}
      </div>
      {entry.customSubclass?.id === entry.subclassId && entry.customSubclass ? (
        <label className={styles.field}>
          <span>Custom subclass name</span>
          <TextInput
            value={entry.customSubclass.name}
            maxLength={CUSTOM_SUBCLASS_NAME_MAX_LENGTH}
            onChange={(event) =>
              patch({ customSubclass: { ...entry.customSubclass!, name: event.target.value } })
            }
          />
        </label>
      ) : null}
      {custom && entry.customClass ? (
        <div className={styles.choices}>
          <label className={styles.field}>
            <span>Custom class name</span>
            <TextInput
              value={entry.customClass.name ?? ""}
              maxLength={CUSTOM_CLASS_NAME_MAX_LENGTH}
              onChange={(event) =>
                patch({ customClass: { ...entry.customClass!, name: event.target.value } })
              }
            />
          </label>
          <label className={styles.field}>
            <span>Hit Die</span>
            <SelectInput
              compact
              value={entry.customClass.hitDie}
              onChange={(event) =>
                patch({
                  customClass: {
                    ...entry.customClass!,
                    hitDie: event.target.value as CharacterCustomHitDie
                  },
                  classRules: { ...rules, hitDie: event.target.value as CharacterCustomHitDie }
                })
              }
            >
              {["d6", "d8", "d10", "d12"].map((die) => (
                <option key={die}>{die}</option>
              ))}
            </SelectInput>
          </label>
          <label className={styles.field}>
            <span>Spellcasting</span>
            <SelectInput
              compact
              value={entry.customClass.castingProgression ?? "manual"}
              onChange={(event) => {
                const castingProgression = event.target
                  .value as CharacterCustomClassConfig["castingProgression"];
                patch({
                  classRules: {
                    ...rules,
                    mechanics: {
                      ...rules.mechanics,
                      spellcasting: { enabled: castingProgression !== "none" }
                    }
                  },
                  customClass: {
                    ...entry.customClass!,
                    castingProgression,
                    mechanics: {
                      ...entry.customClass!.mechanics,
                      spellcasting: { enabled: castingProgression !== "none" }
                    }
                  }
                });
              }}
            >
              {[
                ["none", "None"],
                ["full", "Full caster"],
                ["half", "Half caster"],
                ["third", "Third caster"],
                ["pact", "Pact Magic"],
                ["manual", "Manual slots"]
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectInput>
          </label>
        </div>
      ) : null}
      <ClassTrainingChoices character={preview} draft={draft} entry={entry} onChange={onChange} />
    </section>
  );
}
