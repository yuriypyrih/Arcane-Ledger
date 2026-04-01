import clsx from "clsx";
import { BookOpen, Flame, Minus, Plus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CellContainer from "../../../../CellContainer/CellContainer";
import { useDiceRollerPopup } from "../../../../DicePage/DiceRollerPopup";
import SpellListRow from "../../../../SpellListRow";
import KeywordReferenceDrawer from "../../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import CharacterSpellDrawer from "../../SpellCastingForm/CharacterSpellDrawer";
import ActionShape from "../../../../ActionShape";
import RollStatePill from "../../../../RollStatePill/RollStatePill";
import type { Character, AbilityKey } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { abilityKeys } from "../../../../../pages/CharactersPage/constants";
import {
  activateFeatureActionForCharacter,
  activateFeatureActionOptionForCharacter,
  activateArcaneRecoveryForCharacter,
  applyMantleOfMajestyStatusForCharacter,
  applyLayOnHandsForCharacter,
  consumeBeguilingMagicOrBardicInspirationForCharacter,
  consumeMantleOfMajestyUseForCharacter,
  consumeContactPatronUseForCharacter,
  consumeMysticArcanumUseForCharacter,
  createSpellSlotFromSorceryPointsForCharacter,
  consumeFaithfulSteedUseForCharacter,
  consumePaladinsSmiteUseForCharacter,
  consumeRangerFavoredEnemyUseForCharacter,
  consumeRangerTirelessUseForCharacter,
  consumeBarbarianWarriorOfTheGodsChargesForCharacter,
  convertSpellSlotToSorceryPointsForCharacter,
  consumeNonMagicActionForCharacter,
  consumeWeaponAttackActionForCharacter,
  getBardicInspirationDieForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  getBeguilingMagicUsesRemainingForCharacter,
  getBeguilingMagicUsesTotalForCharacter,
  getMantleOfMajestyFallbackSlotLevelForCharacter,
  getMantleOfMajestyUsesRemainingForCharacter,
  getSorcererMetamagicActionCostForCharacter,
  getSorcererMetamagicSelectionLimitForActionForCharacter,
  getSorceryPointsRemainingForCharacter,
  getLayOnHandsCurableConditionsForCharacter,
  getPaladinHealingPoolRemainingForCharacter,
  getSpellEntryForCharacter,
  getSpellcastingStateForCharacter,
  getWarlockMysticArcanumSelectionsForCharacter,
  hasActivePaladinAuraOfProtectionForCharacter,
  hasSorcererArcaneApotheosisFreeMetamagicAvailableForCharacter,
  markFeatureWeaponBonusUseForCharacter,
  spendSorcererMetamagicOptionsForCharacter,
  getNonMagicActionEconomyMultiForCharacter,
  type FeatureActionCard,
  type FeatureActionExecuteConfig,
  type FeatureActionOptionCard
} from "../../../../../pages/CharactersPage/classFeatures";
import {
  divineInterventionActionKey,
  getClericDivineInterventionEnabledLevels,
  getClericDivineInterventionSpellEntries
} from "../../../../../pages/CharactersPage/classFeatures/cleric";
import {
  activateBarbarianRage,
  activateBarbarianWildHeartRage,
  barbarianBrutalStrikeActionKey,
  barbarianRageActionKey,
  barbarianWarriorOfTheGodsActionKey,
  getBarbarianBrutalStrikeDamageFormula,
  getBarbarianBrutalStrikeSelectionLimit,
  getBarbarianRageOfTheGodsUsesRemaining,
  getBarbarianRageOfTheGodsUsesTotal,
  getBarbarianPowerOfTheWildsOptions
} from "../../../../../pages/CharactersPage/classFeatures/barbarian";
import {
  fighterIndomitableActionKey,
  fighterSecondWindActionKey,
  fighterTacticalMindActionKey,
  getFighterSecondWindHealingFormula
} from "../../../../../pages/CharactersPage/classFeatures/fighter";
import { type LayOnHandsCondition } from "../../../../../pages/CharactersPage/classFeatures/paladin";
import {
  getRangerTirelessTemporaryHitPointsFormula
} from "../../../../../pages/CharactersPage/classFeatures/ranger";
import {
  metamagicActionKey
} from "../../../../../pages/CharactersPage/classFeatures/sorcerer";
import { type MysticArcanumLevel } from "../../../../../pages/CharactersPage/classFeatures/warlock";
import {
  type ArcaneRecoverySelection,
  getArcaneRecoveryRecoveryLevelLimit
} from "../../../../../pages/CharactersPage/classFeatures/wizard";
import {
  getRogueSneakAttackEffectDefinitions,
  getRogueSneakAttackEffectDiceCost,
  getRogueSneakAttackFormula,
  getRogueSneakAttackMaxEffects,
  getRogueSneakAttackValueLabel,
  type RogueSneakAttackEffectDefinition,
  type RogueSneakAttackEffectKey
} from "../../../../../pages/CharactersPage/classFeatures/rogue";
import {
  getCombatActionsForCharacter,
  type GameplayActionDefinition
} from "../../../../../pages/CharactersPage/combatActions";
import { normalizeRoundTracker } from "../../../../../pages/CharactersPage/combat";
import { getRoundTrackerResourceForEconomyType } from "../../../../../pages/CharactersPage/actionEconomy";
import { getAbilityScoresForCharacter } from "../../../../../pages/CharactersPage/abilities";
import {
  formatAbilityModifier,
  getAbilityModifier,
  getProficiencyBonus,
  type WeaponAction
} from "../../../../../pages/CharactersPage/gameplay";
import {
  applySpellConcentrationToStatusEntries,
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../../../pages/CharactersPage/traits";
import { rollFormulaWithDice } from "../../../../../utils/dice";
import {
  createDefaultDeathSaves,
  consumeRoundTrackerResourceForCharacter,
  normalizeDeathSaves,
  prepareCharacterForRoundTrackerResourceConsumption,
  swapTemporaryHitPointsAssignment
} from "../gameplayStateUtils";
import { getSpellOutcomeSummaryForCharacter } from "../../../../../pages/CharactersPage/spellOutcome";
import { formatFeatureActionOptionValueLabel } from "../../../../../pages/CharactersPage/actionOutcome";
import { parseRollFormulaRange } from "../../../../../pages/CharactersPage/actionOutcome";
import {
  getSavingThrowLevelFromEntries,
  getSavingThrowProficiencyForAbilityKey
} from "../../../../../pages/CharactersPage/proficiency";
import {
  ACTION_TYPE,
  ENTRY_CATEGORIES,
  MAGIC_SCHOOL,
  getSpellEntryById,
  type SpellEntry,
  type WeaponEntry
} from "../../../../../codex/entries";
import { getWeaponEntries } from "../../../../../codex/selectors";
import {
  formatSignedLabel,
  getProficiencyMultiplier,
  getRoundTrackerResourceForSpell
} from "../../../../../pages/CharactersPage/shared";
import {
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../../../../pages/CharactersPage/spellcasting";
import {
  getResolvedCustomLoadoutEntries,
  type ResolvedCustomWeaponEntry
} from "../../../../../pages/CharactersPage/customEquipment";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import widgetShellStyles from "../GameplayWidgetShared.module.css";
import {
  getActionShapeForEconomyType,
  getEconomyShapeState,
  getRoundTrackerActionWarning
} from "../gameplayWidgetUtils";
import { resolveFeatureIndicators } from "../../../../RollStatePill/rollState";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import d20Icon from "../../../../../assets/svg/d20.svg";
import {
  formatCodexLabel,
  formatWeaponProperties,
  formatWeaponType
} from "../../../../../utils/codex";
import styles from "./ActionsWidget.module.css";
import sharedModalStyles from "./FeatureActionModal.module.css";
import arcaneRecoveryStyles from "./ArcaneRecoveryModal.module.css";
import indomitableStyles from "./IndomitableModal.module.css";
import layOnHandsStyles from "./LayOnHandsModal.module.css";
import fontOfMagicStyles from "./FontOfMagicModal.module.css";
import sneakAttackStyles from "./SneakAttackModal.module.css";
import divineStyles from "./DivineInterventionModal.module.css";
import GameplayActionDrawer from "./GameplayActionDrawer";
import DiceRollerSettingsButton from "./DiceRollerSettingsButton";
import {
  FeatureActionCardButton,
  FeatureActionChoiceRow,
  FeatureActionOptionButton,
  WeaponActionCard
} from "./ActionCards";

type RoundTrackerAvailability = {
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

type ActionsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

type IndomitableOption = {
  ability: AbilityKey;
  total: number;
  formula: string;
  formulaDisplay: string;
};

type WeaponFormulaPresentation = {
  label: string;
  value: string;
  breakdown?: string;
};

type WeaponDrawerDetail = {
  label: string;
  value: string;
};

type FontOfMagicSelection =
  | {
      kind: "slot-to-points";
      spellSlotLevel: number;
    }
  | {
      kind: "points-to-slot";
      spellSlotLevel: number;
    };

const codexWeaponEntriesByName = new Map<string, WeaponEntry>(
  getWeaponEntries().map((entry) => [entry.name, entry])
);

function appendRollModifier(baseFormula: string, modifier: number) {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula}${modifier > 0 ? "+" : ""}${modifier}`;
}

function formatWeaponProficiencyLabel(label: string) {
  return label
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function stripAppendedWeaponBonusExpression(
  baseExpression: string,
  action: WeaponAction,
  getSuffix: (entry: WeaponAction["damageBonusEntries"][number]) => string | null
) {
  return [...action.damageBonusEntries].reverse().reduce((expression, entry) => {
    const suffix = getSuffix(entry);

    if (!suffix) {
      return expression;
    }

    const normalizedSuffix = ` + ${suffix}`;

    return expression.endsWith(normalizedSuffix)
      ? expression.slice(0, -normalizedSuffix.length)
      : expression;
  }, baseExpression);
}

function joinWeaponFormulaTerms(terms: string[]) {
  const normalizedTerms = terms.map((term) => term.trim()).filter(Boolean);

  if (normalizedTerms.length === 0) {
    return "0";
  }

  return normalizedTerms.slice(1).reduce((expression, term) => {
    if (term.startsWith("-")) {
      return `${expression} - ${term.slice(1).trim()}`;
    }

    return `${expression} + ${term.replace(/^\+/, "").trim()}`;
  }, normalizedTerms[0]);
}

function joinWeaponBreakdownEntries(entries: string[]) {
  const normalizedEntries = entries.map((entry) => entry.trim()).filter(Boolean);

  if (normalizedEntries.length === 0) {
    return "";
  }

  return normalizedEntries.slice(1).reduce((text, entry) => {
    if (entry.startsWith("-")) {
      return `${text} - ${entry.slice(1).trim()}`;
    }

    return `${text} + ${entry.replace(/^\+/, "").trim()}`;
  }, normalizedEntries[0]);
}

type ParsedDamageDisplay = {
  expression: string;
  damageType: string | null;
};

type DamageDisplayGroup = {
  damageType: string | null;
  diceTerms: string[];
  numericTotal: number;
  preferNumericFirst?: boolean;
};

function parseDamageDisplay(label: string): ParsedDamageDisplay {
  const normalizedLabel = label.trim();
  const match = normalizedLabel.match(/^(.*?)(?:\s+([A-Za-z]+(?:\/[A-Za-z]+)*))$/);

  if (!match) {
    return {
      expression: normalizedLabel,
      damageType: null
    };
  }

  return {
    expression: match[1].trim(),
    damageType: match[2]?.trim() ?? null
  };
}

function splitFormulaTerms(expression: string): string[] {
  return expression
    .split("+")
    .map((term) => term.trim())
    .filter(Boolean);
}

function addExpressionToDamageGroup(group: DamageDisplayGroup, expression: string) {
  splitFormulaTerms(expression).forEach((term) => {
    if (/^\d+d\d+$/i.test(term)) {
      group.diceTerms.push(term);
      return;
    }

    const numericValue = Number(term);

    if (Number.isFinite(numericValue)) {
      group.numericTotal += numericValue;
      return;
    }

    group.diceTerms.push(term);
  });
}

function formatDamageGroup(
  group: DamageDisplayGroup,
  options?: {
    wrapMultiTermWithDamageType?: boolean;
  }
): string {
  const renderedTerms =
    group.preferNumericFirst && group.numericTotal !== 0
      ? [`${group.numericTotal}`, ...group.diceTerms]
      : [
          ...group.diceTerms,
          ...(group.numericTotal !== 0 || group.diceTerms.length === 0 ? [`${group.numericTotal}`] : [])
        ];

  if (!group.damageType) {
    return joinWeaponFormulaTerms(renderedTerms);
  }

  if (group.preferNumericFirst) {
    const [firstTerm, ...remainingTerms] = renderedTerms;

    return remainingTerms.length > 0
      ? `${firstTerm} ${group.damageType} + ${joinWeaponFormulaTerms(remainingTerms)}`
      : `${firstTerm} ${group.damageType}`;
  }

  const [firstTerm, ...remainingTerms] = renderedTerms;

  if (options?.wrapMultiTermWithDamageType && remainingTerms.length > 0) {
    return `(${joinWeaponFormulaTerms(renderedTerms)}) ${group.damageType}`;
  }

  return remainingTerms.length > 0
    ? `${firstTerm} ${group.damageType} + ${joinWeaponFormulaTerms(remainingTerms)}`
    : `${firstTerm} ${group.damageType}`;
}

function formatMainDamageTerms(group: DamageDisplayGroup): {
  leadingTerms: string[];
  trailingNumericTerm: string | null;
} {
  if (group.preferNumericFirst) {
    const primaryValue = group.damageType
      ? `${group.numericTotal} ${group.damageType}`
      : `${group.numericTotal}`;

    return {
      leadingTerms: [primaryValue, ...group.diceTerms],
      trailingNumericTerm: null
    };
  }

  const leadingTerms: string[] = [];

  if (group.diceTerms.length > 0) {
    const [firstDie, ...remainingDice] = group.diceTerms;
    leadingTerms.push(group.damageType ? `${firstDie} ${group.damageType}` : firstDie);
    leadingTerms.push(...remainingDice);
  }

  return {
    leadingTerms,
    trailingNumericTerm:
      group.numericTotal !== 0 || leadingTerms.length === 0 ? `${group.numericTotal}` : null
  };
}

function formatWeaponDamageBonusEntry(entry: WeaponAction["damageBonusEntries"][number]) {
  if (typeof entry.value === "number") {
    return entry.value < 0
      ? `-${Math.abs(entry.value)} ${entry.label}`
      : `${entry.value} ${entry.label}`;
  }

  if (entry.displayLabel) {
    return entry.displayLabel;
  }

  if (entry.formula) {
    return `${entry.label} (${entry.formula})`;
  }

  return entry.label;
}

function formatWeaponRangePrefix(formula: string) {
  const parsedRange = parseRollFormulaRange(formula);

  if (!parsedRange) {
    return "Damage";
  }

  if (parsedRange.minimum === parsedRange.maximum) {
    return `${parsedRange.minimum} Damage`;
  }

  return `${parsedRange.minimum}~${parsedRange.maximum} Damage`;
}

function getWeaponAttackFormulaPresentation(action: WeaponAction): WeaponFormulaPresentation {
  const attackModifier = action.abilityModifier + action.proficiencyBonus;
  const breakdownEntries = [`${formatAbilityModifier(action.abilityModifier)} ${action.ability}`];

  if (action.proficiencyBonus !== 0 && action.proficiencyLabel.trim().length > 0) {
    breakdownEntries.push(
      `${Math.abs(action.proficiencyBonus)} Prof (${formatWeaponProficiencyLabel(action.proficiencyLabel)})`
    );
  }

  return {
    label: "Attack Roll Formula",
    value: joinWeaponFormulaTerms(["d20", `${attackModifier}`]),
    breakdown: `[= ${joinWeaponBreakdownEntries(breakdownEntries)}]`
  };
}

function getWeaponDamageFormulaPresentation(action: WeaponAction): WeaponFormulaPresentation {
  const damageAbility = action.damageAbility ?? action.ability;
  const damageAbilityModifier = action.damageAbilityModifier ?? action.abilityModifier;
  const baseDamageLabel = stripAppendedWeaponBonusExpression(
    action.damageLabel,
    action,
    (entry) => entry.displayLabel ?? entry.formula ?? null
  );
  const parsedBaseDamage = parseDamageDisplay(baseDamageLabel);
  const mainDamageGroup: DamageDisplayGroup = {
    damageType: parsedBaseDamage.damageType,
    diceTerms: [],
    numericTotal: 0
  };
  const typedBonusGroups = new Map<string, DamageDisplayGroup>();
  const breakdownEntries: string[] = [];

  addExpressionToDamageGroup(mainDamageGroup, parsedBaseDamage.expression);
  mainDamageGroup.preferNumericFirst =
    mainDamageGroup.diceTerms.length === 0 && mainDamageGroup.numericTotal !== 0;

  if (damageAbilityModifier !== 0) {
    mainDamageGroup.numericTotal += damageAbilityModifier;
    breakdownEntries.push(`${formatAbilityModifier(damageAbilityModifier)} ${damageAbility}`);
  }

  action.damageBonusEntries.forEach((entry) => {
    if (entry.value !== undefined) {
      mainDamageGroup.numericTotal += entry.value;

      if (entry.value !== 0) {
        breakdownEntries.push(formatWeaponDamageBonusEntry(entry));
      }

      return;
    }

    const parsedBonusDamage = parseDamageDisplay(entry.displayLabel ?? entry.formula ?? "");

    if (!parsedBonusDamage.expression) {
      return;
    }

    if (
      !parsedBonusDamage.damageType ||
      parsedBonusDamage.damageType === mainDamageGroup.damageType
    ) {
      addExpressionToDamageGroup(mainDamageGroup, parsedBonusDamage.expression);
      return;
    }

    const existingGroup = typedBonusGroups.get(parsedBonusDamage.damageType) ?? {
      damageType: parsedBonusDamage.damageType,
      diceTerms: [],
      numericTotal: 0
    };

    addExpressionToDamageGroup(existingGroup, parsedBonusDamage.expression);
    typedBonusGroups.set(parsedBonusDamage.damageType, existingGroup);
  });

  const damageFormula = appendRollModifier(action.damageFormula, damageAbilityModifier);
  const { leadingTerms: mainLeadingTerms, trailingNumericTerm: mainTrailingNumericTerm } =
    formatMainDamageTerms(mainDamageGroup);
  const visibleTerms = [
    ...mainLeadingTerms,
    ...[...typedBonusGroups.values()].map((group) =>
      formatDamageGroup(group, { wrapMultiTermWithDamageType: true })
    ),
    ...(mainTrailingNumericTerm ? [mainTrailingNumericTerm] : [])
  ].filter(Boolean);

  return {
    label: "Damage Roll Formula",
    value: `${formatWeaponRangePrefix(damageFormula)} = ${joinWeaponFormulaTerms(visibleTerms)}`,
    breakdown:
      breakdownEntries.length > 0 ? `[= ${joinWeaponBreakdownEntries(breakdownEntries)}]` : undefined
  };
}

function getWeaponDrawerDetails(
  action: WeaponAction,
  weaponEntry:
    | (Pick<WeaponEntry, "type" | "properties" | "range" | "versatileDamage" | "propertyNotes"> & {
        mastery?: WeaponEntry["mastery"];
      })
    | null
): WeaponDrawerDetail[] {
  if (!weaponEntry) {
    return [
      {
        label: "Type",
        value: action.attackKind === "unarmed" ? "Unarmed strike" : "Weapon"
      },
      {
        label: "Properties",
        value: "None"
      },
      {
        label: "Mastery",
        value: "None"
      }
    ];
  }

  return [
    {
      label: "Type",
      value: formatWeaponType(weaponEntry.type)
    },
    {
      label: "Properties",
      value: formatWeaponProperties(weaponEntry)
    },
    {
      label: "Mastery",
      value: weaponEntry.mastery ? formatCodexLabel(weaponEntry.mastery) : "None"
    }
  ];
}

function createContactPatronSpellEntry(spell: SpellEntry): SpellEntry {
  return {
    ...spell,
    description: [
      "<strong>Contact Patron.</strong> You mentally contact your patron directly. This casting doesn't expend a spell slot, and you automatically succeed on the DC 15 Intelligence saving throw.",
      ...spell.description.slice(1)
    ]
  };
}

function getDivineInterventionLevelGroups(spells: SpellEntry[]): Record<number, SpellEntry[]> {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce<Record<number, SpellEntry[]>>((groups, level) => {
    groups[level] = spells
      .filter((spell) => getSpellLevel(spell) === level)
      .sort((left, right) => left.name.localeCompare(right.name));

    return groups;
  }, {});
}

function getEconomyLabel(economyType: GameplayActionDefinition["economyType"]) {
  switch (economyType) {
    case "action":
      return ACTION_TYPE.ACTION;
    case "bonus_action":
      return ACTION_TYPE.BONUS_ACTION;
    case "reaction":
      return ACTION_TYPE.REACTION;
    case "non_combat":
      return "Non-Combat";
    case "free":
    default:
      return "Free";
  }
}

function getActionCategoryLabel(category: GameplayActionDefinition["actionCategory"]) {
  switch (category) {
    case "attack":
      return "Attack";
    case "magic":
      return "Magic";
    case "interaction":
      return "Interaction";
    case "utility":
      return "Utility";
    case "feature":
    default:
      return "Feature";
  }
}

function getSelectedActionRoundTrackerWarning(
  action: GameplayActionDefinition | null,
  roundTracker: RoundTrackerAvailability
) {
  if (!action) {
    return null;
  }

  if (action.kind === "feature" && action.action.ignoreEconomyAvailability) {
    return null;
  }

  return getRoundTrackerActionWarning(
    getRoundTrackerResourceForEconomyType(action.economyType),
    roundTracker
  );
}

function getFixedSpellEntryForExecute(
  character: Character,
  execute: Extract<FeatureActionExecuteConfig, { kind: "spell" }>
): SpellEntry | null {
  if (!execute.spellId) {
    return null;
  }

  const spell = getSpellEntryById(execute.spellId);

  if (!spell) {
    return null;
  }

  const transformedSpell = getSpellEntryForCharacter(character, spell);

  if (execute.effectKind === "contact-patron") {
    return createContactPatronSpellEntry(transformedSpell);
  }

  if (execute.effectKind === "mantle-of-majesty") {
    return {
      ...transformedSpell,
      castingTime: [ACTION_TYPE.BONUS_ACTION]
    };
  }

  return transformedSpell;
}

function FeatureOptionsActionBody({
  action,
  character,
  roundTracker,
  selectedOptionKeys,
  onToggleOption
}: {
  action: Extract<GameplayActionDefinition, { kind: "feature" }>;
  character: Character;
  roundTracker: RoundTrackerAvailability;
  selectedOptionKeys: string[];
  onToggleOption: (option: FeatureActionOptionCard) => void;
}) {
  const drawer = action.drawer.kind === "options" ? action.drawer : null;
  const selection = drawer?.selection ?? "single-immediate";
  const options = drawer?.options ?? [];
  const selectionLimit = getSorcererMetamagicSelectionLimitForActionForCharacter(character);

  return (
    <>
      <div className={clsx(sharedModalStyles.featureActionOptionGrid)}>
        {options.map((option) => {
          const isSelected = selectedOptionKeys.includes(option.key);
          const isDisabled =
            selection === "multi-confirm" &&
            !isSelected &&
            (option.disabled === true || selectedOptionKeys.length >= selectionLimit);
          const resolvedOption = isDisabled ? { ...option, disabled: true } : option;

          return (
            <FeatureActionOptionButton
              key={option.key}
              option={resolvedOption}
              character={character}
              roundTracker={roundTracker}
              selected={isSelected}
              onClick={() => onToggleOption(option)}
              formatValueLabel={formatFeatureActionOptionValueLabel}
            />
          );
        })}
      </div>
    </>
  );
}

function ArcaneRecoveryActionBody({
  character,
  onRecover
}: {
  character: Character;
  onRecover: (selection: ArcaneRecoverySelection) => void;
}) {
  const [selection, setSelection] = useState<ArcaneRecoverySelection>({});
  const recoveryLimit = getArcaneRecoveryRecoveryLevelLimit(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const selectedLevelTotal = ([1, 2, 3, 4, 5] as const).reduce(
    (total, slotLevel) => total + (selection[slotLevel] ?? 0) * slotLevel,
    0
  );
  const availableOptions = useMemo(
    () =>
      ([1, 2, 3, 4, 5] as const)
        .map((slotLevel) => {
          const totalSlots = spellSlotTotals[slotLevel - 1] ?? 0;
          const expendedSlots = spellSlotsExpended[slotLevel - 1] ?? 0;

          return {
            slotLevel,
            totalSlots,
            expendedSlots,
            selectedCount: selection[slotLevel] ?? 0
          };
        })
        .filter((option) => option.totalSlots > 0 && option.expendedSlots > 0),
    [selection, spellSlotTotals, spellSlotsExpended]
  );

  function updateSelection(slotLevel: 1 | 2 | 3 | 4 | 5, delta: -1 | 1) {
    setSelection((current) => {
      const currentCount = current[slotLevel] ?? 0;
      const expendedCount = spellSlotsExpended[slotLevel - 1] ?? 0;
      const currentTotal = ([1, 2, 3, 4, 5] as const).reduce(
        (total, level) => total + (current[level] ?? 0) * level,
        0
      );
      const nextCount =
        delta < 0
          ? Math.max(0, currentCount - 1)
          : Math.min(
              expendedCount,
              currentCount + 1,
              currentCount + Math.floor((recoveryLimit - currentTotal) / slotLevel)
            );

      return nextCount <= 0
        ? Object.fromEntries(
            Object.entries(current).filter(([level]) => Number(level) !== slotLevel)
          )
        : {
            ...current,
            [slotLevel]: nextCount
          };
    });
  }

  return (
    <>
      <div className={arcaneRecoveryStyles.arcaneRecoverySummary}>
        <span className={arcaneRecoveryStyles.arcaneRecoverySummaryLabel}>Recovery Budget</span>
        <strong>{`${selectedLevelTotal}/${recoveryLimit} slot levels selected`}</strong>
      </div>

      {availableOptions.length > 0 ? (
        <div className={arcaneRecoveryStyles.arcaneRecoveryGrid}>
          {availableOptions.map((option) => {
            const remainingBudget = recoveryLimit - selectedLevelTotal;
            const canDecrease = option.selectedCount > 0;
            const canIncrease =
              option.selectedCount < option.expendedSlots && remainingBudget >= option.slotLevel;

            return (
              <div
                key={`arcane-recovery-level-${option.slotLevel}`}
                className={arcaneRecoveryStyles.arcaneRecoveryCard}
              >
                <div className={arcaneRecoveryStyles.arcaneRecoveryCardHeader}>
                  <strong>{`Level ${option.slotLevel} Slot`}</strong>
                  <small>{`${option.expendedSlots} expended`}</small>
                </div>
                <div className={arcaneRecoveryStyles.arcaneRecoveryControlRow}>
                  <button
                    type="button"
                    className={arcaneRecoveryStyles.arcaneRecoveryControlButton}
                    onClick={() => updateSelection(option.slotLevel, -1)}
                    disabled={!canDecrease}
                    aria-label={`Recover one fewer level ${option.slotLevel} slot`}
                  >
                    <Minus size={15} />
                  </button>
                  <span className={arcaneRecoveryStyles.arcaneRecoveryCount}>
                    {option.selectedCount}
                  </span>
                  <button
                    type="button"
                    className={arcaneRecoveryStyles.arcaneRecoveryControlButton}
                    onClick={() => updateSelection(option.slotLevel, 1)}
                    disabled={!canIncrease}
                    aria-label={`Recover one more level ${option.slotLevel} slot`}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={shared.emptyText}>
          No expended spell slots of level 1-5 can be recovered right now.
        </p>
      )}

      <div className={shared.formActions}>
        <button
          type="button"
          className={sheetStyles.castButton}
          disabled={selectedLevelTotal <= 0}
          onClick={() => onRecover(selection)}
        >
          Recover Spell Slots
        </button>
      </div>
    </>
  );
}

function IndomitableActionBody({
  options,
  onRoll
}: {
  options: IndomitableOption[];
  onRoll: (option: IndomitableOption) => void;
}) {
  const [selectedAbility, setSelectedAbility] = useState<AbilityKey | null>(null);
  const selectedOption =
    selectedAbility !== null
      ? (options.find((option) => option.ability === selectedAbility) ?? null)
      : null;

  return (
    <>
      <div className={indomitableStyles.indomitableAbilityGrid}>
        {options.map((option) => (
          <button
            key={option.ability}
            type="button"
            className={clsx(
              indomitableStyles.indomitableAbilityButton,
              selectedAbility === option.ability && indomitableStyles.indomitableAbilityButtonActive
            )}
            onClick={() => setSelectedAbility(option.ability)}
          >
            <strong>{option.ability}</strong>
            <small>{formatAbilityModifier(option.total)} Save</small>
          </button>
        ))}
      </div>

      <CellContainer
        label="Formula"
        content={
          selectedOption?.formulaDisplay ?? "Choose a saving throw to see the roll formula."
        }
      />

      <div className={shared.formActions}>
        <button
          type="button"
          className={shared.saveButton}
          onClick={() => selectedOption && onRoll(selectedOption)}
          disabled={selectedOption === null}
        >
          Roll Saving Throw
        </button>
      </div>
    </>
  );
}

function LayOnHandsActionBody({
  conditionOptions,
  remainingPool,
  onSubmit
}: {
  conditionOptions: LayOnHandsCondition[];
  remainingPool: number;
  onSubmit: (options: {
    target: "self" | "other";
    poolSpendAmount: number;
    conditions: LayOnHandsCondition[];
  }) => void;
}) {
  const [target, setTarget] = useState<"self" | "other">("self");
  const [poolSpendInput, setPoolSpendInput] = useState("0");
  const [selectedConditions, setSelectedConditions] = useState<LayOnHandsCondition[]>([]);
  const poolSpendAmount = Math.max(0, Math.floor(Number(poolSpendInput) || 0));
  const conditionCost = selectedConditions.length * 5;
  const totalCost = poolSpendAmount + conditionCost;
  const notEnoughCapacity = totalCost > remainingPool;
  const canSubmit = totalCost > 0 && !notEnoughCapacity;

  function toggleCondition(condition: LayOnHandsCondition) {
    setSelectedConditions((currentConditions) =>
      currentConditions.includes(condition)
        ? currentConditions.filter((entry) => entry !== condition)
        : [...currentConditions, condition]
    );
  }

  return (
    <>
      <div className={layOnHandsStyles.body}>
        <div
          className={layOnHandsStyles.targetSwitch}
          role="tablist"
          aria-label="Lay on Hands target"
        >
          <button
            type="button"
            role="tab"
            aria-selected={target === "self"}
            className={clsx(
              layOnHandsStyles.targetButton,
              target === "self" && layOnHandsStyles.targetButtonActive
            )}
            onClick={() => setTarget("self")}
          >
            Myself
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={target === "other"}
            className={clsx(
              layOnHandsStyles.targetButton,
              target === "other" && layOnHandsStyles.targetButtonActive
            )}
            onClick={() => setTarget("other")}
          >
            Another
          </button>
        </div>

        <label className={layOnHandsStyles.field}>
          <span className={layOnHandsStyles.fieldLabel}>Heal Amount</span>
          <input
            className={layOnHandsStyles.fieldControl}
            type="number"
            min={0}
            inputMode="numeric"
            value={poolSpendInput}
            onChange={(event) => setPoolSpendInput(event.target.value)}
          />
        </label>

        <div className={layOnHandsStyles.field}>
          <span className={layOnHandsStyles.fieldLabel}>Conditions to Cure</span>
          <div className={layOnHandsStyles.conditionList}>
            {conditionOptions.map((condition) => {
              const isSelected = selectedConditions.includes(condition);

              return (
                <label
                  key={condition}
                  className={clsx(
                    layOnHandsStyles.conditionOption,
                    isSelected && layOnHandsStyles.conditionOptionSelected
                  )}
                >
                  <input
                    type="checkbox"
                    className={layOnHandsStyles.conditionCheckbox}
                    checked={isSelected}
                    onChange={() => toggleCondition(condition)}
                  />
                  <span>{condition}</span>
                </label>
              );
            })}
          </div>
        </div>

        <CellContainer
          className={layOnHandsStyles.capacityBlock}
          labelClassName={layOnHandsStyles.capacityLabel}
          contentClassName={layOnHandsStyles.capacityValue}
          label="Pool of Healing"
          content={`${remainingPool} remaining | ${totalCost} total spend`}
        />
      </div>

      <div className={shared.formActions}>
        {notEnoughCapacity ? (
          <span className={layOnHandsStyles.warning}>Not enough capacity</span>
        ) : null}
        <button
          type="button"
          className={shared.saveButton}
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              target,
              poolSpendAmount,
              conditions: selectedConditions
            })
          }
        >
          Heal
        </button>
      </div>
    </>
  );
}

function WarriorOfTheGodsActionBody({
  remainingCharges,
  onSubmit
}: {
  remainingCharges: number;
  onSubmit: (chargeCount: number) => void;
}) {
  const [chargeInput, setChargeInput] = useState(() => (remainingCharges > 0 ? "1" : "0"));
  const selectedChargeCount = Math.max(
    0,
    Math.min(remainingCharges, Math.floor(Number(chargeInput) || 0))
  );
  const canSubmit = selectedChargeCount > 0 && selectedChargeCount <= remainingCharges;

  return (
    <>
      <label className={sharedModalStyles.chargeSpendField}>
        <span className={sharedModalStyles.chargeSpendLabel}>Charges to Use</span>
        <input
          className={sharedModalStyles.chargeSpendInput}
          type="number"
          min={1}
          max={remainingCharges}
          inputMode="numeric"
          value={chargeInput}
          onChange={(event) => setChargeInput(event.target.value)}
        />
      </label>

      <CellContainer
        label="Charges Remaining"
        content={`${remainingCharges} available | ${selectedChargeCount} selected`}
      />

      <div className={shared.formActions}>
        <button
          type="button"
          className={shared.saveButton}
          disabled={!canSubmit}
          onClick={() => onSubmit(selectedChargeCount)}
        >
          Heal
        </button>
      </div>
    </>
  );
}

function SneakAttackActionBody({
  action,
  character,
  onConfirm
}: {
  action: FeatureActionCard;
  character: Character;
  onConfirm: (effectKeys: RogueSneakAttackEffectKey[]) => void;
}) {
  const [selectedEffectKeys, setSelectedEffectKeys] = useState<RogueSneakAttackEffectKey[]>([]);
  const [selectedReferenceEffect, setSelectedReferenceEffect] =
    useState<RogueSneakAttackEffectDefinition | null>(null);
  const effectDefinitions = getRogueSneakAttackEffectDefinitions(character);
  const maxEffects = getRogueSneakAttackMaxEffects(character);
  const baseDiceCount = action.valueLabel ? getRogueSneakAttackEffectDiceCost([]) + Number.NaN : 0;
  const totalDiceCount =
    getRogueSneakAttackEffectDefinitions(character).length >= 0
      ? Number(getRogueSneakAttackValueLabel(character)?.match(/(\d+)d6/)?.[1] ?? "0")
      : baseDiceCount;
  const selectedEffectCost = getRogueSneakAttackEffectDiceCost(selectedEffectKeys);
  const previewValueLabel =
    getRogueSneakAttackValueLabel(character, selectedEffectKeys) ??
    action.valueLabel ??
    action.summary;

  function toggleEffect(effect: RogueSneakAttackEffectDefinition) {
    setSelectedEffectKeys((currentKeys) => {
      if (currentKeys.includes(effect.key)) {
        return currentKeys.filter((key) => key !== effect.key);
      }

      if (
        currentKeys.length >= maxEffects ||
        getRogueSneakAttackEffectDiceCost(currentKeys) + effect.costDice > totalDiceCount
      ) {
        return currentKeys;
      }

      return [...currentKeys, effect.key];
    });
  }

  return (
    <>
      <CellContainer
        className={sneakAttackStyles.sneakAttackPreviewCard}
        label="Damage"
        content={previewValueLabel}
      />

      {effectDefinitions.length > 0 ? (
        <div className={sneakAttackStyles.sneakAttackEffectsSection}>
          <div className={sneakAttackStyles.sneakAttackEffectsHeader}>
            <div>
              <h4>Cunning Strike</h4>
              <p className={shared.helperText}>
                Choose up to {maxEffects} effect{maxEffects === 1 ? "" : "s"}. Each effect reduces
                the Sneak Attack dice you roll.
              </p>
            </div>
            <span className={sneakAttackStyles.sneakAttackEffectSpend}>
              {selectedEffectCost}d6 spent
            </span>
          </div>

          <div className={sneakAttackStyles.sneakAttackEffectsList}>
            {effectDefinitions.map((effect) => {
              const isSelected = selectedEffectKeys.includes(effect.key);
              const isDisabled =
                !isSelected &&
                (selectedEffectKeys.length >= maxEffects ||
                  selectedEffectCost + effect.costDice > totalDiceCount);

              return (
                <div
                  key={effect.key}
                  className={clsx(
                    sneakAttackStyles.sneakAttackEffectRow,
                    isSelected && sneakAttackStyles.sneakAttackEffectRowSelected
                  )}
                >
                  <button
                    type="button"
                    className={sneakAttackStyles.sneakAttackEffectButton}
                    onClick={() => toggleEffect(effect)}
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                  >
                    <strong>{effect.name}</strong>
                    <small>Cost: {effect.costDice}d6</small>
                  </button>
                  <button
                    type="button"
                    className={sneakAttackStyles.sneakAttackReferenceButton}
                    onClick={() => setSelectedReferenceEffect(effect)}
                    aria-label={`Open ${effect.name} reference`}
                  >
                    <BookOpen size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className={shared.formActions}>
        <button
          type="button"
          className={shared.saveButton}
          onClick={() => onConfirm(selectedEffectKeys)}
        >
          Sneak Attack
        </button>
      </div>

      {selectedReferenceEffect ? (
        <KeywordReferenceDrawer
          title={selectedReferenceEffect.referenceTitle}
          badgeLabel="Keyword"
          backdropClassName={sneakAttackStyles.sneakAttackReferenceDrawerBackdrop}
          entries={[
            {
              title: "",
              description: selectedReferenceEffect.referenceDescription
            }
          ]}
          onClose={() => setSelectedReferenceEffect(null)}
        />
      ) : null}
    </>
  );
}

function FontOfMagicActionBody({
  actionWarning,
  character,
  selectedSelection,
  onSelectSelection
}: {
  actionWarning: string | null;
  character: Character;
  selectedSelection: FontOfMagicSelection | null;
  onSelectSelection: (selection: FontOfMagicSelection) => void;
}) {
  const sorceryPointsRemaining = getSorceryPointsRemainingForCharacter(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );
  const spellSlotCreationRules = [
    { spellSlotLevel: 1, sorceryPointCost: 2, minimumSorcererLevel: 2 },
    { spellSlotLevel: 2, sorceryPointCost: 3, minimumSorcererLevel: 3 },
    { spellSlotLevel: 3, sorceryPointCost: 5, minimumSorcererLevel: 5 },
    { spellSlotLevel: 4, sorceryPointCost: 6, minimumSorcererLevel: 7 },
    { spellSlotLevel: 5, sorceryPointCost: 7, minimumSorcererLevel: 9 }
  ].filter((rule) => character.level >= rule.minimumSorcererLevel);
  const spellSlotToPointOptions = spellSlotTotals
    .map((total, index) => {
      const spellSlotLevel = index + 1;
      const remainingSlots = spellSlotsRemaining[index] ?? 0;
      const disabledReason =
        total <= 0
          ? "You don't have spell slots of this level."
          : remainingSlots <= 0
            ? "No spell slots of this level remain."
            : null;

      return {
        spellSlotLevel,
        total,
        remainingSlots,
        disabledReason
      };
    })
    .filter((option) => option.total > 0);

  return (
    <>
      <div className={fontOfMagicStyles.fontOfMagicSections}>
        <section className={fontOfMagicStyles.fontOfMagicSection}>
          <div className={fontOfMagicStyles.fontOfMagicSectionHeader}>
            <div>
              <h4>Spell Slot to Sorcery Points</h4>
              <p className={shared.helperText}>No action required.</p>
            </div>
          </div>

          {spellSlotToPointOptions.length > 0 ? (
            <div className={fontOfMagicStyles.fontOfMagicOptionGrid}>
              {spellSlotToPointOptions.map((option) => (
                <button
                  key={`font-of-magic-slot-to-points-${option.spellSlotLevel}`}
                  type="button"
                  className={clsx(
                    fontOfMagicStyles.fontOfMagicOptionButton,
                    selectedSelection?.kind === "slot-to-points" &&
                      selectedSelection.spellSlotLevel === option.spellSlotLevel &&
                      fontOfMagicStyles.fontOfMagicOptionButtonSelected
                  )}
                  disabled={option.disabledReason !== null}
                  onClick={() =>
                    onSelectSelection({
                      kind: "slot-to-points",
                      spellSlotLevel: option.spellSlotLevel
                    })
                  }
                >
                  <strong className={fontOfMagicStyles.fontOfMagicCompactLabel}>
                    <span>Level {option.spellSlotLevel} Slot</span>
                    <span aria-hidden="true">-&gt;</span>
                    <span className={fontOfMagicStyles.fontOfMagicSparkleValue}>
                      <span>{option.spellSlotLevel}</span>
                      <Sparkles size={14} />
                    </span>
                  </strong>
                </button>
              ))}
            </div>
          ) : (
            <p className={shared.emptyText}>No spell slots are available to convert right now.</p>
          )}
        </section>

        <section className={fontOfMagicStyles.fontOfMagicSection}>
          <div className={fontOfMagicStyles.fontOfMagicSectionHeader}>
            <div>
              <h4>Sorcery Points to Spell Slot</h4>
              <p className={shared.helperText}>Uses your Bonus Action.</p>
            </div>
            {actionWarning ? (
              <span className={fontOfMagicStyles.fontOfMagicWarning}>{actionWarning}</span>
            ) : null}
          </div>

          <div className={fontOfMagicStyles.fontOfMagicOptionGrid}>
            {spellSlotCreationRules.map((rule) => {
              const slotIndex = rule.spellSlotLevel - 1;
              const expendedSlots = spellSlotsExpended[slotIndex] ?? 0;
              const disabledReason =
                actionWarning ??
                (expendedSlots <= 0
                  ? "You already have all of those spell slots."
                  : sorceryPointsRemaining < rule.sorceryPointCost
                    ? `You need ${rule.sorceryPointCost} Sorcery Points.`
                    : null);

              return (
                <button
                  key={`font-of-magic-points-to-slot-${rule.spellSlotLevel}`}
                  type="button"
                  className={clsx(
                    fontOfMagicStyles.fontOfMagicOptionButton,
                    selectedSelection?.kind === "points-to-slot" &&
                      selectedSelection.spellSlotLevel === rule.spellSlotLevel &&
                      fontOfMagicStyles.fontOfMagicOptionButtonSelected
                  )}
                  disabled={disabledReason !== null}
                  onClick={() =>
                    onSelectSelection({
                      kind: "points-to-slot",
                      spellSlotLevel: rule.spellSlotLevel
                    })
                  }
                >
                  <strong className={fontOfMagicStyles.fontOfMagicCompactLabel}>
                    <span className={fontOfMagicStyles.fontOfMagicSparkleValue}>
                      <span>{rule.sorceryPointCost}</span>
                      <Sparkles size={14} />
                    </span>
                    <span aria-hidden="true">-&gt;</span>
                    <span>Level {rule.spellSlotLevel} Slot</span>
                  </strong>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

function RageActionBody({
  action,
  rageOptions,
  powerOptions,
  selectedRageOptionKey,
  selectedPowerOptionKey,
  onSelectRageOption,
  onSelectPowerOption,
  rageOfTheGodsUsesRemaining,
  rageOfTheGodsUsesTotal,
  isRageOfTheGodsSelected,
  onToggleRageOfTheGods
}: {
  action: FeatureActionCard;
  rageOptions: FeatureActionOptionCard[];
  powerOptions: FeatureActionOptionCard[];
  selectedRageOptionKey: string | null;
  selectedPowerOptionKey: string | null;
  onSelectRageOption: (optionKey: string) => void;
  onSelectPowerOption: (optionKey: string) => void;
  rageOfTheGodsUsesRemaining: number;
  rageOfTheGodsUsesTotal: number;
  isRageOfTheGodsSelected: boolean;
  onToggleRageOfTheGods: (checked: boolean) => void;
}) {
  return (
    <>
      {rageOptions.length > 0 ? (
        <section className={sharedModalStyles.wildHeartRageSection}>
          <div className={sharedModalStyles.wildHeartRageSectionHeading}>
            <h4 className={sharedModalStyles.wildHeartRageSectionTitle}>Rage of the Wilds</h4>
            <p className={sharedModalStyles.wildHeartRageSectionDescription}>
              Choose 1 option for this Rage.
            </p>
          </div>
          <div className={sharedModalStyles.wildHeartRageSectionOptions}>
            {rageOptions.map((option) => (
              <FeatureActionChoiceRow
                key={option.key}
                option={option}
                groupName={`feature-action-choice-${action.key}-rage`}
                selected={selectedRageOptionKey === option.key}
                onClick={() => onSelectRageOption(option.key)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {powerOptions.length > 0 ? (
        <section className={sharedModalStyles.wildHeartRageSection}>
          <div className={sharedModalStyles.wildHeartRageSectionHeading}>
            <h4 className={sharedModalStyles.wildHeartRageSectionTitle}>Power of the Wilds</h4>
            <p className={sharedModalStyles.wildHeartRageSectionDescription}>
              Choose 1 option for this Rage.
            </p>
          </div>
          <div className={sharedModalStyles.wildHeartRageSectionOptions}>
            {powerOptions.map((option) => (
              <FeatureActionChoiceRow
                key={option.key}
                option={option}
                groupName={`feature-action-choice-${action.key}-power`}
                selected={selectedPowerOptionKey === option.key}
                onClick={() => onSelectPowerOption(option.key)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {rageOfTheGodsUsesTotal > 0 ? (
        <section className={sharedModalStyles.wildHeartRageSection}>
          <div className={sharedModalStyles.wildHeartRageSectionHeading}>
            <h4 className={sharedModalStyles.wildHeartRageSectionTitle}>Rage of the Gods</h4>
            <p className={sharedModalStyles.wildHeartRageSectionDescription}>
              Choose whether to empower this Rage with your divine warrior form.
            </p>
          </div>
          <label
            className={clsx(
              sharedModalStyles.featureChoiceRow,
              isRageOfTheGodsSelected && sharedModalStyles.featureChoiceRowSelected,
              rageOfTheGodsUsesRemaining <= 0 && sharedModalStyles.featureChoiceRowDisabled
            )}
          >
            <span className={sharedModalStyles.featureChoiceLabel}>
              <input
                type="checkbox"
                className={sharedModalStyles.featureChoiceRadio}
                checked={isRageOfTheGodsSelected}
                disabled={rageOfTheGodsUsesRemaining <= 0}
                onChange={(event) => onToggleRageOfTheGods(event.target.checked)}
              />
              <span className={sharedModalStyles.featureChoiceContent}>
                <span className={styles.rageEnhancementTitleRow}>
                  <span className={sharedModalStyles.featureChoiceTitle}>Use Rage of the Gods</span>
                  <span className={styles.rageEnhancementMeta}>
                    <span className={styles.rageEnhancementModeBadge}>Opt-in</span>
                    <span>{`${rageOfTheGodsUsesRemaining}/${rageOfTheGodsUsesTotal}`}</span>
                    <Flame size={14} />
                  </span>
                </span>
                <span className={sharedModalStyles.featureChoiceDescription}>
                  You can assume the form of a divine Warrior for a minute.
                </span>
              </span>
            </span>
          </label>
        </section>
      ) : null}
    </>
  );
}

function BrutalStrikeActionBody({
  options,
  selectionLimit,
  damageFormula,
  onConfirm
}: {
  options: FeatureActionOptionCard[];
  selectionLimit: number;
  damageFormula: string;
  onConfirm: (optionKeys: string[]) => void;
}) {
  const [selectedOptionKeys, setSelectedOptionKeys] = useState<string[]>([]);
  const allowsMultipleSelections = selectionLimit > 1;
  const helperText = allowsMultipleSelections
    ? `Applying Brutal Strike adds the extra ${damageFormula} damage. You can optionally choose up to ${selectionLimit} different effects below.`
    : `Applying Brutal Strike adds the extra ${damageFormula} damage. You can optionally choose one effect below.`;

  return (
    <>
      <p className={shared.helperText}>{helperText}</p>
      <div className={sharedModalStyles.brutalStrikeOptionList}>
        {options.map((option) => {
          const isSelected = selectedOptionKeys.includes(option.key);
          const isSelectionLimitReached =
            !isSelected && selectionLimit > 0 && selectedOptionKeys.length >= selectionLimit;

          return (
            <button
              key={option.key}
              type="button"
              className={clsx(
                sharedModalStyles.brutalStrikeOptionButton,
                isSelected && sharedModalStyles.brutalStrikeOptionButtonSelected
              )}
              disabled={isSelectionLimitReached}
              onClick={() =>
                setSelectedOptionKeys((currentKeys) =>
                  currentKeys.includes(option.key)
                    ? currentKeys.filter((entry) => entry !== option.key)
                    : [...currentKeys, option.key]
                )
              }
            >
              <strong className={sharedModalStyles.brutalStrikeOptionName}>{option.name}</strong>
              <span className={sharedModalStyles.brutalStrikeOptionDescription}>
                {option.detail}
              </span>
            </button>
          );
        })}
      </div>

      <div className={shared.formActions}>
        <button
          type="button"
          className={sheetStyles.castButton}
          onClick={() => onConfirm(selectedOptionKeys)}
        >
          Apply Brutal Strike
        </button>
      </div>
    </>
  );
}

function DivineInterventionActionBody({
  character,
  onSpellSelect
}: {
  character: Character;
  onSpellSelect: (spell: SpellEntry) => void;
}) {
  const [activeLevel, setActiveLevel] = useState(0);
  const enabledLevels = useMemo(
    () => getClericDivineInterventionEnabledLevels(character),
    [character]
  );
  const spellEntries = useMemo(
    () => getClericDivineInterventionSpellEntries(character),
    [character]
  );
  const spellGroups = useMemo(() => getDivineInterventionLevelGroups(spellEntries), [spellEntries]);
  const firstAvailableLevel = useMemo(
    () =>
      enabledLevels.find((level) => (spellGroups[level]?.length ?? 0) > 0) ?? enabledLevels[0] ?? 0,
    [enabledLevels, spellGroups]
  );
  const activeSpells = spellGroups[activeLevel] ?? [];
  const outcomeSummariesById = useMemo(
    () =>
      new Map(
        spellEntries.map((spell) => [
          spell.id,
          getSpellOutcomeSummaryForCharacter(character, spell)
        ])
      ),
    [character, spellEntries]
  );

  useEffect(() => {
    setActiveLevel((currentLevel) => {
      if (enabledLevels.includes(currentLevel) && (spellGroups[currentLevel]?.length ?? 0) > 0) {
        return currentLevel;
      }

      return firstAvailableLevel;
    });
  }, [enabledLevels, spellGroups, firstAvailableLevel]);

  return (
    <>
      <div className={divineStyles.divineInterventionTabRow}>
        <span className={divineStyles.divineInterventionTabLabel}>Level</span>
        <div
          className={divineStyles.divineInterventionTabList}
          role="tablist"
          aria-label="Divine Intervention spell levels"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
            const isDisabled = !enabledLevels.includes(level);

            return (
              <button
                key={`divine-intervention-level-${level}`}
                type="button"
                role="tab"
                aria-selected={activeLevel === level}
                className={clsx(
                  divineStyles.divineInterventionTabButton,
                  activeLevel === level && divineStyles.divineInterventionTabButtonActive
                )}
                onClick={() => setActiveLevel(level)}
                disabled={isDisabled}
              >
                {level === 0 ? "C" : level}
              </button>
            );
          })}
        </div>
      </div>

      <div className={clsx(sheetStyles.spellManagementList, divineStyles.divineInterventionList)}>
        {activeSpells.length === 0 ? (
          <p className={shared.emptyText}>No spells are available at this level.</p>
        ) : (
          <ul className={divineStyles.divineInterventionSelectionList}>
            {activeSpells.map((spell) => (
              <li key={spell.id}>
                <SpellListRow
                  spell={spell}
                  onClick={() => onSpellSelect(spell)}
                  valueSummary={outcomeSummariesById.get(spell.id) ?? ""}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function MysticArcanumActionBody({
  character,
  onSpellSelect
}: {
  character: Character;
  onSpellSelect: (spellLevel: number, spell: SpellEntry) => void;
}) {
  const selections = useMemo(
    () => getWarlockMysticArcanumSelectionsForCharacter(character),
    [character]
  );
  const spells = useMemo(
    () =>
      selections.flatMap((selection) =>
        selection.spell
          ? [
              {
                spellLevel: selection.spellLevel,
                spell: selection.spell,
                expended: selection.expended
              }
            ]
          : []
      ),
    [selections]
  );

  return (
    <div className={clsx(sheetStyles.spellManagementList, divineStyles.divineInterventionList)}>
      {spells.length === 0 ? (
        <p className={shared.emptyText}>
          No Mystic Arcanum spells are selected yet. Choose them in Class Features & Feats.
        </p>
      ) : (
        <ul className={divineStyles.divineInterventionSelectionList}>
          {spells.map(({ spellLevel, spell, expended }) => (
            <li key={`${spell.id}-${spellLevel}`}>
              <SpellListRow
                spell={spell}
                onClick={() => onSpellSelect(spellLevel, spell)}
                disabled={expended}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActionsWidget({ character, onPersistCharacter }: ActionsWidgetProps) {
  const [selectedActionKey, setSelectedActionKey] = useState<string | null>(null);
  const [selectedActionOptionKeys, setSelectedActionOptionKeys] = useState<string[]>([]);
  const [selectedFontOfMagicSelection, setSelectedFontOfMagicSelection] =
    useState<FontOfMagicSelection | null>(null);
  const [selectedRageOptionKey, setSelectedRageOptionKey] = useState<string | null>(null);
  const [selectedRagePowerOptionKey, setSelectedRagePowerOptionKey] = useState<string | null>(
    null
  );
  const [isRageOfTheGodsSelected, setIsRageOfTheGodsSelected] = useState(false);
  const [isFixedSpellDrawerOpen, setIsFixedSpellDrawerOpen] = useState(false);
  const [selectedFixedSpellSlotLevel, setSelectedFixedSpellSlotLevel] = useState(1);
  const [isDiceRollerSettingsOpen, setIsDiceRollerSettingsOpen] = useState(false);
  const [selectedDivineInterventionSpell, setSelectedDivineInterventionSpell] =
    useState<SpellEntry | null>(null);
  const [selectedMysticArcanumSpell, setSelectedMysticArcanumSpell] = useState<SpellEntry | null>(
    null
  );
  const [selectedMysticArcanumSpellLevel, setSelectedMysticArcanumSpellLevel] =
    useState<MysticArcanumLevel | null>(null);
  const [useBeguilingMagicOnActionSpell, setUseBeguilingMagicOnActionSpell] = useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const combatActions = useMemo(() => getCombatActionsForCharacter(character), [character]);
  const customWeaponEntriesById = useMemo(
    () =>
      new Map(
        getResolvedCustomLoadoutEntries(character.customEquipment)
          .filter(
            (entry): entry is ResolvedCustomWeaponEntry =>
              entry.category === ENTRY_CATEGORIES.WEAPONS
          )
          .map((entry) => [entry.customEquipmentId, entry])
      ),
    [character.customEquipment]
  );
  const spellcastingState = getSpellcastingStateForCharacter(character);
  const beguilingMagicUsesTotal = useMemo(
    () => getBeguilingMagicUsesTotalForCharacter(character),
    [character.className, character.level, character.subclassId]
  );
  const beguilingMagicUsesRemaining = useMemo(
    () => getBeguilingMagicUsesRemainingForCharacter(character),
    [character.classFeatureState, character.className, character.level, character.subclassId]
  );
  const bardicInspirationUsesRemaining = useMemo(
    () => getBardicInspirationUsesRemainingForCharacter(character),
    [
      character.abilities,
      character.classFeatureState,
      character.className,
      character.feats,
      character.level
    ]
  );
  const mantleOfMajestyUsesRemaining = useMemo(
    () => getMantleOfMajestyUsesRemainingForCharacter(character),
    [character.classFeatureState, character.className, character.level, character.subclassId]
  );
  const fixedSpellSlotTotals = useMemo(
    () => getSpellSlotTotalsForCharacter(character.className, character.level),
    [character.className, character.level]
  );
  const fixedSpellSlotsExpended = useMemo(
    () => normalizeSpellSlotsExpended(character.spellSlotsExpended, fixedSpellSlotTotals),
    [character.spellSlotsExpended, fixedSpellSlotTotals]
  );
  const fixedSpellSlotsRemaining = useMemo(
    () =>
      fixedSpellSlotTotals.map((total, index) =>
        Math.max(0, total - (fixedSpellSlotsExpended[index] ?? 0))
      ),
    [fixedSpellSlotTotals, fixedSpellSlotsExpended]
  );
  const effectiveAbilities = useMemo(() => getAbilityScoresForCharacter(character), [character]);
  const selectedAction =
    selectedActionKey !== null
      ? (combatActions.find((combatAction) => combatAction.key === selectedActionKey) ?? null)
      : null;
  const selectedFeatureAction = selectedAction?.kind === "feature" ? selectedAction.action : null;
  const selectedWeaponAction = selectedAction?.kind === "weapon" ? selectedAction.action : null;
  const selectedWeaponEntry = useMemo(() => {
    if (!selectedWeaponAction) {
      return null;
    }

    if (selectedWeaponAction.key.startsWith("custom-")) {
      return customWeaponEntriesById.get(selectedWeaponAction.key.replace(/^custom-/, "")) ?? null;
    }

    return codexWeaponEntriesByName.get(selectedWeaponAction.name) ?? null;
  }, [customWeaponEntriesById, selectedWeaponAction]);
  const selectedWeaponDetails = useMemo(
    () =>
      selectedWeaponAction ? getWeaponDrawerDetails(selectedWeaponAction, selectedWeaponEntry) : [],
    [selectedWeaponAction, selectedWeaponEntry]
  );
  const selectedWeaponAttackFormula = useMemo(
    () => (selectedWeaponAction ? getWeaponAttackFormulaPresentation(selectedWeaponAction) : null),
    [selectedWeaponAction]
  );
  const selectedWeaponDamageFormula = useMemo(
    () => (selectedWeaponAction ? getWeaponDamageFormulaPresentation(selectedWeaponAction) : null),
    [selectedWeaponAction]
  );
  const selectedWeaponDescription = useMemo(
    () => (selectedWeaponEntry?.summary?.trim() ? [selectedWeaponEntry.summary.trim()] : []),
    [selectedWeaponEntry]
  );
  const selectedWeaponRollState = useMemo(
    () => (selectedWeaponAction ? resolveFeatureIndicators(selectedWeaponAction.indicators) : null),
    [selectedWeaponAction]
  );
  const selectedDrawerOptions =
    selectedAction?.kind === "feature" && selectedAction.drawer.kind === "options"
      ? selectedAction.drawer.options
      : [];
  const selectedRageOptions =
    selectedFeatureAction?.key === barbarianRageActionKey &&
    selectedAction?.drawer.kind === "custom-form"
      ? (selectedAction.drawer.options ?? [])
      : [];
  const selectedRagePowerOptions = useMemo(
    () =>
      selectedFeatureAction?.key === barbarianRageActionKey
        ? getBarbarianPowerOfTheWildsOptions(character)
        : [],
    [character, selectedFeatureAction]
  );
  const selectedRageOfTheGodsUsesTotal =
    selectedFeatureAction?.key === barbarianRageActionKey
      ? getBarbarianRageOfTheGodsUsesTotal(character)
      : 0;
  const selectedRageOfTheGodsUsesRemaining =
    selectedFeatureAction?.key === barbarianRageActionKey
      ? getBarbarianRageOfTheGodsUsesRemaining(character)
      : 0;
  const selectedDrawerOption = useMemo(
    () =>
      selectedDrawerOptions.find((option) => selectedActionOptionKeys.includes(option.key)) ?? null,
    [selectedActionOptionKeys, selectedDrawerOptions]
  );
  const selectedOptionWarning = useMemo(
    () =>
      selectedDrawerOption
        ? getRoundTrackerActionWarning(
            getRoundTrackerResourceForEconomyType(selectedDrawerOption.economyType),
            roundTracker
          )
        : null,
    [roundTracker, selectedDrawerOption]
  );
  const selectedMetamagicCost = useMemo(
    () =>
      selectedFeatureAction?.key === metamagicActionKey
        ? getSorcererMetamagicActionCostForCharacter(character, selectedActionOptionKeys)
        : 0,
    [character, selectedActionOptionKeys, selectedFeatureAction]
  );
  const selectedFontOfMagicWarning =
    selectedFontOfMagicSelection?.kind === "points-to-slot"
      ? getRoundTrackerActionWarning("bonusAction", roundTracker)
      : null;
  const selectedActionEconomyShapeState = useMemo(() => {
    if (!selectedAction) {
      return null;
    }

    return getEconomyShapeState(
      selectedAction.economyType,
      roundTracker,
      (selectedAction.economyMultiCount ?? 0) +
        (selectedAction.kind === "feature" &&
        selectedAction.action.economyType === "action" &&
        selectedAction.action.actionCategory !== "magic"
          ? getNonMagicActionEconomyMultiForCharacter(character)
          : 0)
    );
  }, [character, roundTracker, selectedAction]);
  const selectedActionWarning = getSelectedActionRoundTrackerWarning(selectedAction, roundTracker);
  const selectedDrawerWarning =
    selectedOptionWarning ??
    (selectedAction?.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "font-of-magic" &&
    selectedFontOfMagicSelection !== null
      ? selectedFontOfMagicWarning
      : selectedActionWarning);
  const fixedSpellExecute =
    selectedAction?.kind === "feature" &&
    selectedAction.execute.kind === "spell" &&
    selectedAction.execute.spellSource === "fixed"
      ? selectedAction.execute
      : null;
  const fixedSpellEntry = useMemo(
    () => (fixedSpellExecute ? getFixedSpellEntryForExecute(character, fixedSpellExecute) : null),
    [character, fixedSpellExecute]
  );
  const fixedSpellMinimumActionSlotLevel = useMemo(() => {
    if (fixedSpellExecute?.effectKind !== "mantle-of-majesty" || mantleOfMajestyUsesRemaining > 0) {
      return null;
    }

    return getMantleOfMajestyFallbackSlotLevelForCharacter(character);
  }, [character, fixedSpellExecute?.effectKind, mantleOfMajestyUsesRemaining]);
  const fixedSpellFreeCastSlotLevel =
    fixedSpellExecute?.effectKind === "mantle-of-majesty"
      ? mantleOfMajestyUsesRemaining > 0
        ? 1
        : null
      : (fixedSpellExecute?.freeCastSlotLevel ?? null);
  const fixedSpellConsumesSpellSlot =
    fixedSpellExecute?.effectKind === "mantle-of-majesty"
      ? true
      : (fixedSpellExecute?.actionConsumesSpellSlot ?? false);
  const fixedSpellActionAvailabilityText =
    fixedSpellExecute?.effectKind === "mantle-of-majesty"
      ? mantleOfMajestyUsesRemaining > 0
        ? "Cast Command at level 1 without expending a spell slot. Upcasting expends the selected spell slot."
        : fixedSpellMinimumActionSlotLevel !== null
          ? `Expend a level ${fixedSpellMinimumActionSlotLevel}+ spell slot to assume Mantle of Majesty.`
          : "No level 3+ spell slots remain to fuel Mantle of Majesty."
      : (fixedSpellExecute?.actionAvailabilityText ?? null);
  const fixedSpellActionContextText =
    fixedSpellExecute?.effectKind === "mantle-of-majesty"
      ? "Using Mantle of Majesty"
      : (fixedSpellExecute?.actionContextText ?? null);
  const selectedActionSpellEntry =
    fixedSpellEntry ?? selectedDivineInterventionSpell ?? selectedMysticArcanumSpell;
  const selectedActionSpellSupportsBeguilingMagic =
    selectedActionSpellEntry !== null &&
    beguilingMagicUsesTotal > 0 &&
    (selectedActionSpellEntry.magicSchool === MAGIC_SCHOOL.ENCHANTMENT ||
      selectedActionSpellEntry.magicSchool === MAGIC_SCHOOL.ILLUSION);
  const paladinAuraOfProtectionBonus = hasActivePaladinAuraOfProtectionForCharacter(character)
    ? Math.max(1, getAbilityModifier(effectiveAbilities.CHA))
    : 0;
  const indomitableSavingThrowOptions = useMemo(
    () =>
      abilityKeys.map((ability) => {
        const abilityModifier = getAbilityModifier(effectiveAbilities[ability]);
        const savingThrowProficiency = getSavingThrowProficiencyForAbilityKey(ability);
        const savingThrowLevel = getSavingThrowLevelFromEntries(
          character.savingThrowProficiencies,
          savingThrowProficiency
        );
        const proficiencyContribution =
          getProficiencyBonus(character.level) * getProficiencyMultiplier(savingThrowLevel);
        const total = abilityModifier + proficiencyContribution + paladinAuraOfProtectionBonus;

        return {
          ability,
          total,
          formula: `1d10${total >= 0 ? "+" : ""}${total}+${Math.max(1, Math.floor(character.level))}`,
          formulaDisplay: `1d10 ${formatSignedLabel(total, `${ability} Save`)} + ${Math.max(
            1,
            Math.floor(character.level)
          )} Fighter Level`
        };
      }),
    [
      character.level,
      character.savingThrowProficiencies,
      effectiveAbilities,
      paladinAuraOfProtectionBonus
    ]
  );
  const selectedMysticArcanumExpended =
    selectedMysticArcanumSpellLevel !== null
      ? (getWarlockMysticArcanumSelectionsForCharacter(character).find(
          (selection) => selection.spellLevel === selectedMysticArcanumSpellLevel
        )?.expended ?? false)
      : false;
  const selectedMysticArcanumBlockedReason = spellcastingState.blocked
    ? spellcastingState.reason
    : null;
  const selectedMysticArcanumActionWarning = getRoundTrackerActionWarning(
    selectedMysticArcanumSpell ? getRoundTrackerResourceForSpell(selectedMysticArcanumSpell) : null,
    roundTracker
  );
  const selectedDivineInterventionBlockedReason =
    selectedDivineInterventionSpell?.castingTime.includes(ACTION_TYPE.REACTION)
      ? "Divine Intervention can't cast Reaction spells."
      : spellcastingState.blocked
        ? spellcastingState.reason
        : null;
  const hasOverlayOpen =
    selectedAction !== null ||
    isDiceRollerSettingsOpen ||
    isFixedSpellDrawerOpen ||
    selectedDivineInterventionSpell !== null ||
    selectedMysticArcanumSpell !== null;

  function closeActionDrawer() {
    setSelectedActionOptionKeys([]);
    setSelectedFontOfMagicSelection(null);
    setSelectedRageOptionKey(null);
    setSelectedRagePowerOptionKey(null);
    setIsRageOfTheGodsSelected(false);
    setUseBeguilingMagicOnActionSpell(false);
    setIsDiceRollerSettingsOpen(false);
    setIsFixedSpellDrawerOpen(false);
    setSelectedFixedSpellSlotLevel(1);
    setSelectedDivineInterventionSpell(null);
    setSelectedMysticArcanumSpell(null);
    setSelectedMysticArcanumSpellLevel(null);
    setSelectedActionKey(null);
  }

  function prepareCharacterForResourceConsumption(
    currentCharacter: Character,
    resource: ReturnType<typeof getRoundTrackerResourceForEconomyType> | null
  ): Character {
    return resource
      ? prepareCharacterForRoundTrackerResourceConsumption(currentCharacter, resource)
      : currentCharacter;
  }

  useBodyScrollLock(hasOverlayOpen);

  useEffect(() => {
    if (selectedActionKey === null) {
      return;
    }

    if (!selectedAction) {
      closeActionDrawer();
    }
  }, [selectedAction, selectedActionKey]);

  useEffect(() => {
    setSelectedActionOptionKeys([]);
    setSelectedFontOfMagicSelection(null);
    setSelectedRageOptionKey(null);
    setSelectedRagePowerOptionKey(null);
    setIsRageOfTheGodsSelected(false);
  }, [selectedActionKey]);

  useEffect(() => {
    setUseBeguilingMagicOnActionSpell(false);
  }, [selectedActionSpellEntry?.id]);

  useEffect(() => {
    if (!fixedSpellEntry || !fixedSpellExecute) {
      return;
    }

    setSelectedFixedSpellSlotLevel(
      fixedSpellFreeCastSlotLevel ??
        fixedSpellMinimumActionSlotLevel ??
        fixedSpellExecute.spellLevel ??
        getSpellLevel(fixedSpellEntry)
    );
  }, [
    fixedSpellEntry,
    fixedSpellExecute,
    fixedSpellFreeCastSlotLevel,
    fixedSpellMinimumActionSlotLevel
  ]);

  useEffect(() => {
    if (!hasOverlayOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (selectedMysticArcanumSpell) {
        setSelectedMysticArcanumSpell(null);
        setSelectedMysticArcanumSpellLevel(null);
        return;
      }

      if (selectedDivineInterventionSpell) {
        setSelectedDivineInterventionSpell(null);
        return;
      }

      if (isFixedSpellDrawerOpen) {
        setIsFixedSpellDrawerOpen(false);
        return;
      }

      if (isDiceRollerSettingsOpen) {
        setIsDiceRollerSettingsOpen(false);
        return;
      }

      setSelectedActionKey(null);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    hasOverlayOpen,
    isDiceRollerSettingsOpen,
    isFixedSpellDrawerOpen,
    selectedDivineInterventionSpell,
    selectedMysticArcanumSpell
  ]);

  function activateFeatureAction(action: FeatureActionCard) {
    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateFeatureActionForCharacter(currentCharacter, action.key);
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const preparedNextCharacter =
        preparedCharacter === currentCharacter
          ? nextCharacter
          : activateFeatureActionForCharacter(preparedCharacter, action.key);
      const characterToUpdate =
        preparedNextCharacter === preparedCharacter && action.consumesEconomyOnActivate
          ? preparedCharacter
          : preparedNextCharacter;

      if (characterToUpdate === preparedCharacter && !action.consumesEconomyOnActivate) {
        return currentCharacter;
      }

      if (action.economyType === "action" && action.actionCategory !== "magic") {
        return consumeNonMagicActionForCharacter(characterToUpdate);
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(characterToUpdate, roundTrackerResource)
        : characterToUpdate;
    });
  }

  function executeFeatureActivate(action: FeatureActionCard) {
    const effectKind =
      action.execute?.kind === "activate" ? (action.execute.effectKind ?? "default") : "default";

    if (effectKind === "bardic-inspiration-roll") {
      const bardicDie = getBardicInspirationDieForCharacter(character);
      const bardicDieFormula = bardicDie ? `1${String(bardicDie).toLowerCase()}` : "1d6";

      activateFeatureAction(action);
      openDiceRoller({
        title: action.name,
        formula: bardicDieFormula,
        formulaDisplay: bardicDieFormula,
        description: action.detail
      });
      return;
    }

    if (effectKind === "second-wind") {
      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = activateFeatureActionForCharacter(preparedCharacter, action.key);

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        const healingFormula = getFighterSecondWindHealingFormula(currentCharacter);
        const healingResult = rollFormulaWithDice(healingFormula, "normal");
        openDiceRoller({
          title: "Second Wind",
          formula: healingFormula,
          formulaDisplay: healingFormula,
          description: action.detail
        });
        const nextEffectiveHitPoints = getEffectiveHitPointMaximumForCharacter(nextCharacter);
        const nextCurrentHitPoints = Math.max(
          0,
          Math.min(nextEffectiveHitPoints, nextCharacter.currentHitPoints + healingResult.total)
        );
        const healedCharacter = reconcileCharacterStatusConsequences({
          ...nextCharacter,
          currentHitPoints: nextCurrentHitPoints,
          deathSaves:
            nextCurrentHitPoints > 0
              ? createDefaultDeathSaves()
              : normalizeDeathSaves(nextCharacter.deathSaves)
        });
        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(healedCharacter, roundTrackerResource)
          : healedCharacter;
      });
      closeActionDrawer();
      return;
    }

    if (effectKind === "tactical-mind") {
      onPersistCharacter((currentCharacter) =>
        activateFeatureActionForCharacter(currentCharacter, action.key)
      );
      openDiceRoller({
        title: "Tactical Mind",
        formula: "1d10",
        formulaDisplay: "1d10",
        description: action.detail
      });
      closeActionDrawer();
      return;
    }

    if (effectKind === "tireless") {
      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = consumeRangerTirelessUseForCharacter(preparedCharacter);

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        const temporaryHitPointsFormula =
          getRangerTirelessTemporaryHitPointsFormula(currentCharacter);
        const temporaryHitPointsResult = rollFormulaWithDice(temporaryHitPointsFormula, "normal");
        const grantedTemporaryHitPoints = Math.max(1, temporaryHitPointsResult.total);
        const nextTemporaryHitPointsAssignment = swapTemporaryHitPointsAssignment(
          nextCharacter.temporaryHitPoints,
          nextCharacter.temporaryHitPointsSource,
          grantedTemporaryHitPoints,
          "Tireless"
        );

        openDiceRoller({
          title: "Tireless",
          formula: temporaryHitPointsFormula,
          formulaDisplay: temporaryHitPointsFormula,
          description: `${action.detail} Minimum 1 Temporary Hit Points.`
        });

        const updatedCharacter = {
          ...nextCharacter,
          ...nextTemporaryHitPointsAssignment
        };

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(updatedCharacter, roundTrackerResource)
          : updatedCharacter;
      });
      closeActionDrawer();
      return;
    }

    activateFeatureAction(action);
    closeActionDrawer();
  }

  function resolvePreparedWeaponAction(currentCharacter: Character, action: WeaponAction) {
    const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
    const preparedCharacter = prepareCharacterForResourceConsumption(
      currentCharacter,
      roundTrackerResource
    );
    const preparedAction =
      getCombatActionsForCharacter(preparedCharacter).find(
        (combatAction): combatAction is Extract<GameplayActionDefinition, { kind: "weapon" }> =>
          combatAction.kind === "weapon" && combatAction.action.key === action.key
      )?.action ?? action;

    return {
      preparedCharacter,
      preparedAction,
      roundTrackerResource
    };
  }

  function handleWeaponAttackRoll(action: WeaponAction) {
    onPersistCharacter((currentCharacter) => {
      const { preparedCharacter, preparedAction, roundTrackerResource } =
        resolvePreparedWeaponAction(currentCharacter, action);
      const attackFormula = getWeaponAttackFormulaPresentation(preparedAction).value;

      openDiceRoller({
        title: `${preparedAction.name} attack`,
        formula: attackFormula,
        formulaDisplay: attackFormula,
        description: `${preparedAction.name} attack roll`
      });

      const nextCharacter = preparedAction.damageBonusEntries.reduce(
        (updatedCharacter, entry) =>
          markFeatureWeaponBonusUseForCharacter(updatedCharacter, entry.label),
        preparedCharacter
      );

      return roundTrackerResource
        ? consumeWeaponAttackActionForCharacter(nextCharacter, preparedAction)
        : nextCharacter;
    });
  }

  function handleWeaponDamageRoll(action: WeaponAction) {
    const damageFormula = appendRollModifier(
      action.damageFormula,
      action.damageAbilityModifier ?? action.abilityModifier
    );
    const damageFormulaDisplay = getWeaponDamageFormulaPresentation(action).value;

    openDiceRoller({
      title: `${action.name} damage`,
      formula: damageFormula,
      formulaDisplay: damageFormulaDisplay,
      description: `${action.name} damage roll`
    });
  }

  function toggleFeatureOptionSelection(option: FeatureActionOptionCard) {
    if (!selectedAction || selectedAction.kind !== "feature" || selectedAction.drawer.kind !== "options") {
      return;
    }

    if (option.disabled) {
      return;
    }

    const selection = selectedAction.drawer.selection;

    setSelectedActionOptionKeys((currentKeys) => {
      if (selection === "multi-confirm") {
        if (currentKeys.includes(option.key)) {
          return currentKeys.filter((entry) => entry !== option.key);
        }

        if (
          currentKeys.length >= getSorcererMetamagicSelectionLimitForActionForCharacter(character)
        ) {
          return currentKeys;
        }

        return [...currentKeys, option.key];
      }

      return currentKeys.length === 1 && currentKeys[0] === option.key ? [] : [option.key];
    });
  }

  function handleFeatureOptionExecute(action: FeatureActionCard, option: FeatureActionOptionCard) {
    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(option.economyType);
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionOptionForCharacter(
        preparedCharacter,
        action.key,
        option.key
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      if (option.economyType === "action" && option.actionCategory !== "magic") {
        return consumeNonMagicActionForCharacter(nextCharacter);
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    if (option.rollFormula) {
      openDiceRoller({
        title: option.name,
        formula: option.rollFormula,
        formulaDisplay: option.rollFormulaDisplay,
        description: option.rollDescription ?? option.detail
      });
    }

    closeActionDrawer();
  }

  function confirmSelectedFeatureOptions() {
    if (!selectedFeatureAction || selectedActionOptionKeys.length <= 0) {
      return;
    }

    if (selectedFeatureAction.key === metamagicActionKey) {
      confirmMetamagic(selectedActionOptionKeys);
      return;
    }

    const selectedOption = selectedDrawerOptions.find((option) => option.key === selectedActionOptionKeys[0]);

    if (!selectedOption) {
      return;
    }

    handleFeatureOptionExecute(selectedFeatureAction, selectedOption);
  }

  function submitLayOnHands(options: {
    target: "self" | "other";
    poolSpendAmount: number;
    conditions: LayOnHandsCondition[];
  }) {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = applyLayOnHandsForCharacter(currentCharacter, options);
      const nextPreparedCharacter =
        preparedCharacter === currentCharacter
          ? nextCharacter
          : applyLayOnHandsForCharacter(preparedCharacter, options);

      if (nextPreparedCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextPreparedCharacter, roundTrackerResource)
        : nextPreparedCharacter;
    });

    closeActionDrawer();
  }

  function submitWarriorOfTheGods(chargeCount: number) {
    if (!selectedFeatureAction || chargeCount <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = consumeBarbarianWarriorOfTheGodsChargesForCharacter(
        preparedCharacter,
        chargeCount
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeActionDrawer();
  }

  function submitIndomitable(option: IndomitableOption) {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      activateFeatureActionForCharacter(currentCharacter, selectedFeatureAction.key)
    );

    openDiceRoller({
      title: `Indomitable (${option.ability} Save)`,
      formula: option.formula,
      formulaDisplay: option.formulaDisplay,
      description: selectedFeatureAction.detail
    });

    closeActionDrawer();
  }

  function submitSneakAttack(effectKeys: RogueSneakAttackEffectKey[]) {
    if (!selectedFeatureAction) {
      return;
    }

    const sneakAttackFormula = getRogueSneakAttackFormula(character, effectKeys);

    if (!sneakAttackFormula) {
      return;
    }

    const selectedEffects = getRogueSneakAttackEffectDefinitions(character).filter((effect) =>
      effectKeys.includes(effect.key)
    );
    const baseDescription = selectedFeatureAction.detail.endsWith(".")
      ? selectedFeatureAction.detail
      : `${selectedFeatureAction.detail}.`;
    const description =
      selectedEffects.length > 0
        ? `${baseDescription} Cunning Strike: ${selectedEffects.map((effect) => effect.name).join(", ")}.`
        : baseDescription;

    onPersistCharacter((currentCharacter) =>
      activateFeatureActionForCharacter(currentCharacter, selectedFeatureAction.key)
    );

    openDiceRoller({
      title: "Sneak Attack",
      formula: sneakAttackFormula,
      formulaDisplay: sneakAttackFormula,
      description
    });

    closeActionDrawer();
  }

  function submitArcaneRecovery(selection: ArcaneRecoverySelection) {
    onPersistCharacter((currentCharacter) =>
      activateArcaneRecoveryForCharacter(currentCharacter, selection)
    );
    closeActionDrawer();
  }

  function submitRage() {
    if (!selectedFeatureAction) {
      return;
    }

    const requiresRageOption = selectedRageOptions.length > 0;
    const requiresPowerOption = selectedRagePowerOptions.length > 0;

    if (requiresRageOption && !selectedRageOptionKey) {
      return;
    }

    if (requiresPowerOption && !selectedRagePowerOptionKey) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter =
        requiresRageOption && selectedRageOptionKey
          ? activateBarbarianWildHeartRage(
              preparedCharacter,
              selectedRageOptionKey,
              selectedRagePowerOptionKey ?? undefined,
              {
                useRageOfTheGods: isRageOfTheGodsSelected
              }
            )
          : activateBarbarianRage(preparedCharacter, {
              useRageOfTheGods: isRageOfTheGodsSelected
            });

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeActionDrawer();
  }

  function submitBrutalStrike() {
    if (!selectedFeatureAction) {
      return;
    }

    activateFeatureAction(selectedFeatureAction);
    closeActionDrawer();
  }

  function confirmMetamagic(optionKeys: string[]) {
    onPersistCharacter((currentCharacter) =>
      spendSorcererMetamagicOptionsForCharacter(currentCharacter, optionKeys)
    );
    closeActionDrawer();
  }

  function convertSpellSlotToSorceryPoints(spellSlotLevel: number) {
    onPersistCharacter((currentCharacter) =>
      convertSpellSlotToSorceryPointsForCharacter(currentCharacter, spellSlotLevel)
    );
    closeActionDrawer();
  }

  function createSpellSlotFromSorceryPoints(spellSlotLevel: number) {
    onPersistCharacter((currentCharacter) => {
      const preparedCharacter = prepareCharacterForRoundTrackerResourceConsumption(
        currentCharacter,
        "bonusAction"
      );
      const nextCharacter = createSpellSlotFromSorceryPointsForCharacter(
        preparedCharacter,
        spellSlotLevel
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return consumeRoundTrackerResourceForCharacter(nextCharacter, "bonusAction");
    });

    closeActionDrawer();
  }

  function confirmFontOfMagicSelection() {
    if (!selectedFontOfMagicSelection) {
      return;
    }

    if (selectedFontOfMagicSelection.kind === "slot-to-points") {
      convertSpellSlotToSorceryPoints(selectedFontOfMagicSelection.spellSlotLevel);
      return;
    }

    createSpellSlotFromSorceryPoints(selectedFontOfMagicSelection.spellSlotLevel);
  }

  function useFixedSpellAction(options?: { useBeguilingMagic?: boolean }) {
    if (!fixedSpellExecute || !fixedSpellEntry || !selectedFeatureAction) {
      return;
    }

    const useBeguilingMagic = options?.useBeguilingMagic === true;
    const minimumSlotLevel = Math.max(
      getSpellLevel(fixedSpellEntry),
      fixedSpellMinimumActionSlotLevel ?? 1
    );
    const slotLevel = Math.max(minimumSlotLevel, selectedFixedSpellSlotLevel);
    const castsWithoutSpellSlot =
      fixedSpellFreeCastSlotLevel !== null && slotLevel === fixedSpellFreeCastSlotLevel;

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      let nextCharacter = preparedCharacter;
      const spellSlotTotals = getSpellSlotTotalsForCharacter(
        preparedCharacter.className,
        preparedCharacter.level
      );
      const spellSlotsExpended = normalizeSpellSlotsExpended(
        preparedCharacter.spellSlotsExpended,
        spellSlotTotals
      );
      const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
        Math.max(0, total - (spellSlotsExpended[index] ?? 0))
      );

      if (fixedSpellExecute.effectKind === "paladins-smite") {
        nextCharacter = consumePaladinsSmiteUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "faithful-steed") {
        nextCharacter = consumeFaithfulSteedUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "favored-enemy") {
        nextCharacter = consumeRangerFavoredEnemyUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "contact-patron") {
        nextCharacter = consumeContactPatronUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "mantle-of-majesty") {
        nextCharacter =
          getMantleOfMajestyUsesRemainingForCharacter(preparedCharacter) > 0
            ? consumeMantleOfMajestyUseForCharacter(preparedCharacter)
            : preparedCharacter;
      }

      if (
        nextCharacter === preparedCharacter &&
        fixedSpellExecute.effectKind !== "mantle-of-majesty"
      ) {
        return currentCharacter;
      }

      let nextCharacterWithSpellSlot = nextCharacter;

      if (fixedSpellConsumesSpellSlot && !castsWithoutSpellSlot) {
        if ((spellSlotsRemaining[slotLevel - 1] ?? 0) <= 0) {
          return currentCharacter;
        }

        const nextSpellSlotsExpended = [...spellSlotsExpended];
        nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;
        nextCharacterWithSpellSlot = {
          ...nextCharacter,
          spellSlotsExpended: nextSpellSlotsExpended
        };
      }

      const nextCharacterWithConcentration =
        fixedSpellExecute.effectKind === "mantle-of-majesty"
          ? applyMantleOfMajestyStatusForCharacter(nextCharacterWithSpellSlot)
          : {
              ...nextCharacterWithSpellSlot,
              statusEntries: applySpellConcentrationToStatusEntries(
                nextCharacterWithSpellSlot.statusEntries,
                fixedSpellEntry
              )
            };
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithConcentration)
        : nextCharacterWithConcentration;

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(
            nextCharacterWithBeguilingMagic,
            roundTrackerResource
          )
        : nextCharacterWithBeguilingMagic;
    });

    closeActionDrawer();
  }

  function useDivineInterventionSpell(options?: { useBeguilingMagic?: boolean }) {
    if (!selectedDivineInterventionSpell || !selectedFeatureAction) {
      return;
    }

    const useBeguilingMagic = options?.useBeguilingMagic === true;

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionForCharacter(
        preparedCharacter,
        selectedFeatureAction.key
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithConcentration = {
        ...nextCharacter,
        statusEntries: applySpellConcentrationToStatusEntries(
          nextCharacter.statusEntries,
          selectedDivineInterventionSpell
        )
      };
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithConcentration)
        : nextCharacterWithConcentration;

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(
            nextCharacterWithBeguilingMagic,
            roundTrackerResource
          )
        : nextCharacterWithBeguilingMagic;
    });

    closeActionDrawer();
  }

  function openMysticArcanumSpell(spellLevel: number, spell: SpellEntry) {
    if (spellLevel !== 6 && spellLevel !== 7 && spellLevel !== 8 && spellLevel !== 9) {
      return;
    }

    setSelectedMysticArcanumSpell(spell);
    setSelectedMysticArcanumSpellLevel(spellLevel);
  }

  function useMysticArcanumSpell(options?: { useBeguilingMagic?: boolean }) {
    if (!selectedMysticArcanumSpell || selectedMysticArcanumSpellLevel === null) {
      return;
    }

    const useBeguilingMagic = options?.useBeguilingMagic === true;

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForSpell(selectedMysticArcanumSpell);
      const preparedCharacter = roundTrackerResource
        ? prepareCharacterForRoundTrackerResourceConsumption(currentCharacter, roundTrackerResource)
        : currentCharacter;
      const nextCharacter = consumeMysticArcanumUseForCharacter(
        preparedCharacter,
        selectedMysticArcanumSpellLevel
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithConcentration = {
        ...nextCharacter,
        statusEntries: applySpellConcentrationToStatusEntries(
          nextCharacter.statusEntries,
          selectedMysticArcanumSpell
        )
      };
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithConcentration)
        : nextCharacterWithConcentration;

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(
            nextCharacterWithBeguilingMagic,
            roundTrackerResource
          )
        : nextCharacterWithBeguilingMagic;
    });

    closeActionDrawer();
  }

  function renderActionDrawerBody() {
    if (!selectedAction) {
      return null;
    }

    if (selectedAction.kind === "weapon") {
      return (
        <div className={styles.weaponDrawerBody}>
          <div className={sheetStyles.spellDrawerDetails}>
            {selectedWeaponDetails.map((detail) => (
              <CellContainer
                key={`${selectedAction.key}-${detail.label}`}
                label={detail.label}
                content={detail.value}
              />
            ))}
          </div>

          <div className={clsx(sheetStyles.spellDrawerDetails, styles.weaponFormulaList)}>
            {selectedWeaponAttackFormula ? (
              <CellContainer
                label={selectedWeaponAttackFormula.label}
                content={selectedWeaponAttackFormula.value}
                breakdown={selectedWeaponAttackFormula.breakdown}
                contentClassName={styles.weaponFormulaValue}
                breakdownClassName={styles.weaponFormulaBreakdown}
              />
            ) : null}

            {selectedWeaponDamageFormula ? (
              <CellContainer
                label={selectedWeaponDamageFormula.label}
                content={selectedWeaponDamageFormula.value}
                breakdown={selectedWeaponDamageFormula.breakdown}
                contentClassName={styles.weaponFormulaValue}
                breakdownClassName={styles.weaponFormulaBreakdown}
              />
            ) : null}
          </div>
        </div>
      );
    }

    if (selectedAction.action.key === barbarianRageActionKey) {
      return (
        <RageActionBody
          action={selectedAction.action}
          rageOptions={selectedRageOptions}
          powerOptions={selectedRagePowerOptions}
          selectedRageOptionKey={selectedRageOptionKey}
          selectedPowerOptionKey={selectedRagePowerOptionKey}
          onSelectRageOption={setSelectedRageOptionKey}
          onSelectPowerOption={setSelectedRagePowerOptionKey}
          rageOfTheGodsUsesRemaining={selectedRageOfTheGodsUsesRemaining}
          rageOfTheGodsUsesTotal={selectedRageOfTheGodsUsesTotal}
          isRageOfTheGodsSelected={isRageOfTheGodsSelected}
          onToggleRageOfTheGods={setIsRageOfTheGodsSelected}
        />
      );
    }

    if (selectedAction.drawer.kind === "options") {
      return (
        <FeatureOptionsActionBody
          action={selectedAction}
          character={character}
          roundTracker={roundTracker}
          selectedOptionKeys={selectedActionOptionKeys}
          onToggleOption={toggleFeatureOptionSelection}
        />
      );
    }

    if (selectedAction.drawer.kind === "custom-form") {
      if (selectedAction.drawer.formKind === "arcane-recovery") {
        return <ArcaneRecoveryActionBody character={character} onRecover={submitArcaneRecovery} />;
      }

      if (selectedAction.drawer.formKind === "indomitable") {
        return (
          <IndomitableActionBody
            options={indomitableSavingThrowOptions}
            onRoll={submitIndomitable}
          />
        );
      }

      if (selectedAction.drawer.formKind === "lay-on-hands") {
        return (
          <LayOnHandsActionBody
            conditionOptions={getLayOnHandsCurableConditionsForCharacter(character)}
            remainingPool={getPaladinHealingPoolRemainingForCharacter(character)}
            onSubmit={submitLayOnHands}
          />
        );
      }

      if (selectedAction.drawer.formKind === "warrior-of-the-gods") {
        return (
          <WarriorOfTheGodsActionBody
            remainingCharges={selectedAction.action.usesRemaining ?? 0}
            onSubmit={submitWarriorOfTheGods}
          />
        );
      }

      if (selectedAction.drawer.formKind === "sneak-attack") {
        return (
          <SneakAttackActionBody
            action={selectedAction.action}
            character={character}
            onConfirm={submitSneakAttack}
          />
        );
      }

      if (selectedAction.drawer.formKind === "font-of-magic") {
        return (
          <FontOfMagicActionBody
            actionWarning={selectedFontOfMagicWarning}
            character={character}
            selectedSelection={selectedFontOfMagicSelection}
            onSelectSelection={setSelectedFontOfMagicSelection}
          />
        );
      }

      if (selectedAction.drawer.formKind === "wild-heart-rage") {
        return (
          <RageActionBody
            action={selectedAction.action}
            rageOptions={selectedRageOptions}
            powerOptions={selectedRagePowerOptions}
            selectedRageOptionKey={selectedRageOptionKey}
            selectedPowerOptionKey={selectedRagePowerOptionKey}
            onSelectRageOption={setSelectedRageOptionKey}
            onSelectPowerOption={setSelectedRagePowerOptionKey}
            rageOfTheGodsUsesRemaining={selectedRageOfTheGodsUsesRemaining}
            rageOfTheGodsUsesTotal={selectedRageOfTheGodsUsesTotal}
            isRageOfTheGodsSelected={isRageOfTheGodsSelected}
            onToggleRageOfTheGods={setIsRageOfTheGodsSelected}
          />
        );
      }

      if (selectedAction.drawer.formKind === "brutal-strike") {
        return (
          <BrutalStrikeActionBody
            options={selectedAction.drawer.options ?? []}
            selectionLimit={getBarbarianBrutalStrikeSelectionLimit(character)}
            damageFormula={getBarbarianBrutalStrikeDamageFormula(character)}
            onConfirm={submitBrutalStrike}
          />
        );
      }
    }

    if (selectedAction.drawer.kind === "spell-list") {
      if (
        selectedAction.execute.kind === "spell" &&
        selectedAction.execute.spellSource === "divine-intervention"
      ) {
        return (
          <DivineInterventionActionBody
            character={character}
            onSpellSelect={setSelectedDivineInterventionSpell}
          />
        );
      }

      return (
        <MysticArcanumActionBody character={character} onSpellSelect={openMysticArcanumSpell} />
      );
    }

    return null;
  }

  function renderActionHeaderAside() {
    if (!selectedAction) {
      return null;
    }

    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <div className={styles.actionDrawerHeaderMeta}>
        <span className={styles.actionDrawerMetaTag}>
          {getActionCategoryLabel(selectedAction.actionCategory)}
        </span>
        {selectedWeaponRollState ? (
          <RollStatePill
            tone={selectedWeaponRollState.tone}
            label={selectedWeaponRollState.label}
          />
        ) : null}
        {actionShape && selectedActionEconomyShapeState ? (
          <div className={styles.actionDrawerEconomyPill}>
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState.isAvailable}
              multiCount={selectedActionEconomyShapeState.multiCount}
              aria-label={getEconomyLabel(selectedAction.economyType)}
            />
            <span>{getEconomyLabel(selectedAction.economyType)}</span>
          </div>
        ) : (
          <span className={styles.actionDrawerMetaTag}>
            {getEconomyLabel(selectedAction.economyType)}
          </span>
        )}
      </div>
    );
  }

  function renderActionDrawerFooter() {
    if (!selectedAction) {
      return null;
    }

    if (selectedAction.kind === "weapon") {
      return (
        <div className={styles.weaponFooterActions}>
          <button
            type="button"
            className={clsx(sheetStyles.castButton, styles.weaponFooterButton)}
            onClick={() => handleWeaponAttackRoll(selectedAction.action)}
            disabled={selectedActionWarning !== null}
          >
            <img src={d20Icon} alt="" className={styles.weaponFooterIcon} />
            <span>Attack</span>
            {selectedActionEconomyShapeState ? (
              <ActionShape
                shape={getActionShapeForEconomyType(selectedAction.economyType) ?? "action"}
                isSelected={selectedActionEconomyShapeState.isAvailable}
                multiCount={selectedActionEconomyShapeState.multiCount}
                className={styles.footerActionShape}
              />
            ) : null}
          </button>
          <button
            type="button"
            className={clsx(sheetStyles.castButton, styles.weaponFooterButton)}
            onClick={() => handleWeaponDamageRoll(selectedAction.action)}
          >
            <img src={d20Icon} alt="" className={styles.weaponFooterIcon} />
            <span>Damage</span>
          </button>
          <DiceRollerSettingsButton
            actionName={selectedAction.name}
            className={clsx(sheetStyles.castButton, styles.weaponFooterIconButton)}
            isOpen={isDiceRollerSettingsOpen}
            aria-label="Open dice roller settings"
            onOpenChange={setIsDiceRollerSettingsOpen}
          />
        </div>
      );
    }

    if (
      selectedAction.kind === "feature" &&
      selectedAction.drawer.kind === "confirm" &&
      selectedAction.execute.kind === "activate" &&
      selectedAction.execute.effectKind === "bardic-inspiration-roll"
    ) {
      const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

      return (
        <div className={styles.weaponFooterActions}>
          <button
            type="button"
            className={clsx(sheetStyles.castButton, styles.weaponFooterButton)}
            onClick={() => executeFeatureActivate(selectedAction.action)}
            disabled={selectedActionWarning !== null}
          >
            <img src={d20Icon} alt="" className={styles.weaponFooterIcon} />
            <span>{selectedAction.drawer.confirmLabel}</span>
            {actionShape ? (
              <ActionShape
                shape={actionShape}
                isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
                multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
                className={styles.footerActionShape}
              />
            ) : null}
          </button>
          <DiceRollerSettingsButton
            actionName={selectedAction.name}
            className={clsx(sheetStyles.castButton, styles.weaponFooterIconButton)}
            isOpen={isDiceRollerSettingsOpen}
            aria-label="Open dice roller settings"
            onOpenChange={setIsDiceRollerSettingsOpen}
          />
        </div>
      );
    }

    if (selectedAction.drawer.kind === "options") {
      const selectedOption = selectedDrawerOption;
      const selectedOptionShape = selectedOption
        ? getActionShapeForEconomyType(selectedOption.economyType)
        : null;

      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={confirmSelectedFeatureOptions}
          disabled={
            !selectedOption ||
            selectedOption.disabled === true ||
            selectedOptionWarning !== null ||
            (selectedFeatureAction?.key === metamagicActionKey &&
              selectedMetamagicCost > getSorceryPointsRemainingForCharacter(character))
          }
        >
          <span>{selectedAction.drawer.confirmLabel ?? "Confirm"}</span>
          {selectedOptionShape ? (
            <ActionShape
              shape={selectedOptionShape}
              isSelected={
                selectedOption
                  ? getRoundTrackerActionWarning(
                      getRoundTrackerResourceForEconomyType(selectedOption.economyType),
                      roundTracker
                    ) === null
                  : true
              }
              className={styles.footerActionShape}
            />
          ) : null}
        </button>
      );
    }

    if (
      selectedAction.kind === "feature" &&
      selectedAction.drawer.kind === "custom-form" &&
      selectedAction.drawer.formKind === "font-of-magic"
    ) {
      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={confirmFontOfMagicSelection}
          disabled={
            selectedFontOfMagicSelection === null ||
            (selectedFontOfMagicSelection.kind === "points-to-slot" &&
              selectedFontOfMagicWarning !== null)
          }
        >
          <span>Convert</span>
          {selectedFontOfMagicSelection?.kind === "points-to-slot" ? (
            <ActionShape
              shape="bonusAction"
              isSelected={selectedFontOfMagicWarning === null}
              className={styles.footerActionShape}
            />
          ) : null}
        </button>
      );
    }

    if (selectedAction.kind === "feature" && selectedAction.action.key === barbarianRageActionKey) {
      const requiresRageOption = selectedRageOptions.length > 0;
      const requiresPowerOption = selectedRagePowerOptions.length > 0;
      const canConfirm =
        (!requiresRageOption || selectedRageOptionKey !== null) &&
        (!requiresPowerOption || selectedRagePowerOptionKey !== null);

      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={submitRage}
          disabled={!canConfirm || selectedActionWarning !== null}
        >
          <span>Enter Rage</span>
          <ActionShape
            shape="bonusAction"
            isSelected={selectedActionWarning === null}
            className={styles.footerActionShape}
          />
        </button>
      );
    }

    if (selectedAction.drawer.kind !== "confirm") {
      return null;
    }

    if (selectedAction.execute.kind === "activate") {
      const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={() => executeFeatureActivate(selectedAction.action)}
          disabled={selectedActionWarning !== null}
        >
          <span>{selectedAction.drawer.confirmLabel}</span>
          {actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null}
        </button>
      );
    }

    if (selectedAction.execute.kind === "spell") {
      const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={() => setIsFixedSpellDrawerOpen(true)}
        >
          <span>{selectedAction.drawer.confirmLabel}</span>
          {actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null}
        </button>
      );
    }

    return null;
  }

  return (
    <>
      <section className={clsx(widgetShellStyles.widgetCard, styles.root)}>
        <header className={widgetShellStyles.widgetHeader}>
          <p className={widgetShellStyles.widgetTitle}>Actions</p>
        </header>
        {combatActions.length === 0 ? (
          <p className={shared.emptyText}>No actions available. Equip a weapon to roll attacks.</p>
        ) : (
          <div className={styles.grid}>
            {combatActions.map((combatAction) =>
              combatAction.kind === "weapon" ? (
                <WeaponActionCard
                  key={combatAction.key}
                  action={combatAction.action}
                  roundTracker={roundTracker}
                  onClick={() => setSelectedActionKey(combatAction.key)}
                />
              ) : (
                <FeatureActionCardButton
                  key={combatAction.key}
                  action={combatAction.action}
                  character={character}
                  roundTracker={roundTracker}
                  onClick={() => setSelectedActionKey(combatAction.key)}
                />
              )
            )}
          </div>
        )}
      </section>

      {selectedAction ? (
        <GameplayActionDrawer
          title={selectedAction.name}
          eyebrow={selectedAction.drawer.eyebrow}
          headerAside={renderActionHeaderAside()}
          description={
            selectedAction.kind === "weapon"
              ? selectedWeaponDescription
              : selectedAction.drawer.description
          }
          facts={selectedAction.kind === "weapon" ? [] : selectedAction.drawer.facts}
          resources={selectedAction.kind === "weapon" ? [] : selectedAction.drawer.resources}
          helperText={selectedAction.drawer.helperText}
          warning={selectedDrawerWarning}
          blockedReason={selectedAction.disabledReason ?? null}
          onClose={closeActionDrawer}
          footer={renderActionDrawerFooter()}
        >
          {renderActionDrawerBody()}
        </GameplayActionDrawer>
      ) : null}

      {isFixedSpellDrawerOpen && fixedSpellEntry && fixedSpellExecute ? (
        <CharacterSpellDrawer
          character={character}
          spell={fixedSpellEntry}
          alwaysPrepared
          mode="standard"
          spellSlotTotals={fixedSpellSlotTotals}
          spellSlotsRemaining={fixedSpellSlotsRemaining}
          selectedSpellSlotLevel={selectedFixedSpellSlotLevel}
          onSelectedSpellSlotLevelChange={setSelectedFixedSpellSlotLevel}
          onClose={() => {
            setUseBeguilingMagicOnActionSpell(false);
            setIsFixedSpellDrawerOpen(false);
          }}
          onAction={(options) =>
            useFixedSpellAction({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnActionSpell
            })
          }
          actionLabel={fixedSpellExecute.actionLabel}
          actionConsumesSpellSlot={fixedSpellConsumesSpellSlot}
          minimumActionSpellSlotLevel={fixedSpellMinimumActionSlotLevel ?? undefined}
          freeCastSlotLevel={fixedSpellFreeCastSlotLevel}
          actionContextText={fixedSpellActionContextText}
          actionAvailabilityText={fixedSpellActionAvailabilityText}
          actionWarning={selectedActionWarning}
          actionDisabled={selectedActionWarning !== null}
          blockedReason={spellcastingState.blocked ? spellcastingState.reason : null}
          allowRitualCasting={fixedSpellExecute.allowRitualCasting}
          actionOptions={
            selectedActionSpellSupportsBeguilingMagic
              ? [
                  {
                    id: "beguiling-magic",
                    label: "Beguiling Magic",
                    checked: useBeguilingMagicOnActionSpell,
                    onCheckedChange: setUseBeguilingMagicOnActionSpell,
                    disabled:
                      beguilingMagicUsesRemaining <= 0 && bardicInspirationUsesRemaining <= 0,
                    tracker: {
                      current: beguilingMagicUsesRemaining,
                      total: beguilingMagicUsesTotal
                    },
                    fallbackCost:
                      beguilingMagicUsesRemaining <= 0
                        ? {
                            label: "Use 1",
                            icon: "music"
                          }
                        : undefined
                  }
                ]
              : undefined
          }
          backdropClassName={styles.divineInterventionDrawerBackdrop}
        />
      ) : null}

      {selectedDivineInterventionSpell && selectedFeatureAction ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedDivineInterventionSpell}
          mode="divine-intervention"
          spellSlotTotals={Array.from({ length: 9 }, () => 0)}
          spellSlotsRemaining={Array.from({ length: 9 }, () => 0)}
          selectedSpellSlotLevel={1}
          onSelectedSpellSlotLevelChange={() => {}}
          onClose={() => {
            setUseBeguilingMagicOnActionSpell(false);
            setSelectedDivineInterventionSpell(null);
          }}
          onAction={(options) =>
            useDivineInterventionSpell({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnActionSpell
            })
          }
          actionLabel="Divine Intervention"
          actionWarning={selectedActionWarning}
          actionDisabled={selectedActionWarning !== null}
          blockedReason={selectedDivineInterventionBlockedReason}
          actionAvailabilityText={selectedFeatureAction.usesLabel ?? null}
          actionOptions={
            selectedActionSpellSupportsBeguilingMagic
              ? [
                  {
                    id: "beguiling-magic",
                    label: "Beguiling Magic",
                    checked: useBeguilingMagicOnActionSpell,
                    onCheckedChange: setUseBeguilingMagicOnActionSpell,
                    disabled:
                      beguilingMagicUsesRemaining <= 0 && bardicInspirationUsesRemaining <= 0,
                    tracker: {
                      current: beguilingMagicUsesRemaining,
                      total: beguilingMagicUsesTotal
                    },
                    fallbackCost:
                      beguilingMagicUsesRemaining <= 0
                        ? {
                            label: "Use 1",
                            icon: "music"
                          }
                        : undefined
                  }
                ]
              : undefined
          }
          backdropClassName={styles.divineInterventionDrawerBackdrop}
        />
      ) : null}

      {selectedMysticArcanumSpell ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedMysticArcanumSpell}
          alwaysPrepared
          mode="standard"
          spellSlotTotals={Array.from({ length: 9 }, () => 0)}
          spellSlotsRemaining={Array.from({ length: 9 }, () => 0)}
          selectedSpellSlotLevel={
            selectedMysticArcanumSpellLevel ?? selectedMysticArcanumSpell.spellLevel
          }
          onSelectedSpellSlotLevelChange={() => {}}
          onClose={() => {
            setUseBeguilingMagicOnActionSpell(false);
            setSelectedMysticArcanumSpell(null);
            setSelectedMysticArcanumSpellLevel(null);
          }}
          onAction={(options) =>
            useMysticArcanumSpell({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnActionSpell
            })
          }
          actionConsumesSpellSlot={false}
          actionContextText="Using Mystic Arcanum"
          actionAvailabilityText="Cast without expending a spell slot. Mystic Arcanum spells can't be upcast."
          actionWarning={
            selectedMysticArcanumExpended
              ? "This arcanum recharges on a Long Rest."
              : selectedMysticArcanumActionWarning
          }
          actionDisabled={
            selectedMysticArcanumExpended || selectedMysticArcanumActionWarning !== null
          }
          blockedReason={selectedMysticArcanumBlockedReason}
          actionOptions={
            selectedActionSpellSupportsBeguilingMagic
              ? [
                  {
                    id: "beguiling-magic",
                    label: "Beguiling Magic",
                    checked: useBeguilingMagicOnActionSpell,
                    onCheckedChange: setUseBeguilingMagicOnActionSpell,
                    disabled:
                      beguilingMagicUsesRemaining <= 0 && bardicInspirationUsesRemaining <= 0,
                    tracker: {
                      current: beguilingMagicUsesRemaining,
                      total: beguilingMagicUsesTotal
                    },
                    fallbackCost:
                      beguilingMagicUsesRemaining <= 0
                        ? {
                            label: "Use 1",
                            icon: "music"
                          }
                        : undefined
                  }
                ]
              : undefined
          }
          backdropClassName={styles.divineInterventionDrawerBackdrop}
        />
      ) : null}

      {diceRollerPopup}
    </>
  );
}

export default ActionsWidget;
