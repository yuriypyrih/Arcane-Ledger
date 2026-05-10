import { useMemo } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { ThumbDiceButton } from "../../../components/CharactersPage/CharacterSheetPage";
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
  const pageClassName = isBroadLayoutActive
    ? `${styles.page} ${styles.pageBroad}`
    : styles.page;
  const cascadeStackClassName = [
    styles.cascadeStack,
    isBroadLayoutActive ? styles.cascadeStackBroad : "",
    isBroadLayoutActive && !hasSpellcastingSection ? styles.cascadeStackBroadNoSpellcasting : ""
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

  return (
    <section className={pageClassName}>
      <div className={cascadeStackClassName}>
        <CharacterProfileSection
          className={styles.cascadeOne}
          broadLayout={isBroadLayoutActive}
          onPersistCharacter={persistCharacter}
        />
        <GameplaySection
          className={styles.cascadeTwo}
          onPersistCharacter={persistCharacter}
          onQueueHitPointCharacter={queueHitPointCharacterSave}
        />
        <StatsSection className={styles.cascadeThree} onPersistCharacter={persistCharacter} />
        <SkillsSection className={styles.cascadeFive} onPersistCharacter={persistCharacter} />
        <CompanionsSheetSection
          className={styles.cascadeSix}
          onPersistCharacter={persistCharacter}
        />
        <EquipmentSheetSection
          className={styles.cascadeSeven}
          onPersistCharacter={persistCharacter}
        />
        <FeaturesSection className={styles.cascadeFour} onPersistCharacter={persistCharacter} />
        {hasSpellcastingSection ? (
          <SpellcastingSection
            className={styles.cascadeEight}
            onPersistCharacter={persistCharacter}
          />
        ) : null}
      </div>
      <ThumbDiceButton />
    </section>
  );
}

export default CharacterSheetPage;
