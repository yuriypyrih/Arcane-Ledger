import { getClericDomainSpellCastEffects } from "../../../classFeatures/cleric/subclasses/clericDomainSpellEffects";
import { getWizardSubclassSpellCastEffects } from "../../../classFeatures/wizard/subclasses";
import { getPhantomSpiritQueryCastEffects } from "../../../classFeatures/rogue/subclasses/roguePhantomTokens";
import { getBardSpiritsSpellCastEffects } from "../../../classFeatures/bard/subclasses/bardCollegeOfSpiritsEmpowered";
import { updateFeatEntries } from "./stateAdapter";
import { getResourceUsageState } from "../../../classFeatures/shared/resourceState";
import {
  type ReactionEntry,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import { FEATS } from "../../../../../codex/entries/enums";
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
  return getHitDieFormulaForClass(character.className, character.customClass, character.classRules);
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
  return getResourceUsageState(
    derivedState.hasBoonOfFate,
    derivedState.boonOfFateImproveFateTotal,
    derivedState.boonOfFateImproveFateRemaining
  );
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
  return getResourceUsageState(
    derivedState.hasCultOfDragonInitiate,
    derivedState.cultOfDragonInitiateInspiredByFearTotal,
    derivedState.cultOfDragonInitiateInspiredByFearRemaining
  );
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
  return getResourceUsageState(
    derivedState.hasFairyTrickster,
    derivedState.fairyTricksterFlusteringStrikeTotal,
    derivedState.fairyTricksterFlusteringStrikeRemaining
  );
}

export function getGenieMagicWishMagicStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);
  return getResourceUsageState(
    derivedState.hasGenieMagic,
    derivedState.genieMagicWishMagicTotal,
    derivedState.genieMagicWishMagicRemaining
  );
}

export function getEnclaveMagicTwoHeartsOneMindStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);
  return getResourceUsageState(
    derivedState.hasEnclaveMagic,
    derivedState.enclaveMagicTwoHeartsOneMindTotal,
    derivedState.enclaveMagicTwoHeartsOneMindRemaining
  );
}

export function getMythalTouchedMythalWardStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);
  return getResourceUsageState(
    derivedState.hasMythalTouched,
    derivedState.mythalTouchedMythalWardTotal,
    derivedState.mythalTouchedMythalWardRemaining
  );
}

export function getLordlyResolveStandardBearerStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);
  return getResourceUsageState(
    derivedState.hasLordlyResolve,
    derivedState.lordlyResolveStandardBearerTotal,
    derivedState.lordlyResolveStandardBearerRemaining
  );
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
  return getResourceUsageState(
    derivedState.hasPurpleDragonCommandant,
    derivedState.purpleDragonCommandantEncourageAllyTotal,
    derivedState.purpleDragonCommandantEncourageAllyRemaining
  );
}

export function spendCultOfDragonInitiateInspiredByFearForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);

  if (
    !derivedState.hasCultOfDragonInitiate ||
    derivedState.cultOfDragonInitiateInspiredByFearRemaining <= 0
  ) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.CULT_OF_THE_DRAGON_INITIATE ||
        !entry.cultOfDragonInitiate ||
        entry.cultOfDragonInitiate.inspiredByFearExpended === true
      ) {
        return entry;
      }

      return {
        ...entry,
        cultOfDragonInitiate: {
          ...entry.cultOfDragonInitiate,
          inspiredByFearExpended: true
        }
      };
    },
    true
  );
}

export function spendFairyTricksterFlusteringStrikeForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (
    !derivedState.hasFairyTrickster ||
    derivedState.fairyTricksterFlusteringStrikeRemaining <= 0
  ) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (entry.feat !== FEATS.FAIRY_TRICKSTER) {
        return entry;
      }

      const currentExpended = Math.max(
        0,
        Math.floor(entry.fairyTrickster?.flusteringStrikeExpended ?? 0)
      );

      if (currentExpended >= derivedState.fairyTricksterFlusteringStrikeTotal) {
        return entry;
      }

      return {
        ...entry,
        fairyTrickster: {
          ...(entry.fairyTrickster ?? {}),
          flusteringStrikeExpended: currentExpended + 1
        }
      };
    },
    true
  );
}

export function restoreFairyTricksterFlusteringStrikeForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasFairyTrickster) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.FAIRY_TRICKSTER ||
        !entry.fairyTrickster ||
        !entry.fairyTrickster.flusteringStrikeExpended
      ) {
        return entry;
      }

      return {
        ...entry,
        fairyTrickster: undefined
      };
    },
    false
  );
}

export function spendGenieMagicWishMagicForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasGenieMagic || derivedState.genieMagicWishMagicRemaining <= 0) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (entry.feat !== FEATS.GENIE_MAGIC || entry.genieMagic?.wishMagicExpended === true) {
        return entry;
      }

      return {
        ...entry,
        genieMagic: {
          ...(entry.genieMagic ?? {}),
          wishMagicExpended: true
        }
      };
    },
    true
  );
}

export function restoreGenieMagicWishMagicForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasGenieMagic) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.GENIE_MAGIC ||
        !entry.genieMagic ||
        entry.genieMagic.wishMagicExpended !== true
      ) {
        return entry;
      }

      return {
        ...entry,
        genieMagic: {
          ...entry.genieMagic,
          wishMagicExpended: undefined
        }
      };
    },
    false
  );
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

export function restoreLordlyResolveStandardBearerForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasLordlyResolve) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.LORDLY_RESOLVE ||
        !entry.lordlyResolve ||
        entry.lordlyResolve.standardBearerExpended !== true
      ) {
        return entry;
      }

      return {
        ...entry,
        lordlyResolve: undefined
      };
    },
    false
  );
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

  if (!derivedState.hasEnclaveMagic || derivedState.enclaveMagicTwoHeartsOneMindRemaining <= 0) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.ENCLAVE_MAGIC ||
        entry.enclaveMagic?.twoHeartsOneMindExpended === true
      ) {
        return entry;
      }

      return {
        ...entry,
        enclaveMagic: {
          ...(entry.enclaveMagic ?? {}),
          twoHeartsOneMindExpended: true
        }
      };
    },
    true
  );
}

export function restoreEnclaveMagicTwoHeartsOneMindForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasEnclaveMagic) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.ENCLAVE_MAGIC ||
        !entry.enclaveMagic ||
        entry.enclaveMagic.twoHeartsOneMindExpended !== true
      ) {
        return entry;
      }

      return {
        ...entry,
        enclaveMagic: {
          ...entry.enclaveMagic,
          twoHeartsOneMindExpended: undefined
        }
      };
    },
    false
  );
}

export function spendMythalTouchedMythalWardForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasMythalTouched || derivedState.mythalTouchedMythalWardRemaining <= 0) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (entry.feat !== FEATS.MYTHAL_TOUCHED) {
        return entry;
      }

      const currentExpended = Math.max(0, Math.floor(entry.mythalTouched?.mythalWardExpended ?? 0));

      if (currentExpended >= derivedState.mythalTouchedMythalWardTotal) {
        return entry;
      }

      return {
        ...entry,
        mythalTouched: {
          ...(entry.mythalTouched ?? {}),
          mythalWardExpended: currentExpended + 1
        }
      };
    },
    true
  );
}

export function restoreMythalTouchedMythalWardForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasMythalTouched) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.MYTHAL_TOUCHED ||
        !entry.mythalTouched ||
        !entry.mythalTouched.mythalWardExpended
      ) {
        return entry;
      }

      return {
        ...entry,
        mythalTouched: undefined
      };
    },
    false
  );
}

export function spendPurpleDragonCommandantEncourageAllyForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);

  if (
    !derivedState.hasPurpleDragonCommandant ||
    derivedState.purpleDragonCommandantEncourageAllyRemaining <= 0
  ) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (entry.feat !== FEATS.PURPLE_DRAGON_COMMANDANT) {
        return entry;
      }

      const currentExpended = Math.max(
        0,
        Math.floor(entry.purpleDragonCommandant?.encourageAllyExpended ?? 0)
      );

      if (currentExpended >= derivedState.purpleDragonCommandantEncourageAllyTotal) {
        return entry;
      }

      return {
        ...entry,
        purpleDragonCommandant: {
          ...(entry.purpleDragonCommandant ?? {}),
          encourageAllyExpended: currentExpended + 1
        }
      };
    },
    true
  );
}

export function restorePurpleDragonCommandantEncourageAllyForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasPurpleDragonCommandant) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.PURPLE_DRAGON_COMMANDANT ||
        !entry.purpleDragonCommandant ||
        !entry.purpleDragonCommandant.encourageAllyExpended
      ) {
        return entry;
      }

      return {
        ...entry,
        purpleDragonCommandant: undefined
      };
    },
    false
  );
}

export function restoreCultOfDragonInitiateInspiredByFearForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasCultOfDragonInitiate) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.CULT_OF_THE_DRAGON_INITIATE ||
        !entry.cultOfDragonInitiate ||
        entry.cultOfDragonInitiate.inspiredByFearExpended !== true
      ) {
        return entry;
      }

      return {
        ...entry,
        cultOfDragonInitiate: {
          ...entry.cultOfDragonInitiate,
          inspiredByFearExpended: undefined
        }
      };
    },
    false
  );
}

export function getPurpleDragonRookRallyingCryStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);
  return getResourceUsageState(
    derivedState.hasPurpleDragonRook,
    derivedState.purpleDragonRookRallyingCryTotal,
    derivedState.purpleDragonRookRallyingCryRemaining
  );
}

export function spendPurpleDragonRookRallyingCryForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasPurpleDragonRook || derivedState.purpleDragonRookRallyingCryRemaining <= 0) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.PURPLE_DRAGON_ROOK ||
        !entry.purpleDragonRook ||
        entry.purpleDragonRook.rallyingCryExpended === true
      ) {
        return entry;
      }

      return {
        ...entry,
        purpleDragonRook: {
          ...entry.purpleDragonRook,
          rallyingCryExpended: true
        }
      };
    },
    true
  );
}

export function restorePurpleDragonRookRallyingCryForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasPurpleDragonRook) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.PURPLE_DRAGON_ROOK ||
        !entry.purpleDragonRook ||
        entry.purpleDragonRook.rallyingCryExpended !== true
      ) {
        return entry;
      }

      return {
        ...entry,
        purpleDragonRook: {
          ...entry.purpleDragonRook,
          rallyingCryExpended: undefined
        }
      };
    },
    false
  );
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

  if (!derivedState.hasSpellfireSpark || derivedState.spellfireSparkSpellfireFlameRemaining <= 0) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (entry.feat !== FEATS.SPELLFIRE_SPARK || !entry.spellfireSpark) {
        return entry;
      }

      const currentExpended = Math.max(
        0,
        Math.floor(entry.spellfireSpark.spellfireFlameExpended ?? 0)
      );

      if (currentExpended >= derivedState.spellfireSparkSpellfireFlameTotal) {
        return entry;
      }

      return {
        ...entry,
        spellfireSpark: {
          ...entry.spellfireSpark,
          spellfireFlameExpended: currentExpended + 1
        }
      };
    },
    true
  );
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
    [
      ...collectFeatDerivedState(character).spellCastEffects,
      ...getBardSpiritsSpellCastEffects(character),
      ...getPhantomSpiritQueryCastEffects(character),
      ...getClericDomainSpellCastEffects(character),
      ...getWizardSubclassSpellCastEffects(character)
    ].map((effect) =>
      effect.id === spellfireSparkSpellfireFlameSpellCastEffectId && !effect.apply
        ? {
            ...effect,
            apply: (nextCharacter: Character, effectContext: FeatureSpellCastEffectContext) =>
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

export function restoreSpellfireSparkSpellfireFlameForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasSpellfireSpark) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.SPELLFIRE_SPARK ||
        !entry.spellfireSpark ||
        !entry.spellfireSpark.spellfireFlameExpended
      ) {
        return entry;
      }

      return {
        ...entry,
        spellfireSpark: {
          ...entry.spellfireSpark,
          spellfireFlameExpended: undefined
        }
      };
    },
    false
  );
}

export function consumeBoonOfFateImproveFateForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasBoonOfFate || derivedState.boonOfFateImproveFateRemaining <= 0) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (entry.feat !== FEATS.BOON_OF_FATE || entry.boonOfFate?.improveFateExpended === true) {
        return entry;
      }

      return {
        ...entry,
        boonOfFate: {
          ...(entry.boonOfFate ?? {}),
          improveFateExpended: true
        }
      };
    },
    true
  );
}

export function restoreBoonOfFateImproveFateForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasBoonOfFate) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (entry.feat !== FEATS.BOON_OF_FATE || entry.boonOfFate?.improveFateExpended !== true) {
        return entry;
      }

      return {
        ...entry,
        boonOfFate: undefined
      };
    },
    false
  );
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
  return getResourceUsageState(
    derivedState.hasBoonOfRecovery,
    derivedState.boonOfRecoveryDiceTotal,
    derivedState.boonOfRecoveryDiceRemaining
  );
}

export function getBoonOfRecoveryLastStandStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);
  return getResourceUsageState(
    derivedState.hasBoonOfRecovery,
    derivedState.boonOfRecoveryLastStandTotal,
    derivedState.boonOfRecoveryLastStandRemaining
  );
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

  if (
    !derivedState.hasBoonOfRecovery ||
    normalizedDiceCount > derivedState.boonOfRecoveryDiceRemaining
  ) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.BOON_OF_RECOVERY ||
        (entry.boonOfRecovery?.recoverVitalityDiceExpended ?? 0) >= 10
      ) {
        return entry;
      }

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
    },
    true
  );
}

export function spendBoonOfRecoveryLastStandForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasBoonOfRecovery || derivedState.boonOfRecoveryLastStandRemaining <= 0) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.BOON_OF_RECOVERY ||
        entry.boonOfRecovery?.lastStandExpended === true
      ) {
        return entry;
      }

      return {
        ...entry,
        boonOfRecovery: {
          ...(entry.boonOfRecovery ?? {}),
          lastStandExpended: true
        }
      };
    },
    true
  );
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

  if (!derivedState.hasBoonOfRecovery) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.BOON_OF_RECOVERY ||
        !hasBoonOfRecoveryResourceStateValues(entry.boonOfRecovery)
      ) {
        return entry;
      }
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
    },
    false
  );
}

export function restoreBoonOfRecoveryDiceForCharacter(character: Character): Character {
  return restoreBoonOfRecoveryForCharacter(character);
}

export function getBoonOfTerrorFleeFoolsStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);
  return getResourceUsageState(
    derivedState.hasBoonOfTerror,
    derivedState.boonOfTerrorFleeFoolsTotal,
    derivedState.boonOfTerrorFleeFoolsRemaining
  );
}

export function getBoonOfSoulDrinkerSiphonLifeStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);
  return getResourceUsageState(
    derivedState.hasBoonOfSoulDrinker,
    derivedState.boonOfSoulDrinkerSiphonLifeTotal,
    derivedState.boonOfSoulDrinkerSiphonLifeRemaining
  );
}

export function spendBoonOfSoulDrinkerSiphonLifeForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (
    !derivedState.hasBoonOfSoulDrinker ||
    derivedState.boonOfSoulDrinkerSiphonLifeRemaining <= 0
  ) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.BOON_OF_SOUL_DRINKER ||
        entry.boonOfSoulDrinker?.siphonLifeExpended === true
      ) {
        return entry;
      }

      return {
        ...entry,
        boonOfSoulDrinker: {
          ...(entry.boonOfSoulDrinker ?? {}),
          siphonLifeExpended: true
        }
      };
    },
    true
  );
}

export function restoreBoonOfSoulDrinkerSiphonLifeForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasBoonOfSoulDrinker) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.BOON_OF_SOUL_DRINKER ||
        entry.boonOfSoulDrinker?.siphonLifeExpended !== true
      ) {
        return entry;
      }

      return {
        ...entry,
        boonOfSoulDrinker: undefined
      };
    },
    false
  );
}

export function spendBoonOfTerrorFleeFoolsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasBoonOfTerror || derivedState.boonOfTerrorFleeFoolsRemaining <= 0) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (entry.feat !== FEATS.BOON_OF_TERROR || entry.boonOfTerror?.fleeFoolsExpended === true) {
        return entry;
      }

      return {
        ...entry,
        boonOfTerror: {
          ...(entry.boonOfTerror ?? {}),
          fleeFoolsExpended: true
        }
      };
    },
    true
  );
}

export function restoreBoonOfTerrorFleeFoolsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasBoonOfTerror) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (entry.feat !== FEATS.BOON_OF_TERROR || entry.boonOfTerror?.fleeFoolsExpended !== true) {
        return entry;
      }

      return {
        ...entry,
        boonOfTerror: undefined
      };
    },
    false
  );
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

  const entries = collectFeatDerivedState(character).boonOfRevelryIrresistibleDanceFreeCastEntries;

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

  if (
    spellId !== boonOfRevelryIrresistibleDanceSpellId ||
    derivedState.boonOfRevelryIrresistibleDanceFreeCastEntries.every((entry) => entry.expended)
  ) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.BOON_OF_REVELRY ||
        entry.boonOfRevelry?.irresistibleDanceExpended === true
      ) {
        return entry;
      }

      return {
        ...entry,
        boonOfRevelry: {
          ...(entry.boonOfRevelry ?? {}),
          irresistibleDanceExpended: true
        }
      };
    },
    true
  );
}

export function restoreBoonOfRevelryIrresistibleDanceFreeCastForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);

  if (derivedState.boonOfRevelryIrresistibleDanceFreeCastEntries.length === 0) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.BOON_OF_REVELRY ||
        entry.boonOfRevelry?.irresistibleDanceExpended !== true
      ) {
        return entry;
      }

      return {
        ...entry,
        boonOfRevelry: undefined
      };
    },
    false
  );
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

  if (!derivedState.hasMagicInitiate) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.MAGIC_INITIATE ||
        !entry.magicInitiate ||
        entry.magicInitiate.levelOneSpellId !== spellId ||
        entry.magicInitiate.freeCastExpended === true
      ) {
        return entry;
      }

      return {
        ...entry,
        magicInitiate: {
          ...entry.magicInitiate,
          freeCastExpended: true
        }
      };
    },
    true
  );
}

export function restoreMagicInitiateFreeCastsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasMagicInitiate) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.MAGIC_INITIATE ||
        !entry.magicInitiate ||
        entry.magicInitiate.freeCastExpended !== true
      ) {
        return entry;
      }

      return {
        ...entry,
        magicInitiate: {
          ...entry.magicInitiate,
          freeCastExpended: undefined
        }
      };
    },
    false
  );
}

export function consumeFeyTouchedFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasFeyTouched) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.FEY_TOUCHED ||
        !entry.feyTouched ||
        (entry.feyTouched.spellId !== spellId && spellId !== feyTouchedMistyStepSpellId) ||
        entry.feyTouched.freeCastExpendedSpellIds?.includes(spellId) === true
      ) {
        return entry;
      }

      return {
        ...entry,
        feyTouched: {
          ...entry.feyTouched,
          freeCastExpendedSpellIds: [
            ...new Set([...(entry.feyTouched.freeCastExpendedSpellIds ?? []), spellId])
          ]
        }
      };
    },
    true
  );
}

export function restoreFeyTouchedFreeCastsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasFeyTouched) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.FEY_TOUCHED ||
        !entry.feyTouched ||
        !entry.feyTouched.freeCastExpendedSpellIds ||
        entry.feyTouched.freeCastExpendedSpellIds.length === 0
      ) {
        return entry;
      }

      return {
        ...entry,
        feyTouched: {
          ...entry.feyTouched,
          freeCastExpendedSpellIds: undefined
        }
      };
    },
    false
  );
}

export function consumeRitualCasterQuickRitualForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasRitualCaster || derivedState.ritualCasterQuickRitualRemaining <= 0) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.RITUAL_CASTER ||
        !entry.ritualCaster ||
        entry.ritualCaster.quickRitualExpended === true
      ) {
        return entry;
      }

      return {
        ...entry,
        ritualCaster: {
          ...entry.ritualCaster,
          quickRitualExpended: true
        }
      };
    },
    true
  );
}

export function restoreRitualCasterQuickRitualForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasRitualCaster) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.RITUAL_CASTER ||
        !entry.ritualCaster ||
        entry.ritualCaster.quickRitualExpended !== true
      ) {
        return entry;
      }

      return {
        ...entry,
        ritualCaster: {
          ...entry.ritualCaster,
          quickRitualExpended: undefined
        }
      };
    },
    false
  );
}

export function consumeShadowTouchedFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasShadowTouched) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.SHADOW_TOUCHED ||
        !entry.shadowTouched ||
        (entry.shadowTouched.spellId !== spellId && spellId !== shadowTouchedInvisibilitySpellId) ||
        entry.shadowTouched.freeCastExpendedSpellIds?.includes(spellId) === true
      ) {
        return entry;
      }

      return {
        ...entry,
        shadowTouched: {
          ...entry.shadowTouched,
          freeCastExpendedSpellIds: [
            ...new Set([...(entry.shadowTouched.freeCastExpendedSpellIds ?? []), spellId])
          ]
        }
      };
    },
    true
  );
}

export function restoreShadowTouchedFreeCastsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasShadowTouched) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.SHADOW_TOUCHED ||
        !entry.shadowTouched ||
        !entry.shadowTouched.freeCastExpendedSpellIds ||
        entry.shadowTouched.freeCastExpendedSpellIds.length === 0
      ) {
        return entry;
      }

      return {
        ...entry,
        shadowTouched: {
          ...entry.shadowTouched,
          freeCastExpendedSpellIds: undefined
        }
      };
    },
    false
  );
}

export function consumeTelepathicDetectThoughtsFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasTelepathic || spellId !== telepathicDetectThoughtsSpellId) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.TELEPATHIC ||
        !entry.telepathic ||
        entry.telepathic.detectThoughtsExpended === true
      ) {
        return entry;
      }

      return {
        ...entry,
        telepathic: {
          ...entry.telepathic,
          detectThoughtsExpended: true
        }
      };
    },
    true
  );
}

export function restoreTelepathicDetectThoughtsFreeCastForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasTelepathic) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.TELEPATHIC ||
        !entry.telepathic ||
        entry.telepathic.detectThoughtsExpended !== true
      ) {
        return entry;
      }

      return {
        ...entry,
        telepathic: {
          ...entry.telepathic,
          detectThoughtsExpended: undefined
        }
      };
    },
    false
  );
}

export function spendMageSlayerGuardedMindForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasMageSlayer || derivedState.mageSlayerGuardedMindRemaining <= 0) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.MAGE_SLAYER ||
        !entry.mageSlayer ||
        entry.mageSlayer.guardedMindExpended === true
      ) {
        return entry;
      }

      return {
        ...entry,
        mageSlayer: {
          ...entry.mageSlayer,
          guardedMindExpended: true
        }
      };
    },
    true
  );
}

export function restoreMageSlayerGuardedMindForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasMageSlayer) {
    return character;
  }
  return updateFeatEntries(
    character,
    derivedState.normalizedFeats,
    (entry) => {
      if (
        entry.feat !== FEATS.MAGE_SLAYER ||
        !entry.mageSlayer ||
        entry.mageSlayer.guardedMindExpended !== true
      ) {
        return entry;
      }

      return {
        ...entry,
        mageSlayer: {
          ...entry.mageSlayer,
          guardedMindExpended: undefined
        }
      };
    },
    false
  );
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

export function activateFeatActionForCharacter(character: Character, actionKey: string): Character {
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
