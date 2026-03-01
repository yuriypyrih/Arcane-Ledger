import { useEffect, useState } from "react";
import type { CodexEntry, CodexStatus } from "../../types";
import { loadCodexEntries } from "../../utils/codex";

export function useCodexEntries() {
  const [entries, setEntries] = useState<CodexEntry[]>([]);
  const [status, setStatus] = useState<CodexStatus>("loading");

  useEffect(() => {
    let active = true;

    async function loadEntries() {
      try {
        const payload = await loadCodexEntries();

        if (!active) {
          return;
        }

        setEntries(payload);
        setStatus("ready");
      } catch {
        if (!active) {
          return;
        }

        setStatus("error");
      }
    }

    void loadEntries();

    return () => {
      active = false;
    };
  }, []);

  return { entries, status };
}
