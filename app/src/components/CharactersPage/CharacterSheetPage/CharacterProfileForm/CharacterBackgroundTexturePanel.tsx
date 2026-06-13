import clsx from "clsx";
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
import type { CharacterBackgroundTextureSelection } from "../../../../api/characterBackgroundTextures";
import {
  getClassPageTextureOptions,
  getClassPageTextureUrl
} from "../../classSignature";
import type { CharacterPortraitCropSettings } from "../../../../pages/CharactersPage/characterPortraits";
import type { CharacterBackgroundTextureMetadata } from "../../../../types";
import ActionButton from "../../../ActionButton";
import { OverlayBody, OverlayFooter } from "../../../Overlay";
import CharacterImageCropControls from "./CharacterImageCropControls";
import styles from "./CharacterProfileForm.module.css";

const defaultCropSettings: CharacterPortraitCropSettings = {
  offsetX: 0,
  offsetY: 0,
  rotationDegrees: 0,
  zoom: 1
};

type CharacterBackgroundTexturePanelProps = {
  backgroundTexture: CharacterBackgroundTextureMetadata | null;
  characterClassName: string;
  draftSelection: CharacterBackgroundTextureSelection | null;
  errorMessage: string | null;
  isAuthenticated: boolean;
  isSaving: boolean;
  isUploadEnabled: boolean;
  modeSwitch: ReactNode;
  unavailableMessage: string | null;
  hasPendingSelectionChange: boolean;
  onClearError: () => void;
  onSaveSelection: () => Promise<boolean>;
  onSelect: (selection: CharacterBackgroundTextureSelection) => void;
  onSelectCurrentUploaded: () => void;
  onUpload: (file: File, crop?: Partial<CharacterPortraitCropSettings>) => Promise<boolean>;
};

function getResolvedTextureUrl(
  characterClassName: string,
  backgroundTexture: CharacterBackgroundTextureMetadata | null,
  draftSelection: CharacterBackgroundTextureSelection | null
) {
  if (draftSelection) {
    if (draftSelection.source === "default") {
      return getClassPageTextureUrl(characterClassName);
    }

    if (draftSelection.source === "none") {
      return null;
    }

    return getClassPageTextureUrl(draftSelection.textureId);
  }

  if (!backgroundTexture) {
    return getClassPageTextureUrl(characterClassName);
  }

  if (backgroundTexture.source === "none") {
    return null;
  }

  return backgroundTexture.source === "predefined"
    ? getClassPageTextureUrl(backgroundTexture.textureId)
    : backgroundTexture.imageUrl;
}

function getSelectionKey(
  backgroundTexture: CharacterBackgroundTextureMetadata | null,
  draftSelection: CharacterBackgroundTextureSelection | null
) {
  if (draftSelection) {
    return draftSelection.source === "predefined"
      ? `predefined:${draftSelection.textureId}`
      : draftSelection.source;
  }

  if (!backgroundTexture) {
    return "default";
  }

  if (backgroundTexture.source === "predefined") {
    return `predefined:${backgroundTexture.textureId}`;
  }

  return backgroundTexture.source;
}

function CharacterBackgroundTexturePanel({
  backgroundTexture,
  characterClassName,
  draftSelection,
  errorMessage,
  isAuthenticated,
  isSaving,
  isUploadEnabled,
  modeSwitch,
  unavailableMessage,
  hasPendingSelectionChange,
  onClearError,
  onSaveSelection,
  onSelect,
  onSelectCurrentUploaded,
  onUpload
}: CharacterBackgroundTexturePanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [cropSettings, setCropSettings] =
    useState<CharacterPortraitCropSettings>(defaultCropSettings);
  const textureOptions = useMemo(() => getClassPageTextureOptions(), []);
  const selectedKey = getSelectionKey(backgroundTexture, draftSelection);
  const resolvedTextureUrl = getResolvedTextureUrl(
    characterClassName,
    backgroundTexture,
    draftSelection
  );
  const classDefaultTextureUrl = getClassPageTextureUrl(characterClassName);
  const cropPreviewStyle = useMemo<CSSProperties>(() => {
    const rotationPadding = Math.abs(cropSettings.rotationDegrees) > 0 ? 1.16 : 1;
    const previewScale = cropSettings.zoom * rotationPadding;

    return {
      transform: `translate(${cropSettings.offsetX * 18}%, ${
        cropSettings.offsetY * 18
      }%) rotate(${cropSettings.rotationDegrees}deg) scale(${previewScale})`
    };
  }, [cropSettings]);
  const textureNotice = !isUploadEnabled ? unavailableMessage : null;

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
    }
  }

  function resetCropSettings() {
    setCropSettings(defaultCropSettings);
  }

  function renderTextureOption(options: {
    key: string;
    label: string;
    imageUrl: string | null;
    onClick: () => void;
  }) {
    const selected = selectedKey === options.key;

    return (
      <button
        key={options.key}
        type="button"
        className={clsx(styles.backgroundTextureOption, selected && styles.backgroundTextureSelected)}
        disabled={!isUploadEnabled || isSaving}
        aria-pressed={selected}
        onClick={options.onClick}
      >
        <span className={styles.backgroundTextureOptionPreview} aria-hidden="true">
          {options.imageUrl ? <img src={options.imageUrl} alt="" /> : null}
        </span>
        <span className={styles.backgroundTextureOptionLabel}>{options.label}</span>
      </button>
    );
  }

  return (
    <>
      <OverlayBody className={styles.portraitModalBody}>
        {modeSwitch}
        <div className={styles.backgroundTexturePreviewFrame}>
          {pendingPreviewUrl ? (
            <img
              src={pendingPreviewUrl}
              alt="Background texture crop preview"
              className={styles.portraitCropPreviewImage}
              style={cropPreviewStyle}
            />
          ) : resolvedTextureUrl ? (
            <img
              src={resolvedTextureUrl}
              alt="Background texture preview"
              className={styles.portraitPreviewImage}
            />
          ) : (
            <span className={styles.backgroundTextureEmptyPreview} />
          )}
        </div>
        {pendingPreviewUrl ? (
          <CharacterImageCropControls
            cropSettings={cropSettings}
            label="Adjust background texture crop"
            onUpdate={updateCropSetting}
          />
        ) : (
          <div className={styles.backgroundTextureOptions} aria-label="Background texture choices">
            {renderTextureOption({
              key: "default",
              label: "Class default",
              imageUrl: classDefaultTextureUrl,
              onClick: () => onSelect({ source: "default" })
            })}
            {renderTextureOption({
              key: "none",
              label: "No texture",
              imageUrl: null,
              onClick: () => onSelect({ source: "none" })
            })}
            {backgroundTexture?.source === "uploaded"
              ? renderTextureOption({
                  key: "uploaded",
                  label: "Uploaded texture",
                  imageUrl: backgroundTexture.imageUrl,
                  onClick: onSelectCurrentUploaded
                })
              : null}
            {textureOptions.map((texture) =>
              renderTextureOption({
                key: `predefined:${texture.id}`,
                label: texture.label,
                imageUrl: texture.imageUrl,
                onClick: () => onSelect({ source: "predefined", textureId: texture.id })
              })
            )}
          </div>
        )}
        {errorMessage ? (
          <p className={styles.portraitError} role="alert">
            {errorMessage}
          </p>
        ) : null}
        {textureNotice ? <p className={styles.portraitNotice}>{textureNotice}</p> : null}
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
              Save texture
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
        ) : (
          <>
            {hasPendingSelectionChange ? (
              <ActionButton
                fullWidth={false}
                icon={<Save size={16} />}
                loading={isSaving}
                disabled={!isUploadEnabled}
                onClick={() => void onSaveSelection()}
              >
                Save texture
              </ActionButton>
            ) : null}
            {isAuthenticated ? (
              <ActionButton
                fullWidth={false}
                icon={<Upload size={16} />}
                loading={isSaving}
                disabled={!isUploadEnabled}
                onClick={openFilePicker}
              >
                Upload texture
              </ActionButton>
            ) : null}
          </>
        )}
      </OverlayFooter>
    </>
  );
}

export default CharacterBackgroundTexturePanel;
