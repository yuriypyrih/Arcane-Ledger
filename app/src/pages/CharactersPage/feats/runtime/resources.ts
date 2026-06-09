import { FEATS, type ReactionEntry, type SpellDescriptionEntry, type SpellEntry } from "../../../../codex/entries";
import type { Character, ItemRecord } from "../../../../types";
import { getAbilityModifierForCharacter } from "../../abilities";
import type { FeatureActionCard } from "../../classFeatures/types";
import {
  applyFeatureSpellCastEffects,
  type FeatureSpellActionPathContribution,
  type FeatureSpellCastEffectContext
} from "../../featureContributions";
import { getHitDiceRemainingForCharacter, getHitDieFormulaForClass } from "../../hitDice";
import {
  feyTouchedMistyStepSpellId,
  shadowTouchedInvisibilitySpellId,
  spellfireSparkSacredFlameSpellId,
  spellfireSparkSpellfireFlameSpellCastEffectId,
  telepathicDetectThoughtsSpellId
} from "./constants";
import { getFeatItemAdditionalDescription } from "./itemAdditions";
import { collectFeatDerivedState, hasFeatForCharacter } from "./state";
import type { FeatRuntimeCharacter } from "./types";

export function characterHasCrafterDiscount(character: FeatRuntimeCharacter): boolean {
  return collectFeatDerivedState(character).hasCrafterDiscount;
}

export function getDurableSpeedyRecoveryHealingFormulaForCharacter(
  character: FeatRuntimeCharacter
): string {
  return getHitDieFormulaForClass(
    character.className,
    character.customClass,
    character.classRules
  );
}

export function spendDurableSpeedyRecoveryHitDieForCharacter(character: Character): Character {
  if (!hasFeatForCharacter(character, FEATS.DURABLE)) {
    return character;
  }

  const hitDiceRemaining = getHitDiceRemainingForCharacter(character);

  if (hitDiceRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    hitDiceRemaining: hitDiceRemaining - 1
  };
}

export function getBoonOfFateImproveFateStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasBoonOfFate || derivedState.boonOfFateImproveFateTotal <= 0) {
    return null;
  }

  return {
    available: derivedState.boonOfFateImproveFateRemaining > 0,
    expended: derivedState.boonOfFateImproveFateRemaining <= 0,
    usesRemaining: derivedState.boonOfFateImproveFateRemaining,
    usesTotal: derivedState.boonOfFateImproveFateTotal
  };
}

export function getCultOfDragonInitiateInspiredByFearStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (
    !derivedState.hasCultOfDragonInitiate ||
    derivedState.cultOfDragonInitiateInspiredByFearTotal <= 0
  ) {
    return null;
  }

  return {
    available: derivedState.cultOfDragonInitiateInspiredByFearRemaining > 0,
    expended: derivedState.cultOfDragonInitiateInspiredByFearRemaining <= 0,
    usesRemaining: derivedState.cultOfDragonInitiateInspiredByFearRemaining,
    usesTotal: derivedState.cultOfDragonInitiateInspiredByFearTotal
  };
}

export function spendCultOfDragonInitiateInspiredByFearForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendInspiredByFear = false;

  if (
    !derivedState.hasCultOfDragonInitiate ||
    derivedState.cultOfDragonInitiateInspiredByFearRemaining <= 0
  ) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendInspiredByFear ||
      entry.feat !== FEATS.CULT_OF_THE_DRAGON_INITIATE ||
      !entry.cultOfDragonInitiate ||
      entry.cultOfDragonInitiate.inspiredByFearExpended === true
    ) {
      return entry;
    }

    didSpendInspiredByFear = true;

    return {
      ...entry,
      cultOfDragonInitiate: {
        ...entry.cultOfDragonInitiate,
        inspiredByFearExpended: true
      }
    };
  });

  return didSpendInspiredByFear
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreCultOfDragonInitiateInspiredByFearForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreInspiredByFear = false;

  if (!derivedState.hasCultOfDragonInitiate) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.CULT_OF_THE_DRAGON_INITIATE ||
      !entry.cultOfDragonInitiate ||
      entry.cultOfDragonInitiate.inspiredByFearExpended !== true
    ) {
      return entry;
    }

    didRestoreInspiredByFear = true;

    return {
      ...entry,
      cultOfDragonInitiate: {
        ...entry.cultOfDragonInitiate,
        inspiredByFearExpended: undefined
      }
    };
  });

  return didRestoreInspiredByFear
    ? {
        ...character,
        feats
      }
    : character;
}

export function getPurpleDragonRookRallyingCryStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (
    !derivedState.hasPurpleDragonRook ||
    derivedState.purpleDragonRookRallyingCryTotal <= 0
  ) {
    return null;
  }

  return {
    available: derivedState.purpleDragonRookRallyingCryRemaining > 0,
    expended: derivedState.purpleDragonRookRallyingCryRemaining <= 0,
    usesRemaining: derivedState.purpleDragonRookRallyingCryRemaining,
    usesTotal: derivedState.purpleDragonRookRallyingCryTotal
  };
}

export function spendPurpleDragonRookRallyingCryForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendRallyingCry = false;

  if (
    !derivedState.hasPurpleDragonRook ||
    derivedState.purpleDragonRookRallyingCryRemaining <= 0
  ) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendRallyingCry ||
      entry.feat !== FEATS.PURPLE_DRAGON_ROOK ||
      !entry.purpleDragonRook ||
      entry.purpleDragonRook.rallyingCryExpended === true
    ) {
      return entry;
    }

    didSpendRallyingCry = true;

    return {
      ...entry,
      purpleDragonRook: {
        ...entry.purpleDragonRook,
        rallyingCryExpended: true
      }
    };
  });

  return didSpendRallyingCry
    ? {
        ...character,
        feats
      }
    : character;
}

export function restorePurpleDragonRookRallyingCryForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreRallyingCry = false;

  if (!derivedState.hasPurpleDragonRook) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.PURPLE_DRAGON_ROOK ||
      !entry.purpleDragonRook ||
      entry.purpleDragonRook.rallyingCryExpended !== true
    ) {
      return entry;
    }

    didRestoreRallyingCry = true;

    return {
      ...entry,
      purpleDragonRook: {
        ...entry.purpleDragonRook,
        rallyingCryExpended: undefined
      }
    };
  });

  return didRestoreRallyingCry
    ? {
        ...character,
        feats
      }
    : character;
}

export function getSpellfireSparkSpellfireFlameStateForCharacter(
  character: FeatRuntimeCharacter,
  spellId: string
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (
    spellId !== spellfireSparkSacredFlameSpellId ||
    !derivedState.hasSpellfireSpark ||
    derivedState.spellfireSparkSpellfireFlameTotal <= 0
  ) {
    return null;
  }

  return {
    available: derivedState.spellfireSparkSpellfireFlameRemaining > 0,
    expended: derivedState.spellfireSparkSpellfireFlameRemaining <= 0,
    usesRemaining: derivedState.spellfireSparkSpellfireFlameRemaining,
    usesTotal: derivedState.spellfireSparkSpellfireFlameTotal
  };
}

export function getFeatSpellActionPathContributionsForCharacter(
  character: Character,
  spell: Pick<SpellEntry, "id" | "castingTime" | "spellLevel">
): FeatureSpellActionPathContribution[] {
  return collectFeatDerivedState(character).spellActionPaths.filter(
    (contribution) => contribution.spellId === spell.id
  );
}

export function spendSpellfireSparkSpellfireFlameForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendSpellfireFlame = false;

  if (
    !derivedState.hasSpellfireSpark ||
    derivedState.spellfireSparkSpellfireFlameRemaining <= 0
  ) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (didSpendSpellfireFlame || entry.feat !== FEATS.SPELLFIRE_SPARK || !entry.spellfireSpark) {
      return entry;
    }

    const currentExpended = Math.max(
      0,
      Math.floor(entry.spellfireSpark.spellfireFlameExpended ?? 0)
    );

    if (currentExpended >= derivedState.spellfireSparkSpellfireFlameTotal) {
      return entry;
    }

    didSpendSpellfireFlame = true;

    return {
      ...entry,
      spellfireSpark: {
        ...entry.spellfireSpark,
        spellfireFlameExpended: currentExpended + 1
      }
    };
  });

  return didSpendSpellfireFlame
    ? {
        ...character,
        feats
      }
    : character;
}

export function applyFeatureSpellCastEffectsForCharacter(
  character: Character,
  spell: Pick<SpellEntry, "id" | "spellLevel">,
  spellCastEffectIds: readonly string[] | null | undefined,
  context: Omit<FeatureSpellCastEffectContext, "spell" | "spellCastEffectIds"> = {}
): Character | null {
  const effectIds = [...new Set(spellCastEffectIds ?? [])];

  if (effectIds.length === 0) {
    return character;
  }

  return applyFeatureSpellCastEffects(
    collectFeatDerivedState(character).spellCastEffects.map((effect) =>
      effect.id === spellfireSparkSpellfireFlameSpellCastEffectId && !effect.apply
        ? {
            ...effect,
            apply: (
              nextCharacter: Character,
              effectContext: FeatureSpellCastEffectContext
            ) =>
              effectContext.spell.id === spellfireSparkSacredFlameSpellId
                ? spendSpellfireSparkSpellfireFlameForCharacter(nextCharacter)
                : nextCharacter
          }
        : effect
    ),
    character,
    {
      ...context,
      spell
    },
    effectIds
  );
}

export function applyFeatSpellCastEffectsForCharacter(
  character: Character,
  spell: Pick<SpellEntry, "id" | "spellLevel">,
  spellCastEffectIds: readonly string[] | null | undefined,
  context: Omit<FeatureSpellCastEffectContext, "spell" | "spellCastEffectIds"> = {}
): Character | null {
  return applyFeatureSpellCastEffectsForCharacter(character, spell, spellCastEffectIds, context);
}

export function restoreSpellfireSparkSpellfireFlameForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreSpellfireFlame = false;

  if (!derivedState.hasSpellfireSpark) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.SPELLFIRE_SPARK ||
      !entry.spellfireSpark ||
      !entry.spellfireSpark.spellfireFlameExpended
    ) {
      return entry;
    }

    didRestoreSpellfireFlame = true;

    return {
      ...entry,
      spellfireSpark: {
        ...entry.spellfireSpark,
        spellfireFlameExpended: undefined
      }
    };
  });

  return didRestoreSpellfireFlame
    ? {
        ...character,
        feats
      }
    : character;
}

export function consumeBoonOfFateImproveFateForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendImproveFate = false;

  if (!derivedState.hasBoonOfFate || derivedState.boonOfFateImproveFateRemaining <= 0) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendImproveFate ||
      entry.feat !== FEATS.BOON_OF_FATE ||
      entry.boonOfFate?.improveFateExpended === true
    ) {
      return entry;
    }

    didSpendImproveFate = true;

    return {
      ...entry,
      boonOfFate: {
        ...(entry.boonOfFate ?? {}),
        improveFateExpended: true
      }
    };
  });

  return didSpendImproveFate
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreBoonOfFateImproveFateForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreImproveFate = false;

  if (!derivedState.hasBoonOfFate) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (entry.feat !== FEATS.BOON_OF_FATE || entry.boonOfFate?.improveFateExpended !== true) {
      return entry;
    }

    didRestoreImproveFate = true;

    return {
      ...entry,
      boonOfFate: undefined
    };
  });

  return didRestoreImproveFate
    ? {
        ...character,
        feats
      }
    : character;
}

export function getBoonOfRecoveryRecoverVitalityStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasBoonOfRecovery || derivedState.boonOfRecoveryDiceTotal <= 0) {
    return null;
  }

  return {
    available: derivedState.boonOfRecoveryDiceRemaining > 0,
    expended: derivedState.boonOfRecoveryDiceRemaining <= 0,
    usesRemaining: derivedState.boonOfRecoveryDiceRemaining,
    usesTotal: derivedState.boonOfRecoveryDiceTotal
  };
}

export function getBoonOfRecoveryRecoverVitalityFormula(diceCount: number): string {
  const normalizedDiceCount = Math.max(1, Math.min(10, Math.floor(Number(diceCount) || 1)));

  return `${normalizedDiceCount}d10`;
}

export function spendBoonOfRecoveryDiceForCharacter(
  character: Character,
  diceCount: number
): Character {
  const derivedState = collectFeatDerivedState(character);
  const normalizedDiceCount = Math.max(1, Math.min(10, Math.floor(Number(diceCount) || 1)));
  let didSpendRecoverVitalityDice = false;

  if (
    !derivedState.hasBoonOfRecovery ||
    normalizedDiceCount > derivedState.boonOfRecoveryDiceRemaining
  ) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendRecoverVitalityDice ||
      entry.feat !== FEATS.BOON_OF_RECOVERY ||
      (entry.boonOfRecovery?.recoverVitalityDiceExpended ?? 0) >= 10
    ) {
      return entry;
    }

    didSpendRecoverVitalityDice = true;

    return {
      ...entry,
      boonOfRecovery: {
        ...(entry.boonOfRecovery ?? {}),
        recoverVitalityDiceExpended: Math.max(
          0,
          Math.min(
            10,
            (entry.boonOfRecovery?.recoverVitalityDiceExpended ?? 0) + normalizedDiceCount
          )
        )
      }
    };
  });

  return didSpendRecoverVitalityDice
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreBoonOfRecoveryDiceForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreRecoverVitalityDice = false;

  if (!derivedState.hasBoonOfRecovery) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.BOON_OF_RECOVERY ||
      (entry.boonOfRecovery?.recoverVitalityDiceExpended ?? 0) <= 0
    ) {
      return entry;
    }

    didRestoreRecoverVitalityDice = true;

    return {
      ...entry,
      boonOfRecovery: undefined
    };
  });

  return didRestoreRecoverVitalityDice
    ? {
        ...character,
        feats
      }
    : character;
}

export function getBoonOfFortitudeHealingBonusForCharacter(
  character: FeatRuntimeCharacter
): number {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.featSet.has(FEATS.BOON_OF_FORTITUDE)) {
    return 0;
  }

  return Math.max(
    0,
    getAbilityModifierForCharacter(
      {
        ...character,
        feats: derivedState.normalizedFeats
      },
      "CON"
    )
  );
}

export function canUseBoonOfSpellRecallFreeCastingForSpell(
  character: FeatRuntimeCharacter,
  spell: SpellEntry
): boolean {
  const derivedState = collectFeatDerivedState(character);

  return derivedState.hasBoonOfSpellRecall && spell.spellLevel >= 1 && spell.spellLevel <= 4;
}

export function getFeatActionsForCharacter(character: FeatRuntimeCharacter): FeatureActionCard[] {
  const derivedState = collectFeatDerivedState(character);

  return [
    ...derivedState.actions,
    ...derivedState.actionFactories.flatMap((createActions) =>
      createActions(character as Character, derivedState)
    )
  ];
}

export function getFeatReactionEntriesForCharacter(
  character: FeatRuntimeCharacter
): ReactionEntry[] {
  return collectFeatDerivedState(character).reactionEntries;
}

export function getFeatItemAdditionalDescriptionForCharacter(
  character: FeatRuntimeCharacter,
  item: Pick<ItemRecord, "id" | "key" | "name"> | null | undefined
): SpellDescriptionEntry[] {
  return getFeatItemAdditionalDescription(collectFeatDerivedState(character), item);
}

export function consumeMagicInitiateFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendFreeCast = false;

  if (!derivedState.hasMagicInitiate) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendFreeCast ||
      entry.feat !== FEATS.MAGIC_INITIATE ||
      !entry.magicInitiate ||
      entry.magicInitiate.levelOneSpellId !== spellId ||
      entry.magicInitiate.freeCastExpended === true
    ) {
      return entry;
    }

    didSpendFreeCast = true;

    return {
      ...entry,
      magicInitiate: {
        ...entry.magicInitiate,
        freeCastExpended: true
      }
    };
  });

  return didSpendFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreMagicInitiateFreeCastsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreFreeCast = false;

  if (!derivedState.hasMagicInitiate) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.MAGIC_INITIATE ||
      !entry.magicInitiate ||
      entry.magicInitiate.freeCastExpended !== true
    ) {
      return entry;
    }

    didRestoreFreeCast = true;

    return {
      ...entry,
      magicInitiate: {
        ...entry.magicInitiate,
        freeCastExpended: undefined
      }
    };
  });

  return didRestoreFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function consumeFeyTouchedFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendFreeCast = false;

  if (!derivedState.hasFeyTouched) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendFreeCast ||
      entry.feat !== FEATS.FEY_TOUCHED ||
      !entry.feyTouched ||
      (entry.feyTouched.spellId !== spellId && spellId !== feyTouchedMistyStepSpellId) ||
      entry.feyTouched.freeCastExpendedSpellIds?.includes(spellId) === true
    ) {
      return entry;
    }

    didSpendFreeCast = true;

    return {
      ...entry,
      feyTouched: {
        ...entry.feyTouched,
        freeCastExpendedSpellIds: [
          ...new Set([...(entry.feyTouched.freeCastExpendedSpellIds ?? []), spellId])
        ]
      }
    };
  });

  return didSpendFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreFeyTouchedFreeCastsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreFreeCast = false;

  if (!derivedState.hasFeyTouched) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.FEY_TOUCHED ||
      !entry.feyTouched ||
      !entry.feyTouched.freeCastExpendedSpellIds ||
      entry.feyTouched.freeCastExpendedSpellIds.length === 0
    ) {
      return entry;
    }

    didRestoreFreeCast = true;

    return {
      ...entry,
      feyTouched: {
        ...entry.feyTouched,
        freeCastExpendedSpellIds: undefined
      }
    };
  });

  return didRestoreFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function consumeRitualCasterQuickRitualForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendQuickRitual = false;

  if (!derivedState.hasRitualCaster || derivedState.ritualCasterQuickRitualRemaining <= 0) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendQuickRitual ||
      entry.feat !== FEATS.RITUAL_CASTER ||
      !entry.ritualCaster ||
      entry.ritualCaster.quickRitualExpended === true
    ) {
      return entry;
    }

    didSpendQuickRitual = true;

    return {
      ...entry,
      ritualCaster: {
        ...entry.ritualCaster,
        quickRitualExpended: true
      }
    };
  });

  return didSpendQuickRitual
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreRitualCasterQuickRitualForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreQuickRitual = false;

  if (!derivedState.hasRitualCaster) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.RITUAL_CASTER ||
      !entry.ritualCaster ||
      entry.ritualCaster.quickRitualExpended !== true
    ) {
      return entry;
    }

    didRestoreQuickRitual = true;

    return {
      ...entry,
      ritualCaster: {
        ...entry.ritualCaster,
        quickRitualExpended: undefined
      }
    };
  });

  return didRestoreQuickRitual
    ? {
        ...character,
        feats
      }
    : character;
}

export function consumeShadowTouchedFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendFreeCast = false;

  if (!derivedState.hasShadowTouched) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendFreeCast ||
      entry.feat !== FEATS.SHADOW_TOUCHED ||
      !entry.shadowTouched ||
      (entry.shadowTouched.spellId !== spellId && spellId !== shadowTouchedInvisibilitySpellId) ||
      entry.shadowTouched.freeCastExpendedSpellIds?.includes(spellId) === true
    ) {
      return entry;
    }

    didSpendFreeCast = true;

    return {
      ...entry,
      shadowTouched: {
        ...entry.shadowTouched,
        freeCastExpendedSpellIds: [
          ...new Set([...(entry.shadowTouched.freeCastExpendedSpellIds ?? []), spellId])
        ]
      }
    };
  });

  return didSpendFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreShadowTouchedFreeCastsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreFreeCast = false;

  if (!derivedState.hasShadowTouched) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.SHADOW_TOUCHED ||
      !entry.shadowTouched ||
      !entry.shadowTouched.freeCastExpendedSpellIds ||
      entry.shadowTouched.freeCastExpendedSpellIds.length === 0
    ) {
      return entry;
    }

    didRestoreFreeCast = true;

    return {
      ...entry,
      shadowTouched: {
        ...entry.shadowTouched,
        freeCastExpendedSpellIds: undefined
      }
    };
  });

  return didRestoreFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function consumeTelepathicDetectThoughtsFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendFreeCast = false;

  if (!derivedState.hasTelepathic || spellId !== telepathicDetectThoughtsSpellId) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendFreeCast ||
      entry.feat !== FEATS.TELEPATHIC ||
      !entry.telepathic ||
      entry.telepathic.detectThoughtsExpended === true
    ) {
      return entry;
    }

    didSpendFreeCast = true;

    return {
      ...entry,
      telepathic: {
        ...entry.telepathic,
        detectThoughtsExpended: true
      }
    };
  });

  return didSpendFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreTelepathicDetectThoughtsFreeCastForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreFreeCast = false;

  if (!derivedState.hasTelepathic) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.TELEPATHIC ||
      !entry.telepathic ||
      entry.telepathic.detectThoughtsExpended !== true
    ) {
      return entry;
    }

    didRestoreFreeCast = true;

    return {
      ...entry,
      telepathic: {
        ...entry.telepathic,
        detectThoughtsExpended: undefined
      }
    };
  });

  return didRestoreFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function spendMageSlayerGuardedMindForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendGuardedMind = false;

  if (!derivedState.hasMageSlayer || derivedState.mageSlayerGuardedMindRemaining <= 0) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendGuardedMind ||
      entry.feat !== FEATS.MAGE_SLAYER ||
      !entry.mageSlayer ||
      entry.mageSlayer.guardedMindExpended === true
    ) {
      return entry;
    }

    didSpendGuardedMind = true;

    return {
      ...entry,
      mageSlayer: {
        ...entry.mageSlayer,
        guardedMindExpended: true
      }
    };
  });

  return didSpendGuardedMind
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreMageSlayerGuardedMindForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreGuardedMind = false;

  if (!derivedState.hasMageSlayer) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.MAGE_SLAYER ||
      !entry.mageSlayer ||
      entry.mageSlayer.guardedMindExpended !== true
    ) {
      return entry;
    }

    didRestoreGuardedMind = true;

    return {
      ...entry,
      mageSlayer: {
        ...entry.mageSlayer,
        guardedMindExpended: undefined
      }
    };
  });

  return didRestoreGuardedMind
    ? {
        ...character,
        feats
      }
    : character;
}

function setLuckyPointsExpendedForCharacter(
  character: Character,
  getNextPointsExpended: (current: number, total: number) => number
): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasLucky || derivedState.luckyPointsTotal <= 0) {
    return character;
  }

  const currentPointsExpended = derivedState.luckyPointsTotal - derivedState.luckyPointsRemaining;
  const nextPointsExpended = Math.max(
    0,
    Math.min(
      derivedState.luckyPointsTotal,
      Math.floor(getNextPointsExpended(currentPointsExpended, derivedState.luckyPointsTotal))
    )
  );

  if (nextPointsExpended === currentPointsExpended) {
    return character;
  }

  return {
    ...character,
    feats: derivedState.normalizedFeats.map((entry) =>
      entry.feat === FEATS.LUCKY
        ? {
            ...entry,
            lucky:
              nextPointsExpended > 0
                ? {
                    pointsExpended: nextPointsExpended
                  }
                : undefined
          }
        : entry
    )
  };
}

export function spendLuckyPointForCharacter(character: Character): Character {
  return setLuckyPointsExpendedForCharacter(character, (currentPointsExpended, total) =>
    currentPointsExpended >= total ? currentPointsExpended : currentPointsExpended + 1
  );
}

export function resetLuckyPointForCharacter(character: Character): Character {
  return setLuckyPointsExpendedForCharacter(character, (currentPointsExpended) =>
    currentPointsExpended <= 0 ? currentPointsExpended : currentPointsExpended - 1
  );
}

export function restoreLuckyPointsForCharacter(character: Character): Character {
  return setLuckyPointsExpendedForCharacter(character, () => 0);
}
