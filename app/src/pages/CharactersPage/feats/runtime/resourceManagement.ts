import { FEATS } from "../../../../codex/entries/enums";
import type { CounterResourceTarget, ResourceManagementTarget } from "../../resourceManagement";
import { hitDiceResource } from "../../resourceManagement";
import { getProficiencyBonus } from "../../proficiencyBonus";
import {
  boonOfFateImproveFateActionKey,
  boonOfFluidFormsShapechangerActionKey,
  boonOfRecoveryRecoverVitalityActionKey,
  cultOfDragonInitiateInspiredByFearActionKey,
  durableSpeedyRecoveryActionKey,
  fairyTricksterFlusteringStrikeActionKey,
  genieMagicWishMagicActionKey,
  lordlyResolveStandardBearerActionKey,
  luckyFeatActionKey,
  purpleDragonCommandantEncourageAllyActionKey
} from "./constants";
import { getBoonOfFluidFormsShapechangerStateForCharacter } from "./fluidForms";
import {
  getBoonOfFateImproveFateStateForCharacter,
  getBoonOfRecoveryRecoverVitalityStateForCharacter,
  getBoonOfRevelryIrresistibleDanceFreeCastStateForCharacter,
  getCultOfDragonInitiateInspiredByFearStateForCharacter,
  getEnclaveMagicTwoHeartsOneMindStateForCharacter,
  getFairyTricksterFlusteringStrikeStateForCharacter,
  getGenieMagicWishMagicStateForCharacter,
  getLordlyResolveStandardBearerStateForCharacter,
  getPurpleDragonCommandantEncourageAllyStateForCharacter
} from "./resources";
import {
  getFeyTouchedFreeCastStateForCharacter,
  getMagicInitiateFreeCastStateForCharacter,
  getRitualCasterQuickRitualStateForCharacter,
  getShadowTouchedFreeCastStateForCharacter,
  getTelepathicDetectThoughtsFreeCastStateForCharacter
} from "./spellcasting";
import { collectFeatDerivedState } from "./state";
import { inspiringMagicEffectId, inspiringMagicResource } from "./arcaneArtist";
import { powerSurgeEffectId, powerSurgeResource } from "./arcaneOverload";

import { featResource } from "./resources/counter";

export const cunningDiversionResource = featResource(
  FEATS.ARCANE_INFILTRATOR,
  "arcaneInfiltrator",
  "cunningDiversionUsesExpended",
  "Cunning Diversion",
  (character) => {
    const feat = collectFeatDerivedState(character).featsByFeat.get(FEATS.ARCANE_INFILTRATOR)?.[0];
    if (!feat) return null;

    const usesTotal = Math.max(0, Math.floor(getProficiencyBonus(character)));
    return {
      usesTotal,
      usesRemaining: Math.max(
        0,
        usesTotal - (feat.arcaneInfiltrator?.cunningDiversionUsesExpended ?? 0)
      )
    };
  },
  "number"
);

export const featActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  [luckyFeatActionKey]: [
    featResource(
      FEATS.LUCKY,
      "lucky",
      "pointsExpended",
      "Lucky Points",
      (character) => {
        const state = collectFeatDerivedState(character);
        return { usesTotal: state.luckyPointsTotal, usesRemaining: state.luckyPointsRemaining };
      },
      "number"
    )
  ],
  [boonOfFateImproveFateActionKey]: [
    featResource(
      FEATS.BOON_OF_FATE,
      "boonOfFate",
      "improveFateExpended",
      "Improve Fate",
      getBoonOfFateImproveFateStateForCharacter
    )
  ],
  [cultOfDragonInitiateInspiredByFearActionKey]: [
    featResource(
      FEATS.CULT_OF_THE_DRAGON_INITIATE,
      "cultOfDragonInitiate",
      "inspiredByFearExpended",
      "Inspired by Fear",
      getCultOfDragonInitiateInspiredByFearStateForCharacter
    )
  ],
  [boonOfRecoveryRecoverVitalityActionKey]: [
    featResource(
      FEATS.BOON_OF_RECOVERY,
      "boonOfRecovery",
      "recoverVitalityDiceExpended",
      "Recover Vitality",
      getBoonOfRecoveryRecoverVitalityStateForCharacter,
      "number"
    )
  ],
  [fairyTricksterFlusteringStrikeActionKey]: [
    featResource(
      FEATS.FAIRY_TRICKSTER,
      "fairyTrickster",
      "flusteringStrikeExpended",
      "Flustering Strike",
      getFairyTricksterFlusteringStrikeStateForCharacter,
      "number"
    )
  ],
  [genieMagicWishMagicActionKey]: [
    featResource(
      FEATS.GENIE_MAGIC,
      "genieMagic",
      "wishMagicExpended",
      "Wish Magic",
      getGenieMagicWishMagicStateForCharacter
    )
  ],
  [purpleDragonCommandantEncourageAllyActionKey]: [
    featResource(
      FEATS.PURPLE_DRAGON_COMMANDANT,
      "purpleDragonCommandant",
      "encourageAllyExpended",
      "Encourage Ally",
      getPurpleDragonCommandantEncourageAllyStateForCharacter,
      "number"
    )
  ],
  [durableSpeedyRecoveryActionKey]: [hitDiceResource],
  [boonOfFluidFormsShapechangerActionKey]: [
    featResource(
      FEATS.BOON_OF_FLUID_FORMS,
      "boonOfFluidForms",
      "shapechangerExpended",
      "Shapechanger",
      getBoonOfFluidFormsShapechangerStateForCharacter
    )
  ],
  [lordlyResolveStandardBearerActionKey]: [
    featResource(
      FEATS.LORDLY_RESOLVE,
      "lordlyResolve",
      "standardBearerExpended",
      "Standard Bearer",
      getLordlyResolveStandardBearerStateForCharacter
    )
  ]
};

export function getFeatSpellResource(
  optionId: string,
  spellId: string
): CounterResourceTarget | undefined {
  switch (optionId) {
    case inspiringMagicEffectId:
      return inspiringMagicResource;
    case powerSurgeEffectId:
      return powerSurgeResource;
    case "magic-initiate":
      return featResource(
        FEATS.MAGIC_INITIATE,
        "magicInitiate",
        "freeCastExpended",
        "Magic Initiate",
        (character) => getMagicInitiateFreeCastStateForCharacter(character, spellId),
        "boolean",
        spellId,
        (entry) => entry.magicInitiate?.levelOneSpellId === spellId
      );
    case "fey-magic":
      return featResource(
        FEATS.FEY_TOUCHED,
        "feyTouched",
        "freeCastExpendedSpellIds",
        "Fey Magic",
        (character) => getFeyTouchedFreeCastStateForCharacter(character, spellId),
        "spell",
        spellId,
        (entry) => spellId === "spell-misty-step" || entry.feyTouched?.spellId === spellId
      );
    case "shadow-magic":
      return featResource(
        FEATS.SHADOW_TOUCHED,
        "shadowTouched",
        "freeCastExpendedSpellIds",
        "Shadow Magic",
        (character) => getShadowTouchedFreeCastStateForCharacter(character, spellId),
        "spell",
        spellId,
        (entry) => spellId === "spell-invisibility" || entry.shadowTouched?.spellId === spellId
      );
    case "detect-thoughts":
      return featResource(
        FEATS.TELEPATHIC,
        "telepathic",
        "detectThoughtsExpended",
        "Detect Thoughts",
        (character) => getTelepathicDetectThoughtsFreeCastStateForCharacter(character, spellId)
      );
    case "quick-ritual":
      return featResource(
        FEATS.RITUAL_CASTER,
        "ritualCaster",
        "quickRitualExpended",
        "Quick Ritual",
        getRitualCasterQuickRitualStateForCharacter
      );
    case "boon-of-revelry":
      return featResource(
        FEATS.BOON_OF_REVELRY,
        "boonOfRevelry",
        "irresistibleDanceExpended",
        "Boon of Revelry",
        (character) =>
          getBoonOfRevelryIrresistibleDanceFreeCastStateForCharacter(character, spellId)
      );
    case "enclave-magic-two-hearts-one-mind":
      return featResource(
        FEATS.ENCLAVE_MAGIC,
        "enclaveMagic",
        "twoHeartsOneMindExpended",
        "Two Hearts, One Mind",
        getEnclaveMagicTwoHeartsOneMindStateForCharacter
      );
    default:
      return undefined;
  }
}
