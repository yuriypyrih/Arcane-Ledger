import { Link, useNavigate, useParams } from "react-router-dom";
import CharacterForm from "../../../components/CharactersPage/CharacterForm";
import type { CharacterDraft } from "../../../types";
import { createEmptyCharacter } from "../constants";
import { getCharacterEquipmentNames } from "../inventory";
import {
  getManualSkillExpertiseSelectionsFromEntries,
  getManualSkillSelectionsFromEntries,
  getManualToolSelectionsFromEntries,
  getSavingThrowSelectionsFromEntries
} from "../proficiency";
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
        name: existingCharacter.name,
        species: existingCharacter.species,
        className: existingCharacter.className,
        subclassId: existingCharacter.subclassId ?? "",
        level: existingCharacter.level,
        xp: existingCharacter.xp,
        hitPoints: existingCharacter.hitPoints,
        currentHitPoints: existingCharacter.currentHitPoints,
        temporaryHitPoints: existingCharacter.temporaryHitPoints,
        maxHitPointsMode: existingCharacter.maxHitPointsMode,
        attributeMode: existingCharacter.attributeMode,
        equipment: getCharacterEquipmentNames(existingCharacter.equipment),
        abilities: {
          ...emptyCharacter.abilities,
          ...existingCharacter.abilities
        },
        alignment: existingCharacter.alignment,
        background: existingCharacter.background,
        backgroundNotes: existingCharacter.backgroundNotes,
        currencies: existingCharacter.currencies,
        skills: getManualSkillSelectionsFromEntries(existingCharacter.skillProficiencies),
        skillExpertise: getManualSkillExpertiseSelectionsFromEntries(
          existingCharacter.skillProficiencies
        ),
        toolProficiencies: getManualToolSelectionsFromEntries(existingCharacter.toolProficiencies),
        savingThrowProficiencies: getSavingThrowSelectionsFromEntries(
          existingCharacter.savingThrowProficiencies
        ),
        hitDiceRemaining: existingCharacter.hitDiceRemaining,
        statusEntries: existingCharacter.statusEntries,
        deathSaves: existingCharacter.deathSaves,
        customEquipment: existingCharacter.customEquipment,
        cantripIds: existingCharacter.cantripIds,
        spellbookSpellIds: existingCharacter.spellbookSpellIds,
        preparedSpellIds: existingCharacter.preparedSpellIds,
        spellSlotsExpended: existingCharacter.spellSlotsExpended,
        shortRestsUsedToday: existingCharacter.shortRestsUsedToday,
        coreStats: existingCharacter.coreStats,
        classFeatureState: existingCharacter.classFeatureState,
        feats: existingCharacter.feats
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
