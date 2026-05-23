import type { SpellEntry, WeaponDamage } from "../../codex/entries";
import type { AbilityKey, Character } from "../../types";
import { getAbilityModifierForCharacter } from "./abilities";
import {
  getSpellDamageBonusesForCharacter,
  getSpellDamageFormulaOverrideForCharacter
} from "./classFeatures";
import { getWizardEvokerEmpoweredEvocationDamageDetail } from "./classFeatures/wizard/subclasses/wizardEvoker";
import { isCustomClassName, normalizeCustomClassConfig } from "./customClass";
import { getMainAbilityForClass } from "./gameplay";
import { formatFormulaRangeLabel, parseFormulaRange } from "./shared/formulas";
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

function getSpellDamageBonusTotalForCharacter(
  character: Pick<
    Character,
    "className" | "abilities" | "level" | "classFeatureState" | "feats" | "cantripIds"
  >,
  spell: SpellEntry
): number {
  return getSpellDamageBonusesForCharacter(character, spell).reduce(
    (total, entry) => total + (entry.value ?? 0),
    0
  );
}

function formatSignedModifier(value: number): string {
  return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
}

function formatSpellDamageBonusDetail(entry: {
  label: string;
  value?: number;
  formula?: string;
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

  return entry.formula ? `+ ${entry.formula} (${entry.label})` : null;
}

function getSpellcastingAbilityModifier(
  character: Pick<Character, "className" | "abilities"> & Partial<Pick<Character, "customClass">>,
  spellcastingAbilityOverride?: AbilityKey | null
): number {
  const mainAbility =
    spellcastingAbilityOverride ??
    (isCustomClassName(character.className)
      ? normalizeCustomClassConfig(character.customClass).spellcastingAbility
      : getMainAbilityForClass(character.className));

  return mainAbility ? getAbilityModifierForCharacter(character, mainAbility) : 0;
}

function getSpellHealingFormatOptions(
  character: Pick<Character, "className" | "abilities"> & Partial<Pick<Character, "customClass">>,
  spellcastingAbilityOverride?: AbilityKey | null
): {
  spellcastingAbilityLabel: string;
  spellcastingAbilityModifier: number | null;
} {
  const mainAbility =
    spellcastingAbilityOverride ??
    (isCustomClassName(character.className)
      ? normalizeCustomClassConfig(character.customClass).spellcastingAbility
      : getMainAbilityForClass(character.className));

  return {
    spellcastingAbilityLabel: mainAbility ?? "Spell MOD",
    spellcastingAbilityModifier: mainAbility
      ? getAbilityModifierForCharacter(character, mainAbility)
      : null
  };
}

export function getSpellOutcomeSummaryForCharacter(
  character: Pick<
    Character,
    "className" | "abilities" | "level" | "classFeatureState" | "feats" | "cantripIds"
  > &
    Partial<Pick<Character, "customClass">>,
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
    const damageBonus = getSpellDamageBonusTotalForCharacter(character, spell);
    const damageFormula = `${formatWeaponDamageFormula(spell.damage)}${
      damageBonus === 0 ? "" : damageBonus > 0 ? `+${damageBonus}` : `${damageBonus}`
    }`;
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
  character: Pick<
    Character,
    "className" | "abilities" | "level" | "classFeatureState" | "feats" | "cantripIds"
  > &
    Partial<Pick<Character, "customClass" | "subclassId">>,
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
