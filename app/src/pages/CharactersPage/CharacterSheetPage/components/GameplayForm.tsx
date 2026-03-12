import clsx from "clsx";
import {
  Dices,
  FastForward,
  HeartPlus,
  Moon,
  Pencil,
  Plus,
  Save,
  Skull,
  Sword,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import NumberInput from "../../../../components/CharactersPage/FormInputs/NumberInput";
import SelectInput from "../../../../components/CharactersPage/FormInputs/SelectInput";
import { useDiceRollerPopup } from "../../../../components/DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { Character } from "../../../../types";
import {
  formatAbilityModifier,
  getAutomaticMaxHitPointsForCharacter,
  getWeaponActionsForCharacter
} from "../../gameplay";
import type { HpDraft, PersistCharacterUpdater } from "../types";
import { clampNumber } from "../utils";
import sheetStyles from "../CharacterSheetPage.module.css";
import shared from "./CharacterSheetSectionShared.module.css";
import styles from "./GameplayForm.module.css";

type GameplayFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type ConditionEntry = {
  name: string;
  description: string;
};

type AppliedCondition = {
  name: string;
  roundsRemaining: number;
};

type DeathSaveState = {
  successes: number;
  failures: number;
};

type MaxHitPointsMode = "automatic" | "custom";

const conditionCatalog: ConditionEntry[] = [
  {
    name: "Blinded",
    description:
      "You cannot see and automatically fail checks that require sight. Attack rolls against you have advantage, and your own attack rolls have disadvantage."
  },
  {
    name: "Charmed",
    description:
      "You cannot attack the charmer or target them with harmful abilities. The charmer has advantage on social checks against you."
  },
  {
    name: "Deafened",
    description:
      "You cannot hear and automatically fail checks that rely on hearing."
  },
  {
    name: "Frightened",
    description:
      "You have disadvantage on checks and attacks while the source of fear is in sight, and you cannot willingly move closer to it."
  },
  {
    name: "Grappled",
    description:
      "Your speed becomes 0, and you cannot benefit from bonuses to speed."
  },
  {
    name: "Incapacitated",
    description:
      "You cannot take actions or reactions."
  },
  {
    name: "Invisible",
    description:
      "You cannot be seen without special senses or magic. You have advantage on attacks, and attacks against you have disadvantage."
  },
  {
    name: "Paralyzed",
    description:
      "You are incapacitated, cannot move or speak, and automatically fail STR/DEX saves. Attacks against you have advantage, and nearby hits are critical."
  },
  {
    name: "Petrified",
    description:
      "You are transformed into inert stone-like substance. You are incapacitated, unaware, and resistant to most damage sources depending on rules context."
  },
  {
    name: "Poisoned",
    description:
      "You have disadvantage on attack rolls and ability checks."
  },
  {
    name: "Prone",
    description:
      "You are on the ground. Melee attacks against you have advantage, ranged attacks against you have disadvantage, and your own attacks may suffer penalties by context."
  },
  {
    name: "Restrained",
    description:
      "Your speed is 0. Attack rolls against you have advantage, your attacks have disadvantage, and you have disadvantage on DEX saves."
  },
  {
    name: "Stunned",
    description:
      "You are incapacitated, cannot move, and can only speak falteringly. You automatically fail STR/DEX saves and attacks against you have advantage."
  },
  {
    name: "Unconscious",
    description:
      "You are incapacitated, cannot move or speak, and are unaware of surroundings. You drop what you hold, fall prone, and attacks against you have advantage."
  }
];

function createHpDraft(character: Character): HpDraft {
  return {
    hitPoints: character.hitPoints,
    currentHitPoints: character.currentHitPoints
  };
}

function normalizeMaxHitPointsMode(value: Character["maxHitPointsMode"]): MaxHitPointsMode {
  return value === "automatic" ? "automatic" : "custom";
}

function createDefaultDeathSaves(): DeathSaveState {
  return {
    successes: 0,
    failures: 0
  };
}

function normalizeDeathSaves(value: Character["deathSaves"]): DeathSaveState {
  return {
    successes: Math.floor(clampNumber(value?.successes, 0, 3, 0)),
    failures: Math.floor(clampNumber(value?.failures, 0, 3, 0))
  };
}

function normalizeConditions(value: Character["conditions"]): AppliedCondition[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((condition): condition is AppliedCondition => {
      if (!condition || typeof condition !== "object") {
        return false;
      }

      if (typeof condition.name !== "string") {
        return false;
      }

      return Number.isFinite(condition.roundsRemaining);
    })
    .map((condition) => ({
      name: condition.name,
      roundsRemaining: Math.max(1, Math.floor(condition.roundsRemaining))
    }));
}

function formatSignedValue(value: number): string {
  return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
}

function formatProficiencyLabel(label: string): string {
  return label
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parseDiceFormula(formula: string): { count: number; sides: number } | null {
  const match = formula.trim().match(/^(\d+)d(\d+)$/i);

  if (!match) {
    return null;
  }

  const count = Number(match[1]);
  const sides = Number(match[2]);

  if (!Number.isFinite(count) || !Number.isFinite(sides) || count <= 0 || sides <= 0) {
    return null;
  }

  return { count, sides };
}

function getDamageRangeLabel(baseFormula: string, modifier: number, fullRollFormula: string): string {
  const parsedDiceFormula = parseDiceFormula(baseFormula);

  if (!parsedDiceFormula) {
    return `Damage (${fullRollFormula})`;
  }

  const minimumDamage = parsedDiceFormula.count + modifier;
  const maximumDamage = parsedDiceFormula.count * parsedDiceFormula.sides + modifier;

  return `${minimumDamage}~${maximumDamage} Damage (${fullRollFormula})`;
}

function getConditionDescription(name: string): string {
  const condition = conditionCatalog.find((entry) => entry.name === name);

  if (!condition) {
    return "Temporary state affecting the character until its duration ends or it is removed.";
  }

  return condition.description;
}

function GameplayForm({ className, onPersistCharacter }: GameplayFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [isEditing, setIsEditing] = useState(false);
  const [hpDraft, setHpDraft] = useState<HpDraft>(() => createHpDraft(character));
  const [hpModeDraft, setHpModeDraft] = useState<MaxHitPointsMode>(() =>
    normalizeMaxHitPointsMode(character.maxHitPointsMode)
  );
  const [hitPointStep, setHitPointStep] = useState(1);
  const [isRestPopupOpen, setIsRestPopupOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [conditionDraftName, setConditionDraftName] = useState(conditionCatalog[0]?.name ?? "Poisoned");
  const [conditionDraftDuration, setConditionDraftDuration] = useState(1);
  const [selectedConditionName, setSelectedConditionName] = useState<string | null>(null);
  const [lastDeathSaveRoll, setLastDeathSaveRoll] = useState<number | null>(null);
  const [lastProcessedDeathSaveRollToken, setLastProcessedDeathSaveRollToken] = useState<number | null>(null);
  const { popupState, openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  const hasOverlayOpen =
    isRestPopupOpen ||
    isConditionModalOpen ||
    selectedConditionName !== null;

  useBodyScrollLock(hasOverlayOpen);

  useEffect(() => {
    if (!isEditing) {
      setHpDraft(createHpDraft(character));
      setHpModeDraft(normalizeMaxHitPointsMode(character.maxHitPointsMode));
    }
  }, [character.hitPoints, character.currentHitPoints, character.maxHitPointsMode, isEditing]);

  useEffect(() => {
    if (character.currentHitPoints > 0) {
      setLastDeathSaveRoll(null);
      setLastProcessedDeathSaveRollToken(null);
    }
  }, [character.currentHitPoints]);

  useEffect(() => {
    if (!hasOverlayOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsRestPopupOpen(false);
        setIsConditionModalOpen(false);
        setSelectedConditionName(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasOverlayOpen]);

  const conditions = normalizeConditions(character.conditions);
  const deathSaves = normalizeDeathSaves(character.deathSaves);

  useEffect(() => {
    if (character.currentHitPoints <= 0) {
      return;
    }

    if (deathSaves.successes === 0 && deathSaves.failures === 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      deathSaves: createDefaultDeathSaves()
    }));
  }, [character.currentHitPoints, deathSaves.successes, deathSaves.failures, onPersistCharacter]);

  useEffect(() => {
    if (normalizeMaxHitPointsMode(character.maxHitPointsMode) !== "automatic") {
      return;
    }

    const nextAutomaticMaxHitPoints = getAutomaticMaxHitPointsForCharacter(character);

    if (character.hitPoints === nextAutomaticMaxHitPoints) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (normalizeMaxHitPointsMode(currentCharacter.maxHitPointsMode) !== "automatic") {
        return currentCharacter;
      }

      const automaticHitPoints = getAutomaticMaxHitPointsForCharacter(currentCharacter);

      if (currentCharacter.hitPoints === automaticHitPoints) {
        return currentCharacter;
      }

      const nextCurrentHitPoints = clampNumber(
        currentCharacter.currentHitPoints,
        0,
        automaticHitPoints,
        currentCharacter.currentHitPoints
      );

      return {
        ...currentCharacter,
        hitPoints: automaticHitPoints,
        currentHitPoints: nextCurrentHitPoints,
        deathSaves:
          nextCurrentHitPoints > 0
            ? createDefaultDeathSaves()
            : normalizeDeathSaves(currentCharacter.deathSaves)
      };
    });
  }, [
    character.className,
    character.level,
    character.abilities.CON,
    character.maxHitPointsMode,
    character.hitPoints,
    character.currentHitPoints,
    onPersistCharacter
  ]);

  const hitPointPercent =
    character.hitPoints > 0 ? (character.currentHitPoints / character.hitPoints) * 100 : 0;
  const weaponActions = getWeaponActionsForCharacter(character);
  const shortRestsUsedToday = clampNumber(character.shortRestsUsedToday, 0, 2, 0);
  const shortRestsRemaining = Math.max(0, 2 - shortRestsUsedToday);
  const shortRestHealAmount = Math.ceil(character.hitPoints / 2);
  const isAtZeroHitPoints = character.currentHitPoints === 0;
  const isDeathSaveResolved = deathSaves.successes >= 3 || deathSaves.failures >= 3;
  const selectedCondition = selectedConditionName
    ? conditions.find((condition) => condition.name === selectedConditionName) ?? null
    : null;

  function beginEditing() {
    setHpDraft(createHpDraft(character));
    setHpModeDraft(normalizeMaxHitPointsMode(character.maxHitPointsMode));
    setIsEditing(true);
  }

  function cancelEditing() {
    setHpDraft(createHpDraft(character));
    setHpModeDraft(normalizeMaxHitPointsMode(character.maxHitPointsMode));
    setIsEditing(false);
  }

  function saveHitPoints() {
    const nextMaxHitPoints =
      hpModeDraft === "automatic"
        ? getAutomaticMaxHitPointsForCharacter(character)
        : clampNumber(hpDraft.hitPoints, 1, 999, character.hitPoints);
    const nextCurrentHitPoints = clampNumber(
      hpDraft.currentHitPoints,
      0,
      nextMaxHitPoints,
      character.currentHitPoints
    );

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      hitPoints: nextMaxHitPoints,
      currentHitPoints: nextCurrentHitPoints,
      maxHitPointsMode: hpModeDraft,
      deathSaves: nextCurrentHitPoints > 0 ? createDefaultDeathSaves() : normalizeDeathSaves(currentCharacter.deathSaves)
    }));

    setIsEditing(false);
  }

  function setHitPointMode(nextMode: MaxHitPointsMode) {
    setHpModeDraft(nextMode);

    if (nextMode !== "automatic") {
      return;
    }

    const automaticHitPoints = getAutomaticMaxHitPointsForCharacter(character);

    setHpDraft((currentDraft) => ({
      hitPoints: automaticHitPoints,
      currentHitPoints: clampNumber(
        currentDraft.currentHitPoints,
        0,
        automaticHitPoints,
        currentDraft.currentHitPoints
      )
    }));
  }

  function adjustHitPoints(direction: -1 | 1) {
    const amount = clampNumber(hitPointStep, 0, 999, 0);

    if (amount === 0) {
      setHitPointStep(1);
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCurrentHitPoints = clampNumber(
        currentCharacter.currentHitPoints + amount * direction,
        0,
        currentCharacter.hitPoints,
        currentCharacter.currentHitPoints
      );

      if (nextCurrentHitPoints === currentCharacter.currentHitPoints) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        currentHitPoints: nextCurrentHitPoints,
        deathSaves:
          nextCurrentHitPoints > 0
            ? createDefaultDeathSaves()
            : normalizeDeathSaves(currentCharacter.deathSaves)
      };
    });

    setHitPointStep(1);
  }

  function takeShortRest() {
    if (shortRestsRemaining <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCurrentHitPoints = clampNumber(
        currentCharacter.currentHitPoints + shortRestHealAmount,
        0,
        currentCharacter.hitPoints,
        currentCharacter.currentHitPoints
      );

      return {
        ...currentCharacter,
        currentHitPoints: nextCurrentHitPoints,
        shortRestsUsedToday: shortRestsUsedToday + 1,
        deathSaves: nextCurrentHitPoints > 0 ? createDefaultDeathSaves() : normalizeDeathSaves(currentCharacter.deathSaves)
      };
    });

    setIsRestPopupOpen(false);
  }

  function takeLongRest() {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      currentHitPoints: currentCharacter.hitPoints,
      shortRestsUsedToday: 0,
      spellSlotsExpended: Array.from({ length: 9 }, () => 0),
      deathSaves: createDefaultDeathSaves()
    }));

    setIsRestPopupOpen(false);
  }

  function addCondition() {
    const normalizedName = conditionDraftName.trim();

    if (!normalizedName) {
      return;
    }

    const roundsRemaining = Math.max(1, Math.floor(clampNumber(conditionDraftDuration, 1, 999, 1)));

    onPersistCharacter((currentCharacter) => {
      const normalizedConditions = normalizeConditions(currentCharacter.conditions);
      const existingCondition = normalizedConditions.find((condition) => condition.name === normalizedName);

      if (existingCondition) {
        return {
          ...currentCharacter,
          conditions: normalizedConditions.map((condition) =>
            condition.name === normalizedName
              ? {
                  ...condition,
                  roundsRemaining
                }
              : condition
          )
        };
      }

      return {
        ...currentCharacter,
        conditions: [...normalizedConditions, { name: normalizedName, roundsRemaining }]
      };
    });

    setConditionDraftDuration(1);
    setIsConditionModalOpen(false);
  }

  function removeCondition(conditionName: string) {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      conditions: normalizeConditions(currentCharacter.conditions).filter(
        (condition) => condition.name !== conditionName
      )
    }));

    setSelectedConditionName(null);
  }

  function advanceRoundForConditions() {
    if (conditions.length === 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      conditions: normalizeConditions(currentCharacter.conditions)
        .map((condition) => ({
          ...condition,
          roundsRemaining: condition.roundsRemaining - 1
        }))
        .filter((condition) => condition.roundsRemaining > 0)
    }));
  }

  function updateDeathSaves(track: "success" | "failure") {
    if (!isAtZeroHitPoints || isDeathSaveResolved) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const currentDeathSaves = normalizeDeathSaves(currentCharacter.deathSaves);

      if (track === "success") {
        return {
          ...currentCharacter,
          deathSaves: {
            ...currentDeathSaves,
            successes: Math.min(3, currentDeathSaves.successes + 1)
          }
        };
      }

      return {
        ...currentCharacter,
        deathSaves: {
          ...currentDeathSaves,
          failures: Math.min(3, currentDeathSaves.failures + 1)
        }
      };
    });
  }

  function resetDeathSaves() {
    setLastDeathSaveRoll(null);
    setLastProcessedDeathSaveRollToken(null);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      deathSaves: createDefaultDeathSaves()
    }));
  }

  function rollDeathSave() {
    if (!isAtZeroHitPoints || isDeathSaveResolved) {
      return;
    }

    openDiceRoller({
      title: "Death save",
      formula: "1d20",
      description: "Roll a d20. 10 or higher counts as a success."
    });
  }

  useEffect(() => {
    if (!popupState || popupState.request.title !== "Death save") {
      return;
    }

    if (!popupState.result || popupState.error) {
      return;
    }

    if (lastProcessedDeathSaveRollToken === popupState.rollToken) {
      return;
    }

    const rolledValue = popupState.result.total;

    setLastProcessedDeathSaveRollToken(popupState.rollToken);
    setLastDeathSaveRoll(rolledValue);
    updateDeathSaves(rolledValue >= 10 ? "success" : "failure");
  }, [popupState, lastProcessedDeathSaveRollToken]);

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Gameplay</p>
          <h3 className={shared.subtitle}>Combat dashboard</h3>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <section className={clsx(styles.widgetCard, styles.hpWidget)}>
          <header className={styles.widgetHeader}>
            <p className={styles.widgetTitle}>Hit Points</p>
            {isEditing ? null : (
              <button
                type="button"
                className={clsx(shared.editButton, styles.hpWidgetEditButton)}
                onClick={beginEditing}
              >
                <Pencil size={16} />
                Edit
              </button>
            )}
          </header>

          {isEditing ? (
            <div className={styles.hpEditGrid}>
              <div className={styles.hpModeSwitch} role="tablist" aria-label="Max HP mode">
                <button
                  type="button"
                  className={clsx(
                    styles.hpModeSwitchButton,
                    hpModeDraft === "automatic" && styles.hpModeSwitchButtonActive
                  )}
                  onClick={() => setHitPointMode("automatic")}
                  aria-pressed={hpModeDraft === "automatic"}
                >
                  Automatic
                </button>
                <button
                  type="button"
                  className={clsx(
                    styles.hpModeSwitchButton,
                    hpModeDraft === "custom" && styles.hpModeSwitchButtonActive
                  )}
                  onClick={() => setHitPointMode("custom")}
                  aria-pressed={hpModeDraft === "custom"}
                >
                  Custom
                </button>
              </div>

              <label className={styles.widgetField}>
                <span>Max HP</span>
                <NumberInput
                  min={1}
                  disabled={hpModeDraft === "automatic"}
                  value={hpDraft.hitPoints}
                  onChange={(event) =>
                    setHpDraft((current) => ({
                      ...current,
                      hitPoints: clampNumber(event.target.value, 1, 999, current.hitPoints)
                    }))
                  }
                />
              </label>
              <label className={styles.widgetField}>
                <span>Current HP</span>
                <NumberInput
                  min={0}
                  max={hpDraft.hitPoints}
                  value={hpDraft.currentHitPoints}
                  onChange={(event) =>
                    setHpDraft((current) => ({
                      ...current,
                      currentHitPoints: clampNumber(
                        event.target.value,
                        0,
                        current.hitPoints,
                        current.currentHitPoints
                      )
                    }))
                  }
                />
              </label>
              <div className={styles.hpEditActions}>
                <button type="button" className={shared.saveButton} onClick={saveHitPoints}>
                  <Save size={16} />
                  Save
                </button>
                <button type="button" className={shared.cancelButton} onClick={cancelEditing}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.hpSummary}>
                <strong>
                  {character.currentHitPoints}/{character.hitPoints} HP
                </strong>
                <span>
                  {character.currentHitPoints === 0
                    ? "Unconscious"
                    : character.currentHitPoints <= Math.ceil(character.hitPoints * 0.35)
                      ? "Critical"
                      : "Stable"}
                </span>
              </div>
              <div className={styles.hpActionRow}>
                <div className={styles.hpBarTrack}>
                  <div className={styles.hpBarFill} style={{ width: `${Math.max(0, hitPointPercent)}%` }} />
                </div>
                <div className={styles.hpStepControl}>
                  <NumberInput
                    min={0}
                    className={styles.hpStepInput}
                    value={hitPointStep}
                    onChange={(event) => {
                      const normalizedValue = event.target.value.replace(/^0+(?=\d)/, "");
                      setHitPointStep(clampNumber(normalizedValue, 0, 999, 0));
                    }}
                  />
                  <button
                    type="button"
                    className={clsx(styles.hpActionButton, styles.hpDamage)}
                    onClick={() => adjustHitPoints(-1)}
                    title={`Deal ${hitPointStep} hit points`}
                  >
                    <Sword size={20} />
                  </button>
                  <button
                    type="button"
                    className={clsx(styles.hpActionButton, styles.hpHeal)}
                    onClick={() => adjustHitPoints(1)}
                    title={`Heal ${hitPointStep} hit points`}
                  >
                    <HeartPlus size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <section className={clsx(styles.widgetCard, styles.weaponWidget)}>
          <header className={styles.widgetHeader}>
            <p className={styles.widgetTitle}>Weapon Actions</p>
          </header>
          {weaponActions.length === 0 ? (
            <p className={shared.emptyText}>No weapon actions available. Equip a weapon to roll attacks.</p>
          ) : (
            <div className={styles.weaponActionGrid}>
              {weaponActions.map((action) => (
                <button
                  key={action.name}
                  type="button"
                  className={styles.weaponActionButton}
                  onClick={() =>
                    openDiceRoller({
                      title: `${action.name} attack`,
                      formula: action.rollFormula,
                      description: `${action.ability} ${formatAbilityModifier(action.abilityModifier)} | Proficiency (${action.proficiencyLabel}) ${formatAbilityModifier(action.proficiencyBonus)}`
                    })
                  }
                >
                  <strong>{action.name}</strong>
                  <span className={styles.weaponActionDamageRow}>
                    {getDamageRangeLabel(action.damageFormula, action.totalModifier, action.rollFormula)}
                  </span>
                  <small className={styles.weaponActionBreakdownRow}>
                    {action.ability} {formatSignedValue(action.abilityModifier)} | Prof. (
                    {formatProficiencyLabel(action.proficiencyLabel)}) {formatSignedValue(action.proficiencyBonus)}
                  </small>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className={clsx(styles.widgetCard, styles.conditionsWidget)}>
          <header className={styles.widgetHeader}>
            <p className={styles.widgetTitle}>Conditions</p>
            <button
              type="button"
              className={shared.editButton}
              onClick={() => setIsConditionModalOpen(true)}
            >
              <Plus size={16} />
              Add Condition
            </button>
          </header>

          {conditions.length === 0 ? (
            <p className={shared.emptyText}>No active conditions.</p>
          ) : (
            <ul className={styles.conditionList}>
              {conditions.map((condition) => (
                <li key={condition.name}>
                  <button
                    type="button"
                    className={styles.conditionButton}
                    onClick={() => setSelectedConditionName(condition.name)}
                  >
                    <span>{condition.name}</span>
                    <strong>{condition.roundsRemaining} rnd</strong>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className={styles.advanceRoundButton}
                  onClick={advanceRoundForConditions}
                  title="Advance round"
                  aria-label="Advance round"
                >
                  <FastForward size={16} />
                </button>
              </li>
            </ul>
          )}
        </section>

        <section className={clsx(styles.widgetCard, styles.utilitiesWidget)}>
          <header className={styles.widgetHeader}>
            <p className={styles.widgetTitle}>Utilities</p>
          </header>
          <div className={styles.utilityButtonRow}>
            <button
              type="button"
              className={clsx(shared.editButton, styles.campTriggerButton)}
              onClick={() => setIsRestPopupOpen(true)}
            >
              <Moon size={16} />
              Camp
            </button>
          </div>
        </section>

        {isAtZeroHitPoints ? (
          <section className={clsx(styles.widgetCard, styles.deathWidget)}>
            <header className={clsx(styles.widgetHeader, styles.deathHeaderRow)}>
              <div className={styles.deathHeaderMain}>
                <p className={styles.widgetTitle}>Death Saves</p>
                <div className={styles.deathStateRow}>
                  <Skull size={16} />
                  <strong>
                    {deathSaves.failures >= 3
                      ? "Dead"
                      : deathSaves.successes >= 3
                        ? "Stabilized"
                        : "Make death saves"}
                  </strong>
                </div>
              </div>
              <div className={styles.deathSummaryRow}>
                <span>Successes</span>
                <span>Failures</span>
              </div>
            </header>

            <div className={styles.deathTrackGrid}>
              <div className={styles.deathTrackColumn}>
                <div className={styles.deathDotsRow}>
                  {Array.from({ length: 3 }, (_, index) => (
                    <span
                      key={`success-${index}`}
                      className={clsx(
                        styles.deathDot,
                        index < deathSaves.successes && styles.deathDotSuccess
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.deathTrackColumn}>
                <div className={styles.deathDotsRow}>
                  {Array.from({ length: 3 }, (_, index) => (
                    <span
                      key={`failure-${index}`}
                      className={clsx(
                        styles.deathDot,
                        index < deathSaves.failures && styles.deathDotFailure
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.deathActionRow}>
              <button
                type="button"
                className={clsx(styles.deathActionButton, styles.deathRollButton)}
                disabled={isDeathSaveResolved}
                onClick={rollDeathSave}
              >
                <Dices size={15} />
                Roll d20
              </button>
              <button
                type="button"
                className={styles.deathActionButton}
                disabled={isDeathSaveResolved}
                onClick={() => updateDeathSaves("success")}
              >
                Success
              </button>
              <button
                type="button"
                className={styles.deathActionButton}
                disabled={isDeathSaveResolved}
                onClick={() => updateDeathSaves("failure")}
              >
                Failure
              </button>
              <button type="button" className={styles.deathActionButton} onClick={resetDeathSaves}>
                Reset
              </button>
            </div>
            {lastDeathSaveRoll !== null ? (
              <p className={styles.deathRollResult}>
                Last roll: d20 = {lastDeathSaveRoll} ({lastDeathSaveRoll >= 10 ? "Success" : "Failure"})
              </p>
            ) : null}
          </section>
        ) : null}
      </div>

      {isRestPopupOpen ? (
        <div
          className={sheetStyles.restPopupBackdrop}
          role="presentation"
          onClick={() => setIsRestPopupOpen(false)}
        >
          <section
            className={sheetStyles.restPopupCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rest-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Camp</p>
                <h3 id="rest-popup-title">Choose your rest</h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsRestPopupOpen(false)}
                aria-label="Close rest options"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.restOptionGrid}>
              <button
                type="button"
                className={sheetStyles.restOptionButton}
                onClick={takeShortRest}
                disabled={shortRestsRemaining <= 0}
              >
                <strong>Short rest</strong>
                <small>Heal {shortRestHealAmount} HP (half your max HP).</small>
                <div
                  className={sheetStyles.shortRestDots}
                  aria-label={`${shortRestsRemaining} short rests remaining today`}
                >
                  {Array.from({ length: 2 }, (_, index) => (
                    <span
                      key={index}
                      className={clsx(
                        sheetStyles.shortRestDot,
                        index < shortRestsRemaining && sheetStyles.shortRestDotActive
                      )}
                    />
                  ))}
                </div>
              </button>

              <button type="button" className={sheetStyles.restOptionButton} onClick={takeLongRest}>
                <strong>Long rest</strong>
                <small>Restore full HP and refresh all spell slots.</small>
                <span className={sheetStyles.longRestNote}>Also resets short rests.</span>
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isConditionModalOpen ? (
        <div
          className={sheetStyles.spellManagementBackdrop}
          role="presentation"
          onClick={() => setIsConditionModalOpen(false)}
        >
          <section
            className={sheetStyles.spellManagementModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="condition-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Conditions</p>
                <h3 id="condition-modal-title">Add condition</h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsConditionModalOpen(false)}
                aria-label="Close add condition"
              >
                <X size={18} />
              </button>
            </div>

            <div className={shared.formGrid}>
              <label className={shared.field}>
                <span>Condition</span>
                <SelectInput
                  value={conditionDraftName}
                  onChange={(event) => setConditionDraftName(event.target.value)}
                >
                  {conditionCatalog.map((condition) => (
                    <option key={condition.name} value={condition.name}>
                      {condition.name}
                    </option>
                  ))}
                </SelectInput>
              </label>

              <label className={shared.field}>
                <span>Duration (rounds)</span>
                <NumberInput
                  min={1}
                  value={conditionDraftDuration}
                  onChange={(event) =>
                    setConditionDraftDuration((current) =>
                      clampNumber(event.target.value, 1, 999, current)
                    )
                  }
                />
              </label>
            </div>

            <div className={shared.formActions}>
              <button type="button" className={shared.saveButton} onClick={addCondition}>
                <Plus size={16} />
                Apply condition
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                onClick={() => setIsConditionModalOpen(false)}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedCondition ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedConditionName(null)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="condition-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Condition</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="condition-drawer-title">{selectedCondition.name}</h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>
                  {getConditionDescription(selectedCondition.name)}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedConditionName(null)}
                aria-label="Close condition details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.conditionDrawerFooter}>
              <button
                type="button"
                className={styles.conditionRemoveButton}
                onClick={() => removeCondition(selectedCondition.name)}
              >
                Remove Condition
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {diceRollerPopup}
    </article>
  );
}

export default GameplayForm;
