import { useEffect, useState } from "react";
import { fetchMonsterBySlug } from "../../../../../../api";
import { MonsterEntryDrawer } from "../../../../../MonsterEntryRenderer";
import type { CodexStatus, MonsterRecord } from "../../../../../../types";
import { getCachedMonsterEntry, primeMonsterEntryCache } from "../../../../../../utils/monsters";
import styles from "./ActionsWidget.module.css";

type WildShapePreviewDrawerProps = {
  monsterCache: Record<string, MonsterRecord>;
  monsterSlug: string | null;
  onClose: () => void;
};

function WildShapePreviewDrawer({
  monsterCache,
  monsterSlug,
  onClose
}: WildShapePreviewDrawerProps) {
  const [monster, setMonster] = useState<MonsterRecord | null>(null);
  const [status, setStatus] = useState<CodexStatus>("ready");

  useEffect(() => {
    let active = true;
    const abortController = new AbortController();

    async function loadWildShapePreview() {
      if (!monsterSlug) {
        setMonster(null);
        setStatus("ready");
        return;
      }

      const cachedMonster = monsterCache[monsterSlug] ?? getCachedMonsterEntry(monsterSlug);

      if (cachedMonster?.document__slug?.trim()) {
        primeMonsterEntryCache(cachedMonster);
        setMonster(cachedMonster);
        setStatus("ready");
        return;
      }

      setStatus("loading");

      try {
        const nextMonster = await fetchMonsterBySlug(monsterSlug, {
          signal: abortController.signal
        });

        if (!active) {
          return;
        }

        primeMonsterEntryCache(nextMonster);
        setMonster(nextMonster);
        setStatus("ready");
      } catch {
        if (!active || abortController.signal.aborted) {
          return;
        }

        setMonster(null);
        setStatus("error");
      }
    }

    void loadWildShapePreview();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [monsterCache, monsterSlug]);

  if (!monsterSlug) {
    return null;
  }

  return (
    <MonsterEntryDrawer
      monster={monster}
      status={status}
      badgeLabel="Wild Shape Preview"
      backdropClassName={styles.wildShapePreviewDrawerBackdrop}
      onClose={onClose}
      contentSurface="plain"
      showHeaderDivider
    />
  );
}

export default WildShapePreviewDrawer;
