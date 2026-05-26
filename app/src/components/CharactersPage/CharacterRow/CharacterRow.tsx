import { Copy, Share2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { CharacterRosterEntry } from "../../../pages/CharactersPage/characterRoster";
import { DefaultCharacterPortraitIcon } from "../CharacterPortrait";
import { getClassSignatureStyle } from "../classSignature";
import styles from "./CharacterRow.module.css";

type CharacterRowProps = {
  character: CharacterRosterEntry;
  isDuplicateDisabled?: boolean;
  onDelete?: (character: CharacterRosterEntry) => void;
  onDuplicate?: (character: CharacterRosterEntry) => void | Promise<void>;
  onShare?: (character: CharacterRosterEntry) => void;
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

function CharacterRow({
  character,
  isDuplicateDisabled = false,
  onDelete,
  onDuplicate,
  onShare
}: CharacterRowProps) {
  const hasActions = Boolean(onDuplicate || onShare || onDelete);
  const syncStatusLabel = getSyncStatusLabel(character);
  const duplicateLabel = isDuplicateDisabled
    ? "Character limit reached. Delete a character before duplicating."
    : `Duplicate ${character.name}`;

  return (
    <article className={styles.row} style={getClassSignatureStyle(character.className)}>
      <Link
        to={`/characters/${character.id}`}
        className={styles.rowLink}
        aria-label={`View ${character.name}`}
      />
      <span className={styles.characterPortrait}>
        {character.avatarUrl ? (
          <img src={character.avatarUrl} alt="" className={styles.characterPortraitImage} />
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
            {onDuplicate ? (
              <button
                type="button"
                className={styles.iconButton}
                aria-label={duplicateLabel}
                title={duplicateLabel}
                disabled={isDuplicateDisabled}
                onClick={() => {
                  void onDuplicate(character);
                }}
              >
                <Copy size={16} aria-hidden="true" />
              </button>
            ) : null}
            {onShare ? (
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Share ${character.name}`}
                title={`Share ${character.name}`}
                onClick={() => onShare(character)}
              >
                <Share2 size={16} aria-hidden="true" />
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
