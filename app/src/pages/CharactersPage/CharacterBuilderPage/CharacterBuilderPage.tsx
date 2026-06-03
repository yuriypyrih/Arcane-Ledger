import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { importCharacterSheets } from "../../../api/characters";
import { createPortableCharacterSheetSyncPayload } from "../../../characterSync/characterSyncRecords";
import CharacterForm from "../../../components/CharactersPage/CharacterForm";
import { trackAnalyticsEvent } from "../../../lib/analytics";
import { captureAppError } from "../../../lib/sentry";
import { showToast, useAppDispatch, useAppSelector } from "../../../store";
import type { Character, CharacterDraft } from "../../../types";
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
import { createPortableCharacterSheet } from "../portableCharacterSheet";
import {
  isCharacterSheetCloudUnavailableError,
  resolvePortableCharacterSheetForOpen,
  storeCloudCharacterSheetDocument
} from "../resolvePortableCharacterSheet";
import { normalizeCharacter, upsertCharacter } from "../storage";
import { useCharacterRosterEntries } from "../useCharacterRosterEntries";
import styles from "./CharacterBuilderPage.module.css";

function CharacterBuilderPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { characterId } = useParams();
  const { status, user } = useAppSelector((state) => state.auth);
  const ownerId = status === "authenticated" && user ? user.id : null;
  const characterLimit = getCharacterLimitForAuth(status, user?.role);
  const characters = useCharacterRosterEntries(ownerId);
  const characterCount = characters.length;
  const parsedCharacterId = characterId ? Number(characterId) : undefined;
  const [existingCharacter, setExistingCharacter] = useState<Character | null>(null);
  const [existingCharacterLoadError, setExistingCharacterLoadError] = useState<string | null>(null);
  const [isLoadingExistingCharacter, setIsLoadingExistingCharacter] =
    useState(Boolean(parsedCharacterId));
  const isEditing = existingCharacter !== null;
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
        feats: existingCharacter.feats,
        storageMetadata: existingCharacter.storageMetadata
      }
    : emptyCharacter;

  useEffect(() => {
    if (parsedCharacterId === undefined || !Number.isFinite(parsedCharacterId)) {
      setExistingCharacter(null);
      setExistingCharacterLoadError(null);
      setIsLoadingExistingCharacter(false);
      return;
    }

    if (status === "unknown") {
      setIsLoadingExistingCharacter(true);
      return;
    }

    let didCancel = false;

    setIsLoadingExistingCharacter(true);
    setExistingCharacterLoadError(null);
    void resolvePortableCharacterSheetForOpen(parsedCharacterId, { ownerId })
      .then((record) => {
        if (didCancel) {
          return;
        }

        setExistingCharacter(record ? normalizeCharacter(record) : null);
      })
      .catch((error) => {
        if (!didCancel) {
          if (isCharacterSheetCloudUnavailableError(error)) {
            dispatch(
              showToast({
                text: error.message,
                type: "warning"
              })
            );
            navigate("/characters", { replace: true });
            return;
          }

          captureAppError(error, {
            area: "characters",
            action: "builder-load",
            extra: {
              localId: parsedCharacterId,
              ownerId
            }
          });
          setExistingCharacter(null);
          setExistingCharacterLoadError("Unable to load character.");
        }
      })
      .finally(() => {
        if (!didCancel) {
          setIsLoadingExistingCharacter(false);
        }
      });

    return () => {
      didCancel = true;
    };
  }, [dispatch, navigate, ownerId, parsedCharacterId, status]);

  async function handleSave(draft: CharacterDraft) {
    if (isCharacterLimitReached) {
      return;
    }

    const savedCharacter = upsertCharacter(draft, existingCharacter?.id, {
      ownerId: status === "authenticated" ? user?.id : null
    });

    if (!existingCharacter) {
      trackAnalyticsEvent("character_created", {
        props: {
          className: savedCharacter.className,
          level: savedCharacter.level,
          species: savedCharacter.species
        }
      });

      if (ownerId) {
        try {
          const { characters: syncedCharacters } = await importCharacterSheets(
            [
              await createPortableCharacterSheetSyncPayload(
                createPortableCharacterSheet(savedCharacter),
                { ownerId }
              )
            ],
            { suppressFailureToast: true }
          );
          const syncedCharacter = syncedCharacters[0];

          if (syncedCharacter) {
            storeCloudCharacterSheetDocument(syncedCharacter, { localId: savedCharacter.id });
          }
        } catch (error) {
          captureAppError(error, {
            area: "characters",
            action: "create-sync",
            extra: {
              localId: savedCharacter.id,
              ownerId
            }
          });
        }
      }
    }

    navigate(existingCharacter ? "/characters" : `/characters/${savedCharacter.id}`);
  }

  if (characterId && isLoadingExistingCharacter) {
    return (
      <section className={styles.page}>
        <div className={styles.noticeCard}>
          <p className={styles.eyebrow}>Character forge</p>
          <h2 className={styles.title}>Loading character</h2>
          <p className={styles.description}>Preparing the selected sheet.</p>
          <Link to="/characters" className={styles.primaryButton}>
            Back to characters
          </Link>
        </div>
      </section>
    );
  }

  if (characterId && existingCharacterLoadError) {
    return (
      <section className={styles.page}>
        <div className={styles.noticeCard}>
          <p className={styles.eyebrow}>Character forge</p>
          <h2 className={styles.title}>Unable to load character</h2>
          <p className={styles.description}>
            The selected sheet could not be loaded. Your local and cloud copies were left unchanged.
          </p>
          <Link to="/characters" className={styles.primaryButton}>
            Back to characters
          </Link>
        </div>
      </section>
    );
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
