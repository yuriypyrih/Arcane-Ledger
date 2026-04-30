import { BookOpen } from "lucide-react";
import type { MonsterRecord } from "../../../../../../../types";
import RadioContainerOption from "../../../../RadioContainerOption";
import { formatWildShapeMonsterMeta } from "../actionsWidgetPresentation";
import styles from "../ActionsWidget.module.css";

type WildShapeActionBodyProps = {
  monsters: MonsterRecord[];
  selectedMonsterSlug: string | null;
  onSelectMonster: (monsterSlug: string) => void;
  onPreviewMonster: (monsterSlug: string) => void;
};

function WildShapeActionBody({
  monsters,
  selectedMonsterSlug,
  onSelectMonster,
  onPreviewMonster
}: WildShapeActionBodyProps) {
  if (monsters.length === 0) {
    return null;
  }

  return (
    <div className={styles.wildShapeBody}>
      {monsters.map((monster) => (
        <RadioContainerOption
          key={monster.slug}
          name="wild-shape-monster"
          header={monster.name}
          breakdown={
            <span className={styles.wildShapeOptionDescription}>
              {formatWildShapeMonsterMeta(monster)}
            </span>
          }
          selected={selectedMonsterSlug === monster.slug}
          onSelect={() => onSelectMonster(monster.slug)}
          className={styles.wildShapeOption}
          asideClassName={styles.wildShapeReferenceAside}
          aside={
            <button
              type="button"
              className={styles.wildShapeReferenceButton}
              onClick={() => onPreviewMonster(monster.slug)}
              aria-label={`Open ${monster.name} details`}
            >
              <BookOpen aria-hidden="true" />
            </button>
          }
        />
      ))}
    </div>
  );
}

export default WildShapeActionBody;
