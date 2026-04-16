import type { ReactNode } from "react";
import type { SpellDescriptionEntry } from "../../../../../codex/entries";
import type { ItemRecord, MonsterRecord } from "../../../../../types";
import { parseRollFormulaRange } from "../../../../../pages/CharactersPage/actionOutcome";
import { buildItemDetailPresentation } from "../../../../../pages/ItemCodexEntryPage/itemPresentation";
import { adaptItemWeapon } from "../../../../../utils/items/adaptItemWeapon";
import {
  formatAbilityModifier,
  type WeaponAction
} from "../../../../../pages/CharactersPage/gameplay";
import type { WeaponEntry } from "../../../../../codex/entries";
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
  label: string;
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

export function getWeaponDamageFormulaPresentation(
  action: WeaponAction
): WeaponFormulaPresentation {
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
      breakdownEntries.length > 0
        ? `[= ${joinWeaponBreakdownEntries(breakdownEntries)}]`
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
  itemRecord?: ItemRecord | null
): WeaponDrawerDetail[] {
  if (action.details && action.details.length > 0) {
    return action.details;
  }

  const adaptedItemWeapon = itemRecord ? adaptItemWeapon(itemRecord) : null;

  if (adaptedItemWeapon) {
    const selectedDamage =
      action.hasVersatileBonus && adaptedItemWeapon.versatileDamage?.length
        ? adaptedItemWeapon.versatileDamage
        : adaptedItemWeapon.damage;

    return [
      {
        label: "Type",
        value: formatWeaponType(adaptedItemWeapon.type)
      },
      {
        label: "Damage",
        value: selectedDamage?.length
          ? formatWeaponDamage(selectedDamage)
          : adaptedItemWeapon.damageLabel || action.damageLabel
      },
      {
        label: "Properties",
        value: adaptedItemWeapon.propertyLabels.join(", ") || "None"
      },
      {
        label: "Mastery",
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
        label: "Type",
        value: "Weapon"
      },
      {
        label: "Damage",
        value: action.damageLabel
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

  const selectedDamage =
    action.hasVersatileBonus && weaponEntry.versatileDamage?.length
      ? weaponEntry.versatileDamage
      : weaponEntry.damage;

  return [
    {
      label: "Type",
      value: formatWeaponType(weaponEntry.type)
    },
    {
      label: "Damage",
      value: formatWeaponDamage(selectedDamage)
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
