import clsx from "clsx";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import SelectInput from "../../FormInputs/SelectInput";
import type { Character, CharacterSpeciesChoices } from "../../../../types";
import { speciesOptions } from "../../../../pages/CharactersPage/constants";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getSelectedSubclassForCharacter,
  getSubclassOptionsForClassName,
  normalizeSubclassId
} from "../../../../pages/CharactersPage/subclasses";
import {
  formatBodySize,
  getBodySizeLabelForCharacter,
  getSpeciesBodySizeOptions,
  normalizeCharacterSpeciesChoices,
  normalizeCharacterSpeciesFeatureState,
  normalizeSpeciesStatusEntriesForCharacter
} from "../../../../pages/CharactersPage/species";
import { getClassSignatureStyle } from "../../classSignature";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import CharacterProgressModal from "./CharacterProgressModal";
import styles from "./CharacterProfileForm.module.css";
import InlineToggleButton from "../InlineToggleButton";

type ProfileDraft = {
  species: string;
  speciesChoices?: CharacterSpeciesChoices;
  subclassId: string;
};

type CharacterProfileFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function createProfileDraft(character: Character): ProfileDraft {
  return {
    species: character.species,
    speciesChoices: normalizeCharacterSpeciesChoices(character.species, character.speciesChoices),
    subclassId: character.subclassId ?? ""
  };
}

function CharacterProfileForm({
  character,
  className,
  onPersistCharacter
}: CharacterProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isNotesVisible, setIsNotesVisible] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(() =>
    createProfileDraft(character)
  );
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setProfileDraft(createProfileDraft(character));
    }
  }, [character, isEditing]);

  const selectedSubclass = getSelectedSubclassForCharacter(character);
  const subclassOptions = getSubclassOptionsForClassName(character.className);
  const subclassLabel = selectedSubclass?.name ?? "No subclass selected";
  const bodySizeOptions = getSpeciesBodySizeOptions(profileDraft.species);
  const selectedBodySize =
    normalizeCharacterSpeciesChoices(profileDraft.species, profileDraft.speciesChoices)?.bodySize ??
    "";

  function beginEditing() {
    setProfileDraft(createProfileDraft(character));
    setIsEditing(true);
  }

  function cancelEditing() {
    setProfileDraft(createProfileDraft(character));
    setIsEditing(false);
  }

  function saveProfile() {
    const normalizedSpecies = profileDraft.species.trim();
    const normalizedSpeciesChoices = normalizeCharacterSpeciesChoices(
      normalizedSpecies,
      profileDraft.speciesChoices
    );
    const normalizedBodySizeOptions = getSpeciesBodySizeOptions(normalizedSpecies);

    if (
      !normalizedSpecies ||
      (normalizedBodySizeOptions.length > 1 && !normalizedSpeciesChoices?.bodySize)
    ) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      return {
        ...currentCharacter,
        species: normalizedSpecies,
        speciesChoices: normalizedSpeciesChoices,
        speciesFeatureState: normalizeCharacterSpeciesFeatureState(
          normalizedSpecies,
          currentCharacter.species === normalizedSpecies
            ? currentCharacter.speciesFeatureState
            : undefined
        ),
        statusEntries: normalizeSpeciesStatusEntriesForCharacter({
          species: normalizedSpecies,
          level: currentCharacter.level,
          statusEntries: currentCharacter.statusEntries
        }),
        subclassId: normalizeSubclassId(profileDraft.subclassId, currentCharacter.className) ?? ""
      };
    });

    setIsEditing(false);
  }

  function openProgressModal() {
    setIsProgressModalOpen(true);
  }

  function closeProgressModal() {
    setIsProgressModalOpen(false);
  }

  return (
    <article
      className={clsx(shared.sectionCard, styles.profileCard, className)}
      style={getClassSignatureStyle(character.className)}
    >
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Character profile</p>
          <h2 className={shared.title}>{character.name}</h2>
        </div>
        {isEditing ? null : (
          <button type="button" className={shared.editButton} onClick={beginEditing}>
            <Pencil size={16} />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className={shared.formGrid}>
          <label className={shared.field}>
            <span className={shared.fieldLabel}>Species</span>
            <SelectInput
              value={profileDraft.species}
              onChange={(event) =>
                setProfileDraft((current) => ({
                  ...current,
                  species: event.target.value,
                  speciesChoices: undefined
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

          {bodySizeOptions.length > 0 ? (
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Size</span>
              <SelectInput
                value={selectedBodySize}
                disabled={bodySizeOptions.length === 1}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    speciesChoices: {
                      ...(current.speciesChoices ?? {}),
                      bodySize: event.target.value as CharacterSpeciesChoices["bodySize"]
                    }
                  }))
                }
              >
                {bodySizeOptions.length > 1 ? <option value="">Select a size</option> : null}
                {bodySizeOptions.map((bodySize) => (
                  <option key={bodySize} value={bodySize}>
                    {formatBodySize(bodySize)}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Subclass</span>
            <SelectInput
              value={profileDraft.subclassId}
              disabled={subclassOptions.length === 0}
              onChange={(event) =>
                setProfileDraft((current) => ({
                  ...current,
                  subclassId: event.target.value
                }))
              }
            >
              <option value="">No subclass selected</option>
              {subclassOptions.map((subclass) => (
                <option key={subclass.id} value={subclass.id}>
                  {subclass.name}
                </option>
              ))}
            </SelectInput>
          </label>

          <div className={shared.formActions}>
            <button type="button" className={shared.saveButton} onClick={saveProfile}>
              Save
            </button>
            <button type="button" className={shared.cancelButton} onClick={cancelEditing}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <ul className={styles.metaList}>
            <li>
              <span>Class</span>
              <strong>{character.className}</strong>
            </li>
            <li>
              <span>Subclass</span>
              <strong>{subclassLabel}</strong>
            </li>
            <li>
              <span>Species</span>
              <strong>{character.species}</strong>
            </li>
            <li>
              <span>Size</span>
              <strong>{getBodySizeLabelForCharacter(character)}</strong>
            </li>
            <li>
              <span>Background</span>
              <strong>{character.background || "-"}</strong>
            </li>
            <li className={styles.metaLevelCell}>
              <span>Level</span>
              <strong>{character.level}</strong>
              <button type="button" className={styles.xpShortcutButton} onClick={openProgressModal}>
                XP
              </button>
            </li>
          </ul>
          <InlineToggleButton
            label={isNotesVisible ? "Hide Character Notes" : "Show Character Notes"}
            expanded={isNotesVisible}
            onClick={() => setIsNotesVisible((current) => !current)}
          />
          {isNotesVisible ? (
            <div className={styles.notesPanel}>
              <p className={styles.notesRow}>
                <span>Character Notes</span>
                <strong>{character.backgroundNotes || "-"}</strong>
              </p>
            </div>
          ) : null}
        </>
      )}

      {isProgressModalOpen ? (
        <CharacterProgressModal
          character={character}
          onClose={closeProgressModal}
          onPersistCharacter={onPersistCharacter}
        />
      ) : null}
    </article>
  );
}

export default CharacterProfileForm;
