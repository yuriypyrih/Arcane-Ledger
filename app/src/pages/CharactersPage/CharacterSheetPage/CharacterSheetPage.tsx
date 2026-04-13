import { useMemo } from "react";
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
import styles from "./CharacterSheetPage.module.css";
import { useCharacterSheetPersistence } from "./useCharacterSheetPersistence";

function CharacterSheetPage() {
  const navigate = useNavigate();
  const { characterId } = useParams();
  const parsedCharacterId = useMemo(() => Number(characterId), [characterId]);
  const { character, persistCharacter, queueHitPointCharacterSave } = useCharacterSheetPersistence(
    parsedCharacterId
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

      <div className={styles.cascadeStack}>
        <CharacterProfileForm
          character={character}
          className={styles.cascadeOne}
          onPersistCharacter={persistCharacter}
        />
        <GameplayForm
          character={character}
          className={styles.cascadeTwo}
          onPersistCharacter={persistCharacter}
          onQueueHitPointCharacter={queueHitPointCharacterSave}
        />
        <CharacterStatsForm
          character={character}
          className={styles.cascadeThree}
          onPersistCharacter={persistCharacter}
        />
        <SkillsAndProficienciesForm
          character={character}
          className={styles.cascadeFive}
          onPersistCharacter={persistCharacter}
        />
        <ClassFeaturesAndFeats
          character={character}
          className={styles.cascadeFour}
          onPersistCharacter={persistCharacter}
        />
        <CompanionsSection
          character={character}
          className={styles.cascadeSix}
          onPersistCharacter={persistCharacter}
        />
        <EquipmentForm
          character={character}
          className={styles.cascadeSeven}
          onPersistCharacter={persistCharacter}
        />
        <SpellCastingForm
          character={character}
          className={styles.cascadeEight}
          onPersistCharacter={persistCharacter}
        />
      </div>
      <ThumbDiceButton />
    </section>
  );
}

export default CharacterSheetPage;
