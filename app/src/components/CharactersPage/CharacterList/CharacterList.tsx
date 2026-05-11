import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../ActionButton";
import { DestructiveConfirmationModal } from "../../Overlay";
import type { Character } from "../../../types";
import CharacterEmptyState from "../CharacterEmptyState";
import CharacterRow from "../CharacterRow";
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
          <p className={styles.eyebrow}>Characters</p>
          <h3 className={styles.title}>Your arsenal of Characters</h3>
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
        <CharacterEmptyState />
      ) : (
        <ul className={styles.list}>
          {characters.map((character) => (
            <li key={character.id}>
              <CharacterRow
                character={character}
                onDownload={downloadCharacterExport}
                onDelete={setPendingDeleteCharacter}
              />
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
