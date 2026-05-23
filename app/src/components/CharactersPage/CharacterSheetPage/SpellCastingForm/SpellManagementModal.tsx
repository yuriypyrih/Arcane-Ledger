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
  onClose: () => void;
  onOpenSpellDetails: (spell: SpellEntry, viewMode: "prepare-preview") => void;
  onPersistCharacter: PersistCharacterUpdater;
  preparedSpellLimit: number | null;
  selectedCantripIds: string[];
  selectedManualSpellbookSpellIds: string[];
  selectedPreparedSpellIds: string[];
  spellActionShapesById: Map<string, SpellListRowActionShapes>;
  spellbookSpellEntriesById: Map<string, SpellEntry>;
  spellOutcomeSummariesById: Map<string, string>;
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

function groupSpellsByLevel(spells: SpellEntry[]): SpellGroup[] {
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
      spells: [...levelSpells].sort((left, right) => left.name.localeCompare(right.name))
    }));
}

function createSpellPreparationLevelGroups(spells: SpellEntry[]): SpellPreparationLevelGroup {
  return spellSlotLevels.reduce<SpellPreparationLevelGroup>((groups, level) => {
    groups[level] = spells
      .filter((spell) => getSpellLevel(spell) === level)
      .sort((left, right) => left.name.localeCompare(right.name));

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

function SpellManagementModal({
  allowAllSpellLevels = false,
  alwaysPreparedSpellIds,
  alwaysSpellbookSpellIds,
  cantripLimit,
  cantripOptions,
  highestSpellSlotLevel,
  knownSpellEntriesById,
  onClose,
  onOpenSpellDetails,
  onPersistCharacter,
  preparedSpellLimit,
  selectedCantripIds,
  selectedManualSpellbookSpellIds,
  selectedPreparedSpellIds,
  spellActionShapesById,
  spellbookSpellEntriesById,
  spellOutcomeSummariesById,
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
  const [activePreparedSpellLevel, setActivePreparedSpellLevel] = useState(
    firstAvailablePreparedSpellLevel
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
  const spellbookDraftSet = useMemo(() => new Set(spellbookDraftIds), [spellbookDraftIds]);
  const spellbookAccessibleDraftSet = useMemo(
    () => new Set([...spellbookDraftIds, ...alwaysSpellbookSpellIds]),
    [alwaysSpellbookSpellIds, spellbookDraftIds]
  );
  const preparedSpellDraftSet = useMemo(
    () => new Set(preparedSpellDraftIds),
    [preparedSpellDraftIds]
  );
  const activePreparedSpellOptions = useMemo(
    () => spellPreparationLevelGroups[activePreparedSpellLevel] ?? [],
    [activePreparedSpellLevel, spellPreparationLevelGroups]
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
  const cantripGroups = useMemo(
    () => groupSpellsByLevel(filteredCantripOptions),
    [filteredCantripOptions]
  );
  const filteredActivePreparedSpellDisplayOptions = useMemo(
    () => filterSpellManagementSpells(activePreparedSpellDisplayOptions, preparedSpellFilters),
    [activePreparedSpellDisplayOptions, preparedSpellFilters]
  );
  const preparedSpellDraftCountsByLevel = useMemo(
    () =>
      countTrackedSpellsByLevel(
        [...alwaysPreparedSpellIds, ...preparedSpellDraftIds],
        knownSpellEntriesById
      ),
    [alwaysPreparedSpellIds, knownSpellEntriesById, preparedSpellDraftIds]
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

    if (activePreparedSpellLevel <= highestSpellSlotLevel) {
      return;
    }

    setActivePreparedSpellLevel(firstAvailablePreparedSpellLevel);
  }, [
    activePreparedSpellLevel,
    allowAllSpellLevels,
    firstAvailablePreparedSpellLevel,
    highestSpellSlotLevel
  ]);

  const beginCantripManagement = useCallback(() => {
    setMode("cantrips");
  }, []);

  const beginPreparedSpellManagement = useCallback(() => {
    setActivePreparedSpellLevel(firstAvailablePreparedSpellLevel);
    setMode("prepared-spells");
  }, [firstAvailablePreparedSpellLevel]);

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
      size="medium"
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
        ) : mode === "cantrips" ? (
          <>
            <div className={styles.preparedSpellStatusRow}>
              <div>
                <p className={styles.preparedSpellStatusLabel}>Cantrips</p>
                <p className={styles.preparedSpellLimitText}>
                  <SelectionCounter current={cantripCount} total={cantripLimit} /> selected
                </p>
              </div>
            </div>

            {cantripOptions.length > 0 ? (
              <SpellManagementFilterControls
                filters={cantripFilters}
                options={cantripFilterOptions}
                onFiltersChange={setCantripFilters}
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
                        const isChecked = cantripDraftSet.has(spell.id);
                        const isDisabled = !isChecked && isCantripLimitReached;
                        const actionShapes = spellActionShapesById.get(spell.id) ?? [];

                        return (
                          <li key={spell.id}>
                            <SpellListRow
                              spell={spell}
                              onClick={() => onOpenSpellDetails(spell, "prepare-preview")}
                              valueSummary={spellOutcomeSummariesById.get(spell.id) ?? ""}
                              alwaysPrepared={alwaysPreparedSpellIdSet.has(spell.id)}
                              compactConcentrationDuration
                              selectable
                              isSelected={isChecked}
                              onSelect={() => toggleCantripDraft(spell.id)}
                              disabled={isDisabled}
                              actionShapes={actionShapes}
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
                  {usesSpellbook ? "Spellbook and prepared spells" : "Prepared spells"}
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
                    <p className={styles.preparedSpellLimitText}>
                      <SelectionCounter current={preparedSpellCount} total={preparedSpellLimit} />{" "}
                      prepared
                    </p>
                  </>
                ) : (
                  <p className={styles.preparedSpellLimitText}>
                    <SelectionCounter current={preparedSpellCount} total={preparedSpellLimit} />{" "}
                    prepared
                  </p>
                )}
              </div>
            </div>

            <div className={styles.preparedSpellTabRow}>
              <span className={styles.preparedSpellTabLabel}>Level</span>
              <div className={styles.preparedSpellTabList} role="tablist" aria-label="Spell levels">
                {spellSlotLevels.map((level) => {
                  const selectedCount = preparedSpellDraftCountsByLevel[level] ?? 0;
                  const isDisabled = !allowAllSpellLevels && level > highestSpellSlotLevel;

                  return (
                    <button
                      key={`prepared-level-${level}`}
                      type="button"
                      role="tab"
                      aria-selected={activePreparedSpellLevel === level}
                      aria-label={`Level ${level}, ${selectedCount} spell${selectedCount === 1 ? "" : "s"} selected`}
                      className={clsx(
                        styles.preparedSpellTabButton,
                        activePreparedSpellLevel === level && styles.preparedSpellTabButtonActive
                      )}
                      onClick={() => setActivePreparedSpellLevel(level)}
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
                onFiltersChange={setPreparedSpellFilters}
              />
            ) : null}

            <div className={clsx(sheetStyles.spellManagementList, styles.preparedSpellList)}>
              {activePreparedSpellDisplayOptions.length === 0 ? (
                <p className={shared.emptyText}>
                  No {formatSpellGroupTitle(activePreparedSpellLevel).toLowerCase()} are available
                  for this class and level yet.
                </p>
              ) : filteredActivePreparedSpellDisplayOptions.length === 0 ? (
                <p className={shared.emptyText}>
                  {hasActivePreparedSpellFilters
                    ? `No ${formatSpellGroupTitle(activePreparedSpellLevel).toLowerCase()} match these filters.`
                    : `No ${formatSpellGroupTitle(activePreparedSpellLevel).toLowerCase()} are available for this class and level yet.`}
                </p>
              ) : (
                <ul className={styles.preparedSpellSelectionList}>
                  {filteredActivePreparedSpellDisplayOptions.map((spell) => {
                    const isAlwaysPrepared = alwaysPreparedSpellIdSet.has(spell.id);
                    const isAlwaysSpellbook = alwaysSpellbookSpellIdSet.has(spell.id);
                    const isChecked = isAlwaysPrepared || preparedSpellDraftSet.has(spell.id);
                    const isDisabled =
                      !usesSpellbook &&
                      (isAlwaysPrepared || (!isChecked && isPreparedSpellLimitReached));
                    const actionShapes = spellActionShapesById.get(spell.id) ?? [];

                    return (
                      <li key={spell.id}>
                        <SpellListRow
                          spell={spell}
                          onClick={() => onOpenSpellDetails(spell, "prepare-preview")}
                          valueSummary={spellOutcomeSummariesById.get(spell.id) ?? ""}
                          alwaysPrepared={isAlwaysPrepared}
                          alwaysSpellbook={isAlwaysSpellbook}
                          compactConcentrationDuration
                          selectable
                          isSelected={
                            usesSpellbook
                              ? spellbookAccessibleDraftSet.has(spell.id) || isAlwaysPrepared
                              : isChecked
                          }
                          onSelect={
                            usesSpellbook ? undefined : () => togglePreparedSpellDraft(spell.id)
                          }
                          selectionControls={
                            usesSpellbook ? renderWizardSpellManagementControls(spell) : undefined
                          }
                          disabled={isDisabled}
                          actionShapes={actionShapes}
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
