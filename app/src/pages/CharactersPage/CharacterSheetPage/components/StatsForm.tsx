import clsx from "clsx";
import { Component, Diamond, Pencil, Save, X } from "lucide-react";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import NumberInput from "../../../../components/CharactersPage/FormInputs/NumberInput";
import type { AbilityKey, Character, CoreStats } from "../../../../types";
import { type StatsViewMode } from "../../../../storage/preferences";
import { abilityKeys, createDefaultCoreStats } from "../../constants";
import {
  formatAbilityModifier,
  getAbilityModifier,
  getArmorClassForCharacter,
  getHitDiceDisplayForCharacter,
  getInitiativeForCharacter,
  getPassivePerceptionForCharacter,
  getProficiencyBonus,
  getSpeedForCharacter
} from "../../gameplay";
import type { AbilitiesDraft } from "../types";
import shared from "./CharacterSheetSectionShared.module.css";
import styles from "./StatsForm.module.css";

type StatsTab = "core" | "modifiers" | "savingThrows";

type StatsFormProps = {
  className?: string;
  abilitiesDraft: AbilitiesDraft;
  character: Character;
  isEditing: boolean;
  mainAbility: AbilityKey | null;
  savingThrowProficienciesDraft: AbilityKey[];
  savingThrowProficiencies: AbilityKey[];
  pointBuyRemaining: number | null;
  statsViewMode: StatsViewMode;
  onBeginEdit: () => void;
  onCancel: () => void;
  onChangeStatsViewMode: (nextMode: StatsViewMode) => void;
  onSaveAbilities: () => void;
  onSaveSavingThrows: () => void;
  onToggleSavingThrowProficiency: (ability: AbilityKey) => void;
  onUpdateAbilityScore: (ability: AbilityKey, value: string) => void;
  setAbilitiesDraft: Dispatch<SetStateAction<AbilitiesDraft>>;
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

function StatsForm({
  className,
  abilitiesDraft,
  character,
  isEditing,
  mainAbility,
  savingThrowProficienciesDraft,
  savingThrowProficiencies,
  pointBuyRemaining,
  statsViewMode,
  onBeginEdit,
  onCancel,
  onChangeStatsViewMode,
  onSaveAbilities,
  onSaveSavingThrows,
  onToggleSavingThrowProficiency,
  onUpdateAbilityScore,
  setAbilitiesDraft
}: StatsFormProps) {
  const [activeTab, setActiveTab] = useState<StatsTab>("modifiers");
  const [editingTab, setEditingTab] = useState<StatsTab>("modifiers");
  const displayedSavingThrowProficiencies =
    isEditing && editingTab === "savingThrows"
      ? savingThrowProficienciesDraft
      : savingThrowProficiencies;
  const savingThrowProficiencySet = new Set<AbilityKey>(displayedSavingThrowProficiencies);
  const proficiencyBonus = getProficiencyBonus(character.level);
  const isTabMode = statsViewMode === "tabs";
  const isAbilityEditorActive = editingTab === "modifiers";
  const displayedAbilities = isEditing && isAbilityEditorActive ? abilitiesDraft.abilities : character.abilities;
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
        const isSavingThrowProficient = savingThrowProficiencySet.has(ability);
        const totalSavingThrow =
          abilityModifier + (isSavingThrowProficient ? proficiencyBonus : 0);

        return {
          ability,
          score: displayedAbilities[ability],
          isSavingThrowProficient,
          totalSavingThrow: formatAbilityModifier(totalSavingThrow)
        };
      }),
    [displayedAbilities, proficiencyBonus, savingThrowProficiencySet]
  );

  function toggleStatsViewMode() {
    onChangeStatsViewMode(isTabMode ? "full" : "tabs");
  }

  function beginEditingFor(tab: StatsTab) {
    setEditingTab(tab);
    setActiveTab(tab);
    onBeginEdit();
  }

  function saveCurrentEdit() {
    if (editingTab === "savingThrows") {
      onSaveSavingThrows();
      return;
    }

    onSaveAbilities();
  }

  function renderEditActions() {
    return (
      <div className={shared.formActions}>
        <button type="button" className={shared.saveButton} onClick={saveCurrentEdit}>
          <Save size={16} />
          Save
        </button>
        <button type="button" className={shared.cancelButton} onClick={onCancel}>
          <X size={16} />
          Cancel
        </button>
      </div>
    );
  }

  function renderCoreStatsSection() {
    return (
      <section className={styles.statsGroup}>
        <div className={styles.statsGroupHeader}>
          <h3 className={styles.statsGroupTitle}>{statsTabLabels.core}</h3>
        </div>
        <div className={styles.modifierGrid}>
          {coreStatFields.map((field) => (
            <div key={field.key} className={styles.modifierCard}>
              <div className={styles.modifierLabelRow}>
                <span className={clsx(styles.modifierLabel, styles.coreStatLabel)}>
                  {field.label}
                </span>
              </div>
              <strong>{displayedCoreStats[field.key]}</strong>
            </div>
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
                    onChange={(event) => onUpdateAbilityScore(ability, event.target.value)}
                  />
                </label>
              ))}
            </div>
            {renderEditActions()}
          </>
        ) : (
          <div className={styles.modifierGrid}>
            {abilityModifierCards.map((card) => (
              <div key={card.ability} className={styles.modifierCard}>
                <div className={styles.modifierLabelRow}>
                  <span className={styles.modifierLabel}>
                    {card.ability}: {card.score}
                  </span>
                  {card.ability === mainAbility ? (
                    <span className={styles.modifierStar} aria-label="Primary attack or spell ability">
                      *
                    </span>
                  ) : null}
                </div>
                <strong>{card.modifier}</strong>
              </div>
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
            <p className={shared.helperText}>
              Select the saving throw proficiencies for this character.
            </p>
            <div className={styles.modifierGrid}>
              {savingThrowCards.map((card) => (
                <label
                  key={card.ability}
                  className={clsx(
                    styles.modifierCard,
                    styles.savingThrowEditCard,
                    card.isSavingThrowProficient &&
                      styles.savingThrowEditCardActive
                  )}
                >
                  <div className={styles.modifierLabelRow}>
                    <span className={styles.modifierLabel}>
                      {card.ability}: {card.score}
                    </span>
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
                    onChange={() =>
                      onToggleSavingThrowProficiency(card.ability)
                    }
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
              <div key={card.ability} className={styles.modifierCard}>
                <div className={styles.modifierLabelRow}>
                  <span className={styles.modifierLabel}>
                    {card.ability}: {card.score}
                  </span>
                </div>
                <strong
                  className={clsx(
                    card.isSavingThrowProficient && styles.savingThrowValueProficient
                  )}
                >
                  {card.totalSavingThrow}
                </strong>
              </div>
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
            className={clsx(
              styles.tabButton,
              currentTab === "modifiers" && styles.tabButtonActive
            )}
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
    </article>
  );
}

export default StatsForm;
