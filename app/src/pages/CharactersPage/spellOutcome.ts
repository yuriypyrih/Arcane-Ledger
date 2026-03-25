import type { SpellEntry, WeaponDamage } from "../../codex/entries";
import type { Character } from "../../types";
import { getAbilityModifierForCharacter } from "./abilities";
import { getCantripDamageBonusForCharacter } from "./classFeatures";
import { getMainAbilityForClass } from "./gameplay";
import { flattenSpellDescriptionLines } from "../../utils/codex/spellDescription";
import { formatCodexLabel, formatWeaponDamage, formatWeaponDamageFormula } from "../../utils/codex";

function parseFormulaRange(
  formula: string,
  modifierValue = 0
): { minimum: number; maximum: number } | null {
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
    const normalizedTerm = rawTerm.toUpperCase();

    if (normalizedTerm === "MOD") {
      minimum += sign * modifierValue;
      maximum += sign * modifierValue;
      continue;
    }

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

function formatOutcomeRange(minimum: number, maximum: number): string {
  return minimum === maximum ? `${minimum}` : `${minimum}~${maximum}`;
}

function getSpellHealingFormula(spell: Pick<SpellEntry, "description">): string | null {
  const descriptionLines = flattenSpellDescriptionLines(spell.description);
  const healingPatterns = [
    /regains? (?:a number of )?hit points equal to ([^.]+)/i,
    /causing (?:it|them) to regain ([^.]+?) hit points/i,
    /regain ([^.]+?) hit points/i
  ];

  for (const line of descriptionLines) {
    for (const pattern of healingPatterns) {
      const match = line.match(pattern);

      if (!match?.[1]) {
        continue;
      }

      const normalizedTokens = match[1]
        .replace(/your spellcasting ability modifier/gi, "MOD")
        .replace(/your ability modifier/gi, "MOD")
        .replace(/\bplus\b/gi, "+")
        .match(/(\d+d\d+|\d+|MOD)/gi);

      if (!normalizedTokens || normalizedTokens.length === 0) {
        continue;
      }

      return normalizedTokens.map((token) => (token.toUpperCase() === "MOD" ? "MOD" : token.toLowerCase())).join("+");
    }
  }

  return null;
}

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

function getSpellDamageBonusForCharacter(
  character: Pick<Character, "className" | "abilities" | "level" | "classFeatureState" | "feats">,
  spell: SpellEntry
): number {
  if (spell.spellLevel !== 0 || spell.damage.length === 0) {
    return 0;
  }

  return getCantripDamageBonusForCharacter(character);
}

function formatSignedModifier(value: number): string {
  return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
}

export function getSpellOutcomeSummaryForCharacter(
  character: Pick<Character, "className" | "abilities" | "level" | "classFeatureState" | "feats">,
  spell: SpellEntry
): string {
  if (spell.damage.length > 0) {
    const damageBonus = getSpellDamageBonusForCharacter(character, spell);
    const damageFormula = `${formatWeaponDamageFormula(spell.damage)}${
      damageBonus === 0 ? "" : damageBonus > 0 ? `+${damageBonus}` : `${damageBonus}`
    }`;
    const range = parseFormulaRange(damageFormula);
    const damageTypeLabel = getSpellDamageTypeLabel(spell.damage);

    if (!range) {
      return damageTypeLabel ? `${damageTypeLabel} Damage` : "Damage";
    }

    return `${formatOutcomeRange(range.minimum, range.maximum)}${
      damageTypeLabel ? ` ${damageTypeLabel}` : ""
    } Damage`;
  }

  const healingFormula = getSpellHealingFormula(spell);

  if (!healingFormula) {
    return "";
  }

  const mainAbility = getMainAbilityForClass(character.className);
  const spellcastingModifier = mainAbility
    ? getAbilityModifierForCharacter(character, mainAbility)
    : 0;
  const range = parseFormulaRange(healingFormula, spellcastingModifier);

  if (!range) {
    return "Heal";
  }

  return `${formatOutcomeRange(range.minimum, range.maximum)} Heal`;
}

export function getSpellDamageDetailForCharacter(
  character: Pick<Character, "className" | "abilities" | "level" | "classFeatureState" | "feats">,
  spell: SpellEntry
): string {
  if (spell.damage.length === 0) {
    return "None";
  }

  const damageBonus = getSpellDamageBonusForCharacter(character, spell);

  if (damageBonus === 0) {
    return formatWeaponDamage(spell.damage);
  }

  return `${formatWeaponDamage(spell.damage)} ${formatSignedModifier(damageBonus)} WIS (Potent Spellcasting)`;
}
