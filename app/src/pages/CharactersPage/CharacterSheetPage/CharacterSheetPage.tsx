import { useMemo } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { ThumbDiceButton } from "../../../components/CharactersPage/CharacterSheetPage";
import { getClassSignatureStyle } from "../../../components/CharactersPage/classSignature";
import type { AppShellOutletContext } from "../../../components/AppShell/outletContext";
import { hasSpellcastingForCharacter } from "../spellcastingAvailability";
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
  const { characterId } = useParams();
  const { isBroadLayoutActive } = useOutletContext<AppShellOutletContext>();
  const parsedCharacterId = useMemo(() => Number(characterId), [characterId]);
  const { character, persistCharacter, queueHitPointCharacterSave } =
    useCharacterSheetPersistence(parsedCharacterId);
  const hasSpellcastingSection = character ? hasSpellcastingForCharacter(character) : false;
  const pageClassName = isBroadLayoutActive ? `${styles.page} ${styles.pageBroad}` : styles.page;
  const cascadeStackClassName = [
    styles.cascadeStack,
    isBroadLayoutActive ? styles.cascadeStackBroad : ""
  ]
    .filter(Boolean)
    .join(" ");

  if (!character) {
    return (
      <section className={pageClassName}>
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

  const profileSection = (
    <CharacterProfileSection
      className={styles.cascadeOne}
      broadLayout={isBroadLayoutActive}
      onPersistCharacter={persistCharacter}
    />
  );
  const gameplaySection = (
    <GameplaySection
      className={styles.cascadeTwo}
      onPersistCharacter={persistCharacter}
      onQueueHitPointCharacter={queueHitPointCharacterSave}
    />
  );
  const statsSection = (
    <StatsSection
      broadLayout={isBroadLayoutActive}
      className={styles.cascadeThree}
      onPersistCharacter={persistCharacter}
    />
  );
  const skillsSection = (
    <SkillsSection className={styles.cascadeFive} onPersistCharacter={persistCharacter} />
  );
  const companionsSection = (
    <CompanionsSheetSection
      className={styles.cascadeSix}
      onPersistCharacter={persistCharacter}
    />
  );
  const equipmentSection = (
    <EquipmentSheetSection className={styles.cascadeSeven} onPersistCharacter={persistCharacter} />
  );
  const featuresSection = (
    <FeaturesSection className={styles.cascadeFour} onPersistCharacter={persistCharacter} />
  );
  const spellcastingSection = hasSpellcastingSection ? (
    <SpellcastingSection className={styles.cascadeEight} onPersistCharacter={persistCharacter} />
  ) : null;

  return (
    <section className={pageClassName} style={getClassSignatureStyle(character.className)}>
      <div className={cascadeStackClassName}>
        {isBroadLayoutActive ? (
          <>
            {profileSection}
            <div className={styles.cascadeMainColumn}>
              {gameplaySection}
              {skillsSection}
              {companionsSection}
              {equipmentSection}
              {featuresSection}
            </div>
            <div className={styles.cascadeSideColumn}>
              {statsSection}
              {spellcastingSection}
            </div>
          </>
        ) : (
          <>
            {profileSection}
            {gameplaySection}
            {statsSection}
            {skillsSection}
            {companionsSection}
            {equipmentSection}
            {featuresSection}
            {spellcastingSection}
          </>
        )}
      </div>
      <ThumbDiceButton />
    </section>
  );
}

export default CharacterSheetPage;
