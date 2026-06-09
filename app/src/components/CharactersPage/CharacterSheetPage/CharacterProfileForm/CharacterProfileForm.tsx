import clsx from "clsx";
import { ScrollText, UsersRound } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { CharacterBackgroundTextureMutationResponse } from "../../../../api/characterBackgroundTextures";
import type { CharacterSheetCloudDocument } from "../../../../api/characters";
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
import {
  getCharacterClassDisplayName,
  getCharacterSpeciesDisplayName,
  getCharacterSubclassDisplayName
} from "../../../../pages/CharactersPage/customOrigins";
import { getClassSignatureStyle } from "../../classSignature";
import CharacterNotesDrawer from "./CharacterNotesDrawer";
import CharacterProgressModal from "./CharacterProgressModal";
import CharacterPortraitButton from "./CharacterPortraitButton";
import CharacterPortraitModal from "./CharacterPortraitModal";
import styles from "./CharacterProfileForm.module.css";
import InlineToggleButton from "../InlineToggleButton";
import { useCoreStatReferenceDrawer } from "../StatsForm/useCoreStatReferenceDrawer";
import CoreStatCards from "../StatsForm/CoreStatCards";
import useCharacterBackgroundTexture from "./useCharacterBackgroundTexture";
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
  const activeBackgroundTexture =
    isAuthenticated && remoteCharacterId
      ? (character.storageMetadata?.backgroundTexture ?? null)
      : null;
  const profileImageUnavailableMessage = !isAuthenticated
    ? "Profile image editing is reserved for logged in users only."
    : !remoteCharacterId
      ? "Save this character to your account before editing profile images."
      : null;
  const applyCloudCharacterMutation = useCallback(
    (document: CharacterSheetCloudDocument) => {
      upsertCharacterRosterCacheDocument(document.ownerId, document);
      const record = storeCloudCharacterSheetDocument(document, {
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
  const handlePortraitMutationComplete = useCallback(
    (response: CharacterPortraitMutationResponse) => {
      applyCloudCharacterMutation(response.character);
    },
    [applyCloudCharacterMutation]
  );
  const handleBackgroundTextureMutationComplete = useCallback(
    (response: CharacterBackgroundTextureMutationResponse) => {
      applyCloudCharacterMutation(response.character);
    },
    [applyCloudCharacterMutation]
  );
  const createProfileImageSyncPayload = useCallback(() => {
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
    createSyncPayload: createProfileImageSyncPayload,
    initialPortraitUrl: activePortraitUrl,
    isUploadEnabled,
    onMutationComplete: handlePortraitMutationComplete
  });
  const characterBackgroundTexture = useCharacterBackgroundTexture({
    characterSheetId: remoteCharacterId,
    createSyncPayload: createProfileImageSyncPayload,
    initialBackgroundTexture: activeBackgroundTexture,
    isUploadEnabled,
    onMutationComplete: handleBackgroundTextureMutationComplete
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
  const customSubclassLabel = getCharacterSubclassDisplayName(character);
  const identityLine = [
    getCharacterSpeciesDisplayName(character),
    getCharacterClassDisplayName(character)
  ].filter(Boolean).join(" ");

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
    characterBackgroundTexture.clearError();
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
                {selectedSubclass || customSubclassLabel ? (
                  <span className={styles.identitySubclassLine}>
                    {" "}
                    ({selectedSubclass?.name ?? customSubclassLabel})
                  </span>
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
          characterClassName={character.className}
          backgroundErrorMessage={characterBackgroundTexture.errorMessage}
          backgroundTexture={characterBackgroundTexture.backgroundTexture}
          errorMessage={characterPortrait.errorMessage}
          hasCustomPortrait={characterPortrait.hasCustomPortrait}
          isAuthenticated={isAuthenticated}
          isBackgroundSaving={characterBackgroundTexture.isSaving}
          isUploadEnabled={isUploadEnabled}
          isSaving={characterPortrait.isSaving}
          unavailableMessage={profileImageUnavailableMessage}
          onBackgroundSelect={characterBackgroundTexture.saveSelection}
          onBackgroundUploadBlob={characterBackgroundTexture.saveTextureBlob}
          onClearBackgroundError={characterBackgroundTexture.clearError}
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
