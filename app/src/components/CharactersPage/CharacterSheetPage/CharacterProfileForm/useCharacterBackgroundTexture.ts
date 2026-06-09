import { useCallback, useEffect, useState } from "react";
import {
  updateCharacterBackgroundTextureSelection,
  uploadCharacterBackgroundTexture,
  type CharacterBackgroundTextureMutationResponse,
  type CharacterBackgroundTextureSelection
} from "../../../../api/characterBackgroundTextures";
import type { CharacterSheetSyncPayload } from "../../../../api/characters";
import {
  cropAndScaleBackgroundTextureFile,
  type CharacterPortraitCropSettings
} from "../../../../pages/CharactersPage/characterPortraits";
import type { CharacterBackgroundTextureMetadata } from "../../../../types";

function getBackgroundTextureErrorMessage(error: unknown): string {
  return error instanceof Error && error.message.length > 0
    ? error.message
    : "Unable to update the background texture.";
}

type UseCharacterBackgroundTextureOptions = {
  characterSheetId: string | null;
  createSyncPayload?: () =>
    | Promise<CharacterSheetSyncPayload | null>
    | CharacterSheetSyncPayload
    | null;
  initialBackgroundTexture: CharacterBackgroundTextureMetadata | null;
  isUploadEnabled: boolean;
  onMutationComplete: (response: CharacterBackgroundTextureMutationResponse) => void;
};

function useCharacterBackgroundTexture({
  characterSheetId,
  createSyncPayload,
  initialBackgroundTexture,
  isUploadEnabled,
  onMutationComplete
}: UseCharacterBackgroundTextureOptions) {
  const [backgroundTexture, setBackgroundTexture] =
    useState<CharacterBackgroundTextureMetadata | null>(initialBackgroundTexture);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setBackgroundTexture(initialBackgroundTexture);
  }, [initialBackgroundTexture]);

  const saveSelection = useCallback(
    async (selection: CharacterBackgroundTextureSelection) => {
      if (!isUploadEnabled || !characterSheetId) {
        setErrorMessage("Background texture editing is temporarily unavailable.");
        return false;
      }

      setIsSaving(true);
      setErrorMessage(null);

      try {
        const response = await updateCharacterBackgroundTextureSelection(characterSheetId, selection, {
          syncPayload: createSyncPayload ? await createSyncPayload() : null
        });

        onMutationComplete(response);
        setBackgroundTexture(response.backgroundTexture);
        return true;
      } catch (error: unknown) {
        setErrorMessage(getBackgroundTextureErrorMessage(error));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [characterSheetId, createSyncPayload, isUploadEnabled, onMutationComplete]
  );

  const saveTextureFile = useCallback(
    async (file: File, crop?: Partial<CharacterPortraitCropSettings>) => {
      if (!isUploadEnabled || !characterSheetId) {
        setErrorMessage("Background texture editing is temporarily unavailable.");
        return false;
      }

      setIsSaving(true);
      setErrorMessage(null);

      try {
        const texture = await cropAndScaleBackgroundTextureFile(file, { crop });
        const response = await uploadCharacterBackgroundTexture(characterSheetId, texture.blob, {
          syncPayload: createSyncPayload ? await createSyncPayload() : null
        });

        onMutationComplete(response);
        setBackgroundTexture(response.backgroundTexture);
        return true;
      } catch (error: unknown) {
        setErrorMessage(getBackgroundTextureErrorMessage(error));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [characterSheetId, createSyncPayload, isUploadEnabled, onMutationComplete]
  );

  const saveTextureBlob = useCallback(
    async (textureBlob: Blob) => {
      if (!isUploadEnabled || !characterSheetId) {
        setErrorMessage("Background texture editing is temporarily unavailable.");
        return false;
      }

      setIsSaving(true);
      setErrorMessage(null);

      try {
        const response = await uploadCharacterBackgroundTexture(characterSheetId, textureBlob, {
          syncPayload: createSyncPayload ? await createSyncPayload() : null
        });

        onMutationComplete(response);
        setBackgroundTexture(response.backgroundTexture);
        return true;
      } catch (error: unknown) {
        setErrorMessage(getBackgroundTextureErrorMessage(error));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [characterSheetId, createSyncPayload, isUploadEnabled, onMutationComplete]
  );

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    backgroundTexture,
    clearError,
    errorMessage,
    isSaving,
    saveSelection,
    saveTextureBlob,
    saveTextureFile
  };
}

export default useCharacterBackgroundTexture;
