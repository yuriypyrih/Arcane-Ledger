import { Link, useNavigate, useParams } from "react-router-dom";
import CharacterForm from "../../../components/CharactersPage/CharacterForm";
import type { CharacterDraft } from "../../../types";
import { createEmptyCharacter } from "../constants";
import { findCharacter, upsertCharacter } from "../storage";
import styles from "./CharacterBuilderPage.module.css";

function CharacterBuilderPage() {
  const navigate = useNavigate();
  const { characterId } = useParams();
  const parsedCharacterId = characterId ? Number(characterId) : undefined;
  const existingCharacter =
    parsedCharacterId !== undefined && Number.isFinite(parsedCharacterId)
      ? findCharacter(parsedCharacterId)
      : undefined;
  const isEditing = existingCharacter !== undefined;
  const emptyCharacter = createEmptyCharacter();
  const initialValues = existingCharacter
    ? {
        ...emptyCharacter,
        ...existingCharacter,
        abilities: {
          ...emptyCharacter.abilities,
          ...existingCharacter.abilities
        }
      }
    : emptyCharacter;

  function handleSave(draft: CharacterDraft) {
    const savedCharacter = upsertCharacter(draft, existingCharacter?.id);
    navigate(existingCharacter ? "/characters" : `/characters/${savedCharacter.id}`);
  }

  if (characterId && !existingCharacter) {
    return (
      <section className={styles.page}>
        <div className={styles.noticeCard}>
          <p className={styles.eyebrow}>Character forge</p>
          <h2 className={styles.title}>Character not found</h2>
          <p className={styles.description}>
            That sheet is no longer in local storage, so there is nothing to edit.
          </p>
          <Link to="/characters" className={styles.primaryButton}>
            Back to characters
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <CharacterForm
        initialValues={initialValues}
        isEditing={isEditing}
        onBack={() => navigate("/characters")}
        onSubmit={handleSave}
      />
    </section>
  );
}

export default CharacterBuilderPage;
