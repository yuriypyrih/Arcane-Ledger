import clsx from "clsx";
import { Component, Diamond, Pencil, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import NumberInput from "../../FormInputs/NumberInput";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import {
  loadPreferences,
  updatePreferences,
  type StatsViewMode
} from "../../../../storage/preferences";
import type { AbilityKey, Character, CoreStats } from "../../../../types";
import {
  getAbilityScoreBreakdownForCharacter,
  getAbilityScoresForCharacter
} from "../../../../pages/CharactersPage/abilities";
import { getKeywordDescription } from "../../../../pages/CharactersPage/keywordDescriptions";
import {
  abilityKeys,
  createDefaultCoreStats,
  getPointBuyRemaining,
  normalizePointBuyAbilities
} from "../../../../pages/CharactersPage/constants";
import {
  formatAbilityModifier,
  getAbilityModifier,
  getHitDiceDisplayForCharacter,
  getInitiativeBreakdownForCharacter,
  getInitiativeForCharacter,
  getMainAbilityForClass,
  getPassivePerceptionForCharacter,
  getProficiencyBonus
} from "../../../../pages/CharactersPage/gameplay";
import {
  getArmorClassBreakdownForCharacter,
  getArmorClassForCharacter
} from "../../../../pages/CharactersPage/armor";
import {
  getSpeedBreakdownForCharacter,
  getSpeedForCharacter
} from "../../../../pages/CharactersPage/speed";
import {
  type FeatureIndicator,
  applySuperiorInspirationOnInitiativeForCharacter,
  getCoreStatIndicatorsForCharacter,
  getSavingThrowIndicatorsForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import RollStatePill from "../../../RollStatePill/RollStatePill";
import {
  getSavingThrowLevelFromEntries,
  getSavingThrowProficiencyForAbilityKey,
  toggleManualSavingThrowEntry
} from "../../../../pages/CharactersPage/proficiency";
import { PROF_LEVEL } from "../../../../types";
import type {
  AbilitiesDraft,
  PersistCharacterUpdater
} from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  clampNumber,
  cloneAbilityScores,
  normalizeCustomAbilityScores
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./StatsForm.module.css";

type StatsTab = "core" | "modifiers" | "savingThrows";

type CharacterStatsFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type SelectedStatReference = {
  keyword: string;
  description: string;
  detailText?: string;
  indicators?: FeatureIndicator[];
};

const coreStatFields: Array<{ key: keyof CoreStats; label: string }> = [
  { key: "armorClass", label: "Armor Class" },
  { key: "initiative", label: "Initiative" },
  { key: "speed", label: "Speed" },
  { key: "passivePerception", label: "Passive Perception" },
  { key: "proficiencyBonus", label: "Proficiency Bonus" },
  { key: "hitDice", label: "Hit Dice" }
];

const statsTabLabels: Record<StatsTab, string> = {
  core: "Core Stats",
  modifiers: "Ability Modifiers",
  savingThrows: "Saving Throws"
};

function createAbilitiesDraft(character: Character): AbilitiesDraft {
  return {
    attributeMode: character.attributeMode,
    abilities: cloneAbilityScores(character.abilities)
  };
}

function formatArmorClassTermLabel(label: string, source: string): string {
  if (label === "Base") {
    return `Base (${source})`;
  }

  if (["STR", "DEX", "CON", "INT", "WIS", "CHA"].includes(label)) {
    return label;
  }

  return label;
}

function formatArmorClassFormula(
  total: number,
  entries: Array<{ label: string; value: number }>,
  source: string
): string {
  const terms = entries.map(
    (entry) =>
      `${entry.value >= 0 ? "+" : ""}${entry.value} ${formatArmorClassTermLabel(entry.label, source)}`
  );
  return `${total} AC = ${terms.join(" ")}`;
}

function formatSpeedTermLabel(label: string, source: string): string {
  if (label === "Base") {
    return `Base (${source})`;
  }

  return label;
}

function formatSpeedFormula(
  total: number,
  entries: Array<{ label: string; value: number }>,
  source: string
): string {
  const terms = entries.map(
    (entry) =>
      `${entry.value >= 0 ? "+" : ""}${entry.value} ${formatSpeedTermLabel(entry.label, source)}`
  );

  return `${total} ft = ${terms.join(" ")}`;
}

function formatInitiativeFormula(
  total: number,
  entries: Array<{ label: string; value: number }>
): string {
  const terms = entries.map(
    (entry) => `${entry.value >= 0 ? "+" : ""}${entry.value} ${entry.label}`
  );

  return `${formatAbilityModifier(total)} Initiative = ${terms.join(" ")}`;
}

function formatD20Formula(modifier: number): string {
  if (modifier === 0) {
    return "1d20";
  }

  return `1d20 ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
}

function formatAbilityScoreFormula(
  ability: AbilityKey,
  total: number,
  entries: Array<{ label: string; value: number }>
): string {
  const terms = entries.map(
    (entry) => `${entry.value >= 0 ? "+" : ""}${entry.value} (${entry.label})`
  );

  return `${total} ${ability} = ${terms.join(" ")}`;
}

function getProficiencyMultiplier(level: PROF_LEVEL): 0 | 1 | 2 {
  if (level === PROF_LEVEL.EXPERT) {
    return 2;
  }

  if (level === PROF_LEVEL.PROFICIENT) {
    return 1;
  }

  return 0;
}

function formatSavingThrowFormula(
  ability: AbilityKey,
  total: number,
  abilityModifier: number,
  proficiencyContribution: number,
  proficiencyLabel?: string
): string {
  const terms = [`${abilityModifier >= 0 ? "+" : ""}${abilityModifier} ${ability}`];

  if (proficiencyContribution !== 0 && proficiencyLabel) {
    terms.push(`${proficiencyContribution >= 0 ? "+" : ""}${proficiencyContribution} ${proficiencyLabel}`);
  }

  return `${formatAbilityModifier(total)} ${ability} Save = ${terms.join(" ")}`;
}

function CharacterStatsForm({ className, onPersistCharacter }: CharacterStatsFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<StatsTab>("modifiers");
  const [editingTab, setEditingTab] = useState<StatsTab>("modifiers");
  const [abilitiesDraft, setAbilitiesDraft] = useState<AbilitiesDraft>(() =>
    createAbilitiesDraft(character)
  );
  const [savingThrowProficienciesDraft, setSavingThrowProficienciesDraft] = useState(
    () => character.savingThrowProficiencies
  );
  const [statsViewMode, setStatsViewMode] = useState<StatsViewMode>(
    () => loadPreferences().statsViewMode
  );
  const [selectedStatReference, setSelectedStatReference] = useState<SelectedStatReference | null>(
    null
  );
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  useBodyScrollLock(Boolean(selectedStatReference));

  useEffect(() => {
    if (!selectedStatReference) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedStatReference(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedStatReference]);

  const mainAbility = getMainAbilityForClass(character.className);
  const pointBuyRemaining =
    abilitiesDraft.attributeMode === "pointBuy"
      ? getPointBuyRemaining(abilitiesDraft.abilities)
      : null;

  const displayedSavingThrowProficiencies =
    isEditing && editingTab === "savingThrows"
      ? savingThrowProficienciesDraft
      : character.savingThrowProficiencies;
  const proficiencyBonus = getProficiencyBonus(character.level);
  const isTabMode = statsViewMode === "tabs";
  const isAbilityEditorActive = editingTab === "modifiers";
  const effectiveAbilities = useMemo(() => getAbilityScoresForCharacter(character), [character]);
  const displayedAbilities =
    isEditing && isAbilityEditorActive ? abilitiesDraft.abilities : effectiveAbilities;
  const staticCoreStats = character.coreStats ?? createDefaultCoreStats();
  const displayedCoreStats: CoreStats = {
    ...staticCoreStats,
    armorClass: String(getArmorClassForCharacter(character)),
    initiative: formatAbilityModifier(getInitiativeForCharacter(character)),
    speed: `${getSpeedForCharacter(character)} ft`,
    passivePerception: String(getPassivePerceptionForCharacter(character)),
    proficiencyBonus: formatAbilityModifier(getProficiencyBonus(character.level)),
    hitDice: getHitDiceDisplayForCharacter(character)
  };
  const coreStatIndicators = getCoreStatIndicatorsForCharacter(character);
  const savingThrowIndicators = getSavingThrowIndicatorsForCharacter(character);
  const armorClassBreakdown = useMemo(
    () => getArmorClassBreakdownForCharacter(character),
    [character]
  );
  const speedBreakdown = useMemo(() => getSpeedBreakdownForCharacter(character), [character]);
  const initiativeBreakdown = useMemo(() => getInitiativeBreakdownForCharacter(character), [character]);

  const abilityModifierCards = useMemo(
    () =>
      abilityKeys.map((ability) => ({
        ability,
        score: displayedAbilities[ability],
        modifier: formatAbilityModifier(getAbilityModifier(displayedAbilities[ability]))
      })),
    [displayedAbilities]
  );

  const savingThrowCards = useMemo(
    () =>
      abilityKeys.map((ability) => {
        const abilityModifier = getAbilityModifier(displayedAbilities[ability]);
        const savingThrowProficiency = getSavingThrowProficiencyForAbilityKey(ability);
        const savingThrowLevel = getSavingThrowLevelFromEntries(
          displayedSavingThrowProficiencies,
          savingThrowProficiency
        );
        const proficiencyMultiplier = getProficiencyMultiplier(savingThrowLevel);
        const proficiencyContribution = proficiencyBonus * proficiencyMultiplier;
        const isSavingThrowProficient = proficiencyMultiplier > 0;
        const totalSavingThrow = abilityModifier + proficiencyContribution;
        const proficiencyLabel =
          proficiencyMultiplier === 2
            ? "Expertise"
            : proficiencyMultiplier === 1
              ? "Proficiency Bonus"
              : undefined;

        return {
          ability,
          score: displayedAbilities[ability],
          isSavingThrowProficient,
          abilityModifier,
          proficiencyContribution,
          proficiencyLabel,
          totalSavingThrowValue: totalSavingThrow,
          totalSavingThrow: formatAbilityModifier(totalSavingThrow),
          indicators: savingThrowIndicators[ability] ?? []
        };
      }),
    [displayedAbilities, displayedSavingThrowProficiencies, proficiencyBonus, savingThrowIndicators]
  );

  function syncDraftsFromCharacter() {
    setAbilitiesDraft(createAbilitiesDraft(character));
    setSavingThrowProficienciesDraft(character.savingThrowProficiencies);
  }

  function toggleStatsViewMode() {
    const nextMode: StatsViewMode = isTabMode ? "full" : "tabs";
    setStatsViewMode(nextMode);
    updatePreferences({ statsViewMode: nextMode });
  }

  function beginEditingFor(tab: StatsTab) {
    syncDraftsFromCharacter();
    setEditingTab(tab);
    setActiveTab(tab);
    setIsEditing(true);
  }

  function cancelEditing() {
    syncDraftsFromCharacter();
    setIsEditing(false);
  }

  function saveAbilities() {
    const nextAbilities =
      abilitiesDraft.attributeMode === "pointBuy"
        ? normalizePointBuyAbilities(cloneAbilityScores(abilitiesDraft.abilities))
        : normalizeCustomAbilityScores(cloneAbilityScores(abilitiesDraft.abilities));

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      attributeMode: abilitiesDraft.attributeMode,
      abilities: nextAbilities
    }));

    setIsEditing(false);
  }

  function saveSavingThrows() {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      savingThrowProficiencies: savingThrowProficienciesDraft
    }));

    setIsEditing(false);
  }

  function saveCurrentEdit() {
    if (editingTab === "savingThrows") {
      saveSavingThrows();
      return;
    }

    saveAbilities();
  }

  function updateAbilityScore(ability: AbilityKey, value: string) {
    const isPointBuy = abilitiesDraft.attributeMode === "pointBuy";
    const nextValue = clampNumber(
      value,
      isPointBuy ? 8 : 1,
      isPointBuy ? 15 : 99,
      abilitiesDraft.abilities[ability]
    );

    setAbilitiesDraft((current) => ({
      ...current,
      abilities: {
        ...current.abilities,
        [ability]: nextValue
      }
    }));
  }

  function toggleSavingThrowProficiency(ability: AbilityKey) {
    setSavingThrowProficienciesDraft((currentSelections) =>
      toggleManualSavingThrowEntry(
        currentSelections,
        getSavingThrowProficiencyForAbilityKey(ability)
      )
    );
  }

  function openStatReference(keyword: string, indicators?: FeatureIndicator[]) {
    const description = getKeywordDescription(keyword);
    const savingThrowAbility = keyword.replace(" Saving Throw", "");

    if (!description) {
      return;
    }

    setSelectedStatReference({
      keyword,
      description,
      indicators: indicators?.length ? indicators : undefined,
      detailText:
        keyword === "Armor Class"
          ? formatArmorClassFormula(
              armorClassBreakdown.total,
              armorClassBreakdown.entries,
              armorClassBreakdown.source
            )
          : keyword === "Initiative"
            ? formatInitiativeFormula(initiativeBreakdown.total, initiativeBreakdown.entries)
          : keyword === "Speed"
            ? formatSpeedFormula(
                speedBreakdown.total,
                speedBreakdown.entries,
                speedBreakdown.source
              )
            : abilityKeys.includes(keyword as AbilityKey)
              ? (() => {
                  const abilityBreakdown = getAbilityScoreBreakdownForCharacter(
                    character,
                    keyword as AbilityKey
                  );

                  return formatAbilityScoreFormula(
                    keyword as AbilityKey,
                    abilityBreakdown.total,
                    abilityBreakdown.entries
                  );
                })()
              : abilityKeys.includes(savingThrowAbility as AbilityKey)
                ? (() => {
                    const ability = savingThrowAbility as AbilityKey;
                    const savingThrowCard = savingThrowCards.find((card) => card.ability === ability);

                    if (!savingThrowCard) {
                      return undefined;
                    }

                    return formatSavingThrowFormula(
                      ability,
                      savingThrowCard.totalSavingThrowValue,
                      savingThrowCard.abilityModifier,
                      savingThrowCard.proficiencyContribution,
                      savingThrowCard.proficiencyLabel
                    );
                  })()
          : undefined
    });
  }

  function renderEditActions() {
    return (
      <div className={shared.formActions}>
        <button type="button" className={shared.saveButton} onClick={saveCurrentEdit}>
          <Save size={16} />
          Save
        </button>
        <button type="button" className={shared.cancelButton} onClick={cancelEditing}>
          <X size={16} />
          Cancel
        </button>
      </div>
    );
  }

  function rollInitiative() {
    const initiativeFormula = formatInitiativeFormula(
      initiativeBreakdown.total,
      initiativeBreakdown.entries
    );

    onPersistCharacter((currentCharacter) =>
      applySuperiorInspirationOnInitiativeForCharacter(currentCharacter)
    );
    setSelectedStatReference(null);
    openDiceRoller({
      title: "Initiative",
      formula: formatD20Formula(initiativeBreakdown.total),
      description: initiativeFormula
    });
  }

  function renderCoreStatsSection() {
    return (
      <section className={styles.statsGroup}>
        <div className={styles.statsGroupHeader}>
          <h3 className={styles.statsGroupTitle}>{statsTabLabels.core}</h3>
        </div>
        <div className={styles.modifierGrid}>
          {coreStatFields.map((field) => (
            <button
              key={field.key}
              type="button"
              className={clsx(styles.modifierCard, styles.modifierCardButton)}
              onClick={() => openStatReference(field.label, coreStatIndicators[field.key])}
            >
              <div className={styles.modifierLabelRow}>
                <span className={clsx(styles.modifierLabel, styles.coreStatLabel)}>
                  {field.label}
                </span>
                {coreStatIndicators[field.key]?.map((indicator) => (
                  <RollStatePill
                    key={`${field.key}-${indicator.label}-${indicator.tone}`}
                    tone={indicator.tone}
                    label={indicator.label}
                  />
                ))}
              </div>
              <strong>{displayedCoreStats[field.key]}</strong>
            </button>
          ))}
        </div>
      </section>
    );
  }

  function renderAbilityModifiersSection() {
    const isSectionEditing = isEditing && editingTab === "modifiers";

    return (
      <section className={styles.statsGroup}>
        <div className={styles.statsGroupHeader}>
          <h3 className={styles.statsGroupTitle}>{statsTabLabels.modifiers}</h3>
          {!isEditing ? (
            <button
              type="button"
              className={shared.editButton}
              onClick={() => beginEditingFor("modifiers")}
            >
              <Pencil size={16} />
              Edit
            </button>
          ) : null}
        </div>

        {isSectionEditing ? (
          <>
            <div className={styles.modeControl}>
              <button
                type="button"
                className={clsx(
                  styles.modeButton,
                  abilitiesDraft.attributeMode === "custom" && styles.modeButtonActive
                )}
                onClick={() =>
                  setAbilitiesDraft((current) => ({
                    ...current,
                    attributeMode: "custom"
                  }))
                }
              >
                Custom
              </button>
              <button
                type="button"
                className={clsx(
                  styles.modeButton,
                  abilitiesDraft.attributeMode === "pointBuy" && styles.modeButtonActive
                )}
                onClick={() =>
                  setAbilitiesDraft((current) => ({
                    ...current,
                    attributeMode: "pointBuy"
                  }))
                }
              >
                Point Buy
              </button>
            </div>
            {abilitiesDraft.attributeMode === "pointBuy" && pointBuyRemaining !== null ? (
              <p className={shared.helperText}>{pointBuyRemaining} points remaining</p>
            ) : null}
            <div className={styles.abilityInputGrid}>
              {abilityKeys.map((ability) => (
                <label key={ability} className={styles.abilityInputCard}>
                  <span>{ability}</span>
                  <NumberInput
                    min={abilitiesDraft.attributeMode === "pointBuy" ? 8 : 1}
                    max={abilitiesDraft.attributeMode === "pointBuy" ? 15 : 99}
                    value={abilitiesDraft.abilities[ability]}
                    onChange={(event) => updateAbilityScore(ability, event.target.value)}
                  />
                </label>
              ))}
            </div>
            {renderEditActions()}
          </>
        ) : (
          <div className={styles.modifierGrid}>
            {abilityModifierCards.map((card) => (
              <button
                key={card.ability}
                type="button"
                className={clsx(styles.modifierCard, styles.modifierCardButton)}
                onClick={() => openStatReference(card.ability)}
              >
                <div className={styles.modifierLabelRow}>
                  <span className={styles.modifierLabel}>
                    {card.ability}: {card.score}
                  </span>
                  {card.ability === mainAbility ? (
                    <span
                      className={styles.modifierStar}
                      aria-label="Primary attack or spell ability"
                    >
                      *
                    </span>
                  ) : null}
                </div>
                <strong>{card.modifier}</strong>
              </button>
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderSavingThrowsSection() {
    const isSectionEditing = isEditing && editingTab === "savingThrows";

    return (
      <section className={styles.statsGroup}>
        <div className={styles.statsGroupHeader}>
          <h3 className={styles.statsGroupTitle}>{statsTabLabels.savingThrows}</h3>
          {!isEditing ? (
            <button
              type="button"
              className={shared.editButton}
              onClick={() => beginEditingFor("savingThrows")}
            >
              <Pencil size={16} />
              Edit
            </button>
          ) : null}
        </div>

        {isSectionEditing ? (
          <>
            <p className={shared.helperText}>Changes here are stored as manual overrides.</p>
            <div className={styles.modifierGrid}>
              {savingThrowCards.map((card) => (
                <label
                  key={card.ability}
                  className={clsx(
                    styles.modifierCard,
                    styles.savingThrowEditCard,
                    card.isSavingThrowProficient && styles.savingThrowEditCardActive
                  )}
                >
                  <div className={styles.modifierLabelRow}>
                    <span className={styles.modifierLabel}>
                      {card.ability}: {card.score}
                    </span>
                    {card.indicators.map((indicator) => (
                      <RollStatePill
                        key={`${card.ability}-${indicator.label}-${indicator.tone}`}
                        tone={indicator.tone}
                        label={indicator.label}
                      />
                    ))}
                  </div>
                  <strong
                    className={clsx(
                      card.isSavingThrowProficient && styles.savingThrowValueProficient
                    )}
                  >
                    {card.totalSavingThrow}
                  </strong>
                  <input
                    type="checkbox"
                    checked={card.isSavingThrowProficient}
                    className={styles.savingThrowEditCheckbox}
                    onChange={() => toggleSavingThrowProficiency(card.ability)}
                    aria-label={`Toggle ${card.ability} saving throw proficiency`}
                  />
                </label>
              ))}
            </div>
            {renderEditActions()}
          </>
        ) : (
          <div className={styles.modifierGrid}>
            {savingThrowCards.map((card) => (
              <button
                key={card.ability}
                type="button"
                className={clsx(styles.modifierCard, styles.modifierCardButton)}
                onClick={() => openStatReference(`${card.ability} Saving Throw`, card.indicators)}
              >
                <div className={styles.modifierLabelRow}>
                  <span className={styles.modifierLabel}>
                    {card.ability}: {card.score}
                  </span>
                  {card.indicators.map((indicator) => (
                    <RollStatePill
                      key={`${card.ability}-${indicator.label}-${indicator.tone}`}
                      tone={indicator.tone}
                      label={indicator.label}
                    />
                  ))}
                </div>
                <strong
                  className={clsx(
                    card.isSavingThrowProficient && styles.savingThrowValueProficient
                  )}
                >
                  {card.totalSavingThrow}
                </strong>
              </button>
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderTabModeContent() {
    const currentTab = isEditing ? editingTab : activeTab;

    return (
      <>
        <div className={styles.tabRow} role="tablist" aria-label="Stats tabs">
          <button
            type="button"
            role="tab"
            aria-selected={currentTab === "core"}
            disabled={isEditing}
            className={clsx(styles.tabButton, currentTab === "core" && styles.tabButtonActive)}
            onClick={() => setActiveTab("core")}
          >
            Core Stats
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentTab === "modifiers"}
            disabled={isEditing}
            className={clsx(styles.tabButton, currentTab === "modifiers" && styles.tabButtonActive)}
            onClick={() => setActiveTab("modifiers")}
          >
            Ability Modifiers
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentTab === "savingThrows"}
            disabled={isEditing}
            className={clsx(
              styles.tabButton,
              currentTab === "savingThrows" && styles.tabButtonActive
            )}
            onClick={() => setActiveTab("savingThrows")}
          >
            Saving Throws
          </button>
        </div>

        {currentTab === "core" ? renderCoreStatsSection() : null}
        {currentTab === "modifiers" ? renderAbilityModifiersSection() : null}
        {currentTab === "savingThrows" ? renderSavingThrowsSection() : null}
      </>
    );
  }

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Character Stats</p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.viewSwitch}
            onClick={toggleStatsViewMode}
            disabled={isEditing}
            aria-label={isTabMode ? "Switch to full view" : "Switch to tab view"}
            title={isTabMode ? "Switch to full view" : "Switch to tab view"}
          >
            <span
              className={clsx(
                styles.viewSwitchIconSlot,
                isTabMode && styles.viewSwitchIconSlotActive
              )}
            >
              <Diamond size={16} />
            </span>
            <span
              className={clsx(
                styles.viewSwitchIconSlot,
                !isTabMode && styles.viewSwitchIconSlotActive
              )}
            >
              <Component size={16} />
            </span>
          </button>
        </div>
      </div>

      {isTabMode ? (
        renderTabModeContent()
      ) : (
        <div className={styles.fullViewStack}>
          {renderCoreStatsSection()}
          {renderAbilityModifiersSection()}
          {renderSavingThrowsSection()}
        </div>
      )}

      {selectedStatReference ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedStatReference(null)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-stats-reference-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={clsx(sheetStyles.spellDrawerHeader, styles.referenceDrawerHeader)}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Reference</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-stats-reference-title">{selectedStatReference.keyword}</h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>
                  {selectedStatReference.description}
                </p>
              </div>
              {selectedStatReference.indicators?.length ? (
                <div className={styles.referenceIndicatorStack}>
                  {selectedStatReference.indicators.map((indicator, index) => (
                    <RollStatePill
                      key={`${selectedStatReference.keyword}-${indicator.label}-${indicator.tone}-${indicator.source}-${index}`}
                      tone={indicator.tone}
                      label={indicator.label}
                      detailText={`From ${indicator.source}`}
                    />
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedStatReference(null)}
                aria-label="Close stats details"
              >
                <X size={18} />
              </button>
            </div>
            {selectedStatReference.detailText ? (
              <div className={sheetStyles.spellDrawerBody}>
                <div className={sheetStyles.spellDrawerDetails}>
                  <div
                    className={clsx(
                      sheetStyles.spellDrawerDetailCard,
                      styles.referenceDetailCardFullWidth
                    )}
                  >
                    <span>Formula</span>
                    <strong>{selectedStatReference.detailText}</strong>
                  </div>
                </div>
              </div>
            ) : null}
            {selectedStatReference.keyword === "Initiative" ? (
              <div className={sheetStyles.spellDrawerActions}>
                <div />
                <button
                  type="button"
                  className={sheetStyles.castButton}
                  onClick={rollInitiative}
                >
                  Roll Initiative
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
      {diceRollerPopup}
    </article>
  );
}

export default CharacterStatsForm;
