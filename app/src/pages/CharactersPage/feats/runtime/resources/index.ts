import { FEATS, type ReactionEntry, type SpellDescriptionEntry, type SpellEntry } from "../../../../../codex/entries";
import type { Character, CharacterFeatEntry, ItemRecord } from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import type { FeatureActionCard } from "../../../classFeatures/types";
import {
  applyFeatureSpellCastEffects,
  type FeatureSpellActionPathContribution,
  type FeatureSpellCastEffectContext
} from "../../../featureContributions";
import { getHitDiceRemainingForCharacter, getHitDieFormulaForClass } from "../../../hitDice";
import {
  boonOfRevelryIrresistibleDanceSpellId,
  feyTouchedMistyStepSpellId,
  shadowTouchedInvisibilitySpellId,
  spellfireSparkSacredFlameSpellId,
  spellfireSparkSpellfireFlameSpellCastEffectId,
  fairyTricksterFlusteringStrikeActionKey,
  enclaveMagicBeastSenseSpellId,
  lordlyResolveStandardBearerActionKey,
  purpleDragonCommandantEncourageAllyActionKey,
  telepathicDetectThoughtsSpellId
} from "../constants";
import { getFeatItemAdditionalDescription } from "../itemAdditions";
import {
  applyLordlyResolveStandardBearerStatusForCharacter,
  hasActiveLordlyResolveStandardBearerStatus
} from "../lordlyResolve";
import { collectFeatDerivedState, hasFeatForCharacter } from "../state";
import type { FeatRuntimeCharacter } from "../types";

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

export function getFairyTricksterFlusteringStrikeStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (
    !derivedState.hasFairyTrickster ||
    derivedState.fairyTricksterFlusteringStrikeTotal <= 0
  ) {
    return null;
  }

  return {
    available: derivedState.fairyTricksterFlusteringStrikeRemaining > 0,
    expended: derivedState.fairyTricksterFlusteringStrikeRemaining <= 0,
    usesRemaining: derivedState.fairyTricksterFlusteringStrikeRemaining,
    usesTotal: derivedState.fairyTricksterFlusteringStrikeTotal
  };
}

export function getGenieMagicWishMagicStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasGenieMagic || derivedState.genieMagicWishMagicTotal <= 0) {
    return null;
  }

  return {
    available: derivedState.genieMagicWishMagicRemaining > 0,
    expended: derivedState.genieMagicWishMagicRemaining <= 0,
    usesRemaining: derivedState.genieMagicWishMagicRemaining,
    usesTotal: derivedState.genieMagicWishMagicTotal
  };
}

export function getEnclaveMagicTwoHeartsOneMindStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasEnclaveMagic || derivedState.enclaveMagicTwoHeartsOneMindTotal <= 0) {
    return null;
  }

  return {
    available: derivedState.enclaveMagicTwoHeartsOneMindRemaining > 0,
    expended: derivedState.enclaveMagicTwoHeartsOneMindRemaining <= 0,
    usesRemaining: derivedState.enclaveMagicTwoHeartsOneMindRemaining,
    usesTotal: derivedState.enclaveMagicTwoHeartsOneMindTotal
  };
}

export function getMythalTouchedMythalWardStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (
    !derivedState.hasMythalTouched ||
    derivedState.mythalTouchedMythalWardTotal <= 0
  ) {
    return null;
  }

  return {
    available: derivedState.mythalTouchedMythalWardRemaining > 0,
    expended: derivedState.mythalTouchedMythalWardRemaining <= 0,
    usesRemaining: derivedState.mythalTouchedMythalWardRemaining,
    usesTotal: derivedState.mythalTouchedMythalWardTotal
  };
}

export function getLordlyResolveStandardBearerStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (
    !derivedState.hasLordlyResolve ||
    derivedState.lordlyResolveStandardBearerTotal <= 0
  ) {
    return null;
  }

  return {
    available: derivedState.lordlyResolveStandardBearerRemaining > 0,
    expended: derivedState.lordlyResolveStandardBearerRemaining <= 0,
    usesRemaining: derivedState.lordlyResolveStandardBearerRemaining,
    usesTotal: derivedState.lordlyResolveStandardBearerTotal
  };
}

export function getPurpleDragonCommandantEncourageAllyStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (
    !derivedState.hasPurpleDragonCommandant ||
    derivedState.purpleDragonCommandantEncourageAllyTotal <= 0
  ) {
    return null;
  }

  return {
    available: derivedState.purpleDragonCommandantEncourageAllyRemaining > 0,
    expended: derivedState.purpleDragonCommandantEncourageAllyRemaining <= 0,
    usesRemaining: derivedState.purpleDragonCommandantEncourageAllyRemaining,
    usesTotal: derivedState.purpleDragonCommandantEncourageAllyTotal
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

export function spendFairyTricksterFlusteringStrikeForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendFlusteringStrike = false;

  if (
    !derivedState.hasFairyTrickster ||
    derivedState.fairyTricksterFlusteringStrikeRemaining <= 0
  ) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (didSpendFlusteringStrike || entry.feat !== FEATS.FAIRY_TRICKSTER) {
      return entry;
    }

    const currentExpended = Math.max(
      0,
      Math.floor(entry.fairyTrickster?.flusteringStrikeExpended ?? 0)
    );

    if (currentExpended >= derivedState.fairyTricksterFlusteringStrikeTotal) {
      return entry;
    }

    didSpendFlusteringStrike = true;

    return {
      ...entry,
      fairyTrickster: {
        ...(entry.fairyTrickster ?? {}),
        flusteringStrikeExpended: currentExpended + 1
      }
    };
  });

  return didSpendFlusteringStrike
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreFairyTricksterFlusteringStrikeForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreFlusteringStrike = false;

  if (!derivedState.hasFairyTrickster) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.FAIRY_TRICKSTER ||
      !entry.fairyTrickster ||
      !entry.fairyTrickster.flusteringStrikeExpended
    ) {
      return entry;
    }

    didRestoreFlusteringStrike = true;

    return {
      ...entry,
      fairyTrickster: undefined
    };
  });

  return didRestoreFlusteringStrike
    ? {
        ...character,
        feats
      }
    : character;
}

export function spendGenieMagicWishMagicForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendWishMagic = false;

  if (!derivedState.hasGenieMagic || derivedState.genieMagicWishMagicRemaining <= 0) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendWishMagic ||
      entry.feat !== FEATS.GENIE_MAGIC ||
      entry.genieMagic?.wishMagicExpended === true
    ) {
      return entry;
    }

    didSpendWishMagic = true;

    return {
      ...entry,
      genieMagic: {
        ...(entry.genieMagic ?? {}),
        wishMagicExpended: true
      }
    };
  });

  return didSpendWishMagic
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreGenieMagicWishMagicForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreWishMagic = false;

  if (!derivedState.hasGenieMagic) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.GENIE_MAGIC ||
      !entry.genieMagic ||
      entry.genieMagic.wishMagicExpended !== true
    ) {
      return entry;
    }

    didRestoreWishMagic = true;

    return {
      ...entry,
      genieMagic: {
        ...entry.genieMagic,
        wishMagicExpended: undefined
      }
    };
  });

  return didRestoreWishMagic
    ? {
        ...character,
        feats
      }
    : character;
}

export function spendLordlyResolveStandardBearerForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendStandardBearer = false;

  if (
    !derivedState.hasLordlyResolve ||
    derivedState.lordlyResolveStandardBearerRemaining <= 0 ||
    hasActiveLordlyResolveStandardBearerStatus(character.statusEntries)
  ) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendStandardBearer ||
      entry.feat !== FEATS.LORDLY_RESOLVE ||
      entry.lordlyResolve?.standardBearerExpended === true
    ) {
      return entry;
    }

    didSpendStandardBearer = true;

    return {
      ...entry,
      lordlyResolve: {
        ...(entry.lordlyResolve ?? {}),
        standardBearerExpended: true
      }
    };
  });

  return didSpendStandardBearer
    ? applyLordlyResolveStandardBearerStatusForCharacter({
        ...character,
        feats
      })
    : character;
}

export function restoreLordlyResolveStandardBearerForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreStandardBearer = false;

  if (!derivedState.hasLordlyResolve) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.LORDLY_RESOLVE ||
      !entry.lordlyResolve ||
      entry.lordlyResolve.standardBearerExpended !== true
    ) {
      return entry;
    }

    didRestoreStandardBearer = true;

    return {
      ...entry,
      lordlyResolve: undefined
    };
  });

  return didRestoreStandardBearer
    ? {
        ...character,
        feats
      }
    : character;
}

export function canUseEnclaveMagicTwoHeartsOneMindForSpell(
  character: FeatRuntimeCharacter,
  spellId: string
): boolean {
  const derivedState = collectFeatDerivedState(character);

  return spellId === enclaveMagicBeastSenseSpellId && derivedState.hasEnclaveMagic;
}

export function spendEnclaveMagicTwoHeartsOneMindForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendTwoHeartsOneMind = false;

  if (
    !derivedState.hasEnclaveMagic ||
    derivedState.enclaveMagicTwoHeartsOneMindRemaining <= 0
  ) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendTwoHeartsOneMind ||
      entry.feat !== FEATS.ENCLAVE_MAGIC ||
      entry.enclaveMagic?.twoHeartsOneMindExpended === true
    ) {
      return entry;
    }

    didSpendTwoHeartsOneMind = true;

    return {
      ...entry,
      enclaveMagic: {
        ...(entry.enclaveMagic ?? {}),
        twoHeartsOneMindExpended: true
      }
    };
  });

  return didSpendTwoHeartsOneMind
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreEnclaveMagicTwoHeartsOneMindForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreTwoHeartsOneMind = false;

  if (!derivedState.hasEnclaveMagic) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.ENCLAVE_MAGIC ||
      !entry.enclaveMagic ||
      entry.enclaveMagic.twoHeartsOneMindExpended !== true
    ) {
      return entry;
    }

    didRestoreTwoHeartsOneMind = true;

    return {
      ...entry,
      enclaveMagic: {
        ...entry.enclaveMagic,
        twoHeartsOneMindExpended: undefined
      }
    };
  });

  return didRestoreTwoHeartsOneMind
    ? {
        ...character,
        feats
      }
    : character;
}

export function spendMythalTouchedMythalWardForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendMythalWard = false;

  if (!derivedState.hasMythalTouched || derivedState.mythalTouchedMythalWardRemaining <= 0) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (didSpendMythalWard || entry.feat !== FEATS.MYTHAL_TOUCHED) {
      return entry;
    }

    const currentExpended = Math.max(
      0,
      Math.floor(entry.mythalTouched?.mythalWardExpended ?? 0)
    );

    if (currentExpended >= derivedState.mythalTouchedMythalWardTotal) {
      return entry;
    }

    didSpendMythalWard = true;

    return {
      ...entry,
      mythalTouched: {
        ...(entry.mythalTouched ?? {}),
        mythalWardExpended: currentExpended + 1
      }
    };
  });

  return didSpendMythalWard
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreMythalTouchedMythalWardForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreMythalWard = false;

  if (!derivedState.hasMythalTouched) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.MYTHAL_TOUCHED ||
      !entry.mythalTouched ||
      !entry.mythalTouched.mythalWardExpended
    ) {
      return entry;
    }

    didRestoreMythalWard = true;

    return {
      ...entry,
      mythalTouched: undefined
    };
  });

  return didRestoreMythalWard
    ? {
        ...character,
        feats
      }
    : character;
}

export function spendPurpleDragonCommandantEncourageAllyForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendEncourageAlly = false;

  if (
    !derivedState.hasPurpleDragonCommandant ||
    derivedState.purpleDragonCommandantEncourageAllyRemaining <= 0
  ) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (didSpendEncourageAlly || entry.feat !== FEATS.PURPLE_DRAGON_COMMANDANT) {
      return entry;
    }

    const currentExpended = Math.max(
      0,
      Math.floor(entry.purpleDragonCommandant?.encourageAllyExpended ?? 0)
    );

    if (currentExpended >= derivedState.purpleDragonCommandantEncourageAllyTotal) {
      return entry;
    }

    didSpendEncourageAlly = true;

    return {
      ...entry,
      purpleDragonCommandant: {
        ...(entry.purpleDragonCommandant ?? {}),
        encourageAllyExpended: currentExpended + 1
      }
    };
  });

  return didSpendEncourageAlly
    ? {
        ...character,
        feats
      }
    : character;
}

export function restorePurpleDragonCommandantEncourageAllyForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreEncourageAlly = false;

  if (!derivedState.hasPurpleDragonCommandant) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.PURPLE_DRAGON_COMMANDANT ||
      !entry.purpleDragonCommandant ||
      !entry.purpleDragonCommandant.encourageAllyExpended
    ) {
      return entry;
    }

    didRestoreEncourageAlly = true;

    return {
      ...entry,
      purpleDragonCommandant: undefined
    };
  });

  return didRestoreEncourageAlly
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

export function getBoonOfRecoveryLastStandStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (
    !derivedState.hasBoonOfRecovery ||
    derivedState.boonOfRecoveryLastStandTotal <= 0
  ) {
    return null;
  }

  return {
    available: derivedState.boonOfRecoveryLastStandRemaining > 0,
    expended: derivedState.boonOfRecoveryLastStandRemaining <= 0,
    usesRemaining: derivedState.boonOfRecoveryLastStandRemaining,
    usesTotal: derivedState.boonOfRecoveryLastStandTotal
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

export function spendBoonOfRecoveryLastStandForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendLastStand = false;

  if (
    !derivedState.hasBoonOfRecovery ||
    derivedState.boonOfRecoveryLastStandRemaining <= 0
  ) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendLastStand ||
      entry.feat !== FEATS.BOON_OF_RECOVERY ||
      entry.boonOfRecovery?.lastStandExpended === true
    ) {
      return entry;
    }

    didSpendLastStand = true;

    return {
      ...entry,
      boonOfRecovery: {
        ...(entry.boonOfRecovery ?? {}),
        lastStandExpended: true
      }
    };
  });

  return didSpendLastStand
    ? {
        ...character,
        feats
      }
    : character;
}

function hasBoonOfRecoveryResourceStateValues(
  state: CharacterFeatEntry["boonOfRecovery"]
): boolean {
  return Boolean(
    state?.lastStandExpended === true || (state?.recoverVitalityDiceExpended ?? 0) > 0
  );
}

export function restoreBoonOfRecoveryForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreBoonOfRecovery = false;

  if (!derivedState.hasBoonOfRecovery) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.BOON_OF_RECOVERY ||
      !hasBoonOfRecoveryResourceStateValues(entry.boonOfRecovery)
    ) {
      return entry;
    }

    didRestoreBoonOfRecovery = true;
    const boonOfRecovery = {
      ...entry.boonOfRecovery,
      lastStandExpended: undefined,
      recoverVitalityDiceExpended: undefined
    };

    return {
      ...entry,
      boonOfRecovery: hasBoonOfRecoveryResourceStateValues(boonOfRecovery)
        ? boonOfRecovery
        : undefined
    };
  });

  return didRestoreBoonOfRecovery
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreBoonOfRecoveryDiceForCharacter(character: Character): Character {
  return restoreBoonOfRecoveryForCharacter(character);
}

export function getBoonOfTerrorFleeFoolsStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasBoonOfTerror || derivedState.boonOfTerrorFleeFoolsTotal <= 0) {
    return null;
  }

  return {
    available: derivedState.boonOfTerrorFleeFoolsRemaining > 0,
    expended: derivedState.boonOfTerrorFleeFoolsRemaining <= 0,
    usesRemaining: derivedState.boonOfTerrorFleeFoolsRemaining,
    usesTotal: derivedState.boonOfTerrorFleeFoolsTotal
  };
}

export function getBoonOfSoulDrinkerSiphonLifeStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (
    !derivedState.hasBoonOfSoulDrinker ||
    derivedState.boonOfSoulDrinkerSiphonLifeTotal <= 0
  ) {
    return null;
  }

  return {
    available: derivedState.boonOfSoulDrinkerSiphonLifeRemaining > 0,
    expended: derivedState.boonOfSoulDrinkerSiphonLifeRemaining <= 0,
    usesRemaining: derivedState.boonOfSoulDrinkerSiphonLifeRemaining,
    usesTotal: derivedState.boonOfSoulDrinkerSiphonLifeTotal
  };
}

export function spendBoonOfSoulDrinkerSiphonLifeForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendSiphonLife = false;

  if (
    !derivedState.hasBoonOfSoulDrinker ||
    derivedState.boonOfSoulDrinkerSiphonLifeRemaining <= 0
  ) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendSiphonLife ||
      entry.feat !== FEATS.BOON_OF_SOUL_DRINKER ||
      entry.boonOfSoulDrinker?.siphonLifeExpended === true
    ) {
      return entry;
    }

    didSpendSiphonLife = true;

    return {
      ...entry,
      boonOfSoulDrinker: {
        ...(entry.boonOfSoulDrinker ?? {}),
        siphonLifeExpended: true
      }
    };
  });

  return didSpendSiphonLife
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreBoonOfSoulDrinkerSiphonLifeForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreSiphonLife = false;

  if (!derivedState.hasBoonOfSoulDrinker) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.BOON_OF_SOUL_DRINKER ||
      entry.boonOfSoulDrinker?.siphonLifeExpended !== true
    ) {
      return entry;
    }

    didRestoreSiphonLife = true;

    return {
      ...entry,
      boonOfSoulDrinker: undefined
    };
  });

  return didRestoreSiphonLife
    ? {
        ...character,
        feats
      }
    : character;
}

export function spendBoonOfTerrorFleeFoolsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendFleeFools = false;

  if (!derivedState.hasBoonOfTerror || derivedState.boonOfTerrorFleeFoolsRemaining <= 0) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendFleeFools ||
      entry.feat !== FEATS.BOON_OF_TERROR ||
      entry.boonOfTerror?.fleeFoolsExpended === true
    ) {
      return entry;
    }

    didSpendFleeFools = true;

    return {
      ...entry,
      boonOfTerror: {
        ...(entry.boonOfTerror ?? {}),
        fleeFoolsExpended: true
      }
    };
  });

  return didSpendFleeFools
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreBoonOfTerrorFleeFoolsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreFleeFools = false;

  if (!derivedState.hasBoonOfTerror) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.BOON_OF_TERROR ||
      entry.boonOfTerror?.fleeFoolsExpended !== true
    ) {
      return entry;
    }

    didRestoreFleeFools = true;

    return {
      ...entry,
      boonOfTerror: undefined
    };
  });

  return didRestoreFleeFools
    ? {
        ...character,
        feats
      }
    : character;
}

export function getBoonOfRevelryIrresistibleDanceFreeCastStateForCharacter(
  character: FeatRuntimeCharacter,
  spellId: string
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  if (spellId !== boonOfRevelryIrresistibleDanceSpellId) {
    return null;
  }

  const entries =
    collectFeatDerivedState(character).boonOfRevelryIrresistibleDanceFreeCastEntries;

  if (entries.length === 0) {
    return null;
  }

  const usesRemaining = entries.filter((entry) => !entry.expended).length;

  return {
    available: usesRemaining > 0,
    expended: usesRemaining <= 0,
    usesRemaining,
    usesTotal: entries.length
  };
}

export function consumeBoonOfRevelryIrresistibleDanceFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendFreeCast = false;

  if (
    spellId !== boonOfRevelryIrresistibleDanceSpellId ||
    derivedState.boonOfRevelryIrresistibleDanceFreeCastEntries.every((entry) => entry.expended)
  ) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendFreeCast ||
      entry.feat !== FEATS.BOON_OF_REVELRY ||
      entry.boonOfRevelry?.irresistibleDanceExpended === true
    ) {
      return entry;
    }

    didSpendFreeCast = true;

    return {
      ...entry,
      boonOfRevelry: {
        ...(entry.boonOfRevelry ?? {}),
        irresistibleDanceExpended: true
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

export function restoreBoonOfRevelryIrresistibleDanceFreeCastForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreFreeCast = false;

  if (derivedState.boonOfRevelryIrresistibleDanceFreeCastEntries.length === 0) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.BOON_OF_REVELRY ||
      entry.boonOfRevelry?.irresistibleDanceExpended !== true
    ) {
      return entry;
    }

    didRestoreFreeCast = true;

    return {
      ...entry,
      boonOfRevelry: undefined
    };
  });

  return didRestoreFreeCast
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

export function activateFeatActionForCharacter(
  character: Character,
  actionKey: string
): Character {
  if (actionKey === fairyTricksterFlusteringStrikeActionKey) {
    return spendFairyTricksterFlusteringStrikeForCharacter(character);
  }

  if (actionKey === purpleDragonCommandantEncourageAllyActionKey) {
    return spendPurpleDragonCommandantEncourageAllyForCharacter(character);
  }

  if (actionKey === lordlyResolveStandardBearerActionKey) {
    return spendLordlyResolveStandardBearerForCharacter(character);
  }

  return character;
}
