import clsx from "clsx";
import { ScrollText, UsersRound } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { CharacterPortraitMutationResponse } from "../../../../api/characterPortraits";
import type { Character } from "../../../../types";
import {
  setActiveCharacterSheet,
  useAppDispatch,
  useAppSelector
} from "../../../../store";
import { createPortableCharacterSheetSyncPayload } from "../../../../characterSync/characterSyncRecords";
import { upsertCharacterRosterCacheDocument } from "../../../../pages/CharactersPage/characterRoster";
import { createPortableCharacterSheet } from "../../../../pages/CharactersPage/portableCharacterSheet";
import { storeCloudCharacterSheetDocument } from "../../../../pages/CharactersPage/resolvePortableCharacterSheet";
import { normalizeCharacter } from "../../../../pages/CharactersPage/storage";
import { getCharacterRuntime } from "../../../../pages/CharactersPage/characterRuntime/characterRuntime";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getSelectedSubclassForCharacter } from "../../../../pages/CharactersPage/subclasses";
import { getClassSignatureStyle } from "../../classSignature";
import CharacterNotesDrawer from "./CharacterNotesDrawer";
import CharacterProgressModal from "./CharacterProgressModal";
import CharacterPortraitButton from "./CharacterPortraitButton";
import CharacterPortraitModal from "./CharacterPortraitModal";
import styles from "./CharacterProfileForm.module.css";
import InlineToggleButton from "../InlineToggleButton";
import { useCoreStatReferenceDrawer } from "../StatsForm/useCoreStatReferenceDrawer";
import CoreStatCards from "../StatsForm/CoreStatCards";
import useCharacterPortrait from "./useCharacterPortrait";

type CharacterProfileFormProps = {
  broadLayout?: boolean;
  character: Character;
  className?: string;
  isCompanionLimitReached?: boolean;
  onPersistCharacter: PersistCharacterUpdater;
  onRequestCreateCompanion?: () => void;
};

function CharacterProfileForm({
  broadLayout = false,
  character,
  className,
  isCompanionLimitReached = false,
  onPersistCharacter,
  onRequestCreateCompanion
}: CharacterProfileFormProps) {
  const dispatch = useAppDispatch();
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === "authenticated";
  const remoteCharacterId = character.storageMetadata?.sync?.remoteId ?? null;
  const isUploadEnabled = isAuthenticated && Boolean(remoteCharacterId);
  const activePortraitUrl =
    isAuthenticated && remoteCharacterId
      ? (character.storageMetadata?.avatar?.imageUrl ?? null)
      : null;
  const portraitUnavailableMessage = !isAuthenticated
    ? "Avatar editing is reserved for logged in users only."
    : !remoteCharacterId
      ? "Save this character to your account before editing its avatar."
      : null;
  const handlePortraitMutationComplete = useCallback(
    (response: CharacterPortraitMutationResponse) => {
      upsertCharacterRosterCacheDocument(response.character.ownerId, response.character);
      const record = storeCloudCharacterSheetDocument(response.character, {
        localId: character.id
      });
      const nextCharacter = normalizeCharacter(record);

      if (nextCharacter) {
        dispatch(
          setActiveCharacterSheet({
            character: nextCharacter,
            characterId: record.identity.localId
          })
        );
      }
    },
    [character.id, dispatch]
  );
  const createPortraitSyncPayload = useCallback(() => {
    const sync = character.storageMetadata?.sync;

    if (!sync?.ownerId || !sync.remoteId || !sync.remoteRevision) {
      return null;
    }

    return createPortableCharacterSheetSyncPayload(createPortableCharacterSheet(character), {
      includeBaseRevision: true,
      ownerId: sync.ownerId
    });
  }, [character]);
  const characterPortrait = useCharacterPortrait({
    characterSheetId: remoteCharacterId,
    createSyncPayload: createPortraitSyncPayload,
    initialPortraitUrl: activePortraitUrl,
    isUploadEnabled,
    onMutationComplete: handlePortraitMutationComplete
  });

  const combatSummary = useMemo(() => getCharacterRuntime(character).combatSummary, [character]);
  const profileCoreStatRows = broadLayout
    ? combatSummary.coreStats.broadProfileRows
    : combatSummary.coreStats.profileRows;
  const profileCoreStatColumns = combatSummary.coreStats.profileColumns;
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
              <p className={clsx(styles.identityMetaLine, styles.identityClassLine)}>
                {identityLine}
                {selectedSubclass ? (
                  <span className={styles.identitySubclassLine}> ({selectedSubclass.name})</span>
                ) : null}
              </p>
              <p className={styles.identityMetaLine}>{character.alignment}</p>
            </div>
            <div className={styles.profileActionLinks}>
              <InlineToggleButton
                className={styles.notesToggle}
                icon={<ScrollText size={15} aria-hidden="true" />}
                label="Show Character Notes"
                expanded={isNotesDrawerOpen}
                onClick={openNotesDrawer}
              />
              {onRequestCreateCompanion ? (
                <InlineToggleButton
                  className={styles.companionToggle}
                  icon={<UsersRound size={15} aria-hidden="true" />}
                  label="Add Companion"
                  disabled={isCompanionLimitReached}
                  onClick={onRequestCreateCompanion}
                />
              ) : null}
            </div>
          </div>

          <aside
            className={clsx(styles.profileSummary, broadLayout && styles.profileSummaryBroad)}
            aria-label="Character quick stats"
          >
            <CoreStatCards
              rows={profileCoreStatRows}
              condensedColumns={profileCoreStatColumns}
              profileTexture
              rowFlow={broadLayout ? "condensed" : "grid"}
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
          unavailableMessage={portraitUnavailableMessage}
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
