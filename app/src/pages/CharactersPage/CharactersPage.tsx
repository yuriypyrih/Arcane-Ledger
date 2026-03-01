import { useState, type FormEvent } from "react";
import type { Character, CharacterDraft } from "../../types";
import CharacterForm from "./components/CharacterForm";
import CharacterList from "./components/CharacterList";
import { emptyCharacter } from "./constants";
import styles from "./CharactersPage.module.css";

function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<CharacterDraft>(emptyCharacter);

  function resetForm() {
    setDraft(emptyCharacter);
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: draft.name.trim(),
      className: draft.className.trim(),
      level: Math.max(1, draft.level)
    };

    if (!payload.name || !payload.className) {
      return;
    }

    // TODO: Persist character records to local storage or the API when storage is added.
    if (editingId === null) {
      setCharacters((current) => [
        { id: Date.now(), ...payload },
        ...current
      ]);
    } else {
      setCharacters((current) =>
        current.map((character) =>
          character.id === editingId ? { ...character, ...payload } : character
        )
      );
    }

    resetForm();
  }

  function startEditing(character: Character) {
    setEditingId(character.id);
    setDraft({
      name: character.name,
      className: character.className,
      level: character.level
    });
  }

  return (
    <section className={styles.page}>
      <CharacterForm
        draft={draft}
        isEditing={editingId !== null}
        onSubmit={handleSubmit}
        onDraftChange={setDraft}
        onCancel={resetForm}
      />
      <CharacterList characters={characters} onEdit={startEditing} />
    </section>
  );
}

export default CharactersPage;
