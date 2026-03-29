import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SheetModal } from "../../Overlay";
import { abilityKeys } from "../../../pages/CharactersPage/constants";
import type { Character } from "../../../types";
import { getClassSignatureStyle } from "../classSignature";
import styles from "./CharacterList.module.css";

type CharacterListProps = {
  characters: Character[];
  onDeleteCharacter: (characterId: number) => void;
};

function CharacterList({ characters, onDeleteCharacter }: CharacterListProps) {
  const [pendingDeleteCharacter, setPendingDeleteCharacter] = useState<Character | null>(null);

  function handleDeleteConfirm() {
    if (!pendingDeleteCharacter) {
      return;
    }

    onDeleteCharacter(pendingDeleteCharacter.id);
    setPendingDeleteCharacter(null);
  }

  return (
    <div className={styles.listCard}>
      <div className={styles.listHeader}>
        <div>
          <p className={styles.eyebrow}>Party roster</p>
          <h3 className={styles.title}>Characters</h3>
        </div>
        <span>{characters.length} total</span>
      </div>

      {characters.length === 0 ? (
        <p className={styles.empty}>
          No characters yet. Create one to start building your next adventure party.
        </p>
      ) : (
        <ul className={styles.list}>
          {characters.map((character) => (
            <li
              key={character.id}
              className={styles.card}
              style={getClassSignatureStyle(character.className)}
            >
              <div className={styles.cardMain}>
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h4>{character.name}</h4>
                      <p>
                        {character.species} {character.className} · Level {character.level}
                      </p>
                    </div>
                    <div className={styles.cardActions}>
                      <Link
                        to={`/characters/${character.id}`}
                        className={styles.viewButton}
                        aria-label={`View ${character.name}`}
                      >
                        <Eye size={16} aria-hidden="true" />
                        <span>View</span>
                      </Link>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        aria-label={`Delete ${character.name}`}
                        onClick={() => setPendingDeleteCharacter(character)}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <ul className={styles.abilityList}>
                    {abilityKeys.map((ability) => (
                      <li key={ability}>
                        <span>{ability}</span>
                        <strong>{character.abilities[ability]}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingDeleteCharacter ? (
        <SheetModal
          titleId="delete-character-title"
          onClose={() => setPendingDeleteCharacter(null)}
          backdropClassName={styles.modalBackdrop}
          panelClassName={styles.modalCard}
        >
            <h4 id="delete-character-title">Delete character?</h4>
            <p>
              This will permanently remove <strong>{pendingDeleteCharacter.name}</strong> from your
              roster.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelButton}
                onClick={() => setPendingDeleteCharacter(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalDeleteButton}
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
        </SheetModal>
      ) : null}
    </div>
  );
}

export default CharacterList;
