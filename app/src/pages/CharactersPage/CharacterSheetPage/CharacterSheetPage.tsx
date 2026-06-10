import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { ThumbDiceButton } from "../../../components/CharactersPage/CharacterSheetPage";
import CompanionEditorModal from "../../../components/CharactersPage/CharacterSheetPage/CompanionsSection/CompanionEditorModal";
import {
  removeCharacterCompanion,
  upsertCharacterCompanion
} from "../../../components/CharactersPage/CharacterSheetPage/CompanionsSection/companionPersistence";
import {
  getClassPageTextureUrl,
  getClassSignatureStyle
} from "../../../components/CharactersPage/classSignature";
import type { AppShellOutletContext } from "../../../components/AppShell/outletContext";
import { trackAnalyticsEvent } from "../../../lib/analytics";
import PageLoadingFallback from "../../../components/PageLoadingFallback";
import type { CharacterCompanion } from "../../../types";
import { CHARACTER_COMPANION_LIMIT } from "../companions";
import { usePartyMemberships } from "../../DmToolsPage/usePartyMemberships";
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
  const [isCompanionCreatorOpen, setIsCompanionCreatorOpen] = useState(false);
  const { character, isLoadingCharacter, persistCharacter, queueHitPointCharacterSave } =
    useCharacterSheetPersistence(parsedCharacterId);
  const trackedCharacterOpenId = useRef<number | null>(null);
  const hasSpellcastingSection = character ? hasSpellcastingForCharacter(character) : false;
  const companions = useMemo(() => character?.companions ?? [], [character?.companions]);
  const isCompanionLimitReached = companions.length >= CHARACTER_COMPANION_LIMIT;
  const pageClassName = isBroadLayoutActive ? `${styles.page} ${styles.pageBroad}` : styles.page;
  const cascadeStackClassName = [
    styles.cascadeStack,
    isBroadLayoutActive ? styles.cascadeStackBroad : ""
  ]
    .filter(Boolean)
    .join(" ");
  const openCompanionCreator = useCallback(() => {
    if (isCompanionLimitReached) {
      return;
    }

    setIsCompanionCreatorOpen(true);
  }, [isCompanionLimitReached]);
  const closeCompanionCreator = useCallback(() => {
    setIsCompanionCreatorOpen(false);
  }, []);
  const handleSaveCompanion = useCallback(
    (nextCompanion: CharacterCompanion) => {
      persistCharacter((currentCharacter) =>
        upsertCharacterCompanion(currentCharacter, nextCompanion)
      );
    },
    [persistCharacter]
  );
  const handleRemoveCompanion = useCallback(
    (companionId: string) => {
      persistCharacter((currentCharacter) =>
        removeCharacterCompanion(currentCharacter, companionId)
      );
    },
    [persistCharacter]
  );

  usePartyMemberships();

  useEffect(() => {
    if (!character || trackedCharacterOpenId.current === character.id) {
      return;
    }

    trackedCharacterOpenId.current = character.id;
    trackAnalyticsEvent("character_sheet_opened", {
      props: {
        className: character.className,
        level: character.level,
        species: character.species
      }
    });
  }, [character]);

  if (!character && isLoadingCharacter) {
    return <PageLoadingFallback />;
  }

  if (!character) {
    return (
      <section className={pageClassName}>
        <article className={styles.notFoundCard}>
          <p className={styles.eyebrow}>Character sheet</p>
          <h2>Character not found</h2>
          <p>The selected sheet is no longer available in local storage.</p>
          <Link to="/characters" className={styles.primaryLink}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to roster</span>
          </Link>
        </article>
      </section>
    );
  }

  const backgroundTexture = character.storageMetadata?.backgroundTexture;
  const pageSignatureStyle =
    backgroundTexture?.source === "none"
      ? getClassSignatureStyle(character.className, { pageTextureDisabled: true })
      : backgroundTexture?.source === "predefined"
        ? getClassSignatureStyle(character.className, {
            pageTextureOverrideUrl: getClassPageTextureUrl(backgroundTexture.textureId)
          })
        : backgroundTexture?.source === "uploaded"
          ? getClassSignatureStyle(character.className, {
              pageTextureOverrideUrl: backgroundTexture.imageUrl
            })
          : getClassSignatureStyle(character.className);

  return (
    <section className={pageClassName} style={pageSignatureStyle}>
      <div className={cascadeStackClassName}>
        <CharacterSheetSectionProfiler id="character-profile">
          <CharacterProfileSection
            className={styles.cascadeOne}
            broadLayout={isBroadLayoutActive}
            isCompanionLimitReached={isCompanionLimitReached}
            onPersistCharacter={persistCharacter}
            onRequestCreateCompanion={openCompanionCreator}
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
          <CharacterSheetSectionProfiler id="companions">
            <CompanionsSheetSection
              className={styles.cascadeSix}
              onPersistCharacter={persistCharacter}
            />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="skills-proficiencies">
            <SkillsSection className={styles.cascadeFive} onPersistCharacter={persistCharacter} />
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
      {isCompanionCreatorOpen ? (
        <CompanionEditorModal
          character={character}
          companion={null}
          companions={companions}
          onSaveCompanion={handleSaveCompanion}
          onRemoveCompanion={handleRemoveCompanion}
          onClose={closeCompanionCreator}
        />
      ) : null}
      <ThumbDiceButton />
    </section>
  );
}

export default CharacterSheetPage;
