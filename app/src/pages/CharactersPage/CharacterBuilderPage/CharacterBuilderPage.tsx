import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CharacterForm from "../../../components/CharactersPage/CharacterForm";
import { useAppSelector } from "../../../store";
import type { CharacterDraft } from "../../../types";
import {
  getCharacterLimitForAuth,
  hasReachedCharacterLimit
} from "../characterLimits";
import { createEmptyCharacter } from "../constants";
import { getCharacterEquipmentNames } from "../inventory";
import {
  getManualSkillExpertiseSelectionsFromEntries,
  getSelectedClassSkillSelectionsFromEntries,
  getSelectedClassToolSelectionsFromEntries,
  getSavingThrowSelectionsFromEntries
} from "../proficiency";
import { loadCharacters, upsertCharacter } from "../storage";
import styles from "./CharacterBuilderPage.module.css";

function CharacterBuilderPage() {
  const navigate = useNavigate();
  const { characterId } = useParams();
  const { status, user } = useAppSelector((state) => state.auth);
  const characterLimit = getCharacterLimitForAuth(status, user?.role);
  const characters = useMemo(() => loadCharacters(), []);
  const characterCount = characters.length;
  const parsedCharacterId = characterId ? Number(characterId) : undefined;
  const existingCharacter =
    parsedCharacterId !== undefined && Number.isFinite(parsedCharacterId)
      ? characters.find((character) => character.id === parsedCharacterId)
      : undefined;
  const isEditing = existingCharacter !== undefined;
  const isCharacterLimitReached =
    !isEditing && hasReachedCharacterLimit(characterCount, characterLimit);
  const emptyCharacter = createEmptyCharacter();
  const initialValues = existingCharacter
    ? {
        ...emptyCharacter,
        name: existingCharacter.name,
        species: existingCharacter.species,
        speciesChoices: existingCharacter.speciesChoices,
        speciesFeatureState: existingCharacter.speciesFeatureState,
        className: existingCharacter.className,
        subclassId: existingCharacter.subclassId ?? "",
        customClass: existingCharacter.customClass,
        level: existingCharacter.level,
        xp: existingCharacter.xp,
        hitPoints: existingCharacter.hitPoints,
        currentHitPoints: existingCharacter.currentHitPoints,
        temporaryHitPoints: existingCharacter.temporaryHitPoints,
        temporaryHitPointsSource: existingCharacter.temporaryHitPointsSource,
        maxHitPointsMode: existingCharacter.maxHitPointsMode,
        attributeMode: existingCharacter.attributeMode,
        equipment: getCharacterEquipmentNames(existingCharacter.equipment),
        abilities: {
          ...emptyCharacter.abilities,
          ...existingCharacter.abilities
        },
        alignment: existingCharacter.alignment,
        background: existingCharacter.background,
        backgroundChoices: existingCharacter.backgroundChoices,
        backgroundNotes: existingCharacter.backgroundNotes,
        currencies: existingCharacter.currencies,
        skills: getSelectedClassSkillSelectionsFromEntries(
          existingCharacter.skillProficiencies,
          existingCharacter.className
        ),
        skillExpertise: getManualSkillExpertiseSelectionsFromEntries(
          existingCharacter.skillProficiencies
        ),
        toolProficiencies: getSelectedClassToolSelectionsFromEntries(
          existingCharacter.toolProficiencies,
          existingCharacter.className
        ),
        languageProficiencies: existingCharacter.languageProficiencies,
        savingThrowProficiencies: getSavingThrowSelectionsFromEntries(
          existingCharacter.savingThrowProficiencies
        ),
        hitDiceRemaining: existingCharacter.hitDiceRemaining,
        statusEntries: existingCharacter.statusEntries,
        deathSaves: existingCharacter.deathSaves,
        inventoryItems: existingCharacter.inventoryItems,
        customEquipment: existingCharacter.customEquipment,
        cantripIds: existingCharacter.cantripIds,
        spellbookSpellIds: existingCharacter.spellbookSpellIds,
        preparedSpellIds: existingCharacter.preparedSpellIds,
        spellSlotsExpended: existingCharacter.spellSlotsExpended,
        shortRestsUsedToday: existingCharacter.shortRestsUsedToday,
        heroicInspiration: existingCharacter.heroicInspiration,
        coreStats: existingCharacter.coreStats,
        armorClassFormulaSelection: existingCharacter.armorClassFormulaSelection,
        classFeatureState: existingCharacter.classFeatureState,
        feats: existingCharacter.feats
      }
    : emptyCharacter;

  async function handleSave(draft: CharacterDraft) {
    if (isCharacterLimitReached) {
      return;
    }

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

  if (!isEditing && status === "unknown") {
    return (
      <section className={styles.page}>
        <div className={styles.noticeCard}>
          <p className={styles.eyebrow}>Character forge</p>
          <h2 className={styles.title}>Checking character limit</h2>
          <p className={styles.description}>Your session is still loading.</p>
          <Link to="/characters" className={styles.primaryButton}>
            Back to characters
          </Link>
        </div>
      </section>
    );
  }

  if (isCharacterLimitReached) {
    return (
      <section className={styles.page}>
        <div className={styles.noticeCard}>
          <p className={styles.eyebrow}>Character forge</p>
          <h2 className={styles.title}>Character limit reached</h2>
          <p className={styles.description}>
            This roster already has {characterCount}/{characterLimit} characters.
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
