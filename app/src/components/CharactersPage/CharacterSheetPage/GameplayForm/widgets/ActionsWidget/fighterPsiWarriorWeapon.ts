import type { FeatureDamageBonus } from "../../../../../../pages/CharactersPage/classFeatures/types";
import type { WeaponAction } from "../../../../../../pages/CharactersPage/gameplay";

export function createPsiWarriorPsionicStrikeDamageBonus(formula: string): FeatureDamageBonus {
  return {
    label: "Psionic Strike",
    formula,
    displayLabel: `${formula} Force`
  };
}

export function applyWeaponDamageBonusPreview(
  action: WeaponAction,
  bonus: FeatureDamageBonus
): WeaponAction {
  const normalizedFormula = bonus.formula?.trim();

  return {
    ...action,
    damageFormula:
      normalizedFormula && normalizedFormula.length > 0
        ? `${action.damageFormula}+${normalizedFormula}`
        : action.damageFormula,
    damageBonusEntries: [...action.damageBonusEntries, bonus]
  };
}
