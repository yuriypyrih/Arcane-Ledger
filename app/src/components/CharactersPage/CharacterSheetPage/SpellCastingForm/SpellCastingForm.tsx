import clsx from "clsx";
import { Pencil, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import SelectInput from "../../FormInputs/SelectInput";
import RarityPill from "../../../CodexPage/RarityPill";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { ENTRY_CATEGORIES, type SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { formatCodexLabel, formatCodexList, formatDamageDice } from "../../../../utils/codex";
import {
  getPreparedSpellLimitForCharacter,
  getPreparedSpellsForCharacter,
  getSpellLevel,
  getSpellPreparationOptionsForCharacter,
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

function SpellCastingForm({ className, onPersistCharacter }: SpellCastingFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const [selectedSpellSlotLevel, setSelectedSpellSlotLevel] = useState(1);
  const [spellManagementMode, setSpellManagementMode] = useState<SpellManagementMode | null>(null);
  const [preparedSpellDraftIds, setPreparedSpellDraftIds] = useState<string[]>([]);

  useBodyScrollLock(Boolean(spellManagementMode || selectedSpell));

  useEffect(() => {
    if (!selectedSpell && !spellManagementMode) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedSpell(null);
        setSpellManagementMode(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedSpell, spellManagementMode]);

  const canCastSpells = isSpellcastingClass(character.className, character.level);

  useEffect(() => {
    if (canCastSpells) {
      return;
    }

    setSelectedSpell(null);
    setSpellManagementMode(null);
  }, [canCastSpells]);

  const usesPreparedSpells = usesPreparedSpellsForCharacter(character.className, character.level);
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

  const preparedSpells = useMemo(() => getPreparedSpellsForCharacter(character), [character]);
  const preparedSpellGroups = useMemo(() => groupSpellsByLevel(preparedSpells), [preparedSpells]);
  const spellPreparationOptions = useMemo(
    () => getSpellPreparationOptionsForCharacter(character.className, character.level),
    [character.className, character.level]
  );
  const spellPreparationGroups = useMemo(
    () => groupSpellsByLevel(spellPreparationOptions),
    [spellPreparationOptions]
  );
  const preparedSpellDraftSet = new Set(preparedSpellDraftIds);
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

  if (!canCastSpells) {
    return null;
  }

  function openSpellManagementMenu() {
    const currentPreparedSpellIds = Array.isArray(character.preparedSpellIds)
      ? [
          ...new Set(
            character.preparedSpellIds.filter((value): value is string => typeof value === "string")
          )
        ]
      : [];

    setPreparedSpellDraftIds(currentPreparedSpellIds);
    setSpellManagementMode("menu");
  }

  function beginSpellEditing() {
    setSpellManagementMode("edit");
  }

  function refreshSpellSlots() {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      spellSlotsExpended: Array.from({ length: 9 }, () => 0)
    }));

    setSpellManagementMode(null);
  }

  function togglePreparedSpellDraft(spellId: string) {
    setPreparedSpellDraftIds((current) =>
      current.includes(spellId)
        ? current.filter((currentSpellId) => currentSpellId !== spellId)
        : preparedSpellLimit !== null && current.length >= preparedSpellLimit
          ? current
          : [...current, spellId]
    );
  }

  function savePreparedSpells() {
    const allowedSpellIds = new Set(spellPreparationOptions.map((spell) => spell.id));
    const nextPreparedSpellIds = [...new Set(preparedSpellDraftIds)]
      .filter((spellId) => allowedSpellIds.has(spellId))
      .slice(0, preparedSpellLimit ?? Number.POSITIVE_INFINITY);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      preparedSpellIds: nextPreparedSpellIds
    }));

    setSpellManagementMode(null);
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
          <p className={shared.emptyText}>
            {usesPreparedSpells
              ? "No prepared spells available for this character yet."
              : "No spells available for this character yet."}
          </p>
        ) : (
          preparedSpellGroups.map((group) => (
            <div key={group.level} className={styles.spellGroup}>
              <p className={styles.spellGroupTitle}>{formatSpellGroupTitle(group.level)}</p>
              <ul className={styles.spellList}>
                {group.spells.map((spell) => (
                  <li key={spell.id}>
                    <button
                      type="button"
                      className={styles.spellButton}
                      onClick={() => openSpellDetails(spell)}
                    >
                      <span>{spell.name}</span>
                      <small>{formatCodexList(spell.tags)}</small>
                    </button>
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
                  {spellManagementMode === "menu" ? "Spell options" : "Prepare spells"}
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
                  <small>Restore all available spell slots without changing hit points.</small>
                </button>
                {usesPreparedSpells ? (
                  <button
                    type="button"
                    className={sheetStyles.spellManagementOptionButton}
                    onClick={beginSpellEditing}
                  >
                    <strong>Prepare spells</strong>
                    <small>
                      {preparedSpellLimit === null
                        ? "Choose which spells are on your current list."
                        : `Choose up to ${preparedSpellLimit} level 1+ spells for your current list.`}
                    </small>
                  </button>
                ) : null}
              </div>
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
                  <RarityPill rarity={selectedSpell.rarity} />
                </div>
                <p className={sheetStyles.spellDrawerSummary}>{selectedSpell.summary}</p>
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
                <span>Types</span>
                <strong>{formatCodexList(selectedSpell.tags)}</strong>
              </div>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Spell level</span>
                <strong>{activeSpellLevel === 0 ? "Cantrip" : `Level ${activeSpellLevel}`}</strong>
              </div>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Damage</span>
                <strong>{formatDamageDice(selectedSpell.damage)}</strong>
              </div>
              <div className={sheetStyles.spellDrawerDetailCard}>
                <span>Damage type</span>
                <strong>
                  {selectedSpell.damageType ? formatCodexLabel(selectedSpell.damageType) : "None"}
                </strong>
              </div>
            </div>

            <div className={sheetStyles.spellDrawerActions}>
              <div className={sheetStyles.spellDrawerCastControls}>
                <p className={sheetStyles.spellDrawerSlotText}>
                  {activeSpellLevel === 0
                    ? "Cantrip: no spell slot required."
                    : `${selectedSpellRemainingSlots ?? 0} slot${
                        (selectedSpellRemainingSlots ?? 0) === 1 ? "" : "s"
                      } remaining at level ${normalizedSelectedSpellSlotLevel}.`}
                </p>
                <label className={sheetStyles.spellSlotSelectField}>
                  <span>Cast at slot level</span>
                  <SelectInput
                    value={normalizedSelectedSpellSlotLevel}
                    disabled={activeSpellLevel === 0}
                    className={sheetStyles.spellSlotSelect}
                    onChange={(event) =>
                      setSelectedSpellSlotLevel(clampNumber(event.target.value, 1, 9, 1))
                    }
                  >
                    {spellSlotLevels.map((slotLevel) => {
                      const totalSlots = spellSlotTotals[slotLevel - 1] ?? 0;
                      const remainingSlots = spellSlotsRemaining[slotLevel - 1] ?? 0;
                      const isDisabled =
                        activeSpellLevel !== 0 &&
                        (slotLevel < minimumSelectedSlotLevel || totalSlots === 0);

                      return (
                        <option key={slotLevel} value={slotLevel} disabled={isDisabled}>
                          Level {slotLevel} ({remainingSlots}/{totalSlots})
                        </option>
                      );
                    })}
                  </SelectInput>
                </label>
              </div>
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
    </article>
  );
}

export default SpellCastingForm;
