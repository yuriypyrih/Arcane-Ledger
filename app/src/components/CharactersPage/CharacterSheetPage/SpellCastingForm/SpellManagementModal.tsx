import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  SheetModal,
  deferModalCommit
} from "../../../Overlay";
import SpellListRow from "../../../SpellListRow";
import type { SpellEntry } from "../../../../codex/entries";
import {
  getSpellLevel,
  normalizePreparedSpellIds
} from "../../../../pages/CharactersPage/spellcasting";
import type {
  PersistCharacterUpdater,
  SpellManagementMode
} from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  formatSpellGroupTitle,
  spellSlotLevels
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import RadioContainerOption from "../RadioContainerOption";
import styles from "./SpellCastingForm.module.css";
import { applySpellManagementDraftToCharacter } from "./spellManagementDrafts";
import SpellManagementFilterControls from "./SpellManagementFilterControls";
import {
  emptySpellManagementFilters,
  filterSpellManagementSpells,
  getSpellManagementFilterOptions,
  hasActiveSpellManagementFilters,
  type SpellManagementFilters
} from "./spellManagementFilters";

type SpellListRowActionShapes = ComponentProps<typeof SpellListRow>["actionShapes"];

type SpellGroup = {
  level: number;
  spells: SpellEntry[];
};

type SpellPreparationLevelGroup = Record<number, SpellEntry[]>;
type SpellSelectionPredicate = (spell: SpellEntry) => boolean;
type PreparedSpellTab = number | "all";
type PreparedSpellOrderingSnapshot = {
  preparedSpellIds: string[];
  spellbookSpellIds: string[];
};

const allPreparedSpellTab = "all";
const allPreparedSpellDisplayLimit = 50;

function ignoreModalEscapeClose() {
  return undefined;
}

type SpellManagementModalProps = {
  allowAllSpellLevels?: boolean;
  alwaysPreparedSpellIds: string[];
  alwaysSpellbookSpellIds: string[];
  cantripLimit: number | null;
  cantripOptions: SpellEntry[];
  highestSpellSlotLevel: number;
  knownSpellEntriesById: Map<string, SpellEntry>;
  getSpellActionShapes: (spell: SpellEntry) => SpellListRowActionShapes;
  getSpellOutcomeSummary: (spell: SpellEntry) => string;
  onClose: () => void;
  onOpenSpellDetails: (spell: SpellEntry, viewMode: "prepare-preview") => void;
  onPersistCharacter: PersistCharacterUpdater;
  onSpellcastingRulesEnforcementChange: (enabled: boolean) => void;
  preparedSpellLimit: number | null;
  selectedCantripIds: string[];
  selectedManualSpellbookSpellIds: string[];
  selectedPreparedSpellIds: string[];
  spellbookSpellEntriesById: Map<string, SpellEntry>;
  spellcastingRulesEnforced: boolean;
  spellcastingRulesEnforcementDisabled: boolean;
  spellPreparationOptions: SpellEntry[];
  suspendEscapeClose: boolean;
  usesPreparedSpells: boolean;
  usesSpellbook: boolean;
};

function SelectionCounter({ current, total }: { current: number; total: number | null }) {
  return (
    <span
      className={clsx(total !== null && current < total && styles.selectionCounterIncomplete)}
    >{`${current}/${total === null ? "Unlimited" : total}`}</span>
  );
}

function compareSpellsByName(left: SpellEntry, right: SpellEntry): number {
  return left.name.localeCompare(right.name);
}

function splitSpellsBySelection(spells: SpellEntry[], isSelected: SpellSelectionPredicate) {
  const selectedSpells: SpellEntry[] = [];
  const unselectedSpells: SpellEntry[] = [];

  spells.forEach((spell) => {
    if (isSelected(spell)) {
      selectedSpells.push(spell);
      return;
    }

    unselectedSpells.push(spell);
  });

  return {
    selectedSpells: selectedSpells.sort(compareSpellsByName),
    unselectedSpells: unselectedSpells.sort(compareSpellsByName)
  };
}

function orderSpellsBySelection(spells: SpellEntry[], isSelected: SpellSelectionPredicate) {
  const { selectedSpells, unselectedSpells } = splitSpellsBySelection(spells, isSelected);

  return [...selectedSpells, ...unselectedSpells];
}

function groupSpellsByLevel(
  spells: SpellEntry[],
  options: { preserveSpellOrder?: boolean } = {}
): SpellGroup[] {
  const spellsByLevel = spells.reduce((groups, spell) => {
    const spellLevel = getSpellLevel(spell);
    const currentGroup = groups.get(spellLevel) ?? [];

    groups.set(spellLevel, [...currentGroup, spell]);
    return groups;
  }, new Map<number, SpellEntry[]>());

  return [...spellsByLevel.entries()]
    .sort(([leftLevel], [rightLevel]) => leftLevel - rightLevel)
    .map(([level, levelSpells]) => ({
      level,
      spells: options.preserveSpellOrder ? levelSpells : [...levelSpells].sort(compareSpellsByName)
    }));
}

function createSpellPreparationLevelGroups(spells: SpellEntry[]): SpellPreparationLevelGroup {
  return spellSlotLevels.reduce<SpellPreparationLevelGroup>((groups, level) => {
    groups[level] = spells
      .filter((spell) => getSpellLevel(spell) === level)
      .sort(compareSpellsByName);

    return groups;
  }, {} as SpellPreparationLevelGroup);
}

function countTrackedSpellsByLevel(
  spellIds: string[],
  spellsById: Map<string, SpellEntry>
): Record<number, number> {
  return spellIds.reduce<Record<number, number>>((counts, spellId) => {
    const spell = spellsById.get(spellId);

    if (!spell) {
      return counts;
    }

    const spellLevel = getSpellLevel(spell);

    counts[spellLevel] = (counts[spellLevel] ?? 0) + 1;
    return counts;
  }, {});
}

function isPreparedSpellLevelAvailable(
  spell: SpellEntry,
  options: { allowAllSpellLevels: boolean; highestSpellSlotLevel: number }
): boolean {
  const spellLevel = getSpellLevel(spell);

  return (
    spellLevel > 0 &&
    (options.allowAllSpellLevels || spellLevel <= options.highestSpellSlotLevel)
  );
}

function getPreparedSpellTabLabel(tab: PreparedSpellTab): string {
  return tab === allPreparedSpellTab ? "spells" : formatSpellGroupTitle(tab).toLowerCase();
}

function SpellManagementModal({
  allowAllSpellLevels = false,
  alwaysPreparedSpellIds,
  alwaysSpellbookSpellIds,
  cantripLimit,
  cantripOptions,
  highestSpellSlotLevel,
  knownSpellEntriesById,
  getSpellActionShapes,
  getSpellOutcomeSummary,
  onClose,
  onOpenSpellDetails,
  onPersistCharacter,
  onSpellcastingRulesEnforcementChange,
  preparedSpellLimit,
  selectedCantripIds,
  selectedManualSpellbookSpellIds,
  selectedPreparedSpellIds,
  spellbookSpellEntriesById,
  spellcastingRulesEnforced,
  spellcastingRulesEnforcementDisabled,
  spellPreparationOptions,
  suspendEscapeClose,
  usesPreparedSpells,
  usesSpellbook
}: SpellManagementModalProps) {
  const isCommittingRef = useRef(false);
  const spellPreparationLevelGroups = useMemo(
    () => createSpellPreparationLevelGroups(spellPreparationOptions),
    [spellPreparationOptions]
  );
  const firstAvailablePreparedSpellLevel = useMemo(
    () =>
      spellSlotLevels.find((level) => (spellPreparationLevelGroups[level]?.length ?? 0) > 0) ?? 1,
    [spellPreparationLevelGroups]
  );
  const [mode, setMode] = useState<SpellManagementMode>("menu");
  const [isCommitting, setIsCommitting] = useState(false);
  const [cantripDraftIds, setCantripDraftIds] = useState<string[]>(() => selectedCantripIds);
  const [spellbookDraftIds, setSpellbookDraftIds] = useState<string[]>(
    () => selectedManualSpellbookSpellIds
  );
  const [preparedSpellDraftIds, setPreparedSpellDraftIds] = useState<string[]>(
    () => selectedPreparedSpellIds
  );
  const [cantripOrderingDraftIds, setCantripOrderingDraftIds] = useState<string[]>(
    () => selectedCantripIds
  );
  const [preparedSpellOrderingSnapshot, setPreparedSpellOrderingSnapshot] =
    useState<PreparedSpellOrderingSnapshot>(() => ({
      preparedSpellIds: selectedPreparedSpellIds,
      spellbookSpellIds: selectedManualSpellbookSpellIds
    }));
  const [activePreparedSpellLevel, setActivePreparedSpellLevel] = useState<PreparedSpellTab>(
    allPreparedSpellTab
  );
  const [cantripFilters, setCantripFilters] = useState<SpellManagementFilters>(() => ({
    ...emptySpellManagementFilters
  }));
  const [preparedSpellFilters, setPreparedSpellFilters] = useState<SpellManagementFilters>(() => ({
    ...emptySpellManagementFilters
  }));
  const alwaysPreparedSpellIdSet = useMemo(
    () => new Set(alwaysPreparedSpellIds),
    [alwaysPreparedSpellIds]
  );
  const alwaysSpellbookSpellIdSet = useMemo(
    () => new Set(alwaysSpellbookSpellIds),
    [alwaysSpellbookSpellIds]
  );
  const spellPreparationOptionsById = useMemo(
    () => new Map(spellPreparationOptions.map((spell) => [spell.id, spell] as const)),
    [spellPreparationOptions]
  );
  const cantripDraftSet = useMemo(() => new Set(cantripDraftIds), [cantripDraftIds]);
  const cantripOrderingDraftSet = useMemo(
    () => new Set(cantripOrderingDraftIds),
    [cantripOrderingDraftIds]
  );
  const spellbookDraftSet = useMemo(() => new Set(spellbookDraftIds), [spellbookDraftIds]);
  const spellbookAccessibleDraftSet = useMemo(
    () => new Set([...spellbookDraftIds, ...alwaysSpellbookSpellIds]),
    [alwaysSpellbookSpellIds, spellbookDraftIds]
  );
  const preparedSpellDraftSet = useMemo(
    () => new Set(preparedSpellDraftIds),
    [preparedSpellDraftIds]
  );
  const preparedSpellOrderingDraftSet = useMemo(
    () => new Set(preparedSpellOrderingSnapshot.preparedSpellIds),
    [preparedSpellOrderingSnapshot.preparedSpellIds]
  );
  const spellbookOrderingAccessibleDraftSet = useMemo(
    () => new Set([...preparedSpellOrderingSnapshot.spellbookSpellIds, ...alwaysSpellbookSpellIds]),
    [alwaysSpellbookSpellIds, preparedSpellOrderingSnapshot.spellbookSpellIds]
  );
  const isCantripSelected = useCallback(
    (spell: SpellEntry) => cantripDraftSet.has(spell.id),
    [cantripDraftSet]
  );
  const isCantripSelectedForOrdering = useCallback(
    (spell: SpellEntry) => cantripOrderingDraftSet.has(spell.id),
    [cantripOrderingDraftSet]
  );
  const isPreparedSpellSelected = useCallback(
    (spell: SpellEntry) => {
      const isAlwaysPrepared = alwaysPreparedSpellIdSet.has(spell.id);

      return usesSpellbook
        ? spellbookAccessibleDraftSet.has(spell.id) || isAlwaysPrepared
        : preparedSpellDraftSet.has(spell.id) || isAlwaysPrepared;
    },
    [alwaysPreparedSpellIdSet, preparedSpellDraftSet, spellbookAccessibleDraftSet, usesSpellbook]
  );
  const isPreparedSpellSelectedForOrdering = useCallback(
    (spell: SpellEntry) => {
      const isAlwaysPrepared = alwaysPreparedSpellIdSet.has(spell.id);

      return usesSpellbook
        ? spellbookOrderingAccessibleDraftSet.has(spell.id) || isAlwaysPrepared
        : preparedSpellOrderingDraftSet.has(spell.id) || isAlwaysPrepared;
    },
    [
      alwaysPreparedSpellIdSet,
      preparedSpellOrderingDraftSet,
      spellbookOrderingAccessibleDraftSet,
      usesSpellbook
    ]
  );
  const allPreparedSpellOptions = useMemo(
    () =>
      spellPreparationOptions
        .filter((spell) =>
          isPreparedSpellLevelAvailable(spell, { allowAllSpellLevels, highestSpellSlotLevel })
        )
        .sort(compareSpellsByName),
    [allowAllSpellLevels, highestSpellSlotLevel, spellPreparationOptions]
  );
  const activePreparedSpellOptions = useMemo(
    () =>
      activePreparedSpellLevel === allPreparedSpellTab
        ? allPreparedSpellOptions
        : (spellPreparationLevelGroups[activePreparedSpellLevel] ?? []),
    [activePreparedSpellLevel, allPreparedSpellOptions, spellPreparationLevelGroups]
  );
  const activePreparedSpellDisplayOptions = useMemo(
    () =>
      activePreparedSpellOptions.map((spell) => spellbookSpellEntriesById.get(spell.id) ?? spell),
    [activePreparedSpellOptions, spellbookSpellEntriesById]
  );
  const cantripFilterOptions = useMemo(
    () => getSpellManagementFilterOptions(cantripOptions),
    [cantripOptions]
  );
  const preparedSpellFilterOptions = useMemo(
    () => getSpellManagementFilterOptions(spellPreparationOptions),
    [spellPreparationOptions]
  );
  const filteredCantripOptions = useMemo(
    () => filterSpellManagementSpells(cantripOptions, cantripFilters),
    [cantripFilters, cantripOptions]
  );
  const orderedFilteredCantripOptions = useMemo(
    () => orderSpellsBySelection(filteredCantripOptions, isCantripSelectedForOrdering),
    [filteredCantripOptions, isCantripSelectedForOrdering]
  );
  const cantripGroups = useMemo(
    () => groupSpellsByLevel(orderedFilteredCantripOptions, { preserveSpellOrder: true }),
    [orderedFilteredCantripOptions]
  );
  const filteredCantripRowDetailsById = useMemo(
    () =>
      new Map(
        filteredCantripOptions.map((spell) => [
          spell.id,
          {
            actionShapes: getSpellActionShapes(spell),
            valueSummary: getSpellOutcomeSummary(spell)
          }
        ])
      ),
    [filteredCantripOptions, getSpellActionShapes, getSpellOutcomeSummary]
  );
  const filteredActivePreparedSpellDisplayOptions = useMemo(() => {
    const filteredSpells = filterSpellManagementSpells(
      activePreparedSpellDisplayOptions,
      preparedSpellFilters
    );
    const { selectedSpells, unselectedSpells } = splitSpellsBySelection(
      filteredSpells,
      isPreparedSpellSelectedForOrdering
    );

    if (activePreparedSpellLevel !== allPreparedSpellTab) {
      return [...selectedSpells, ...unselectedSpells];
    }

    const unselectedDisplayLimit = Math.max(
      0,
      allPreparedSpellDisplayLimit - selectedSpells.length
    );

    return [...selectedSpells, ...unselectedSpells.slice(0, unselectedDisplayLimit)];
  }, [
    activePreparedSpellDisplayOptions,
    activePreparedSpellLevel,
    isPreparedSpellSelectedForOrdering,
    preparedSpellFilters
  ]);
  const filteredActivePreparedSpellRowDetailsById = useMemo(
    () =>
      new Map(
        filteredActivePreparedSpellDisplayOptions.map((spell) => [
          spell.id,
          {
            actionShapes: getSpellActionShapes(spell),
            valueSummary: getSpellOutcomeSummary(spell)
          }
        ])
      ),
    [filteredActivePreparedSpellDisplayOptions, getSpellActionShapes, getSpellOutcomeSummary]
  );
  const preparedSpellDraftCountsByLevel = useMemo(
    () =>
      countTrackedSpellsByLevel(
        [...alwaysPreparedSpellIds, ...preparedSpellDraftIds],
        knownSpellEntriesById
      ),
    [alwaysPreparedSpellIds, knownSpellEntriesById, preparedSpellDraftIds]
  );
  const allPreparedSpellSelectedCount = useMemo(
    () =>
      allPreparedSpellOptions.reduce(
        (count, spell) => count + (isPreparedSpellSelected(spell) ? 1 : 0),
        0
      ),
    [allPreparedSpellOptions, isPreparedSpellSelected]
  );
  const hasCantripManagement =
    cantripOptions.length > 0 && (cantripLimit === null || cantripLimit > 0);
  const cantripCount = cantripDraftIds.length;
  const spellbookSpellCount = spellbookDraftIds.length;
  const alwaysSpellbookCount = alwaysSpellbookSpellIds.length;
  const preparedSpellCount = preparedSpellDraftIds.length;
  const hasActiveCantripFilters = hasActiveSpellManagementFilters(cantripFilters);
  const hasActivePreparedSpellFilters = hasActiveSpellManagementFilters(preparedSpellFilters);
  const isCantripLimitReached = cantripLimit !== null && cantripCount >= cantripLimit;
  const isPreparedSpellLimitReached =
    preparedSpellLimit !== null && preparedSpellCount >= preparedSpellLimit;
  const modalTitle =
    mode === "menu" ? "Spell options" : mode === "cantrips" ? "Manage cantrips" : "Prepare spells";
  const refreshCantripOrderingSnapshot = useCallback(() => {
    setCantripOrderingDraftIds(cantripDraftIds);
  }, [cantripDraftIds]);
  const refreshPreparedSpellOrderingSnapshot = useCallback(() => {
    setPreparedSpellOrderingSnapshot({
      preparedSpellIds: preparedSpellDraftIds,
      spellbookSpellIds: spellbookDraftIds
    });
  }, [preparedSpellDraftIds, spellbookDraftIds]);
  const handleCantripFiltersChange = useCallback(
    (filters: SpellManagementFilters) => {
      refreshCantripOrderingSnapshot();
      setCantripFilters(filters);
    },
    [refreshCantripOrderingSnapshot]
  );
  const handlePreparedSpellFiltersChange = useCallback(
    (filters: SpellManagementFilters) => {
      refreshPreparedSpellOrderingSnapshot();
      setPreparedSpellFilters(filters);
    },
    [refreshPreparedSpellOrderingSnapshot]
  );
  const selectPreparedSpellLevel = useCallback(
    (level: PreparedSpellTab) => {
      if (level === activePreparedSpellLevel) {
        return;
      }

      refreshPreparedSpellOrderingSnapshot();
      setActivePreparedSpellLevel(level);
    },
    [activePreparedSpellLevel, refreshPreparedSpellOrderingSnapshot]
  );

  const commitAndClose = useCallback(() => {
    if (isCommittingRef.current) {
      return;
    }

    isCommittingRef.current = true;
    setIsCommitting(true);

    deferModalCommit(() => {
      try {
        onPersistCharacter((currentCharacter) =>
          applySpellManagementDraftToCharacter(currentCharacter, {
            alwaysPreparedSpellIds,
            alwaysSpellbookSpellIds,
            cantripDraftIds,
            cantripLimit,
            cantripOptions,
            preparedSpellDraftIds,
            preparedSpellLimit,
            spellPreparationOptions,
            spellbookDraftIds,
            usesSpellbook
          })
        );
        onClose();
      } catch (error) {
        isCommittingRef.current = false;
        setIsCommitting(false);
        throw error;
      }
    });
  }, [
    alwaysPreparedSpellIds,
    alwaysSpellbookSpellIds,
    cantripDraftIds,
    cantripLimit,
    cantripOptions,
    onClose,
    onPersistCharacter,
    preparedSpellDraftIds,
    preparedSpellLimit,
    spellPreparationOptions,
    spellbookDraftIds,
    usesSpellbook
  ]);

  useEffect(() => {
    if (allowAllSpellLevels) {
      return;
    }

    if (activePreparedSpellLevel === allPreparedSpellTab) {
      return;
    }

    if (activePreparedSpellLevel <= highestSpellSlotLevel) {
      return;
    }

    refreshPreparedSpellOrderingSnapshot();
    setActivePreparedSpellLevel(firstAvailablePreparedSpellLevel);
  }, [
    activePreparedSpellLevel,
    allowAllSpellLevels,
    firstAvailablePreparedSpellLevel,
    highestSpellSlotLevel,
    refreshPreparedSpellOrderingSnapshot
  ]);

  const beginCantripManagement = useCallback(() => {
    refreshCantripOrderingSnapshot();
    setMode("cantrips");
  }, [refreshCantripOrderingSnapshot]);

  const beginPreparedSpellManagement = useCallback(() => {
    refreshPreparedSpellOrderingSnapshot();
    setActivePreparedSpellLevel(allPreparedSpellTab);
    setMode("prepared-spells");
  }, [refreshPreparedSpellOrderingSnapshot]);

  const toggleCantripDraft = useCallback(
    (spellId: string) => {
      setCantripDraftIds((current) =>
        current.includes(spellId)
          ? current.filter((currentSpellId) => currentSpellId !== spellId)
          : cantripLimit !== null && current.length >= cantripLimit
            ? current
            : [...current, spellId]
      );
    },
    [cantripLimit]
  );

  const togglePreparedSpellDraft = useCallback(
    (spellId: string) => {
      setPreparedSpellDraftIds((current) => {
        const normalizedCurrent = normalizePreparedSpellIds(
          usesSpellbook
            ? current.filter((currentSpellId) => spellbookAccessibleDraftSet.has(currentSpellId))
            : current,
          spellPreparationOptions,
          preparedSpellLimit,
          alwaysPreparedSpellIds
        );

        if (normalizedCurrent.includes(spellId)) {
          return normalizedCurrent.filter((currentSpellId) => currentSpellId !== spellId);
        }

        const spell = spellPreparationOptionsById.get(spellId);

        if (!spell) {
          return normalizedCurrent;
        }

        if (preparedSpellLimit !== null && normalizedCurrent.length >= preparedSpellLimit) {
          return normalizedCurrent;
        }

        return [...normalizedCurrent, spellId];
      });
    },
    [
      alwaysPreparedSpellIds,
      preparedSpellLimit,
      spellPreparationOptions,
      spellPreparationOptionsById,
      spellbookAccessibleDraftSet,
      usesSpellbook
    ]
  );

  const toggleSpellbookDraft = useCallback((spellId: string) => {
    setSpellbookDraftIds((current) => {
      if (current.includes(spellId)) {
        setPreparedSpellDraftIds((preparedCurrent) =>
          preparedCurrent.filter((currentSpellId) => currentSpellId !== spellId)
        );

        return current.filter((currentSpellId) => currentSpellId !== spellId);
      }

      return [...current, spellId];
    });
  }, []);

  function renderWizardSpellManagementControls(spell: SpellEntry) {
    const isAlwaysPrepared = alwaysPreparedSpellIdSet.has(spell.id);
    const isAlwaysSpellbook = alwaysSpellbookSpellIdSet.has(spell.id);
    const isInSpellbook = isAlwaysSpellbook || spellbookDraftSet.has(spell.id);
    const isPrepared = isAlwaysPrepared || preparedSpellDraftSet.has(spell.id);
    const canPrepare = isAlwaysPrepared || isInSpellbook;
    const isSpellbookToggleDisabled = isAlwaysSpellbook;
    const isPrepareDisabled =
      isAlwaysPrepared || !canPrepare || (!isPrepared && isPreparedSpellLimitReached);

    return (
      <div className={styles.wizardSelectionControls}>
        <button
          type="button"
          className={clsx(
            styles.wizardSelectionToggle,
            isSpellbookToggleDisabled && styles.wizardSelectionToggleDisabled
          )}
          role="checkbox"
          aria-checked={isInSpellbook}
          aria-label={
            isAlwaysSpellbook
              ? `${spell.name} is always in your spellbook`
              : `${isInSpellbook ? "Remove" : "Add"} ${spell.name} from spellbook`
          }
          onClick={() => toggleSpellbookDraft(spell.id)}
          disabled={isSpellbookToggleDisabled}
        >
          <span className={styles.wizardSelectionLabel}>Spellbook</span>
          <input
            type="checkbox"
            checked={isInSpellbook}
            readOnly
            tabIndex={-1}
            className={styles.selectableCheckbox}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          className={clsx(
            styles.wizardSelectionToggle,
            isPrepareDisabled && styles.wizardSelectionToggleDisabled
          )}
          role="checkbox"
          aria-checked={isPrepared}
          aria-label={`${isPrepared ? "Unprepare" : "Prepare"} ${spell.name}`}
          onClick={() => togglePreparedSpellDraft(spell.id)}
          disabled={isPrepareDisabled}
        >
          <span className={styles.wizardSelectionLabel}>Prepared</span>
          <input
            type="checkbox"
            checked={isPrepared}
            readOnly
            tabIndex={-1}
            className={styles.selectableCheckbox}
            aria-hidden="true"
          />
        </button>
      </div>
    );
  }

  const isSpellSelectionMode = mode !== "menu";

  return (
    <SheetModal
      titleId="spell-management-title"
      onClose={commitAndClose}
      onEscape={suspendEscapeClose ? ignoreModalEscapeClose : commitAndClose}
      isBusy={isCommitting}
      busyLabel="Saving spell choices"
      panelClassName={isSpellSelectionMode ? styles.spellManagementModalPanelFullHeight : undefined}
      size="small"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <p className={sheetStyles.eyebrow}>Spellcasting</p>
          <OverlayTitle id="spell-management-title">{modalTitle}</OverlayTitle>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close spell options"
          onClick={commitAndClose}
          disabled={isCommitting}
        />
      </OverlayHeader>

      <OverlayBody
        className={clsx(
          styles.spellManagementModalBody,
          isSpellSelectionMode && styles.spellManagementModalBodyFullHeight
        )}
      >
        {mode === "menu" ? (
          <>
            <div className={sheetStyles.spellManagementOptionGrid}>
              {hasCantripManagement ? (
                <button
                  type="button"
                  className={sheetStyles.spellManagementOptionButton}
                  onClick={beginCantripManagement}
                >
                  <strong>
                    Manage cantrips{" "}
                    <SelectionCounter current={selectedCantripIds.length} total={cantripLimit} />
                  </strong>
                  <small>Choose from the list of cantrips for your class.</small>
                </button>
              ) : null}
              {usesPreparedSpells ? (
                <button
                  type="button"
                  className={sheetStyles.spellManagementOptionButton}
                  onClick={beginPreparedSpellManagement}
                >
                  <strong>
                    {usesSpellbook ? (
                      <>
                        Manage spellbook &amp; prepare spells{" "}
                        <SelectionCounter
                          current={selectedPreparedSpellIds.length}
                          total={preparedSpellLimit}
                        />
                      </>
                    ) : (
                      <>
                        Prepare spells{" "}
                        <SelectionCounter
                          current={selectedPreparedSpellIds.length}
                          total={preparedSpellLimit}
                        />
                      </>
                    )}
                  </strong>
                  <small>
                    {usesSpellbook
                      ? "Add spells to your spellbook, then choose which of them are prepared."
                      : "Choose from the list of spells for your class based on your current level."}
                  </small>
                </button>
              ) : null}
            </div>
            <div className={styles.rulesEnforcementDivider} aria-hidden="true" />
            <RadioContainerOption
              header="Spellcasting rules enforcement"
              subheader="Your class will enforce their spellcasting rules"
              selected={spellcastingRulesEnforced}
              onSelect={() =>
                onSpellcastingRulesEnforcementChange(!spellcastingRulesEnforced)
              }
              disabled={spellcastingRulesEnforcementDisabled || isCommitting}
              indicatorType="checkbox"
            />
          </>
        ) : mode === "cantrips" ? (
          <>
            <div className={styles.preparedSpellStatusRow}>
              <div>
                <p className={styles.preparedSpellStatusLabel}>
                  <span>Cantrips</span>
                  <SelectionCounter current={cantripCount} total={cantripLimit} />
                </p>
              </div>
            </div>

            {cantripOptions.length > 0 ? (
              <SpellManagementFilterControls
                filters={cantripFilters}
                options={cantripFilterOptions}
                onFiltersChange={handleCantripFiltersChange}
              />
            ) : null}

            <div className={clsx(sheetStyles.spellManagementList, styles.preparedSpellList)}>
              {cantripOptions.length === 0 ? (
                <p className={shared.emptyText}>
                  No cantrips are available for this class right now.
                </p>
              ) : cantripGroups.length === 0 ? (
                <p className={shared.emptyText}>
                  {hasActiveCantripFilters
                    ? "No cantrips match these filters."
                    : "No cantrips are available for this class right now."}
                </p>
              ) : (
                cantripGroups.map((group) => (
                  <div key={group.level} className={sheetStyles.spellManagementGroup}>
                    <p className={sheetStyles.spellGroupTitle}>
                      {formatSpellGroupTitle(group.level)}
                    </p>
                    <ul className={styles.preparedSpellSelectionList}>
                      {group.spells.map((spell) => {
                        const isChecked = isCantripSelected(spell);
                        const isDisabled = !isChecked && isCantripLimitReached;
                        const rowDetails = filteredCantripRowDetailsById.get(spell.id);

                        return (
                          <li key={spell.id}>
                            <SpellListRow
                              spell={spell}
                              onClick={() => onOpenSpellDetails(spell, "prepare-preview")}
                              valueSummary={rowDetails?.valueSummary ?? ""}
                              alwaysPrepared={alwaysPreparedSpellIdSet.has(spell.id)}
                              compactConcentrationDuration
                              selectable
                              isSelected={isChecked}
                              onSelect={() => toggleCantripDraft(spell.id)}
                              disabled={isDisabled}
                              actionShapes={rowDetails?.actionShapes ?? []}
                              contentLayout="natural"
                              className={
                                isDisabled ? styles.spellManagementChoiceDisabled : undefined
                              }
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className={styles.preparedSpellStatusRow}>
              <div>
                <p className={styles.preparedSpellStatusLabel}>
                  <span>
                    {usesSpellbook ? "Spellbook and prepared spells" : "Prepared spells"}
                  </span>
                  <SelectionCounter current={preparedSpellCount} total={preparedSpellLimit} />
                </p>
                {usesSpellbook ? (
                  <>
                    <p className={styles.preparedSpellLimitText}>
                      {spellbookSpellCount} chosen in spellbook
                    </p>
                    {alwaysSpellbookCount > 0 ? (
                      <p className={styles.preparedSpellLimitText}>
                        {alwaysSpellbookCount} always in spellbook
                      </p>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>

            <div className={styles.preparedSpellTabRow}>
              <span className={styles.preparedSpellTabLabel}>Level</span>
              <div className={styles.preparedSpellTabList} role="tablist" aria-label="Spell levels">
                <button
                  key="prepared-level-all"
                  type="button"
                  role="tab"
                  aria-selected={activePreparedSpellLevel === allPreparedSpellTab}
                  aria-label={`All levels, ${allPreparedSpellSelectedCount} spell${
                    allPreparedSpellSelectedCount === 1 ? "" : "s"
                  } selected`}
                  className={clsx(
                    styles.preparedSpellTabButton,
                    activePreparedSpellLevel === allPreparedSpellTab &&
                      styles.preparedSpellTabButtonActive
                  )}
                  onClick={() => selectPreparedSpellLevel(allPreparedSpellTab)}
                >
                  <span className={styles.preparedSpellTabNumber}>All</span>
                  <span className={styles.preparedSpellTabIndicator} aria-hidden="true">
                    ({allPreparedSpellSelectedCount})
                  </span>
                </button>
                {spellSlotLevels.map((level) => {
                  const selectedCount = preparedSpellDraftCountsByLevel[level] ?? 0;
                  const isDisabled = !allowAllSpellLevels && level > highestSpellSlotLevel;

                  return (
                    <button
                      key={`prepared-level-${level}`}
                      type="button"
                      role="tab"
                      aria-selected={activePreparedSpellLevel === level}
                      aria-label={`Level ${level}, ${selectedCount} spell${
                        selectedCount === 1 ? "" : "s"
                      } selected`}
                      className={clsx(
                        styles.preparedSpellTabButton,
                        activePreparedSpellLevel === level && styles.preparedSpellTabButtonActive
                      )}
                      onClick={() => selectPreparedSpellLevel(level)}
                      disabled={isDisabled}
                    >
                      <span className={styles.preparedSpellTabNumber}>{level}</span>
                      <span className={styles.preparedSpellTabIndicator} aria-hidden="true">
                        ({selectedCount})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {spellPreparationOptions.length > 0 ? (
              <SpellManagementFilterControls
                filters={preparedSpellFilters}
                options={preparedSpellFilterOptions}
                onFiltersChange={handlePreparedSpellFiltersChange}
              />
            ) : null}

            <div className={clsx(sheetStyles.spellManagementList, styles.preparedSpellList)}>
              {activePreparedSpellDisplayOptions.length === 0 ? (
                <p className={shared.emptyText}>
                  No {getPreparedSpellTabLabel(activePreparedSpellLevel)} are available for this
                  class and level yet.
                </p>
              ) : filteredActivePreparedSpellDisplayOptions.length === 0 ? (
                <p className={shared.emptyText}>
                  {hasActivePreparedSpellFilters
                    ? `No ${getPreparedSpellTabLabel(activePreparedSpellLevel)} match these filters.`
                    : `No ${getPreparedSpellTabLabel(activePreparedSpellLevel)} are available for this class and level yet.`}
                </p>
              ) : (
                <ul className={styles.preparedSpellSelectionList}>
                  {filteredActivePreparedSpellDisplayOptions.map((spell) => {
                    const isAlwaysPrepared = alwaysPreparedSpellIdSet.has(spell.id);
                    const isAlwaysSpellbook = alwaysSpellbookSpellIdSet.has(spell.id);
                    const isChecked = isAlwaysPrepared || preparedSpellDraftSet.has(spell.id);
                    const isSelected = isPreparedSpellSelected(spell);
                    const isDisabled =
                      !usesSpellbook &&
                      (isAlwaysPrepared || (!isChecked && isPreparedSpellLimitReached));
                    const rowDetails = filteredActivePreparedSpellRowDetailsById.get(spell.id);

                    return (
                      <li key={spell.id}>
                        <SpellListRow
                          spell={spell}
                          onClick={() => onOpenSpellDetails(spell, "prepare-preview")}
                          valueSummary={rowDetails?.valueSummary ?? ""}
                          alwaysPrepared={isAlwaysPrepared}
                          alwaysSpellbook={isAlwaysSpellbook}
                          compactConcentrationDuration
                          selectable
                          isSelected={isSelected}
                          onSelect={
                            usesSpellbook ? undefined : () => togglePreparedSpellDraft(spell.id)
                          }
                          selectionControls={
                            usesSpellbook ? renderWizardSpellManagementControls(spell) : undefined
                          }
                          disabled={isDisabled}
                          actionShapes={rowDetails?.actionShapes ?? []}
                          contentLayout="natural"
                          className={
                            isAlwaysPrepared ? styles.spellManagementChoiceDisabled : undefined
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </OverlayBody>
    </SheetModal>
  );
}

export default SpellManagementModal;
