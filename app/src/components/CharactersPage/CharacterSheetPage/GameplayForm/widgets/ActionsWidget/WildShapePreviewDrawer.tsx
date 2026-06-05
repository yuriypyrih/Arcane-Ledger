import { useEffect, useState } from "react";
import { fetchMonsterByKey, isApiOfflineError } from "../../../../../../api";
import { MonsterEntryDrawer } from "../../../../../MonsterEntryRenderer";
import { useOnlineStatus } from "../../../../../../lib/useOnlineStatus";
import type { CodexStatus, MonsterRecord } from "../../../../../../types";
import { getCachedMonsterEntry, primeMonsterEntryCache } from "../../../../../../utils/monsters";
import styles from "./ActionsWidget.module.css";

type WildShapePreviewDrawerProps = {
  monsterCache: Record<string, MonsterRecord>;
  monsterKey: string | null;
  onClose: () => void;
};

function WildShapePreviewDrawer({
  monsterCache,
  monsterKey,
  onClose
}: WildShapePreviewDrawerProps) {
  const isOnline = useOnlineStatus();
  const [monster, setMonster] = useState<MonsterRecord | null>(null);
  const [status, setStatus] = useState<CodexStatus>("ready");

  useEffect(() => {
    let active = true;
    const abortController = new AbortController();

    async function loadWildShapePreview() {
      if (!monsterKey) {
        setMonster(null);
        setStatus("ready");
        return;
      }

      const cachedMonster = monsterCache[monsterKey] ?? getCachedMonsterEntry(monsterKey);

      if (cachedMonster) {
        primeMonsterEntryCache(cachedMonster);
        setMonster(cachedMonster);
        setStatus("ready");
        return;
      }

      if (!isOnline) {
        setMonster(null);
        setStatus("server-unavailable");
        return;
      }

      setStatus("loading");

      try {
        const nextMonster = await fetchMonsterByKey(monsterKey, {
          signal: abortController.signal
        });

        if (!active) {
          return;
        }

        primeMonsterEntryCache(nextMonster);
        setMonster(nextMonster);
        setStatus("ready");
      } catch (error) {
        if (!active || abortController.signal.aborted) {
          return;
        }

        setMonster(null);
        setStatus(isApiOfflineError(error) ? "server-unavailable" : "error");
      }
    }

    void loadWildShapePreview();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [isOnline, monsterCache, monsterKey]);

  if (!monsterKey) {
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
