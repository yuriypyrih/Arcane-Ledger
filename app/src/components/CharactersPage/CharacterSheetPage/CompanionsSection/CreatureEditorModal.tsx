import { Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import { type ReactNode, useEffect, useId, useMemo, useState } from "react";
import { fetchMonsterBySlug, isApiOfflineError } from "../../../../api";
import ActionButton from "../../../ActionButton";
import { useOnlineStatus } from "../../../../lib/useOnlineStatus";
import {
  DestructiveConfirmationModal,
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import MonsterEntryDrawer from "../../../MonsterEntryRenderer/MonsterEntryDrawer";
import SelectInput from "../../FormInputs/SelectInput";
import TextAreaInput from "../../FormInputs/TextAreaInput";
import TextInput from "../../FormInputs/TextInput";
import {
  beastMasterCompanionRole,
  isBeastMasterCharacter
} from "../../../../pages/CharactersPage/beastMasterCompanions";
import { createCharacterCompanionId } from "../../../../pages/CharactersPage/companions";
import {
  getPrimalBeastKindFromSlug,
  getPrimalBeastTemplateBySlug,
  isPrimalBeastMonsterType,
  primalBeastMonsterListItems,
  PRIMAL_BEAST_MONSTER_TYPE
} from "../../../../pages/CharactersPage/companionPrimalBeasts";
import { useMonsterEntries } from "../../../../pages/CodexPage/useMonsterEntries";
import { getCachedMonsterEntry, primeMonsterEntryCache } from "../../../../utils/monsters";
import type {
  Character,
  CharacterCompanion,
  CodexStatus,
  MonsterListItem,
  MonsterOrdering,
  MonsterRecord
} from "../../../../types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import ManualStatusDurationFields from "../GameplayForm/widgets/TraitsConditionsWidget/ManualStatusDurationFields";
import {
  companionDurationTypeOptions,
  createManualStatusDuration
} from "../GameplayForm/widgets/TraitsConditionsWidget/manualStatusDuration";
import CreatureStatBlockEditorModal from "./CreatureStatBlockEditorModal";
import {
  companionMonsterTypeOptions,
  companionSpeciesTypeOptions,
  COMPANION_MONSTERS_PER_PAGE,
  createDraftFromCompanion,
  createEmptyCompanionDraft,
  getExtraTypeOptions,
  getMonsterSourceLabel,
  type CompanionDraft
} from "./companionUtils";
import MonsterBrowserModal from "./MonsterBrowserModal";
import { sanitizeUserInput } from "../../../../utils/userInputSanitization";
import styles from "./CompanionsSection.module.css";

type CreatureEditorLabels = {
  createTitle: string;
  editTitle: string;
  summary: string;
  closeLabel: string;
  createButton: string;
  saveButton: string;
  deleteButton: string;
  deleteTitle: string;
  deleteMessage: (creature: CharacterCompanion) => ReactNode;
  deleteConfirmLabel: string;
  deleteCloseLabel: string;
  inheritedStatBlockTitle: string;
  noStatBlockText: string;
  browseButton: string;
  browseTitle: string;
  browseSummary: string;
  previewBadgeLabel: string;
  useMonsterButton: string;
};

type CreatureEditorModalProps = {
  allowPrimalBeasts?: boolean;
  character?: Character;
  creature: CharacterCompanion | null;
  creatures: CharacterCompanion[];
  getErrorMessage?: (error: unknown, fallback: string) => string;
  labels: CreatureEditorLabels;
  onClose: () => void;
  onRemoveCreature?: (creatureId: string) => void | Promise<void>;
  onSaveCreature: (creature: CharacterCompanion) => void | Promise<void>;
  showDurationFields?: boolean;
};

function parseHitPointDraftValue(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return Math.floor(parsedValue);
}

function sortMonsterListItems(
  monsters: MonsterListItem[],
  ordering: MonsterOrdering
): MonsterListItem[] {
  return monsters.slice().sort((left, right) => {
    switch (ordering) {
      case "-name":
        return right.name.localeCompare(left.name);
      case "cr":
        return left.cr - right.cr || left.name.localeCompare(right.name);
      case "-cr":
        return right.cr - left.cr || left.name.localeCompare(right.name);
      case "name":
      default:
        return left.name.localeCompare(right.name);
    }
  });
}

function getPrimalBeastBrowserItems(query: string, ordering: MonsterOrdering): MonsterListItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = normalizedQuery
    ? primalBeastMonsterListItems.filter((monster) =>
        monster.name.toLowerCase().includes(normalizedQuery)
      )
    : primalBeastMonsterListItems;

  return sortMonsterListItems(filteredItems, ordering);
}

function getDefaultErrorMessage(_error: unknown, fallback: string) {
  return fallback;
}

function CreatureEditorModal({
  allowPrimalBeasts = false,
  character,
  creature,
  creatures,
  getErrorMessage = getDefaultErrorMessage,
  labels,
  onClose,
  onRemoveCreature,
  onSaveCreature,
  showDurationFields = true
}: CreatureEditorModalProps) {
  const isOnline = useOnlineStatus();
  const titleId = useId();
  const deleteTitleId = useId();
  const isEditingExisting = creature !== null;
  const isBeastMaster = Boolean(allowPrimalBeasts && character && isBeastMasterCharacter(character));
  const defaultMonsterTypeFilter = isBeastMaster ? PRIMAL_BEAST_MONSTER_TYPE : "all";
  const monsterTypeOptions = useMemo(
    () =>
      allowPrimalBeasts
        ? companionMonsterTypeOptions
        : companionMonsterTypeOptions.filter((typeOption) => typeOption !== PRIMAL_BEAST_MONSTER_TYPE),
    [allowPrimalBeasts]
  );
  const [draft, setDraft] = useState<CompanionDraft>(() =>
    creature ? createDraftFromCompanion(creature) : createEmptyCompanionDraft()
  );
  const [showValidation, setShowValidation] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [isMonsterBrowserOpen, setIsMonsterBrowserOpen] = useState(false);
  const [monsterQuery, setMonsterQuery] = useState("");
  const [monsterSearchResetSignal, setMonsterSearchResetSignal] = useState(0);
  const [monsterTypeFilter, setMonsterTypeFilter] = useState<string>(defaultMonsterTypeFilter);
  const [monsterSourceFilter, setMonsterSourceFilter] = useState<string>("all");
  const [monsterOrdering, setMonsterOrdering] = useState<MonsterOrdering>("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [previewMonster, setPreviewMonster] = useState<MonsterRecord | null>(null);
  const [previewStatus, setPreviewStatus] = useState<CodexStatus>("ready");
  const [pendingSelectSlug, setPendingSelectSlug] = useState<string | null>(null);
  const [monsterNotice, setMonsterNotice] = useState<string | null>(null);
  const [isStatBlockEditorOpen, setIsStatBlockEditorOpen] = useState(false);
  const [isResettingStatBlock, setIsResettingStatBlock] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [monsterCache, setMonsterCache] = useState<Record<string, MonsterRecord>>(() =>
    creatures.reduce<Record<string, MonsterRecord>>((cache, currentCreature) => {
      if (currentCreature.inheritedCreatureEntry) {
        cache[currentCreature.inheritedCreatureEntry.slug] =
          currentCreature.inheritedCreatureEntry;
      }

      return cache;
    }, {})
  );
  const selectedMonsterSlug = draft.inheritedCreatureEntry?.slug ?? null;
  const isPrimalBeastFilter =
    allowPrimalBeasts && isPrimalBeastMonsterType(monsterTypeFilter);
  const extraTypeOptions = useMemo(
    () =>
      getExtraTypeOptions([
        draft.type,
        ...creatures.map((currentCreature) => currentCreature.type),
        draft.inheritedCreatureEntry?.type ?? ""
      ]),
    [creatures, draft.inheritedCreatureEntry?.type, draft.type]
  );
  const { payload, status } = useMonsterEntries({
    enabled: isMonsterBrowserOpen && !isPrimalBeastFilter,
    page: currentPage,
    limit: COMPANION_MONSTERS_PER_PAGE,
    search: monsterQuery,
    type: monsterTypeFilter === "all" ? null : monsterTypeFilter,
    source: monsterSourceFilter === "all" ? null : monsterSourceFilter,
    ordering: monsterOrdering
  });
  const primalBeastItems = useMemo(
    () => (allowPrimalBeasts ? getPrimalBeastBrowserItems(monsterQuery, monsterOrdering) : []),
    [allowPrimalBeasts, monsterOrdering, monsterQuery]
  );
  const monsters = isPrimalBeastFilter ? primalBeastItems : (payload?.results ?? []);
  const totalEntries = isPrimalBeastFilter ? primalBeastItems.length : (payload?.count ?? 0);
  const browserStatus: CodexStatus = isPrimalBeastFilter ? "ready" : status;
  const totalPages = isPrimalBeastFilter
    ? 1
    : Math.max(1, Math.ceil(totalEntries / COMPANION_MONSTERS_PER_PAGE));
  const maxHitPoints = parseHitPointDraftValue(draft.maxHitPoints);
  const maxHitPointsInvalid = maxHitPoints === null || maxHitPoints < 1;
  const saveDisabled =
    draft.name.trim().length === 0 ||
    maxHitPointsInvalid ||
    isSaving ||
    isDeleting ||
    isResettingStatBlock;
  const selectedStatBlockIsPrimalBeast = draft.primalBeastKind !== null;
  const canModifySelectedStatBlock =
    draft.inheritedCreatureEntry !== null && !selectedStatBlockIsPrimalBeast;

  useEffect(() => {
    setDraft(creature ? createDraftFromCompanion(creature) : createEmptyCompanionDraft());
    setShowValidation(false);
    setMonsterNotice(null);
    setIsStatBlockEditorOpen(false);
    setEditorError(null);
  }, [creature]);

  useEffect(() => {
    setMonsterTypeFilter(defaultMonsterTypeFilter);
  }, [defaultMonsterTypeFilter]);

  useEffect(() => {
    setMonsterCache((currentCache) => {
      const nextCache = { ...currentCache };

      creatures.forEach((currentCreature) => {
        if (currentCreature.inheritedCreatureEntry) {
          nextCache[currentCreature.inheritedCreatureEntry.slug] =
            currentCreature.inheritedCreatureEntry;
        }
      });

      if (draft.inheritedCreatureEntry) {
        nextCache[draft.inheritedCreatureEntry.slug] = draft.inheritedCreatureEntry;
      }

      return nextCache;
    });
  }, [creatures, draft.inheritedCreatureEntry]);

  useEffect(() => {
    setCurrentPage(1);
  }, [monsterOrdering, monsterQuery, monsterSourceFilter, monsterTypeFilter]);

  useEffect(() => {
    if (currentPage <= totalPages) {
      return;
    }

    setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    let active = true;
    const abortController = new AbortController();

    async function loadPreviewMonster() {
      if (!previewSlug) {
        setPreviewMonster(null);
        setPreviewStatus("ready");
        return;
      }

      const primalBeast = allowPrimalBeasts
        ? getPrimalBeastTemplateBySlug(previewSlug, character)
        : null;
      const cachedMonster =
        primalBeast ?? monsterCache[previewSlug] ?? getCachedMonsterEntry(previewSlug);

      if (cachedMonster) {
        primeMonsterEntryCache(cachedMonster);
        setPreviewMonster(cachedMonster);
        setPreviewStatus("ready");
        return;
      }

      if (!isOnline) {
        setPreviewMonster(null);
        setPreviewStatus("server-unavailable");
        return;
      }

      setPreviewStatus("loading");

      try {
        const monster = await fetchMonsterBySlug(previewSlug, {
          signal: abortController.signal
        });

        if (!active) {
          return;
        }

        primeMonsterEntryCache(monster);
        setMonsterCache((currentCache) => ({
          ...currentCache,
          [monster.slug]: monster
        }));
        setPreviewMonster(monster);
        setPreviewStatus("ready");
      } catch (error) {
        if (!active || abortController.signal.aborted) {
          return;
        }

        setPreviewMonster(null);
        setPreviewStatus(isApiOfflineError(error) ? "server-unavailable" : "error");
      }
    }

    void loadPreviewMonster();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [allowPrimalBeasts, character, isOnline, monsterCache, previewSlug]);

  function handleDraftChange<Key extends keyof CompanionDraft>(
    key: Key,
    value: CompanionDraft[Key]
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value
    }));
    setEditorError(null);
  }

  async function handleSelectMonster(monster: MonsterListItem | MonsterRecord) {
    const slug = monster.slug;
    setPendingSelectSlug(slug);
    setMonsterNotice(null);

    try {
      const primalBeast = allowPrimalBeasts
        ? getPrimalBeastTemplateBySlug(slug, character)
        : null;
      const resolvedMonster =
        primalBeast ??
        ("document__slug" in monster
          ? monster
          : (monsterCache[slug] ?? (await fetchMonsterBySlug(slug))));
      const primalBeastKind = allowPrimalBeasts
        ? getPrimalBeastKindFromSlug(resolvedMonster.slug)
        : null;
      const hitPoints = Math.max(1, resolvedMonster.hit_points);

      setMonsterCache((currentCache) => ({
        ...currentCache,
        [resolvedMonster.slug]: resolvedMonster
      }));
      setDraft((currentDraft) => ({
        ...currentDraft,
        name: resolvedMonster.name,
        type: primalBeastKind
          ? PRIMAL_BEAST_MONSTER_TYPE
          : resolvedMonster.type.trim()
            ? resolvedMonster.type
            : currentDraft.type,
        maxHitPoints: String(hitPoints),
        primalBeastKind,
        inheritedCreatureEntry: resolvedMonster,
        inheritedCreatureEntryModified: false
      }));
      setIsMonsterBrowserOpen(false);
      setPreviewSlug(null);
      setMonsterNotice(null);
      setEditorError(null);
    } catch (error) {
      setMonsterNotice(
        isApiOfflineError(error)
          ? "Server Unavailable"
          : "The full monster entry could not be loaded."
      );
    } finally {
      setPendingSelectSlug(null);
    }
  }

  function handleClearMonsterSelection() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      inheritedCreatureEntry: null,
      primalBeastKind: null,
      inheritedCreatureEntryModified: false
    }));
    setMonsterNotice(null);
    setEditorError(null);
  }

  function handleSaveStatBlock(monster: MonsterRecord) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      inheritedCreatureEntry: monster,
      inheritedCreatureEntryModified: true
    }));
    setMonsterCache((currentCache) => ({
      ...currentCache,
      [monster.slug]: monster
    }));
    primeMonsterEntryCache(monster);
    setIsStatBlockEditorOpen(false);
    setMonsterNotice(null);
    setEditorError(null);
  }

  async function handleResetStatBlock() {
    const slug = draft.inheritedCreatureEntry?.slug;

    if (!slug || isResettingStatBlock) {
      return;
    }

    if (!isOnline) {
      setMonsterNotice("Server Unavailable");
      return;
    }

    setIsResettingStatBlock(true);
    setMonsterNotice(null);

    try {
      const monster = await fetchMonsterBySlug(slug);

      setDraft((currentDraft) => ({
        ...currentDraft,
        inheritedCreatureEntry: monster,
        inheritedCreatureEntryModified: false
      }));
      setMonsterCache((currentCache) => ({
        ...currentCache,
        [monster.slug]: monster
      }));
      primeMonsterEntryCache(monster);
    } catch (error) {
      setMonsterNotice(
        isApiOfflineError(error)
          ? "Server Unavailable"
          : "The original stat block could not be reloaded."
      );
    } finally {
      setIsResettingStatBlock(false);
    }
  }

  async function handleSave() {
    const name = sanitizeUserInput(draft.name);
    const type = sanitizeUserInput(draft.type);
    const description = sanitizeUserInput(draft.description, { multiline: true });

    setShowValidation(true);

    if (!name || maxHitPointsInvalid || isSaving || isDeleting || isResettingStatBlock) {
      return;
    }

    const isBeastMasterPrimalBeast = isBeastMaster && draft.primalBeastKind !== null;
    const resolvedMaxHitPoints = maxHitPoints!;
    const resolvedCurrentHitPoints = creature
      ? Math.min(Math.max(0, creature.currentHitPoints), resolvedMaxHitPoints)
      : resolvedMaxHitPoints;
    const nextCreature: CharacterCompanion = {
      id: draft.id ?? createCharacterCompanionId(),
      name,
      description,
      type,
      maxHitPoints: resolvedMaxHitPoints,
      currentHitPoints: resolvedCurrentHitPoints,
      temporaryHitPoints: creature?.temporaryHitPoints ?? 0,
      duration: showDurationFields
        ? createManualStatusDuration(draft.durationType, draft.durationValue)
        : createManualStatusDuration("INFINITE", 1),
      ...(creature?.temporaryHitPointsSource
        ? { temporaryHitPointsSource: creature.temporaryHitPointsSource }
        : {}),
      ...(creature?.deathSaves ? { deathSaves: creature.deathSaves } : {}),
      ...(isBeastMasterPrimalBeast ? { role: beastMasterCompanionRole } : {}),
      ...(draft.primalBeastKind ? { primalBeastKind: draft.primalBeastKind } : {}),
      ...(draft.inheritedCreatureEntry
        ? { inheritedCreatureEntry: draft.inheritedCreatureEntry }
        : {}),
      ...(draft.inheritedCreatureEntry && draft.inheritedCreatureEntryModified
        ? { inheritedCreatureEntryModified: true }
        : {})
    };

    setEditorError(null);
    setIsSaving(true);

    try {
      await onSaveCreature(nextCreature);
      onClose();
    } catch (error) {
      setEditorError(getErrorMessage(error, "Unable to save creature."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!draft.id || !onRemoveCreature || isSaving || isDeleting) {
      return;
    }

    setEditorError(null);
    setIsDeleting(true);

    try {
      await onRemoveCreature(draft.id);
      setIsDeleteConfirmationOpen(false);
      onClose();
    } catch (error) {
      setEditorError(getErrorMessage(error, "Unable to delete creature."));
      setIsDeleteConfirmationOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <SheetModal
        titleId={titleId}
        onClose={onClose}
        size="medium"
        isBusy={isSaving || isDeleting || isResettingStatBlock}
        busyLabel={
          isResettingStatBlock
            ? "Resetting stat block"
            : isDeleting
              ? "Deleting creature"
              : "Saving creature"
        }
      >
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayTitle id={titleId}>
              {isEditingExisting ? labels.editTitle : labels.createTitle}
            </OverlayTitle>
            <OverlaySummary>{labels.summary}</OverlaySummary>
          </OverlayHeaderContent>
          <OverlayCloseButton
            label={labels.closeLabel}
            onClick={onClose}
            disabled={isSaving || isDeleting || isResettingStatBlock}
          />
        </OverlayHeader>

        <OverlayBody className={styles.editorBody}>
          <section className={styles.monsterSection}>
            <div className={styles.panelHeader}>
              <h4 className={styles.panelTitle}>{labels.inheritedStatBlockTitle}</h4>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={isSaving || isDeleting || isResettingStatBlock}
                onClick={() => setIsMonsterBrowserOpen(true)}
              >
                <Search size={16} />
                {labels.browseButton}
              </button>
            </div>

            {draft.inheritedCreatureEntry ? (
              <div className={styles.selectedMonsterCard}>
                <div>
                  <h5 className={styles.selectedMonsterTitle}>
                    {draft.inheritedCreatureEntry.name}
                  </h5>
                  <p className={styles.selectedMonsterMeta}>
                    {draft.inheritedCreatureEntry.type || "Unknown type"} ·{" "}
                    {getMonsterSourceLabel(draft.inheritedCreatureEntry)}
                    {draft.inheritedCreatureEntryModified ? " - Modified" : ""}
                  </p>
                </div>
                <div className={styles.selectedMonsterActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={isSaving || isDeleting || isResettingStatBlock}
                    onClick={() => setPreviewSlug(draft.inheritedCreatureEntry?.slug ?? null)}
                  >
                    Preview
                  </button>
                  {canModifySelectedStatBlock ? (
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      disabled={isSaving || isDeleting || isResettingStatBlock}
                      onClick={() => setIsStatBlockEditorOpen(true)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                      Modify
                    </button>
                  ) : selectedStatBlockIsPrimalBeast ? (
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      disabled
                      title="Primal Beast stat blocks are dynamic and cannot be modified yet."
                    >
                      <Pencil size={16} aria-hidden="true" />
                      Modify
                    </button>
                  ) : null}
                  {draft.inheritedCreatureEntryModified && canModifySelectedStatBlock ? (
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      disabled={isSaving || isDeleting || isResettingStatBlock}
                      onClick={() => void handleResetStatBlock()}
                    >
                      <RotateCcw size={16} aria-hidden="true" />
                      {isResettingStatBlock ? "Resetting..." : "Reset"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={styles.removeButtonText}
                    disabled={isSaving || isDeleting || isResettingStatBlock}
                    onClick={handleClearMonsterSelection}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <p className={shared.emptyText}>{labels.noStatBlockText}</p>
            )}

            {monsterNotice ? <p className={styles.notice}>{monsterNotice}</p> : null}
          </section>

          <div className={shared.formGrid}>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Name</span>
              <TextInput
                value={draft.name}
                invalid={showValidation && draft.name.trim().length === 0}
                disabled={isSaving || isDeleting}
                onChange={(event) => handleDraftChange("name", event.target.value)}
                placeholder="Cat, Spirit Wolf, Squire..."
              />
            </label>

            <label className={shared.field}>
              <span className={shared.fieldLabel}>Type</span>
              <SelectInput
                value={draft.type}
                disabled={isSaving || isDeleting}
                onChange={(event) => handleDraftChange("type", event.target.value)}
              >
                <option value="">No type</option>
                <optgroup label="Monster Types">
                  {monsterTypeOptions.map((typeOption) => (
                    <option key={typeOption} value={typeOption}>
                      {typeOption}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Species">
                  {companionSpeciesTypeOptions.map((typeOption) => (
                    <option key={typeOption} value={typeOption}>
                      {typeOption}
                    </option>
                  ))}
                </optgroup>
                {extraTypeOptions.length > 0 ? (
                  <optgroup label="Saved Types">
                    {extraTypeOptions.map((typeOption) => (
                      <option key={typeOption} value={typeOption}>
                        {typeOption}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
              </SelectInput>
            </label>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Max HP</span>
              <TextInput
                value={draft.maxHitPoints}
                invalid={showValidation && maxHitPointsInvalid}
                disabled={isSaving || isDeleting}
                onChange={(event) => handleDraftChange("maxHitPoints", event.target.value)}
                placeholder="20"
              />
            </label>
            {showDurationFields ? (
              <ManualStatusDurationFields
                durationType={draft.durationType}
                durationValue={draft.durationValue}
                durationTypeOptions={companionDurationTypeOptions}
                onDurationTypeChange={(value) => handleDraftChange("durationType", value)}
                onDurationValueChange={(value) => handleDraftChange("durationValue", value)}
              />
            ) : null}

            <label className={shared.fieldWide}>
              <span className={shared.fieldLabel}>Description</span>
              <TextAreaInput
                value={draft.description}
                disabled={isSaving || isDeleting}
                onChange={(event) => handleDraftChange("description", event.target.value)}
                rows={5}
                placeholder="Notes about personality, tactics, relationship, or appearance."
              />
            </label>
          </div>

          {editorError ? <p className={styles.notice}>{editorError}</p> : null}
        </OverlayBody>

        <OverlayFooter className={styles.editorFooter}>
          {isEditingExisting && onRemoveCreature ? (
            <div className={styles.editorFooterActions}>
              <ActionButton onClick={() => void handleSave()} disabled={saveDisabled} loading={isSaving}>
                {labels.saveButton}
              </ActionButton>
              <ActionButton
                actionType="ERROR"
                variant="OUTLINE"
                disabled={isSaving || isDeleting}
                loading={isDeleting}
                onClick={() => setIsDeleteConfirmationOpen(true)}
                icon={<Trash2 size={16} aria-hidden="true" />}
              >
                {labels.deleteButton}
              </ActionButton>
            </div>
          ) : (
            <ActionButton onClick={() => void handleSave()} disabled={saveDisabled} loading={isSaving}>
              {isEditingExisting ? labels.saveButton : labels.createButton}
            </ActionButton>
          )}
        </OverlayFooter>
      </SheetModal>

      {isMonsterBrowserOpen ? (
        <MonsterBrowserModal
          monsters={monsters}
          totalEntries={totalEntries}
          status={browserStatus}
          currentPage={currentPage}
          totalPages={totalPages}
          query={monsterQuery}
          searchResetSignal={monsterSearchResetSignal}
          selectedMonsterSlug={selectedMonsterSlug}
          monsterTypeFilter={monsterTypeFilter}
          monsterSourceFilter={monsterSourceFilter}
          monsterTypeOptions={monsterTypeOptions}
          ordering={monsterOrdering}
          pendingSelectSlug={pendingSelectSlug}
          title={labels.browseTitle}
          summary={labels.browseSummary}
          onClose={() => setIsMonsterBrowserOpen(false)}
          onQueryChange={setMonsterQuery}
          onMonsterTypeFilterChange={(value) => {
            setMonsterQuery("");
            setMonsterSearchResetSignal((currentSignal) => currentSignal + 1);
            setMonsterTypeFilter(value);
          }}
          onMonsterSourceFilterChange={(value) => {
            setMonsterQuery("");
            setMonsterSearchResetSignal((currentSignal) => currentSignal + 1);
            setMonsterSourceFilter(value);
          }}
          onOrderingChange={setMonsterOrdering}
          onPageChange={setCurrentPage}
          onOpenMonsterPreview={(monster) => setPreviewSlug(monster.slug)}
          onSelectMonster={handleSelectMonster}
        />
      ) : null}

      {previewSlug ? (
        <MonsterEntryDrawer
          monster={previewMonster}
          status={previewStatus}
          onClose={() => setPreviewSlug(null)}
          badgeLabel={
            allowPrimalBeasts && getPrimalBeastTemplateBySlug(previewSlug)
              ? "Primal Beast"
              : labels.previewBadgeLabel
          }
          backdropClassName={styles.previewBackdrop}
          drawerClassName={styles.previewDrawer}
          footer={
            previewStatus === "ready" && previewMonster ? (
              <ActionButton onClick={() => void handleSelectMonster(previewMonster)}>
                {labels.useMonsterButton}
              </ActionButton>
            ) : null
          }
        />
      ) : null}

      {isStatBlockEditorOpen && draft.inheritedCreatureEntry && canModifySelectedStatBlock ? (
        <CreatureStatBlockEditorModal
          monster={draft.inheritedCreatureEntry}
          onClose={() => setIsStatBlockEditorOpen(false)}
          onSave={handleSaveStatBlock}
        />
      ) : null}

      {isDeleteConfirmationOpen && creature ? (
        <DestructiveConfirmationModal
          titleId={deleteTitleId}
          title={labels.deleteTitle}
          message={labels.deleteMessage(creature)}
          confirmLabel={isDeleting ? "Deleting..." : labels.deleteConfirmLabel}
          closeLabel={labels.deleteCloseLabel}
          onCancel={() => setIsDeleteConfirmationOpen(false)}
          onConfirm={() => {
            void handleDeleteConfirm();
          }}
        />
      ) : null}
    </>
  );
}

export default CreatureEditorModal;
