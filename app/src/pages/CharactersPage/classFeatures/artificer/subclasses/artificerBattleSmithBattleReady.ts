import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../../codex/entries";
import type { Character } from "../../../../../types";
import { getAbilityModifierBreakdownForCharacter } from "../../../abilities";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { appendWeaponActionCardBonusLabel } from "../../../weaponActionCardBreakdown";
import type { WeaponAction } from "../../../gameplay";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";

const battleSmithSubclassId = "artificer-battle-smith";
const battleReadyName = "Battle Ready";
const arcaneEmpowermentName = "Arcane Empowerment";

type BattleReadyCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      "abilities" | "classFeatureState" | "feats" | "level" | "statusEntries" | "subclassId"
    >
  >;

function hasArtificerBattleSmithBattleReadyFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, battleSmithSubclassId, 3);
}

function createSignedFormula(baseFormula: string, modifier: number, spaced: boolean): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return spaced
    ? `${baseFormula} ${modifier >= 0 ? "+" : ""}${modifier}`
    : `${baseFormula}${modifier >= 0 ? "+" : ""}${modifier}`;
}

function stripTrailingModifier(formula: string, modifier: number): string {
  if (modifier === 0) {
    return formula;
  }

  const suffix = `${modifier >= 0 ? "+" : ""}${modifier}`;

  return formula.endsWith(suffix) ? formula.slice(0, -suffix.length) : formula;
}

function getWeaponDamageBonusSum(action: Pick<WeaponAction, "damageBonusEntries">): number {
  return action.damageBonusEntries.reduce((total, entry) => total + (entry.value ?? 0), 0);
}

function getArcaneEmpowermentDescription(character: BattleReadyCharacter): SpellDescriptionEntry[] {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.BATTLE_READY).filter((entry) =>
    typeof entry === "string"
      ? entry.startsWith(`<strong>${arcaneEmpowermentName}.`)
      : entry.items.some((item) => item.startsWith(`<strong>${arcaneEmpowermentName}.`))
  );
}

function appendArcaneEmpowermentDescription(
  character: BattleReadyCharacter,
  action: WeaponAction
): WeaponAction {
  return appendFeatureSourcedDescriptionAddition(
    action,
    character,
    CLASS_FEATURE.BATTLE_READY,
    getArcaneEmpowermentDescription(character),
    battleReadyName
  );
}

function canUseArcaneEmpowermentForAction(action: WeaponAction): boolean {
  return (
    action.attackKind === "weapon" &&
    action.isMagicWeapon === true &&
    (action.ability === "STR" || action.ability === "DEX")
  );
}

export function transformArtificerBattleSmithBattleReadyWeaponAction(
  character: BattleReadyCharacter,
  action: WeaponAction
): WeaponAction {
  if (!hasArtificerBattleSmithBattleReadyFeature(character) || action.isMagicWeapon !== true) {
    return action;
  }

  const describedAction = appendArcaneEmpowermentDescription(character, action);

  if (!canUseArcaneEmpowermentForAction(describedAction)) {
    return describedAction;
  }

  const intelligenceModifierBreakdown = getAbilityModifierBreakdownForCharacter(character, "INT");
  const intelligenceModifier = intelligenceModifierBreakdown.total;
  const currentDamageModifier =
    describedAction.damageAbilityModifier ?? describedAction.abilityModifier;

  if (
    intelligenceModifier <= describedAction.abilityModifier &&
    intelligenceModifier <= currentDamageModifier
  ) {
    return describedAction;
  }

  const damageBonusTotal = getWeaponDamageBonusSum(describedAction);
  const nextTotalModifier = intelligenceModifier + damageBonusTotal;
  const rollFormulaBase = stripTrailingModifier(
    describedAction.rollFormula,
    describedAction.totalModifier
  );

  return appendWeaponActionCardBonusLabel(
    {
      ...describedAction,
      ability: "INT",
      abilityFormulaLabel: "INT (Arcane Empowerment)",
      cardBaseAbility: "INT",
      abilityModifierBaseValue: intelligenceModifierBreakdown.baseValue,
      abilityModifier: intelligenceModifier,
      cardBaseAbilityModifier: intelligenceModifier,
      abilityModifierBonusEntries: intelligenceModifierBreakdown.bonusEntries,
      damageAbility: "INT",
      damageAbilityFormulaLabel: "INT (Arcane Empowerment)",
      damageAbilityModifierBaseValue: intelligenceModifierBreakdown.baseValue,
      damageAbilityModifier: intelligenceModifier,
      damageAbilityModifierBonusEntries: intelligenceModifierBreakdown.bonusEntries,
      totalModifier: nextTotalModifier,
      rollDisplay: createSignedFormula(describedAction.damageFormula, nextTotalModifier, true),
      rollFormulaDisplay: createSignedFormula(
        describedAction.damageFormula,
        nextTotalModifier,
        false
      ),
      rollFormula: createSignedFormula(rollFormulaBase, nextTotalModifier, false)
    },
    arcaneEmpowermentName
  );
}
