import clsx from "clsx";
import { CircleHelp, Pencil, Plus, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  CHARACTER_COMPANION_LIMIT,
  getCompanionStatusLabel
} from "../../../../pages/CharactersPage/companions";
import type { Character, CharacterCompanion } from "../../../../types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import { normalizeTemporaryHitPoints } from "../GameplayForm/gameplayStateUtils";
import CompanionDrawer from "./CompanionDrawer";
import CompanionEditorModal from "./CompanionEditorModal";
import CompanionsGuideModal from "./CompanionsGuideModal";
import { removeCharacterCompanion, upsertCharacterCompanion } from "./companionPersistence";
import { getCompanionSourceLabel } from "./companionUtils";
import styles from "./CompanionsSection.module.css";

type CompanionsSectionProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function CompanionsSection({ character, className, onPersistCharacter }: CompanionsSectionProps) {
  const companions = useMemo(() => character.companions ?? [], [character.companions]);
  const [editorCompanionId, setEditorCompanionId] = useState<string | null>(null);
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const isCreatingCompanion = editorCompanionId === "new";
  const editorCompanion = isCreatingCompanion
    ? null
    : (companions.find((companion) => companion.id === editorCompanionId) ?? null);
  const selectedCompanion =
    companions.find((companion) => companion.id === selectedCompanionId) ?? null;
  const isEditorOpen = isCreatingCompanion || editorCompanion !== null;
  const isCompanionLimitReached = companions.length >= CHARACTER_COMPANION_LIMIT;

  useBodyScrollLock(isEditorOpen || selectedCompanionId !== null || isGuideOpen);

  useEffect(() => {
    if (!selectedCompanionId) {
      return;
    }

    if (!companions.some((companion) => companion.id === selectedCompanionId)) {
      setSelectedCompanionId(null);
    }
  }, [companions, selectedCompanionId]);

  useEffect(() => {
    if (!editorCompanionId || editorCompanionId === "new") {
      return;
    }

    if (!companions.some((companion) => companion.id === editorCompanionId)) {
      setEditorCompanionId(null);
    }
  }, [companions, editorCompanionId]);

  function handleSaveCompanion(nextCompanion: CharacterCompanion) {
    onPersistCharacter((currentCharacter) =>
      upsertCharacterCompanion(currentCharacter, nextCompanion)
    );
  }

  function handleRemoveCompanion(companionId: string) {
    onPersistCharacter((currentCharacter) =>
      removeCharacterCompanion(currentCharacter, companionId)
    );
  }

  return (
    <>
      <article className={clsx(shared.sectionCard, className)}>
        <div className={shared.sectionHeader}>
          <div>
            <div className={shared.eyebrowHelpRow}>
              <p className={clsx(shared.eyebrow, shared.eyebrowInHelpRow)}>Companions</p>
              <button
                type="button"
                className={shared.helpButton}
                onClick={() => setIsGuideOpen(true)}
                aria-label="Open companions guide"
                title="Open companions guide"
              >
                <CircleHelp size={16} />
              </button>
            </div>
          </div>
          <div className={shared.headerActions}>
            <button
              type="button"
              className={shared.editButton}
              disabled={isCompanionLimitReached}
              title={
                isCompanionLimitReached
                  ? `Companion limit reached (${CHARACTER_COMPANION_LIMIT}).`
                  : "Create companion"
              }
              onClick={() => setEditorCompanionId("new")}
              aria-label="Create companion"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>

        {companions.length > 0 ? (
          <div className={styles.companionGrid}>
            {companions.map((companion) => {
              const temporaryHitPoints = normalizeTemporaryHitPoints(companion.temporaryHitPoints);

              return (
                <div key={companion.id} className={styles.companionCardShell}>
                  <button
                    type="button"
                    className={styles.companionCard}
                    onClick={() => setSelectedCompanionId(companion.id)}
                  >
                    <div className={styles.cardBody}>
                      <div className={styles.cardTopRow}>
                        <div className={styles.cardTitleRow}>
                          <h4 className={styles.cardTitle}>{companion.name}</h4>
                          <span className={styles.cardType}>· {companion.type}</span>
                        </div>
                        <span className={styles.cardSource}>
                          {getCompanionSourceLabel(companion)}
                        </span>
                      </div>
                      <span className={styles.cardVitalsRow}>
                        <span className={styles.cardHitPointText}>
                          {companion.currentHitPoints}/{companion.maxHitPoints} HP
                        </span>
                        {temporaryHitPoints > 0 ? (
                          <>
                            <span className={styles.cardVitalsDivider}>·</span>
                            <span className={styles.cardTempHitPointText}>
                              <Shield size={14} aria-hidden="true" />
                              {temporaryHitPoints}
                            </span>
                          </>
                        ) : null}
                        <span className={styles.cardVitalsDivider}>·</span>
                        <span className={styles.cardStatus}>
                          {getCompanionStatusLabel(companion)}
                        </span>
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={styles.companionEditButton}
                    onClick={() => setEditorCompanionId(companion.id)}
                    aria-label={`Edit ${companion.name}`}
                    title={`Edit ${companion.name}`}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={shared.emptyText}>
            No companions added yet.
            {"\n"}
            Use Add to create familiars, summons, primal beasts, or supporting NPCs.
          </p>
        )}
      </article>

      {isEditorOpen ? (
        <CompanionEditorModal
          character={character}
          companion={editorCompanion}
          companions={companions}
          onSaveCompanion={handleSaveCompanion}
          onRemoveCompanion={handleRemoveCompanion}
          onClose={() => setEditorCompanionId(null)}
        />
      ) : null}

      {isGuideOpen ? <CompanionsGuideModal onClose={() => setIsGuideOpen(false)} /> : null}

      {selectedCompanion ? (
        <CompanionDrawer
          character={character}
          companion={selectedCompanion}
          onPersistCharacter={onPersistCharacter}
          onClose={() => setSelectedCompanionId(null)}
        />
      ) : null}
    </>
  );
}

export default CompanionsSection;
