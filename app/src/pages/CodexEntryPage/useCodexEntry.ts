import { useEffect, useState } from "react";
import { codexRepository } from "../../codex/repository";
import type { CodexEntry, CodexStatus } from "../../types";

export function useCodexEntry(entryId: string | undefined) {
  const [entry, setEntry] = useState<CodexEntry | null>(null);
  const [status, setStatus] = useState<CodexStatus>("loading");

  useEffect(() => {
    let active = true;

    async function loadEntry() {
      if (!entryId) {
        setEntry(null);
        setStatus("ready");
        return;
      }

      setStatus("loading");

      try {
        const payload = await codexRepository.getEntryById(entryId);

        if (!active) {
          return;
        }

        setEntry(payload);
        setStatus("ready");
      } catch {
        if (!active) {
          return;
        }

        setStatus("error");
      }
    }

    void loadEntry();

    return () => {
      active = false;
    };
  }, [entryId]);

  return {
    entry,
    status
  };
}
