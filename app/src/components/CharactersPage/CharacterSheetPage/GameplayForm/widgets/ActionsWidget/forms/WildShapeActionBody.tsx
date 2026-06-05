import { BookOpen } from "lucide-react";
import type { MonsterRecord } from "../../../../../../../types";
import { getMonsterKey } from "../../../../../../../utils/monsters";
import RadioContainerOption from "../../../../RadioContainerOption";
import { formatWildShapeMonsterMeta } from "../actionsWidgetPresentation";
import styles from "../ActionsWidget.module.css";

type WildShapeActionBodyProps = {
  monsters: MonsterRecord[];
  selectedMonsterKey: string | null;
  onSelectMonster: (monsterKey: string) => void;
  onPreviewMonster: (monsterKey: string) => void;
};

function WildShapeActionBody({
  monsters,
  selectedMonsterKey,
  onSelectMonster,
  onPreviewMonster
}: WildShapeActionBodyProps) {
  if (monsters.length === 0) {
    return null;
  }

  return (
    <div className={styles.wildShapeBody}>
      {monsters.map((monster) => {
        const monsterKey = getMonsterKey(monster);

        return (
          <RadioContainerOption
            key={monsterKey}
            name="wild-shape-monster"
            header={monster.name}
            breakdown={
              <span className={styles.wildShapeOptionDescription}>
                {formatWildShapeMonsterMeta(monster)}
              </span>
            }
            selected={selectedMonsterKey === monsterKey}
            onSelect={() => onSelectMonster(monsterKey)}
            className={styles.wildShapeOption}
            asideClassName={styles.wildShapeReferenceAside}
            aside={
              <button
                type="button"
                className={styles.wildShapeReferenceButton}
                onClick={() => onPreviewMonster(monsterKey)}
                aria-label={`Open ${monster.name} details`}
              >
                <BookOpen aria-hidden="true" />
              </button>
            }
          />
        );
      })}
    </div>
  );
}

export default WildShapeActionBody;
