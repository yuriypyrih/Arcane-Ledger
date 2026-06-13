import { useState, type ReactNode } from "react";
import type { CharacterBackgroundTextureSelection } from "../../../../api/characterBackgroundTextures";
import {
  cropAndScaleBackgroundTextureFile,
  type CharacterPortraitCropSettings
} from "../../../../pages/CharactersPage/characterPortraits";
import type { CharacterBackgroundTextureMetadata } from "../../../../types";
import {
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import CharacterBackgroundTexturePanel from "./CharacterBackgroundTexturePanel";
import CharacterPortraitPanel from "./CharacterPortraitPanel";
import styles from "./CharacterProfileForm.module.css";

type CharacterPortraitModalTab = "portrait" | "background";

type CharacterPortraitModalProps = {
  backgroundErrorMessage: string | null;
  backgroundTexture: CharacterBackgroundTextureMetadata | null;
  characterClassName: string;
  characterName: string;
  errorMessage: string | null;
  hasCustomPortrait: boolean;
  isAuthenticated: boolean;
  isBackgroundSaving: boolean;
  isUploadEnabled: boolean;
  isSaving: boolean;
  onBackgroundSelect: (selection: CharacterBackgroundTextureSelection) => Promise<boolean>;
  onBackgroundUploadBlob: (textureBlob: Blob) => Promise<boolean>;
  onClearBackgroundError: () => void;
  onClearError: () => void;
  onClose: () => void;
  onReset: () => Promise<void>;
  onUpload: (file: File, crop?: Partial<CharacterPortraitCropSettings>) => Promise<boolean>;
  portraitUrl: string | null;
  unavailableMessage: string | null;
};

function CharacterPortraitModal({
  backgroundErrorMessage,
  backgroundTexture,
  characterClassName,
  characterName,
  errorMessage,
  hasCustomPortrait,
  isAuthenticated,
  isBackgroundSaving,
  isUploadEnabled,
  isSaving,
  onBackgroundSelect,
  onBackgroundUploadBlob,
  onClearBackgroundError,
  onClearError,
  onClose,
  onReset,
  onUpload,
  portraitUrl,
  unavailableMessage
}: CharacterPortraitModalProps) {
  const [activeTab, setActiveTab] = useState<CharacterPortraitModalTab>("portrait");
  const [backgroundDraftSelection, setBackgroundDraftSelection] =
    useState<CharacterBackgroundTextureSelection | null>(null);
  const [backgroundDraftErrorMessage, setBackgroundDraftErrorMessage] = useState<string | null>(null);
  const [isProcessingBackgroundDraft, setIsProcessingBackgroundDraft] = useState(false);
  const resolvedName = characterName.trim() || "Character Portrait";
  const isModalSaving = isSaving || isBackgroundSaving || isProcessingBackgroundDraft;

  function clearBackgroundErrors() {
    setBackgroundDraftErrorMessage(null);
    onClearBackgroundError();
  }

  function isBackgroundSelectionCurrent(selection: CharacterBackgroundTextureSelection) {
    if (!backgroundTexture) {
      return selection.source === "default";
    }

    if (backgroundTexture.source === "predefined" && selection.source === "predefined") {
      return backgroundTexture.textureId === selection.textureId;
    }

    return backgroundTexture.source === selection.source;
  }

  function stageBackgroundSelection(selection: CharacterBackgroundTextureSelection) {
    clearBackgroundErrors();
    setBackgroundDraftSelection(isBackgroundSelectionCurrent(selection) ? null : selection);
  }

  function stageCurrentUploadedBackground() {
    clearBackgroundErrors();
    setBackgroundDraftSelection(null);
  }

  async function stageBackgroundUpload(file: File, crop?: Partial<CharacterPortraitCropSettings>) {
    clearBackgroundErrors();
    setIsProcessingBackgroundDraft(true);
    setBackgroundDraftSelection(null);
    let didSave = false;

    try {
      const texture = await cropAndScaleBackgroundTextureFile(file, { crop });
      didSave = await onBackgroundUploadBlob(texture.blob);

      if (didSave) {
        onClearError();
        clearBackgroundErrors();
        resetBackgroundDraft();
        onClose();
      }

      return didSave;
    } catch (error: unknown) {
      setBackgroundDraftErrorMessage(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Unable to process that background texture."
      );
      return false;
    } finally {
      if (!didSave) {
        setIsProcessingBackgroundDraft(false);
      }
    }
  }

  async function saveBackgroundDraftSelection() {
    if (!backgroundDraftSelection || isModalSaving) {
      return false;
    }

    setIsProcessingBackgroundDraft(true);

    const didSave = await onBackgroundSelect(backgroundDraftSelection);

    if (!didSave) {
      setIsProcessingBackgroundDraft(false);
      return false;
    }

    onClearError();
    clearBackgroundErrors();
    resetBackgroundDraft();
    onClose();
    return true;
  }

  function resetBackgroundDraft() {
    setBackgroundDraftSelection(null);
    setBackgroundDraftErrorMessage(null);
  }

  function closeModal() {
    if (isModalSaving) {
      return;
    }

    onClearError();
    clearBackgroundErrors();
    resetBackgroundDraft();
    onClose();
  }

  function renderTabButton(tab: CharacterPortraitModalTab, label: string): ReactNode {
    const active = activeTab === tab;

    return (
      <button
        type="button"
        className={[styles.portraitSegmentButton, active ? styles.portraitSegmentButtonActive : ""]
          .join(" ")
          .trim()}
        aria-pressed={active}
        onClick={() => setActiveTab(tab)}
      >
        {label}
      </button>
    );
  }

  const modeSwitch = (
    <div className={styles.portraitModeSwitch} aria-label="Profile image mode">
      {renderTabButton("portrait", "Character Portrait")}
      {renderTabButton("background", "Background Texture")}
    </div>
  );

  return (
    <SheetModal
      titleId="character-portrait-modal-title"
      onClose={closeModal}
      size="medium"
      panelClassName={styles.portraitModalPanel}
      isBusy={isModalSaving}
      busyLabel={activeTab === "portrait" ? "Saving portrait" : "Saving background texture"}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Character profile</OverlayEyebrow>
          <OverlayTitle id="character-portrait-modal-title">{resolvedName}</OverlayTitle>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close character profile images" onClick={closeModal} />
      </OverlayHeader>

      {activeTab === "portrait" ? (
        <CharacterPortraitPanel
          characterName={characterName}
          errorMessage={errorMessage}
          hasCustomPortrait={hasCustomPortrait}
          isAuthenticated={isAuthenticated}
          isUploadEnabled={isUploadEnabled}
          isSaving={isSaving}
          modeSwitch={modeSwitch}
          unavailableMessage={unavailableMessage}
          onClearError={onClearError}
          onClose={closeModal}
          onReset={onReset}
          onUpload={onUpload}
          portraitUrl={portraitUrl}
        />
      ) : (
        <CharacterBackgroundTexturePanel
          backgroundTexture={backgroundTexture}
          characterClassName={characterClassName}
          draftSelection={backgroundDraftSelection}
          errorMessage={backgroundDraftErrorMessage ?? backgroundErrorMessage}
          hasPendingSelectionChange={backgroundDraftSelection !== null}
          isAuthenticated={isAuthenticated}
          isUploadEnabled={isUploadEnabled}
          isSaving={isBackgroundSaving || isProcessingBackgroundDraft}
          modeSwitch={modeSwitch}
          unavailableMessage={unavailableMessage}
          onClearError={clearBackgroundErrors}
          onSaveSelection={saveBackgroundDraftSelection}
          onSelect={stageBackgroundSelection}
          onSelectCurrentUploaded={stageCurrentUploadedBackground}
          onUpload={stageBackgroundUpload}
        />
      )}
    </SheetModal>
  );
}

export default CharacterPortraitModal;
