import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Character } from "../../../types";
import { findCharacter, upsertCharacter } from "../storage";
import {
  CharacterProfileForm,
  CharacterStatsForm,
  EquipmentForm,
  GameplayForm,
  SkillsAndProficienciesForm,
  SpellCastingForm
} from "./components";
import type { PersistCharacterUpdater } from "./types";
import styles from "./CharacterSheetPage.module.css";

function CharacterSheetPage() {
  const navigate = useNavigate();
  const { characterId } = useParams();
  const parsedCharacterId = Number(characterId);
  const [character, setCharacter] = useState<Character | null>(() =>
    Number.isFinite(parsedCharacterId) && parsedCharacterId > 0
      ? (findCharacter(parsedCharacterId) ?? null)
      : null
  );
  const characterForm = useForm<Character>({
    defaultValues: character ?? undefined
  });

  useEffect(() => {
    const nextCharacter =
      Number.isFinite(parsedCharacterId) && parsedCharacterId > 0
        ? (findCharacter(parsedCharacterId) ?? null)
        : null;

    setCharacter(nextCharacter);

    if (nextCharacter) {
      characterForm.reset(nextCharacter);
    }
  }, [parsedCharacterId, characterForm]);

  const persistCharacter = useCallback<PersistCharacterUpdater>(
    (updater) => {
      const currentCharacter = characterForm.getValues();

      if (!currentCharacter || !Number.isFinite(currentCharacter.id)) {
        return;
      }

      const nextCharacter = updater(currentCharacter);
      const { id, ...draft } = nextCharacter;
      const savedCharacter = upsertCharacter(draft, id);

      setCharacter(savedCharacter);
      characterForm.reset(savedCharacter);
    },
    [characterForm]
  );

  if (!character) {
    return (
      <section className={styles.page}>
        <button type="button" className={styles.backButton} onClick={() => navigate("/characters")}>
          Go back
        </button>
        <article className={styles.notFoundCard}>
          <p className={styles.eyebrow}>Character sheet</p>
          <h2>Character not found</h2>
          <p>The selected sheet is no longer available in local storage.</p>
          <Link to="/characters" className={styles.primaryLink}>
            Back to roster
          </Link>
        </article>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <button type="button" className={styles.backButton} onClick={() => navigate("/characters")}>
        Go back
      </button>

      <FormProvider {...characterForm}>
        <div className={styles.cascadeStack}>
          <CharacterProfileForm className={styles.cascadeOne} onPersistCharacter={persistCharacter} />
          <GameplayForm className={styles.cascadeTwo} onPersistCharacter={persistCharacter} />
          <CharacterStatsForm className={styles.cascadeThree} onPersistCharacter={persistCharacter} />
          <SkillsAndProficienciesForm
            className={styles.cascadeFour}
            onPersistCharacter={persistCharacter}
          />
          <EquipmentForm className={styles.cascadeFive} onPersistCharacter={persistCharacter} />
          <SpellCastingForm className={styles.cascadeSix} onPersistCharacter={persistCharacter} />
        </div>
      </FormProvider>
    </section>
  );
}

export default CharacterSheetPage;
