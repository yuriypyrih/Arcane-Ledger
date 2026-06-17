import { RotateCcw, Save, Upload } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type ReactNode
} from "react";
import type { CharacterPortraitCropSettings } from "../../../../pages/CharactersPage/characterPortraits";
import ActionButton from "../../../ActionButton";
import { OverlayBody, OverlayFooter } from "../../../Overlay";
import { DefaultCharacterPortraitIcon } from "../../CharacterPortrait";
import CharacterImageCropControls from "./CharacterImageCropControls";
import styles from "./CharacterProfileForm.module.css";

const defaultCropSettings: CharacterPortraitCropSettings = {
  offsetX: 0,
  offsetY: 0,
  rotationDegrees: 0,
  zoom: 1
};

type CharacterPortraitPanelProps = {
  characterName: string;
  errorMessage: string | null;
  hasCustomPortrait: boolean;
  isAuthenticated: boolean;
  isUploadEnabled: boolean;
  isSaving: boolean;
  modeSwitch: ReactNode;
  onClearError: () => void;
  onClose: () => void;
  onReset: () => Promise<void>;
  onUpload: (file: File, crop?: Partial<CharacterPortraitCropSettings>) => Promise<boolean>;
  portraitUrl: string | null;
  unavailableMessage: string | null;
};

function CharacterPortraitPanel({
  characterName,
  errorMessage,
  hasCustomPortrait,
  isAuthenticated,
  isUploadEnabled,
  isSaving,
  modeSwitch,
  onClearError,
  onClose,
  onReset,
  onUpload,
  portraitUrl,
  unavailableMessage
}: CharacterPortraitPanelProps) {
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
      clearPendingCrop();
      onClose();
    }
  }

  function resetCropSettings() {
    setCropSettings(defaultCropSettings);
  }

  return (
    <>
      <OverlayBody className={styles.portraitModalBody}>
        {modeSwitch}
        <div
          className={[
            styles.portraitPreviewFrame,
            pendingPreviewUrl ? styles.portraitPreviewFrameEditing : ""
          ]
            .join(" ")
            .trim()}
        >
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
          <CharacterImageCropControls
            cropSettings={cropSettings}
            label="Adjust portrait crop"
            onUpdate={updateCropSetting}
          />
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
              variant="OUTLINE"
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
                variant="OUTLINE"
                onClick={() => void onReset()}
              >
                Reset to default
              </ActionButton>
            ) : null}
          </>
        ) : null}
      </OverlayFooter>
    </>
  );
}

export default CharacterPortraitPanel;
