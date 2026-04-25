import clsx from "clsx";
import { Pencil, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import type { Character, CharacterCompanion } from "../../../../types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import CompanionDrawer from "./CompanionDrawer";
import CompanionEditorModal from "./CompanionEditorModal";
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
  const isCreatingCompanion = editorCompanionId === "new";
  const editorCompanion = isCreatingCompanion
    ? null
    : (companions.find((companion) => companion.id === editorCompanionId) ?? null);
  const selectedCompanion =
    companions.find((companion) => companion.id === selectedCompanionId) ?? null;
  const isEditorOpen = isCreatingCompanion || editorCompanion !== null;

  useBodyScrollLock(isEditorOpen || selectedCompanionId !== null);

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
    onPersistCharacter((currentCharacter) => {
      const currentCompanions = currentCharacter.companions ?? [];
      const hasExistingCompanion = currentCompanions.some(
        (companion) => companion.id === nextCompanion.id
      );

      return {
        ...currentCharacter,
        companions: hasExistingCompanion
          ? currentCompanions.map((companion) =>
              companion.id === nextCompanion.id ? nextCompanion : companion
            )
          : [...currentCompanions, nextCompanion]
      };
    });
  }

  function handleRemoveCompanion(companionId: string) {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      companions: (currentCharacter.companions ?? []).filter(
        (companion) => companion.id !== companionId
      )
    }));
  }

  return (
    <>
      <article className={clsx(shared.sectionCard, className)}>
        <div className={shared.sectionHeader}>
          <div>
            <p className={shared.eyebrow}>Companions</p>
          </div>
          <div className={shared.headerActions}>
            <button
              type="button"
              className={shared.editButton}
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
              <div key={companion.id} className={styles.companionCardShell}>
                <button
                  type="button"
                  className={styles.companionCard}
                  onClick={() => setSelectedCompanionId(companion.id)}
                >
                  <div className={styles.cardBody}>
                    <h4 className={styles.cardTitle}>{companion.name}</h4>
                    <span className={styles.cardType}>
                      {companion.type} · HP {companion.currentHitPoints}/{companion.maxHitPoints}
                    </span>
                  </div>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardSource}>{getCompanionSourceLabel(companion)}</span>
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
