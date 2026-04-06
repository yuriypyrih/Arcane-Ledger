import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CharacterProfileForm,
  ClassFeaturesAndFeats,
  CompanionsSection,
  CharacterStatsForm,
  EquipmentForm,
  GameplayForm,
  SkillsAndProficienciesForm,
  SpellCastingForm,
  ThumbDiceButton
} from "../../../components/CharactersPage/CharacterSheetPage";
import type { Character } from "../../../types";
import { findCharacter, upsertCharacter } from "../storage";
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
  const watchedCharacter = useWatch({
    control: characterForm.control
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

  const liveCharacter = (watchedCharacter ?? character) as Character;

  return (
    <section className={styles.page}>
      <button type="button" className={styles.backButton} onClick={() => navigate("/characters")}>
        Go back
      </button>

      <FormProvider {...characterForm}>
        <div className={styles.cascadeStack}>
          <CharacterProfileForm
            character={liveCharacter}
            className={styles.cascadeOne}
            onPersistCharacter={persistCharacter}
          />
          <GameplayForm
            character={liveCharacter}
            className={styles.cascadeTwo}
            onPersistCharacter={persistCharacter}
          />
          <CharacterStatsForm
            character={liveCharacter}
            className={styles.cascadeThree}
            onPersistCharacter={persistCharacter}
          />
          <SkillsAndProficienciesForm
            character={liveCharacter}
            className={styles.cascadeFive}
            onPersistCharacter={persistCharacter}
          />
          <ClassFeaturesAndFeats
            character={liveCharacter}
            className={styles.cascadeFour}
            onPersistCharacter={persistCharacter}
          />
          <CompanionsSection
            character={liveCharacter}
            className={styles.cascadeSix}
            onPersistCharacter={persistCharacter}
          />
          <EquipmentForm
            character={liveCharacter}
            className={styles.cascadeSeven}
            onPersistCharacter={persistCharacter}
          />
          <SpellCastingForm
            character={liveCharacter}
            className={styles.cascadeEight}
            onPersistCharacter={persistCharacter}
          />
        </div>
        <ThumbDiceButton />
      </FormProvider>
    </section>
  );
}

export default CharacterSheetPage;
