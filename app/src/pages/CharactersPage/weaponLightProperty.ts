import { WEAPON_MASTERY, WEAPON_PROPERTY } from "../../codex/entries";
import type { Character } from "../../types";
import type { WeaponAction } from "./gameplay";
import {
  normalizeRoundTracker,
  type LightWeaponAttackState
} from "./combat";
import { hasActiveWeaponMastery } from "./weaponMasteryStatus";

export type LightWeaponFollowUpKind = "bonus" | "nick";

type LightWeaponActionContext = Pick<
  WeaponAction,
  | "key"
  | "attackKind"
  | "baseWeapon"
  | "properties"
  | "mastery"
  | "hasActiveMastery"
  | "damageFormula"
  | "damageLabel"
  | "damageAbility"
  | "damageAbilityFormulaLabel"
  | "damageAbilityModifierBaseValue"
  | "damageAbilityModifier"
  | "damageAbilityModifierBonusEntries"
  | "ability"
  | "abilityFormulaLabel"
  | "abilityModifierBaseValue"
  | "abilityModifierBonusEntries"
  | "damageBonusEntries"
  | "totalModifier"
  | "rollDisplay"
  | "rollFormulaDisplay"
  | "rollFormula"
>;

function createRollFormula(baseFormula: string, modifier: number): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula}${modifier > 0 ? "+" : ""}${modifier}`;
}

function createRollDisplay(baseFormula: string, modifier: number): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula} ${modifier > 0 ? "+" : ""}${modifier}`;
}

function stripTrailingModifier(formula: string, modifier: number): string {
  if (modifier === 0) {
    return formula;
  }

  const suffix = `${modifier >= 0 ? "+" : ""}${modifier}`;
  return formula.endsWith(suffix) ? formula.slice(0, -suffix.length) : formula;
}

function getDamageBonusTotal(action: Pick<WeaponAction, "damageBonusEntries">): number {
  return action.damageBonusEntries.reduce((total, entry) => total + (entry.value ?? 0), 0);
}

export function isLightWeaponAction(
  action: Pick<WeaponAction, "attackKind" | "properties">
): boolean {
  return action.attackKind === "weapon" && (action.properties ?? []).includes(WEAPON_PROPERTY.LIGHT);
}

export function hasActiveNickMasteryForWeaponAction(
  character: Pick<Character, "weaponProficiencies">,
  action: Pick<
    WeaponAction,
    "attackKind" | "baseWeapon" | "mastery" | "hasActiveMastery"
  >
): boolean {
  if (action.attackKind !== "weapon" || action.mastery !== WEAPON_MASTERY.NICK) {
    return false;
  }

  return (
    action.hasActiveMastery === true ||
    hasActiveWeaponMastery(character.weaponProficiencies, {
      baseWeapon: action.baseWeapon
    })
  );
}

export function getLightWeaponAttackState(value: unknown): LightWeaponAttackState | undefined {
  return normalizeRoundTracker(value).lightWeaponAttack;
}

export function getLightWeaponFollowUpKind(
  roundTracker: unknown,
  action: Pick<WeaponAction, "key" | "attackKind" | "properties">
): LightWeaponFollowUpKind | null {
  const lightWeaponAttack = getLightWeaponAttackState(roundTracker);

  if (
    !lightWeaponAttack ||
    lightWeaponAttack.followUpUsed ||
    lightWeaponAttack.triggerWeaponKey === action.key ||
    !isLightWeaponAction(action)
  ) {
    return null;
  }

  return lightWeaponAttack.triggerHasNickMastery ? "nick" : "bonus";
}

export function shouldApplyLightWeaponDamagePenalty(
  roundTracker: unknown,
  action: Pick<WeaponAction, "key" | "attackKind" | "properties">
): boolean {
  const lightWeaponAttack = getLightWeaponAttackState(roundTracker);

  if (!lightWeaponAttack || !isLightWeaponAction(action)) {
    return false;
  }

  if (lightWeaponAttack.followUpUsed) {
    return (
      lightWeaponAttack.followUpDamagePenaltyPending === true &&
      lightWeaponAttack.followUpWeaponKey === action.key
    );
  }

  return lightWeaponAttack.triggerWeaponKey !== action.key;
}

export function applyLightWeaponDamagePenalty<T extends LightWeaponActionContext>(
  action: T
): T {
  const damageAbility = action.damageAbility ?? action.ability;
  const damageAbilityFormulaLabel =
    action.damageAbilityFormulaLabel ?? action.abilityFormulaLabel ?? damageAbility;
  const damageAbilityModifierBonusEntries =
    action.damageAbilityModifierBonusEntries ?? action.abilityModifierBonusEntries;
  const damageAbilityModifier = damageAbilityModifierBonusEntries.reduce(
    (total, entry) => total + entry.value,
    0
  );
  const totalModifier = damageAbilityModifier + getDamageBonusTotal(action);
  const rollFormulaBase = stripTrailingModifier(action.rollFormula, action.totalModifier);

  return {
    ...action,
    damageAbilityModifierBaseValue: 0,
    damageAbilityModifier,
    damageAbilityModifierBonusEntries,
    damageAbilityModifierSuppressionLabel: `${damageAbilityFormulaLabel} (Light)`,
    totalModifier,
    rollDisplay: createRollDisplay(action.damageFormula, totalModifier),
    rollFormulaDisplay: createRollFormula(action.damageFormula, totalModifier),
    rollFormula: createRollFormula(rollFormulaBase, totalModifier)
  } as T;
}
