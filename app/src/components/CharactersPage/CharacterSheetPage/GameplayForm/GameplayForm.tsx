import clsx from "clsx";
import {
  Dices,
  FastForward,
  HeartPlus,
  Infinity as InfinityIcon,
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
import NumberInput from "../../FormInputs/NumberInput";
import SelectInput from "../../FormInputs/SelectInput";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { Character } from "../../../../types";
import {
  advanceCharacterConditions,
  consumeRoundTrackerResource,
  createDefaultRoundTracker,
  INDEFINITE_CONDITION_ROUNDS,
  normalizeCharacterConditions,
  normalizeRoundTracker,
  type RoundTrackerResource
} from "../../../../pages/CharactersPage/combat";
import {
  formatAbilityModifier,
  getAutomaticMaxHitPointsForCharacter,
  getWeaponActionsForCharacter,
  type WeaponAction
} from "../../../../pages/CharactersPage/gameplay";
import type {
  HpDraft,
  PersistCharacterUpdater
} from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./GameplayForm.module.css";
import TemporaryHitPoints from "../TemporaryHitPoints";

type GameplayFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type ConditionEntry = {
  name: string;
  description: string;
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
    description: "You cannot hear and automatically fail checks that rely on hearing."
  },
  {
    name: "Frightened",
    description:
      "You have disadvantage on checks and attacks while the source of fear is in sight, and you cannot willingly move closer to it."
  },
  {
    name: "Grappled",
    description: "Your speed becomes 0, and you cannot benefit from bonuses to speed."
  },
  {
    name: "Incapacitated",
    description: "You cannot take actions or reactions."
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
    description: "You have disadvantage on attack rolls and ability checks."
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

function normalizeTemporaryHitPoints(value: unknown): number {
  return Math.floor(clampNumber(value, 0, 999, 0));
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

function parseDamageFormulaRange(formula: string): { minimum: number; maximum: number } | null {
  const normalizedFormula = formula.replace(/\s+/g, "");

  if (!normalizedFormula) {
    return null;
  }

  const terms = normalizedFormula.match(/[+-]?[^+-]+/g);

  if (!terms || terms.length === 0) {
    return null;
  }

  let minimum = 0;
  let maximum = 0;

  for (const term of terms) {
    const sign = term.startsWith("-") ? -1 : 1;
    const rawTerm = term.replace(/^[+-]/, "");
    const diceMatch = rawTerm.match(/^(\d+)d(\d+)$/i);

    if (diceMatch) {
      const count = Number(diceMatch[1]);
      const sides = Number(diceMatch[2]);

      if (!Number.isFinite(count) || !Number.isFinite(sides) || count <= 0 || sides <= 0) {
        return null;
      }

      if (sign > 0) {
        minimum += count;
        maximum += count * sides;
      } else {
        minimum -= count * sides;
        maximum -= count;
      }

      continue;
    }

    const value = Number(rawTerm);

    if (!Number.isFinite(value)) {
      return null;
    }

    minimum += sign * value;
    maximum += sign * value;
  }

  return { minimum, maximum };
}

function formatDamageExpression(damageLabel: string, modifier: number): string {
  if (modifier === 0) {
    return damageLabel;
  }

  return `${damageLabel} ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
}

function getDamageRangeLabel(
  damageLabel: string,
  modifier: number,
  fullRollFormula: string
): string {
  const parsedRange = parseDamageFormulaRange(fullRollFormula);
  const damageExpression = formatDamageExpression(damageLabel, modifier);

  if (!parsedRange) {
    return `Damage (${damageExpression})`;
  }

  if (parsedRange.minimum === parsedRange.maximum) {
    return `${parsedRange.minimum} Damage (${damageExpression})`;
  }

  return `${parsedRange.minimum}~${parsedRange.maximum} Damage (${damageExpression})`;
}

function hasVisibleWeaponProficiency(action: Pick<WeaponAction, "proficiencyLabel" | "proficiencyBonus">) {
  return action.proficiencyBonus !== 0 && action.proficiencyLabel.trim().length > 0;
}

function getWeaponActionRollDescription(action: WeaponAction): string {
  const segments = [`${action.ability} ${formatAbilityModifier(action.abilityModifier)}`];

  if (hasVisibleWeaponProficiency(action)) {
    segments.push(
      `Proficiency (${formatProficiencyLabel(action.proficiencyLabel)}) ${formatAbilityModifier(action.proficiencyBonus)}`
    );
  }

  if (action.hasVersatileBonus) {
    segments.push("+ Versatile Bonus");
  }

  return segments.join(" | ");
}

function getWeaponActionBreakdown(action: WeaponAction): string {
  const segments = [`${action.ability} ${formatSignedValue(action.abilityModifier)}`];

  if (hasVisibleWeaponProficiency(action)) {
    segments.push(
      `Prof. (${formatProficiencyLabel(action.proficiencyLabel)}) ${formatSignedValue(action.proficiencyBonus)}`
    );
  }

  if (action.hasVersatileBonus) {
    segments.push("+ Versatile Bonus");
  }

  return segments.join(" | ");
}

function getConditionDescription(name: string): string {
  const condition = conditionCatalog.find((entry) => entry.name === name);

  if (!condition) {
    return "Temporary state affecting the character until its duration ends or it is removed.";
  }

  return condition.description;
}

function getRoundTrackerResourceMeta(
  resource: RoundTrackerResource,
  isAvailable: boolean
): {
  title: string;
  description: string;
  useLabel: string;
  resetLabel: string;
} {
  if (resource === "action") {
    return {
      title: "Action",
      description: isAvailable
        ? "Your main action is ready for this round. Weapon attacks and most spells will spend it automatically."
        : "Your main action has already been spent this round. Reset it here if you need to correct the tracker manually.",
      useLabel: "Use Action",
      resetLabel: "Reset Action"
    };
  }

  return {
    title: "Bonus Action",
    description: isAvailable
      ? "Your bonus action is ready for this round. Bonus-action spells and similar abilities will spend it automatically."
      : "Your bonus action has already been spent this round. Reset it here if you need to correct the tracker manually.",
    useLabel: "Use Bonus Action",
    resetLabel: "Reset Bonus Action"
  };
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
  const [conditionDraftName, setConditionDraftName] = useState(
    conditionCatalog[0]?.name ?? "Poisoned"
  );
  const [conditionDraftDuration, setConditionDraftDuration] = useState(1);
  const [selectedConditionName, setSelectedConditionName] = useState<string | null>(null);
  const [selectedRoundTrackerResource, setSelectedRoundTrackerResource] =
    useState<RoundTrackerResource | null>(null);
  const [lastDeathSaveRoll, setLastDeathSaveRoll] = useState<number | null>(null);
  const [lastProcessedDeathSaveRollToken, setLastProcessedDeathSaveRollToken] = useState<
    number | null
  >(null);
  const { popupState, openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  const hasOverlayOpen =
    isRestPopupOpen ||
    isConditionModalOpen ||
    selectedConditionName !== null ||
    selectedRoundTrackerResource !== null;

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
        setSelectedRoundTrackerResource(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasOverlayOpen]);

  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const conditions = normalizeCharacterConditions(character.conditions);
  const deathSaves = normalizeDeathSaves(character.deathSaves);
  const temporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);

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

  const currentHitPointPercent =
    character.hitPoints > 0 ? (character.currentHitPoints / character.hitPoints) * 100 : 0;
  const temporaryHitPointPercent =
    character.hitPoints > 0 ? (temporaryHitPoints / character.hitPoints) * 100 : 0;
  const temporaryHitPointOverflow =
    character.currentHitPoints + temporaryHitPoints > character.hitPoints;
  const weaponActions = getWeaponActionsForCharacter(character);
  const shortRestsUsedToday = clampNumber(character.shortRestsUsedToday, 0, 2, 0);
  const shortRestsRemaining = Math.max(0, 2 - shortRestsUsedToday);
  const shortRestHealAmount = Math.ceil(character.hitPoints / 2);
  const isAtZeroHitPoints = character.currentHitPoints === 0;
  const isDeathSaveResolved = deathSaves.successes >= 3 || deathSaves.failures >= 3;
  const selectedCondition = selectedConditionName
    ? (conditions.find((condition) => condition.name === selectedConditionName) ?? null)
    : null;
  const selectedRoundTrackerMeta = selectedRoundTrackerResource
    ? getRoundTrackerResourceMeta(
        selectedRoundTrackerResource,
        selectedRoundTrackerResource === "action"
          ? roundTracker.actionAvailable
          : roundTracker.bonusActionAvailable
      )
    : null;

  useEffect(() => {
    if (!selectedConditionName) {
      return;
    }

    if (selectedCondition) {
      return;
    }

    setSelectedConditionName(null);
  }, [selectedCondition, selectedConditionName]);

  function updateRoundTracker(resource: RoundTrackerResource) {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      roundTracker: consumeRoundTrackerResource(currentCharacter.roundTracker, resource)
    }));
  }

  function resetRoundTrackerResource(resource: RoundTrackerResource) {
    onPersistCharacter((currentCharacter) => {
      const currentRoundTracker = normalizeRoundTracker(currentCharacter.roundTracker);

      return {
        ...currentCharacter,
        roundTracker:
          resource === "action"
            ? {
                ...currentRoundTracker,
                actionAvailable: true
              }
            : {
                ...currentRoundTracker,
                bonusActionAvailable: true
              }
      };
    });
  }

  function consumeRoundTrackerFromDrawer(resource: RoundTrackerResource) {
    updateRoundTracker(resource);
    setSelectedRoundTrackerResource(null);
  }

  function handleResetRoundTrackerResource(resource: RoundTrackerResource) {
    resetRoundTrackerResource(resource);
    setSelectedRoundTrackerResource(null);
  }

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
      deathSaves:
        nextCurrentHitPoints > 0
          ? createDefaultDeathSaves()
          : normalizeDeathSaves(currentCharacter.deathSaves)
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
      if (direction > 0) {
        const nextCurrentHitPoints = clampNumber(
          currentCharacter.currentHitPoints + amount,
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
      }

      const currentTemporaryHitPoints = normalizeTemporaryHitPoints(
        currentCharacter.temporaryHitPoints
      );
      const absorbedByTemporaryHitPoints = Math.min(amount, currentTemporaryHitPoints);
      const nextTemporaryHitPoints = currentTemporaryHitPoints - absorbedByTemporaryHitPoints;
      const remainingDamage = amount - absorbedByTemporaryHitPoints;
      const nextCurrentHitPoints = clampNumber(
        currentCharacter.currentHitPoints - remainingDamage,
        0,
        currentCharacter.hitPoints,
        currentCharacter.currentHitPoints
      );

      if (
        nextTemporaryHitPoints === currentTemporaryHitPoints &&
        nextCurrentHitPoints === currentCharacter.currentHitPoints
      ) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        temporaryHitPoints: nextTemporaryHitPoints,
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
        temporaryHitPoints: 0,
        shortRestsUsedToday: shortRestsUsedToday + 1,
        roundTracker: createDefaultRoundTracker(),
        deathSaves:
          nextCurrentHitPoints > 0
            ? createDefaultDeathSaves()
            : normalizeDeathSaves(currentCharacter.deathSaves)
      };
    });

    setIsRestPopupOpen(false);
  }

  function takeLongRest() {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      currentHitPoints: currentCharacter.hitPoints,
      temporaryHitPoints: 0,
      shortRestsUsedToday: 0,
      spellSlotsExpended: Array.from({ length: 9 }, () => 0),
      roundTracker: createDefaultRoundTracker(),
      deathSaves: createDefaultDeathSaves()
    }));

    setIsRestPopupOpen(false);
  }

  function addCondition() {
    const normalizedName = conditionDraftName.trim();

    if (!normalizedName) {
      return;
    }

    const roundsRemaining =
      conditionDraftDuration === 0
        ? INDEFINITE_CONDITION_ROUNDS
        : Math.max(1, Math.floor(clampNumber(conditionDraftDuration, 1, 999, 1)));

    onPersistCharacter((currentCharacter) => {
      const normalizedConditions = normalizeCharacterConditions(currentCharacter.conditions);
      const existingCondition = normalizedConditions.find(
        (condition) => condition.name === normalizedName
      );

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
      conditions: normalizeCharacterConditions(currentCharacter.conditions).filter(
        (condition) => condition.name !== conditionName
      )
    }));

    setSelectedConditionName(null);
  }

  function finishRound() {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      roundTracker: createDefaultRoundTracker(),
      conditions: advanceCharacterConditions(currentCharacter.conditions)
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
                <div className={styles.hpValueRow}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <strong>
                        {character.currentHitPoints}/{character.hitPoints} HP
                      </strong>
                      <TemporaryHitPoints
                        temporaryHitPoints={temporaryHitPoints}
                        onPersistCharacter={onPersistCharacter}
                      />
                    </div>

                    <span>
                      {character.currentHitPoints === 0
                        ? "Unconscious"
                        : character.currentHitPoints <= Math.ceil(character.hitPoints * 0.35)
                          ? "Critical"
                          : "Stable"}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.hpActionRow}>
                <div className={styles.hpBarTrack}>
                  <div className={styles.hpBarMeter}>
                    <div
                      className={styles.hpBarFill}
                      style={{ width: `${Math.max(0, currentHitPointPercent)}%` }}
                    />
                    {temporaryHitPointPercent > 0 ? (
                      <div
                        className={clsx(
                          styles.hpBarTempFill,
                          temporaryHitPointOverflow && styles.tempOverflow
                        )}
                        style={{ width: `${temporaryHitPointPercent}%` }}
                      />
                    ) : null}
                  </div>
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
            <p className={shared.emptyText}>
              No weapon actions available. Equip a weapon to roll attacks.
            </p>
          ) : (
            <div className={styles.weaponActionGrid}>
              {weaponActions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  className={styles.weaponActionButton}
                  onClick={() => {
                    openDiceRoller({
                      title: `${action.name} attack`,
                      formula: action.rollFormula,
                      description: getWeaponActionRollDescription(action)
                    });
                    updateRoundTracker("action");
                  }}
                >
                  <strong>{action.name}</strong>
                  <span className={styles.weaponActionDamageRow}>
                    {getDamageRangeLabel(
                      action.damageLabel,
                      action.totalModifier,
                      action.rollFormula
                    )}
                  </span>
                  <small className={styles.weaponActionBreakdownRow}>
                    {getWeaponActionBreakdown(action)}
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
                    <strong className={styles.conditionDuration}>
                      <span>(</span>
                      {condition.roundsRemaining === INDEFINITE_CONDITION_ROUNDS ? (
                        <InfinityIcon size={13} strokeWidth={2.2} aria-hidden="true" />
                      ) : (
                        condition.roundsRemaining
                      )}
                      <span>)</span>
                    </strong>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={clsx(styles.widgetCard, styles.utilitiesWidget)}>
          <header className={styles.widgetHeader}>
            <p className={styles.widgetTitle}>Utilities</p>
          </header>
          <div className={styles.utilityStack}>
            <div className={styles.roundTrackerPill} aria-label="Round tracker">
              <button
                type="button"
                className={styles.roundTrackerPillButton}
                onClick={() => setSelectedRoundTrackerResource("action")}
                aria-label={roundTracker.actionAvailable ? "Action available" : "Action spent"}
                title={roundTracker.actionAvailable ? "Action available" : "Action spent"}
              >
                <span
                  className={clsx(
                    styles.roundTrackerCircle,
                    roundTracker.actionAvailable && styles.roundTrackerCircleFilled
                  )}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className={styles.roundTrackerPillButton}
                onClick={() => setSelectedRoundTrackerResource("bonusAction")}
                aria-label={
                  roundTracker.bonusActionAvailable
                    ? "Bonus action available"
                    : "Bonus action spent"
                }
                title={
                  roundTracker.bonusActionAvailable
                    ? "Bonus action available"
                    : "Bonus action spent"
                }
              >
                <span
                  className={clsx(
                    styles.roundTrackerTriangle,
                    roundTracker.bonusActionAvailable && styles.roundTrackerTriangleFilled
                  )}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className={styles.roundTrackerPillButton}
                onClick={finishRound}
                aria-label="Finish round"
                title="Finish round"
              >
                <FastForward size={15} aria-hidden="true" />
              </button>
            </div>

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
                Last roll: d20 = {lastDeathSaveRoll} (
                {lastDeathSaveRoll >= 10 ? "Success" : "Failure"})
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
                  min={0}
                  value={conditionDraftDuration}
                  onChange={(event) =>
                    setConditionDraftDuration((current) =>
                      clampNumber(event.target.value, 0, 999, current)
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

      {selectedRoundTrackerResource && selectedRoundTrackerMeta ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedRoundTrackerResource(null)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="round-tracker-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Round Tracker</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="round-tracker-drawer-title">{selectedRoundTrackerMeta.title}</h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>
                  {selectedRoundTrackerMeta.description}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedRoundTrackerResource(null)}
                aria-label="Close round tracker details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.roundTrackerDrawerActions}>
              <button
                type="button"
                className={shared.saveButton}
                onClick={() => consumeRoundTrackerFromDrawer(selectedRoundTrackerResource)}
              >
                {selectedRoundTrackerMeta.useLabel}
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                onClick={() => handleResetRoundTrackerResource(selectedRoundTrackerResource)}
              >
                {selectedRoundTrackerMeta.resetLabel}
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
