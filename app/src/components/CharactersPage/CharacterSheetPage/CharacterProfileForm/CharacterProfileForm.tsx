import clsx from "clsx";
import { useState } from "react";
import type { Character } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getSelectedSubclassForCharacter } from "../../../../pages/CharactersPage/subclasses";
import { getBodySizeLabelForCharacter } from "../../../../pages/CharactersPage/species";
import { getClassSignatureStyle } from "../../classSignature";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import CharacterProgressModal from "./CharacterProgressModal";
import styles from "./CharacterProfileForm.module.css";
import InlineToggleButton from "../InlineToggleButton";

type CharacterProfileFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function CharacterProfileForm({
  character,
  className,
  onPersistCharacter
}: CharacterProfileFormProps) {
  const [isNotesVisible, setIsNotesVisible] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const selectedSubclass = getSelectedSubclassForCharacter(character);
  const subclassLabel = selectedSubclass?.name ?? "No subclass selected";

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
      </div>

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
