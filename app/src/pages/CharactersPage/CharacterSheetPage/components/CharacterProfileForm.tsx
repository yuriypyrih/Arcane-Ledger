import clsx from "clsx";
import { Pencil, Save, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import NumberInput from "../../../../components/CharactersPage/FormInputs/NumberInput";
import SelectInput from "../../../../components/CharactersPage/FormInputs/SelectInput";
import TextAreaInput from "../../../../components/CharactersPage/FormInputs/TextAreaInput";
import TextInput from "../../../../components/CharactersPage/FormInputs/TextInput";
import type { Character } from "../../../../types";
import { classOptions, speciesOptions } from "../../constants";
import type { IdentityDraft } from "../types";
import { clampNumber } from "../utils";
import shared from "./CharacterSheetSectionShared.module.css";
import styles from "./CharacterProfileForm.module.css";

type CharacterProfileFormProps = {
  className?: string;
  character: Character;
  identityDraft: IdentityDraft;
  isEditing: boolean;
  isBackgroundVisible: boolean;
  alignmentOptions: Character["alignment"][];
  onBeginEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onOpenXpPopup: () => void;
  onToggleBackgroundVisibility: () => void;
  setIdentityDraft: Dispatch<SetStateAction<IdentityDraft>>;
};

function CharacterProfileForm({
  className,
  character,
  identityDraft,
  isEditing,
  isBackgroundVisible,
  alignmentOptions,
  onBeginEdit,
  onCancel,
  onSave,
  onOpenXpPopup,
  onToggleBackgroundVisibility,
  setIdentityDraft
}: CharacterProfileFormProps) {
  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Character profile</p>
          <h2 className={shared.title}>{character.name}</h2>
        </div>
        {isEditing ? null : (
          <button type="button" className={shared.editButton} onClick={onBeginEdit}>
            <Pencil size={16} />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className={shared.formGrid}>
          <label className={shared.field}>
            <span>Name</span>
            <TextInput
              value={identityDraft.name}
              onChange={(event) =>
                setIdentityDraft((current) => ({
                  ...current,
                  name: event.target.value
                }))
              }
            />
          </label>

          <label className={shared.field}>
            <span>Species</span>
            <SelectInput
              value={identityDraft.species}
              onChange={(event) =>
                setIdentityDraft((current) => ({
                  ...current,
                  species: event.target.value
                }))
              }
            >
              <option value="">Select a species</option>
              {speciesOptions.map((species) => (
                <option key={species} value={species}>
                  {species}
                </option>
              ))}
            </SelectInput>
          </label>

          <label className={shared.field}>
            <span>Class</span>
            <SelectInput
              value={identityDraft.className}
              onChange={(event) =>
                setIdentityDraft((current) => ({
                  ...current,
                  className: event.target.value
                }))
              }
            >
              <option value="">Select a class</option>
              {classOptions.map((characterClass) => (
                <option key={characterClass} value={characterClass}>
                  {characterClass}
                </option>
              ))}
            </SelectInput>
          </label>

          <label className={shared.field}>
            <span>Level</span>
            <NumberInput
              min={1}
              max={20}
              value={identityDraft.level}
              onChange={(event) =>
                setIdentityDraft((current) => ({
                  ...current,
                  level: clampNumber(event.target.value, 1, 20, current.level)
                }))
              }
            />
          </label>

          <label className={shared.field}>
            <span>Alignment</span>
            <SelectInput
              value={identityDraft.alignment}
              onChange={(event) =>
                setIdentityDraft((current) => ({
                  ...current,
                  alignment: event.target.value as Character["alignment"]
                }))
              }
            >
              {alignmentOptions.map((alignment) => (
                <option key={alignment} value={alignment}>
                  {alignment}
                </option>
              ))}
            </SelectInput>
          </label>

          <label className={shared.fieldWide}>
            <span>Background</span>
            <TextAreaInput
              value={identityDraft.background}
              onChange={(event) =>
                setIdentityDraft((current) => ({
                  ...current,
                  background: event.target.value
                }))
              }
              placeholder="Background, Personal Traits, Ideals, Bonds, Flaws, etc."
            />
          </label>

          <div className={shared.formActions}>
            <button type="button" className={shared.saveButton} onClick={onSave}>
              <Save size={16} />
              Save
            </button>
            <button type="button" className={shared.cancelButton} onClick={onCancel}>
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <ul className={styles.metaList}>
            <li>
              <span>Species</span>
              <strong>{character.species}</strong>
            </li>
            <li>
              <span>Class</span>
              <strong>{character.className}</strong>
            </li>
            <li className={styles.metaLevelCell}>
              <span>Level</span>
              <strong>{character.level}</strong>
              <button type="button" className={styles.xpShortcutButton} onClick={onOpenXpPopup}>
                XP
              </button>
            </li>
          </ul>
          <button
            type="button"
            className={styles.backgroundToggleButton}
            onClick={onToggleBackgroundVisibility}
          >
            {isBackgroundVisible ? "Hide Character background" : "Show Character background"}
          </button>
          {isBackgroundVisible ? (
            <div className={styles.backgroundPanel}>
              <p className={styles.backgroundAlignmentRow}>
                <span>Alignment</span>
                <strong>{character.alignment}</strong>
              </p>
              {character.background ? (
                <p className={styles.backgroundText}>{character.background}</p>
              ) : (
                <p className={shared.emptyText}>No background found for this character.</p>
              )}
            </div>
          ) : null}
        </>
      )}
    </article>
  );
}

export default CharacterProfileForm;
