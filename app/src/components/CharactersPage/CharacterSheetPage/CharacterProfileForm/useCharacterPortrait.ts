import { useCallback, useEffect, useState } from "react";
import {
  deleteCharacterPortrait,
  uploadCharacterPortrait,
  type CharacterPortraitMutationResponse
} from "../../../../api/characterPortraits";
import {
  type CharacterPortraitCropSettings,
  cropAndScaleImageFile
} from "../../../../pages/CharactersPage/characterPortraits";
import type { CharacterSheetSyncPayload } from "../../../../api/characters";

function getPortraitErrorMessage(error: unknown): string {
  return error instanceof Error && error.message.length > 0
    ? error.message
    : "Unable to update the portrait.";
}

type UseCharacterPortraitOptions = {
  characterSheetId: string | null;
  createSyncPayload?: () => CharacterSheetSyncPayload | null;
  initialPortraitUrl: string | null;
  isUploadEnabled: boolean;
  onMutationComplete: (response: CharacterPortraitMutationResponse) => void;
};

function useCharacterPortrait({
  characterSheetId,
  createSyncPayload,
  initialPortraitUrl,
  isUploadEnabled,
  onMutationComplete
}: UseCharacterPortraitOptions) {
  const [portraitUrl, setPortraitUrl] = useState<string | null>(initialPortraitUrl);
  const [hasCustomPortrait, setHasCustomPortrait] = useState(Boolean(initialPortraitUrl));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setPortraitUrl(initialPortraitUrl);
    setHasCustomPortrait(Boolean(initialPortraitUrl));
  }, [initialPortraitUrl]);

  const savePortraitFile = useCallback(
    async (file: File, crop?: Partial<CharacterPortraitCropSettings>) => {
      if (!isUploadEnabled || !characterSheetId) {
        setErrorMessage("Avatar uploads are temporarily unavailable.");
        return false;
      }

      setIsSaving(true);
      setErrorMessage(null);

      try {
        const portrait = await cropAndScaleImageFile(file, { crop });
        const response = await uploadCharacterPortrait(characterSheetId, portrait.blob, {
          syncPayload: createSyncPayload?.() ?? null
        });
        const nextPortraitUrl = response.avatar?.imageUrl ?? null;

        onMutationComplete(response);
        setPortraitUrl(nextPortraitUrl);
        setHasCustomPortrait(Boolean(nextPortraitUrl));
        return true;
      } catch (error: unknown) {
        setErrorMessage(getPortraitErrorMessage(error));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [characterSheetId, createSyncPayload, isUploadEnabled, onMutationComplete]
  );

  const resetPortrait = useCallback(async () => {
    if (!characterSheetId) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await deleteCharacterPortrait(characterSheetId, {
        syncPayload: createSyncPayload?.() ?? null
      });

      onMutationComplete(response);
      setPortraitUrl(null);
      setHasCustomPortrait(false);
    } catch (error: unknown) {
      setErrorMessage(getPortraitErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [characterSheetId, createSyncPayload, onMutationComplete]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    clearError,
    errorMessage,
    hasCustomPortrait,
    isLoading: false,
    isSaving,
    portraitUrl,
    resetPortrait,
    savePortraitFile
  };
}

export default useCharacterPortrait;
