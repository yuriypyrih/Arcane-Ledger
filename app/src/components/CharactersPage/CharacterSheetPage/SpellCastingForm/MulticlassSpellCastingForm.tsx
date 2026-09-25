import { ignoreCharacterMutation } from "../readOnlySheetContext";
import { useCallback, useMemo, useState } from "react";
import type { Character } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getCharacterClasses } from "../../../../pages/CharactersPage/multiclass";
import { getCastingProgression } from "../../../../codex/classes/multiclass";
import {
  getCharacterSpellSlotPools,
  getSpellcastingClassView,
  applySpellcastingClassChange
} from "../../../../pages/CharactersPage/multiclassSpellcasting";
import SelectInput from "../../FormInputs/SelectInput";
import SpellCastingForm from "./SpellCastingForm";
import styles from "./SpellCastingForm.module.css";

type Props = {
  readOnly?: boolean;
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function MulticlassSpells({ character, className, onPersistCharacter }: Props) {
  const [sourceId, setSourceId] = useState("");
  const [poolId, setPoolId] = useState("");
  const classes = getCharacterClasses(character);
  const casters = classes.filter((entry) => getCastingProgression(entry) !== "none");
  const sources = casters.length ? casters : classes.slice(0, 1);
  const source = sources.find((entry) => entry.id === sourceId) ?? sources[0];
  const pools = getCharacterSpellSlotPools(character).filter((pool) =>
    pool.totals.some((total) => total > 0)
  );
  const pool = pools.find((entry) => entry.id === poolId) ?? pools[0];
  const selectedPoolId = pool?.id ?? "standard";
  const view = useMemo(
    () => getSpellcastingClassView(character, source.id, selectedPoolId),
    [character, source.id, selectedPoolId]
  );
  const persist: PersistCharacterUpdater = useCallback(
    (update, options) => {
      onPersistCharacter(
        (current) => applySpellcastingClassChange(current, source.id, selectedPoolId, update),
        options
      );
    },
    [onPersistCharacter, source.id, selectedPoolId]
  );

  const sourceControls =
    pools.length > 1 ? (
      <div className={styles.sourceControls}>
        <label className={styles.sourceField}>
          <span>Cast using</span>
          <SelectInput
            aria-label="Spell slot pool"
            value={selectedPoolId}
            onChange={(event) => setPoolId(event.target.value)}
          >
            {pools.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </SelectInput>
          <small className={styles.sourceHint}>
            Recovers on a {pool?.recovery === "short-rest" ? "Short Rest" : "Long Rest"}.
          </small>
        </label>
      </div>
    ) : null;
  return (
    <SpellCastingForm
      key={`${source.id}:${selectedPoolId}`}
      className={className}
      sourceControls={sourceControls}
      spellSourceControl={
        sources.length > 1 ? (
          <SelectInput
            compact
            className={styles.spellSourceSelect}
            aria-label="Spell source"
            value={source.id}
            onChange={(event) => setSourceId(event.target.value)}
          >
            {sources.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.customClass?.name || entry.className} {entry.level}
              </option>
            ))}
          </SelectInput>
        ) : null
      }
      character={view}
      onPersistCharacter={persist}
    />
  );
}

export default function CharacterSpells(props: Props) {
  if (props.readOnly && props.character.multiclass) {
    const classes = getCharacterClasses(props.character);
    const casters = classes.filter((entry) => getCastingProgression(entry) !== "none");
    const sources = casters.length ? casters : classes.slice(0, 1);
    const pools = getCharacterSpellSlotPools(props.character);
    return (
      <>
        <section aria-label="Spell slot pools">
          <h3>Spell slot pools</h3>
          {pools.map((pool) => (
            <div key={pool.id}>
              <strong>{pool.label}</strong>
              <p>
                {pool.totals
                  .map((total, index) =>
                    total > 0
                      ? `L${index + 1}: ${Math.max(0, total - (pool.expended[index] ?? 0))}/${total}`
                      : null
                  )
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p>Recovers on a {pool.recovery === "short-rest" ? "Short Rest" : "Long Rest"}.</p>
            </div>
          ))}
        </section>
        {sources.map((source) => (
          <SpellCastingForm
            key={source.id}
            readOnly
            character={getSpellcastingClassView(
              props.character,
              source.id,
              pools.find((pool) => pool.id.endsWith(`:${source.id}`))?.id ?? "standard"
            )}
            onPersistCharacter={ignoreCharacterMutation}
            sourceControls={
              <h3>
                {source.customClass?.name || source.className} {source.level}
              </h3>
            }
          />
        ))}
      </>
    );
  }
  return props.character.multiclass ? (
    <MulticlassSpells {...props} />
  ) : (
    <SpellCastingForm {...props} />
  );
}
