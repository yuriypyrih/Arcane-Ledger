import { useEffect, useState } from "react";
import { fetchMonsterBySlug } from "../../api";
import type { CodexStatus, MonsterRecord } from "../../types";

export function useMonsterEntry(slug: string | undefined) {
  const [monster, setMonster] = useState<MonsterRecord | null>(null);
  const [status, setStatus] = useState<CodexStatus>("loading");

  useEffect(() => {
    let active = true;

    async function loadMonster() {
      if (!slug) {
        setMonster(null);
        setStatus("ready");
        return;
      }

      setStatus("loading");

      try {
        const payload = await fetchMonsterBySlug(slug);

        if (!active) {
          return;
        }

        setMonster(payload);
        setStatus("ready");
      } catch {
        if (!active) {
          return;
        }

        setMonster(null);
        setStatus("error");
      }
    }

    void loadMonster();

    return () => {
      active = false;
    };
  }, [slug]);

  return {
    monster,
    status
  };
}
