import { createElement, type ReactNode } from "react";
import type { SpellDescriptionEntry } from "../../../../../codex/entries";
import type { ItemRecord, MonsterRecord } from "../../../../../types";
import { buildItemDetailPresentation } from "../../../../../pages/ItemCodexEntryPage/itemPresentation";
import { adaptItemWeapon } from "../../../../../utils/items/adaptItemWeapon";
import WeaponMasteryStatusLabel from "../../../../WeaponMasteryStatusLabel/WeaponMasteryStatusLabel";
import type { WeaponAction } from "../../../../../pages/CharactersPage/gameplay";
import type { AbilityModifierBonusEntry } from "../../../../../pages/CharactersPage/abilities";
import type { WeaponEntry } from "../../../../../codex/entries";
import {
  formatFormulaBreakdown,
  formatSignedFormulaTerm,
  parseFormulaRange
} from "../../../../../pages/CharactersPage/shared/formulas";
import {
  formatCodexLabel,
  formatWeaponDamage,
  formatWeaponProperties,
  formatWeaponType
} from "../../../../../utils/codex";

type WeaponFormulaPresentation = {
  label: string;
  value: string;
  breakdown?: string;
};

type WeaponDrawerDetail = {
  key: string;
  label: ReactNode;
  value: ReactNode;
};

type WeaponDrawerDescription = {
  description: SpellDescriptionEntry[];
  descriptionAdditions: SpellDescriptionEntry[][];
};

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
          ...(group.numericTotal !== 0 || group.diceTerms.length === 0
            ? [`${group.numericTotal}`]
            : [])
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

function formatAbilityModifierBonusEntry(entry: AbilityModifierBonusEntry) {
  return formatSignedFormulaTerm(entry.value, entry.label);
}

function formatWeaponRangePrefix(formula: string) {
  const parsedRange = parseFormulaRange(formula);

  if (!parsedRange) {
    return "Damage";
  }

  if (parsedRange.minimum === parsedRange.maximum) {
    return `${parsedRange.minimum} Damage`;
  }

  return `${parsedRange.minimum}~${parsedRange.maximum} Damage`;
}

export function appendRollModifier(baseFormula: string, modifier: number) {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula}${modifier > 0 ? "+" : ""}${modifier}`;
}

export function getWeaponAttackFormulaPresentation(
  action: WeaponAction
): WeaponFormulaPresentation {
  const attackModifier = action.abilityModifier + action.proficiencyBonus;
  const breakdownEntries = [
    formatSignedFormulaTerm(action.abilityModifierBaseValue, action.ability),
    ...action.abilityModifierBonusEntries.map((entry) => formatAbilityModifierBonusEntry(entry))
  ];

  if (action.proficiencyBonus !== 0) {
    breakdownEntries.push(
      action.proficiencyLabel.trim().length > 0
        ? `${Math.abs(action.proficiencyBonus)} Prof (${formatWeaponProficiencyLabel(action.proficiencyLabel)})`
        : `${Math.abs(action.proficiencyBonus)} Prof. Bonus`
    );
  }

  return {
    label: "Attack Roll Formula",
    value: joinWeaponFormulaTerms(["d20", `${attackModifier}`]),
    breakdown: formatFormulaBreakdown(breakdownEntries)
  };
}

export function getWeaponDamageFormulaPresentation(
  action: WeaponAction
): WeaponFormulaPresentation {
  const damageAbility = action.damageAbility ?? action.ability;
  const damageAbilityModifierBaseValue =
    action.damageAbilityModifierBaseValue ?? action.abilityModifierBaseValue;
  const damageAbilityModifierBonusEntries =
    action.damageAbilityModifierBonusEntries ?? action.abilityModifierBonusEntries;
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
  const damageAbilityModifierTotal =
    damageAbilityModifierBaseValue +
    damageAbilityModifierBonusEntries.reduce((total, entry) => total + entry.value, 0);

  addExpressionToDamageGroup(mainDamageGroup, parsedBaseDamage.expression);
  mainDamageGroup.preferNumericFirst =
    mainDamageGroup.diceTerms.length === 0 && mainDamageGroup.numericTotal !== 0;

  if (action.damageBreakdownLabel) {
    breakdownEntries.push(action.damageBreakdownLabel);
  }

  if (action.attackKind === "unarmed" && action.hasMartialArtsDamageDie) {
    breakdownEntries.push("Martial Arts");
  }

  if (damageAbilityModifierBaseValue !== 0) {
    mainDamageGroup.numericTotal += damageAbilityModifierBaseValue;
    breakdownEntries.push(formatSignedFormulaTerm(damageAbilityModifierBaseValue, damageAbility));
  }

  damageAbilityModifierBonusEntries.forEach((entry) => {
    mainDamageGroup.numericTotal += entry.value;
    breakdownEntries.push(formatAbilityModifierBonusEntry(entry));
  });

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
      if (entry.label.trim().length > 0) {
        breakdownEntries.push(entry.label);
      }
      return;
    }

    const existingGroup = typedBonusGroups.get(parsedBonusDamage.damageType) ?? {
      damageType: parsedBonusDamage.damageType,
      diceTerms: [],
      numericTotal: 0
    };

    addExpressionToDamageGroup(existingGroup, parsedBonusDamage.expression);
    typedBonusGroups.set(parsedBonusDamage.damageType, existingGroup);
    if (entry.label.trim().length > 0) {
      breakdownEntries.push(entry.label);
    }
  });

  const damageFormula = appendRollModifier(action.damageFormula, damageAbilityModifierTotal);
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
      breakdownEntries.length > 0
        ? formatFormulaBreakdown(breakdownEntries)
        : undefined
  };
}

export function getWeaponDrawerDetails(
  action: WeaponAction,
  weaponEntry:
    | (Pick<
        WeaponEntry,
        "damage" | "type" | "properties" | "range" | "versatileDamage" | "propertyNotes"
      > & {
        mastery?: WeaponEntry["mastery"];
      })
    | null,
  itemRecord?: ItemRecord | null,
  options?: {
    hasActiveMastery?: boolean;
    hasWeaponProficiency?: boolean;
  }
): WeaponDrawerDetail[] {
  if (action.details && action.details.length > 0) {
    return action.details.map((detail, index) => ({
      key: `${detail.label.toLowerCase().replace(/\s+/g, "-")}-${index}`,
      label: detail.label,
      value: detail.value
    }));
  }

  const adaptedItemWeapon = itemRecord ? adaptItemWeapon(itemRecord) : null;
  const typeLabel = options?.hasWeaponProficiency
    ? createElement(WeaponMasteryStatusLabel, {
        label: "Type",
        status: "PROFICIENT"
      })
    : "Type";
  const masteryLabel = options?.hasActiveMastery
    ? createElement(WeaponMasteryStatusLabel, {
        label: "Mastery",
        status: "MASTERED"
      })
    : "Mastery";

  if (adaptedItemWeapon) {
    const selectedDamage =
      action.hasVersatileBonus && adaptedItemWeapon.versatileDamage?.length
        ? adaptedItemWeapon.versatileDamage
        : adaptedItemWeapon.damage;

    return [
      {
        key: "type",
        label: typeLabel,
        value: formatWeaponType(adaptedItemWeapon.type)
      },
      {
        key: "damage",
        label: "Damage",
        value: selectedDamage?.length
          ? formatWeaponDamage(selectedDamage)
          : adaptedItemWeapon.damageLabel || action.damageLabel
      },
      {
        key: "properties",
        label: "Properties",
        value: adaptedItemWeapon.propertyLabels.join(", ") || "None"
      },
      {
        key: "mastery",
        label: masteryLabel,
        value: adaptedItemWeapon.masteryLabels.join(", ") || "None"
      }
    ];
  }

  if (action.attackKind === "unarmed") {
    return [];
  }

  if (!weaponEntry) {
    return [
      {
        key: "type",
        label: typeLabel,
        value: "Weapon"
      },
      {
        key: "damage",
        label: "Damage",
        value: action.damageLabel
      },
      {
        key: "properties",
        label: "Properties",
        value: "None"
      },
      {
        key: "mastery",
        label: masteryLabel,
        value: "None"
      }
    ];
  }

  const selectedDamage =
    action.hasVersatileBonus && weaponEntry.versatileDamage?.length
      ? weaponEntry.versatileDamage
      : weaponEntry.damage;

  return [
    {
      key: "type",
      label: typeLabel,
      value: formatWeaponType(weaponEntry.type)
    },
    {
      key: "damage",
      label: "Damage",
      value: formatWeaponDamage(selectedDamage)
    },
    {
      key: "properties",
      label: "Properties",
      value: formatWeaponProperties(weaponEntry)
    },
    {
      key: "mastery",
      label: masteryLabel,
      value: weaponEntry.mastery ? formatCodexLabel(weaponEntry.mastery) : "None"
    }
  ];
}

export function getWeaponDrawerDescription(
  action: WeaponAction,
  itemRecord?: ItemRecord | null
): WeaponDrawerDescription {
  const actionDescription = action.description?.length ? [...action.description] : [];
  const actionDescriptionAdditions =
    action.descriptionAdditions?.map((section) => [...section]) ?? [];
  const itemDescription =
    itemRecord && itemRecord.weapon ? buildItemDetailPresentation(itemRecord).description : [];

  if (actionDescription.length > 0) {
    return {
      description: actionDescription,
      descriptionAdditions: actionDescriptionAdditions
    };
  }

  if (itemDescription.length > 0) {
    return {
      description: itemDescription,
      descriptionAdditions: actionDescriptionAdditions
    };
  }

  return {
    description: [],
    descriptionAdditions: actionDescriptionAdditions
  };
}

export function formatWildShapeMonsterMeta(monster: MonsterRecord): string {
  return [
    monster.size?.trim(),
    monster.type?.trim() ? formatCodexLabel(monster.type) : null,
    monster.document__slug?.trim() || null,
    monster.challenge_rating?.trim() ? `CR ${monster.challenge_rating.trim()}` : null
  ]
    .filter((value): value is string => Boolean(value))
    .join(", ");
}
