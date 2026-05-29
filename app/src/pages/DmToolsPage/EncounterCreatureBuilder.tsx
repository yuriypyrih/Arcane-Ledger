import { Eye, Plus, Swords } from "lucide-react";
import { type ReactNode, useEffect, useId, useMemo, useState } from "react";
import type { EncounterTemplateCreatureRecord } from "../../api/encounterTemplates";
import ActionButton from "../../components/ActionButton";
import CreatureCard from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/CreatureCard";
import CreatureDrawer from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/CreatureDrawer";
import CreatureEditorModal from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/CreatureEditorModal";
import { getCompanionSourceLabel } from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/companionUtils";
import shared from "../../components/CharactersPage/CharacterSheetPage/CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import { DestructiveConfirmationModal } from "../../components/Overlay";
import { useBodyScrollLock } from "../../lib/useBodyScrollLock";
import type { DmToolsLoadStatus } from "../../store";
import type { CharacterCompanion } from "../../types";
import { getCompanionStatusLabel } from "../CharactersPage/companions";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import DmToolsBackButton from "./DmToolsBackButton";
import DmToolsEditButton from "./DmToolsEditButton";
import DmToolsEmptyState from "./DmToolsEmptyState";
import { duplicateEncounterCreature, toEncounterCreatureRecord } from "./encounterCreatureUtils";
import styles from "./DmToolsPage.module.css";

export type EncounterCreatureBuilderResource = {
  id: string;
  name: string;
  creatures: EncounterTemplateCreatureRecord[];
  maxCreatures: number;
};

type EncounterCreatureBuilderProps = {
  actionError: string | null;
  authRequiredLabel: string;
  backLabel?: string;
  error: string | null;
  isAuthenticated: boolean;
  loadingLabel: string;
  isVisibilitySettingsActive?: boolean;
  isCreatureVisibilitySettingsActive?: (creatureId: string) => boolean;
  onBack: () => void;
  onEditCreatureVisibilitySettings?: (creatureId: string) => void;
  onEditResource?: () => void;
  onEditVisibilitySettings?: () => void;
  onRemoveCreature: (creatureId: string) => Promise<void>;
  onSaveCreature: (creature: EncounterTemplateCreatureRecord) => Promise<void>;
  resource: EncounterCreatureBuilderResource | null | undefined;
  resourceFallbackName: string;
  sectionEyebrow: string;
  sectionTitle: string;
  setActionError: (error: string | null) => void;
  status: DmToolsLoadStatus;
  titleId: string;
  toolLabel: string;
};

function getDeleteCreatureMessage(creature: CharacterCompanion): ReactNode {
  return (
    <>
      Remove <strong>{creature.name}</strong> from this encounter.
    </>
  );
}

function EncounterCreatureBuilder({
  actionError,
  authRequiredLabel,
  backLabel = "Back to DM Tools",
  error,
  isAuthenticated,
  isCreatureVisibilitySettingsActive,
  isVisibilitySettingsActive = false,
  loadingLabel,
  onBack,
  onEditCreatureVisibilitySettings,
  onEditResource,
  onEditVisibilitySettings,
  onRemoveCreature,
  onSaveCreature,
  resource,
  resourceFallbackName,
  sectionEyebrow,
  sectionTitle,
  setActionError,
  status,
  titleId,
  toolLabel
}: EncounterCreatureBuilderProps) {
  const deleteTitleId = useId();
  const [isCreatingCreature, setIsCreatingCreature] = useState(false);
  const [editingCreatureId, setEditingCreatureId] = useState<string | null>(null);
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(null);
  const [pendingDeleteCreature, setPendingDeleteCreature] =
    useState<EncounterTemplateCreatureRecord | null>(null);
  const [isDeletingCreature, setIsDeletingCreature] = useState(false);
  const [duplicatingCreatureId, setDuplicatingCreatureId] = useState<string | null>(null);
  const creatures = useMemo(() => resource?.creatures ?? [], [resource?.creatures]);
  const editorCreature =
    editingCreatureId && resource
      ? (resource.creatures.find((creature) => creature.id === editingCreatureId) ?? null)
      : null;
  const selectedCreature =
    selectedCreatureId && resource
      ? (resource.creatures.find((creature) => creature.id === selectedCreatureId) ?? null)
      : null;
  const isCreatureEditorOpen = isCreatingCreature || editorCreature !== null;
  const isAtCreatureLimit = resource ? resource.creatures.length >= resource.maxCreatures : false;
  const creatureLimitMessage = resource
    ? `Encounters can hold up to ${resource.maxCreatures} creatures.`
    : "Encounter creature limit reached.";

  useBodyScrollLock(
    isCreatureEditorOpen || selectedCreature !== null || pendingDeleteCreature !== null
  );

  useEffect(() => {
    if (!selectedCreatureId) {
      return;
    }

    if (!creatures.some((creature) => creature.id === selectedCreatureId)) {
      setSelectedCreatureId(null);
    }
  }, [creatures, selectedCreatureId]);

  function closeCreatureEditor() {
    setIsCreatingCreature(false);
    setEditingCreatureId(null);
  }

  function handleAddCreatureClick() {
    if (isAtCreatureLimit) {
      setActionError(creatureLimitMessage);
      return;
    }

    setActionError(null);
    setIsCreatingCreature(true);
    setEditingCreatureId(null);
  }

  async function handleSaveCreature(creature: CharacterCompanion) {
    await onSaveCreature(toEncounterCreatureRecord(creature));
    setActionError(null);
  }

  async function handleUpdateSelectedCreature(creature: CharacterCompanion) {
    await handleSaveCreature(creature);
  }

  async function handleRemoveCreature(creatureId: string) {
    await onRemoveCreature(creatureId);
    setActionError(null);
  }

  async function handleDuplicateCreature(creature: EncounterTemplateCreatureRecord) {
    if (!resource || duplicatingCreatureId) {
      return;
    }

    if (isAtCreatureLimit) {
      setActionError(creatureLimitMessage);
      return;
    }

    setActionError(null);
    setDuplicatingCreatureId(creature.id);

    try {
      await onSaveCreature(duplicateEncounterCreature(creature));
    } catch (duplicateError) {
      setActionError(getDmToolsApiErrorMessage(duplicateError, "Unable to duplicate creature."));
    } finally {
      setDuplicatingCreatureId(null);
    }
  }

  async function handleConfirmDeleteCreature() {
    if (!pendingDeleteCreature || isDeletingCreature) {
      return;
    }

    setActionError(null);
    setIsDeletingCreature(true);

    try {
      await handleRemoveCreature(pendingDeleteCreature.id);
      setPendingDeleteCreature(null);
    } catch (deleteError) {
      setActionError(getDmToolsApiErrorMessage(deleteError, "Unable to delete creature."));
    } finally {
      setIsDeletingCreature(false);
    }
  }

  return (
    <section className={styles.page}>
      <DmToolsBackButton onClick={onBack}>{backLabel}</DmToolsBackButton>

      <section className={styles.panel} aria-labelledby={titleId}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              <Swords size={15} aria-hidden="true" />
              <span>{toolLabel}</span>
            </p>
            <h2 id={titleId} className={styles.title}>
              {resource?.name ?? resourceFallbackName}
            </h2>
          </div>
          {resource && (onEditVisibilitySettings || onEditResource) ? (
            <div className={styles.headerActions}>
              {onEditVisibilitySettings ? (
                <button
                  type="button"
                  className={shared.editButton}
                  onClick={onEditVisibilitySettings}
                >
                  <Eye
                    className={isVisibilitySettingsActive ? styles.visibilityEyeActive : undefined}
                    size={16}
                    aria-hidden="true"
                  />
                  Player Visibility Settings
                </button>
              ) : null}
              {onEditResource ? (
                <DmToolsEditButton onClick={onEditResource}>
                  Edit
                </DmToolsEditButton>
              ) : null}
            </div>
          ) : null}
        </div>

        {!isAuthenticated ? (
          <DmToolsEmptyState icon={<Swords size={18} aria-hidden="true" />}>
            {authRequiredLabel}
          </DmToolsEmptyState>
        ) : status === "loading" ? (
          <DmToolsEmptyState icon={<Swords size={18} aria-hidden="true" />}>
            {loadingLabel}
          </DmToolsEmptyState>
        ) : error ? (
          <p className={styles.modalError}>{error}</p>
        ) : resource ? (
          <>
            <section className={styles.membersPanel} aria-labelledby={`${titleId}-creatures`}>
              <div className={styles.memberPanelHeader}>
                <div>
                  <p className={styles.bodyEyebrow}>{sectionEyebrow}</p>
                  <h3 id={`${titleId}-creatures`} className={styles.bodyTitle}>
                    {sectionTitle}
                  </h3>
                </div>
                <div className={styles.headerActions}>
                  <span className={styles.memberCount}>
                    {creatures.length}/{resource.maxCreatures} creatures
                  </span>
                  <ActionButton
                    icon={<Plus size={16} aria-hidden="true" />}
                    disabled={isAtCreatureLimit}
                    fullWidth={false}
                    title={isAtCreatureLimit ? creatureLimitMessage : undefined}
                    onClick={handleAddCreatureClick}
                  >
                    Add Creature
                  </ActionButton>
                </div>
              </div>

              {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

              {creatures.length > 0 ? (
                <div className={styles.creatureList}>
                  {creatures.map((creature) => (
                    <CreatureCard
                      key={creature.id}
                      creature={creature}
                      duplicateDisabled={
                        isAtCreatureLimit || duplicatingCreatureId !== null || isDeletingCreature
                      }
                      duplicateTitle={
                        isAtCreatureLimit
                          ? creatureLimitMessage
                          : `Duplicate ${creature.name}`
                      }
                      predisposition="hostile"
                      sourceLabel={getCompanionSourceLabel(creature)}
                      statusLabel={getCompanionStatusLabel(creature)}
                      isVisibilityActive={isCreatureVisibilitySettingsActive?.(creature.id)}
                      onDuplicate={() => {
                        void handleDuplicateCreature(creature);
                      }}
                      onEdit={() => {
                        setActionError(null);
                        setIsCreatingCreature(false);
                        setEditingCreatureId(creature.id);
                      }}
                      onEditVisibility={
                        onEditCreatureVisibilitySettings
                          ? () => onEditCreatureVisibilitySettings(creature.id)
                          : undefined
                      }
                      onInspect={() => setSelectedCreatureId(creature.id)}
                      onRemove={() => setPendingDeleteCreature(creature)}
                    />
                  ))}
                </div>
              ) : (
                <DmToolsEmptyState icon={<Swords size={18} aria-hidden="true" />}>
                  No creatures have been added yet.
                </DmToolsEmptyState>
              )}
            </section>

            {isCreatureEditorOpen ? (
              <CreatureEditorModal
                allowPrimalBeasts={false}
                creature={editorCreature}
                creatures={creatures}
                getErrorMessage={getDmToolsApiErrorMessage}
                labels={{
                  browseButton: "Browse Monsters",
                  browseSummary: "Choose a stat block for this encounter creature.",
                  browseTitle: "Browse monsters",
                  closeLabel: "Close creature editor",
                  createButton: "Add Creature",
                  createTitle: "Add creature",
                  deleteButton: "Delete",
                  deleteCloseLabel: "Close delete creature confirmation",
                  deleteConfirmLabel: "Delete",
                  deleteMessage: getDeleteCreatureMessage,
                  deleteTitle: "Delete creature?",
                  editTitle: "Edit creature",
                  inheritedStatBlockTitle: "Inherited stat block",
                  noStatBlockText: "No stat block selected.",
                  previewBadgeLabel: "Monster Preview",
                  saveButton: "Save Changes",
                  summary: "Build an individual enemy from a monster stat block or manual values.",
                  useMonsterButton: "Use Monster"
                }}
                onClose={closeCreatureEditor}
                onRemoveCreature={handleRemoveCreature}
                onSaveCreature={handleSaveCreature}
                showDurationFields={false}
              />
            ) : null}
            {selectedCreature ? (
              <CreatureDrawer
                creature={selectedCreature}
                getErrorMessage={getDmToolsApiErrorMessage}
                showDuration={false}
                showSource={false}
                onClose={() => setSelectedCreatureId(null)}
                onUpdateCreature={handleUpdateSelectedCreature}
              />
            ) : null}
            {pendingDeleteCreature ? (
              <DestructiveConfirmationModal
                titleId={deleteTitleId}
                title="Delete creature?"
                message={getDeleteCreatureMessage(pendingDeleteCreature)}
                confirmLabel={isDeletingCreature ? "Deleting..." : "Delete"}
                closeLabel="Close delete creature confirmation"
                onCancel={() => setPendingDeleteCreature(null)}
                onConfirm={() => {
                  void handleConfirmDeleteCreature();
                }}
              />
            ) : null}
          </>
        ) : null}
      </section>
    </section>
  );
}

export default EncounterCreatureBuilder;
