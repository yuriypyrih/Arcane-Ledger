import { createElement, type ReactNode } from "react";
import type { SpellDescriptionEntry } from "../../../../../../codex/entries";
import type { ItemRecord, MonsterRecord } from "../../../../../../types";
import { buildItemDetailPresentation } from "../../../../../../pages/ItemCodexEntryPage/itemPresentation";
import { adaptItemWeapon } from "../../../../../../utils/items/adaptItemWeapon";
import WeaponMasteryStatusLabel from "../../../../../WeaponMasteryStatusLabel/WeaponMasteryStatusLabel";
import type { WeaponAction } from "../../../../../../pages/CharactersPage/gameplay";
import type { AbilityModifierBonusEntry } from "../../../../../../pages/CharactersPage/abilities";
import { formatCustomTraitBonusFormulaTerm } from "../../../../../../pages/CharactersPage/customTraitEffects";
import { DAMAGE_TYPE, type WeaponEntry } from "../../../../../../codex/entries";
import {
  formatFormulaBreakdown,
  formatSignedFormulaTerm,
  parseFormulaRange
} from "../../../../../../pages/CharactersPage/shared/formulas";
import {
  formatCodexLabel,
  formatWeaponDamage,
  formatWeaponProperties,
  formatWeaponTypeWithBaseWeapon
} from "../../../../../../utils/codex";
import { resolveWeaponBaseReference } from "../../../../../../utils/items/resolveWeaponBaseReference";

type WeaponFormulaPresentation = {
  label: string;
  value: string;
  breakdown?: string;
};

type WeaponDrawerDetail = {
  key: string;
  label: ReactNode;
  value: ReactNode;
  referenceTitle?: string;
  referenceKeywords?: string[];
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

    const trimmedSuffix = suffix.trim();
    const normalizedSuffixes = trimmedSuffix.startsWith("-")
      ? [` - ${trimmedSuffix.slice(1).trim()}`]
      : trimmedSuffix.startsWith("+")
        ? [` + ${trimmedSuffix.slice(1).trim()}`, ` + ${trimmedSuffix}`]
        : [` + ${trimmedSuffix}`];
    const matchingSuffix = normalizedSuffixes.find((candidate) => expression.endsWith(candidate));

    return matchingSuffix ? expression.slice(0, -matchingSuffix.length) : expression;
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

function normalizeWeaponReferenceLabels(labels: string[]) {
  return labels.map((label) => label.replace(/\s*\([^)]*\)\s*$/, "").trim()).filter(Boolean);
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

const damageTypeLabels = new Set(Object.values(DAMAGE_TYPE).map((type) => formatCodexLabel(type)));

function isDamageTypeLabel(label: string) {
  return label
    .split("/")
    .map((part) => part.trim())
    .every((part) => damageTypeLabels.has(part));
}

function parseDamageTermDisplay(term: string): ParsedDamageDisplay {
  const normalizedTerm = term.trim();
  const match = normalizedTerm.match(/^(.*?)(?:\s+([A-Za-z]+(?:\/[A-Za-z]+)*))$/);

  if (!match || !isDamageTypeLabel(match[2] ?? "")) {
    return {
      expression: normalizedTerm,
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

function parseDamageDisplayGroups(label: string): ParsedDamageDisplay[] {
  const parsedEntries = new Map<string, ParsedDamageDisplay>();

  splitFormulaTerms(label).forEach((term) => {
    const parsedTerm = parseDamageTermDisplay(term);

    if (!parsedTerm.expression) {
      return;
    }

    const key = parsedTerm.damageType ?? "";
    const existingEntry = parsedEntries.get(key);

    parsedEntries.set(
      key,
      existingEntry
        ? {
            ...existingEntry,
            expression: joinWeaponFormulaTerms([existingEntry.expression, parsedTerm.expression])
          }
        : parsedTerm
    );
  });

  return [...parsedEntries.values()];
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
    leadingTerms.push(
      ...group.diceTerms.map((term) => (group.damageType ? `${term} ${group.damageType}` : term))
    );
  }

  return {
    leadingTerms,
    trailingNumericTerm:
      group.numericTotal !== 0 || leadingTerms.length === 0 ? `${group.numericTotal}` : null
  };
}

function formatWeaponDamageBonusEntry(entry: WeaponAction["damageBonusEntries"][number]) {
  const customFormulaLabel = formatCustomTraitBonusFormulaTerm({
    value: entry.value ?? 0,
    abilityModifierSource: entry.abilityModifierSource,
    formulaSourceLabel: entry.formulaSourceLabel
  });

  if (customFormulaLabel) {
    return customFormulaLabel;
  }

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
  return (
    entry.formulaLabel ??
    formatCustomTraitBonusFormulaTerm(entry) ??
    formatSignedFormulaTerm(entry.value, entry.label)
  );
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
  const attackBonusEntries = action.attackBonusEntries ?? [];
  const attackBonusTotal = attackBonusEntries.reduce((total, entry) => total + entry.value, 0);
  const attackModifier = action.abilityModifier + action.proficiencyBonus + attackBonusTotal;
  const abilityFormulaLabel = action.abilityFormulaLabel ?? action.ability;
  const breakdownEntries = [
    formatSignedFormulaTerm(action.abilityModifierBaseValue, abilityFormulaLabel),
    ...action.abilityModifierBonusEntries.map((entry) => formatAbilityModifierBonusEntry(entry)),
    ...attackBonusEntries.map((entry) => formatSignedFormulaTerm(entry.value, entry.label))
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
  const damageAbilityFormulaLabel =
    action.damageAbilityFormulaLabel ?? action.abilityFormulaLabel ?? damageAbility;
  const damageAbilityModifierBaseValue =
    action.damageAbilityModifierBaseValue ?? action.abilityModifierBaseValue;
  const damageAbilityModifierBonusEntries =
    action.damageAbilityModifierBonusEntries ?? action.abilityModifierBonusEntries;
  const damageAbilityModifierSuppressionLabel = action.damageAbilityModifierSuppressionLabel;
  const baseDamageLabel = stripAppendedWeaponBonusExpression(
    action.damageLabel,
    action,
    (entry) => formatWeaponDamageBonusEntry(entry)
  );
  const [primaryBaseDamage, ...additionalBaseDamageGroups] = parseDamageDisplayGroups(
    baseDamageLabel
  );
  const mainDamageGroup: DamageDisplayGroup = {
    damageType: primaryBaseDamage?.damageType ?? null,
    diceTerms: [],
    numericTotal: 0
  };
  const typedBonusGroups = new Map<string, DamageDisplayGroup>();
  const breakdownEntries: string[] = [];
  const damageAbilityModifierTotal =
    damageAbilityModifierBaseValue +
    damageAbilityModifierBonusEntries.reduce((total, entry) => total + entry.value, 0);

  function addParsedDamageDisplay(parsedDamage: ParsedDamageDisplay) {
    if (!parsedDamage.damageType || parsedDamage.damageType === mainDamageGroup.damageType) {
      addExpressionToDamageGroup(mainDamageGroup, parsedDamage.expression);
      return;
    }

    if (
      !mainDamageGroup.damageType &&
      mainDamageGroup.diceTerms.length === 0 &&
      mainDamageGroup.numericTotal === 0
    ) {
      mainDamageGroup.damageType = parsedDamage.damageType;
      addExpressionToDamageGroup(mainDamageGroup, parsedDamage.expression);
      return;
    }

    const existingGroup = typedBonusGroups.get(parsedDamage.damageType) ?? {
      damageType: parsedDamage.damageType,
      diceTerms: [],
      numericTotal: 0
    };

    addExpressionToDamageGroup(existingGroup, parsedDamage.expression);
    typedBonusGroups.set(parsedDamage.damageType, existingGroup);
  }

  if (primaryBaseDamage) {
    addExpressionToDamageGroup(mainDamageGroup, primaryBaseDamage.expression);
  }

  additionalBaseDamageGroups.forEach(addParsedDamageDisplay);
  mainDamageGroup.preferNumericFirst =
    mainDamageGroup.diceTerms.length === 0 && mainDamageGroup.numericTotal !== 0;

  if (action.damageBreakdownLabel) {
    breakdownEntries.push(action.damageBreakdownLabel);
  }

  if (action.attackKind === "unarmed" && action.hasMartialArtsDamageDie) {
    breakdownEntries.push("Martial Arts");
  }

  if (damageAbilityModifierSuppressionLabel) {
    breakdownEntries.push(formatSignedFormulaTerm(0, damageAbilityModifierSuppressionLabel));
  } else if (damageAbilityModifierBaseValue !== 0) {
    mainDamageGroup.numericTotal += damageAbilityModifierBaseValue;
    breakdownEntries.push(
      formatSignedFormulaTerm(damageAbilityModifierBaseValue, damageAbilityFormulaLabel)
    );
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

    const parsedBonusDamages = parseDamageDisplayGroups(entry.displayLabel ?? entry.formula ?? "");

    if (parsedBonusDamages.length === 0) {
      return;
    }

    parsedBonusDamages.forEach(addParsedDamageDisplay);

    if (entry.label.trim().length > 0) {
      breakdownEntries.push(entry.label);
    }
  });

  const damageFormula = appendRollModifier(action.damageFormula, damageAbilityModifierTotal);
  const { leadingTerms: mainLeadingTerms, trailingNumericTerm: mainTrailingNumericTerm } =
    formatMainDamageTerms(mainDamageGroup);
  const visibleTerms = [
    ...mainLeadingTerms,
    ...(damageAbilityModifierSuppressionLabel
      ? [formatSignedFormulaTerm(0, damageAbilityModifierSuppressionLabel)]
      : []),
    ...[...typedBonusGroups.values()].map((group) =>
      formatDamageGroup(group, { wrapMultiTermWithDamageType: true })
    ),
    ...(mainTrailingNumericTerm ? [mainTrailingNumericTerm] : [])
  ].filter(Boolean);

  return {
    label: "Damage Roll Formula",
    value: `${formatWeaponRangePrefix(damageFormula)} = ${joinWeaponFormulaTerms(visibleTerms)}`,
    breakdown: breakdownEntries.length > 0 ? formatFormulaBreakdown(breakdownEntries) : undefined
  };
}

export function getWeaponDrawerDetails(
  action: WeaponAction,
  weaponEntry:
    | (Pick<
        WeaponEntry,
        | "baseWeapon"
        | "damage"
        | "type"
        | "properties"
        | "range"
        | "versatileDamage"
        | "propertyNotes"
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

  if (action.details && action.details.length > 0) {
    return action.details.map((detail, index) => ({
      key: `${detail.label.toLowerCase().replace(/\s+/g, "-")}-${index}`,
      label:
        detail.label === "Type"
          ? typeLabel
          : detail.label === "Mastery"
            ? masteryLabel
            : detail.label,
      value: detail.value,
      referenceTitle: detail.referenceTitle,
      referenceKeywords: detail.referenceKeywords
    }));
  }

  const adaptedItemWeapon = itemRecord ? adaptItemWeapon(itemRecord) : null;
  const itemBaseWeapon =
    action.baseWeapon ??
    (itemRecord
      ? resolveWeaponBaseReference({
          name: itemRecord.weapon?.name ?? itemRecord.name,
          key: itemRecord.key
        })
      : null);

  if (adaptedItemWeapon) {
    const selectedDamage =
      action.hasVersatileBonus && adaptedItemWeapon.versatileDamage?.length
        ? adaptedItemWeapon.versatileDamage
        : adaptedItemWeapon.damage;

    return [
      {
        key: "type",
        label: typeLabel,
        value: formatWeaponTypeWithBaseWeapon(adaptedItemWeapon.type, itemBaseWeapon)
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
        value: adaptedItemWeapon.propertyLabels.join(", ") || "None",
        referenceTitle: "Properties",
        referenceKeywords: normalizeWeaponReferenceLabels(adaptedItemWeapon.propertyLabels)
      },
      {
        key: "mastery",
        label: masteryLabel,
        value: adaptedItemWeapon.masteryLabels.join(", ") || "None",
        referenceTitle: "Mastery",
        referenceKeywords: normalizeWeaponReferenceLabels(adaptedItemWeapon.masteryLabels)
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
        value: action.baseWeapon ? `Weapon (${formatCodexLabel(action.baseWeapon)})` : "Weapon"
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
  const baseWeapon = action.baseWeapon ?? weaponEntry.baseWeapon ?? null;

  return [
    {
      key: "type",
      label: typeLabel,
      value: formatWeaponTypeWithBaseWeapon(weaponEntry.type, baseWeapon)
    },
    {
      key: "damage",
      label: "Damage",
      value: formatWeaponDamage(selectedDamage)
    },
    {
      key: "properties",
      label: "Properties",
      value: formatWeaponProperties(weaponEntry),
      referenceTitle: "Properties",
      referenceKeywords: weaponEntry.properties.map((property) => formatCodexLabel(property))
    },
    {
      key: "mastery",
      label: masteryLabel,
      value: weaponEntry.mastery ? formatCodexLabel(weaponEntry.mastery) : "None",
      referenceTitle: "Mastery",
      referenceKeywords: weaponEntry.mastery ? [formatCodexLabel(weaponEntry.mastery)] : []
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
