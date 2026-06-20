import type { Character } from "../../../../types";
import type {
  SpellImplementation,
  SpellImplementationApplyContext,
  SpellImplementationCastOption,
  SpellImplementationCastOptionsContext,
  SpellImplementationCastSource,
  SpellImplementationOptionValues,
  SpellImplementationRollEffect,
  SpellImplementationRollEffectsContext,
  SpellImplementationStatusOptions,
  SpellImplementationStatusOptionsContext
} from "./types";
import { spellImplementations0 } from "./spells0";
import { spellImplementations1 } from "./spells1";
import { spellImplementations2 } from "./spells2";
import { spellImplementations3 } from "./spells3";
import { spellImplementations4 } from "./spells4";
import { spellImplementations5 } from "./spells5";
import { spellImplementations6 } from "./spells6";
import { spellImplementations7 } from "./spells7";
import { spellImplementations8 } from "./spells8";
import { spellImplementations9 } from "./spells9";

export type {
  SpellImplementation,
  SpellImplementationApplyContext,
  SpellImplementationCastOptionChoice,
  SpellImplementationCastOption,
  SpellImplementationCastOptionsContext,
  SpellImplementationCastSource,
  SpellImplementationOptionValue,
  SpellImplementationOptionValues,
  SpellImplementationRollEffect,
  SpellImplementationRollEffectsContext,
  SpellImplementationStatusOptions,
  SpellImplementationStatusOptionsContext
} from "./types";
export {
  applyFalseLifeTemporaryHitPointsToCharacter,
  falseLifeSpellId,
  falseLifeTemporaryHitPointsSource,
  fiendishVigorTemporaryHitPointsSource,
  getFalseLifeTemporaryHitPointsBonus,
  getFalseLifeTemporaryHitPointsFormula,
  getFalseLifeTemporaryHitPointsFormulaDisplay,
  getFalseLifeTemporaryHitPointsFromRoll
} from "./falseLife";
export {
  giftOfAlacritySpellId,
  giftOfAlacrityStatusValue,
  giftOfAlacrityTargetOptionId,
  getGiftOfAlacrityInitiativeBonusesForCharacter,
  getLongstriderSpeedBonusesForCharacter,
  longstriderSpellId,
  longstriderStatusValue,
  longstriderTargetOptionId
} from "./giftOfAlacrityLongstrider";
export {
  armorOfAgathysSpellId,
  divineFavorSpellId,
  divineFavorStatusValue,
  expeditiousRetreatSpellId,
  expeditiousRetreatStatusValue,
  falseLifeMaximizeTemporaryHitPointsOptionId,
  getArmorOfAgathysTemporaryHitPoints,
  getDivineFavorWeaponDamageBonusesForCharacter,
  getExpeditiousRetreatCommonActionForCharacter,
  getSpellArmorClassBonusesForCharacter,
  mageArmorCastOnSelfOptionId,
  getMageArmorArmorClassModes,
  hasDivineFavorStatus,
  hasExpeditiousRetreatDashBonusActionPath,
  hasExpeditiousRetreatStatus,
  hasMageArmorSelfStatus,
  hasShieldStatus,
  isMageArmorSelfStatusEntry,
  isShieldStatusEntry,
  mageArmorSpellId,
  mageArmorStatusSourceId,
  mageArmorStatusValue,
  shieldOfFaithSpellId,
  shieldOfFaithStatusValue,
  shieldOfFaithTargetOptionId,
  shieldSpellId,
  shieldStatusSourceId,
  shieldStatusValue
} from "./spells1";
export {
  aidSpellId,
  aidStatusValue,
  aidTargetOptionId,
  barkskinSpellId,
  barkskinStatusValue,
  barkskinTargetOptionId,
  getBarkskinArmorClassModes,
  getAidHitPointMaximumBonusForCharacter
} from "./spells2";
export {
  borrowedKnowledgeSkillOptionId,
  borrowedKnowledgeSpellId,
  borrowedKnowledgeStatusValue,
  getBorrowedKnowledgeSkillProficiencyEntriesForCharacter
} from "./borrowedKnowledge";
export {
  darkvisionSenseStatusSourceId,
  darkvisionSpellId,
  darkvisionStatusValue,
  darkvisionTargetOptionId,
  getDarkvisionSpellDerivedStatusEntriesForCharacter
} from "./darkvision";
export {
  applyHeroismRoundStartTemporaryHitPointsForCharacter,
  getHeroismSpellDerivedStatusEntriesForCharacter,
  hasSelfHeroismStatus,
  heroismFrightenedImmunityStatusSourceId,
  heroismSpellId,
  heroismStatusValue,
  heroismTargetOptionId,
  heroismTemporaryHitPointsSource
} from "./heroism";
export {
  applyShillelaghDamageDice,
  getShillelaghDamageAdjustmentForWeapon,
  getShillelaghDamageDiceForLevel,
  getShillelaghSpellcastingAbilityForWeapon,
  hasShillelaghStatus,
  isShillelaghEligibleWeapon,
  isShillelaghStatusEntry,
  shillelaghSpellId,
  shillelaghStatusSourceId,
  shillelaghStatusValue
} from "./shillelagh";
export {
  applyTrueStrikeRadiantDamageType,
  consumeTrueStrikePendingAttackForCharacter,
  getTrueStrikeDamageAdjustmentForWeapon,
  getTrueStrikeEconomyMultiCountForWeapon,
  getTrueStrikeExtraRadiantDamageFormulaForLevel,
  getTrueStrikeSpellcastingAbilityForWeapon,
  hasTrueStrikePendingAttack,
  isTrueStrikeEligibleWeapon,
  isTrueStrikePendingAttackStatusEntry,
  trueStrikeSpellId,
  trueStrikeStatusSourceId,
  trueStrikeStatusValue
} from "./trueStrike";

type ApplySpellImplementationForCharacterContext = Pick<
  SpellImplementationApplyContext,
  "character" | "spell"
> & {
  spellSlotLevel?: number | null;
  sourceSpellSlotLevel?: number | null;
  castSource?: SpellImplementationCastSource;
  options?: SpellImplementationOptionValues;
};

const spellImplementations = [
  ...spellImplementations0,
  ...spellImplementations1,
  ...spellImplementations2,
  ...spellImplementations3,
  ...spellImplementations4,
  ...spellImplementations5,
  ...spellImplementations6,
  ...spellImplementations7,
  ...spellImplementations8,
  ...spellImplementations9
];

const spellImplementationsById = new Map<string, SpellImplementation>(
  spellImplementations.map((implementation) => [implementation.spellId, implementation])
);

export function getSpellImplementation(spellId: string): SpellImplementation | null {
  return spellImplementationsById.get(spellId) ?? null;
}

export function getSpellCastOptionsForCharacter(
  context: SpellImplementationCastOptionsContext
): SpellImplementationCastOption[] {
  return getSpellImplementation(context.spell.id)?.getCastOptions?.(context) ?? [];
}

export function getSpellImplementationRollEffectsForCharacter(
  context: SpellImplementationRollEffectsContext
): SpellImplementationRollEffect[] {
  return getSpellImplementation(context.spell.id)?.getRollEffects?.(context) ?? [];
}

export function getSpellImplementationStatusOptionsForCharacter(
  context: SpellImplementationStatusOptionsContext
): SpellImplementationStatusOptions {
  return getSpellImplementation(context.spell.id)?.getStatusOptions?.(context) ?? {};
}

export function createDefaultSpellImplementationOptionValues(
  options: readonly SpellImplementationCastOption[]
): SpellImplementationOptionValues {
  return Object.fromEntries(
    options.map((option) => {
      if (option.choices?.length) {
        const defaultChoice =
          option.choices.find((choice) => choice.value === option.defaultValue) ??
          option.choices[0];

        return [option.id, defaultChoice?.value ?? ""];
      }

      return [option.id, option.defaultChecked === true];
    })
  );
}

export function applySpellImplementationForCharacter({
  character,
  spell,
  spellSlotLevel = null,
  sourceSpellSlotLevel = null,
  castSource = "standard",
  options = {}
}: ApplySpellImplementationForCharacterContext): Character {
  const implementation = getSpellImplementation(spell.id);

  if (!implementation?.applyOnCast) {
    return character;
  }

  return implementation.applyOnCast({
    character,
    spell,
    spellSlotLevel,
    sourceSpellSlotLevel,
    castSource,
    options
  });
}
