import { useCallback, useEffect, useRef, useState } from "react";
import {
  type CharacterPortraitCropSettings,
  cropAndScaleImageFile,
  deleteCharacterPortrait,
  loadCharacterPortrait,
  saveCharacterPortrait
} from "../../../../pages/CharactersPage/characterPortraits";

function getPortraitErrorMessage(error: unknown): string {
  return error instanceof Error && error.message.length > 0
    ? error.message
    : "Unable to update the portrait.";
}

function useCharacterPortrait(characterId: number) {
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [hasCustomPortrait, setHasCustomPortrait] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const latestLoadIdRef = useRef(0);
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

  useEffect(() => {
    const loadId = latestLoadIdRef.current + 1;
    const mutationIdAtLoadStart = portraitMutationIdRef.current;

    latestLoadIdRef.current = loadId;
    setIsLoading(true);
    setErrorMessage(null);
    setHasCustomPortrait(false);
    setPortraitBlob(null);

    loadCharacterPortrait(characterId)
      .then((record) => {
        if (
          loadId !== latestLoadIdRef.current ||
          mutationIdAtLoadStart !== portraitMutationIdRef.current
        ) {
          return;
        }

        setPortraitBlob(record?.blob ?? null);
        setHasCustomPortrait(Boolean(record));
      })
      .catch((error: unknown) => {
        if (loadId === latestLoadIdRef.current) {
          setErrorMessage(getPortraitErrorMessage(error));
        }
      })
      .finally(() => {
        if (loadId === latestLoadIdRef.current) {
          setIsLoading(false);
        }
      });
  }, [characterId, setPortraitBlob]);

  const savePortraitFile = useCallback(
    async (file: File, crop?: Partial<CharacterPortraitCropSettings>) => {
      const mutationId = portraitMutationIdRef.current + 1;

      portraitMutationIdRef.current = mutationId;
      setIsSaving(true);
      setErrorMessage(null);

      try {
        const portrait = await cropAndScaleImageFile(file, { crop });

        await saveCharacterPortrait(characterId, portrait.blob, portrait.mimeType);

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
    [characterId, setPortraitBlob]
  );

  const resetPortrait = useCallback(async () => {
    const mutationId = portraitMutationIdRef.current + 1;

    portraitMutationIdRef.current = mutationId;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await deleteCharacterPortrait(characterId);

      if (mutationId !== portraitMutationIdRef.current) {
        return;
      }

      setPortraitBlob(null);
      setHasCustomPortrait(false);
    } catch (error: unknown) {
      if (mutationId === portraitMutationIdRef.current) {
        setErrorMessage(getPortraitErrorMessage(error));
      }
    } finally {
      if (mutationId === portraitMutationIdRef.current) {
        setIsSaving(false);
      }
    }
  }, [characterId, setPortraitBlob]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    clearError,
    errorMessage,
    hasCustomPortrait,
    isLoading,
    isSaving,
    portraitUrl,
    resetPortrait,
    savePortraitFile
  };
}

export default useCharacterPortrait;
