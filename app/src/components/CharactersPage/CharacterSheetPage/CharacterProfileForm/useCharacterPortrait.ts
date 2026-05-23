import { useCallback, useEffect, useRef, useState } from "react";
import { uploadCharacterPortrait } from "../../../../api/characterPortraits";
import {
  type CharacterPortraitCropSettings,
  cropAndScaleImageFile
} from "../../../../pages/CharactersPage/characterPortraits";

function getPortraitErrorMessage(error: unknown): string {
  return error instanceof Error && error.message.length > 0
    ? error.message
    : "Unable to update the portrait.";
}

type UseCharacterPortraitOptions = {
  isUploadEnabled: boolean;
};

function useCharacterPortrait(
  characterId: number,
  { isUploadEnabled }: UseCharacterPortraitOptions
) {
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [hasCustomPortrait, setHasCustomPortrait] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const portraitMutationIdRef = useRef(0);

  const setPortraitBlob = useCallback((blob: Blob | null) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!blob) {
      setPortraitUrl(null);
      return;
    }

    const nextPortraitUrl = URL.createObjectURL(blob);

    objectUrlRef.current = nextPortraitUrl;
    setPortraitUrl(nextPortraitUrl);
  }, []);

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    },
    []
  );

  const savePortraitFile = useCallback(
    async (file: File, crop?: Partial<CharacterPortraitCropSettings>) => {
      const mutationId = portraitMutationIdRef.current + 1;

      if (!isUploadEnabled) {
        setErrorMessage("Avatar uploads are temporarily unavailable.");
        return false;
      }

      portraitMutationIdRef.current = mutationId;
      setIsSaving(true);
      setErrorMessage(null);

      try {
        const portrait = await cropAndScaleImageFile(file, { crop });

        await uploadCharacterPortrait(characterId, portrait.blob);

        if (mutationId !== portraitMutationIdRef.current) {
          return false;
        }

        setPortraitBlob(portrait.blob);
        setHasCustomPortrait(true);
        return true;
      } catch (error: unknown) {
        if (mutationId === portraitMutationIdRef.current) {
          setErrorMessage(getPortraitErrorMessage(error));
        }
        return false;
      } finally {
        if (mutationId === portraitMutationIdRef.current) {
          setIsSaving(false);
        }
      }
    },
    [characterId, isUploadEnabled, setPortraitBlob]
  );

  const resetPortrait = useCallback(() => {
    const mutationId = portraitMutationIdRef.current + 1;

    portraitMutationIdRef.current = mutationId;
    setErrorMessage(null);

    setPortraitBlob(null);
    setHasCustomPortrait(false);
  }, [setPortraitBlob]);

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
