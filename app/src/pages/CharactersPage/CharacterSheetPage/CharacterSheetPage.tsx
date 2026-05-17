import { useMemo } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { ThumbDiceButton } from "../../../components/CharactersPage/CharacterSheetPage";
import { getClassSignatureStyle } from "../../../components/CharactersPage/classSignature";
import type { AppShellOutletContext } from "../../../components/AppShell/outletContext";
import { hasSpellcastingForCharacter } from "../spellcastingAvailability";
import { CharacterSheetSectionProfiler } from "./CharacterSheetSectionProfiler";
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

  return (
    <section className={pageClassName} style={getClassSignatureStyle(character.className)}>
      <div className={cascadeStackClassName}>
        <CharacterSheetSectionProfiler id="character-profile">
          <CharacterProfileSection
            className={styles.cascadeOne}
            broadLayout={isBroadLayoutActive}
            onPersistCharacter={persistCharacter}
          />
        </CharacterSheetSectionProfiler>
        <div className={styles.cascadeMainColumn}>
          <CharacterSheetSectionProfiler id="gameplay">
            <GameplaySection
              className={styles.cascadeTwo}
              onPersistCharacter={persistCharacter}
              onQueueHitPointCharacter={queueHitPointCharacterSave}
            />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="skills-proficiencies">
            <SkillsSection className={styles.cascadeFive} onPersistCharacter={persistCharacter} />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="companions">
            <CompanionsSheetSection
              className={styles.cascadeSix}
              onPersistCharacter={persistCharacter}
            />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="equipment">
            <EquipmentSheetSection
              className={styles.cascadeSeven}
              onPersistCharacter={persistCharacter}
            />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="class-features-feats">
            <FeaturesSection className={styles.cascadeFour} onPersistCharacter={persistCharacter} />
          </CharacterSheetSectionProfiler>
        </div>
        <div className={styles.cascadeSideColumn}>
          <CharacterSheetSectionProfiler id="character-stats">
            <StatsSection
              broadLayout={isBroadLayoutActive}
              className={styles.cascadeThree}
              onPersistCharacter={persistCharacter}
            />
          </CharacterSheetSectionProfiler>
          {hasSpellcastingSection ? (
            <CharacterSheetSectionProfiler id="spellcasting">
              <SpellcastingSection
                className={styles.cascadeEight}
                onPersistCharacter={persistCharacter}
              />
            </CharacterSheetSectionProfiler>
          ) : null}
        </div>
      </div>
      <ThumbDiceButton />
    </section>
  );
}

export default CharacterSheetPage;
