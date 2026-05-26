import { Copy, Share2, Trash2 } from "lucide-react";
import type { CharacterRosterEntry } from "../../../pages/CharactersPage/characterRoster";
import { CharacterRowBase, CharacterRowIconButton } from "./CharacterRowBase";
import styles from "./CharacterRow.module.css";

type CharacterRowProps = {
  character: CharacterRosterEntry;
  inParty?: boolean;
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
  inParty = false,
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
    <CharacterRowBase
      avatarUrl={character.avatarUrl}
      className={character.className}
      level={character.level}
      linkAriaLabel={`View ${character.name}`}
      linkTo={`/characters/${character.id}`}
      name={character.name}
      subtitle={`${character.species} ${character.className}`}
      badges={
        <>
          {inParty ? <span className={styles.partyPill}>In Party</span> : null}
          {syncStatusLabel ? <span className={styles.syncPill}>{syncStatusLabel}</span> : null}
        </>
      }
      actions={
        hasActions ? (
          <>
            {onDuplicate ? (
              <CharacterRowIconButton
                type="button"
                aria-label={duplicateLabel}
                title={duplicateLabel}
                disabled={isDuplicateDisabled}
                onClick={() => {
                  void onDuplicate(character);
                }}
              >
                <Copy size={16} aria-hidden="true" />
              </CharacterRowIconButton>
            ) : null}
            {onShare ? (
              <CharacterRowIconButton
                type="button"
                aria-label={`Share ${character.name}`}
                title={`Share ${character.name}`}
                onClick={() => onShare(character)}
              >
                <Share2 size={16} aria-hidden="true" />
              </CharacterRowIconButton>
            ) : null}
            {onDelete ? (
              <CharacterRowIconButton
                type="button"
                aria-label={`Delete ${character.name}`}
                title={`Delete ${character.name}`}
                onClick={() => onDelete(character)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </CharacterRowIconButton>
            ) : null}
          </>
        ) : null}
    />
  );
}

export default CharacterRow;
