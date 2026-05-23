import clsx from "clsx";
import { ScrollText } from "lucide-react";
import { useState } from "react";
import type { Character } from "../../../../types";
import { useAppSelector } from "../../../../store";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getSelectedSubclassForCharacter } from "../../../../pages/CharactersPage/subclasses";
import { getClassSignatureStyle } from "../../classSignature";
import CharacterNotesDrawer from "./CharacterNotesDrawer";
import CharacterProgressModal from "./CharacterProgressModal";
import CharacterPortraitButton from "./CharacterPortraitButton";
import CharacterPortraitModal from "./CharacterPortraitModal";
import styles from "./CharacterProfileForm.module.css";
import InlineToggleButton from "../InlineToggleButton";
import {
  createBroadProfileCoreStatRows,
  createProfileCoreStatColumns,
  createProfileCoreStatRows
} from "../StatsForm/coreStatModel";
import { useCoreStatReferenceDrawer } from "../StatsForm/useCoreStatReferenceDrawer";
import CoreStatCards from "../StatsForm/CoreStatCards";
import useCharacterPortrait from "./useCharacterPortrait";

function isAvatarUploadFeatureEnabled() {
  return import.meta.env.VITE_CHARACTER_AVATAR_UPLOAD_ENABLED?.trim().toLowerCase() === "true";
}

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
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === "authenticated";
  const isUploadEnabled = isAuthenticated && isAvatarUploadFeatureEnabled();
  const characterPortrait = useCharacterPortrait(character.id, { isUploadEnabled });

  const profileCoreStatRows = broadLayout
    ? createBroadProfileCoreStatRows(character)
    : createProfileCoreStatRows(character);
  const profileCoreStatColumns = createProfileCoreStatColumns(character);
  const { coreStatReferenceDrawer, openCoreStatReference } = useCoreStatReferenceDrawer(
    character,
    onPersistCharacter
  );
  const selectedSubclass = getSelectedSubclassForCharacter(character);
  const identityLine = [character.species, character.className].filter(Boolean).join(" ");

  function openProgressModal() {
    setIsProgressModalOpen(true);
  }

  function closeProgressModal() {
    setIsProgressModalOpen(false);
  }

  function openNotesDrawer() {
    setIsNotesDrawerOpen(true);
  }

  function closeNotesDrawer() {
    setIsNotesDrawerOpen(false);
  }

  function openPortraitModal() {
    setIsPortraitModalOpen(true);
  }

  function closePortraitModal() {
    setIsPortraitModalOpen(false);
    characterPortrait.clearError();
  }

  return (
    <>
      <article
        className={clsx(styles.profileCard, broadLayout && styles.profileCardBroad, className)}
        style={getClassSignatureStyle(character.className)}
      >
        <div className={clsx(styles.profileShell, broadLayout && styles.profileShellBroad)}>
          <CharacterPortraitButton
            characterName={character.name}
            isLoading={characterPortrait.isLoading}
            onClick={openPortraitModal}
            portraitUrl={characterPortrait.portraitUrl}
          />

          <div className={styles.identityBlock}>
            <div className={styles.nameStack}>
              <h2 className={styles.characterName}>{character.name}</h2>
              <button type="button" className={styles.levelButton} onClick={openProgressModal}>
                Level {character.level}
              </button>
            </div>
            <div className={styles.identityRows}>
              <p className={styles.identityClassLine}>
                {identityLine}
                {selectedSubclass ? (
                  <span className={styles.identitySubclassLine}> ({selectedSubclass.name})</span>
                ) : null}
              </p>
              <p>{character.alignment}</p>
            </div>
            <InlineToggleButton
              className={styles.notesToggle}
              icon={<ScrollText size={15} aria-hidden="true" />}
              label="Show Character Notes"
              expanded={isNotesDrawerOpen}
              onClick={openNotesDrawer}
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
      </article>
      {isNotesDrawerOpen ? (
        <CharacterNotesDrawer
          character={character}
          onClose={closeNotesDrawer}
          onPersistCharacter={onPersistCharacter}
        />
      ) : null}
      {isProgressModalOpen ? (
        <CharacterProgressModal
          character={character}
          onClose={closeProgressModal}
          onPersistCharacter={onPersistCharacter}
        />
      ) : null}
      {isPortraitModalOpen ? (
        <CharacterPortraitModal
          characterName={character.name}
          errorMessage={characterPortrait.errorMessage}
          hasCustomPortrait={characterPortrait.hasCustomPortrait}
          isAuthenticated={isAuthenticated}
          isUploadEnabled={isUploadEnabled}
          isSaving={characterPortrait.isSaving}
          onClearError={characterPortrait.clearError}
          onClose={closePortraitModal}
          onReset={characterPortrait.resetPortrait}
          onUpload={characterPortrait.savePortraitFile}
          portraitUrl={characterPortrait.portraitUrl}
        />
      ) : null}
      {coreStatReferenceDrawer}
    </>
  );
}

export default CharacterProfileForm;
