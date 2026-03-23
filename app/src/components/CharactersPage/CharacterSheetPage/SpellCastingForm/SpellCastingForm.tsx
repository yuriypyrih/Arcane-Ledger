import clsx from "clsx";
import { Pencil, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import SelectInput from "../../FormInputs/SelectInput";
import SpellListRow from "../../../SpellListRow";
import SpellDescriptionContent from "../../../SpellDescriptionContent";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { useClassSpellEntries } from "../../../../codex/classes";
import {
  ACTION_TYPE,
  ENTRY_CATEGORIES,
  KeywordTooltip,
  type SpellEntry
} from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  formatCodexLabel,
  formatCodexList,
  formatSpellCastingTime,
  formatSpellComponents,
  formatSpellSubtitle,
  getSpellExcerpt,
  formatWeaponDamage,
  renderCodexInlineText
} from "../../../../utils/codex";
import {
  consumeRoundTrackerResource,
  normalizeRoundTracker,
  type RoundTrackerResource
} from "../../../../pages/CharactersPage/combat";
import { getSpellcastingStateForCharacter } from "../../../../pages/CharactersPage/classFeatures";
import {
  getCantripLimitForCharacter,
  getPreparedSpellLimitForCharacter,
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  isSpellcastingClass,
  normalizePreparedSpellIds,
  normalizeSpellSlotsExpended,
  usesPreparedSpellsForCharacter
} from "../../../../pages/CharactersPage/spellcasting";
import type {
  PersistCharacterUpdater,
  SpellManagementMode
} from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  clampNumber,
  formatSpellGroupTitle,
  spellSlotLevels
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./SpellCastingForm.module.css";

type SpellCastingFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type SpellGroup = {
  level: number;
  spells: SpellEntry[];
};

type SpellPreparationLevelGroup = Record<number, SpellEntry[]>;
type SelectedSpellViewMode = "standard" | "prepare-preview";

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

function normalizeTrackedSpellIds(
  spellIds: string[] | undefined,
  availableSpells: SpellEntry[],
  limit: number | null
): string[] {
  const availableSpellIds = new Set(availableSpells.map((spell) => spell.id));
  const rawSpellIds = Array.isArray(spellIds)
    ? spellIds.filter((spellId): spellId is string => typeof spellId === "string")
    : [];

  return [...new Set(rawSpellIds)]
    .filter((spellId) => availableSpellIds.has(spellId))
    .slice(0, limit ?? Number.POSITIVE_INFINITY);
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

function getHighestSpellSlotLevel(spellSlotTotals: number[]): number {
  for (let index = spellSlotTotals.length - 1; index >= 0; index -= 1) {
    if ((spellSlotTotals[index] ?? 0) > 0) {
      return index + 1;
    }
  }

  return 0;
}

function createSpellPreparationLevelGroups(spells: SpellEntry[]): SpellPreparationLevelGroup {
  return spellSlotLevels.reduce<SpellPreparationLevelGroup>((groups, level) => {
    groups[level] = spells
      .filter((spell) => getSpellLevel(spell) === level)
      .sort((left, right) => left.name.localeCompare(right.name));

    return groups;
  }, {} as SpellPreparationLevelGroup);
}

function areSpellIdListsEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((spellId, index) => spellId === right[index]);
}

function getRoundTrackerResourceForSpell(spell: SpellEntry): RoundTrackerResource | null {
  if (spell.castingTime.includes(ACTION_TYPE.BONUS_ACTION)) {
    return "bonusAction";
  }

  if (spell.castingTime.includes(ACTION_TYPE.ACTION)) {
    return "action";
  }

  return null;
}

function SpellCastingForm({ className, onPersistCharacter }: SpellCastingFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const [selectedSpellViewMode, setSelectedSpellViewMode] =
    useState<SelectedSpellViewMode>("standard");
  const [selectedSpellSlotLevel, setSelectedSpellSlotLevel] = useState(1);
  const [spellManagementMode, setSpellManagementMode] = useState<SpellManagementMode | null>(null);
  const [cantripDraftIds, setCantripDraftIds] = useState<string[]>([]);
  const [preparedSpellDraftIds, setPreparedSpellDraftIds] = useState<string[]>([]);
  const [activePreparedSpellLevel, setActivePreparedSpellLevel] = useState(1);
  const [isComponentsTooltipOpen, setIsComponentsTooltipOpen] = useState(false);

  useBodyScrollLock(Boolean(spellManagementMode || selectedSpell || isComponentsTooltipOpen));

  const closeSelectedSpell = useCallback(() => {
    setSelectedSpell(null);
    setSelectedSpellViewMode("standard");
    setIsComponentsTooltipOpen(false);
  }, []);

  useEffect(() => {
    if (!selectedSpell && !spellManagementMode && !isComponentsTooltipOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        if (isComponentsTooltipOpen) {
          setIsComponentsTooltipOpen(false);
          return;
        }

        if (selectedSpell) {
          closeSelectedSpell();
          return;
        }

        setSpellManagementMode(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSelectedSpell, selectedSpell, spellManagementMode, isComponentsTooltipOpen]);

  const canCastSpells = isSpellcastingClass(character.className, character.level);
  const spellcastingState = getSpellcastingStateForCharacter(character);

  useEffect(() => {
    if (canCastSpells) {
      return;
    }

    closeSelectedSpell();
    setSpellManagementMode(null);
    setIsComponentsTooltipOpen(false);
  }, [canCastSpells, closeSelectedSpell]);

  useEffect(() => {
    if (selectedSpell) {
      return;
    }

    setIsComponentsTooltipOpen(false);
  }, [selectedSpell]);

  useEffect(() => {
    if (!spellcastingState.blocked) {
      return;
    }

    setSpellManagementMode(null);
  }, [spellcastingState.blocked]);

  const classSpellEntries = useClassSpellEntries(character.className);
  const usesPreparedSpells = usesPreparedSpellsForCharacter(character.className, character.level);
  const cantripLimit = getCantripLimitForCharacter(character.className, character.level);
  const preparedSpellLimit = getPreparedSpellLimitForCharacter(
    character.className,
    character.level
  );
  const spellSlotTotals = useMemo(
    () => getSpellSlotTotalsForCharacter(character.className, character.level),
    [character.className, character.level]
  );
  const spellSlotsExpended = useMemo(
    () => normalizeSpellSlotsExpended(character.spellSlotsExpended, spellSlotTotals),
    [character.spellSlotsExpended, spellSlotTotals]
  );
  const spellSlotsRemaining = useMemo(
    () =>
      spellSlotTotals.map((total, index) => Math.max(0, total - (spellSlotsExpended[index] ?? 0))),
    [spellSlotTotals, spellSlotsExpended]
  );
  const highestSpellSlotLevel = useMemo(
    () => getHighestSpellSlotLevel(spellSlotTotals),
    [spellSlotTotals]
  );
  const cantripOptions = useMemo(
    () => classSpellEntries.filter((spell) => getSpellLevel(spell) === 0),
    [classSpellEntries]
  );
  const spellPreparationOptions = useMemo(
    () =>
      classSpellEntries.filter((spell) => {
        const spellLevel = getSpellLevel(spell);
        return spellLevel > 0 && spellLevel <= highestSpellSlotLevel;
      }),
    [classSpellEntries, highestSpellSlotLevel]
  );
  const selectedCantripIds = useMemo(
    () => normalizeTrackedSpellIds(character.cantripIds, cantripOptions, cantripLimit),
    [cantripLimit, cantripOptions, character.cantripIds]
  );
  const selectedPreparedSpellIds = useMemo(
    () =>
      normalizePreparedSpellIds(
        character.preparedSpellIds,
        spellPreparationOptions,
        preparedSpellLimit,
        spellSlotTotals
      ),
    [character.preparedSpellIds, preparedSpellLimit, spellPreparationOptions, spellSlotTotals]
  );
  const cantripOptionsById = useMemo(
    () => new Map(cantripOptions.map((spell) => [spell.id, spell])),
    [cantripOptions]
  );
  const spellPreparationOptionsById = useMemo(
    () => new Map(spellPreparationOptions.map((spell) => [spell.id, spell])),
    [spellPreparationOptions]
  );
  const selectedCantrips = useMemo(
    () =>
      selectedCantripIds
        .map((spellId) => cantripOptionsById.get(spellId))
        .filter((spell): spell is SpellEntry => spell !== undefined),
    [cantripOptionsById, selectedCantripIds]
  );
  const selectedPreparedSpells = useMemo(
    () =>
      usesPreparedSpells
        ? selectedPreparedSpellIds
            .map((spellId) => spellPreparationOptionsById.get(spellId))
            .filter((spell): spell is SpellEntry => spell !== undefined)
        : spellPreparationOptions,
    [
      selectedPreparedSpellIds,
      spellPreparationOptions,
      spellPreparationOptionsById,
      usesPreparedSpells
    ]
  );
  const visibleSpellEntries = useMemo(
    () => [...selectedCantrips, ...selectedPreparedSpells],
    [selectedCantrips, selectedPreparedSpells]
  );
  const preparedSpellGroups = useMemo(
    () => groupSpellsByLevel(visibleSpellEntries),
    [visibleSpellEntries]
  );
  const cantripGroups = useMemo(() => groupSpellsByLevel(cantripOptions), [cantripOptions]);
  const spellPreparationLevelGroups = useMemo(
    () => createSpellPreparationLevelGroups(spellPreparationOptions),
    [spellPreparationOptions]
  );
  const cantripDraftSet = useMemo(() => new Set(cantripDraftIds), [cantripDraftIds]);
  const preparedSpellDraftSet = useMemo(
    () => new Set(preparedSpellDraftIds),
    [preparedSpellDraftIds]
  );
  const cantripCount = cantripDraftIds.length;
  const hasCantripManagement = cantripLimit !== null && cantripLimit > 0;
  const isCantripLimitReached = cantripLimit !== null && cantripCount >= cantripLimit;
  const preparedSpellCount = preparedSpellDraftIds.length;
  const isPreparedSpellLimitReached =
    preparedSpellLimit !== null && preparedSpellCount >= preparedSpellLimit;
  const activePreparedSpellOptions = useMemo(
    () => spellPreparationLevelGroups[activePreparedSpellLevel] ?? [],
    [activePreparedSpellLevel, spellPreparationLevelGroups]
  );
  const firstAvailablePreparedSpellLevel = useMemo(
    () =>
      spellSlotLevels.find(
        (level) => (spellPreparationLevelGroups[level]?.length ?? 0) > 0
      ) ?? 1,
    [spellPreparationLevelGroups]
  );
  const preparedSpellDraftCountsByLevel = useMemo(
    () => countTrackedSpellsByLevel(preparedSpellDraftIds, spellPreparationOptionsById),
    [preparedSpellDraftIds, spellPreparationOptionsById]
  );
  const activePreparedSpellCount = preparedSpellDraftCountsByLevel[activePreparedSpellLevel] ?? 0;
  const activePreparedSpellLevelLimit = Math.max(
    0,
    Math.floor(spellSlotTotals[activePreparedSpellLevel - 1] ?? 0)
  );
  const isPreparedSpellLevelLimitReached =
    activePreparedSpellLevelLimit > 0 && activePreparedSpellCount >= activePreparedSpellLevelLimit;

  const selectedSpellLevel = selectedSpell ? getSpellLevel(selectedSpell) : null;
  const activeSpellLevel = selectedSpellLevel ?? 0;
  const minimumSelectedSlotLevel =
    selectedSpellLevel !== null ? Math.max(1, selectedSpellLevel) : 1;
  const normalizedSelectedSpellSlotLevel = clampNumber(
    selectedSpellSlotLevel,
    minimumSelectedSlotLevel,
    9,
    minimumSelectedSlotLevel
  );
  const selectedSpellRemainingSlots =
    selectedSpellLevel === null || selectedSpellLevel === 0
      ? null
      : (spellSlotsRemaining[normalizedSelectedSpellSlotLevel - 1] ?? 0);
  const canCastSelectedSpell =
    selectedSpell !== null &&
    (selectedSpellLevel === 0 ||
      (selectedSpellRemainingSlots !== null &&
        normalizedSelectedSpellSlotLevel >= minimumSelectedSlotLevel &&
        selectedSpellRemainingSlots > 0));
  const componentsTooltipEntry = KeywordTooltip.components ?? null;
  const roundTracker = useMemo(
    () => normalizeRoundTracker(character.roundTracker),
    [character.roundTracker]
  );
  const selectedSpellRoundTrackerResource = selectedSpell
    ? getRoundTrackerResourceForSpell(selectedSpell)
    : null;
  const selectedSpellActionWarning =
    selectedSpellRoundTrackerResource === "action" && !roundTracker.actionAvailable
      ? `You already used the ${ACTION_TYPE.ACTION} for this turn`
      : selectedSpellRoundTrackerResource === "bonusAction" && !roundTracker.bonusActionAvailable
        ? `You already used the ${ACTION_TYPE.BONUS_ACTION} for this turn`
        : null;

  useEffect(() => {
    setCantripDraftIds((current) => {
      const normalized = normalizeTrackedSpellIds(current, cantripOptions, cantripLimit);
      return areSpellIdListsEqual(current, normalized) ? current : normalized;
    });
  }, [cantripLimit, cantripOptions]);

  useEffect(() => {
    setPreparedSpellDraftIds((current) => {
      const normalized = normalizePreparedSpellIds(
        current,
        spellPreparationOptions,
        preparedSpellLimit,
        spellSlotTotals
      );
      return areSpellIdListsEqual(current, normalized) ? current : normalized;
    });
  }, [preparedSpellLimit, spellPreparationOptions, spellSlotTotals]);

  useEffect(() => {
    if (activePreparedSpellLevel <= highestSpellSlotLevel) {
      return;
    }

    setActivePreparedSpellLevel(firstAvailablePreparedSpellLevel);
  }, [activePreparedSpellLevel, firstAvailablePreparedSpellLevel, highestSpellSlotLevel]);

  const openSpellManagementMenu = useCallback(() => {
    setCantripDraftIds(selectedCantripIds);
    setPreparedSpellDraftIds(selectedPreparedSpellIds);
    setSpellManagementMode("menu");
  }, [selectedCantripIds, selectedPreparedSpellIds]);

  const beginCantripManagement = useCallback(() => {
    setSpellManagementMode("cantrips");
  }, []);

  const beginPreparedSpellManagement = useCallback(() => {
    setActivePreparedSpellLevel(firstAvailablePreparedSpellLevel);
    setSpellManagementMode("prepared-spells");
  }, [firstAvailablePreparedSpellLevel]);

  const refreshSpellSlots = useCallback(() => {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      spellSlotsExpended: Array.from({ length: 9 }, () => 0)
    }));

    setSpellManagementMode(null);
  }, [onPersistCharacter]);

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
          current,
          spellPreparationOptions,
          preparedSpellLimit,
          spellSlotTotals
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

        const spellLevel = getSpellLevel(spell);
        const spellLevelLimit = Math.max(0, Math.floor(spellSlotTotals[spellLevel - 1] ?? 0));
        const selectedSpellCountsByLevel = countTrackedSpellsByLevel(
          normalizedCurrent,
          spellPreparationOptionsById
        );
        const selectedSpellCountAtLevel = selectedSpellCountsByLevel[spellLevel] ?? 0;

        if (spellLevelLimit <= 0 || selectedSpellCountAtLevel >= spellLevelLimit) {
          return normalizedCurrent;
        }

        return [...normalizedCurrent, spellId];
      });
    },
    [preparedSpellLimit, spellPreparationOptions, spellPreparationOptionsById, spellSlotTotals]
  );

  const saveCantrips = useCallback(() => {
    const nextCantripIds = normalizeTrackedSpellIds(cantripDraftIds, cantripOptions, cantripLimit);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      cantripIds: nextCantripIds
    }));

    setSpellManagementMode(null);
  }, [cantripDraftIds, cantripLimit, cantripOptions, onPersistCharacter]);

  const savePreparedSpells = useCallback(() => {
    const nextPreparedSpellIds = normalizePreparedSpellIds(
      preparedSpellDraftIds,
      spellPreparationOptions,
      preparedSpellLimit,
      spellSlotTotals
    );

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      preparedSpellIds: nextPreparedSpellIds
    }));

    setSpellManagementMode(null);
  }, [
    onPersistCharacter,
    preparedSpellDraftIds,
    preparedSpellLimit,
    spellPreparationOptions,
    spellSlotTotals
  ]);

  if (!canCastSpells) {
    return null;
  }

  function openSpellDetails(
    spell: SpellEntry,
    viewMode: SelectedSpellViewMode = "standard"
  ) {
    const spellLevel = getSpellLevel(spell);
    const minimumSlotLevel = Math.max(1, spellLevel);
    const preferredSlotLevel =
      spellLevel === 0
        ? 1
        : (spellSlotLevels.find(
            (slotLevel) =>
              slotLevel >= minimumSlotLevel && (spellSlotsRemaining[slotLevel - 1] ?? 0) > 0
          ) ??
          spellSlotLevels.find(
            (slotLevel) =>
              slotLevel >= minimumSlotLevel && (spellSlotTotals[slotLevel - 1] ?? 0) > 0
          ) ??
          minimumSlotLevel);

    setSelectedSpellViewMode(viewMode);
    setSelectedSpellSlotLevel(preferredSlotLevel);
    setSelectedSpell(spell);
  }

  function castSelectedSpell() {
    if (!selectedSpell || spellcastingState.blocked) {
      return;
    }

    const spellLevel = getSpellLevel(selectedSpell);
    const roundTrackerResource = getRoundTrackerResourceForSpell(selectedSpell);

    if (spellLevel === 0) {
      if (roundTrackerResource) {
        onPersistCharacter((currentCharacter) => ({
          ...currentCharacter,
          roundTracker: consumeRoundTrackerResource(
            currentCharacter.roundTracker,
            roundTrackerResource
          )
        }));
      }

      closeSelectedSpell();
      return;
    }

    const minimumSlotLevel = Math.max(1, spellLevel);
    const slotLevel = clampNumber(selectedSpellSlotLevel, minimumSlotLevel, 9, minimumSlotLevel);

    if ((spellSlotsRemaining[slotLevel - 1] ?? 0) <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const currentSpellSlotTotals = getSpellSlotTotalsForCharacter(
        currentCharacter.className,
        currentCharacter.level
      );
      const currentSpellSlotsExpended = normalizeSpellSlotsExpended(
        currentCharacter.spellSlotsExpended,
        currentSpellSlotTotals
      );
      const nextSpellSlotsExpended = [...currentSpellSlotsExpended];

      nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;

      return {
        ...currentCharacter,
        spellSlotsExpended: nextSpellSlotsExpended,
        roundTracker: roundTrackerResource
          ? consumeRoundTrackerResource(currentCharacter.roundTracker, roundTrackerResource)
          : currentCharacter.roundTracker
      };
    });

    closeSelectedSpell();
  }

  function openComponentsTooltip() {
    if (!selectedSpell || !componentsTooltipEntry) {
      return;
    }

    setIsComponentsTooltipOpen(true);
  }

  const isPreparedSpellPreview = selectedSpellViewMode === "prepare-preview";
  const isSelectedSpellPreparedInDraft = selectedSpell
    ? preparedSpellDraftSet.has(selectedSpell.id)
    : false;

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Spellcasting</p>
          <h3 className={shared.subtitle}>Prepared spells and spell slots</h3>
        </div>
        <button
          type="button"
          className={shared.editButton}
          onClick={openSpellManagementMenu}
          disabled={spellcastingState.blocked}
        >
          <Pencil size={16} />
          Edit
        </button>
      </div>

      {spellcastingState.reason ? (
        <p className={styles.spellcastingBlockedNotice}>{spellcastingState.reason}</p>
      ) : null}

      <div className={styles.spellSlotHeader}>
        <p className={styles.spellGroupTitle}>Spell slots</p>
      </div>
      <div className={styles.spellSlotGrid}>
        {spellSlotLevels.map((slotLevel) => {
          const totalSlots = spellSlotTotals[slotLevel - 1] ?? 0;
          const remainingSlots = spellSlotsRemaining[slotLevel - 1] ?? 0;

          return (
            <div
              key={slotLevel}
              className={clsx(styles.spellSlotCard, totalSlots === 0 && styles.spellSlotCardEmpty)}
            >
              <span>L{slotLevel}</span>
              {totalSlots === 0 ? (
                <small className={styles.spellSlotDash}>-</small>
              ) : (
                <div className={styles.spellSlotSquares}>
                  {Array.from({ length: totalSlots }, (_, index) => (
                    <span
                      key={`${slotLevel}-${index}`}
                      className={clsx(
                        styles.spellSlotSquare,
                        index < remainingSlots && styles.spellSlotSquareFilled
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.spellListStack}>
        {preparedSpellGroups.length === 0 ? (
          <p className={shared.emptyText}>No spells or cantrips have been selected yet.</p>
        ) : (
          preparedSpellGroups.map((group) => (
            <div key={group.level} className={styles.spellGroup}>
              <p className={styles.spellGroupTitle}>{formatSpellGroupTitle(group.level)}</p>
              <ul className={styles.spellList}>
                {group.spells.map((spell) => (
                  <li key={spell.id}>
                    <SpellListRow spell={spell} onClick={() => openSpellDetails(spell)} />
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {spellManagementMode ? (
        <div
          className={sheetStyles.spellManagementBackdrop}
          role="presentation"
          onClick={() => setSpellManagementMode(null)}
        >
          <section
            className={sheetStyles.spellManagementModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spell-management-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Spellcasting</p>
                <h3 id="spell-management-title">
                  {spellManagementMode === "menu"
                    ? "Spell options"
                    : spellManagementMode === "cantrips"
                      ? "Manage cantrips"
                      : "Prepare spells"}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setSpellManagementMode(null)}
                aria-label="Close spell options"
              >
                <X size={18} />
              </button>
            </div>

            {spellManagementMode === "menu" ? (
              <div className={sheetStyles.spellManagementOptionGrid}>
                <button
                  type="button"
                  className={sheetStyles.spellManagementOptionButton}
                  onClick={refreshSpellSlots}
                >
                  <strong>Refresh spell slots</strong>
                  <small>Restore all available spell slots.</small>
                </button>
                {hasCantripManagement ? (
                  <button
                    type="button"
                    className={sheetStyles.spellManagementOptionButton}
                    onClick={beginCantripManagement}
                  >
                    <strong>Manage cantrips</strong>
                    <small>Choose from the list of cantrips for your class.</small>
                  </button>
                ) : null}
                {usesPreparedSpells ? (
                  <button
                    type="button"
                    className={sheetStyles.spellManagementOptionButton}
                    onClick={beginPreparedSpellManagement}
                  >
                    <strong>Prepare spells</strong>
                    <small>
                      Choose from the list of spells for your class based on your current level.
                    </small>
                  </button>
                ) : null}
              </div>
            ) : spellManagementMode === "cantrips" ? (
              <>
                {cantripLimit !== null ? (
                  <p className={styles.preparedSpellLimitText}>
                    Cantrips: {cantripCount}/{cantripLimit}
                  </p>
                ) : null}

                <div className={sheetStyles.spellManagementList}>
                  {cantripGroups.length === 0 ? (
                    <p className={shared.emptyText}>
                      No cantrips are available for this class right now.
                    </p>
                  ) : (
                    cantripGroups.map((group) => (
                      <div key={group.level} className={sheetStyles.spellManagementGroup}>
                        <p className={sheetStyles.spellGroupTitle}>
                          {formatSpellGroupTitle(group.level)}
                        </p>
                        <ul className={sheetStyles.spellManagementChoiceList}>
                          {group.spells.map((spell) => {
                            const isChecked = cantripDraftSet.has(spell.id);
                            const isDisabled = !isChecked && isCantripLimitReached;

                            return (
                              <li key={spell.id}>
                                <label
                                  className={clsx(
                                    sheetStyles.spellManagementChoice,
                                    isDisabled && styles.spellManagementChoiceDisabled
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onChange={() => toggleCantripDraft(spell.id)}
                                  />
                                  <span>{spell.name}</span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
                <div className={sheetStyles.spellManagementActions}>
                  <button
                    type="button"
                    className={sheetStyles.cancelButton}
                    onClick={() => setSpellManagementMode("menu")}
                  >
                    Back
                  </button>
                  <button type="button" className={sheetStyles.saveButton} onClick={saveCantrips}>
                    Save cantrips
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.preparedSpellStatusRow}>
                  <div>
                    <p className={styles.preparedSpellStatusLabel}>Prepared spells</p>
                    {preparedSpellLimit !== null ? (
                      <p className={styles.preparedSpellLimitText}>
                        {preparedSpellCount}/{preparedSpellLimit} prepared
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className={styles.preparedSpellTabRow}>
                  <span className={styles.preparedSpellTabLabel}>Level</span>
                  <div
                    className={styles.preparedSpellTabList}
                    role="tablist"
                    aria-label="Spell levels"
                  >
                    {spellSlotLevels.map((level) => {
                      const selectedCount = preparedSpellDraftCountsByLevel[level] ?? 0;
                      const spellLevelLimit = Math.max(
                        0,
                        Math.floor(spellSlotTotals[level - 1] ?? 0)
                      );
                      const indicatorCubeCount = spellLevelLimit;
                      const isDisabled = level > highestSpellSlotLevel;

                      return (
                        <button
                          key={`prepared-level-${level}`}
                          type="button"
                          role="tab"
                          aria-selected={activePreparedSpellLevel === level}
                          aria-label={`Level ${level}, ${selectedCount} of ${spellLevelLimit} spell${spellLevelLimit === 1 ? "" : "s"} selected`}
                          className={clsx(
                            styles.preparedSpellTabButton,
                            activePreparedSpellLevel === level && styles.preparedSpellTabButtonActive
                          )}
                          onClick={() => setActivePreparedSpellLevel(level)}
                          disabled={isDisabled}
                        >
                          <span className={styles.preparedSpellTabNumber}>{level}</span>
                          <span className={styles.preparedSpellTabIndicator} aria-hidden="true">
                            {Array.from({ length: indicatorCubeCount }, (_, index) => (
                              <span
                                key={`prepared-level-${level}-cube-${index}`}
                                className={clsx(
                                  styles.preparedSpellTabCube,
                                  index < selectedCount && styles.preparedSpellTabCubeFilled
                                )}
                              />
                            ))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={clsx(sheetStyles.spellManagementList, styles.preparedSpellList)}>
                  {activePreparedSpellOptions.length === 0 ? (
                    <p className={shared.emptyText}>
                      No {formatSpellGroupTitle(activePreparedSpellLevel).toLowerCase()} are
                      available for this class and level yet.
                    </p>
                  ) : (
                    <ul className={styles.preparedSpellSelectionList}>
                      {activePreparedSpellOptions.map((spell) => {
                        const isChecked = preparedSpellDraftSet.has(spell.id);
                        const isDisabled =
                          !isChecked &&
                          (isPreparedSpellLimitReached ||
                            activePreparedSpellLevelLimit <= 0 ||
                            isPreparedSpellLevelLimitReached);

                        return (
                          <li key={spell.id}>
                            <SpellListRow
                              spell={spell}
                              onClick={() => openSpellDetails(spell, "prepare-preview")}
                              selectable
                              isSelected={isChecked}
                              onSelect={() => togglePreparedSpellDraft(spell.id)}
                              disabled={isDisabled}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div className={sheetStyles.spellManagementActions}>
                  <button
                    type="button"
                    className={sheetStyles.cancelButton}
                    onClick={() => setSpellManagementMode("menu")}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className={sheetStyles.saveButton}
                    onClick={savePreparedSpells}
                  >
                    Save spells
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}

      {selectedSpell ? (
        <div
          className={clsx(
            sheetStyles.spellDrawerBackdrop,
            isPreparedSpellPreview && styles.previewSpellDrawerBackdrop
          )}
          role="presentation"
          onClick={closeSelectedSpell}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-spell-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>
                  {isPreparedSpellPreview
                    ? "Spell preview"
                    : formatCodexLabel(ENTRY_CATEGORIES.SPELLS)}
                </p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-spell-drawer-title">{selectedSpell.name}</h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>
                  {formatSpellSubtitle(selectedSpell)}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={closeSelectedSpell}
                aria-label={isPreparedSpellPreview ? "Close spell preview" : "Close spell details"}
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.spellDrawerDetails}>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Casting Time</span>
                <strong>{formatSpellCastingTime(selectedSpell.castingTime)}</strong>
              </div>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Range</span>
                <strong>{selectedSpell.range}</strong>
              </div>
              <button
                type="button"
                className={clsx(sheetStyles.spellDrawerDetailCard, styles.spellDetailButton)}
                onClick={openComponentsTooltip}
              >
                <span>Components</span>
                <strong>{formatSpellComponents(selectedSpell.components)}</strong>
              </button>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Duration</span>
                <strong>{selectedSpell.duration}</strong>
              </div>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Spell Lists</span>
                <strong>{formatCodexList(selectedSpell.spellLists)}</strong>
              </div>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Damage</span>
                <strong>{formatWeaponDamage(selectedSpell.damage)}</strong>
              </div>
            </div>

            <SpellDescriptionContent
              description={selectedSpell.description}
              className={clsx(
                sheetStyles.spellDrawerDescriptionList,
                sheetStyles.spellDrawerDescriptionSection
              )}
              entryClassName={sheetStyles.spellDrawerDescriptionLine}
            />

            {isPreparedSpellPreview ? (
              <div className={styles.previewSpellFooter}>
                <p className={styles.previewSpellStatus}>
                  {isSelectedSpellPreparedInDraft
                    ? "Prepared in this draft"
                    : "Not prepared in this draft"}
                </p>
                <p className={styles.previewSpellNote}>
                  Preview only while choosing prepared spells. Close this drawer to keep editing
                  your preparation list.
                </p>
              </div>
            ) : (
              <div className={sheetStyles.spellDrawerActions}>
                <div className={styles.castActionMeta}>
                {activeSpellLevel === 0 ? null : (
                  <div className={sheetStyles.spellDrawerCastControls}>
                    <p className={sheetStyles.spellDrawerSlotText}>
                      {`${selectedSpellRemainingSlots ?? 0} slot${
                        (selectedSpellRemainingSlots ?? 0) === 1 ? "" : "s"
                      } remaining at level ${normalizedSelectedSpellSlotLevel}. ${getSpellExcerpt(
                        selectedSpell
                      )}`}
                    </p>
                    <label className={sheetStyles.spellSlotSelectField}>
                      <span>Cast at slot level</span>
                      <SelectInput
                        value={normalizedSelectedSpellSlotLevel}
                        className={sheetStyles.spellSlotSelect}
                        onChange={(event) =>
                          setSelectedSpellSlotLevel(clampNumber(event.target.value, 1, 9, 1))
                        }
                      >
                        {spellSlotLevels.map((slotLevel) => {
                          const totalSlots = spellSlotTotals[slotLevel - 1] ?? 0;
                          const remainingSlots = spellSlotsRemaining[slotLevel - 1] ?? 0;
                          const isDisabled =
                            slotLevel < minimumSelectedSlotLevel || totalSlots === 0;

                          return (
                            <option key={slotLevel} value={slotLevel} disabled={isDisabled}>
                              Level {slotLevel} ({remainingSlots}/{totalSlots})
                            </option>
                          );
                        })}
                      </SelectInput>
                    </label>
                  </div>
                )}
                {selectedSpellActionWarning ? (
                  <p className={styles.castActionWarning}>{selectedSpellActionWarning}</p>
                ) : null}
                {spellcastingState.reason ? (
                  <p className={styles.castActionWarning}>{spellcastingState.reason}</p>
                ) : null}
                </div>
                <button
                  type="button"
                  className={sheetStyles.castButton}
                  onClick={castSelectedSpell}
                  disabled={!canCastSelectedSpell || spellcastingState.blocked}
                >
                  Cast
                </button>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {selectedSpell && isComponentsTooltipOpen ? (
        <div
          className={clsx(sheetStyles.spellDrawerBackdrop, styles.componentsDrawerBackdrop)}
          role="presentation"
          onClick={() => setIsComponentsTooltipOpen(false)}
        >
          <section
            className={clsx(sheetStyles.spellDrawer, styles.componentsDrawer)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spell-components-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Keyword</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="spell-components-title">
                    {componentsTooltipEntry?.title ?? "Components"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setIsComponentsTooltipOpen(false)}
                aria-label="Close components details"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className={clsx(sheetStyles.spellDrawerDescriptionList, styles.componentsDrawerBody)}
            >
              {componentsTooltipEntry?.description.map((line, index) => (
                <p
                  key={`components-description-${index}`}
                  className={sheetStyles.spellDrawerDescriptionLine}
                >
                  {renderCodexInlineText(line)}
                </p>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </article>
  );
}

export default SpellCastingForm;
