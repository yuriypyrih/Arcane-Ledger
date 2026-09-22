import type { CharacterMulticlass } from "../../../../types";
import NumberStepper from "../../FormInputs/NumberStepper";
import styles from "./MulticlassProgressModal.module.css";

type Props = {
  draft: CharacterMulticlass;
  totalLevel: number;
  onChange: (draft: CharacterMulticlass) => void;
};

export default function ClassProgressionEditor({ draft, totalLevel, onChange }: Props) {
  const available = totalLevel - draft.classes.reduce((sum, entry) => sum + entry.level, 0);
  return (
    <div className={styles.stack}>
      {draft.classes.map((entry) => {
        const name = entry.customClass?.name || entry.className;
        const isStarting = entry.id === draft.startingClassId;
        return (
          <section key={entry.id} className={styles.classCard} aria-label={`${name} progression`}>
            <div className={styles.classHeader}>
              <div className={styles.classIdentity}>
                <h3>{name}</h3>
                {isStarting ? <span className={styles.startingBadge}>Starting class</span> : null}
              </div>
              <NumberStepper
                label={`${name} class level`}
                decreaseLabel={`Decrease ${name} level`}
                increaseLabel={`Increase ${name} level`}
                min={isStarting ? 1 : 0}
                max={entry.level + Math.max(0, available)}
                value={entry.level}
                editable
                readOnly={draft.classes.length === 1}
                onChange={(level) =>
                  onChange({
                    ...draft,
                    classes: draft.classes.map((item) =>
                      item.id === entry.id ? { ...item, level } : item
                    )
                  })
                }
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
