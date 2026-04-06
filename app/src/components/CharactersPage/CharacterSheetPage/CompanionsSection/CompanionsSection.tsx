import clsx from "clsx";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { fetchMonsterBySlug } from "../../../../api";
import CellContainer from "../../../CellContainer/CellContainer";
import MonsterCodexTable from "../../../CodexPage/MonsterCodexTable";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayDetailsGrid,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetDrawer,
  SheetModal
} from "../../../Overlay";
import MonsterEntryDrawer from "../../../MonsterEntryRenderer/MonsterEntryDrawer";
import MonsterEntryRenderer from "../../../MonsterEntryRenderer/MonsterEntryRenderer";
import SelectInput from "../../FormInputs/SelectInput";
import TextAreaInput from "../../FormInputs/TextAreaInput";
import TextInput from "../../FormInputs/TextInput";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { MONSTER_SOURCE_OPTIONS, MONSTER_TYPE_OPTIONS } from "../../../../constants/monsters";
import { getSpeciesEntries } from "../../../../codex/selectors";
import { createCharacterCompanionId } from "../../../../pages/CharactersPage/companions";
import { speciesOptions } from "../../../../pages/CharactersPage/constants";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { useMonsterEntries } from "../../../../pages/CodexPage/useMonsterEntries";
import type {
  Character,
  CharacterCompanion,
  CodexStatus,
  MonsterListItem,
  MonsterOrdering,
  MonsterRecord
} from "../../../../types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./CompanionsSection.module.css";

type CompanionsSectionProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type CompanionDraft = {
  id: string | null;
  name: string;
  description: string;
  type: string;
  inheritedCreatureEntry: MonsterRecord | null;
};

const MONSTERS_PER_PAGE = 8;
const orderingOptions: Array<{ value: MonsterOrdering; label: string }> = [
  { value: "name", label: "Name (A-Z)" },
  { value: "-name", label: "Name (Z-A)" },
  { value: "cr", label: "CR (Low-High)" },
  { value: "-cr", label: "CR (High-Low)" }
];

const baseMonsterTypeOptions = Array.from(new Set([...MONSTER_TYPE_OPTIONS, "Undead"])).sort(
  (left, right) => left.localeCompare(right)
);
const baseSpeciesTypeOptions = Array.from(
  new Set([
    ...speciesOptions,
    ...getSpeciesEntries().map((entry) => entry.name.trim()).filter((entry) => entry.length > 0)
  ])
).sort((left, right) => left.localeCompare(right));

function createEmptyDraft(): CompanionDraft {
  return {
    id: null,
    name: "",
    description: "",
    type: "",
    inheritedCreatureEntry: null
  };
}

function createDraftFromCompanion(companion: CharacterCompanion): CompanionDraft {
  return {
    id: companion.id,
    name: companion.name,
    description: companion.description,
    type: companion.type,
    inheritedCreatureEntry: companion.inheritedCreatureEntry ?? null
  };
}

function getInheritedEntryLabel(companion: Pick<CharacterCompanion, "inheritedCreatureEntry">) {
  if (!companion.inheritedCreatureEntry) {
    return "Custom";
  }

  const sourceLabel = [
    companion.inheritedCreatureEntry.document__slug,
    companion.inheritedCreatureEntry.document__title
  ]
    .map((entry) => entry.trim())
    .filter(Boolean)
    .join(" - ");

  return sourceLabel.length > 0 ? sourceLabel : "Monster";
}

function getMonsterSourceLabel(monster: MonsterRecord) {
  const slugLabel = monster.document__slug.trim();
  const titleLabel = monster.document__title.trim();

  if (slugLabel && titleLabel) {
    return `${slugLabel} - ${titleLabel}`;
  }

  return slugLabel || titleLabel || "Monster entry";
}

function getExtraTypeOptions(values: string[]) {
  const reservedOptions = new Set([...baseMonsterTypeOptions, ...baseSpeciesTypeOptions]);

  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0 && !reservedOptions.has(value))
    )
  ).sort((left, right) => left.localeCompare(right));
}

function CompanionsSection({ character, className, onPersistCharacter }: CompanionsSectionProps) {
  const companions = character.companions ?? [];
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);

  useBodyScrollLock(isEditorOpen || selectedCompanionId !== null);

  useEffect(() => {
    if (!selectedCompanionId) {
      return;
    }

    if (!companions.some((companion) => companion.id === selectedCompanionId)) {
      setSelectedCompanionId(null);
    }
  }, [companions, selectedCompanionId]);

  const selectedCompanion = companions.find((companion) => companion.id === selectedCompanionId) ?? null;

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
              onClick={() => setIsEditorOpen(true)}
              aria-label="Edit companions"
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>
        </div>

        {companions.length > 0 ? (
          <div className={styles.companionGrid}>
            {companions.map((companion) => (
              <button
                key={companion.id}
                type="button"
                className={styles.companionCard}
                onClick={() => setSelectedCompanionId(companion.id)}
              >
                <div className={styles.cardBody}>
                  <h4 className={styles.cardTitle}>{companion.name}</h4>
                  <span className={styles.cardType}>{companion.type}</span>
                </div>
                <div className={styles.cardHeader}>
                  <span className={styles.cardSource}>{getInheritedEntryLabel(companion)}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className={shared.emptyText}>
            No companions added yet.
            {"\n"}
            Use Edit to add familiars, summons, or supporting NPCs.
          </p>
        )}
      </article>

      {isEditorOpen ? (
        <CompanionEditorModal
          companions={companions}
          onSaveCompanion={handleSaveCompanion}
          onRemoveCompanion={handleRemoveCompanion}
          onClose={() => setIsEditorOpen(false)}
        />
      ) : null}

      {selectedCompanion ? (
        <CompanionDrawer
          companion={selectedCompanion}
          onClose={() => setSelectedCompanionId(null)}
        />
      ) : null}
    </>
  );
}

type CompanionEditorModalProps = {
  companions: CharacterCompanion[];
  onSaveCompanion: (companion: CharacterCompanion) => void;
  onRemoveCompanion: (companionId: string) => void;
  onClose: () => void;
};

function CompanionEditorModal({
  companions,
  onSaveCompanion,
  onRemoveCompanion,
  onClose
}: CompanionEditorModalProps) {
  const titleId = useId();
  const [draft, setDraft] = useState<CompanionDraft>(createEmptyDraft);
  const [showValidation, setShowValidation] = useState(false);
  const [isMonsterBrowserOpen, setIsMonsterBrowserOpen] = useState(false);
  const [monsterQuery, setMonsterQuery] = useState("");
  const [monsterTypeFilter, setMonsterTypeFilter] = useState<string>("all");
  const [monsterSourceFilter, setMonsterSourceFilter] = useState<string>("all");
  const [monsterOrdering, setMonsterOrdering] = useState<MonsterOrdering>("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [previewMonster, setPreviewMonster] = useState<MonsterRecord | null>(null);
  const [previewStatus, setPreviewStatus] = useState<CodexStatus>("ready");
  const [pendingSelectSlug, setPendingSelectSlug] = useState<string | null>(null);
  const [monsterNotice, setMonsterNotice] = useState<string | null>(null);
  const [monsterCache, setMonsterCache] = useState<Record<string, MonsterRecord>>(() =>
    companions.reduce<Record<string, MonsterRecord>>((cache, companion) => {
      if (companion.inheritedCreatureEntry) {
        cache[companion.inheritedCreatureEntry.slug] = companion.inheritedCreatureEntry;
      }

      return cache;
    }, {})
  );

  const isEditingExisting = Boolean(draft.id && companions.some((companion) => companion.id === draft.id));
  const selectedMonsterSlug = draft.inheritedCreatureEntry?.slug ?? null;
  const extraTypeOptions = useMemo(
    () =>
      getExtraTypeOptions([
        draft.type,
        ...companions.map((companion) => companion.type),
        draft.inheritedCreatureEntry?.type ?? ""
      ]),
    [companions, draft.inheritedCreatureEntry?.type, draft.type]
  );
  const { payload, status } = useMonsterEntries({
    enabled: isMonsterBrowserOpen,
    page: currentPage,
    limit: MONSTERS_PER_PAGE,
    search: monsterQuery,
    type: monsterTypeFilter === "all" ? null : monsterTypeFilter,
    source: monsterSourceFilter === "all" ? null : monsterSourceFilter,
    ordering: monsterOrdering
  });
  const monsters = payload?.results ?? [];
  const totalPages = Math.max(1, Math.ceil((payload?.count ?? 0) / MONSTERS_PER_PAGE));

  useEffect(() => {
    setMonsterCache((currentCache) => {
      const nextCache = { ...currentCache };

      companions.forEach((companion) => {
        if (companion.inheritedCreatureEntry) {
          nextCache[companion.inheritedCreatureEntry.slug] = companion.inheritedCreatureEntry;
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

    async function loadPreviewMonster() {
      if (!previewSlug) {
        setPreviewMonster(null);
        setPreviewStatus("ready");
        return;
      }

      const cachedMonster = monsterCache[previewSlug];

      if (cachedMonster) {
        setPreviewMonster(cachedMonster);
        setPreviewStatus("ready");
        return;
      }

      setPreviewStatus("loading");

      try {
        const monster = await fetchMonsterBySlug(previewSlug);

        if (!active) {
          return;
        }

        setMonsterCache((currentCache) => ({
          ...currentCache,
          [monster.slug]: monster
        }));
        setPreviewMonster(monster);
        setPreviewStatus("ready");
      } catch {
        if (!active) {
          return;
        }

        setPreviewMonster(null);
        setPreviewStatus("error");
      }
    }

    void loadPreviewMonster();

    return () => {
      active = false;
    };
  }, [monsterCache, previewSlug]);

  function startNewDraft() {
    setDraft(createEmptyDraft());
    setShowValidation(false);
    setMonsterNotice(null);
  }

  function loadCompanionIntoDraft(companion: CharacterCompanion) {
    setDraft(createDraftFromCompanion(companion));
    setShowValidation(false);
    setMonsterNotice(null);
  }

  function handleDraftChange<Key extends keyof CompanionDraft>(key: Key, value: CompanionDraft[Key]) {
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
      const resolvedMonster =
        "document__slug" in monster ? monster : (monsterCache[slug] ?? (await fetchMonsterBySlug(slug)));

      setMonsterCache((currentCache) => ({
        ...currentCache,
        [resolvedMonster.slug]: resolvedMonster
      }));
      setDraft((currentDraft) => ({
        ...currentDraft,
        name: currentDraft.name.trim() ? currentDraft.name : resolvedMonster.name,
        type: resolvedMonster.type.trim() ? resolvedMonster.type : currentDraft.type,
        inheritedCreatureEntry: resolvedMonster
      }));
      setIsMonsterBrowserOpen(false);
      setPreviewSlug(null);
      setMonsterNotice(null);
    } catch {
      setMonsterNotice("The full monster entry could not be loaded.");
    } finally {
      setPendingSelectSlug(null);
    }
  }

  function handleClearMonsterSelection() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      inheritedCreatureEntry: null
    }));
    setMonsterNotice(null);
  }

  function handleSave() {
    const name = draft.name.trim();
    const type = draft.type.trim();

    setShowValidation(true);

    if (!name || !type) {
      return;
    }

    onSaveCompanion({
      id: draft.id ?? createCharacterCompanionId(),
      name,
      description: draft.description.trim(),
      type,
      ...(draft.inheritedCreatureEntry
        ? { inheritedCreatureEntry: draft.inheritedCreatureEntry }
        : {})
    });
    onClose();
  }

  function handleRemoveCompanion(companionId: string) {
    onRemoveCompanion(companionId);

    if (draft.id === companionId) {
      startNewDraft();
    }
  }

  return (
    <>
      <SheetModal titleId={titleId} onClose={onClose} panelClassName={styles.editorModal}>
        <div className={styles.editorHeader}>
          <h3 id={titleId} className={shared.title}>
            Manage companions
          </h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close companions editor"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.editorLayout}>
          <section className={styles.editorPanel}>
            <div className={styles.panelHeader}>
              <h4 className={styles.panelTitle}>Current roster</h4>
              <button type="button" className={styles.secondaryButton} onClick={startNewDraft}>
                <Plus size={16} />
                New
              </button>
            </div>

            {companions.length > 0 ? (
              <ul className={styles.savedCompanionList}>
                {companions.map((companion) => {
                  const isActive = draft.id === companion.id;

                  return (
                    <li key={companion.id} className={styles.savedCompanionItem}>
                      <button
                        type="button"
                        className={clsx(
                          styles.savedCompanionButton,
                          isActive && styles.savedCompanionButtonActive
                        )}
                        onClick={() => loadCompanionIntoDraft(companion)}
                      >
                        <span className={styles.savedCompanionType}>{companion.type}</span>
                        <strong>{companion.name}</strong>
                        <span className={styles.savedCompanionSummary}>
                          {getInheritedEntryLabel(companion)}
                        </span>
                      </button>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => handleRemoveCompanion(companion.id)}
                        aria-label={`Remove ${companion.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={shared.emptyText}>No companions saved yet.</p>
            )}
          </section>

          <section className={styles.editorPanel}>
            <div className={styles.panelHeader}>
              <h4 className={styles.panelTitle}>
                {isEditingExisting ? "Update companion" : "Create companion"}
              </h4>
            </div>

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
                    {baseMonsterTypeOptions.map((typeOption) => (
                      <option key={typeOption} value={typeOption}>
                        {typeOption}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Character Species">
                    {baseSpeciesTypeOptions.map((typeOption) => (
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

              <label className={shared.fieldWide}>
                <span className={shared.fieldLabel}>Custom Description</span>
                <TextAreaInput
                  value={draft.description}
                  onChange={(event) => handleDraftChange("description", event.target.value)}
                  rows={5}
                  placeholder="Notes about personality, tactics, relationship, or appearance."
                />
              </label>
            </div>

            <div className={styles.monsterSection}>
              <div className={styles.panelHeader}>
                <h4 className={styles.panelTitle}>Use Monster Template</h4>
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
                    <h5 className={styles.selectedMonsterTitle}>{draft.inheritedCreatureEntry.name}</h5>
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
                <p className={shared.emptyText}>No monster template selected.</p>
              )}

              {monsterNotice ? <p className={styles.notice}>{monsterNotice}</p> : null}
            </div>

            <div className={shared.formActions}>
              <button type="button" className={shared.saveButton} onClick={handleSave}>
                {isEditingExisting ? "Save Changes" : "Add Companion"}
              </button>
              <button type="button" className={shared.cancelButton} onClick={onClose}>
                Cancel
              </button>
            </div>
          </section>
        </div>
      </SheetModal>

      {isMonsterBrowserOpen ? (
        <MonsterBrowserModal
          monsters={monsters}
          totalEntries={payload?.count ?? 0}
          status={status}
          currentPage={currentPage}
          totalPages={totalPages}
          query={monsterQuery}
          selectedMonsterSlug={selectedMonsterSlug}
          monsterTypeFilter={monsterTypeFilter}
          monsterSourceFilter={monsterSourceFilter}
          ordering={monsterOrdering}
          pendingSelectSlug={pendingSelectSlug}
          onClose={() => setIsMonsterBrowserOpen(false)}
          onQueryChange={setMonsterQuery}
          onMonsterTypeFilterChange={setMonsterTypeFilter}
          onMonsterSourceFilterChange={setMonsterSourceFilter}
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
          badgeLabel="Monster Preview"
          backdropClassName={styles.previewBackdrop}
          drawerClassName={styles.previewDrawer}
          footer={
            previewStatus === "ready" && previewMonster ? (
              <button
                type="button"
                className={shared.saveButton}
                onClick={() => void handleSelectMonster(previewMonster)}
              >
                Use Monster
              </button>
            ) : null
          }
        />
      ) : null}
    </>
  );
}

type MonsterBrowserModalProps = {
  monsters: MonsterListItem[];
  totalEntries: number;
  status: CodexStatus;
  currentPage: number;
  totalPages: number;
  query: string;
  selectedMonsterSlug: string | null;
  monsterTypeFilter: string;
  monsterSourceFilter: string;
  ordering: MonsterOrdering;
  pendingSelectSlug: string | null;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onMonsterTypeFilterChange: (value: string) => void;
  onMonsterSourceFilterChange: (value: string) => void;
  onOrderingChange: (value: MonsterOrdering) => void;
  onPageChange: (page: number) => void;
  onOpenMonsterPreview: (monster: MonsterListItem) => void;
  onSelectMonster: (monster: MonsterListItem) => Promise<void>;
};

function MonsterBrowserModal({
  monsters,
  totalEntries,
  status,
  currentPage,
  totalPages,
  query,
  selectedMonsterSlug,
  monsterTypeFilter,
  monsterSourceFilter,
  ordering,
  pendingSelectSlug,
  onClose,
  onQueryChange,
  onMonsterTypeFilterChange,
  onMonsterSourceFilterChange,
  onOrderingChange,
  onPageChange,
  onOpenMonsterPreview,
  onSelectMonster
}: MonsterBrowserModalProps) {
  const titleId = useId();

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      panelClassName={styles.browserModal}
      backdropClassName={styles.browserBackdrop}
    >
      <div className={styles.editorHeader}>
        <h3 id={titleId} className={shared.title}>
          Browse monsters
        </h3>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close monster browser"
        >
          <X size={18} />
        </button>
      </div>

      <div className={styles.browserPanel}>
        <div className={styles.browserControls}>
          <label className={shared.fieldWide}>
            <span className={shared.fieldLabel}>Search Monsters</span>
            <TextInput
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by monster name"
            />
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Filter Type</span>
            <SelectInput
              value={monsterTypeFilter}
              onChange={(event) => onMonsterTypeFilterChange(event.target.value)}
            >
              <option value="all">All monster types</option>
              {baseMonsterTypeOptions.map((typeOption) => (
                <option key={typeOption} value={typeOption}>
                  {typeOption}
                </option>
              ))}
            </SelectInput>
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Filter Source</span>
            <SelectInput
              value={monsterSourceFilter}
              onChange={(event) => onMonsterSourceFilterChange(event.target.value)}
            >
              <option value="all">All sources</option>
              {MONSTER_SOURCE_OPTIONS.map((sourceOption) => (
                <option key={sourceOption} value={sourceOption}>
                  {sourceOption}
                </option>
              ))}
            </SelectInput>
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Order</span>
            <SelectInput
              value={ordering}
              onChange={(event) => onOrderingChange(event.target.value as MonsterOrdering)}
            >
              {orderingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </label>
        </div>

        <MonsterCodexTable
          monsters={monsters}
          totalEntries={totalEntries}
          status={status}
          currentPage={currentPage}
          totalPages={totalPages}
          ordering={ordering}
          onPageChange={onPageChange}
          onOrderingChange={onOrderingChange}
          onMonsterClick={onOpenMonsterPreview}
          getRowTone={(monster) =>
            selectedMonsterSlug && monster.slug === selectedMonsterSlug ? "valid" : null
          }
          renderNamePrefix={(monster) => {
            const isSelected = monster.slug === selectedMonsterSlug;
            const isPending = pendingSelectSlug === monster.slug;

            return (
              <button
                type="button"
                className={clsx(
                  styles.selectMonsterButton,
                  isSelected && styles.selectMonsterButtonSelected
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  void onSelectMonster(monster);
                }}
                disabled={isPending}
                aria-label={
                  isSelected
                    ? `${monster.name} already selected`
                    : `Use ${monster.name} as monster template`
                }
                title={isSelected ? "Selected monster" : "Use this monster"}
              >
                {isSelected ? <Check size={14} /> : <Plus size={14} />}
              </button>
            );
          }}
          className={styles.monsterTable}
        />
      </div>
    </SheetModal>
  );
}

type CompanionDrawerProps = {
  companion: CharacterCompanion;
  onClose: () => void;
};

function CompanionDrawer({ companion, onClose }: CompanionDrawerProps) {
  const titleId = useId();

  return (
    <SheetDrawer titleId={titleId} onClose={onClose} drawerClassName={styles.drawerPanel}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayBadge>Companion</OverlayBadge>
          <OverlayTitle id={titleId}>{companion.name}</OverlayTitle>
          <OverlaySummary>{companion.type}</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton onClick={onClose} label="Close companion details" />
      </OverlayHeader>

      <OverlayBody className={styles.drawerBody}>
        <OverlayDetailsGrid>
          <CellContainer label="Type" content={companion.type} />
          <CellContainer
            label="Inherited Entry"
            content={
              companion.inheritedCreatureEntry ? companion.inheritedCreatureEntry.name : "None"
            }
            breakdown={
              companion.inheritedCreatureEntry
                ? getMonsterSourceLabel(companion.inheritedCreatureEntry)
                : "Fully custom companion"
            }
          />
        </OverlayDetailsGrid>

        <section className={styles.drawerSection}>
          <h4 className={styles.drawerSectionTitle}>Custom Description</h4>
          <p className={styles.drawerDescription}>
            {companion.description.trim() || "No custom description added for this companion."}
          </p>
        </section>

        {companion.inheritedCreatureEntry ? (
          <section className={styles.drawerSection}>
            <div className={styles.drawerSectionHeader}>
              <div>
                <p className={styles.panelEyebrow}>Inherited creature entry</p>
                <h4 className={styles.drawerSectionTitle}>Monster reference</h4>
              </div>
            </div>
            <MonsterEntryRenderer
              monster={companion.inheritedCreatureEntry}
              className={styles.inheritedMonsterEntry}
            />
          </section>
        ) : null}
      </OverlayBody>
    </SheetDrawer>
  );
}

export default CompanionsSection;
