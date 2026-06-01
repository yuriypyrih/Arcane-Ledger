import clsx from "clsx";
import { CircleHelp, Plus } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  CHARACTER_COMPANION_LIMIT,
  createCharacterCompanionId,
  getCompanionStatusLabel
} from "../../../../pages/CharactersPage/companions";
import type { Character, CharacterCompanion } from "../../../../types";
import { DestructiveConfirmationModal } from "../../../Overlay";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import CreatureCard from "./CreatureCard";
import CreatureDrawer from "./CreatureDrawer";
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
  const deleteTitleId = useId();
  const companions = useMemo(() => character.companions ?? [], [character.companions]);
  const [editorCompanionId, setEditorCompanionId] = useState<string | null>(null);
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);
  const [pendingRemoveCompanion, setPendingRemoveCompanion] =
    useState<CharacterCompanion | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const isCreatingCompanion = editorCompanionId === "new";
  const editorCompanion = isCreatingCompanion
    ? null
    : (companions.find((companion) => companion.id === editorCompanionId) ?? null);
  const selectedCompanion =
    companions.find((companion) => companion.id === selectedCompanionId) ?? null;
  const isEditorOpen = isCreatingCompanion || editorCompanion !== null;
  const isCompanionLimitReached = companions.length >= CHARACTER_COMPANION_LIMIT;

  useBodyScrollLock(
    isEditorOpen || selectedCompanionId !== null || pendingRemoveCompanion !== null || isGuideOpen
  );

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

  function handleConfirmRemoveCompanion() {
    if (!pendingRemoveCompanion) {
      return;
    }

    handleRemoveCompanion(pendingRemoveCompanion.id);
    setPendingRemoveCompanion(null);
  }

  function handleDuplicateCompanion(companion: CharacterCompanion) {
    if (isCompanionLimitReached) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const currentCompanions = currentCharacter.companions ?? [];

      if (currentCompanions.length >= CHARACTER_COMPANION_LIMIT) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        companions: [
          ...currentCompanions,
          {
            ...companion,
            id: createCharacterCompanionId()
          }
        ]
      };
    });
  }

  return (
    <>
      <article className={clsx(shared.sectionCard, className)}>
        <div className={clsx(shared.sectionHeader, styles.companionsSectionHeader)}>
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
          <div className={clsx(shared.headerActions, styles.companionsHeaderActions)}>
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
            {companions.map((companion) => (
              <CreatureCard
                key={companion.id}
                creature={companion}
                duplicateDisabled={isCompanionLimitReached}
                duplicateTitle={
                  isCompanionLimitReached
                    ? `Companion limit reached (${CHARACTER_COMPANION_LIMIT}).`
                    : `Duplicate ${companion.name}`
                }
                predisposition="friendly"
                sourceLabel={getCompanionSourceLabel(companion)}
                statusLabel={getCompanionStatusLabel(companion)}
                onDuplicate={() => handleDuplicateCompanion(companion)}
                onEdit={() => setEditorCompanionId(companion.id)}
                onInspect={() => setSelectedCompanionId(companion.id)}
                onRemove={() => setPendingRemoveCompanion(companion)}
              />
            ))}
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
        <CreatureDrawer
          character={character}
          creature={selectedCompanion}
          onClose={() => setSelectedCompanionId(null)}
          onUpdateCreature={(nextCompanion) => handleSaveCompanion(nextCompanion)}
        />
      ) : null}

      {pendingRemoveCompanion ? (
        <DestructiveConfirmationModal
          titleId={deleteTitleId}
          title="Delete companion?"
          message={
            <>
              This will permanently remove <strong>{pendingRemoveCompanion.name}</strong> from this
              character.
            </>
          }
          confirmLabel="Delete"
          closeLabel="Close delete companion confirmation"
          onCancel={() => setPendingRemoveCompanion(null)}
          onConfirm={handleConfirmRemoveCompanion}
        />
      ) : null}
    </>
  );
}

export default CompanionsSection;
