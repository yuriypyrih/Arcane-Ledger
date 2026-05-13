import clsx from "clsx";
import { User } from "lucide-react";
import { useState } from "react";
import type { Character } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getClassSignatureStyle } from "../../classSignature";
import CharacterProgressModal from "./CharacterProgressModal";
import styles from "./CharacterProfileForm.module.css";
import InlineToggleButton from "../InlineToggleButton";
import {
  createBroadProfileCoreStatRows,
  createProfileCoreStatColumns,
  createProfileCoreStatRows
} from "../StatsForm/coreStatModel";
import { useCoreStatReferenceDrawer } from "../StatsForm/useCoreStatReferenceDrawer";
import CoreStatCards from "../StatsForm/CoreStatCards";

type CharacterProfileFormProps = {
  broadLayout?: boolean;
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function CharacterProfileForm({
  broadLayout = false,
  character,
  className,
  onPersistCharacter
}: CharacterProfileFormProps) {
  const [isNotesVisible, setIsNotesVisible] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const profileCoreStatRows = broadLayout
    ? createBroadProfileCoreStatRows(character)
    : createProfileCoreStatRows(character);
  const profileCoreStatColumns = createProfileCoreStatColumns(character);
  const { coreStatReferenceDrawer, openCoreStatReference } = useCoreStatReferenceDrawer(
    character,
    onPersistCharacter
  );
  const identityLine = [character.species, character.className].filter(Boolean).join(" ");

  function openProgressModal() {
    setIsProgressModalOpen(true);
  }

  function closeProgressModal() {
    setIsProgressModalOpen(false);
  }

  return (
    <>
      <article
        className={clsx(styles.profileCard, broadLayout && styles.profileCardBroad, className)}
        style={getClassSignatureStyle(character.className)}
      >
        <div className={clsx(styles.profileShell, broadLayout && styles.profileShellBroad)}>
          <div className={styles.portraitFrame} aria-label="Character portrait placeholder">
            <User size={42} strokeWidth={1.8} aria-hidden="true" />
          </div>

          <div className={styles.identityBlock}>
            <div className={styles.nameStack}>
              <h2 className={styles.characterName}>{character.name}</h2>
              <button type="button" className={styles.levelButton} onClick={openProgressModal}>
                Level {character.level}
              </button>
            </div>
            <div className={styles.identityRows}>
              <p>{identityLine}</p>
            </div>
            <InlineToggleButton
              className={styles.notesToggle}
              label={isNotesVisible ? "Hide Character Notes" : "Show Character Notes"}
              expanded={isNotesVisible}
              onClick={() => setIsNotesVisible((current) => !current)}
            />
          </div>

          <aside
            className={clsx(styles.profileSummary, broadLayout && styles.profileSummaryBroad)}
            aria-label="Character quick stats"
          >
            <CoreStatCards
              rows={profileCoreStatRows}
              condensedColumns={profileCoreStatColumns}
              profileTexture
              rowFlow={broadLayout ? "condensed" : "responsive-condensed"}
              onOpenCard={openCoreStatReference}
            />
          </aside>
        </div>

        {isNotesVisible ? (
          <div className={styles.notesPanel}>
            <p className={styles.notesRow}>
              <span>Character Notes</span>
              <strong>{character.backgroundNotes || "-"}</strong>
            </p>
          </div>
        ) : null}
      </article>
      {isProgressModalOpen ? (
        <CharacterProgressModal
          character={character}
          onClose={closeProgressModal}
          onPersistCharacter={onPersistCharacter}
        />
      ) : null}
      {coreStatReferenceDrawer}
    </>
  );
}

export default CharacterProfileForm;
