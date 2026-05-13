import { useEffect, useRef, useState } from "react";
import { loadCharacterPortrait } from "./storage";

function useCharacterPortraitUrl(characterId: number) {
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const latestLoadIdRef = useRef(0);

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
    let isActive = true;

    latestLoadIdRef.current = loadId;
    setIsLoading(true);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setPortraitUrl(null);

    loadCharacterPortrait(characterId)
      .then((record) => {
        if (!isActive || loadId !== latestLoadIdRef.current || !record) {
          return;
        }

        const nextPortraitUrl = URL.createObjectURL(record.blob);

        objectUrlRef.current = nextPortraitUrl;
        setPortraitUrl(nextPortraitUrl);
      })
      .catch(() => undefined)
      .finally(() => {
        if (isActive && loadId === latestLoadIdRef.current) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [characterId]);

  return {
    isLoading,
    portraitUrl
  };
}

export default useCharacterPortraitUrl;
