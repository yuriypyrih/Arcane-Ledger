import type { CharacterCustomTraitEffect } from "../../../../../../types";
import { formatCharacterCustomTraitEffectSummary } from "../../../../../../pages/CharactersPage/customTraitEffects";
import styles from "./CustomTraitEffectList.module.css";

type CustomTraitEffectListProps = {
  effects: CharacterCustomTraitEffect[];
};

function CustomTraitEffectList({ effects }: CustomTraitEffectListProps) {
  if (effects.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Effects</p>
      </div>

      <ul className={styles.list}>
        {effects.map((effect, index) => (
          <li key={`${effect.type}-${index}`} className={styles.item}>
            {formatCharacterCustomTraitEffectSummary(effect)}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default CustomTraitEffectList;
