import type { ClassHitDicePool } from "../../../../../pages/CharactersPage/hitDice";
import NumberStepper from "../../../FormInputs/NumberStepper";
import styles from "../../HitDicePoolRows.module.css";

type Pool = ClassHitDicePool & { count: number };
type Props = { pools: Pool[]; onChange: (classEntryId: string, count: number) => void };

export default function HitDiceSpendControls({ pools, onChange }: Props) {
  return (
    <div className={styles.pools} role="group" aria-label="Hit Dice to spend">
      {pools.map((pool) => {
        const label = `${pool.className} ${pool.die.toUpperCase()}`;
        return (
          <div
            className={styles.pool}
            role="group"
            aria-label={`${label} Hit Dice`}
            key={pool.classEntryId}
          >
            <div className={styles.summary}>
              <strong>{label}</strong>
              <span>
                {pool.remaining} / {pool.total} available
              </span>
            </div>
            <NumberStepper
              label={`${label} Hit Dice to spend`}
              decreaseLabel={`Spend one fewer ${label} Hit Die`}
              increaseLabel={`Spend one more ${label} Hit Die`}
              value={pool.count}
              min={0}
              max={pool.remaining}
              onChange={(count) => onChange(pool.classEntryId, count)}
            />
          </div>
        );
      })}
    </div>
  );
}
