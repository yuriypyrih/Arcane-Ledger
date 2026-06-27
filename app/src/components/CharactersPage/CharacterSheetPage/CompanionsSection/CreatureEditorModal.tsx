import { Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import { type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { fetchMonsterByKey, isApiOfflineError } from "../../../../api";
import {
  listCustomBestiary,
  type CustomBestiaryListScope,
  type CustomBestiaryRecord
} from "../../../../api/customBestiary";
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
  getPrimalBeastKindFromKey,
  getPrimalBeastTemplateByKey,
  isPrimalBeastMonsterType,
  primalBeastMonsterListItems,
  PRIMAL_BEAST_MONSTER_TYPE
} from "../../../../pages/CharactersPage/companionPrimalBeasts";
import { useMonsterEntries } from "../../../../pages/CodexPage/useMonsterEntries";
import { useAppSelector } from "../../../../store";
import {
  getCachedMonsterEntry,
  getMonsterChallengeRatingNumber,
  getMonsterHitPoints,
  getMonsterKey,
  getMonsterListItemKey,
  getMonsterTypeName,
  isDeprecatedMonsterRecord,
  primeMonsterEntryCache
} from "../../../../utils/monsters";
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
import {
  customBestiaryRecordToListItem,
  filterCustomBestiaryRecords,
  getCustomBestiaryMonsterByKey,
  sortCustomBestiaryRecords
} from "./customBestiaryBrowser";
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
  initialDraft?: Partial<CompanionDraft>;
  labels: CreatureEditorLabels;
  onClose: () => void;
  onRemoveCreature?: (creatureId: string) => void | Promise<void>;
  onSaveCreature: (creature: CharacterCompanion) => void | Promise<void>;
  preserveTypeOnMonsterSelect?: boolean;
  showSeparateInitiativeToggle?: boolean;
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
      case "challenge_rating":
      case "cr":
        return (
          (getMonsterChallengeRatingNumber(left) ?? 0) -
            (getMonsterChallengeRatingNumber(right) ?? 0) ||
          left.name.localeCompare(right.name)
        );
      case "-challenge_rating":
      case "-cr":
        return (
          (getMonsterChallengeRatingNumber(right) ?? 0) -
            (getMonsterChallengeRatingNumber(left) ?? 0) ||
          left.name.localeCompare(right.name)
        );
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

function isMonsterRecord(value: MonsterListItem | MonsterRecord): value is MonsterRecord {
  return "document" in value || "actions" in value || "traits" in value;
}

function CreatureEditorModal({
  allowPrimalBeasts = false,
  character,
  creature,
  creatures,
  getErrorMessage = getDefaultErrorMessage,
  initialDraft,
  labels,
  onClose,
  onRemoveCreature,
  onSaveCreature,
  preserveTypeOnMonsterSelect = false,
  showSeparateInitiativeToggle = false,
  showDurationFields = true
}: CreatureEditorModalProps) {
  const isOnline = useOnlineStatus();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const titleId = useId();
  const deleteTitleId = useId();
  const isEditingExisting = creature !== null;
  const canUseCustomBestiary = authStatus === "authenticated";
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
    creature ? createDraftFromCompanion(creature) : createEmptyCompanionDraft(initialDraft)
  );
  const [showValidation, setShowValidation] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [isMonsterBrowserOpen, setIsMonsterBrowserOpen] = useState(false);
  const [monsterQuery, setMonsterQuery] = useState("");
  const [monsterSearchResetSignal, setMonsterSearchResetSignal] = useState(0);
  const [monsterTypeFilter, setMonsterTypeFilter] = useState<string>(defaultMonsterTypeFilter);
  const [monsterSourceFilter, setMonsterSourceFilter] = useState<string>("all");
  const [monsterOrdering, setMonsterOrdering] = useState<MonsterOrdering>("name");
  const [monsterSourceMode, setMonsterSourceMode] = useState<"standard" | "custom">("standard");
  const [customBestiaryScope, setCustomBestiaryScope] =
    useState<CustomBestiaryListScope>("mine");
  const [customBestiaryRecords, setCustomBestiaryRecords] = useState<CustomBestiaryRecord[]>([]);
  const [customBestiaryStatus, setCustomBestiaryStatus] = useState<CodexStatus>("ready");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [previewMonster, setPreviewMonster] = useState<MonsterRecord | null>(null);
  const [previewStatus, setPreviewStatus] = useState<CodexStatus>("ready");
  const [pendingSelectKey, setPendingSelectKey] = useState<string | null>(null);
  const [monsterNotice, setMonsterNotice] = useState<string | null>(null);
  const [isStatBlockEditorOpen, setIsStatBlockEditorOpen] = useState(false);
  const [isResettingStatBlock, setIsResettingStatBlock] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [monsterCache, setMonsterCache] = useState<Record<string, MonsterRecord>>(() =>
    creatures.reduce<Record<string, MonsterRecord>>((cache, currentCreature) => {
      if (currentCreature.inheritedCreatureEntry) {
        cache[getMonsterKey(currentCreature.inheritedCreatureEntry)] =
          currentCreature.inheritedCreatureEntry;
      }

      return cache;
    }, {})
  );
  const loadedCustomBestiaryForAuthRef = useRef<string | null>(null);
  const selectedMonsterKey = draft.inheritedCreatureEntry
    ? getMonsterKey(draft.inheritedCreatureEntry)
    : null;
  const isPrimalBeastFilter =
    allowPrimalBeasts && isPrimalBeastMonsterType(monsterTypeFilter);
  const isCustomBestiaryMode = canUseCustomBestiary && monsterSourceMode === "custom";
  const extraTypeOptions = useMemo(
    () =>
      getExtraTypeOptions([
        draft.type,
        ...creatures.map((currentCreature) => currentCreature.type),
        draft.inheritedCreatureEntry ? (getMonsterTypeName(draft.inheritedCreatureEntry) ?? "") : ""
      ]),
    [creatures, draft.inheritedCreatureEntry, draft.type]
  );
  const { payload, status } = useMonsterEntries({
    enabled: isMonsterBrowserOpen && !isPrimalBeastFilter && !isCustomBestiaryMode,
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
  const customBestiaryItems = useMemo(() => {
    const filteredRecords = filterCustomBestiaryRecords(customBestiaryRecords, {
      query: monsterQuery,
      type: monsterTypeFilter
    });

    return sortCustomBestiaryRecords(filteredRecords, monsterOrdering).map(
      customBestiaryRecordToListItem
    );
  }, [customBestiaryRecords, monsterOrdering, monsterQuery, monsterTypeFilter]);
  const customBestiaryPageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * COMPANION_MONSTERS_PER_PAGE;

    return customBestiaryItems.slice(startIndex, startIndex + COMPANION_MONSTERS_PER_PAGE);
  }, [currentPage, customBestiaryItems]);
  const monsters = isCustomBestiaryMode
    ? customBestiaryPageItems
    : isPrimalBeastFilter
      ? primalBeastItems
      : (payload?.results ?? []);
  const totalEntries = isCustomBestiaryMode
    ? customBestiaryItems.length
    : isPrimalBeastFilter
      ? primalBeastItems.length
      : (payload?.count ?? 0);
  const browserStatus: CodexStatus = isCustomBestiaryMode
    ? customBestiaryStatus
    : isPrimalBeastFilter
      ? "ready"
      : status;
  const totalPages = Math.max(1, Math.ceil(totalEntries / COMPANION_MONSTERS_PER_PAGE));
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
    draft.inheritedCreatureEntry !== null &&
    !selectedStatBlockIsPrimalBeast &&
    !isDeprecatedMonsterRecord(draft.inheritedCreatureEntry);

  useEffect(() => {
    setDraft(creature ? createDraftFromCompanion(creature) : createEmptyCompanionDraft(initialDraft));
    setShowValidation(false);
    setMonsterNotice(null);
    setIsStatBlockEditorOpen(false);
    setEditorError(null);
  }, [creature, initialDraft]);

  useEffect(() => {
    setMonsterTypeFilter(defaultMonsterTypeFilter);
  }, [defaultMonsterTypeFilter]);

  useEffect(() => {
    setMonsterCache((currentCache) => {
      const nextCache = { ...currentCache };

      creatures.forEach((currentCreature) => {
        if (currentCreature.inheritedCreatureEntry) {
          nextCache[getMonsterKey(currentCreature.inheritedCreatureEntry)] =
            currentCreature.inheritedCreatureEntry;
        }
      });

      if (draft.inheritedCreatureEntry) {
        nextCache[getMonsterKey(draft.inheritedCreatureEntry)] = draft.inheritedCreatureEntry;
      }

      return nextCache;
    });
  }, [creatures, draft.inheritedCreatureEntry]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    customBestiaryScope,
    monsterOrdering,
    monsterQuery,
    monsterSourceFilter,
    monsterSourceMode,
    monsterTypeFilter
  ]);

  useEffect(() => {
    if (canUseCustomBestiary || monsterSourceMode !== "custom") {
      return;
    }

    setMonsterSourceMode("standard");
  }, [canUseCustomBestiary, monsterSourceMode]);

  useEffect(() => {
    let active = true;
    const loadKey =
      isMonsterBrowserOpen && isCustomBestiaryMode && authUserId
        ? `${authUserId}:${customBestiaryScope}`
        : null;

    if (!loadKey) {
      return () => {
        active = false;
      };
    }

    if (loadedCustomBestiaryForAuthRef.current === loadKey) {
      return () => {
        active = false;
      };
    }

    loadedCustomBestiaryForAuthRef.current = loadKey;
    setCustomBestiaryStatus("loading");

    void listCustomBestiary({
      scope: customBestiaryScope,
      suppressFailureToast: true
    })
      .then(({ customBestiary }) => {
        if (!active) {
          return;
        }

        setCustomBestiaryRecords(customBestiary);
        setCustomBestiaryStatus("ready");
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setCustomBestiaryStatus(isApiOfflineError(error) ? "server-unavailable" : "error");
        loadedCustomBestiaryForAuthRef.current = null;
      });

    return () => {
      active = false;
    };
  }, [authUserId, customBestiaryScope, isCustomBestiaryMode, isMonsterBrowserOpen]);

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
      if (!previewKey) {
        setPreviewMonster(null);
        setPreviewStatus("ready");
        return;
      }

      const primalBeast = allowPrimalBeasts
        ? getPrimalBeastTemplateByKey(previewKey, character)
        : null;
      const customBestiaryMonster = getCustomBestiaryMonsterByKey(
        customBestiaryRecords,
        previewKey
      );
      const cachedMonster =
        primalBeast ??
        customBestiaryMonster ??
        monsterCache[previewKey] ??
        getCachedMonsterEntry(previewKey);

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
        const monster = await fetchMonsterByKey(previewKey, {
          signal: abortController.signal
        });

        if (!active) {
          return;
        }

        primeMonsterEntryCache(monster);
        setMonsterCache((currentCache) => ({
          ...currentCache,
          [getMonsterKey(monster)]: monster
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
  }, [allowPrimalBeasts, character, customBestiaryRecords, isOnline, monsterCache, previewKey]);

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
    const key = isMonsterRecord(monster) ? getMonsterKey(monster) : getMonsterListItemKey(monster);
    setPendingSelectKey(key);
    setMonsterNotice(null);

    try {
      const primalBeast = allowPrimalBeasts
        ? getPrimalBeastTemplateByKey(key, character)
        : null;
      const customBestiaryMonster = getCustomBestiaryMonsterByKey(customBestiaryRecords, key);
      const resolvedMonster =
        primalBeast ??
        customBestiaryMonster ??
        (isMonsterRecord(monster)
          ? monster
          : (monsterCache[key] ?? (await fetchMonsterByKey(key))));
      const primalBeastKind = allowPrimalBeasts
        ? getPrimalBeastKindFromKey(getMonsterKey(resolvedMonster))
        : null;
      const hitPoints = Math.max(1, getMonsterHitPoints(resolvedMonster) ?? 1);
      const typeName = getMonsterTypeName(resolvedMonster);

      setMonsterCache((currentCache) => ({
        ...currentCache,
        [getMonsterKey(resolvedMonster)]: resolvedMonster
      }));
      setDraft((currentDraft) => ({
        ...currentDraft,
        name: resolvedMonster.name,
        type:
          preserveTypeOnMonsterSelect && currentDraft.type.trim().length > 0
            ? currentDraft.type
            : primalBeastKind
              ? PRIMAL_BEAST_MONSTER_TYPE
              : typeName
                ? typeName
                : currentDraft.type,
        maxHitPoints: String(hitPoints),
        primalBeastKind,
        inheritedCreatureEntry: resolvedMonster,
        inheritedCreatureEntryModified: false
      }));
      setIsMonsterBrowserOpen(false);
      setPreviewKey(null);
      setMonsterNotice(null);
      setEditorError(null);
    } catch (error) {
      setMonsterNotice(
        isApiOfflineError(error)
          ? "Server Unavailable"
          : "The full monster entry could not be loaded."
      );
    } finally {
      setPendingSelectKey(null);
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
      [getMonsterKey(monster)]: monster
    }));
    primeMonsterEntryCache(monster);
    setIsStatBlockEditorOpen(false);
    setMonsterNotice(null);
    setEditorError(null);
  }

  async function handleResetStatBlock() {
    const key = draft.inheritedCreatureEntry ? getMonsterKey(draft.inheritedCreatureEntry) : null;

    if (!key || isResettingStatBlock) {
      return;
    }

    if (!isOnline) {
      setMonsterNotice("Server Unavailable");
      return;
    }

    setIsResettingStatBlock(true);
    setMonsterNotice(null);

    try {
      const monster = await fetchMonsterByKey(key);

      setDraft((currentDraft) => ({
        ...currentDraft,
        inheritedCreatureEntry: monster,
        inheritedCreatureEntryModified: false
      }));
      setMonsterCache((currentCache) => ({
        ...currentCache,
        [getMonsterKey(monster)]: monster
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
      source: draft.source || creature?.source || "Manual",
      separateInitiative: showSeparateInitiativeToggle ? draft.separateInitiative : false,
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
              <ActionButton
                actionType="INFO"
                variant="FILL"
                size="sm"
                fullWidth={false}
                icon={<Search size={16} aria-hidden="true" />}
                disabled={isSaving || isDeleting || isResettingStatBlock}
                onClick={() => setIsMonsterBrowserOpen(true)}
              >
                {labels.browseButton}
              </ActionButton>
            </div>

            {draft.inheritedCreatureEntry ? (
              <div className={styles.selectedMonsterCard}>
                <div>
                  <h5 className={styles.selectedMonsterTitle}>
                    {draft.inheritedCreatureEntry.name}
                  </h5>
                  <p className={styles.selectedMonsterMeta}>
                    {getMonsterTypeName(draft.inheritedCreatureEntry) || "Unknown type"} ·{" "}
                    {getMonsterSourceLabel(draft.inheritedCreatureEntry)}
                    {draft.inheritedCreatureEntryModified ? " - Modified" : ""}
                  </p>
                </div>
                <div className={styles.selectedMonsterActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={isSaving || isDeleting || isResettingStatBlock}
                    onClick={() =>
                      setPreviewKey(
                        draft.inheritedCreatureEntry
                          ? getMonsterKey(draft.inheritedCreatureEntry)
                          : null
                      )
                    }
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

          <div className={`${shared.formGrid} ${styles.editorInputGrid}`}>
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

            {showSeparateInitiativeToggle ? (
              <label className={`${shared.field} ${styles.initiativeToggleField}`}>
                <span className={styles.initiativeToggleLabel}>
                  <input
                    type="checkbox"
                    checked={draft.separateInitiative}
                    disabled={isSaving || isDeleting}
                    onChange={(event) =>
                      handleDraftChange("separateInitiative", event.target.checked)
                    }
                  />
                  <span>Separate initiative</span>
                </span>
              </label>
            ) : null}

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
          selectedMonsterKey={selectedMonsterKey}
          monsterTypeFilter={monsterTypeFilter}
          monsterSourceFilter={monsterSourceFilter}
          monsterTypeOptions={monsterTypeOptions}
          ordering={monsterOrdering}
          pendingSelectKey={pendingSelectKey}
          canUseCustomSource={canUseCustomBestiary}
          customScope={customBestiaryScope}
          sourceMode={isCustomBestiaryMode ? "custom" : "standard"}
          title={labels.browseTitle}
          summary={labels.browseSummary}
          onClose={() => setIsMonsterBrowserOpen(false)}
          onCustomScopeChange={(scope) => {
            loadedCustomBestiaryForAuthRef.current = null;
            setCustomBestiaryScope(scope);
          }}
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
          onOpenMonsterPreview={(monster) => setPreviewKey(getMonsterListItemKey(monster))}
          onSelectMonster={handleSelectMonster}
          onSourceModeChange={(sourceMode) => {
            setMonsterSourceMode(sourceMode);
          }}
        />
      ) : null}

      {previewKey ? (
        <MonsterEntryDrawer
          monster={previewMonster}
          status={previewStatus}
          onClose={() => setPreviewKey(null)}
          badgeLabel={
            allowPrimalBeasts && getPrimalBeastTemplateByKey(previewKey)
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
