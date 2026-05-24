import { Download, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { CharacterRosterEntry } from "../../../pages/CharactersPage/characterRoster";
import useCharacterPortraitUrl from "../../../pages/CharactersPage/characterPortraits/useCharacterPortraitUrl";
import { DefaultCharacterPortraitIcon } from "../CharacterPortrait";
import { getClassSignatureStyle } from "../classSignature";
import styles from "./CharacterRow.module.css";

type CharacterRowProps = {
  character: CharacterRosterEntry;
  onDownload?: (character: CharacterRosterEntry) => void;
  onDelete?: (character: CharacterRosterEntry) => void;
};

function getSyncStatusLabel(character: CharacterRosterEntry) {
  switch (character.syncStatus) {
    case "local-only":
      return "Local";
    case "dirty":
      return "Unsynced";
    case "syncing":
      return "Syncing";
    case "deleting":
      return "Deleting";
    case "conflict":
      return "Conflict";
    case "error":
      return "Sync error";
    default:
      return null;
  }
}

function CharacterRow({ character, onDownload, onDelete }: CharacterRowProps) {
  const hasActions = Boolean(onDownload || onDelete);
  const { isLoading, portraitUrl } = useCharacterPortraitUrl(character.id);
  const syncStatusLabel = getSyncStatusLabel(character);

  return (
    <article className={styles.row} style={getClassSignatureStyle(character.className)}>
      <Link
        to={`/characters/${character.id}`}
        className={styles.rowLink}
        aria-label={`View ${character.name}`}
      />
      <span className={styles.characterPortrait} aria-busy={isLoading || undefined}>
        {portraitUrl ? (
          <img src={portraitUrl} alt="" className={styles.characterPortraitImage} />
        ) : (
          <DefaultCharacterPortraitIcon className={styles.characterPortraitDefaultIcon} />
        )}
      </span>
      <span className={styles.characterMain}>
        <strong>{character.name}</strong>
        <span>
          {character.species} {character.className}
        </span>
      </span>
      <span className={styles.characterSide}>
        <span className={styles.characterMeta}>Lv {character.level}</span>
        {syncStatusLabel ? <span className={styles.syncPill}>{syncStatusLabel}</span> : null}
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
