import { useEffect, useState } from "react";
import { fetchMonsterBySlug } from "../../../../../../api";
import { MonsterEntryDrawer } from "../../../../../MonsterEntryRenderer";
import type { CodexStatus, MonsterRecord } from "../../../../../../types";
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

    async function loadWildShapePreview() {
      if (!monsterSlug) {
        setMonster(null);
        setStatus("ready");
        return;
      }

      const cachedMonster = monsterCache[monsterSlug];

      if (cachedMonster?.document__slug?.trim()) {
        setMonster(cachedMonster);
        setStatus("ready");
        return;
      }

      setStatus("loading");

      try {
        const nextMonster = await fetchMonsterBySlug(monsterSlug);

        if (!active) {
          return;
        }

        setMonster(nextMonster);
        setStatus("ready");
      } catch {
        if (!active) {
          return;
        }

        setMonster(null);
        setStatus("error");
      }
    }

    void loadWildShapePreview();

    return () => {
      active = false;
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
