import clsx from "clsx";
import { Pencil, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import SelectInput from "../../FormInputs/SelectInput";
import SpellListRow from "../../../SpellListRow";
import SpellDescriptionContent from "../../../SpellDescriptionContent";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { useClassSpellEntries } from "../../../../codex/classes";
import { ENTRY_CATEGORIES, KeywordTooltip, type SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  formatCodexLabel,
  formatCodexList,
  formatSpellComponents,
  formatSpellSubtitle,
  getSpellExcerpt,
  formatWeaponDamage,
  renderCodexInlineText
} from "../../../../utils/codex";
import {
  getCantripLimitForCharacter,
  getPreparedSpellLimitForCharacter,
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  isSpellcastingClass,
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

function getHighestSpellSlotLevel(spellSlotTotals: number[]): number {
  for (let index = spellSlotTotals.length - 1; index >= 0; index -= 1) {
    if ((spellSlotTotals[index] ?? 0) > 0) {
      return index + 1;
    }
  }

  return 0;
}

function SpellCastingForm({ className, onPersistCharacter }: SpellCastingFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const [selectedSpellSlotLevel, setSelectedSpellSlotLevel] = useState(1);
  const [spellManagementMode, setSpellManagementMode] = useState<SpellManagementMode | null>(null);
  const [cantripDraftIds, setCantripDraftIds] = useState<string[]>([]);
  const [preparedSpellDraftIds, setPreparedSpellDraftIds] = useState<string[]>([]);
  const [isComponentsTooltipOpen, setIsComponentsTooltipOpen] = useState(false);

  useBodyScrollLock(Boolean(spellManagementMode || selectedSpell || isComponentsTooltipOpen));

  useEffect(() => {
    if (!selectedSpell && !spellManagementMode && !isComponentsTooltipOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedSpell(null);
        setSpellManagementMode(null);
        setIsComponentsTooltipOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedSpell, spellManagementMode, isComponentsTooltipOpen]);

  const canCastSpells = isSpellcastingClass(character.className, character.level);

  useEffect(() => {
    if (canCastSpells) {
      return;
    }

    setSelectedSpell(null);
    setSpellManagementMode(null);
    setIsComponentsTooltipOpen(false);
  }, [canCastSpells]);

  useEffect(() => {
    if (selectedSpell) {
      return;
    }

    setIsComponentsTooltipOpen(false);
  }, [selectedSpell]);

  const classSpellEntries = useClassSpellEntries(character.className);
  const usesPreparedSpells = usesPreparedSpellsForCharacter(character.className, character.level);
  const cantripLimit = getCantripLimitForCharacter(character.className, character.level);
  const preparedSpellLimit = getPreparedSpellLimitForCharacter(
    character.className,
    character.level
  );
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
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
      normalizeTrackedSpellIds(
        character.preparedSpellIds,
        spellPreparationOptions,
        preparedSpellLimit
      ),
    [character.preparedSpellIds, preparedSpellLimit, spellPreparationOptions]
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
  const spellPreparationGroups = useMemo(
    () => groupSpellsByLevel(spellPreparationOptions),
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

  useEffect(() => {
    setCantripDraftIds((current) =>
      normalizeTrackedSpellIds(current, cantripOptions, cantripLimit)
    );
  }, [cantripLimit, cantripOptions]);

  useEffect(() => {
    setPreparedSpellDraftIds((current) =>
      normalizeTrackedSpellIds(current, spellPreparationOptions, preparedSpellLimit)
    );
  }, [preparedSpellLimit, spellPreparationOptions]);

  const openSpellManagementMenu = useCallback(() => {
    setCantripDraftIds(selectedCantripIds);
    setPreparedSpellDraftIds(selectedPreparedSpellIds);
    setSpellManagementMode("menu");
  }, [selectedCantripIds, selectedPreparedSpellIds]);

  const beginCantripManagement = useCallback(() => {
    setSpellManagementMode("cantrips");
  }, []);

  const beginPreparedSpellManagement = useCallback(() => {
    setSpellManagementMode("prepared-spells");
  }, []);

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
      setPreparedSpellDraftIds((current) =>
        current.includes(spellId)
          ? current.filter((currentSpellId) => currentSpellId !== spellId)
          : preparedSpellLimit !== null && current.length >= preparedSpellLimit
            ? current
            : [...current, spellId]
      );
    },
    [preparedSpellLimit]
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
    const nextPreparedSpellIds = normalizeTrackedSpellIds(
      preparedSpellDraftIds,
      spellPreparationOptions,
      preparedSpellLimit
    );

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      preparedSpellIds: nextPreparedSpellIds
    }));

    setSpellManagementMode(null);
  }, [onPersistCharacter, preparedSpellDraftIds, preparedSpellLimit, spellPreparationOptions]);

  if (!canCastSpells) {
    return null;
  }

  function openSpellDetails(spell: SpellEntry) {
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

    setSelectedSpellSlotLevel(preferredSlotLevel);
    setSelectedSpell(spell);
  }

  function castSelectedSpell() {
    if (!selectedSpell) {
      return;
    }

    const spellLevel = getSpellLevel(selectedSpell);

    if (spellLevel === 0) {
      setSelectedSpell(null);
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
        spellSlotsExpended: nextSpellSlotsExpended
      };
    });

    setSelectedSpell(null);
  }

  function openComponentsTooltip() {
    if (!selectedSpell || !componentsTooltipEntry) {
      return;
    }

    setIsComponentsTooltipOpen(true);
  }

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Spellcasting</p>
          <h3 className={shared.subtitle}>Prepared spells and spell slots</h3>
        </div>
        <button type="button" className={shared.editButton} onClick={openSpellManagementMenu}>
          <Pencil size={16} />
          Edit
        </button>
      </div>

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
                {preparedSpellLimit !== null ? (
                  <p className={styles.preparedSpellLimitText}>
                    Prepared spells: {preparedSpellCount}/{preparedSpellLimit}
                  </p>
                ) : null}

                <div className={sheetStyles.spellManagementList}>
                  {spellPreparationGroups.length === 0 ? (
                    <p className={shared.emptyText}>
                      No level 1+ spells are available for this class and level yet.
                    </p>
                  ) : (
                    spellPreparationGroups.map((group) => (
                      <div key={group.level} className={sheetStyles.spellManagementGroup}>
                        <p className={sheetStyles.spellGroupTitle}>
                          {formatSpellGroupTitle(group.level)}
                        </p>
                        <ul className={sheetStyles.spellManagementChoiceList}>
                          {group.spells.map((spell) => {
                            const isChecked = preparedSpellDraftSet.has(spell.id);
                            const isDisabled = !isChecked && isPreparedSpellLimitReached;

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
                                    onChange={() => togglePreparedSpellDraft(spell.id)}
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
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedSpell(null)}
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
                  {formatCodexLabel(ENTRY_CATEGORIES.SPELLS)}
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
                onClick={() => setSelectedSpell(null)}
                aria-label="Close spell details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.spellDrawerDetails}>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Casting Time</span>
                <strong>{selectedSpell.castingTime}</strong>
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

            <div className={sheetStyles.spellDrawerActions}>
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
                        const isDisabled = slotLevel < minimumSelectedSlotLevel || totalSlots === 0;

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
              <button
                type="button"
                className={sheetStyles.castButton}
                onClick={castSelectedSpell}
                disabled={!canCastSelectedSpell}
              >
                Cast
              </button>
            </div>
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
