import { Download, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Character } from "../../../types";
import { getClassSignatureStyle } from "../classSignature";
import styles from "./CharacterRow.module.css";

type CharacterRowProps = {
  character: Character;
  onDownload?: (character: Character) => void;
  onDelete?: (character: Character) => void;
};

function CharacterRow({ character, onDownload, onDelete }: CharacterRowProps) {
  const hasActions = Boolean(onDownload || onDelete);

  return (
    <article className={styles.row} style={getClassSignatureStyle(character.className)}>
      <Link
        to={`/characters/${character.id}`}
        className={styles.rowLink}
        aria-label={`View ${character.name}`}
      />
      <span className={styles.characterMark} aria-hidden="true" />
      <span className={styles.characterMain}>
        <strong>{character.name}</strong>
        <span>
          {character.species} {character.className}
        </span>
      </span>
      <span className={styles.characterSide}>
        <span className={styles.characterMeta}>Lv {character.level}</span>
        {hasActions ? (
          <span className={styles.characterActions}>
            {onDownload ? (
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Export ${character.name}`}
                title={`Export ${character.name}`}
                onClick={() => onDownload(character)}
              >
                <Download size={16} aria-hidden="true" />
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Delete ${character.name}`}
                title={`Delete ${character.name}`}
                onClick={() => onDelete(character)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            ) : null}
          </span>
        ) : null}
      </span>
    </article>
  );
}

export default CharacterRow;
