import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ThumbDiceButton
} from "../../../components/CharactersPage/CharacterSheetPage";
import styles from "./CharacterSheetPage.module.css";
import { useCharacterSheetPersistence } from "./useCharacterSheetPersistence";
import {
  CharacterProfileSection,
  CompanionsSheetSection,
  EquipmentSheetSection,
  FeaturesSection,
  GameplaySection,
  SkillsSection,
  SpellcastingSection,
  StatsSection
} from "./CharacterSheetSections";

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
        <CharacterProfileSection
          className={styles.cascadeOne}
          onPersistCharacter={persistCharacter}
        />
        <GameplaySection
          className={styles.cascadeTwo}
          onPersistCharacter={persistCharacter}
          onQueueHitPointCharacter={queueHitPointCharacterSave}
        />
        <StatsSection
          className={styles.cascadeThree}
          onPersistCharacter={persistCharacter}
        />
        <SkillsSection
          className={styles.cascadeFive}
          onPersistCharacter={persistCharacter}
        />
        <FeaturesSection
          className={styles.cascadeFour}
          onPersistCharacter={persistCharacter}
        />
        <CompanionsSheetSection
          className={styles.cascadeSix}
          onPersistCharacter={persistCharacter}
        />
        <EquipmentSheetSection
          className={styles.cascadeSeven}
          onPersistCharacter={persistCharacter}
        />
        <SpellcastingSection
          className={styles.cascadeEight}
          onPersistCharacter={persistCharacter}
        />
      </div>
      <ThumbDiceButton />
    </section>
  );
}

export default CharacterSheetPage;
