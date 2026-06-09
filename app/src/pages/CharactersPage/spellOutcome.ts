import type { SpellEntry, WeaponDamage } from "../../codex/entries";
import type { AbilityKey, Character } from "../../types";
import { getAbilityModifierForCharacter } from "./abilities";
import {
  getSpellDamageBonusesForCharacter,
  getSpellDamageFormulaOverrideForCharacter
} from "./classFeatures";
import { getWizardEvokerEmpoweredEvocationDamageDetail } from "./classFeatures/wizard/subclasses/wizardEvoker";
import {
  areCharacterClassRulesEnforced,
  getCharacterClassRulesSpellcastingAbility
} from "./customClass";
import { getMainAbilityForClass } from "./gameplay";
import {
  formatFormulaRangeLabel,
  formatFormulaTerms,
  parseFormulaRange
} from "./shared/formulas";
import {
  formatCodexLabel,
  formatSpellHealing,
  formatSpellHealingFormula,
  formatWeaponDamage,
  formatWeaponDamageFormula
} from "../../utils/codex";

function getSpellDamageTypeLabel(damage: WeaponDamage): string {
  const labels: string[] = [];
  const seen = new Set<string>();

  damage.forEach(([, damageType]) => {
    const label = (Array.isArray(damageType) ? damageType : [damageType])
      .map((entry) => formatCodexLabel(entry))
      .join("/");

    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  });

  return labels.join("/");
}

type SpellOutcomeCharacter = Pick<
  Character,
  "className" | "abilities" | "level" | "classFeatureState" | "feats" | "cantripIds"
> &
  Partial<Pick<Character, "classRules" | "customClass" | "inventoryItems" | "subclassId">>;

function formatSpellDamageBonusFormulaTerm(entry: {
  value?: number;
  formula?: string;
  formulaMultiplier?: 1 | -1;
}): string | null {
  const formula = entry.formula?.trim();

  if (formula) {
    return `${entry.formulaMultiplier === -1 ? "-" : "+"}${formula}`;
  }

  if (entry.value === undefined || entry.value === 0) {
    return null;
  }

  return entry.value > 0 ? `+${entry.value}` : `${entry.value}`;
}

function getSpellDamageFormulaForCharacter(
  character: SpellOutcomeCharacter,
  spell: SpellEntry
): string {
  const damageBonusTerms = getSpellDamageBonusesForCharacter(character, spell)
    .map(formatSpellDamageBonusFormulaTerm)
    .filter((entry): entry is string => entry !== null && entry.trim().length > 0);

  return formatFormulaTerms([formatWeaponDamageFormula(spell.damage), ...damageBonusTerms]);
}

function formatSignedModifier(value: number): string {
  return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
}

function formatSpellDamageBonusDetail(entry: {
  label: string;
  value?: number;
  formula?: string;
  formulaMultiplier?: 1 | -1;
  displayLabel?: string;
  abilityModifierSource?: AbilityKey;
}): string | null {
  if (entry.displayLabel) {
    return entry.displayLabel;
  }

  if (entry.value !== undefined) {
    const abilityLabel = entry.abilityModifierSource ? ` ${entry.abilityModifierSource}` : "";

    return `${formatSignedModifier(entry.value)}${abilityLabel} (${entry.label})`;
  }

  if (!entry.formula) {
    return null;
  }

  return `${entry.formulaMultiplier === -1 ? "-" : "+"} ${entry.formula} (${entry.label})`;
}

function getSpellcastingAbilityModifier(
  character: Pick<Character, "className" | "abilities"> &
    Partial<Pick<Character, "classRules" | "customClass">>,
  spellcastingAbilityOverride?: AbilityKey | null
): number {
  const mainAbility =
    spellcastingAbilityOverride ??
    (!areCharacterClassRulesEnforced(character)
      ? getCharacterClassRulesSpellcastingAbility(character)
      : getMainAbilityForClass(character.className));

  return mainAbility ? getAbilityModifierForCharacter(character, mainAbility) : 0;
}

function getSpellHealingFormatOptions(
  character: Pick<Character, "className" | "abilities"> &
    Partial<Pick<Character, "classRules" | "customClass">>,
  spellcastingAbilityOverride?: AbilityKey | null
): {
  spellcastingAbilityLabel: string;
  spellcastingAbilityModifier: number | null;
} {
  const mainAbility =
    spellcastingAbilityOverride ??
    (!areCharacterClassRulesEnforced(character)
      ? getCharacterClassRulesSpellcastingAbility(character)
      : getMainAbilityForClass(character.className));

  return {
    spellcastingAbilityLabel: mainAbility ?? "Spell MOD",
    spellcastingAbilityModifier: mainAbility
      ? getAbilityModifierForCharacter(character, mainAbility)
      : null
  };
}

export function getSpellOutcomeSummaryForCharacter(
  character: SpellOutcomeCharacter,
  spell: SpellEntry,
  spellcastingAbilityOverride?: AbilityKey | null
): string {
  const damageFormulaOverride = getSpellDamageFormulaOverrideForCharacter(character, spell);

  if (damageFormulaOverride) {
    const range = parseFormulaRange(damageFormulaOverride);

    if (!range) {
      return "Damage";
    }

    return `${formatFormulaRangeLabel(range)} Damage`;
  }

  if (spell.damage.length > 0) {
    const damageFormula = getSpellDamageFormulaForCharacter(character, spell);
    const range = parseFormulaRange(damageFormula);
    const damageTypeLabel = getSpellDamageTypeLabel(spell.damage);

    if (!range) {
      return damageTypeLabel ? `${damageTypeLabel} Damage` : "Damage";
    }

    return `${formatFormulaRangeLabel(range)}${
      damageTypeLabel ? ` ${damageTypeLabel}` : ""
    } Damage`;
  }

  const healingFormula = formatSpellHealingFormula(spell.healing);

  if (!healingFormula) {
    return Array.isArray(spell.healing) ? "" : `${spell.healing.label} Heal`;
  }

  const range = parseFormulaRange(healingFormula, {
    substitutions: {
      MOD: getSpellcastingAbilityModifier(character, spellcastingAbilityOverride)
    }
  });

  if (!range) {
    return "Heal";
  }

  return `${formatFormulaRangeLabel(range)} Heal`;
}

export function getSpellDamageDetailForCharacter(
  character: SpellOutcomeCharacter,
  spell: SpellEntry,
  spellcastingAbilityOverride?: AbilityKey | null
): string {
  const damageFormulaOverride = getSpellDamageFormulaOverrideForCharacter(character, spell);

  if (damageFormulaOverride) {
    return damageFormulaOverride;
  }

  if (spell.damage.length === 0) {
    return formatSpellHealing(
      spell.healing,
      getSpellHealingFormatOptions(character, spellcastingAbilityOverride)
    );
  }

  const damageBonusEntries = getSpellDamageBonusesForCharacter(character, spell);
  const damageBonusDetail = damageBonusEntries
    .map(formatSpellDamageBonusDetail)
    .filter((entry): entry is string => entry !== null && entry.trim().length > 0)
    .join(" ");

  if (!damageBonusDetail) {
    return getWizardEvokerEmpoweredEvocationDamageDetail(
      character,
      spell,
      formatWeaponDamage(spell.damage)
    );
  }

  return getWizardEvokerEmpoweredEvocationDamageDetail(
    character,
    spell,
    `${formatWeaponDamage(spell.damage)} ${damageBonusDetail}`
  );
}
