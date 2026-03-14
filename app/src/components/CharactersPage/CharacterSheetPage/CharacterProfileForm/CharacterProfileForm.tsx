import clsx from "clsx";
import { Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import NumberInput from "../../FormInputs/NumberInput";
import SelectInput from "../../FormInputs/SelectInput";
import TextAreaInput from "../../FormInputs/TextAreaInput";
import TextInput from "../../FormInputs/TextInput";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { Character } from "../../../../types";
import {
  MAX_CHARACTER_LEVEL,
  getMinimumXpForLevel,
  getNextLevelThreshold,
  getXpProgressPercent
} from "../../../../pages/CharactersPage/experience";
import { classOptions, speciesOptions } from "../../../../pages/CharactersPage/constants";
import {
  backgroundOptions,
  isBackgroundName,
  normalizeCharacterEquipmentSelectionsForClass,
  normalizeManualSkillSelections,
  normalizeSkillExpertiseSelectionsForCharacter
} from "../../../../pages/CharactersPage/proficiency";
import type {
  IdentityDraft,
  PersistCharacterUpdater,
  XpDraft
} from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  alignmentOptions,
  clampNumber,
  formatCount
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./CharacterProfileForm.module.css";
import InlineToggleButton from "../InlineToggleButton";

type CharacterProfileFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function createIdentityDraft(character: Character): IdentityDraft {
  return {
    name: character.name,
    species: character.species,
    className: character.className,
    level: character.level,
    alignment: character.alignment,
    background: character.background,
    backgroundNotes: character.backgroundNotes
  };
}

function createXpDraft(character: Character): XpDraft {
  return {
    level: character.level,
    xp: character.xp
  };
}

function CharacterProfileForm({ className, onPersistCharacter }: CharacterProfileFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [isEditing, setIsEditing] = useState(false);
  const [isBackgroundVisible, setIsBackgroundVisible] = useState(false);
  const [identityDraft, setIdentityDraft] = useState<IdentityDraft>(() =>
    createIdentityDraft(character)
  );
  const [xpDraft, setXpDraft] = useState<XpDraft>(() => createXpDraft(character));
  const [xpAddAmount, setXpAddAmount] = useState(300);
  const [isXpPopupOpen, setIsXpPopupOpen] = useState(false);
  const [isXpManualEditMode, setIsXpManualEditMode] = useState(false);

  useBodyScrollLock(isXpPopupOpen);

  useEffect(() => {
    if (!isEditing) {
      setIdentityDraft(createIdentityDraft(character));
    }
  }, [
    character.name,
    character.species,
    character.className,
    character.level,
    character.alignment,
    character.background,
    character.backgroundNotes,
    isEditing
  ]);

  useEffect(() => {
    if (!isXpPopupOpen || isXpManualEditMode) {
      return;
    }

    setXpDraft(createXpDraft(character));
  }, [character.level, character.xp, isXpPopupOpen, isXpManualEditMode]);

  useEffect(() => {
    if (!isXpPopupOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsXpPopupOpen(false);
        setIsXpManualEditMode(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isXpPopupOpen]);

  function beginEditing() {
    setIdentityDraft(createIdentityDraft(character));
    setIsEditing(true);
  }

  function cancelEditing() {
    setIdentityDraft(createIdentityDraft(character));
    setIsEditing(false);
  }

  function saveIdentity() {
    const normalizedName = identityDraft.name.trim();
    const normalizedSpecies = identityDraft.species.trim();
    const normalizedClassName = identityDraft.className.trim();
    const normalizedBackground = identityDraft.background.trim();

    if (
      !normalizedName ||
      !normalizedSpecies ||
      !normalizedClassName ||
      !normalizedBackground ||
      !isBackgroundName(normalizedBackground)
    ) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const normalizedSkills = normalizeManualSkillSelections(currentCharacter.skills);
      const normalizedEquipment = normalizeCharacterEquipmentSelectionsForClass(
        normalizedClassName,
        currentCharacter.equipment
      );
      const normalizedSkillExpertise = normalizeSkillExpertiseSelectionsForCharacter(
        normalizedClassName,
        normalizedSpecies,
        normalizedBackground,
        normalizedSkills,
        currentCharacter.skillExpertise ?? []
      );

      return {
        ...currentCharacter,
        name: normalizedName,
        species: normalizedSpecies,
        className: normalizedClassName,
        level: clampNumber(identityDraft.level, 1, 20, currentCharacter.level),
        alignment: alignmentOptions.includes(identityDraft.alignment)
          ? identityDraft.alignment
          : "True Neutral",
        background: normalizedBackground,
        backgroundNotes: identityDraft.backgroundNotes.trim(),
        skills: normalizedSkills,
        skillExpertise: normalizedSkillExpertise,
        equipment: normalizedEquipment
      };
    });

    setIsEditing(false);
  }

  function openXpPopup() {
    setXpDraft(createXpDraft(character));
    setIsXpManualEditMode(false);
    setIsXpPopupOpen(true);
  }

  function closeXpPopup() {
    setIsXpPopupOpen(false);
    setIsXpManualEditMode(false);
  }

  function addXp() {
    const nextXpAmount = clampNumber(xpAddAmount, 1, 99999999, 300);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      xp: currentCharacter.xp + nextXpAmount
    }));

    setXpAddAmount(nextXpAmount);
  }

  function addSingleLevel() {
    if (character.level >= MAX_CHARACTER_LEVEL) {
      return;
    }

    const targetLevel = Math.min(MAX_CHARACTER_LEVEL, character.level + 1);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      level: targetLevel,
      xp: Math.max(currentCharacter.xp, getMinimumXpForLevel(targetLevel))
    }));
  }

  function beginXpManualEdit() {
    setXpDraft(createXpDraft(character));
    setIsXpManualEditMode(true);
  }

  function cancelXpManualEdit() {
    setXpDraft(createXpDraft(character));
    setIsXpManualEditMode(false);
  }

  function saveXpManualEdit() {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      level: clampNumber(xpDraft.level, 1, MAX_CHARACTER_LEVEL, currentCharacter.level),
      xp: clampNumber(xpDraft.xp, 0, 99999999, currentCharacter.xp)
    }));

    setIsXpManualEditMode(false);
  }

  const nextLevelThreshold = getNextLevelThreshold(character.level);
  const xpProgressPercent = getXpProgressPercent(character.level, character.xp);
  const nextLevelLabel = nextLevelThreshold === null ? "MAX" : String(character.level + 1);
  const nextLevelXpLabel =
    nextLevelThreshold === null ? "MAX" : `${formatCount(nextLevelThreshold)} XP`;

  return (
    <article className={clsx(shared.sectionCard, className)}>
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

          <label className={shared.field}>
            <span>Background</span>
            <SelectInput
              value={identityDraft.background}
              onChange={(event) =>
                setIdentityDraft((current) => ({
                  ...current,
                  background: event.target.value
                }))
              }
            >
              <option value="">Select a background</option>
              {backgroundOptions.map((background) => (
                <option key={background} value={background}>
                  {background}
                </option>
              ))}
            </SelectInput>
          </label>

          <label className={shared.fieldWide}>
            <span>Background Notes</span>
            <TextAreaInput
              className={styles.backgroundNotesInput}
              rows={4}
              value={identityDraft.backgroundNotes}
              onChange={(event) =>
                setIdentityDraft((current) => ({
                  ...current,
                  backgroundNotes: event.target.value
                }))
              }
            />
          </label>

          <div className={shared.formActions}>
            <button type="button" className={shared.saveButton} onClick={saveIdentity}>
              <Save size={16} />
              Save
            </button>
            <button type="button" className={shared.cancelButton} onClick={cancelEditing}>
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
              <button type="button" className={styles.xpShortcutButton} onClick={openXpPopup}>
                XP
              </button>
            </li>
          </ul>
          <InlineToggleButton
            label={isBackgroundVisible ? "Hide Character background" : "Show Character background"}
            expanded={isBackgroundVisible}
            onClick={() => setIsBackgroundVisible((current) => !current)}
          />
          {isBackgroundVisible ? (
            <div className={styles.backgroundPanel}>
              <div className={styles.backgroundMetaRow}>
                <p className={styles.backgroundAlignmentRow}>
                  <span>Background</span>
                  <strong>{character.background || "-"}</strong>
                  <span className={styles.backgroundAlignmentLabel}>Alignment</span>
                  <strong>{character.alignment}</strong>
                </p>
              </div>
              <p className={styles.backgroundNotesRow}>
                <span>Background Notes</span>
                <strong>{character.backgroundNotes || "-"}</strong>
              </p>
            </div>
          ) : null}
        </>
      )}

      {isXpPopupOpen ? (
        <div className={sheetStyles.xpPopupBackdrop} role="presentation" onClick={closeXpPopup}>
          <section
            className={sheetStyles.xpPopupCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="xp-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Character progress</p>
                <h3 id="xp-popup-title">
                  Experience {character.level} -&gt; {nextLevelLabel}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={closeXpPopup}
                aria-label="Close experience popup"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.xpProgressMetaRow}>
              <div className={sheetStyles.xpProgressMetaItem}>
                <span>Current XP</span>
                <strong>{formatCount(character.xp)}</strong>
              </div>
              <div
                className={clsx(
                  sheetStyles.xpProgressMetaItem,
                  sheetStyles.xpProgressMetaItemRight
                )}
              >
                <span>Next Level XP</span>
                <strong>{nextLevelXpLabel}</strong>
              </div>
            </div>

            <div className={sheetStyles.xpProgressTrack}>
              <div
                className={sheetStyles.xpProgressFill}
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>

            {isXpManualEditMode ? (
              <>
                <div className={sheetStyles.formGrid}>
                  <label className={sheetStyles.field}>
                    <span>Level</span>
                    <NumberInput
                      min={1}
                      max={MAX_CHARACTER_LEVEL}
                      value={xpDraft.level}
                      onChange={(event) =>
                        setXpDraft((current) => ({
                          ...current,
                          level: clampNumber(
                            event.target.value,
                            1,
                            MAX_CHARACTER_LEVEL,
                            current.level
                          )
                        }))
                      }
                    />
                  </label>
                  <label className={sheetStyles.field}>
                    <span>XP</span>
                    <NumberInput
                      min={0}
                      value={xpDraft.xp}
                      onChange={(event) =>
                        setXpDraft((current) => ({
                          ...current,
                          xp: clampNumber(event.target.value, 0, 99999999, current.xp)
                        }))
                      }
                    />
                  </label>
                </div>
                <p className={sheetStyles.helperText}>
                  XP and level auto-correct on save: XP is raised to level minimum, and level
                  increases when XP reaches a higher threshold.
                </p>
                <div className={sheetStyles.formActions}>
                  <button
                    type="button"
                    className={sheetStyles.saveButton}
                    onClick={saveXpManualEdit}
                  >
                    Save values
                  </button>
                  <button
                    type="button"
                    className={sheetStyles.cancelButton}
                    onClick={cancelXpManualEdit}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className={sheetStyles.xpActionGrid}>
                <label className={sheetStyles.xpAddField}>
                  <span>Add XP</span>
                  <NumberInput
                    min={1}
                    className={sheetStyles.xpAddInput}
                    value={xpAddAmount}
                    onChange={(event) =>
                      setXpAddAmount((current) =>
                        clampNumber(event.target.value, 1, 99999999, current)
                      )
                    }
                  />
                </label>
                <div className={sheetStyles.xpQuickActionRow}>
                  <button type="button" className={sheetStyles.saveButton} onClick={addXp}>
                    Add XP
                  </button>
                  <button
                    type="button"
                    className={sheetStyles.cancelButton}
                    onClick={addSingleLevel}
                    disabled={character.level >= MAX_CHARACTER_LEVEL}
                  >
                    Add 1 level
                  </button>
                  <button
                    type="button"
                    className={sheetStyles.editButton}
                    onClick={beginXpManualEdit}
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </article>
  );
}

export default CharacterProfileForm;
