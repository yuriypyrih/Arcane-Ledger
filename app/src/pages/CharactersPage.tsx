import { useState, type FormEvent } from "react";
import styles from "./CharactersPage.module.css";

type Character = {
  id: number;
  name: string;
  className: string;
  level: number;
};

const emptyCharacter = {
  name: "",
  className: "",
  level: 1
};

function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState(emptyCharacter);

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
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div>
          <p className={styles.eyebrow}>Character sheets</p>
          <h2 className={styles.title}>{editingId === null ? "Create a character" : "Edit character"}</h2>
        </div>

        <label className={styles.field}>
          <span>Name</span>
          <input
            className={styles.input}
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="Mira Nightbloom"
          />
        </label>

        <label className={styles.field}>
          <span>Class</span>
          <input
            className={styles.input}
            value={draft.className}
            onChange={(event) =>
              setDraft((current) => ({ ...current, className: event.target.value }))
            }
            placeholder="Cleric"
          />
        </label>

        <label className={styles.field}>
          <span>Level</span>
          <input
            className={styles.input}
            type="number"
            min={1}
            value={draft.level}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                level: Number(event.target.value || 1)
              }))
            }
          />
        </label>

        <div className={styles.actions}>
          <button type="submit" className={styles.primaryButton}>
            {editingId === null ? "Save Character" : "Update Character"}
          </button>
          {editingId !== null ? (
            <button type="button" className={styles.secondaryButton} onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className={styles.listCard}>
        <div className={styles.listHeader}>
          <div>
            <p className={styles.eyebrow}>Party roster</p>
            <h3 className={styles.title}>Characters</h3>
          </div>
          <span>{characters.length} total</span>
        </div>

        {characters.length === 0 ? (
          <p className={styles.empty}>No characters yet. Create one to start tracking your party.</p>
        ) : (
          <ul className={styles.list}>
            {characters.map((character) => (
              <li key={character.id} className={styles.card}>
                <div>
                  <h4>{character.name}</h4>
                  <p>
                    {character.className} · Level {character.level}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => startEditing(character)}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default CharactersPage;
