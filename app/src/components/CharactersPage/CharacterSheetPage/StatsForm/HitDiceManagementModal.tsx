import type { Character } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getClassHitDicePools,
  restoreClassHitDice,
  spendClassHitDice
} from "../../../../pages/CharactersPage/hitDice";
import { getBoonOfBountifulHealthHitDiceDescriptionAdditionsForCharacter } from "../../../../pages/CharactersPage/feats/runtime";
import ActionButton from "../../../ActionButton";
import ResourceManagementModal from "../ResourceManagementModal";
import styles from "../HitDicePoolRows.module.css";

type Props = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
  onClose: () => void;
};

export default function HitDiceManagementModal({ character, onPersistCharacter, onClose }: Props) {
  const pools = getClassHitDicePools(character);
  const remaining = pools.reduce((sum, pool) => sum + pool.remaining, 0);
  const total = pools.reduce((sum, pool) => sum + pool.total, 0);
  return (
    <ResourceManagementModal
      titleId="hit-dice-resource-management-title"
      title={`Hit Dice ${remaining}/${total}`}
      closeLabel="Close hit dice resource management"
      onClose={onClose}
      actions={[]}
      description="Manually spend or restore Hit Dice outside of a rest."
      additionalDescription={getBoonOfBountifulHealthHitDiceDescriptionAdditionsForCharacter(
        character
      )}
    >
      <div className={styles.pools}>
        {pools.map((pool) => {
          const label = `${pool.className} ${pool.die.toUpperCase()}`;
          return (
            <section
              key={pool.classEntryId}
              className={styles.pool}
              aria-label={`${label} Hit Dice`}
            >
              <div className={styles.summary}>
                <strong>{label}</strong>
                <span aria-label={`${label} remaining`}>
                  {pool.remaining} / {pool.total} remaining
                </span>
              </div>
              <div className={styles.actions}>
                <ActionButton
                  variant="FILL"
                  disabled={pool.remaining === 0}
                  aria-label={`Use 1 ${label} Hit Die`}
                  onClick={() =>
                    onPersistCharacter((current) =>
                      spendClassHitDice(current, pool.classEntryId, 1)
                    )
                  }
                >
                  Use 1
                </ActionButton>
                <ActionButton
                  variant="FILL"
                  disabled={pool.remaining === pool.total}
                  aria-label={`Reset 1 ${label} Hit Die`}
                  onClick={() =>
                    onPersistCharacter((current) =>
                      restoreClassHitDice(current, pool.classEntryId, 1)
                    )
                  }
                >
                  Reset 1
                </ActionButton>
                <ActionButton
                  variant="FILL"
                  disabled={pool.remaining === pool.total}
                  aria-label={`Reset all ${label} Hit Dice`}
                  onClick={() =>
                    onPersistCharacter((current) => restoreClassHitDice(current, pool.classEntryId))
                  }
                >
                  Reset All
                </ActionButton>
              </div>
            </section>
          );
        })}
      </div>
    </ResourceManagementModal>
  );
}
