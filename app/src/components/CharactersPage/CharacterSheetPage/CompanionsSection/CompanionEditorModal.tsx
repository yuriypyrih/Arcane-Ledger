import { Search, Trash2 } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
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

type CompanionEditorModalProps = {
  character: Character;
  companion: CharacterCompanion | null;
  companions: CharacterCompanion[];
  onSaveCompanion: (companion: CharacterCompanion) => void;
  onRemoveCompanion: (companionId: string) => void;
  onClose: () => void;
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

function CompanionEditorModal({
  character,
  companion,
  companions,
  onSaveCompanion,
  onRemoveCompanion,
  onClose
}: CompanionEditorModalProps) {
  const isOnline = useOnlineStatus();
  const titleId = useId();
  const deleteTitleId = useId();
  const isEditingExisting = companion !== null;
  const isBeastMaster = isBeastMasterCharacter(character);
  const defaultMonsterTypeFilter = isBeastMaster ? PRIMAL_BEAST_MONSTER_TYPE : "all";
  const [draft, setDraft] = useState<CompanionDraft>(() =>
    companion ? createDraftFromCompanion(companion) : createEmptyCompanionDraft()
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
  const [monsterCache, setMonsterCache] = useState<Record<string, MonsterRecord>>(() =>
    companions.reduce<Record<string, MonsterRecord>>((cache, currentCompanion) => {
      if (currentCompanion.inheritedCreatureEntry) {
        cache[currentCompanion.inheritedCreatureEntry.slug] =
          currentCompanion.inheritedCreatureEntry;
      }

      return cache;
    }, {})
  );
  const selectedMonsterSlug = draft.inheritedCreatureEntry?.slug ?? null;
  const isPrimalBeastFilter = isPrimalBeastMonsterType(monsterTypeFilter);
  const extraTypeOptions = useMemo(
    () =>
      getExtraTypeOptions([
        draft.type,
        ...companions.map((currentCompanion) => currentCompanion.type),
        draft.inheritedCreatureEntry?.type ?? ""
      ]),
    [companions, draft.inheritedCreatureEntry?.type, draft.type]
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
    () => getPrimalBeastBrowserItems(monsterQuery, monsterOrdering),
    [monsterOrdering, monsterQuery]
  );
  const monsters = isPrimalBeastFilter ? primalBeastItems : (payload?.results ?? []);
  const totalEntries = isPrimalBeastFilter ? primalBeastItems.length : (payload?.count ?? 0);
  const browserStatus: CodexStatus = isPrimalBeastFilter ? "ready" : status;
  const totalPages = isPrimalBeastFilter
    ? 1
    : Math.max(1, Math.ceil(totalEntries / COMPANION_MONSTERS_PER_PAGE));
  const maxHitPoints = parseHitPointDraftValue(draft.maxHitPoints);
  const currentHitPoints = parseHitPointDraftValue(draft.currentHitPoints);
  const maxHitPointsInvalid = maxHitPoints === null || maxHitPoints < 1;
  const currentHitPointsInvalid =
    currentHitPoints === null ||
    currentHitPoints < 0 ||
    (maxHitPoints !== null && currentHitPoints > maxHitPoints);

  useEffect(() => {
    setDraft(companion ? createDraftFromCompanion(companion) : createEmptyCompanionDraft());
    setShowValidation(false);
    setMonsterNotice(null);
  }, [companion]);

  useEffect(() => {
    setMonsterCache((currentCache) => {
      const nextCache = { ...currentCache };

      companions.forEach((currentCompanion) => {
        if (currentCompanion.inheritedCreatureEntry) {
          nextCache[currentCompanion.inheritedCreatureEntry.slug] =
            currentCompanion.inheritedCreatureEntry;
        }
      });

      if (draft.inheritedCreatureEntry) {
        nextCache[draft.inheritedCreatureEntry.slug] = draft.inheritedCreatureEntry;
      }

      return nextCache;
    });
  }, [companions, draft.inheritedCreatureEntry]);

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

      const primalBeast = getPrimalBeastTemplateBySlug(previewSlug, character);
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
  }, [character, isOnline, monsterCache, previewSlug]);

  function handleDraftChange<Key extends keyof CompanionDraft>(
    key: Key,
    value: CompanionDraft[Key]
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value
    }));
  }

  async function handleSelectMonster(monster: MonsterListItem | MonsterRecord) {
    const slug = monster.slug;
    setPendingSelectSlug(slug);
    setMonsterNotice(null);

    try {
      const primalBeast = getPrimalBeastTemplateBySlug(slug, character);
      const resolvedMonster =
        primalBeast ??
        ("document__slug" in monster
          ? monster
          : (monsterCache[slug] ?? (await fetchMonsterBySlug(slug))));
      const primalBeastKind = getPrimalBeastKindFromSlug(resolvedMonster.slug);
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
        currentHitPoints: String(hitPoints),
        primalBeastKind,
        inheritedCreatureEntry: resolvedMonster
      }));
      setIsMonsterBrowserOpen(false);
      setPreviewSlug(null);
      setMonsterNotice(null);
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
      primalBeastKind: null
    }));
    setMonsterNotice(null);
  }

  function handleSave() {
    const name = sanitizeUserInput(draft.name);
    const type = sanitizeUserInput(draft.type);
    const description = sanitizeUserInput(draft.description, { multiline: true });

    setShowValidation(true);

    if (!name || !type || maxHitPointsInvalid || currentHitPointsInvalid) {
      return;
    }

    const isBeastMasterPrimalBeast = isBeastMaster && draft.primalBeastKind !== null;

    onSaveCompanion({
      id: draft.id ?? createCharacterCompanionId(),
      name,
      description,
      type,
      maxHitPoints: maxHitPoints!,
      currentHitPoints: currentHitPoints!,
      temporaryHitPoints: companion?.temporaryHitPoints ?? 0,
      duration: createManualStatusDuration(draft.durationType, draft.durationValue),
      ...(companion?.temporaryHitPointsSource
        ? { temporaryHitPointsSource: companion.temporaryHitPointsSource }
        : {}),
      ...(companion?.deathSaves ? { deathSaves: companion.deathSaves } : {}),
      ...(isBeastMasterPrimalBeast ? { role: beastMasterCompanionRole } : {}),
      ...(draft.primalBeastKind ? { primalBeastKind: draft.primalBeastKind } : {}),
      ...(draft.inheritedCreatureEntry
        ? { inheritedCreatureEntry: draft.inheritedCreatureEntry }
        : {})
    });
    onClose();
  }

  function handleDeleteConfirm() {
    if (!draft.id) {
      return;
    }

    onRemoveCompanion(draft.id);
    setIsDeleteConfirmationOpen(false);
    onClose();
  }

  return (
    <>
      <SheetModal titleId={titleId} onClose={onClose} size="medium">
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayTitle id={titleId}>
              {isEditingExisting ? "Edit companion" : "Create companion"}
            </OverlayTitle>
            <OverlaySummary>
              Companions can be created from a stat block or written as a custom NPC.
            </OverlaySummary>
          </OverlayHeaderContent>
          <OverlayCloseButton label="Close companion editor" onClick={onClose} />
        </OverlayHeader>

        <OverlayBody className={styles.editorBody}>
          <div className={shared.formGrid}>
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Name</span>
              <TextInput
                value={draft.name}
                invalid={showValidation && draft.name.trim().length === 0}
                onChange={(event) => handleDraftChange("name", event.target.value)}
                placeholder="Cat, Spirit Wolf, Squire..."
              />
            </label>

            <label className={shared.field}>
              <span className={shared.fieldLabel}>Type</span>
              <SelectInput
                value={draft.type}
                invalid={showValidation && draft.type.trim().length === 0}
                onChange={(event) => handleDraftChange("type", event.target.value)}
              >
                <option value="">Choose a type</option>
                <optgroup label="Monster Types">
                  {companionMonsterTypeOptions.map((typeOption) => (
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
              <span className={shared.fieldLabel}>Current HP</span>
              <TextInput
                value={draft.currentHitPoints}
                invalid={showValidation && currentHitPointsInvalid}
                onChange={(event) => handleDraftChange("currentHitPoints", event.target.value)}
                placeholder="20"
              />
            </label>

            <label className={shared.field}>
              <span className={shared.fieldLabel}>Max HP</span>
              <TextInput
                value={draft.maxHitPoints}
                invalid={showValidation && maxHitPointsInvalid}
                onChange={(event) => handleDraftChange("maxHitPoints", event.target.value)}
                placeholder="20"
              />
            </label>

            <ManualStatusDurationFields
              durationType={draft.durationType}
              durationValue={draft.durationValue}
              durationTypeOptions={companionDurationTypeOptions}
              onDurationTypeChange={(value) => handleDraftChange("durationType", value)}
              onDurationValueChange={(value) => handleDraftChange("durationValue", value)}
            />

            <label className={shared.fieldWide}>
              <span className={shared.fieldLabel}>Description</span>
              <TextAreaInput
                value={draft.description}
                onChange={(event) => handleDraftChange("description", event.target.value)}
                rows={5}
                placeholder="Notes about personality, tactics, relationship, or appearance."
              />
            </label>
          </div>

          <section className={styles.monsterSection}>
            <div className={styles.panelHeader}>
              <h4 className={styles.panelTitle}>Inherited stat block</h4>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setIsMonsterBrowserOpen(true)}
              >
                <Search size={16} />
                Browse Monsters
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
                  </p>
                </div>
                <div className={styles.selectedMonsterActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setPreviewSlug(draft.inheritedCreatureEntry?.slug ?? null)}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    className={styles.removeButtonText}
                    onClick={handleClearMonsterSelection}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <p className={shared.emptyText}>No stat block selected.</p>
            )}

            {monsterNotice ? <p className={styles.notice}>{monsterNotice}</p> : null}
          </section>
        </OverlayBody>

        <OverlayFooter className={styles.editorFooter}>
          {isEditingExisting ? (
            <div className={styles.editorFooterActions}>
              <ActionButton onClick={handleSave}>Save Changes</ActionButton>
              <ActionButton
                actionType="ERROR"
                variant="GHOST"
                onClick={() => setIsDeleteConfirmationOpen(true)}
                icon={<Trash2 size={16} aria-hidden="true" />}
              >
                Delete
              </ActionButton>
            </div>
          ) : (
            <ActionButton onClick={handleSave}>Create Companion</ActionButton>
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
          ordering={monsterOrdering}
          pendingSelectSlug={pendingSelectSlug}
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
            getPrimalBeastTemplateBySlug(previewSlug) ? "Primal Beast" : "Monster Preview"
          }
          backdropClassName={styles.previewBackdrop}
          drawerClassName={styles.previewDrawer}
          footer={
            previewStatus === "ready" && previewMonster ? (
              <ActionButton onClick={() => void handleSelectMonster(previewMonster)}>
                Use Monster
              </ActionButton>
            ) : null
          }
        />
      ) : null}

      {isDeleteConfirmationOpen && companion ? (
        <DestructiveConfirmationModal
          titleId={deleteTitleId}
          title="Delete companion?"
          message={
            <>
              This will permanently remove <strong>{companion.name}</strong> from this character.
            </>
          }
          confirmLabel="Delete"
          closeLabel="Close delete companion confirmation"
          onCancel={() => setIsDeleteConfirmationOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}

export default CompanionEditorModal;
