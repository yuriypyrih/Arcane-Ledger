import { ArrowLeft, Pencil, Plus, Shield, Swords, Trash2 } from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getEncounterTemplate,
  removeEncounterTemplateCreature,
  upsertEncounterTemplateCreature,
  type EncounterTemplateCreatureRecord
} from "../../api/encounterTemplates";
import ActionButton from "../../components/ActionButton";
import CreatureEditorModal from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/CreatureEditorModal";
import { getInheritedEntryLabel } from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/companionUtils";
import { DestructiveConfirmationModal } from "../../components/Overlay";
import { getCompanionStatusLabel } from "../CharactersPage/companions";
import type { CharacterCompanion } from "../../types";
import {
  setSelectedEncounterTemplate,
  setSelectedEncounterTemplateError,
  setSelectedEncounterTemplateLoading,
  useAppDispatch,
  useAppSelector
} from "../../store";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import EditEncounterTemplateModal from "./EditEncounterTemplateModal";
import styles from "./DmToolsPage.module.css";

function toEncounterTemplateCreature(
  creature: CharacterCompanion
): EncounterTemplateCreatureRecord {
  return {
    id: creature.id,
    name: creature.name,
    description: creature.description,
    type: creature.type,
    maxHitPoints: creature.maxHitPoints,
    currentHitPoints: creature.currentHitPoints,
    temporaryHitPoints: creature.temporaryHitPoints,
    duration: creature.duration,
    ...(creature.temporaryHitPointsSource
      ? { temporaryHitPointsSource: creature.temporaryHitPointsSource }
      : {}),
    ...(creature.deathSaves ? { deathSaves: creature.deathSaves } : {}),
    ...(creature.primalBeastKind ? { primalBeastKind: creature.primalBeastKind } : {}),
    ...(creature.inheritedCreatureEntry
      ? { inheritedCreatureEntry: creature.inheritedCreatureEntry }
      : {})
  };
}

function getDeleteCreatureMessage(creature: CharacterCompanion): ReactNode {
  return (
    <>
      Remove <strong>{creature.name}</strong> from this encounter template.
    </>
  );
}

function EncounterTemplateDetailPage() {
  const { encounterTemplateId = "" } = useParams();
  const deleteTitleId = useId();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const encounterTemplate = useAppSelector(
    (state) => state.dmTools.selectedEncounterTemplatesById[encounterTemplateId]
  );
  const status = useAppSelector(
    (state) => state.dmTools.selectedEncounterTemplateStatusById[encounterTemplateId] ?? "idle"
  );
  const error = useAppSelector(
    (state) => state.dmTools.selectedEncounterTemplateErrorById[encounterTemplateId] ?? null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatingCreature, setIsCreatingCreature] = useState(false);
  const [editingCreatureId, setEditingCreatureId] = useState<string | null>(null);
  const [pendingDeleteCreature, setPendingDeleteCreature] =
    useState<EncounterTemplateCreatureRecord | null>(null);
  const [isDeletingCreature, setIsDeletingCreature] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const creatures = encounterTemplate?.creatures ?? [];
  const editorCreature =
    editingCreatureId && encounterTemplate
      ? (encounterTemplate.creatures.find((creature) => creature.id === editingCreatureId) ?? null)
      : null;
  const isCreatureEditorOpen = isCreatingCreature || editorCreature !== null;
  const isAtCreatureLimit = encounterTemplate
    ? encounterTemplate.creatures.length >= encounterTemplate.maxCreatures
    : false;

  useEffect(() => {
    let didCancel = false;

    if (!encounterTemplateId || authStatus !== "authenticated") {
      return () => {
        didCancel = true;
      };
    }

    setActionError(null);
    dispatch(setSelectedEncounterTemplateLoading(encounterTemplateId));

    void getEncounterTemplate(encounterTemplateId, { suppressFailureToast: true })
      .then(({ encounterTemplate: nextEncounterTemplate }) => {
        if (!didCancel) {
          dispatch(setSelectedEncounterTemplate(nextEncounterTemplate));
        }
      })
      .catch((loadError) => {
        if (!didCancel) {
          dispatch(
            setSelectedEncounterTemplateError({
              encounterTemplateId,
              error: getDmToolsApiErrorMessage(loadError, "Unable to load encounter template.")
            })
          );
        }
      });

    return () => {
      didCancel = true;
    };
  }, [authStatus, dispatch, encounterTemplateId]);

  function closeCreatureEditor() {
    setIsCreatingCreature(false);
    setEditingCreatureId(null);
  }

  function handleAddCreatureClick() {
    if (isAtCreatureLimit) {
      setActionError("Encounter templates can hold up to 20 creatures.");
      return;
    }

    setActionError(null);
    setIsCreatingCreature(true);
    setEditingCreatureId(null);
  }

  async function handleSaveCreature(creature: CharacterCompanion) {
    if (!encounterTemplate) {
      return;
    }

    const { encounterTemplate: nextEncounterTemplate } = await upsertEncounterTemplateCreature(
      encounterTemplate.id,
      toEncounterTemplateCreature(creature),
      { suppressFailureToast: true }
    );

    dispatch(setSelectedEncounterTemplate(nextEncounterTemplate));
    setActionError(null);
  }

  async function handleRemoveCreature(creatureId: string) {
    if (!encounterTemplate) {
      return;
    }

    const { encounterTemplate: nextEncounterTemplate } = await removeEncounterTemplateCreature(
      encounterTemplate.id,
      creatureId,
      { suppressFailureToast: true }
    );

    dispatch(setSelectedEncounterTemplate(nextEncounterTemplate));
    setActionError(null);
  }

  async function handleConfirmDeleteCreature() {
    if (!encounterTemplate || !pendingDeleteCreature || isDeletingCreature) {
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
      <section className={styles.panel} aria-labelledby="encounter-template-title">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              <Swords size={15} aria-hidden="true" />
              <span>Encounter Templates</span>
            </p>
            <h2 id="encounter-template-title" className={styles.title}>
              {encounterTemplate?.name ?? "Encounter Template"}
            </h2>
          </div>
          <div className={styles.headerActions}>
            <ActionButton
              icon={<ArrowLeft size={16} aria-hidden="true" />}
              variant="OUTLINE"
              fullWidth={false}
              onClick={() => navigate("/dm-tools?tab=encounter-templates")}
            >
              Back
            </ActionButton>
            {encounterTemplate ? (
              <ActionButton
                icon={<Pencil size={16} aria-hidden="true" />}
                variant="GHOST"
                fullWidth={false}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit
              </ActionButton>
            ) : null}
          </div>
        </div>

        {authStatus !== "authenticated" ? (
          <div className={styles.emptyState}>
            <Swords size={28} aria-hidden="true" />
            <span>Sign in to view this encounter template.</span>
          </div>
        ) : status === "loading" ? (
          <div className={styles.emptyState}>
            <Swords size={28} aria-hidden="true" />
            <span>Loading encounter template...</span>
          </div>
        ) : error ? (
          <p className={styles.modalError}>{error}</p>
        ) : encounterTemplate ? (
          <>
            <section className={styles.membersPanel} aria-labelledby="encounter-creatures-title">
              <div className={styles.memberPanelHeader}>
                <div>
                  <p className={styles.bodyEyebrow}>Creatures</p>
                  <h3 id="encounter-creatures-title" className={styles.bodyTitle}>
                    Enemy Bundle
                  </h3>
                </div>
                <div className={styles.headerActions}>
                  <span className={styles.memberCount}>
                    {creatures.length}/{encounterTemplate.maxCreatures} creatures
                  </span>
                  <ActionButton
                    icon={<Plus size={16} aria-hidden="true" />}
                    disabled={isAtCreatureLimit}
                    fullWidth={false}
                    title={
                      isAtCreatureLimit
                        ? "Encounter templates can hold up to 20 creatures."
                        : undefined
                    }
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
                    <article key={creature.id} className={styles.creatureCard}>
                      <span className={styles.creatureIcon}>
                        <Shield size={18} aria-hidden="true" />
                      </span>
                      <div className={styles.creatureMain}>
                        <div className={styles.creatureTitleRow}>
                          <div>
                            <h4 className={styles.creatureName}>{creature.name}</h4>
                            <p className={styles.creatureMeta}>
                              {creature.type} - {getInheritedEntryLabel(creature)}
                            </p>
                          </div>
                          <span className={styles.memberCount}>
                            {creature.currentHitPoints}/{creature.maxHitPoints} HP
                          </span>
                        </div>
                        {creature.description ? (
                          <p className={styles.creatureDescription}>{creature.description}</p>
                        ) : null}
                        <p className={styles.creatureStatus}>
                          {getCompanionStatusLabel(creature)}
                        </p>
                      </div>
                      <div className={styles.creatureActions}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          aria-label={`Edit ${creature.name}`}
                          title={`Edit ${creature.name}`}
                          onClick={() => {
                            setActionError(null);
                            setIsCreatingCreature(false);
                            setEditingCreatureId(creature.id);
                          }}
                        >
                          <Pencil size={17} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.kickButton}`}
                          aria-label={`Delete ${creature.name}`}
                          title={`Delete ${creature.name}`}
                          onClick={() => setPendingDeleteCreature(creature)}
                        >
                          <Trash2 size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Swords size={28} aria-hidden="true" />
                  <span>No creatures have been added yet.</span>
                </div>
              )}
            </section>

            {isEditModalOpen ? (
              <EditEncounterTemplateModal
                encounterTemplate={encounterTemplate}
                onClose={() => setIsEditModalOpen(false)}
              />
            ) : null}
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

export default EncounterTemplateDetailPage;
