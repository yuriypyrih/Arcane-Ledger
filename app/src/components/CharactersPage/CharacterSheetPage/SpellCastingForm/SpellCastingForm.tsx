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
  getAllSpellEntries,
  getKnownSpellsForCharacter,
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  isSpellcastingClass,
  normalizeSpellSlotsExpended
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

type KnownSpellGroup = {
  level: number;
  spells: SpellEntry[];
};

function SpellCastingForm({ className, onPersistCharacter }: SpellCastingFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const [selectedSpellSlotLevel, setSelectedSpellSlotLevel] = useState(1);
  const [spellManagementMode, setSpellManagementMode] = useState<SpellManagementMode | null>(null);
  const [knownSpellDraftIds, setKnownSpellDraftIds] = useState<string[]>([]);

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

  const canCastSpells = isSpellcastingClass(character.className);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );

  const knownSpells = useMemo(() => getKnownSpellsForCharacter(character), [character]);

  const knownSpellGroups: KnownSpellGroup[] = useMemo(() => {
    const knownSpellsByLevel = knownSpells.reduce((groups, spell) => {
      const spellLevel = getSpellLevel(spell);
      const currentGroup = groups.get(spellLevel) ?? [];

      groups.set(spellLevel, [...currentGroup, spell]);
      return groups;
    }, new Map<number, SpellEntry[]>());

    return [...knownSpellsByLevel.entries()]
      .sort(([leftLevel], [rightLevel]) => leftLevel - rightLevel)
      .map(([level, spells]) => ({
        level,
        spells: [...spells].sort((left, right) => left.name.localeCompare(right.name))
      }));
  }, [knownSpells]);

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

  const highestSpellSlotLevel = spellSlotTotals.reduce(
    (highestLevel, total, index) => (total > 0 ? index + 1 : highestLevel),
    0
  );
  const editableSpellOptions = getAllSpellEntries().filter((spell) => {
    const spellLevel = getSpellLevel(spell);
    return spellLevel === 0 || spellLevel <= highestSpellSlotLevel;
  });
  const editableSpellGroups = editableSpellOptions.reduce((groups, spell) => {
    const spellLevel = getSpellLevel(spell);
    const currentGroup = groups.get(spellLevel) ?? [];

    groups.set(spellLevel, [...currentGroup, spell]);
    return groups;
  }, new Map<number, SpellEntry[]>());
  const editableSpellGroupRows = [...editableSpellGroups.entries()]
    .sort(([leftLevel], [rightLevel]) => leftLevel - rightLevel)
    .map(([level, spells]) => ({
      level,
      spells: [...spells].sort((left, right) => left.name.localeCompare(right.name))
    }));
  const knownSpellDraftSet = new Set(knownSpellDraftIds);

  function openSpellManagementMenu() {
    if (!canCastSpells) {
      return;
    }

    setKnownSpellDraftIds(knownSpells.map((spell) => spell.id));
    setSpellManagementMode("menu");
  }

  function beginSpellEditing() {
    if (!canCastSpells) {
      return;
    }

    setSpellManagementMode("edit");
  }

  function refreshSpellSlots() {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      spellSlotsExpended: Array.from({ length: 9 }, () => 0)
    }));

    setSpellManagementMode(null);
  }

  function toggleKnownSpellDraft(spellId: string) {
    setKnownSpellDraftIds((current) =>
      current.includes(spellId)
        ? current.filter((currentSpellId) => currentSpellId !== spellId)
        : [...current, spellId]
    );
  }

  function saveKnownSpells() {
    const allowedSpellIds = new Set(editableSpellOptions.map((spell) => spell.id));
    const nextKnownSpellIds = [...new Set(knownSpellDraftIds)].filter((spellId) =>
      allowedSpellIds.has(spellId)
    );

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      knownSpellIds: nextKnownSpellIds
    }));

    setSpellManagementMode(null);
  }

  function openSpellDetails(spell: SpellEntry) {
    if (!canCastSpells) {
      return;
    }

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
    <article
      className={clsx(
        shared.sectionCard,
        className,
        !canCastSpells && styles.spellcastingSectionDisabled
      )}
    >
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Spellcasting</p>
          <h3 className={shared.subtitle}>Known spells and spell slots</h3>
        </div>
        <button
          type="button"
          className={shared.editButton}
          onClick={openSpellManagementMenu}
          disabled={!canCastSpells}
        >
          <Pencil size={16} />
          Edit
        </button>
      </div>

      <div className={styles.spellSlotHeader}>
        <p className={styles.spellGroupTitle}>Spell slots</p>
      </div>
      <div className={styles.spellSlotGrid} aria-disabled={!canCastSpells}>
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
        {!canCastSpells ? (
          <p className={shared.emptyText}>This class does not use spellcasting.</p>
        ) : knownSpellGroups.length === 0 ? (
          <p className={shared.emptyText}>No known spells available for this character yet.</p>
        ) : (
          knownSpellGroups.map((group) => (
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
                  {spellManagementMode === "menu" ? "Spell options" : "Edit known spells"}
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
                <button
                  type="button"
                  className={sheetStyles.spellManagementOptionButton}
                  onClick={beginSpellEditing}
                >
                  <strong>Edit spells</strong>
                  <small>Add or remove known spells from your current list.</small>
                </button>
              </div>
            ) : (
              <>
                <div className={sheetStyles.spellManagementList}>
                  {editableSpellGroupRows.length === 0 ? (
                    <p className={shared.emptyText}>
                      No spells available for this class and level yet.
                    </p>
                  ) : (
                    editableSpellGroupRows.map((group) => (
                      <div key={group.level} className={sheetStyles.spellManagementGroup}>
                        <p className={sheetStyles.spellGroupTitle}>
                          {formatSpellGroupTitle(group.level)}
                        </p>
                        <ul className={sheetStyles.spellManagementChoiceList}>
                          {group.spells.map((spell) => (
                            <li key={spell.id}>
                              <label className={sheetStyles.spellManagementChoice}>
                                <input
                                  type="checkbox"
                                  checked={knownSpellDraftSet.has(spell.id)}
                                  onChange={() => toggleKnownSpellDraft(spell.id)}
                                />
                                <span>{spell.name}</span>
                              </label>
                            </li>
                          ))}
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
                    onClick={saveKnownSpells}
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
