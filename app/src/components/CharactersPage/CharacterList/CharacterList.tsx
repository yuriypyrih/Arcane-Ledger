import { Download, Eye, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ActionButton from "../../ActionButton";
import { DestructiveConfirmationModal } from "../../Overlay";
import { abilityKeys } from "../../../pages/CharactersPage/constants";
import type { Character } from "../../../types";
import { getClassSignatureStyle } from "../classSignature";
import { downloadCharacterExport } from "./characterExport";
import styles from "./CharacterList.module.css";

type CharacterListProps = {
  characters: Character[];
  onDeleteCharacter: (characterId: number) => void;
};

function CharacterList({ characters, onDeleteCharacter }: CharacterListProps) {
  const deleteTitleId = useId();
  const navigate = useNavigate();
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
        <div className={styles.listHeaderActions}>
          <span className={styles.listCount}>{characters.length} total</span>
          <ActionButton
            icon={<Plus size={16} aria-hidden="true" />}
            fullWidth={false}
            onClick={() => navigate("/characters/new")}
          >
            New Character
          </ActionButton>
        </div>
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
                        className={styles.iconButton}
                        aria-label={`Export ${character.name}`}
                        title={`Export ${character.name}`}
                        onClick={() => downloadCharacterExport(character)}
                      >
                        <Download size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton}
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
        <DestructiveConfirmationModal
          titleId={deleteTitleId}
          title="Delete character?"
          message={
            <>
              This will permanently remove <strong>{pendingDeleteCharacter.name}</strong> from your
              roster.
            </>
          }
          confirmLabel="Delete"
          closeLabel="Close delete character confirmation"
          onCancel={() => setPendingDeleteCharacter(null)}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </div>
  );
}

export default CharacterList;
