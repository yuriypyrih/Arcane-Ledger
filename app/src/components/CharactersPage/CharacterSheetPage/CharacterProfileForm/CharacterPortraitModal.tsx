import { RotateCcw, Save, Upload } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent
} from "react";
import type { CharacterPortraitCropSettings } from "../../../../pages/CharactersPage/characterPortraits";
import ActionButton from "../../../ActionButton";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import { DefaultCharacterPortraitIcon } from "../../CharacterPortrait";
import styles from "./CharacterProfileForm.module.css";

const defaultCropSettings: CharacterPortraitCropSettings = {
  offsetX: 0,
  offsetY: 0,
  rotationDegrees: 0,
  zoom: 1
};

type CharacterPortraitModalProps = {
  characterName: string;
  errorMessage: string | null;
  hasCustomPortrait: boolean;
  isAuthenticated: boolean;
  isUploadEnabled: boolean;
  isSaving: boolean;
  onClearError: () => void;
  onClose: () => void;
  onReset: () => Promise<void>;
  onUpload: (file: File, crop?: Partial<CharacterPortraitCropSettings>) => Promise<boolean>;
  portraitUrl: string | null;
  unavailableMessage: string | null;
};

function CharacterPortraitModal({
  characterName,
  errorMessage,
  hasCustomPortrait,
  isAuthenticated,
  isUploadEnabled,
  isSaving,
  onClearError,
  onClose,
  onReset,
  onUpload,
  portraitUrl,
  unavailableMessage
}: CharacterPortraitModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [cropSettings, setCropSettings] =
    useState<CharacterPortraitCropSettings>(defaultCropSettings);
  const resolvedName = characterName.trim() || "Character Portrait";
  const cropPreviewStyle = useMemo<CSSProperties>(() => {
    const rotationPadding = Math.abs(cropSettings.rotationDegrees) > 0 ? 1.16 : 1;
    const previewScale = cropSettings.zoom * rotationPadding;

    return {
      transform: `translate(${cropSettings.offsetX * 18}%, ${
        cropSettings.offsetY * 18
      }%) rotate(${cropSettings.rotationDegrees}deg) scale(${previewScale})`
    };
  }, [cropSettings]);
  const portraitNotice = !isUploadEnabled ? unavailableMessage : null;

  useEffect(
    () => () => {
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }
    },
    [pendingPreviewUrl]
  );

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function clearPendingCrop() {
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }

    setPendingFile(null);
    setPendingPreviewUrl(null);
    setCropSettings(defaultCropSettings);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;

    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }

    onClearError();
    setPendingFile(file);
    setPendingPreviewUrl(URL.createObjectURL(file));
    setCropSettings(defaultCropSettings);
  }

  function updateCropSetting(key: keyof CharacterPortraitCropSettings, value: string) {
    const numericValue = Number(value);

    setCropSettings((current) => ({
      ...current,
      [key]: Number.isFinite(numericValue) ? numericValue : current[key]
    }));
  }

  async function savePendingCrop() {
    if (!pendingFile) {
      return;
    }

    const didSave = await onUpload(pendingFile, cropSettings);

    if (didSave) {
      closeModal();
    }
  }

  function resetCropSettings() {
    setCropSettings(defaultCropSettings);
  }

  function closeModal() {
    clearPendingCrop();
    onClose();
  }

  return (
    <SheetModal
      titleId="character-portrait-modal-title"
      onClose={closeModal}
      size="medium"
      panelClassName={styles.portraitModalPanel}
      isBusy={isSaving}
      busyLabel="Saving portrait"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Character portrait</OverlayEyebrow>
          <OverlayTitle id="character-portrait-modal-title">{resolvedName}</OverlayTitle>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close character portrait" onClick={closeModal} />
      </OverlayHeader>

      <OverlayBody className={styles.portraitModalBody}>
        <div className={styles.portraitPreviewFrame}>
          {pendingPreviewUrl ? (
            <img
              src={pendingPreviewUrl}
              alt={`${resolvedName} crop preview`}
              className={styles.portraitCropPreviewImage}
              style={cropPreviewStyle}
            />
          ) : portraitUrl ? (
            <img
              src={portraitUrl}
              alt={`${resolvedName} portrait preview`}
              className={styles.portraitPreviewImage}
            />
          ) : (
            <DefaultCharacterPortraitIcon className={styles.portraitPreviewDefaultIcon} />
          )}
        </div>
        {pendingPreviewUrl ? (
          <div className={styles.portraitCropControls} aria-label="Adjust portrait crop">
            <label className={styles.portraitCropField}>
              <span>
                Angle <strong>{cropSettings.rotationDegrees} deg</strong>
              </span>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={cropSettings.rotationDegrees}
                onChange={(event) => updateCropSetting("rotationDegrees", event.target.value)}
              />
            </label>
            <label className={styles.portraitCropField}>
              <span>
                Zoom <strong>{cropSettings.zoom.toFixed(2)}x</strong>
              </span>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={cropSettings.zoom}
                onChange={(event) => updateCropSetting("zoom", event.target.value)}
              />
            </label>
            <label className={styles.portraitCropField}>
              <span>
                Horizontal <strong>{Math.round(cropSettings.offsetX * 100)}%</strong>
              </span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.02"
                value={cropSettings.offsetX}
                onChange={(event) => updateCropSetting("offsetX", event.target.value)}
              />
            </label>
            <label className={styles.portraitCropField}>
              <span>
                Vertical <strong>{Math.round(cropSettings.offsetY * 100)}%</strong>
              </span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.02"
                value={cropSettings.offsetY}
                onChange={(event) => updateCropSetting("offsetY", event.target.value)}
              />
            </label>
          </div>
        ) : null}
        {errorMessage ? (
          <p className={styles.portraitError} role="alert">
            {errorMessage}
          </p>
        ) : null}
        {portraitNotice ? <p className={styles.portraitNotice}>{portraitNotice}</p> : null}
        <input
          ref={fileInputRef}
          className={styles.portraitFileInput}
          type="file"
          accept="image/*"
          disabled={!isAuthenticated || !isUploadEnabled}
          onChange={handleFileChange}
        />
      </OverlayBody>

      <OverlayFooter
        className={[
          styles.portraitModalFooter,
          pendingPreviewUrl ? styles.portraitModalFooterEditing : ""
        ]
          .join(" ")
          .trim()}
      >
        {pendingPreviewUrl ? (
          <>
            <ActionButton
              fullWidth={false}
              icon={<Save size={16} />}
              loading={isSaving}
              disabled={!isUploadEnabled}
              onClick={() => void savePendingCrop()}
            >
              Save image
            </ActionButton>
            <ActionButton
              fullWidth={false}
              icon={<RotateCcw size={16} />}
              variant="GHOST"
              onClick={resetCropSettings}
            >
              Reset crop
            </ActionButton>
          </>
        ) : isAuthenticated ? (
          <>
            <ActionButton
              fullWidth={false}
              icon={<Upload size={16} />}
              loading={isSaving}
              disabled={!isUploadEnabled}
              onClick={openFilePicker}
            >
              Upload image
            </ActionButton>
            {isUploadEnabled && hasCustomPortrait ? (
              <ActionButton
                actionType="ERROR"
                fullWidth={false}
                icon={<RotateCcw size={16} />}
                variant="GHOST"
                onClick={() => void onReset()}
              >
                Reset to default
              </ActionButton>
            ) : null}
          </>
        ) : null}
      </OverlayFooter>
    </SheetModal>
  );
}

export default CharacterPortraitModal;
