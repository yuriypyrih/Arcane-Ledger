import { useEffect, useRef, useState } from "react";
import { listUserCharactersForInspection } from "../../../api/characterInspection";
import type { CharacterSheetRosterDocument } from "../../../api/characters";
import { CharacterRowBase } from "../../../components/CharactersPage/CharacterRow";
import styles from "../../../components/CharactersPage/CharacterInspection/CharacterInspection.module.css";

type Props = { userId: string; onInspect: (id: string) => void; focusCharacterId: string | null };

export default function AdministrationUserCharacters({
  userId,
  onInspect,
  focusCharacterId
}: Props) {
  const [characters, setCharacters] = useState<CharacterSheetRosterDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const focusRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setLoading(true);
    setError(null);
    setCharacters([]);
    void listUserCharactersForInspection(userId, {
      signal: controller.signal,
      suppressFailureToast: true
    })
      .then((result) => {
        if (current) setCharacters(result.characters);
      })
      .catch((reason: unknown) => {
        if (current)
          setError(reason instanceof Error ? reason.message : "Unable to load characters.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
      controller.abort();
    };
  }, [userId, retry]);
  useEffect(() => {
    if (!loading && focusCharacterId) focusRef.current?.focus();
  }, [loading, focusCharacterId]);

  return (
    <section className={styles.characters} aria-label="User characters">
      <h3>Characters</h3>
      {loading ? (
        <p role="status">Loading characters…</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>
            Retry characters
          </button>
        </div>
      ) : characters.length === 0 ? (
        <p>No cloud-saved characters.</p>
      ) : (
        characters.map((character) => (
          <CharacterRowBase
            key={character.id}
            name={character.summary.name}
            className={character.summary.className}
            level={character.summary.level}
            avatarUrl={character.avatar?.imageUrl}
            subtitle={`${character.summary.species} ${character.summary.className}`}
            onInspect={() => onInspect(character.id)}
            inspectButtonRef={character.id === focusCharacterId ? focusRef : undefined}
          />
        ))
      )}
    </section>
  );
}
